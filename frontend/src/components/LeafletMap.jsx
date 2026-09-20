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
import { Layers, AlertTriangle, Building, Navigation } from 'lucide-react';

// Center of Bengaluru
const BENGALURU_CENTER = [12.9716, 77.5946];

// Helper to re-center map dynamically when markers change
function MapRecenter({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      } catch (e) {
        // Fallback
      }
    }
  }, [bounds, map]);
  return null;
}

// Generate clean, solid DivIcon for Warehouses (No heavy neon blur)
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
        width: 32px;
        height: 32px;
        background: ${color};
        border: 2px solid ${isOverCapacity ? '#dc2626' : '#ffffff'};
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        cursor: pointer;
      ">
        <span style="
          color: #ffffff;
          font-weight: 800;
          font-size: 13px;
          font-family: monospace;
        ">${char}</span>
        <div style="
          position: absolute;
          bottom: -5px;
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid ${color};
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
}

export default function LeafletMap({
  neighborhoods = [],
  results = null,
  maxDeliveryRadiusKm = 15,
  showLines = true,
  showRadiusRings = true,
  filterWarehouseId = 'all',
  height = '500px'
}) {
  const [internalShowLines, setInternalShowLines] = useState(showLines);
  const [internalShowRadius, setInternalShowRadius] = useState(showRadiusRings);
  const [activeFilter, setActiveFilter] = useState(filterWarehouseId);

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
    <div className="relative w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-50" style={{ height }}>
      
      {/* Map Control Bar: Crisp Light Theme */}
      <div className="absolute top-3 right-3 z-[400] flex flex-wrap items-center gap-1.5 bg-white/95 p-1.5 rounded-md border border-slate-200 shadow-sm text-xs">
        <button
          onClick={() => setInternalShowLines(!internalShowLines)}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
            internalShowLines
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
          title="Toggle Assignment Routes"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Routes</span>
        </button>

        <button
          onClick={() => setInternalShowRadius(!internalShowRadius)}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
            internalShowRadius
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
          title="Toggle Max Delivery Radius Perimeter"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Radius ({maxDeliveryRadiusKm}km)</span>
        </button>

        {results && results.warehouses && results.warehouses.length > 1 && (
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="bg-white text-slate-800 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
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

      {/* Map Visual Legend: Crisp Light Box */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 px-3 py-2 rounded-md border border-slate-200 shadow-sm text-[11px] space-y-1 hidden sm:block">
        <div className="font-bold text-slate-800 flex items-center space-x-1 mb-1">
          <Building className="w-3 h-3 text-blue-600" />
          <span>Map Visual Legend</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
          <span className="text-slate-600">Fulfillment Hub Pin (A, B, C...)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
          <span className="text-slate-600">Neighborhood (Size = Daily Volume)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
          <span className="text-rose-700 font-medium">Radius Violation (&gt; {maxDeliveryRadiusKm} km)</span>
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

        {/* Clean CartoDB Voyager Light Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> & CartoDB'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* 1. Straight Lightweight Connection Lines */}
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
                color: assignment.is_radius_violation ? '#dc2626' : lineColor,
                weight: 1.5, // CHANGE 5: Lightweight straight line
                dashArray: assignment.is_overflow_reassigned ? '3, 4' : assignment.is_radius_violation ? '4, 4' : undefined,
                opacity: 0.85
              }}
            >
              <Tooltip sticky>
                <div className="text-xs font-sans">
                  <strong>{assignment.neighborhood_name}</strong> → {assignment.assigned_warehouse_name}<br />
                  Distance: <strong>{assignment.distance_km} km</strong> | Time: <strong>{assignment.delivery_time_mins} mins</strong>
                </div>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* 2. Warehouse Pins & Radius Range Rings */}
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
                  radius={maxDeliveryRadiusKm * 1000}
                  pathOptions={{
                    color: ringColor,
                    weight: 1.2,
                    dashArray: '4, 6',
                    fillColor: ringColor,
                    fillOpacity: 0.05
                  }}
                />
              )}

              {/* Warehouse Pin */}
              <Marker
                position={[wh.lat, wh.lng]}
                icon={createWarehouseIcon(idx, wh.name, wh.is_over_capacity)}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 space-y-1 text-xs text-slate-800 font-sans">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1 font-bold text-slate-900">
                      <span>{wh.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        Hub #{wh.id}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Orders Assigned:</span>{' '}
                      <strong>{wh.total_orders_assigned.toLocaleString()}</strong> / {wh.capacity_limit.toLocaleString()}
                    </div>
                    <div>
                      <span className="text-slate-500">Utilization:</span>{' '}
                      <strong className={wh.utilization_pct > 90 ? 'text-amber-600' : 'text-emerald-600'}>
                        {wh.utilization_pct}%
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Serves:</span>{' '}
                      <strong>{wh.assigned_neighborhood_count} Neighborhoods</strong>
                    </div>
                    {wh.is_over_capacity && (
                      <div className="p-1 bg-rose-50 text-rose-800 rounded border border-rose-200 text-[11px] font-semibold flex items-center space-x-1">
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

        {/* 3. Neighborhood Demand Markers */}
        {neighborhoods.map((n) => {
          const assignment = assignmentMap[n.id];
          
          if (activeFilter !== 'all' && assignment && String(assignment.assigned_warehouse_id) !== activeFilter) {
            return null;
          }

          const radiusSize = Math.max(5, Math.min(14, Math.sqrt(n.daily_orders) / 4.8));
          const whIndex = assignment ? assignment.assigned_warehouse_id - 1 : 0;
          const clusterColor = assignment ? WAREHOUSE_COLORS[whIndex % WAREHOUSE_COLORS.length] : '#2563eb';

          const isViolation = assignment?.is_radius_violation;
          const isOverflow = assignment?.is_overflow_reassigned;

          return (
            <React.Fragment key={`nh-group-${n.id}`}>
              {/* Subtle steady ring if radius violated */}
              {isViolation && (
                <CircleMarker
                  center={[n.lat, n.lng]}
                  radius={radiusSize + 5}
                  pathOptions={{
                    color: '#dc2626',
                    weight: 1.5,
                    dashArray: '2, 3',
                    fillColor: 'transparent'
                  }}
                />
              )}

              <CircleMarker
                center={[n.lat, n.lng]}
                radius={radiusSize}
                pathOptions={{
                  color: isViolation ? '#dc2626' : isOverflow ? '#d97706' : clusterColor,
                  weight: 2,
                  fillColor: isViolation ? '#dc2626' : isOverflow ? '#d97706' : clusterColor,
                  fillOpacity: 0.8
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 space-y-1 text-xs text-slate-800 font-sans">
                    <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                      {n.name}
                    </div>
                    <div>
                      <span className="text-slate-500">Daily Demand:</span>{' '}
                      <strong className="text-blue-600">{n.daily_orders.toLocaleString()} orders</strong>
                    </div>

                    {assignment && (
                      <>
                        <div className="pt-1 border-t border-slate-100">
                          <span className="text-slate-500">Assigned Hub:</span>{' '}
                          <strong>{assignment.assigned_warehouse_name}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Haversine Distance:</span>{' '}
                          <strong className="font-mono">{assignment.distance_km} km</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Transit Duration:</span>{' '}
                          <strong className="font-mono">{assignment.delivery_time_mins} mins</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Daily Delivery Cost:</span>{' '}
                          <strong className="font-mono text-emerald-700">₹{assignment.delivery_cost_daily.toLocaleString()}</strong>
                        </div>

                        {isViolation && (
                          <div className="p-1 bg-rose-50 text-rose-800 rounded border border-rose-200 text-[11px] font-semibold">
                            Radius Violation (+{assignment.radius_overshoot_km} km)
                          </div>
                        )}

                        {isOverflow && (
                          <div className="p-1 bg-amber-50 text-amber-800 rounded border border-amber-200 text-[11px] font-semibold">
                            Overflow Reassigned
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
