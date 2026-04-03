import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProjectStore } from '@/store';
import { projectApi } from '@/lib/api';
import type { Project } from '@/types/project';
import { ProjectStatus } from '@/types/project';

const statusStyles: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]:    'bg-amber-100 text-amber-700',
  [ProjectStatus.IN_PROGRESS]: 'bg-emerald-100 text-emerald-800',
  [ProjectStatus.ON_HOLD]:     'bg-slate-100 text-slate-600',
  [ProjectStatus.COMPLETED]:   'bg-secondary-container text-on-secondary-container',
};

const ProjectCard = ({ project }: { project: Project }) => {
  const initials = (p: { firstName: string; lastName: string }) =>
    `${p.firstName[0]}${p.lastName[0]}`.toUpperCase();

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-slate-100/50 overflow-hidden group hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 hover:-translate-y-1">
      {/* Status + progress overlay */}
      <div className="relative h-48 overflow-hidden bg-slate-200">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent z-10" />
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusStyles[project.status] ?? 'bg-slate-100 text-slate-600'}`}>
            {project.status}
          </span>
          <span className="text-white text-2xl font-black tracking-tighter">
            {project.completionPercentage}%
          </span>
        </div>
      </div>

      {/* Card content */}
      <div className="p-6 space-y-4">
        <div>
          <Link to={`/projects/${project._id}`} className="block group/title">
            <h4 className="text-xl font-bold text-primary leading-tight font-headline group-hover/title:text-secondary transition-colors truncate">
              {project.projectName}
            </h4>
          </Link>
          <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-widest truncate">
            {project.location.address}
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-secondary to-primary-container rounded-full transition-all duration-1000"
            style={{ width: `${project.completionPercentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          {/* Team avatars */}
          <div className="flex -space-x-2">
            {project.teamMembers.slice(0, 3).map((member) => (
              <div
                key={member._id}
                className="w-7 h-7 rounded-full border-2 border-white bg-secondary/20 flex items-center justify-center text-[8px] font-black text-secondary shadow-sm"
                title={`${member.firstName} ${member.lastName}`}
              >
                {initials(member)}
              </div>
            ))}
            {project.teamMembers.length > 3 && (
              <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500">
                +{project.teamMembers.length - 3}
              </div>
            )}
            {project.teamMembers.length === 0 && (
              <div className="w-7 h-7 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-300 !text-xs">person_add</span>
              </div>
            )}
          </div>

          {/* Days remaining */}
          <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-secondary transition-colors">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {project.daysRemaining > 0 ? `${project.daysRemaining}d left` : 'Due'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-slate-100/50 overflow-hidden animate-pulse">
    <div className="h-48 bg-slate-100" />
    <div className="p-6 space-y-4">
      <div className="h-5 bg-slate-100 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
      <div className="h-1.5 bg-slate-100 rounded-full" />
    </div>
  </div>
);

const ProjectsGrid = () => {
  const { projects, filters, pagination, isLoading, setProjects, setLoading } = useProjectStore();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await projectApi.getProjects(filters);
        setProjects(res.data, res.pagination);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [filters, setProjects, setLoading]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!isLoading && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">folder_open</span>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No projects found</p>
        <p className="text-xs text-slate-300 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <button
            className="px-4 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            disabled={filters.page <= 1}
            onClick={() => useProjectStore.getState().setFilters({ page: filters.page - 1 })}
          >
            Previous
          </button>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {filters.page} / {pagination.totalPages}
          </span>
          <button
            className="px-4 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            disabled={filters.page >= pagination.totalPages}
            onClick={() => useProjectStore.getState().setFilters({ page: filters.page + 1 })}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectsGrid;
