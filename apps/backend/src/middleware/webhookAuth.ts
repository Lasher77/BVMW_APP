import type { RequestHandler } from 'express';
import { env } from '../env.js';
import { verifySignature } from '../utils/signature.js';
import { logger } from '../lib/logger.js';

type BearerTokenEntry = (typeof env.WEBHOOK_BEARER_TOKENS)[number];

const bearerTokenMap = new Map<string, BearerTokenEntry>(
  env.WEBHOOK_BEARER_TOKENS.map((entry) => [entry.token, entry]),
);

const BEARER_PREFIX = /^\s*(\S+)\s+(.+)$/;

export const webhookAuth: RequestHandler = (req, res, next) => {
  const idempotencyKey = req.header('idempotency-key') ?? null;
  const route = req.originalUrl;

  const logAuthSuccess = (mode: 'bearer' | 'hmac', source: string | null) => {
    res.on('finish', () => {
      logger.info(
        {
          event: 'webhook_auth_success',
          mode,
          route,
          source,
          idempotencyKey,
          statusCode: res.statusCode,
        },
        'Webhook authentication succeeded',
      );
    });
  };

  const logAuthFailure = (reason: string) => {
    logger.warn(
      {
        event: 'webhook_auth_failure',
        mode: env.WEBHOOK_AUTH_MODE,
        route,
        reason,
        idempotencyKey,
      },
      'Webhook authentication failed',
    );
  };

  const setAuthSource = (source: string | null) => {
    (req as typeof req & { webhookAuthSource?: string | null }).webhookAuthSource = source;
  };

  if (env.WEBHOOK_AUTH_MODE === 'bearer') {
    if (bearerTokenMap.size === 0) {
      logAuthFailure('bearer_tokens_not_configured');
      return res.status(401).json({ error: 'invalid_token' });
    }

    const authorization = req.header('authorization');
    if (!authorization) {
      logAuthFailure('missing_authorization_header');
      return res.status(401).json({ error: 'missing_authorization_header' });
    }

    const match = authorization.match(BEARER_PREFIX);
    if (!match) {
      logAuthFailure('invalid_authorization_header');
      return res.status(401).json({ error: 'invalid_authorization_header' });
    }

    const [, scheme, tokenCandidate] = match;
    if (scheme.toLowerCase() !== 'bearer') {
      logAuthFailure('invalid_authorization_scheme');
      return res.status(401).json({ error: 'invalid_authorization_scheme' });
    }

    const token = tokenCandidate.trim();
    if (!token) {
      logAuthFailure('missing_token');
      return res.status(401).json({ error: 'missing_token' });
    }

    const entry = bearerTokenMap.get(token);
    if (!entry) {
      logAuthFailure('invalid_token');
      return res.status(401).json({ error: 'invalid_token' });
    }

    setAuthSource(entry.source ?? null);
    logAuthSuccess('bearer', entry.source ?? null);
    return next();
  }

  const request = req as typeof req & { rawBody?: Buffer };
  const signature = req.header('x-signature');
  const timestamp = req.header('x-timestamp');

  if (!signature || !timestamp) {
    logAuthFailure('missing_signature_headers');
    return res.status(401).json({ error: 'invalid_signature' });
  }

  if (!request.rawBody) {
    logAuthFailure('missing_raw_body');
    return res.status(400).json({ error: 'missing_raw_body' });
  }

  const valid = verifySignature({
    secret: env.WEBHOOK_SHARED_SECRET,
    signature,
    timestamp,
    payload: request.rawBody,
  });

  if (!valid) {
    logAuthFailure('invalid_signature');
    return res.status(401).json({ error: 'invalid_signature' });
  }

  setAuthSource('hmac');
  logAuthSuccess('hmac', 'hmac');
  return next();
};
