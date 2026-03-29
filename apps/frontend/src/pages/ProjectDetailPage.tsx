import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '@/components/common/DashboardLayout';
import ProjectStats from '@/components/projects/ProjectStats';
import MilestoneTimeline from '@/components/projects/MilestoneTimeline';
import { useState } from 'react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('milestones');

  return (
    <DashboardLayout>
      {/* Header Section with Image Overlay and Breadcrumbs */}
      <div className="relative h-80 -mx-10 group overflow-hidden">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBemI1byj2zRLu-Fe9i0-F5Y_f0Z1ufhXpAasg0sKaYgr-RvIhl_DgJC91zdrmaSHLHMOHENNW_7slbCed5L1IdDZ742ybz_aVvRa8gbkKlwONl_FAXZ0jLqD6gvCq_jVI5gBD5xWHMlCaOL4lP7cKOzc3NIXeph34TSunqYxXKx4x_vZojG7vrJatQLblQ2ZKISP9nchunuD0Cf1zXdKdS9GXqLbUnzf55jl89qHl62OhqUaJ3BpKB_ccwHx95cJLx6rexnw8jhdU" 
          alt="Project Cover" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/40 to-transparent"></div>
        
        <div className="absolute inset-0 px-10 flex flex-col justify-end pb-10">
          <Link 
            to="/projects" 
            className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-widest hover:text-white transition-all mb-6 group/back"
          >
            <span className="material-symbols-outlined text-sm group-hover/back:-translate-x-1 transition-transform">arrow_back</span>
            Back to Inventory
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest">In Progress</span>
              <h2 className="text-5xl font-extrabold text-white tracking-tighter leading-tight font-headline">Eco-Hub Corporate Center</h2>
              <div className="flex items-center gap-4 text-emerald-300/80 text-sm font-medium">
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">location_on</span>Site A-12 • Vancouver, BC</span>
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">person</span>PM: Sarah Jenkins</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-5 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-sm rounded-xl border border-white/20 transition-all cursor-pointer font-headline flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">edit</span> Edit Blueprint
              </button>
              <button className="px-5 py-3 bg-white text-emerald-950 font-bold text-sm rounded-xl shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer font-headline flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">add_circle</span> Log Metrics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-10 border-b border-slate-100 mb-10 pt-10">
        <button 
          onClick={() => setActiveTab('milestones')}
          className={`pb-4 text-sm font-bold uppercase tracking-widest font-headline transition-all relative ${
            activeTab === 'milestones' ? 'text-primary' : 'text-slate-400 hover:text-primary'
          }`}
        >
          Milestones & Timeline
          {activeTab === 'milestones' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary rounded-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('team')}
          className={`pb-4 text-sm font-bold uppercase tracking-widest font-headline transition-all relative ${
            activeTab === 'team' ? 'text-primary' : 'text-slate-400 hover:text-primary'
          }`}
        >
          Team & Stakeholders
          {activeTab === 'team' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary rounded-full"></div>}
        </button>
      </div>

      {/* Dynamic Content */}
      {activeTab === 'milestones' ? (
        <div className="space-y-12 pb-20">
          <ProjectStats />
          
          <div className="flex justify-between items-center mb-10 overflow-hidden">
            <h3 className="text-2xl font-black text-primary tracking-tighter leading-none font-headline">Project Roadmap</h3>
            <button className="px-4 py-2 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-lg tracking-widest uppercase hover:bg-emerald-100 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">add_task</span> Add Milestone
            </button>
          </div>
          
          <MilestoneTimeline />
        </div>
      ) : (
        <div className="bg-surface-container-lowest p-10 rounded-2xl border border-slate-100/50 shadow-sm mb-20">
          <h3 className="text-xl font-bold text-primary font-headline mb-6">Stakeholder Directory</h3>
          <p className="text-slate-500 text-sm font-medium">Team management and stakeholder logging will be available in the next version.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
