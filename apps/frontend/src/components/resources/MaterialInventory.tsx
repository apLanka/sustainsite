import {useEffect, useState} from 'react';
import { toast } from 'sonner';
import {useProject} from '@/contexts/ProjectContext';
import {resourcesApi} from '@/lib/api';
import type {CreateMaterialPayload, MaterialAsset, MaterialCategory, Supplier, UpdateMaterialPayload} from '@/types/resources';

const MATERIAL_CATEGORIES: MaterialCategory[] = ['Cement', 'Steel', 'Wood', 'Aggregates', 'Bricks', 'Equipment', 'Other'];

const emptyForm: Partial<CreateMaterialPayload> = {
  materialName: '', category: 'Cement', quantity: 0, unit: 'Tons',
  unitPrice: 0, supplier: '', minimumThreshold: 0,
  orderDate: new Date().toISOString().split('T')[0], isEcoFriendly: false,
};

export default function MaterialInventory() {
  const {activeProjectId} = useProject();
  const [materials, setMaterials] = useState<MaterialAsset[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<Partial<CreateMaterialPayload>>({ ...emptyForm });

  const [editingMaterial, setEditingMaterial] = useState<MaterialAsset | null>(null);
  const [editForm, setEditForm] = useState<UpdateMaterialPayload>({});
  const [isEditing, setIsEditing] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProjectId) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const [matRes, supRes] = await Promise.allSettled([
          resourcesApi.getMaterials(activeProjectId),
          resourcesApi.getSuppliers(),
        ]);
        if (matRes.status === 'fulfilled') {
          setMaterials(matRes.value.data);
        } else {
          toast.error('Failed to load materials');
        }
        if (supRes.status === 'fulfilled') {
          setSuppliers(supRes.value.data);
        }
      } catch {
        toast.error('Failed to load materials');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [activeProjectId]);

  const supplierName = (id: string) => {
    const s = suppliers.find(s => s._id === id);
    return s ? s.companyName : id ? `...${id.slice(-6)}` : '—';
  };

  const totalUnits = materials.reduce((sum, m) => sum + m.quantity, 0);
  const greenScore = materials.length > 0
    ? Math.round((materials.filter(m => m.isEcoFriendly).length / materials.length) * 100)
    : 0;
  const inTransitCount = materials.filter(m => m.status === 'In Transit').length;
  const hasLowStock = materials.some(m => m.currentStock < m.minimumThreshold);

  const handleCreate = async () => {
    if (!activeProjectId || !form.materialName || !form.category || !form.quantity || !form.unitPrice || !form.supplier) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsCreating(true);
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
      setForm({ ...emptyForm });
      toast.success('Material added to inventory');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })
        ?.response?.data?.message ?? 'Failed to create material';
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const openEdit = (m: MaterialAsset) => {
    setEditingMaterial(m);
    setEditForm({
      materialName: m.materialName,
      category: m.category,
      quantity: m.quantity,
      unit: m.unit,
      unitPrice: m.unitPrice,
      minimumThreshold: m.minimumThreshold,
      status: m.status,
      isEcoFriendly: m.isEcoFriendly,
    });
  };

  const handleEdit = async () => {
    if (!editingMaterial) return;
    setIsEditing(true);
    try {
      const res = await resourcesApi.updateMaterial(editingMaterial._id, editForm);
      setMaterials(prev => prev.map(m => m._id === editingMaterial._id ? res.data : m));
      setEditingMaterial(null);
      toast.success('Material updated');
    } catch {
      toast.error('Failed to update material');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await resourcesApi.deleteMaterial(id);
      setMaterials(prev => prev.filter(m => m._id !== id));
      setDeleteConfirm(null);
      toast.success('Material deleted');
    } catch {
      toast.error('Failed to delete material');
    }
  };

  if (!activeProjectId) {
    return <div className="flex items-center justify-center h-64 text-slate-400"><p className="text-sm">Select a project to view materials</p></div>;
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="bg-slate-100 h-32 rounded-3xl"/>)}</div>
        <div className="bg-slate-100 h-64 rounded-3xl"/>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {hasLowStock && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-700">
          <span className="material-symbols-outlined text-rose-500">warning</span>
          <div>
            <p className="font-bold text-sm">Critical Stock Alert</p>
            <p className="text-xs opacity-80">Some materials are below minimum thresholds. Immediate procurement recommended.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary"><span className="material-symbols-outlined text-xl">inventory_2</span></div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Inventory</p>
          </div>
          <h3 className="text-3xl font-black text-primary tracking-tighter">{totalUnits} <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Total Units</span></h3>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><span className="material-symbols-outlined text-xl">eco</span></div>
            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Sustainability</p>
          </div>
          <h3 className="text-3xl font-black text-emerald-600 tracking-tighter">{greenScore}% <span className="text-emerald-400 text-sm font-bold uppercase tracking-widest">Green Score</span></h3>
        </div>
        <div className="bg-primary text-white p-6 rounded-3xl shadow-lg ring-4 ring-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white"><span className="material-symbols-outlined text-xl">local_shipping</span></div>
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Logistics</p>
          </div>
          <h3 className="text-3xl font-black text-white tracking-tighter">{String(inTransitCount).padStart(2,'0')} <span className="text-white/40 text-sm font-bold uppercase tracking-widest">In Transit</span></h3>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-primary font-black uppercase tracking-widest text-xs">Material Ledger</h4>
          <button onClick={() => setShowCreateModal(true)} className="bg-secondary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-secondary-dark transition-all flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-sm">add</span> New Material
          </button>
        </div>
        <div className="overflow-x-auto">
          {materials.length === 0 ? (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-300">inventory_2</span>
              <p className="text-sm text-slate-400 mt-2">No materials yet</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-4">Material</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {materials.map(m => (
                  <tr key={m._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-primary">{m.materialName}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-black tabular-nums">ID: {m._id.slice(-8)}</div>
                    </td>
                    <td className="px-6 py-5 text-slate-500 font-medium">{m.category}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-base font-black tabular-nums ${m.currentStock < m.minimumThreshold ? 'text-rose-600' : 'text-primary'}`}>{m.currentStock}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">/ {m.quantity} {m.unit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        m.status === 'In Stock' ? 'bg-emerald-100 text-emerald-700' :
                        m.status === 'In Transit' ? 'bg-sky-100 text-sky-700' :
                        m.status === 'Delivered' ? 'bg-blue-100 text-blue-700' :
                        m.status === 'Ordered' ? 'bg-amber-100 text-amber-700' :
                        m.status === 'Used' ? 'bg-slate-100 text-slate-600' : 'bg-rose-100 text-rose-700'
                      }`}>{m.status}</span>
                    </td>
                    <td className="px-6 py-5 text-slate-500 font-medium text-xs">{supplierName(m.supplier)}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(m)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all flex items-center justify-center" title="Edit">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onClick={() => setDeleteConfirm(m._id)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center" title="Delete">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="bg-white rounded-[40px] w-full max-w-lg relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-primary p-8 text-white">
              <h3 className="text-2xl font-black tracking-tighter leading-none">New Material</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2">Add to project inventory</p>
            </div>
            <div className="p-10 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Material Name *</label>
                <input type="text" placeholder="e.g., Portland Cement" className="input-standard w-full h-12" value={form.materialName || ''} onChange={e => setForm(f => ({...f, materialName: e.target.value}))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category *</label>
                <select className="input-standard w-full h-12 cursor-pointer" value={form.category || 'Cement'} onChange={e => setForm(f => ({...f, category: e.target.value as MaterialCategory}))}>
                  {MATERIAL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quantity *</label>
                  <input type="number" placeholder="0" className="input-standard w-full h-12" value={form.quantity || ''} onChange={e => setForm(f => ({...f, quantity: Number(e.target.value)}))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit *</label>
                  <select className="input-standard w-full h-12 cursor-pointer" value={form.unit || 'Tons'} onChange={e => setForm(f => ({...f, unit: e.target.value}))}>
                    {['Tons','kg','Units','m³','Liters'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit Price (LKR) *</label>
                <input type="number" placeholder="0" className="input-standard w-full h-12" value={form.unitPrice || ''} onChange={e => setForm(f => ({...f, unitPrice: Number(e.target.value)}))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Supplier *</label>
                {suppliers.length > 0 ? (
                  <select className="input-standard w-full h-12 cursor-pointer" value={form.supplier || ''} onChange={e => setForm(f => ({...f, supplier: e.target.value}))}>
                    <option value="">Select supplier...</option>
                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.companyName}</option>)}
                  </select>
                ) : (
                  <input type="text" placeholder="Supplier ID" className="input-standard w-full h-12" value={form.supplier || ''} onChange={e => setForm(f => ({...f, supplier: e.target.value}))} />
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Minimum Threshold</label>
                <input type="number" placeholder="0" className="input-standard w-full h-12" value={form.minimumThreshold || ''} onChange={e => setForm(f => ({...f, minimumThreshold: Number(e.target.value)}))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Date *</label>
                <input type="date" className="input-standard w-full h-12 cursor-pointer" value={form.orderDate || ''} onChange={e => setForm(f => ({...f, orderDate: e.target.value}))} />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isEcoFriendly" className="w-5 h-5 accent-primary cursor-pointer" checked={form.isEcoFriendly || false} onChange={e => setForm(f => ({...f, isEcoFriendly: e.target.checked}))} />
                <label htmlFor="isEcoFriendly" className="text-sm font-medium text-slate-600 cursor-pointer">Eco-Friendly Material</label>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer">Cancel</button>
                <button onClick={handleCreate} disabled={isCreating} className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60">
                  {isCreating ? 'Creating...' : 'Add Material'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingMaterial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setEditingMaterial(null)} />
          <div className="bg-white rounded-[40px] w-full max-w-lg relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-primary p-8 text-white">
              <h3 className="text-2xl font-black tracking-tighter leading-none">Edit Material</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2 truncate">{editingMaterial.materialName}</p>
            </div>
            <div className="p-10 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Material Name</label>
                <input type="text" className="input-standard w-full h-12" value={editForm.materialName ?? ''} onChange={e => setEditForm(f => ({...f, materialName: e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quantity</label>
                  <input type="number" className="input-standard w-full h-12" value={editForm.quantity ?? ''} onChange={e => setEditForm(f => ({...f, quantity: Number(e.target.value)}))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit Price</label>
                  <input type="number" className="input-standard w-full h-12" value={editForm.unitPrice ?? ''} onChange={e => setEditForm(f => ({...f, unitPrice: Number(e.target.value)}))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
                <select className="input-standard w-full h-12 cursor-pointer" value={editForm.status ?? ''} onChange={e => setEditForm(f => ({...f, status: e.target.value as MaterialAsset['status']}))}>
                  {['Ordered','In Transit','Delivered','In Stock','Used','Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Minimum Threshold</label>
                <input type="number" className="input-standard w-full h-12" value={editForm.minimumThreshold ?? ''} onChange={e => setEditForm(f => ({...f, minimumThreshold: Number(e.target.value)}))} />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="editEco" className="w-5 h-5 accent-primary cursor-pointer" checked={editForm.isEcoFriendly ?? false} onChange={e => setEditForm(f => ({...f, isEcoFriendly: e.target.checked}))} />
                <label htmlFor="editEco" className="text-sm font-medium text-slate-600 cursor-pointer">Eco-Friendly</label>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setEditingMaterial(null)} className="flex-1 py-4 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer">Cancel</button>
                <button onClick={handleEdit} disabled={isEditing} className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60">
                  {isEditing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="bg-white rounded-[32px] w-full max-w-sm relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-rose-600 p-8 text-white">
              <h3 className="text-xl font-black tracking-tighter">Delete Material</h3>
              <p className="text-rose-200 text-xs mt-1">This cannot be undone</p>
            </div>
            <div className="p-8 space-y-5">
              <p className="text-sm text-slate-600">Are you sure you want to remove this material from inventory?</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-[2] py-3 bg-rose-600 text-white font-black rounded-2xl hover:brightness-110 active:scale-95 transition-all">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
