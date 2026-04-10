import { NavLink, Link } from 'react-router-dom';
import Logo from '../common/Logo';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role ?? '';

  const canCreateProject = !['VIEWER', 'SUPPLIER'].includes(role);
  const isAdmin = role === 'ADMIN';

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/projects', label: 'Projects', icon: 'architecture' },
  ];

  const adminItems = isAdmin
    ? [{ to: '/admin/users', label: 'User Management', icon: 'manage_accounts' }]
    : [];

  const bottomItems = [
    { to: '/settings', label: 'Settings', icon: 'settings' },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) => `
    flex items-center gap-3 px-4 py-3 rounded-lg mx-2 my-1 transition-all duration-200 font-headline text-sm font-medium tracking-tight
    ${isActive
      ? 'bg-white/10 text-white'
      : 'text-on-primary-container/70 hover:text-white hover:bg-white/5'}
  `;

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-primary flex flex-col py-6 shadow-xl shadow-primary/20 z-50">
      <div className="px-6 mb-8">
        <Logo size="lg" variant="dark" />
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.label} to={item.to} className={linkClass}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {adminItems.length > 0 && (
          <>
            <div className="px-4 pt-4 pb-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Admin</p>
            </div>
            {adminItems.map((item) => (
              <NavLink key={item.label} to={item.to} className={linkClass}>
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>
      
      {canCreateProject && (
        <div className="px-6 py-4 mt-auto">
          <Link 
            to="/projects/new"
            className="w-full py-3 px-4 bg-gradient-to-br from-secondary to-primary-container text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/40 flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer no-underline"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            New Project
          </Link>
        </div>
      )}
      
      <div className="px-4 border-t border-white/5 pt-4 pb-2 space-y-1">
        {bottomItems.map((item) => (
          <NavLink 
            key={item.label}
            to={item.to} 
            className={linkClass}
          >
            <span className="material-symbols-outlined text-sm">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
