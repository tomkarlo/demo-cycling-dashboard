const BASE = 'https://opendata.camden.gov.uk/resource/it3h-aqrf.json';

async function soql(params) {
  const url = new URL(BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { 'X-App-Token': '' },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function fetchToday() {
  return soql({
    $where: 'latest_day=true',
    $select: 'name,identifier,latitude,longitude,sum(hourly_count) as total,sum(count_in) as count_in,sum(count_out) as count_out',
    $group: 'name,identifier,latitude,longitude',
    $limit: 1000,
  });
}

export async function fetchDayTotals(isoDate) {
  return soql({
    $where: `epoch between '${isoDate}T00:00:00.000' and '${isoDate}T23:59:59.999'`,
    $select: 'name,identifier,sum(hourly_count) as total',
    $group: 'name,identifier',
    $limit: 1000,
  });
}

export async function fetchHourlyForDate(isoDate) {
  return soql({
    $where: `epoch between '${isoDate}T00:00:00.000' and '${isoDate}T23:59:59.999'`,
    $select: 'name,identifier,hour,sum(hourly_count) as total',
    $group: 'name,identifier,hour',
    $order: 'hour ASC',
    $limit: 5000,
  });
}

export async function fetchBoroughSeries(days = 90) {
  return soql({
    $select: "date_trunc_ymd(epoch) as day,sum(hourly_count) as total",
    $group: "date_trunc_ymd(epoch)",
    $order: "day DESC",
    $limit: days,
  });
}
