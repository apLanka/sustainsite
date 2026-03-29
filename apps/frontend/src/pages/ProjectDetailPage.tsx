import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/common/DashboardLayout';
import ProjectStats from '@/components/projects/ProjectStats';
import MilestoneTimeline from '@/components/projects/MilestoneTimeline';
import ProjectHeader from '@/components/project/ProjectHeader';
import { useState } from 'react';

export default function ProjectDetailPage() {
  const [activeTab, setActiveTab] = useState('milestones');

  return (
    <DashboardLayout>
      <ProjectHeader />
      
      {/* Sub-content Area */}
      <div className="px-10">

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
      </div>
    </DashboardLayout>
  );
}
