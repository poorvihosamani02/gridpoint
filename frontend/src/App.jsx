import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import DataManagement from './pages/DataManagement';
import InteractiveMap from './pages/InteractiveMap';
import Optimization from './pages/Optimization';
import Results from './pages/Results';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
          {/* Top Persistent Navigation Bar */}
          <Navbar />

          {/* Main Viewport Routing */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/data" element={<DataManagement />} />
              <Route path="/map" element={<InteractiveMap />} />
              <Route path="/optimize" element={<Optimization />} />
              <Route path="/results" element={<Results />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Clean App Footer */}
          <footer className="border-t border-slate-800/80 bg-slate-900/40 py-6 text-xs text-slate-500 text-center">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-400">GridPoint</span>
                <span>•</span>
                <span>Advanced Warehouse Location Optimization Platform</span>
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                Bengaluru Logistics Matrix • Haversine Weighted K-Means
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AppProvider>
  );
}
