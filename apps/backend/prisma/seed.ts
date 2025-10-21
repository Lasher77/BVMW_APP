import { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';

const prisma = new PrismaClient();

async function main() {
  const start = DateTime.now().plus({ days: 7 }).setZone('Europe/Berlin').startOf('hour');
  const end = start.plus({ hours: 3 });

  const event = await prisma.event.upsert({
    where: { sfCampaignId: '701TEST0001' },
    update: {},
    create: {
      sfCampaignId: '701TEST0001',
      title: 'BVMW Netzwerktreffen Berlin',
      subtitle: 'Austausch & Networking',
      description: '<p>Willkommen zum Netzwerktreffen.</p>',
      status: 'Planned',
      isPublic: true,
      isOnline: false,
      start: start.toJSDate(),
      end: end.toJSDate(),
      venueName: 'BVMW Hauptstadtbüro',
      street: 'Charlottenstraße 1',
      postalCode: '10117',
      city: 'Berlin',
      state: 'Berlin',
      country: 'DE',
      lat: 52.5075,
      lon: 13.3904,
      registrationUrl: 'https://doo.net/e/123456',
      headerImageUrl: 'https://placehold.co/600x400?text=BVMW',
      tags: ['Netzwerk', 'Berlin'],
    },
  });

  const member = await prisma.member.upsert({
    where: { id: '003TEST0001' },
    update: {
      type: 'contact',
      name: 'Max Mustermann',
      company: 'Musterfirma GmbH',
    },
    create: {
      id: '003TEST0001',
      type: 'contact',
      name: 'Max Mustermann',
      company: 'Musterfirma GmbH',
    },
  });

  await prisma.registration.upsert({
    where: {
      eventId_memberId: {
        eventId: event.id,
        memberId: member.id,
      },
    },
    update: {
      status: 'registered',
    },
    create: {
      eventId: event.id,
      memberId: member.id,
      status: 'registered',
      dooEventId: '123456',
      dooAttendeeId: 'A-0001',
      dooBookingId: 'B-0001',
    },
  });

  console.log('Seed data created.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
