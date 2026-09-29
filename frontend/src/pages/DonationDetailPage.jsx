import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Modal } from '../components/Modal';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import api from '../services/api';
import {
  MapPin,
  Clock,
  Calendar,
  Building,
  ShieldCheck,
  AlertTriangle,
  Leaf,
  HandHeart,
  ArrowLeft,
  XCircle,
  Flag,
  Share2
} from 'lucide-react';

const DonationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Claim Modal
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [destination, setDestination] = useState('');
  const [claimNotes, setClaimNotes] = useState('');
  const [claiming, setClaiming] = useState(false);

  // Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Unsafe food');
  const [reportDesc, setReportDesc] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchDonation = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/donations/${id}`);
      if (res.data?.success) {
        setDonation(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load donation details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonation();
  }, [id]);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setClaiming(true);

    try {
      await api.post(`/donations/${donation.id}/request-pickup`, {
        destination: destination || 'Designated Community Center',
        notes: claimNotes
      });
      addToast(`Donation claimed successfully!`, 'success');
      setClaimModalOpen(false);
      fetchDonation();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to claim donation', 'danger');
    } finally {
      setClaiming(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReport(true);

    try {
      await api.post('/reports', {
        target_type: 'DONATION',
        target_id: donation.id,
        reason: reportReason,
        description: reportDesc
      });
      addToast('Thank you. Your report has been submitted to trust & safety administrators.', 'info');
      setReportModalOpen(false);
      setReportDesc('');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit report', 'danger');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleCancelDonation = async () => {
    if (!window.confirm('Are you sure you want to cancel this donation?')) return;
    try {
      await api.post(`/donations/${donation.id}/cancel`);
      addToast('Donation cancelled', 'info');
      fetchDonation();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel donation', 'danger');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner message="Loading donation details..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div className="container" style={{ flex: 1, padding: '4rem 1.5rem', textAlign: 'center' }}>
          <ErrorMessage message={error || 'Donation not found'} onRetry={fetchDonation} />
          <Link to="/donations" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            <ArrowLeft size={16} /> Back to Discover Food
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const now = new Date();
  const expiry = new Date(donation.expiry_time);
  const diffHours = Math.round((expiry - now) / (1000 * 60 * 60));
  const isExpiringSoon = diffHours > 0 && diffHours <= 3;
  const isExpired = diffHours <= 0;

  const isOwner = user && user.id === donation.donor_id;
  const canClaim = donation.status === 'AVAILABLE' && !isExpired && ['volunteer', 'ngo', 'admin'].includes(user?.role);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fcfdfc' }}>
      <Navbar />

      <div className="container" style={{ flex: 1, padding: '2.5rem 1.5rem', maxWidth: '1080px' }}>
        {/* Back Link */}
        <Link
          to="/donations"
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
          <ArrowLeft size={16} /> Back to Discover Food
        </Link>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }} className="detail-grid">
          {/* Left Column: Image & Description */}
          <div>
            <div style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
              backgroundColor: '#e2e8f0',
              maxHeight: '440px'
            }}>
              <img
                src={donation.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                alt={donation.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
                <StatusBadge status={isExpired && donation.status === 'AVAILABLE' ? 'EXPIRED' : donation.status} size="lg" />
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.8rem' }}>
                Food Details & Instructions
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                {donation.description || 'Surplus prepared food package ready for timely community redistribution.'}
              </p>

              {/* Storage Instructions Card */}
              {donation.storage_instructions && (
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--primary-light)',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem'
                }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
                    Storage & Transport Instructions
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: '#166534', lineHeight: 1.5 }}>
                    {donation.storage_instructions}
                  </p>
                </div>
              )}

              {/* Food Safety Commitment Card */}
              <div style={{
                padding: '1.25rem',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <ShieldCheck size={26} color="#15803d" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#15803d' }}>
                    Donor Food Safety Verified
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>
                    The food donor confirmed that this food is safe for human consumption, has been handled under hygienic conditions, and meets FoodSave standards.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Listing Meta, Actions, Timings */}
          <div>
            <div className="card card-glass" style={{ padding: '2rem', position: 'sticky', top: '90px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  {donation.food_category}
                </span>
                <button
                  onClick={() => setReportModalOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#dc2626', cursor: 'pointer' }}
                >
                  <Flag size={13} /> Report listing
                </button>
              </div>

              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1rem' }}>
                {donation.title}
              </h1>

              {/* Servings Highlight */}
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px',
                paddingBottom: '1.25rem',
                borderBottom: '1px solid var(--border-light)',
                marginBottom: '1.25rem'
              }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                  {donation.quantity}
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {donation.quantity_unit}
                </span>
              </div>

              {/* Dietary Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
                {donation.vegan ? (
                  <span className="badge badge-delivered" style={{ background: '#ecfdf5', color: '#047857' }}>
                    <Leaf size={12} /> 100% Vegan
                  </span>
                ) : donation.vegetarian ? (
                  <span className="badge badge-delivered" style={{ background: '#ecfdf5', color: '#047857' }}>
                    <Leaf size={12} /> Vegetarian
                  </span>
                ) : (
                  <span className="badge badge-expired">Non-Vegetarian</span>
                )}

                {donation.contains_allergens ? (
                  <span className="badge badge-claimed">
                    Contains Allergens: {donation.allergen_details || 'See description'}
                  </span>
                ) : (
                  <span className="badge badge-delivered">No Common Allergens</span>
                )}
              </div>

              {/* Timeline Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <Clock size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Prepared:</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      {new Date(donation.prepared_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <AlertTriangle size={18} color={isExpiringSoon ? 'var(--danger)' : '#b45309'} style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expiry Deadline:</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isExpiringSoon ? 'var(--danger)' : 'var(--text-primary)' }}>
                      {new Date(donation.expiry_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      {' '}({isExpired ? 'Expired' : `${diffHours} hours left`})
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <Calendar size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pickup Window:</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      {new Date(donation.pickup_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(donation.pickup_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <MapPin size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pickup Address:</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      {donation.pickup_address}, {donation.pickup_city} {donation.pickup_pincode}
                    </div>
                  </div>
                </div>
              </div>

              {/* Donor Summary */}
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--bg-main)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Building size={24} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                    {donation.organization?.organization_name || donation.donor?.name || 'Verified Food Donor'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Verified Donor Partner
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {canClaim && (
                  <button
                    onClick={() => {
                      setDestination(user?.organization?.address || 'Community Dining Hub');
                      setClaimModalOpen(true);
                    }}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                  >
                    <HandHeart size={20} /> Claim & Rescue Food
                  </button>
                )}

                {isOwner && ['AVAILABLE', 'CLAIMED'].includes(donation.status) && (
                  <button
                    onClick={handleCancelDonation}
                    className="btn btn-danger"
                    style={{ width: '100%' }}
                  >
                    <XCircle size={18} /> Cancel This Donation
                  </button>
                )}

                {!user && (
                  <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                    Sign in to Claim This Food
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CLAIM MODAL */}
      <Modal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        title="Claim Food Rescue Mission"
      >
        <form onSubmit={handleClaimSubmit}>
          <div className="form-group">
            <label className="form-label">Destination Distribution Center *</label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Hope Outreach Dining Hall, 800 Mission St"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes for Donor / Dispatch</label>
            <textarea
              rows={2}
              value={claimNotes}
              onChange={(e) => setClaimNotes(e.target.value)}
              placeholder="e.g. Arriving with insulated thermal bags by 4:30 PM"
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={() => setClaimModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={claiming} className="btn btn-primary">
              {claiming ? 'Reserving...' : 'Confirm Claim'}
            </button>
          </div>
        </form>
      </Modal>

      {/* REPORT MODAL */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Food Listing"
      >
        <form onSubmit={handleReportSubmit}>
          <div className="form-group">
            <label className="form-label">Reason for Report</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="form-select"
            >
              <option value="Unsafe food">Potentially unsafe / spoiled food</option>
              <option value="Fake donation">Fake or misleading donation listing</option>
              <option value="Incorrect information">Incorrect location or allergen info</option>
              <option value="No-show donor">Donor did not provide food upon arrival</option>
              <option value="Suspicious activity">Suspicious account activity</option>
              <option value="Other">Other compliance concern</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description * (min 10 chars)</label>
            <textarea
              required
              rows={3}
              minLength={10}
              value={reportDesc}
              onChange={(e) => setReportDesc(e.target.value)}
              placeholder="Please provide specific details so our safety team can investigate promptly..."
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={() => setReportModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submittingReport} className="btn btn-danger">
              {submittingReport ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
};

export default DonationDetailPage;
