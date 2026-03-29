import { useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/common/DashboardLayout';
import ProjectHeader from '@/components/project/ProjectHeader';
import StatusBadge from '@/components/common/StatusBadge';

interface ChecklistItem {
  id: number;
  projectId: string;
  text: string;
  status: string;
  risk: 'Low' | 'Medium' | 'High';
  responsible: string;
  attachments: number;
  note: string;
}

interface InspectionHistory {
  id: string;
  projectId: string;
  date: string;
  type: string;
  inspector: string;
  risk: 'Low' | 'Medium' | 'High';
  status: string;
}

const checklistTemplates = [
  { id: 'env', label: 'Environmental Compliance (EIA)', icon: 'eco' },
  { id: 'safety', label: 'Safety Standards (OSHA)', icon: 'gshield' },
  { id: 'build', label: 'Building Code Verification', icon: 'architecture' },
];

const allChecklistItems: ChecklistItem[] = [
  { id: 1, projectId: '1', text: 'Site Perimeter Fencing and Signage', status: 'Completed', risk: 'Low', responsible: 'Lanka P.', attachments: 2, note: 'Securely installed with emergency contact info.' },
  { id: 2, projectId: '1', text: 'Active Air Quality Monitoring System', status: 'Pending', risk: 'Medium', responsible: 'Sarah W.', attachments: 0, note: 'Awaiting sensor calibration for Section B.' },
  { id: 3, projectId: '2', text: 'Hazardous Waste Storage Containment', status: 'Completed', risk: 'High', responsible: 'John D.', attachments: 4, note: 'Secondary containment active; spill kit present.' },
  { id: 4, projectId: '1', text: 'Emergency Fire Suppression Access', status: 'Pending', risk: 'High', responsible: 'Admin', attachments: 1, note: 'Blocked by materials on 4th floor staging.' },
  { id: 5, projectId: '2', text: 'Soil Erosion Control Implementation', status: 'Completed', risk: 'Low', responsible: 'Lanka P.', attachments: 3, note: 'Silt fences inspected and functional.' },
];

const allInspectionHistory: InspectionHistory[] = [
  { id: 'INS-001', projectId: '1', date: 'Mar 15, 2026', type: 'Safety', inspector: 'John Doe', risk: 'Medium', status: 'Resolved' },
  { id: 'INS-002', projectId: '2', date: 'Mar 10, 2026', type: 'Environmental', inspector: 'Sarah Wayne', risk: 'Low', status: 'Completed' },
  { id: 'INS-003', projectId: '1', date: 'Mar 05, 2026', type: 'Quality', inspector: 'Lanka P.', risk: 'High', status: 'Action Required' },
];

export default function CompliancePage() {
  const { id } = useParams();
  
  const initialItems = allChecklistItems.filter(item => item.projectId === id || !id);
  const inspectionHistory = allInspectionHistory.filter(h => h.projectId === id || !id);
  
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);

  return (
    <DashboardLayout>
      <ProjectHeader />

      <div className="px-10">
        <header className="py-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div>
            <h3 className="text-2xl font-black text-primary tracking-tighter leading-none font-headline">Regulatory Oversight</h3>
            <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm font-medium">
              <span className="material-symbols-outlined text-sm text-amber-600">report_problem</span>
              <span>2 High-Risk findings require immediate rectification.</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
              <div className="relative group">
                <select className="input-standard bg-surface-container-lowest h-11 pr-12 appearance-none cursor-pointer">
                    {checklistTemplates.map(t => (
                        <option key={t.id}>{t.label}</option>
                    ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-emerald-600 transition-colors">expand_more</span>
              </div>
              <button className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/10 hover:brightness-110 active:scale-95 transition-all cursor-pointer font-headline">
                  <span className="material-symbols-outlined text-lg">add_task</span>
                  New Inspection
              </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Summary Metrics */}
          <div className="lg:col-span-1 space-y-8">
              <div className="bg-surface-container-lowest p-10 rounded-3xl border border-slate-100/50 shadow-sm text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-secondary"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Aggregate Compliance Score</p>
                <div className="relative inline-flex items-center justify-center">
                    <svg className="w-48 h-48 -rotate-90">
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
                      <circle 
                        cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                        strokeDasharray={552.92} strokeDashoffset={552.92 * (1 - 0.76)}
                        className="text-secondary transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-5xl font-black text-primary tracking-tighter">76%</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified Stable</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-10">
                    <div className="p-4 bg-slate-50 rounded-2xl text-left border border-slate-100/50">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Inspected</p>
                      <p className="text-xl font-black text-primary mt-1 leading-none tracking-tight">32/41</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl text-left border border-slate-100/50">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Days Clean</p>
                      <p className="text-xl font-black text-secondary mt-1 leading-none tracking-tight">142</p>
                    </div>
                </div>
              </div>

              <div className="bg-emerald-950 p-8 rounded-3xl shadow-xl shadow-emerald-950/20 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/20 rounded-full blur-2xl -mr-12 -mt-12"></div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400/70 mb-4 font-headline">Compliance Roadmap</h4>
                <ul className="space-y-4">
                  {[
                    { date: 'Apr 02', label: 'EIA Annual Audit' },
                    { date: 'Apr 12', label: 'ISO Recertification' },
                    { date: 'May 05', label: 'Safety Drill' },
                  ].map((item: { date: string; label: string }, i: number) => (
                    <li key={i} className="flex gap-4 items-start border-l border-emerald-800/50 pl-4 py-1 relative">
                        <div className="absolute -left-[4.5px] top-2 w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(14,108,74,1)]"></div>
                        <div className="text-[10px] font-black text-secondary leading-none mt-0.5 uppercase tracking-widest">{item.date}</div>
                        <div className="text-xs font-bold text-emerald-50 mt-[-2px]">{item.label}</div>
                    </li>
                  ))}
                </ul>
              </div>
          </div>

          {/* Right: Inspection Checklist */}
          <div className="lg:col-span-2">
              <div className="bg-surface-container-lowest rounded-3xl p-10 border border-slate-100/50 shadow-sm space-y-8">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
                    <h4 className="text-lg font-bold text-primary tracking-tight">Current Inspection Protocol</h4>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span className="flex items-center gap-1.5"><StatusBadge status="Completed" /> Verified</span>
                      <span className="flex items-center gap-1.5"><StatusBadge status="Pending" /> Incomplete</span>
                    </div>
                </div>

                <div className="space-y-6">
                  {items.map((item: ChecklistItem) => (
                    <div key={item.id} className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl group hover:border-secondary/20 hover:bg-white transition-all shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="text-sm font-bold text-primary leading-tight">{item.text}</h5>
                              <StatusBadge status={item.risk} />
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tight bg-white px-2 py-0.5 rounded border border-slate-100">
                                  <span className="material-symbols-outlined text-[12px]">person</span>
                                  {item.responsible}
                                </div>
                                {item.attachments > 0 && (
                                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-tight bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                      <span className="material-symbols-outlined text-[12px]">attach_file</span>
                                      {item.attachments} Docs
                                  </div>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium mt-3 leading-relaxed">{item.note}</p>
                          </div>
                          <div className="flex items-center gap-2 self-start md:self-center">
                            <button 
                              onClick={() => {
                                setItems(items.map(i => i.id === item.id ? { ...i, status: i.status === 'Completed' ? 'Pending' : 'Completed' } : i));
                              }}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${item.status === 'Completed' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/20' : 'bg-white border border-slate-200 text-slate-400 hover:border-secondary hover:text-secondary'}`}
                            >
                              {item.status}
                            </button>
                          </div>
                        </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-10 border-t border-slate-50 flex justify-end gap-4">
                    <button className="px-8 py-3 bg-slate-100 text-primary font-bold text-xs rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest cursor-pointer">
                        Save Progress
                    </button>
                    <button className="px-8 py-3 bg-primary text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest cursor-pointer">
                        Submit Inspection Report
                    </button>
                </div>
              </div>
          </div>
        </div>

        {/* Inspection History Section */}
        <div className="mt-10 pb-20">
          <div className="bg-surface-container-lowest rounded-3xl p-10 border border-slate-100/50 shadow-sm overflow-hidden">
              <h4 className="text-lg font-bold text-primary tracking-tight mb-8">Safety Inspection History</h4>
              <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-50 font-black text-[10px] text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Inspection Date</th>
                      <th className="px-6 py-4">Audit Category</th>
                      <th className="px-6 py-4 text-center">Risk Assessment</th>
                      <th className="px-6 py-4 text-center">Inspector</th>
                      <th className="px-6 py-4 text-right">Action Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {inspectionHistory.map((history: InspectionHistory) => (
                      <tr key={history.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-5 text-xs font-black text-slate-400 font-headline">{history.id}</td>
                          <td className="px-6 py-5 text-sm font-bold text-primary">{history.date}</td>
                          <td className="px-6 py-5">
                            <span className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">{history.type}</span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <StatusBadge status={history.risk} />
                          </td>
                          <td className="px-6 py-5 text-center text-xs font-bold text-slate-500">{history.inspector}</td>
                          <td className="px-6 py-5 text-right">
                            <StatusBadge status={history.status === 'Resolved' || history.status === 'Completed' ? 'Completed' : 'Pending'} />
                          </td>
                      </tr>
                    ))}
                </tbody>
              </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
