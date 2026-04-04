import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '@/components/common/AuthLayout';
import { useAuth } from '@/contexts/AuthContext';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { UserRole } from '@/types/auth';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (!termsAccepted) {
      setServerError('You must accept the Terms of Service to continue.');
      return;
    }
    setServerError(null);
    try {
      await registerUser(data);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ?? 'Registration failed. Please try again.';
      setServerError(message);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start managing your sustainable project today."
      imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDqlVZdn5qbtL3m8aXquUJUnjpXPv0101sZZ_XZqsR7Kv8nGOIYwIx0yNzOSPpycRVihRk_VTwSAUuiebuEtCCiGp6DQwAoDrUSfm-Sb9_wS-G2XumgXzZjUTlJZhFaGbbdG77yC3qe5wgV1hR1tS9d2fUcYFhKPRQkwoJeT_ivEeIONGOIF3NEJqA84tErcznEQWbFXUqZtMkXMjA35tyyaKi6R2WTuq2fMpEEznWlcuuDtoTRu3941R8bKq0aFx0WmfN469Pn1C0"
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>

        {serverError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 font-medium">
            {serverError}
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-2">
          <label
            className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant font-label"
            htmlFor="fullName"
          >
            Full Name
          </label>
          <input
            className={`input-standard w-full h-12 ${errors.fullName ? 'border-rose-300 focus:ring-rose-200' : ''}`}
            id="fullName"
            placeholder="Johnathan Doe"
            type="text"
            {...register('fullName')}
          />
          {errors.fullName && (
            <p className="text-xs text-rose-500 font-medium">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label
            className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant font-label"
            htmlFor="email"
          >
            Email Address
          </label>
          <input
            className={`input-standard w-full h-12 ${errors.email ? 'border-rose-300 focus:ring-rose-200' : ''}`}
            id="email"
            placeholder="john@company.com"
            type="email"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Role + Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant font-label"
              htmlFor="role"
            >
              Your Role
            </label>
            <div className="relative">
              <select
                className={`input-standard w-full h-12 appearance-none cursor-pointer ${errors.role ? 'border-rose-300' : ''}`}
                id="role"
                {...register('role')}
              >
                <option value="">Select Role</option>
                <option value={UserRole.ADMIN}>Admin</option>
                <option value={UserRole.PROJECT_MANAGER}>Project Manager</option>
                <option value={UserRole.INSPECTOR}>Inspector</option>
                <option value={UserRole.SUPPLIER}>Supplier</option>
                <option value={UserRole.VIEWER}>Viewer</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-on-surface-variant/50">
                expand_more
              </span>
            </div>
            {errors.role && (
              <p className="text-xs text-rose-500 font-medium">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant font-label"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className={`input-standard w-full h-12 ${errors.password ? 'border-rose-300 focus:ring-rose-200' : ''}`}
              id="password"
              placeholder="••••••••"
              type="password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-rose-500 font-medium">{errors.password.message}</p>
            )}
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3 py-2">
          <div className="flex items-center h-5">
            <input
              className="w-4 h-4 text-primary bg-surface-container-high border-outline-variant/30 rounded focus:ring-primary cursor-pointer accent-primary"
              id="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
          </div>
          <label
            className="text-sm text-on-surface-variant leading-relaxed font-body font-medium"
            htmlFor="terms"
          >
            I agree to the{' '}
            <a className="text-secondary font-bold hover:underline" href="#">
              Terms of Service
            </a>{' '}
            and{' '}
            <a className="text-secondary font-bold hover:underline" href="#">
              Privacy Policy
            </a>
            .
          </label>
        </div>

        <button
          className="signature-gradient w-full py-4 rounded-xl font-headline font-bold text-white shadow-xl hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>

        <div className="pt-6 text-center">
          <p className="text-on-surface-variant text-sm font-body font-medium">
            Already part of the ecosystem?{' '}
            <Link className="text-primary font-bold hover:underline" to="/login">
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}