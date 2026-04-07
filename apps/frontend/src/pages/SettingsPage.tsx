import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/common/DashboardLayout';
import SmoothTabs from '@/components/ui/SmoothTabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
type SettingsTab = 'profile' | 'security';
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const tabs: {
    id: SettingsTab;
    label: string;
    icon: string;
  }[] = [
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'security', label: 'Security', icon: 'shield' },
  ];
  return (
    <DashboardLayout>
      <div className="py-10">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-primary tracking-tighter leading-none font-headline mb-2">
            Account Settings
          </h1>
          <p className="text-slate-500 font-medium">
            Manage your personal information and security settings.
          </p>
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
              {activeTab === 'security' && <SecuritySettings />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
function ProfileSettings() {
  const { user, refreshUser } = useAuth();
  const formatRole = (role: string) =>
    role.charAt(0) + role.slice(1).toLowerCase().replace(/_/g, ' ');
  const [fields, setFields] = useState({
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    jobTitle: user?.jobTitle ?? '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    if (user) {
      setFields({
        fullName: user.fullName ?? '',
        email: user.email ?? '',
        jobTitle: user.jobTitle ?? '',
      });
    }
  }, [user]);
  const handleChange = (e: {
    target: {
      name: string;
      value: string;
    };
  }) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setApiErrors([]);
    setSuccess(false);
  };
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError(null);
    setApiErrors([]);
    setSuccess(false);
    setIsLoading(true);
    try {
      await authApi.updateProfile(fields);
      await refreshUser();
      setSuccess(true);
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      const apiErr = err as {
        message?: string;
        errors?: string[];
      };
      const msg = apiErr?.message || 'Failed to save changes. Please try again.';
      setError(msg);
      setApiErrors(apiErr?.errors ?? []);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <section className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Full Name
            </label>
            <Input
              name="fullName"
              value={fields.fullName}
              onChange={handleChange}
              className="input-standard"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Email Address
            </label>
            <Input
              type="email"
              name="email"
              value={fields.email}
              onChange={handleChange}
              className="input-standard"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Job Title
            </label>
            <Input
              name="jobTitle"
              value={fields.jobTitle}
              onChange={handleChange}
              placeholder="e.g. Sustainability Lead"
              className="input-standard"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Role
            </label>
            <div className="input-standard flex items-center">
              <span className="text-sm font-bold text-primary">
                {user?.role ? formatRole(user.role) : '—'}
              </span>
              <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-slate-400">
                Read only
              </span>
            </div>
          </div>
        </div>

        {(error || apiErrors.length > 0) && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 space-y-1">
            {error && <p className="text-sm font-bold text-red-600">{error}</p>}
            {apiErrors.length > 0 && (
              <ul className="list-disc list-inside space-y-0.5">
                {apiErrors.map((e, i) => (
                  <li key={i} className="text-xs font-medium text-red-500">
                    {e}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-bold text-emerald-700">Profile updated successfully.</p>
          </div>
        )}
      </section>

      <div className="pt-6 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-primary text-white font-bold text-sm rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
function SecuritySettings() {
  const [fields, setFields] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const toggleShow = (name: keyof typeof showPasswords) =>
    setShowPasswords((prev) => ({ ...prev, [name]: !prev[name] }));
  const handleChange = (e: {
    target: {
      name: string;
      value: string;
    };
  }) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setApiErrors([]);
    setSuccess(false);
  };
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError(null);
    setApiErrors([]);
    setSuccess(false);
    if (fields.newPassword !== fields.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: fields.currentPassword,
        newPassword: fields.newPassword,
      });
      setSuccess(true);
      setFields({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (err: unknown) {
      const apiErr = err as {
        message?: string;
        errors?: string[];
      };
      const msg = apiErr?.message || 'Failed to change password. Please try again.';
      setError(msg);
      setApiErrors(apiErr?.errors ?? []);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-6">
        <div>
          <h3 className="text-lg font-black text-primary font-headline mb-1">Change Password</h3>
          <p className="text-sm text-slate-500 font-medium">
            Keep your account secure with a strong password.
          </p>
        </div>

        <div className="space-y-4 max-w-md">
          {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((name) => (
            <div key={name} className="relative">
              <Input
                type={showPasswords[name] ? 'text' : 'password'}
                name={name}
                placeholder={
                  name === 'currentPassword'
                    ? 'Current Password'
                    : name === 'newPassword'
                      ? 'New Password'
                      : 'Confirm New Password'
                }
                value={fields[name]}
                onChange={handleChange}
                className="input-standard w-full pr-12"
                required
              />
              <button
                type="button"
                onClick={() => toggleShow(name)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-xl">
                  {showPasswords[name] ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          ))}
        </div>

        {(error || apiErrors.length > 0) && (
          <div className="max-w-md rounded-xl border border-red-100 bg-red-50 px-4 py-3 space-y-1">
            {error && <p className="text-sm font-bold text-red-600">{error}</p>}
            {apiErrors.length > 0 && (
              <ul className="list-disc list-inside space-y-0.5">
                {apiErrors.map((e, i) => (
                  <li key={i} className="text-xs font-medium text-red-500">
                    {e}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {success && (
          <div className="max-w-md rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-bold text-emerald-700">Password changed successfully.</p>
          </div>
        )}
      </section>

      <div className="pt-6 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-primary text-white font-bold text-sm rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Reset Password'}
        </button>
      </div>
    </form>
  );
}
