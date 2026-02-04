import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import type { DeviceType } from '@prisma/client';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
}

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
}

export async function registerDeviceToken(
  memberId: string,
  token: string,
  deviceType: DeviceType
): Promise<{ id: string }> {
  const device = await prisma.deviceToken.upsert({
    where: { token },
    update: {
      memberId,
      deviceType,
      isActive: true,
      lastUsedAt: new Date(),
    },
    create: {
      memberId,
      token,
      deviceType,
      isActive: true,
    },
  });

  logger.info({ memberId, deviceType }, 'Device token registered');
  return { id: device.id };
}

export async function unregisterDeviceToken(token: string): Promise<void> {
  await prisma.deviceToken.updateMany({
    where: { token },
    data: { isActive: false },
  });
  logger.info({ token: token.slice(0, 20) + '...' }, 'Device token unregistered');
}

export async function getActiveDeviceTokens(memberId: string): Promise<string[]> {
  const devices = await prisma.deviceToken.findMany({
    where: { memberId, isActive: true },
    select: { token: true },
  });
  return devices.map((d) => d.token);
}

export async function sendPushNotification(
  memberId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<{ notificationId: string; sent: number; failed: number }> {
  const tokens = await getActiveDeviceTokens(memberId);

  if (tokens.length === 0) {
    logger.warn({ memberId }, 'No active device tokens for member');
    const notification = await prisma.pushNotification.create({
      data: {
        memberId,
        title,
        body,
        data: data ?? null,
        status: 'failed',
        error: 'No active device tokens',
      },
    });
    return { notificationId: notification.id, sent: 0, failed: 0 };
  }

  const notification = await prisma.pushNotification.create({
    data: {
      memberId,
      title,
      body,
      data: data ?? null,
      status: 'pending',
    },
  });

  const messages: ExpoPushMessage[] = tokens.map((token) => ({
    to: token,
    title,
    body,
    data,
    sound: 'default',
    priority: 'high',
  }));

  let sent = 0;
  let failed = 0;

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      throw new Error(`Expo Push API error: ${response.status}`);
    }

    const result = (await response.json()) as { data: ExpoPushTicket[] };

    for (let i = 0; i < result.data.length; i++) {
      const ticket = result.data[i];
      if (ticket.status === 'ok') {
        sent++;
        await prisma.deviceToken.update({
          where: { token: tokens[i] },
          data: { lastUsedAt: new Date() },
        });
      } else {
        failed++;
        logger.error({ ticket, token: tokens[i].slice(0, 20) }, 'Push notification failed');

        // Deactivate invalid tokens
        if (ticket.details?.error === 'DeviceNotRegistered') {
          await prisma.deviceToken.update({
            where: { token: tokens[i] },
            data: { isActive: false },
          });
        }
      }
    }

    await prisma.pushNotification.update({
      where: { id: notification.id },
      data: {
        status: failed === tokens.length ? 'failed' : 'sent',
        sentAt: new Date(),
        error: failed > 0 ? `${failed}/${tokens.length} deliveries failed` : null,
      },
    });

    logger.info({ memberId, sent, failed, total: tokens.length }, 'Push notification sent');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await prisma.pushNotification.update({
      where: { id: notification.id },
      data: {
        status: 'failed',
        error: errorMessage,
      },
    });
    logger.error({ error: errorMessage, memberId }, 'Failed to send push notification');
    throw error;
  }

  return { notificationId: notification.id, sent, failed };
}

export async function sendBroadcastNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
  memberIds?: string[]
): Promise<{ total: number; sent: number; failed: number }> {
  const whereClause = memberIds
    ? { memberId: { in: memberIds }, isActive: true }
    : { isActive: true };

  const devices = await prisma.deviceToken.findMany({
    where: whereClause,
    select: { token: true, memberId: true },
  });

  if (devices.length === 0) {
    logger.warn('No active devices for broadcast');
    return { total: 0, sent: 0, failed: 0 };
  }

  const messages: ExpoPushMessage[] = devices.map((d) => ({
    to: d.token,
    title,
    body,
    data,
    sound: 'default',
    priority: 'high',
  }));

  // Expo allows max 100 messages per request
  const chunks: ExpoPushMessage[][] = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }

  let totalSent = 0;
  let totalFailed = 0;

  for (const chunk of chunks) {
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(chunk),
      });

      if (!response.ok) {
        totalFailed += chunk.length;
        continue;
      }

      const result = (await response.json()) as { data: ExpoPushTicket[] };
      for (const ticket of result.data) {
        if (ticket.status === 'ok') {
          totalSent++;
        } else {
          totalFailed++;
        }
      }
    } catch {
      totalFailed += chunk.length;
    }
  }

  logger.info({ total: devices.length, sent: totalSent, failed: totalFailed }, 'Broadcast sent');
  return { total: devices.length, sent: totalSent, failed: totalFailed };
}
