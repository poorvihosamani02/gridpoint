import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Upload, 
  Plus, 
  Trash2, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  ArrowRight,
  TrendingUp,
  Truck,
  ShieldCheck,
  BarChart3,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import MetricCard from '../components/MetricCard';

export default function Dashboard() {
  const { 
    neighborhoods, 
    setNeighborhoods, 
    results, 
    loadSampleData, 
    isOptimizing, 
    executeOptimization,
    addNeighborhood,
    removeNeighborhood 
  } = useApp();

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // CHANGE 2: The Gate State Variable.
  // Nothing downstream renders until this button is clicked.
  const [hasRunOptimization, setHasRunOptimization] = useState(Boolean(results));
  const [feedback, setFeedback] = useState(null);

  // Form state for Manual Data Entry
  const [manualRow, setManualRow] = useState({
    name: '',
    lat: '',
    lng: '',
    daily_orders: ''
  });

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
          throw new Error('CSV must contain a header row and data rows.');
        }

        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('neighborhood'));
        const latIdx = headers.findIndex((h) => h.includes('lat'));
        const lngIdx = headers.findIndex((h) => h.includes('lng') || h.includes('lon'));
        const ordersIdx = headers.findIndex((h) => h.includes('order') || h.includes('demand') || h.includes('daily'));

        if (latIdx === -1 || lngIdx === -1 || ordersIdx === -1) {
          throw new Error('CSV requires Latitude, Longitude, and Daily Orders columns.');
        }

        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.trim());
          if (cols.length < 3) continue;

          const lat = parseFloat(cols[latIdx]);
          const lng = parseFloat(cols[lngIdx]);
          const orders = parseInt(cols[ordersIdx], 10);
          const name = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : `Node ${i}`;

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
          throw new Error('No valid coordinate rows found.');
        }

        setNeighborhoods(parsed);
        setFeedback({ type: 'success', message: `Loaded ${parsed.length} neighborhoods from CSV.` });
      } catch (err) {
        setFeedback({ type: 'error', message: err.message });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Manual Add Node
  const handleAddManualNode = (e) => {
    e.preventDefault();
    if (!manualRow.name || !manualRow.lat || !manualRow.lng || !manualRow.daily_orders) {
      setFeedback({ type: 'error', message: 'Please fill in all 4 fields.' });
      return;
    }

    const lat = parseFloat(manualRow.lat);
    const lng = parseFloat(manualRow.lng);
    const orders = parseInt(manualRow.daily_orders, 10);

    if (isNaN(lat) || isNaN(lng) || isNaN(orders)) {
      setFeedback({ type: 'error', message: 'Latitude, Longitude, and Orders must be numbers.' });
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
    setFeedback({ type: 'success', message: `Added "${manualRow.name}".` });
  };

  // Download template CSV
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

  // Handle RUN OPTIMIZATION Gate
  const handleRunOptimization = async () => {
    if (neighborhoods.length === 0) {
      loadSampleData();
    }
    const res = await executeOptimization();
    if (res) {
      setHasRunOptimization(true);
    }
  };

  const totalDemand = neighborhoods.reduce((sum, n) => sum + (Number(n.daily_orders) || 0), 0);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Heading: Bold, Clean & Minimal */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
              GridPoint
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Enterprise Warehouse Location Optimization & Logistics Demand Intelligence
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              {neighborhoods.length} Nodes Active
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {totalDemand.toLocaleString()} Daily Orders
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
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

      {/* CHANGE 2: Split-Layout for Data Input (Side-by-Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* LEFT COLUMN: Upload CSV */}
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

          {/* One-Click Sample Loader */}
          <div className="pt-2">
            <button
              onClick={() => {
                loadSampleData();
                setFeedback({ type: 'success', message: 'Preloaded 16 authentic Bengaluru delivery corridors.' });
              }}
              className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Preload Sample Bengaluru Data (16 Corridors)</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Manual Data Entry Table */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Option B: Manual Data Entry</span>
            </h2>
            <span className="text-xs text-slate-500">{neighborhoods.length} Points in Memory</span>
          </div>

          {/* Inline Add Row Form */}
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
            <div className="col-span-2 sm:col-span-4">
              <button
                type="submit"
                className="w-full py-2 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors flex items-center justify-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Add Node to Dataset</span>
              </button>
            </div>
          </form>

          {/* Concise Scrollable Table */}
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
                      No nodes added yet. Upload CSV or click sample data.
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

      {/* CHANGE 2: THE GATE - Large Prominent Primary Button */}
      <div className="pt-2">
        <button
          onClick={handleRunOptimization}
          disabled={isOptimizing || neighborhoods.length === 0}
          className="w-full py-4 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-base tracking-wider uppercase shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          <Zap className="w-5 h-5 text-amber-300" />
          <span>{isOptimizing ? 'COMPUTING OPTIMIZATION MATRIX...' : 'RUN OPTIMIZATION'}</span>
          <ArrowRight className="w-5 h-5 ml-1" />
        </button>
        {neighborhoods.length === 0 && (
          <p className="text-center text-xs text-slate-400 mt-2">
            * Please upload a CSV or click "Preload Sample Bengaluru Data" above to enable optimization.
          </p>
        )}
      </div>

      {/* CHANGE 2: GATE LOGIC
          Nothing below this point renders until 'RUN OPTIMIZATION' is clicked! */}
      {hasRunOptimization && results && (
        <div className="space-y-6 pt-6 border-t border-slate-200 animate-fadeIn">
          
          {/* Post-Run Success Callout */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-900">Optimization Matrix Successfully Computed</h3>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Calculated in {results.execution_time_ms} ms across {results.warehouses.length} warehouse hubs.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/results')}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-sm transition-all shrink-0"
            >
              <span>View Full Analytics & Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Delivery Cost Reduction"
              value={`${results.before_after.delivery_cost_saved_pct}%`}
              subtitle={`₹${results.before_after.delivery_cost_saved.toLocaleString()} daily savings`}
              icon={TrendingUp}
              highlightColor="emerald"
            />
            <MetricCard
              title="Daily Distance Slashed"
              value={`${results.before_after.distance_saved_km.toLocaleString()} km`}
              subtitle={`${results.before_after.distance_saved_pct}% improvement`}
              icon={Truck}
              highlightColor="brand"
            />
            <MetricCard
              title="Active Regional Hubs"
              value={`${results.warehouses.length} Facilities`}
              subtitle={`${results.summary.capacity_utilization_pct}% network capacity`}
              icon={Building2}
              highlightColor="purple"
            />
            <MetricCard
              title="SLA Compliance"
              value={`${results.summary.radius_violations_count} Breaches`}
              subtitle={`${results.summary.overflow_reassignments_count} overflow shifts`}
              icon={ShieldCheck}
              highlightColor={results.summary.radius_violations_count > 0 ? 'rose' : 'emerald'}
            />
          </div>

        </div>
      )}

    </div>
  );
}
