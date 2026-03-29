import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/projects', label: 'Projects', icon: 'architecture' },
    { to: '#', label: 'Resources', icon: 'inventory_2' },
  ];

  const bottomItems = [
    { to: '#', label: 'Settings', icon: 'settings' },
    { to: '#', label: 'Support', icon: 'help_outline' },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-emerald-950 flex flex-col py-6 shadow-xl shadow-emerald-950/20 z-50">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white">
          <span className="material-symbols-outlined !text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tighter leading-none">SustainSite</h1>
          <p className="text-[10px] text-emerald-400/70 uppercase tracking-widest font-bold mt-1">The Digital Arboretum</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink 
            key={item.label}
            to={item.to} 
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg mx-2 my-1 transition-all duration-200 font-headline text-sm font-medium tracking-tight
              ${isActive && item.to !== '#' 
                ? 'bg-emerald-800/40 text-emerald-100' 
                : 'text-emerald-400/70 hover:text-emerald-50 hover:bg-emerald-800/20'}
            `}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="px-6 py-4 mt-auto">
        <button className="w-full py-3 px-4 bg-gradient-to-br from-secondary to-primary text-white rounded-lg font-bold text-sm shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer">
          <span className="material-symbols-outlined text-base">add_circle</span>
          New Project
        </button>
      </div>
      
      <div className="px-4 border-t border-emerald-900/50 pt-4 pb-2 space-y-1">
        {bottomItems.map((item) => (
          <NavLink 
            key={item.label}
            to={item.to} 
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg mx-2 transition-all duration-200 font-headline text-sm font-medium tracking-tight
              ${isActive && item.to !== '#' 
                ? 'bg-emerald-800/40 text-emerald-100' 
                : 'text-emerald-400/70 hover:text-emerald-50 hover:bg-emerald-800/20'}
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
