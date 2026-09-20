import React, { useState, useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Circle, 
  Polyline, 
  Tooltip,
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Sparkles, 
  Radio, 
  Truck, 
  Layers,
  ShieldCheck
} from 'lucide-react';

// Standard overview hubs (Not tied to user data)
const STANDARD_HUBS = [
  {
    id: 'hub-alpha',
    name: 'Alpha Hub (North Fulfillment)',
    code: 'A',
    lat: 13.038,
    lng: 77.589,
    capacity: 5500,
    radiusKm: 11.5,
    color: '#3b82f6', // Royal Blue
    clusters: [
      { name: 'Hebbal Corridors', lat: 13.035, lng: 77.597, orders: 1200 },
      { name: 'Peenya Industrial Area', lat: 13.028, lng: 77.525, orders: 1800 },
      { name: 'Yelahanka Satellite', lat: 13.100, lng: 77.596, orders: 1400 },
      { name: 'Sahakar Nagar Point', lat: 13.062, lng: 77.590, orders: 1100 }
    ]
  },
  {
    id: 'hub-beta',
    name: 'Beta Hub (East Corridor)',
    code: 'B',
    lat: 12.975,
    lng: 77.695,
    capacity: 6500,
    radiusKm: 13.0,
    color: '#06b6d4', // Cyan
    clusters: [
      { name: 'Whitefield Tech Park', lat: 12.969, lng: 77.749, orders: 2400 },
      { name: 'Marathahalli Junction', lat: 12.955, lng: 77.701, orders: 1900 },
      { name: 'KR Puram Freight Center', lat: 13.007, lng: 77.695, orders: 1100 },
      { name: 'Indiranagar Urban Node', lat: 12.978, lng: 77.640, orders: 1100 }
    ]
  },
  {
    id: 'hub-gamma',
    name: 'Gamma Hub (South Industrial)',
    code: 'C',
    lat: 12.905,
    lng: 77.615,
    capacity: 5000,
    radiusKm: 10.5,
    color: '#10b981', // Emerald
    clusters: [
      { name: 'Electronic City Corridor', lat: 12.845, lng: 77.660, orders: 2100 },
      { name: 'HSR Fast Delivery Node', lat: 12.912, lng: 77.644, orders: 1500 },
      { name: 'BTM Ring Road Hub', lat: 12.916, lng: 77.610, orders: 1400 }
    ]
  }
];

const DEFAULT_CENTER = [12.9716, 77.6250];

// Custom DivIcon for standard hubs
function createStandardHubIcon(hub) {
  return L.divIcon({
    className: 'standard-hub-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
        <!-- Pulsing radar ring -->
        <div style="
          position: absolute;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: ${hub.color};
          opacity: 0.35;
          animation: radar-ripple 2.2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        "></div>
        <!-- Solid core pin -->
        <div style="
          position: relative;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${hub.color};
          border: 2px solid #ffffff;
          box-shadow: 0 0 12px ${hub.color}80, 0 4px 10px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 800;
          font-size: 13px;
          font-family: monospace;
        ">
          ${hub.code}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
}

// Custom DivIcon for customer demand nodes
function createClusterNodeIcon(color) {
  return L.divIcon({
    className: 'cluster-node-dot',
    html: `
      <div style="
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #ffffff;
        border: 2px solid ${color};
        box-shadow: 0 0 8px ${color};
      "></div>
    `,
    iconSize: [10, 10],
    iconAnchor: [5, 5]
  });
}

// Controller component inside MapContainer for camera panning loop
function VideoCameraController({ isPlaying, currentFocusIndex }) {
  const map = useMap();

  useEffect(() => {
    if (!isPlaying) return;

    // Pan camera smoothly based on focus target
    if (currentFocusIndex === -1) {
      map.flyTo(DEFAULT_CENTER, 11, { duration: 2.5, easeLinearity: 0.25 });
    } else {
      const target = STANDARD_HUBS[currentFocusIndex];
      if (target) {
        map.flyTo([target.lat, target.lng], 12.2, { duration: 3.0, easeLinearity: 0.25 });
      }
    }
  }, [isPlaying, currentFocusIndex, map]);

  return null;
}

export default function DemoMapVideo() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoProgress, setVideoProgress] = useState(14); // seconds (0-60)
  const [activeHubIndex, setActiveHubIndex] = useState(-1); // -1 = Overview, 0 = Alpha, 1 = Beta, 2 = Gamma
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Auto-progress video loop & camera switcher
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setVideoProgress((prev) => {
        const next = (prev + 1) % 60;
        // Switch focal hub every 15 seconds
        if (next === 0) setActiveHubIndex(-1);
        else if (next === 15) setActiveHubIndex(0);
        else if (next === 30) setActiveHubIndex(1);
        else if (next === 45) setActiveHubIndex(2);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formattedTime = `00:${videoProgress < 10 ? '0' : ''}${videoProgress}`;

  return (
    <div 
      ref={containerRef}
      className="relative rounded-3xl sm:rounded-[36px] overflow-hidden demo-video-box border border-slate-800 shadow-2xl w-full h-[460px] sm:h-[530px] bg-slate-950 group select-none"
    >
      {/* 1. Interactive Leaflet Map Layer */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={11}
          zoomControl={false}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', background: '#090d16' }}
        >
          {/* Dark Matrix CartoDB Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            maxZoom={18}
          />

          <VideoCameraController isPlaying={isPlaying} currentFocusIndex={activeHubIndex} />

          {/* Render Standard Hubs, Coverage Circles, Delivery Routes, and Nodes */}
          {STANDARD_HUBS.map((hub) => (
            <React.Fragment key={hub.id}>
              {/* Warehouse Coverage Boundary Circle */}
              <Circle
                center={[hub.lat, hub.lng]}
                radius={hub.radiusKm * 1000}
                pathOptions={{
                  color: hub.color,
                  fillColor: hub.color,
                  fillOpacity: 0.08,
                  weight: 1.5,
                  dashArray: '4 6'
                }}
              />

              {/* Warehouse Pin Marker */}
              <Marker
                position={[hub.lat, hub.lng]}
                icon={createStandardHubIcon(hub)}
              >
                <Tooltip direction="top" offset={[0, -20]} opacity={0.95} permanent={false}>
                  <div className="text-xs p-1 text-slate-900">
                    <strong className="block font-bold">{hub.name}</strong>
                    <span className="text-slate-500 font-mono text-[11px]">
                      Standard Capacity: {hub.capacity.toLocaleString()} orders/day
                    </span>
                  </div>
                </Tooltip>
              </Marker>

              {/* Delivery Routes & Nodes */}
              {hub.clusters.map((cluster, cIdx) => (
                <React.Fragment key={`${hub.id}-cluster-${cIdx}`}>
                  {/* Animated Transit Polyline */}
                  <Polyline
                    positions={[
                      [hub.lat, hub.lng],
                      [cluster.lat, cluster.lng]
                    ]}
                    pathOptions={{
                      color: hub.color,
                      weight: 2,
                      opacity: 0.75,
                      className: 'animated-route-flow'
                    }}
                  />
                  {/* Cluster Point Node */}
                  <Marker
                    position={[cluster.lat, cluster.lng]}
                    icon={createClusterNodeIcon(hub.color)}
                  >
                    <Tooltip direction="right" offset={[8, 0]}>
                      <span className="text-[11px] font-sans text-slate-800">
                        {cluster.name} ({cluster.orders} orders)
                      </span>
                    </Tooltip>
                  </Marker>
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </MapContainer>
      </div>

      {/* 2. CRT Scanline & Ambient Overlay */}
      <div className="absolute inset-0 video-scanline opacity-25 pointer-events-none z-10" />

      {/* 3. Top HUD: Recording Indicator, Title & View Switcher */}
      <div className="absolute top-4 inset-x-4 sm:inset-x-6 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Recording & Status Badge */}
        <div className="flex items-center space-x-2.5 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg pointer-events-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 ${isPlaying ? 'block' : 'hidden'}`}></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="text-[11px] font-mono tracking-wider font-bold text-white uppercase">
            {isPlaying ? 'DEMO VIDEO • OVERVIEW' : 'DEMO PAUSED'}
          </span>
          <span className="text-white/30">|</span>
          <span className="text-[10px] text-slate-300 font-medium hidden sm:inline">
            3-Hub Standard Metropolitan Topology
          </span>
        </div>

        {/* Right: Hub View Focus Switcher */}
        <div className="hidden sm:flex items-center space-x-1.5 bg-slate-950/80 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-lg pointer-events-auto">
          <button
            onClick={() => setActiveHubIndex(-1)}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
              activeHubIndex === -1 ? 'bg-white text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Overview
          </button>
          {STANDARD_HUBS.map((hub, idx) => (
            <button
              key={hub.id}
              onClick={() => setActiveHubIndex(idx)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                activeHubIndex === idx ? 'bg-blue-600 text-white font-bold shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Hub {hub.code}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Live Telemetry HUD (Floating Bottom Left) */}
      <div className="absolute bottom-20 left-4 sm:left-6 z-20 pointer-events-none hidden sm:block">
        <div className="bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shadow-lg text-[11px] text-slate-300 space-y-1">
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Telemetry Simulation Feed</span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span>Cap: <strong className="text-white">17,000 / day</strong></span>
            <span>Avg Transit: <strong className="text-emerald-400">18.4 min</strong></span>
            <span>Efficiency: <strong className="text-blue-400">96.8%</strong></span>
          </div>
        </div>
      </div>

      {/* 5. Bottom Video Control Bar: Scrubber, Play/Pause & Actions */}
      <div className="absolute bottom-4 inset-x-4 sm:inset-x-6 z-20 pointer-events-auto">
        <div className="bg-slate-950/90 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:px-4 sm:py-2.5 shadow-2xl flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-950 flex items-center justify-center shadow transition-all active:scale-90 shrink-0 cursor-pointer"
            title={isPlaying ? 'Pause Demo' : 'Play Demo'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-slate-950" /> : <Play className="w-3.5 h-3.5 fill-slate-950 ml-0.5" />}
          </button>

          {/* Time & Timeline Scrubber */}
          <div className="flex-1 flex items-center space-x-3">
            <span className="text-[11px] font-mono text-slate-300 shrink-0">
              {formattedTime} / 01:00
            </span>
            {/* Scrubber track */}
            <div 
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = Math.max(0, Math.min(1, clickX / rect.width));
                setVideoProgress(Math.round(pct * 60));
              }}
              className="flex-1 h-1.5 bg-white/20 hover:h-2 rounded-full overflow-hidden cursor-pointer transition-all relative"
            >
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${(videoProgress / 60) * 100}%` }}
              />
            </div>
          </div>

          {/* Quality & Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-slate-300 border border-white/15">
              4K 60FPS
            </span>
            <button
              onClick={() => {
                setVideoProgress(0);
                setActiveHubIndex(-1);
                setIsPlaying(true);
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Restart Demo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
