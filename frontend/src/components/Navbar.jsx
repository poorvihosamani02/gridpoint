import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Database, 
  Sliders, 
  BarChart3, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { backendStatus, neighborhoods, results, loadSampleData } = useApp();
  const navigate = useNavigate();

  // CHANGE 3: Removed standalone '/map' from navigation
  const navItems = [
    { to: '/', label: 'Dashboard', icon: Building2 },
    { to: '/data', label: 'Data Management', icon: Database, badge: neighborhoods.length },
    { to: '/optimize', label: 'Optimization', icon: Sliders },
    { to: '/results', label: 'Analytics & Results', icon: BarChart3, highlight: Boolean(results) },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand: Minimalist, Bold & Professional */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  GridPoint
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">
                  SaaS v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Warehouse Location Optimization</p>
            </div>
          </div>

          {/* Horizontal Navigation Links: Clean White & Royal Blue Active State */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && (
                    <span className="relative flex h-2 w-2 ml-1">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Section: Sample data trigger & Backend indicator */}
          <div className="flex items-center space-x-3">
            {neighborhoods.length === 0 && (
              <button
                onClick={loadSampleData}
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample BLR</span>
              </button>
            )}

            {/* Backend status indicator */}
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs">
              {backendStatus === 'online' ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span className="text-emerald-700 font-semibold text-[11px]">API Online</span>
                </>
              ) : backendStatus === 'checking' ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <span className="text-amber-700 font-medium text-[11px]">Connecting...</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                  <span className="text-rose-700 font-medium text-[11px]">API Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Horizontal Bar */}
      <div className="md:hidden flex overflow-x-auto border-t border-slate-200 px-2 py-2 gap-1 bg-white">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </header>
  );
}
