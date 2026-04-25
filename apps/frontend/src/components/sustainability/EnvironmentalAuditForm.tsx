import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { sustainabilityApi } from '@/lib/api';
const EnvironmentalAuditForm = () => {
  const { id: projectId } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    recordedDate: new Date().toISOString().split('T')[0],
    carbonTransportation: 0,
    carbonEquipment: 0,
    carbonMaterials: 0,
    electricity: 0,
    diesel: 0,
    renewableOffset: 0,
    waterConsumption: 0,
    waterRecycled: 0,
    recyclableWaste: 0,
    nonRecyclableWaste: 0,
    hazardousWaste: 0,
    notes: '',
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    setIsSubmitting(true);
    try {
      await sustainabilityApi.createMetric({
        projectId,
        carbonEmissions: {
          transportation: Number(form.carbonTransportation) || 0,
          equipment: Number(form.carbonEquipment) || 0,
          materials: Number(form.carbonMaterials) || 0,
        },
        energyConsumption: {
          electricity: Number(form.electricity) || 0,
          diesel: Number(form.diesel) || 0,
          renewableEnergy: Number(form.renewableOffset) || 0,
        },
        wasteManagement: {
          recyclable: Number(form.recyclableWaste) || 0,
          nonRecyclable: Number(form.nonRecyclableWaste) || 0,
          hazardous: Number(form.hazardousWaste) || 0,
        },
        waterUsage: {
          municipal: Number(form.waterConsumption) || 0,
          recycled: Number(form.waterRecycled) || 0,
        },
        recordedDate: form.recordedDate,
        notes: form.notes || undefined,
      });
      toast.success('Environmental audit submitted successfully');
      navigate(`/projects/${projectId}/sustainability`);
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
        )?.response?.data?.message ||
        (
          err as {
            message?: string;
          }
        )?.message ||
        'Failed to submit audit';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };
  const update = (field: string, value: number | string) =>
    setForm((f) => ({ ...f, [field]: value }));
  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <span
            className="material-symbols-outlined text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            fact_check
          </span>
          <h3 className="text-sm font-bold text-primary font-headline uppercase tracking-widest">
            Audit Context
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Project Assignment (Locked)
            </label>
            <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-500 cursor-not-allowed flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">lock</span>
              {projectId ? `Project ID: …${projectId.slice(-8)}` : 'No project selected'}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Audit Date (ISO)
            </label>
            <input
              type="date"
              value={form.recordedDate}
              onChange={(e) => update('recordedDate', e.target.value)}
              className="input-standard w-full h-12 cursor-pointer"
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <span
            className="material-symbols-outlined text-rose-600"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            co2
          </span>
          <h3 className="text-sm font-bold text-primary font-headline uppercase tracking-widest">
            Carbon Emissions (tCO2e)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Transportation
            </label>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              className="input-standard w-full h-12"
              value={form.carbonTransportation || ''}
              onChange={(e) => update('carbonTransportation', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Equipment
            </label>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              className="input-standard w-full h-12"
              value={form.carbonEquipment || ''}
              onChange={(e) => update('carbonEquipment', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Materials
            </label>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              className="input-standard w-full h-12"
              value={form.carbonMaterials || ''}
              onChange={(e) => update('carbonMaterials', Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <span
            className="material-symbols-outlined text-amber-600"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bolt
          </span>
          <h3 className="text-sm font-bold text-primary font-headline uppercase tracking-widest">
            Energy Profile
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Electricity (kWh)
            </label>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              className="input-standard w-full h-12"
              value={form.electricity || ''}
              onChange={(e) => update('electricity', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Diesel / Fuel (Liters)
            </label>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              className="input-standard w-full h-12"
              value={form.diesel || ''}
              onChange={(e) => update('diesel', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Renewable Offset (%)
            </label>
            <input
              type="number"
              placeholder="0"
              min="0"
              max="100"
              className="input-standard w-full h-12"
              value={form.renewableOffset || ''}
              onChange={(e) => update('renewableOffset', Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <span
            className="material-symbols-outlined text-blue-600"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            water_drop
          </span>
          <h3 className="text-sm font-bold text-primary font-headline uppercase tracking-widest">
            Environmental Resource Management
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Municipal Water (Liters)
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="0.00"
                min="0"
                className="input-standard w-full h-12"
                value={form.waterConsumption || ''}
                onChange={(e) => update('waterConsumption', Number(e.target.value))}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">
                LITERS
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Recycled Water (Liters)
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="0.00"
                min="0"
                className="input-standard w-full h-12"
                value={form.waterRecycled || ''}
                onChange={(e) => update('waterRecycled', Number(e.target.value))}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">
                LITERS
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Recyclable Waste (kg)
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="0.00"
                min="0"
                className="input-standard w-full h-12"
                value={form.recyclableWaste || ''}
                onChange={(e) => update('recyclableWaste', Number(e.target.value))}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">
                KG
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Non-Recyclable Waste (kg)
            </label>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              className="input-standard w-full h-12"
              value={form.nonRecyclableWaste || ''}
              onChange={(e) => update('nonRecyclableWaste', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Hazardous Materials (kg)
            </label>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              className="input-standard w-full h-12"
              value={form.hazardousWaste || ''}
              onChange={(e) => update('hazardousWaste', Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
          Inspector Observations & Mitigation Notes
        </label>
        <textarea
          placeholder="Describe any anomalies or mitigation efforts taken during this audit cycle..."
          rows={5}
          className="input-standard w-full resize-none h-40"
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
        />
      </section>

      <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-slate-100">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-primary text-white font-bold py-4 rounded-xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all font-headline tracking-widest uppercase text-xs cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? 'Submitting...' : 'Verify & Submit Audit'}
        </button>
        <button
          type="button"
          onClick={() => navigate(`/projects/${projectId}/sustainability`)}
          className="px-10 py-4 bg-surface-container-low text-primary font-bold rounded-xl hover:bg-slate-200 transition-all font-headline tracking-widest uppercase text-xs cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
export default EnvironmentalAuditForm;
