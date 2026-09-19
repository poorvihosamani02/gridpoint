import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Sliders, 
  BarChart3, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Truck, 
  TrendingUp, 
  CheckCircle2,
  ArrowRight,
  Layers,
  Fuel,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import MetricCard from '../components/MetricCard';

export default function Dashboard() {
  const { neighborhoods, results, loadSampleData, isOptimizing, executeOptimization } = useApp();
  const navigate = useNavigate();

  const handleQuickOptimize = async () => {
    if (neighborhoods.length === 0) {
      loadSampleData();
    }
    const res = await executeOptimization();
    if (res) {
      navigate('/results');
    }
  };

  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven E-Commerce Supply Chain Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Next-Gen Warehouse <br />
            <span className="bg-gradient-to-r from-brand-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Location Optimization
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            GridPoint algorithmically positions regional fulfillment hubs to minimize weighted Haversine delivery costs, respect strict warehouse order capacities, account for traffic delays, and evaluate vehicle fleet fuel efficiencies.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => {
                loadSampleData();
                navigate('/data');
              }}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Load Sample Bengaluru Data</span>
            </button>

            <button
              onClick={handleQuickOptimize}
              disabled={isOptimizing}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{isOptimizing ? 'Optimizing...' : 'Run Quick Optimization'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            {results && (
              <button
                onClick={() => navigate('/results')}
                className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold text-sm border border-emerald-500/30 transition-all"
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>View Latest Results</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Quick State & Stats Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Demand Centers"
          value={neighborhoods.length}
          subtitle={`${neighborhoods.reduce((sum, n) => sum + (n.daily_orders || 0), 0).toLocaleString()} Total Daily Orders`}
          icon={MapPin}
          highlightColor="brand"
        />
        <MetricCard
          title="Optimization Status"
          value={results ? `${results.warehouses.length} Active Hubs` : 'Ready'}
          subtitle={results ? `Savings: ${results.before_after.delivery_cost_saved_pct}%` : 'Run engine to compute'}
          icon={results ? CheckCircle2 : Sliders}
          highlightColor={results ? 'emerald' : 'amber'}
        />
        <MetricCard
          title="Baseline Comparison"
          value={results ? `₹${(results.before_after.delivery_cost_saved / 1000).toFixed(1)}k Saved` : '1 Hub Baseline'}
          subtitle={results ? `${results.before_after.distance_saved_km} km cut daily` : 'Pre-configured center'}
          icon={TrendingUp}
          highlightColor="emerald"
        />
        <MetricCard
          title="Constraint Engine"
          value={results ? `${results.summary.radius_violations_count} Violations` : 'Active'}
          subtitle={results ? `${results.summary.overflow_reassignments_count} capacity reassignments` : 'Strict capacity & radius check'}
          icon={ShieldCheck}
          highlightColor={results?.summary.radius_violations_count > 0 ? 'rose' : 'purple'}
        />
      </section>

      {/* 6 Platform Pillars / Bonus Features Showcase */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Core & Bonus Capabilities</h2>
          <p className="text-sm text-slate-400 mt-1">
            Built from first principles for logistics and supply-chain operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Weighted Haversine Clustering</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Computes exact spherical great-circle distances. Optimizes warehouse centroids based on neighborhood geographic coordinates weighted by daily package volume.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Capacity & Overflow Reassignment</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Enforces strict warehouse intake limits (e.g. 5,000 orders/day). Overloaded hubs automatically reassign marginal neighborhoods to neighboring hubs via min-regret logic.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Max Radius Enforcement</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Configurable delivery perimeter (e.g. 15km). Identifies and flags out-of-reach neighborhoods with visual warning halos to prevent SLA breaches.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Fleet Vehicle & Fuel Cost Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Select between Bikes, Vans, and Trucks. Computes realistic fuel burn based on vehicle efficiency (km/L), trip batch capacities, and prevailing fuel rates (₹/L).
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Traffic Congestion Delays</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Models urban road conditions (Light, Normal, Heavy). Applies real-time speed dampening multipliers to calculate accurate neighborhood transit times.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">CapEx vs. Delivery Trade-off</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Evaluates facility lease overhead vs marginal delivery savings across 1 to 5 hubs to mathematically identify the minimum-cost sweet spot.
            </p>
          </div>
        </div>
      </section>

      {/* Guided Workflow Steps */}
      <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 space-y-6">
        <h3 className="text-xl font-bold text-white">Recommended Hackathon Workflow</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div 
            onClick={() => navigate('/data')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 cursor-pointer transition-all space-y-2 group"
          >
            <div className="text-xs font-mono font-bold text-brand-400">STEP 1</div>
            <h4 className="font-semibold text-white group-hover:text-brand-300">Data Management</h4>
            <p className="text-xs text-slate-400">Inspect loaded Bengaluru coordinates or upload a custom CSV.</p>
          </div>

          <div 
            onClick={() => navigate('/map')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 cursor-pointer transition-all space-y-2 group"
          >
            <div className="text-xs font-mono font-bold text-brand-400">STEP 2</div>
            <h4 className="font-semibold text-white group-hover:text-brand-300">Interactive Map</h4>
            <p className="text-xs text-slate-400">Examine demand density circles across Bengaluru.</p>
          </div>

          <div 
            onClick={() => navigate('/optimize')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 cursor-pointer transition-all space-y-2 group"
          >
            <div className="text-xs font-mono font-bold text-brand-400">STEP 3</div>
            <h4 className="font-semibold text-white group-hover:text-brand-300">Optimization Settings</h4>
            <p className="text-xs text-slate-400">Tune warehouse count, capacity, radius, fleet, traffic, and demand.</p>
          </div>

          <div 
            onClick={() => navigate('/results')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 cursor-pointer transition-all space-y-2 group"
          >
            <div className="text-xs font-mono font-bold text-brand-400">STEP 4</div>
            <h4 className="font-semibold text-white group-hover:text-brand-300">Analytics & Results</h4>
            <p className="text-xs text-slate-400">Review Before vs After savings, trade-off curves, and assignments.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
