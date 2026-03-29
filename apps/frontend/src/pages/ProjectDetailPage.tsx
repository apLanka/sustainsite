import DashboardLayout from '@/components/common/DashboardLayout';
import ProjectStats from '@/components/projects/ProjectStats';
import MilestoneTimeline from '@/components/projects/MilestoneTimeline';
import ProjectHeader from '@/components/project/ProjectHeader';
import { useState } from 'react';

import SmoothTabs from '@/components/ui/SmoothTabs';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProjectDetailPage() {
  const [activeTab, setActiveTab] = useState('milestones');

  const tabs = [
    { id: 'milestones', label: 'Milestones & Timeline' },
    { id: 'team', label: 'Team & Stakeholders' },
  ];

  return (
    <DashboardLayout>
      <ProjectHeader />
      
      {/* Sub-content Area */}
      <div className="px-10">

      {/* Tabs Navigation */}
      <SmoothTabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
        variant="underline"
        className="mb-10 pt-10"
      />

      {/* Dynamic Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.3 }}
        >
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
        </motion.div>
      </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
