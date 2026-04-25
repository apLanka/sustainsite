import { Link } from 'react-router-dom';
import { useDashboardStore } from '@/store';
import type { ComplianceChecklist } from '@/types/compliance';
const SecondaryColumn = () => {
  const { upcomingDueDates, highRiskCount, projects, isDashboardLoading } = useDashboardStore();
  const today = new Date();
  const getDaysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  const urgencyColor = (days: number) => {
    if (days < 0) return 'text-rose-600 bg-rose-50 border-rose-200';
    if (days <= 3) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (days <= 7) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };
  const urgencyLabel = (days: number) => {
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `${days}d left`;
  };
  if (isDashboardLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {highRiskCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-4">
          <span
            className="material-symbols-outlined text-rose-600 text-2xl mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            warning
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-rose-700">
              {highRiskCount} High-Risk {highRiskCount === 1 ? 'Finding' : 'Findings'}
            </p>
            <p className="text-xs text-rose-500 mt-0.5">
              Unresolved safety inspections require attention
            </p>
            <Link
              to={projects.length === 1 ? `/projects/${projects[0]._id}/safety` : '/projects'}
              className="text-xs font-bold text-rose-600 hover:underline mt-2 inline-block"
            >
              Review inspections →
            </Link>
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-2xl border border-slate-100/50 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-sm font-bold text-primary font-headline flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-base">checklist</span>
            Upcoming Deadlines
          </h4>
          <Link
            to={
              upcomingDueDates.length > 0
                ? `/projects/${(upcomingDueDates as ComplianceChecklist[])[0].projectId}/compliance`
                : '/projects'
            }
            className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-widest transition-colors"
          >
            View All
          </Link>
        </div>

        {upcomingDueDates.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <span className="material-symbols-outlined text-3xl text-slate-300">
              event_available
            </span>
            <p className="text-xs text-slate-400 mt-2">No upcoming deadlines</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {(upcomingDueDates as ComplianceChecklist[]).map((checklist) => {
              const days = getDaysUntil(checklist.dueDate!);
              const colorClass = urgencyColor(days);
              return (
                <div
                  key={checklist._id}
                  className="px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-primary truncate">
                      {checklist.checklistName}
                    </p>
                    {checklist.category && (
                      <p className="text-[10px] text-slate-400 mt-0.5">{checklist.category}</p>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-black px-2 py-1 rounded-lg border whitespace-nowrap ${colorClass}`}
                  >
                    {urgencyLabel(days)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default SecondaryColumn;
