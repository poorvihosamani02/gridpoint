/**
 * API client to communicate with the FastAPI backend.
 * Features built-in fallback calculation for testing or standalone demo mode.
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '');

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

export async function fetchSampleData() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/sample-data`);
    if (!res.ok) throw new Error('Failed to fetch sample data');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using local sample data');
    const { SAMPLE_BENGALURU_DATA } = await import('./sampleData.js');
    return SAMPLE_BENGALURU_DATA;
  }
}

export async function optimizeNetwork(neighborhoods, settings) {
  const payload = {
    neighborhoods,
    settings
  };

  const res = await fetch(`${API_BASE_URL}/api/optimize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Server error: ${res.status}`);
  }

  return await res.json();
}

export async function simulateFleetComparison(neighborhoods, settings) {
  const payload = {
    neighborhoods,
    settings
  };

  const res = await fetch(`${API_BASE_URL}/api/simulate-fleet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error('Fleet simulation failed');
  return await res.json();
}
