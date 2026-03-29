import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import TopNav from '@/components/dashboard/TopNav';
import StatCards from '@/components/dashboard/StatCards';
import ProjectOverview from '@/components/dashboard/ProjectOverview';
import SecondaryColumn from '@/components/dashboard/SecondaryColumn';

export default function DashboardPage() {
  const { user } = useAuth();
  const userName = user?.fullName || 'Sarah';

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Side Navigation Bar */}
      <Sidebar />

      {/* Top Navigation Bar */}
      <TopNav />

      {/* Main Content Area */}
      <main className="ml-64 pt-16 min-h-screen px-10 pb-12 transition-all duration-300">
        <div className="max-w-[1600px] mx-auto">
          {/* Header Section */}
          <header className="py-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
            <div>
              <p className="text-secondary font-bold text-sm tracking-widest uppercase mb-1 font-headline">Overview Dashboard</p>
              <h2 className="text-4xl font-extrabold text-primary tracking-tighter leading-tight font-headline">Welcome back, {userName}</h2>
              <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm font-medium">
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                <span>Monday, October 23, 2023</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-5 py-2.5 bg-surface-container-lowest text-primary font-bold text-sm rounded-lg flex items-center gap-2 shadow-sm border border-slate-200/50 hover:bg-slate-50 transition-all cursor-pointer font-headline translate-y-2 lg:translate-y-0">
                <span className="material-symbols-outlined text-lg">bolt</span>
                Quick Update
              </button>
              
              <div className="relative group">
                <button className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-lg flex items-center gap-2 shadow-lg shadow-primary/10 hover:brightness-110 active:scale-95 transition-all outline-none cursor-pointer font-headline translate-y-2 lg:translate-y-0">
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  Quick Action
                  <span className="material-symbols-outlined text-lg">expand_more</span>
                </button>
                {/* Dropdown Mockup (Hidden by default, shown on group-hover) */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 hidden group-hover:block z-20">
                  <a className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium font-headline" href="#">
                    <span className="material-symbols-outlined text-lg">architecture</span> New Project
                  </a>
                  <a className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium font-headline" href="#">
                    <span className="material-symbols-outlined text-lg">monitoring</span> Log Metrics
                  </a>
                  <a className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium font-headline" href="#">
                    <span className="material-symbols-outlined text-lg">upload_file</span> Upload Document
                  </a>
                </div>
              </div>
            </div>
          </header>

          {/* ROW 1: Summary Widgets (Bento Grid) */}
          <StatCards />

          {/* ROW 2: Asymmetric Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Project Progress Overview (Chart/List) */}
            <ProjectOverview />

            {/* Secondary Column / Cards */}
            <SecondaryColumn />
          </div>
        </div>
      </main>
    </div>
  );
}
