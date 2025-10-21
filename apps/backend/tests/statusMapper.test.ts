import { mapRegistrationStatus } from '../src/services/statusMapper.js';

describe('mapRegistrationStatus', () => {
  it('maps known statuses to registration enum', () => {
    expect(mapRegistrationStatus('active')).toBe('registered');
    expect(mapRegistrationStatus('pending_organizer_approval')).toBe('pending');
    expect(mapRegistrationStatus('denied')).toBe('rejected');
    expect(mapRegistrationStatus('organizer_accepted_cancellation')).toBe('cancelled');
  });

  it('defaults to registered for unknown statuses', () => {
    expect(mapRegistrationStatus('some-new-status')).toBe('registered');
  });

  it('normalizes actice typo to active', () => {
    expect(mapRegistrationStatus('actice')).toBe('registered');
  });

  it('returns attended when check_in_at is provided', () => {
    expect(mapRegistrationStatus('pending_organizer_approval', { checkInAt: new Date().toISOString() })).toBe(
      'attended',
    );
  });
});
