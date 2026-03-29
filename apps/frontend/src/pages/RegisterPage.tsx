import { Link } from 'react-router-dom';
import AuthLayout from '@/components/common/AuthLayout';

export default function RegisterPage() {
  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Start managing your sustainable project today."
      imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDqlVZdn5qbtL3m8aXquUJUnjpXPv0101sZZ_XZqsR7Kv8nGOIYwIx0yNzOSPpycRVihRk_VTwSAUuiebuEtCCiGp6DQwAoDrUSfm-Sb9_wS-G2XumgXzZjUTlJZhFaGbbdG77yC3qe5wgV1hR1tS9d2fUcYFhKPRQkwoJeT_ivEeIONGOIF3NEJqA84tErcznEQWbFXUqZtMkXMjA35tyyaKi6R2WTuq2fMpEEznWlcuuDtoTRu3941R8bKq0aFx0WmfN469Pn1C0"
    >
      <form className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant font-label" htmlFor="name">Full Name</label>
          <input 
            className="w-full h-12 px-4 bg-surface-container-highest/30 rounded-lg border-none focus:ring-2 focus:ring-primary/20 focus:border-b-2 focus:border-primary placeholder-on-surface-variant/40 text-on-surface transition-all font-body font-medium" 
            id="name" 
            placeholder="Johnathan Doe" 
            type="text" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant font-label" htmlFor="email">Email Address</label>
          <input 
            className="w-full h-12 px-4 bg-surface-container-highest/30 rounded-lg border-none focus:ring-2 focus:ring-primary/20 focus:border-b-2 focus:border-primary placeholder-on-surface-variant/40 text-on-surface transition-all font-body font-medium" 
            id="email" 
            placeholder="john@company.com" 
            type="email" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant font-label" htmlFor="phone">Phone Number</label>
          <input 
            className="w-full h-12 px-4 bg-surface-container-highest/30 rounded-lg border-none focus:ring-2 focus:ring-primary/20 focus:border-b-2 focus:border-primary placeholder-on-surface-variant/40 text-on-surface transition-all font-body font-medium" 
            id="phone" 
            placeholder="+1 (555) 000-0000" 
            type="tel" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant font-label" htmlFor="role">Your Role</label>
            <div className="relative">
              <select 
                className="w-full h-12 px-4 bg-surface-container-highest/30 rounded-lg border-none focus:ring-2 focus:ring-primary/20 focus:border-b-2 focus:border-primary appearance-none text-on-surface cursor-pointer transition-all font-body font-medium" 
                id="role"
              >
                <option disabled selected value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="pm">Project Manager</option>
                <option value="inspector">Inspector</option>
                <option value="supplier">Supplier</option>
                <option value="viewer">Viewer</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-on-surface-variant/50">expand_more</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant font-label" htmlFor="password">Password</label>
            <input 
              className="w-full h-12 px-4 bg-surface-container-highest/30 rounded-lg border-none focus:ring-2 focus:ring-primary/20 focus:border-b-2 focus:border-primary placeholder-on-surface-variant/40 text-on-surface transition-all font-body font-medium" 
              id="password" 
              placeholder="••••••••" 
              type="password" 
            />
          </div>
        </div>

        <div className="flex items-start gap-3 py-2">
          <div className="flex items-center h-5">
            <input 
              className="w-4 h-4 text-primary bg-surface-container-high border-outline-variant/30 rounded focus:ring-primary cursor-pointer accent-primary" 
              id="terms" 
              type="checkbox" 
            />
          </div>
          <label className="text-sm text-on-surface-variant leading-relaxed font-body font-medium" htmlFor="terms">
            I agree to the <a className="text-secondary font-bold hover:underline" href="#">Terms of Service</a> and <a className="text-secondary font-bold hover:underline" href="#">Privacy Policy</a>.
          </label>
        </div>

        <button 
          className="signature-gradient w-full py-4 rounded-xl font-headline font-bold text-white shadow-xl hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer" 
          type="submit"
        >
          Create Account
        </button>

        <div className="pt-6 text-center">
          <p className="text-on-surface-variant text-sm font-body font-medium">
            Already part of the ecosystem? <Link className="text-primary font-bold hover:underline" to="/login">Sign In</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
