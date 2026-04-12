// ─────────────────────────────────────────────────────────
// Campus Navigate – Interactive campus map with routing
// Works for everyone (no login required)
// ─────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons for Leaflet + bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ── Campus Data ─────────────────────────────────────────
const CAMPUS_CENTER = [26.8575, 80.9380];
const CAMPUS_ZOOM = 17;

// Campus boundary polygon (approximate)
const CAMPUS_BOUNDARY = [
  [26.8610, 80.9345],
  [26.8610, 80.9420],
  [26.8540, 80.9420],
  [26.8540, 80.9345],
];

const CATEGORY_STYLES = {
  entry:          { color: '#e53e3e', emoji: '🚪', bg: '#fff5f5' },
  academic:       { color: '#2b6cb0', emoji: '🏫', bg: '#ebf8ff' },
  sports:         { color: '#38a169', emoji: '🏟️', bg: '#f0fff4' },
  facility:       { color: '#805ad5', emoji: '🏛️', bg: '#faf5ff' },
  landmark:       { color: '#d69e2e', emoji: '⛩️', bg: '#fffff0' },
  residential:    { color: '#dd6b20', emoji: '🏠', bg: '#fffaf0' },
  infrastructure: { color: '#718096', emoji: '🅿️', bg: '#f7fafc' },
  medical:        { color: '#e53e3e', emoji: '🏥', bg: '#fff5f5' },
};

const BUILDINGS = [
  { id: 'main_gate',    name: 'Main Gate',                        lat: 26.8555, lng: 80.9365, category: 'entry',          floor: 'Ground', info: 'Primary campus entrance near Garden Temple' },
  { id: 'a_block',      name: 'A-Block',                          lat: 26.8595, lng: 80.9375, category: 'academic',       floor: 'Multi-floor', info: 'School of Legal Studies, School of Computer Application, School of Management' },
  { id: 'main_block',   name: 'Main Block (Library & Labs)',       lat: 26.8560, lng: 80.9370, category: 'academic',       floor: 'Ground & 1st', info: 'August Section, Library, Computer Lab, Architecture Department' },
  { id: 'new_block',    name: 'New Block (Bidhut)',                lat: 26.8580, lng: 80.9400, category: 'academic',       floor: 'Multi-floor', info: 'School of Pharmacy, School of Management, IT Labs' },
  { id: 'stadium',      name: 'Dr. Akhilesh Das Gupta Stadium',   lat: 26.8565, lng: 80.9395, category: 'sports',         floor: 'Open', info: 'Main sports ground & athletic track' },
  { id: 'auditorium',   name: 'Auditorium',                       lat: 26.8580, lng: 80.9385, category: 'facility',       floor: 'Ground', info: 'Campus auditorium for events and seminars' },
  { id: 'temple',       name: 'Garden Temple',                    lat: 26.8553, lng: 80.9360, category: 'landmark',       floor: 'Open', info: 'Sacred temple near the main entrance' },
  { id: 'godown',       name: 'BBD Godown',                       lat: 26.8548, lng: 80.9365, category: 'infrastructure', floor: 'Ground', info: 'Campus storage and supply facility' },
  { id: 'hostel',       name: 'Hostel',                           lat: 26.8558, lng: 80.9400, category: 'residential',    floor: 'Multi-floor', info: 'Student residential quarters' },
  { id: 'parking',      name: 'Parking Area',                     lat: 26.8565, lng: 80.9375, category: 'infrastructure', floor: 'Open', info: 'Main vehicle parking zone' },
  { id: 'dental',       name: 'BBD Dental Hospital',              lat: 26.8600, lng: 80.9360, category: 'medical',        floor: 'Multi-floor', info: 'University dental college & hospital' },
  { id: 'h_block',      name: 'H-Block',                          lat: 26.8590, lng: 80.9365, category: 'academic',       floor: 'Multi-floor', info: 'BBD University H-Block — Engineering departments' },
  { id: 'ece_block',    name: 'Dept. of ECE & CS Engineering',    lat: 26.8585, lng: 80.9370, category: 'academic',       floor: '4th & 6th', info: 'Electronics, Communication & Computer Science Engineering' },
  { id: 'mba_hostel',   name: 'MBA Hostel',                       lat: 26.8552, lng: 80.9405, category: 'residential',    floor: 'Multi-floor', info: 'Hostel for MBA students' },
];

const MAIN_GATE = BUILDINGS.find(b => b.id === 'main_gate');

// ── Helper: check if point is inside campus ─────────────
function isInsideCampus(lat, lng) {
  // Simple bounding box check
  const lats = CAMPUS_BOUNDARY.map(p => p[0]);
  const lngs = CAMPUS_BOUNDARY.map(p => p[1]);
  return lat >= Math.min(...lats) && lat <= Math.max(...lats) &&
         lng >= Math.min(...lngs) && lng <= Math.max(...lngs);
}

// ── Custom marker icon creator ──────────────────────────
function createMarkerIcon(category) {
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.facility;
  return L.divIcon({
    className: 'campus-marker',
    html: `<div style="
      width: 36px; height: 36px; border-radius: 50%;
      background: ${style.color}; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; box-shadow: 0 3px 10px rgba(0,0,0,0.3);
      border: 3px solid white;
    ">${style.emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

// ── User location pulsing icon ──────────────────────────
const USER_ICON = L.divIcon({
  className: 'user-location-marker',
  html: `<div style="
    width: 20px; height: 20px; border-radius: 50%;
    background: #3182ce; border: 3px solid white;
    box-shadow: 0 0 0 8px rgba(49,130,206,0.25), 0 2px 8px rgba(0,0,0,0.3);
    animation: pulse-ring 1.5s ease-out infinite;
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// ── COMPONENT ───────────────────────────────────────────
export default function CampusNavigatePage({ onBack }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);

  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null); // { distance, time, viaGate }
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapReady, setMapReady] = useState(false);

  // ── Initialize Map ──────────────────────────────────
  useEffect(() => {
    if (mapInstanceRef.current) return; // already initialized

    const map = L.map(mapRef.current, {
      center: CAMPUS_CENTER,
      zoom: CAMPUS_ZOOM,
      zoomControl: false,
    });

    // Tile layer — clean CartoDB style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 20,
    }).addTo(map);

    // Zoom control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Campus boundary polygon
    L.polygon(CAMPUS_BOUNDARY, {
      color: '#b49359',
      weight: 2,
      dashArray: '8 4',
      fillColor: '#b49359',
      fillOpacity: 0.06,
    }).addTo(map);

    // Building markers
    BUILDINGS.forEach(bld => {
      const style = CATEGORY_STYLES[bld.category] || CATEGORY_STYLES.facility;
      const marker = L.marker([bld.lat, bld.lng], { icon: createMarkerIcon(bld.category) })
        .addTo(map);

      marker.bindPopup(`
        <div style="min-width:200px; font-family: 'Inter', system-ui, sans-serif;">
          <h3 style="margin:0 0 4px 0; font-size:14px; color:${style.color};">${style.emoji} ${bld.name}</h3>
          <p style="margin:0 0 4px 0; font-size:12px; color:#555;">${bld.info}</p>
          <div style="font-size:11px; color:#888; border-top:1px solid #eee; padding-top:4px; margin-top:4px;">
            📍 Floor: ${bld.floor} &nbsp;|&nbsp; 🏷️ ${bld.category}
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedBuilding(bld);
      });
    });

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // ── Watch User Position ─────────────────────────────
  const startLocating = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);

    navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPosition([latitude, longitude]);

        if (mapInstanceRef.current) {
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            userMarkerRef.current = L.marker([latitude, longitude], { icon: USER_ICON })
              .addTo(mapInstanceRef.current)
              .bindPopup('<b>📍 You are here</b>');
          }
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('Unable to access your location. Please enable GPS and try again.');
        setLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  }, []);

  // ── Route Calculation ───────────────────────────────
  const calculateRoute = useCallback((destination) => {
    if (!userPosition || !mapInstanceRef.current) {
      alert('Please enable your location first using the "📍 My Location" button.');
      return;
    }

    // Clear previous route
    if (routeLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    const map = mapInstanceRef.current;
    const insideCampus = isInsideCampus(userPosition[0], userPosition[1]);
    const viaGate = !insideCampus;

    // Build waypoints
    const waypoints = [];
    waypoints.push(L.latLng(userPosition[0], userPosition[1]));
    if (viaGate) {
      waypoints.push(L.latLng(MAIN_GATE.lat, MAIN_GATE.lng));
    }
    waypoints.push(L.latLng(destination.lat, destination.lng));

    // Use Leaflet Routing Machine
    import('leaflet-routing-machine').then(() => {
      const routeControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        show: false,             // hide default itinerary panel
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        lineOptions: {
          styles: [{ color: '#b49359', weight: 5, opacity: 0.85 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0,
        },
        createMarker: () => null, // don't add extra markers
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'foot',
        }),
      }).addTo(map);

      routeControl.on('routesfound', (e) => {
        const route = e.routes[0];
        const distKm = (route.summary.totalDistance / 1000).toFixed(2);
        const timeMin = Math.ceil(route.summary.totalTime / 60);
        setRouteInfo({ distance: distKm, time: timeMin, viaGate });
      });

      routeLayerRef.current = routeControl;
    });
  }, [userPosition]);

  // ── Filtered buildings for search ───────────────────
  const filteredBuildings = BUILDINGS.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.info.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Fly to building on selection ────────────────────
  useEffect(() => {
    if (selectedBuilding && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedBuilding.lat, selectedBuilding.lng], 18, { duration: 0.8 });
    }
  }, [selectedBuilding]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '85vh' }}>
      {/* ── CSS for pulse animation ─── */}
      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(49,130,206,0.5), 0 2px 8px rgba(0,0,0,0.3); }
          70% { box-shadow: 0 0 0 15px rgba(49,130,206,0), 0 2px 8px rgba(0,0,0,0.3); }
          100% { box-shadow: 0 0 0 0 rgba(49,130,206,0), 0 2px 8px rgba(0,0,0,0.3); }
        }
        .campus-marker { background: transparent !important; border: none !important; }
        .leaflet-routing-container { display: none !important; }
      `}</style>

      {/* ── Map Container ─── */}
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '85vh', borderRadius: '12px', overflow: 'hidden' }} />

      {/* ── Controls Panel (Top-Left) ─── */}
      <div style={{
        position: 'absolute', top: '1rem', left: '1rem', zIndex: 1000,
        width: '320px', maxHeight: 'calc(100% - 2rem)', display: 'flex', flexDirection: 'column', gap: '0.5rem',
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
          borderRadius: '12px', padding: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
            {onBack && (
              <button onClick={onBack} style={{
                background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '0.2rem',
              }}>←</button>
            )}
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#2a241a' }}>🗺️ BBD Campus Navigator</h2>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search buildings, departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #e2e2e2',
              borderRadius: '8px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
              background: '#fafafa',
            }}
          />

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
            <button
              onClick={startLocating}
              disabled={locating}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: locating ? '#38a169' : '#3182ce', color: 'white', fontWeight: 600, fontSize: '0.8rem',
              }}
            >
              {locating ? '✅ GPS Active' : '📍 My Location'}
            </button>
            {selectedBuilding && userPosition && (
              <button
                onClick={() => calculateRoute(selectedBuilding)}
                style={{
                  flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: '#b49359', color: 'white', fontWeight: 600, fontSize: '0.8rem',
                }}
              >
                🧭 Navigate
              </button>
            )}
          </div>
        </div>

        {/* Building List */}
        <div style={{
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
          borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          maxHeight: '350px', overflowY: 'auto',
        }}>
          {filteredBuildings.map(bld => {
            const style = CATEGORY_STYLES[bld.category];
            const isSelected = selectedBuilding?.id === bld.id;
            return (
              <button
                key={bld.id}
                onClick={() => setSelectedBuilding(bld)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%',
                  padding: '0.7rem 1rem', border: 'none', borderBottom: '1px solid #f0f0f0',
                  background: isSelected ? style.bg : 'transparent',
                  cursor: 'pointer', textAlign: 'left',
                  borderLeft: isSelected ? `4px solid ${style.color}` : '4px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{
                  width: '32px', height: '32px', borderRadius: '8px', background: style.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0,
                }}>{style.emoji}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2a241a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {bld.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {bld.info}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Route Info Card (Bottom-Center) ─── */}
      {routeInfo && (
        <div style={{
          position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
          borderRadius: '12px', padding: '1rem 1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '1.5rem', minWidth: '320px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b49359' }}>{routeInfo.distance} km</div>
            <div style={{ fontSize: '0.75rem', color: '#888' }}>Distance</div>
          </div>
          <div style={{ width: '1px', height: '40px', background: '#e2e2e2' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2a241a' }}>{routeInfo.time} min</div>
            <div style={{ fontSize: '0.75rem', color: '#888' }}>Walking</div>
          </div>
          {routeInfo.viaGate && (
            <>
              <div style={{ width: '1px', height: '40px', background: '#e2e2e2' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e53e3e' }}>🚪 Via Main Gate</div>
                <div style={{ fontSize: '0.7rem', color: '#888' }}>You're outside campus</div>
              </div>
            </>
          )}
          <button
            onClick={() => {
              if (routeLayerRef.current && mapInstanceRef.current) {
                mapInstanceRef.current.removeControl(routeLayerRef.current);
                routeLayerRef.current = null;
              }
              setRouteInfo(null);
            }}
            style={{
              background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer',
              color: '#aaa', marginLeft: 'auto',
            }}
          >✕</button>
        </div>
      )}

      {/* ── Legend (Bottom-Right) ─── */}
      <div style={{
        position: 'absolute', bottom: '1.5rem', right: '1rem', zIndex: 1000,
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
        borderRadius: '10px', padding: '0.7rem 1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        fontSize: '0.72rem',
      }}>
        <div style={{ fontWeight: 700, marginBottom: '0.3rem', color: '#2a241a' }}>Legend</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.2rem 0.8rem' }}>
          {Object.entries(CATEGORY_STYLES).map(([key, val]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>{val.emoji}</span>
              <span style={{ color: '#555', textTransform: 'capitalize' }}>{key}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
