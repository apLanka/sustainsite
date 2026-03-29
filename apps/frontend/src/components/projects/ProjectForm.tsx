
const ProjectForm = () => {
  return (
    <form className="space-y-10">
      {/* SECTION: General Information */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <span className="material-symbols-outlined text-emerald-600">info</span>
          <h3 className="text-lg font-bold text-primary font-headline">General Information</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Project Title</label>
            <input 
              type="text" 
              placeholder="e.g., Eco-Hub Corporate Center"
              className="w-full px-5 py-3.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400 font-medium transition-all"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Project Description</label>
            <textarea 
              rows={4}
              placeholder="Describe the architectural scope and sustainability goals..."
              className="w-full px-5 py-3.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400 font-medium transition-all resize-none"
            ></textarea>
          </div>
        </div>
      </section>

      {/* SECTION: Logistics & Financials */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <span className="material-symbols-outlined text-emerald-600">payments</span>
          <h3 className="text-lg font-bold text-primary font-headline">Logistics & Financials</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Total Budget (USD)</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input 
                type="number" 
                placeholder="0.00"
                className="w-full pl-10 pr-5 py-3.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400 font-medium transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Location / Site Address</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">location_on</span>
              <input 
                type="text" 
                placeholder="Search site address..."
                className="w-full pl-11 pr-5 py-3.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400 font-medium transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Start Date</label>
            <input 
              type="date" 
              className="w-full px-5 py-3.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400 font-medium transition-all"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Estimated Completion</label>
            <input 
              type="date" 
              className="w-full px-5 py-3.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400 font-medium transition-all"
            />
          </div>
        </div>
      </section>

      {/* SECTION: Team Assignment */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <span className="material-symbols-outlined text-emerald-600">groups</span>
          <h3 className="text-lg font-bold text-primary font-headline">Team Assignment</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Project Manager</label>
            <select className="w-full px-5 py-3.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 text-slate-700 font-bold appearance-none cursor-pointer">
              <option disabled selected>Select a Manager</option>
              <option>Sarah Jenkins</option>
              <option>Michael Chen</option>
              <option>Elena Rodriguez</option>
            </select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Status</label>
            <select className="w-full px-5 py-3.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 text-slate-700 font-bold appearance-none cursor-pointer">
              <option>Planning</option>
              <option>In Progress</option>
              <option>On Hold</option>
            </select>
          </div>
        </div>
      </section>

      {/* ACTION BUTTONS */}
      <div className="pt-10 flex flex-col sm:flex-row gap-4">
        <button type="submit" className="flex-1 px-8 py-4 bg-primary text-white font-bold text-sm rounded-xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer font-headline">
          Create Project Blueprint
        </button>
        <button type="button" className="px-8 py-4 bg-surface-container-low text-primary font-bold text-sm rounded-xl hover:bg-slate-200 transition-all cursor-pointer font-headline">
          Save as Draft
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
