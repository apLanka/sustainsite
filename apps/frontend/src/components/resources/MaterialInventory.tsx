import {useEffect, useState} from 'react';
import {useProject} from '@/contexts/ProjectContext';
import {resourcesApi} from '@/lib/api';
import type {MaterialAsset} from '@/types/resources';
import type {StatusType} from '@/components/common/StatusBadge';
import StatusBadge from '@/components/common/StatusBadge';

export default function MaterialInventory() {
  const {activeProjectId} = useProject();
  const [materials, setMaterials] = useState<MaterialAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProjectId) return;

    const fetchMaterials = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await resourcesApi.getMaterials(activeProjectId);
        setMaterials(res.data);
      } catch (err) {
        console.error('Failed to load materials:', err);
        setError('Failed to load materials');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, [activeProjectId]);

  const totalUnits = materials.reduce((sum, m) => sum + m.quantity, 0);
  const greenScore = materials.length > 0
      ? Math.round((materials.filter(m => m.status !== 'Low Stock' && m.status !== 'Out of Stock').length / materials.length) * 100)
      : 0;
  const inTransitCount = materials.filter(m => m.status === 'In Transit').length;
  const hasLowStock = materials.some(m => m.status === 'Low Stock' || m.quantity < m.minThreshold);

  if (!activeProjectId) {
    return (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <p className="text-sm">Select a project to view materials</p>
        </div>
    );
  }

  if (isLoading) {
    return (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-100 h-32 rounded-3xl"/>
            ))}
          </div>
          <div className="bg-slate-100 h-64 rounded-3xl"/>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex items-center justify-center h-64 text-rose-500">
          <p className="text-sm">{error}</p>
        </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Low Stock Alert Banner */}
      {hasLowStock && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center justify-between text-rose-700">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-rose-500">warning</span>
            <div>
              <p className="font-bold text-sm">Critical Stock Alert</p>
              <p className="text-xs opacity-80">Some essential materials are below thresholds. Immediate procurement recommended.</p>
            </div>
          </div>
          <button className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm">
            Quick Reorder
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">inventory_2</span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Inventory</p>
          </div>
          <h3 className="text-3xl font-black text-primary tracking-tighter">{totalUnits} <span
              className="text-slate-400 text-sm font-bold uppercase tracking-widest">Total Units</span></h3>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined text-xl">eco</span>
            </div>
            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Sustainability</p>
          </div>
          <h3 className="text-3xl font-black text-emerald-600 tracking-tighter">{greenScore}% <span
              className="text-emerald-400 text-sm font-bold uppercase tracking-widest">Green Score</span></h3>
        </div>

        <div className="bg-primary text-white p-6 rounded-3xl shadow-lg ring-4 ring-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">local_shipping</span>
            </div>
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Logistics</p>
          </div>
          <h3 className="text-3xl font-black text-white tracking-tighter">{String(inTransitCount).padStart(2, '0')}
            <span className="text-white/40 text-sm font-bold uppercase tracking-widest">In Transit</span></h3>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-primary font-black uppercase tracking-widest text-xs flex items-center gap-2">
            Material Ledger
          </h4>
          <button className="bg-secondary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-secondary-dark transition-all flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            New Material
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Material Identity</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Current state</th>
                <th className="px-6 py-4">Availability</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
            {materials.map((material) => (
                <tr key={material.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-bold text-primary">{material.name}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-black tabular-nums">ID: {material.id}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-slate-500 font-medium">{material.category}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-primary font-black text-base tabular-nums">{material.quantity}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{material.unit}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={material.status as StatusType} />
                  </td>
                  <td className="px-6 py-5 text-slate-500 font-medium">{material.supplierName}</td>
                  <td className="px-6 py-5">
                    <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all flex items-center justify-center group-hover:shadow-sm">
                      <span className="material-symbols-outlined text-lg">more_horiz</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

