import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/common/DashboardLayout';
import { resourcesApi } from '@/lib/api';
import type { MaterialAsset, MaterialStatus } from '@/types/resources';

const STATUSES: MaterialStatus[] = [
  'Ordered',
  'In Transit',
  'Delivered',
  'In Stock',
  'Used',
  'Cancelled',
];

export default function SupplierMaterialsPage() {
  const [materials, setMaterials] = useState<MaterialAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await resourcesApi.getMaterials(undefined, 1, 100);
        setMaterials(res.data ?? []);
      } catch {
        toast.error('Failed to load materials');
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const projectLabel = (m: MaterialAsset) => {
    const p = m.projectId;
    if (typeof p === 'string') return `…${p.slice(-6)}`;
    if (p && typeof p === 'object' && p.projectName) return p.projectName;
    return '—';
  };

  const handleStatusChange = async (m: MaterialAsset, status: MaterialStatus) => {
    if (m.status === status) return;
    setUpdatingId(m._id);
    try {
      const res = await resourcesApi.updateMaterialStatus(m._id, status);
      setMaterials((prev) => prev.map((x) => (x._id === m._id ? res.data : x)));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout>
      <header className="py-10">
        <p className="text-secondary font-bold text-sm tracking-widest uppercase mb-1 font-headline">Supplier portal</p>
        <h2 className="text-4xl font-extrabold text-primary tracking-tighter font-headline">Materials &amp; orders</h2>
        <p className="text-slate-500 text-sm font-medium mt-2 max-w-2xl">
          Purchase orders and deliveries linked to your supplier account. Update delivery status as shipments progress.
        </p>
      </header>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-primary font-black uppercase tracking-widest text-xs">Your materials</h3>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading…</div>
        ) : materials.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300">inventory_2</span>
            <p className="text-sm text-slate-400 mt-2">No materials are linked to your supplier profile yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Material</th>
                  <th className="px-6 py-4">Qty</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-primary">{projectLabel(m)}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-primary">{m.materialName}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-black">{m.category}</div>
                    </td>
                    <td className="px-6 py-4 tabular-nums">
                      {m.quantity} {m.unit}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="input-standard h-10 py-0 text-xs font-bold cursor-pointer min-w-[140px]"
                        value={m.status}
                        disabled={updatingId === m._id}
                        onChange={(e) => handleStatusChange(m, e.target.value as MaterialStatus)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
