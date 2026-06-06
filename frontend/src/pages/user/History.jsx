import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function History() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get('/exams/history/me').then((r) => setRows(r.data.data)); }, []);
  return (
    <div>
      <h1 className="text-2xl font-black mb-4">Learning history</h1>
      <div className="panel overflow-x-auto">
        <table className="min-w-[640px] w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="pb-2">Exam</th>
              <th className="pb-2">Score</th>
              <th className="pb-2">Submitted</th>
              <th className="pb-2">Action</th>
            </tr>
          </thead>
          <tbody>{rows.map((r) => <tr key={r.id} className="border-b"><td className="py-2">{r.examTitle}</td><td>{Math.round(r.score)}/50{r.cefrLevel ? ` - ${r.cefrLevel}` : ''}</td><td>{new Date(r.submittedAt).toLocaleString()}</td><td><Link className="btn btn-muted" to={`/review/${r.examId}`}>Luyện lại</Link></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
