process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://localhost:5432/test';
process.env.WEBHOOK_SHARED_SECRET = process.env.WEBHOOK_SHARED_SECRET ?? 'test-secret';
process.env.PORT = process.env.PORT ?? '3000';
