import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { useNotifications } from '../hooks/useNotifications';
import api from '../services/api';
import {
  Users,
  Plus,
  Trash2,
  MapPin,
  ShieldCheck
} from 'lucide-react';

const BeneficiariesPage = () => {
  const { addToast } = useNotifications();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    category: 'COMMUNITY',
    people_count: 50,
    location_area: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ngos/beneficiaries');
      if (res.data?.success) {
        setBeneficiaries(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load beneficiaries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/ngos/beneficiaries', formData);
      addToast('Beneficiary center registered', 'success');
      setModalOpen(false);
      setFormData({
        display_name: '',
        category: 'COMMUNITY',
        people_count: 50,
        location_area: '',
        notes: ''
      });
      fetchBeneficiaries();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add center', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this beneficiary group?')) return;
    try {
      await api.delete(`/ngos/beneficiaries/${id}`);
      addToast('Beneficiary center removed', 'info');
      fetchBeneficiaries();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete center', 'danger');
    }
  };

  const totalServed = beneficiaries.reduce((sum, b) => sum + (Number(b.people_count) || 0), 0);

  return (
    <DashboardLayout
      title="Beneficiary Center Directory"
      subtitle="Privacy-conscious management of distribution sites, shelters, and community meal recipients"
      action={
        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus size={18} />
          + Add Beneficiary Center
        </button>
      }
    >
      {error && <ErrorMessage message={error} onRetry={fetchBeneficiaries} />}

      {/* Privacy Notice Card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '1rem 1.5rem',
        backgroundColor: '#f8fafc',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '2rem'
      }}>
        <ShieldCheck size={26} color="var(--primary)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong>Dignity & Privacy Protection:</strong> FoodSave never collects or stores personally identifiable information about individual recipients. All impact accounting is securely recorded by authorized group capacity only.
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading beneficiary groups..." />
      ) : beneficiaries.length === 0 ? (
        <EmptyState
          title="No beneficiary centers registered"
          description="Register community dining rooms, homeless shelters, or youth centers to track distribution reach."
          action={
            <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-sm">
              Add Your First Center
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-3">
          {beneficiaries.map(b => (
            <div key={b.id} className="card card-glass" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="badge badge-in_transit">{b.category}</span>
                <button
                  onClick={() => handleDelete(b.id)}
                  style={{ color: '#ef4444', padding: '4px', cursor: 'pointer' }}
                  title="Remove Center"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '12px 0 4px' }}>
                {b.display_name}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <MapPin size={15} color="var(--primary)" />
                {b.location_area}
              </div>

              {b.notes && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
                  {b.notes}
                </p>
              )}

              <div style={{
                marginTop: 'auto',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Estimated Capacity:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {b.people_count} people
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE BENEFICIARY MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Beneficiary Community Center"
      >
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Center Name *</label>
            <input
              type="text"
              required
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="e.g. St. Jude Community Food Pantry"
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
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
              <label className="form-label">People Served *</label>
              <input
                type="number"
                required
                min={1}
                value={formData.people_count}
                onChange={(e) => setFormData(prev => ({ ...prev, people_count: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Neighborhood / Area *</label>
            <input
              type="text"
              required
              value={formData.location_area}
              onChange={(e) => setFormData(prev => ({ ...prev, location_area: e.target.value }))}
              placeholder="e.g. SoMa or Downtown"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Operational Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Daily meal service from 12pm - 2pm"
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : 'Add Center'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default BeneficiariesPage;
