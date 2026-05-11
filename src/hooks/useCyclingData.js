import { useState, useEffect } from 'react';
import { fetchToday, fetchDayTotals, fetchBoroughSeries } from '../lib/api';
import { subtractDays, pctChange } from '../lib/utils';

export function useCyclingData() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    counters: [],       // today's per-counter data with comparison
    boroughSeries: [],  // [{day, total}] last 90 days
    latestDate: null,
  });

  useEffect(() => {
    async function load() {
      try {
        const today = await fetchToday();
        if (!today.length) throw new Error('No data returned for latest day');

        // Derive the most recent date from the data
        // (the API doesn't return epoch for aggregated latest_day queries)
        // We'll query one raw row to get the actual date
        const rawRes = await fetch(
          'https://opendata.camden.gov.uk/resource/it3h-aqrf.json?$where=latest_day=true&$select=epoch&$limit=1'
        );
        const rawRow = await rawRes.json();
        const latestDate = rawRow[0]?.epoch?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);

        const weekAgoDate = subtractDays(latestDate, 7);
        const monthAgoDate = subtractDays(latestDate, 30);
        const yearAgoDate = subtractDays(latestDate, 365);

        const [weekData, monthData, yearData, series] = await Promise.all([
          fetchDayTotals(weekAgoDate),
          fetchDayTotals(monthAgoDate),
          fetchDayTotals(yearAgoDate),
          fetchBoroughSeries(90),
        ]);

        const toMap = (rows) => Object.fromEntries(rows.map(r => [r.identifier, Number(r.total)]));
        const weekMap = toMap(weekData);
        const monthMap = toMap(monthData);
        const yearMap = toMap(yearData);

        const counters = today
          .filter(r => r.latitude && r.longitude)
          .map(r => {
            const total = Number(r.total);
            const id = r.identifier;
            return {
              ...r,
              total,
              count_in: Number(r.count_in) || 0,
              count_out: Number(r.count_out) || 0,
              lat: Number(r.latitude),
              lng: Number(r.longitude),
              weekTotal: weekMap[id] ?? null,
              monthTotal: monthMap[id] ?? null,
              yearTotal: yearMap[id] ?? null,
              weekPct: pctChange(total, weekMap[id]),
              monthPct: pctChange(total, monthMap[id]),
              yearPct: pctChange(total, yearMap[id]),
            };
          });

        const boroughSeries = series
          .map(r => ({ day: r.day?.slice(0, 10), total: Number(r.total) }))
          .sort((a, b) => a.day.localeCompare(b.day));

        setState({ loading: false, error: null, counters, boroughSeries, latestDate });
      } catch (err) {
        setState(s => ({ ...s, loading: false, error: err.message }));
      }
    }
    load();
  }, []);

  return state;
}
