import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchHourlyForDate } from '../lib/api';
import { formatCount, formatPct, friendlyName } from '../lib/utils';

function CompareRow({ label, pct, baseline, current }) {
  const noData = pct == null;
  const up = pct > 0;
  const color = noData ? 'var(--muted)' : up ? 'var(--up)' : 'var(--down)';
  const arrow = noData ? '' : up ? '↑' : '↓';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '9px 20px',
      borderBottom: '1px solid var(--border)',
      gap: 10,
    }}>
      <div style={{
        width: 3, height: 24, borderRadius: 2,
        background: noData ? 'var(--nodata)' : color,
        flexShrink: 0,
      }} />
      <span style={{ color: 'var(--muted)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', width: 48, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color, letterSpacing: '0.04em', lineHeight: 1 }}>
        {noData ? '—' : `${arrow} ${Math.abs(pct).toFixed(1)}%`}
      </span>
      {baseline != null && (
        <span style={{ color: 'var(--muted)', fontSize: 10, marginLeft: 'auto' }}>
          {formatCount(baseline)} prior
        </span>
      )}
    </div>
  );
}

export default function CounterDetail({ counter, latestDate, onClose }) {
  const [hourly, setHourly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!counter || !latestDate) return;
    setLoading(true);
    fetchHourlyForDate(latestDate)
      .then(rows => {
        const mine = rows
          .filter(r => r.identifier === counter.identifier)
          .map(r => ({ hour: r.hour, total: Number(r.total) }))
          .sort((a, b) => a.hour.localeCompare(b.hour));
        setHourly(mine);
      })
      .finally(() => setLoading(false));
  }, [counter?.identifier, latestDate]);

  if (!counter) return null;

  const maxHour = hourly.reduce((m, r) => Math.max(m, r.total), 0);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>

      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: 'var(--muted)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>
            Counter Detail
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            letterSpacing: '0.04em',
            color: 'var(--text)',
            margin: 0, lineHeight: 1.1,
          }}>
            {friendlyName(counter.name).toUpperCase()}
          </h2>
          <div style={{ color: 'var(--muted)', fontSize: 9, marginTop: 4, letterSpacing: '0.08em' }}>
            {counter.name}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: '1px solid var(--border2)', cursor: 'pointer',
            color: 'var(--muted)', width: 28, height: 28, borderRadius: 3,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0, marginLeft: 12,
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
        >
          ×
        </button>
      </div>

      {/* Today's total */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ color: 'var(--muted)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
          Today's Count
        </div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 56, lineHeight: 0.95,
          letterSpacing: '-0.01em', color: 'var(--accent)',
        }}>
          {formatCount(counter.total)}
        </div>
        {(counter.count_in > 0 || counter.count_out > 0) && (
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <span style={{ color: 'var(--muted)', fontSize: 10 }}>
              ↑ {formatCount(counter.count_in)} IN
            </span>
            <span style={{ color: 'var(--muted)', fontSize: 10 }}>
              ↓ {formatCount(counter.count_out)} OUT
            </span>
          </div>
        )}
      </div>

      {/* Period comparisons */}
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <CompareRow label="Week"  pct={counter.weekPct}  baseline={counter.weekTotal} />
        <CompareRow label="Month" pct={counter.monthPct} baseline={counter.monthTotal} />
        <CompareRow label="Year"  pct={counter.yearPct}  baseline={counter.yearTotal} />
      </div>

      {/* Hourly chart */}
      <div style={{ padding: '14px 20px 20px' }}>
        <div style={{ color: 'var(--muted)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          Hourly Breakdown — Today
        </div>
        {loading ? (
          <div style={{ color: 'var(--muted)', fontSize: 11 }}>Loading…</div>
        ) : hourly.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: 11 }}>No hourly data</div>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={hourly} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 9, fill: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
                interval={3}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border2)',
                  borderRadius: 3,
                  fontSize: 11,
                  color: 'var(--text)',
                  fontFamily: 'var(--font-mono)',
                }}
                formatter={(v) => [v.toLocaleString(), 'cyclists']}
                labelStyle={{ color: 'var(--muted)', fontSize: 10 }}
              />
              <Bar dataKey="total" radius={[2, 2, 0, 0]}>
                {hourly.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.total === maxHour ? 'var(--accent)' : 'var(--surface2)'}
                    stroke={entry.total === maxHour ? 'var(--accent)' : 'var(--border2)'}
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
