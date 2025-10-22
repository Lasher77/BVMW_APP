type DateTimeFormatStatic = {
  new (locales?: string | string[], options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat;
  (locales?: string | string[], options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat;
  prototype: Intl.DateTimeFormat;
  supportedLocalesOf?: (locales: string | string[], options?: Intl.DateTimeFormatOptions) => string[];
};

type NumberFormatStatic = {
  new (locales?: string | string[], options?: Intl.NumberFormatOptions): Intl.NumberFormat;
  (locales?: string | string[], options?: Intl.NumberFormatOptions): Intl.NumberFormat;
  prototype: Intl.NumberFormat;
  supportedLocalesOf?: (locales: string | string[], options?: Intl.NumberFormatOptions) => string[];
};

type IntlLike = {
  DateTimeFormat?: DateTimeFormatStatic;
  NumberFormat?: NumberFormatStatic;
};

const FALLBACK_LOCALE = 'de-DE';
const FALLBACK_TIME_ZONE = 'Europe/Berlin';

const WEEKDAYS_SHORT = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];
const WEEKDAYS_LONG = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
];
const MONTHS_SHORT = [
  'Jan.',
  'Feb.',
  'Mär.',
  'Apr.',
  'Mai',
  'Juni',
  'Juli',
  'Aug.',
  'Sept.',
  'Okt.',
  'Nov.',
  'Dez.',
];
const MONTHS_LONG = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

function toDate(input: Date | number | string | undefined): Date {
  if (input instanceof Date) {
    return input;
  }
  if (typeof input === 'number' || typeof input === 'string') {
    return new Date(input);
  }
  return new Date();
}

function normalizeNumber(value: number, digits: '2-digit' | 'numeric' | undefined): string {
  if (digits === '2-digit') {
    return String(value).padStart(2, '0');
  }
  return String(value);
}

function formatWithFallback(date: Date, options: Intl.DateTimeFormatOptions): string {
  const parts: string[] = [];
  const formatOptions = options ?? {};

  let weekdayPart: string | undefined;
  if (formatOptions.weekday === 'short') {
    weekdayPart = WEEKDAYS_SHORT[date.getDay()];
  } else if (formatOptions.weekday === 'long') {
    weekdayPart = WEEKDAYS_LONG[date.getDay()];
  }

  const dateSegments: string[] = [];
  if (formatOptions.day === '2-digit') {
    dateSegments.push(`${normalizeNumber(date.getDate(), '2-digit')}.`);
  } else if (formatOptions.day === 'numeric') {
    dateSegments.push(`${date.getDate()}.`);
  }

  if (formatOptions.month === 'short') {
    dateSegments.push(MONTHS_SHORT[date.getMonth()]);
  } else if (formatOptions.month === 'long') {
    dateSegments.push(MONTHS_LONG[date.getMonth()]);
  } else if (formatOptions.month === 'numeric') {
    dateSegments.push(String(date.getMonth() + 1));
  }

  if (formatOptions.year === 'numeric') {
    dateSegments.push(String(date.getFullYear()));
  }

  const combinedDate = dateSegments.join(' ');
  if (weekdayPart) {
    parts.push(dateSegments.length ? `${weekdayPart},` : weekdayPart);
  }
  if (combinedDate) {
    parts.push(combinedDate);
  }

  const timeSegments: string[] = [];
  if (formatOptions.hour) {
    const hourValue = formatOptions.hour12
      ? (() => {
          const hour = date.getHours() % 12 || 12;
          return normalizeNumber(hour, formatOptions.hour);
        })()
      : normalizeNumber(date.getHours(), formatOptions.hour);
    timeSegments.push(hourValue);
  }

  if (formatOptions.minute) {
    timeSegments.push(normalizeNumber(date.getMinutes(), formatOptions.minute));
  }

  if (formatOptions.second) {
    timeSegments.push(normalizeNumber(date.getSeconds(), formatOptions.second));
  }

  let formatted = parts.join(' ');
  if (timeSegments.length) {
    let timeString = timeSegments.join(':');
    if (formatOptions.hour && formatOptions.hour12) {
      timeString += date.getHours() >= 12 ? ' PM' : ' AM';
    }
    formatted = formatted ? `${formatted} ${timeString}` : timeString;
  }

  if (!formatted) {
    return date.toISOString();
  }

  return formatted;
}

function applyGrouping(integerPart: string, useGrouping: boolean): string {
  if (!useGrouping) {
    return integerPart;
  }
  const sign = integerPart.startsWith('-') ? '-' : '';
  const digits = sign ? integerPart.slice(1) : integerPart;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return sign + grouped;
}

function formatNumberWithFallback(
  value: number,
  options: Intl.NumberFormatOptions | undefined,
): string {
  if (!Number.isFinite(value)) {
    return String(value);
  }

  const formatOptions = options ?? {};
  const minimumFractionDigits = formatOptions.minimumFractionDigits ?? 0;
  const maximumFractionDigits = formatOptions.maximumFractionDigits ?? Math.max(minimumFractionDigits, 3);
  const useGrouping = formatOptions.useGrouping ?? true;

  const isNegative = value < 0;
  const fixed = Math.abs(value).toFixed(maximumFractionDigits);
  const [integerPart, initialFractionPart = ''] = fixed.split('.');
  let fractionPart = initialFractionPart;

  while (fractionPart.length > minimumFractionDigits && fractionPart.endsWith('0')) {
    fractionPart = fractionPart.slice(0, -1);
  }
  while (fractionPart.length < minimumFractionDigits) {
    fractionPart = `${fractionPart}0`;
  }

  const groupedInteger = applyGrouping(integerPart, useGrouping);
  const signedInteger = isNegative ? `-${groupedInteger}` : groupedInteger;

  return fractionPart ? `${signedInteger},${fractionPart}` : signedInteger;
}

function fallbackSupportedLocales(locales?: string | string[]): string[] {
  if (!locales) {
    return [FALLBACK_LOCALE];
  }
  const requested = Array.isArray(locales) ? locales : [locales];
  const supported: string[] = [];
  for (const locale of requested) {
    if (!locale) {
      continue;
    }
    const normalized = locale.toLowerCase();
    if (normalized === 'de' || normalized === FALLBACK_LOCALE.toLowerCase()) {
      if (!supported.includes(FALLBACK_LOCALE)) {
        supported.push(FALLBACK_LOCALE);
      }
    }
  }
  return supported;
}

function createDateTimeFormatFallback(options: Intl.DateTimeFormatOptions | undefined) {
  const { timeZone: requestedTimeZone, ...formatOptions } = options ?? {};
  const safeOptions = { ...formatOptions } as Intl.DateTimeFormatOptions;
  const resolvedTimeZone = typeof requestedTimeZone === 'string' ? requestedTimeZone : FALLBACK_TIME_ZONE;

  return {
    format(value: Date | number | string) {
      return formatWithFallback(toDate(value), safeOptions);
    },
    formatToParts(value: Date | number | string) {
      return [{ type: 'literal', value: formatWithFallback(toDate(value), safeOptions) }];
    },
    resolvedOptions() {
      return {
        locale: FALLBACK_LOCALE,
        numberingSystem: 'latn',
        calendar: 'gregory',
        timeZone: resolvedTimeZone,
        ...safeOptions,
      };
    },
  } as Pick<Intl.DateTimeFormat, 'format' | 'formatToParts' | 'resolvedOptions'>;
}

function createNumberFormatFallback(options: Intl.NumberFormatOptions | undefined) {
  const safeOptions = { ...(options ?? {}) } as Intl.NumberFormatOptions;
  return {
    format(value: number) {
      return formatNumberWithFallback(value, safeOptions);
    },
    formatToParts(value: number) {
      return [{ type: 'literal', value: formatNumberWithFallback(value, safeOptions) }];
    },
    resolvedOptions() {
      return {
        locale: FALLBACK_LOCALE,
        numberingSystem: 'latn',
        ...safeOptions,
      };
    },
  } as Pick<Intl.NumberFormat, 'format' | 'formatToParts' | 'resolvedOptions'>;
}

function canFormatDateTime(ctor: DateTimeFormatStatic): boolean {
  try {
    const formatter = new ctor(FALLBACK_LOCALE, {
      timeZone: FALLBACK_TIME_ZONE,
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
    return typeof formatter.format === 'function';
  } catch {
    return false;
  }
}

function canFormatNumber(ctor: NumberFormatStatic): boolean {
  try {
    const formatter = new ctor(FALLBACK_LOCALE, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    return typeof formatter.format(12.3) === 'string';
  } catch {
    return false;
  }
}

function wrapDateTimeFormat(intl: IntlLike, native?: DateTimeFormatStatic) {
  if (native && canFormatDateTime(native)) {
    return;
  }

  const NativeCtor = native;

  const Polyfill = function DateTimeFormat(
    locales?: string | string[],
    options?: Intl.DateTimeFormatOptions,
  ) {
    if (!new.target) {
      return new Polyfill(locales, options);
    }

    if (NativeCtor) {
      try {
        return new NativeCtor(locales, options);
      } catch {
        // fall back below
      }
    }

    return createDateTimeFormatFallback(options);
  } as DateTimeFormatStatic;

  Polyfill.supportedLocalesOf = NativeCtor?.supportedLocalesOf
    ? (locales: string | string[], options?: Intl.DateTimeFormatOptions) => {
        const nativeSupported = NativeCtor.supportedLocalesOf(locales, options);
        const fallbackSupported = fallbackSupportedLocales(locales);
        const combined = nativeSupported.slice();
        for (const locale of fallbackSupported) {
          if (!combined.includes(locale)) {
            combined.push(locale);
          }
        }
        return combined;
      }
    : (locales?: string | string[]) => fallbackSupportedLocales(locales);

  if (NativeCtor) {
    Polyfill.prototype = NativeCtor.prototype;
  }

  intl.DateTimeFormat = Polyfill;
}

function wrapNumberFormat(intl: IntlLike, native?: NumberFormatStatic) {
  if (native && canFormatNumber(native)) {
    return;
  }

  const NativeCtor = native;

  const Polyfill = function NumberFormat(
    locales?: string | string[],
    options?: Intl.NumberFormatOptions,
  ) {
    if (!new.target) {
      return new Polyfill(locales, options);
    }

    if (NativeCtor) {
      try {
        return new NativeCtor(locales, options);
      } catch {
        // fall back below
      }
    }

    return createNumberFormatFallback(options);
  } as NumberFormatStatic;

  Polyfill.supportedLocalesOf = NativeCtor?.supportedLocalesOf
    ? (locales: string | string[], options?: Intl.NumberFormatOptions) => {
        const nativeSupported = NativeCtor.supportedLocalesOf(locales, options);
        const fallbackSupported = fallbackSupportedLocales(locales);
        const combined = nativeSupported.slice();
        for (const locale of fallbackSupported) {
          if (!combined.includes(locale)) {
            combined.push(locale);
          }
        }
        return combined;
      }
    : (locales?: string | string[]) => fallbackSupportedLocales(locales);

  if (NativeCtor) {
    Polyfill.prototype = NativeCtor.prototype;
  }

  intl.NumberFormat = Polyfill;
}

export function ensureIntlSupport() {
  const globalObject = globalThis as { Intl?: IntlLike };
  const intl = (globalObject.Intl ??= {});

  wrapDateTimeFormat(intl, intl.DateTimeFormat);
  wrapNumberFormat(intl, intl.NumberFormat);
}

ensureIntlSupport();

export {};
