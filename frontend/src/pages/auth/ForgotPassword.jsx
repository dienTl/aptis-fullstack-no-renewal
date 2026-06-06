import { useState } from 'react';
import { Eye, EyeOff, KeyRound, LockKeyhole, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { apiFields, apiMessage } from '../../api/errors';
import { useToast } from '../../components/ToastProvider';
import AuthShell from './AuthShell';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState('request');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const toast = useToast();

  async function sendOtp(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setMessage('');
    if (!email.trim()) {
      setFieldErrors({ email: 'Vui lòng nhập email.' });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setStep('reset');
      const successMessage = 'Nếu email tồn tại, mã OTP 6 số đã được gửi. Vui lòng kiểm tra hộp thư.';
      setMessage(successMessage);
      toast?.success(successMessage);
    } catch (err) {
      const message = apiMessage(err, 'Chưa thể gửi OTP lúc này.');
      setFieldErrors(apiFields(err));
      setError(message);
      toast?.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function resetPassword(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setMessage('');
    if (!otp.trim() || !newPassword || !confirmPassword) {
      setFieldErrors({
        otp: !otp.trim() ? 'Vui lòng nhập OTP.' : '',
        newPassword: !newPassword ? 'Vui lòng nhập mật khẩu mới.' : '',
        confirmPassword: !confirmPassword ? 'Vui lòng xác nhận mật khẩu.' : ''
      });
      return;
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      setFieldErrors({ otp: 'OTP phải gồm 6 chữ số.' });
      return;
    }
    if (newPassword.length < 6) {
      setFieldErrors({ newPassword: 'Mật khẩu phải có ít nhất 6 ký tự.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp.' });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { email: email.trim(), otp: otp.trim(), newPassword });
      setStep('done');
      const successMessage = 'Đổi mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.';
      setMessage(successMessage);
      toast?.success(successMessage);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const message = apiMessage(err, 'Không thể đổi mật khẩu.');
      setFieldErrors(apiFields(err));
      setError(message);
      toast?.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Đặt lại mật khẩu" subtitle="Dùng OTP gửi về email để tạo mật khẩu mới. OTP hết hạn sau 10 phút.">
      <div className="mb-5 grid grid-cols-3 gap-2 text-xs font-bold">
        <span className={`auth-step ${step === 'request' ? 'is-active' : ''}`}>Email</span>
        <span className={`auth-step ${step === 'reset' ? 'is-active' : ''}`}>OTP</span>
        <span className={`auth-step ${step === 'done' ? 'is-active' : ''}`}>Xong</span>
      </div>

      {error && <div className="auth-alert auth-alert-error mb-4">{error}</div>}
      {message && <div className="auth-alert auth-alert-success mb-4">{message}</div>}

      {step !== 'done' && (
        <form onSubmit={step === 'request' ? sendOtp : resetPassword} className="space-y-4">
          <label className="auth-field">
            <span>Email</span>
            <div className={`auth-input ${fieldErrors.email ? 'is-error' : ''}`}>
              <Mail size={18} />
              <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@example.com" disabled={step === 'reset'} />
            </div>
            {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
          </label>

          {step === 'reset' && (
            <>
              <label className="auth-field">
                <span>Mã OTP</span>
                <div className={`auth-input ${fieldErrors.otp ? 'is-error' : ''}`}>
                  <KeyRound size={18} />
                  <input inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="OTP 6 số" />
                </div>
                {fieldErrors.otp && <div className="field-error">{fieldErrors.otp}</div>}
              </label>

              <label className="auth-field">
                <span>Mật khẩu mới</span>
                <div className={`auth-input ${fieldErrors.newPassword ? 'is-error' : ''}`}>
                  <LockKeyhole size={18} />
                  <input type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự" />
                  <button type="button" className="auth-icon-btn" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.newPassword && <div className="field-error">{fieldErrors.newPassword}</div>}
              </label>

              <label className="auth-field">
                <span>Xác nhận mật khẩu</span>
                <div className={`auth-input ${fieldErrors.confirmPassword ? 'is-error' : ''}`}>
                  <LockKeyhole size={18} />
                  <input type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu mới" />
                </div>
                {fieldErrors.confirmPassword && <div className="field-error">{fieldErrors.confirmPassword}</div>}
              </label>
            </>
          )}

          <button className="btn btn-primary w-full" disabled={submitting}>
            {step === 'request' ? (submitting ? 'Đang gửi OTP...' : 'Gửi OTP') : (submitting ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu')}
          </button>

          {step === 'reset' && (
            <button type="button" className="btn btn-muted w-full" disabled={submitting} onClick={sendOtp}>
              Gửi lại OTP
            </button>
          )}
        </form>
      )}

      <p className="mt-5 text-center text-sm text-slate-500">
        Nhớ mật khẩu rồi? <Link className="auth-link" to="/login">Quay lại đăng nhập</Link>
      </p>
    </AuthShell>
  );
}
