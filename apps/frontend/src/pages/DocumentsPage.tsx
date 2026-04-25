import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '@/components/common/DashboardLayout';
import ProjectHeader from '@/components/project/ProjectHeader';
import DocumentUploader from '@/components/documents/DocumentUploader';
import { documentApi } from '@/lib/api';
import { useDocumentStore } from '@/store';
import { useAuthStore } from '@/store';
import { DocumentStatus, DocumentType } from '@/types/document';
import type { ProjectDocument, PreviousVersion } from '@/types/document';
import { UserRole } from '@/types/auth';
import api from '@/lib/api';
const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fmtSize = (bytes?: number) => {
  if (!bytes) return '—';
  return bytes >= 1000000
    ? `${(bytes / 1000000).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`;
};
const statusConfig: Record<
  DocumentStatus,
  {
    bg: string;
    text: string;
  }
> = {
  [DocumentStatus.APPROVED]: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  [DocumentStatus.UNDER_REVIEW]: { bg: 'bg-amber-50', text: 'text-amber-700' },
  [DocumentStatus.DRAFT]: { bg: 'bg-slate-100', text: 'text-slate-500' },
  [DocumentStatus.REJECTED]: { bg: 'bg-rose-50', text: 'text-rose-600' },
};
const docTypeIcon: Record<DocumentType, string> = {
  [DocumentType.BLUEPRINT]: 'architecture',
  [DocumentType.PERMIT]: 'verified',
  [DocumentType.CERTIFICATE]: 'workspace_premium',
  [DocumentType.SAFETY_REPORT]: 'health_and_safety',
  [DocumentType.CONTRACT]: 'gavel',
  [DocumentType.OTHER]: 'description',
};
const ALL_DOC_TYPES = Object.values(DocumentType);
const ALL_STATUSES = Object.values(DocumentStatus);
const StatusBadge = ({ status }: { status: DocumentStatus }) => {
  const sc = statusConfig[status] ?? { bg: 'bg-slate-100', text: 'text-slate-500' };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${sc.bg} ${sc.text}`}
    >
      {status}
    </span>
  );
};
export default function DocumentsPage() {
  const { id: projectId } = useParams<{
    id: string;
  }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const {
    documents,
    docPagination,
    docFilters,
    isDocLoading,
    isUploading,
    setDocuments,
    appendDocument,
    updateDocumentInStore,
    removeDocument,
    setDocFilters,
    setDocLoading,
    setUploading,
  } = useDocumentStore();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState<{
    title: string;
    documentType: DocumentType;
    description: string;
    version: string;
    tags: string;
  }>({
    title: '',
    documentType: DocumentType.OTHER,
    description: '',
    version: '1.0',
    tags: '',
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyDoc, setHistoryDoc] = useState<ProjectDocument | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showNewVersionModal, setShowNewVersionModal] = useState(false);
  const [newVersionDoc, setNewVersionDoc] = useState<ProjectDocument | null>(null);
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [isVersioning, setIsVersioning] = useState(false);
  const [versionError, setVersionError] = useState<string | null>(null);
  const [rejectingDoc, setRejectingDoc] = useState<ProjectDocument | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const canModerate = user?.role === UserRole.ADMIN || user?.role === UserRole.INSPECTOR;
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const statusFromUrl = searchParams.get('status') ?? '';
  useEffect(() => {
    if (!projectId) return;
    const urlStatus = statusFromUrl as DocumentStatus | '';
    setDocFilters({ projectId, status: urlStatus, documentType: '', tag: '', page: 1, limit: 10 });
  }, [projectId, statusFromUrl, setDocFilters]);
  useEffect(() => {
    if (!docFilters.projectId) return;
    const fetch = async () => {
      setDocLoading(true);
      try {
        const res = await documentApi.getDocuments(docFilters);
        setDocuments(res.data, res.pagination);
      } catch (err) {
        console.error('Failed to fetch documents:', err);
        toast.error('Failed to load documents');
      } finally {
        setDocLoading(false);
      }
    };
    fetch();
  }, [docFilters, setDocuments, setDocLoading]);
  useEffect(() => {
    if (!docFilters.projectId) return;
    const loadCounts = async () => {
      try {
        const results = await Promise.allSettled(
          ALL_STATUSES.map((s) =>
            documentApi.getDocuments({ projectId: docFilters.projectId, status: s, limit: 1 })
          )
        );
        const counts: Record<string, number> = {};
        ALL_STATUSES.forEach((s, i) => {
          const r = results[i];
          counts[s] = r.status === 'fulfilled' ? (r.value.pagination?.total ?? 0) : 0;
        });
        setStatusCounts(counts);
      } catch {}
    };
    loadCounts();
  }, [docFilters.projectId]);
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setDocFilters({ search: searchQuery.trim() || undefined, page: 1 });
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery, setDocFilters]);
  const visibleDocs = useMemo(() => documents, [documents]);
  const handleUpload = async () => {
    if (!projectId || !selectedFile) {
      setUploadError('Please select a file first.');
      return;
    }
    if (!uploadForm.title.trim()) {
      setUploadError('Title is required.');
      return;
    }
    setUploadError(null);
    setUploading(true);
    setUploadProgress(0);
    try {
      const form = new FormData();
      form.append('file', selectedFile);
      form.append('projectId', projectId);
      form.append('documentType', uploadForm.documentType);
      form.append('title', uploadForm.title.trim());
      if (uploadForm.description.trim()) form.append('description', uploadForm.description.trim());
      form.append('version', uploadForm.version.trim() || '1.0');
      if (uploadForm.tags.trim())
        form.append(
          'tags',
          JSON.stringify(
            uploadForm.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          )
        );
      const res = await api.post('/documents', form, {
        headers: { 'Content-Type': undefined },
        onUploadProgress: (event) => {
          if (event.total) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      });
      appendDocument(res.data.data);
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadForm({
        title: '',
        documentType: DocumentType.OTHER,
        description: '',
        version: '1.0',
        tags: '',
      });
      toast.success('Document uploaded successfully');
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
        )?.response?.data?.message ?? 'Upload failed.';
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  const handleOpenHistory = async (doc: ProjectDocument) => {
    setShowHistoryModal(true);
    setHistoryDoc(doc);
    setIsLoadingHistory(true);
    try {
      const res = await documentApi.getById(doc._id);
      setHistoryDoc(res.data);
    } catch (err) {
      console.error('Failed to load version history:', err);
      toast.error('Failed to load version history');
    } finally {
      setIsLoadingHistory(false);
    }
  };
  const handleCreateVersion = async () => {
    if (!newVersionDoc || !newVersionFile) return;
    setVersionError(null);
    setIsVersioning(true);
    try {
      const form = new FormData();
      form.append('file', newVersionFile);
      const res = await api.post(`/documents/${newVersionDoc._id}/versions`, form, {
        headers: { 'Content-Type': undefined },
        onUploadProgress: (event) => {
          if (event.total) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      });
      updateDocumentInStore(newVersionDoc._id, res.data.data);
      setShowNewVersionModal(false);
      setNewVersionDoc(null);
      setNewVersionFile(null);
      setUploadProgress(0);
      toast.success('New version uploaded successfully');
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
        )?.response?.data?.message ?? 'Failed to create new version.';
      setVersionError(msg);
      toast.error(msg);
    } finally {
      setIsVersioning(false);
    }
  };
  const handleApprove = async (doc: ProjectDocument) => {
    try {
      const res = await documentApi.approve(doc._id);
      updateDocumentInStore(doc._id, res.data);
      toast.success('Document approved');
    } catch (err) {
      console.error('Failed to approve document:', err);
      toast.error('Failed to approve document');
    }
  };
  const handleReject = async () => {
    if (!rejectingDoc || !rejectionReason.trim()) {
      setRejectError('Rejection reason is required.');
      return;
    }
    setRejectError(null);
    setIsRejecting(true);
    try {
      const res = await documentApi.reject(rejectingDoc._id, rejectionReason.trim());
      updateDocumentInStore(rejectingDoc._id, res.data);
      setRejectingDoc(null);
      setRejectionReason('');
      toast.success('Document rejected');
    } catch (err: unknown) {
      const msg =
        (
          err as {
            message?: string;
          }
        )?.message ?? 'Failed to reject document.';
      setRejectError(msg);
      toast.error(msg);
    } finally {
      setIsRejecting(false);
    }
  };
  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await documentApi.delete(deletingId);
      removeDocument(deletingId);
      setDeletingId(null);
      toast.success('Document deleted');
    } catch (err) {
      console.error('Failed to delete document:', err);
      toast.error('Failed to delete document');
    } finally {
      setIsDeleting(false);
    }
  };
  const handleView = (doc: ProjectDocument) => {
    window.open(doc.fileUrl, '_blank', 'noopener,noreferrer');
  };
  const handleDownload = (doc: ProjectDocument) => {
    const a = document.createElement('a');
    a.href = doc.fileUrl;
    a.download = doc.fileName ?? doc.title;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  };
  return (
    <DashboardLayout>
      <ProjectHeader />

      <div className="px-10">
        <header className="py-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div>
            <h3 className="text-2xl font-black text-primary tracking-tighter leading-none font-headline">
              Project Documentation
            </h3>
            <p className="text-slate-500 text-sm font-medium mt-2">
              {isDocLoading
                ? 'Loading…'
                : `${docPagination?.total ?? 0} document${(docPagination?.total ?? 0) !== 1 ? 's' : ''} in this project`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search by document name..."
                className="input-standard pl-11 pr-9 w-64 md:w-80 shadow-sm h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary transition-colors text-xl">
                search
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setDocFilters({ search: undefined, page: 1 });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              )}
            </div>

            <select
              className="input-standard h-11 text-xs font-bold cursor-pointer"
              value={docFilters.documentType ?? ''}
              onChange={(e) =>
                setDocFilters({ documentType: e.target.value as DocumentType | '', page: 1 })
              }
            >
              <option value="">All Types</option>
              {ALL_DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              className="input-standard h-11 text-xs font-bold cursor-pointer"
              value={docFilters.status ?? ''}
              onChange={(e) =>
                setDocFilters({ status: e.target.value as DocumentStatus | '', page: 1 })
              }
            >
              <option value="">All Statuses</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 pb-20">
          <div className="lg:col-span-1 space-y-8">
            <div onClick={() => setShowUploadModal(true)} className="cursor-pointer">
              <DocumentUploader
                onFileSelect={(f) => {
                  setSelectedFile(f);
                  if (f) setShowUploadModal(true);
                }}
                selectedFile={selectedFile}
              />
            </div>

            <div className="bg-emerald-950 p-8 rounded-3xl shadow-xl shadow-emerald-950/20 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/20 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-secondary/30 transition-all duration-700" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400/70 mb-4 font-headline">
                Total Documents
              </h4>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-3xl font-black">{docPagination?.total ?? 0}</p>
                <p className="text-xs font-bold text-emerald-400/70 mb-1 uppercase tracking-widest leading-none">
                  Assets
                </p>
              </div>
              <div className="mt-4 space-y-1.5">
                {ALL_STATUSES.map((s) => {
                  const count = statusCounts[s] ?? documents.filter((d) => d.status === s).length;
                  const sc = statusConfig[s];
                  return (
                    <div key={s} className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-emerald-400/50 uppercase tracking-wider">
                        {s}
                      </span>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}
                      >
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {isDocLoading ? (
              <div className="bg-surface-container-lowest rounded-3xl p-6 border border-slate-100/50 animate-pulse space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-2xl" />
                ))}
              </div>
            ) : visibleDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">
                  {debouncedSearch ? 'search_off' : 'folder_open'}
                </span>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  {debouncedSearch ? `No results for "${debouncedSearch}"` : 'No documents found'}
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  {debouncedSearch
                    ? 'Try a different name'
                    : 'Upload the first document to get started'}
                </p>
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-3xl p-2 border border-slate-100/50 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Document
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Type
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Status
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                        Owner / Date
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {visibleDocs.map((doc) => (
                      <tr key={doc._id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-secondary/10 group-hover:text-secondary transition-colors shrink-0">
                              <span className="material-symbols-outlined text-xl">
                                {docTypeIcon[doc.documentType] ?? 'description'}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-primary group-hover:text-secondary transition-colors truncate max-w-[200px]">
                                {doc.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-medium text-slate-400">
                                  v{doc.version}
                                </span>
                                {doc.fileName && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                    <span className="text-[10px] font-medium text-slate-400 uppercase">
                                      {doc.fileFormat ?? doc.fileName.split('.').pop()}
                                    </span>
                                  </>
                                )}
                                {doc.fileSize && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                    <span className="text-[10px] font-medium text-slate-400">
                                      {fmtSize(doc.fileSize)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
                            {doc.documentType}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-center">
                          <StatusBadge status={doc.status} />
                          {doc.rejectionReason && (
                            <p
                              className="text-[9px] text-rose-400 mt-1 max-w-[120px] mx-auto line-clamp-1"
                              title={doc.rejectionReason}
                            >
                              {doc.rejectionReason}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <p className="text-xs font-bold text-primary">
                            {doc.uploadedBy?.name ?? '—'}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-tight">
                            {fmt(doc.createdAt)}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end items-center gap-1">
                            <button
                              onClick={() => handleView(doc)}
                              className="p-2 text-slate-400 hover:text-secondary hover:bg-slate-50 rounded-lg transition-all"
                              title="View"
                            >
                              <span className="material-symbols-outlined text-xl">open_in_new</span>
                            </button>

                            <button
                              onClick={() => handleDownload(doc)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Download"
                            >
                              <span className="material-symbols-outlined text-xl">download</span>
                            </button>

                            <button
                              onClick={() => handleOpenHistory(doc)}
                              className="p-2 text-slate-400 hover:text-secondary hover:bg-slate-50 rounded-lg transition-all"
                              title="Version History"
                            >
                              <span className="material-symbols-outlined text-xl">history</span>
                            </button>

                            <button
                              onClick={() => {
                                setNewVersionDoc(doc);
                                setShowNewVersionModal(true);
                              }}
                              className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-all"
                              title="Upload New Version"
                            >
                              <span className="material-symbols-outlined text-xl">upload</span>
                            </button>

                            {canModerate && doc.status !== DocumentStatus.APPROVED && (
                              <button
                                onClick={() => handleApprove(doc)}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                title="Approve"
                              >
                                <span className="material-symbols-outlined text-xl">
                                  check_circle
                                </span>
                              </button>
                            )}

                            {canModerate && doc.status !== DocumentStatus.REJECTED && (
                              <button
                                onClick={() => {
                                  setRejectingDoc(doc);
                                  setRejectionReason('');
                                  setRejectError(null);
                                }}
                                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                title="Reject"
                              >
                                <span className="material-symbols-outlined text-xl">cancel</span>
                              </button>
                            )}

                            <button
                              onClick={() => setDeletingId(doc._id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-xl">
                                delete_outline
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {docPagination && docPagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-3 py-4 border-t border-slate-50">
                    <button
                      className="px-4 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      disabled={docFilters.page <= 1}
                      onClick={() => setDocFilters({ page: docFilters.page - 1 })}
                    >
                      Previous
                    </button>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {docFilters.page} / {docPagination.pages}
                    </span>
                    <button
                      className="px-4 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      disabled={docFilters.page >= docPagination.pages}
                      onClick={() => setDocFilters({ page: docFilters.page + 1 })}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
            onClick={() => setShowUploadModal(false)}
          />
          <div className="bg-white rounded-[40px] w-full max-w-2xl relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-950 p-8 text-white">
              <h3 className="text-2xl font-black tracking-tighter leading-none">Upload Document</h3>
              <p className="text-emerald-400/70 text-xs font-bold uppercase tracking-widest mt-2">
                Add to project documentation
              </p>
            </div>
            <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto">
              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 font-medium">
                  {uploadError}
                </div>
              )}

              <DocumentUploader
                onFileSelect={(f) => setSelectedFile(f)}
                selectedFile={selectedFile}
              />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Phase 2 Structural Permit"
                    className="input-standard w-full h-12"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Document Type *
                  </label>
                  <select
                    className="input-standard w-full h-12 cursor-pointer"
                    value={uploadForm.documentType}
                    onChange={(e) =>
                      setUploadForm((f) => ({ ...f, documentType: e.target.value as DocumentType }))
                    }
                  >
                    {ALL_DOC_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Version
                  </label>
                  <input
                    type="text"
                    placeholder="1.0"
                    className="input-standard w-full h-12"
                    value={uploadForm.version}
                    onChange={(e) => setUploadForm((f) => ({ ...f, version: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Tags (comma-separated, optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., phase-1, structural, approved"
                  className="input-standard w-full h-12"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm((f) => ({ ...f, tags: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Description (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe this document..."
                  className="input-standard w-full resize-none"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              {isUploading && uploadProgress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Uploading…</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile}
                  className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isUploading ? 'Uploading…' : 'Upload Document'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
            onClick={() => setShowHistoryModal(false)}
          />
          <div className="bg-white rounded-[40px] w-full max-w-xl relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-950 p-8 text-white">
              <h3 className="text-2xl font-black tracking-tighter leading-none">Version History</h3>
              <p className="text-emerald-400/70 text-xs font-bold uppercase tracking-widest mt-2 truncate">
                {historyDoc?.title}
              </p>
            </div>
            <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto">
              {isLoadingHistory ? (
                <div className="animate-pulse space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-14 bg-slate-100 rounded-xl" />
                  ))}
                </div>
              ) : (
                <>
                  {historyDoc && (
                    <div className="flex gap-4 items-start pb-6 border-b border-slate-50">
                      <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-black shrink-0">
                        v{historyDoc.version}{' '}
                        <span className="text-[9px] font-bold ml-1 opacity-60">CURRENT</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-primary">Active version</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-widest">
                          {fmt(historyDoc.updatedAt)} · {historyDoc.uploadedBy?.name ?? '—'}
                        </p>
                      </div>
                    </div>
                  )}

                  {(historyDoc?.previousVersions ?? []).length === 0 ? (
                    <p className="text-xs text-slate-400 font-medium text-center py-4">
                      No previous versions
                    </p>
                  ) : (
                    [...(historyDoc?.previousVersions ?? [])]
                      .reverse()
                      .map((v: PreviousVersion, i) => (
                        <div
                          key={i}
                          className="flex gap-4 items-start pb-6 border-b border-slate-50 last:border-0 last:pb-0"
                        >
                          <div className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-primary shrink-0">
                            v{v.version}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-primary">Previous version</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-widest">
                              {fmt(v.uploadedAt)}
                            </p>
                          </div>
                          <a
                            href={v.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] hover:underline shrink-0"
                          >
                            Download
                          </a>
                        </div>
                      ))
                  )}
                </>
              )}

              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-full py-4 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewVersionModal && newVersionDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
            onClick={() => setShowNewVersionModal(false)}
          />
          <div className="bg-white rounded-[40px] w-full max-w-lg relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-primary p-8 text-white">
              <h3 className="text-2xl font-black tracking-tighter leading-none">New Version</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2 truncate">
                {newVersionDoc.title} · currently v{newVersionDoc.version}
              </p>
            </div>
            <div className="p-10 space-y-6">
              {versionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 font-medium">
                  {versionError}
                </div>
              )}
              <p className="text-xs text-slate-500 font-medium">
                Upload the revised file. The current version will be archived and the version number
                will be auto-incremented (e.g. {newVersionDoc.version} →{' '}
                {(() => {
                  const [maj, min] = newVersionDoc.version.split('.');
                  return `${maj}.${parseInt(min ?? '0') + 1}`;
                })()}
                ).
              </p>
              <DocumentUploader
                onFileSelect={(f) => setNewVersionFile(f)}
                selectedFile={newVersionFile}
              />
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => {
                    setShowNewVersionModal(false);
                    setNewVersionFile(null);
                  }}
                  className="flex-1 py-4 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateVersion}
                  disabled={isVersioning || !newVersionFile}
                  className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isVersioning ? 'Uploading…' : 'Upload New Version'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {rejectingDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
            onClick={() => setRejectingDoc(null)}
          />
          <div className="bg-white rounded-[40px] w-full max-w-md relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-amber-600 p-8 text-white">
              <h3 className="text-2xl font-black tracking-tighter leading-none">Reject Document</h3>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-2 truncate">
                {rejectingDoc.title}
              </p>
            </div>
            <div className="p-10 space-y-6">
              {rejectError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 font-medium">
                  {rejectError}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Rejection Reason *
                </label>
                <textarea
                  rows={4}
                  placeholder="Explain why this document is being rejected..."
                  className="input-standard w-full resize-none"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setRejectingDoc(null)}
                  className="flex-1 py-4 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isRejecting}
                  className="flex-[2] py-4 bg-amber-600 text-white font-black rounded-2xl hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isRejecting ? 'Rejecting…' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
            onClick={() => setDeletingId(null)}
          />
          <div className="bg-white rounded-[40px] w-full max-w-sm relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 p-10">
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <span className="material-symbols-outlined text-2xl">warning</span>
              <p className="text-lg font-black">Delete Document?</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-8">
              This is permanent. The file will be removed from cloud storage and all version history
              will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-2xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-60"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
