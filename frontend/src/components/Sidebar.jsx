import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Truck,
  Send,
  Users,
  ShieldCheck,
  FileText,
  AlertTriangle,
  History,
  Compass,
  UserCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user, isDonor, isVolunteer, isNgo, isAdmin } = useAuth();

  const navItemStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.9rem',
    fontWeight: 600,
    textDecoration: 'none',
    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
    transition: 'all var(--transition-fast)'
  });

  return (
    <aside style={{
      width: '260px',
      flexShrink: 0,
      backgroundColor: '#ffffff',
      borderRight: '1px solid var(--border-light)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      minHeight: 'calc(100vh - 72px)'
    }}>
      {/* User profile mini summary */}
      <div style={{
        padding: '12px',
        backgroundColor: 'var(--bg-main)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700
        }}>
          {user?.name ? user.name[0].toUpperCase() : 'U'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name}
          </div>
          <span className="badge badge-available" style={{ fontSize: '0.62rem' }}>
            {user?.role}
          </span>
        </div>
      </div>

      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '8px', marginBottom: '4px' }}>
        Navigation
      </div>

      <NavLink to="/dashboard" style={navItemStyle} end>
        <LayoutDashboard size={18} />
        Dashboard
      </NavLink>

      {/* DONOR SPECIFIC */}
      {isDonor && (
        <>
          <NavLink to="/donations/create" style={navItemStyle}>
            <PlusCircle size={18} />
            + Donate Food
          </NavLink>
          <NavLink to="/my-donations" style={navItemStyle}>
            <Package size={18} />
            My Active Donations
          </NavLink>
          <NavLink to="/pickups" style={navItemStyle}>
            <Truck size={18} />
            Pickup Schedule
          </NavLink>
        </>
      )}

      {/* VOLUNTEER SPECIFIC */}
      {isVolunteer && (
        <>
          <NavLink to="/donations" style={navItemStyle}>
            <Compass size={18} />
            Discover Rescues
          </NavLink>
          <NavLink to="/pickups" style={navItemStyle}>
            <Truck size={18} />
            My Pickups
          </NavLink>
          <NavLink to="/deliveries" style={navItemStyle}>
            <Send size={18} />
            Deliveries
          </NavLink>
        </>
      )}

      {/* NGO SPECIFIC */}
      {isNgo && (
        <>
          <NavLink to="/donations" style={navItemStyle}>
            <Compass size={18} />
            Claim Donations
          </NavLink>
          <NavLink to="/pickups" style={navItemStyle}>
            <Truck size={18} />
            Pickups Tracker
          </NavLink>
          <NavLink to="/deliveries" style={navItemStyle}>
            <Send size={18} />
            Deliveries
          </NavLink>
          <NavLink to="/ngo/beneficiaries" style={navItemStyle}>
            <Users size={18} />
            Beneficiaries
          </NavLink>
        </>
      )}

      {/* ADMIN SUITE */}
      {isAdmin && (
        <>
          <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '8px 0' }} />
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '8px', marginBottom: '4px' }}>
            Admin Control
          </div>
          <NavLink to="/admin" style={navItemStyle} end>
            <ShieldCheck size={18} />
            Admin Overview
          </NavLink>
          <NavLink to="/admin/users" style={navItemStyle}>
            <UserCheck size={18} />
            Manage Users
          </NavLink>
          <NavLink to="/admin/donations" style={navItemStyle}>
            <Package size={18} />
            All Donations
          </NavLink>
          <NavLink to="/admin/ngos" style={navItemStyle}>
            <ShieldCheck size={18} />
            Verify NGOs
          </NavLink>
          <NavLink to="/admin/reports" style={navItemStyle}>
            <AlertTriangle size={18} />
            Reports Queue
          </NavLink>
          <NavLink to="/admin/audit-logs" style={navItemStyle}>
            <History size={18} />
            Audit Logs
          </NavLink>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
