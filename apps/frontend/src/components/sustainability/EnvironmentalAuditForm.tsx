import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {sustainabilityApi} from '@/lib/api';

const EnvironmentalAuditForm = () => {
  const {id: projectId} = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    recordedDate: new Date().toISOString().split('T')[0],
    electricity: 0,
    diesel: 0,
    renewableOffset: 0,
    waterConsumption: 0,
    recyclableWaste: 0,
    nonRecyclableWaste: 0,
    hazardousWaste: 0,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await sustainabilityApi.createMetric({
        projectId,
        carbonEmissions: {
          transportation: 0,
          equipment: 0,
          materials: 0,
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
          recycled: 0,
        },
        recordedDate: form.recordedDate,
        notes: form.notes || undefined,
      });

      navigate(`/projects/${projectId}/sustainability`);
    } catch (err: unknown) {
      console.error('Failed to submit metric:', err);
      setError((err as { message?: string })?.message || 'Failed to submit audit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = (field: string, value: number | string) =>
      setForm(f => ({...f, [field]: value}));

  return (
      <form onSubmit={handleSubmit} className="space-y-12">
        {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 font-medium">
              {error}
            </div>
        )}

      {/* SECTION: Audit Context */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
          <h3 className="text-sm font-bold text-primary font-headline uppercase tracking-widest">Audit Context</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Project Assignment (Locked)</label>
            <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-500 cursor-not-allowed flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">lock</span>
              Project ID: {projectId ? projectId.slice(-8) : 'PRJ-2026-001'}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Audit Date (ISO)</label>
            <input
                type="date"
                value={form.recordedDate}
                onChange={e => update('recordedDate', e.target.value)}
                className="input-standard w-full h-12 cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* SECTION: Carbon & Energy */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <span className="material-symbols-outlined text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          <h3 className="text-sm font-bold text-primary font-headline uppercase tracking-widest">Carbon & Energy Profile</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Electricity (kWh)</label>
            <input
                type="number"
                placeholder="0.00"
                className="input-standard w-full h-12"
                value={form.electricity || ''}
                onChange={e => update('electricity', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Diesel / Fuel (Liters)</label>
            <input
                type="number"
                placeholder="0.00"
                className="input-standard w-full h-12"
                value={form.diesel || ''}
                onChange={e => update('diesel', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Renewable Offset (%)</label>
            <input
                type="number"
                placeholder="0"
                max="100"
                className="input-standard w-full h-12"
                value={form.renewableOffset || ''}
                onChange={e => update('renewableOffset', Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      {/* SECTION: Water & Waste */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <span className="material-symbols-outlined text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
          <h3 className="text-sm font-bold text-primary font-headline uppercase tracking-widest">Environmental Resource Management</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Water Consumption (Liters)</label>
            <div className="relative">
              <input
                  type="number"
                  placeholder="0.00"
                  className="input-standard w-full h-12"
                  value={form.waterConsumption || ''}
                  onChange={e => update('waterConsumption', Number(e.target.value))}
              />
              <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">LITERS</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Recyclable Waste (kg)</label>
            <div className="relative">
              <input
                  type="number"
                  placeholder="0.00"
                  className="input-standard w-full h-12"
                  value={form.recyclableWaste || ''}
                  onChange={e => update('recyclableWaste', Number(e.target.value))}
              />
              <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">KG</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Non-Recyclable Waste (kg)</label>
            <input
                type="number"
                placeholder="0.00"
                className="input-standard w-full h-12"
                value={form.nonRecyclableWaste || ''}
                onChange={e => update('nonRecyclableWaste', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Hazardous Materials (kg)</label>
            <input
                type="number"
                placeholder="0.00"
                className="input-standard w-full h-12"
                value={form.hazardousWaste || ''}
                onChange={e => update('hazardousWaste', Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      {/* SECTION: Observations */}
      <section className="space-y-6">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Inspector Observations & Mitigation Notes</label>
        <textarea
            placeholder="Describe any anomalies or mitigation efforts taken during this audit cycle..."
          rows={5}
          className="input-standard w-full resize-none h-40"
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
        />
      </section>

      {/* FORM ACTIONS */}
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