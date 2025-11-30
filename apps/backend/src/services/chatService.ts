import { prisma } from '../lib/prisma.js';

export class ChatError extends Error {
  status: number;
  code: string;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function assertEventExists(eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    throw new ChatError('event_not_found', 'Event does not exist', 404);
  }
}

async function assertMemberRegistered(eventId: string, memberId: string) {
  const registration = await prisma.registration.findUnique({
    where: {
      eventId_memberId: { eventId, memberId },
    },
  });
  if (!registration) {
    throw new ChatError('member_not_registered', 'Member is not registered for this event', 403);
  }
}

export async function listEventAttendees(eventId: string) {
  await assertEventExists(eventId);
  const registrations = await prisma.registration.findMany({
    where: {
      eventId,
      status: {
        in: ['registered', 'attended', 'pending'],
      },
    },
    include: {
      member: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return registrations.map((registration) => ({
    member: {
      id: registration.member.id,
      name: registration.member.name,
      company: registration.member.company,
      type: registration.member.type,
    },
    status: registration.status,
  }));
}

export async function listEventMessages(eventId: string, memberA: string, memberB: string) {
  await assertEventExists(eventId);
  await assertMemberRegistered(eventId, memberA);
  await assertMemberRegistered(eventId, memberB);

  const messages = await prisma.chatMessage.findMany({
    where: {
      eventId,
      OR: [
        { senderId: memberA, recipientId: memberB },
        { senderId: memberB, recipientId: memberA },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });

  return messages.map((message) => ({
    id: message.id,
    senderId: message.senderId,
    recipientId: message.recipientId,
    content: message.content,
    createdAt: message.createdAt,
  }));
}

export async function sendEventMessage(params: {
  eventId: string;
  senderId: string;
  recipientId: string;
  content: string;
}) {
  const { eventId, senderId, recipientId } = params;
  const content = params.content.trim();
  if (!content) {
    throw new ChatError('message_empty', 'Message content cannot be empty');
  }

  await assertEventExists(eventId);
  await assertMemberRegistered(eventId, senderId);
  await assertMemberRegistered(eventId, recipientId);

  const message = await prisma.chatMessage.create({
    data: {
      eventId,
      senderId,
      recipientId,
      content,
    },
  });

  return {
    id: message.id,
    senderId: message.senderId,
    recipientId: message.recipientId,
    content: message.content,
    createdAt: message.createdAt,
  };
}
