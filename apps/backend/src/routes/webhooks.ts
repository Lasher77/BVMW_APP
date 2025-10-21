import { Router } from 'express';
import { ZodError } from 'zod';
import { webhookAuth } from '../middleware/webhookAuth.js';
import {
  markWebhookFailed,
  markWebhookProcessed,
  processAttendeeUpsert,
  processCampaignUpsert,
  recordWebhookEvent,
} from '../services/webhookService.js';
import { WebhookProcessingError } from '../services/webhookError.js';

export const webhookRouter = Router();

async function runWebhook(
  req: Parameters<import('express').RequestHandler>[0],
  res: Parameters<import('express').RequestHandler>[1],
  next: Parameters<import('express').RequestHandler>[2],
  processor: (payload: unknown) => Promise<unknown>,
  source: 'salesforce_campaign' | 'salesforce_attendee',
) {
  const idempotencyKey = req.header('idempotency-key');
  if (!idempotencyKey) {
    return res.status(400).json({ ok: false, error: 'missing_idempotency_key' });
  }

  let storedEventId: string | null = null;

  try {
    const recorded = await recordWebhookEvent({
      source,
      idempotencyKey,
      payload: req.body,
    });
    if (!recorded.shouldProcess) {
      return res.status(200).json({ ok: true, duplicate: true, processed: false });
    }

    storedEventId = recorded.event.id;

    await processor(req.body);
    await markWebhookProcessed(recorded.event.id);
    return res.status(202).json({ ok: true, processed: true });
  } catch (error) {
    if (storedEventId) {
      try {
        await markWebhookFailed(storedEventId, error);
      } catch (markError) {
        next(markError);
        return;
      }
    }
    if (error instanceof WebhookProcessingError) {
      return res.status(error.status).json(error.body);
    }
    if (error instanceof ZodError || (error && typeof error === 'object' && (error as { name?: string }).name === 'ZodError')) {
      const zodError = error instanceof ZodError ? error : (error as ZodError);
      const details = zodError.issues.map((issue) => {
        const path = issue.path.join('.') || 'root';
        return `${path}: ${issue.message}`;
      });
      return res.status(422).json({
        error: 'invalid_payload',
        details,
      });
    }
    return next(error);
  }
}

webhookRouter.post('/salesforce/campaign', webhookAuth, (req, res, next) =>
  runWebhook(req, res, next, processCampaignUpsert, 'salesforce_campaign'),
);

webhookRouter.post('/salesforce/attendee', webhookAuth, (req, res, next) =>
  runWebhook(req, res, next, processAttendeeUpsert, 'salesforce_attendee'),
);
