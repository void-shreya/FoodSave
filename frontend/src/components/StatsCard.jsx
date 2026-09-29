import React from 'react';

const StatsCard = ({
  icon: Icon,
  value,
  label,
  subtext,
  color = '#2E7D32',
  trend = null
}) => {
  return (
    <div
      className="card card-glass animate-fade-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        padding: '1.25rem 1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background soft glow accent */}
      <div
        style={{
          position: 'absolute',
          top: '-15px',
          right: '-15px',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          backgroundColor: color,
          opacity: 0.08,
          pointerEvents: 'none'
        }}
      />

      {/* Icon Bubble */}
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          backgroundColor: `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          flexShrink: 0
        }}
      >
        {Icon && <Icon size={26} />}
      </div>

      {/* Metric details */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          color: 'var(--text-primary)',
          lineHeight: 1.1
        }}>
          {value}
        </div>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '2px' }}>
          {label}
        </div>
        {subtext && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {subtext}
          </div>
        )}
      </div>

      {trend && (
        <span style={{
          alignSelf: 'flex-start',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: trend.startsWith('+') ? '#15803d' : '#b91c1c',
          backgroundColor: trend.startsWith('+') ? '#dcfce7' : '#fee2e2',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)'
        }}>
          {trend}
        </span>
      )}
    </div>
  );
};

export default StatsCard;
