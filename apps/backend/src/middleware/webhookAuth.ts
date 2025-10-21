import type { RequestHandler } from 'express';
import { env } from '../env.js';
import { verifySignature } from '../utils/signature.js';

export const webhookAuth: RequestHandler = (req, res, next) => {
  const signature = req.header('x-signature');
  const timestamp = req.header('x-timestamp');
  if (!signature || !timestamp) {
    return res.status(401).json({ ok: false, error: 'missing_signature' });
  }
  if (!req.rawBody) {
    return res.status(400).json({ ok: false, error: 'missing_raw_body' });
  }
  const valid = verifySignature({
    secret: env.WEBHOOK_SHARED_SECRET,
    signature,
    timestamp,
    payload: req.rawBody,
  });
  if (!valid) {
    return res.status(401).json({ ok: false, error: 'invalid_signature' });
  }
  return next();
};
