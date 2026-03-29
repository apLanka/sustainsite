import { useAuth } from '@/contexts/AuthContext';

const TopNav = () => {
  const { user } = useAuth();
  const userName = user?.fullName || 'Sarah Jenkins';
  const userRole = user?.role ? (user.role.charAt(0) + user.role.slice(1).toLowerCase().replace('_', ' ')) : 'Site Administrator';

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 border-b border-slate-100">
      <div className="flex items-center w-1/3">
        <div className="relative w-full max-w-md group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">search</span>
          <input 
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-500 font-medium" 
            placeholder="Search projects, metrics, or files..." 
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full ring-2 ring-white"></span>
          </button>
          <button className="p-2 text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer">
            <span className="material-symbols-outlined">history_edu</span>
          </button>
        </div>
        
        <div className="h-8 w-px bg-slate-200"></div>
        
        <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-50 transition-colors cursor-pointer text-left">
          <span className="text-right hidden sm:block">
            <p className="text-xs font-bold text-on-surface leading-none">{userName}</p>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">{userRole}</p>
          </span>
          <img 
            alt={userName} 
            className="w-10 h-10 rounded-full object-cover ring-2 ring-secondary/20" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6NOWTM8kUxUA6MvpWukL04EWDwtWttYKj_uYA4H6JOVY-HfJ5KKIG-ZDyD5xR0DRYREO4fmU1Nw-FhnHbf35crqNkePM4zq4Lgj_WhdoLB0qgK4Auq_Sed9yCrfXO7UZXR3gF7mKMAT1Y1qTK9UpmEUlSLYiizE3dR9f_D26sO7_tB3j8ySFcqQtph2P0vD_KgfZzoagSMqiNZH6I58a2ApQUD8B7rl_MVIb43VAA0O3fx1hfPzN-WNckwjTcDWk_B5ewWnJWLqY"
          />
        </button>
      </div>
    </header>
  );
};

export default TopNav;
