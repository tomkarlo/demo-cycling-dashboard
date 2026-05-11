export function formatCount(n) {
  if (n == null) return '—';
  return Number(n).toLocaleString();
}

export function pctChange(current, baseline) {
  if (!baseline || baseline === 0) return null;
  return ((current - baseline) / baseline) * 100;
}

export function formatPct(pct) {
  if (pct == null) return '—';
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

export function markerColor(pct) {
  if (pct == null) return '#2a4060'; // no baseline
  if (pct > 10)   return '#b4ff4d'; // acid green — up
  if (pct < -10)  return '#ff3a56'; // red — down
  return '#f5a623';                  // amber — flat
}

export function subtractDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function friendlyName(rawName) {
  // Convert sensor IDs like "S46_YorkWayRd_road_cam" to "York Way Rd (road)"
  return rawName
    .replace(/^[Ss]\d+_/, '')
    .replace(/_cam$|_trs\d+$|_lbc\d+$|_tfl\d+$|_uow\d+$|_lbcam\d+$/, '')
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
}
