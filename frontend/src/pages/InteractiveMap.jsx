import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Map as MapIcon, 
  Layers, 
  Navigation, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Building,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import LeafletMap from '../components/LeafletMap';

export default function InteractiveMap() {
  const { neighborhoods, results, settings, isOptimizing, executeOptimization, loadSampleData } = useApp();
  const navigate = useNavigate();

  const [showLines, setShowLines] = useState(true);
  const [showRadius, setShowRadius] = useState(true);
  const [warehouseFilter, setWarehouseFilter] = useState('all');

  const totalDemand = neighborhoods.reduce((sum, n) => sum + (n.daily_orders || 0), 0);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <MapIcon className="w-7 h-7 text-brand-400" />
            <span>Geographic Distribution Map</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-world geospatial map of demand nodes across Bengaluru. Circle radius scales with daily volume.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {neighborhoods.length === 0 && (
            <button
              onClick={loadSampleData}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample Data</span>
            </button>
          )}

          <button
            onClick={() => navigate('/optimize')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-brand-400" />
            <span>Settings & Sliders</span>
          </button>

          <button
            onClick={() => executeOptimization()}
            disabled={isOptimizing || neighborhoods.length === 0}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white shadow-md transition-all active:scale-95 disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? 'Recalculating...' : 'Run Optimization'}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Demand Nodes</span>
          <p className="text-xl font-bold text-white font-mono mt-0.5">{neighborhoods.length}</p>
          <span className="text-[10px] text-slate-500">Active Bengaluru hubs</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Total Daily Orders</span>
          <p className="text-xl font-bold text-cyan-400 font-mono mt-0.5">{totalDemand.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500">Orders/day scheduled</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Optimized Hubs</span>
          <p className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
            {results ? results.warehouses.length : 'Not Run'}
          </p>
          <span className="text-[10px] text-slate-500">
            {results ? `Max Capacity: ${settings.capacity_limit}/hub` : 'Awaiting engine run'}
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Radius Violations</span>
          <p className={`text-xl font-bold font-mono mt-0.5 ${
            results && results.summary.radius_violations_count > 0 ? 'text-rose-400' : 'text-slate-200'
          }`}>
            {results ? results.summary.radius_violations_count : 0}
          </p>
          <span className="text-[10px] text-slate-500">
            Perimeter: &gt; {settings.max_delivery_radius_km} km
          </span>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative">
        <LeafletMap
          neighborhoods={neighborhoods}
          results={results}
          maxDeliveryRadiusKm={settings.max_delivery_radius_km}
          showLines={showLines}
          showRadiusRings={showRadius}
          filterWarehouseId={warehouseFilter}
          height="620px"
        />
      </div>

      {/* Map Insight Callout */}
      {results && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Optimized layout achieved <strong>{results.before_after.delivery_cost_saved_pct}%</strong> delivery cost reduction and saved <strong>{results.before_after.distance_saved_km} km</strong> compared to single-hub geometric median.
            </span>
          </div>

          <button
            onClick={() => navigate('/results')}
            className="text-brand-400 hover:text-brand-300 font-semibold underline shrink-0"
          >
            View Complete Analytics & Trade-off Curve →
          </button>
        </div>
      )}

    </div>
  );
}
