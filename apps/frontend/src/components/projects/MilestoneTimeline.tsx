import type { Milestone } from '@/types/project';
import { MilestoneStatus } from '@/types/project';
import { calcMilestoneProgress } from '@/lib/milestoneProgress';
interface Props {
    milestones: Milestone[];
    onEdit?: (milestone: Milestone) => void;
}
const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
const MilestoneTimeline = ({ milestones, onEdit }: Props) => {
    if (milestones.length === 0) {
        return (<div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">event_note</span>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No milestones yet</p>
        <p className="text-xs text-slate-300 mt-1">Add the first milestone to start tracking progress</p>
      </div>);
    }
    const stemPct = calcMilestoneProgress(milestones);
    return (<div className="relative pl-10 md:pl-12 lg:pl-16 pb-20">
      
      <div className="absolute left-[19px] top-0 bottom-0 w-1 bg-slate-100 rounded-full"/>
      
      <div className="absolute left-[19px] top-0 w-1 bg-gradient-to-b from-emerald-600 via-secondary to-emerald-400 rounded-full shadow-[0_0_15px_rgba(5,150,105,0.4)] z-0 transition-all duration-700" style={{ height: `${stemPct}%` }}/>

      <div className="space-y-16">
        {milestones.map((milestone) => {
            const isActive = milestone.status === MilestoneStatus.IN_PROGRESS;
            const isCompleted = milestone.status === MilestoneStatus.COMPLETED;
            return (<div key={milestone._id} className="relative group">
              
              <div className={`absolute -left-[20px] top-5 w-10 h-0.5 transition-colors duration-500 ${isCompleted || isActive ? 'bg-emerald-500/30' : 'bg-slate-100'}`}/>

              
              <div className={`absolute -left-[30px] top-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center z-10 transition-all duration-500 shadow-sm ${isCompleted ? 'bg-emerald-600 scale-110' :
                    isActive ? 'bg-secondary ring-2 ring-emerald-500/20' :
                        'bg-slate-200'}`}>
                {isCompleted && (<span className="material-symbols-outlined text-white !text-xs font-bold leading-none">check</span>)}
                {isActive && (<div className="w-2 h-2 bg-white rounded-full animate-ping"/>)}
              </div>

              
              <div className={`p-8 rounded-3xl transition-all duration-500 border ${isActive
                    ? 'bg-emerald-950 text-white border-emerald-800 shadow-2xl shadow-emerald-950/40 -translate-y-1'
                    : 'bg-surface-container-lowest border-slate-100/50 hover:border-emerald-200'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="flex-1 min-w-0">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 block ${isActive ? 'text-secondary-container' : 'text-slate-400'}`}>
                      {milestone.status}
                    </span>
                    <h4 className={`text-xl font-bold tracking-tight font-headline ${isActive ? 'text-white' : 'text-primary'}`}>
                      {milestone.title}
                    </h4>
                    {milestone.description && (<p className={`text-xs mt-1 font-medium ${isActive ? 'text-emerald-300/70' : 'text-slate-400'}`}>
                        {milestone.description}
                      </p>)}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase font-headline border ${isActive
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                      {fmt(milestone.targetDate)}
                    </div>

                    
                    {onEdit && (<button type="button" onClick={() => onEdit(milestone)} title="Edit milestone" className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100
                          ${isActive
                        ? 'text-white/60 hover:text-white hover:bg-white/10'
                        : 'text-slate-400 hover:text-primary hover:bg-slate-100'}`}>
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-6">
                  
                  <div className="flex items-center gap-3">
                    <div>
                      <p className={`text-[8px] font-bold uppercase tracking-widest leading-none ${isActive ? 'text-emerald-400/70' : 'text-slate-400'}`}>
                        Completion
                      </p>
                      <p className={`text-xs font-bold mt-1 ${isActive ? 'text-emerald-50' : 'text-primary'}`}>
                        {milestone.completionPercentage}%
                      </p>
                    </div>
                  </div>

                  {isCompleted && milestone.completionDate && (<div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Completed {fmt(milestone.completionDate)}
                    </div>)}
                </div>
              </div>
            </div>);
        })}
      </div>
    </div>);
};
export default MilestoneTimeline;
