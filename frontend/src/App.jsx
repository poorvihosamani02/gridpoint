import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import DataManagement from './pages/DataManagement';
import Optimization from './pages/Optimization';
import Results from './pages/Results';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
          {/* Top Persistent Navigation Bar */}
          <Navbar />

          {/* Main Viewport Routing (CHANGE 3: Standalone /map removed, redirects to /results) */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/data" element={<DataManagement />} />
              <Route path="/optimize" element={<Optimization />} />
              <Route path="/results" element={<Results />} />
              {/* Legacy /map redirect */}
              <Route path="/map" element={<Navigate to="/results" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Clean Light App Footer */}
          <footer className="border-t border-slate-200 bg-slate-50 py-6 text-xs text-slate-500 text-center">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-700">GridPoint</span>
                <span>•</span>
                <span>Logistics SaaS Warehouse Location Optimization Platform</span>
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                Weighted Haversine Matrix • Capacitated K-Means Engine
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AppProvider>
  );
}
