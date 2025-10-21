import { DateTime } from 'luxon';
import { z } from 'zod';
import { Prisma, RegistrationStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { sanitizeHtml } from '../utils/sanitize.js';
import { mapRegistrationStatus } from './statusMapper.js';
import { WebhookProcessingError } from './webhookError.js';

const campaignWebhookSchema = z.object({
  event_type: z.literal('campaign.upsert'),
  version: z.number().int().min(1),
  campaign: z.object({
    id: z.string(),
    name: z.string(),
    title: z.string().nullable().optional(),
    subtitle: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    status: z.enum(['Planned', 'Confirmed', 'Completed', 'Cancelled']),
    public: z.boolean().default(false),
    start: z.string().refine((value) => DateTime.fromISO(value, { setZone: true }).isValid, {
      message: 'Invalid start date',
    }),
    end: z.string().refine((value) => DateTime.fromISO(value, { setZone: true }).isValid, {
      message: 'Invalid end date',
    }),
    is_online: z.boolean(),
    venue: z
      .object({
        name: z.string().nullable().optional(),
        street: z.string().nullable().optional(),
        postal_code: z.string().nullable().optional(),
        city: z.string().nullable().optional(),
        state: z.string().nullable().optional(),
        country: z.string().nullable().optional(),
        geo: z
          .object({
            lat: z.number().min(-90).max(90),
            lon: z.number().min(-180).max(180),
          })
          .nullable()
          .optional(),
      })
      .nullable()
      .optional(),
    region: z.string().nullable().optional(),
    doo_event_id: z.string().nullable().optional(),
    registration_url: z.string().url().nullable().optional(),
    header_image_url: z.string().url().nullable().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const attendeeWebhookSchema = z.object({
  event_type: z.literal('attendee.upsert'),
  version: z.number().int().min(1),
  campaign_id: z.string(),
  person: z.object({
    type: z.enum(['contact', 'lead']),
    id: z.string(),
  }),
  status: z.string(),
  check_in_at: z
    .string()
    .nullable()
    .optional()
    .refine(
      (value) =>
        value == null ||
        DateTime.fromISO(value, { setZone: true }).isValid,
      {
        message: 'Invalid check_in_at date',
      },
    ),
  doo: z
    .object({
      event_id: z.string().nullable().optional(),
      booking_id: z.string().nullable().optional(),
      attendee_id: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  updated_at: z.string().refine((value) => DateTime.fromISO(value, { setZone: true }).isValid, {
    message: 'Invalid updated_at date',
  }),
});

type WebhookSource = 'salesforce_campaign' | 'salesforce_attendee';

export async function recordWebhookEvent(params: {
  source: WebhookSource;
  idempotencyKey: string;
  payload: unknown;
}) {
  const { source, idempotencyKey, payload } = params;
  try {
    const created = await prisma.webhookEvent.create({
      data: {
        source,
        idempotencyKey,
        payload: payload as Prisma.InputJsonValue,
        status: 'accepted',
      },
    });
    return { shouldProcess: true, event: created };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const existing = await prisma.webhookEvent.findUnique({
        where: { idempotencyKey },
      });
      if (!existing) {
        throw error;
      }
      return { shouldProcess: false, event: existing };
    }
    throw error;
  }
}

export async function processCampaignUpsert(payload: unknown) {
  const parsed = campaignWebhookSchema.parse(payload);
  const { campaign } = parsed;
  const start = DateTime.fromISO(campaign.start, { setZone: true }).setZone('Europe/Berlin');
  const end = DateTime.fromISO(campaign.end, { setZone: true }).setZone('Europe/Berlin');
  if (!start.isValid || !end.isValid) {
    throw new Error('Invalid event times');
  }
  const sanitizedDescription = sanitizeHtml(campaign.description ?? null);
  const geo = campaign.venue?.geo ?? null;
  const preferredTitle = (campaign.title ?? '').trim() || campaign.name;
  const createData: Prisma.EventUncheckedCreateInput = {
    sfCampaignId: campaign.id,
    title: preferredTitle,
    subtitle: campaign.subtitle ?? null,
    description: sanitizedDescription,
    status: campaign.status,
    isPublic: campaign.public,
    isOnline: campaign.is_online,
    start: start.toJSDate(),
    end: end.toJSDate(),
    venueName: campaign.venue?.name ?? null,
    street: campaign.venue?.street ?? null,
    postalCode: campaign.venue?.postal_code ?? null,
    city: campaign.venue?.city ?? null,
    state: campaign.venue?.state ?? null,
    country: campaign.venue?.country ?? null,
    region: campaign.region ?? null,
    lat: geo?.lat ?? null,
    lon: geo?.lon ?? null,
    dooEventId: campaign.doo_event_id ?? null,
    registrationUrl: campaign.registration_url ?? null,
    headerImageUrl: campaign.header_image_url ?? null,
    tags: campaign.tags,
  };

  const event = await prisma.event.upsert({
    where: { sfCampaignId: campaign.id },
    update: {
      title: preferredTitle,
      subtitle: createData.subtitle,
      description: createData.description,
      status: createData.status,
      isPublic: createData.isPublic,
      isOnline: createData.isOnline,
      start: createData.start,
      end: createData.end,
      venueName: createData.venueName,
      street: createData.street,
      postalCode: createData.postalCode,
      city: createData.city,
      state: createData.state,
      country: createData.country,
      region: createData.region,
      lat: createData.lat,
      lon: createData.lon,
      dooEventId: createData.dooEventId,
      registrationUrl: createData.registrationUrl,
      headerImageUrl: createData.headerImageUrl,
      tags: { set: campaign.tags },
    },
    create: createData,
  });

  return event;
}

export async function processAttendeeUpsert(payload: unknown) {
  const parsed = attendeeWebhookSchema.parse(payload);
  const statusFromPayload = mapRegistrationStatus(parsed.status, {
    checkInAt: parsed.check_in_at ?? null,
  });
  const event = await prisma.event.findUnique({
    where: { sfCampaignId: parsed.campaign_id },
  });
  if (!event) {
    throw new WebhookProcessingError(404, { error: 'campaign_not_found' });
  }
  const member = await prisma.member.upsert({
    where: { id: parsed.person.id },
    update: {
      type: parsed.person.type,
    },
    create: {
      id: parsed.person.id,
      type: parsed.person.type,
    },
  });

  let status: RegistrationStatus = statusFromPayload;
  let checkInAt: Date | null = null;
  if (parsed.check_in_at) {
    const parsedDate = DateTime.fromISO(parsed.check_in_at, { setZone: true });
    if (parsedDate.isValid) {
      checkInAt = parsedDate.toJSDate();
      status = 'attended';
    }
  }

  const registration = await prisma.registration.upsert({
    where: {
      eventId_memberId: {
        eventId: event.id,
        memberId: member.id,
      },
    },
    update: {
      status,
      checkInAt,
      dooEventId: parsed.doo?.event_id ?? null,
      dooAttendeeId: parsed.doo?.attendee_id ?? null,
      dooBookingId: parsed.doo?.booking_id ?? null,
      sources: parsed as unknown as Prisma.InputJsonValue,
    },
    create: {
      eventId: event.id,
      memberId: member.id,
      status,
      checkInAt,
      dooEventId: parsed.doo?.event_id ?? null,
      dooAttendeeId: parsed.doo?.attendee_id ?? null,
      dooBookingId: parsed.doo?.booking_id ?? null,
      sources: parsed as unknown as Prisma.InputJsonValue,
    },
    include: {
      event: true,
    },
  });

  return registration;
}

export async function markWebhookProcessed(id: string) {
  await prisma.webhookEvent.update({
    where: { id },
    data: {
      status: 'processed',
      processedAt: new Date(),
    },
  });
}

export async function markWebhookFailed(id: string, error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  logger.error({ error: message }, 'Webhook processing failed');
  await prisma.webhookEvent.update({
    where: { id },
    data: {
      status: 'failed',
      error: message,
    },
  });
}
