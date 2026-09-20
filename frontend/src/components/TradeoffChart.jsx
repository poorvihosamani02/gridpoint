import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceDot
} from 'recharts';

export default function TradeoffChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        Run optimization to calculate trade-off curve
      </div>
    );
  }

  // Format currency for chart tooltip & axes
  const formatCurrency = (val) => `₹${(val / 1000).toFixed(0)}k`;

  const optimalPoint = data.find((d) => d.is_optimal_recommendation) || data[0];

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Infrastructure vs. Delivery Cost Trade-off Curve</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Balancing fixed facility lease overhead against variable fleet delivery costs across K = 1 to 5.
          </p>
        </div>
        {optimalPoint && (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span>Optimal Sweet Spot:</span>
            <span className="font-bold underline">{optimalPoint.num_warehouses} Hubs</span>
            <span>(₹{optimalPoint.total_cost.toLocaleString()}/day)</span>
          </div>
        )}
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 15, right: 15, bottom: 15, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
            <XAxis
              dataKey="num_warehouses"
              stroke="#64748b"
              tickFormatter={(val) => `${val} Hubs`}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis
              stroke="#64748b"
              tickFormatter={formatCurrency}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '0.375rem',
                color: '#0f172a',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value, name) => [`₹${Number(value).toLocaleString()}`, name]}
              labelFormatter={(label) => `${label} Warehouse Facilities`}
            />
            <Legend
              wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }}
              iconType="circle"
            />
            
            {/* Fixed Warehouse Cost (Bar) */}
            <Bar
              dataKey="fixed_cost"
              name="Fixed Warehouse Lease"
              fill="#cbd5e1"
              radius={[3, 3, 0, 0]}
              barSize={24}
            />
            {/* Variable Delivery Cost (Line) */}
            <Line
              type="monotone"
              dataKey="delivery_cost"
              name="Delivery & Fuel Cost"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4, fill: '#2563eb' }}
            />
            {/* Grand Total Cost Curve (Line) */}
            <Line
              type="monotone"
              dataKey="total_cost"
              name="Total Operational Cost"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 5, fill: '#10b981' }}
            />

            {optimalPoint && (
              <ReferenceDot
                x={optimalPoint.num_warehouses}
                y={optimalPoint.total_cost}
                r={7}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth={2}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
