import React from 'react';

export default function Logo({ size = 'md', variant = 'dark', showText = true, className = '' }) {
  // size: 'sm', 'md', 'lg'
  // variant: 'dark' (for dark backgrounds like the pill navbar), 'light' (for light backgrounds)
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base font-bold',
    lg: 'text-xl font-extrabold'
  };

  return (
    <div className={`flex items-center space-x-2.5 select-none ${className}`}>
      {/* Standout Geometric Grid Hub Emblem */}
      <div className={`relative ${iconSizes[size]} rounded-full p-[1.5px] bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 shadow-md shadow-blue-500/20 shrink-0`}>
        <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center overflow-hidden">
          <svg 
            viewBox="0 0 32 32" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-[72%] h-[72%] text-cyan-400"
          >
            {/* Outer Hexagonal Grid Coordinates */}
            <path 
              d="M16 5L25.5 10.5V21.5L16 27L6.5 21.5V10.5L16 5Z" 
              stroke="currentColor" 
              strokeWidth="1.2" 
              strokeOpacity="0.4" 
              strokeDasharray="2.5 2.5" 
            />
            {/* Vector Transit Rays connecting to Central Hub */}
            <line x1="16" y1="16" x2="6.5" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
            <line x1="16" y1="16" x2="25.5" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
            <line x1="16" y1="16" x2="16" y2="27" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
            {/* Outer Node Satellites */}
            <circle cx="6.5" cy="10.5" r="2" fill="#38bdf8" />
            <circle cx="25.5" cy="10.5" r="2" fill="#38bdf8" />
            <circle cx="16" cy="27" r="2" fill="#38bdf8" />
            {/* Central High-Capacity Warehouse Hub with Beacon */}
            <circle cx="16" cy="16" r="3.8" fill="#2563eb" />
            <circle cx="16" cy="16" r="1.8" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex items-center tracking-tight">
          <span className={`${textSizes[size]} ${variant === 'dark' ? 'text-white' : 'text-slate-900'} tracking-tight`}>
            Grid<span className="text-blue-500">Point</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-1"></span>
        </div>
      )}
    </div>
  );
}
