import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DonationCard from '../components/DonationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import api from '../services/api';
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  Leaf,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';

const DonationDiscoveryPage = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [vegetarian, setVegetarian] = useState(false);
  const [vegan, setVegan] = useState(false);
  const [city, setCity] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  // Claim modal
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [destination, setDestination] = useState('');
  const [notes, setNotes] = useState('');
  const [claiming, setClaiming] = useState(false);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      params.append('status', 'AVAILABLE');
      if (category && category !== 'All') params.append('category', category);
      if (search) params.append('search', search);
      if (vegetarian) params.append('vegetarian', 'true');
      if (vegan) params.append('vegan', 'true');
      if (city) params.append('city', city);
      if (sortBy) params.append('sortBy', sortBy);

      const res = await api.get(`/donations?${params.toString()}`);
      if (res.data?.success) {
        setDonations(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search available food donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [category, vegetarian, vegan, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonations();
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDonation) return;
    setClaiming(true);

    try {
      await api.post(`/donations/${selectedDonation.id}/request-pickup`, {
        destination: destination || 'Designated Community Center',
        notes
      });
      addToast(`Successfully claimed "${selectedDonation.title}"!`, 'success');
      setClaimModalOpen(false);
      fetchDonations();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to claim donation', 'danger');
    } finally {
      setClaiming(false);
    }
  };

  const categories = [
    'All',
    'Cooked Meals',
    'Bakery & Bread',
    'Fruits & Vegetables',
    'Dairy Products',
    'Packaged & Dry Goods',
    'Beverages'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fcfdfc' }}>
      <Navbar />

      {/* Header Banner */}
      <section style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-light)',
        padding: '2.5rem 0'
      }}>
        <div className="container-wide">
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Surplus Food Discovery
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '650px' }}>
            Browse available food donations listed by certified kitchens, restaurants, and grocery stores ready for immediate rescue.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', maxWidth: '600px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search food by name, ingredients, or donor..."
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container-wide" style={{ flex: 1, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Safety Alert Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 18px',
          backgroundColor: '#fef3c7',
          border: '1px solid #fde68a',
          borderRadius: 'var(--radius-md)',
          color: '#92400e',
          fontSize: '0.88rem'
        }}>
          <ShieldAlert size={20} color="#b45309" style={{ flexShrink: 0 }} />
          <div>
            <strong>Food Safety Guarantee:</strong> All donations are marked with verified preparation times and strict expiry thresholds. Food nearing expiration is flagged for immediate priority rescue.
          </div>
        </div>

        {/* Filters and Sorting Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1rem 1.25rem',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)'
        }}>
          {/* Category Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: category === cat ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                  backgroundColor: category === cat ? 'var(--primary-light)' : '#ffffff',
                  color: category === cat ? 'var(--primary)' : 'var(--text-secondary)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Dietary and Sort Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={vegetarian}
                onChange={(e) => setVegetarian(e.target.checked)}
              />
              <Leaf size={14} color="#15803d" /> Vegetarian
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={vegan}
                onChange={(e) => setVegan(e.target.checked)}
              />
              Vegan
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <ArrowUpDown size={14} color="var(--text-muted)" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '4px 8px',
                  fontSize: '0.82rem'
                }}
              >
                <option value="recent">Recently Added</option>
                <option value="expiry">Expiring Soonest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Donations Grid */}
        {loading ? (
          <LoadingSpinner message="Searching available donations..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchDonations} />
        ) : donations.length === 0 ? (
          <EmptyState
            title="No surplus food found matching your criteria"
            description="Try loosening your category or dietary filters to view all available food donations."
            action={
              <button
                onClick={() => {
                  setCategory('All');
                  setVegetarian(false);
                  setVegan(false);
                  setSearch('');
                }}
                className="btn btn-secondary btn-sm"
              >
                Reset All Filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-3">
            {donations.map((d) => (
              <DonationCard
                key={d.id}
                donation={d}
                userRole={user?.role}
                onClaim={(item) => {
                  setSelectedDonation(item);
                  setDestination(user?.organization?.address || 'Community Distribution Hub');
                  setNotes('');
                  setClaimModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* CLAIM MODAL */}
      <Modal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        title="Claim Food Rescue Mission"
      >
        <form onSubmit={handleClaimSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedDonation?.title}</h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {selectedDonation?.quantity} {selectedDonation?.quantity_unit} • {selectedDonation?.food_category}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Pickup Address: <strong>{selectedDonation?.pickup_address}</strong>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Destination Center *</label>
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
            <label className="form-label">Notes (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Will arrive with thermal cooler boxes"
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

      <Footer />
    </div>
  );
};

export default DonationDiscoveryPage;
