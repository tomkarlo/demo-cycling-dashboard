import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { formatCount, formatPct, friendlyName } from '../lib/utils';

const CAMDEN_CENTER = [51.541, -0.143];
const ZOOM = 13;

function markerFill(weekPct) {
  if (weekPct == null) return '#94a3b8';
  if (weekPct > 10)   return '#16a34a';
  if (weekPct < -10)  return '#dc2626';
  return '#d97706';
}

function MapResizer({ panelOpen }) {
  const map = useMap();
  useEffect(() => {
    const DURATION = 420;
    const start = Date.now();
    let raf;
    function tick() {
      map.invalidateSize({ animate: false, pan: false });
      if (Date.now() - start < DURATION) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [panelOpen, map]);
  return null;
}

export default function CamdenMap({ counters, selectedId, onSelect, panelOpen }) {
  return (
    <MapContainer
      center={CAMDEN_CENTER}
      zoom={ZOOM}
      className="h-full w-full"
      zoomControl={true}
    >
      <MapResizer panelOpen={panelOpen} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {counters.map((c) => {
        const fill = markerFill(c.weekPct);
        const isSelected = c.identifier === selectedId;

        return (
          <CircleMarker
            key={c.identifier}
            center={[c.lat, c.lng]}
            radius={isSelected ? 13 : 9}
            pathOptions={{
              color: '#ffffff',
              fillColor: fill,
              fillOpacity: isSelected ? 1 : 0.85,
              weight: isSelected ? 3 : 2,
            }}
            eventHandlers={{ click: () => onSelect(c) }}
          >
            <Tooltip direction="top" offset={[0, -10]}>
              <div style={{ fontFamily: 'var(--font-body)', minWidth: 150 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>
                  {friendlyName(c.name)}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>
                  {formatCount(c.total)}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>cyclists today</div>
                {c.weekPct != null && (
                  <div style={{ color: fill, marginTop: 6, fontSize: 12, fontWeight: 500 }}>
                    {c.weekPct > 0 ? '↑' : '↓'} {formatPct(Math.abs(c.weekPct))} vs last week
                  </div>
                )}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
