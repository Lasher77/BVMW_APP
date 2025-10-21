import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { apiRouter } from './routes/api.js';
import { webhookRouter } from './routes/webhooks.js';
import { logger } from './lib/logger.js';

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(
    express.json({
      limit: '1mb',
      verify: (req, _res, buf) => {
        if (!req.originalUrl.startsWith('/webhooks')) {
          return;
        }
        req.rawBody = Buffer.from(buf);
      },
    }),
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    }),
  );

  app.get('/healthz', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/webhooks', limiter, webhookRouter);
  app.use('/api', apiRouter);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({ ok: false, error: 'internal_error' });
  });

  return app;
}
