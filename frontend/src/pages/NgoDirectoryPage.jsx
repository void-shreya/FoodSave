import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import api from '../services/api';
import {
  Building2,
  ShieldCheck,
  MapPin,
  FileText,
  Users,
  ExternalLink
} from 'lucide-react';

const NgoDirectoryPage = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNgos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ngos');
      if (res.data?.success) {
        setNgos(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load NGO partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgos();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fcfdfc' }}>
      <Navbar />

      <section style={{
        background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
        padding: '3.5rem 0 2.5rem',
        borderBottom: '1px solid var(--border-light)',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.8rem' }}>
            Verified Partner NGOs & Pantries
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
            Meet the dedicated charitable organizations, shelters, and community dining centers distributing rescued food every day.
          </p>
        </div>
      </section>

      <div className="container-wide" style={{ flex: 1, padding: '3rem 1.5rem' }}>
        {loading ? (
          <LoadingSpinner message="Loading NGO partners..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchNgos} />
        ) : ngos.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No NGO partners found"
            description="Our partner onboarding is actively underway."
          />
        ) : (
          <div className="grid grid-cols-3">
            {ngos.map(ngo => (
              <div key={ngo.id} className="card card-glass" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Building2 size={24} />
                  </div>
                  <span className="badge badge-delivered" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={12} /> Verified
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
                  {ngo.organization_name}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  <MapPin size={15} color="var(--primary)" />
                  {ngo.city}, {ngo.state}
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {ngo.description || 'Dedicated non-profit partner providing hot meals and shelf-stable rations to underserved local families.'}
                </p>

                <div style={{
                  marginTop: 'auto',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Reg: {ngo.registration_number || '501(c)(3)'}
                  </span>
                  <Link to={`/ngo/${ngo.id}`} className="btn btn-secondary btn-sm">
                    View Profile <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default NgoDirectoryPage;
