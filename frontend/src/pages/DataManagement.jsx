import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  Sparkles, 
  Check, 
  AlertCircle, 
  RefreshCw,
  FileText,
  MapPin,
  Package
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
    updateNeighborhood 
  } = useApp();

  const fileInputRef = useRef(null);
  const [feedback, setFeedback] = useState(null);
  const [newRow, setNewRow] = useState({
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
    link.setAttribute("download", "gridpoint_neighborhoods_template.csv");
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

  // Add new row manually
  const handleAddRow = (e) => {
    e.preventDefault();
    if (!newRow.name || !newRow.lat || !newRow.lng || !newRow.daily_orders) {
      setFeedback({ type: 'error', message: 'All fields are required to add a new neighborhood.' });
      return;
    }

    const lat = parseFloat(newRow.lat);
    const lng = parseFloat(newRow.lng);
    const orders = parseInt(newRow.daily_orders, 10);

    if (isNaN(lat) || isNaN(lng) || isNaN(orders)) {
      setFeedback({ type: 'error', message: 'Latitude, Longitude, and Daily Orders must be valid numbers.' });
      return;
    }

    addNeighborhood({
      id: `MANUAL-${Date.now()}`,
      name: newRow.name.trim(),
      lat: Math.round(lat * 10000) / 10000,
      lng: Math.round(lng * 10000) / 10000,
      daily_orders: Math.max(1, orders)
    });

    setNewRow({ name: '', lat: '', lng: '', daily_orders: '' });
    setFeedback({ type: 'success', message: `Added "${newRow.name}" to dataset.` });
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Data Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your network demand nodes. Upload CSV files or edit coordinates and order volumes inline.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={loadSampleData}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Bengaluru Sample (16 Hubs)</span>
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>CSV Template</span>
          </button>

          <button
            onClick={handleExportCurrentData}
            disabled={neighborhoods.length === 0}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          {neighborhoods.length > 0 && (
            <button
              onClick={clearData}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Drag & Drop Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center space-x-2">
              <Upload className="w-4 h-4 text-brand-400" />
              <span>Upload CSV Dataset</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select or drop any CSV file containing <code className="text-brand-300">Name</code>, <code className="text-brand-300">Latitude</code>, <code className="text-brand-300">Longitude</code>, and <code className="text-brand-300">Daily Orders</code>.
            </p>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-brand-500/70 bg-slate-950/40 hover:bg-slate-900/50 rounded-xl p-8 text-center cursor-pointer transition-all group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 group-hover:bg-brand-500/20 flex items-center justify-center text-slate-400 group-hover:text-brand-300 transition-colors">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs font-medium text-slate-300 mt-3 group-hover:text-white">
              Click to browse or drop CSV file
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Supports UTF-8 CSV</p>
          </div>

          {/* Quick Summary Pill */}
          <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 text-xs space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Total Neighborhoods:</span>
              <strong className="text-white font-mono">{neighborhoods.length}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Aggregate Demand:</span>
              <strong className="text-cyan-400 font-mono">{totalOrders.toLocaleString()} orders/day</strong>
            </div>
          </div>
        </div>

        {/* Manual Add Form */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center space-x-2">
              <Plus className="w-4 h-4 text-brand-400" />
              <span>Add Individual Neighborhood</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Manually append a geographic coordinate node and daily order volume to the live dataset.
            </p>
          </div>

          <form onSubmit={handleAddRow} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Neighborhood Name</label>
              <input
                type="text"
                placeholder="e.g. MG Road Central"
                value={newRow.name}
                onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 12.9716"
                value={newRow.lat}
                onChange={(e) => setNewRow({ ...newRow, lat: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 77.5946"
                value={newRow.lng}
                onChange={(e) => setNewRow({ ...newRow, lng: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Daily Orders</label>
              <input
                type="number"
                placeholder="e.g. 3500"
                value={newRow.daily_orders}
                onChange={(e) => setNewRow({ ...newRow, daily_orders: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-1">
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Node to Dataset</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Editable Table View */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-base font-semibold text-white">Live Demand Registry</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
              {neighborhoods.length} Points
            </span>
          </div>
          <span className="text-xs text-slate-400">Click any field to edit directly</span>
        </div>

        {neighborhoods.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">No neighborhood points loaded yet.</p>
            <button
              onClick={loadSampleData}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load 16 Bengaluru Locations</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Neighborhood Name</th>
                  <th className="py-3 px-4">Latitude</th>
                  <th className="py-3 px-4">Longitude</th>
                  <th className="py-3 px-4">Daily Orders</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {neighborhoods.map((n, idx) => (
                  <tr key={n.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-4 text-slate-500 font-sans">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-sans font-medium text-white">
                      <input
                        type="text"
                        value={n.name}
                        onChange={(e) => updateNeighborhood(n.id, 'name', e.target.value)}
                        className="bg-transparent hover:bg-slate-800/60 focus:bg-slate-900 px-2 py-1 rounded border border-transparent focus:border-brand-500 focus:outline-none w-full text-slate-200"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">
                      <input
                        type="number"
                        step="any"
                        value={n.lat}
                        onChange={(e) => updateNeighborhood(n.id, 'lat', parseFloat(e.target.value) || 0)}
                        className="bg-transparent hover:bg-slate-800/60 focus:bg-slate-900 px-2 py-1 rounded border border-transparent focus:border-brand-500 focus:outline-none w-28 text-slate-300"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">
                      <input
                        type="number"
                        step="any"
                        value={n.lng}
                        onChange={(e) => updateNeighborhood(n.id, 'lng', parseFloat(e.target.value) || 0)}
                        className="bg-transparent hover:bg-slate-800/60 focus:bg-slate-900 px-2 py-1 rounded border border-transparent focus:border-brand-500 focus:outline-none w-28 text-slate-300"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-cyan-400 font-semibold">
                      <input
                        type="number"
                        value={n.daily_orders}
                        onChange={(e) => updateNeighborhood(n.id, 'daily_orders', parseInt(e.target.value, 10) || 0)}
                        className="bg-transparent hover:bg-slate-800/60 focus:bg-slate-900 px-2 py-1 rounded border border-transparent focus:border-brand-500 focus:outline-none w-24 text-cyan-400"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => removeNeighborhood(n.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
