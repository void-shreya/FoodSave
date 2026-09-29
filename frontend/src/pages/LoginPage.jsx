import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ErrorMessage from '../components/ErrorMessage';
import { HeartHandshake, LogIn, Lock, Mail, Sparkles, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      addToast(`Welcome back, ${user.name}!`, 'success');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail) => {
    setError('');
    setLoading(true);
    try {
      const user = await login(demoEmail, 'Password123!');
      addToast(`Logged in as demo ${user.role} (${user.name})`, 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Navbar />

      <div className="container" style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '3rem',
        paddingBottom: '4rem'
      }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>
          {/* Card */}
          <div className="card" style={{ padding: '2.5rem 2rem', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                margin: '0 auto 1rem',
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)'
              }}>
                <HeartHandshake size={30} />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Sign In to FoodSave
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Join our mission to rescue food and feed communities
              </p>
            </div>

            {error && <ErrorMessage message={error} />}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.org"
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Password</label>
                  <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}
              >
                {loading ? <Loader2 size={18} className="pulse" /> : <LogIn size={18} />}
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            {/* Quick Demo Logins Section */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                marginBottom: '10px',
                textTransform: 'uppercase'
              }}>
                <Sparkles size={14} color="var(--primary)" />
                1-Click Demo Accounts (Password: Password123!)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('donor@foodsave.org')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
                >
                  🥗 Demo Donor
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('volunteer@foodsave.org')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
                >
                  🚴 Demo Volunteer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('ngo@foodsave.org')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
                >
                  🤝 Demo NGO
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin@foodsave.org')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
                >
                  🛡️ Demo Admin
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Don't have an account yet?{' '}
              <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                Register here
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;
