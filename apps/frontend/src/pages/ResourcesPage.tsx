import { useState } from 'react';
import DashboardLayout from '@/components/common/DashboardLayout';
import ProjectHeader from '@/components/project/ProjectHeader';
import MaterialInventory from '@/components/resources/MaterialInventory';
import EquipmentManagement from '@/components/resources/EquipmentManagement';
import SupplierDirectory from '@/components/resources/SupplierDirectory';
import CostTracker from '@/components/resources/CostTracker';

import SmoothTabs from '@/components/ui/SmoothTabs';
import { motion, AnimatePresence } from 'framer-motion';

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
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Inventory
          </div>
        </header>

        {/* Inner Tabs Navigation */}
        <SmoothTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onChange={(id) => setActiveTab(id as ResourceTab)} 
          className="mb-10"
        />

        {/* Tab Content Rendering */}
        <div className="pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'materials' && <MaterialInventory />}
              {activeTab === 'equipment' && <EquipmentManagement />}
              {activeTab === 'suppliers' && <SupplierDirectory />}
              {activeTab === 'finance' && <CostTracker />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}

