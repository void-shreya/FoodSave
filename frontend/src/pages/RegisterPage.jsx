import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ErrorMessage from '../components/ErrorMessage';
import {
  HeartHandshake,
  Utensils,
  Truck,
  Building2,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Loader2,
  ShieldAlert
} from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRole = searchParams.get('role') || 'donor';

  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    organization_name: '',
    organization_type: 'RESTAURANT',
    registration_number: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (['donor', 'volunteer', 'ngo'].includes(initialRole)) {
      setRole(initialRole);
    }
  }, [initialRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password confirmation does not match');
      return;
    }

    if (role === 'ngo' && !formData.organization_name.trim()) {
      setError('Organization name is required for NGO accounts');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        role
      };

      const user = await register(payload);
      addToast(`Account created! Welcome to FoodSave, ${user.name}`, 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Navbar />

      <div className="container" style={{
        flex: 1,
        paddingTop: '2.5rem',
        paddingBottom: '4rem',
        maxWidth: '720px'
      }}>
        <div className="card" style={{ padding: '2.5rem 2rem', boxShadow: 'var(--shadow-xl)' }}>
          {/* Header */}
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
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Create Your FoodSave Account
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Choose your role in the food-rescue ecosystem
            </p>
          </div>

          {/* Role Selector UX */}
          <div style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ marginBottom: '0.8rem', display: 'block', textAlign: 'center' }}>
              "I want to..."
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px'
            }}>
              {/* Donor Option */}
              <button
                type="button"
                onClick={() => setRole('donor')}
                style={{
                  padding: '14px 10px',
                  borderRadius: 'var(--radius-lg)',
                  border: role === 'donor' ? '2px solid var(--primary)' : '1.5px solid var(--border-light)',
                  backgroundColor: role === 'donor' ? 'var(--primary-light)' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Utensils size={24} color={role === 'donor' ? 'var(--primary)' : '#64748b'} />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: role === 'donor' ? 'var(--primary)' : 'var(--text-primary)' }}>
                  Donate Food
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Restaurant / Host</span>
              </button>

              {/* Volunteer Option */}
              <button
                type="button"
                onClick={() => setRole('volunteer')}
                style={{
                  padding: '14px 10px',
                  borderRadius: 'var(--radius-lg)',
                  border: role === 'volunteer' ? '2px solid #0284c7' : '1.5px solid var(--border-light)',
                  backgroundColor: role === 'volunteer' ? '#f0f9ff' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Truck size={24} color={role === 'volunteer' ? '#0284c7' : '#64748b'} />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: role === 'volunteer' ? '#0284c7' : 'var(--text-primary)' }}>
                  Volunteer
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pickup & Courier</span>
              </button>

              {/* NGO Option */}
              <button
                type="button"
                onClick={() => setRole('ngo')}
                style={{
                  padding: '14px 10px',
                  borderRadius: 'var(--radius-lg)',
                  border: role === 'ngo' ? '2px solid #b45309' : '1.5px solid var(--border-light)',
                  backgroundColor: role === 'ngo' ? '#fffbeb' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Building2 size={24} color={role === 'ngo' ? '#b45309' : '#64748b'} />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: role === 'ngo' ? '#b45309' : 'var(--text-primary)' }}>
                  Represent NGO
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Shelter / Pantry</span>
              </button>
            </div>
          </div>

          {/* NGO Verification Notice */}
          {role === 'ngo' && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 16px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-md)',
              color: '#92400e',
              fontSize: '0.85rem',
              marginBottom: '1.5rem'
            }}>
              <ShieldAlert size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>NGO Verification Notice:</strong> Your NGO account may require administrator verification before accessing recurring high-volume distributions.
              </div>
            </div>
          )}

          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Sarah Jenkins"
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 0123"
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@org.org"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            {/* Passwords */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Password (min 8 chars) *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    minLength={8}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
            </div>

            {/* Organization Section for NGO or Business Donors */}
            {(role === 'ngo' || role === 'donor') && (
              <div style={{
                marginTop: '1.25rem',
                padding: '1.25rem',
                backgroundColor: 'var(--bg-main)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem'
              }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--text-primary)' }}>
                  {role === 'ngo' ? 'NGO Details *' : 'Organization Details (Optional for Businesses)'}
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Organization Name {role === 'ngo' ? '*' : ''}</label>
                    <input
                      type="text"
                      name="organization_name"
                      required={role === 'ngo'}
                      value={formData.organization_name}
                      onChange={handleChange}
                      placeholder={role === 'ngo' ? 'City Food Rescue Foundation' : 'e.g. Green Bistro'}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      name="organization_type"
                      value={formData.organization_type}
                      onChange={handleChange}
                      className="form-select"
                    >
                      {role === 'ngo' ? (
                        <option value="NGO">Non-Profit Organization (NGO)</option>
                      ) : (
                        <>
                          <option value="RESTAURANT">Restaurant / Café</option>
                          <option value="HOTEL">Hotel</option>
                          <option value="CATERER">Caterer / Banquet</option>
                          <option value="EVENT_ORGANIZER">Event Organizer</option>
                          <option value="GROCERY_STORE">Grocery / Bakery</option>
                          <option value="OTHER">Individual / Other</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Registration / Tax ID</label>
                  <input
                    type="text"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleChange}
                    placeholder="e.g. 501(c)(3) or Local Reg #"
                    className="form-input"
                  />
                </div>
              </div>
            )}

            {/* Address & City */}
            <div className="form-group">
              <label className="form-label">Street Address</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Community Way"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.8rem' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="San Francisco"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="CA"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="94103"
                  className="form-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.25rem', padding: '0.85rem' }}
            >
              {loading ? <Loader2 size={18} className="pulse" /> : <CheckCircle2 size={18} />}
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>
              Sign in here
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterPage;
