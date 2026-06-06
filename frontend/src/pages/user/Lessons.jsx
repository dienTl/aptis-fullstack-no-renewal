import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api/client';

const tabs = ['ALL', 'READING', 'LISTENING', 'WRITING', 'SPEAKING', 'GRAMMAR'];

export default function Lessons() {
  const [lessons, setLessons] = useState([]);
  const [tab, setTab] = useState('ALL');

  useEffect(() => { api.get('/lessons').then((r) => setLessons(r.data.data)); }, []);

  const visible = useMemo(() => tab === 'ALL' ? lessons : lessons.filter((lesson) => lesson.type === tab), [lessons, tab]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">Bài học</h1>
        <p className="text-slate-500">Review theory and learning materials created by admin.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => <button key={item} className={`btn ${tab === item ? 'btn-primary' : 'btn-muted'}`} onClick={() => setTab(item)}>{item}</button>)}
      </div>
      <div className="grid lg:grid-cols-2 gap-3">
        {visible.map((lesson) => (
          <article className="panel" key={lesson.id}>
            <div className="text-sm font-bold text-blue-700">{lesson.type}</div>
            <h2 className="text-lg font-black">{lesson.title}</h2>
            <p className="text-slate-600 whitespace-pre-wrap mt-2">{lesson.content}</p>
          </article>
        ))}
        {visible.length === 0 && <div className="panel text-slate-500">No lessons yet.</div>}
      </div>
    </div>
  );
}
