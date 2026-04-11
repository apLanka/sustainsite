import type { Project } from '@/types/project';
import { calcMilestoneProgress } from '@/lib/milestoneProgress';

interface Props {
  project: Project;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const ProjectStats = ({ project }: Props) => {
  const milestones = project.milestones ?? [];
  const completionPct = milestones.length > 0
    ? calcMilestoneProgress(milestones)
    : project.completionPercentage;

  const budgetUsedPct = project.budget > 0
    ? Math.min(100, Math.round((project.actualCost / project.budget) * 100))
    : 0;

  const startMs = new Date(project.startDate).getTime();
  const endMs   = new Date(project.endDate).getTime();
  const totalDays = Math.max(1, Math.ceil((endMs - startMs) / 86_400_000));
  const elapsed   = Math.max(0, Math.ceil((Date.now() - startMs) / 86_400_000));
  const elapsedPct = Math.min(100, Math.round((elapsed / totalDays) * 100));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {/* Budget */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-slate-100/50 transition-all group">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 group-hover:text-secondary transition-colors leading-none">
          Budget Utilized
        </p>
        <div className="flex items-end gap-2">
          <h4 className="text-3xl font-black text-primary tracking-tighter font-headline">{budgetUsedPct}%</h4>
          <span className="text-xs font-bold text-slate-400 mb-1">
            {fmt(project.actualCost)} / {fmt(project.budget)}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${budgetUsedPct}%` }} />
        </div>
      </div>

      {/* Days Elapsed */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-slate-100/50 transition-all group">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 group-hover:text-secondary transition-colors leading-none">
          Days Elapsed
        </p>
        <div className="flex items-end gap-2">
          <h4 className="text-3xl font-black text-primary tracking-tighter font-headline">{elapsed}</h4>
          <span className="text-xs font-bold text-slate-400 mb-1">Target: {totalDays} Days</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-secondary rounded-full" style={{ width: `${elapsedPct}%` }} />
        </div>
      </div>

      {/* Sustainability Score */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-slate-100/50 transition-all group">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 group-hover:text-secondary transition-colors leading-none">
          Sustainability Score
        </p>
        <div className="flex items-end gap-2">
          <h4 className="text-3xl font-black text-emerald-600 tracking-tighter font-headline">
            {project.sustainabilityScore}
          </h4>
          <span className="material-symbols-outlined text-emerald-600 text-lg mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>
            eco
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${project.sustainabilityScore}%` }} />
        </div>
      </div>

      {/* Completion */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-slate-100/50 transition-all group">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 group-hover:text-secondary transition-colors leading-none">
          Completion
        </p>
        <div className="flex items-end gap-2">
          <h4 className="text-3xl font-black text-primary tracking-tighter font-headline">
            {completionPct}%
          </h4>
          <span className="text-xs font-bold text-secondary mb-1">
            {project.daysRemaining > 0 ? `${project.daysRemaining}d left` : 'Overdue'}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${completionPct}%` }} />
        </div>
      </div>
    </div>
  );
};

export default ProjectStats;
