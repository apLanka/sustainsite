import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { projectApi } from '@/lib/api';
import { ProjectStatus } from '@/types/project';
import { useProjectStore } from '@/store';
import LocationPicker from './LocationPicker';
const projectSchema = z
    .object({
    projectName: z.string().min(3, 'Project name must be at least 3 characters').max(200),
    description: z.string().max(2000).optional(),
    address: z.string().min(1, 'Site address is required'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'Completion date is required'),
    budget: z.coerce.number({ error: 'Budget must be a number' }).positive('Budget must be greater than 0'),
    status: z.nativeEnum(ProjectStatus).optional(),
})
    .refine((d) => new Date(d.endDate) > new Date(d.startDate), {
    message: 'Completion date must be after start date',
    path: ['endDate'],
});
type ProjectFormData = z.infer<typeof projectSchema>;
const ProjectForm = () => {
    const navigate = useNavigate();
    const { setSelectedProject } = useProjectStore();
    const [serverError, setServerError] = useState<string | null>(null);
    const { register, handleSubmit, control, getValues, setValue, formState: { errors, isSubmitting }, } = useForm<ProjectFormData, unknown, ProjectFormData>({
        resolver: zodResolver(projectSchema) as never,
        defaultValues: { status: ProjectStatus.PLANNING },
    });
    const onSubmit = async (data: ProjectFormData) => {
        setServerError(null);
        try {
            const res = await projectApi.createProject({
                projectName: data.projectName,
                description: data.description,
                location: {
                    address: data.address,
                    latitude: data.latitude,
                    longitude: data.longitude,
                },
                startDate: data.startDate,
                endDate: data.endDate,
                budget: data.budget,
                status: data.status,
            });
            setSelectedProject(res.data);
            navigate(`/projects/${res.data._id}`);
        }
        catch (err: unknown) {
            const message = (err as {
                message?: string;
            })?.message ?? 'Failed to create project.';
            setServerError(message);
        }
    };
    return (<form className="space-y-10" onSubmit={handleSubmit(onSubmit)} noValidate>

      {serverError && (<div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 font-medium">
          {serverError}
        </div>)}

      
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <span className="material-symbols-outlined text-emerald-600">info</span>
          <h3 className="text-lg font-bold text-primary font-headline">General Information</h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Project Title
            </label>
            <input type="text" placeholder="e.g., Eco-Hub Corporate Center" className={`input-standard w-full ${errors.projectName ? 'border-rose-300' : ''}`} {...register('projectName')}/>
            {errors.projectName && (<p className="text-xs text-rose-500 font-medium ml-1">{errors.projectName.message}</p>)}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Project Description
            </label>
            <textarea rows={4} placeholder="Describe the architectural scope and sustainability goals..." className={`input-standard w-full resize-none ${errors.description ? 'border-rose-300' : ''}`} {...register('description')}/>
            {errors.description && (<p className="text-xs text-rose-500 font-medium ml-1">{errors.description.message}</p>)}
          </div>
        </div>
      </section>

      
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <span className="material-symbols-outlined text-emerald-600">payments</span>
          <h3 className="text-lg font-bold text-primary font-headline">Logistics & Financials</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Total Budget (USD)
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input type="number" placeholder="0.00" className={`input-standard w-full pl-10 h-12 ${errors.budget ? 'border-rose-300' : ''}`} {...register('budget')}/>
            </div>
            {errors.budget && (<p className="text-xs text-rose-500 font-medium ml-1">{errors.budget.message}</p>)}
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Location / Site Address
            </label>
            <Controller name="address" control={control} render={({ field }) => (<LocationPicker value={field.value
                ? {
                    address: field.value,
                    latitude: getValues('latitude') ?? 0,
                    longitude: getValues('longitude') ?? 0,
                }
                : undefined} onChange={({ address, latitude, longitude }) => {
                field.onChange(address);
                setValue('latitude', latitude);
                setValue('longitude', longitude);
            }} error={errors.address?.message}/>)}/>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Start Date
            </label>
            <input type="date" className={`input-standard w-full h-12 cursor-pointer ${errors.startDate ? 'border-rose-300' : ''}`} {...register('startDate')}/>
            {errors.startDate && (<p className="text-xs text-rose-500 font-medium ml-1">{errors.startDate.message}</p>)}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Estimated Completion
            </label>
            <input type="date" className={`input-standard w-full h-12 cursor-pointer ${errors.endDate ? 'border-rose-300' : ''}`} {...register('endDate')}/>
            {errors.endDate && (<p className="text-xs text-rose-500 font-medium ml-1">{errors.endDate.message}</p>)}
          </div>
        </div>
      </section>

      
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <span className="material-symbols-outlined text-emerald-600">tune</span>
          <h3 className="text-lg font-bold text-primary font-headline">Project Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Initial Status
            </label>
            <select className="input-standard w-full h-12 appearance-none cursor-pointer" {...register('status')}>
              <option value={ProjectStatus.PLANNING}>Planning</option>
              <option value={ProjectStatus.IN_PROGRESS}>In Progress</option>
              <option value={ProjectStatus.ON_HOLD}>On Hold</option>
            </select>
          </div>
        </div>
      </section>

      
      <div className="pt-10 flex flex-col sm:flex-row gap-4">
        <button type="submit" disabled={isSubmitting} className="flex-1 px-8 py-4 bg-primary text-white font-bold text-sm rounded-xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer font-headline disabled:opacity-60 disabled:cursor-not-allowed">
          {isSubmitting ? 'Creating Blueprint...' : 'Create Project Blueprint'}
        </button>
      </div>
    </form>);
};
export default ProjectForm;
