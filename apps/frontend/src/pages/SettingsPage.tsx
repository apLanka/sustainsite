import { useState } from 'react';
import DashboardLayout from '@/components/common/DashboardLayout';
import SmoothTabs from '@/components/ui/SmoothTabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';

type SettingsTab = 'profile' | 'preferences' | 'security';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'preferences', label: 'Preferences', icon: 'tune' },
    { id: 'security', label: 'Security', icon: 'shield' },
  ];

  return (
    <DashboardLayout>
      <div className="py-10">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-primary tracking-tighter leading-none font-headline mb-2">Account Settings</h1>
          <p className="text-slate-500 font-medium">Manage your personal information and system configurations.</p>
        </header>

        <SmoothTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onChange={(id) => setActiveTab(id as SettingsTab)} 
          className="mb-12"
        />

        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'profile' && <ProfileSettings />}
              {activeTab === 'preferences' && <SystemPreferences />}
              {activeTab === 'security' && <SecuritySettings />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ProfileSettings() {
  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center gap-10 mb-8">
          <div className="relative group cursor-pointer w-28 h-28">
            <div className="w-full h-full rounded-[2rem] bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-200 group-hover:border-secondary transition-all overflow-hidden shadow-inner">
              <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-secondary group-hover:scale-110 transition-transform">add_a_photo</span>
            </div>
            <div className="absolute bottom-1 right-1 bg-white p-2.5 rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center transform group-hover:scale-110 transition-all ring-4 ring-white">
              <span className="material-symbols-outlined text-sm text-primary">edit</span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-primary font-headline tracking-tight">Profile Image</h3>
            <p className="text-sm text-slate-500 font-medium font-body mt-1">JPG, GIF or PNG. Max size of 2.5MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Name</label>
            <Input defaultValue="Admin User" className="input-standard" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</label>
            <Input defaultValue="admin@sustainsite.com" className="input-standard" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Job Title / Role</label>
            <Input defaultValue="Sustainability Lead" className="input-standard" />
          </div>
        </div>
      </section>

      <div className="pt-6 border-t border-slate-100 flex justify-end">
        <button className="px-8 py-3 bg-primary text-white font-bold text-sm rounded-xl hover:brightness-110 active:scale-[0.98] transition-all">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function SystemPreferences() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <div>
          <h3 className="text-lg font-black text-primary font-headline mb-1">Regional Preferences</h3>
          <p className="text-sm text-slate-500 font-medium">Adjust units and timezones for your project reporting.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Default Units</label>
            <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3.5 text-sm font-bold text-primary shadow-inner outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary">
              <option>Metric (kg, m, liters)</option>
              <option>Imperial (lbs, ft, gal)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Timezone</label>
            <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3.5 text-sm font-bold text-primary shadow-inner outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary">
              <option>(GMT+05:30) Colombo, Sri Lanka</option>
              <option>(GMT+00:00) London, UK</option>
              <option>(GMT-05:00) New York, USA</option>
            </select>
          </div>
        </div>
      </section>

      <section className="bg-emerald-50/50 p-8 rounded-2xl border border-emerald-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-emerald-950 font-headline mb-1">Eco-Mode Dashboard</h3>
            <p className="text-sm text-emerald-800/70 font-medium">Reduce energy consumption by simplifying dashboard animations.</p>
          </div>
          <div className="w-12 h-6 bg-emerald-200 rounded-full p-1 cursor-pointer">
            <div className="w-4 h-4 bg-white rounded-full shadow-sm shadow-emerald-900/20" />
          </div>
        </div>
      </section>

      <div className="pt-6 border-t border-slate-100 flex justify-end">
        <button className="px-8 py-3 bg-primary text-white font-bold text-sm rounded-xl hover:brightness-110 active:scale-[0.98] transition-all">
          Update Preferences
        </button>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <div>
          <h3 className="text-lg font-black text-primary font-headline mb-1">Change Password</h3>
          <p className="text-sm text-slate-500 font-medium">Keep your account secure with a strong password.</p>
        </div>

        <div className="space-y-4 max-w-md">
          <Input type="password" placeholder="Current Password" className="input-standard w-full" />
          <Input type="password" placeholder="New Password" className="input-standard w-full" />
          <Input type="password" placeholder="Confirm New Password" className="input-standard w-full" />
        </div>
      </section>

      <section className="pt-8 border-t border-slate-100">
        <h3 className="text-lg font-black text-primary font-headline mb-4">Login Sessions</h3>
        <div className="space-y-4">
          {[
            { device: 'macOS - Colombo, LK', time: 'Active now', current: true },
            { device: 'iPhone 15 - Colombo, LK', time: '2 hours ago', current: false },
          ].map((session, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-slate-400">
                  {session.device.includes('macOS') ? 'desktop_mac' : 'smartphone'}
                </span>
                <div>
                  <p className="text-sm font-bold text-primary">{session.device}</p>
                  <p className="text-xs text-slate-500 font-medium">{session.time}</p>
                </div>
              </div>
              {session.current ? (
                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-md">Current</span>
              ) : (
                <button className="text-xs font-bold text-red-500 hover:text-red-600">Revoke</button>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="pt-6 border-t border-slate-100 flex justify-end">
        <button className="px-8 py-3 bg-primary text-white font-bold text-sm rounded-xl hover:brightness-110 active:scale-[0.98] transition-all">
          Secure Account
        </button>
      </div>
    </div>
  );
}
