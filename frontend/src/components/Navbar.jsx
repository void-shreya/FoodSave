import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import {
  HeartHandshake,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Compass,
  BarChart3,
  ShieldAlert,
  Building2,
  Truck,
  Bot,
  Sparkles
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isDonor, isVolunteer, isNgo, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    setShowUserMenu(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-light)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
    }}>
      <div className="container-wide" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(46, 125, 50, 0.3)'
          }}>
            <HeartHandshake size={24} />
          </div>
          <div>
            <span style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: '#2E7D32',
              letterSpacing: '-0.02em',
              display: 'block',
              lineHeight: 1
            }}>
              FOODSAVE
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              color: '#66BB6A',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Rescue • Share • Nourish
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }} className="desktop-nav">
          <Link
            to="/donations"
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: isActive('/donations') ? 'var(--primary)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Compass size={18} />
            Find Food
          </Link>

          <Link
            to="/impact"
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: isActive('/impact') ? 'var(--primary)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BarChart3 size={18} />
            Our Impact
          </Link>

          <Link
            to="/ngo"
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: isActive('/ngo') ? 'var(--primary)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Building2 size={18} />
            Partner NGOs
          </Link>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-foodsave-ai'))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: '#1b5e20',
              backgroundColor: '#e8f5e9',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid #c8e6c9',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#c8e6c9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#e8f5e9';
            }}
            title="Ask FoodSave AI Assistant"
          >
            <Sparkles size={16} color="#2e7d32" />
            <span>AI Assistant</span>
            <span style={{ fontSize: '0.65rem', backgroundColor: '#2e7d32', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
              AI
            </span>
          </button>

          {/* Role specific quick action */}
          {isAuthenticated && isDonor && (
            <Link to="/donations/create" className="btn btn-primary btn-sm">
              <PlusCircle size={16} />
              + Donate Food
            </Link>
          )}

          {isAuthenticated && (isVolunteer || isNgo) && (
            <Link to="/pickups" className="btn btn-outline btn-sm">
              <Truck size={16} />
              Pickups
            </Link>
          )}

          {isAuthenticated && isAdmin && (
            <Link to="/admin" className="btn btn-sm" style={{ backgroundColor: '#1e293b', color: '#fff' }}>
              <ShieldAlert size={16} />
              Admin Portal
            </Link>
          )}
        </div>

        {/* Right Section: Auth & Notifications */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                  style={{
                    position: 'relative',
                    padding: '8px',
                    borderRadius: '50%',
                    backgroundColor: showNotifications ? 'var(--primary-light)' : 'transparent',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      backgroundColor: 'var(--danger)',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #ffffff'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '340px',
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--border-light)',
                    padding: '12px',
                    zIndex: 1050,
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                          No notifications yet
                        </p>
                      ) : (
                        notifications.slice(0, 5).map(n => (
                          <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: n.is_read ? 'transparent' : 'var(--primary-light)',
                              marginBottom: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                              {n.title}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              {n.message}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
                      <Link
                        to="/notifications"
                        onClick={() => setShowNotifications(false)}
                        style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)' }}
                      >
                        View all notifications →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--border-subtle)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}>
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
                  <span className={`badge badge-${user.role === 'admin' ? 'claimed' : 'available'}`} style={{ fontSize: '0.65rem' }}>
                    {user.role}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '210px',
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--border-light)',
                    padding: '8px',
                    zIndex: 1050,
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    <Link
                      to="/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.88rem',
                        color: 'var(--text-primary)',
                        fontWeight: 500
                      }}
                    >
                      <BarChart3 size={16} />
                      Dashboard
                    </Link>

                    {isDonor && (
                      <Link
                        to="/my-donations"
                        onClick={() => setShowUserMenu(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.88rem',
                          color: 'var(--text-primary)',
                          fontWeight: 500
                        }}
                      >
                        <Compass size={16} />
                        My Donations
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.88rem',
                        color: 'var(--text-primary)',
                        fontWeight: 500
                      }}
                    >
                      <User size={16} />
                      Profile Settings
                    </Link>

                    <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '4px 0' }} />

                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.88rem',
                        color: 'var(--danger)',
                        fontWeight: 600,
                        textAlign: 'left'
                      }}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', padding: '6px', color: 'var(--text-primary)' }}
            className="mobile-toggle"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--border-light)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <Link to="/donations" onClick={() => setMobileMenuOpen(false)}>Find Food</Link>
          <Link to="/impact" onClick={() => setMobileMenuOpen(false)}>Our Impact</Link>
          <Link to="/ngo" onClick={() => setMobileMenuOpen(false)}>Partner NGOs</Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              window.dispatchEvent(new CustomEvent('open-foodsave-ai'));
            }}
            style={{
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--primary)',
              fontWeight: 600,
              padding: '6px 0'
            }}
          >
            <Sparkles size={18} color="var(--primary)" />
            Ask FoodSave AI Assistant
          </button>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
              <button onClick={handleLogout} style={{ color: 'var(--danger)', textAlign: 'left', fontWeight: 600 }}>
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
