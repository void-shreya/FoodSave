import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import {
  MapPin,
  Clock,
  Leaf,
  Calendar,
  Building,
  ArrowRight,
  HandHeart,
  AlertTriangle
} from 'lucide-react';

const DonationCard = ({ donation, onClaim = null, userRole = null }) => {
  if (!donation) return null;

  // Calculate remaining time until expiry
  const now = new Date();
  const expiry = new Date(donation.expiry_time);
  const diffHours = Math.round((expiry - now) / (1000 * 60 * 60));
  const isExpiringSoon = diffHours > 0 && diffHours <= 3;
  const isExpired = diffHours <= 0;

  const canClaim = donation.status === 'AVAILABLE' && !isExpired && ['volunteer', 'ngo', 'admin'].includes(userRole);

  return (
    <div
      className="card card-glass animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: 0,
        position: 'relative'
      }}
    >
      {/* Food Image */}
      <div style={{ position: 'relative', height: '190px', width: '100%', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
        <img
          src={donation.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
          alt={donation.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Top Badges */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap'
        }}>
          <StatusBadge status={isExpired && donation.status === 'AVAILABLE' ? 'EXPIRED' : donation.status} />
          {donation.vegan ? (
            <span className="badge badge-delivered" style={{ background: '#ecfdf5', color: '#047857' }}>
              <Leaf size={12} /> Vegan
            </span>
          ) : donation.vegetarian ? (
            <span className="badge badge-delivered" style={{ background: '#ecfdf5', color: '#047857' }}>
              <Leaf size={12} /> Veg
            </span>
          ) : null}
        </div>

        {/* Quantity Pill */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          color: '#ffffff',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem',
          fontWeight: 700
        }}>
          {donation.quantity} {donation.quantity_unit}
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
        {/* Category & Distance */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{donation.food_category}</span>
          {donation.distance_km !== null && donation.distance_km !== undefined && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <MapPin size={13} /> {donation.distance_km} km away
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.35,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {donation.title}
        </h3>

        {/* Donor Organization */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Building size={14} color="var(--primary)" />
          <span style={{ fontWeight: 500 }}>{donation.donor_name || 'Verified Donor'}</span>
        </div>

        {/* Expiry & Pickup Timers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          padding: '8px 10px',
          backgroundColor: 'var(--bg-main)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.78rem'
        }}>
          <div>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} /> Expiry:
            </div>
            <div style={{
              fontWeight: 600,
              color: isExpiringSoon ? 'var(--danger)' : isExpired ? '#9ca3af' : 'var(--text-primary)'
            }}>
              {isExpired ? 'Expired' : `${diffHours}h remaining`}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} /> Pickup:
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {new Date(donation.pickup_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
              {new Date(donation.pickup_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Safety Alert if close to expiry */}
        {isExpiringSoon && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#b45309',
            backgroundColor: '#fef3c7',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            <AlertTriangle size={14} /> Immediate rescue needed!
          </div>
        )}

        {/* Actions */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Link
            to={`/donations/${donation.id}`}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
          >
            Details
            <ArrowRight size={14} />
          </Link>

          {canClaim && onClaim && (
            <button
              onClick={() => onClaim(donation)}
              className="btn btn-primary btn-sm"
              style={{ flex: 1.2 }}
            >
              <HandHeart size={15} />
              Claim
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationCard;
