import { Link } from 'react-router-dom';

const projects = [
  {
    name: 'Eco-Hub Corporate Center',
    location: 'Site A-12 • Vancouver, BC',
    progress: 74,
    eta: 'DEC 2024',
    team: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBRwz4Op31qJB2R9BVG8GpQSjgIJIR6xhZ3LLHQTfW9mDyzq5Mawr_BhtYvJsq8sq7P8IH3zy6zgILg_3o5x-NiKbqJSEiLESG5rR6qdFSx2oCfmD4rBlu4ACvQtVtm-nburnMuRUWp56sTygBZkPXk_bH3_UPepqxs8WpT9t2DE8tRIkTnGw4-m3cZAwpqZ9CekPI_YtUK8AoJPf5teVBP6_NbTseyfcNoC6kgHlx9YHqeQvwHlm2IP2JhtnDJoVXsvvKRb2wVLak',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDZ9waGWfGvpDbXJ8ipzaPyTHkruRybiaNlJa4cJwj2oSoAlMAdLtOaH3ULzmaqp4NDP9eOgZk4cF9thdWrh0H4xAN1vTRTjBO4dNpRp3fqEySCVi9I4FxcCoQkdM1CJ5m58DAVV9ncpWcDDqAqM7lvwQ4IAUNNF6weUisO4CT6r1iWKt-13k-kvWXzY0-k-3qv-hOq9rMa8BRflDHB4iM8xlX9qWV3Bnfl5ispIJztei6zaWytNp1zLUcPxubqm7QfEw-RL4X0zNg'
    ],
    teamCount: 4
  },
  {
    name: 'Greenwood Residential Complex',
    location: 'Phase II • Seattle, WA',
    progress: 42,
    eta: 'MAR 2025',
    team: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAYJPOM_fxIgjUwF_Xi24kogEe-dS-GUJ3Vjh_P02z2tSY3X474xGCig8ZmcQx0lJi5mfiBevXhybZLSxgCN9hfPNa2pFOqSdkodpAi-C2y7C27qy_ukt8A5GV0eYoif_aZS4MPZDctxhPcOesA_9mXN6hvepvO6K7lNxPsE8VCrhfTpGNiLm0yNMYwUAxqZ1kZTnsFKpertloVx5Zlg6f1CB-SgmKuSRVEACj3zXdeDlZb_UhJofewluthchl41DT2fj8sa7YGeb8'
    ],
    teamCount: 12
  },
  {
    name: 'Harbor Renewables Park',
    location: 'Grid Connectivity • Portland, OR',
    progress: 98,
    eta: 'FINAL REVIEW',
    isFinal: true,
    team: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAVxf2zfrSaK9QSszICJAblAPDc7mcWclcbUSdauzRoGi00ROZFcICmj5hsu6zJ42zRfi5VXGbmSvSmrar-62ZBZJWfaq_hNsWe1zsWiaM_nNsRtJv3UXTXZP5hU4h4zf432aLQT_4ThTI-iaf8z9htNuWykTna1ZF4KTWveFnHnrSXLCIvDurXNKN2Wt6V2dgKzgMUV8240Gedla2O65reXSD6WkkuSRDzaTBYndb8GA01hlbJyOMY2RULtljpZoxXHwn35eDv9lo'
    ],
    teamCount: 0
  }
];

const ProjectOverview = () => {
  return (
    <section className="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-sm border border-slate-100/50 overflow-hidden">
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
        {projects.map((project, index) => (
          <div key={index} className="relative group">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h4 className="text-lg font-bold text-primary leading-tight font-headline">{project.name}</h4>
                <p className="text-xs font-medium text-slate-500">{project.location}</p>
              </div>
              <span className={`text-2xl font-black tracking-tighter ${project.isFinal ? 'text-amber-700' : 'text-secondary'}`}>
                {project.progress}%
              </span>
            </div>
            
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${
                  project.isFinal ? 'from-amber-600 to-amber-700' : 'from-secondary to-primary-container'
                }`}
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between mt-3">
              <div className="flex -space-x-2">
                {project.team.map((avatar, i) => (
                  <img 
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-white object-cover" 
                    src={avatar}
                    alt="Team member"
                  />
                ))}
                {project.teamCount > 0 && (
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 text-[8px] flex items-center justify-center font-bold text-slate-500">
                    +{project.teamCount}
                  </div>
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${project.isFinal ? 'text-amber-700' : 'text-slate-400'}`}>
                {project.isFinal ? 'FINAL REVIEW' : `ETA: ${project.eta}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectOverview;
