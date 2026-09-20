import React from 'react';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  highlightColor = 'brand',
  badge
}) {
  const colorMap = {
    brand: 'text-blue-600 bg-blue-50 border-blue-200',
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    amber: 'text-amber-700 bg-amber-50 border-amber-200',
    rose: 'text-rose-700 bg-rose-50 border-rose-200',
    purple: 'text-indigo-700 bg-indigo-50 border-indigo-200'
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 shadow-sm transition-colors group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="mt-1.5 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 font-mono">{value}</span>
            {badge && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {badge}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg border ${colorMap[highlightColor] || colorMap.brand}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold flex items-center space-x-0.5 ${
                trendPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              <span>{trendPositive ? '↓' : '↑'}</span>
              <span>{trend}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
