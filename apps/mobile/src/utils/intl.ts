const preferredLocale = 'de-DE';
const preferredTimeZone = 'Europe/Berlin';

const hasIntl = typeof Intl !== 'undefined';
const hasDateTimeFormat = hasIntl && typeof Intl.DateTimeFormat === 'function';
const hasNumberFormat = hasIntl && typeof Intl.NumberFormat === 'function';

const resolvedDateLocale = (() => {
  if (!hasDateTimeFormat) {
    return undefined;
  }
  try {
    const supported = Intl.DateTimeFormat.supportedLocalesOf([preferredLocale]);
    return supported[0];
  } catch {
    return undefined;
  }
})();

const resolvedNumberLocale = (() => {
  if (!hasNumberFormat) {
    return undefined;
  }
  try {
    const supported = Intl.NumberFormat.supportedLocalesOf([preferredLocale]);
    return supported[0];
  } catch {
    return undefined;
  }
})();

const resolvedTimeZone = (() => {
  if (!hasDateTimeFormat || !preferredTimeZone) {
    return undefined;
  }
  try {
    new Intl.DateTimeFormat(resolvedDateLocale ?? undefined, {
      timeZone: preferredTimeZone,
    }).format(new Date());
    return preferredTimeZone;
  } catch {
    try {
      new Intl.DateTimeFormat(undefined, {
        timeZone: preferredTimeZone,
      }).format(new Date());
      return preferredTimeZone;
    } catch {
      return undefined;
    }
  }
})();

const WEEKDAYS_SHORT = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];
const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mär',
  'Apr',
  'Mai',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Okt',
  'Nov',
  'Dez',
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

function formatWithFallback(date: Date, options: Intl.DateTimeFormatOptions): string {
  const dateSegments: string[] = [];

  if (options.weekday === 'short') {
    dateSegments.push(WEEKDAYS_SHORT[date.getDay()]);
  }

  if (options.day === '2-digit') {
    dateSegments.push(`${String(date.getDate()).padStart(2, '0')}.`);
  } else if (options.day === 'numeric') {
    dateSegments.push(`${date.getDate()}.`);
  }

  if (options.month === 'short') {
    dateSegments.push(MONTHS_SHORT[date.getMonth()]);
  } else if (options.month === 'long') {
    dateSegments.push(MONTHS_LONG[date.getMonth()]);
  }

  if (options.year === 'numeric') {
    dateSegments.push(String(date.getFullYear()));
  }

  const timeSegments: string[] = [];

  if (options.hour) {
    timeSegments.push(String(date.getHours()).padStart(2, '0'));
  }

  if (options.minute) {
    timeSegments.push(String(date.getMinutes()).padStart(2, '0'));
  }

  const formattedDate = dateSegments.join(' ');
  const formattedTime = timeSegments.length ? timeSegments.join(':') : '';

  if (formattedDate && formattedTime) {
    return `${formattedDate} ${formattedTime}`;
  }

  if (formattedTime) {
    return formattedTime;
  }

  if (formattedDate) {
    return formattedDate;
  }

  return date.toISOString();
}

function sanitizeOptions(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormatOptions {
  if (!('timeZone' in options)) {
    return options;
  }

  const { timeZone: _timeZone, ...rest } = options;
  void _timeZone;
  return rest;
}

export function createDateTimeFormatter(options: Intl.DateTimeFormatOptions) {
  if (!hasDateTimeFormat) {
    return {
      format(date: Date) {
        return formatWithFallback(date, options);
      },
    };
  }

  const baseOptions = resolvedTimeZone ? { ...options, timeZone: resolvedTimeZone } : options;
  const locale = resolvedDateLocale ?? undefined;

  try {
    return new Intl.DateTimeFormat(locale, baseOptions);
  } catch {
    try {
      return new Intl.DateTimeFormat(undefined, baseOptions);
    } catch {
      return new Intl.DateTimeFormat(undefined, sanitizeOptions(baseOptions));
    }
  }
}

function formatNumberWithFallback(value: number, options?: Intl.NumberFormatOptions): string {
  if (!Number.isFinite(value)) {
    return String(value);
  }

  const minimumFractionDigits = options?.minimumFractionDigits ?? 0;
  const maximumFractionDigits = options?.maximumFractionDigits ?? Math.max(minimumFractionDigits, 0);

  const fixed = value.toFixed(maximumFractionDigits);
  const [integerPart, initialFractionPart = ''] = fixed.split('.');
  let fractionPart = initialFractionPart;

  if (fractionPart) {
    while (fractionPart.length > minimumFractionDigits && fractionPart.endsWith('0')) {
      fractionPart = fractionPart.slice(0, -1);
    }
    if (fractionPart.length < minimumFractionDigits) {
      fractionPart = fractionPart.padEnd(minimumFractionDigits, '0');
    }
  } else if (minimumFractionDigits > 0) {
    fractionPart = ''.padEnd(minimumFractionDigits, '0');
  }

  return fractionPart ? `${integerPart},${fractionPart}` : integerPart;
}

export function createNumberFormatter(options?: Intl.NumberFormatOptions) {
  if (!hasNumberFormat) {
    return {
      format(value: number) {
        return formatNumberWithFallback(value, options);
      },
    };
  }

  const locale = resolvedNumberLocale ?? undefined;
  try {
    return new Intl.NumberFormat(locale, options);
  } catch {
    return new Intl.NumberFormat(undefined, options);
  }
}
