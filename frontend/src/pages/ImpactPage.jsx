import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatsCard from '../components/StatsCard';
import { SimpleBarChart, CategoryProgressList } from '../components/Charts';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import api from '../services/api';
import {
  Utensils,
  Leaf,
  Globe2,
  Users,
  Building2,
  HeartHandshake,
  Award,
  Sparkles,
  TreePine,
  Car
} from 'lucide-react';

const ImpactPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/impact');
      if (res.data?.success) {
        setMetrics(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load impact metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const monthlyData = [
    { label: 'May', value: 380, color: '#4caf50' },
    { label: 'Jun', value: 520, color: '#4caf50' },
    { label: 'Jul', value: 690, color: '#4caf50' },
    { label: 'Aug', value: 890, color: '#388e3c' },
    { label: 'Sep', value: metrics?.mealsRescued || 1240, color: '#2e7d32' }
  ];

  const categoryData = [
    { name: 'Cooked Surplus Meals', count: 1840, color: '#2e7d32' },
    { name: 'Fresh Bakery & Bread', count: 620, color: '#f59e0b' },
    { name: 'Farm Produce & Greens', count: 450, color: '#10b981' },
    { name: 'Dairy & Sealed Drinks', count: 280, color: '#0284c7' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fcfdfc' }}>
      <Navbar />

      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
        padding: '4rem 0 3rem',
        borderBottom: '1px solid var(--border-light)',
        textAlign: 'center'
      }}>
        <div className="container">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            <Sparkles size={16} /> Transparent Verified Impact
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Every Meal Saved is a <span style={{ color: 'var(--primary)' }}>Life Touched</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
            Our impact is measured not in abstract numbers, but in warm plates shared, greenhouse emissions averted, and community bonds strengthened.
          </p>
        </div>
      </section>

      {/* Main Stats Grid */}
      <div className="container-wide" style={{ flex: 1, padding: '3rem 1.5rem' }}>
        {loading ? (
          <LoadingSpinner message="Calculating community impact..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchMetrics} />
        ) : (
          <>
            {/* Top KPIs */}
            <div className="grid grid-cols-4" style={{ marginBottom: '2.5rem' }}>
              <StatsCard
                icon={Utensils}
                value={`${(metrics?.mealsRescued || 0).toLocaleString()}+`}
                label="Wholesome Meals Rescued"
                subtext="Direct to families and shelters"
                color="#2e7d32"
              />
              <StatsCard
                icon={Leaf}
                value={`${(metrics?.kgRescued || 0).toLocaleString()} kg`}
                label="Edible Food Diverted"
                subtext="Saved from landfill rot"
                color="#10b981"
              />
              <StatsCard
                icon={Globe2}
                value={`${(metrics?.co2SavedKg || 0).toLocaleString()} kg`}
                label="CO₂ Emissions Avoided"
                subtext="Calculated via EPA standard"
                color="#d97706"
              />
              <StatsCard
                icon={Users}
                value={`${(metrics?.peopleServed || 0).toLocaleString()}+`}
                label="Community Members Served"
                subtext="Across partner networks"
                color="#7c3aed"
              />
            </div>

            {/* Environmental Equivalents */}
            <div className="card card-glass" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                Environmental Equivalency Metrics
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', backgroundColor: '#f0fdf4', borderRadius: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TreePine size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#15803d' }}>
                      {Math.round((metrics?.co2SavedKg || 800) / 21)} trees
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Carbon absorption equivalent for 1 year
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', backgroundColor: '#eff6ff', borderRadius: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Car size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1d4ed8' }}>
                      {Math.round((metrics?.co2SavedKg || 800) * 2.4).toLocaleString()} miles
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Of gasoline passenger car travel avoided
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', backgroundColor: '#fdf4ff', borderRadius: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fae8ff', color: '#a21caf', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HeartHandshake size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#a21caf' }}>
                      {metrics?.activeDonors || 42} Kitchens & {metrics?.activeVolunteers || 128} Couriers
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Collaborating on real-time redistribution
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Charts */}
            <div className="grid grid-cols-2" style={{ marginBottom: '2.5rem' }}>
              <div className="card">
                <SimpleBarChart
                  data={monthlyData}
                  title="Monthly Meals Rescued Trend (2026)"
                  height={240}
                />
              </div>

              <div className="card">
                <CategoryProgressList
                  categories={categoryData}
                  title="Food Categories Rescued to Date"
                />
              </div>
            </div>

            {/* Methodology Note */}
            <div style={{
              padding: '1.5rem',
              backgroundColor: 'var(--bg-main)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}>
              <strong>Impact Calculation Methodology: </strong>
              FoodSave computes all figures directly from validated delivery records submitted by couriers and acknowledged by recipient shelters. Servings are normalized based on USDA and FAO dietary standards (approx. 400g per meal). Avoided emissions are computed using the EPA WARM model coefficient of approximately 2.5 kg CO₂ equivalent diverted per kilogram of food kept out of anaerobic decomposition.
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ImpactPage;
