import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFields, apiMessage } from '../../api/errors';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../components/ToastProvider';
import AuthShell from './AuthShell';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    if (!form.fullName.trim() || !form.email.trim() || !form.password) {
      setFieldErrors({
        fullName: !form.fullName.trim() ? 'Vui lòng nhập họ tên.' : '',
        email: !form.email.trim() ? 'Vui lòng nhập email.' : '',
        password: !form.password ? 'Vui lòng nhập mật khẩu.' : ''
      });
      return;
    }
    if (form.password.length < 6) {
      setFieldErrors({ password: 'Mật khẩu phải có ít nhất 6 ký tự.' });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp.' });
      return;
    }
    setSubmitting(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password
      });
      toast?.success('Tạo tài khoản thành công.');
      navigate('/home', { replace: true });
    } catch (err) {
      const fields = apiFields(err);
      const message = apiMessage(err, 'Không thể tạo tài khoản.');
      setFieldErrors(fields);
      setError(message);
      toast?.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Tạo tài khoản" subtitle="Bắt đầu không gian luyện Aptis với hồ sơ học tập an toàn.">
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="auth-alert auth-alert-error">{error}</div>}

        <label className="auth-field">
          <span>Họ và tên</span>
          <div className={`auth-input ${fieldErrors.fullName ? 'is-error' : ''}`}>
            <UserRound size={18} />
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Tên của bạn" />
          </div>
          {fieldErrors.fullName && <div className="field-error">{fieldErrors.fullName}</div>}
        </label>

        <label className="auth-field">
          <span>Email</span>
          <div className={`auth-input ${fieldErrors.email ? 'is-error' : ''}`}>
            <Mail size={18} />
            <input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ban@example.com" />
          </div>
          {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
        </label>

        <label className="auth-field">
          <span>Mật khẩu</span>
          <div className={`auth-input ${fieldErrors.password ? 'is-error' : ''}`}>
            <LockKeyhole size={18} />
            <input type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Tối thiểu 6 ký tự" />
            <button type="button" className="auth-icon-btn" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
        </label>

        <label className="auth-field">
          <span>Xác nhận mật khẩu</span>
          <div className={`auth-input ${fieldErrors.confirmPassword ? 'is-error' : ''}`}>
            <LockKeyhole size={18} />
            <input type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Nhập lại mật khẩu" />
          </div>
          {fieldErrors.confirmPassword && <div className="field-error">{fieldErrors.confirmPassword}</div>}
        </label>

        <button className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
        </button>

        <p className="text-center text-sm text-slate-500">
          Đã có tài khoản? <Link className="auth-link" to="/login">Đăng nhập</Link>
        </p>
      </form>
    </AuthShell>
  );
}
