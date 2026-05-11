import { withCache, TTL } from './cache.js';

const BASE = 'https://opendata.camden.gov.uk/resource/it3h-aqrf.json';

async function soql(params) {
  const url = new URL(BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export function fetchToday() {
  return withCache('today', () => soql({
    $where: 'latest_day=true',
    $select: 'name,identifier,latitude,longitude,sum(hourly_count) as total,sum(count_in) as count_in,sum(count_out) as count_out',
    $group: 'name,identifier,latitude,longitude',
    $limit: 1000,
  }), TTL.TODAY);
}

export function fetchDayTotals(isoDate) {
  return withCache(`day:${isoDate}`, () => soql({
    $where: `epoch between '${isoDate}T00:00:00.000' and '${isoDate}T23:59:59.999'`,
    $select: 'name,identifier,sum(hourly_count) as total',
    $group: 'name,identifier',
    $limit: 1000,
  }), TTL.HISTORICAL);
}

export function fetchHourlyForDate(isoDate) {
  return withCache(`hourly:${isoDate}`, () => soql({
    $where: `epoch between '${isoDate}T00:00:00.000' and '${isoDate}T23:59:59.999'`,
    $select: 'name,identifier,hour,sum(hourly_count) as total',
    $group: 'name,identifier,hour',
    $order: 'hour ASC',
    $limit: 5000,
  }), TTL.HOURLY);
}

export function fetchBoroughSeries(days = 90) {
  return withCache('series', () => soql({
    $select: 'date_trunc_ymd(epoch) as day,sum(hourly_count) as total',
    $group: 'date_trunc_ymd(epoch)',
    $order: 'day DESC',
    $limit: days,
  }), TTL.SERIES);
}
