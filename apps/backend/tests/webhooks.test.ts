import request from 'supertest';
import { ZodError, type ZodIssue } from 'zod';
import type { Application } from 'express';
import { computeSignature } from '../src/utils/signature.js';

type WebhookServiceModule = typeof import('../src/services/webhookService.js');

async function setupTestContext(options: { authMode: 'bearer' | 'hmac'; bearerTokens?: string }) {
  jest.resetModules();
  const mockModule = (jest as unknown as {
    unstable_mockModule: (moduleName: string, factory: () => unknown) => Promise<void>;
  }).unstable_mockModule;
  await mockModule('../src/utils/sanitize.js', () => ({
    sanitizeHtml: (value: unknown) => value,
  }));

  process.env.WEBHOOK_AUTH_MODE = options.authMode;
  if (options.bearerTokens !== undefined) {
    process.env.WEBHOOK_BEARER_TOKENS = options.bearerTokens;
  } else {
    delete process.env.WEBHOOK_BEARER_TOKENS;
  }

  const webhookService = (await import('../src/services/webhookService.js')) as WebhookServiceModule;
  const appModule = await import('../src/app.js');
  const app = appModule.createApp();

  return { app, webhookService };
}

describe('Salesforce webhooks with bearer auth', () => {
  let app: Application;
  let webhookService: WebhookServiceModule;

  beforeEach(async () => {
    ({ app, webhookService } = await setupTestContext({
      authMode: 'bearer',
      bearerTokens: 'sf:test-token',
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns 401 when Authorization header is missing', async () => {
    const recordSpy = jest
      .spyOn(webhookService, 'recordWebhookEvent')
      .mockResolvedValue({ shouldProcess: true, event: { id: 'evt-ignored' } as any });

    const response = await request(app)
      .post('/webhooks/salesforce/campaign')
      .set('Idempotency-Key', 'bearer-missing-auth')
      .send({});

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'missing_authorization_header' });
    expect(recordSpy).not.toHaveBeenCalled();
  });

  it('returns 401 when bearer token is invalid', async () => {
    const recordSpy = jest
      .spyOn(webhookService, 'recordWebhookEvent')
      .mockResolvedValue({ shouldProcess: true, event: { id: 'evt-ignored' } as any });

    const response = await request(app)
      .post('/webhooks/salesforce/campaign')
      .set('Authorization', 'Bearer wrong-token')
      .set('Idempotency-Key', 'bearer-invalid-token')
      .send({});

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'invalid_token' });
    expect(recordSpy).not.toHaveBeenCalled();
  });

  it('returns 401 when authorization scheme is not Bearer', async () => {
    const recordSpy = jest
      .spyOn(webhookService, 'recordWebhookEvent')
      .mockResolvedValue({ shouldProcess: true, event: { id: 'evt-ignored' } as any });

    const response = await request(app)
      .post('/webhooks/salesforce/campaign')
      .set('Authorization', 'Token test-token')
      .set('Idempotency-Key', 'bearer-invalid-scheme')
      .send({});

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'invalid_authorization_scheme' });
    expect(recordSpy).not.toHaveBeenCalled();
  });

  it('returns 422 when payload validation fails with a valid token', async () => {
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

    const response = await request(app)
      .post('/webhooks/salesforce/campaign')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer test-token')
      .set('Idempotency-Key', 'evt-1')
      .send(payload);

    expect(recordSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: 'invalid_payload',
      details: ['campaign.venue.geo.lat: Expected number, received string'],
    });
    expect(markFailedSpy).toHaveBeenCalledWith('evt-1', zodError);
  });

  it('acknowledges duplicate webhook deliveries without reprocessing', async () => {
    const recordSpy = jest
      .spyOn(webhookService, 'recordWebhookEvent')
      .mockResolvedValue({ shouldProcess: false, event: { id: 'evt-existing' } as any });
    const processorSpy = jest
      .spyOn(webhookService, 'processCampaignUpsert')
      .mockResolvedValue({} as any);
    const processedSpy = jest
      .spyOn(webhookService, 'markWebhookProcessed')
      .mockResolvedValue();
    const failedSpy = jest
      .spyOn(webhookService, 'markWebhookFailed')
      .mockResolvedValue();

    const payload = { event_type: 'campaign.upsert', version: 1, campaign: {} };

    const response = await request(app)
      .post('/webhooks/salesforce/campaign')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer test-token')
      .set('Idempotency-Key', 'evt-duplicate')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true, duplicate: true, processed: false });
    expect(recordSpy).toHaveBeenCalledTimes(1);
    expect(processorSpy).not.toHaveBeenCalled();
    expect(processedSpy).not.toHaveBeenCalled();
    expect(failedSpy).not.toHaveBeenCalled();
  });
});

describe('Salesforce webhooks with HMAC auth', () => {
  let app: Application;
  let webhookService: WebhookServiceModule;

  beforeEach(async () => {
    ({ app, webhookService } = await setupTestContext({ authMode: 'hmac' }));
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
      .set('Idempotency-Key', 'hmac-invalid-signature')
      .set('X-Timestamp', timestamp)
      .set('X-Signature', 'invalid-signature')
      .send({});

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'invalid_signature' });
    expect(recordSpy).not.toHaveBeenCalled();
  });

  it('processes requests with a valid signature', async () => {
    const recordSpy = jest
      .spyOn(webhookService, 'recordWebhookEvent')
      .mockResolvedValue({ shouldProcess: true, event: { id: 'evt-2' } as any });
    const processedSpy = jest
      .spyOn(webhookService, 'markWebhookProcessed')
      .mockResolvedValue();
    const processorSpy = jest
      .spyOn(webhookService, 'processCampaignUpsert')
      .mockResolvedValue({} as any);

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
      .set('Idempotency-Key', 'evt-2')
      .set('X-Timestamp', timestamp)
      .set('X-Signature', signature)
      .send(payload);

    expect(recordSpy).toHaveBeenCalledTimes(1);
    expect(processorSpy).toHaveBeenCalledTimes(1);
    expect(processedSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true, processed: true });
  });
});

describe('Auth mode switching', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('enforces the configured authentication mode', async () => {
    const bearerContext = await setupTestContext({ authMode: 'bearer', bearerTokens: 'sf:test-token' });
    const bearerRecordSpy = jest
      .spyOn(bearerContext.webhookService, 'recordWebhookEvent')
      .mockResolvedValue({ shouldProcess: true, event: { id: 'evt-toggle' } as any });

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = computeSignature(
      process.env.WEBHOOK_SHARED_SECRET ?? 'test-secret',
      timestamp,
      Buffer.from('{}'),
    );

    const bearerResponse = await request(bearerContext.app)
      .post('/webhooks/salesforce/campaign')
      .set('Idempotency-Key', 'toggle-bearer')
      .set('X-Timestamp', timestamp)
      .set('X-Signature', signature)
      .send({});

    expect(bearerResponse.status).toBe(401);
    expect(bearerResponse.body).toEqual({ error: 'missing_authorization_header' });
    expect(bearerRecordSpy).not.toHaveBeenCalled();

    jest.restoreAllMocks();

    const hmacContext = await setupTestContext({ authMode: 'hmac' });
    const hmacRecordSpy = jest
      .spyOn(hmacContext.webhookService, 'recordWebhookEvent')
      .mockResolvedValue({ shouldProcess: true, event: { id: 'evt-toggle-hmac' } as any });

    const hmacResponse = await request(hmacContext.app)
      .post('/webhooks/salesforce/campaign')
      .set('Authorization', 'Bearer test-token')
      .set('Idempotency-Key', 'toggle-hmac')
      .send({});

    expect(hmacResponse.status).toBe(401);
    expect(hmacResponse.body).toEqual({ error: 'invalid_signature' });
    expect(hmacRecordSpy).not.toHaveBeenCalled();
  });
});
