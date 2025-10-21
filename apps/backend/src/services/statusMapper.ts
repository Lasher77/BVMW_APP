import type { RegistrationStatus } from '@prisma/client';

const registrationStatusMap: Record<string, RegistrationStatus> = {
  active: 'registered',
  pending_organizer_approval: 'pending',
  denied: 'rejected',
  organizer_accepted_cancellation: 'cancelled',
};

const statusNormalizations: Record<string, string> = {
  actice: 'active',
};

export function mapRegistrationStatus(input: string, options?: { checkInAt?: string | null }): RegistrationStatus {
  if (options?.checkInAt) {
    return 'attended';
  }
  const lower = input.toLowerCase();
  const normalizedKey = statusNormalizations[lower] ?? lower;
  const normalized = registrationStatusMap[normalizedKey];
  return normalized ?? 'registered';
}
