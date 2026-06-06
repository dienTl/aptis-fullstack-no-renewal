import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Headphones, Layers3, Mic, PenLine, Target } from 'lucide-react';

const skills = [
  {
    to: '/practice/mixed',
    title: 'Mixed Skills',
    desc: 'De tong hop nhieu ky nang trong cung mot bai luyen.',
    Icon: Layers3,
    tone: 'from-violet-600 to-sky-500',
    soft: 'bg-violet-50 text-violet-700'
  },
  {
    to: '/practice/listening',
    title: 'Listening',
    desc: 'Bộ đề nghe riêng cho mục Luyện thi.',
    Icon: Headphones,
    tone: 'from-blue-600 to-cyan-500',
    soft: 'bg-blue-50 text-blue-700'
  },
  {
    to: '/practice/reading',
    title: 'Reading',
    desc: 'Bo de doc rieng, tach khoi muc Reading cu.',
    Icon: BookOpen,
    tone: 'from-teal-600 to-emerald-500',
    soft: 'bg-teal-50 text-teal-700'
  },
  {
    to: '/practice/writing',
    title: 'Writing',
    desc: 'Bộ đề viết riêng để luyện cấu trúc bài.',
    Icon: PenLine,
    tone: 'from-amber-500 to-orange-500',
    soft: 'bg-amber-50 text-amber-700'
  },
  {
    to: '/practice/speaking',
    title: 'Speaking',
    desc: 'Bo de noi rieng de luyen phan hoi nhanh.',
    Icon: Mic,
    tone: 'from-rose-500 to-pink-500',
    soft: 'bg-rose-50 text-rose-700'
  }
];

export default function Practice() {
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.3fr_.7fr]">
          <div className="p-6 md:p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
              <Target size={16} />Luyện thi
            </div>
            <h1 className="page-title text-3xl font-black md:text-4xl">Chọn kỹ năng muốn luyện</h1>
            <p className="mt-3 max-w-2xl text-slate-500">
              Khu vuc nay dung bo de rieng cho luyen thi, giup ban tach noi dung on tap voi cac muc bai hoc ben ngoai.
            </p>
          </div>
          <div className="hidden min-h-48 bg-gradient-to-br from-blue-600 via-teal-500 to-amber-400 lg:block" />
        </div>
      </section>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {skills.map(({ to, title, desc, Icon, tone, soft }) => (
          <Link key={to} to={to} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
            <div className={`h-2 bg-gradient-to-r ${tone}`} />
            <div className="p-5">
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-lg ${soft}`}>
                <Icon size={23} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-xl font-black text-slate-900">{title}</div>
                <ArrowRight className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" size={18} />
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
