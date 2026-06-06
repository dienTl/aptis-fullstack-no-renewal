import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function Notifications() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get('/notifications').then((r) => setRows(r.data.data)); }, []);
  return (
    <div>
      <h1 className="text-2xl font-black mb-4">Thông báo</h1>
      <div className="space-y-2">{rows.map((n) => <div className="panel" key={n.id}><b>{n.title}</b><p>{n.content}</p></div>)}</div>
    </div>
  );
}
