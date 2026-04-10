import { NavLink, Link } from 'react-router-dom';
import Logo from '../common/Logo';

const Sidebar = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/projects', label: 'Projects', icon: 'architecture' },
  ];

  const bottomItems = [
    { to: '/settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-primary flex flex-col py-6 shadow-xl shadow-primary/20 z-50">
      <div className="px-6 mb-8">
        <Logo size="lg" variant="dark" />
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink 
            key={item.label}
            to={item.to} 
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg mx-2 my-1 transition-all duration-200 font-headline text-sm font-medium tracking-tight
              ${isActive && item.to !== '#' 
                ? 'bg-white/10 text-white' 
                : 'text-on-primary-container/70 hover:text-white hover:bg-white/5'}
            `}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="px-6 py-4 mt-auto">
        <Link 
          to="/projects/new"
          className="w-full py-3 px-4 bg-gradient-to-br from-secondary to-primary-container text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/40 flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer no-underline"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          New Project
        </Link>
      </div>
      
      <div className="px-4 border-t border-white/5 pt-4 pb-2 space-y-1">
        {bottomItems.map((item) => (
          <NavLink 
            key={item.label}
            to={item.to} 
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg mx-2 transition-all duration-200 font-headline text-sm font-medium tracking-tight
              ${isActive && item.to !== '#' 
                ? 'bg-white/10 text-white' 
                : 'text-on-primary-container/70 hover:text-white hover:bg-white/5'}
            `}
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
