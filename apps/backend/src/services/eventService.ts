import { DateTime } from 'luxon';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { haversineDistanceKm } from '../utils/geo.js';

export async function listEvents(params: {
  from?: string;
  to?: string;
  region?: string;
  query?: string;
  lat?: number;
  lon?: number;
  online?: boolean;
}) {
  const { from, to, region, query, online } = params;
  const where: Prisma.EventWhereInput = {};
  if (from) {
    const parsed = DateTime.fromISO(from, { setZone: true });
    if (parsed.isValid) {
      where.start = { gte: parsed.toJSDate() };
    }
  }
  if (to) {
    const parsed = DateTime.fromISO(to, { setZone: true });
    if (parsed.isValid) {
      where.end = { lte: parsed.toJSDate() };
    }
  }
  if (region) {
    where.OR = [
      { city: { contains: region, mode: 'insensitive' } },
      { state: { contains: region, mode: 'insensitive' } },
      { country: { contains: region, mode: 'insensitive' } },
    ];
  }
  if (query) {
    const q = { contains: query, mode: 'insensitive' } as const;
    where.AND = [
      { OR: [{ title: q }, { subtitle: q }, { description: q }, { city: q }] },
    ];
  }
  if (typeof online === 'boolean') {
    where.isOnline = online;
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { start: 'asc' },
  });

  return events.map((event) => {
    let distance: number | null = null;
    if (
      typeof params.lat === 'number' &&
      typeof params.lon === 'number' &&
      event.lat !== null &&
      event.lon !== null
    ) {
      distance = haversineDistanceKm(
        { lat: params.lat, lon: params.lon },
        { lat: event.lat, lon: event.lon },
      );
    }
    return {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      city: event.city,
      isOnline: event.isOnline,
      headerImageUrl: event.headerImageUrl,
      tags: event.tags,
      distance,
    };
  });
}

export async function getEvent(id: string) {
  return prisma.event.findUnique({ where: { id } });
}

export async function getMemberRegistrations(memberId: string) {
  return prisma.registration.findMany({
    where: { memberId },
    include: {
      event: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
