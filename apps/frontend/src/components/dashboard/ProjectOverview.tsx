import { Link } from 'react-router-dom';
import { useDashboardStore } from '@/store';
import { ProjectStatus } from '@/types/project';

const statusConfig: Record<string, { bg: string; text: string }> = {
  [ProjectStatus.PLANNING]:    { bg: 'bg-blue-50',    text: 'text-blue-700'  },
  [ProjectStatus.IN_PROGRESS]: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  [ProjectStatus.ON_HOLD]:     { bg: 'bg-amber-50',   text: 'text-amber-700' },
  [ProjectStatus.COMPLETED]:   { bg: 'bg-slate-100',  text: 'text-slate-500' },
};

const Initials = ({ name }: { name: string }) => {
  const parts = name.trim().split(' ');
  const initials = parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`
    : parts[0].slice(0, 2);
  return (
    <div className="w-7 h-7 rounded-full bg-secondary/10 text-secondary text-[10px] font-black flex items-center justify-center border-2 border-white uppercase">
      {initials}
    </div>
  );
};

const SkeletonRow = () => (
  <div className="animate-pulse space-y-3">
    <div className="flex justify-between">
      <div className="space-y-1.5">
        <div className="h-4 w-48 bg-slate-100 rounded" />
        <div className="h-3 w-32 bg-slate-100 rounded" />
      </div>
      <div className="h-6 w-10 bg-slate-100 rounded" />
    </div>
    <div className="h-3 w-full bg-slate-100 rounded-full" />
    <div className="flex justify-between">
      <div className="h-3 w-20 bg-slate-100 rounded" />
      <div className="h-3 w-24 bg-slate-100 rounded" />
    </div>
  </div>
);

const ProjectOverview = ({ isLoading }: { isLoading: boolean }) => {
  const { projects } = useDashboardStore();

  return (
    <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-slate-100/50 overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center">
        <h3 className="text-xl font-extrabold text-primary tracking-tighter font-headline">Project Progress Overview</h3>
        <Link
          to="/projects"
          className="text-xs font-bold text-secondary hover:underline uppercase tracking-widest cursor-pointer font-headline"
        >
          View All Projects
        </Link>
      </div>

      <div className="p-8 space-y-8">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-slate-200 mb-4 block">folder_open</span>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No projects yet</p>
            <Link to="/projects/new" className="mt-4 inline-block text-xs font-bold text-secondary hover:underline">
              Create your first project
            </Link>
          </div>
        ) : (
          projects.map((project) => {
            const score = project.completionPercentage ?? 0;
            const isFinal = project.status === ProjectStatus.COMPLETED || project.status === ProjectStatus.ON_HOLD;
            const statusStyle = statusConfig[project.status] ?? { bg: 'bg-slate-100', text: 'text-slate-500' };
            const managerName = project.projectManager
              ? typeof project.projectManager === 'string'
                ? project.projectManager
                : `${(project.projectManager as { firstName?: string; lastName?: string }).firstName ?? ''} ${(project.projectManager as { firstName?: string; lastName?: string }).lastName ?? ''}`.trim()
              : null;

            return (
              <div key={project._id} className="relative group">
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-primary leading-tight font-headline truncate">
                        {project.projectName}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0 ${statusStyle.bg} ${statusStyle.text}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
                      {project.location?.address ?? '—'}
                    </p>
                  </div>
                  <span className={`text-2xl font-black tracking-tighter shrink-0 ${isFinal ? 'text-amber-700' : 'text-secondary'}`}>
                    {score}%
                  </span>
                </div>

                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${
                      isFinal ? 'from-amber-600 to-amber-700' : 'from-secondary to-primary-container'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>

                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-2">
                    {managerName && <Initials name={managerName} />}
                    {managerName && (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{managerName}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {project.endDate && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        ETA: {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    <Link
                      to={`/projects/${project._id}`}
                      className="text-[10px] font-black uppercase tracking-widest text-secondary hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default ProjectOverview;
