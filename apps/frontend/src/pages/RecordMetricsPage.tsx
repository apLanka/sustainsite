import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/common/DashboardLayout';
import EnvironmentalAuditForm from '@/components/sustainability/EnvironmentalAuditForm';

const AuditSidebar = () => (
  <aside className="space-y-8">
    <div className="bg-emerald-950 p-8 rounded-3xl shadow-xl shadow-emerald-950/20 text-white relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-secondary/30 transition-all duration-700"></div>
      <div className="relative z-10">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary-container mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>gshield</span>
          Compliance Protocol
        </h4>
        <p className="text-sm font-medium mb-6 leading-relaxed">Ensure all measurements are logged in the specified metric units (kg, Liters, kWh) to maintain ISO 14001 alignment.</p>
        <div className="flex items-center gap-2 text-emerald-300">
          <span className="material-symbols-outlined text-sm">info</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Standards v4.2 Active</span>
        </div>
      </div>
    </div>

    <div className="bg-surface-container-lowest p-8 rounded-3xl border border-slate-100/50 shadow-sm">
      <h4 className="text-sm font-bold text-primary font-headline mb-6">Recent Audit Reports</h4>
      <div className="space-y-4">
        {[
          { date: 'MAR 24', score: '84%', status: 'Verified' },
          { date: 'FEB 21', score: '82%', status: 'Verified' },
          { date: 'JAN 18', score: '79%', status: 'Archived' },
        ].map((audit, i) => (
          <div key={i} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition-all group cursor-pointer border border-transparent hover:border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{audit.date}</p>
              <p className="text-xs font-bold text-primary italic">Global Performance</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-secondary">{audit.score}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{audit.status}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all">
        View Entire History
      </button>
    </div>
  </aside>
);

export default function RecordMetricsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto">
        <header className="py-10 space-y-4">
          <Link 
            to="/sustainability" 
            className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-widest hover:underline transition-all group"
          >
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Analytics Hub
          </Link>
          
          <div>
            <p className="text-secondary font-bold text-sm tracking-widest uppercase mb-1 font-headline">Audit Interface</p>
            <h2 className="text-4xl font-extrabold text-primary tracking-tighter leading-tight font-headline">Log Environmental Metrics</h2>
            <p className="text-slate-500 text-sm font-medium mt-2 max-w-2xl text-balance">
              Capture high-fidelity environmental data for your project lifecycle. These metrics are used to compute the global sustainability score and generate AI-driven optimizations.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 pb-20">
          {/* Main Form (Left) */}
          <div className="xl:col-span-2 bg-surface-container-lowest rounded-3xl p-10 shadow-sm border border-slate-100/50">
            <EnvironmentalAuditForm />
          </div>

          {/* Audit Sidebar (Right) */}
          <div className="xl:col-span-1">
            <AuditSidebar />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
