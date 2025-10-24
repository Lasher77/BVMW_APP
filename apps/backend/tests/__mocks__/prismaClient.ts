export class PrismaClientKnownRequestError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

export const Prisma = {
  PrismaClientKnownRequestError,
} as const;

export namespace Prisma {
  export type InputJsonValue = unknown;
  export type EventUncheckedCreateInput = Record<string, unknown>;
}

export const RegistrationStatus = {
  registered: 'registered',
  pending: 'pending',
  rejected: 'rejected',
  cancelled: 'cancelled',
  attended: 'attended',
} as const;

export type RegistrationStatus = (typeof RegistrationStatus)[keyof typeof RegistrationStatus];

export class PrismaClient {
  event = {
    create: jest.fn(),
    upsert: jest.fn(),
    findUnique: jest.fn(),
  };

  member = {
    upsert: jest.fn(),
  };

  registration = {
    upsert: jest.fn(),
  };

  webhookEvent = {
    create: jest.fn(),
    findUnique: jest.fn(),
  };

  webhookPayload = {
    create: jest.fn(),
  };
}

export default PrismaClient;
