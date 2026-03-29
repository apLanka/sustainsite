const StatCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {/* Active Projects */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-100/50 flex flex-col justify-between group hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined !text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>foundation</span>
          </div>
          <span className="text-[10px] font-bold text-secondary px-2 py-1 bg-secondary-container/30 rounded-full">+12% vs LY</span>
        </div>
        <div>
          <h3 className="text-3xl font-extrabold text-primary tracking-tighter">14</h3>
          <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider font-headline">Active Projects</p>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-50">
          <svg className="w-full h-8 stroke-secondary fill-none stroke-2" viewBox="0 0 100 20">
            <path d="M0,15 Q10,5 20,10 T40,5 T60,15 T80,5 T100,10"></path>
          </svg>
        </div>
      </div>

      {/* Sustainability Score */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-100/50 flex flex-col items-center justify-center text-center group hover:shadow-md transition-shadow">
        <div className="relative w-24 h-24 flex items-center justify-center mb-2">
          <svg className="w-full h-full -rotate-90">
            <circle className="stroke-slate-100 fill-none" cx="48" cy="48" r="40" strokeWidth="8"></circle>
            <circle 
              className="stroke-secondary fill-none transition-all duration-1000" 
              cx="48" 
              cy="48" 
              r="40" 
              strokeDasharray="251.2" 
              strokeDashoffset="18" 
              strokeWidth="8"
            ></circle>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold text-primary leading-none">92.4%</span>
            <span className="text-[8px] font-bold text-secondary uppercase tracking-widest mt-1">LEED Gold</span>
          </div>
        </div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider font-headline">Sustainability Score</h3>
      </div>

      {/* Document Approvals */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-100/50 flex flex-col justify-between group hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-700">
            <span className="material-symbols-outlined !text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-3xl font-extrabold text-primary tracking-tighter">8</h3>
          <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider font-headline">Pending Approvals</p>
        </div>
        <a className="mt-4 inline-flex items-center text-xs font-bold text-amber-700 hover:underline group-hover:gap-2 transition-all gap-1 cursor-pointer" href="#">
          Review Now <span className="material-symbols-outlined !text-sm">arrow_forward</span>
        </a>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-slate-100/50 flex flex-col group hover:shadow-md transition-shadow">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 font-headline">
          <span className="material-symbols-outlined text-error !text-sm">warning</span> Low Stock Alerts
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-error"></div>
              <span className="text-xs font-medium text-slate-700">Recycled Steel</span>
            </div>
            <span className="text-xs font-bold text-primary">12 tons</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-xs font-medium text-slate-700">Timber Slabs</span>
            </div>
            <span className="text-xs font-bold text-primary">4 units</span>
          </div>
          <div className="flex items-center justify-between opacity-60 transition-opacity hover:opacity-100">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-slate-300"></div>
              <span className="text-xs font-medium text-slate-700">Glass Panels</span>
            </div>
            <span className="text-xs font-bold text-primary">45 sqft</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCards;
