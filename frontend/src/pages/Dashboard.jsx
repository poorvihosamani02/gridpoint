import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Database, 
  Sliders, 
  BarChart3, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import DemoMapVideo from '../components/DemoMapVideo';
import Logo from '../components/Logo';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6 sm:py-8 pb-20">
      
      {/* 1. INTRO SECTION: Clean, minimal & bold typography (as in reference design) */}
      <div className="text-center space-y-4 max-w-4xl mx-auto px-4">
        
        {/* Subtle Brand Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 shadow-xs mb-1">
          <Logo size="sm" variant="light" showText={false} />
          <span className="text-xs font-bold tracking-wide uppercase text-slate-700">
            GridPoint Logistics SaaS
          </span>
        </div>

        {/* 4-Word Primary Intro Headline (Matching the large, punchy style in the picture) */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.08]">
          Precision Warehouse Location Optimization
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed font-normal">
          Algorithmic clustering and transit simulation to position regional fulfillment hubs with lowest cost and highest delivery speed.
        </p>

        {/* 2. "START OPTIMIZATION" BUTTON: Perfectly placed between intro & map section */}
        <div className="pt-3 pb-1 flex items-center justify-center">
          <button
            onClick={() => navigate('/data')}
            className="inline-flex items-center space-x-2.5 px-8 py-3.5 rounded-full bg-black hover:bg-slate-900 text-white font-bold text-sm tracking-wide shadow-lg shadow-black/25 hover:shadow-black/35 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <span>Start Optimization</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 3. DEMO VIDEO OF THE MAP (Standard overview with animated warehouses & routes) */}
      <div className="w-full px-1">
        <DemoMapVideo />
      </div>

      {/* 4. PRESERVED LOWER DETAILS: 3-Step Guided Workflow Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div 
          onClick={() => navigate('/data')}
          className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-5 space-y-2.5 transition-colors cursor-pointer shadow-sm group"
        >
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100">
            1
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 flex items-center justify-between">
            <span>Data Management</span>
            <Database className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload custom CSV coordinates or enter demand points manually with instant coordinate validation.
          </p>
        </div>

        <div 
          onClick={() => navigate('/optimize')}
          className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-5 space-y-2.5 transition-colors cursor-pointer shadow-sm group"
        >
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100">
            2
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 flex items-center justify-between">
            <span>Operational Constraints</span>
            <Sliders className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tune warehouse count, capacity caps, SLA radius limits, vehicle fleet profiles, and traffic multipliers.
          </p>
        </div>

        <div 
          onClick={() => navigate('/results')}
          className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-5 space-y-2.5 transition-colors cursor-pointer shadow-sm group"
        >
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100">
            3
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 flex items-center justify-between">
            <span>Geospatial Analytics</span>
            <BarChart3 className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Inspect Before vs. After cost savings, interactive route map, and CapEx trade-off curves.
          </p>
        </div>
      </div>

      {/* 5. PRESERVED LOWER DETAILS: Platform Capabilities Checklist */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-3.5 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Platform Capabilities</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Weighted Haversine Great-Circle Clustering</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Capacitated Multi-Hub Regret Reallocation</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Fleet Fuel Economics (Bikes, Vans, Trucks)</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Infrastructure vs. Delivery Cost Trade-off Curve</span>
          </div>
        </div>
      </div>

    </div>
  );
}
