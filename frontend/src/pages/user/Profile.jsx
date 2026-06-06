import { useState } from 'react';
import { Camera, KeyRound, Save } from 'lucide-react';
import { api } from '../../api/client';
import { assetUrl } from '../../api/urls';
import { useAuth } from '../../auth/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const avatarUrl = assetUrl(user?.avatar);

  async function updateProfile(e) {
    e.preventDefault();
    const response = await api.put('/users/me', { fullName });
    setUser(response.data.data);
    setMessage('Da cap nhat ho so');
  }

  async function uploadAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    const response = await api.post('/users/me/avatar', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    setUser(response.data.data);
    setMessage('Avatar uploaded');
  }

  async function changePassword(e) {
    e.preventDefault();
    await api.post('/users/me/change-password', passwords);
    setPasswords({ oldPassword: '', newPassword: '' });
    setMessage('Password changed');
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-black">Ho so</h1>
        <p className="text-slate-500">Manage your account information and password.</p>
      </div>

      {message && <div className="panel border-green-200 bg-green-50 text-green-800">{message}</div>}

      <section className="panel flex flex-col gap-4 text-center md:flex-row md:items-center md:text-left">
        <div className="mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-slate-200 text-2xl font-black text-slate-500 md:mx-0">
          {avatarUrl ? <img className="w-full h-full object-cover" src={avatarUrl} alt="avatar" /> : user?.fullName?.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold">{user?.email}</div>
          <div className="text-sm text-slate-500">{user?.role} - {user?.status}</div>
        </div>
        <label className="btn btn-muted w-full cursor-pointer md:w-auto">
          <Camera size={16} /> Upload avatar
          <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
        </label>
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <form className="panel space-y-3" onSubmit={updateProfile}>
          <h2 className="font-black flex items-center gap-2"><Save size={18} />Thong tin tai khoan</h2>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
          <button className="btn btn-primary w-full sm:w-auto">Luu ho so</button>
        </form>

        <form className="panel space-y-3" onSubmit={changePassword}>
          <h2 className="font-black flex items-center gap-2"><KeyRound size={18} />Change password</h2>
          <input className="input" type="password" value={passwords.oldPassword} onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })} placeholder="Current password" />
          <input className="input" type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} placeholder="New password" />
          <button className="btn btn-primary w-full sm:w-auto">Change password</button>
        </form>
      </section>
    </div>
  );
}
