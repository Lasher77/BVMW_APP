import crypto from 'node:crypto';

const FIVE_MINUTES = 5 * 60;

export function computeSignature(secret: string, timestamp: string, payload: Buffer | string) {
  const bodyBuffer = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
  const baseString = `${timestamp}.${bodyBuffer.toString('utf8')}`;
  return crypto.createHmac('sha256', secret).update(baseString).digest('hex');
}

export function isTimestampFresh(timestamp: string, toleranceSeconds = FIVE_MINUTES) {
  const ts = Number.parseInt(timestamp, 10);
  if (Number.isNaN(ts)) {
    return false;
  }
  const now = Math.floor(Date.now() / 1000);
  return Math.abs(now - ts) <= toleranceSeconds;
}

export function verifySignature(params: {
  secret: string;
  timestamp: string;
  signature: string;
  payload: Buffer;
  toleranceSeconds?: number;
}) {
  const { secret, timestamp, signature, payload, toleranceSeconds } = params;
  if (!isTimestampFresh(timestamp, toleranceSeconds)) {
    return false;
  }
  const expected = computeSignature(secret, timestamp, payload);
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}
