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

  let storedEvent: Awaited<ReturnType<typeof recordWebhookEvent>>['event'] | null = null;

  try {
    const recorded = await recordWebhookEvent({
      source,
      idempotencyKey,
      payload: req.body,
    });
    storedEvent = recorded.event;

    if (!recorded.shouldProcess) {
      return res.status(200).json({ ok: true, processed: false });
    }

    await processor(req.body);
    await markWebhookProcessed(recorded.event.id);
    return res.status(202).json({ ok: true, processed: true });
  } catch (error) {
    if (storedEvent) {
      try {
        await markWebhookFailed(storedEvent.id, error);
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
      return res.status(422).json({
        error: 'invalid_payload',
        details: zodError.issues.map((issue) => ({
          path: issue.path.join('.') || 'root',
          message: issue.message,
        })),
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
