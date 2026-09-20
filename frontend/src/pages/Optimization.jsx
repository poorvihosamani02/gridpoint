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
  Clock,
  RotateCcw
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
            <Sliders className="w-7 h-7 text-blue-600" />
            <span>Optimization Control Panel</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure algorithmic clustering parameters, capacity boundaries, fleet vehicle dynamics, and demand simulations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
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
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Error notification if any */}
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <Info className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <form onSubmit={handleRun} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Section 1: Warehouses & Capacity Limits */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-sm">
            <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">1. Multi-Warehouse & Capacity Constraints</h3>
                <p className="text-xs text-slate-500">Configure target fulfillment hubs and throughput boundaries.</p>
              </div>
            </div>

            {/* Warehouse count slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-700">Number of Warehouses (K):</label>
                <span className="font-mono text-blue-600 font-bold text-sm">{localSettings.num_warehouses} Hubs</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={localSettings.num_warehouses}
                onChange={(e) => handleChange('num_warehouses', parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>1 (Central)</span>
                <span>2</span>
                <span>3 (Recommended)</span>
                <span>4</span>
                <span>5 (Max)</span>
              </div>
            </div>

            {/* Warehouse capacity slider & custom input box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-700">Max Warehouse Capacity Limit:</label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    min="500"
                    max="100000"
                    step="250"
                    value={localSettings.capacity_limit}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      handleChange('capacity_limit', isNaN(val) ? 0 : Math.max(0, val));
                    }}
                    className="w-24 px-2 py-1 border border-slate-300 rounded font-mono text-xs font-bold text-blue-600 text-right focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                  />
                  <span className="font-mono text-xs text-slate-500 font-medium">orders/hub</span>
                </div>
              </div>
              <input
                type="range"
                min="1000"
                max={Math.max(20000, Math.ceil((localSettings.capacity_limit || 12000) * 1.25 / 1000) * 1000)}
                step="500"
                value={localSettings.capacity_limit || 1000}
                onChange={(e) => handleChange('capacity_limit', parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>1,000 orders</span>
                <span className="font-semibold text-slate-700">
                  Total Network Capacity: {(localSettings.num_warehouses * (localSettings.capacity_limit || 0)).toLocaleString()} orders
                </span>
                <span>{Math.max(20000, Math.ceil((localSettings.capacity_limit || 12000) * 1.25 / 1000) * 1000).toLocaleString()} orders</span>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                * If a warehouse cluster exceeds this limit, surplus demand is automatically reassigned to the next closest facility.
              </p>
            </div>

            {/* Max Delivery Radius */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-700">Maximum Delivery Radius (SLA Boundary):</label>
                <span className="font-mono text-blue-600 font-bold text-sm">
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
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
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
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-sm">
            <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-200">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">2. Vehicle Fleet & Fuel Cost Modeling</h3>
                <p className="text-xs text-slate-500">Select distribution fleet profile and operational fuel parameters.</p>
              </div>
            </div>

            {/* Fleet selector */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Active Delivery Fleet Type:</label>
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
                    className={`p-3 rounded-lg border text-center transition-all ${
                      localSettings.fleet_type === f.id
                        ? 'bg-blue-50 text-blue-900 border-blue-600 ring-1 ring-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{f.icon}</div>
                    <div className="text-xs font-semibold">{f.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fleet Specs Display */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2 text-xs">
              <div className="font-semibold text-slate-900">{selectedFleet.name}</div>
              <p className="text-slate-600 text-[11px] leading-relaxed">{selectedFleet.desc}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Fuel Economy</span>
                  <strong className="text-slate-900 font-mono">{selectedFleet.efficiency}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Fuel Price</span>
                  <strong className="text-slate-900 font-mono">{selectedFleet.fuelPrice}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Cruise Speed</span>
                  <strong className="text-slate-900 font-mono">{selectedFleet.speed}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Batch Capacity</span>
                  <strong className="text-slate-900 font-mono">{selectedFleet.capacity}</strong>
                </div>
              </div>
            </div>

            {/* Traffic Conditions */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>City Traffic Congestion Level:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'light', label: 'Light', tag: '0.8x Transit' },
                  { id: 'normal', label: 'Normal', tag: '1.0x Baseline' },
                  { id: 'heavy', label: 'Heavy', tag: '1.65x Delay' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleChange('traffic_condition', t.id)}
                    className={`py-2 px-3 rounded-lg border text-center transition-all ${
                      localSettings.traffic_condition === t.id
                        ? 'bg-blue-50 text-blue-900 border-blue-600 ring-1 ring-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-semibold">{t.label}</div>
                    <div className="text-[10px] text-slate-500">{t.tag}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Demand Simulation */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-sm">
            <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">3. Customer Demand Shift (Simulation)</h3>
                <p className="text-xs text-slate-500">Stress test network with demand surges or seasonal recessions.</p>
              </div>
            </div>

            {/* Demand slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-700">Demand Modifier (% Shift):</label>
                <span className={`font-mono font-bold text-sm ${
                  localSettings.demand_modifier_pct > 0 ? 'text-emerald-600' : localSettings.demand_modifier_pct < 0 ? 'text-rose-600' : 'text-slate-900'
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
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>-50% (Slump)</span>
                <span>0% (Baseline)</span>
                <span>+100% (Festive Peak)</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Baseline Aggregate Volume:</span>
                <strong className="text-slate-900 font-mono">{totalBaseOrders.toLocaleString()} orders/day</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Effective Simulated Volume:</span>
                <strong className="text-emerald-700 font-mono text-sm">{totalEffectiveOrders.toLocaleString()} orders/day</strong>
              </div>
            </div>
          </div>

          {/* Section 4: Infrastructure Financial Costs */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-sm">
            <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                <IndianRupee className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">4. Infrastructure & Operating Costs</h3>
                <p className="text-xs text-slate-500">Fixed warehouse lease overhead vs marginal delivery rates.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fixed Cost per Warehouse (Daily):
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-mono">₹</span>
                  <input
                    type="number"
                    step="1000"
                    value={localSettings.fixed_warehouse_cost_daily}
                    onChange={(e) => handleChange('fixed_warehouse_cost_daily', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-7 pr-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Rent, electricity, warehouse staffing</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Rate (₹ per km-order):
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-mono">₹</span>
                  <input
                    type="number"
                    step="0.1"
                    value={localSettings.cost_per_km_order}
                    onChange={(e) => handleChange('cost_per_km_order', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-7 pr-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Marginal transit handling cost</span>
              </div>
            </div>

            {/* Total Estimated Infra Overhead */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Total Fixed Infrastructure Daily Cost:</span>
                <p className="text-[11px] text-slate-400">{localSettings.num_warehouses} Hubs × ₹{localSettings.fixed_warehouse_cost_daily.toLocaleString()}</p>
              </div>
              <strong className="text-slate-900 font-mono text-base font-bold">
                ₹{(localSettings.num_warehouses * localSettings.fixed_warehouse_cost_daily).toLocaleString()} / day
              </strong>
            </div>
          </div>

        </div>

        {/* PROMINENT "RUN OPTIMIZATION" ACTION BAR */}
        <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>
              Configured: <strong className="text-slate-900">{localSettings.num_warehouses} Hubs</strong> | <strong className="text-slate-900">{selectedFleet.name}</strong> | <strong className="text-slate-900">{localSettings.traffic_condition.toUpperCase()} Traffic</strong>
            </span>
          </div>

          <button
            type="submit"
            disabled={isOptimizing}
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide uppercase shadow-sm hover:shadow transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
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
