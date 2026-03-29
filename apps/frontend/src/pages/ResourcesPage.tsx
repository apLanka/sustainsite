import { useState } from 'react';
import DashboardLayout from '@/components/common/DashboardLayout';
import ProjectHeader from '@/components/project/ProjectHeader';
import MaterialInventory from '@/components/resources/MaterialInventory';
import EquipmentManagement from '@/components/resources/EquipmentManagement';
import SupplierDirectory from '@/components/resources/SupplierDirectory';
import CostTracker from '@/components/resources/CostTracker';

type ResourceTab = 'materials' | 'equipment' | 'suppliers' | 'finance';

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<ResourceTab>('materials');

  const tabs: { id: ResourceTab; label: string; icon: string }[] = [
    { id: 'materials', label: 'Materials', icon: 'inventory_2' },
    { id: 'equipment', label: 'Equipment', icon: 'construction' },
    { id: 'suppliers', label: 'Suppliers', icon: 'group' },
    { id: 'finance', label: 'Finance', icon: 'payments' },
  ];

  return (
    <DashboardLayout>
      <ProjectHeader />

      <div className="px-10">
        <header className="py-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div>
            <h3 className="text-2xl font-black text-primary tracking-tighter leading-none font-headline">Resource Management</h3>
            <p className="text-slate-500 text-sm font-medium mt-2">Managing construction assets, fleet, and financial efficiency.</p>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Inventory Sync
          </div>
        </header>

        {/* Inner Tabs Navigation */}
        <div className="mb-10 flex items-center gap-4 bg-surface-container-low p-1.5 rounded-2xl w-fit border border-slate-100/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id 
                ? 'bg-white text-primary shadow-sm border border-slate-100/50' 
                : 'text-slate-500 hover:text-primary hover:bg-white/50'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Rendering */}
        <div className="pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === 'materials' && <MaterialInventory />}
          {activeTab === 'equipment' && <EquipmentManagement />}
          {activeTab === 'suppliers' && <SupplierDirectory />}
          {activeTab === 'finance' && <CostTracker />}
        </div>
      </div>
    </DashboardLayout>
  );
}

