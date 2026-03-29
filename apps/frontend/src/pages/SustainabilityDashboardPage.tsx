import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/common/DashboardLayout';
import SustainabilityScore from '@/components/sustainability/SustainabilityScore';
import { ImpactRadar, HistoricalTrendLine, ResourceBarChart } from '@/components/sustainability/SustainabilityCharts';

export default function SustainabilityDashboardPage() {
  return (
    <DashboardLayout>
      {/* Header Section */}
      <header className="py-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
        <div>
          <p className="text-secondary font-bold text-sm tracking-widest uppercase mb-1 font-headline">Eco-Analytics Hub</p>
          <h2 className="text-4xl font-extrabold text-primary tracking-tighter leading-tight font-headline">Sustainability Performance</h2>
          <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm font-medium">
            <span className="material-symbols-outlined text-sm">monitoring</span>
            <span>Last audit logged: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-6 py-2.5 bg-surface-container-high text-primary font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all cursor-pointer font-headline">
            <span className="material-symbols-outlined text-lg">download</span>
            Export Report
          </button>
          <Link 
            to="/sustainability/record"
            className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/10 hover:brightness-110 active:scale-95 transition-all cursor-pointer font-headline"
          >
            <span className="material-symbols-outlined text-lg">add_chart</span>
            Record New Metrics
          </Link>
        </div>
      </header>

      {/* Main Grid Content: Dual-Tier Architecture */}
      <div className="space-y-10 pb-20">
        {/* Tier 1: Performance Highlights (2 Column Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 min-h-[440px]">
            <SustainabilityScore />
          </div>
          <div className="lg:col-span-2 bg-surface-container-lowest p-10 rounded-3xl border border-slate-100/50 shadow-sm flex flex-col justify-center">
            <h4 className="text-sm font-bold text-primary font-headline mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">show_chart</span>
              Global Score Trajectory (Last 6 Periods)
            </h4>
            <div className="flex-1 min-h-[300px]">
              <HistoricalTrendLine />
            </div>
          </div>
        </div>

        {/* Tier 2: Categorical Deep-Dive (3 Column Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Radar Chart Card */}
          <div className="bg-surface-container-lowest p-10 rounded-3xl border border-slate-100/50 shadow-sm overflow-hidden flex flex-col min-h-[480px]">
            <h4 className="text-sm font-bold text-primary font-headline mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">radar</span>
              Ecological Impact Radar
            </h4>
            <div className="flex-1">
              <ImpactRadar />
            </div>
            <p className="text-[11px] text-slate-400 mt-8 pt-6 border-t border-slate-50 italic">
              "Unified multidimensional assessment of project environmental vitals."
            </p>
          </div>

          {/* Bar Chart Card */}
          <div className="bg-surface-container-lowest p-10 rounded-3xl border border-slate-100/50 shadow-sm flex flex-col min-h-[480px]">
             <h4 className="text-sm font-bold text-primary font-headline mb-8 flex items-center gap-2">
               <span className="material-symbols-outlined text-emerald-600">align_horizontal_left</span>
               Principal Resource Footprint
             </h4>
             <div className="flex-1">
               <ResourceBarChart />
             </div>
             <p className="text-[11px] text-slate-400 mt-8 pt-6 border-t border-slate-50 italic">
               "Carbon intensity tracking across core structural materials."
             </p>
          </div>

          {/* Stats Interaction Stack */}
          <div className="flex flex-col gap-10 min-h-[480px]">
              <div className="bg-gradient-to-br from-emerald-950 to-primary p-10 rounded-3xl shadow-xl shadow-emerald-950/20 text-white relative overflow-hidden group flex-1 flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700 -mr-16 -mt-16"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-emerald-100/80">Net Carbon Sequestration</p>
                <h3 className="text-5xl font-extrabold tracking-tighter mb-2">1,482</h3>
                <p className="text-sm font-medium text-emerald-200/80">Project Trees Equivalent Offset</p>
                <div className="mt-10 flex items-center gap-2 text-emerald-200">
                  <span className="material-symbols-outlined !text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">+12.4% PERFORMANCE INCREASE</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-10 rounded-3xl border border-slate-100/50 shadow-sm flex-1 flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Baseline Emissions Intensity</p>
                <div className="flex items-end gap-3">
                  <h4 className="text-4xl font-extrabold text-primary tracking-tighter">0.42</h4>
                  <span className="text-sm font-bold text-slate-400 mb-1 leading-none uppercase tracking-widest font-headline">tCO2e / sq.m</span>
                </div>
                <div className="mt-8 flex gap-1.5 h-2">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className={`flex-1 rounded-full ${i <= 2 ? 'bg-secondary shadow-[0_0_8px_rgba(14,108,74,0.3)]' : 'bg-slate-100'}`}></div>
                  ))}
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-[0.1em]">22% BELOW SUSTAINSITE AVG</p>
              </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
