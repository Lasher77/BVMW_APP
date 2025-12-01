export type AppLocale = 'de';

type CountdownFormatter = (value: number) => string;

type ZukunftstagTranslations = {
  badgeLabel: string;
  heroTitle: string;
  heroAccessibilityLabel: string;
  heroCountdownToday: string;
  heroCountdownInDays: CountdownFormatter;
  heroCountdownInHours: CountdownFormatter;
  heroCtaLabel: string;
  heroCtaAccessibilityLabel: string;
  cardSectionTitle: string;
  cardTitle: string;
  cardSubtitle: string;
  cardCtaLabel: string;
  cardAccessibilityLabel: string;
};

type Translations = {
  zukunftstag: ZukunftstagTranslations;
  home: {
    greeting: string;
    nextEventSectionTitle: string;
    quickLinksSectionTitle: string;
    noUpcomingEvents: string;
    newsSectionTitle: string;
    newsSeeAll: string;
  };
  news: {
    listTitle: string;
    empty: string;
    detailTitle: string;
    publishedBy: (author: string) => string;
    downloadLabel: string;
  };
};

const translations: Record<AppLocale, Translations> = {
  de: {
    zukunftstag: {
      badgeLabel: 'Zukunftstag',
      heroTitle: 'Zukunftstag Mittelstand 2026',
      heroAccessibilityLabel: 'Zukunftstag Mittelstand 2026 Hero-Banner',
      heroCountdownToday: 'Heute',
      heroCountdownInDays: (days) => `In ${days} ${days === 1 ? 'Tag' : 'Tagen'}`,
      heroCountdownInHours: (hours) => `In ${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}`,
      heroCtaLabel: 'Zur Website',
      heroCtaAccessibilityLabel: 'Offizielle Webseite des Zukunftstag Mittelstand öffnen',
      cardSectionTitle: 'Zukunftstag Mittelstand',
      cardTitle: 'Zukunftstag Mittelstand',
      cardSubtitle: 'Impulse, Vernetzung und Perspektiven für Unternehmen.',
      cardCtaLabel: 'Mehr erfahren',
      cardAccessibilityLabel: 'Mehr erfahren über den Zukunftstag Mittelstand',
    },
    home: {
      greeting: 'Willkommen!',
      nextEventSectionTitle: 'Nächstes Event in deiner Nähe',
      quickLinksSectionTitle: 'Schnellzugriff',
      noUpcomingEvents: 'Keine kommenden Events gefunden.',
      newsSectionTitle: 'Neuigkeiten',
      newsSeeAll: 'Alle News anzeigen',
    },
    news: {
      listTitle: 'Alle News',
      empty: 'Noch keine News verfügbar.',
      detailTitle: 'News',
      publishedBy: (author) => `von ${author}`,
      downloadLabel: 'PDF herunterladen',
    },
  },
};

export const defaultLocale: AppLocale = 'de';

export const strings = translations[defaultLocale];
