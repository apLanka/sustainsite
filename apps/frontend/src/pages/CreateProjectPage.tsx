import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/common/DashboardLayout';
import ProjectForm from '@/components/projects/ProjectForm';

export default function CreateProjectPage() {
  return (
    <DashboardLayout>
      {/* Breadcrumbs & Header */}
      <header className="py-10 space-y-4">
        <Link 
          to="/projects" 
          className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-widest hover:underline transition-all group"
        >
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Project Inventory
        </Link>
        
        <div>
          <p className="text-secondary font-bold text-sm tracking-widest uppercase mb-1 font-headline">Operations Centre</p>
          <h2 className="text-4xl font-extrabold text-primary tracking-tighter leading-tight font-headline">Create New Project Blueprint</h2>
          <p className="text-slate-500 text-sm font-medium mt-2 max-w-2xl text-balance">
            Initialize a new sustainable construction project by defining its scope, budget, and location. This data will form the baseline for sustainability monitoring and resource management.
          </p>
        </div>
      </header>

      {/* Form Container */}
      <div className="bg-surface-container-lowest rounded-3xl p-10 shadow-sm border border-slate-100/50 mb-12">
        <ProjectForm />
      </div>
    </DashboardLayout>
  );
}
