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
  MapPin, 
  Layers, 
  Fuel, 
  Truck, 
  ArrowRight,
  Zap,
  Building,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import MetricCard from '../components/MetricCard';
import TradeoffChart from '../components/TradeoffChart';
import LeafletMap from '../components/LeafletMap';
import { WAREHOUSE_COLORS } from '../utils/sampleData';
import { generateOptimizationPDF } from '../utils/pdfReportGenerator';

export default function Results() {
  const { results, neighborhoods, settings } = useApp();
  const navigate = useNavigate();

  const [filterHub, setFilterHub] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!results) {
    return (
      <div className="py-20 text-center space-y-5 max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
          <BarChart3 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">No Optimization Results Yet</h2>
          <p className="text-xs text-slate-500 mt-1">
            Run the optimization engine from the Dashboard or Optimization Settings to view network analytics.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <span>Return to Dashboard</span>
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

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Export comprehensive PDF report
  const handleExportPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateOptimizationPDF(results, neighborhoods, settings);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Export results JSON (Kept active as secondary option)
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gridpoint_results_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>OPTIMIZATION COMPUTED IN {results.execution_time_ms} MS</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analytics & Results</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Before vs. After benchmark, geospatial fulfillment layout, and cost trade-off curve.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/optimize')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Tune Parameters</span>
          </button>

          {/* Primary Download: Comprehensive PDF Report */}
          <button
            onClick={handleExportPDF}
            disabled={isGeneratingPDF}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-95"
            title="Download comprehensive PDF report with explanation tables, charts & map"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isGeneratingPDF ? 'Generating PDF...' : 'Download Report (PDF)'}</span>
          </button>

          {/* Secondary Data Export: JSON */}
          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition-colors"
            title="Download raw data JSON"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>JSON Data</span>
          </button>
        </div>
      </div>

      {/* CASE 2: Global Network Capacity Exceeded Alert Banner */}
      {summary.is_total_capacity_exceeded && (
        <div className="rounded-lg bg-rose-50 border-2 border-rose-400 p-5 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-rose-900">
                    Network Capacity Alert: Order Volume Exceeds Warehouse Capacity
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-800 text-[10px] font-bold uppercase tracking-wider">
                    All Hubs Full
                  </span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed max-w-3xl">
                  Total incoming demand of <strong className="font-semibold">{summary.total_daily_orders.toLocaleString()} orders</strong> exceeds 
                  the maximum combined capacity of all warehouses (<strong className="font-semibold">{summary.total_capacity.toLocaleString()} orders</strong>) 
                  by <strong className="font-bold underline">{(summary.capacity_deficit_orders || (summary.total_daily_orders - summary.total_capacity)).toLocaleString()} orders</strong>. 
                  All facilities are operating at 100%+ capacity, meaning overloaded orders cannot be redistributed to any other warehouse.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 sm:self-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <span>Return to Start Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate('/optimize')}
                className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-lg bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold transition-all"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CASE 1: Dynamic Order Redistribution Panel */}
      {summary.reallocation_events && summary.reallocation_events.length > 0 && (
        <div className="rounded-lg bg-amber-50/70 border border-amber-300 p-5 shadow-sm space-y-3.5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-amber-200 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-md bg-amber-100 text-amber-800">
                <Zap className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <span>Automated Spillover Capacity Balancing Active</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    {summary.reallocation_events.length} Corridors Rebalanced
                  </span>
                </h3>
                <p className="text-xs text-amber-800">
                  One or more warehouses reached capacity while neighboring facilities had spare capacity. Excess demand was dynamically routed to the nearest available hubs.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded border border-amber-200">
              {summary.reallocation_events.reduce((acc, ev) => acc + (ev.orders || 0), 0).toLocaleString()} Total Orders Redistributed
            </span>
          </div>

          {/* Reallocation details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {summary.reallocation_events.map((ev, i) => (
              <div key={i} className="bg-white border border-amber-200/80 rounded-lg p-3 text-xs space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{ev.neighborhood_name}</span>
                  <span className="font-mono text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded text-[11px] border border-amber-200">
                    {ev.orders.toLocaleString()} orders
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-600 text-[11px]">
                  <span className="font-semibold text-rose-700">{ev.from_warehouse_name} (Full)</span>
                  <ArrowRight className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="font-semibold text-emerald-700">{ev.to_warehouse_name} (Absorbed)</span>
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                  <span>Redirect Distance Penalty:</span>
                  <span className="font-mono font-semibold text-slate-700">+{ev.penalty_km} km</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Executive Savings Banner: Light Theme */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Delivery Cost Reduction</span>
            <div className="text-3xl font-extrabold text-slate-900 font-mono flex items-baseline space-x-2">
              <span>{before_after.delivery_cost_saved_pct}%</span>
              <span className="text-xs text-emerald-600 font-sans font-semibold">Saved</span>
            </div>
            <p className="text-xs text-slate-500">₹{before_after.delivery_cost_saved.toLocaleString()} daily savings</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Weighted Distance Slashed</span>
            <div className="text-3xl font-extrabold text-slate-900 font-mono flex items-baseline space-x-2">
              <span>{before_after.distance_saved_pct}%</span>
              <span className="text-xs text-blue-600 font-sans font-semibold">Fewer km</span>
            </div>
            <p className="text-xs text-slate-500">{before_after.distance_saved_km.toLocaleString()} order-km daily</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Transit Hours Reclaimed</span>
            <div className="text-3xl font-extrabold text-slate-900 font-mono flex items-baseline space-x-2">
              <span>{before_after.time_saved_pct}%</span>
              <span className="text-xs text-indigo-600 font-sans font-semibold">Faster</span>
            </div>
            <p className="text-xs text-slate-500">{before_after.time_saved_hours.toLocaleString()} hours trimmed</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Fleet Fuel Cost</span>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              ₹{summary.total_fuel_cost.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500">{settings.fleet_type.toUpperCase()} fleet ({settings.traffic_condition} traffic)</p>
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
          subtitle={`Max: ${summary.max_delivery_distance_km} km | Time: ${summary.avg_delivery_time_mins} min`}
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
          title="SLA Radius Status"
          value={`${summary.radius_violations_count} Alerts`}
          subtitle={`${summary.overflow_reassignments_count} overflow reassignments`}
          icon={ShieldAlert}
          highlightColor={summary.radius_violations_count > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* CHANGE 3: MERGED INTERACTIVE MAP DIRECTLY INSIDE ANALYTICS & RESULTS */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Geospatial Network & Assignment Routes</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualizing fulfillment hubs, customer demand clusters, straight route assignments, and SLA perimeters.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold">
            {warehouses.length} Active Hubs • {assignments.length} Demand Nodes
          </span>
        </div>

        {/* Embedded Leaflet Map */}
        <LeafletMap
          neighborhoods={neighborhoods}
          results={results}
          maxDeliveryRadiusKm={settings.max_delivery_radius_km}
          height="520px"
        />
      </div>

      {/* BEFORE VS AFTER BENCHMARK TABLE */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Before vs. After Optimization Benchmark</h3>
            <p className="text-xs text-slate-500">
              Single geometric-center baseline (Before) versus algorithmically distributed multi-hub layout (After).
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-semibold">
            {before_after.before_num_warehouses} Hub Baseline → {before_after.after_num_warehouses} Hubs Optimized
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-2.5 px-4">Performance Metric</th>
                <th className="py-2.5 px-4">Single Central Hub (Before)</th>
                <th className="py-2.5 px-4 text-blue-700">Multi-Hub Optimized (After)</th>
                <th className="py-2.5 px-4 text-right">Net Improvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              <tr className="hover:bg-slate-50 font-sans">
                <td className="py-2.5 px-4 font-medium text-slate-900">Active Facilities</td>
                <td className="py-2.5 px-4 text-slate-600">{before_after.before_num_warehouses} Hub (Geometric Center)</td>
                <td className="py-2.5 px-4 text-blue-700 font-semibold">{before_after.after_num_warehouses} Distributed Hubs</td>
                <td className="py-2.5 px-4 text-right text-blue-600">+{before_after.after_num_warehouses - 1} Regional Facilities</td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-sans font-medium text-slate-900">Weighted Distance</td>
                <td className="py-2.5 px-4 text-slate-600">{before_after.before_total_weighted_distance_km.toLocaleString()} order-km</td>
                <td className="py-2.5 px-4 text-blue-700 font-semibold">{before_after.after_total_weighted_distance_km.toLocaleString()} order-km</td>
                <td className="py-2.5 px-4 text-right text-emerald-600 font-bold">
                  ↓ {before_after.distance_saved_pct}% ({before_after.distance_saved_km.toLocaleString()} km)
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-sans font-medium text-slate-900">Daily Delivery Cost</td>
                <td className="py-2.5 px-4 text-slate-600">₹{before_after.before_total_delivery_cost.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-blue-700 font-semibold">₹{before_after.after_total_delivery_cost.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-right text-emerald-600 font-bold">
                  ↓ {before_after.delivery_cost_saved_pct}% (₹{before_after.delivery_cost_saved.toLocaleString()})
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-sans font-medium text-slate-900">Fleet Fuel Burn</td>
                <td className="py-2.5 px-4 text-slate-600">₹{before_after.before_total_fuel_cost.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-blue-700 font-semibold">₹{before_after.after_total_fuel_cost.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-right text-emerald-600 font-bold">
                  ↓ ₹{(before_after.before_total_fuel_cost - before_after.after_total_fuel_cost).toFixed(0)}/day
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-sans font-medium text-slate-900">Transit Duration</td>
                <td className="py-2.5 px-4 text-slate-600">{before_after.before_total_travel_time_hours.toLocaleString()} hrs</td>
                <td className="py-2.5 px-4 text-blue-700 font-semibold">{before_after.after_total_travel_time_hours.toLocaleString()} hrs</td>
                <td className="py-2.5 px-4 text-right text-emerald-600 font-bold">
                  ↓ {before_after.time_saved_pct}% ({before_after.time_saved_hours} hrs)
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-sans font-medium text-slate-900">Radius Violations (&gt; {settings.max_delivery_radius_km} km)</td>
                <td className="py-2.5 px-4 text-rose-600">{before_after.before_radius_violations_count} breaches</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">{before_after.after_radius_violations_count} breaches</td>
                <td className="py-2.5 px-4 text-right text-emerald-600 font-bold">
                  {before_after.before_radius_violations_count - before_after.after_radius_violations_count > 0
                    ? `↓ ${before_after.before_radius_violations_count - before_after.after_radius_violations_count} breaches cut`
                    : 'Compliant'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* INFRASTRUCTURE VS DELIVERY COST TRADE-OFF CURVE */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <TradeoffChart data={tradeoff_curve} />
      </div>

      {/* WAREHOUSE LOAD & UTILIZATION BREAKDOWN */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Active Fulfillment Hubs Breakdown</h3>
          <p className="text-xs text-slate-500">
            Geographic coordinates, volume intake, and capacity utilization per facility.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((wh, idx) => {
            const color = WAREHOUSE_COLORS[idx % WAREHOUSE_COLORS.length];
            return (
              <div
                key={wh.id}
                className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block"
                      style={{ backgroundColor: color }}
                    ></span>
                    <h4 className="font-bold text-slate-900 text-sm">{wh.name}</h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Hub #{wh.id}
                  </span>
                </div>

                <div className="text-xs text-slate-500 font-mono">
                  Coordinates: <span className="text-slate-800">{wh.lat.toFixed(4)}, {wh.lng.toFixed(4)}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Capacity Load</span>
                    <strong className={wh.utilization_pct > 100 ? 'text-rose-600' : wh.utilization_pct > 90 ? 'text-amber-600' : 'text-emerald-700'}>
                      {wh.utilization_pct}% {wh.utilization_pct > 100 ? '(Full)' : ''}
                    </strong>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, wh.utilization_pct)}%`,
                        backgroundColor: wh.utilization_pct > 100 ? '#dc2626' : color
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>{wh.total_orders_assigned.toLocaleString()} orders</span>
                    <span>Cap: {wh.capacity_limit.toLocaleString()}</span>
                  </div>
                </div>

                {/* Capacity Balancing Badges (CASE 1) */}
                {wh.orders_diverted_out > 0 && (
                  <div className="text-[11px] px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                    Exceeded capacity: <strong>{wh.orders_diverted_out.toLocaleString()}</strong> orders diverted
                  </div>
                )}
                {wh.orders_received_in > 0 && (
                  <div className="text-[11px] px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                    Absorbed <strong>+{wh.orders_received_in.toLocaleString()}</strong> spillover orders
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Assigned Corridors:</span>
                  <strong className="text-slate-900 font-mono">{wh.assigned_neighborhood_count} nodes</strong>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Spare Capacity:</span>
                  <strong className={wh.available_capacity > 0 ? 'text-emerald-700 font-mono' : 'text-rose-600 font-mono'}>
                    {wh.available_capacity > 0 ? `${wh.available_capacity.toLocaleString()} orders` : '0 (At Limit)'}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NEIGHBORHOOD ASSIGNMENT AUDIT TABLE */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Neighborhood Route Audit</h3>
            <p className="text-xs text-slate-500">
              Individual node assignments, Haversine distance, and SLA status flags.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="text"
              placeholder="Filter by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />

            <select
              value={filterHub}
              onChange={(e) => setFilterHub(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Hubs</option>
              {warehouses.map((w) => (
                <option key={w.id} value={String(w.id)}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold sticky top-0 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Location</th>
                <th className="py-2.5 px-3">Orders</th>
                <th className="py-2.5 px-3">Assigned Facility</th>
                <th className="py-2.5 px-3">Distance</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Fuel Cost</th>
                <th className="py-2.5 px-3">Delivery Cost</th>
                <th className="py-2.5 px-4 text-right">Status Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredAssignments.map((a) => (
                <tr key={a.neighborhood_id} className="hover:bg-slate-50 font-sans">
                  <td className="py-2 px-4 font-medium text-slate-900">{a.neighborhood_name}</td>
                  <td className="py-2 px-3 text-blue-600 font-mono">{a.daily_orders_effective.toLocaleString()}</td>
                  <td className="py-2 px-3 text-slate-700">{a.assigned_warehouse_name}</td>
                  <td className="py-2 px-3 text-slate-600 font-mono">{a.distance_km} km</td>
                  <td className="py-2 px-3 text-slate-600 font-mono">{a.delivery_time_mins} min</td>
                  <td className="py-2 px-3 text-slate-600 font-mono">₹{a.fuel_cost_daily.toLocaleString()}</td>
                  <td className="py-2 px-3 text-emerald-700 font-mono font-semibold">₹{a.delivery_cost_daily.toLocaleString()}</td>
                  <td className="py-2 px-4 text-right font-sans">
                    {a.is_radius_violation ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        Radius Alert (+{a.radius_overshoot_km} km)
                      </span>
                    ) : a.is_overflow_reassigned ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300" title={`Reassigned from ${a.reassigned_from_hub_name || 'full hub'} to ${a.assigned_warehouse_name}`}>
                        {a.reassigned_from_hub_name ? `Diverted: ${a.reassigned_from_hub_name} → ${a.assigned_warehouse_name}` : 'Spillover Reassigned'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
