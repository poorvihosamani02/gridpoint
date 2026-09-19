import React, { useState, useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  CircleMarker,
  Polyline,
  Tooltip,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import { WAREHOUSE_COLORS } from '../utils/sampleData';
import { Layers, Eye, AlertTriangle, Building, Navigation } from 'lucide-react';

// Center of Bengaluru
const BENGALURU_CENTER = [12.9716, 77.5946];

// Helper to re-center map dynamically when markers change
function MapRecenter({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      } catch (e) {
        // Fallback
      }
    }
  }, [bounds, map]);
  return null;
}

// Generate custom DivIcon for Warehouses
function createWarehouseIcon(hubIndex, name, isOverCapacity) {
  const color = WAREHOUSE_COLORS[hubIndex % WAREHOUSE_COLORS.length];
  const char = String.fromCharCode(65 + hubIndex);

  return L.divIcon({
    className: 'custom-warehouse-pin',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        background: radial-gradient(circle, ${color} 0%, #0f172a 100%);
        border: 2.5px solid ${isOverCapacity ? '#ef4444' : '#ffffff'};
        border-radius: 50%;
        box-shadow: 0 4px 14px rgba(0,0,0,0.6), 0 0 12px ${color}88;
        cursor: pointer;
        transition: transform 0.2s;
      ">
        <span style="
          color: #ffffff;
          font-weight: 800;
          font-size: 14px;
          font-family: monospace;
          text-shadow: 0 1px 2px rgba(0,0,0,0.8);
        ">${char}</span>
        <div style="
          position: absolute;
          bottom: -6px;
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 7px solid #0f172a;
        "></div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
  });
}

export default function LeafletMap({
  neighborhoods = [],
  results = null,
  maxDeliveryRadiusKm = 15,
  showLines = true,
  showRadiusRings = true,
  filterWarehouseId = 'all',
  height = '600px'
}) {
  const [internalShowLines, setInternalShowLines] = useState(showLines);
  const [internalShowRadius, setInternalShowRadius] = useState(showRadiusRings);
  const [activeFilter, setActiveFilter] = useState(filterWarehouseId);

  // Sync props to state
  useEffect(() => {
    setInternalShowLines(showLines);
  }, [showLines]);

  useEffect(() => {
    setInternalShowRadius(showRadiusRings);
  }, [showRadiusRings]);

  // Compute map bounds to fit all points
  const bounds = useMemo(() => {
    const pts = [];
    neighborhoods.forEach((n) => {
      if (n.lat && n.lng) pts.push([n.lat, n.lng]);
    });
    if (results && results.warehouses) {
      results.warehouses.forEach((w) => {
        if (w.lat && w.lng) pts.push([w.lat, w.lng]);
      });
    }
    return pts.length > 0 ? pts : [BENGALURU_CENTER];
  }, [neighborhoods, results]);

  // Map assignments indexed by neighborhood ID
  const assignmentMap = useMemo(() => {
    if (!results || !results.assignments) return {};
    const map = {};
    results.assignments.forEach((a) => {
      map[a.neighborhood_id] = a;
    });
    return map;
  }, [results]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl" style={{ height }}>
      {/* Map Control Bar Overlay */}
      <div className="absolute top-4 right-4 z-[400] flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-lg text-xs">
        <button
          onClick={() => setInternalShowLines(!internalShowLines)}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
            internalShowLines
              ? 'bg-brand-500/20 text-brand-300 border-brand-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
          title="Toggle Hub-to-Neighborhood Routes"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Routes</span>
        </button>

        <button
          onClick={() => setInternalShowRadius(!internalShowRadius)}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
            internalShowRadius
              ? 'bg-brand-500/20 text-brand-300 border-brand-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
          title="Toggle Max Delivery Radius Range Rings"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Radius Rings ({maxDeliveryRadiusKm}km)</span>
        </button>

        {results && results.warehouses && results.warehouses.length > 1 && (
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Hubs ({results.warehouses.length})</option>
            {results.warehouses.map((wh) => (
              <option key={wh.id} value={String(wh.id)}>
                {wh.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md px-3 py-2.5 rounded-xl border border-slate-800 shadow-lg text-[11px] space-y-1.5 hidden sm:block">
        <div className="font-semibold text-slate-300 flex items-center space-x-1.5">
          <Building className="w-3.5 h-3.5 text-brand-400" />
          <span>Map Visual Legend</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full border border-white bg-slate-700 inline-block"></span>
          <span className="text-slate-400">Warehouse Hub Pin (A, B, C...)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
          <span className="text-slate-400">Neighborhood (Size = Daily Orders)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/50 inline-block"></span>
          <span className="text-rose-400 font-medium">Radius Violation (&gt; {maxDeliveryRadiusKm}km)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span className="text-amber-400 font-medium">Overflow Reassigned</span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <MapContainer
        center={BENGALURU_CENTER}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapRecenter bounds={bounds} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & CartoDB'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* 1. Render Connection Lines from Hub to Neighborhood */}
        {results && internalShowLines && results.assignments && results.assignments.map((assignment) => {
          if (activeFilter !== 'all' && String(assignment.assigned_warehouse_id) !== activeFilter) {
            return null;
          }

          const whIndex = assignment.assigned_warehouse_id - 1;
          const lineColor = WAREHOUSE_COLORS[whIndex % WAREHOUSE_COLORS.length];

          return (
            <Polyline
              key={`line-${assignment.neighborhood_id}-${assignment.assigned_warehouse_id}`}
              positions={[
                [assignment.warehouse_lat, assignment.warehouse_lng],
                [assignment.lat, assignment.lng]
              ]}
              pathOptions={{
                color: assignment.is_radius_violation ? '#ef4444' : lineColor,
                weight: assignment.is_radius_violation ? 2.5 : 1.8,
                dashArray: assignment.is_overflow_reassigned ? '4, 6' : assignment.is_radius_violation ? '6, 6' : undefined,
                opacity: 0.75
              }}
            >
              <Tooltip sticky>
                <div className="text-xs">
                  <strong>{assignment.neighborhood_name}</strong> → {assignment.assigned_warehouse_name}<br />
                  Distance: <strong>{assignment.distance_km} km</strong> | Time: <strong>{assignment.delivery_time_mins} mins</strong>
                </div>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* 2. Render Warehouse Markers & Coverage Radius Rings */}
        {results && results.warehouses && results.warehouses.map((wh, idx) => {
          if (activeFilter !== 'all' && String(wh.id) !== activeFilter) {
            return null;
          }

          const ringColor = WAREHOUSE_COLORS[idx % WAREHOUSE_COLORS.length];

          return (
            <React.Fragment key={`wh-group-${wh.id}`}>
              {/* Max Delivery Radius Ring */}
              {internalShowRadius && (
                <Circle
                  center={[wh.lat, wh.lng]}
                  radius={maxDeliveryRadiusKm * 1000} // Leaflet uses meters
                  pathOptions={{
                    color: ringColor,
                    weight: 1.5,
                    dashArray: '5, 8',
                    fillColor: ringColor,
                    fillOpacity: 0.04
                  }}
                />
              )}

              {/* Warehouse Pin Marker */}
              <Marker
                position={[wh.lat, wh.lng]}
                icon={createWarehouseIcon(idx, wh.name, wh.is_over_capacity)}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 space-y-1.5 text-xs text-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                      <span className="font-bold text-sm text-white flex items-center space-x-1">
                        <span>🏢</span>
                        <span>{wh.name}</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 border border-slate-700">
                        Hub #{wh.id}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Assigned Orders:</span>{' '}
                      <strong className="text-white">{wh.total_orders_assigned.toLocaleString()}</strong> / {wh.capacity_limit.toLocaleString()}
                    </div>
                    <div>
                      <span className="text-slate-400">Capacity Utilization:</span>{' '}
                      <strong className={wh.utilization_pct > 90 ? 'text-amber-400' : 'text-emerald-400'}>
                        {wh.utilization_pct}%
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Serving:</span>{' '}
                      <strong className="text-white">{wh.assigned_neighborhood_count} Neighborhoods</strong>
                    </div>
                    {wh.is_over_capacity && (
                      <div className="p-1 bg-rose-500/20 text-rose-300 rounded border border-rose-500/30 font-semibold flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Exceeds Target Capacity</span>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* 3. Render Neighborhood Demand Markers */}
        {neighborhoods.map((n) => {
          const assignment = assignmentMap[n.id];
          
          if (activeFilter !== 'all' && assignment && String(assignment.assigned_warehouse_id) !== activeFilter) {
            return null;
          }

          // Marker size scaled by daily order volume
          const radiusSize = Math.max(6, Math.min(16, Math.sqrt(n.daily_orders) / 4.5));

          const whIndex = assignment ? assignment.assigned_warehouse_id - 1 : 0;
          const clusterColor = assignment ? WAREHOUSE_COLORS[whIndex % WAREHOUSE_COLORS.length] : '#38bdf8';

          const isViolation = assignment?.is_radius_violation;
          const isOverflow = assignment?.is_overflow_reassigned;

          return (
            <React.Fragment key={`nh-group-${n.id}`}>
              {/* Outer pulsing ring if radius is violated */}
              {isViolation && (
                <CircleMarker
                  center={[n.lat, n.lng]}
                  radius={radiusSize + 7}
                  pathOptions={{
                    color: '#ef4444',
                    weight: 2,
                    dashArray: '3, 3',
                    fillColor: '#ef4444',
                    fillOpacity: 0.2
                  }}
                />
              )}

              <CircleMarker
                center={[n.lat, n.lng]}
                radius={radiusSize}
                pathOptions={{
                  color: isViolation ? '#ef4444' : isOverflow ? '#f59e0b' : clusterColor,
                  weight: 2.5,
                  fillColor: isViolation ? '#ef4444' : isOverflow ? '#f59e0b' : clusterColor,
                  fillOpacity: 0.75
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 space-y-1.5 text-xs text-slate-200">
                    <div className="font-bold text-sm text-white border-b border-slate-700 pb-1">
                      📍 {n.name}
                    </div>
                    <div>
                      <span className="text-slate-400">Daily Demand:</span>{' '}
                      <strong className="text-cyan-300">{n.daily_orders.toLocaleString()} orders/day</strong>
                    </div>

                    {assignment && (
                      <>
                        <div className="pt-1 border-t border-slate-800">
                          <span className="text-slate-400">Assigned Hub:</span>{' '}
                          <strong className="text-white">{assignment.assigned_warehouse_name}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Haversine Distance:</span>{' '}
                          <strong className="text-white font-mono">{assignment.distance_km} km</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Estimated Delivery Time:</span>{' '}
                          <strong className="text-white font-mono">{assignment.delivery_time_mins} mins</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Daily Delivery Cost:</span>{' '}
                          <strong className="text-white font-mono">₹{assignment.delivery_cost_daily.toLocaleString()}</strong>
                        </div>

                        {isViolation && (
                          <div className="p-1.5 bg-rose-500/20 text-rose-300 rounded border border-rose-500/30 font-semibold flex items-center space-x-1 text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Radius Constraint Violated (+{assignment.radius_overshoot_km} km)</span>
                          </div>
                        )}

                        {isOverflow && (
                          <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 font-semibold flex items-center space-x-1 text-[11px]">
                            <span>⚠️ Overflow Reassigned (Closest Hub Full)</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
