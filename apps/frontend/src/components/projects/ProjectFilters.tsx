const ProjectFilters = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full mb-8">
      <div className="relative group flex-1">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">search</span>
        <input 
          className="input-standard w-full pl-10 pr-4 h-11" 
          placeholder="Search Project Inventory..." 
          type="text"
        />
      </div>
      
      <div className="relative w-full sm:w-64 group">
        <select className="input-standard w-full pl-4 pr-10 h-11 appearance-none cursor-pointer uppercase tracking-widest">
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
