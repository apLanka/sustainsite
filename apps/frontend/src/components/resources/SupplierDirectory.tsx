import {useEffect, useState} from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {resourcesApi} from '@/lib/api';
import { canAdminDeleteResource, canManageInventory } from '@/lib/rbac';
import type {CreateSupplierPayload, Supplier, UpdateSupplierPayload} from '@/types/resources';

type FilterState = { preferred: boolean; certified: boolean; material: string };

export default function SupplierDirectory() {
  const { user } = useAuth();
  const canMutate = canManageInventory(user?.role);
  const canDel = canAdminDeleteResource(user?.role);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<Partial<CreateSupplierPayload>>({
    companyName: '', contactPerson: '', email: '', phoneNumber: '',
    address: {}, materialsSupplied: [], isSustainabilityCertified: false,
  });
  const [materialsInput, setMaterialsInput] = useState('');

  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editForm, setEditForm] = useState<UpdateSupplierPayload>({});
  const [isEditing, setIsEditing] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ preferred: false, certified: false, material: '' });

  useEffect(() => {
    resourcesApi.getSuppliers()
      .then(res => setSuppliers(res.data))
      .catch(() => toast.error('Failed to load suppliers'))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredSuppliers = suppliers.filter(s => {
    if (filters.preferred && !s.isPreferred) return false;
    if (filters.certified && !s.isSustainabilityCertified) return false;
    if (filters.material && !s.materialsSupplied.some(m => m.toLowerCase().includes(filters.material.toLowerCase()))) return false;
    return true;
  });

  const handleAddMaterial = () => {
    const t = materialsInput.trim();
    if (t && !form.materialsSupplied?.includes(t)) setForm(f => ({...f, materialsSupplied: [...(f.materialsSupplied || []), t]}));
    setMaterialsInput('');
  };

  const handleCreate = async () => {
    if (!form.companyName || !form.contactPerson || !form.email || !form.phoneNumber) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsCreating(true);
    try {
      const payload: CreateSupplierPayload = {
        companyName: form.companyName!, contactPerson: form.contactPerson!,
        email: form.email!, phoneNumber: form.phoneNumber!,
        address: form.address, materialsSupplied: form.materialsSupplied || [],
        isSustainabilityCertified: form.isSustainabilityCertified || false,
      };
      const res = await resourcesApi.createSupplier(payload);
      setSuppliers(prev => [...prev, res.data]);
      setShowCreateModal(false);
      setForm({ companyName: '', contactPerson: '', email: '', phoneNumber: '', address: {}, materialsSupplied: [], isSustainabilityCertified: false });
      toast.success('Partner added');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? 'Failed to add partner';
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const openEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setEditForm({
      companyName: s.companyName, contactPerson: s.contactPerson,
      email: s.email, phoneNumber: s.phoneNumber,
      materialsSupplied: [...s.materialsSupplied],
      isSustainabilityCertified: s.isSustainabilityCertified,
      isPreferred: s.isPreferred, isActive: s.isActive,
    });
  };

  const handleEdit = async () => {
    if (!editingSupplier) return;
    setIsEditing(true);
    try {
      const res = await resourcesApi.updateSupplier(editingSupplier._id, editForm);
      setSuppliers(prev => prev.map(s => s._id === editingSupplier._id ? res.data : s));
      setEditingSupplier(null);
      toast.success('Partner updated');
    } catch {
      toast.error('Failed to update partner');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await resourcesApi.deleteSupplier(id);
      setSuppliers(prev => prev.filter(s => s._id !== id));
      setDeleteConfirm(null);
      toast.success('Partner removed');
    } catch {
      toast.error('Failed to remove partner');
    }
  };

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success('Email copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-3xl"/>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">{[1,2,3].map(i => <div key={i} className="bg-slate-100 h-64 rounded-[32px]"/>)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-primary uppercase tracking-widest">Global Partners</h3>
          <p className="text-slate-400 text-xs font-bold mt-1">Verified sustainable supply chain network</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowFilters(v => !v)} className={`w-12 h-12 border rounded-2xl transition-all flex items-center justify-center ${showFilters ? 'bg-primary text-white border-primary' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined text-xl">filter_list</span>
          </button>
          {canMutate && (
          <button onClick={() => setShowCreateModal(true)} className="bg-primary text-white px-6 py-3 rounded-2xl text-xs font-bold hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/10">
            <span className="material-symbols-outlined text-sm">person_add</span> Add Partner
          </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-primary" checked={filters.preferred} onChange={e => setFilters(f => ({...f, preferred: e.target.checked}))} />
            Preferred Only
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-primary" checked={filters.certified} onChange={e => setFilters(f => ({...f, certified: e.target.checked}))} />
            Sustainability Certified
          </label>
          <input type="text" placeholder="Filter by material..." className="input-standard h-9 text-xs px-3 min-w-[160px]" value={filters.material} onChange={e => setFilters(f => ({...f, material: e.target.value}))} />
          {(filters.preferred || filters.certified || filters.material) && (
            <button onClick={() => setFilters({ preferred: false, certified: false, material: '' })} className="text-xs font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">close</span> Clear
            </button>
          )}
        </div>
      )}

      {filteredSuppliers.length === 0 ? (
        <div className="py-16 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300">business</span>
          <p className="text-sm text-slate-400 mt-3 font-medium">
            {suppliers.length === 0 ? 'No partners yet' : 'No partners match the current filters'}
          </p>
          {suppliers.length === 0 && canMutate && (
            <button onClick={() => setShowCreateModal(true)} className="mt-4 text-xs font-bold text-emerald-600 hover:underline">
              Add your first partner →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredSuppliers.map(supplier => (
            <div key={supplier._id} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              {supplier.isSustainabilityCertified && (
                <div className="absolute top-0 right-0 p-4">
                  <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200 shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">eco</span> Green Certified
                  </div>
                </div>
              )}
              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-primary font-black text-3xl group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner flex-shrink-0">
                  {supplier.companyName.charAt(0)}
                </div>
                <div className="pt-2 min-w-0">
                  <h4 className="text-primary font-black text-2xl tracking-tight mb-1 truncate">{supplier.companyName}</h4>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest truncate">{supplier.materialsSupplied.join(', ') || '—'}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={`material-symbols-outlined text-sm ${s <= Math.floor(supplier.averageRating) ? 'text-amber-400' : 'text-slate-200'}`}>star</span>
                      ))}
                    </div>
                    <span className="text-primary font-black text-xs tabular-nums">{supplier.averageRating.toFixed(1)}</span>
                    {supplier.isPreferred && <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-widest">Preferred</span>}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">On-Time Delivery</p>
                  <p className="text-primary font-bold text-xs">{supplier.onTimeDeliveryRate}%</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Total Orders</p>
                  <p className="text-emerald-600 font-bold text-xs">{supplier.completedOrders} Completed</p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <span className="material-symbols-outlined text-lg">mail</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                    <p className="text-xs font-bold text-primary truncate">{supplier.email}</p>
                  </div>
                  <button onClick={() => copyEmail(supplier.email)} className="text-slate-300 hover:text-primary transition-colors cursor-pointer" title="Copy email">
                    <span className="material-symbols-outlined text-base">content_copy</span>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <span className="material-symbols-outlined text-lg">call</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                    <p className="text-xs font-bold text-primary">{supplier.phoneNumber}</p>
                  </div>
                </div>
                {(supplier.address?.city || supplier.address?.country) && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <span className="material-symbols-outlined text-lg">location_on</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                      <p className="text-xs font-bold text-primary">
                        {[supplier.address?.city, supplier.address?.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {(canMutate || canDel) && (
              <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                {canMutate && (
                <button onClick={() => openEdit(supplier)} className="flex-1 py-2 text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-600 rounded-xl hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm">edit</span> Edit
                </button>
                )}
                {canDel && (
                <button onClick={() => setDeleteConfirm(supplier._id)} className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
                )}
              </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="bg-white rounded-[40px] w-full max-w-lg relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-primary p-8 text-white">
              <h3 className="text-2xl font-black tracking-tighter leading-none">Add Partner</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2">Register new supplier</p>
            </div>
            <div className="p-10 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company Name *</label>
                <input type="text" placeholder="e.g., BuildRight Supplies" className="input-standard w-full h-12" value={form.companyName || ''} onChange={e => setForm(f => ({...f, companyName: e.target.value}))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Person *</label>
                <input type="text" placeholder="e.g., Kasun Fernando" className="input-standard w-full h-12" value={form.contactPerson || ''} onChange={e => setForm(f => ({...f, contactPerson: e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email *</label>
                  <input type="email" placeholder="contact@company.lk" className="input-standard w-full h-12" value={form.email || ''} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone *</label>
                  <input type="tel" placeholder="+94 71 234 5678" className="input-standard w-full h-12" value={form.phoneNumber || ''} onChange={e => setForm(f => ({...f, phoneNumber: e.target.value}))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">City</label>
                  <input type="text" placeholder="Colombo" className="input-standard w-full h-12" value={form.address?.city || ''} onChange={e => setForm(f => ({...f, address: {...f.address, city: e.target.value}}))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Country</label>
                  <input type="text" placeholder="Sri Lanka" className="input-standard w-full h-12" value={form.address?.country || ''} onChange={e => setForm(f => ({...f, address: {...f.address, country: e.target.value}}))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Materials Supplied</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="e.g., Cement, Steel" className="input-standard flex-1 h-12" value={materialsInput} onChange={e => setMaterialsInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddMaterial())} />
                  <button type="button" onClick={handleAddMaterial} className="px-4 h-12 bg-slate-100 text-primary font-bold rounded-xl hover:bg-slate-200 transition-all">Add</button>
                </div>
                {(form.materialsSupplied ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.materialsSupplied!.map(m => (
                      <span key={m} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1">
                        {m}
                        <button type="button" onClick={() => setForm(f => ({...f, materialsSupplied: f.materialsSupplied?.filter(x => x !== m)}))} className="hover:text-rose-500 cursor-pointer">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isCert" className="w-5 h-5 accent-primary cursor-pointer" checked={form.isSustainabilityCertified || false} onChange={e => setForm(f => ({...f, isSustainabilityCertified: e.target.checked}))} />
                <label htmlFor="isCert" className="text-sm font-medium text-slate-600 cursor-pointer">Sustainability Certified Partner</label>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer">Cancel</button>
                <button onClick={handleCreate} disabled={isCreating} className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60">
                  {isCreating ? 'Adding...' : 'Add Partner'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSupplier && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setEditingSupplier(null)} />
          <div className="bg-white rounded-[40px] w-full max-w-lg relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-primary p-8 text-white">
              <h3 className="text-2xl font-black tracking-tighter leading-none">Edit Partner</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2 truncate">{editingSupplier.companyName}</p>
            </div>
            <div className="p-10 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company Name</label>
                <input type="text" className="input-standard w-full h-12" value={editForm.companyName ?? ''} onChange={e => setEditForm(f => ({...f, companyName: e.target.value}))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Person</label>
                <input type="text" className="input-standard w-full h-12" value={editForm.contactPerson ?? ''} onChange={e => setEditForm(f => ({...f, contactPerson: e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</label>
                  <input type="email" className="input-standard w-full h-12" value={editForm.email ?? ''} onChange={e => setEditForm(f => ({...f, email: e.target.value}))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone</label>
                  <input type="tel" className="input-standard w-full h-12" value={editForm.phoneNumber ?? ''} onChange={e => setEditForm(f => ({...f, phoneNumber: e.target.value}))} />
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-primary" checked={editForm.isSustainabilityCertified ?? false} onChange={e => setEditForm(f => ({...f, isSustainabilityCertified: e.target.checked}))} />
                  Sustainability Certified
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-primary" checked={editForm.isPreferred ?? false} onChange={e => setEditForm(f => ({...f, isPreferred: e.target.checked}))} />
                  Preferred Partner
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-primary" checked={editForm.isActive ?? true} onChange={e => setEditForm(f => ({...f, isActive: e.target.checked}))} />
                  Active
                </label>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setEditingSupplier(null)} className="flex-1 py-4 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer">Cancel</button>
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
              <h3 className="text-xl font-black tracking-tighter">Remove Partner</h3>
              <p className="text-rose-200 text-xs mt-1">This cannot be undone</p>
            </div>
            <div className="p-8 space-y-5">
              <p className="text-sm text-slate-600">Are you sure you want to remove this partner from the directory?</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-[2] py-3 bg-rose-600 text-white font-black rounded-2xl hover:brightness-110 active:scale-95 transition-all">Remove</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
