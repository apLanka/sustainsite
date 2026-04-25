import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
interface Tab {
  id: string;
  label: string;
  icon?: string;
}
interface SmoothTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'pill' | 'underline';
}
export default function SmoothTabs({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'pill',
}: SmoothTabsProps) {
  if (variant === 'underline') {
    return (
      <div className={cn('flex gap-8 border-b border-slate-100', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'pb-4 text-sm font-bold uppercase tracking-widest font-headline transition-all relative',
              activeTab === tab.id ? 'text-primary' : 'text-slate-400 hover:text-primary'
            )}
          >
            <div className="flex items-center gap-2">
              {tab.icon && <span className="material-symbols-outlined text-lg">{tab.icon}</span>}
              {tab.label}
            </div>
            {activeTab === tab.id && (
              <motion.div
                layoutId="underline"
                className="absolute bottom-0 left-0 right-0 h-1 bg-secondary rounded-full"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div
      className={cn(
        'flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl w-fit border border-slate-100/50',
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'group relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all',
            activeTab === tab.id ? 'text-primary' : 'text-slate-500 hover:text-primary'
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-100/50"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon && <span className="material-symbols-outlined text-lg">{tab.icon}</span>}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}
