import request from 'supertest';
import { ZodError, type ZodIssue } from 'zod';
import type { Application } from 'express';
import { computeSignature } from '../src/utils/signature.js';

let app: Application;
let webhookService: typeof import('../src/services/webhookService.js');

beforeAll(async () => {
  jest.resetModules();
  const mockModule = (jest as unknown as {
    unstable_mockModule: (moduleName: string, factory: () => unknown) => Promise<void>;
  }).unstable_mockModule;
  await mockModule('../src/utils/sanitize.js', () => ({
    sanitizeHtml: (value: unknown) => value,
  }));
  webhookService = await import('../src/services/webhookService.js');
  const appModule = await import('../src/app.js');
  app = appModule.createApp();
});

describe('Salesforce webhooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns 401 for invalid signatures', async () => {
    const recordSpy = jest
      .spyOn(webhookService, 'recordWebhookEvent')
      .mockResolvedValue({ shouldProcess: true, event: { id: 'evt-ignored' } as any });
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const response = await request(app)
      .post('/webhooks/salesforce/campaign')
      .set('Idempotency-Key', 'test-duplicate')
      .set('X-Timestamp', timestamp)
      .set('X-Signature', 'invalid-signature')
      .send({});

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'invalid_signature' });
    expect(recordSpy).not.toHaveBeenCalled();
  });

  it('returns 422 when payload validation fails', async () => {
    const recordSpy = jest
      .spyOn(webhookService, 'recordWebhookEvent')
      .mockResolvedValue({ shouldProcess: true, event: { id: 'evt-1' } as any });
    const markFailedSpy = jest
      .spyOn(webhookService, 'markWebhookFailed')
      .mockResolvedValue();
    jest.spyOn(webhookService, 'markWebhookProcessed').mockResolvedValue();

    const issue: ZodIssue = {
      code: 'invalid_type',
      expected: 'number',
      received: 'string',
      path: ['campaign', 'venue', 'geo', 'lat'],
      message: 'Expected number, received string',
    };
    const zodError = new ZodError([issue]);

    jest.spyOn(webhookService, 'processCampaignUpsert').mockImplementation(async () => {
      throw zodError;
    });

    const payload = { event_type: 'campaign.upsert', version: 1, campaign: {} };
    const rawPayload = JSON.stringify(payload);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = computeSignature(
      process.env.WEBHOOK_SHARED_SECRET ?? 'test-secret',
      timestamp,
      Buffer.from(rawPayload),
    );

    const response = await request(app)
      .post('/webhooks/salesforce/campaign')
      .set('Content-Type', 'application/json')
      .set('Idempotency-Key', 'evt-1')
      .set('X-Timestamp', timestamp)
      .set('X-Signature', signature)
      .send(payload);

    expect(recordSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: 'invalid_payload',
      details: [
        {
          path: 'campaign.venue.geo.lat',
          message: 'Expected number, received string',
        },
      ],
    });
    expect(markFailedSpy).toHaveBeenCalledWith('evt-1', zodError);
  });
});
