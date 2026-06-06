import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, Bell, BookOpen, ClipboardList, GraduationCap, Headphones, Home, Lightbulb, LogOut, Menu, MessageSquare, Mic, PenLine, Shield, Target, User, X } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const items = [
  ['/home', 'Trang chủ', Home],
  ['/practice', 'Luyện thi', Target],
  ['/tips', 'Mẹo học', Lightbulb],
  ['/reading', 'Đọc', BookOpen],
  ['/listening', 'Nghe', Headphones],
  ['/writing', 'Viết', PenLine],
  ['/speaking', 'Nói', Mic],
  ['/grammar', 'Ngữ pháp', BookOpen],
  ['/lessons', 'Bài học', GraduationCap],
  ['/history', 'Lịch sử', BarChart3],
  ['/reviews', 'Review', ClipboardList],
  ['/notifications', 'Thông báo', Bell],
  ['/chat', 'Trò chuyện', MessageSquare],
  ['/profile', 'Hồ sơ', User]
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="app-shell grid md:grid-cols-[260px_minmax(0,1fr)]">
      <header className="mobile-topbar md:hidden">
        <div className="brand text-lg font-black">
          <span className="brand-mark">A</span>
          <span>Aptis key</span>
        </div>
        <button className="mobile-menu-button" type="button" aria-label="Bật/tắt menu điều hướng" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <aside className={`sidebar p-4 ${menuOpen ? 'is-open' : ''}`}>
        <div className="brand mb-5 hidden text-xl font-black md:flex">
          <span className="brand-mark">A</span>
          <span>Aptis key</span>
        </div>
        <div className="nav-list space-y-1">
          {items.map(([to, label, Icon]) => (
            <NavLink key={to} className="nav-link flex items-center gap-2" to={to} onClick={closeMenu}><Icon size={18} />{label}</NavLink>
          ))}
          {user?.role === 'ADMIN' && <NavLink className="nav-link flex items-center gap-2" to="/admin" onClick={closeMenu}><Shield size={18} />Admin</NavLink>}
        </div>
        <div className="user-card mt-8 pt-4">
          <div className="flex items-center gap-2 text-sm font-semibold"><User size={18} />{user?.fullName}</div>
          <div className="text-xs opacity-75 mt-1">{user?.role}</div>
          <button className="btn btn-muted mt-3 w-full" onClick={() => { logout(); navigate('/login'); }}><LogOut size={16} />Đăng xuất</button>
        </div>
      </aside>
      <main className="main-surface p-4 md:p-6"><Outlet /></main>
    </div>
  );
}
