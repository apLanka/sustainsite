const ProjectFilters = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full mb-8">
      <div className="relative group flex-1">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">search</span>
        <input 
          className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-500 font-medium" 
          placeholder="Search Project Inventory..." 
          type="text"
        />
      </div>
      
      <div className="relative w-full sm:w-64 group">
        <select className="w-full pl-4 pr-10 py-2.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 text-slate-700 font-bold uppercase tracking-widest appearance-none cursor-pointer">
          <option>All Statuses</option>
          <option>Planning</option>
          <option>In Progress</option>
          <option>On Hold</option>
          <option>Completed</option>
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-emerald-600">expand_more</span>
      </div>
    </div>
  );
};

export default ProjectFilters;
