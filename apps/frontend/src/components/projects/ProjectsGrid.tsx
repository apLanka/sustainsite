import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useProjectStore } from '@/store';
import { projectApi } from '@/lib/api';
import type { Project } from '@/types/project';
import { ProjectStatus } from '@/types/project';

// ─── lookup maps ──────────────────────────────────────────────────────────────

const statusConfig: Record<ProjectStatus, { bg: string; text: string; dot: string }> = {
  [ProjectStatus.PLANNING]:    { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  [ProjectStatus.IN_PROGRESS]: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  [ProjectStatus.ON_HOLD]:     { bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400'  },
  [ProjectStatus.COMPLETED]:   { bg: 'bg-secondary-container', text: 'text-on-secondary-container', dot: 'bg-secondary' },
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtBudget = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : `$${(n / 1_000).toFixed(0)}K`;

// ─── Project card ─────────────────────────────────────────────────────────────

const ProjectCard = ({ project }: { project: Project }) => {
  const initials = (p?: { firstName?: string; lastName?: string } | null) =>
    p?.firstName && p?.lastName
      ? `${p.firstName[0]}${p.lastName[0]}`.toUpperCase()
      : '?';

  const sc = statusConfig[project.status] ?? { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' };
  const budgetOver = project.budgetVariance < 0;

  return (
    <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm group transition-all duration-300 hover:-translate-y-0.5 flex flex-col cursor-pointer">

      {/* ── Top bar: status + completion ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-0">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${sc.bg} ${sc.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${project.status === ProjectStatus.IN_PROGRESS ? 'animate-pulse' : ''}`} />
          {project.status}
        </span>
        <span className="text-2xl font-black tracking-tighter text-primary tabular-nums">
          {project.completionPercentage}%
        </span>
      </div>

      {/* ── Title + eclipsed description ── */}
      <div className="px-5 pt-3 pb-0 space-y-1">
        <Link
          to={`/projects/${project._id}`}
          className="after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus:outline-none focus-visible:after:ring-2 focus-visible:after:ring-secondary/50"
          aria-label={`View project: ${project.projectName}`}
        >
          <h4 className="text-lg font-extrabold text-primary leading-snug font-headline group-hover:text-secondary transition-colors line-clamp-1">
            {project.projectName}
          </h4>
        </Link>
        <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {project.description || 'No description provided for this project.'}
        </p>
      </div>

      {/* ── Progress bar ── */}
      <div className="px-5 pt-3">
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-secondary to-emerald-400 rounded-full transition-all duration-1000"
            style={{ width: `${project.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* ── Meta row ── */}
      <div className="px-5 pt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        <div className="flex items-center gap-1 text-slate-400 min-w-0">
          <span className="material-symbols-outlined !text-[13px]">location_on</span>
          <span className="text-[10px] font-semibold truncate max-w-[130px]">{project.location.address}</span>
        </div>
        {project.currentPhase && (
          <div className="flex items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined !text-[13px]">layers</span>
            <span className="text-[10px] font-semibold truncate max-w-[100px]">{project.currentPhase}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-emerald-600">
          <span className="material-symbols-outlined !text-[13px]">eco</span>
          <span className="text-[10px] font-bold">{project.sustainabilityScore}%</span>
        </div>
      </div>

      {/* ── Budget row ── */}
      <div className="px-5 pt-3 flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5">
          <span className="material-symbols-outlined !text-[13px] text-slate-400">account_balance_wallet</span>
          <span className="text-[10px] font-black text-slate-600 tracking-wide">{fmtBudget(project.budget)}</span>
        </div>
        {project.actualCost > 0 && (
          <div className={`flex items-center gap-1 text-[10px] font-bold ${budgetOver ? 'text-rose-500' : 'text-emerald-600'}`}>
            <span className="material-symbols-outlined !text-[13px]">{budgetOver ? 'trending_up' : 'trending_down'}</span>
            <span>{budgetOver ? 'Over' : 'Under'} by {fmtBudget(Math.abs(project.budgetVariance))}</span>
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="mx-5 mt-4 border-t border-slate-50" />

      {/* ── Footer ── */}
      <div className="px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {project.projectManager?.firstName ? (
            <>
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-black text-primary shrink-0">
                {initials(project.projectManager)}
              </div>
              <span className="text-[10px] font-bold text-slate-500 truncate max-w-[90px]">
                {project.projectManager.firstName} {project.projectManager.lastName}
              </span>
            </>
          ) : (
            <span className="text-[10px] font-bold text-slate-300 italic">No manager</span>
          )}
          {project.teamMembers?.length > 0 && (
            <div className="flex -space-x-1.5 ml-1">
              {project.teamMembers.slice(0, 3).map((m) => (
                <div
                  key={m._id}
                  title={`${m.firstName} ${m.lastName}`}
                  className="w-5 h-5 rounded-full border border-white bg-secondary/20 flex items-center justify-center text-[7px] font-black text-secondary"
                >
                  {initials(m)}
                </div>
              ))}
              {project.teamMembers.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[7px] font-bold text-slate-500">
                  +{project.teamMembers.length - 3}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end shrink-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Due</span>
          <span className={`text-[10px] font-bold tabular-nums ${project.daysRemaining <= 7 && project.daysRemaining >= 0 ? 'text-rose-500' : 'text-slate-500'}`}>
            {project.daysRemaining > 0 ? `${project.daysRemaining}d · ${fmt(project.endDate)}` : `Ended ${fmt(project.endDate)}`}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse flex flex-col">
    <div className="px-5 pt-5 pb-3 flex justify-between items-center">
      <div className="h-5 w-24 bg-slate-100 rounded-full" />
      <div className="h-7 w-10 bg-slate-100 rounded-lg" />
    </div>
    <div className="px-5 space-y-2">
      <div className="h-5 bg-slate-100 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-full" />
      <div className="h-3 bg-slate-100 rounded w-4/5" />
    </div>
    <div className="px-5 pt-3">
      <div className="h-1.5 bg-slate-100 rounded-full" />
    </div>
    <div className="px-5 pt-3 flex gap-3">
      <div className="h-3 bg-slate-100 rounded w-20" />
      <div className="h-3 bg-slate-100 rounded w-16" />
      <div className="h-3 bg-slate-100 rounded w-10" />
    </div>
    <div className="px-5 pt-3">
      <div className="h-8 bg-slate-50 rounded-lg w-28" />
    </div>
    <div className="mx-5 mt-4 border-t border-slate-50" />
    <div className="px-5 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-slate-100 rounded-full" />
        <div className="h-3 bg-slate-100 rounded w-20" />
      </div>
      <div className="h-3 bg-slate-100 rounded w-16" />
    </div>
  </div>
);

// ─── Grid ─────────────────────────────────────────────────────────────────────

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
        toast.error('Failed to load projects');
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
