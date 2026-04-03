import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/common/DashboardLayout';
import ProjectStats from '@/components/projects/ProjectStats';
import MilestoneTimeline from '@/components/projects/MilestoneTimeline';
import ProjectHeader from '@/components/project/ProjectHeader';
import SmoothTabs from '@/components/ui/SmoothTabs';
import { projectApi } from '@/lib/api';
import { useProjectStore } from '@/store';
import type { CreateMilestonePayload } from '@/types/project';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { selectedProject, isDetailLoading, setSelectedProject, setDetailLoading, appendMilestone } =
    useProjectStore();

  const [activeTab, setActiveTab] = useState('milestones');
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState<CreateMilestonePayload>({
    title: '',
    targetDate: '',
    description: '',
  });
  const [milestoneError, setMilestoneError] = useState<string | null>(null);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);

  const tabs = [
    { id: 'milestones', label: 'Milestones & Timeline' },
    { id: 'team',       label: 'Team & Stakeholders' },
  ];

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      setDetailLoading(true);
      try {
        const res = await projectApi.getProjectById(id);
        setSelectedProject(res.data);
      } catch (err) {
        console.error('Failed to load project:', err);
      } finally {
        setDetailLoading(false);
      }
    };
    fetchProject();

    return () => {
      setSelectedProject(null);
    };
  }, [id, setSelectedProject, setDetailLoading]);

  const handleAddMilestone = async () => {
    if (!id || !milestoneForm.title || !milestoneForm.targetDate) {
      setMilestoneError('Title and target date are required.');
      return;
    }
    setMilestoneError(null);
    setIsAddingMilestone(true);
    try {
      const res = await projectApi.addMilestone(id, milestoneForm);
      appendMilestone(res.data);
      setShowMilestoneModal(false);
      setMilestoneForm({ title: '', targetDate: '', description: '' });
    } catch (err: unknown) {
      setMilestoneError((err as { message?: string })?.message ?? 'Failed to add milestone.');
    } finally {
      setIsAddingMilestone(false);
    }
  };

  const milestones = selectedProject?.milestones ?? [];

  return (
    <DashboardLayout>
      <ProjectHeader />

      <div className="px-10">
        <SmoothTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="underline"
          className="mb-10 pt-10"
        />

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
                {isDetailLoading || !selectedProject ? (
                  <div className="animate-pulse space-y-6">
                    <div className="grid grid-cols-4 gap-6">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-28 bg-slate-100 rounded-2xl" />
                      ))}
                    </div>
                    <div className="h-64 bg-slate-100 rounded-2xl" />
                  </div>
                ) : (
                  <>
                    <ProjectStats project={selectedProject} />

                    <div className="flex justify-between items-center mb-10 overflow-hidden">
                      <h3 className="text-2xl font-black text-primary tracking-tighter leading-none font-headline">
                        Project Roadmap
                      </h3>
                      <button
                        onClick={() => setShowMilestoneModal(true)}
                        className="px-4 py-2 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-lg tracking-widest uppercase hover:bg-emerald-100 transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">add_task</span>
                        Add Milestone
                      </button>
                    </div>

                    <MilestoneTimeline milestones={milestones} />
                  </>
                )}
              </div>
            ) : (
              <div className="bg-surface-container-lowest p-10 rounded-2xl border border-slate-100/50 shadow-sm mb-20">
                <h3 className="text-xl font-bold text-primary font-headline mb-6">Stakeholder Directory</h3>
                <p className="text-slate-500 text-sm font-medium">
                  Team management and stakeholder logging will be available in the next version.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Add Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
            onClick={() => setShowMilestoneModal(false)}
          />
          <div className="bg-white rounded-[40px] w-full max-w-lg relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-950 p-8 text-white">
              <h3 className="text-2xl font-black tracking-tighter leading-none">New Milestone</h3>
              <p className="text-emerald-400/70 text-xs font-bold uppercase tracking-widest mt-2">
                Add to project roadmap
              </p>
            </div>
            <div className="p-10 space-y-6">
              {milestoneError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 font-medium">
                  {milestoneError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Milestone Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Foundation Pouring"
                  className="input-standard w-full h-12"
                  value={milestoneForm.title}
                  onChange={(e) => setMilestoneForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Target Date
                </label>
                <input
                  type="date"
                  className="input-standard w-full h-12 cursor-pointer"
                  value={milestoneForm.targetDate}
                  onChange={(e) => setMilestoneForm((f) => ({ ...f, targetDate: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Description (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe what this milestone covers..."
                  className="input-standard w-full resize-none"
                  value={milestoneForm.description}
                  onChange={(e) => setMilestoneForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setShowMilestoneModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMilestone}
                  disabled={isAddingMilestone}
                  className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isAddingMilestone ? 'Adding...' : 'Add Milestone'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
