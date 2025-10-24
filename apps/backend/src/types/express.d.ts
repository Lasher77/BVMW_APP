import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    rawBody?: Buffer;
    webhookAuthSource?: string | null;
  }
}
