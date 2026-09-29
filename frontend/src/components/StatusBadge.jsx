import React from 'react';
import {
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  AlertCircle,
  XCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

const StatusBadge = ({ status, size = 'normal' }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  const configs = {
    AVAILABLE: {
      label: 'Available',
      className: 'badge badge-available',
      icon: <CheckCircle2 size={13} />
    },
    CLAIMED: {
      label: 'Claimed',
      className: 'badge badge-claimed',
      icon: <Clock size={13} />
    },
    PICKUP_SCHEDULED: {
      label: 'Scheduled',
      className: 'badge badge-in_transit',
      icon: <Clock size={13} />
    },
    ASSIGNED: {
      label: 'Assigned',
      className: 'badge badge-in_transit',
      icon: <Clock size={13} />
    },
    COLLECTED: {
      label: 'Collected',
      className: 'badge badge-collected',
      icon: <Truck size={13} />
    },
    IN_TRANSIT: {
      label: 'In Transit',
      className: 'badge badge-in_transit',
      icon: <Truck size={13} />
    },
    DELIVERED: {
      label: 'Delivered',
      className: 'badge badge-delivered',
      icon: <PackageCheck size={13} />
    },
    EXPIRED: {
      label: 'Expired',
      className: 'badge badge-expired',
      icon: <AlertCircle size={13} />
    },
    CANCELLED: {
      label: 'Cancelled',
      className: 'badge badge-cancelled',
      icon: <XCircle size={13} />
    },
    FAILED: {
      label: 'Failed',
      className: 'badge badge-cancelled',
      icon: <XCircle size={13} />
    },
    VERIFIED: {
      label: 'Verified',
      className: 'badge badge-delivered',
      icon: <ShieldCheck size={13} />
    },
    PENDING: {
      label: 'Pending',
      className: 'badge badge-claimed',
      icon: <RefreshCw size={13} />
    },
    REJECTED: {
      label: 'Rejected',
      className: 'badge badge-cancelled',
      icon: <XCircle size={13} />
    },
    RESOLVED: {
      label: 'Resolved',
      className: 'badge badge-delivered',
      icon: <CheckCircle2 size={13} />
    }
  };

  const config = configs[normalized] || {
    label: status,
    className: 'badge badge-expired',
    icon: null
  };

  return (
    <span
      className={config.className}
      style={{
        fontSize: size === 'sm' ? '0.68rem' : size === 'lg' ? '0.85rem' : '0.75rem',
        padding: size === 'sm' ? '0.15rem 0.5rem' : size === 'lg' ? '0.35rem 0.85rem' : '0.25rem 0.65rem'
      }}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

export default StatusBadge;
