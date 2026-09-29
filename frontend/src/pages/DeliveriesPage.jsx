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
  Send,
  MapPin,
  Clock,
  FileCheck,
  CheckCircle2,
  Navigation,
  Image as ImageIcon
} from 'lucide-react';

const DeliveriesPage = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [deliverModalOpen, setDeliverModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [proofImage, setProofImage] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/deliveries');
      if (res.data?.success) {
        setDeliveries(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleConfirmDeliver = async (e) => {
    e.preventDefault();
    if (!selectedDelivery) return;
    setSubmitting(true);

    try {
      await api.put(`/deliveries/${selectedDelivery.id}/status`, {
        status: 'DELIVERED',
        proof_image: proofImage || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
        notes: notes || 'Delivered directly to dining hall staff in pristine condition.'
      });
      addToast('Delivery completed! Thank you for sharing hope and nourishment.', 'success');
      setDeliverModalOpen(false);
      fetchDeliveries();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to complete delivery', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Delivery Tracking"
      subtitle="Track active meal transits, verify drop-offs, and inspect historical delivery confirmations"
    >
      {error && <ErrorMessage message={error} onRetry={fetchDeliveries} />}

      {loading ? (
        <LoadingSpinner message="Loading deliveries..." />
      ) : deliveries.length === 0 ? (
        <EmptyState
          title="No deliveries found"
          description="Deliveries will be listed here once you claim and collect food donations."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {deliveries.map(del => {
            const isPendingOrTransit = del.status === 'PENDING' || del.status === 'IN_TRANSIT';
            const canComplete = isPendingOrTransit && (user?.role === 'volunteer' || user?.role === 'ngo' || user?.role === 'admin');

            return (
              <div key={del.id} className="card card-glass" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  backgroundColor: del.status === 'DELIVERED' ? '#dcfce7' : '#e0f2fe',
                  color: del.status === 'DELIVERED' ? '#15803d' : '#0369a1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Send size={26} />
                </div>

                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <StatusBadge status={del.status} />
                    {del.delivery_time && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Delivered: {new Date(del.delivery_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '4px 0' }}>
                    {del.donation?.title || 'Community Meal Transfer'}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={16} color="#0369a1" />
                    Drop-off Destination: <strong>{del.destination}</strong>
                  </div>

                  {del.notes && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                      Note: {del.notes}
                    </div>
                  )}
                </div>

                <div>
                  {canComplete ? (
                    <button
                      onClick={() => {
                        setSelectedDelivery(del);
                        setProofImage('');
                        setNotes('');
                        setDeliverModalOpen(true);
                      }}
                      className="btn btn-primary"
                      style={{ backgroundColor: '#059669' }}
                    >
                      <FileCheck size={16} /> Mark Delivered
                    </button>
                  ) : (
                    <span className="badge badge-delivered" style={{ padding: '6px 12px' }}>
                      <CheckCircle2 size={14} /> Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DELIVER MODAL */}
      <Modal
        isOpen={deliverModalOpen}
        onClose={() => setDeliverModalOpen(false)}
        title="Complete Food Delivery"
      >
        <form onSubmit={handleConfirmDeliver}>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Confirm that the food has arrived safely at <strong>{selectedDelivery?.destination}</strong> and handed over to community representatives.
          </p>

          <div className="form-group">
            <label className="form-label">Proof of Delivery Image URL (Optional)</label>
            <div style={{ position: 'relative' }}>
              <ImageIcon size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="url"
                value={proofImage}
                onChange={(e) => setProofImage(e.target.value)}
                placeholder="https://..."
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received by volunteer kitchen team at the back door"
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={() => setDeliverModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ backgroundColor: '#059669' }}>
              {submitting ? 'Confirming...' : 'Confirm Delivery'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default DeliveriesPage;
