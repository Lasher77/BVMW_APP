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
    where.region = { equals: region };
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
    let distanceKm: number | null = null;
    if (
      typeof params.lat === 'number' &&
      typeof params.lon === 'number' &&
      event.lat !== null &&
      event.lon !== null
    ) {
      distanceKm = haversineDistanceKm(
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
      region: event.region,
      isOnline: event.isOnline,
      headerImageUrl: event.headerImageUrl,
      tags: event.tags,
      distanceKm,
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
