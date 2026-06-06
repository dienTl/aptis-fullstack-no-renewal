import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, FileText, Send, Trash2 } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

function formatDate(date) {
  return new Date(date).toLocaleDateString('vi-VN');
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function ExamReviews() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [form, setForm] = useState({ title: '', content: '', reviewDate: new Date().toISOString().slice(0, 10) });
  const [status, setStatus] = useState('');

  const reviewDays = useMemo(() => [...new Set(rows.map((row) => row.reviewDate))], [rows]);

  useEffect(() => { load(); }, []);

  async function load(date = filterDate) {
    const response = await api.get('/reviews', { params: date ? { date } : {} });
    setRows(response.data.data);
  }

  async function submit() {
    if (!form.title.trim() || !form.content.trim()) {
      setStatus('Vui lòng nhập tiêu đề và nội dung review.');
      return;
    }
    await api.post('/reviews', form);
    setForm({ title: '', content: '', reviewDate: new Date().toISOString().slice(0, 10) });
    setStatus('Đã đăng bài review.');
    setFilterDate('');
    await load('');
  }

  async function applyFilter() {
    await load(filterDate);
  }

  async function clearFilter() {
    setFilterDate('');
    await load('');
  }

  async function deleteReview(id) {
    if (!confirm('Xóa bài review này?')) return;
    await api.delete(`/admin/reviews/${id}`);
    setStatus('Đã xóa bài review.');
    await load(filterDate);
  }

  return (
    <div className="review-page grid gap-5 lg:grid-cols-[290px_1fr]">
      <aside className="review-sidebar panel">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
          <div className="brand-mark">A</div>
          <div className="text-xl font-black">Aptis keys</div>
        </div>

        <section className="space-y-4 border-b border-slate-200 py-6">
          <h2 className="text-xl font-black">Thông tin người dùng</h2>
          <div>
            <div className="font-bold">Tên</div>
            <div className="text-slate-500">{user?.fullName}</div>
          </div>
          <div>
            <div className="font-bold">Email</div>
            <div className="break-words text-slate-500">{user?.email}</div>
          </div>
          <div>
            <div className="font-bold">Vai trò</div>
            <div className="text-slate-500">{user?.role}</div>
          </div>
        </section>

        <section className="space-y-3 py-6">
          <h2 className="text-xl font-black">Chọn ngày review</h2>
          <label className="block font-bold">Lọc theo ngày</label>
          <input className="input" type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          <button className="btn btn-primary w-full" onClick={applyFilter}>Xem review</button>
          <button className="btn btn-muted w-full" onClick={clearFilter}>Xóa lọc</button>
        </section>

        <section className="border-t border-slate-200 pt-5">
          <h2 className="font-black">Ngày có review</h2>
          <div className="mt-3 space-y-2">
            {reviewDays.slice(0, 6).map((day) => (
              <button key={day} className="flex w-full items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-left text-sm font-semibold text-slate-700" onClick={() => { setFilterDate(day); load(day); }}>
                <CalendarDays size={16} /> {formatDate(day)}
              </button>
            ))}
            {reviewDays.length === 0 && <p className="text-sm text-slate-500">Chưa có ngày review.</p>}
          </div>
        </section>
      </aside>

      <main className="space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="page-title text-4xl font-black">Review đề thi Aptis</h1>
            <p className="mt-2 text-lg text-slate-600">Hãy đăng review bài thi của bạn để mọi người cùng xem nhé!</p>
          </div>
          <button className="btn btn-primary" onClick={clearFilter}>Tất cả ngày</button>
        </header>

        <section className="panel space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">Đăng bài review mới</h2>
            <button className="btn btn-primary" onClick={submit}><Send size={16} />Đăng bài review</button>
          </div>
          {status && <div className="rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">{status}</div>}
          <div className="grid gap-3 md:grid-cols-[1fr_180px]">
            <input className="input" placeholder="Tiêu đề review" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="input" type="date" value={form.reviewDate} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })} />
          </div>
          <textarea className="input min-h-28" placeholder="Nội dung review..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </section>

        <section className="panel">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">Danh sách review</h2>
            <span className="rounded-md bg-slate-900 px-3 py-1 text-sm font-bold text-white">{rows.length} bài</span>
          </div>

          <div className="space-y-4">
            {rows.map((row, index) => (
              <article key={row.id} className="review-item rounded-md bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-black text-slate-950"><FileText size={18} />Ngày {formatDate(row.reviewDate)} - Review #{rows.length - index}</h3>
                    <p className="text-sm text-slate-500">Người đăng: {row.user.fullName}</p>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <div>Đăng lúc: {formatTime(row.createdAt)} {formatDate(row.createdAt)}</div>
                    <span className="mt-2 inline-flex rounded-md bg-green-600 px-3 py-1 text-xs font-bold text-white">Đã duyệt</span>
                    {user?.role === 'ADMIN' && (
                      <button className="btn btn-muted mt-2 text-red-700" onClick={() => deleteReview(row.id)}><Trash2 size={15} />Xóa</button>
                    )}
                  </div>
                </div>
                <p className="mt-4 font-semibold text-slate-800">{row.title}</p>
                <p className="mt-2 whitespace-pre-wrap text-slate-600">{row.content}</p>
              </article>
            ))}
            {rows.length === 0 && <div className="rounded-md bg-slate-50 p-5 text-slate-500">Chưa có review nào.</div>}
          </div>
        </section>
      </main>
    </div>
  );
}
