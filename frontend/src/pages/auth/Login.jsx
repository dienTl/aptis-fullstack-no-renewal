import { useEffect, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { apiFields, apiMessage } from '../../api/errors';
import { useToast } from '../../components/ToastProvider';
import AuthShell from './AuthShell';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { user, loading, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);

  useEffect(() => {
    if (!loading && user) {
      navigate('/home', { replace: true });
    }
  }, [loading, navigate, user]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    if (!email.trim() || !password) {
      setFieldErrors({
        email: !email.trim() ? 'Vui lòng nhập email.' : '',
        password: !password ? 'Vui lòng nhập mật khẩu.' : ''
      });
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      toast?.success('Đăng nhập thành công.');
      navigate('/home', { replace: true });
    } catch (err) {
      const fields = apiFields(err);
      const message = apiMessage(err, 'Đăng nhập thất bại.');
      setFieldErrors(fields);
      setError(message);
      toast?.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Chào mừng trở lại" subtitle="Đăng nhập để tiếp tục luyện tập và theo dõi tiến độ Aptis của bạn.">
      <form onSubmit={submit} className="space-y-4" autoComplete="off">
        {error && <div className="auth-alert auth-alert-error">{error}</div>}

        <label className="auth-field">
          <span>Email</span>
          <div className={`auth-input ${fieldErrors.email ? 'is-error' : ''}`}>
            <Mail size={18} />
            <input
              name="aptis-login-account-no-autofill"
              type="email"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@example.com"
            />
          </div>
          {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
        </label>

        <label className="auth-field">
          <span>Mật khẩu</span>
          <div className={`auth-input ${fieldErrors.password ? 'is-error' : ''}`}>
            <LockKeyhole size={18} />
            <input
              name="aptis-login-password-no-autofill"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
            />
            <button type="button" className="auth-icon-btn" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
        </label>

        <div className="flex justify-end text-sm">
          <Link className="auth-link" to="/forgot-password">Quên mật khẩu?</Link>
        </div>

        <button className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <p className="text-center text-sm text-slate-500">
          Chưa có tài khoản? <Link className="auth-link" to="/register">Đăng ký ngay</Link>
        </p>
      </form>
    </AuthShell>
  );
}
