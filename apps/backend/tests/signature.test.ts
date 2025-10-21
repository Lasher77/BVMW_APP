import { computeSignature, verifySignature, isTimestampFresh } from '../src/utils/signature.js';

describe('webhook signature', () => {
  it('validates the computed signature', () => {
    const secret = 'super-secret';
    const payload = Buffer.from(JSON.stringify({ hello: 'world' }));
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = computeSignature(secret, timestamp, payload);

    expect(verifySignature({ secret, timestamp, signature, payload })).toBe(true);
  });

  it('rejects invalid signatures', () => {
    const secret = 'super-secret';
    const payload = Buffer.from('test');
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = computeSignature(secret, timestamp, payload);
    const invalidSignature = signature
      .split('')
      .map((char, index) => (index === 0 ? (char === 'a' ? 'b' : 'a') : char))
      .join('');

    expect(
      verifySignature({
        secret,
        timestamp,
        signature: invalidSignature,
        payload,
      }),
    ).toBe(false);
  });

  it('rejects stale timestamps', () => {
    const secret = 'super-secret';
    const payload = Buffer.from('test');
    const staleTimestamp = (Math.floor(Date.now() / 1000) - 3600).toString();
    const signature = computeSignature(secret, staleTimestamp, payload);

    expect(
      verifySignature({
        secret,
        timestamp: staleTimestamp,
        signature,
        payload,
      }),
    ).toBe(false);

    expect(isTimestampFresh(staleTimestamp)).toBe(false);
  });
});
