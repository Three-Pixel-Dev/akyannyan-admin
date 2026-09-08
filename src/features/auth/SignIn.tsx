import { useState } from 'react';
import { LogoMark } from '../../components/ui';
import { authService } from './services/auth.service';

interface SignInProps {
  onSuccess: () => void;
}

export function SignIn({ onSuccess }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('ကျေးဇူးပြု၍ အီးမေးလ်နှင့် စကားဝှက်ကို ထည့်သွင်းပါ (Please enter email and password).');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await authService.login({ email: email.trim(), password });
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'ဝင်ရောက်မှု မအောင်မြင်ပါ (Login failed). Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@akyannyan.com');
    setPassword('adminpassword123');
    setErrorMessage(null);
  };

  return (
    <div className="signin-container">
      <div className="signin-backdrop" aria-hidden="true" />
      <div className="signin-card">
        <div className="signin-header">
          <div className="signin-brand">
            <LogoMark />
            <div>
              <span className="brand-title">အကြံဉာဏ်</span>
              <span className="brand-subtitle">AKYAN NYAN · ADMIN PORTAL</span>
            </div>
          </div>
          <h1>မင်္ဂလာပါ Admin</h1>
          <p className="signin-description">
            Akyannyan စီမံခန့်ခွဲမှုစနစ်သို့ ဝင်ရောက်ရန် သင်၏ Admin အကောင့်ဖြင့် Sign In ပြုလုပ်ပါ။
          </p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger" role="alert" aria-live="assertive">
            <span className="alert-icon" aria-hidden="true">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="signin-form" noValidate>
          <div className="form-group">
            <label htmlFor="admin-email">အီးမေးလ် (Email Address)</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@akyannyan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="admin-password">စကားဝှက် (Password)</label>
            </div>
            <div className="password-input-wrapper">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="form-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? '👁' : '👁‍🗨'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="button jade signin-submit-button"
            disabled={loading}
          >
            {loading ? (
              <span className="button-loading">
                <span className="spinner" aria-hidden="true" /> စစ်ဆေးနေပါသည်...
              </span>
            ) : (
              'အကောင့်ဝင်မည် (Sign In) ›'
            )}
          </button>
        </form>

        <div className="demo-credentials-box">
          <p className="eyebrow">QUICK ACCESS / စမ်းသပ်ရန်</p>
          <div className="demo-credentials-content">
            <div>
              <small>Email: <b>admin@akyannyan.com</b></small>
              <br />
              <small>Password: <b>adminpassword123</b></small>
            </div>
            <button
              type="button"
              className="button ghost demo-fill-button"
              onClick={handleFillDemo}
            >
              အသင့်ဖြည့်မည် (Auto Fill)
            </button>
          </div>
        </div>

        <div className="signin-footer">
          <small>© 2026 Akyannyan Platform · High Protection Security</small>
        </div>
      </div>
    </div>
  );
}
