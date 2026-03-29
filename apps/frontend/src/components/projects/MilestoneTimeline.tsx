
const milestones = [
  {
    title: 'Site Preparation & Excavation',
    date: 'OCT 12, 2023',
    status: 'Completed',
    assignee: 'Mark Thompson',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRwz4Op31qJB2R9BVG8GpQSjgIJIR6xhZ3LLHQTfW9mDyzq5Mawr_BhtYvJsq8sq7P8IH3zy6zgILg_3o5x-NiKbqJSEiLESG5rR6qdFSx2oCfmD4rBlu4ACvQtVtm-nburnMuRUWp56sTygBZkPXk_bH3_UPepqxs8WpT9t2DE8tRIkTnGw4-m3cZAwpqZ9CekPI_YtUK8AoJPf5teVBP6_NbTseyfcNoC6kgHlx9YHqeQvwHlm2IP2JhtnDJoVXsvvKRb2wVLak'
  },
  {
    title: 'Foundation Pouring',
    date: 'NOV 05, 2023',
    status: 'In Progress',
    assignee: 'Sarah Jenkins',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZ9waGWfGvpDbXJ8ipzaPyTHkruRybiaNlJa4cJwj2oSoAlMAdLtOaH3ULzmaqp4NDP9eOgZk4cF9thdWrh0H4xAN1vTRTjBO4dNpRp3fqEySCVi9I4FxcCoQkdM1CJ5m58DAVV9ncpWcDDqAqM7lvwQ4IAUNNF6weUisO4CT6r1iWKt-13k-kvWXzY0-k-3qv-hOq9rMa8BRflDHB4iM8xlX9qWV3Bnfl5ispIJztei6zaWytNp1zLUcPxubqm7QfEw-RL4X0zNg'
  },
  {
    title: 'Structural Steel Framing',
    date: 'DEC 20, 2023',
    status: 'Pending',
    assignee: 'Michael Chen',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYJPOM_fxIgjUwF_Xi24kogEe-dS-GUJ3Vjh_P02z2tSY3X474xGCig8ZmcQx0lJi5mfiBevXhybZLSxgCN9hfPNa2pFOqSdkodpAi-C2y7C27qy_ukt8A5GV0eYoif_aZS4MPZDctxhPcOesA_9mXN6hvepvO6K7lNxPsE8VCrhfTpGNiLm0yNMYwUAxqZ1kZTnsFKpertloVx5Zlg6f1CB-SgmKuSRVEACj3zXdeDlZb_UhJofewluthchl41DT2fj8sa7YGeb8'
  },
  {
    title: 'Geothermal HVAC Installation',
    date: 'JAN 15, 2024',
    status: 'Pending',
    assignee: 'Elena Rodriguez',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVxf2zfrSaK9QSszICJAblAPDc7mcWclcbUSdauzRoGi00ROZFcICmj5hsu6zJ42zRfi5VXGbmSvSmrar-62ZBZJWfaq_hNsWe1zsWiaM_nNsRtJv3UXTXZP5hU4h4zf432aLQT_4ThTI-iaf8z9htNuWykTna1ZF4KTWveFnHnrSXLCIvDurXNKN2Wt6V2dgKzgMUV8240Gedla2O65reXSD6WkkuSRDzaTBYndb8GA01hlbJyOMY2RULtljpZoxXHwn35eDv9lo'
  }
];

const MilestoneTimeline = () => {
  return (
    <div className="relative pl-10 md:pl-12 lg:pl-16 pb-20">
      {/* The Living Stem (Vertical Line) */}
      <div className="absolute left-[19px] top-0 bottom-0 w-1 bg-slate-100 rounded-full"></div>
      
      {/* Progress Stem Highlight (Emerald) - In a real app this would be calculated based on active index */}
      <div className="absolute left-[19px] top-0 w-1 bg-gradient-to-b from-emerald-600 via-secondary to-emerald-400 rounded-full h-[45%] shadow-[0_0_15px_rgba(5,150,105,0.4)] z-0"></div>

      <div className="space-y-16">
        {milestones.map((milestone, index) => (
          <div key={index} className="relative group">
            {/* The Horizontal Branch */}
            <div className={`absolute -left-[20px] top-5 w-10 h-0.5 transition-colors duration-500 ${
              milestone.status === 'Completed' || milestone.status === 'In Progress' ? 'bg-emerald-500/30' : 'bg-slate-100'
            }`}></div>

            {/* The Node (Dot) */}
            <div className={`absolute -left-[30px] top-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center z-10 transition-all duration-500 shadow-sm ${
              milestone.status === 'Completed' ? 'bg-emerald-600 scale-110' : 
              milestone.status === 'In Progress' ? 'bg-secondary ring-2 ring-emerald-500/20' : 
              'bg-slate-200'
            }`}>
              {milestone.status === 'Completed' ? (
                <span className="material-symbols-outlined text-white !text-xs font-bold leading-none">check</span>
              ) : milestone.status === 'In Progress' ? (
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              ) : null}
            </div>

            {/* Milestone Card */}
            <div className={`p-8 rounded-3xl transition-all duration-500 border ${
              milestone.status === 'In Progress' 
                ? 'bg-emerald-950 text-white border-emerald-800 shadow-2xl shadow-emerald-950/40 -translate-y-1' 
                : 'bg-surface-container-lowest border-slate-100/50 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5'
            }`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 block ${
                    milestone.status === 'In Progress' ? 'text-secondary-container' : 'text-slate-400'
                  }`}>
                    {milestone.status}
                  </span>
                  <h4 className={`text-xl font-bold tracking-tight font-headline ${
                    milestone.status === 'In Progress' ? 'text-white' : 'text-primary'
                  }`}>
                    {milestone.title}
                  </h4>
                </div>
                <div className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase font-headline border ${
                  milestone.status === 'In Progress' 
                    ? 'bg-white/10 border-white/20 text-white' 
                    : 'bg-slate-50 border-slate-100 text-slate-500'
                }`}>
                  {milestone.date}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" src={milestone.avatar} alt={milestone.assignee} />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <p className={`text-[8px] font-bold uppercase tracking-widest leading-none ${
                        milestone.status === 'In Progress' ? 'text-emerald-400/70' : 'text-slate-400'
                    }`}>Assigned To</p>
                    <p className={`text-xs font-bold mt-1 ${
                        milestone.status === 'In Progress' ? 'text-emerald-50' : 'text-primary'
                    }`}>{milestone.assignee}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className={`p-2 rounded-lg transition-colors ${
                        milestone.status === 'In Progress' ? 'hover:bg-white/10 text-emerald-300' : 'hover:bg-slate-100 text-slate-400 hover:text-primary'
                    }`}>
                        <span className="material-symbols-outlined text-base">forum</span>
                    </button>
                    <button className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest font-headline transition-all ${
                        milestone.status === 'In Progress' 
                            ? 'bg-secondary text-white hover:brightness-110' 
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}>
                        View Details
                    </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MilestoneTimeline;
