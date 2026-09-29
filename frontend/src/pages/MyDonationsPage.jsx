import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { ConfirmationModal } from '../components/Modal';
import { useNotifications } from '../hooks/useNotifications';
import api from '../services/api';
import {
  Package,
  PlusCircle,
  Eye,
  XCircle,
  Clock,
  Calendar,
  Truck
} from 'lucide-react';

const MyDonationsPage = () => {
  const { addToast } = useNotifications();
  const [donations, setDonations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const fetchMyDonations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/donations/my');
      if (res.data?.success) {
        setDonations(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const handleCancelClick = (donation) => {
    setSelectedDonation(donation);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedDonation) return;
    try {
      await api.post(`/donations/${selectedDonation.id}/cancel`);
      addToast('Donation cancelled successfully', 'info');
      fetchMyDonations();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel donation', 'danger');
    }
  };

  const filteredDonations = statusFilter === 'ALL'
    ? donations
    : donations.filter(d => d.status === statusFilter);

  return (
    <DashboardLayout
      title="My Food Donations"
      subtitle="View, manage, and inspect the real-time fulfillment status of your surplus listings"
      action={
        <Link to="/donations/create" className="btn btn-primary">
          <PlusCircle size={18} />
          + Donate Food
        </Link>
      }
    >
      {error && <ErrorMessage message={error} onRetry={fetchMyDonations} />}

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid var(--border-light)',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {['ALL', 'AVAILABLE', 'CLAIMED', 'DELIVERED', 'EXPIRED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              color: statusFilter === st ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: statusFilter === st ? '3px solid var(--primary)' : '3px solid transparent',
              marginBottom: '-2px',
              textTransform: 'capitalize'
            }}
          >
            {st.toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your donations..." />
      ) : filteredDonations.length === 0 ? (
        <EmptyState
          title={`No ${statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''} donations found`}
          description="You don't have any food listings matching this status category."
          action={
            <Link to="/donations/create" className="btn btn-primary btn-sm">
              List a New Food Donation
            </Link>
          }
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Food Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Quantity</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Pickup Window</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map(d => {
                  const canCancel = ['AVAILABLE', 'CLAIMED'].includes(d.status);
                  return (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                        <Link to={`/donations/${d.id}`} style={{ color: 'var(--text-primary)' }}>
                          {d.title}
                        </Link>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                        {d.food_category}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                        {d.quantity} {d.quantity_unit}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {new Date(d.pickup_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(d.pickup_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={d.status} />
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <Link to={`/donations/${d.id}`} className="btn btn-secondary btn-sm" title="View details">
                            <Eye size={14} />
                          </Link>
                          {canCancel && (
                            <button
                              onClick={() => handleCancelClick(d)}
                              className="btn btn-danger btn-sm"
                              title="Cancel donation"
                            >
                              <XCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Food Donation"
        message={`Are you sure you want to cancel "${selectedDonation?.title}"? This cannot be undone.`}
        confirmText="Cancel Donation"
        danger
      />
    </DashboardLayout>
  );
};

export default MyDonationsPage;
