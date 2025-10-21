import { mapRegistrationStatus } from '../src/services/statusMapper.js';

describe('mapRegistrationStatus', () => {
  it('maps known statuses to registration enum', () => {
    expect(mapRegistrationStatus('active')).toBe('registered');
    expect(mapRegistrationStatus('actice')).toBe('registered');
    expect(mapRegistrationStatus('pending_organizer_approval')).toBe('pending');
    expect(mapRegistrationStatus('denied')).toBe('rejected');
    expect(mapRegistrationStatus('organizer_accepted_cancellation')).toBe('cancelled');
  });

  it('defaults to registered for unknown statuses', () => {
    expect(mapRegistrationStatus('some-new-status')).toBe('registered');
  });
});
