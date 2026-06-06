import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, FileText, Headphones, Mic, PenLine, Sparkles } from 'lucide-react';
import { api } from '../../api/client';
import { examDurationMinutes } from '../../utils/examDuration';

const modules = {
  reading: {
    type: 'READING',
    title: 'Reading',
    subtitle: 'Luyện đọc, tìm ý chính và xử lý thông tin nhanh.',
    Icon: BookOpen,
    tone: 'from-teal-600 via-emerald-500 to-lime-400',
    soft: 'bg-teal-50 text-teal-700',
    chip: 'Reading practice'
  },
  listening: {
    type: 'LISTENING',
    title: 'Listening',
    subtitle: 'Luyện nghe theo từng đề, nắm ý và chọn đáp án chính xác.',
    Icon: Headphones,
    tone: 'from-blue-600 via-sky-500 to-cyan-400',
    soft: 'bg-blue-50 text-blue-700',
    chip: 'Listening practice'
  },
  writing: {
    type: 'WRITING',
    title: 'Writing',
    subtitle: 'Luyện viết câu trả lời rõ ý, đúng bố cục và đúng thời gian.',
    Icon: PenLine,
    tone: 'from-amber-500 via-orange-500 to-rose-400',
    soft: 'bg-amber-50 text-amber-700',
    chip: 'Writing practice'
  },
  speaking: {
    type: 'SPEAKING',
    title: 'Speaking',
    subtitle: 'Luyện nói theo đề, tăng phản xạ và độ tự tin.',
    Icon: Mic,
    tone: 'from-rose-500 via-pink-500 to-fuchsia-500',
    soft: 'bg-rose-50 text-rose-700',
    chip: 'Speaking practice'
  },
  grammar: {
    type: 'GRAMMAR',
    title: 'Grammar',
    subtitle: 'Ôn ngữ pháp và cấu trúc thường gặp trong bài thi.',
    Icon: BookOpen,
    tone: 'from-indigo-600 via-violet-500 to-purple-400',
    soft: 'bg-indigo-50 text-indigo-700',
    chip: 'Grammar practice'
  }
};

export default function ModuleList() {
  const { module } = useParams();
  const config = modules[module] || modules.reading;
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/exams', { params: { type: config.type } }).then((r) => setItems(r.data.data));
  }, [config.type]);

  const totals = useMemo(() => {
    const questions = items.reduce((sum, exam) => sum + (exam.questions?.length || 0), 0);
    const minutes = items.reduce((sum, exam) => sum + examDurationMinutes(exam), 0);
    return { questions, minutes };
  }, [items]);

  const Icon = config.Icon;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className={`h-2 bg-gradient-to-r ${config.tone}`} />
        <div className="grid gap-0 lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-6 md:p-8">
            <div className={`mb-4 inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-bold ${config.soft}`}>
              <Sparkles size={16} />{config.chip}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className={`flex h-16 w-16 items-center justify-center rounded-lg ${config.soft}`}>
                <Icon size={30} />
              </div>
              <div>
                <h1 className="page-title text-4xl font-black">{config.title}</h1>
                <p className="mt-1 max-w-2xl text-slate-500">{config.subtitle}</p>
              </div>
            </div>
          </div>
          <div className={`grid grid-cols-3 gap-px bg-slate-200 lg:border-l lg:border-slate-200`}>
            <Stat label="Đề thi" value={items.length} />
            <Stat label="Câu hỏi" value={totals.questions} />
            <Stat label="Phút" value={totals.minutes} />
          </div>
        </div>
      </section>

      {items.length === 0 ? (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white/80 p-8 text-center shadow-sm">
          <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg ${config.soft}`}>
            <FileText size={25} />
          </div>
          <div className="text-lg font-black">Chưa có đề {config.title}</div>
          <p className="mt-1 text-sm text-slate-500">Admin có thể tạo đề trong dashboard.</p>
        </section>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((exam, index) => (
            <Link key={exam.id} to={`/${module}/${exam.id}`} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
              <div className={`h-1.5 bg-gradient-to-r ${config.tone}`} />
              <div className="p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${config.soft}`}>
                    <FileText size={21} />
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">#{index + 1}</span>
                </div>
                <div className="min-h-14">
                  <div className="text-lg font-black text-slate-900">{exam.title}</div>
                  {exam.prompt && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{exam.prompt}</p>}
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1"><Clock size={14} />{examDurationMinutes(exam)} phút</span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1"><FileText size={14} />{exam.questions?.length || 0} câu hỏi</span>
                </div>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700">
                  Vào làm bài <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white/80 p-5 text-center lg:grid lg:place-items-center">
      <div>
        <div className="text-3xl font-black text-slate-900">{value}</div>
        <div className="mt-1 text-xs font-bold uppercase text-slate-500">{label}</div>
      </div>
    </div>
  );
}
