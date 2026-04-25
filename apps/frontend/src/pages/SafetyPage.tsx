import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '@/components/common/DashboardLayout';
import ProjectHeader from '@/components/project/ProjectHeader';
import { safetyApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type {
  SafetyInspection,
  CreateInspectionPayload,
  UpdateInspectionPayload,
  IssueIdentified,
} from '@/types/compliance';
import { InspectionType, RiskLevel, ActionStatus, IssueSeverity } from '@/types/compliance';
const RISK_COLORS: Record<string, string> = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Critical: 'bg-rose-50 text-rose-700 border-rose-200',
};
const ACTION_COLORS: Record<string, string> = {
  Pending: 'bg-slate-100 text-slate-600',
  'In Progress': 'bg-blue-50 text-blue-700',
  Completed: 'bg-emerald-50 text-emerald-700',
};
const emptyForm: CreateInspectionPayload = {
  projectId: '',
  inspectionDate: new Date().toISOString().split('T')[0],
  findings: '',
  riskLevel: RiskLevel.LOW,
  inspectionType: InspectionType.SAFETY,
  inspectorNotes: '',
  issuesIdentified: [],
  actionRequired: '',
  recommendedActions: [],
  actionDeadline: '',
};
export default function SafetyPage() {
  const { id: projectId } = useParams<{
    id: string;
  }>();
  const { user } = useAuth();
  const [inspections, setInspections] = useState<SafetyInspection[]>([]);
  const [highRisk, setHighRisk] = useState<SafetyInspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [filterRisk, setFilterRisk] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterResolved, setFilterResolved] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<SafetyInspection | null>(null);
  const [showEdit, setShowEdit] = useState<SafetyInspection | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState<CreateInspectionPayload>({
    ...emptyForm,
    projectId: projectId ?? '',
  });
  const [editForm, setEditForm] = useState<UpdateInspectionPayload>({});
  const [isSaving, setIsSaving] = useState(false);
  const [newIssue, setNewIssue] = useState<IssueIdentified>({
    issue: '',
    severity: IssueSeverity.MINOR,
    location: '',
  });
  const [newAction, setNewAction] = useState('');
  const canManage = ['ADMIN', 'PROJECT_MANAGER', 'INSPECTOR'].includes(user?.role ?? '');
  const loadInspections = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [listRes, hrRes] = await Promise.allSettled([
        safetyApi.getByProject(projectId, {
          riskLevel: filterRisk as (typeof RiskLevel)[keyof typeof RiskLevel] | undefined,
          actionStatus: filterStatus as
            | (typeof ActionStatus)[keyof typeof ActionStatus]
            | undefined,
          isResolved: filterResolved === '' ? undefined : filterResolved === 'true',
          page,
          limit,
        }),
        safetyApi.getHighRisk(projectId),
      ]);
      if (listRes.status === 'fulfilled') {
        setInspections(listRes.value.data ?? []);
        setTotal(listRes.value.pagination?.total ?? listRes.value.count ?? 0);
      } else {
        toast.error('Failed to load safety inspections');
      }
      if (hrRes.status === 'fulfilled') {
        setHighRisk(hrRes.value.data ?? []);
      } else {
        console.error('High-risk fetch failed:', hrRes.reason);
        setHighRisk([]);
      }
    } catch {
      toast.error('Failed to load safety inspections');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filterRisk, filterStatus, filterResolved, page]);
  useEffect(() => {
    void loadInspections();
  }, [loadInspections]);
  const handleCreate = async () => {
    if (!projectId || !form.findings || !form.inspectionDate) {
      toast.error('Inspection date and findings are required');
      return;
    }
    setIsSaving(true);
    try {
      const res = await safetyApi.createInspection({ ...form, projectId });
      setInspections((prev) => [res.data, ...prev]);
      setShowCreate(false);
      setForm({ ...emptyForm, projectId });
      toast.success('Safety inspection created');
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
        )?.response?.data?.message ?? 'Failed to create inspection';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };
  const handleUpdate = async () => {
    if (!showEdit) return;
    setIsSaving(true);
    try {
      const res = await safetyApi.update(showEdit._id, editForm);
      setInspections((prev) => prev.map((i) => (i._id === showEdit._id ? res.data : i)));
      setShowEdit(null);
      toast.success('Inspection updated');
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
        )?.response?.data?.message ?? 'Failed to update inspection';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };
  const handleDelete = async (inspId: string) => {
    setIsDeleting(true);
    try {
      await safetyApi.delete(inspId);
      setInspections((prev) => prev.filter((i) => i._id !== inspId));
      setShowDeleteConfirm(null);
      toast.success('Inspection deleted');
    } catch {
      toast.error('Failed to delete inspection');
    } finally {
      setIsDeleting(false);
    }
  };
  const handleMarkResolved = async (insp: SafetyInspection) => {
    try {
      const res = await safetyApi.update(insp._id, {
        isResolved: true,
        actionStatus: ActionStatus.COMPLETED,
      });
      setInspections((prev) => prev.map((i) => (i._id === insp._id ? res.data : i)));
      toast.success('Marked as resolved');
    } catch {
      toast.error('Failed to update inspection');
    }
  };
  const openEdit = (insp: SafetyInspection) => {
    setShowEdit(insp);
    setEditForm({
      inspectionType: insp.inspectionType,
      inspectionDate: insp.inspectionDate?.slice(0, 10),
      findings: insp.findings,
      riskLevel: insp.riskLevel,
      inspectorNotes: insp.inspectorNotes ?? '',
      actionRequired: insp.actionRequired ?? '',
      actionStatus: insp.actionStatus,
      actionDeadline: insp.actionDeadline?.slice(0, 10) ?? '',
      isResolved: insp.isResolved,
    });
  };
  const totalPages = Math.ceil(total / limit);
  return (
    <DashboardLayout>
      <ProjectHeader />

      <div className="px-10 py-10 pb-20 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-black text-primary tracking-tighter leading-none font-headline">
              Safety Inspections
            </h3>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Track and manage on-site safety findings and risk assessments.
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-primary/10 hover:brightness-110 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              New Inspection
            </button>
          )}
        </div>

        {highRisk.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-center gap-4">
            <span
              className="material-symbols-outlined text-rose-600 text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              warning
            </span>
            <div>
              <p className="text-sm font-bold text-rose-700">
                {highRisk.length} High / Critical Risk{' '}
                {highRisk.length === 1 ? 'Finding' : 'Findings'} Unresolved
              </p>
              <p className="text-xs text-rose-500 mt-0.5">Immediate attention required</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <select
            value={filterRisk}
            onChange={(e) => {
              setFilterRisk(e.target.value);
              setPage(1);
            }}
            className="input-standard h-10 text-xs px-3 min-w-[140px]"
          >
            <option value="">All Risk Levels</option>
            {Object.values(RiskLevel).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="input-standard h-10 text-xs px-3 min-w-[140px]"
          >
            <option value="">All Statuses</option>
            {Object.values(ActionStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={filterResolved}
            onChange={(e) => {
              setFilterResolved(e.target.value);
              setPage(1);
            }}
            className="input-standard h-10 text-xs px-3 min-w-[140px]"
          >
            <option value="">All</option>
            <option value="false">Unresolved</option>
            <option value="true">Resolved</option>
          </select>
          {(filterRisk || filterStatus || filterResolved) && (
            <button
              onClick={() => {
                setFilterRisk('');
                setFilterStatus('');
                setFilterResolved('');
                setPage(1);
              }}
              className="h-10 px-3 text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">close</span> Clear
            </button>
          )}
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-slate-100/50 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : inspections.length === 0 ? (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300">
                health_and_safety
              </span>
              <p className="text-sm text-slate-400 mt-3 font-medium">No inspections found</p>
              {canManage && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-4 text-xs font-bold text-emerald-600 hover:underline"
                >
                  Create the first inspection →
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Type
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Findings
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Inspector
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Risk
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Resolved
                  </th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {inspections.map((insp) => (
                  <tr key={insp._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-primary whitespace-nowrap">
                      {new Date(insp.inspectionDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {insp.inspectionType ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-[200px] truncate">
                      {insp.findings}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {insp.inspector?.fullName ?? '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-black px-2 py-1 rounded-lg border ${RISK_COLORS[insp.riskLevel] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}
                      >
                        {insp.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg ${ACTION_COLORS[insp.actionStatus] ?? 'bg-slate-100 text-slate-600'}`}
                      >
                        {insp.actionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {insp.isResolved ? (
                        <span className="material-symbols-outlined text-emerald-500 text-base">
                          check_circle
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-slate-300 text-base">
                          radio_button_unchecked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setShowDetail(insp)}
                          className="text-slate-400 hover:text-primary transition-colors"
                          title="View details"
                        >
                          <span className="material-symbols-outlined text-base">visibility</span>
                        </button>
                        {canManage && (
                          <>
                            {!insp.isResolved && (
                              <button
                                onClick={() => handleMarkResolved(insp)}
                                className="text-slate-400 hover:text-emerald-600 transition-colors"
                                title="Mark resolved"
                              >
                                <span className="material-symbols-outlined text-base">
                                  task_alt
                                </span>
                              </button>
                            )}
                            <button
                              onClick={() => openEdit(insp)}
                              className="text-slate-400 hover:text-primary transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(insp._id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">{total} total inspections</p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-40 hover:bg-slate-200 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <span className="text-xs font-bold text-primary">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-40 hover:bg-slate-200 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          />
          <div className="bg-white rounded-[32px] w-full max-w-xl relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="bg-emerald-950 p-8 text-white sticky top-0 z-10">
              <h3 className="text-2xl font-black tracking-tighter">New Safety Inspection</h3>
              <p className="text-emerald-400/70 text-xs font-bold uppercase tracking-widest mt-1">
                Record site inspection findings
              </p>
            </div>
            <div className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Inspection Date
                  </label>
                  <input
                    type="date"
                    className="input-standard w-full h-10"
                    value={form.inspectionDate}
                    onChange={(e) => setForm((f) => ({ ...f, inspectionDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Type
                  </label>
                  <select
                    className="input-standard w-full h-10 text-sm"
                    value={form.inspectionType}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        inspectionType: e.target
                          .value as (typeof InspectionType)[keyof typeof InspectionType],
                      }))
                    }
                  >
                    {Object.values(InspectionType).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Findings *
                </label>
                <textarea
                  rows={3}
                  className="input-standard w-full resize-none"
                  placeholder="Describe what was found during the inspection..."
                  value={form.findings}
                  onChange={(e) => setForm((f) => ({ ...f, findings: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Risk Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.values(RiskLevel).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, riskLevel: r }))}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${form.riskLevel === r ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Inspector Notes
                </label>
                <textarea
                  rows={2}
                  className="input-standard w-full resize-none"
                  placeholder="Additional notes..."
                  value={form.inspectorNotes}
                  onChange={(e) => setForm((f) => ({ ...f, inspectorNotes: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Action Required
                </label>
                <input
                  type="text"
                  className="input-standard w-full h-10"
                  placeholder="Describe required corrective action..."
                  value={form.actionRequired}
                  onChange={(e) => setForm((f) => ({ ...f, actionRequired: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Action Deadline
                  </label>
                  <input
                    type="date"
                    className="input-standard w-full h-10"
                    value={form.actionDeadline}
                    onChange={(e) => setForm((f) => ({ ...f, actionDeadline: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Issues Identified
                </label>
                {(form.issuesIdentified ?? []).map((issue, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-xs"
                  >
                    <span className="flex-1 font-medium text-primary">{issue.issue}</span>
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${issue.severity === 'Major' ? 'bg-rose-100 text-rose-700' : issue.severity === 'Moderate' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}
                    >
                      {issue.severity}
                    </span>
                    <button
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          issuesIdentified: f.issuesIdentified?.filter((_, j) => j !== i),
                        }))
                      }
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-standard flex-1 h-9 text-xs"
                    placeholder="Issue description"
                    value={newIssue.issue}
                    onChange={(e) => setNewIssue((n) => ({ ...n, issue: e.target.value }))}
                  />
                  <select
                    className="input-standard h-9 text-xs px-2"
                    value={newIssue.severity}
                    onChange={(e) =>
                      setNewIssue((n) => ({
                        ...n,
                        severity: e.target
                          .value as (typeof IssueSeverity)[keyof typeof IssueSeverity],
                      }))
                    }
                  >
                    {Object.values(IssueSeverity).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if (!newIssue.issue.trim()) return;
                      setForm((f) => ({
                        ...f,
                        issuesIdentified: [...(f.issuesIdentified ?? []), { ...newIssue }],
                      }));
                      setNewIssue({ issue: '', severity: IssueSeverity.MINOR, location: '' });
                    }}
                    className="h-9 px-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Recommended Actions
                </label>
                {(form.recommendedActions ?? []).map((action, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-xs"
                  >
                    <span className="flex-1 text-slate-700">{action}</span>
                    <button
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          recommendedActions: f.recommendedActions?.filter((_, j) => j !== i),
                        }))
                      }
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-standard flex-1 h-9 text-xs"
                    placeholder="Add a recommended action"
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newAction.trim()) {
                        setForm((f) => ({
                          ...f,
                          recommendedActions: [...(f.recommendedActions ?? []), newAction.trim()],
                        }));
                        setNewAction('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!newAction.trim()) return;
                      setForm((f) => ({
                        ...f,
                        recommendedActions: [...(f.recommendedActions ?? []), newAction.trim()],
                      }));
                      setNewAction('');
                    }}
                    className="h-9 px-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isSaving}
                  className="flex-[2] py-3 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Create Inspection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
            onClick={() => setShowDetail(null)}
          />
          <div className="bg-white rounded-[32px] w-full max-w-lg relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div
              className={`p-8 text-white sticky top-0 z-10 ${showDetail.riskLevel === 'Critical' || showDetail.riskLevel === 'High' ? 'bg-rose-600' : 'bg-primary'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-tighter">Inspection Details</h3>
                  <p className="text-white/60 text-xs mt-1">
                    {new Date(showDetail.inspectionDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-black px-3 py-1.5 rounded-xl border ${RISK_COLORS[showDetail.riskLevel]}`}
                >
                  {showDetail.riskLevel}
                </span>
              </div>
            </div>
            <div className="p-8 space-y-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Type
                </p>
                <p className="text-sm font-bold text-primary">{showDetail.inspectionType ?? '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Findings
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">{showDetail.findings}</p>
              </div>
              {showDetail.inspectorNotes && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    Inspector Notes
                  </p>
                  <p className="text-sm text-slate-600">{showDetail.inspectorNotes}</p>
                </div>
              )}
              {showDetail.actionRequired && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    Action Required
                  </p>
                  <p className="text-sm text-slate-700">{showDetail.actionRequired}</p>
                </div>
              )}
              {showDetail.issuesIdentified.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Issues Identified
                  </p>
                  <div className="space-y-2">
                    {showDetail.issuesIdentified.map((issue, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-xs"
                      >
                        <span className="flex-1 font-medium text-primary">{issue.issue}</span>
                        {issue.location && <span className="text-slate-400">{issue.location}</span>}
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${issue.severity === 'Major' ? 'bg-rose-100 text-rose-700' : issue.severity === 'Moderate' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}
                        >
                          {issue.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {showDetail.recommendedActions.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Recommended Actions
                  </p>
                  <ul className="space-y-1">
                    {showDetail.recommendedActions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="material-symbols-outlined text-emerald-500 text-sm mt-0.5">
                          arrow_right
                        </span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Status
                  </p>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-lg ${ACTION_COLORS[showDetail.actionStatus] ?? ''}`}
                  >
                    {showDetail.actionStatus}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Resolved
                  </p>
                  <span
                    className={`text-xs font-bold ${showDetail.isResolved ? 'text-emerald-600' : 'text-rose-500'}`}
                  >
                    {showDetail.isResolved ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDetail(null)}
                className="w-full py-3 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
            onClick={() => setShowEdit(null)}
          />
          <div className="bg-white rounded-[32px] w-full max-w-lg relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="bg-primary p-8 text-white sticky top-0 z-10">
              <h3 className="text-xl font-black tracking-tighter">Edit Inspection</h3>
            </div>
            <div className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Date
                  </label>
                  <input
                    type="date"
                    className="input-standard w-full h-10"
                    value={editForm.inspectionDate ?? ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, inspectionDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Type
                  </label>
                  <select
                    className="input-standard w-full h-10 text-sm"
                    value={editForm.inspectionType ?? ''}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        inspectionType: e.target
                          .value as (typeof InspectionType)[keyof typeof InspectionType],
                      }))
                    }
                  >
                    {Object.values(InspectionType).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Findings
                </label>
                <textarea
                  rows={3}
                  className="input-standard w-full resize-none"
                  value={editForm.findings ?? ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, findings: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Risk Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.values(RiskLevel).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setEditForm((f) => ({ ...f, riskLevel: r }))}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${editForm.riskLevel === r ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Action Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(ActionStatus).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditForm((f) => ({ ...f, actionStatus: s }))}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${editForm.actionStatus === s ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Action Required
                </label>
                <input
                  type="text"
                  className="input-standard w-full h-10"
                  value={editForm.actionRequired ?? ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, actionRequired: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Action Deadline
                </label>
                <input
                  type="date"
                  className="input-standard w-full h-10"
                  value={editForm.actionDeadline ?? ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, actionDeadline: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isResolved"
                  checked={editForm.isResolved ?? false}
                  onChange={(e) => setEditForm((f) => ({ ...f, isResolved: e.target.checked }))}
                  className="w-4 h-4 accent-primary"
                />
                <label
                  htmlFor="isResolved"
                  className="text-sm font-bold text-primary cursor-pointer"
                >
                  Mark as Resolved
                </label>
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setShowEdit(null)}
                  className="flex-1 py-3 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isSaving}
                  className="flex-[2] py-3 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(null)}
          />
          <div className="bg-white rounded-[32px] w-full max-w-sm relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-rose-600 p-8 text-white">
              <h3 className="text-xl font-black tracking-tighter">Delete Inspection</h3>
              <p className="text-rose-200 text-xs mt-1">This action cannot be undone</p>
            </div>
            <div className="p-8 space-y-5">
              <p className="text-sm text-slate-600">
                Are you sure you want to delete this inspection record?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={isDeleting}
                  className="flex-[2] py-3 bg-rose-600 text-white font-black rounded-2xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
                >
                  {isDeleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
