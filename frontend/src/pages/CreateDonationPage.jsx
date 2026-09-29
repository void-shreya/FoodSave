import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ErrorMessage from '../components/ErrorMessage';
import { useNotifications } from '../hooks/useNotifications';
import api from '../services/api';
import aiService from '../services/aiService';
import {
  Utensils,
  ShieldCheck,
  Clock,
  Calendar,
  MapPin,
  Leaf,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon,
  Bot,
  Sparkles
} from 'lucide-react';

const CreateDonationPage = () => {
  const navigate = useNavigate();
  const { addToast } = useNotifications();

  // Helper for ISO date strings
  const now = new Date();
  const formatForInput = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    food_category: 'Cooked Meals',
    quantity: 20,
    quantity_unit: 'servings',
    vegetarian: true,
    vegan: false,
    contains_allergens: false,
    allergen_details: '',
    prepared_at: formatForInput(new Date(now.getTime() - 1 * 3600 * 1000)),
    expiry_time: formatForInput(new Date(now.getTime() + 8 * 3600 * 1000)),
    pickup_start_time: formatForInput(now),
    pickup_end_time: formatForInput(new Date(now.getTime() + 4 * 3600 * 1000)),
    pickup_address: '45 Market Street',
    pickup_city: 'San Francisco',
    pickup_state: 'California',
    pickup_pincode: '94105',
    latitude: 37.7937,
    longitude: -122.3965,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    storage_instructions: 'Keep hot trays above 60°C or refrigerate immediately upon collection.',
    safety_confirmed: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [safetyAnalysis, setSafetyAnalysis] = useState(null);
  const [isCheckingSafety, setIsCheckingSafety] = useState(false);

  const handleRunAiSafetyAudit = async () => {
    setIsCheckingSafety(true);
    try {
      const result = await aiService.checkFoodSafety({
        food_category: formData.food_category,
        prepared_at: formData.prepared_at,
        expiry_time: formData.expiry_time,
        contains_allergens: formData.contains_allergens,
        allergen_details: formData.allergen_details,
        quantity: formData.quantity,
        quantity_unit: formData.quantity_unit
      });
      setSafetyAnalysis(result);
      if (result.status === 'APPROVED') {
        addToast({
          title: 'AI Safety Audit: Passed ✅',
          message: `Safety score: ${result.safetyScore}/100. Meets food rescue standards.`,
          type: 'SUCCESS'
        });
      } else {
        addToast({
          title: `AI Safety Audit: ${result.status} ⚠️`,
          message: result.warnings[0] || 'Please review safety recommendations.',
          type: 'WARNING'
        });
      }
    } catch (err) {
      console.error('Safety check failed:', err);
      addToast({
        title: 'Safety Check Unavailable',
        message: 'Could not contact safety engine. Proceed with caution.',
        type: 'ERROR'
      });
    } finally {
      setIsCheckingSafety(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Safety validation
    if (!formData.safety_confirmed) {
      setError('You must check the mandatory food safety confirmation checkbox to list this donation.');
      return;
    }

    const prepDate = new Date(formData.prepared_at);
    const expDate = new Date(formData.expiry_time);

    if (expDate <= prepDate) {
      setError('Expiry time must be later than preparation time.');
      return;
    }

    if (expDate <= new Date()) {
      setError('Food is already past its expiration time. Only safe, unexpired food can be rescued.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/donations', {
        ...formData,
        quantity: Number(formData.quantity),
        prepared_at: new Date(formData.prepared_at).toISOString(),
        expiry_time: new Date(formData.expiry_time).toISOString(),
        pickup_start_time: new Date(formData.pickup_start_time).toISOString(),
        pickup_end_time: new Date(formData.pickup_end_time).toISOString()
      });

      if (res.data?.success) {
        addToast('Food donation created successfully! It is now visible to volunteers & NGOs.', 'success');
        navigate('/my-donations');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to list food donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Navbar />

      <div className="container" style={{ flex: 1, padding: '2.5rem 1.5rem', maxWidth: '840px' }}>
        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.9rem',
            marginBottom: '1.25rem'
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="card" style={{ padding: '2.5rem 2rem', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              backgroundColor: 'var(--primary-light)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '0.8rem'
            }}>
              <Utensils size={14} /> Donor Surplus Portal
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              List a Food Donation
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Provide accurate details and food safety declarations to connect your surplus meals with volunteers.
            </p>
          </div>

          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit}>
            {/* SECTION 1: FOOD DETAILS */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
                1. Food Information
              </h3>

              <div className="form-group">
                <label className="form-label">Food Title / Name *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Fresh Vegetable Pilaf Trays & Dal"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    name="food_category"
                    value={formData.food_category}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="Cooked Meals">Cooked Meals</option>
                    <option value="Bakery & Bread">Bakery & Bread</option>
                    <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                    <option value="Dairy Products">Dairy Products</option>
                    <option value="Packaged & Dry Goods">Packaged & Dry Goods</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit *</label>
                  <select
                    name="quantity_unit"
                    value={formData.quantity_unit}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="servings">servings</option>
                    <option value="kg">kg</option>
                    <option value="items">items / loaves</option>
                    <option value="boxes">boxes / trays</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description & Packaging Details</label>
                <textarea
                  rows={2}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g. 4 aluminum catering trays packed with lid seals"
                  className="form-textarea"
                />
              </div>

              {/* Dietary Toggles */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    name="vegetarian"
                    checked={formData.vegetarian}
                    onChange={handleChange}
                  />
                  <Leaf size={16} color="#15803d" /> Vegetarian
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    name="vegan"
                    checked={formData.vegan}
                    onChange={handleChange}
                  />
                  Vegan
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    name="contains_allergens"
                    checked={formData.contains_allergens}
                    onChange={handleChange}
                  />
                  Contains Allergens
                </label>
              </div>

              {formData.contains_allergens && (
                <div className="form-group" style={{ marginTop: '0.8rem' }}>
                  <label className="form-label">Specify Allergens (e.g. Dairy, Gluten, Nuts)</label>
                  <input
                    type="text"
                    name="allergen_details"
                    value={formData.allergen_details}
                    onChange={handleChange}
                    placeholder="e.g. Contains dairy and gluten"
                    className="form-input"
                  />
                </div>
              )}

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Food Photo URL</label>
                <div style={{ position: 'relative' }}>
                  <ImageIcon size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: FOOD SAFETY & TIMINGS */}
            <div style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              backgroundColor: 'var(--bg-main)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)'
            }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} /> 2. Safety & Freshness Verification
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                FoodSave rejects expired listings automatically. Ensure preparation and expiry timestamps are accurate.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Prepared Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    name="prepared_at"
                    value={formData.prepared_at}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expiry Date & Time (Must be strictly after prep) *</label>
                  <input
                    type="datetime-local"
                    required
                    name="expiry_time"
                    value={formData.expiry_time}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Storage & Temperature Instructions</label>
                <input
                  type="text"
                  name="storage_instructions"
                  value={formData.storage_instructions}
                  onChange={handleChange}
                  placeholder="e.g. Keep warm above 60°C or chill below 4°C"
                  className="form-input"
                />
              </div>
            </div>

            {/* SECTION 3: PICKUP LOCATION & WINDOW */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
                3. Pickup Logistics
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Pickup Window Opens *</label>
                  <input
                    type="datetime-local"
                    required
                    name="pickup_start_time"
                    value={formData.pickup_start_time}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pickup Window Closes *</label>
                  <input
                    type="datetime-local"
                    required
                    name="pickup_end_time"
                    value={formData.pickup_end_time}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Pickup Address *</label>
                <input
                  type="text"
                  required
                  name="pickup_address"
                  value={formData.pickup_address}
                  onChange={handleChange}
                  placeholder="45 Market Street, Kitchen Loading Dock"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.8rem' }}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    required
                    name="pickup_city"
                    value={formData.pickup_city}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="pickup_state"
                    value={formData.pickup_state}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    name="pickup_pincode"
                    value={formData.pickup_pincode}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* AI Safety Advisor Bar */}
            <div style={{
              padding: '1.25rem',
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#15803d'
                  }}>
                    <Bot size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#14532d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      FoodSave AI Safety Advisor
                      <span style={{ fontSize: '0.7rem', backgroundColor: '#15803d', color: '#fff', padding: '1px 6px', borderRadius: '8px' }}>
                        AUTOMATED
                      </span>
                    </strong>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#166534' }}>
                      Audit shelf-life, temperature requirements, and allergen disclosures before posting.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleRunAiSafetyAudit}
                    disabled={isCheckingSafety}
                    style={{
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                    }}
                  >
                    {isCheckingSafety ? <Loader2 size={15} className="pulse" /> : <Sparkles size={15} />}
                    {isCheckingSafety ? 'Auditing...' : 'Run Safety Pre-Check'}
                  </button>

                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-foodsave-ai', { detail: { query: `How to safely store and transport ${formData.food_category}?` } }))}
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#15803d',
                      border: '1px solid #86efac',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Ask AI Assistant
                  </button>
                </div>
              </div>

              {safetyAnalysis && (
                <div style={{
                  marginTop: '14px',
                  paddingTop: '12px',
                  borderTop: '1px solid #bbf7d0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#14532d' }}>
                        Safety Score:
                      </span>
                      <span style={{
                        fontWeight: 800,
                        fontSize: '1rem',
                        color: safetyAnalysis.safetyScore >= 80 ? '#15803d' : '#b45309'
                      }}>
                        {safetyAnalysis.safetyScore}/100
                      </span>
                    </div>

                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: safetyAnalysis.status === 'APPROVED' ? '#dcfce7' : '#fef3c7',
                      color: safetyAnalysis.status === 'APPROVED' ? '#15803d' : '#b45309'
                    }}>
                      Status: {safetyAnalysis.status}
                    </span>
                  </div>

                  {safetyAnalysis.warnings && safetyAnalysis.warnings.length > 0 && (
                    <div style={{ backgroundColor: '#fffbeb', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#92400e' }}>
                      {safetyAnalysis.warnings.map((w, idx) => (
                        <div key={idx}>⚠️ {w}</div>
                      ))}
                    </div>
                  )}

                  {safetyAnalysis.recommendations && safetyAnalysis.recommendations.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#166534' }}>
                      <strong>Recommendations:</strong>
                      <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                        {safetyAnalysis.recommendations.map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* MANDATORY FOOD SAFETY DECLARATION */}
            <div style={{
              padding: '1.25rem',
              backgroundColor: '#fef3c7',
              border: '1.5px solid #f59e0b',
              borderRadius: 'var(--radius-md)',
              marginBottom: '2rem'
            }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  required
                  name="safety_confirmed"
                  checked={formData.safety_confirmed}
                  onChange={handleChange}
                  style={{ marginTop: '4px', width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '0.92rem', color: '#78350f', fontWeight: 600, lineHeight: 1.5 }}>
                  "I confirm that this food is safe for consumption and has been stored/handled appropriately."
                </span>
              </label>
              <div style={{ fontSize: '0.78rem', color: '#92400e', marginTop: '8px', paddingLeft: '30px' }}>
                FoodSave connects food rescue logistics but does not guarantee food safety directly. Donors are legally and ethically responsible for truth in listing.
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              {loading ? <Loader2 size={20} className="pulse" /> : <CheckCircle2 size={20} />}
              {loading ? 'Submitting Donation...' : 'Publish Food Donation'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateDonationPage;
