import { useEffect, useRef } from 'react';
import { useProjectStore } from '@/store';
import { ProjectStatus } from '@/types/project';

const ProjectFilters = () => {
  const { filters, setFilters } = useProjectStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters({ search: value, page: 1 });
    }, 400);
  };

  const handleStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ status: e.target.value as ProjectStatus | '', page: 1 });
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full mb-8">
      <div className="relative group flex-1">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
          search
        </span>
        <input
          className="input-standard w-full pl-10 pr-4 h-11"
          placeholder="Search Project Inventory..."
          type="text"
          defaultValue={filters.search}
          onChange={handleSearch}
        />
      </div>

      <div className="relative w-full sm:w-64 group">
        <select
          className="input-standard w-full pl-4 pr-10 h-11 appearance-none cursor-pointer uppercase tracking-widest"
          value={filters.status}
          onChange={handleStatus}
        >
          <option value="">All Statuses</option>
          <option value={ProjectStatus.PLANNING}>Planning</option>
          <option value={ProjectStatus.IN_PROGRESS}>In Progress</option>
          <option value={ProjectStatus.ON_HOLD}>On Hold</option>
          <option value={ProjectStatus.COMPLETED}>Completed</option>
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-emerald-600">
          expand_more
        </span>
      </div>
    </div>
  );
};

export default ProjectFilters;
