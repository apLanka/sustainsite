import {useEffect, useState} from 'react';
import {useProject} from '@/contexts/ProjectContext';
import {resourcesApi} from '@/lib/api';
import type {EquipmentAsset} from '@/types/resources';
import type {StatusType} from '@/components/common/StatusBadge';
import StatusBadge from '@/components/common/StatusBadge';

export default function EquipmentManagement() {
  const {activeProjectId} = useProject();
  const [equipment, setEquipment] = useState<EquipmentAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProjectId) return;

    const fetchEquipment = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await resourcesApi.getEquipment(activeProjectId);
        setEquipment(res.data);
      } catch (err) {
        console.error('Failed to load equipment:', err);
        setError('Failed to load equipment');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEquipment();
  }, [activeProjectId]);

  const availableCount = equipment.filter(e => e.status === 'Available').length;
  const inUseCount = equipment.filter(e => e.status === 'In Use').length;
  const maintenanceCount = equipment.filter(e => e.status === 'Under Maintenance').length;

  if (!activeProjectId) {
    return (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <p className="text-sm">Select a project to view equipment</p>
        </div>
    );
  }

  if (isLoading) {
    return (
        <div className="space-y-8 animate-pulse">
          <div className="h-20 bg-slate-100 rounded-3xl"/>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-100 h-64 rounded-[32px]"/>
            ))}
          </div>
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-primary uppercase tracking-widest">Fleet Operations</h3>
          <p className="text-slate-400 text-xs font-bold mt-1">Real-time tracking and maintenance scheduling</p>
        </div>
        <button className="bg-primary text-white px-6 py-3 rounded-2xl text-xs font-bold hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/10">
          <span className="material-symbols-outlined text-sm font-bold">add</span>
          Register Asset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {equipment.map((item) => (
          <div key={item.id} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            {/* Background Accent */}
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
                <span
                    className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{item.equipmentType}</span>
                <span className="text-[10px] text-slate-400 font-bold tabular-nums">#{item.serialNumber}</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-slate-50/50 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Previous Service</span>
                  <span className="text-primary">{item.lastMaintenanceDate}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Next Service</span>
                  <span className={
                    new Date(item.nextScheduledMaintenance || '').getTime() < new Date().getTime() + 1000 * 60 * 60 * 24 * 30
                    ? 'text-rose-500 underline underline-offset-4' : 'text-emerald-600'
                  }>
                    {item.nextScheduledMaintenance}
                  </span>
                </div>
              </div>

              {item.assignedTo && (
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-sm">person</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned To</p>
                    <p className="text-xs font-bold text-primary">{item.assignedTo}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-auto">
              <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors shadow-lg shadow-slate-900/10">
                Operations Log
              </button>
              <button className="w-12 h-12 border border-slate-100 rounded-xl text-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">settings</span>
              </button>
            </div>
          </div>
        ))}

        {/* Action Card */}
        <button className="border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 group hover:border-primary/30 hover:bg-slate-50/50 transition-all">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500">
            <span className="material-symbols-outlined text-3xl">add</span>
          </div>
          <div className="text-center">
            <p className="font-black text-primary uppercase tracking-widest text-xs">Add New Asset</p>
            <p className="text-slate-400 text-[10px] mt-1 font-bold">Register heavy machinery or transport vehicles</p>
          </div>
        </button>
      </div>
    </div>
  );
}

