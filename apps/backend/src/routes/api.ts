import { Router } from 'express';
import { listEvents, getEvent, getMemberRegistrations } from '../services/eventService.js';
import {
  ChatError,
  listEventAttendees,
  listEventMessages,
  sendEventMessage,
} from '../services/chatService.js';

export const apiRouter = Router();

apiRouter.get('/events', async (req, res, next) => {
  try {
    const { from, to, region, query, lat, lon, online } = req.query;
    const events = await listEvents({
      from: typeof from === 'string' ? from : undefined,
      to: typeof to === 'string' ? to : undefined,
      region: typeof region === 'string' ? region : undefined,
      query: typeof query === 'string' ? query : undefined,
      lat: typeof lat === 'string' ? Number.parseFloat(lat) : undefined,
      lon: typeof lon === 'string' ? Number.parseFloat(lon) : undefined,
      online:
        typeof online === 'string'
          ? online === 'true'
          : typeof online === 'boolean'
            ? online
            : undefined,
    });
    res.json({ events });
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/events/:id', async (req, res, next) => {
  try {
    const event = await getEvent(req.params.id);
    if (!event) {
      return res.status(404).json({ ok: false, error: 'not_found' });
    }
    res.json({ event });
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/members/:id/registrations', async (req, res, next) => {
  try {
    const registrations = await getMemberRegistrations(req.params.id);
    const data = registrations.map((registration) => ({
      id: registration.id,
      status: registration.status,
      checkInAt: registration.checkInAt,
      event: {
        id: registration.event.id,
        title: registration.event.title,
        start: registration.event.start,
        end: registration.event.end,
        city: registration.event.city,
        region: registration.event.region,
        isOnline: registration.event.isOnline,
        headerImageUrl: registration.event.headerImageUrl,
        tags: registration.event.tags,
        distanceKm: null,
      },
    }));
    res.json({ registrations: data });
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/events/:id/attendees', async (req, res, next) => {
  try {
    const attendees = await listEventAttendees(req.params.id);
    res.json({ attendees });
  } catch (error) {
    if (error instanceof ChatError) {
      return res.status(error.status).json({ ok: false, error: error.code });
    }
    next(error);
  }
});

apiRouter.get('/events/:id/messages', async (req, res, next) => {
  const { memberA, memberB } = req.query;
  if (typeof memberA !== 'string' || typeof memberB !== 'string') {
    return res.status(400).json({ ok: false, error: 'missing_member' });
  }

  try {
    const messages = await listEventMessages(req.params.id, memberA, memberB);
    res.json({ messages });
  } catch (error) {
    if (error instanceof ChatError) {
      return res.status(error.status).json({ ok: false, error: error.code });
    }
    next(error);
  }
});

apiRouter.post('/events/:id/messages', async (req, res, next) => {
  const { senderId, recipientId, content } = req.body ?? {};
  if (
    typeof senderId !== 'string' ||
    typeof recipientId !== 'string' ||
    typeof content !== 'string'
  ) {
    return res.status(400).json({ ok: false, error: 'invalid_payload' });
  }

  try {
    const message = await sendEventMessage({
      eventId: req.params.id,
      senderId,
      recipientId,
      content,
    });
    res.status(201).json({ message });
  } catch (error) {
    if (error instanceof ChatError) {
      return res.status(error.status).json({ ok: false, error: error.code });
    }
    next(error);
  }
});
