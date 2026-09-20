import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ArrowRight, 
  Compass, 
  ShieldCheck, 
  Truck, 
  TrendingUp, 
  Database,
  Sliders,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 pb-16">
      
      {/* Introduction Hero: Clean, Minimal & Professional */}
      <div className="bg-white border border-slate-200 rounded-lg p-8 sm:p-10 shadow-sm space-y-6 text-center">
        
        {/* Brand Icon */}
        <div className="w-14 h-14 mx-auto rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
          <Building2 className="w-7 h-7" />
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
            GridPoint
          </h1>
          <p className="text-base text-slate-600 max-w-xl mx-auto font-medium">
            AI-Driven Warehouse Location Optimization & Logistics Demand Intelligence Platform
          </p>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          GridPoint algorithmically positions regional fulfillment hubs to minimize weighted Haversine delivery costs, respect warehouse capacity limits, account for urban traffic delays, and evaluate vehicle fleet fuel efficiencies.
        </p>

        {/* PRIMARY CTA BUTTON: "Start Optimization" */}
        <div className="pt-2">
          <button
            onClick={() => navigate('/data')}
            className="inline-flex items-center space-x-2.5 px-8 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wider uppercase shadow-sm hover:shadow transition-all transform active:scale-95 cursor-pointer"
          >
            <span>Start Optimization</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 3-Step Guided Workflow Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => navigate('/data')}
          className="bg-white border border-slate-200 hover:border-blue-400 rounded-lg p-5 space-y-2 transition-colors cursor-pointer shadow-sm group"
        >
          <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 flex items-center justify-between">
            <span>Data Management</span>
            <Database className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload custom CSV coordinates or enter demand points manually with instant validation.
          </p>
        </div>

        <div 
          onClick={() => navigate('/optimize')}
          className="bg-white border border-slate-200 hover:border-blue-400 rounded-lg p-5 space-y-2 transition-colors cursor-pointer shadow-sm group"
        >
          <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 flex items-center justify-between">
            <span>Operational Constraints</span>
            <Sliders className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tune warehouse count, capacity caps, SLA radius limits, vehicle fleet profiles, and traffic multipliers.
          </p>
        </div>

        <div 
          onClick={() => navigate('/results')}
          className="bg-white border border-slate-200 hover:border-blue-400 rounded-lg p-5 space-y-2 transition-colors cursor-pointer shadow-sm group"
        >
          <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 flex items-center justify-between">
            <span>Geospatial Analytics</span>
            <BarChart3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Inspect Before vs. After cost savings, interactive route map, and CapEx trade-off curves.
          </p>
        </div>
      </div>

      {/* Core Capabilities Checklist */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Platform Capabilities</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Weighted Haversine Great-Circle Clustering</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Capacitated Multi-Hub Regret Reallocation</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Fleet Fuel Economics (Bikes, Vans, Trucks)</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Infrastructure vs. Delivery Cost Trade-off Curve</span>
          </div>
        </div>
      </div>

    </div>
  );
}
