import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import { SimpleBarChart, CategoryProgressList } from '../components/Charts';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { ConfirmationModal } from '../components/Modal';
import { useNotifications } from '../hooks/useNotifications';
import api from '../services/api';
import {
  Utensils,
  Package,
  CheckCircle2,
  Clock,
  PlusCircle,
  Eye,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const DonorDashboard = () => {
  const { addToast } = useNotifications();
  const [donations, setDonations] = useState([]);
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

  // Metrics
  const totalCount = donations.length;
  const activeCount = donations.filter(d => ['AVAILABLE', 'CLAIMED', 'PICKUP_SCHEDULED'].includes(d.status)).length;
  const completedCount = donations.filter(d => d.status === 'DELIVERED').length;
  const totalServings = donations.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);

  // Category distribution
  const categoryCounts = donations.reduce((acc, d) => {
    acc[d.food_category] = (acc[d.food_category] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count
  }));

  // Chart data: status distribution
  const statusCounts = donations.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = [
    { label: 'Available', value: statusCounts['AVAILABLE'] || 0, color: '#2e7d32' },
    { label: 'Claimed', value: statusCounts['CLAIMED'] || 0, color: '#f59e0b' },
    { label: 'Delivered', value: statusCounts['DELIVERED'] || 0, color: '#059669' },
    { label: 'Expired', value: statusCounts['EXPIRED'] || 0, color: '#9ca3af' },
    { label: 'Cancelled', value: statusCounts['CANCELLED'] || 0, color: '#dc2626' }
  ];

  if (loading) {
    return (
      <DashboardLayout title="Donor Overview">
        <LoadingSpinner message="Loading donor dashboard..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Donor Dashboard"
      subtitle="Track your surplus food donations, pickup schedules, and community impact"
      action={
        <Link to="/donations/create" className="btn btn-primary">
          <PlusCircle size={18} />
          + Donate Food
        </Link>
      }
    >
      {error && <ErrorMessage message={error} onRetry={fetchMyDonations} />}

      {/* KPI Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatsCard
          icon={Package}
          value={totalCount}
          label="Total Listed"
          subtext="All-time donations"
          color="#2e7d32"
        />
        <StatsCard
          icon={Clock}
          value={activeCount}
          label="Active Listings"
          subtext="Awaiting or in pickup"
          color="#f59e0b"
        />
        <StatsCard
          icon={CheckCircle2}
          value={completedCount}
          label="Delivered"
          subtext="Rescued by shelters"
          color="#0284c7"
        />
        <StatsCard
          icon={Utensils}
          value={totalServings}
          label="Servings Shared"
          subtext="Total food rescued"
          color="#7c3aed"
        />
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <SimpleBarChart
            data={chartData}
            title="Donation Status Distribution"
            height={220}
          />
        </div>
        <div className="card">
          <CategoryProgressList
            categories={categoryData.length > 0 ? categoryData : [
              { name: 'Cooked Meals', count: 3 },
              { name: 'Bakery & Bread', count: 2 },
              { name: 'Fruits & Veggies', count: 1 }
            ]}
            title="Food Category Distribution"
          />
        </div>
      </div>

      {/* Recent Donations Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Your Food Donations
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing all listings and pickup states
            </span>
          </div>
          <Link to="/my-donations" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--primary)' }}>
            View All →
          </Link>
        </div>

        {donations.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '1rem' }}>You haven't listed any food donations yet.</p>
            <Link to="/donations/create" className="btn btn-primary btn-sm">
              List Your First Donation
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Food Title</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Quantity</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Pickup Window</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.slice(0, 8).map(d => {
                  const canCancel = ['AVAILABLE', 'CLAIMED'].includes(d.status);
                  return (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                        <Link to={`/donations/${d.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
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
                          <Link
                            to={`/donations/${d.id}`}
                            className="btn btn-secondary btn-sm"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </Link>
                          {canCancel && (
                            <button
                              onClick={() => handleCancelClick(d)}
                              className="btn btn-danger btn-sm"
                              title="Cancel Donation"
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
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Food Donation"
        message={`Are you sure you want to cancel the donation "${selectedDonation?.title}"? This cannot be undone.`}
        confirmText="Cancel Donation"
        danger
      />
    </DashboardLayout>
  );
};

export default DonorDashboard;
