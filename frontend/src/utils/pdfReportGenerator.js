import jsPDF from 'jspdf';
import { WAREHOUSE_COLORS } from './sampleData';

/**
 * Generate a high-resolution Canvas map picture showing pointed warehouses and their connections.
 */
function generateMapPictureCanvas(warehouses, assignments, neighborhoods, maxDeliveryRadiusKm) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');

  // Background - Sleek Dark Matrix Logistics Aesthetic
  ctx.fillStyle = '#0b1120';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // All coordinates
  const allPoints = [
    ...warehouses.map(w => ({ lat: w.lat, lng: w.lng })),
    ...assignments.map(a => ({ lat: a.lat, lng: a.lng }))
  ];

  if (allPoints.length === 0) {
    return canvas.toDataURL('image/png');
  }

  const lats = allPoints.map(p => p.lat);
  const lngs = allPoints.map(p => p.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Add padding around bounds
  const latSpan = Math.max(0.04, (maxLat - minLat) * 1.3);
  const lngSpan = Math.max(0.04, (maxLng - minLng) * 1.3);
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  const adjMinLat = centerLat - latSpan / 2;
  const adjMaxLat = centerLat + latSpan / 2;
  const adjMinLng = centerLng - lngSpan / 2;
  const adjMaxLng = centerLng + lngSpan / 2;

  const padX = 70;
  const padTop = 60;
  const padBottom = 80;
  const mapW = canvas.width - padX * 2;
  const mapH = canvas.height - padTop - padBottom;

  function toScreen(lat, lng) {
    const x = padX + ((lng - adjMinLng) / (adjMaxLng - adjMinLng)) * mapW;
    const y = padTop + ((adjMaxLat - lat) / (adjMaxLat - adjMinLat)) * mapH;
    return { x, y };
  }

  // Draw Grid Lines
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 6; i++) {
    const y = padTop + (mapH / 6) * i;
    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(padX + mapW, y);
    ctx.stroke();

    const x = padX + (mapW / 6) * i;
    ctx.beginPath();
    ctx.moveTo(x, padTop);
    ctx.lineTo(x, padTop + mapH);
    ctx.stroke();
  }

  // Title on Map
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('GEOSPATIAL NETWORK: WAREHOUSE HUBS & ROUTE ASSIGNMENTS', padX, 36);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px sans-serif';
  ctx.fillText('Bengaluru Metropolitan Logistics Corridors • Capacitated Voronoi Partitioning', padX, 52);

  // 1. Draw SLA Coverage Boundary Circles around Warehouses
  warehouses.forEach((wh, idx) => {
    const color = WAREHOUSE_COLORS[idx % WAREHOUSE_COLORS.length];
    const pt = toScreen(wh.lat, wh.lng);

    // Estimate radius in pixels based on maxDeliveryRadiusKm
    // Approx 1 deg lat ~ 111 km
    const radiusDeg = (wh.max_radius_km || maxDeliveryRadiusKm || 15) / 111;
    const radiusPx = (radiusDeg / latSpan) * mapH;

    ctx.save();
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, Math.max(20, radiusPx), 0, Math.PI * 2);
    ctx.fillStyle = `${color}12`;
    ctx.fill();
    ctx.strokeStyle = `${color}55`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.restore();
  });

  // 2. Draw Connecting Route Lines from Warehouses to Assigned Demand Nodes
  const whMap = {};
  warehouses.forEach((wh, idx) => {
    whMap[wh.id] = {
      ...wh,
      screen: toScreen(wh.lat, wh.lng),
      color: WAREHOUSE_COLORS[idx % WAREHOUSE_COLORS.length]
    };
  });

  assignments.forEach((a) => {
    const wh = whMap[a.assigned_warehouse_id];
    if (!wh) return;

    const nodePt = toScreen(a.lat, a.lng);

    ctx.beginPath();
    ctx.moveTo(wh.screen.x, wh.screen.y);
    ctx.lineTo(nodePt.x, nodePt.y);
    ctx.strokeStyle = a.is_radius_violation ? '#f43f5e' : `${wh.color}99`;
    ctx.lineWidth = a.is_radius_violation ? 2 : 1.5;
    ctx.stroke();
  });

  // 3. Draw Customer Demand Nodes (Dots & Labels)
  assignments.forEach((a) => {
    const pt = toScreen(a.lat, a.lng);
    const wh = whMap[a.assigned_warehouse_id];
    const color = wh ? wh.color : '#38bdf8';

    // Node Outer Glow
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = a.is_radius_violation ? '#ef4444' : color;
    ctx.fill();

    // Node Center
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Node Name & Orders Label
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px sans-serif';
    ctx.fillText(a.neighborhood_name, pt.x + 8, pt.y + 3);
  });

  // 4. Draw Warehouse Pins (Distinct pointed markers with Hub letter)
  warehouses.forEach((wh, idx) => {
    const color = WAREHOUSE_COLORS[idx % WAREHOUSE_COLORS.length];
    const char = String.fromCharCode(65 + idx);
    const pt = toScreen(wh.lat, wh.lng);

    // Glowing Aura
    const grad = ctx.createRadialGradient(pt.x, pt.y, 5, pt.x, pt.y, 28);
    grad.addColorStop(0, `${color}bb`);
    grad.addColorStop(1, `${color}00`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 28, 0, Math.PI * 2);
    ctx.fill();

    // Pin Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y + 14, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Warehouse Pin Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y - 4, 14, 0, Math.PI * 2);
    ctx.fill();

    // White Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Downward Pointer
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(pt.x - 7, pt.y + 4);
    ctx.lineTo(pt.x + 7, pt.y + 4);
    ctx.lineTo(pt.x, pt.y + 14);
    ctx.closePath();
    ctx.fill();

    // Hub Code Letter
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, pt.x, pt.y - 4);
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';

    // Label above Hub
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    const hubLabel = `Hub ${char}: ${wh.name}`;
    const textWidth = ctx.measureText(hubLabel).width;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(pt.x - textWidth / 2 - 6, pt.y - 32, textWidth + 12, 18);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(hubLabel, pt.x - textWidth / 2, pt.y - 19);
  });

  // 5. Legend Bar at Bottom
  const legendY = canvas.height - 35;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(padX, legendY - 18, mapW, 36);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(padX, legendY - 18, mapW, 36);

  let legX = padX + 20;
  ctx.font = 'bold 11px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('LEGEND:', legX, legendY + 4);
  legX += 65;

  warehouses.forEach((wh, idx) => {
    const color = WAREHOUSE_COLORS[idx % WAREHOUSE_COLORS.length];
    const char = String.fromCharCode(65 + idx);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(legX, legendY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Hub ${char} (${wh.total_orders_assigned.toLocaleString()} orders)`, legX + 12, legendY + 4);

    legX += 175;
  });

  // Connection Line in Legend
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(legX, legendY);
  ctx.lineTo(legX + 20, legendY);
  ctx.stroke();
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Assigned Route Flow', legX + 26, legendY + 4);

  return canvas.toDataURL('image/png');
}

/**
 * Generate Trade-Off Curve Chart Canvas highlighting the current implementation choice.
 */
function generateTradeoffChartCanvas(tradeoffCurve, currentNumWarehouses) {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');

  // Clean White / Slate Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!tradeoffCurve || tradeoffCurve.length === 0) {
    return canvas.toDataURL('image/png');
  }

  const padX = 80;
  const padY = 50;
  const w = canvas.width - padX * 2;
  const h = canvas.height - padY * 2 - 30;

  // Find max cost for scale
  const allCosts = tradeoffCurve.flatMap(d => [d.fixed_cost, d.delivery_cost, d.total_cost]);
  const maxCost = Math.max(...allCosts) * 1.15;

  // Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('NETWORK CAPACITY & COST TRADE-OFF CURVE (CapEx vs. OpEx)', padX, 28);

  ctx.fillStyle = '#64748b';
  ctx.font = '11px sans-serif';
  ctx.fillText('Facility Lease Fixed Overhead vs. Dynamic Transport Delivery Cost Across K = 1..5 Warehouses', padX, 42);

  // Axes
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, padY);
  ctx.lineTo(padX, padY + h);
  ctx.lineTo(padX + w, padY + h);
  ctx.stroke();

  // Y-axis gridlines & labels
  ctx.fillStyle = '#64748b';
  ctx.font = '10px monospace';
  for (let i = 0; i <= 5; i++) {
    const val = (maxCost / 5) * i;
    const y = padY + h - (h / 5) * i;

    ctx.strokeStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(padX + w, y);
    ctx.stroke();

    ctx.fillText(`₹${(val / 1000).toFixed(0)}k`, 25, y + 3);
  }

  // Calculate coordinates for each data point
  const n = tradeoffCurve.length;
  const points = tradeoffCurve.map((d, i) => {
    const x = padX + (w / (n - 1 || 1)) * i;
    const yFixed = padY + h - (d.fixed_cost / maxCost) * h;
    const yDelivery = padY + h - (d.delivery_cost / maxCost) * h;
    const yTotal = padY + h - (d.total_cost / maxCost) * h;
    return { ...d, x, yFixed, yDelivery, yTotal };
  });

  // 1. Draw Fixed Cost Line (Dashed Blue)
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.yFixed);
    else ctx.lineTo(p.x, p.yFixed);
  });
  ctx.stroke();
  ctx.setLineDash([]);

  // 2. Draw Delivery Cost Line (Amber/Orange)
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.yDelivery);
    else ctx.lineTo(p.x, p.yDelivery);
  });
  ctx.stroke();

  // 3. Draw Total Cost Line (Emerald Green Bold)
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.yTotal);
    else ctx.lineTo(p.x, p.yTotal);
  });
  ctx.stroke();

  // 4. Highlight Present Implementation Situation
  const currentPt = points.find(p => p.num_warehouses === currentNumWarehouses) || points[Math.min(2, points.length - 1)];
  if (currentPt) {
    // Vertical highlight pillar
    ctx.fillStyle = 'rgba(37, 99, 235, 0.08)';
    ctx.fillRect(currentPt.x - 28, padY, 56, h);

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(currentPt.x, padY);
    ctx.lineTo(currentPt.x, padY + h);
    ctx.stroke();
    ctx.setLineDash([]);

    // Highlight star badge
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(currentPt.x, currentPt.yTotal, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Callout box on top of the point
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(currentPt.x - 75, currentPt.yTotal - 42, 150, 30);
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(currentPt.x - 75, currentPt.yTotal - 42, 150, 30);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`★ PRESENT SITUATION (${currentPt.num_warehouses} HUBS)`, currentPt.x, currentPt.yTotal - 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`Total: ₹${Math.round(currentPt.total_cost).toLocaleString()} / day`, currentPt.x, currentPt.yTotal - 14);
    ctx.textAlign = 'start';
  }

  // Draw points & X-axis labels
  points.forEach((p) => {
    // Draw dots
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(p.x, p.yFixed, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(p.x, p.yDelivery, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(p.x, p.yTotal, 5, 0, Math.PI * 2);
    ctx.fill();

    // X-axis label
    ctx.fillStyle = p.num_warehouses === currentNumWarehouses ? '#2563eb' : '#334155';
    ctx.font = p.num_warehouses === currentNumWarehouses ? 'bold 11px sans-serif' : '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${p.num_warehouses} Warehouses`, p.x, padY + h + 18);
    ctx.textAlign = 'start';
  });

  // Legend at bottom
  const legY = canvas.height - 18;
  let lx = padX + 40;

  // Fixed Overhead
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(lx, legY);
  ctx.lineTo(lx + 20, legY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#475569';
  ctx.font = '10px sans-serif';
  ctx.fillText('Fixed Facility Overhead', lx + 26, legY + 3);
  lx += 180;

  // Delivery Transport
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(lx, legY);
  ctx.lineTo(lx + 20, legY);
  ctx.stroke();
  ctx.fillStyle = '#475569';
  ctx.fillText('Dynamic Delivery Cost', lx + 26, legY + 3);
  lx += 180;

  // Grand Total Cost
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(lx, legY);
  ctx.lineTo(lx + 20, legY);
  ctx.stroke();
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('Grand Total Network Cost (Optimal)', lx + 26, legY + 3);

  return canvas.toDataURL('image/png');
}

/**
 * Generate Before vs After Comparative Bar Chart Canvas.
 */
function generateBeforeAfterChartCanvas(beforeAfter) {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const metrics = [
    {
      name: 'Daily Delivery Cost (₹)',
      before: beforeAfter.before_total_delivery_cost,
      after: beforeAfter.after_total_delivery_cost,
      savedPct: beforeAfter.delivery_cost_saved_pct,
      unit: '₹'
    },
    {
      name: 'Weighted Order Distance (km)',
      before: beforeAfter.before_total_weighted_distance_km,
      after: beforeAfter.after_total_weighted_distance_km,
      savedPct: beforeAfter.distance_saved_pct,
      unit: 'km'
    },
    {
      name: 'Total Transit Time (Hours)',
      before: beforeAfter.before_total_travel_time_hours,
      after: beforeAfter.after_total_travel_time_hours,
      savedPct: beforeAfter.time_saved_pct,
      unit: 'hrs'
    }
  ];

  const padX = 60;
  const colW = (canvas.width - padX * 2) / 3;

  metrics.forEach((m, idx) => {
    const colX = padX + colW * idx;
    const maxVal = Math.max(m.before, m.after) * 1.15;
    const barW = 48;
    const chartH = 140;
    const baseY = 220;

    // Card boundary
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(colX + 10, 20, colW - 20, 260);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(colX + 10, 20, colW - 20, 260);

    // Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(m.name, colX + colW / 2, 44);

    // Savings badge
    ctx.fillStyle = '#ecfdf5';
    ctx.fillRect(colX + colW / 2 - 45, 54, 90, 20);
    ctx.strokeStyle = '#a7f3d0';
    ctx.strokeRect(colX + colW / 2 - 45, 54, 90, 20);
    ctx.fillStyle = '#047857';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`↓ ${m.savedPct}% Saved`, colX + colW / 2, 68);

    // Bars
    const hBefore = (m.before / maxVal) * chartH;
    const hAfter = (m.after / maxVal) * chartH;

    const bX1 = colX + colW / 2 - barW - 6;
    const bX2 = colX + colW / 2 + 6;

    // Before Bar (Slate)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(bX1, baseY - hBefore, barW, hBefore);

    // After Bar (Royal Blue)
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(bX2, baseY - hAfter, barW, hAfter);

    // Value Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.fillText(
      m.unit === '₹' ? `₹${Math.round(m.before).toLocaleString()}` : `${Math.round(m.before).toLocaleString()} ${m.unit}`,
      bX1 + barW / 2,
      baseY - hBefore - 6
    );

    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(
      m.unit === '₹' ? `₹${Math.round(m.after).toLocaleString()}` : `${Math.round(m.after).toLocaleString()} ${m.unit}`,
      bX2 + barW / 2,
      baseY - hAfter - 6
    );

    // Legend under bars
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.fillText('1-Hub Base', bX1 + barW / 2, baseY + 18);
    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('Optimized', bX2 + barW / 2, baseY + 18);
  });

  ctx.textAlign = 'start';
  return canvas.toDataURL('image/png');
}

/**
 * Main PDF Export Function
 */
export async function generateOptimizationPDF(results, neighborhoods, settings) {
  const { before_after, summary, warehouses, assignments, tradeoff_curve, execution_time_ms } = results;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Header banner drawer helper
  function drawPageHeader(title, pageNum, totalPages = 3) {
    // Header Bar
    doc.setFillColor(15, 23, 42); // Deep Slate
    doc.rect(0, 0, pageWidth, 16, 'F');

    // Brand
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('GRIDPOINT LOGISTICS INTELLIGENCE', margin, 11);

    // Report Section Title
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text(title.toUpperCase(), margin + 85, 11);

    // Page Number
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin - 18, 11);

    // Footer Bar
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('GridPoint AI Optimization Platform • Capacitated Multi-Facility Logistics Report', margin, pageHeight - 7);
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), pageWidth - margin - 42, pageHeight - 7);
  }

  // =========================================================================
  // PAGE 1: EXECUTIVE SUMMARY, SAVINGS & BEFORE VS AFTER BENCHMARK
  // =========================================================================
  drawPageHeader('Executive Summary & Benchmark', 1, 3);

  let y = 24;

  // Document Title & Metadata
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Network Optimization Executive Report', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Target Region: Bengaluru Corridors (${neighborhoods.length} Demand Nodes)  |  Computed in: ${execution_time_ms} ms  |  Fleet: ${settings.fleet_type.toUpperCase()}`, margin, y);
  y += 8;

  // Executive Callout Banner
  doc.setFillColor(240, 249, 255); // Light Sky
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setTextColor(3, 105, 161);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('EXECUTIVE AUDIT SUMMARY', margin + 5, y + 6.5);

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const summaryText = `By upgrading from a single centralized facility to an algorithmically clustered ${settings.num_warehouses}-hub fulfillment network, the logistics architecture cuts dynamic delivery costs by ${before_after.delivery_cost_saved_pct}% (saving ₹${before_after.delivery_cost_saved.toLocaleString()} per day), slashes weighted transit distance by ${before_after.distance_saved_pct}% (${before_after.distance_saved_km.toLocaleString()} order-km daily), and accelerates order arrival speed by ${before_after.time_saved_pct}%.`;
  const splitSummary = doc.splitTextToSize(summaryText, contentWidth - 10);
  doc.text(splitSummary, margin + 5, y + 12);
  y += 30;

  // 4 KPI Highlights
  const kpiW = (contentWidth - 9) / 4;
  const kpis = [
    { label: 'DAILY DELIVERY SAVINGS', val: `₹${before_after.delivery_cost_saved.toLocaleString()}`, sub: `${before_after.delivery_cost_saved_pct}% reduction`, color: [16, 185, 129] },
    { label: 'WEIGHTED KM SLASHED', val: `${before_after.distance_saved_km.toLocaleString()} km`, sub: `${before_after.distance_saved_pct}% fewer order-km`, color: [37, 99, 235] },
    { label: 'TRANSIT TIME RECLAIMED', val: `${before_after.time_saved_hours} hrs`, sub: `${before_after.time_saved_pct}% faster delivery`, color: [99, 102, 241] },
    { label: 'FLEET FUEL EXPENSE', val: `₹${summary.total_fuel_cost.toLocaleString()}`, sub: `${settings.traffic_condition.toUpperCase()} city traffic`, color: [245, 158, 11] }
  ];

  kpis.forEach((kpi, i) => {
    const kx = margin + (kpiW + 3) * i;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(kx, y, kpiW, 22, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, kx + 4, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, kx + 4, y + 12.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.sub, kx + 4, y + 18);
  });
  y += 28;

  // Before vs After Benchmark Table
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Before vs. After Optimization Benchmark', margin, y);
  y += 4;

  // Table Headers
  const colX = [margin, margin + 55, margin + 105, margin + 145];
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y + 7, margin + contentWidth, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(71, 85, 105);
  doc.text('PERFORMANCE METRIC', colX[0] + 3, y + 4.8);
  doc.text('BASELINE (1 CENTRAL HUB)', colX[1], y + 4.8);
  doc.text(`OPTIMIZED (${settings.num_warehouses} HUBS)`, colX[2], y + 4.8);
  doc.text('NET IMPACT / SAVINGS', colX[3], y + 4.8);
  y += 7;

  // Benchmark Rows
  const tableRows = [
    {
      metric: 'Active Fulfillment Facilities',
      before: `${before_after.before_num_warehouses} Central Hub (Baseline)`,
      after: `${before_after.after_num_warehouses} Regional Distributed Hubs`,
      impact: `+${before_after.after_num_warehouses - 1} Regional Facilities`,
      highlight: false
    },
    {
      metric: 'Weighted Order Distance',
      before: `${before_after.before_total_weighted_distance_km.toLocaleString()} order-km`,
      after: `${before_after.after_total_weighted_distance_km.toLocaleString()} order-km`,
      impact: `↓ ${before_after.distance_saved_pct}% (-${before_after.distance_saved_km.toLocaleString()} km)`,
      highlight: true
    },
    {
      metric: 'Daily Delivery Transit Cost',
      before: `₹${before_after.before_total_delivery_cost.toLocaleString()}`,
      after: `₹${before_after.after_total_delivery_cost.toLocaleString()}`,
      impact: `↓ ${before_after.delivery_cost_saved_pct}% (-₹${before_after.delivery_cost_saved.toLocaleString()})`,
      highlight: true
    },
    {
      metric: 'Fleet Fuel Cost',
      before: `₹${before_after.before_total_fuel_cost.toLocaleString()}`,
      after: `₹${before_after.after_total_fuel_cost.toLocaleString()}`,
      impact: `↓ ₹${(before_after.before_total_fuel_cost - before_after.after_total_fuel_cost).toFixed(0)} saved/day`,
      highlight: true
    },
    {
      metric: 'Total Transit Duration',
      before: `${before_after.before_total_travel_time_hours.toLocaleString()} hours`,
      after: `${before_after.after_total_travel_time_hours.toLocaleString()} hours`,
      impact: `↓ ${before_after.time_saved_pct}% (-${before_after.time_saved_hours} hrs)`,
      highlight: true
    },
    {
      metric: `SLA Radius Breaches (> ${settings.max_delivery_radius_km} km)`,
      before: `${before_after.before_radius_violations_count} breaches`,
      after: `${before_after.after_radius_violations_count} breaches`,
      impact: before_after.before_radius_violations_count - before_after.after_radius_violations_count > 0 ? `↓ ${before_after.before_radius_violations_count - before_after.after_radius_violations_count} eliminated` : 'Within SLA Limits',
      highlight: false
    }
  ];

  tableRows.forEach((row, rIdx) => {
    if (rIdx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 6.8, 'F');
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 6.8, margin + contentWidth, y + 6.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(row.metric, colX[0] + 3, y + 4.8);

    doc.setTextColor(100, 116, 139);
    doc.text(row.before, colX[1], y + 4.8);

    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.text(row.after, colX[2], y + 4.8);

    doc.setTextColor(row.highlight ? 4 : 51, row.highlight ? 120 : 65, row.highlight ? 87 : 85);
    doc.text(row.impact, colX[3], y + 4.8);

    y += 6.8;
  });
  y += 8;

  // Visual Comparative Bar Chart
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Key Comparative Performance Charts', margin, y);
  y += 4;

  const chartImg = generateBeforeAfterChartCanvas(before_after);
  doc.addImage(chartImg, 'PNG', margin, y, contentWidth, 58);
  y += 60;

  // Capacity Overload or Rebalancing Alert Callout on Page 1
  if (summary.is_total_capacity_exceeded) {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(248, 113, 113);
    doc.roundedRect(margin, y, contentWidth, 15, 1.5, 1.5, 'FD');
    doc.setTextColor(185, 28, 28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.text('NETWORK CAPACITY OVERLOAD ALERT: DEMAND EXCEEDS COMBINED CAPACITY', margin + 4, y + 5);
    doc.setTextColor(127, 29, 29);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    const alertMsg = `Total demand (${summary.total_daily_orders.toLocaleString()} orders) exceeds combined warehouse capacity (${summary.total_capacity.toLocaleString()} orders) by ${((summary.capacity_deficit_orders || (summary.total_daily_orders - summary.total_capacity))).toLocaleString()} orders. All hubs are saturated.`;
    doc.text(doc.splitTextToSize(alertMsg, contentWidth - 8), margin + 4, y + 9.5);
  } else if (summary.reallocation_events && summary.reallocation_events.length > 0) {
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(margin, y, contentWidth, 15, 1.5, 1.5, 'FD');
    doc.setTextColor(180, 83, 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.text(`DYNAMIC SPILLOVER CAPACITY BALANCING ACTIVE (${summary.reallocation_events.length} CORRIDORS REASSIGNED)`, margin + 4, y + 5);
    doc.setTextColor(146, 64, 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    const balMsg = `One or more warehouses reached capacity while nearby facilities had spare capacity. Excess demand corridors were automatically redirected to the nearest available hubs.`;
    doc.text(doc.splitTextToSize(balMsg, contentWidth - 8), margin + 4, y + 9.5);
  }

  // =========================================================================
  // PAGE 2: GEOSPATIAL MAP PICTURE & WAREHOUSE CLUSTER AUDIT
  // =========================================================================
  doc.addPage();
  drawPageHeader('Geospatial Map & Cluster Breakdown', 2, 3);

  y = 24;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('Geospatial Network: Pointed Warehouses & Route Connections', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Pointed fulfillment hubs (A, B, C...) with straight connection lines to assigned demand delivery corridors.', margin, y);
  y += 6;

  // Generate & Insert High-Resolution Map Picture
  const mapImg = generateMapPictureCanvas(warehouses, assignments, neighborhoods, settings.max_delivery_radius_km);
  doc.addImage(mapImg, 'PNG', margin, y, contentWidth, 105);
  y += 112;

  // Active Fulfillment Facilities Breakdown Table
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Active Fulfillment Hubs Breakdown', margin, y);
  y += 4;

  // Hubs Table Header
  const hubCols = [margin, margin + 45, margin + 85, margin + 115, margin + 145];
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y + 7, margin + contentWidth, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(71, 85, 105);
  doc.text('FACILITY HUB', hubCols[0] + 3, y + 4.8);
  doc.text('COORDINATES (LAT, LNG)', hubCols[1], y + 4.8);
  doc.text('ASSIGNED DEMAND', hubCols[2], y + 4.8);
  doc.text('CAPACITY LOAD', hubCols[3], y + 4.8);
  doc.text('SERVICE FOOTPRINT', hubCols[4], y + 4.8);
  y += 7;

  warehouses.forEach((wh, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 8, 'F');
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 8, margin + contentWidth, y + 8);

    // Hub Code and Name
    const char = String.fromCharCode(65 + idx);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(37, 99, 235);
    doc.text(`Hub ${char}: ${wh.name}`, hubCols[0] + 3, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${wh.lat.toFixed(4)}, ${wh.lng.toFixed(4)}`, hubCols[1], y + 5);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`${wh.total_orders_assigned.toLocaleString()} orders/day`, hubCols[2], y + 5);

    doc.setTextColor(wh.utilization_pct > 100 ? 220 : wh.utilization_pct > 90 ? 217 : 4, wh.utilization_pct > 100 ? 38 : wh.utilization_pct > 90 ? 119 : 120, wh.utilization_pct > 100 ? 38 : wh.utilization_pct > 90 ? 6 : 87);
    const divertTag = wh.orders_diverted_out > 0 ? ` (Diverted ${wh.orders_diverted_out})` : (wh.orders_received_in > 0 ? ` (+${wh.orders_received_in})` : '');
    doc.text(`${wh.utilization_pct}% of ${wh.capacity_limit.toLocaleString()} cap${divertTag}`, hubCols[3], y + 5);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(`${wh.assigned_neighborhood_count} corridors (Max ${wh.max_radius_km || 12} km)`, hubCols[4], y + 5);

    y += 8;
  });

  // =========================================================================
  // PAGE 3: NETWORK TRADE-OFF CURVE & PRESENT IMPLEMENTATION SITUATION
  // =========================================================================
  doc.addPage();
  drawPageHeader('Trade-Off Analysis & Present Situation', 3, 3);

  y = 24;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('Network Capacity & Cost Trade-Off Analysis', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Economic evaluation demonstrating what happens when we implement 1 to 5 warehouses versus our present ${settings.num_warehouses}-hub decision.`, margin, y);
  y += 6;

  // Insert Trade-Off Curve Chart Canvas
  const tradeoffImg = generateTradeoffChartCanvas(tradeoff_curve, settings.num_warehouses);
  doc.addImage(tradeoffImg, 'PNG', margin, y, contentWidth, 75);
  y += 81;

  // Trade-off Evaluation Table
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Trade-Off Matrix: Present Situation vs Alternative Network Scales', margin, y);
  y += 4;

  const tCols = [margin, margin + 35, margin + 75, margin + 115, margin + 155];
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y + 7, margin + contentWidth, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(71, 85, 105);
  doc.text('NETWORK SCALE', tCols[0] + 3, y + 4.8);
  doc.text('FIXED OVERHEAD', tCols[1], y + 4.8);
  doc.text('DELIVERY OPEX', tCols[2], y + 4.8);
  doc.text('TOTAL DAILY COST', tCols[3], y + 4.8);
  doc.text('STATUS / EVALUATION', tCols[4], y + 4.8);
  y += 7;

  (tradeoff_curve || []).forEach((row) => {
    const isCurrent = row.num_warehouses === settings.num_warehouses;

    if (isCurrent) {
      doc.setFillColor(239, 246, 255); // Highlight present situation in blue
      doc.rect(margin, y, contentWidth, 7.5, 'F');
    } else if (row.num_warehouses % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 7.5, 'F');
    }

    doc.setDrawColor(isCurrent ? 147 : 241, isCurrent ? 197 : 245, isCurrent ? 253 : 249);
    doc.line(margin, y + 7.5, margin + contentWidth, y + 7.5);

    doc.setFont('helvetica', isCurrent ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.setTextColor(isCurrent ? 37 : 15, isCurrent ? 99 : 23, isCurrent ? 235 : 42);
    doc.text(`${row.num_warehouses} Warehouses ${isCurrent ? '★' : ''}`, tCols[0] + 3, y + 5);

    doc.setTextColor(100, 116, 139);
    doc.text(`₹${row.fixed_cost.toLocaleString()}`, tCols[1], y + 5);
    doc.text(`₹${Math.round(row.delivery_cost).toLocaleString()}`, tCols[2], y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isCurrent ? 37 : 15, isCurrent ? 99 : 23, isCurrent ? 235 : 42);
    doc.text(`₹${Math.round(row.total_cost).toLocaleString()}`, tCols[3], y + 5);

    if (isCurrent) {
      doc.setTextColor(4, 120, 87);
      doc.text('PRESENT DEPLOYMENT', tCols[4], y + 5);
    } else if (row.num_warehouses === 1) {
      doc.setTextColor(100, 116, 139);
      doc.text('Legacy Central Baseline', tCols[4], y + 5);
    } else {
      doc.setTextColor(100, 116, 139);
      doc.text(`Avg Radius: ${row.avg_distance_km} km`, tCols[4], y + 5);
    }

    y += 7.5;
  });
  y += 10;

  // Demand Node Corridors Summary Sample
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(`Demand Node Fulfillment Audit (${assignments.length} Total Corridors)`, margin, y);
  y += 4;

  const cCols = [margin, margin + 45, margin + 85, margin + 115, margin + 145];
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('CORRIDOR', cCols[0] + 3, y + 4.5);
  doc.text('DAILY ORDERS', cCols[1], y + 4.5);
  doc.text('ASSIGNED HUB', cCols[2], y + 4.5);
  doc.text('DISTANCE', cCols[3], y + 4.5);
  doc.text('TRANSIT TIME', cCols[4], y + 4.5);
  y += 6.5;

  assignments.slice(0, 6).forEach((a, i) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(a.neighborhood_name, cCols[0] + 3, y + 4.5);
    doc.text(`${a.daily_orders_effective.toLocaleString()} orders`, cCols[1], y + 4.5);
    doc.setTextColor(37, 99, 235);
    doc.text(a.assigned_warehouse_name, cCols[2], y + 4.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${a.distance_km} km`, cCols[3], y + 4.5);
    doc.text(`${a.delivery_time_mins} mins`, cCols[4], y + 4.5);
    y += 6;
  });

  if (assignments.length > 6) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`... and ${assignments.length - 6} additional corridors registered in network. Complete audit available in application.`, margin + 3, y + 4);
  }

  // Save the PDF file
  const fileName = `GridPoint_Optimization_Report_${Date.now()}.pdf`;
  doc.save(fileName);
}
