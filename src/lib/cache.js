const PREFIX = 'ccm_';

export async function withCache(key, fetchFn, ttlMs) {
  const stored = localStorage.getItem(PREFIX + key);
  if (stored) {
    try {
      const { data, expires } = JSON.parse(stored);
      if (Date.now() < expires) return data;
    } catch {
      // corrupt entry — fall through to fetch
    }
  }

  const data = await fetchFn();

  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ data, expires: Date.now() + ttlMs }));
  } catch {
    // storage full — ignore, data still returned fresh
  }

  return data;
}

const HOUR = 60 * 60 * 1000;
const DAY  = 24 * HOUR;

export const TTL = {
  TODAY:      1 * HOUR,   // re-fetched hourly; data updates daily
  HISTORICAL: 1 * DAY,    // past dates never change
  SERIES:     1 * HOUR,
  HOURLY:     30 * 60 * 1000,
};
