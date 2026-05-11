import { formatCount, formatPct, friendlyName, pctChange } from '../lib/utils';
import BoroughSparkline from './BoroughSparkline';

function boroughTotals(counters) {
  const sum = (key) => counters.reduce((acc, c) => acc + (c[key] ?? 0), 0);
  const today = sum('total');
  const week  = counters.some(c => c.weekTotal  != null) ? sum('weekTotal')  : null;
  const month = counters.some(c => c.monthTotal != null) ? sum('monthTotal') : null;
  const year  = counters.some(c => c.yearTotal  != null) ? sum('yearTotal')  : null;
  return { today, week, month, year };
}

function markerColor(weekPct) {
  if (weekPct == null) return '#94a3b8';
  if (weekPct > 10)   return '#16a34a';
  if (weekPct < -10)  return '#dc2626';
  return '#d97706';
}

function DeltaRow({ label, pct, baseline }) {
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
        width: 3, height: 32, borderRadius: 2,
        background: noData ? 'var(--nodata)' : color,
        flexShrink: 0,
      }} />
      <span style={{ color: 'var(--muted)', fontSize: 12, width: 80, flexShrink: 0 }}>{label}</span>
      <span style={{ color, fontSize: 18, fontWeight: 700, lineHeight: 1 }}>
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

function CounterRow({ counter, maxTotal, onSelect }) {
  const color = markerColor(counter.weekPct);
  const barWidth = maxTotal > 0 ? (counter.total / maxTotal) * 100 : 0;

  return (
    <button
      className="counter-row"
      onClick={() => onSelect(counter)}
      style={{
        position: 'relative',
        width: '100%',
        textAlign: 'left',
        padding: '9px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1px solid var(--border)',
        background: 'transparent',
        border: 'none',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div className="counter-bar" style={{ width: `${barWidth}%` }} />

      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: color, flexShrink: 0,
        border: '2px solid white',
        boxShadow: `0 0 0 1px ${color}`,
        position: 'relative', zIndex: 1,
      }} />

      <span style={{
        flex: 1, minWidth: 0,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        color: 'var(--text)', fontSize: 13,
        position: 'relative', zIndex: 1,
      }}>
        {friendlyName(counter.name)}
      </span>

      <span style={{
        fontSize: 13, fontWeight: 600,
        color: 'var(--text)',
        position: 'relative', zIndex: 1,
      }}>
        {formatCount(counter.total)}
      </span>

      {counter.weekPct != null && (
        <span style={{
          fontSize: 12, fontWeight: 500,
          color, width: 50, textAlign: 'right', flexShrink: 0,
          position: 'relative', zIndex: 1,
        }}>
          {formatPct(counter.weekPct)}
        </span>
      )}
    </button>
  );
}

export default function StatsPanel({ counters, boroughSeries, latestDate, onSelect }) {
  const totals = boroughTotals(counters);
  const sorted = [...counters].sort((a, b) => b.total - a.total);
  const maxTotal = sorted[0]?.total ?? 1;

  const weekPct  = pctChange(totals.today, totals.week);
  const monthPct = pctChange(totals.today, totals.month);
  const yearPct  = pctChange(totals.today, totals.year);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Hero total */}
      <div className="fade-up" style={{ padding: '20px 20px 18px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 6 }}>
          Total cyclists today
        </div>
        <div style={{
          fontSize: 56, fontWeight: 700, lineHeight: 1,
          color: 'var(--text)', letterSpacing: '-0.02em',
        }}>
          {formatCount(totals.today)}
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6 }}>
          across all {counters.length} counters
        </div>
      </div>

      {/* Comparisons */}
      <div className="fade-up" style={{ animationDelay: '0.06s', borderBottom: '1px solid var(--border)' }}>
        <DeltaRow label="vs last week"  pct={weekPct}  baseline={totals.week} />
        <DeltaRow label="vs last month" pct={monthPct} baseline={totals.month} />
        <DeltaRow label="vs last year"  pct={yearPct}  baseline={totals.year} />
      </div>

      {/* Sparkline */}
      {boroughSeries.length > 0 && (
        <div className="fade-up" style={{ animationDelay: '0.12s', padding: '14px 20px 10px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 8 }}>Daily totals — last 90 days</div>
          <BoroughSparkline series={boroughSeries} />
        </div>
      )}

      {/* Legend */}
      <div style={{
        padding: '8px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        <span style={{ color: 'var(--muted)', fontSize: 11 }}>vs last week:</span>
        {[['#16a34a', 'Up'], ['#d97706', 'Steady'], ['#dc2626', 'Down'], ['#94a3b8', 'No data']].map(([c, l]) => (
          <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block', border: '1.5px solid white', boxShadow: `0 0 0 1px ${c}` }} />
            <span style={{ color: 'var(--muted)', fontSize: 11 }}>{l}</span>
          </span>
        ))}
      </div>

      {/* Counter list */}
      <div className="fade-up" style={{ animationDelay: '0.18s', flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '8px 20px 4px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--muted)', fontSize: 11 }}>Location</span>
          <span style={{ color: 'var(--muted)', fontSize: 11 }}>Count · change</span>
        </div>
        {sorted.map(c => (
          <CounterRow key={c.identifier} counter={c} maxTotal={maxTotal} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
