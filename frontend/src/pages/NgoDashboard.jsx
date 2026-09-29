import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatsCard from '../components/StatsCard';
import DonationCard from '../components/DonationCard';
import StatusBadge from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import {
  Building2,
  Users,
  Utensils,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  MapPin,
  ShieldCheck,
  Compass
} from 'lucide-react';

const NgoDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const [activeTab, setActiveTab] = useState('available'); // 'available', 'beneficiaries', 'deliveries'

  const [availableDonations, setAvailableDonations] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Beneficiary Modal state
  const [bModalOpen, setBModalOpen] = useState(false);
  const [bFormData, setBFormData] = useState({
    display_name: '',
    category: 'COMMUNITY',
    people_count: 50,
    location_area: '',
    notes: ''
  });

  // Claim Modal
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [destination, setDestination] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donationsRes, deliveriesRes, beneficiariesRes] = await Promise.all([
        api.get('/donations?status=AVAILABLE'),
        api.get('/deliveries'),
        api.get('/ngos/beneficiaries')
      ]);

      if (donationsRes.data?.success) setAvailableDonations(donationsRes.data.data);
      if (deliveriesRes.data?.success) setDeliveries(deliveriesRes.data.data);
      if (beneficiariesRes.data?.success) setBeneficiaries(beneficiariesRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load NGO dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClaimDonation = async (e) => {
    e.preventDefault();
    if (!selectedDonation) return;

    try {
      await api.post(`/donations/${selectedDonation.id}/request-pickup`, {
        destination: destination || `${user.name} Community Distribution Hub`,
        notes: 'Claimed by NGO for community distribution'
      });
      addToast(`Donation "${selectedDonation.title}" claimed for your community!`, 'success');
      setClaimModalOpen(false);
      setActiveTab('deliveries');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to claim donation', 'danger');
    }
  };

  const handleAddBeneficiary = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ngos/beneficiaries', bFormData);
      addToast('Beneficiary community group added successfully', 'success');
      setBModalOpen(false);
      setBFormData({
        display_name: '',
        category: 'COMMUNITY',
        people_count: 50,
        location_area: '',
        notes: ''
      });
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add beneficiary group', 'danger');
    }
  };

  const handleDeleteBeneficiary = async (id) => {
    try {
      await api.delete(`/ngos/beneficiaries/${id}`);
      addToast('Beneficiary group removed', 'info');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to remove beneficiary group', 'danger');
    }
  };

  const totalPeopleServed = beneficiaries.reduce((sum, b) => sum + (Number(b.people_count) || 0), 0);
  const mealsReceived = deliveries.filter(d => d.status === 'DELIVERED').length;

  if (loading) {
    return (
      <DashboardLayout title="NGO Operations">
        <LoadingSpinner message="Loading NGO hub..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="NGO Distribution Hub"
      subtitle="Manage community meal deliveries, bulk donation claims, and beneficiary welfare"
    >
      {error && <ErrorMessage message={error} onRetry={fetchData} />}

      {/* Verification Notice / Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={28} color="#15803d" />
          <div>
            <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.95rem' }}>
              Verified Partner NGO: {user.organization?.organization_name || user.name}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#15803d' }}>
              Registration #{user.organization?.registration_number || 'NGO-ACTIVE'} • Authorized for Bulk Food Redistribution
            </div>
          </div>
        </div>
        <span className="badge badge-delivered">Verified</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatsCard
          icon={Compass}
          value={availableDonations.length}
          label="Available Donations"
          subtext="Ready to claim"
          color="#2e7d32"
        />
        <StatsCard
          icon={CheckCircle2}
          value={mealsReceived}
          label="Deliveries Received"
          subtext="Distributed safely"
          color="#0284c7"
        />
        <StatsCard
          icon={Users}
          value={totalPeopleServed}
          label="People Reached"
          subtext="Across beneficiary groups"
          color="#d97706"
        />
        <StatsCard
          icon={Building2}
          value={beneficiaries.length}
          label="Beneficiary Centers"
          subtext="Registered local hubs"
          color="#7c3aed"
        />
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        borderBottom: '2px solid var(--border-light)',
        marginBottom: '1.75rem'
      }}>
        <button
          onClick={() => setActiveTab('available')}
          style={{
            padding: '10px 18px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'available' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'available' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Compass size={18} />
          Claim Available Food ({availableDonations.length})
        </button>

        <button
          onClick={() => setActiveTab('beneficiaries')}
          style={{
            padding: '10px 18px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'beneficiaries' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'beneficiaries' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Users size={18} />
          Beneficiary Centers ({beneficiaries.length})
        </button>

        <button
          onClick={() => setActiveTab('deliveries')}
          style={{
            padding: '10px 18px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'deliveries' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'deliveries' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Clock size={18} />
          Incoming Deliveries ({deliveries.length})
        </button>
      </div>

      {/* TAB 1: AVAILABLE DONATIONS */}
      {activeTab === 'available' && (
        <div>
          {availableDonations.length === 0 ? (
            <EmptyState
              title="No food donations available right now"
              description="All surplus food listings have been claimed. Check back throughout the day."
            />
          ) : (
            <div className="grid grid-cols-3">
              {availableDonations.map(d => (
                <DonationCard
                  key={d.id}
                  donation={d}
                  userRole="ngo"
                  onClaim={(donation) => {
                    setSelectedDonation(donation);
                    setDestination(user.organization?.address || 'Community Dining Center');
                    setClaimModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BENEFICIARIES */}
      {activeTab === 'beneficiaries' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem'
          }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Privacy-Protected Beneficiary Groups
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                FoodSave protects the privacy and dignity of vulnerable individuals by tracking aggregated group impact only.
              </p>
            </div>
            <button onClick={() => setBModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={16} /> Add Beneficiary Center
            </button>
          </div>

          <div className="grid grid-cols-3">
            {beneficiaries.map(b => (
              <div key={b.id} className="card card-glass" style={{ padding: '1.25rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="badge badge-in_transit">{b.category}</span>
                  <button
                    onClick={() => handleDeleteBeneficiary(b.id)}
                    style={{ color: '#ef4444', padding: '4px', cursor: 'pointer' }}
                    title="Remove Center"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '10px 0 4px' }}>
                  {b.display_name}
                </h4>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={14} color="var(--primary)" />
                  {b.location_area}
                </div>

                <div style={{
                  marginTop: '1rem',
                  paddingTop: '0.8rem',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily Capacity:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
                    {b.people_count} people
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DELIVERIES */}
      {activeTab === 'deliveries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {deliveries.length === 0 ? (
            <EmptyState
              title="No delivery records found"
              description="Deliveries will appear here as volunteers claim and transfer food to your center."
            />
          ) : (
            deliveries.map(del => (
              <div key={del.id} className="card card-glass" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <StatusBadge status={del.status} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Updated {new Date(del.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {del.donation?.title || 'Community Meal Transfer'}
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Drop-off: <strong>{del.destination}</strong>
                  </div>
                </div>

                <div>
                  {del.status === 'DELIVERED' ? (
                    <span className="badge badge-delivered" style={{ padding: '6px 12px' }}>
                      ✓ Received & Distributed
                    </span>
                  ) : (
                    <span className="badge badge-in_transit" style={{ padding: '6px 12px' }}>
                      🚚 Volunteer In Transit
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ADD BENEFICIARY MODAL */}
      <Modal
        isOpen={bModalOpen}
        onClose={() => setBModalOpen(false)}
        title="Add Beneficiary Community Center"
      >
        <form onSubmit={handleAddBeneficiary}>
          <div className="form-group">
            <label className="form-label">Center / Group Name *</label>
            <input
              type="text"
              required
              value={bFormData.display_name}
              onChange={(e) => setBFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="e.g. Mission Youth & Community Shelter"
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={bFormData.category}
                onChange={(e) => setBFormData(prev => ({ ...prev, category: e.target.value }))}
                className="form-select"
              >
                <option value="CHILDREN">Children / Youth</option>
                <option value="ELDERLY">Elderly Residence</option>
                <option value="HOMELESS">Shelter / Unhoused</option>
                <option value="LOW_INCOME_FAMILIES">Low Income Families</option>
                <option value="DISASTER_AFFECTED">Disaster Relief</option>
                <option value="COMMUNITY">Community Kitchen</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Estimated People Served *</label>
              <input
                type="number"
                required
                min={1}
                value={bFormData.people_count}
                onChange={(e) => setBFormData(prev => ({ ...prev, people_count: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location / Neighborhood *</label>
            <input
              type="text"
              required
              value={bFormData.location_area}
              onChange={(e) => setBFormData(prev => ({ ...prev, location_area: e.target.value }))}
              placeholder="e.g. SoMa District or Tenderloin"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Internal Notes (Optional)</label>
            <textarea
              rows={2}
              value={bFormData.notes}
              onChange={(e) => setBFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Hot meals required around 5 PM"
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={() => setBModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Center
            </button>
          </div>
        </form>
      </Modal>

      {/* CLAIM DONATION MODAL */}
      <Modal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        title="Claim Food Donation for NGO"
      >
        <form onSubmit={handleClaimDonation}>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Confirm claim for <strong>{selectedDonation?.title}</strong> ({selectedDonation?.quantity} {selectedDonation?.quantity_unit}).
          </p>

          <div className="form-group">
            <label className="form-label">Distribution Destination Address</label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={() => setClaimModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm NGO Claim
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default NgoDashboard;
