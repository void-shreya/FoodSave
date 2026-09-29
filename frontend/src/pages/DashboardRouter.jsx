import React from 'react';
import { useAuth } from '../hooks/useAuth';
import DonorDashboard from './DonorDashboard';
import VolunteerDashboard from './VolunteerDashboard';
import NgoDashboard from './NgoDashboard';
import AdminDashboard from './AdminDashboard';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'volunteer':
      return <VolunteerDashboard />;
    case 'ngo':
      return <NgoDashboard />;
    case 'donor':
    default:
      return <DonorDashboard />;
  }
};

export default DashboardRouter;
