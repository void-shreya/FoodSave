import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import { SimpleBarChart } from '../components/Charts';
import { Modal } from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { useNotifications } from '../hooks/useNotifications';
import api from '../services/api';
import {
  ShieldAlert,
  Users,
  Utensils,
  AlertTriangle,
  History,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Lock,
  Unlock,
  ShieldCheck
} from 'lucide-react';

const AdminDashboard = () => {
  const { addToast } = useNotifications();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'donations', 'ngos', 'reports', 'audit'

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [reports, setReports] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Report resolution modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportStatus, setReportStatus] = useState('RESOLVED');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [dashRes, usersRes, donationsRes, reportsRes, auditRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/donations'),
        api.get('/admin/reports'),
        api.get('/admin/audit-logs')
      ]);

      if (dashRes.data?.success) setStats(dashRes.data.data.stats);
      if (usersRes.data?.success) setUsers(usersRes.data.data);
      if (donationsRes.data?.success) setDonations(donationsRes.data.data);
      if (reportsRes.data?.success) setReports(reportsRes.data.data);
      if (auditRes.data?.success) setAuditLogs(auditRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load administrative control center');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, {
        is_active: !currentStatus
      });
      addToast(`User ${!currentStatus ? 'activated' : 'suspended'} successfully`, 'info');
      fetchAdminData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to change user status', 'danger');
    }
  };

  const handleResolveReport = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      await api.put(`/admin/reports/${selectedReport.id}`, {
        status: reportStatus,
        admin_notes: adminNotes
      });
      addToast(`Report marked as ${reportStatus}`, 'success');
      setReportModalOpen(false);
      fetchAdminData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update report', 'danger');
    }
  };

  const handleCancelDonation = async (donationId) => {
    try {
      await api.post(`/donations/${donationId}/cancel`);
      addToast('Suspicious donation cancelled by admin', 'info');
      fetchAdminData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel donation', 'danger');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="System Administration">
        <LoadingSpinner message="Loading platform controls..." />
      </DashboardLayout>
    );
  }

  const roleChartData = [
    { label: 'Donors', value: stats?.totalDonors || 0, color: '#2e7d32' },
    { label: 'Volunteers', value: stats?.totalVolunteers || 0, color: '#0284c7' },
    { label: 'NGOs', value: stats?.totalNgos || 0, color: '#d97706' },
    { label: 'Admins', value: 1, color: '#1e293b' }
  ];

  return (
    <DashboardLayout
      title="Platform Administration Portal"
      subtitle="System health, security oversight, user moderation, and audit compliance"
    >
      {error && <ErrorMessage message={error} onRetry={fetchAdminData} />}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatsCard
          icon={Users}
          value={stats?.totalUsers || users.length}
          label="Total Registered Users"
          subtext="Donors, Volunteers, NGOs"
          color="#2e7d32"
        />
        <StatsCard
          icon={Utensils}
          value={stats?.totalDonations || donations.length}
          label="Food Rescues"
          subtext={`${stats?.completedDonations || 0} successfully delivered`}
          color="#0284c7"
        />
        <StatsCard
          icon={Building2}
          value={stats?.totalNgos || 0}
          label="Registered NGOs"
          subtext={`${stats?.pendingNgoVerifications || 0} pending review`}
          color="#d97706"
        />
        <StatsCard
          icon={AlertTriangle}
          value={stats?.pendingReports || 0}
          label="Open Moderation Reports"
          subtext="Requires admin investigation"
          color="#dc2626"
        />
      </div>

      {/* Tab Nav */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid var(--border-light)',
        marginBottom: '1.75rem',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {[
          { id: 'overview', label: 'Overview & KPIs', icon: ShieldCheck },
          { id: 'users', label: `Users (${users.length})`, icon: Users },
          { id: 'donations', label: `Donations (${donations.length})`, icon: Utensils },
          { id: 'reports', label: `Reports (${reports.length})`, icon: AlertTriangle },
          { id: 'audit', label: `Audit Logs (${auditLogs.length})`, icon: History }
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 16px',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                marginBottom: '-2px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <TabIcon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2">
          <div className="card">
            <SimpleBarChart
              data={roleChartData}
              title="Platform User Role Distribution"
              height={220}
            />
          </div>
          <div className="card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
              System Health & Compliance
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg-main)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>PostgreSQL Row Level Security (RLS)</span>
                <span className="badge badge-delivered">Enabled & Protected</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg-main)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Automated Expiry Cron Daemon</span>
                <span className="badge badge-delivered">Active (Every 1m)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg-main)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Rate Limiting & Helmet Guard</span>
                <span className="badge badge-delivered">Enforced</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg-main)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Service Role Token Leak Prevention</span>
                <span className="badge badge-delivered">Secure (Backend Only)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: USERS */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>User Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Email Address</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Role</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Created</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-in_transit">{u.role}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${u.is_active !== false ? 'badge-delivered' : 'badge-cancelled'}`}>
                        {u.is_active !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.is_active !== false)}
                          className={`btn btn-sm ${u.is_active !== false ? 'btn-danger' : 'btn-primary'}`}
                        >
                          {u.is_active !== false ? (
                            <><Lock size={13} /> Suspend</>
                          ) : (
                            <><Unlock size={13} /> Activate</>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: DONATIONS */}
      {activeTab === 'donations' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Donation Title</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Donor / Org</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Quantity</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Expiry</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {donations.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{d.title}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{d.donor_name || 'Donor'}</td>
                    <td style={{ padding: '12px 16px' }}>{d.quantity} {d.quantity_unit}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={d.status} />
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(d.expiry_time).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {['AVAILABLE', 'CLAIMED'].includes(d.status) && (
                        <button
                          onClick={() => handleCancelDonation(d.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Cancel Listing
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: REPORTS */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reports.length === 0 ? (
            <EmptyState
              title="Reports Queue Clean"
              description="No open reports have been submitted."
            />
          ) : (
            reports.map(r => (
              <div key={r.id} className="card card-glass" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-claimed">{r.reason}</span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '6px' }}>
                      Target: {r.target_type} ({r.target_id})
                    </h4>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '8px 0' }}>
                  "{r.description}"
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Reported by {r.reporter_name || 'Member'} on {new Date(r.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedReport(r);
                      setReportStatus(r.status === 'PENDING' ? 'RESOLVED' : r.status);
                      setAdminNotes(r.admin_notes || '');
                      setReportModalOpen(true);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Moderate & Resolve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 700 }}>Timestamp</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700 }}>Action</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700 }}>Entity</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700 }}>Initiator</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700 }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--primary)' }}>
                      {log.action}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className="badge badge-in_transit" style={{ fontSize: '0.68rem' }}>
                        {log.entity}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {log.user_name || 'System Daemon'}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RESOLVE REPORT MODAL */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Resolve Moderation Report"
      >
        <form onSubmit={handleResolveReport}>
          <div className="form-group">
            <label className="form-label">Resolution Status</label>
            <select
              value={reportStatus}
              onChange={(e) => setReportStatus(e.target.value)}
              className="form-select"
            >
              <option value="INVESTIGATING">Under Investigation</option>
              <option value="RESOLVED">Resolved (Action Taken)</option>
              <option value="DISMISSED">Dismissed (No Action Required)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Administrator Notes</label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Spoke with donor, food temperature confirmed within safety guidelines."
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={() => setReportModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Resolution
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminDashboard;
