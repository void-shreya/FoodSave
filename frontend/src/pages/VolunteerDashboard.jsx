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
import api from '../services/api';
import {
  Truck,
  CheckCircle2,
  Package,
  Clock,
  Compass,
  MapPin,
  Send,
  Navigation,
  FileCheck,
  Check
} from 'lucide-react';

const VolunteerDashboard = () => {
  const { addToast } = useNotifications();
  const [activeTab, setActiveTab] = useState('available'); // 'available', 'pickups', 'deliveries'

  const [availableDonations, setAvailableDonations] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Claim Modal state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [destination, setDestination] = useState('');
  const [claimNotes, setClaimNotes] = useState('');
  const [claiming, setClaiming] = useState(false);

  // Status Action Modals
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [collectNotes, setCollectNotes] = useState('');

  const [deliverModalOpen, setDeliverModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [proofImage, setProofImage] = useState('');
  const [deliverNotes, setDeliverNotes] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donationsRes, pickupsRes, deliveriesRes] = await Promise.all([
        api.get('/donations?status=AVAILABLE'),
        api.get('/pickups'),
        api.get('/deliveries')
      ]);

      if (donationsRes.data?.success) setAvailableDonations(donationsRes.data.data);
      if (pickupsRes.data?.success) setPickups(pickupsRes.data.data);
      if (deliveriesRes.data?.success) setDeliveries(deliveriesRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load volunteer dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openClaimModal = (donation) => {
    setSelectedDonation(donation);
    setDestination('Hope Outreach Community Dining Hall, 800 Mission St');
    setClaimNotes('');
    setClaimModalOpen(true);
  };

  const handleConfirmClaim = async (e) => {
    e.preventDefault();
    if (!selectedDonation) return;
    setClaiming(true);

    try {
      await api.post(`/donations/${selectedDonation.id}/request-pickup`, {
        destination,
        notes: claimNotes
      });
      addToast(`Successfully claimed "${selectedDonation.title}"!`, 'success');
      setClaimModalOpen(false);
      setActiveTab('pickups');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to claim donation', 'danger');
    } finally {
      setClaiming(false);
    }
  };

  const handleMarkCollected = async () => {
    if (!selectedPickup) return;
    try {
      await api.put(`/pickups/${selectedPickup.id}/status`, {
        status: 'COLLECTED',
        notes: collectNotes || 'Food verified at safe temperature and loaded in thermal bags.'
      });
      addToast('Marked as collected! Now in transit.', 'success');
      setCollectModalOpen(false);
      setActiveTab('deliveries');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update pickup status', 'danger');
    }
  };

  const handleMarkDelivered = async () => {
    if (!selectedDelivery) return;
    try {
      await api.put(`/deliveries/${selectedDelivery.id}/status`, {
        status: 'DELIVERED',
        proof_image: proofImage || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
        notes: deliverNotes || 'Delivered safely to community distribution table.'
      });
      addToast('Delivery completed! Thank you for nourishing our community.', 'success');
      setDeliverModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to complete delivery', 'danger');
    }
  };

  const completedDeliveries = deliveries.filter(d => d.status === 'DELIVERED').length;
  const activePickupsCount = pickups.filter(p => p.status === 'ASSIGNED' || p.status === 'SCHEDULED').length;
  const inTransitCount = deliveries.filter(d => d.status === 'IN_TRANSIT').length;

  if (loading) {
    return (
      <DashboardLayout title="Volunteer Rescue Operations">
        <LoadingSpinner message="Loading rescue tasks..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Volunteer Rescue Hub"
      subtitle="Discover surplus meals, collect from local kitchens, and deliver to community shelters"
    >
      {error && <ErrorMessage message={error} onRetry={fetchData} />}

      {/* KPI Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatsCard
          icon={Compass}
          value={availableDonations.length}
          label="Available Nearby"
          subtext="Ready for rescue"
          color="#2e7d32"
        />
        <StatsCard
          icon={Clock}
          value={activePickupsCount}
          label="Assigned Pickups"
          subtext="To collect today"
          color="#f59e0b"
        />
        <StatsCard
          icon={Truck}
          value={inTransitCount}
          label="In Transit"
          subtext="En route to shelter"
          color="#0284c7"
        />
        <StatsCard
          icon={CheckCircle2}
          value={completedDeliveries}
          label="Completed"
          subtext="Delivered successfully"
          color="#059669"
        />
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        borderBottom: '2px solid var(--border-light)',
        marginBottom: '1.75rem',
        paddingBottom: '2px'
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
          Available Nearby ({availableDonations.length})
        </button>

        <button
          onClick={() => setActiveTab('pickups')}
          style={{
            padding: '10px 18px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'pickups' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'pickups' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Clock size={18} />
          My Pickups ({pickups.length})
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
          <Send size={18} />
          Deliveries ({deliveries.length})
        </button>
      </div>

      {/* TAB 1: AVAILABLE DONATIONS */}
      {activeTab === 'available' && (
        <div>
          {availableDonations.length === 0 ? (
            <EmptyState
              title="No food donations available right now"
              description="All surplus food has been rescued! Check back shortly as donors post fresh updates throughout the day."
            />
          ) : (
            <div className="grid grid-cols-3">
              {availableDonations.map(d => (
                <DonationCard
                  key={d.id}
                  donation={d}
                  userRole="volunteer"
                  onClaim={openClaimModal}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY PICKUPS */}
      {activeTab === 'pickups' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pickups.length === 0 ? (
            <EmptyState
              title="No assigned pickups"
              description="You haven't claimed any donations yet. Visit the Available tab to claim your next food rescue mission."
              action={
                <button onClick={() => setActiveTab('available')} className="btn btn-primary btn-sm">
                  Browse Available Food
                </button>
              }
            />
          ) : (
            pickups.map(p => {
              const isAssigned = p.status === 'ASSIGNED' || p.status === 'SCHEDULED';
              return (
                <div key={p.id} className="card card-glass" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: isAssigned ? '#fef3c7' : '#dcfce7',
                    color: isAssigned ? '#b45309' : '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Truck size={24} />
                  </div>

                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <StatusBadge status={p.status} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Scheduled: {new Date(p.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                      {p.donation?.title || 'Food Donation'}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      <MapPin size={15} color="var(--primary)" />
                      {p.pickup_address}
                    </div>
                    {p.notes && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                        Note: {p.notes}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {isAssigned && (
                      <button
                        onClick={() => {
                          setSelectedPickup(p);
                          setCollectNotes('');
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
            })
          )}
        </div>
      )}

      {/* TAB 3: DELIVERIES */}
      {activeTab === 'deliveries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {deliveries.length === 0 ? (
            <EmptyState
              title="No active deliveries"
              description="Collect your assigned pickups to begin transit to partner distribution centers."
            />
          ) : (
            deliveries.map(del => {
              const isTransit = del.status === 'IN_TRANSIT' || del.status === 'PENDING';
              return (
                <div key={del.id} className="card card-glass" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: del.status === 'DELIVERED' ? '#dcfce7' : '#e0f2fe',
                    color: del.status === 'DELIVERED' ? '#15803d' : '#0369a1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Send size={24} />
                  </div>

                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <StatusBadge status={del.status} />
                      {del.delivery_time && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Completed: {new Date(del.delivery_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                      {del.donation?.title || 'Community Meal Transfer'}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      <MapPin size={15} color="#0369a1" />
                      Destination: <strong>{del.destination}</strong>
                    </div>
                  </div>

                  <div>
                    {isTransit ? (
                      <button
                        onClick={() => {
                          setSelectedDelivery(del);
                          setProofImage('');
                          setDeliverNotes('');
                          setDeliverModalOpen(true);
                        }}
                        className="btn btn-primary"
                        style={{ backgroundColor: '#059669' }}
                      >
                        <FileCheck size={16} /> Mark Delivered
                      </button>
                    ) : (
                      <span className="badge badge-delivered" style={{ padding: '6px 12px' }}>
                        ✓ Delivery Verified
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CLAIM MODAL */}
      <Modal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        title="Claim Food Rescue Mission"
      >
        <form onSubmit={handleConfirmClaim}>
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{selectedDonation?.title}</h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {selectedDonation?.quantity} {selectedDonation?.quantity_unit} • {selectedDonation?.food_category}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Pickup Location: <strong>{selectedDonation?.pickup_address}</strong>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Drop-off Destination Center *</label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Hope Outreach Center, 800 Mission St"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rescue Notes (Optional)</label>
            <textarea
              rows={2}
              value={claimNotes}
              onChange={(e) => setClaimNotes(e.target.value)}
              placeholder="e.g. Cargo bike with thermal insulation bag"
              className="form-textarea"
            />
          </div>

          <div style={{
            padding: '12px',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            fontSize: '0.82rem',
            color: '#166534',
            marginBottom: '1.25rem',
            border: '1px solid #bbf7d0'
          }}>
            🛡️ <strong>Safety Reminder:</strong> Please verify safe temperature upon collection and maintain hygiene during transport.
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

      {/* COLLECT MODAL */}
      <Modal
        isOpen={collectModalOpen}
        onClose={() => setCollectModalOpen(false)}
        title="Confirm Food Collection"
      >
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Confirm that you have arrived at the donor location, inspected the food packaging, and safely loaded the trays for transit.
        </p>

        <div className="form-group">
          <label className="form-label">Collection Notes</label>
          <input
            type="text"
            value={collectNotes}
            onChange={(e) => setCollectNotes(e.target.value)}
            placeholder="e.g. Temperature verified, 4 trays loaded cleanly"
            className="form-input"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={() => setCollectModalOpen(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleMarkCollected} className="btn btn-primary">
            Confirm Collection
          </button>
        </div>
      </Modal>

      {/* DELIVER MODAL */}
      <Modal
        isOpen={deliverModalOpen}
        onClose={() => setDeliverModalOpen(false)}
        title="Complete Food Delivery"
      >
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Confirm that the food has reached its designated shelter or community kitchen.
        </p>

        <div className="form-group">
          <label className="form-label">Proof of Delivery Image URL (Optional)</label>
          <input
            type="url"
            value={proofImage}
            onChange={(e) => setProofImage(e.target.value)}
            placeholder="https://... or photo url"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Delivery Notes</label>
          <textarea
            rows={2}
            value={deliverNotes}
            onChange={(e) => setDeliverNotes(e.target.value)}
            placeholder="e.g. Handed over to dining hall coordinator"
            className="form-textarea"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={() => setDeliverModalOpen(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleMarkDelivered} className="btn btn-primary" style={{ backgroundColor: '#059669' }}>
            Confirm Delivery
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default VolunteerDashboard;
