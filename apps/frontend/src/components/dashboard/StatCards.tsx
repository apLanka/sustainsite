import { Link } from 'react-router-dom';
import { useDashboardStore } from '@/store';
const CIRC_R = 54;
const CIRC_LEN = 2 * Math.PI * CIRC_R;
const Skeleton = ({ className }: {
    className: string;
}) => (<div className={`animate-pulse bg-slate-100 rounded-xl ${className}`}/>);
const StatCards = ({ isLoading }: {
    isLoading: boolean;
}) => {
    const { activeCount, avgSustainability, pendingApprovals, highRiskCount, projects } = useDashboardStore();
    const firstProjectId = projects[0]?._id;
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

      
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-100/50 flex flex-col justify-between group transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined !text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>foundation</span>
          </div>
        </div>
        <div>
          {isLoading ? (<Skeleton className="h-9 w-16 mb-2"/>) : (<h3 className="text-3xl font-extrabold text-primary tracking-tighter">{activeCount}</h3>)}
          <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider font-headline">In Progress</p>
        </div>
      </div>

      
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-100/50 flex flex-col items-center justify-center text-center group transition-all">
        <div className="relative w-36 h-36 flex items-center justify-center mb-3">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
            <circle className="stroke-slate-100 fill-none" cx="72" cy="72" r={CIRC_R} strokeWidth="10"/>
            <circle className="stroke-secondary fill-none transition-all duration-1000" cx="72" cy="72" r={CIRC_R} strokeDasharray={CIRC_LEN} strokeDashoffset={isLoading ? CIRC_LEN : CIRC_LEN * (1 - avgSustainability / 100)} strokeWidth="10" strokeLinecap="round"/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isLoading ? (<Skeleton className="h-6 w-12"/>) : (<>
                <span className="text-2xl font-extrabold text-primary leading-none">{avgSustainability}%</span>
                <span className="text-[9px] font-bold text-secondary uppercase tracking-widest mt-1">
                  {avgSustainability >= 80 ? 'Excellent' : avgSustainability >= 50 ? 'Good' : 'Needs Work'}
                </span>
              </>)}
          </div>
        </div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider font-headline">Sustainability Score</h3>
      </div>

      
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-100/50 flex flex-col justify-between group transition-all">
        <div className="flex justify-between items-start">
          <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-amber-700">
            <span className="material-symbols-outlined !text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
          </div>
        </div>
        <div className="mt-4">
          {isLoading ? (<Skeleton className="h-9 w-12 mb-2"/>) : (<h3 className="text-3xl font-extrabold text-primary tracking-tighter">{pendingApprovals}</h3>)}
          <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider font-headline">Pending Approvals</p>
        </div>
        {!isLoading && pendingApprovals > 0 && (<Link to={projects.length === 1 ? `/projects/${firstProjectId}/documents?status=Under Review` : '/projects'} className="mt-4 inline-flex items-center text-xs font-bold text-amber-700 hover:underline group-hover:gap-2 transition-all gap-1 cursor-pointer">
            Review Now <span className="material-symbols-outlined !text-sm">arrow_forward</span>
          </Link>)}
      </div>

      
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-100/50 flex flex-col justify-between group transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${highRiskCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-secondary'}`}>
            <span className="material-symbols-outlined !text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {highRiskCount > 0 ? 'warning' : 'verified_user'}
            </span>
          </div>
        </div>
        <div>
          {isLoading ? (<Skeleton className="h-9 w-12 mb-2"/>) : (<h3 className={`text-3xl font-extrabold tracking-tighter ${highRiskCount > 0 ? 'text-rose-600' : 'text-primary'}`}>
              {highRiskCount}
            </h3>)}
          <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider font-headline">High-Risk Findings</p>
        </div>
        {!isLoading && (<p className={`mt-4 text-xs font-bold uppercase tracking-widest ${highRiskCount > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
            {highRiskCount > 0 ? 'Requires Attention' : 'All Clear'}
          </p>)}
      </div>

    </div>);
};
export default StatCards;
