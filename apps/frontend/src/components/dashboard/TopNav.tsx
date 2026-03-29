import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const TopNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName = user?.fullName || 'Sarah Jenkins';
  const userRole = user?.role ? (user.role.charAt(0) + user.role.slice(1).toLowerCase().replace('_', ' ')) : 'Site Administrator';

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 border-b border-slate-100">
      <div className="flex items-center w-1/3">
        <div className="relative w-full max-w-md group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">search</span>
          <input 
            className="input-standard w-full pl-10 pr-4 h-10" 
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
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-50 transition-all cursor-pointer text-left ${isProfileOpen ? 'bg-slate-50' : ''}`}
          >
            <span className="text-right hidden sm:block">
              <p className="text-xs font-bold text-on-surface leading-none">{userName}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">{userRole}</p>
            </span>
            <img 
              alt={userName} 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-secondary/20 group-hover:ring-secondary transition-all" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6NOWTM8kUxUA6MvpWukL04EWDwtWttYKj_uYA4H6JOVY-HfJ5KKIG-ZDyD5xR0DRYREO4fmU1Nw-FhnHbf35crqNkePM4zq4Lgj_WhdoLB0qgK4Auq_Sed9yCrfXO7UZXR3gF7mKMAT1Y1qTK9UpmEUlSLYiizE3dR9f_D26sO7_tB3j8ySFcqQtph2P0vD_KgfZzoagSMqiNZH6I58a2ApQUD8B7rl_MVIb43VAA0O3fx1hfPzN-WNckwjTcDWk_B5ewWnJWLqY"
            />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
              >
                <div className="p-5 border-b border-slate-50 bg-slate-50/50">
                  <p className="text-sm font-black text-primary truncate leading-none mb-1">{userName}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{userRole}</p>
                </div>
                
                <div className="p-2">
                  <Link 
                    to="/settings" 
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:text-secondary hover:bg-slate-50 rounded-xl transition-all group"
                  >
                    <span className="material-symbols-outlined text-xl text-slate-400 group-hover:text-secondary">settings</span>
                    Settings
                  </Link>
                </div>
                
                <div className="p-2 border-t border-slate-50">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all group cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xl text-rose-400 group-hover:text-rose-500">logout</span>
                    Log Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
