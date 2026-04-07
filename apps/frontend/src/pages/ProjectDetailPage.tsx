import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import DashboardLayout from '@/components/common/DashboardLayout';
import ProjectStats from '@/components/projects/ProjectStats';
import MilestoneTimeline from '@/components/projects/MilestoneTimeline';
import ProjectHeader from '@/components/project/ProjectHeader';
import SmoothTabs from '@/components/ui/SmoothTabs';
import { projectApi } from '@/lib/api';
import { useProjectStore } from '@/store';
import { useAuth } from '@/contexts/AuthContext';
import { canDeleteProject, isAssignedProjectManager } from '@/lib/rbac';
import { calcMilestoneProgress } from '@/lib/milestoneProgress';
import type {
  Milestone,
  CreateMilestonePayload,
  UpdateMilestonePayload,
  UpdateProjectPayload,
} from '@/types/project';
import { MilestoneStatus, ProjectStatus } from '@/types/project';
export default function ProjectDetailPage() {
  const { id } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    selectedProject,
    isDetailLoading,
    setSelectedProject,
    appendMilestone,
    updateMilestoneInStore,
    updateProjectInList,
    removeProject,
  } = useProjectStore();
  const [activeTab, setActiveTab] = useState('milestones');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<CreateMilestonePayload>({
    title: '',
    targetDate: '',
    description: '',
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [editForm, setEditForm] = useState<UpdateMilestonePayload>({});
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [editProjectForm, setEditProjectForm] = useState<UpdateProjectPayload>({});
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const canEditAsManager = isAssignedProjectManager(selectedProject, user?.userId);
  const canDeleteProj = canDeleteProject(user?.role);
  const tabs = [
    { id: 'milestones', label: 'Milestones & Timeline' },
    { id: 'team', label: 'Team & Stakeholders' },
  ];
  useEffect(() => {
    return () => {
      setSelectedProject(null);
    };
  }, [id, setSelectedProject]);
  useEffect(() => {
    if (showEditProject && selectedProject) {
      setEditProjectForm({
        projectName: selectedProject.projectName,
        description: selectedProject.description ?? '',
        status: selectedProject.status,
        budget: selectedProject.budget,
        startDate: selectedProject.startDate?.slice(0, 10),
        endDate: selectedProject.endDate?.slice(0, 10),
        currentPhase: selectedProject.currentPhase ?? '',
      });
    }
  }, [showEditProject, selectedProject]);
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
      toast.success('Milestone added');
    } catch (err: unknown) {
      const msg =
        (
          err as {
            message?: string;
          }
        )?.message ?? 'Failed to add milestone.';
      setAddError(msg);
      toast.error(msg);
    } finally {
      setIsAdding(false);
    }
  };
  const handleOpenEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setEditForm({
      title: milestone.title,
      description: milestone.description ?? '',
      targetDate: milestone.targetDate.slice(0, 10),
      status: milestone.status,
      completionPercentage: milestone.completionPercentage,
    });
    setEditError(null);
  };
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
      toast.success('Milestone updated');
    } catch (err: unknown) {
      const msg =
        (
          err as {
            message?: string;
          }
        )?.message ?? 'Failed to save changes.';
      setEditError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };
  const handleSaveProject = async () => {
    if (!id) return;
    setIsEditingProject(true);
    try {
      const res = await projectApi.updateProject(id, editProjectForm);
      setSelectedProject(res.data);
      updateProjectInList(id, res.data);
      setShowEditProject(false);
      toast.success('Project updated');
    } catch (err: unknown) {
      const msg =
        (
          err as {
            response?: {
              data?: {
                message?: string;
              };
            };
            message?: string;
          }
        )?.response?.data?.message ?? 'Failed to update project.';
      toast.error(msg);
    } finally {
      setIsEditingProject(false);
    }
  };
  const handleDeleteProject = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await projectApi.deleteProject(id);
      removeProject(id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err: unknown) {
      const msg =
        (
          err as {
            response?: {
              data?: {
                message?: string;
              };
            };
            message?: string;
          }
        )?.response?.data?.message ?? 'Failed to delete project.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  const milestones = selectedProject?.milestones ?? [];
  useEffect(() => {
    if (!selectedProject || milestones.length === 0) return;
    const calculated = calcMilestoneProgress(milestones);
    if (calculated !== selectedProject.completionPercentage) {
      updateProjectInList(selectedProject._id, { completionPercentage: calculated });
      setSelectedProject({ ...selectedProject, completionPercentage: calculated });
    }
  }, [milestones, selectedProject, updateProjectInList, setSelectedProject]);
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  return (
    <DashboardLayout>
      <ProjectHeader />

      <div className="px-10">
        {selectedProject && (canEditAsManager || canDeleteProj) && (
          <div className="flex items-center justify-end gap-3 pt-6">
            {canEditAsManager && (
              <button
                onClick={() => setShowEditProject(true)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-primary bg-slate-100 rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Project
              </button>
            )}
            {canDeleteProj && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-all uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                Delete
              </button>
            )}
          </div>
        )}

        <SmoothTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="underline"
          className="mb-10 pt-6"
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
                      {canEditAsManager && (
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="px-4 py-2 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-lg tracking-widest uppercase hover:bg-emerald-100 transition-all flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">add_task</span>
                          Add Milestone
                        </button>
                      )}
                    </div>

                    <MilestoneTimeline
                      milestones={milestones}
                      onEdit={canEditAsManager ? handleOpenEdit : undefined}
                    />
                  </>
                )}
              </div>
            ) : (
              <div className="pb-20 space-y-8">
                {isDetailLoading || !selectedProject ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-slate-100 rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="bg-surface-container-lowest p-8 rounded-2xl border border-slate-100/50 shadow-sm">
                      <h3 className="text-sm font-bold text-primary font-headline uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-base">
                          manage_accounts
                        </span>
                        Project Manager
                      </h3>
                      {selectedProject.projectManager ? (
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                            {getInitials(
                              (
                                selectedProject.projectManager as unknown as {
                                  fullName?: string;
                                  firstName?: string;
                                  lastName?: string;
                                }
                              )?.fullName ||
                                `${
                                  (
                                    selectedProject.projectManager as unknown as {
                                      firstName?: string;
                                    }
                                  )?.firstName ?? ''
                                } ${
                                  (
                                    selectedProject.projectManager as unknown as {
                                      lastName?: string;
                                    }
                                  )?.lastName ?? ''
                                }`.trim() ||
                                'PM'
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-primary">
                              {(
                                selectedProject.projectManager as unknown as {
                                  fullName?: string;
                                  firstName?: string;
                                  lastName?: string;
                                }
                              )?.fullName ||
                                `${
                                  (
                                    selectedProject.projectManager as unknown as {
                                      firstName?: string;
                                    }
                                  )?.firstName ?? ''
                                } ${
                                  (
                                    selectedProject.projectManager as unknown as {
                                      lastName?: string;
                                    }
                                  )?.lastName ?? ''
                                }`.trim() ||
                                'Project Manager'}
                            </p>
                            <p className="text-xs text-slate-400">
                              {selectedProject.projectManager.email}
                            </p>
                            <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              Project Manager
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">No project manager assigned</p>
                      )}
                    </div>

                    <div className="bg-surface-container-lowest p-8 rounded-2xl border border-slate-100/50 shadow-sm">
                      <h3 className="text-sm font-bold text-primary font-headline uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-base">
                          group
                        </span>
                        Team Members
                        <span className="ml-auto text-[10px] font-bold text-slate-400 normal-case tracking-normal">
                          {selectedProject.teamMembers?.length ?? 0} members
                        </span>
                      </h3>
                      {!selectedProject.teamMembers || selectedProject.teamMembers.length === 0 ? (
                        <div className="text-center py-8">
                          <span className="material-symbols-outlined text-4xl text-slate-300">
                            group_add
                          </span>
                          <p className="text-sm text-slate-400 mt-2">
                            No team members assigned yet
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedProject.teamMembers.map((member) => {
                            const name =
                              (
                                member as unknown as {
                                  fullName?: string;
                                  firstName?: string;
                                  lastName?: string;
                                }
                              )?.fullName ||
                              `${
                                (
                                  member as unknown as {
                                    firstName?: string;
                                  }
                                )?.firstName ?? ''
                              } ${
                                (
                                  member as unknown as {
                                    lastName?: string;
                                  }
                                )?.lastName ?? ''
                              }`.trim() ||
                              'Team Member';
                            return (
                              <div
                                key={member._id}
                                className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                              >
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-xs flex-shrink-0">
                                  {getInitials(name)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-primary truncate">{name}</p>
                                  <p className="text-xs text-slate-400 truncate">{member.email}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

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
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      MilestoneStatus.PENDING,
                      MilestoneStatus.IN_PROGRESS,
                      MilestoneStatus.COMPLETED,
                    ] as const
                  ).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditForm((f) => ({ ...f, status: s }))}
                      className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${editForm.status === s ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
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
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, completionPercentage: Number(e.target.value) }))
                  }
                />
              </div>
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

      {showEditProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
            onClick={() => setShowEditProject(false)}
          />
          <div className="bg-white rounded-[40px] w-full max-w-lg relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="bg-primary p-8 text-white sticky top-0 z-10">
              <h3 className="text-2xl font-black tracking-tighter leading-none">Edit Project</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2">
                Update project details
              </p>
            </div>
            <div className="p-10 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Project Name
                </label>
                <input
                  type="text"
                  className="input-standard w-full h-12"
                  value={editProjectForm.projectName ?? ''}
                  onChange={(e) =>
                    setEditProjectForm((f) => ({ ...f, projectName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="input-standard w-full resize-none"
                  value={editProjectForm.description ?? ''}
                  onChange={(e) =>
                    setEditProjectForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="input-standard w-full h-12 cursor-pointer"
                    value={editProjectForm.startDate ?? ''}
                    onChange={(e) =>
                      setEditProjectForm((f) => ({ ...f, startDate: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="input-standard w-full h-12 cursor-pointer"
                    value={editProjectForm.endDate ?? ''}
                    onChange={(e) => setEditProjectForm((f) => ({ ...f, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Budget (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  className="input-standard w-full h-12"
                  value={editProjectForm.budget ?? ''}
                  onChange={(e) =>
                    setEditProjectForm((f) => ({ ...f, budget: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(ProjectStatus).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditProjectForm((f) => ({ ...f, status: s }))}
                      className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${editProjectForm.status === s ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Current Phase (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Foundation"
                  className="input-standard w-full h-12"
                  value={editProjectForm.currentPhase ?? ''}
                  onChange={(e) =>
                    setEditProjectForm((f) => ({ ...f, currentPhase: e.target.value }))
                  }
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setShowEditProject(false)}
                  className="flex-1 py-4 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProject}
                  disabled={isEditingProject}
                  className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isEditingProject ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="bg-white rounded-[40px] w-full max-w-md relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-rose-600 p-8 text-white">
              <h3 className="text-2xl font-black tracking-tighter leading-none">Delete Project</h3>
              <p className="text-rose-200 text-xs font-bold uppercase tracking-widest mt-2">
                This action cannot be undone
              </p>
            </div>
            <div className="p-10 space-y-6">
              <p className="text-sm text-slate-600 font-medium">
                Are you sure you want to delete{' '}
                <strong className="text-primary">{selectedProject?.projectName}</strong>? All
                associated data including milestones, documents, and metrics will be permanently
                removed.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-4 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  disabled={isDeleting}
                  className="flex-[2] py-4 bg-rose-600 text-white font-black rounded-2xl hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
