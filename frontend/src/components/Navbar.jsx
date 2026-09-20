import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Database, 
  Sliders, 
  BarChart3, 
  Sparkles,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Logo from './Logo';

export default function Navbar() {
  const { backendStatus, neighborhoods, results, loadSampleData } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: Building2 },
    { to: '/data', label: 'Data Management', icon: Database, badge: neighborhoods.length > 0 ? neighborhoods.length : null },
    { to: '/optimize', label: 'Optimization', icon: Sliders },
    { to: '/results', label: 'Analytics & Results', icon: BarChart3, hasResults: Boolean(results) },
  ];

  return (
    <header className="sticky top-3 z-50 w-full px-4 sm:px-6 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        {/* FLOATING DARK CAPSULE HEADER (as shown in reference design) */}
        <div className="floating-capsule-nav rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between transition-all backdrop-blur-md">
          
          {/* Standout Logo & Brand */}
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:opacity-95 transition-opacity" 
            onClick={() => navigate('/')}
            title="GridPoint Logistics Intelligence"
          >
            <Logo size="sm" variant="dark" />
          </div>

          {/* Desktop Navigation Sections in the Capsule */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-normal transition-all flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-blue-500/30 text-blue-300 border border-blue-400/30">
                      {item.badge}
                    </span>
                  )}
                  {item.hasResults && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action / Status Pill */}
          <div className="hidden sm:flex items-center space-x-2.5">
            {/* Backend API Status Pill */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300">
              <span className={`w-1.5 h-1.5 rounded-full ${backendStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="font-mono text-[10px] text-slate-300 font-medium">
                {backendStatus === 'online' ? 'API Active' : 'Checking'}
              </span>
            </div>

            {/* Quick Action Button */}
            <button
              onClick={() => {
                if (location.pathname === '/') {
                  navigate('/data');
                } else if (location.pathname === '/data') {
                  navigate('/optimize');
                } else if (location.pathname === '/optimize') {
                  navigate('/results');
                } else {
                  navigate('/data');
                }
              }}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <span>{location.pathname === '/results' ? 'New Plan' : 'Start'}</span>
              <ArrowRight className="w-3 h-3 text-slate-900" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => navigate('/data')}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-900 bg-white"
            >
              Start
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full text-slate-300 hover:text-white bg-white/10"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu if toggled */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-3 bg-slate-950/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col space-y-1 text-xs">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl flex items-center justify-between font-medium transition-colors ${
                    isActive ? 'bg-white/15 text-white font-bold' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <span>{item.label}</span>
                {item.badge !== null && item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-300">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
            {neighborhoods.length === 0 && (
              <button
                onClick={() => {
                  loadSampleData();
                  setMobileMenuOpen(false);
                }}
                className="mt-1 w-full text-left px-3 py-2 rounded-xl text-blue-400 bg-blue-950/40 flex items-center space-x-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample BLR Corridors</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
