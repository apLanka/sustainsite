import { Link } from 'react-router-dom';
import AuthLayout from '@/components/common/AuthLayout';

export default function LoginPage() {
  return (
    <AuthLayout 
      title="Access Dashboard" 
      subtitle="Welcome back to SustainSite ecosystem."
      imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBemI1byj2zRLu-Fe9i0-F5Y_f0Z1ufhXpAasg0sKaYgr-RvIhl_DgJC91zdrmaSHLHMOHENNW_7slbCed5L1IdDZ742ybz_aVvRa8gbkKlwONl_FAXZ0jLqD6gvCq_jVI5gBD5xWHMlCaOL4lP7cKOzc3NIXeph34TSunqYxXKx4x_vZojG7vrJatQLblQ2ZKISP9nchunuD0Cf1zXdKdS9GXqLbUnzf55jl89qHl62OhqUaJ3BpKB_ccwHx95cJLx6rexnw8jhdU"
    >
      <form className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant font-label" htmlFor="email">Email Address</label>
          <input 
            className="input-standard w-full h-12" 
            id="email" 
            placeholder="john@company.com" 
            type="email" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant font-label" htmlFor="password">Password</label>
          <input 
            className="input-standard w-full h-12" 
            id="password" 
            placeholder="••••••••" 
            type="password" 
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <input 
              className="w-4 h-4 text-primary bg-surface-container-high border-outline-variant/30 rounded focus:ring-primary cursor-pointer accent-primary" 
              id="remember" 
              type="checkbox" 
            />
            <label className="text-sm font-body font-medium text-on-surface-variant cursor-pointer" htmlFor="remember">Remember me</label>
          </div>
          <a className="text-sm font-body font-bold text-secondary hover:underline" href="#">Forgot Password?</a>
        </div>

        <button 
          className="signature-gradient w-full py-4 rounded-xl font-headline font-bold text-white shadow-xl hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer" 
          type="submit"
        >
          Sign In
        </button>

        <div className="pt-6 text-center">
          <p className="text-on-surface-variant text-sm font-body font-medium">
            New to the ecosystem? <Link className="text-primary font-bold hover:underline" to="/register">Create Account</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
