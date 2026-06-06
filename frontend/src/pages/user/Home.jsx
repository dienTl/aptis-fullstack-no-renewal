import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Bell, BookOpen, Calculator, Headphones, Lightbulb, Mic, PenLine } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

const modules = [
  { to: '/reading', title: 'Reading', icon: BookOpen, text: 'Practice question sets, submit answers, and review explanations.' },
  { to: '/listening', title: 'Listening', icon: Headphones, text: 'Listen to audio tests, answer câu hỏi, and view transcripts.' },
  { to: '/writing', title: 'Writing', icon: PenLine, text: 'Write essays and receive AI grammar, vocabulary, and coherence feedback.' },
  { to: '/speaking', title: 'Speaking', icon: Mic, text: 'Record speaking answers and review pronunciation feedback.' },
  { to: '/grammar', title: 'Grammar', icon: BookOpen, text: 'Train grammar with multiple-choice quizzes and saved history.' }
];

export default function Home() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/notifications').then((r) => setNotifications(r.data.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div className="space-y-5">
      <section className="panel bg-[linear-gradient(135deg,#ffffff_0%,#eef7ff_58%,#fff4df_100%)]">
        <p className="text-sm font-semibold text-teal-700">Aptis practice dashboard</p>
        <h1 className="page-title text-3xl font-black mt-1">Welcome back, {user?.fullName || 'learner'}</h1>
        <p className="text-slate-600 mt-2 max-w-2xl">Choose a skill, continue your recent practice, and track your progress from one place.</p>
      </section>

      <section>
        <Link to="/history" className="panel flex items-center gap-3 hover:border-blue-400">
          <BarChart3 className="text-blue-600" />
          <div>
            <b>Learning history</b>
            <p className="text-sm text-slate-500">View all submitted tests</p>
          </div>
        </Link>
      </section>

      <section>
        <h2 className="text-xl font-black mb-3">Practice modules</h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {modules.map(({ to, title, icon: Icon, text }) => (
            <Link key={to} to={to} className="panel hover:border-blue-400">
              <div className="flex items-center gap-2 font-bold"><Icon size={20} className="text-blue-600" />{title}</div>
              <p className="text-sm text-slate-500 mt-2">{text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-amber-50 text-amber-600">
            <Lightbulb size={22} />
          </span>
          <div>
            <h2 className="text-xl font-black">Học mẹo</h2>
            <p className="text-sm text-slate-500">Xem mẹo học Reading, Listening, Writing và Speaking.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:justify-end">
          <Link to="/tips#reading" className="btn btn-muted"><BookOpen size={16} />Reading</Link>
          <Link to="/tips#listening" className="btn btn-muted"><Headphones size={16} />Listening</Link>
          <Link to="/tips#writing" className="btn btn-muted"><PenLine size={16} />Writing</Link>
          <Link to="/tips#speaking" className="btn btn-muted"><Mic size={16} />Speaking</Link>
          <Link to="/tips#grammar" className="btn btn-muted"><BookOpen size={16} />Grammar</Link>
        </div>
      </section>

      <section>
        <div className="panel">
          <h2 className="font-black mb-2 flex items-center gap-2"><Bell size={18} />Notifications</h2>
          {notifications.length === 0 && <p className="text-sm text-slate-500">No notifications.</p>}
          {notifications.map((row) => (
            <div key={row.id} className="border-b py-2">
              <b>{row.title}</b>
              <p className="text-sm text-slate-500">{row.content}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Link to="/aptis-score" className="panel flex items-center gap-3 hover:border-blue-400">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-50 text-cyan-700">
            <Calculator size={22} />
          </span>
          <div>
            <b>Cách tính điểm Aptis</b>
            <p className="text-sm text-slate-500">Xem bảng quy đổi bậc, công thức tổng điểm và ví dụ Overall.</p>
          </div>
        </Link>
      </section>
    </div>
  );
}
