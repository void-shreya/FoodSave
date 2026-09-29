import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import api from '../services/api';
import {
  Building2,
  ShieldCheck,
  MapPin,
  ArrowLeft,
  Mail,
  FileCheck,
  Award
} from 'lucide-react';

const NgoDetailPage = () => {
  const { id } = useParams();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNgo = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/ngos/${id}`);
        if (res.data?.success) {
          setNgo(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load NGO details');
      } finally {
        setLoading(false);
      }
    };
    fetchNgo();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner message="Loading NGO profile..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !ngo) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div className="container" style={{ flex: 1, padding: '4rem 1.5rem', textAlign: 'center' }}>
          <ErrorMessage message={error || 'NGO not found'} />
          <Link to="/ngo" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            <ArrowLeft size={16} /> Back to NGO Directory
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fcfdfc' }}>
      <Navbar />

      <div className="container" style={{ flex: 1, padding: '3rem 1.5rem', maxWidth: '800px' }}>
        <Link
          to="/ngo"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.9rem',
            marginBottom: '1.5rem'
          }}
        >
          <ArrowLeft size={16} /> Back to Partner NGOs
        </Link>

        <div className="card card-glass" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Building2 size={32} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                  {ngo.organization_name}
                </h1>
                <span className="badge badge-delivered" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={12} /> Verified
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <MapPin size={16} color="var(--primary)" />
                {ngo.address}, {ngo.city}, {ngo.state} {ngo.pincode}
              </div>
            </div>
          </div>

          <div style={{
            padding: '1.25rem',
            backgroundColor: 'var(--bg-main)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '2rem'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registration ID:</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{ngo.registration_number || '501(c)(3)'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Partner Status:</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>Authorized Community Recipient</div>
            </div>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.8rem' }}>
            Mission & Community Reach
          </h3>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
            {ngo.description || 'Dedicated non-profit organization operating dining centers and emergency food pantries. Partnered with FoodSave to receive fresh surplus from verified food donors.'}
          </p>

          <Link to="/donations" className="btn btn-primary">
            Browse Food Available for this Partner
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NgoDetailPage;
