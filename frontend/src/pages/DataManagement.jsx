import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Zap,
  ArrowRight,
  Package,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function DataManagement() {
  const { 
    neighborhoods, 
    setNeighborhoods, 
    loadSampleData, 
    clearData, 
    addNeighborhood, 
    removeNeighborhood, 
    updateNeighborhood,
    executeOptimization,
    isOptimizing
  } = useApp();

  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [feedback, setFeedback] = useState(null);

  // Form state for Manual Data Entry
  const [manualRow, setManualRow] = useState({
    name: '',
    lat: '',
    lng: '',
    daily_orders: ''
  });

  // Calculate total daily orders
  const totalOrders = neighborhoods.reduce((sum, n) => sum + (Number(n.daily_orders) || 0), 0);

  // Handle CSV file upload & parsing
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') return;

        const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
        if (lines.length < 2) {
          throw new Error('CSV must contain a header row and at least one data row.');
        }

        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('neighborhood'));
        const latIdx = headers.findIndex((h) => h.includes('lat'));
        const lngIdx = headers.findIndex((h) => h.includes('lng') || h.includes('lon'));
        const ordersIdx = headers.findIndex((h) => h.includes('order') || h.includes('demand') || h.includes('daily'));

        if (latIdx === -1 || lngIdx === -1 || ordersIdx === -1) {
          throw new Error('CSV must contain Latitude, Longitude, and Daily Orders columns.');
        }

        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.trim());
          if (cols.length < 3) continue;

          const lat = parseFloat(cols[latIdx]);
          const lng = parseFloat(cols[lngIdx]);
          const orders = parseInt(cols[ordersIdx], 10);
          const name = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : `Location ${i}`;

          if (isNaN(lat) || isNaN(lng) || isNaN(orders)) continue;

          parsed.push({
            id: `CSV-${i}-${Date.now()}`,
            name,
            lat,
            lng,
            daily_orders: Math.max(0, orders)
          });
        }

        if (parsed.length === 0) {
          throw new Error('No valid coordinate rows could be extracted from this CSV.');
        }

        setNeighborhoods(parsed);
        setFeedback({ type: 'success', message: `Successfully loaded ${parsed.length} neighborhoods from CSV.` });
      } catch (err) {
        setFeedback({ type: 'error', message: err.message || 'Failed to parse CSV file.' });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Download sample template CSV
  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Neighborhood Name,Latitude,Longitude,Daily Orders\n" +
      "Koramangala,12.9352,77.6245,4200\n" +
      "Indiranagar,12.9784,77.6408,3800\n" +
      "Whitefield,12.9698,77.7500,5200\n" +
      "Electronic City,12.8452,77.6602,4600\n" +
      "HSR Layout,12.9121,77.6446,3900";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "gridpoint_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export current dataset to CSV
  const handleExportCurrentData = () => {
    if (neighborhoods.length === 0) return;
    const header = "Neighborhood Name,Latitude,Longitude,Daily Orders\n";
    const rows = neighborhoods.map((n) => `"${n.name}",${n.lat},${n.lng},${n.daily_orders}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + header + rows;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gridpoint_dataset_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add individual row manually
  const handleAddManualNode = (e) => {
    e.preventDefault();
    if (!manualRow.name || !manualRow.lat || !manualRow.lng || !manualRow.daily_orders) {
      setFeedback({ type: 'error', message: 'All 4 fields are required to add a new neighborhood.' });
      return;
    }

    const lat = parseFloat(manualRow.lat);
    const lng = parseFloat(manualRow.lng);
    const orders = parseInt(manualRow.daily_orders, 10);

    if (isNaN(lat) || isNaN(lng) || isNaN(orders)) {
      setFeedback({ type: 'error', message: 'Latitude, Longitude, and Daily Orders must be valid numbers.' });
      return;
    }

    addNeighborhood({
      id: `MANUAL-${Date.now()}`,
      name: manualRow.name.trim(),
      lat: Math.round(lat * 10000) / 10000,
      lng: Math.round(lng * 10000) / 10000,
      daily_orders: Math.max(1, orders)
    });

    setManualRow({ name: '', lat: '', lng: '', daily_orders: '' });
    setFeedback({ type: 'success', message: `Added "${manualRow.name}" to dataset.` });
  };

  // Clear manual inputs
  const handleClearManualForm = () => {
    setManualRow({ name: '', lat: '', lng: '', daily_orders: '' });
    setFeedback({ type: 'success', message: 'Cleared manual entry inputs.' });
  };

  // Clear all data points
  const handleClearAll = () => {
    clearData();
    setFeedback({ type: 'success', message: 'All dataset points cleared. Ready for fresh input.' });
  };

  // Trigger optimization directly from data management
  const handleRunOptimization = async () => {
    if (neighborhoods.length === 0) {
      loadSampleData();
    }
    const res = await executeOptimization();
    if (res) {
      navigate('/results');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Data Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure your delivery demand nodes via CSV upload or manual coordinates.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              loadSampleData();
              setFeedback({ type: 'success', message: 'Loaded 16 canonical Bengaluru corridors.' });
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Load Sample (16 BLR)</span>
          </button>

          <button
            onClick={handleExportCurrentData}
            disabled={neighborhoods.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {neighborhoods.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              title="Clear all points to start fresh"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>Clear All Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification Banner */}
      {feedback && (
        <div className={`p-3.5 rounded-lg border text-xs flex items-center justify-between ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="underline hover:opacity-80">Dismiss</button>
        </div>
      )}

      {/* REPLACED INPUT SECTION: SPLIT-LAYOUT (Option A: Upload CSV | Option B: Manual Data Entry) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* OPTION A: UPLOAD CSV DATASET */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Option A: Upload CSV Dataset</span>
            </h2>
            <button
              onClick={handleDownloadTemplate}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Template</span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Upload any CSV containing <code>Neighborhood</code>, <code>Latitude</code>, <code>Longitude</code>, and <code>Daily Orders</code>.
          </p>

          {/* Drag & Drop Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 rounded-lg p-6 text-center cursor-pointer transition-colors group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
            <div className="w-10 h-10 mx-auto rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-blue-600 group-hover:border-blue-300 shadow-sm transition-colors">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700 mt-2 group-hover:text-blue-700">
              Click to browse or drop CSV file
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Supports UTF-8 formatted CSV</p>
          </div>

          {/* Action Row: Preload Sample & Clear CSV */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                loadSampleData();
                setFeedback({ type: 'success', message: 'Preloaded 16 authentic Bengaluru delivery corridors.' });
              }}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Preload Sample BLR (16 Corridors)</span>
            </button>

            {neighborhoods.length > 0 && (
              <button
                onClick={handleClearAll}
                className="py-2 px-3 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center space-x-1"
                title="Clear CSV / Reset all points"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* OPTION B: MANUAL DATA ENTRY */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Option B: Manual Data Entry</span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">{neighborhoods.length} Points in Memory</span>
              {(manualRow.name || manualRow.lat || manualRow.lng || manualRow.daily_orders) && (
                <button
                  onClick={handleClearManualForm}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                  title="Clear inputs"
                >
                  Clear Form
                </button>
              )}
            </div>
          </div>

          {/* Inline Add Node Form */}
          <form onSubmit={handleAddManualNode} className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <input
                type="text"
                placeholder="Name (e.g. MG Road)"
                value={manualRow.name}
                onChange={(e) => setManualRow({ ...manualRow, name: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <input
                type="number"
                step="any"
                placeholder="Lat (e.g. 12.97)"
                value={manualRow.lat}
                onChange={(e) => setManualRow({ ...manualRow, lat: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <input
                type="number"
                step="any"
                placeholder="Lng (e.g. 77.59)"
                value={manualRow.lng}
                onChange={(e) => setManualRow({ ...manualRow, lng: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Orders (e.g. 3000)"
                value={manualRow.daily_orders}
                onChange={(e) => setManualRow({ ...manualRow, daily_orders: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="col-span-2 sm:col-span-4 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors flex items-center justify-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Add Node to Dataset</span>
              </button>
            </div>
          </form>

          {/* Compact Scrollable Mini-Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden max-h-44 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Location</th>
                  <th className="py-2 px-2">Lat, Lng</th>
                  <th className="py-2 px-2">Orders</th>
                  <th className="py-2 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {neighborhoods.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400 font-sans">
                      No nodes loaded. Upload CSV or enter coordinates above.
                    </td>
                  </tr>
                ) : (
                  neighborhoods.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50 font-sans">
                      <td className="py-1.5 px-3 font-medium text-slate-800 truncate max-w-[120px]">{n.name}</td>
                      <td className="py-1.5 px-2 text-slate-500 font-mono text-[10px]">{n.lat.toFixed(2)}, {n.lng.toFixed(2)}</td>
                      <td className="py-1.5 px-2 text-blue-600 font-semibold">{n.daily_orders.toLocaleString()}</td>
                      <td className="py-1.5 px-2 text-right">
                        <button
                          onClick={() => removeNeighborhood(n.id)}
                          className="text-slate-400 hover:text-rose-600 p-0.5"
                          title="Remove node"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* PROMINENT ACTION BUTTON: RUN OPTIMIZATION */}
      <div className="pt-2">
        <button
          onClick={handleRunOptimization}
          disabled={isOptimizing || neighborhoods.length === 0}
          className="w-full py-4 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-base tracking-wider uppercase shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          <Zap className="w-5 h-5 text-amber-300" />
          <span>{isOptimizing ? 'COMPUTING OPTIMIZATION MATRIX...' : 'RUN OPTIMIZATION'}</span>
          <ArrowRight className="w-5 h-5 ml-1" />
        </button>
        {neighborhoods.length === 0 && (
          <p className="text-center text-xs text-slate-400 mt-2">
            * Add demand nodes above or click "Preload Sample BLR" to enable optimization.
          </p>
        )}
      </div>

      {/* LIVE DEMAND REGISTRY (PRESERVED AS REQUESTED) */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-base font-bold text-slate-900">Live Demand Registry</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {neighborhoods.length} Points
            </span>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              ({totalOrders.toLocaleString()} Total Daily Orders)
            </span>
          </div>
          <span className="text-xs text-slate-500">Click any cell to edit coordinates directly</span>
        </div>

        {neighborhoods.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm text-slate-600">No neighborhood points loaded yet.</p>
            <button
              onClick={loadSampleData}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load 16 Bengaluru Locations</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Neighborhood Name</th>
                  <th className="py-2.5 px-4">Latitude</th>
                  <th className="py-2.5 px-4">Longitude</th>
                  <th className="py-2.5 px-4">Daily Orders</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {neighborhoods.map((n, idx) => (
                  <tr key={n.id} className="hover:bg-slate-50 transition-colors font-sans">
                    <td className="py-2 px-4 text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-4 font-medium text-slate-900">
                      <input
                        type="text"
                        value={n.name}
                        onChange={(e) => updateNeighborhood(n.id, 'name', e.target.value)}
                        className="bg-transparent hover:bg-slate-100 focus:bg-white px-2 py-1 rounded border border-transparent focus:border-blue-600 focus:outline-none w-full text-slate-900"
                      />
                    </td>
                    <td className="py-2 px-4 text-slate-600">
                      <input
                        type="number"
                        step="any"
                        value={n.lat}
                        onChange={(e) => updateNeighborhood(n.id, 'lat', parseFloat(e.target.value) || 0)}
                        className="bg-transparent hover:bg-slate-100 focus:bg-white px-2 py-1 rounded border border-transparent focus:border-blue-600 focus:outline-none w-24 text-slate-700 font-mono"
                      />
                    </td>
                    <td className="py-2 px-4 text-slate-600">
                      <input
                        type="number"
                        step="any"
                        value={n.lng}
                        onChange={(e) => updateNeighborhood(n.id, 'lng', parseFloat(e.target.value) || 0)}
                        className="bg-transparent hover:bg-slate-100 focus:bg-white px-2 py-1 rounded border border-transparent focus:border-blue-600 focus:outline-none w-24 text-slate-700 font-mono"
                      />
                    </td>
                    <td className="py-2 px-4 text-blue-600 font-semibold">
                      <input
                        type="number"
                        value={n.daily_orders}
                        onChange={(e) => updateNeighborhood(n.id, 'daily_orders', parseInt(e.target.value, 10) || 0)}
                        className="bg-transparent hover:bg-slate-100 focus:bg-white px-2 py-1 rounded border border-transparent focus:border-blue-600 focus:outline-none w-24 text-blue-600 font-mono"
                      />
                    </td>
                    <td className="py-2 px-4 text-right">
                      <button
                        onClick={() => removeNeighborhood(n.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete node"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
