import { useState, useEffect } from 'react';
import { useCyclingData } from './hooks/useCyclingData';
import CamdenMap from './components/CamdenMap';
import StatsPanel from './components/StatsPanel';
import CounterDetail from './components/CounterDetail';

const PANEL_W = 360;
const TAB_W   = 28;

export default function App() {
  const { loading, error, counters, boroughSeries, latestDate } = useCyclingData();
  const [selected, setSelected]   = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setPanelOpen(true), 500);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)' }}
           className="h-full flex flex-col items-center justify-center gap-4">
        <div style={{
          width: 36, height: 36,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading cycling data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: 'var(--bg)', fontFamily: 'var(--font-body)' }}
           className="h-full flex items-center justify-center">
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <p style={{ color: 'var(--down)', fontWeight: 600, fontSize: 16 }}>Couldn't load data</p>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>{error}</p>
        </div>
      </div>
    );
  }

  const dateLabel = latestDate
    ? new Date(latestDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 20px',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexShrink: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        {/* Bike icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/>
          <circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
        </svg>

        <h1 style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: 17,
          color: 'var(--text)',
          margin: 0,
          lineHeight: 1,
        }}>
          Camden Cycling Dashboard
        </h1>

        <div style={{ width: 1, height: 18, background: 'var(--border)', flexShrink: 0 }} />

        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div className="live-dot" style={{
            position: 'relative',
            width: 8, height: 8,
            borderRadius: '50%',
            background: 'var(--accent)',
            flexShrink: 0,
          }} />
          <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}>Live</span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>{counters.length} counters</span>
          {dateLabel && (
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>{dateLabel}</span>
          )}
        </div>
      </header>

      {/* ── Main content ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* Map */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <CamdenMap
            counters={counters}
            selectedId={selected?.identifier}
            onSelect={setSelected}
            panelOpen={panelOpen}
          />
        </div>

        {/* Panel wrapper */}
        <div style={{
          position: 'relative',
          width: panelOpen ? PANEL_W : TAB_W,
          flexShrink: 0,
          minHeight: 0,
          transition: 'width 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'visible',
        }}>

          {/* Pull tab */}
          <button
            onClick={() => setPanelOpen(o => !o)}
            aria-label={panelOpen ? 'Hide panel' : 'Show panel'}
            style={{
              position: 'absolute',
              left: 0, top: 0, bottom: 0,
              width: TAB_W,
              background: 'var(--surface)',
              borderLeft: '1px solid var(--border)',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              zIndex: 10,
              padding: 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
          >
            <svg width="10" height="10" viewBox="0 0 10 10"
              style={{
                transform: panelOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
                flexShrink: 0,
              }}
            >
              <polyline points="3,2 7,5 3,8" fill="none"
                stroke="var(--muted)" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            <span style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.1em',
              color: 'var(--muted)',
              fontFamily: 'var(--font-body)',
              userSelect: 'none',
            }}>
              {panelOpen ? 'Hide' : 'Stats'}
            </span>
          </button>

          {/* Sliding panel content */}
          <div style={{
            position: 'absolute',
            left: TAB_W, top: 0, bottom: 0,
            width: PANEL_W - TAB_W,
            transform: panelOpen ? 'translateX(0)' : `translateX(${PANEL_W}px)`,
            transition: 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
            background: 'var(--surface)',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '-2px 0 12px rgba(0,0,0,0.06)',
          }}>
            {selected ? (
              <CounterDetail
                counter={selected}
                latestDate={latestDate}
                onClose={() => setSelected(null)}
              />
            ) : (
              <StatsPanel
                counters={counters}
                boroughSeries={boroughSeries}
                latestDate={latestDate}
                onSelect={setSelected}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
