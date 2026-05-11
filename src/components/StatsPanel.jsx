import { formatCount, formatPct, friendlyName, pctChange, markerColor } from '../lib/utils';
import BoroughSparkline from './BoroughSparkline';

function boroughTotals(counters) {
  const sum = (key) => counters.reduce((acc, c) => acc + (c[key] ?? 0), 0);
  const today = sum('total');
  const week  = counters.some(c => c.weekTotal  != null) ? sum('weekTotal')  : null;
  const month = counters.some(c => c.monthTotal != null) ? sum('monthTotal') : null;
  const year  = counters.some(c => c.yearTotal  != null) ? sum('yearTotal')  : null;
  return { today, week, month, year };
}

function DeltaRow({ label, pct, baseline }) {
  const noData = pct == null;
  const up = pct > 0;
  const color = noData ? 'var(--muted)' : up ? 'var(--up)' : 'var(--down)';
  const arrow = noData ? '' : up ? '↑' : '↓';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '7px 20px',
      borderBottom: '1px solid var(--border)',
      gap: 12,
    }}>
      <div style={{
        width: 3, height: 28, borderRadius: 2,
        background: noData ? 'var(--nodata)' : color,
        flexShrink: 0,
      }} />
      <span style={{ color: 'var(--muted)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', width: 48, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ color, fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.04em', lineHeight: 1 }}>
        {noData ? '—' : `${arrow} ${Math.abs(pct).toFixed(1)}%`}
      </span>
      {baseline != null && (
        <span style={{ color: 'var(--muted)', fontSize: 10, marginLeft: 'auto' }}>
          {formatCount(baseline)}
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
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1px solid var(--border)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div className="counter-bar" style={{ width: `${barWidth}%` }} />

      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: color, flexShrink: 0,
        position: 'relative', zIndex: 1,
      }} />

      <span style={{
        flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        color: 'var(--text)', fontSize: 11,
        position: 'relative', zIndex: 1,
      }}>
        {friendlyName(counter.name)}
      </span>

      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500,
        color: 'var(--text)', tabularNums: true,
        position: 'relative', zIndex: 1,
      }}>
        {formatCount(counter.total)}
      </span>

      {counter.weekPct != null && (
        <span style={{
          fontSize: 10, color, width: 46, textAlign: 'right', flexShrink: 0,
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
      <div className="fade-up" style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ color: 'var(--muted)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>
          Borough Total Today
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 72,
          lineHeight: 0.9,
          letterSpacing: '-0.01em',
          color: 'var(--text)',
        }}>
          {formatCount(totals.today)}
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 6 }}>
          Cyclists Counted
        </div>
      </div>

      {/* Period comparisons */}
      <div className="fade-up" style={{ animationDelay: '0.08s', borderBottom: '1px solid var(--border)' }}>
        <DeltaRow label="Week"  pct={weekPct}  baseline={totals.week} />
        <DeltaRow label="Month" pct={monthPct} baseline={totals.month} />
        <DeltaRow label="Year"  pct={yearPct}  baseline={totals.year} />
      </div>

      {/* Sparkline */}
      {boroughSeries.length > 0 && (
        <div className="fade-up" style={{ animationDelay: '0.14s', padding: '12px 20px 8px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--muted)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            90-Day Trend
          </div>
          <BoroughSparkline series={boroughSeries} />
        </div>
      )}

      {/* Legend row */}
      <div style={{
        padding: '6px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 14,
        flexShrink: 0,
      }}>
        <span style={{ color: 'var(--muted)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }}>vs last week</span>
        {[
          ['var(--up)', '>+10%'],
          ['var(--neutral)', '±10%'],
          ['var(--down)', '<-10%'],
          ['var(--nodata)', 'N/A'],
        ].map(([c, l]) => (
          <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, display: 'inline-block' }} />
            <span style={{ color: 'var(--muted)', fontSize: 9 }}>{l}</span>
          </span>
        ))}
      </div>

      {/* Counter list */}
      <div className="fade-up" style={{ animationDelay: '0.2s', flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '8px 20px 4px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--muted)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Counter</span>
          <span style={{ color: 'var(--muted)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Today / Δ Week</span>
        </div>
        {sorted.map(c => (
          <CounterRow key={c.identifier} counter={c} maxTotal={maxTotal} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
