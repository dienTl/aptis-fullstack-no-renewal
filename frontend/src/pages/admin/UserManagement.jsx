import { api } from '../../api/client';

export default function UserManagement({ users, refresh, setStatus }) {
  async function toggleUserStatus(user) {
    try {
      await api.patch(`/admin/users/${user.id}/status`, null, {
        params: { status: user.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED' }
      });
      await refresh();
    } catch (error) {
      setStatus({ type: 'error', text: error.response?.data?.message || 'Khong the cap nhat trang thai user.' });
    }
  }

  return (
    <section className="panel">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-black text-slate-950">Nguoi dung</h2>
          <p className="text-sm font-semibold text-slate-500">{users.length} tai khoan trong he thong</p>
        </div>
      </div>
      <div className="space-y-3">
        {users.map((user) => {
          const initial = (user.fullName || user.email || '?').trim().charAt(0).toUpperCase();

          return (
            <div key={user.id} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="flex min-w-0 gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-black text-blue-700 ring-1 ring-blue-100">
                  {initial}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-lg font-black text-slate-950">{user.fullName || 'Chua co ten'}</div>
                  <div className="break-words text-sm font-medium text-slate-500">{user.email}</div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{user.role}</span>
                    <span className={`rounded-full px-3 py-1 ${user.status === 'LOCKED' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>{user.status}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <button className="btn btn-muted w-full justify-center" onClick={() => toggleUserStatus(user)}>
                  {user.status === 'LOCKED' ? 'Mo khoa' : 'Khoa'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
