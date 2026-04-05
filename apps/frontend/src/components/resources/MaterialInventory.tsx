import {useEffect, useState} from 'react';
import {useProject} from '@/contexts/ProjectContext';
import {resourcesApi} from '@/lib/api';
import type {CreateMaterialPayload, MaterialAsset, MaterialCategory} from '@/types/resources';

const MATERIAL_CATEGORIES: MaterialCategory[] = ['Cement', 'Steel', 'Wood', 'Aggregates', 'Bricks', 'Equipment', 'Other'];

export default function MaterialInventory() {
  const {activeProjectId} = useProject();
  const [materials, setMaterials] = useState<MaterialAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<Partial<CreateMaterialPayload>>({
    materialName: '',
    category: 'Cement',
    quantity: 0,
    unit: 'Tons',
    unitPrice: 0,
    supplier: '',
    minimumThreshold: 0,
    orderDate: new Date().toISOString().split('T')[0],
    isEcoFriendly: false,
  });

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
      ? Math.round((materials.filter(m => m.isEcoFriendly).length / materials.length) * 100)
      : 0;
  const inTransitCount = materials.filter(m => m.status === 'In Transit').length;
  const hasLowStock = materials.some(m => m.currentStock < m.minimumThreshold);

  const handleCreateMaterial = async () => {
    if (!activeProjectId || !form.materialName || !form.category || !form.quantity || !form.unitPrice || !form.supplier) {
      setCreateError('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const payload: CreateMaterialPayload = {
        projectId: activeProjectId,
        materialName: form.materialName!,
        category: form.category!,
        quantity: form.quantity!,
        unit: form.unit!,
        unitPrice: form.unitPrice!,
        supplier: form.supplier!,
        minimumThreshold: form.minimumThreshold || 0,
        orderDate: form.orderDate || new Date().toISOString().split('T')[0],
        isEcoFriendly: form.isEcoFriendly || false,
      };

      const res = await resourcesApi.createMaterial(payload);
      setMaterials(prev => [...prev, res.data]);
      setShowCreateModal(false);
      setForm({
        materialName: '',
        category: 'Cement',
        quantity: 0,
        unit: 'Tons',
        unitPrice: 0,
        supplier: '',
        minimumThreshold: 0,
        orderDate: new Date().toISOString().split('T')[0],
        isEcoFriendly: false,
      });
    } catch (err: unknown) {
      console.error('Failed to create material:', err);
      setCreateError((err as { message?: string })?.message || 'Failed to create material');
    } finally {
      setIsCreating(false);
    }
  };

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
          <button
              onClick={() => setShowCreateModal(true)}
              className="bg-secondary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-secondary-dark transition-all flex items-center gap-2 shadow-sm"
          >
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
                <th className="px-6 py-4">Current State</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Supplier ID</th>
                <th className="px-6 py-4">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
            {materials.map((material) => (
                <tr key={material._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-bold text-primary">{material.materialName}</div>
                    <div
                        className="text-[10px] text-slate-400 uppercase font-black tabular-nums">ID: {material._id.slice(-8)}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-slate-500 font-medium">{material.category}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-primary font-black text-base tabular-nums">{material.currentStock}</span>
                      <span
                          className="text-[10px] font-black text-slate-400 uppercase tracking-widest">/ {material.quantity} {material.unit}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        material.status === 'In Stock' ? 'bg-emerald-100 text-emerald-700' :
                            material.status === 'In Transit' ? 'bg-sky-100 text-sky-700' :
                                material.status === 'Delivered' ? 'bg-blue-100 text-blue-700' :
                                    material.status === 'Ordered' ? 'bg-amber-100 text-amber-700' :
                                        material.status === 'Used' ? 'bg-slate-100 text-slate-600' :
                                            'bg-rose-100 text-rose-700'
                    }`}>
                      {material.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-500 font-medium text-xs">
                    {material.supplier
                        ? String(material.supplier).slice(-8) + '...'
                        : '-'}
                  </td>
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

      {/* Create Material Modal */}
      {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
                 onClick={() => setShowCreateModal(false)}/>
            <div
                className="bg-white rounded-[40px] w-full max-w-lg relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="bg-primary p-8 text-white">
                <h3 className="text-2xl font-black tracking-tighter leading-none">New Material</h3>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2">Add to project
                  inventory</p>
              </div>
              <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto">
                {createError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 font-medium">
                      {createError}
                    </div>
                )}

                {/* Material Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Material Name
                    *</label>
                  <input
                      type="text"
                      placeholder="e.g., Portland Cement"
                      className="input-standard w-full h-12"
                      value={form.materialName || ''}
                      onChange={e => setForm(f => ({...f, materialName: e.target.value}))}
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category *</label>
                  <select
                      className="input-standard w-full h-12 cursor-pointer"
                      value={form.category || 'Cement'}
                      onChange={e => setForm(f => ({...f, category: e.target.value as MaterialCategory}))}
                  >
                    {MATERIAL_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity & Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quantity
                      *</label>
                    <input
                        type="number"
                        placeholder="0"
                        className="input-standard w-full h-12"
                        value={form.quantity || ''}
                        onChange={e => setForm(f => ({...f, quantity: Number(e.target.value)}))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit *</label>
                    <select
                        className="input-standard w-full h-12 cursor-pointer"
                        value={form.unit || 'Tons'}
                        onChange={e => setForm(f => ({...f, unit: e.target.value}))}
                    >
                      <option value="Tons">Tons</option>
                      <option value="kg">kg</option>
                      <option value="Units">Units</option>
                      <option value="m³">m³</option>
                      <option value="Liters">Liters</option>
                    </select>
                  </div>
                </div>

                {/* Unit Price */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit Price (LKR)
                    *</label>
                  <input
                      type="number"
                      placeholder="0"
                      className="input-standard w-full h-12"
                      value={form.unitPrice || ''}
                      onChange={e => setForm(f => ({...f, unitPrice: Number(e.target.value)}))}
                  />
                </div>

                {/* Supplier ID */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Supplier ID
                    *</label>
                  <input
                      type="text"
                      placeholder="Supplier ObjectId"
                      className="input-standard w-full h-12"
                      value={form.supplier || ''}
                      onChange={e => setForm(f => ({...f, supplier: e.target.value}))}
                  />
                </div>

                {/* Minimum Threshold */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Minimum
                    Threshold</label>
                  <input
                      type="number"
                      placeholder="0"
                      className="input-standard w-full h-12"
                      value={form.minimumThreshold || ''}
                      onChange={e => setForm(f => ({...f, minimumThreshold: Number(e.target.value)}))}
                  />
                </div>

                {/* Order Date */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Date
                    *</label>
                  <input
                      type="date"
                      className="input-standard w-full h-12 cursor-pointer"
                      value={form.orderDate || ''}
                      onChange={e => setForm(f => ({...f, orderDate: e.target.value}))}
                  />
                </div>

                {/* Eco Friendly Toggle */}
                <div className="flex items-center gap-3">
                  <input
                      type="checkbox"
                      id="isEcoFriendly"
                      className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                      checked={form.isEcoFriendly || false}
                      onChange={e => setForm(f => ({...f, isEcoFriendly: e.target.checked}))}
                  />
                  <label htmlFor="isEcoFriendly" className="text-sm font-medium text-slate-600 cursor-pointer">
                    Eco-Friendly Material
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 py-4 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                      onClick={handleCreateMaterial}
                      disabled={isCreating}
                      className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isCreating ? 'Creating...' : 'Add Material'}
                  </button>
                </div>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}
