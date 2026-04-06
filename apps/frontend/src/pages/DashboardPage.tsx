import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { canCreateProject, canLogSustainabilityMetrics } from '@/lib/rbac';
import DashboardLayout from '@/components/common/DashboardLayout';
import StatCards from '@/components/dashboard/StatCards';
import ProjectOverview from '@/components/dashboard/ProjectOverview';
import SecondaryColumn from '@/components/dashboard/SecondaryColumn';
import { dashboardApi } from '@/lib/api';
import { useDashboardStore } from '@/store';
export default function DashboardPage() {
    const { user } = useAuth();
    const userName = user?.fullName || 'User';
    const { setDashboard, setDashboardLoading, isDashboardLoading, projects } = useDashboardStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const load = async () => {
            setDashboardLoading(true);
            try {
                const [projectsRes, activeCount, pendingApprovals, highRiskCount, checklistsRes] = await Promise.all([
                    dashboardApi.getRecentProjects(),
                    dashboardApi.getActiveProjectCount(),
                    dashboardApi.getPendingApprovals(),
                    dashboardApi.getHighRiskCount(),
                    dashboardApi.getUpcomingChecklists(),
                ]);
                const projectList = projectsRes.data;
                const avgSustainability = projectList.length > 0
                    ? Math.round(projectList.reduce((s, p) => s + (p.sustainabilityScore ?? 0), 0) / projectList.length)
                    : 0;
                const upcomingDueDates = checklistsRes.data
                    .filter((c) => c.dueDate)
                    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
                    .slice(0, 5);
                setDashboard({ projects: projectList, activeCount, pendingApprovals, highRiskCount, avgSustainability, upcomingDueDates });
            }
            catch (err) {
                console.error('Dashboard load failed:', err);
                toast.error('Failed to load dashboard data');
            }
            finally {
                setDashboardLoading(false);
            }
        };
        load();
    }, [setDashboard, setDashboardLoading]);
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    if (!user)
        return null;
    const showQuickActions = canCreateProject(user.role) || canLogSustainabilityMetrics(user.role);
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const firstProjectId = projects[0]?._id;
    return (<DashboardLayout>
      <header className="py-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
        <div>
          <p className="text-secondary font-bold text-sm tracking-widest uppercase mb-1 font-headline">Overview Dashboard</p>
          <h2 className="text-4xl font-extrabold text-primary tracking-tighter leading-tight font-headline">
            Welcome back, {userName}
          </h2>
          <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm font-medium">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            <span>{today}</span>
          </div>
        </div>

        {showQuickActions && (<div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(o => !o)} aria-haspopup="true" aria-expanded={menuOpen} className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-lg flex items-center gap-2 shadow-lg shadow-primary/10 hover:brightness-110 active:scale-95 transition-all outline-none cursor-pointer font-headline translate-y-2 lg:translate-y-0">
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Quick Action
            <span className={`material-symbols-outlined text-lg transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}>expand_more</span>
          </button>
          {menuOpen && (<div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-20">
              {canCreateProject(user.role) && (<Link onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium font-headline" to="/projects/new">
                <span className="material-symbols-outlined text-lg">architecture</span> New Project
              </Link>)}
              {canLogSustainabilityMetrics(user.role) && (<Link onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium font-headline" to={projects.length === 1 ? `/projects/${firstProjectId}/sustainability/record` : '/projects'}>
                <span className="material-symbols-outlined text-lg">monitoring</span> Log Metrics
              </Link>)}
            </div>)}
        </div>)}
      </header>

      <StatCards isLoading={isDashboardLoading}/>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8 pb-10">
        <div className="xl:col-span-2">
          <ProjectOverview isLoading={isDashboardLoading}/>
        </div>
        <div className="xl:col-span-1">
          <SecondaryColumn />
        </div>
      </div>
    </DashboardLayout>);
}
