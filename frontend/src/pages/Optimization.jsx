import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sliders, 
  Building2, 
  Layers, 
  Truck, 
  Zap, 
  TrendingUp, 
  IndianRupee, 
  Compass, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Fuel,
  Info,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FLEET_INFO, TRAFFIC_INFO } from '../utils/sampleData';

export default function Optimization() {
  const { settings, updateSettings, neighborhoods, executeOptimization, isOptimizing, error, loadSampleData } = useApp();
  const navigate = useNavigate();

  const [localSettings, setLocalSettings] = useState(settings);

  // Sync and update
  const handleChange = (key, val) => {
    const updated = { ...localSettings, [key]: val };
    setLocalSettings(updated);
    updateSettings({ [key]: val });
  };

  const handleRun = async (e) => {
    e.preventDefault();
    if (neighborhoods.length === 0) {
      loadSampleData();
    }
    const res = await executeOptimization(localSettings);
    if (res) {
      navigate('/results');
    }
  };

  const selectedFleet = FLEET_INFO[localSettings.fleet_type] || FLEET_INFO.vans;
  const currentDemandMult = 1.0 + (localSettings.demand_modifier_pct / 100.0);
  const totalBaseOrders = neighborhoods.reduce((sum, n) => sum + (n.daily_orders || 0), 0);
  const totalEffectiveOrders = Math.round(totalBaseOrders * currentDemandMult);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <Sliders className="w-7 h-7 text-brand-400" />
            <span>Optimization Control Panel</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure algorithmic clustering parameters, capacity boundaries, fleet vehicle dynamics, and demand simulations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              const defaults = {
                num_warehouses: 3,
                capacity_limit: 5000,
                max_delivery_radius_km: 15.0,
                fleet_type: 'vans',
                traffic_condition: 'normal',
                demand_modifier_pct: 0,
                fixed_warehouse_cost_daily: 50000,
                cost_per_km_order: 1.5
              };
              setLocalSettings(defaults);
              updateSettings(defaults);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-all"
          >
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Error notification if any */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <Info className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <form onSubmit={handleRun} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Section 1: Warehouses & Capacity Limits */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">1. Multi-Warehouse & Capacity Constraints</h3>
                <p className="text-xs text-slate-400">Configure target fulfillment hubs and throughput boundaries.</p>
              </div>
            </div>

            {/* Warehouse count slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-300">Number of Warehouses (K):</label>
                <span className="font-mono text-brand-400 font-bold text-sm">{localSettings.num_warehouses} Hubs</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={localSettings.num_warehouses}
                onChange={(e) => handleChange('num_warehouses', parseInt(e.target.value, 10))}
                className="w-full accent-brand-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>1 (Central)</span>
                <span>2</span>
                <span>3 (Recommended)</span>
                <span>4</span>
                <span>5 (Max)</span>
              </div>
            </div>

            {/* Warehouse capacity slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-300">Max Warehouse Capacity Limit:</label>
                <span className="font-mono text-cyan-400 font-bold text-sm">
                  {localSettings.capacity_limit.toLocaleString()} orders/hub
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="12000"
                step="500"
                value={localSettings.capacity_limit}
                onChange={(e) => handleChange('capacity_limit', parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>1,000 orders</span>
                <span>Total Network Capacity: {(localSettings.num_warehouses * localSettings.capacity_limit).toLocaleString()}</span>
                <span>12,000 orders</span>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                * If a warehouse cluster exceeds this limit, surplus demand is automatically reassigned to the next closest facility.
              </p>
            </div>

            {/* Max Delivery Radius */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-300">Maximum Delivery Radius (SLA Boundary):</label>
                <span className="font-mono text-amber-400 font-bold text-sm">
                  {localSettings.max_delivery_radius_km} km
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="1"
                value={localSettings.max_delivery_radius_km}
                onChange={(e) => handleChange('max_delivery_radius_km', parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>5 km (Ultra-Fast)</span>
                <span>15 km (Urban Standard)</span>
                <span>35 km (Suburban)</span>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                * Neighborhoods exceeding this distance from their assigned warehouse will be flagged as constraint violations.
              </p>
            </div>
          </div>

          {/* Section 2: Fleet Types & Fuel Costs */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">2. Vehicle Fleet & Fuel Cost Modeling</h3>
                <p className="text-xs text-slate-400">Select distribution fleet profile and operational fuel parameters.</p>
              </div>
            </div>

            {/* Fleet selector */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">Active Delivery Fleet Type:</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'bikes', label: 'Bikes / Scooters', icon: '🛵' },
                  { id: 'vans', label: 'Delivery Vans', icon: '🚐' },
                  { id: 'trucks', label: 'Medium Trucks', icon: '🚚' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleChange('fleet_type', f.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      localSettings.fleet_type === f.id
                        ? 'bg-purple-500/20 text-white border-purple-500/50 shadow-md shadow-purple-500/10'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-2xl mb-1">{f.icon}</div>
                    <div className="text-xs font-semibold">{f.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fleet Specs Display */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-2 text-xs">
              <div className="font-semibold text-slate-200">{selectedFleet.name}</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{selectedFleet.desc}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Fuel Economy</span>
                  <strong className="text-purple-300 font-mono">{selectedFleet.efficiency}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Fuel Price</span>
                  <strong className="text-purple-300 font-mono">{selectedFleet.fuelPrice}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Cruise Speed</span>
                  <strong className="text-purple-300 font-mono">{selectedFleet.speed}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Batch Capacity</span>
                  <strong className="text-purple-300 font-mono">{selectedFleet.capacity}</strong>
                </div>
              </div>
            </div>

            {/* Section 3: Traffic Conditions */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>City Traffic Congestion Level:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'light', label: 'Light', tag: '0.8x Transit', color: 'emerald' },
                  { id: 'normal', label: 'Normal', tag: '1.0x Baseline', color: 'blue' },
                  { id: 'heavy', label: 'Heavy', tag: '1.65x Delay', color: 'rose' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleChange('traffic_condition', t.id)}
                    className={`py-2 px-3 rounded-lg border text-center transition-all ${
                      localSettings.traffic_condition === t.id
                        ? 'bg-slate-800 text-white border-brand-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold">{t.label}</div>
                    <div className="text-[10px] text-slate-400">{t.tag}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Section 3: Demand Simulation */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">3. Customer Demand Shift (Simulation)</h3>
                <p className="text-xs text-slate-400">Stress test network with demand surges or seasonal recessions.</p>
              </div>
            </div>

            {/* Demand slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-300">Demand Modifier (% Shift):</label>
                <span className={`font-mono font-bold text-sm ${
                  localSettings.demand_modifier_pct > 0 ? 'text-emerald-400' : localSettings.demand_modifier_pct < 0 ? 'text-rose-400' : 'text-slate-200'
                }`}>
                  {localSettings.demand_modifier_pct > 0 ? `+${localSettings.demand_modifier_pct}%` : `${localSettings.demand_modifier_pct}%`}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="100"
                step="5"
                value={localSettings.demand_modifier_pct}
                onChange={(e) => handleChange('demand_modifier_pct', parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>-50% (Slump)</span>
                <span>0% (Baseline)</span>
                <span>+100% (Festive Peak)</span>
              </div>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Baseline Aggregate Volume:</span>
                <strong className="text-white font-mono">{totalBaseOrders.toLocaleString()} orders/day</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Effective Simulated Volume:</span>
                <strong className="text-emerald-400 font-mono text-sm">{totalEffectiveOrders.toLocaleString()} orders/day</strong>
              </div>
            </div>
          </div>

          {/* Section 4: Infrastructure Financial Costs */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <IndianRupee className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">4. Infrastructure & Operating Costs</h3>
                <p className="text-xs text-slate-400">Fixed warehouse lease overhead vs marginal delivery rates.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Fixed Cost per Warehouse (Daily):
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-mono">₹</span>
                  <input
                    type="number"
                    step="1000"
                    value={localSettings.fixed_warehouse_cost_daily}
                    onChange={(e) => handleChange('fixed_warehouse_cost_daily', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-xs text-white font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Rent, electricity, warehouse staffing</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Delivery Rate (₹ per km-order):
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-mono">₹</span>
                  <input
                    type="number"
                    step="0.1"
                    value={localSettings.cost_per_km_order}
                    onChange={(e) => handleChange('cost_per_km_order', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-xs text-white font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Marginal transit handling cost</span>
              </div>
            </div>

            {/* Total Estimated Infra Overhead */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Total Fixed Infrastructure Daily Cost:</span>
                <p className="text-[11px] text-slate-500">{localSettings.num_warehouses} Hubs × ₹{localSettings.fixed_warehouse_cost_daily.toLocaleString()}</p>
              </div>
              <strong className="text-amber-400 font-mono text-base">
                ₹{(localSettings.num_warehouses * localSettings.fixed_warehouse_cost_daily).toLocaleString()} / day
              </strong>
            </div>
          </div>

        </div>

        {/* PROMINENT "RUN OPTIMIZATION" ACTION BAR */}
        <div className="sticky bottom-4 z-30 bg-slate-900/95 backdrop-blur-md border border-brand-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs text-slate-300">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
            <span>
              Configured: <strong>{localSettings.num_warehouses} Hubs</strong> | <strong>{selectedFleet.name}</strong> | <strong>{localSettings.traffic_condition.toUpperCase()} Traffic</strong>
            </span>
          </div>

          <button
            type="submit"
            disabled={isOptimizing}
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-cyan-500 to-emerald-500 hover:from-brand-500 hover:via-cyan-400 hover:to-emerald-400 text-white font-bold text-sm tracking-wide uppercase shadow-lg shadow-brand-500/25 transition-all transform active:scale-95 disabled:opacity-50"
          >
            <Zap className="w-5 h-5 text-amber-300" />
            <span>{isOptimizing ? 'COMPUTING OPTIMIZATION MATRIX...' : 'RUN OPTIMIZATION'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </form>

    </div>
  );
}
