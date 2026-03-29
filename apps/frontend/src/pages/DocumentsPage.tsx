import { useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/common/DashboardLayout';
import ProjectHeader from '@/components/project/ProjectHeader';
import DocumentUploader from '@/components/documents/DocumentUploader';
import StatusBadge from '@/components/common/StatusBadge';

interface DocumentAsset {
  id: number;
  projectId: string;
  title: string;
  type: string;
  status: 'Approved' | 'Under Review' | 'Draft' | 'Rejected';
  uploader: string;
  date: string;
}

const allDocuments: DocumentAsset[] = [
  { id: 1, projectId: '1', title: 'Ground Floor Blueprint', type: 'Blueprint', status: 'Approved', uploader: 'Lanka P.', date: 'Mar 24, 2026' },
  { id: 2, projectId: '1', title: 'Environmental Clearance', type: 'Certificate', status: 'Under Review', uploader: 'John D.', date: 'Mar 26, 2026' },
  { id: 3, projectId: '2', title: 'Labor Contract - Phase 1', type: 'Contract', status: 'Draft', uploader: 'Admin', date: 'Mar 28, 2026' },
  { id: 4, projectId: '1', title: 'Safety Inspection Report', type: 'Safety Report', status: 'Approved', uploader: 'Lanka P.', date: 'Mar 20, 2026' },
  { id: 5, projectId: '2', title: 'Structural Load Analysis', type: 'Technical', status: 'Rejected', uploader: 'Sarah W.', date: 'Mar 22, 2026' },
];

export default function DocumentsPage() {
  const { id } = useParams();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentAsset | null>(null);

  // Filter documents by projectId from URL
  const documents = allDocuments.filter(doc => doc.projectId === id || !id);

  return (
    <DashboardLayout>
      <ProjectHeader />

      <div className="px-10">
        <header className="py-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div>
            <h3 className="text-2xl font-black text-primary tracking-tighter leading-none font-headline">Project Documentation</h3>
            <p className="text-slate-500 text-sm font-medium mt-2">Managing 148 total assets for this project cycle.</p>
          </div>

          <div className="flex items-center gap-3">
              <div className="relative group">
                  <input 
                      type="text" 
                      placeholder="Search documents..." 
                      className="input-standard pl-11 w-64 md:w-80 shadow-sm h-11"
                  />
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary transition-colors text-xl">search</span>
              </div>
              <button className="p-3 bg-surface-container-lowest text-primary border border-slate-100 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                  <span className="material-symbols-outlined">filter_list</span>
              </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 pb-20">
          {/* Left: Uploader Zone */}
          <div className="lg:col-span-1 space-y-8">
              <div onClick={() => setShowUploadModal(true)} className="cursor-pointer">
                <DocumentUploader />
              </div>
              
              <div className="bg-emerald-950 p-8 rounded-3xl shadow-xl shadow-emerald-950/20 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/20 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-secondary/30 transition-all duration-700"></div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400/70 mb-4 font-headline">Storage Overview</h4>
                <div className="flex items-end gap-2 mb-2">
                  <p className="text-3xl font-black">2.4</p>
                  <p className="text-xs font-bold text-emerald-400/70 mb-1 uppercase tracking-widest leading-none">GB Used</p>
                </div>
                <div className="w-full bg-emerald-900/50 h-1.5 rounded-full overflow-hidden mt-4">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '24%' }}></div>
                </div>
                <p className="text-[9px] font-bold text-emerald-500/50 mt-4 uppercase tracking-[0.2em]">Upgrade to Enterprise Plan</p>
              </div>
          </div>

          {/* Right: Document Table */}
          <div className="lg:col-span-3">
            <div className="bg-surface-container-lowest rounded-3xl p-2 border border-slate-100/50 shadow-sm overflow-hidden">
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b border-slate-50">
                     <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Title</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Lifecycle Status</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Owner / Date</th>
                     <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {documents.map((doc: DocumentAsset) => (
                     <tr key={doc.id} className="group hover:bg-slate-50/50 transition-colors">
                       <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-secondary/10 group-hover:text-secondary transition-colors">
                                <span className="material-symbols-outlined text-xl">description</span>
                             </div>
                             <div>
                                <p className="text-sm font-bold text-primary group-hover:text-secondary transition-colors">{doc.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-[10px] font-medium text-slate-400 leading-none">v1.2 • Finalized Draft</p>
                                  <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">84 Accesses</p>
                                </div>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-6">
                          <span className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                             {doc.type}
                          </span>
                       </td>
                       <td className="px-6 py-6 text-center">
                          <StatusBadge status={doc.status} />
                       </td>
                       <td className="px-6 py-6 text-right">
                          <div className="flex flex-col items-end">
                             <p className="text-xs font-bold text-primary">{doc.uploader}</p>
                             <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tight">{doc.date}</p>
                          </div>
                       </td>
                       <td className="px-6 py-6 text-right">
                          <div className="flex justify-end gap-1">
                            <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Download">
                              <span className="material-symbols-outlined text-xl">download</span>
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); setShowHistoryModal(true); }}
                              className="p-2 text-slate-400 hover:text-secondary hover:bg-slate-50 rounded-lg transition-all" 
                              title="Version History"
                            >
                               <span className="material-symbols-outlined text-xl">history</span>
                            </button>
                            <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete">
                              <span className="material-symbols-outlined text-xl">delete_outline</span>
                            </button>
                          </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        </div>
      </div>

      {/* Version History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)}></div>
          <div className="bg-white rounded-[40px] w-full max-w-xl relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
             <div className="bg-emerald-950 p-8 text-white">
                <h3 className="text-2xl font-black tracking-tighter leading-none">Version Lifecycle</h3>
                <p className="text-emerald-400/70 text-xs font-bold uppercase tracking-widest mt-2">Audit History: {selectedDoc?.title}</p>
             </div>
             <div className="p-10 space-y-6">
                {[
                  { v: 'v1.2', date: 'Mar 24, 2026', user: 'Lanka P.', note: 'Final review approved' },
                  { v: 'v1.1', date: 'Mar 22, 2026', user: 'Admin', note: 'Structural adjustments' },
                  { v: 'v1.0', date: 'Mar 20, 2026', user: 'Lanka P.', note: 'Initial project drop' },
                ].map((v: { v: string; date: string; user: string; note: string }) => (
                   <div key={v.v} className="flex gap-6 items-start pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-primary">{v.v}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-primary">{v.note}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{v.date}</p>
                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{v.user}</p>
                      </div>
                    </div>
                    <button className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] hover:underline">Restore</button>
                  </div>
                ))}
                <button 
                  onClick={() => setShowHistoryModal(false)}
                  className="w-full py-4 bg-slate-100 text-primary font-bold rounded-2xl mt-4 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Close Audit View
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Upload Metadata Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}></div>
          <div className="bg-white rounded-[40px] w-full max-w-2xl relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
             <div className="p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined !text-4xl">cloud_upload</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-primary tracking-tighter leading-none">Asset Registration</h3>
                    <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest">Metadata Entry (Spec 6.3.817)</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Document Title</label>
                      <input type="text" placeholder="e.g. Phase 2 Permit" className="input-standard w-full h-12" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Version Number</label>
                      <input type="text" placeholder="v1.0" className="input-standard w-full h-12" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Classification</label>
                    <select className="input-standard w-full h-12 appearance-none cursor-pointer">
                       <option>Blueprint & Technical Drawing</option>
                       <option>Safety Compliance Report</option>
                       <option>Environmental Certification</option>
                       <option>Material Invoice</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Engineering Notes</label>
                    <textarea rows={3} placeholder="Initial upload for regulatory review..." className="input-standard w-full resize-none h-32"></textarea>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button onClick={() => setShowUploadModal(false)} className="flex-1 py-4 bg-slate-100 text-primary font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-200 transition-all cursor-pointer">Cancel</button>
                    <button className="flex-[2] py-4 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer">Confirm Registration</button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
