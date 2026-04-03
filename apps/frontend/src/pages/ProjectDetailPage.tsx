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
import type { Milestone, CreateMilestonePayload, UpdateMilestonePayload } from '@/types/project';
import { MilestoneStatus } from '@/types/project';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    selectedProject,
    isDetailLoading,
    setSelectedProject,
    setDetailLoading,
    appendMilestone,
    updateMilestoneInStore,
  } = useProjectStore();

  const [activeTab, setActiveTab] = useState('milestones');

  // ── Add milestone modal ───────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<CreateMilestonePayload>({
    title: '',
    targetDate: '',
    description: '',
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // ── Edit milestone modal ──────────────────────────────────────────────────
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [editForm, setEditForm] = useState<UpdateMilestonePayload>({});
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'milestones', label: 'Milestones & Timeline' },
    { id: 'team',       label: 'Team & Stakeholders'  },
  ];

  // ── Fetch project ─────────────────────────────────────────────────────────
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
    return () => { setSelectedProject(null); };
  }, [id, setSelectedProject, setDetailLoading]);

  // ── Add milestone ─────────────────────────────────────────────────────────
  const handleAddMilestone = async () => {
    if (!id || !addForm.title || !addForm.targetDate) {
      setAddError('Title and target date are required.');
      return;
    }
    setAddError(null);
    setIsAdding(true);
    try {
      const res = await projectApi.addMilestone(id, addForm);
      appendMilestone(res.data);
      setShowAddModal(false);
      setAddForm({ title: '', targetDate: '', description: '' });
    } catch (err: unknown) {
      setAddError((err as { message?: string })?.message ?? 'Failed to add milestone.');
    } finally {
      setIsAdding(false);
    }
  };

  // ── Open edit modal ───────────────────────────────────────────────────────
  const handleOpenEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setEditForm({
      title:               milestone.title,
      description:         milestone.description ?? '',
      targetDate:          milestone.targetDate.slice(0, 10), // yyyy-mm-dd
      status:              milestone.status,
      completionPercentage: milestone.completionPercentage,
    });
    setEditError(null);
  };

  // ── Save edit ─────────────────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!id || !editingMilestone) return;
    if (!editForm.title || !editForm.targetDate) {
      setEditError('Title and target date are required.');
      return;
    }
    setEditError(null);
    setIsSaving(true);
    try {
      const res = await projectApi.updateMilestone(id, editingMilestone._id, editForm);
      updateMilestoneInStore(editingMilestone._id, res.data);
      setEditingMilestone(null);
    } catch (err: unknown) {
      setEditError((err as { message?: string })?.message ?? 'Failed to save changes.');
    } finally {
      setIsSaving(false);
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
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-lg tracking-widest uppercase hover:bg-emerald-100 transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">add_task</span>
                        Add Milestone
                      </button>
                    </div>

                    <MilestoneTimeline milestones={milestones} onEdit={handleOpenEdit} />
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

      {/* ── Add Milestone Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="bg-white rounded-[40px] w-full max-w-lg relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-950 p-8 text-white">
              <h3 className="text-2xl font-black tracking-tighter leading-none">New Milestone</h3>
              <p className="text-emerald-400/70 text-xs font-bold uppercase tracking-widest mt-2">
                Add to project roadmap
              </p>
            </div>
            <div className="p-10 space-y-6">
              {addError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 font-medium">
                  {addError}
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
                  value={addForm.title}
                  onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Target Date
                </label>
                <input
                  type="date"
                  className="input-standard w-full h-12 cursor-pointer"
                  value={addForm.targetDate}
                  onChange={(e) => setAddForm((f) => ({ ...f, targetDate: e.target.value }))}
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
                  value={addForm.description}
                  onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMilestone}
                  disabled={isAdding}
                  className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isAdding ? 'Adding...' : 'Add Milestone'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Milestone Modal ── */}
      {editingMilestone && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
            onClick={() => setEditingMilestone(null)}
          />
          <div className="bg-white rounded-[40px] w-full max-w-lg relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-primary p-8 text-white">
              <h3 className="text-2xl font-black tracking-tighter leading-none">Edit Milestone</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2 truncate">
                {editingMilestone.title}
              </p>
            </div>
            <div className="p-10 space-y-6">
              {editError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 font-medium">
                  {editError}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Milestone Title
                </label>
                <input
                  type="text"
                  className="input-standard w-full h-12"
                  value={editForm.title ?? ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              {/* Target date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Target Date
                </label>
                <input
                  type="date"
                  className="input-standard w-full h-12 cursor-pointer"
                  value={editForm.targetDate ?? ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, targetDate: e.target.value }))}
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([MilestoneStatus.PENDING, MilestoneStatus.IN_PROGRESS, MilestoneStatus.COMPLETED] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditForm((f) => ({ ...f, status: s }))}
                      className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all
                        ${editForm.status === s
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Completion % */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Completion — {editForm.completionPercentage ?? 0}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  className="w-full accent-primary cursor-pointer"
                  value={editForm.completionPercentage ?? 0}
                  onChange={(e) => setEditForm((f) => ({ ...f, completionPercentage: Number(e.target.value) }))}
                />
                <div className="flex justify-between text-[9px] text-slate-300 font-bold">
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Description (optional)
                </label>
                <textarea
                  rows={3}
                  className="input-standard w-full resize-none"
                  value={editForm.description ?? ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setEditingMilestone(null)}
                  className="flex-1 py-4 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
