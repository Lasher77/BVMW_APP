import type { RegistrationStatus } from '@prisma/client';

const registrationStatusMap: Record<string, RegistrationStatus> = {
  active: 'registered',
  actice: 'registered',
  pending_organizer_approval: 'pending',
  denied: 'rejected',
  organizer_accepted_cancellation: 'cancelled',
};

export function mapRegistrationStatus(input: string): RegistrationStatus {
  const normalized = registrationStatusMap[input.toLowerCase()];
  return normalized ?? 'registered';
}
