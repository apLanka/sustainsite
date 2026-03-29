const ProjectStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-slate-100/50 hover:shadow-xl hover:shadow-emerald-950/5 transition-all group">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 group-hover:text-secondary transition-colors leading-none">Budget Utilized</p>
        <div className="flex items-end gap-2">
          <h4 className="text-3xl font-black text-primary tracking-tighter font-headline">74.2%</h4>
          <span className="text-xs font-bold text-slate-400 mb-1">$4.2M / $5.6M</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-emerald-600 rounded-full" style={{ width: '74%' }}></div>
        </div>
      </div>
      
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-slate-100/50 hover:shadow-xl hover:shadow-emerald-950/5 transition-all group">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 group-hover:text-secondary transition-colors leading-none">Days Elapsed</p>
        <div className="flex items-end gap-2">
          <h4 className="text-3xl font-black text-primary tracking-tighter font-headline">142</h4>
          <span className="text-xs font-bold text-slate-400 mb-1">Target: 365 Days</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-secondary rounded-full" style={{ width: '39%' }}></div>
        </div>
      </div>
      
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-slate-100/50 hover:shadow-xl hover:shadow-emerald-950/5 transition-all group">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 group-hover:text-secondary transition-colors leading-none">Sustainability Score</p>
        <div className="flex items-end gap-2">
          <h4 className="text-3xl font-black text-emerald-600 tracking-tighter font-headline">84</h4>
          <span className="material-symbols-outlined text-emerald-600 text-lg mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '84%' }}></div>
        </div>
      </div>
      
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-slate-100/50 hover:shadow-xl hover:shadow-emerald-950/5 transition-all group">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 group-hover:text-secondary transition-colors leading-none">Incidents Logged</p>
        <div className="flex items-end gap-2">
          <h4 className="text-3xl font-black text-primary tracking-tighter font-headline">02</h4>
          <span className="text-xs font-bold text-secondary mb-1">0 Critical</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full" style={{ width: '15%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStats;
