import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Clock, FileText, Headphones, Layers3, Mic, PenLine } from 'lucide-react';
import { api } from '../../api/client';
import { examDurationMinutes } from '../../utils/examDuration';

const skills = {
  mixed: { title: 'Mixed Skills', type: 'MIXED', Icon: Layers3, tone: 'from-violet-600 to-sky-500', soft: 'bg-violet-50 text-violet-700' },
  listening: { title: 'Listening', type: 'LISTENING', Icon: Headphones, tone: 'from-blue-600 to-cyan-500', soft: 'bg-blue-50 text-blue-700' },
  reading: { title: 'Reading', type: 'READING', Icon: BookOpen, tone: 'from-teal-600 to-emerald-500', soft: 'bg-teal-50 text-teal-700' },
  writing: { title: 'Writing', type: 'WRITING', Icon: PenLine, tone: 'from-amber-500 to-orange-500', soft: 'bg-amber-50 text-amber-700' },
  speaking: { title: 'Speaking', type: 'SPEAKING', Icon: Mic, tone: 'from-rose-500 to-pink-500', soft: 'bg-rose-50 text-rose-700' }
};

export default function PracticeSkill() {
  const { skill } = useParams();
  const current = skills[skill];
  const [exams, setExams] = useState([]);

  useEffect(() => {
    if (current) api.get('/practice-exams', { params: { type: current.type } }).then((r) => setExams(r.data.data));
  }, [current]);

  if (!current) return <Navigate to="/practice" replace />;

  const Icon = current.Icon;

  return (
    <div className="space-y-5">
      <Link to="/practice" className="btn btn-muted w-fit"><ArrowLeft size={16} />Quay lại</Link>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className={`h-2 bg-gradient-to-r ${current.tone}`} />
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-lg ${current.soft}`}>
              <Icon size={27} />
            </div>
            <div>
              <h1 className="page-title text-3xl font-black">Luyện thi {current.title}</h1>
              <p className="mt-1 text-sm text-slate-500">{exams.length} de dang co san</p>
            </div>
          </div>
        </div>
      </section>

      {exams.length === 0 ? (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white/80 p-8 text-center shadow-sm">
          <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg ${current.soft}`}>
            <FileText size={25} />
          </div>
          <div className="text-lg font-black">Chưa có đề luyện thi</div>
          <p className="mt-1 text-sm text-slate-500">Admin có thể tạo đề trong dashboard.</p>
        </section>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <Link key={exam.id} to={`/practice/${skill}/${exam.id}`} className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${current.soft}`}>
                  <FileText size={20} />
                </div>
                <ArrowRight className="mt-2 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" size={18} />
              </div>
              <div className="text-lg font-black text-slate-900">{exam.title}</div>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1"><Clock size={14} />{examDurationMinutes(exam)} phút</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1"><FileText size={14} />{exam.questions?.length || 0} câu hỏi</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
