const preferredLocale = 'de-DE';
const preferredTimeZone = 'Europe/Berlin';

const resolvedDateLocale = (() => {
  try {
    const supported = Intl.DateTimeFormat.supportedLocalesOf([preferredLocale]);
    return supported[0];
  } catch {
    return undefined;
  }
})();

const resolvedNumberLocale = (() => {
  try {
    const supported = Intl.NumberFormat.supportedLocalesOf([preferredLocale]);
    return supported[0];
  } catch {
    return undefined;
  }
})();

const resolvedTimeZone = (() => {
  if (!preferredTimeZone) return undefined;
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

function sanitizeOptions(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormatOptions {
  if (!('timeZone' in options)) {
    return options;
  }

  const { timeZone: _timeZone, ...rest } = options;
  void _timeZone;
  return rest;
}

export function createDateTimeFormatter(options: Intl.DateTimeFormatOptions) {
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

export function createNumberFormatter(options?: Intl.NumberFormatOptions) {
  const locale = resolvedNumberLocale ?? undefined;
  try {
    return new Intl.NumberFormat(locale, options);
  } catch {
    return new Intl.NumberFormat(undefined, options);
  }
}
