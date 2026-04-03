import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '@/components/common/AuthLayout';
import { useAuth } from '@/contexts/AuthContext';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await login(data.email, data.password, remember);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ?? 'Invalid email or password. Please try again.';
      setServerError(message);
    }
  };

  return (
    <AuthLayout
      title="Access Dashboard"
      subtitle="Welcome back to SustainSite ecosystem."
      imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBemI1byj2zRLu-Fe9i0-F5Y_f0Z1ufhXpAasg0sKaYgr-RvIhl_DgJC91zdrmaSHLHMOHENNW_7slbCed5L1IdDZ742ybz_aVvRa8gbkKlwONl_FAXZ0jLqD6gvCq_jVI5gBD5xWHMlCaOL4lP7cKOzc3NIXeph34TSunqYxXKx4x_vZojG7vrJatQLblQ2ZKISP9nchunuD0Cf1zXdKdS9GXqLbUnzf55jl89qHl62OhqUaJ3BpKB_ccwHx95cJLx6rexnw8jhdU"
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>

        {serverError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 font-medium">
            {serverError}
          </div>
        )}

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

        {/* Password */}
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

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <input
              className="w-4 h-4 text-primary bg-surface-container-high border-outline-variant/30 rounded focus:ring-primary cursor-pointer accent-primary"
              id="remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <label
              className="text-sm font-body font-medium text-on-surface-variant cursor-pointer"
              htmlFor="remember"
            >
              Remember me
            </label>
          </div>
          <a className="text-sm font-body font-bold text-secondary hover:underline" href="#">
            Forgot Password?
          </a>
        </div>

        <button
          className="signature-gradient w-full py-4 rounded-xl font-headline font-bold text-white shadow-xl hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>

        <div className="pt-6 text-center">
          <p className="text-on-surface-variant text-sm font-body font-medium">
            New to the ecosystem?{' '}
            <Link className="text-primary font-bold hover:underline" to="/register">
              Create Account
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}