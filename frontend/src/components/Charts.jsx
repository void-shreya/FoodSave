import React from 'react';

/**
 * Responsive Pure SVG Bar Chart
 */
export const SimpleBarChart = ({
  data = [],
  height = 200,
  barColor = '#2E7D32',
  title = ''
}) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
        No chart data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartHeight = height - 40;

  return (
    <div style={{ width: '100%' }}>
      {title && (
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          {title}
        </h4>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: `${chartHeight}px`, paddingTop: '10px' }}>
        {data.map((item, idx) => {
          const barHeightPct = Math.max((item.value / maxValue) * 100, 4);
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                position: 'relative'
              }}
              title={`${item.label}: ${item.value}`}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                {item.value}
              </span>
              <div
                style={{
                  width: '100%',
                  maxWidth: '38px',
                  height: `${barHeightPct}%`,
                  background: item.color || `linear-gradient(180deg, ${barColor} 0%, #1b5e20 100%)`,
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.5s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                }}
              />
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginTop: '6px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '60px'
              }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Category Breakdown List with Progress Bars
 */
export const CategoryProgressList = ({ categories = [], title = 'Category Breakdown' }) => {
  const total = categories.reduce((sum, c) => sum + (c.count || 0), 0) || 1;

  const defaultColors = ['#2E7D32', '#66BB6A', '#FFB300', '#0284c7', '#8b5cf6', '#ec4899'];

  return (
    <div>
      {title && (
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          {title}
        </h4>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {categories.map((cat, idx) => {
          const pct = Math.round(((cat.count || 0) / total) * 100);
          const color = cat.color || defaultColors[idx % defaultColors.length];
          return (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{cat.count} ({pct}%)</span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--border-subtle)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    backgroundColor: color,
                    borderRadius: '4px',
                    transition: 'width 0.6s ease'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
