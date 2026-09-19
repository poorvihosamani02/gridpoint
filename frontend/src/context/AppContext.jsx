import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SAMPLE_BENGALURU_DATA } from '../utils/sampleData';
import { optimizeNetwork, fetchHealth } from '../utils/api';

const AppContext = createContext(null);

export const DEFAULT_SETTINGS = {
  num_warehouses: 3,
  capacity_limit: 5000,
  max_delivery_radius_km: 15.0,
  fleet_type: 'vans',
  traffic_condition: 'normal',
  demand_modifier_pct: 0,
  fixed_warehouse_cost_daily: 50000,
  cost_per_km_order: 1.5
};

export function AppProvider({ children }) {
  const [neighborhoods, setNeighborhoods] = useState(SAMPLE_BENGALURU_DATA);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [results, setResults] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Check backend health periodically
  useEffect(() => {
    let mounted = true;
    async function checkStatus() {
      const res = await fetchHealth();
      if (mounted) {
        setBackendStatus(res.status === 'online' ? 'online' : 'offline');
      }
    }
    checkStatus();
    const timer = setInterval(checkStatus, 15000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const updateSettings = useCallback((newPartial) => {
    setSettings((prev) => ({ ...prev, ...newPartial }));
  }, []);

  const loadSampleData = useCallback(() => {
    setNeighborhoods(SAMPLE_BENGALURU_DATA);
    setError(null);
  }, []);

  const clearData = useCallback(() => {
    setNeighborhoods([]);
    setResults(null);
    setError(null);
  }, []);

  const addNeighborhood = useCallback((item) => {
    setNeighborhoods((prev) => [...prev, item]);
  }, []);

  const removeNeighborhood = useCallback((id) => {
    setNeighborhoods((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const updateNeighborhood = useCallback((id, key, value) => {
    setNeighborhoods((prev) =>
      prev.map((n) => (n.id === id ? { ...n, [key]: value } : n))
    );
  }, []);

  const executeOptimization = useCallback(async (customSettings = null) => {
    const activeSettings = customSettings || settings;
    if (!neighborhoods || neighborhoods.length === 0) {
      setError('Please add at least one neighborhood or load sample data.');
      return null;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      const res = await optimizeNetwork(neighborhoods, activeSettings);
      setResults(res);
      return res;
    } catch (err) {
      console.error('Optimization error:', err);
      setError(err.message || 'Optimization failed to complete.');
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, [neighborhoods, settings]);

  return (
    <AppContext.Provider
      value={{
        neighborhoods,
        setNeighborhoods,
        settings,
        updateSettings,
        results,
        setResults,
        isOptimizing,
        error,
        setError,
        backendStatus,
        loadSampleData,
        clearData,
        addNeighborhood,
        removeNeighborhood,
        updateNeighborhood,
        executeOptimization
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
