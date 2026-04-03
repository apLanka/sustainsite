import { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useProjectStore } from '@/store';

const TabLink = ({ to, label, icon, end }: { to: string; label: string; icon: string; end?: boolean }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `
      flex items-center gap-2 pb-4 text-[10px] font-black uppercase tracking-[0.15em] transition-all relative group
      ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}
    `}
  >
    <span className="material-symbols-outlined text-[20px]">{icon}</span>
    <span>{label}</span>
    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full transition-all duration-300 transform scale-x-0 group-[.active]:scale-x-100" />
    <style dangerouslySetInnerHTML={{ __html: `.active div { transform: scaleX(1) !important; }` }} />
  </NavLink>
);

const ProjectHeader = () => {
  const { id } = useParams();
  const { selectedProject, isDetailLoading } = useProjectStore();
  const [copied, setCopied] = useState(false);

  const projectName = isDetailLoading
    ? 'Loading...'
    : selectedProject?.projectName ?? 'Project Details';

  const complianceLabel = selectedProject
    ? `${selectedProject.sustainabilityScore}% Sustainability`
    : '—';

  const handleCopyId = async () => {
    if (!id) return;
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — silently ignore */
    }
  };

  return (
    <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-10 pt-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
              <NavLink to="/projects" className="hover:text-primary transition-colors">
                Projects
              </NavLink>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span className="text-secondary font-bold">Construction Context</span>
            </div>
            <h2 className="text-4xl font-extrabold text-primary tracking-tighter leading-none font-headline flex items-center gap-4 flex-wrap">
              {projectName}

              {/* Project ID badge — click to copy */}
              <button
                id="copy-project-id-btn"
                type="button"
                onClick={handleCopyId}
                title={copied ? 'Copied!' : 'Copy project ID'}
                className={`
                  group relative flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full border
                  transition-all duration-200 cursor-pointer select-none
                  ${copied
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-100/50 hover:bg-emerald-100 hover:border-emerald-200'
                  }
                `}
              >
                {/* pulse dot — hide when copied */}
                {!copied && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}

                <span className="font-mono tracking-wider">
                  {copied ? 'COPIED!' : `ID: ${id}`}
                </span>

                {/* icon toggle */}
                <span
                  className={`material-symbols-outlined text-[14px] transition-all duration-200 ${
                    copied ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'
                  }`}
                >
                  {copied ? 'check_circle' : 'content_copy'}
                </span>

                {/* tooltip */}
                <span className="
                  pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2
                  bg-slate-800 text-white text-[9px] font-bold uppercase tracking-wider
                  px-2 py-1 rounded-md whitespace-nowrap
                  opacity-0 group-hover:opacity-100 transition-opacity duration-150
                ">
                  {copied ? 'Copied to clipboard' : 'Click to copy ID'}
                </span>
              </button>
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Sustainability
              </span>
              <span className="text-sm font-bold text-secondary">{complianceLabel}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary hover:bg-slate-100 transition-all cursor-pointer shadow-sm">
              <span className="material-symbols-outlined">more_vert</span>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-10">
          <TabLink to={`/projects/${id}`}                   label="Overview"      icon="grid_view"   end />
          <TabLink to={`/projects/${id}/sustainability`}     label="Sustainability" icon="eco" />
          <TabLink to={`/projects/${id}/documents`}          label="Documents"     icon="description" />
          <TabLink to={`/projects/${id}/compliance`}         label="Compliance"    icon="fact_check" />
          <TabLink to={`/projects/${id}/resources`}          label="Resources"     icon="inventory_2" />
        </nav>
      </div>
    </div>
  );
};

export default ProjectHeader;

