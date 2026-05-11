import { useState } from 'react';
import { useCyclingData } from './hooks/useCyclingData';
import CamdenMap from './components/CamdenMap';
import StatsPanel from './components/StatsPanel';
import CounterDetail from './components/CounterDetail';

const PANEL_W = 360;
const TAB_W   = 28;

export default function App() {
  const { loading, error, counters, boroughSeries, latestDate } = useCyclingData();
  const [selected, setSelected]     = useState(null);
  // Start closed on narrow viewports so the map is immediately visible
  const [panelOpen, setPanelOpen]   = useState(() => window.innerWidth >= 768);

  if (loading) {
    return (
      <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}
           className="h-full flex flex-col items-center justify-center gap-4">
        <div style={{ position: 'relative', width: 36, height: 36 }}>
          <div style={{
            width: '100%', height: '100%',
            border: '2px solid var(--border2)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Loading Camden data
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}
           className="h-full flex items-center justify-center">
        <div className="text-center" style={{ maxWidth: 320 }}>
          <p style={{ color: 'var(--down)', fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '0.05em' }}>
            DATA UNAVAILABLE
          </p>
          <p style={{ color: 'var(--muted)', fontSize: 11, marginTop: 8 }}>{error}</p>
        </div>
      </div>
    );
  }

  const dateLabel = latestDate
    ? new Date(latestDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()
    : '';

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 20px',
        height: 44,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexShrink: 0,
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          letterSpacing: '0.08em',
          color: 'var(--text)',
          margin: 0,
          lineHeight: 1,
        }}>
          CAMDEN CYCLE MONITOR
        </h1>

        <div style={{ width: 1, height: 16, background: 'var(--border2)', flexShrink: 0 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div className="live-dot" style={{
            position: 'relative',
            width: 7, height: 7,
            borderRadius: '50%',
            background: 'var(--accent)',
            flexShrink: 0,
          }} />
          <span style={{ color: 'var(--accent)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Live
          </span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: 'var(--muted)', fontSize: 10, letterSpacing: '0.1em' }}>
            {counters.length} COUNTERS
          </span>
          <span style={{ color: 'var(--muted)', fontSize: 10, letterSpacing: '0.1em' }}>
            {dateLabel}
          </span>
        </div>
      </header>

      {/* ── Main content ── */}
      {/*
        overflow: hidden on the row prevents the sliding panel from creating
        a horizontal scrollbar during the open/close animation.
      */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* Map — grows to fill all available space */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <CamdenMap
            counters={counters}
            selectedId={selected?.identifier}
            onSelect={setSelected}
            panelOpen={panelOpen}
          />
        </div>

        {/*
          ── Panel wrapper ──
          This flex child collapses to TAB_W when the panel is closed, giving
          the map room to expand. overflow: visible allows the absolutely-
          positioned inner panel to slide off-screen to the right without
          clipping the tab itself.
        */}
        <div style={{
          position: 'relative',
          width: panelOpen ? PANEL_W : TAB_W,
          flexShrink: 0,
          minHeight: 0,
          transition: 'width 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'visible',
        }}>

          {/* ── Pull tab ── always at the left edge of the wrapper ── */}
          <button
            onClick={() => setPanelOpen(o => !o)}
            aria-label={panelOpen ? 'Hide panel' : 'Show panel'}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
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
            {/* Chevron */}
            <svg
              width="10" height="10"
              viewBox="0 0 10 10"
              style={{
                transform: panelOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
                flexShrink: 0,
              }}
            >
              <polyline
                points="3,2 7,5 3,8"
                fill="none"
                stroke="var(--muted)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Rotated label */}
            <span style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              fontSize: 9,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              fontFamily: 'var(--font-mono)',
              userSelect: 'none',
            }}>
              {panelOpen ? 'HIDE' : 'STATS'}
            </span>
          </button>

          {/*
            ── Sliding panel content ──
            Absolutely positioned, anchored to the right of the tab.
            Slides off-screen to the right when closed.
          */}
          <div style={{
            position: 'absolute',
            left: TAB_W,
            top: 0,
            bottom: 0,
            width: PANEL_W - TAB_W,
            transform: panelOpen ? 'translateX(0)' : `translateX(${PANEL_W}px)`,
            transition: 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
            background: 'var(--surface)',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
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
