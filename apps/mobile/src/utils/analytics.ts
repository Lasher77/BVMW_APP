export type AnalyticsEvent = 'ZT_Hero_Click' | 'ZT_Card_Click';

export const track = (event: AnalyticsEvent, payload?: Record<string, unknown>) => {
  if (__DEV__) {
    // eslint-disable-next-line no-console -- development-only analytics stub
    console.debug(`[analytics] ${event}`, payload);
  }
};
