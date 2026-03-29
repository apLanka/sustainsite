import { Link } from 'react-router-dom';

const projects = [
  {
    name: 'Eco-Hub Corporate Center',
    location: 'Site A-12 • Vancouver, BC',
    progress: 74,
    status: 'In Progress',
    manager: 'Sarah Jenkins',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBemI1byj2zRLu-Fe9i0-F5Y_f0Z1ufhXpAasg0sKaYgr-RvIhl_DgJC91zdrmaSHLHMOHENNW_7slbCed5L1IdDZ742ybz_aVvRa8gbkKlwONl_FAXZ0jLqD6gvCq_jVI5gBD5xWHMlCaOL4lP7cKOzc3NIXeph34TSunqYxXKx4x_vZojG7vrJatQLblQ2ZKISP9nchunuD0Cf1zXdKdS9GXqLbUnzf55jl89qHl62OhqUaJ3BpKB_ccwHx95cJLx6rexnw8jhdU',
    team: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBRwz4Op31qJB2R9BVG8GpQSjgIJIR6xhZ3LLHQTfW9mDyzq5Mawr_BhtYvJsq8sq7P8IH3zy6zgILg_3o5x-NiKbqJSEiLESG5rR6qdFSx2oCfmD4rBlu4ACvQtVtm-nburnMuRUWp56sTygBZkPXk_bH3_UPepqxs8WpT9t2DE8tRIkTnGw4-m3cZAwpqZ9CekPI_YtUK8AoJPf5teVBP6_NbTseyfcNoC6kgHlx9YHqeQvwHlm2IP2JhtnDJoVXsvvKRb2wVLak',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDZ9waGWfGvpDbXJ8ipzaPyTHkruRybiaNlJa4cJwj2oSoAlMAdLtOaH3ULzmaqp4NDP9eOgZk4cF9thdWrh0H4xAN1vTRTjBO4dNpRp3fqEySCVi9I4FxcCoQkdM1CJ5m58DAVV9ncpWcDDqAqM7lvwQ4IAUNNF6weUisO4CT6r1iWKt-13k-kvWXzY0-k-3qv-hOq9rMa8BRflDHB4iM8xlX9qWV3Bnfl5ispIJztei6zaWytNp1zLUcPxubqm7QfEw-RL4X0zNg'
    ]
  },
  {
    name: 'Greenwood Residential Complex',
    location: 'Phase II • Seattle, WA',
    progress: 42,
    status: 'In Progress',
    manager: 'Michael Chen',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqlVZdn5qbtL3m8aXquUJUnjpXPv0101sZZ_XZqsR7Kv8nGOIYwIx0yNzOSPpycRVihRk_VTwSAUuiebuEtCCiGp6DQwAoDrUSfm-Sb9_wS-G2XumgXzZjUTlJZhFaGbbdG77yC3qe5wgV1hR1tS9d2fUcYFhKPRQkwoJeT_ivEeIONGOIF3NEJqA84tErcznEQWbFXUqZtMkXMjA35tyyaKi6R2WTuq2fMpEEznWlcuuDtoTRu3941R8bKq0aFx0WmfN469Pn1C0',
    team: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAYJPOM_fxIgjUwF_Xi24kogEe-dS-GUJ3Vjh_P02z2tSY3X474xGCig8ZmcQx0lJi5mfiBevXhybZLSxgCN9hfPNa2pFOqSdkodpAi-C2y7C27qy_ukt8A5GV0eYoif_aZS4MPZDctxhPcOesA_9mXN6hvepvO6K7lNxPsE8VCrhfTpGNiLm0yNMYwUAxqZ1kZTnsFKpertloVx5Zlg6f1CB-SgmKuSRVEACj3zXdeDlZb_UhJofewluthchl41DT2fj8sa7YGeb8'
    ]
  },
  {
    name: 'Harbor Renewables Park',
    location: 'Grid Connectivity • Portland, OR',
    progress: 98,
    status: 'Final Review',
    manager: 'Sarah Jenkins',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBemI1byj2zRLu-Fe9i0-F5Y_f0Z1ufhXpAasg0sKaYgr-RvIhl_DgJC91zdrmaSHLHMOHENNW_7slbCed5L1IdDZ742ybz_aVvRa8gbkKlwONl_FAXZ0jLqD6gvCq_jVI5gBD5xWHMlCaOL4lP7cKOzc3NIXeph34TSunqYxXKx4x_vZojG7vrJatQLblQ2ZKISP9nchunuD0Cf1zXdKdS9GXqLbUnzf55jl89qHl62OhqUaJ3BpKB_ccwHx95cJLx6rexnw8jhdU',
    team: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAVxf2zfrSaK9QSszICJAblAPDc7mcWclcbUSdauzRoGi00ROZFcICmj5hsu6zJ42zRfi5VXGbmSvSmrar-62ZBZJWfaq_hNsWe1zsWiaM_nNsRtJv3UXTXZP5hU4h4zf432aLQT_4ThTI-iaf8z9htNuWykTna1ZF4KTWveFnHnrSXLCIvDurXNKN2Wt6V2dgKzgMUV8240Gedla2O65reXSD6WkkuSRDzaTBYndb8GA01hlbJyOMY2RULtljpZoxXHwn35eDv9lo'
    ]
  },
  {
    name: 'Skyline Terrace',
    location: 'District 4 • Toronto, ON',
    progress: 15,
    status: 'Planning',
    manager: 'Elena Rodriguez',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqlVZdn5qbtL3m8aXquUJUnjpXPv0101sZZ_XZqsR7Kv8nGOIYwIx0yNzOSPpycRVihRk_VTwSAUuiebuEtCCiGp6DQwAoDrUSfm-Sb9_wS-G2XumgXzZjUTlJZhFaGbbdG77yC3qe5wgV1hR1tS9d2fUcYFhKPRQkwoJeT_ivEeIONGOIF3NEJqA84tErcznEQWbFXUqZtMkXMjA35tyyaKi6R2WTuq2fMpEEznWlcuuDtoTRu3941R8bKq0aFx0WmfN469Pn1C0',
    team: []
  }
];

const ProjectsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map((project, index) => (
        <div 
          key={index} 
          className="bg-surface-container-lowest rounded-2xl shadow-sm border border-slate-100/50 overflow-hidden group hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 hover:-translate-y-1"
        >
          {/* Project Image */}
          <div className="relative h-48 overflow-hidden">
            <img 
              src={project.image} 
              alt={project.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                project.status === 'Planning' ? 'bg-amber-100 text-amber-700' : 
                project.status === 'Final Review' ? 'bg-secondary-container text-on-secondary-container' : 
                'bg-emerald-100 text-emerald-800'
              }`}>
                {project.status}
              </span>
              <span className="text-white text-2xl font-black tracking-tighter">{project.progress}%</span>
            </div>
          </div>
          
          {/* Card Content */}
          <div className="p-6 space-y-4">
            <div>
              <Link to="/projects/1" className="block group/title">
                <h4 className="text-xl font-bold text-primary leading-tight font-headline group-hover/title:text-secondary transition-colors truncate">
                  {project.name}
                </h4>
              </Link>
              <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-widest">{project.location}</p>
            </div>
            
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-secondary to-primary-container rounded-full transition-all duration-1000"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <div className="flex -space-x-2">
                {project.team.slice(0, 3).map((avatar, i) => (
                  <img 
                    key={i} 
                    src={avatar} 
                    className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-sm"
                    alt="Team member"
                  />
                ))}
                {project.team.length > 3 && (
                  <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500">
                    +{project.team.length - 3}
                  </div>
                )}
                {project.team.length === 0 && (
                  <div className="w-7 h-7 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-300 !text-xs">person_add</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-secondary transition-colors">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Update 2h ago</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectsGrid;
