import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { projectApi, userApi } from '@/lib/api';
import type { CreateProjectPayload } from '@/types/project';
import { ProjectStatus } from '@/types/project';
import { useProjectStore } from '@/store';
import { UserRole } from '@/types/auth';
import LocationPicker from './LocationPicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
const projectSchema = z
  .object({
    projectName: z.string().min(3, 'Project name must be at least 3 characters').max(200),
    description: z.string().max(2000).optional(),
    address: z.string().min(1, 'Site address is required'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'Completion date is required'),
    budget: z.coerce
      .number({ error: 'Budget must be a number' })
      .positive('Budget must be greater than 0'),
    status: z.nativeEnum(ProjectStatus).optional(),
    projectManager: z.string().optional(),
    teamMembers: z.array(z.string()).optional(),
  })
  .refine((d) => new Date(d.endDate) > new Date(d.startDate), {
    message: 'Completion date must be after start date',
    path: ['endDate'],
  });
type ProjectFormData = z.infer<typeof projectSchema>;

interface UserOption {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

const ProjectForm = () => {
  const navigate = useNavigate();
  const { setSelectedProject } = useProjectStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userApi.getUsers({ limit: 100 });
        setUsers(res.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData, unknown, ProjectFormData>({
    resolver: zodResolver(projectSchema) as never,
    defaultValues: { status: ProjectStatus.PLANNING, teamMembers: [] },
  });

  const selectedManager = watch('projectManager');
  const selectedTeamMembers = watch('teamMembers') || [];

  const onSubmit = async (data: ProjectFormData) => {
    setServerError(null);
    try {
      const projectData: Record<string, unknown> = {
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
      };

      if (data.projectManager) {
        projectData.projectManager = data.projectManager;
      }
      if (data.teamMembers && data.teamMembers.length > 0) {
        projectData.teamMembers = data.teamMembers;
      }

      const res = await projectApi.createProject(projectData as unknown as CreateProjectPayload);
      setSelectedProject(res.data);
      navigate(`/projects/${res.data._id}`);
    } catch (err: unknown) {
      const message =
        (
          err as {
            message?: string;
          }
        )?.message ?? 'Failed to create project.';
      setServerError(message);
    }
  };
  return (
    <form className="space-y-10" onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 font-medium">
          {serverError}
        </div>
      )}

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
            <input
              type="text"
              placeholder="e.g., Eco-Hub Corporate Center"
              className={`input-standard w-full ${errors.projectName ? 'border-rose-300' : ''}`}
              {...register('projectName')}
            />
            {errors.projectName && (
              <p className="text-xs text-rose-500 font-medium ml-1">{errors.projectName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Project Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe the architectural scope and sustainability goals..."
              className={`input-standard w-full resize-none ${errors.description ? 'border-rose-300' : ''}`}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-rose-500 font-medium ml-1">{errors.description.message}</p>
            )}
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
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                $
              </span>
              <input
                type="number"
                placeholder="0.00"
                className={`input-standard w-full pl-10 h-12 ${errors.budget ? 'border-rose-300' : ''}`}
                {...register('budget')}
              />
            </div>
            {errors.budget && (
              <p className="text-xs text-rose-500 font-medium ml-1">{errors.budget.message}</p>
            )}
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Location / Site Address
            </label>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <LocationPicker
                  value={
                    field.value
                      ? {
                          address: field.value,
                          latitude: getValues('latitude') ?? 0,
                          longitude: getValues('longitude') ?? 0,
                        }
                      : undefined
                  }
                  onChange={({ address, latitude, longitude }) => {
                    field.onChange(address);
                    setValue('latitude', latitude);
                    setValue('longitude', longitude);
                  }}
                  error={errors.address?.message}
                />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Start Date
            </label>
            <input
              type="date"
              className={`input-standard w-full h-12 cursor-pointer ${errors.startDate ? 'border-rose-300' : ''}`}
              {...register('startDate')}
            />
            {errors.startDate && (
              <p className="text-xs text-rose-500 font-medium ml-1">{errors.startDate.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Estimated Completion
            </label>
            <input
              type="date"
              className={`input-standard w-full h-12 cursor-pointer ${errors.endDate ? 'border-rose-300' : ''}`}
              {...register('endDate')}
            />
            {errors.endDate && (
              <p className="text-xs text-rose-500 font-medium ml-1">{errors.endDate.message}</p>
            )}
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
            <select
              className="input-standard w-full h-12 appearance-none cursor-pointer"
              {...register('status')}
            >
              <option value={ProjectStatus.PLANNING}>Planning</option>
              <option value={ProjectStatus.IN_PROGRESS}>In Progress</option>
              <option value={ProjectStatus.ON_HOLD}>On Hold</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <span className="material-symbols-outlined text-emerald-600">groups</span>
          <h3 className="text-lg font-bold text-primary font-headline">Team & Stakeholders</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Project Manager
            </label>
            {usersLoading ? (
              <div className="flex items-center justify-center h-12 text-sm text-slate-400">
                Loading users...
              </div>
            ) : (
              <Controller
                name="projectManager"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    onValueChange={(value) => field.onChange(value || undefined)}
                  >
                    <SelectTrigger className="input-standard w-full h-12">
                      <SelectValue placeholder="Select project manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter((u) => u.role === UserRole.ADMIN || u.role === UserRole.PROJECT_MANAGER)
                        .map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.fullName} ({user.role.replace('_', ' ')})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Team Members
            </label>
            {usersLoading ? (
              <div className="flex items-center justify-center h-12 text-sm text-slate-400">
                Loading users...
              </div>
            ) : (
              <Controller
                name="teamMembers"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2 p-3 border border-slate-200 rounded-lg min-h-[60px] bg-white">
                    {users
                      .filter((u) => u._id !== selectedManager)
                      .map((user) => {
                        const isSelected = selectedTeamMembers.includes(user._id);
                        return (
                          <button
                            key={user._id}
                            type="button"
                            onClick={() => {
                              const current = field.value || [];
                              if (isSelected) {
                                field.onChange(current.filter((id) => id !== user._id));
                              } else {
                                field.onChange([...current, user._id]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              isSelected
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {isSelected && <span className="mr-1">✓</span>}
                            {user.fullName}
                            <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                              user.role === 'PROJECT_MANAGER' ? 'bg-blue-100 text-blue-700' :
                              user.role === 'INSPECTOR' ? 'bg-amber-100 text-amber-700' :
                              user.role === 'SUPPLIER' ? 'bg-orange-100 text-orange-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {user.role.replace('_', ' ')}
                            </span>
                          </button>
                        );
                      })}
                    {users.filter((u) => u._id !== selectedManager).length === 0 && (
                      <p className="text-sm text-slate-400">No additional users available</p>
                    )}
                  </div>
                )}
              />
            )}
            <p className="text-xs text-slate-400 ml-1">
              {selectedTeamMembers.length} member{selectedTeamMembers.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>
      </section>

      <div className="pt-10 flex flex-col sm:flex-row gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-8 py-4 bg-primary text-white font-bold text-sm rounded-xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer font-headline disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating Blueprint...' : 'Create Project Blueprint'}
        </button>
      </div>
    </form>
  );
};
export default ProjectForm;
