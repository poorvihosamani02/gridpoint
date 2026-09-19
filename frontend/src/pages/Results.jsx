import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  IndianRupee, 
  Download, 
  Sliders, 
  Map, 
  Layers, 
  Fuel, 
  Truck, 
  ArrowRight,
  Zap,
  Building,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import MetricCard from '../components/MetricCard';
import TradeoffChart from '../components/TradeoffChart';
import { WAREHOUSE_COLORS } from '../utils/sampleData';

export default function Results() {
  const { results, settings, executeOptimization, isOptimizing } = useApp();
  const navigate = useNavigate();

  const [filterHub, setFilterHub] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!results) {
    return (
      <div className="py-20 text-center space-y-5 max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
          <BarChart3 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">No Results Generated Yet</h2>
          <p className="text-sm text-slate-400 mt-1">
            Run the optimization engine to view network analytics, Before vs. After comparisons, and trade-off curves.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/optimize')}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg transition-all"
          >
            <Sliders className="w-4 h-4" />
            <span>Go to Optimization Settings</span>
          </button>
        </div>
      </div>
    );
  }

  const { before_after, summary, warehouses, assignments, tradeoff_curve } = results;

  // Filter assignments
  const filteredAssignments = assignments.filter((a) => {
    const matchesHub = filterHub === 'all' || String(a.assigned_warehouse_id) === filterHub;
    const matchesSearch = a.neighborhood_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesHub && matchesSearch;
  });

  // Export results JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gridpoint_optimization_results_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>OPTIMIZATION COMPUTED IN {results.execution_time_ms} MS</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Analytics & Results</h1>
          <p className="text-sm text-slate-400 mt-1">
            Comprehensive Before vs. After performance, fleet fuel audit, and capacity allocation.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/map')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            <Map className="w-3.5 h-3.5 text-brand-400" />
            <span>View Map Routes</span>
          </button>

          <button
            onClick={() => navigate('/optimize')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Modify Settings</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (JSON)</span>
          </button>
        </div>
      </div>

      {/* Executive Savings Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 p-6 sm:p-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Delivery Cost Reduction</span>
            <div className="text-4xl font-extrabold text-white font-mono flex items-baseline space-x-2">
              <span>{before_after.delivery_cost_saved_pct}%</span>
              <span className="text-xs text-emerald-400 font-sans font-semibold">Saved</span>
            </div>
            <p className="text-xs text-slate-400">₹{before_after.delivery_cost_saved.toLocaleString()} saved daily</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Weighted Distance Trimmed</span>
            <div className="text-4xl font-extrabold text-white font-mono flex items-baseline space-x-2">
              <span>{before_after.distance_saved_pct}%</span>
              <span className="text-xs text-brand-400 font-sans font-semibold">Fewer km</span>
            </div>
            <p className="text-xs text-slate-400">{before_after.distance_saved_km.toLocaleString()} order-km slashed daily</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Transit Hours Reclaimed</span>
            <div className="text-4xl font-extrabold text-white font-mono flex items-baseline space-x-2">
              <span>{before_after.time_saved_pct}%</span>
              <span className="text-xs text-cyan-400 font-sans font-semibold">Faster</span>
            </div>
            <p className="text-xs text-slate-400">{before_after.time_saved_hours.toLocaleString()} road hours saved</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Fleet Fuel Economy</span>
            <div className="text-4xl font-extrabold text-white font-mono flex items-baseline space-x-2">
              <span>₹{summary.total_fuel_cost.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-400">{settings.fleet_type.toUpperCase()} fleet ({settings.traffic_condition} traffic)</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Operational Cost"
          value={`₹${Math.round(summary.grand_total_cost).toLocaleString()}`}
          subtitle={`Infra: ₹${summary.fixed_infrastructure_cost.toLocaleString()} | Deliv: ₹${Math.round(summary.total_delivery_cost).toLocaleString()}`}
          icon={IndianRupee}
          highlightColor="emerald"
        />

        <MetricCard
          title="Average Delivery Distance"
          value={`${summary.avg_delivery_distance_km} km`}
          subtitle={`Max: ${summary.max_delivery_distance_km} km | Avg Time: ${summary.avg_delivery_time_mins} min`}
          icon={Truck}
          highlightColor="brand"
        />

        <MetricCard
          title="Network Capacity Usage"
          value={`${summary.capacity_utilization_pct}%`}
          subtitle={`${summary.total_daily_orders.toLocaleString()} / ${summary.total_capacity.toLocaleString()} orders`}
          icon={Building}
          highlightColor={summary.capacity_utilization_pct > 90 ? 'amber' : 'purple'}
        />

        <MetricCard
          title="Constraint Status"
          value={`${summary.radius_violations_count} Radius Alert`}
          subtitle={`${summary.overflow_reassignments_count} overflow reassignments`}
          icon={ShieldAlert}
          highlightColor={summary.radius_violations_count > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* BEFORE VS AFTER DETAILED COMPARISON TABLE */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Before vs. After Optimization Benchmark</h3>
            <p className="text-xs text-slate-400">
              Single geometric-center warehouse (Before) versus algorithmically distributed multi-hub layout (After).
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
            {before_after.before_num_warehouses} Hub Baseline → {before_after.after_num_warehouses} Hubs Optimized
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-slate-400 border-b border-slate-800 uppercase text-[11px] font-sans">
              <tr>
                <th className="py-3 px-4">Performance Metric</th>
                <th className="py-3 px-4">Single Central Hub (Before)</th>
                <th className="py-3 px-4 text-emerald-400">Multi-Hub Optimized (After)</th>
                <th className="py-3 px-4 text-right">Net Improvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-4 font-sans font-medium text-slate-200">Active Warehouses</td>
                <td className="py-3 px-4 text-slate-400">{before_after.before_num_warehouses} Facility (Geo Center)</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">{before_after.after_num_warehouses} Distributed Facilities</td>
                <td className="py-3 px-4 text-right text-brand-400">+{before_after.after_num_warehouses - 1} Regional Hubs</td>
              </tr>

              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-4 font-sans font-medium text-slate-200">Total Weighted Distance</td>
                <td className="py-3 px-4 text-slate-400">{before_after.before_total_weighted_distance_km.toLocaleString()} order-km</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">{before_after.after_total_weighted_distance_km.toLocaleString()} order-km</td>
                <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                  ↓ {before_after.distance_saved_pct}% ({before_after.distance_saved_km.toLocaleString()} km)
                </td>
              </tr>

              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-4 font-sans font-medium text-slate-200">Total Daily Delivery Cost</td>
                <td className="py-3 px-4 text-slate-400">₹{before_after.before_total_delivery_cost.toLocaleString()}</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">₹{before_after.after_total_delivery_cost.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                  ↓ {before_after.delivery_cost_saved_pct}% (₹{before_after.delivery_cost_saved.toLocaleString()})
                </td>
              </tr>

              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-4 font-sans font-medium text-slate-200">Fleet Fuel Expenditure</td>
                <td className="py-3 px-4 text-slate-400">₹{before_after.before_total_fuel_cost.toLocaleString()}</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">₹{before_after.after_total_fuel_cost.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                  ↓ ₹{(before_after.before_total_fuel_cost - before_after.after_total_fuel_cost).toFixed(0)}/day
                </td>
              </tr>

              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-4 font-sans font-medium text-slate-200">Total Transit Hours</td>
                <td className="py-3 px-4 text-slate-400">{before_after.before_total_travel_time_hours.toLocaleString()} hrs</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">{before_after.after_total_travel_time_hours.toLocaleString()} hrs</td>
                <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                  ↓ {before_after.time_saved_pct}% ({before_after.time_saved_hours} hrs)
                </td>
              </tr>

              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-4 font-sans font-medium text-slate-200">Radius Violations (&gt; {settings.max_delivery_radius_km} km)</td>
                <td className="py-3 px-4 text-rose-400">{before_after.before_radius_violations_count} breaches</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">{before_after.after_radius_violations_count} breaches</td>
                <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                  {before_after.before_radius_violations_count - before_after.after_radius_violations_count > 0
                    ? `↓ ${before_after.before_radius_violations_count - before_after.after_radius_violations_count} breaches eliminated`
                    : 'Within target range'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* INFRASTRUCTURE VS DELIVERY COST TRADE-OFF CHART (BONUS #6) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <TradeoffChart data={tradeoff_curve} />
      </div>

      {/* WAREHOUSE LOAD & UTILIZATION BREAKDOWN */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white">Active Fulfillment Hubs Breakdown</h3>
          <p className="text-xs text-slate-400">
            Geographic coordinates, daily volume allocation, and throughput utilization per facility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses.map((wh, idx) => {
            const color = WAREHOUSE_COLORS[idx % WAREHOUSE_COLORS.length];
            return (
              <div
                key={wh.id}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className="w-4 h-4 rounded-full border border-white inline-block shadow-sm"
                      style={{ backgroundColor: color }}
                    ></span>
                    <h4 className="font-bold text-white text-sm">{wh.name}</h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Hub #{wh.id}
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Coordinates: <span className="text-slate-200">{wh.lat.toFixed(4)}, {wh.lng.toFixed(4)}</span>
                </div>

                {/* Progress bar for capacity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Capacity Utilization</span>
                    <strong className={wh.utilization_pct > 90 ? 'text-amber-400' : 'text-emerald-400'}>
                      {wh.utilization_pct}%
                    </strong>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, wh.utilization_pct)}%`,
                        backgroundColor: wh.utilization_pct > 100 ? '#ef4444' : color
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{wh.total_orders_assigned.toLocaleString()} orders</span>
                    <span>Limit: {wh.capacity_limit.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Assigned Neighborhoods:</span>
                  <strong className="text-white font-mono">{wh.assigned_neighborhood_count} locations</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED NEIGHBORHOOD ASSIGNMENT REGISTRY */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Neighborhood Demand & Route Audit</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual assignments, transit distance, trip fuel burn, and SLA status flags.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search neighborhood..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />

            <select
              value={filterHub}
              onChange={(e) => setFilterHub(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Hubs</option>
              {warehouses.map((w) => (
                <option key={w.id} value={String(w.id)}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Neighborhood</th>
                <th className="py-3 px-4">Daily Demand</th>
                <th className="py-3 px-4">Assigned Warehouse Hub</th>
                <th className="py-3 px-4">Haversine Distance</th>
                <th className="py-3 px-4">Transit Time</th>
                <th className="py-3 px-4">Fuel Cost</th>
                <th className="py-3 px-4">Delivery Cost</th>
                <th className="py-3 px-4 text-right">Status Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredAssignments.map((a) => (
                <tr key={a.neighborhood_id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-sans font-medium text-white">{a.neighborhood_name}</td>
                  <td className="py-3 px-4 text-cyan-300">{a.daily_orders_effective.toLocaleString()} orders</td>
                  <td className="py-3 px-4 text-slate-200 font-sans">{a.assigned_warehouse_name}</td>
                  <td className="py-3 px-4 text-slate-300">{a.distance_km} km</td>
                  <td className="py-3 px-4 text-slate-300">{a.delivery_time_mins} mins</td>
                  <td className="py-3 px-4 text-purple-300">₹{a.fuel_cost_daily.toLocaleString()}</td>
                  <td className="py-3 px-4 text-emerald-300 font-semibold">₹{a.delivery_cost_daily.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-sans">
                    {a.is_radius_violation ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Radius Violation (+{a.radius_overshoot_km} km)
                      </span>
                    ) : a.is_overflow_reassigned ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Overflow Reassigned
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Optimal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
