import React from 'react';
import { motion } from 'framer-motion';

const SustainabilityScore = ({ score = 84 }) => {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-emerald-950 rounded-3xl shadow-xl shadow-emerald-950/20 relative overflow-hidden group h-full">
      {/* Background radial pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 200 200">
          <circle cx="100%" cy="100%" r="50%" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="100%" cy="100%" r="75%" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg className="transform -rotate-90 w-full h-full">
          {/* Background circle */}
          <circle
            className="text-emerald-900"
            strokeWidth="12"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="112"
            cy="112"
          />
          {/* Progress circle */}
          <motion.circle
            className="text-secondary"
            strokeWidth="12"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="112"
            cy="112"
          />
        </svg>
        
        {/* Score content */}
        <div className="absolute flex flex-col items-center justify-center select-none">
          <motion.h4 
            className="text-6xl font-black text-white tracking-tighter"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            {score}
          </motion.h4>
          <motion.p 
            className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            Global Score
          </motion.p>
        </div>
      </div>

      {/* Additional stats overlay */}
      <div className="mt-8 grid grid-cols-2 gap-8 w-full border-t border-emerald-900/50 pt-8">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-1 leading-none">Net Impact</p>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-emerald-300 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            <span className="text-xl font-bold text-white tracking-tight leading-none">+12.4%</span>
          </div>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-1 leading-none">Rank Status</p>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>award_star</span>
            <span className="text-xl font-bold text-white tracking-tight leading-none">ALPHA-1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityScore;
