import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute, RoleGuard } from './components/ProtectedRoute';
import AiAssistantWidget from './components/AiAssistantWidget';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardRouter from './pages/DashboardRouter';
import DonationDiscoveryPage from './pages/DonationDiscoveryPage';
import DonationDetailPage from './pages/DonationDetailPage';
import CreateDonationPage from './pages/CreateDonationPage';
import MyDonationsPage from './pages/MyDonationsPage';
import PickupsPage from './pages/PickupsPage';
import DeliveriesPage from './pages/DeliveriesPage';
import BeneficiariesPage from './pages/BeneficiariesPage';
import ImpactPage from './pages/ImpactPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import NgoDirectoryPage from './pages/NgoDirectoryPage';
import NgoDetailPage from './pages/NgoDetailPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/donations" element={<DonationDiscoveryPage />} />
            <Route path="/donations/:id" element={<DonationDetailPage />} />
            <Route path="/impact" element={<ImpactPage />} />
            <Route path="/ngo" element={<NgoDirectoryPage />} />
            <Route path="/ngo/:id" element={<NgoDetailPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />

            <Route
              path="/donations/create"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['donor', 'admin']}>
                    <CreateDonationPage />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-donations"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['donor', 'admin']}>
                    <MyDonationsPage />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="/pickups"
              element={
                <ProtectedRoute>
                  <PickupsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/deliveries"
              element={
                <ProtectedRoute>
                  <DeliveriesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/ngo/beneficiaries"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ngo', 'admin']}>
                    <BeneficiariesPage />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Exclusive Suite */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <AiAssistantWidget />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
