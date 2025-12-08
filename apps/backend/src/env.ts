import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3005),
    DATABASE_URL: z
      .string()
      .transform((value) => value.trim())
      .superRefine((value, ctx) => {
        if (!value) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'DATABASE_URL is required.',
          });
          return;
        }

        if (value.startsWith('file:')) {
          return;
        }

        try {
          // Accept any absolute URL (e.g. postgresql://, mysql://, prisma://...)
          new URL(value);
        } catch (error) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              'Invalid DATABASE_URL. Provide a full connection string (e.g. postgresql://user:pass@host:5432/db) or a Prisma file: path.',
          });
        }
      }),
    WEBHOOK_SHARED_SECRET: z.string().min(8),
    WEBHOOK_AUTH_MODE: z.enum(['bearer', 'hmac']).default('bearer'),
    WEBHOOK_BEARER_TOKENS: z
      .string()
      .default('')
      .transform((value, ctx) => {
        const trimmed = value.trim();
        if (!trimmed) {
          return [] as { token: string; source: string | null }[];
        }
        const entries: { token: string; source: string | null }[] = [];
        for (const part of trimmed.split(',')) {
          const tokenWithLabel = part.trim();
          if (!tokenWithLabel) {
            continue;
          }
          const separatorIndex = tokenWithLabel.indexOf(':');
          let token = tokenWithLabel;
          let source: string | null = null;
          if (separatorIndex !== -1) {
            source = tokenWithLabel.slice(0, separatorIndex).trim() || null;
            token = tokenWithLabel.slice(separatorIndex + 1).trim();
          }
          if (!token) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Invalid bearer token entry "${tokenWithLabel}"`,
            });
            return z.NEVER;
          }
          entries.push({ token, source });
        }
        return entries;
      }),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default(
      'info',
    ),
  })
  .superRefine((data, ctx) => {
    if (data.WEBHOOK_AUTH_MODE === 'bearer' && data.WEBHOOK_BEARER_TOKENS.length === 0) {
      ctx.addIssue({
        path: ['WEBHOOK_BEARER_TOKENS'],
        code: z.ZodIssueCode.custom,
        message: 'At least one bearer token must be configured in bearer auth mode.',
      });
    }
    const seen = new Set<string>();
    for (const entry of data.WEBHOOK_BEARER_TOKENS) {
      if (seen.has(entry.token)) {
        ctx.addIssue({
          path: ['WEBHOOK_BEARER_TOKENS'],
          code: z.ZodIssueCode.custom,
          message: 'Duplicate bearer tokens are not allowed.',
        });
        break;
      }
      seen.add(entry.token);
    }
  });

export const env = envSchema.parse(process.env);
