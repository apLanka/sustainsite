import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/common/DashboardLayout';
import StatCards from '@/components/dashboard/StatCards';
import ProjectOverview from '@/components/dashboard/ProjectOverview';
import { dashboardApi } from '@/lib/api';
import { useDashboardStore } from '@/store';

export default function DashboardPage() {
  const { user } = useAuth();
  const userName = user?.fullName || 'User';

  const { setDashboard, setDashboardLoading, isDashboardLoading } = useDashboardStore();

  useEffect(() => {
    const load = async () => {
      setDashboardLoading(true);
      try {
        const [projectsRes, activeCount, pendingApprovals, highRiskCount, checklistsRes] =
          await Promise.all([
            dashboardApi.getRecentProjects(),
            dashboardApi.getActiveProjectCount(),
            dashboardApi.getPendingApprovals(),
            dashboardApi.getHighRiskCount(),
            dashboardApi.getUpcomingChecklists(),
          ]);

        const projects = projectsRes.data;
        const avgSustainability =
          projects.length > 0
            ? Math.round(
                projects.reduce((s, p) => s + (p.sustainabilityScore ?? 0), 0) / projects.length
              )
            : 0;

        const upcomingDueDates = checklistsRes.data
          .filter((c) => c.dueDate)
          .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
          .slice(0, 5);

        setDashboard({ projects, activeCount, pendingApprovals, highRiskCount, avgSustainability, upcomingDueDates });
      } catch (err) {
        console.error('Dashboard load failed:', err);
      } finally {
        setDashboardLoading(false);
      }
    };
    load();
  }, [setDashboard, setDashboardLoading]);

  if (!user) return null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <DashboardLayout>
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

        <div className="relative group">
          <button className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-lg flex items-center gap-2 shadow-lg shadow-primary/10 hover:brightness-110 active:scale-95 transition-all outline-none cursor-pointer font-headline translate-y-2 lg:translate-y-0">
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Quick Action
            <span className="material-symbols-outlined text-lg">expand_more</span>
          </button>
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 hidden group-hover:block z-20">
            <a className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium font-headline" href="/projects/new">
              <span className="material-symbols-outlined text-lg">architecture</span> New Project
            </a>
            <a className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium font-headline" href="#">
              <span className="material-symbols-outlined text-lg">monitoring</span> Log Metrics
            </a>
          </div>
        </div>
      </header>

      <StatCards isLoading={isDashboardLoading} />
      <ProjectOverview isLoading={isDashboardLoading} />
    </DashboardLayout>
  );
}
