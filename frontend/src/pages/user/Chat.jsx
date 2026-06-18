import { useEffect, useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

export default function Chat() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [receiverId, setReceiverId] = useState('');
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('');

  const activeReceiverId = Number(receiverId);
  const visibleMessages = useMemo(() => messages.filter((m) => {
    if (!user || !activeReceiverId) return false;
    return (m.sender.id === user.id && m.receiver.id === activeReceiverId)
      || (m.sender.id === activeReceiverId && m.receiver.id === user.id);
  }), [messages, activeReceiverId, user]);

  useEffect(() => {
    api.get('/chat/users').then((response) => {
      const data = response.data.data || [];
      setContacts(data);
      setReceiverId((current) => current || String(data[0]?.id || ''));
    }).catch(() => setStatus('Cannot load chat users.'));
  }, []);

  useEffect(() => {
    if (activeReceiverId) load();
  }, [activeReceiverId]);

  async function load() {
    try {
      const response = await api.get(`/messages/${activeReceiverId}`);
      setMessages((current) => {
        const merged = [...current];
        response.data.data.forEach((message) => {
          if (!merged.some((item) => item.id === message.id)) merged.push(message);
        });
        return merged.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      });
    } catch {
      setStatus('Cannot load chat history.');
    }
  }

  async function send() {
    if (!content.trim() || !activeReceiverId) return;
    const text = content.trim();
    setContent('');
    setStatus('');
    try {
      const response = await api.post('/messages', { receiverId: activeReceiverId, content: text });
      const message = response.data.data;
      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) return current;
        return [...current, message].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      });
    } catch (error) {
      setContent(text);
      setStatus(error.response?.data?.message || 'Cannot send message.');
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-black">Chat</h1>
        <span className="text-sm font-bold text-slate-500">Manual refresh</span>
      </div>
      {status && <div className="panel border-red-200 bg-red-50 text-red-800">{status}</div>}

      <div className="panel flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <select className="input min-w-0 sm:max-w-md" value={receiverId} onChange={(e) => setReceiverId(e.target.value)}>
          <option value="">Chọn người dùng</option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>{contact.fullName} - {contact.email} - {contact.role}</option>
          ))}
        </select>
        <button className="btn btn-muted w-full sm:w-auto" onClick={load}>Load history</button>
      </div>

      <div className="panel min-h-72 space-y-2">
        {visibleMessages.map((m) => (
          <div key={m.id} className={`flex ${m.sender.id === user?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] break-words rounded-lg px-3 py-2 sm:max-w-[75%] ${m.sender.id === user?.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
              <div className="text-xs font-bold opacity-80">{m.sender.fullName}</div>
              <div>{m.content}</div>
            </div>
          </div>
        ))}
        {visibleMessages.length === 0 && <div className="text-sm text-slate-500">No messages yet.</div>}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className="input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          placeholder="Message"
        />
        <button className="btn btn-primary w-full sm:w-auto" disabled={!activeReceiverId || !content.trim()} onClick={send}><Send size={16} />Send</button>
      </div>
    </div>
  );
}
