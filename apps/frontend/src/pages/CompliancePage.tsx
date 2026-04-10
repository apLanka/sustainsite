import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '@/components/common/DashboardLayout';
import ProjectHeader from '@/components/project/ProjectHeader';
import { complianceApi } from '@/lib/api';
import { useComplianceStore } from '@/store';
import { useAuthStore } from '@/store';
import {
  ComplianceCategory,
  InspectionType,
  RiskLevel,
  ActionStatus,
  IssueSeverity,
} from '@/types/compliance';
import type {
  ComplianceItem,
  IssueIdentified,
  CreateChecklistPayload,
  CreateInspectionPayload,
} from '@/types/compliance';
import { UserRole } from '@/types/auth';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const fmtShort = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

const riskConfig: Record<RiskLevel, { bg: string; text: string; dot: string }> = {
  [RiskLevel.LOW]:      { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
  [RiskLevel.MEDIUM]:   { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-400'   },
  [RiskLevel.HIGH]:     { bg: 'bg-rose-50',     text: 'text-rose-600',    dot: 'bg-rose-500'    },
  [RiskLevel.CRITICAL]: { bg: 'bg-rose-100',    text: 'text-rose-800',    dot: 'bg-rose-700'    },
};

const actionConfig: Record<ActionStatus, { bg: string; text: string }> = {
  [ActionStatus.PENDING]:     { bg: 'bg-slate-100',  text: 'text-slate-500'   },
  [ActionStatus.IN_PROGRESS]: { bg: 'bg-amber-50',   text: 'text-amber-700'   },
  [ActionStatus.COMPLETED]:   { bg: 'bg-emerald-50', text: 'text-emerald-700' },
};

const ALL_CATEGORIES   = Object.values(ComplianceCategory);
const ALL_RISK_LEVELS  = Object.values(RiskLevel);
const ALL_INS_TYPES    = Object.values(InspectionType);
const ALL_SEVERITIES   = Object.values(IssueSeverity);
const ALL_ACT_STATUSES = Object.values(ActionStatus);

const CIRC_R   = 88;
const CIRC_LEN = 2 * Math.PI * CIRC_R; // ≈ 552.92

// ─── Badges ──────────────────────────────────────────────────────────────────

const RiskBadge = ({ level }: { level: RiskLevel }) => {
  const c = riskConfig[level] ?? { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {level}
    </span>
  );
};

const ActionBadge = ({ status }: { status: ActionStatus }) => {
  const c = actionConfig[status] ?? { bg: 'bg-slate-100', text: 'text-slate-500' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${c.bg} ${c.text}`}>
      {status}
    </span>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompliancePage() {
  const { id: projectId } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  const {
    checklists, selectedChecklist, checklistPagination,
    isChecklistLoading, inspections, inspectionPagination,
    isInspectionLoading, inspectionFilters,
    setChecklists, setSelectedChecklist,
    appendChecklist, updateChecklistInStore, removeChecklist,
    setInspections, appendInspection, updateInspectionInStore, removeInspection,
    setChecklistLoading, setInspectionLoading, setInspectionFilters,
    resetComplianceFilters,
  } = useComplianceStore();

  const canInspect = user?.role === UserRole.ADMIN || user?.role === UserRole.INSPECTOR;
  const isAdmin    = user?.role === UserRole.ADMIN;

  // ── New checklist modal ───────────────────────────────────────────────────
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [checklistForm, setChecklistForm] = useState<Omit<CreateChecklistPayload, 'projectId'>>({
    checklistName: '',
    category: undefined,
    dueDate: '',
  });
  const [checklistItems, setChecklistItems] = useState<{ itemId: string; itemName: string; description: string }[]>([]);
  const [newItemDraft, setNewItemDraft] = useState({ itemName: '', description: '' });
  const [isCreatingChecklist, setIsCreatingChecklist] = useState(false);
  const [checklistError, setChecklistError] = useState<string | null>(null);

  // ── New inspection modal ──────────────────────────────────────────────────
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspForm, setInspForm] = useState<Omit<CreateInspectionPayload, 'projectId'>>({
    inspectionDate: '',
    findings: '',
    riskLevel: RiskLevel.LOW,
    inspectionType: undefined,
    inspectorNotes: '',
    actionRequired: '',
    recommendedActions: [],
    actionDeadline: '',
  });
  const [inspIssues, setInspIssues]     = useState<IssueIdentified[]>([]);
  const [newIssue, setNewIssue]         = useState<{ issue: string; severity: IssueSeverity; location: string }>({ issue: '', severity: IssueSeverity.MINOR, location: '' });
  const [recAction, setRecAction]       = useState('');
  const [isCreatingInsp, setIsCreatingInsp] = useState(false);
  const [inspError, setInspError]       = useState<string | null>(null);

  // ── Inspection detail modal ───────────────────────────────────────────────
  const [detailInspection, setDetailInspection] = useState<string | null>(null);
  const inspectionDetail = useMemo(
    () => inspections.find((i) => i._id === detailInspection) ?? null,
    [inspections, detailInspection]
  );

  // ── Delete confirms ───────────────────────────────────────────────────────
  const [deletingChecklistId, setDeletingChecklistId] = useState<string | null>(null);
  const [deletingInspectionId, setDeletingInspectionId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Optimistic item toggle snapshot ──────────────────────────────────────
  const [isSavingItems, setIsSavingItems] = useState(false);

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;
    resetComplianceFilters(projectId);
  }, [projectId, resetComplianceFilters]);

  useEffect(() => {
    if (!projectId) return;
    const fetch = async () => {
      setChecklistLoading(true);
      try {
        const res = await complianceApi.getChecklists({ projectId, page: 1, limit: 50 });
        setChecklists(res.data, res.pagination);
        if (res.data.length > 0) setSelectedChecklist(res.data[0]);
      } catch (err) {
        console.error('Failed to fetch checklists:', err);
        toast.error('Failed to load checklists');
      } finally {
        setChecklistLoading(false);
      }
    };
    fetch();
  }, [projectId, setChecklists, setSelectedChecklist, setChecklistLoading]);

  useEffect(() => {
    if (!projectId) return;
    const fetch = async () => {
      setInspectionLoading(true);
      try {
        const res = await complianceApi.getInspections({
          projectId,
          page: inspectionFilters.page,
          limit: 10,
          riskLevel: inspectionFilters.riskLevel || undefined,
          actionStatus: inspectionFilters.actionStatus || undefined,
        });
        setInspections(res.data, res.pagination);
      } catch (err) {
        console.error('Failed to fetch inspections:', err);
        toast.error('Failed to load inspections');
      } finally {
        setInspectionLoading(false);
      }
    };
    fetch();
  }, [projectId, inspectionFilters.page, inspectionFilters.riskLevel, inspectionFilters.actionStatus, setInspections, setInspectionLoading]);

  // ── Derived metrics ───────────────────────────────────────────────────────
  const avgScore = useMemo(() => {
    if (checklists.length === 0) return 0;
    return Math.round(checklists.reduce((s, c) => s + c.complianceScore, 0) / checklists.length);
  }, [checklists]);

  const upcomingDueDates = useMemo(() =>
    checklists
      .filter((c) => c.dueDate)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 4),
    [checklists]
  );


  // ── Switch checklist ──────────────────────────────────────────────────────
  const handleSelectChecklist = async (id: string) => {
    const local = checklists.find((c) => c._id === id);
    if (local) setSelectedChecklist(local);
    try {
      const res = await complianceApi.getChecklistById(id);
      setSelectedChecklist(res.data);
    } catch (err) {
      console.error('Failed to load checklist detail:', err);
      toast.error('Failed to load checklist details');
    }
  };

  // ── Toggle checklist item ─────────────────────────────────────────────────
  const handleToggleItem = async (itemId: string) => {
    if (!selectedChecklist || isSavingItems) return;
    const snapshot = selectedChecklist.items;
    const updatedItems: ComplianceItem[] = snapshot.map((item) =>
      item.itemId === itemId ? { ...item, isCompleted: !item.isCompleted } : item
    );
    // Optimistic
    updateChecklistInStore(selectedChecklist._id, { items: updatedItems });
    setIsSavingItems(true);
    try {
      const res = await complianceApi.updateChecklist(selectedChecklist._id, { items: updatedItems });
      updateChecklistInStore(selectedChecklist._id, res.data);
    } catch (err) {
      console.error('Failed to save item toggle:', err);
      toast.error('Failed to save checklist item');
      updateChecklistInStore(selectedChecklist._id, { items: snapshot });
    } finally {
      setIsSavingItems(false);
    }
  };

  // ── Add item to draft list ────────────────────────────────────────────────
  const handleAddChecklistItem = () => {
    if (!newItemDraft.itemName.trim()) return;
    setChecklistItems((prev) => [
      ...prev,
      { itemId: `item-${Date.now()}-${prev.length}`, itemName: newItemDraft.itemName.trim(), description: newItemDraft.description.trim() },
    ]);
    setNewItemDraft({ itemName: '', description: '' });
  };

  // ── Create checklist ──────────────────────────────────────────────────────
  const handleCreateChecklist = async () => {
    if (!projectId || !checklistForm.checklistName.trim()) {
      setChecklistError('Checklist name is required.');
      return;
    }
    setChecklistError(null);
    setIsCreatingChecklist(true);
    try {
      const res = await complianceApi.createChecklist({
        projectId,
        checklistName: checklistForm.checklistName.trim(),
        category: checklistForm.category || undefined,
        dueDate: checklistForm.dueDate || undefined,
        items: checklistItems.length > 0 ? checklistItems : undefined,
      });
      appendChecklist(res.data);
      setSelectedChecklist(res.data);
      setShowChecklistModal(false);
      setChecklistForm({ checklistName: '', category: undefined, dueDate: '' });
      setChecklistItems([]);
      setNewItemDraft({ itemName: '', description: '' });
    } catch (err: unknown) {
      setChecklistError((err as { message?: string })?.message ?? 'Failed to create checklist.');
    } finally {
      setIsCreatingChecklist(false);
    }
  };

  // ── Create inspection ─────────────────────────────────────────────────────
  const handleCreateInspection = async () => {
    if (!projectId || !inspForm.inspectionDate || !inspForm.findings || !inspForm.riskLevel) {
      setInspError('Inspection date, findings, and risk level are required.');
      return;
    }
    setInspError(null);
    setIsCreatingInsp(true);
    try {
      const res = await complianceApi.createInspection({
        projectId,
        inspectionDate: inspForm.inspectionDate,
        findings: inspForm.findings.trim(),
        riskLevel: inspForm.riskLevel,
        inspectionType: inspForm.inspectionType || undefined,
        inspectorNotes: inspForm.inspectorNotes?.trim() || undefined,
        actionRequired: inspForm.actionRequired?.trim() || undefined,
        recommendedActions: inspForm.recommendedActions?.filter(Boolean),
        actionDeadline: inspForm.actionDeadline || undefined,
        issuesIdentified: inspIssues,
      });
      appendInspection(res.data);
      setShowInspectionModal(false);
      setInspForm({ inspectionDate: '', findings: '', riskLevel: RiskLevel.LOW, inspectionType: undefined, inspectorNotes: '', actionRequired: '', recommendedActions: [], actionDeadline: '' });
      setInspIssues([]);
    } catch (err: unknown) {
      setInspError((err as { message?: string })?.message ?? 'Failed to create inspection.');
    } finally {
      setIsCreatingInsp(false);
    }
  };

  // ── Update inspection action status ───────────────────────────────────────
  const handleUpdateActionStatus = async (inspId: string, actionStatus: ActionStatus) => {
    try {
      const res = await complianceApi.updateInspection(inspId, { actionStatus });
      updateInspectionInStore(inspId, res.data);
    } catch (err) {
      console.error('Failed to update action status:', err);
      toast.error('Failed to update action status');
    }
  };

  // ── Delete checklist ──────────────────────────────────────────────────────
  const handleDeleteChecklist = async () => {
    if (!deletingChecklistId) return;
    setIsDeleting(true);
    try {
      await complianceApi.deleteChecklist(deletingChecklistId);
      removeChecklist(deletingChecklistId);
      setDeletingChecklistId(null);
    } catch (err) {
      console.error('Failed to delete checklist:', err);
      toast.error('Failed to delete checklist');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Delete inspection ─────────────────────────────────────────────────────
  const handleDeleteInspection = async () => {
    if (!deletingInspectionId) return;
    setIsDeleting(true);
    try {
      await complianceApi.deleteInspection(deletingInspectionId);
      removeInspection(deletingInspectionId);
      setDeletingInspectionId(null);
    } catch (err) {
      console.error('Failed to delete inspection:', err);
      toast.error('Failed to delete inspection');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <ProjectHeader />

      <div className="px-10">
        {/* Header */}
        <header className="py-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div>
            <h3 className="text-2xl font-black text-primary tracking-tighter leading-none font-headline">
              Regulatory Oversight
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Checklist selector */}
            <div className="relative group">
              <select
                className="input-standard bg-surface-container-lowest h-11 py-0 pr-10 appearance-none cursor-pointer text-xs font-bold"
                value={selectedChecklist?._id ?? ''}
                onChange={(e) => handleSelectChecklist(e.target.value)}
                disabled={isChecklistLoading || checklists.length === 0}
              >
                {checklists.length === 0
                  ? <option value="">No checklists yet</option>
                  : checklists.map((c) => (
                      <option key={c._id} value={c._id}>{c.checklistName}</option>
                    ))
                }
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
                expand_more
              </span>
            </div>

            <button
              onClick={() => { setChecklistError(null); setShowChecklistModal(true); }}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-primary font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">playlist_add</span>
              New Checklist
            </button>

            {canInspect && (
              <button
                onClick={() => { setInspError(null); setShowInspectionModal(true); }}
                className="px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-primary/10 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add_task</span>
                New Inspection
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── Left sidebar ── */}
          <div className="lg:col-span-1 space-y-8">
            {/* Compliance score donut */}
            <div className="bg-surface-container-lowest p-10 rounded-3xl border border-slate-100/50 shadow-sm text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-secondary" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                Aggregate Compliance Score
              </p>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-48 h-48 -rotate-90" viewBox="0 0 192 192">
                  <circle cx="96" cy="96" r={CIRC_R} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
                  <circle
                    cx="96" cy="96" r={CIRC_R}
                    stroke="currentColor" strokeWidth="12" fill="transparent"
                    strokeDasharray={CIRC_LEN}
                    strokeDashoffset={CIRC_LEN * (1 - avgScore / 100)}
                    strokeLinecap="round"
                    className="text-secondary transition-all duration-1000"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-5xl font-black text-primary tracking-tighter">{avgScore}%</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {avgScore >= 80 ? 'Verified Stable' : avgScore >= 50 ? 'Needs Attention' : 'Critical'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10">
                <div className="p-4 bg-slate-50 rounded-2xl text-left border border-slate-100/50">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Checklists</p>
                  <p className="text-xl font-black text-primary mt-1 leading-none tracking-tight">
                    {checklistPagination?.total ?? 0}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl text-left border border-slate-100/50">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Inspections</p>
                  <p className="text-xl font-black text-secondary mt-1 leading-none tracking-tight">
                    {inspectionPagination?.total ?? 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Compliance roadmap — upcoming due dates */}
            <div className="bg-emerald-950 p-8 rounded-3xl shadow-xl shadow-emerald-950/20 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/20 rounded-full blur-2xl -mr-12 -mt-12" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400/70 mb-4 font-headline">
                Compliance Roadmap
              </h4>
              {upcomingDueDates.length === 0 ? (
                <p className="text-xs text-emerald-400/50 font-medium">No upcoming due dates</p>
              ) : (
                <ul className="space-y-4">
                  {upcomingDueDates.map((c) => (
                    <li key={c._id} className="flex gap-4 items-start border-l border-emerald-800/50 pl-4 py-1 relative">
                      <div className="absolute -left-[4.5px] top-2 w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(14,108,74,1)]" />
                      <div className="text-[10px] font-black text-secondary leading-none mt-0.5 uppercase tracking-widest shrink-0">
                        {fmtShort(c.dueDate)}
                      </div>
                      <div className="text-xs font-bold text-emerald-50 mt-[-2px] truncate">{c.checklistName}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ── Right: Current Checklist ── */}
          <div className="lg:col-span-2">
            {isChecklistLoading ? (
              <div className="bg-surface-container-lowest rounded-3xl p-10 border border-slate-100/50 animate-pulse space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-2xl" />
                ))}
              </div>
            ) : !selectedChecklist ? (
              <div className="bg-surface-container-lowest rounded-3xl p-10 border border-slate-100/50 shadow-sm flex flex-col items-center justify-center py-24 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">fact_check</span>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No checklist selected</p>
                <p className="text-xs text-slate-300 mt-1">Create a checklist to start tracking compliance</p>
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-3xl p-10 border border-slate-100/50 shadow-sm space-y-6">
                {/* Checklist header */}
                <div className="flex justify-between items-start pb-6 border-b border-slate-50">
                  <div>
                    <h4 className="text-lg font-bold text-primary tracking-tight">{selectedChecklist.checklistName}</h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      {selectedChecklist.category && (
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          {selectedChecklist.category}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                        {selectedChecklist.complianceScore}% complete
                      </span>
                      {selectedChecklist.dueDate && (
                        <span className="text-[10px] font-medium text-slate-400">
                          Due {fmt(selectedChecklist.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSavingItems && (
                      <span className="w-4 h-4 border-2 border-slate-200 border-t-secondary rounded-full animate-spin" />
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => setDeletingChecklistId(selectedChecklist._id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete checklist"
                      >
                        <span className="material-symbols-outlined text-lg">delete_outline</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-secondary to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${selectedChecklist.complianceScore}%` }}
                  />
                </div>

                {/* Items */}
                {selectedChecklist.items.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium text-center py-8">
                    No items in this checklist yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {selectedChecklist.items.map((item) => (
                      <div
                        key={item.itemId}
                        className={`p-6 border rounded-2xl group transition-all ${
                          item.isCompleted
                            ? 'bg-emerald-50/50 border-emerald-100'
                            : 'bg-slate-50/50 border-slate-100 hover:border-secondary/20 hover:bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h5 className={`text-sm font-bold leading-tight ${item.isCompleted ? 'text-emerald-700 line-through decoration-emerald-300' : 'text-primary'}`}>
                                {item.itemName}
                              </h5>
                            </div>
                            {item.description && (
                              <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              {item.completedBy && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-tight bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                  <span className="material-symbols-outlined text-[12px]">person</span>
                                  {item.completedBy.name}
                                </div>
                              )}
                              {item.attachedDocuments?.length > 0 && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-secondary uppercase tracking-tight bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">
                                  <span className="material-symbols-outlined text-[12px]">attach_file</span>
                                  {item.attachedDocuments.length} doc{item.attachedDocuments.length !== 1 ? 's' : ''}
                                </div>
                              )}
                              {item.notes && (
                                <p className="text-[10px] text-slate-400 font-medium">{item.notes}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleItem(item.itemId)}
                            disabled={isSavingItems}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 disabled:opacity-60 ${
                              item.isCompleted
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/20'
                                : 'bg-white border border-slate-200 text-slate-400 hover:border-secondary hover:text-secondary'
                            }`}
                          >
                            {item.isCompleted ? 'Completed' : 'Pending'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Inspection History ── */}
        <div className="mt-10 pb-20">
          <div className="bg-surface-container-lowest rounded-3xl p-10 border border-slate-100/50 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-lg font-bold text-primary tracking-tight">Safety Inspection History</h4>
              {/* Inspection filters */}
              <div className="flex items-center gap-2">
                <select
                  className="input-standard h-9 py-0 text-xs font-bold cursor-pointer"
                  value={inspectionFilters.riskLevel ?? ''}
                  onChange={(e) => setInspectionFilters({ riskLevel: e.target.value as RiskLevel | '', page: 1 })}
                >
                  <option value="">All Risks</option>
                  {ALL_RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <select
                  className="input-standard h-9 py-0 text-xs font-bold cursor-pointer"
                  value={inspectionFilters.actionStatus ?? ''}
                  onChange={(e) => setInspectionFilters({ actionStatus: e.target.value as ActionStatus | '', page: 1 })}
                >
                  <option value="">All Statuses</option>
                  {ALL_ACT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {isInspectionLoading ? (
              <div className="animate-pulse space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl" />)}
              </div>
            ) : inspections.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-5xl text-slate-200 mb-4 block">search_off</span>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No inspections found</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-4 py-4">Date</th>
                    <th className="px-4 py-4">Type</th>
                    <th className="px-4 py-4 text-center">Risk</th>
                    <th className="px-4 py-4">Inspector</th>
                    <th className="px-4 py-4">Action Status</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {inspections.map((insp) => (
                    <tr key={insp._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4 text-sm font-bold text-primary">{fmt(insp.inspectionDate)}</td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          {insp.inspectionType ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <RiskBadge level={insp.riskLevel} />
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-slate-500">
                        {insp.inspector?.name ?? '—'}
                      </td>
                      <td className="px-4 py-4">
                        {canInspect ? (
                          <select
                            className="input-standard h-8 py-0 px-2 text-[10px] font-black cursor-pointer"
                            value={insp.actionStatus}
                            onChange={(e) => handleUpdateActionStatus(insp._id, e.target.value as ActionStatus)}
                          >
                            {ALL_ACT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        ) : (
                          <ActionBadge status={insp.actionStatus} />
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setDetailInspection(insp._id)}
                            className="p-1.5 text-slate-400 hover:text-secondary hover:bg-slate-100 rounded-lg transition-all"
                            title="View details"
                          >
                            <span className="material-symbols-outlined text-lg">open_in_new</span>
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setDeletingInspectionId(insp._id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-lg">delete_outline</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Inspection pagination */}
            {inspectionPagination && inspectionPagination.pages > 1 && (
              <div className="flex justify-center items-center gap-3 pt-6 border-t border-slate-50 mt-4">
                <button
                  className="px-4 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={inspectionFilters.page <= 1}
                  onClick={() => setInspectionFilters({ page: inspectionFilters.page - 1 })}
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {inspectionFilters.page} / {inspectionPagination.pages}
                </span>
                <button
                  className="px-4 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={inspectionFilters.page >= inspectionPagination.pages}
                  onClick={() => setInspectionFilters({ page: inspectionFilters.page + 1 })}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── New Checklist Modal ── */}
      {showChecklistModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => { setShowChecklistModal(false); setChecklistItems([]); setNewItemDraft({ itemName: '', description: '' }); }} />
          <div className="bg-white rounded-[40px] w-full max-w-lg relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-950 p-8 text-white">
              <h3 className="text-2xl font-black tracking-tighter leading-none">New Checklist</h3>
              <p className="text-emerald-400/70 text-xs font-bold uppercase tracking-widest mt-2">Add compliance checklist</p>
            </div>
            <div className="p-10 space-y-5 max-h-[72vh] overflow-y-auto">
              {checklistError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 font-medium">{checklistError}</div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Checklist Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Environmental Compliance (EIA)"
                  className="input-standard w-full h-12"
                  value={checklistForm.checklistName}
                  onChange={(e) => setChecklistForm((f) => ({ ...f, checklistName: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                <select
                  className="input-standard w-full h-12 py-0 cursor-pointer"
                  value={checklistForm.category ?? ''}
                  onChange={(e) => setChecklistForm((f) => ({ ...f, category: e.target.value as ComplianceCategory || undefined }))}
                >
                  <option value="">— Select category —</option>
                  {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Due Date (optional)</label>
                <input
                  type="date"
                  className="input-standard w-full h-12 cursor-pointer"
                  value={checklistForm.dueDate ?? ''}
                  onChange={(e) => setChecklistForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </div>

              {/* Assessment items */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Assessment Items <span className="normal-case font-medium text-slate-300">(optional)</span>
                </label>

                {/* Existing items */}
                {checklistItems.length > 0 && (
                  <ul className="space-y-2">
                    {checklistItems.map((item, i) => (
                      <li key={item.itemId} className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                        <span className="w-5 h-5 mt-0.5 rounded-full bg-slate-200 text-slate-500 text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-primary">{item.itemName}</p>
                          {item.description && <p className="text-[10px] text-slate-400 mt-0.5">{item.description}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => setChecklistItems((prev) => prev.filter((_, j) => j !== i))}
                          className="text-slate-300 hover:text-rose-400 transition-colors shrink-0"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Add new item inputs */}
                <div className="space-y-2">
                  <input
                    type="text"
                    className="input-standard w-full h-10 text-sm"
                    placeholder="Item name (e.g. Fire extinguisher inspection)"
                    value={newItemDraft.itemName}
                    onChange={(e) => setNewItemDraft((d) => ({ ...d, itemName: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddChecklistItem(); } }}
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input-standard flex-1 h-10 text-sm"
                      placeholder="Description (optional)"
                      value={newItemDraft.description}
                      onChange={(e) => setNewItemDraft((d) => ({ ...d, description: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddChecklistItem(); } }}
                    />
                    <button
                      type="button"
                      onClick={handleAddChecklistItem}
                      disabled={!newItemDraft.itemName.trim()}
                      className="px-4 h-10 bg-slate-100 text-primary rounded-xl text-xs font-bold hover:bg-slate-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button onClick={() => { setShowChecklistModal(false); setChecklistItems([]); setNewItemDraft({ itemName: '', description: '' }); }} className="flex-1 py-4 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer">
                  Cancel
                </button>
                <button
                  onClick={handleCreateChecklist}
                  disabled={isCreatingChecklist}
                  className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isCreatingChecklist ? 'Creating…' : 'Create Checklist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── New Inspection Modal ── */}
      {showInspectionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setShowInspectionModal(false)} />
          <div className="bg-white rounded-[40px] w-full max-w-2xl relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-primary p-8 text-white">
              <h3 className="text-2xl font-black tracking-tighter leading-none">New Inspection</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2">Log a safety or compliance inspection</p>
            </div>
            <div className="p-10 space-y-5 max-h-[72vh] overflow-y-auto">
              {inspError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 font-medium">{inspError}</div>
              )}

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inspection Date *</label>
                  <input type="date" className="input-standard w-full h-12 cursor-pointer"
                    value={inspForm.inspectionDate}
                    onChange={(e) => setInspForm((f) => ({ ...f, inspectionDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</label>
                  <select className="input-standard w-full h-12 py-0 cursor-pointer"
                    value={inspForm.inspectionType ?? ''}
                    onChange={(e) => setInspForm((f) => ({ ...f, inspectionType: e.target.value as InspectionType || undefined }))}
                  >
                    <option value="">— Select type —</option>
                    {ALL_INS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Risk Level *</label>
                <div className="grid grid-cols-4 gap-2">
                  {ALL_RISK_LEVELS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setInspForm((f) => ({ ...f, riskLevel: r }))}
                      className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                        inspForm.riskLevel === r
                          ? `${riskConfig[r].bg} ${riskConfig[r].text} border-current shadow-sm`
                          : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Findings *</label>
                <textarea rows={3} className="input-standard w-full resize-none"
                  placeholder="Describe the inspection findings..."
                  value={inspForm.findings}
                  onChange={(e) => setInspForm((f) => ({ ...f, findings: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inspector Notes</label>
                <textarea rows={2} className="input-standard w-full resize-none"
                  placeholder="Additional notes from the inspector..."
                  value={inspForm.inspectorNotes ?? ''}
                  onChange={(e) => setInspForm((f) => ({ ...f, inspectorNotes: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Action Required</label>
                  <input type="text" className="input-standard w-full h-12"
                    placeholder="Describe required actions..."
                    value={inspForm.actionRequired ?? ''}
                    onChange={(e) => setInspForm((f) => ({ ...f, actionRequired: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Action Deadline</label>
                  <input type="date" className="input-standard w-full h-12 cursor-pointer"
                    value={inspForm.actionDeadline ?? ''}
                    onChange={(e) => setInspForm((f) => ({ ...f, actionDeadline: e.target.value }))}
                  />
                </div>
              </div>

              {/* Recommended actions */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recommended Actions</label>
                <div className="flex gap-2">
                  <input type="text" className="input-standard flex-1 h-10"
                    placeholder="Add a recommended action…"
                    value={recAction}
                    onChange={(e) => setRecAction(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && recAction.trim()) {
                        setInspForm((f) => ({ ...f, recommendedActions: [...(f.recommendedActions ?? []), recAction.trim()] }));
                        setRecAction('');
                      }
                    }}
                  />
                  <button type="button"
                    onClick={() => { if (recAction.trim()) { setInspForm((f) => ({ ...f, recommendedActions: [...(f.recommendedActions ?? []), recAction.trim()] })); setRecAction(''); } }}
                    className="px-3 h-10 bg-slate-100 text-primary rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                  >Add</button>
                </div>
                {(inspForm.recommendedActions ?? []).length > 0 && (
                  <ul className="space-y-1 mt-2">
                    {(inspForm.recommendedActions ?? []).map((a, i) => (
                      <li key={i} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg text-xs font-medium text-slate-600">
                        <span>{a}</span>
                        <button type="button" onClick={() => setInspForm((f) => ({ ...f, recommendedActions: f.recommendedActions?.filter((_, j) => j !== i) }))} className="text-slate-400 hover:text-rose-500">
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Issues identified */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Issues Identified</label>
                <div className="grid grid-cols-4 gap-2">
                  <input type="text" className="input-standard h-10 col-span-2"
                    placeholder="Issue description"
                    value={newIssue.issue}
                    onChange={(e) => setNewIssue((n) => ({ ...n, issue: e.target.value }))}
                  />
                  <input type="text" className="input-standard h-10"
                    placeholder="Location (optional)"
                    value={newIssue.location}
                    onChange={(e) => setNewIssue((n) => ({ ...n, location: e.target.value }))}
                  />
                  <select className="input-standard h-10 py-0 cursor-pointer"
                    value={newIssue.severity}
                    onChange={(e) => setNewIssue((n) => ({ ...n, severity: e.target.value as IssueSeverity }))}
                  >
                    {ALL_SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <button type="button"
                  onClick={() => { if (newIssue.issue.trim()) { setInspIssues((prev) => [...prev, { ...newIssue }]); setNewIssue({ issue: '', severity: IssueSeverity.MINOR, location: '' }); } }}
                  className="px-3 h-10 bg-slate-100 text-primary rounded-xl text-xs font-bold hover:bg-slate-200 transition-all w-full"
                >Add Issue</button>
                {inspIssues.length > 0 && (
                  <ul className="space-y-1 mt-1">
                    {inspIssues.map((issue, i) => (
                      <li key={i} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg text-xs font-medium text-slate-600">
                        <span>{issue.issue} <span className="text-slate-400">— {issue.severity}</span></span>
                        <button type="button" onClick={() => setInspIssues((prev) => prev.filter((_, j) => j !== i))} className="text-slate-400 hover:text-rose-500">
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex gap-4 pt-2">
                <button onClick={() => setShowInspectionModal(false)} className="flex-1 py-4 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer">
                  Cancel
                </button>
                <button
                  onClick={handleCreateInspection}
                  disabled={isCreatingInsp}
                  className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isCreatingInsp ? 'Submitting…' : 'Submit Inspection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Inspection Detail Modal ── */}
      {detailInspection && inspectionDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setDetailInspection(null)} />
          <div className="bg-white rounded-[40px] w-full max-w-xl relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className={`p-8 text-white ${inspectionDetail.riskLevel === RiskLevel.CRITICAL || inspectionDetail.riskLevel === RiskLevel.HIGH ? 'bg-rose-700' : 'bg-primary'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black tracking-tighter leading-none">Inspection Report</h3>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-widest mt-2">
                    {fmt(inspectionDetail.inspectionDate)} · {inspectionDetail.inspectionType ?? 'General'}
                  </p>
                </div>
                <RiskBadge level={inspectionDetail.riskLevel} />
              </div>
            </div>
            <div className="p-10 space-y-5 max-h-[65vh] overflow-y-auto">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Inspector</p>
                <p className="text-sm font-bold text-primary">{inspectionDetail.inspector?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Findings</p>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">{inspectionDetail.findings}</p>
              </div>
              {inspectionDetail.inspectorNotes && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Inspector Notes</p>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">{inspectionDetail.inspectorNotes}</p>
                </div>
              )}
              {inspectionDetail.actionRequired && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Action Required</p>
                  <p className="text-sm font-medium text-slate-600">{inspectionDetail.actionRequired}</p>
                  {inspectionDetail.actionDeadline && (
                    <p className="text-[10px] font-bold text-rose-500 mt-1">Deadline: {fmt(inspectionDetail.actionDeadline)}</p>
                  )}
                </div>
              )}
              {inspectionDetail.issuesIdentified.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Issues Identified</p>
                  <ul className="space-y-2">
                    {inspectionDetail.issuesIdentified.map((issue, i) => (
                      <li key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl text-xs font-medium text-slate-600">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0 ${
                          issue.severity === IssueSeverity.MAJOR ? 'bg-rose-50 text-rose-600' :
                          issue.severity === IssueSeverity.MODERATE ? 'bg-amber-50 text-amber-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>{issue.severity}</span>
                        <span>{issue.issue}{issue.location ? ` — ${issue.location}` : ''}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {inspectionDetail.recommendedActions.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Recommended Actions</p>
                  <ul className="space-y-1">
                    {inspectionDetail.recommendedActions.map((a, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <span className="material-symbols-outlined text-sm text-secondary mt-0.5">arrow_right</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <ActionBadge status={inspectionDetail.actionStatus} />
                {inspectionDetail.isResolved && (
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span> Resolved
                  </span>
                )}
              </div>
              <button onClick={() => setDetailInspection(null)} className="w-full py-4 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Checklist Confirm ── */}
      {deletingChecklistId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setDeletingChecklistId(null)} />
          <div className="bg-white rounded-[40px] w-full max-w-sm relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 p-10">
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <span className="material-symbols-outlined text-2xl">warning</span>
              <p className="text-lg font-black">Delete Checklist?</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-8">This will permanently remove the checklist and all its items.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingChecklistId(null)} className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-all">Cancel</button>
              <button onClick={handleDeleteChecklist} disabled={isDeleting} className="flex-1 py-3 rounded-2xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-60">
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Inspection Confirm ── */}
      {deletingInspectionId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setDeletingInspectionId(null)} />
          <div className="bg-white rounded-[40px] w-full max-w-sm relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 p-10">
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <span className="material-symbols-outlined text-2xl">warning</span>
              <p className="text-lg font-black">Delete Inspection?</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-8">This inspection record will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingInspectionId(null)} className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-all">Cancel</button>
              <button onClick={handleDeleteInspection} disabled={isDeleting} className="flex-1 py-3 rounded-2xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-60">
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
