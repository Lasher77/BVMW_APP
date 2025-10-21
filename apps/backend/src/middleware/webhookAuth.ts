import type { RequestHandler } from 'express';
import { env } from '../env.js';
import { verifySignature } from '../utils/signature.js';

export const webhookAuth: RequestHandler = (req, res, next) => {
  const request = req as unknown as Request & { rawBody?: Buffer };
  const signature = req.header('x-signature');
  const timestamp = req.header('x-timestamp');
  if (!signature || !timestamp) {
    return res.status(401).json({ error: 'invalid_signature' });
  }
  if (!request.rawBody) {
    return res.status(400).json({ error: 'missing_raw_body' });
  }
  const valid = verifySignature({
    secret: env.WEBHOOK_SHARED_SECRET,
    signature,
    timestamp,
    payload: request.rawBody,
  });
  if (!valid) {
    return res.status(401).json({ error: 'invalid_signature' });
  }
  return next();
};
