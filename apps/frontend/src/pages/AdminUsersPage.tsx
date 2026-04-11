import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/common/DashboardLayout';
import { userApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { AdminUser, UpdateUserPayload } from '@/types/user';
import { UserRole } from '@/types/auth';

const ROLES: UserRole[] = ['ADMIN', 'PROJECT_MANAGER', 'INSPECTOR', 'SUPPLIER', 'VIEWER'];
const LIMIT = 15;

const roleBadge: Record<UserRole, string> = {
  ADMIN: 'bg-rose-100 text-rose-700',
  PROJECT_MANAGER: 'bg-blue-100 text-blue-700',
  INSPECTOR: 'bg-amber-100 text-amber-700',
  SUPPLIER: 'bg-purple-100 text-purple-700',
  VIEWER: 'bg-slate-100 text-slate-600',
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | ''>('');
  const [filterActive, setFilterActive] = useState<'' | 'true' | 'false'>('');

  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserPayload>({});
  const [isSaving, setIsSaving] = useState(false);

  const [deactivateTarget, setDeactivateTarget] = useState<AdminUser | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const totalPages = Math.ceil(total / LIMIT);

  // Debounce search input — only fire API after 400 ms of no typing
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userApi.getUsers({
        search: search || undefined,
        role: filterRole || undefined,
        isActive: filterActive === '' ? undefined : filterActive === 'true',
        page,
        limit: LIMIT,
      });
      setUsers(res.data ?? []);
      setTotal(res.pagination?.total ?? 0);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [search, filterRole, filterActive, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openEdit = (u: AdminUser) => {
    setEditUser(u);
    setEditForm({ role: u.role, isActive: u.isActive, jobTitle: u.jobTitle ?? '' });
  };

  const handleSave = async () => {
    if (!editUser) return;
    setIsSaving(true);
    try {
      const res = await userApi.update(editUser._id, editForm);
      setUsers(prev => prev.map(u => u._id === editUser._id ? res.data : u));
      setEditUser(null);
      toast.success('User updated successfully');
    } catch {
      toast.error('Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setIsDeactivating(true);
    try {
      await userApi.deactivate(deactivateTarget._id);
      setUsers(prev => prev.map(u => u._id === deactivateTarget._id ? { ...u, isActive: false } : u));
      setDeactivateTarget(null);
      toast.success(`${deactivateTarget.fullName} has been deactivated`);
    } catch {
      toast.error('Failed to deactivate user');
    } finally {
      setIsDeactivating(false);
    }
  };

  if (currentUser?.role !== 'ADMIN') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300">lock</span>
            <p className="mt-3 text-slate-500 font-semibold">Access restricted to administrators</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">User Management</h1>
            <p className="text-slate-500 text-sm mt-1">{total} total users</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Search</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Name or email…"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Role</label>
            <select
              value={filterRole}
              onChange={e => { setFilterRole(e.target.value as UserRole | ''); setPage(1); }}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Status</label>
            <select
              value={filterActive}
              onChange={e => { setFilterActive(e.target.value as '' | 'true' | 'false'); setPage(1); }}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <button
            onClick={() => { setSearchInput(''); setSearch(''); setFilterRole(''); setFilterActive(''); setPage(1); }}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2">group_off</span>
              <p className="text-sm font-semibold">No users found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">User</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Job Title</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Last Login</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
                          {u.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">{u.fullName}</p>
                          <p className="text-slate-400 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${roleBadge[u.role]}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500">{u.jobTitle || '—'}</td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-400 text-xs">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                          title="Edit user"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        {u.isActive && u._id !== currentUser?.userId && (
                          <button
                            onClick={() => setDeactivateTarget(u)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors"
                            title="Deactivate user"
                          >
                            <span className="material-symbols-outlined text-base">person_off</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages} ({total} users)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditUser(null)} />
          <div className="bg-white rounded-[32px] w-full max-w-md relative shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-primary p-8 rounded-t-[32px] text-white">
              <h3 className="text-2xl font-black tracking-tighter">Edit User</h3>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1 truncate">
                {editUser.fullName}
              </p>
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role</label>
                <select
                  value={editForm.role ?? editUser.role}
                  onChange={e => setEditForm(f => ({ ...f, role: e.target.value as UserRole }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Job Title</label>
                <input
                  type="text"
                  value={editForm.jobTitle ?? ''}
                  onChange={e => setEditForm(f => ({ ...f, jobTitle: e.target.value }))}
                  placeholder="e.g. Site Manager"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active</label>
                <button
                  type="button"
                  onClick={() => setEditForm(f => ({ ...f, isActive: !(f.isActive ?? editUser.isActive) }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${(editForm.isActive ?? editUser.isActive) ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(editForm.isActive ?? editUser.isActive) ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditUser(null)}
                  className="flex-1 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-[2] py-3 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
                >
                  {isSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation */}
      {deactivateTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeactivateTarget(null)} />
          <div className="bg-white rounded-[32px] w-full max-w-sm relative shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
            <div className="bg-rose-600 p-8 text-white">
              <h3 className="text-2xl font-black tracking-tighter">Deactivate User</h3>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1 truncate">
                {deactivateTarget.fullName}
              </p>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-slate-600 text-sm">
                This will prevent <strong>{deactivateTarget.fullName}</strong> from logging in. You can reactivate them later by editing their profile.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeactivateTarget(null)}
                  className="flex-1 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivate}
                  disabled={isDeactivating}
                  className="flex-[2] py-3 bg-rose-600 text-white font-black rounded-2xl shadow-lg shadow-rose-600/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
                >
                  {isDeactivating ? 'Deactivating…' : 'Deactivate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
