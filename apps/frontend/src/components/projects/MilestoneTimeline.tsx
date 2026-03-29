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
    <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-100 before:to-transparent">
      {milestones.map((milestone, index) => (
        <div 
          key={index} 
          className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}
        >
          {/* Dot */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            {milestone.status === 'Completed' ? (
              <span className="material-symbols-outlined text-emerald-600 !text-xl">check_circle</span>
            ) : milestone.status === 'In Progress' ? (
              <div className="w-3 h-3 bg-emerald-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(5,150,105,0.5)]"></div>
            ) : (
              <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
            )}
          </div>
          
          {/* Card */}
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-surface-container-lowest border border-slate-100/50 shadow-sm transition-all hover:shadow-xl hover:shadow-emerald-950/5 hover:-translate-y-0.5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
              <span className={`text-[10px] font-black uppercase tracking-widest ${
                milestone.status === 'Completed' ? 'text-emerald-700' : 
                milestone.status === 'In Progress' ? 'text-secondary' : 
                'text-slate-400'
              }`}>
                {milestone.status}
              </span>
              <time className="text-[10px] font-bold text-slate-400 font-headline uppercase tracking-widest">{milestone.date}</time>
            </div>
            
            <h4 className="text-lg font-bold text-primary font-headline tracking-tight group-hover:text-secondary transition-colors">{milestone.title}</h4>
            
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50">
              <img className="w-7 h-7 rounded-full object-cover border border-slate-100 shadow-sm" src={milestone.avatar} alt={milestone.assignee} />
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Assignee</p>
                <p className="text-xs font-bold text-primary mt-0.5">{milestone.assignee}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MilestoneTimeline;
