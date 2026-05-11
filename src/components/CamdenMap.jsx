import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { markerColor, formatCount, formatPct, friendlyName } from '../lib/utils';

// Pumps invalidateSize() every animation frame for the duration of the panel
// transition so Leaflet reflows the canvas as the container grows/shrinks.
function MapResizer({ panelOpen }) {
  const map = useMap();
  useEffect(() => {
    const DURATION = 420; // slightly longer than the 0.38s CSS transition
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

const CAMDEN_CENTER = [51.541, -0.143];
const ZOOM = 13;

const MARKER_COLORS = {
  up: '#b4ff4d',
  down: '#ff3a56',
  neutral: '#f5a623',
  nodata: '#2a4060',
};

function getMarkerColor(weekPct) {
  if (weekPct == null) return MARKER_COLORS.nodata;
  if (weekPct > 10) return MARKER_COLORS.up;
  if (weekPct < -10) return MARKER_COLORS.down;
  return MARKER_COLORS.neutral;
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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {counters.map((c) => {
        const color = getMarkerColor(c.weekPct);
        const isSelected = c.identifier === selectedId;

        return (
          <CircleMarker
            key={c.identifier}
            center={[c.lat, c.lng]}
            radius={isSelected ? 13 : 9}
            pathOptions={{
              color: isSelected ? '#ffffff' : color,
              fillColor: color,
              fillOpacity: isSelected ? 1 : 0.8,
              weight: isSelected ? 2.5 : 1,
            }}
            eventHandlers={{ click: () => onSelect(c) }}
          >
            <Tooltip direction="top" offset={[0, -10]}>
              <div style={{ fontFamily: 'var(--font-mono)' }}>
                <div style={{ color: 'var(--accent)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
                  {friendlyName(c.name)}
                </div>
                <div style={{ fontSize: 15, fontFamily: 'var(--font-display)', letterSpacing: '0.05em', color: 'var(--text)' }}>
                  {formatCount(c.total)}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: 10, marginTop: 2 }}>cyclists today</div>
                {c.weekPct != null && (
                  <div style={{ color, marginTop: 4, fontSize: 11 }}>
                    {c.weekPct > 0 ? '↑' : '↓'} {formatPct(c.weekPct)} vs last week
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
