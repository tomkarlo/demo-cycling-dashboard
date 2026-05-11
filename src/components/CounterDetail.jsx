import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchHourlyForDate } from '../lib/api';
import { formatCount, formatPct, friendlyName } from '../lib/utils';

function CompareRow({ label, pct, baseline }) {
  const noData = pct == null;
  const up = pct > 0;
  const color = noData ? 'var(--muted)' : up ? 'var(--up)' : 'var(--down)';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '10px 20px',
      borderBottom: '1px solid var(--border)',
      gap: 12,
    }}>
      <div style={{
        width: 3, height: 28, borderRadius: 2,
        background: noData ? 'var(--nodata)' : color,
        flexShrink: 0,
      }} />
      <span style={{ color: 'var(--muted)', fontSize: 12, width: 80, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>
        {noData ? '—' : `${up ? '↑' : '↓'} ${Math.abs(pct).toFixed(1)}%`}
      </span>
      {baseline != null && (
        <span style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 'auto' }}>
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

  // Build a full 24-slot day regardless of what the API returned
  const ALL_HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
  const hourMap   = Object.fromEntries(hourly.map(r => [r.hour, r.total]));
  const fullDay   = ALL_HOURS.map(h => ({ hour: h, total: hourMap[h] ?? 0, hasData: h in hourMap }));

  // Last hour with actual data = the live (most recent) reading
  const liveIdx = ALL_HOURS.reduce((last, h, i) => (h in hourMap ? i : last), -1);

  function barColor(i) {
    if (i > liveIdx)  return '#e2e8f0'; // future / previous-day hours
    if (i === liveIdx) return '#16a34a'; // live hour
    return '#dcfce7';                    // earlier hours today
  }

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>

      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        background: 'var(--surface2)',
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 4 }}>Counter detail</div>
          <h2 style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 18,
            color: 'var(--text)',
            margin: 0, lineHeight: 1.2,
          }}>
            {friendlyName(counter.name)}
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            color: 'var(--muted)',
            width: 30, height: 30,
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0, marginLeft: 12,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
        >
          ×
        </button>
      </div>

      {/* Today's total */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 6 }}>Today's count</div>
        <div style={{
          fontSize: 52, fontWeight: 700, lineHeight: 1,
          color: 'var(--accent)', letterSpacing: '-0.02em',
        }}>
          {formatCount(counter.total)}
        </div>
        {(counter.count_in > 0 || counter.count_out > 0) && (
          <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>
              ↑ {formatCount(counter.count_in)} inbound
            </span>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>
              ↓ {formatCount(counter.count_out)} outbound
            </span>
          </div>
        )}
      </div>

      {/* Comparisons */}
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <CompareRow label="vs last week"  pct={counter.weekPct}  baseline={counter.weekTotal} />
        <CompareRow label="vs last month" pct={counter.monthPct} baseline={counter.monthTotal} />
        <CompareRow label="vs last year"  pct={counter.yearPct}  baseline={counter.yearTotal} />
      </div>

      {/* Hourly chart */}
      <div style={{ padding: '16px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ color: 'var(--muted)', fontSize: 12 }}>Cyclists by hour</div>
          {liveIdx >= 0 && (
            <div style={{ display: 'flex', gap: 10 }}>
              {[['#dcfce7', '#16a34a', 'Today'], ['#e2e8f0', '#e2e8f0', 'Previous day']].map(([bg, border, label]) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: bg, border: `1.5px solid ${border}`, display: 'inline-block' }} />
                  <span style={{ color: 'var(--muted)', fontSize: 10 }}>{label}</span>
                </span>
              ))}
            </div>
          )}
        </div>
        {loading ? (
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
        ) : hourly.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>No hourly data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={fullDay} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10, fill: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
                interval={3}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'var(--text)',
                  fontFamily: 'var(--font-body)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                formatter={(v, name, props) => {
                  if (!props.payload.hasData) return ['No data', ''];
                  return [v.toLocaleString(), 'cyclists'];
                }}
                labelStyle={{ color: 'var(--muted)', fontSize: 11 }}
              />
              <Bar dataKey="total" radius={[3, 3, 0, 0]}>
                {fullDay.map((entry, i) => (
                  <Cell key={i} fill={barColor(i)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
