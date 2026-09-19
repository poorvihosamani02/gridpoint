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
      <div className="h-72 flex items-center justify-center text-slate-500 text-sm">
        Run optimization to view trade-off curve
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
          <h4 className="text-sm font-semibold text-white">Infrastructure vs. Delivery Cost Trade-off Curve</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Balancing fixed warehouse lease costs against delivery distance & fuel costs across K = 1 to 5.
          </p>
        </div>
        {optimalPoint && (
          <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span>Optimal Sweet Spot:</span>
            <span className="font-bold underline">{optimalPoint.num_warehouses} Warehouses</span>
            <span>(₹{optimalPoint.total_cost.toLocaleString()}/day)</span>
          </div>
        )}
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis
              dataKey="num_warehouses"
              stroke="#94a3b8"
              tickFormatter={(val) => `${val} Hubs`}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis
              stroke="#94a3b8"
              tickFormatter={formatCurrency}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.5rem',
                color: '#f8fafc',
                fontSize: '12px'
              }}
              formatter={(value, name) => [`₹${Number(value).toLocaleString()}`, name]}
              labelFormatter={(label) => `${label} Warehouse Facilities`}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
              iconType="circle"
            />
            
            {/* Fixed Warehouse Infrastructure Cost (Bar) */}
            <Bar
              dataKey="fixed_cost"
              name="Fixed Warehouse Cost"
              fill="#64748b"
              opacity={0.4}
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
            {/* Variable Delivery Cost (Line) */}
            <Line
              type="monotone"
              dataKey="delivery_cost"
              name="Delivery & Fuel Cost"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 4, fill: '#0ea5e9' }}
            />
            {/* Grand Total Cost Curve (Line) */}
            <Line
              type="monotone"
              dataKey="total_cost"
              name="Total Operational Cost"
              stroke="#10b981"
              strokeWidth={3.5}
              dot={{ r: 6, fill: '#10b981' }}
            />

            {optimalPoint && (
              <ReferenceDot
                x={optimalPoint.num_warehouses}
                y={optimalPoint.total_cost}
                r={8}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth={2}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-slate-500 italic text-center mt-1">
        • As warehouse count expands, delivery distances fall (decreasing delivery costs), but each facility adds fixed daily operating expense.
      </p>
    </div>
  );
}
