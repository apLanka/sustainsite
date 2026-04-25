import { Link } from 'react-router-dom';
const BlueprintSidebar = () => {
  return (
    <aside className="space-y-6">
      <div className="bg-emerald-950 text-white p-8 rounded-3xl shadow-xl shadow-emerald-950/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full -mr-10 -mt-10 blur-3xl group-hover:bg-secondary/30 transition-all duration-700"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <span
              className="material-symbols-outlined text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              eco
            </span>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary-container">
              Sustainability Pulse
            </h4>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-emerald-100/70">Estimated Score</span>
              <span className="text-3xl font-black tracking-tighter">82%</span>
            </div>
            <div className="h-1.5 w-full bg-emerald-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-secondary to-emerald-400 w-[82%] rounded-full shadow-[0_0_8px_rgba(14,108,74,0.4)]"></div>
            </div>
            <p className="text-[10px] text-emerald-100/50 leading-relaxed italic">
              "Integrating high-efficiency HVAC and solar orientation can improve this score by up
              to 14%."
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-8 rounded-3xl border border-slate-100/50 shadow-sm">
        <h4 className="text-sm font-bold text-primary font-headline mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">tips_and_updates</span>
          Blueprint Guidance
        </h4>

        <ul className="space-y-6">
          <li className="flex gap-4 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition-all cursor-default">
              <span className="material-symbols-outlined text-sm">architecture</span>
            </div>
            <div>
              <p className="text-xs font-bold text-primary mb-1">Site Optimization</p>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                Ensure the project orientation maximizes natural lighting for reduced energy load.
              </p>
            </div>
          </li>

          <li className="flex gap-4 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition-all cursor-default">
              <span className="material-symbols-outlined text-sm">water_drop</span>
            </div>
            <div>
              <p className="text-xs font-bold text-primary mb-1">Resource Logging</p>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                Define a baseline for water consumption monitoring during the site prep phase.
              </p>
            </div>
          </li>

          <li className="flex gap-4 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition-all cursor-default">
              <span className="material-symbols-outlined text-sm">description</span>
            </div>
            <div>
              <p className="text-xs font-bold text-primary mb-1">ESG Compliance</p>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                Refer to section 4B of the ESG handbook for material procurement standards.
              </p>
            </div>
          </li>
        </ul>

        <Link
          to="/projects"
          className="block w-full mt-8 py-3 text-xs font-bold text-secondary uppercase tracking-widest hover:underline transition-all text-center"
        >
          View All Projects
        </Link>
      </div>

      <div className="bg-surface-container-low p-6 rounded-2xl border border-slate-100/50">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">
          Help & Support
        </p>
        <a
          href="mailto:support@sustainsite.app"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 border border-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[10px] text-emerald-700">
                support_agent
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-[10px] text-slate-400">help</span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-primary">Contact SustainSite Support</p>
        </a>
      </div>
    </aside>
  );
};
export default BlueprintSidebar;
