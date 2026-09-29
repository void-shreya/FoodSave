import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import {
  HeartHandshake,
  Utensils,
  Truck,
  Building2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Apple,
  Package,
  Milk,
  Croissant,
  Coffee,
  CheckCircle2,
  Clock,
  Award
} from 'lucide-react';

const LandingPage = () => {
  const [metrics, setMetrics] = useState({
    mealsRescued: 2450,
    kgRescued: 980,
    co2SavedKg: 2450,
    activeDonors: 42,
    activeVolunteers: 128,
    ngosOnboarded: 18,
    peopleServed: 1850
  });

  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const res = await api.get('/impact');
        if (res.data?.success) {
          setMetrics(prev => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        // Fallback to initial display stats
      }
    };
    fetchImpact();
  }, []);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does FoodSave ensure food safety?',
      a: 'Food donors are required to confirm preparation dates, realistic expiration times, allergen details, and proper storage protocols. Only safe, untouched surplus food is permitted. Food nearing expiry triggers immediate warnings, and expired food is automatically disabled from the discovery pool.'
    },
    {
      q: 'Who can register as a food donor?',
      a: 'Restaurants, hotels, catered events, bakery shops, grocery stores, corporate cafeterias, and verified community members with safe leftover edible food can register and list donations instantly.'
    },
    {
      q: 'How do volunteers claim and transport food?',
      a: 'Registered volunteers browse nearby available food listings, reserve a pickup, and receive precise collection instructions. Volunteers transport items in clean, thermal bags to partner shelters and dining halls.'
    },
    {
      q: 'Can NGOs receive recurring bulk food distributions?',
      a: 'Yes. Verified non-profit organizations and soup kitchens can claim bulk meal trays, assign volunteer couriers, track incoming deliveries in real time, and log their beneficiary distributions.'
    },
    {
      q: 'Is there any fee to use FoodSave?',
      a: 'No. FoodSave is 100% free for donors, volunteers, and charitable organizations to maximize humanitarian impact and eradicate edible food waste.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fcfdfc' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
        paddingTop: '4.5rem',
        paddingBottom: '5rem',
        borderBottom: '1px solid var(--border-light)'
      }}>
        {/* Decorative soft circles */}
        <div style={{
          position: 'absolute',
          top: '-120px',
          right: '-100px',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(76, 175, 80, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 179, 0, 0.12) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            {/* Tagline Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              backgroundColor: 'var(--primary-light)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--primary)',
              fontSize: '0.88rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              border: '1px solid #bbf7d0'
            }}>
              <Sparkles size={16} />
              Save Food. Share Hope. Reduce Waste.
            </div>

            {/* Main Title */}
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#1b1b1b',
              marginBottom: '1.5rem',
              letterSpacing: '-0.03em'
            }}>
              Turning Surplus Food Into <span style={{ color: '#2e7d32' }}>Nourishing Meals</span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '1.2rem',
              color: '#4b5563',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
              maxWidth: '700px',
              margin: '0 auto 2.5rem'
            }}>
              Connect surplus food with trusted NGOs and volunteers so safe, edible food reaches hungry families instead of overflowing landfills.
            </p>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '14px'
            }}>
              <Link to="/donations/create" className="btn btn-primary btn-lg">
                <Utensils size={20} />
                Donate Food
              </Link>
              <Link to="/donations" className="btn btn-secondary btn-lg">
                Find Surplus Food
                <ArrowRight size={20} />
              </Link>
              <Link to="/register?role=volunteer" className="btn btn-outline btn-lg">
                Join as Volunteer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Impact Stats Counter Bar */}
      <section style={{
        backgroundColor: '#ffffff',
        padding: '2.5rem 0',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="container-wide">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '2rem',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                {metrics.mealsRescued.toLocaleString()}+
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Meals Rescued
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-heading)' }}>
                {metrics.kgRescued.toLocaleString()} kg
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Edible Food Saved
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#d97706', fontFamily: 'var(--font-heading)' }}>
                {metrics.co2SavedKg.toLocaleString()} kg
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                CO₂ Emissions Avoided
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#7c3aed', fontFamily: 'var(--font-heading)' }}>
                {metrics.ngosOnboarded}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                NGO Shelters Partnered
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-heading)' }}>
                {metrics.activeVolunteers}+
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Active Volunteer Rescuers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How FoodSave Works (5 Steps) */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.8rem' }}>
              How FoodSave Works
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              A seamless, transparent 5-step lifecycle ensuring safe food transitions quickly from donors to community tables.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Step 1 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.25rem' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                fontSize: '1.2rem',
                fontWeight: 800
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Donate</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Donors list surplus trays with food category, preparation time, allergens, and safe expiry window.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.25rem' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                fontSize: '1.2rem',
                fontWeight: 800
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Connect</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Nearby NGOs and volunteers discover listings instantly through real-time geo-filtered feeds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.25rem' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                fontSize: '1.2rem',
                fontWeight: 800
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Collect</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Volunteers claim donations, pick them up within designated hours, and verify temperatures.
              </p>
            </div>

            {/* Step 4 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.25rem' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#f3e8ff',
                color: '#7e22ce',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                fontSize: '1.2rem',
                fontWeight: 800
              }}>
                4
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Deliver</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Food is safely transported and handed over to shelters, dining halls, or community kitchens.
              </p>
            </div>

            {/* Step 5 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.25rem' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#fce7f3',
                color: '#be185d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                fontSize: '1.2rem',
                fontWeight: 800
              }}>
                5
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Impact</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Every rescue updates live impact dashboards, audit logs, and environmental diversion metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Food Categories Grid */}
      <section style={{ padding: '5rem 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.8rem' }}>
              Rescued Food Categories
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              From cooked hot trays to fresh farm produce and packaged rations, we rescue all edible food.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem'
          }}>
            {[
              { name: 'Cooked Meals', icon: Utensils, desc: 'Hot trays, rice, pasta & curries' },
              { name: 'Bakery & Bread', icon: Croissant, desc: 'Sourdough, bagels, croissants' },
              { name: 'Fruits & Veggies', icon: Apple, desc: 'Fresh farm harvest & greens' },
              { name: 'Dairy Products', icon: Milk, desc: 'Milk, cheese, yogurt packs' },
              { name: 'Dry & Packaged', icon: Package, desc: 'Cereals, canned items & grains' },
              { name: 'Beverages', icon: Coffee, desc: 'Bottled juices & plant drinks' }
            ].map((cat, idx) => {
              const CatIcon = cat.icon;
              return (
                <Link
                  key={idx}
                  to={`/donations?category=${encodeURIComponent(cat.name)}`}
                  className="card"
                  style={{
                    textAlign: 'center',
                    padding: '1.75rem 1rem',
                    textDecoration: 'none',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <CatIcon size={24} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {cat.name}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cat.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Food Safety & Trust Section */}
      <section style={{
        padding: '5rem 0',
        background: 'linear-gradient(135deg, #1b381e 0%, #0d2010 100%)',
        color: '#ffffff'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(74, 222, 128, 0.15)',
                color: '#4ade80',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '1.25rem'
              }}>
                <ShieldCheck size={18} />
                Strict Food Safety Standard
              </div>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25, marginBottom: '1.25rem' }}>
                Food Safety is Our #1 Priority
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                We believe that food security and dignity go hand in hand. FoodSave establishes systematic protocols ensuring that surplus food is wholesome, fresh, and properly handled every step of the journey.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  'Mandatory donor confirmation of food hygiene and storage conditions',
                  'Strict expiry time validation with automated listing expiration',
                  'Detailed allergen, vegetarian, and dietary classifications',
                  'Immediate reporting system for 24/7 trust and safety moderation'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <CheckCircle2 size={20} color="#4ade80" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.95rem', color: '#e2e8f0' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(10px)',
              padding: '2.5rem',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
                <Clock size={28} color="#facc15" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                  The 2-Hour Pickup Protocol
                </h3>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Cooked perishable food must be picked up within rapid transit windows and transported in insulated coolers to preserve safe temperature thresholds.
              </p>
              <div style={{ padding: '12px 16px', backgroundColor: 'rgba(234, 179, 8, 0.15)', borderRadius: '8px', borderLeft: '4px solid #eab308' }}>
                <span style={{ color: '#fef08a', fontSize: '0.82rem', fontWeight: 600 }}>
                  "Please verify that food remains safe to consume before final community distribution."
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Specific Onboarding Cards */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.8rem' }}>
              Join the FoodSave Movement
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Choose your role and become an active hero in the fight against hunger.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {/* For Donors */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Utensils size={28} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                For Food Donors
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Restaurants, hotels, caterers, and bakeries. Reduce commercial waste, receive tax receipts, and support local shelters.
              </p>
              <div style={{ marginTop: 'auto' }}>
                <Link to="/register?role=donor" className="btn btn-primary" style={{ width: '100%' }}>
                  Register as Donor
                </Link>
              </div>
            </div>

            {/* For Volunteers */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Truck size={28} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                For Volunteers
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Lend a hand by claiming nearby pickups and delivering nutritious meals on your bicycle or car during your free time.
              </p>
              <div style={{ marginTop: 'auto' }}>
                <Link to="/register?role=volunteer" className="btn btn-primary" style={{ width: '100%', backgroundColor: '#0284c7' }}>
                  Become a Volunteer
                </Link>
              </div>
            </div>

            {/* For NGOs */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Building2 size={28} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                For NGOs & Shelters
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Non-profits, community pantries, and elder care homes. Access steady surplus food donations to feed hundreds daily.
              </p>
              <div style={{ marginTop: 'auto' }}>
                <Link to="/register?role=ngo" className="btn btn-primary" style={{ width: '100%', backgroundColor: '#b45309' }}>
                  Register Your NGO
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Testimonials (Demo Content clearly marked) */}
      <section style={{ padding: '5rem 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Community Stories (Demo)
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
              Loved by Donors & Shelters
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div className="card">
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '1.25rem' }}>
                "Instead of composting 40 delicious portions of chef-prepared pilaf after catering events, FoodSave connects us to Hope Outreach within 15 minutes. It transformed our restaurant’s sustainability."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                  GH
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Green Harvest Bistro</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Verified Food Donor</div>
                </div>
              </div>
            </div>

            <div className="card">
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '1.25rem' }}>
                "As a volunteer rider, FoodSave gives me clear pickup addresses, safe handling instructions, and coordinates deliveries smoothly with zero paperwork. I feel genuine pride after every drop-off."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0369a1' }}>
                  AR
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Alex Rivera</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Community Volunteer Courier</div>
                </div>
              </div>
            </div>

            <div className="card">
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '1.25rem' }}>
                "FoodSave helps us serve nutritious hot meals to over 150 elderly and youth residents every single week. The automated notifications and transparency make logistics dependable."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#b45309' }}>
                  HO
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Hope Outreach Foundation</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Verified Non-Profit Partner</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.8rem' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Have questions about how food rescue, verification, and safety work? We've got answers.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="card"
                style={{ padding: '1.25rem 1.5rem', cursor: 'pointer' }}
                onClick={() => toggleFaq(idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {faq.q}
                  </h4>
                  {activeFaq === idx ? <ChevronUp size={20} color="var(--primary)" /> : <ChevronDown size={20} color="#9ca3af" />}
                </div>
                {activeFaq === idx && (
                  <p style={{ marginTop: '1rem', fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, animation: 'fadeIn 0.2s ease' }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
