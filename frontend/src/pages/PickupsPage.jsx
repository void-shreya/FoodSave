import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import {
  Truck,
  MapPin,
  Calendar,
  Check,
  Navigation,
  CheckCircle2
} from 'lucide-react';

const PickupsPage = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchPickups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pickups');
      if (res.data?.success) {
        setPickups(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pickups schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const handleConfirmCollect = async (e) => {
    e.preventDefault();
    if (!selectedPickup) return;
    setUpdating(true);

    try {
      await api.put(`/pickups/${selectedPickup.id}/status`, {
        status: 'COLLECTED',
        notes: notes || 'Food inspected and confirmed at safe temperature.'
      });
      addToast('Marked as collected! Item is now in transit to delivery center.', 'success');
      setCollectModalOpen(false);
      fetchPickups();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update pickup', 'danger');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <DashboardLayout
      title="Scheduled Pickups"
      subtitle="Coordinate arrival times, donor addresses, and verify safe temperature transfers"
    >
      {error && <ErrorMessage message={error} onRetry={fetchPickups} />}

      {loading ? (
        <LoadingSpinner message="Loading pickups..." />
      ) : pickups.length === 0 ? (
        <EmptyState
          title="No scheduled pickups found"
          description="Claim an available donation to generate your first pickup mission."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pickups.map(p => {
            const isAssigned = p.status === 'ASSIGNED' || p.status === 'SCHEDULED';
            const canCollect = isAssigned && (user?.role === 'volunteer' || user?.role === 'ngo' || user?.role === 'admin');

            return (
              <div key={p.id} className="card card-glass" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  backgroundColor: isAssigned ? '#fef3c7' : '#dcfce7',
                  color: isAssigned ? '#b45309' : '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Truck size={26} />
                </div>

                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <StatusBadge status={p.status} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Scheduled: {new Date(p.scheduled_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '4px 0' }}>
                    {p.donation?.title || 'Food Donation'}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={16} color="var(--primary)" />
                    {p.pickup_address}
                  </div>

                  {p.volunteer_name && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Assigned Volunteer: <strong>{p.volunteer_name}</strong>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {canCollect && (
                    <button
                      onClick={() => {
                        setSelectedPickup(p);
                        setNotes('');
                        setCollectModalOpen(true);
                      }}
                      className="btn btn-primary"
                    >
                      <Check size={16} /> Mark Collected
                    </button>
                  )}

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.pickup_address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <Navigation size={15} /> Directions
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COLLECT MODAL */}
      <Modal
        isOpen={collectModalOpen}
        onClose={() => setCollectModalOpen(false)}
        title="Confirm Food Collection"
      >
        <form onSubmit={handleConfirmCollect}>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Confirm that you have arrived at <strong>{selectedPickup?.pickup_address}</strong>, verified proper food storage conditions, and safely loaded the trays.
          </p>

          <div className="form-group">
            <label className="form-label">Inspection & Handling Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Temperature checked, 5 hot trays loaded into insulated bag"
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={() => setCollectModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={updating} className="btn btn-primary">
              {updating ? 'Updating...' : 'Confirm Collection'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default PickupsPage;
