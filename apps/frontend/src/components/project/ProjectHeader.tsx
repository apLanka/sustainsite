import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useProjectStore } from '@/store';
import { projectApi } from '@/lib/api';
import { ProjectStatus } from '@/types/project';
import { useAuth } from '@/contexts/AuthContext';
import { canDeleteProject, canManageProjectSettings } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
const statusConfig: Record<
  ProjectStatus,
  {
    bg: string;
    text: string;
    dot: string;
  }
> = {
  [ProjectStatus.PLANNING]: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  [ProjectStatus.IN_PROGRESS]: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  [ProjectStatus.ON_HOLD]: { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' },
  [ProjectStatus.COMPLETED]: {
    bg: 'bg-secondary-container',
    text: 'text-on-secondary-container',
    dot: 'bg-secondary',
  },
};
const statusOptions: {
  value: ProjectStatus;
  label: string;
  icon: string;
}[] = [
  { value: ProjectStatus.PLANNING, label: 'Planning', icon: 'edit_calendar' },
  { value: ProjectStatus.IN_PROGRESS, label: 'In Progress', icon: 'construction' },
  { value: ProjectStatus.ON_HOLD, label: 'On Hold', icon: 'pause_circle' },
  { value: ProjectStatus.COMPLETED, label: 'Completed', icon: 'task_alt' },
];
const TabLink = ({
  to,
  label,
  icon,
  end,
}: {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}) => (
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
    <style
      dangerouslySetInnerHTML={{ __html: `.active div { transform: scaleX(1) !important; }` }}
    />
  </NavLink>
);
const ProjectMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedProject, setSelectedProject, updateProjectInList } = useProjectStore();
  const canStatus = canManageProjectSettings(selectedProject, user?.userId);
  const canDel = canDeleteProject(user?.role);
  const showMenu = canStatus || canDel;
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirming(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);
  const handleStatusChange = async (status: ProjectStatus) => {
    if (!id || status === selectedProject?.status) {
      setOpen(false);
      return;
    }
    setBusy(true);
    try {
      const res = await projectApi.updateProject(id, { status });
      setSelectedProject(res.data);
      updateProjectInList(id, { status });
    } catch (err) {
      toast.error('Failed to update project status');
      console.error('Failed to update status:', err);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };
  const handleDelete = async () => {
    if (!id) return;
    setBusy(true);
    try {
      await projectApi.deleteProject(id);
      navigate('/projects');
    } catch (err) {
      console.error('Failed to delete project:', err);
      toast.error('Failed to delete project');
      setBusy(false);
      setConfirming(false);
      setOpen(false);
    }
  };
  if (!showMenu) return null;
  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setConfirming(false);
        }}
        disabled={busy || !selectedProject}
        className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary hover:bg-slate-100 transition-all cursor-pointer shadow-sm disabled:opacity-60"
        aria-label="Project options"
      >
        {busy ? (
          <span className="w-4 h-4 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
        ) : (
          <span className="material-symbols-outlined">more_vert</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          {!confirming ? (
            <>
              {canStatus && (
                <div className="px-3 pt-3 pb-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1 mb-1.5">
                    Set Status
                  </p>
                  {statusOptions.map(({ value, label, icon }) => {
                    const active = value === selectedProject?.status;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleStatusChange(value)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left
                        ${
                          active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">{icon}</span>
                        {label}
                        {active && (
                          <span className="ml-auto material-symbols-outlined text-[14px] text-emerald-500">
                            check
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {canStatus && canDel && <div className="mx-3 my-2 border-t border-slate-50" />}

              {canDel && (
                <div className={`px-3 ${canStatus ? 'pb-3' : 'pt-3 pb-3'}`}>
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 transition-all text-left"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                    Delete Project
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-rose-500">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                <p className="text-xs font-black">Delete this project?</p>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                This is permanent and cannot be undone. All milestones associated with this project
                will also be removed.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={busy}
                  className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-60"
                >
                  {busy ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
const ProjectHeader = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { selectedProject, isDetailLoading, setSelectedProject, setDetailLoading } =
    useProjectStore();
  const canSeeSafety = user?.role === UserRole.ADMIN || user?.role === UserRole.INSPECTOR;
  useEffect(() => {
    if (!id) return;
    if (selectedProject?._id === id) return;
    const fetch = async () => {
      setDetailLoading(true);
      try {
        const res = await projectApi.getProjectById(id);
        setSelectedProject(res.data);
      } catch (err) {
        console.error('ProjectHeader: failed to load project', err);
        toast.error('Failed to load project details');
      } finally {
        setDetailLoading(false);
      }
    };
    fetch();
  }, [id, selectedProject?._id, setSelectedProject, setDetailLoading]);
  const [copied, setCopied] = useState(false);
  const projectName = isDetailLoading
    ? 'Loading...'
    : (selectedProject?.projectName ?? 'Project Details');
  const complianceLabel = selectedProject
    ? `${selectedProject.sustainabilityScore}% Sustainability`
    : '—';
  const handleCopyId = async () => {
    if (!id) return;
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
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

              <button
                id="copy-project-id-btn"
                type="button"
                onClick={handleCopyId}
                title={copied ? 'Copied!' : 'Copy project ID'}
                className={`
                  group relative flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full border
                  transition-all duration-200 cursor-pointer select-none
                  ${
                    copied
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100/50 hover:bg-emerald-100 hover:border-emerald-200'
                  }
                `}
              >
                {!copied && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                <span className="font-mono tracking-wider">{copied ? 'COPIED!' : `ID: ${id}`}</span>
                <span
                  className={`material-symbols-outlined text-[14px] transition-all duration-200 ${copied ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'}`}
                >
                  {copied ? 'check_circle' : 'content_copy'}
                </span>
                <span
                  className="
                  pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2
                  bg-slate-800 text-white text-[9px] font-bold uppercase tracking-wider
                  px-2 py-1 rounded-md whitespace-nowrap
                  opacity-0 group-hover:opacity-100 transition-opacity duration-150
                "
                >
                  {copied ? 'Copied to clipboard' : 'Click to copy ID'}
                </span>
              </button>

              {selectedProject &&
                (() => {
                  const sc = statusConfig[selectedProject.status];
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors duration-300 ${sc.bg} ${sc.text} border-current/10`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${selectedProject.status === ProjectStatus.IN_PROGRESS ? 'animate-pulse' : ''}`}
                      />
                      {selectedProject.status}
                    </span>
                  );
                })()}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Sustainability
              </span>
              <span className="text-sm font-bold text-secondary">{complianceLabel}</span>
            </div>

            <ProjectMenu />
          </div>
        </div>

        <nav className="flex items-center gap-10 overflow-x-auto">
          <TabLink to={`/projects/${id}`} label="Overview" icon="grid_view" end />
          <TabLink to={`/projects/${id}/sustainability`} label="Sustainability" icon="eco" />
          <TabLink to={`/projects/${id}/documents`} label="Documents" icon="description" />
          <TabLink to={`/projects/${id}/compliance`} label="Compliance" icon="fact_check" />
          {canSeeSafety && <TabLink to={`/projects/${id}/safety`} label="Safety" icon="health_and_safety" />}
          <TabLink to={`/projects/${id}/resources`} label="Resources" icon="inventory_2" />
        </nav>
      </div>
    </div>
  );
};
export default ProjectHeader;
