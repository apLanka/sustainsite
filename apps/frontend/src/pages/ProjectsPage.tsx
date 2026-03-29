import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/common/DashboardLayout';
import ProjectFilters from '@/components/projects/ProjectFilters';
import ProjectsGrid from '@/components/projects/ProjectsGrid';

export default function ProjectsPage() {
  return (
    <DashboardLayout>
      {/* Header Section */}
      <header className="py-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
        <div>
          <p className="text-secondary font-bold text-sm tracking-widest uppercase mb-1 font-headline">Operations Centre</p>
          <h2 className="text-4xl font-extrabold text-primary tracking-tighter leading-tight font-headline">Project Inventory</h2>
          <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm font-medium">
            <span className="material-symbols-outlined text-sm">architecture</span>
            <span>Managing 14 Sustainable Infrastructure Projects</span>
          </div>
        </div>

        <Link 
          to="/projects/new"
          className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/10 hover:brightness-110 active:scale-95 transition-all cursor-pointer font-headline"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Create New Project
        </Link>
      </header>

      {/* Filters Section */}
      <ProjectFilters />

      {/* Projects Grid Section */}
      <ProjectsGrid />
    </DashboardLayout>
  );
}
