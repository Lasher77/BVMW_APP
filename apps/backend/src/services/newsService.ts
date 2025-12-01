import { DateTime } from 'luxon';
import { prisma } from '../lib/prisma.js';

export interface CreateNewsInput {
  headline: string;
  subline?: string | null;
  content: string;
  author: string;
  imageUrl?: string | null;
  downloadUrl?: string | null;
  publishedAt: string;
}

export function normalizePublishedAt(publishedAt: string) {
  const parsed = DateTime.fromISO(publishedAt, { setZone: true });
  if (!parsed.isValid) {
    throw new Error('invalid_date');
  }
  return parsed.toJSDate();
}

export async function listNews(limit = 10) {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 50) : 10;
  return prisma.news.findMany({
    orderBy: { publishedAt: 'desc' },
    take: safeLimit,
  });
}

export async function getNews(id: string) {
  return prisma.news.findUnique({ where: { id } });
}

export async function createNews(input: CreateNewsInput) {
  const publishedAt = normalizePublishedAt(input.publishedAt);
  return prisma.news.create({
    data: {
      headline: input.headline,
      subline: input.subline ?? null,
      content: input.content,
      author: input.author,
      imageUrl: input.imageUrl ?? null,
      downloadUrl: input.downloadUrl ?? null,
      publishedAt,
    },
  });
}
