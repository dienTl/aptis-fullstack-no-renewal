import { BookOpenCheck, ShieldCheck } from 'lucide-react';

export default function AuthShell({ title, subtitle, children }) {
  return (
    <main className="auth-page">
      <section className="auth-hero" aria-label="Aptis learning">
        <div className="auth-brand">
          <span className="auth-brand-mark"><BookOpenCheck size={24} /></span>
          <span>AptisKey</span>
        </div>
        <div className="auth-copy">
          <span className="auth-kicker"><ShieldCheck size={16} /> Tài khoản học tập an toàn</span>
          <h1>Luyện Aptis tập trung hơn mỗi ngày.</h1>
          <p>Quản lý bài thi, bài luyện tập, lịch ôn và tiến độ học trong một không gian gọn gàng.</p>
        </div>
      </section>

      <section className="auth-form-wrap">
        <div className="auth-card">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
