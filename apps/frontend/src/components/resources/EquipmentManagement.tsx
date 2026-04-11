import {useEffect, useState} from 'react';
import { toast } from 'sonner';
import {useProject} from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import {resourcesApi} from '@/lib/api';
import { canAdminDeleteResource, canManageInventory } from '@/lib/rbac';
import type {CreateEquipmentPayload, EquipmentAsset, EquipmentType, UpdateEquipmentPayload} from '@/types/resources';
import type {StatusType} from '@/components/common/StatusBadge';
import StatusBadge from '@/components/common/StatusBadge';

const EQUIPMENT_TYPES: EquipmentType[] = ['Excavator', 'Crane', 'Bulldozer', 'Mixer', 'Loader', 'Other'];

const emptyForm: Partial<CreateEquipmentPayload> = {
  equipmentName: '', equipmentType: 'Other', serialNumber: '', assetId: '',
  manufacturer: '', equipmentModel: '', currentLocation: '', notes: '',
};

export default function EquipmentManagement() {
  const { user } = useAuth();
  const {activeProjectId} = useProject();
  const canMutate = canManageInventory(user?.role);
  const canDel = canAdminDeleteResource(user?.role);
  const [equipment, setEquipment] = useState<EquipmentAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<Partial<CreateEquipmentPayload>>({ ...emptyForm });

  const [editingEquipment, setEditingEquipment] = useState<EquipmentAsset | null>(null);
  const [editForm, setEditForm] = useState<UpdateEquipmentPayload>({});
  const [isEditing, setIsEditing] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [showMaintenanceModal, setShowMaintenanceModal] = useState<EquipmentAsset | null>(null);
  const [isLoggingMaintenance, setIsLoggingMaintenance] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    maintenanceDate: new Date().toISOString().split('T')[0],
    maintenanceType: 'Routine' as 'Routine' | 'Repair' | 'Overhaul',
    description: '',
    cost: 0,
    nextMaintenanceDate: '',
  });

  useEffect(() => {
    if (!activeProjectId) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await resourcesApi.getEquipment(activeProjectId);
        setEquipment(res.data);
      } catch {
        toast.error('Failed to load equipment');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [activeProjectId]);

  const handleCreate = async () => {
    if (!form.equipmentName || !form.equipmentType) {
      toast.error('Equipment name and type are required');
      return;
    }
    setIsCreating(true);
    try {
      const payload: CreateEquipmentPayload = {
        equipmentName: form.equipmentName!,
        equipmentType: form.equipmentType!,
        serialNumber: form.serialNumber,
        assetId: form.assetId,
        manufacturer: form.manufacturer,
        equipmentModel: form.equipmentModel,
        yearOfManufacture: form.yearOfManufacture,
        purchasePrice: form.purchasePrice,
        currentValue: form.currentValue,
        depreciationRate: form.depreciationRate,
        rentalRatePerDay: form.rentalRatePerDay,
        currentLocation: form.currentLocation,
        notes: form.notes,
      };
      // Include projectId in the request body so backend can assign it
      const res = await resourcesApi.createEquipment({ ...payload, currentProjectId: activeProjectId } as CreateEquipmentPayload & { currentProjectId?: string });
      setEquipment(prev => [...prev, res.data]);
      setShowCreateModal(false);
      setForm({ ...emptyForm });
      toast.success('Equipment registered');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })
        ?.response?.data?.message ?? 'Failed to register equipment';
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const openEdit = (item: EquipmentAsset) => {
    setEditingEquipment(item);
    setEditForm({
      equipmentName: item.equipmentName,
      equipmentType: item.equipmentType,
      serialNumber: item.serialNumber,
      status: item.status,
      currentLocation: item.currentLocation,
      notes: item.notes,
      nextScheduledMaintenance: item.nextScheduledMaintenance?.slice(0, 10) ?? '',
    });
  };

  const handleEdit = async () => {
    if (!editingEquipment) return;
    setIsEditing(true);
    try {
      const res = await resourcesApi.updateEquipment(editingEquipment._id, editForm);
      setEquipment(prev => prev.map(e => e._id === editingEquipment._id ? res.data : e));
      setEditingEquipment(null);
      toast.success('Equipment updated');
    } catch {
      toast.error('Failed to update equipment');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await resourcesApi.deleteEquipment(id);
      setEquipment(prev => prev.filter(e => e._id !== id));
      setDeleteConfirm(null);
      toast.success('Equipment removed');
    } catch {
      toast.error('Failed to delete equipment');
    }
  };

  const handleAssign = async (item: EquipmentAsset) => {
    if (!activeProjectId) return;
    try {
      const res = await resourcesApi.assignEquipment(item._id, { projectId: activeProjectId });
      setEquipment(prev => prev.map(e => e._id === item._id ? res.data : e));
      toast.success('Equipment assigned to project');
    } catch {
      toast.error('Failed to assign equipment');
    }
  };

  const handleLogMaintenance = async () => {
    if (!showMaintenanceModal) return;
    setIsLoggingMaintenance(true);
    try {
      const res = await resourcesApi.addMaintenance(showMaintenanceModal._id, maintenanceForm);
      setEquipment(prev => prev.map(e => e._id === showMaintenanceModal._id ? res.data : e));
      setShowMaintenanceModal(null);
      toast.success('Maintenance logged');
    } catch {
      toast.error('Failed to log maintenance');
    } finally {
      setIsLoggingMaintenance(false);
    }
  };

  if (!activeProjectId) {
    return <div className="flex items-center justify-center h-64 text-slate-400"><p className="text-sm">Select a project to view equipment</p></div>;
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-3xl"/>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{[1,2,3].map(i => <div key={i} className="bg-slate-100 h-64 rounded-[32px]"/>)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-primary uppercase tracking-widest">Fleet Operations</h3>
          <p className="text-slate-400 text-xs font-bold mt-1">Real-time tracking and maintenance scheduling</p>
        </div>
        {canMutate && (
        <button onClick={() => setShowCreateModal(true)} className="bg-primary text-white px-6 py-3 rounded-2xl text-xs font-bold hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/10">
          <span className="material-symbols-outlined text-sm">add</span> Register Asset
        </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {equipment.map(item => (
          <div key={item._id} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -z-10 group-hover:bg-primary/5 transition-colors"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <span className="material-symbols-outlined text-2xl">
                  {item.equipmentType === 'Crane' ? 'construction' : item.equipmentType === 'Loader' ? 'forklift' : 'precision_manufacturing'}
                </span>
              </div>
              <StatusBadge status={item.status as StatusType} />
            </div>
            <div className="mb-6">
              <h4 className="text-primary font-black text-xl mb-1 tracking-tight">{item.equipmentName}</h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{item.equipmentType}</span>
                {item.serialNumber && <span className="text-[10px] text-slate-400 font-bold tabular-nums">#{item.serialNumber}</span>}
              </div>
            </div>
            <div className="space-y-4 mb-6">
              <div className="bg-slate-50/50 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Last Service</span>
                  <span className="text-primary">{item.lastMaintenanceDate ? new Date(item.lastMaintenanceDate).toLocaleDateString() : '—'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Next Service</span>
                  <span className={item.nextScheduledMaintenance && new Date(item.nextScheduledMaintenance).getTime() < Date.now() + 1000 * 60 * 60 * 24 * 30 ? 'text-rose-500' : 'text-emerald-600'}>
                    {item.nextScheduledMaintenance ? new Date(item.nextScheduledMaintenance).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            </div>
            {(canMutate || canDel) && (
            <div className="flex items-center gap-2 flex-wrap">
              {canMutate && (
              <button onClick={() => openEdit(item)} className="flex-1 py-2 text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-600 rounded-xl hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">edit</span> Edit
              </button>
              )}
              {canMutate && (
              <button onClick={() => { setShowMaintenanceModal(item); }} className="flex-1 py-2 text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition-all flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">build</span> Service
              </button>
              )}
              {canMutate && item.status === 'Available' && activeProjectId && item.currentProjectId !== activeProjectId && (
                <button onClick={() => handleAssign(item)} className="flex-1 py-2 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm">link</span> Assign
                </button>
              )}
              {canDel && (
              <button onClick={() => setDeleteConfirm(item._id)} className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
              )}
            </div>
            )}
          </div>
        ))}

        {canMutate && (
        <button onClick={() => setShowCreateModal(true)} className="border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 group hover:border-primary/30 hover:bg-slate-50/50 transition-all">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500">
            <span className="material-symbols-outlined text-3xl">add</span>
          </div>
          <div className="text-center">
            <p className="font-black text-primary uppercase tracking-widest text-xs">Add New Asset</p>
            <p className="text-slate-400 text-[10px] mt-1 font-bold">Register heavy machinery or transport vehicles</p>
          </div>
        </button>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="bg-white rounded-[40px] w-full max-w-lg relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-primary p-8 text-white">
              <h3 className="text-2xl font-black tracking-tighter leading-none">Register Equipment</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2">Add asset to fleet</p>
            </div>
            <div className="p-10 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Equipment Name *</label>
                <input type="text" placeholder="e.g., CAT Excavator 320" className="input-standard w-full h-12" value={form.equipmentName || ''} onChange={e => setForm(f => ({...f, equipmentName: e.target.value}))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Equipment Type *</label>
                <select className="input-standard w-full h-12 cursor-pointer" value={form.equipmentType || 'Other'} onChange={e => setForm(f => ({...f, equipmentType: e.target.value as EquipmentType}))}>
                  {EQUIPMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Serial Number</label>
                  <input type="text" placeholder="SN-12345" className="input-standard w-full h-12" value={form.serialNumber || ''} onChange={e => setForm(f => ({...f, serialNumber: e.target.value}))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Asset ID</label>
                  <input type="text" placeholder="AST-001" className="input-standard w-full h-12" value={form.assetId || ''} onChange={e => setForm(f => ({...f, assetId: e.target.value}))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Manufacturer</label>
                  <input type="text" placeholder="e.g., Caterpillar" className="input-standard w-full h-12" value={form.manufacturer || ''} onChange={e => setForm(f => ({...f, manufacturer: e.target.value}))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Model</label>
                  <input type="text" placeholder="e.g., 320D2" className="input-standard w-full h-12" value={form.equipmentModel || ''} onChange={e => setForm(f => ({...f, equipmentModel: e.target.value}))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Purchase Price</label>
                  <input type="number" placeholder="0" className="input-standard w-full h-12" value={form.purchasePrice || ''} onChange={e => setForm(f => ({...f, purchasePrice: Number(e.target.value)}))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rental Rate/Day</label>
                  <input type="number" placeholder="0" className="input-standard w-full h-12" value={form.rentalRatePerDay || ''} onChange={e => setForm(f => ({...f, rentalRatePerDay: Number(e.target.value)}))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Location</label>
                <input type="text" placeholder="e.g., Site A - Zone 3" className="input-standard w-full h-12" value={form.currentLocation || ''} onChange={e => setForm(f => ({...f, currentLocation: e.target.value}))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes</label>
                <textarea placeholder="Additional notes..." className="input-standard w-full h-20 resize-none" value={form.notes || ''} onChange={e => setForm(f => ({...f, notes: e.target.value}))} />
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer">Cancel</button>
                <button onClick={handleCreate} disabled={isCreating} className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60">
                  {isCreating ? 'Registering...' : 'Register Equipment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingEquipment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setEditingEquipment(null)} />
          <div className="bg-white rounded-[40px] w-full max-w-lg relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-primary p-8 text-white">
              <h3 className="text-2xl font-black tracking-tighter leading-none">Edit Equipment</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2 truncate">{editingEquipment.equipmentName}</p>
            </div>
            <div className="p-10 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Equipment Name</label>
                <input type="text" className="input-standard w-full h-12" value={editForm.equipmentName ?? ''} onChange={e => setEditForm(f => ({...f, equipmentName: e.target.value}))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
                <select className="input-standard w-full h-12 cursor-pointer" value={editForm.status ?? ''} onChange={e => setEditForm(f => ({...f, status: e.target.value as EquipmentAsset['status']}))}>
                  {['Available','In Use','Under Maintenance','Damaged','Retired'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Location</label>
                <input type="text" className="input-standard w-full h-12" value={editForm.currentLocation ?? ''} onChange={e => setEditForm(f => ({...f, currentLocation: e.target.value}))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Maintenance Date</label>
                <input type="date" className="input-standard w-full h-12 cursor-pointer" value={editForm.nextScheduledMaintenance ?? ''} onChange={e => setEditForm(f => ({...f, nextScheduledMaintenance: e.target.value}))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes</label>
                <textarea className="input-standard w-full h-20 resize-none" value={editForm.notes ?? ''} onChange={e => setEditForm(f => ({...f, notes: e.target.value}))} />
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setEditingEquipment(null)} className="flex-1 py-4 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer">Cancel</button>
                <button onClick={handleEdit} disabled={isEditing} className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60">
                  {isEditing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setShowMaintenanceModal(null)} />
          <div className="bg-white rounded-[40px] w-full max-w-md relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-amber-600 p-8 text-white">
              <h3 className="text-2xl font-black tracking-tighter leading-none">Log Maintenance</h3>
              <p className="text-amber-200 text-xs font-bold uppercase tracking-widest mt-2 truncate">{showMaintenanceModal.equipmentName}</p>
            </div>
            <div className="p-10 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</label>
                  <input type="date" className="input-standard w-full h-12 cursor-pointer" value={maintenanceForm.maintenanceDate} onChange={e => setMaintenanceForm(f => ({...f, maintenanceDate: e.target.value}))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</label>
                  <select className="input-standard w-full h-12 cursor-pointer" value={maintenanceForm.maintenanceType} onChange={e => setMaintenanceForm(f => ({...f, maintenanceType: e.target.value as 'Routine' | 'Repair' | 'Overhaul'}))}>
                    <option value="Routine">Routine</option>
                    <option value="Repair">Repair</option>
                    <option value="Overhaul">Overhaul</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                <textarea rows={2} className="input-standard w-full resize-none" placeholder="Describe the maintenance work..." value={maintenanceForm.description} onChange={e => setMaintenanceForm(f => ({...f, description: e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cost (LKR)</label>
                  <input type="number" className="input-standard w-full h-12" value={maintenanceForm.cost || ''} onChange={e => setMaintenanceForm(f => ({...f, cost: Number(e.target.value)}))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Maintenance</label>
                  <input type="date" className="input-standard w-full h-12 cursor-pointer" value={maintenanceForm.nextMaintenanceDate} onChange={e => setMaintenanceForm(f => ({...f, nextMaintenanceDate: e.target.value}))} />
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <button onClick={() => setShowMaintenanceModal(null)} disabled={isLoggingMaintenance} className="flex-1 py-4 bg-slate-100 text-primary font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer disabled:opacity-50">Cancel</button>
                <button onClick={handleLogMaintenance} disabled={isLoggingMaintenance} className="flex-[2] py-4 bg-amber-600 text-white font-black rounded-2xl hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60">
                  {isLoggingMaintenance ? 'Logging…' : 'Log Maintenance'}
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
              <h3 className="text-xl font-black tracking-tighter">Remove Equipment</h3>
              <p className="text-rose-200 text-xs mt-1">This cannot be undone</p>
            </div>
            <div className="p-8 space-y-5">
              <p className="text-sm text-slate-600">Are you sure you want to remove this equipment from the fleet?</p>
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
