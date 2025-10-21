export class WebhookProcessingError extends Error {
  status: number;
  body: Record<string, unknown>;

  constructor(status: number, body: Record<string, unknown>) {
    super(typeof body.error === 'string' ? (body.error as string) : 'webhook_error');
    this.status = status;
    this.body = body;
  }
}
