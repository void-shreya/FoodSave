import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#162217',
      color: '#e2e8f0',
      paddingTop: '4rem',
      paddingBottom: '2.5rem',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      marginTop: 'auto'
    }}>
      <div className="container-wide">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <HeartHandshake size={22} />
              </div>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                FOODSAVE
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              "Save Food. Share Hope. Reduce Waste."
              <br />
              A transparent, safe, and community-driven ecosystem rescuing safe surplus food for shelters and families in need.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80', fontSize: '0.85rem', fontWeight: 600 }}>
              <ShieldCheck size={18} />
              Verified Safe Food Distribution Network
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem' }}>
              Platform
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li><Link to="/donations" style={{ color: '#94a3b8' }}>Discover Surplus Food</Link></li>
              <li><Link to="/donations/create" style={{ color: '#94a3b8' }}>List Food Donation</Link></li>
              <li><Link to="/impact" style={{ color: '#94a3b8' }}>Community Impact Metrics</Link></li>
              <li><Link to="/ngo" style={{ color: '#94a3b8' }}>Verified NGO Partners</Link></li>
            </ul>
          </div>

          {/* User Roles */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem' }}>
              Get Involved
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li><Link to="/register?role=donor" style={{ color: '#94a3b8' }}>For Restaurants & Caterers</Link></li>
              <li><Link to="/register?role=volunteer" style={{ color: '#94a3b8' }}>For Volunteer Rescuers</Link></li>
              <li><Link to="/register?role=ngo" style={{ color: '#94a3b8' }}>For Shelter & NGO Leaders</Link></li>
              <li><Link to="/login" style={{ color: '#94a3b8' }}>Account Sign In</Link></li>
            </ul>
          </div>

          {/* Food Safety & Trust */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem' }}>
              Food Safety & Trust
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '0.8rem' }}>
              Every listing requires mandatory safety verification, storage instructions, preparation timestamps, and strict expiry controls.
            </p>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              color: '#cbd5e1'
            }}>
              🚨 Report suspicious or unsafe donations anytime to our 24/7 trust & safety moderation team.
            </div>
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div style={{
          padding: '1.25rem',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.8rem',
          color: '#94a3b8',
          lineHeight: 1.6,
          marginBottom: '2rem'
        }}>
          <strong style={{ color: '#e2e8f0' }}>Food Safety & Legal Notice: </strong>
          FoodSave provides coordinating software to bridge surplus food donors with authorized volunteers and non-profit organizations. FoodSave does not prepare, inspect, or store food items directly. All donors and recipients are expected to adhere strictly to applicable food hygiene standards, safe transport temperatures, and prompt consumption guidelines.
        </div>

        {/* Bottom Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '1.5rem',
          fontSize: '0.85rem',
          color: '#64748b'
        }}>
          <div>
            © {new Date().getFullYear()} FoodSave Platform. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Built with <Heart size={14} color="#ef4444" fill="#ef4444" /> for Zero Hunger & Zero Waste
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
