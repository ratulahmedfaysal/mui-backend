import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import AdminLayout from './components/Dashboard/AdminLayout';
import Home from './pages/Home';
import Plans from './pages/Plans';
import ReferralProgram from './pages/ReferralProgram';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import FAQs from './pages/FAQs';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/user/Dashboard';
import UserPlans from './pages/user/UserPlans';
import PlansHistory from './pages/user/PlansHistory';
import ActivePlans from './pages/user/ActivePlans';
import Deposit from './pages/user/Deposit';
import DepositHistory from './pages/user/DepositHistory';
import Withdraw from './pages/user/Withdraw';
import WithdrawHistory from './pages/user/WithdrawHistory';
import Refer from './pages/user/Refer';
import ReferredUsers from './pages/user/ReferredUsers';
import Transactions from './pages/user/Transactions';
import Settings from './pages/user/Settings';
import Claim from './pages/user/Claim';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPlans from './pages/admin/AdminPlans';
import AdminReferrals from './pages/admin/AdminReferrals';
import AdminPaymentMethods from './pages/admin/AdminPaymentMethods';
import AdminDeposits from './pages/admin/AdminDeposits';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminSettings from './pages/admin/AdminSettings';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';
import AdminContent from './pages/admin/AdminContent';
import AdminDatabase from './pages/admin/AdminDatabase';
import AdminInvestments from './pages/admin/AdminInvestments';

import LoadingSpinner from './components/Common/LoadingSpinner';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Admin Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.is_admin) {
    return <Navigate to="/user/dashboard" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    const redirectPath = isAdmin ? "/admin/dashboard" : "/user/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

// ... imports


const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SiteSettingsProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="plans" element={<Plans />} />
                <Route path="referral-program" element={<ReferralProgram />} />
                <Route path="about" element={<About />} />
                <Route path="how-it-works" element={<HowItWorks />} />
                <Route path="contact" element={<Contact />} />
                <Route path="faqs" element={<FAQs />} />
                <Route path="terms" element={<Terms />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                <Route path="register" element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } />
              </Route>



              {/* User Dashboard Routes */}
              <Route
                path="/user"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="plans" element={<UserPlans />} />
                <Route path="plans/history" element={<PlansHistory />} />
                <Route path="active-plans" element={<ActivePlans />} />
                <Route path="deposit" element={<Deposit />} />
                <Route path="deposit/history" element={<DepositHistory />} />
                <Route path="withdraw" element={<Withdraw />} />
                <Route path="withdraw/history" element={<WithdrawHistory />} />
                <Route path="refer" element={<Refer />} />
                <Route path="refer/users" element={<ReferredUsers />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="settings" element={<Settings />} />
                <Route path="claim" element={<Claim />} />
              </Route>

              {/* Admin Dashboard Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="investments" element={<AdminInvestments />} />
                <Route path="plans" element={<AdminPlans />} />
                <Route path="referrals" element={<AdminReferrals />} />
                <Route path="payment-methods" element={<AdminPaymentMethods />} />
                <Route path="deposits" element={<AdminDeposits />} />
                <Route path="withdrawals" element={<AdminWithdrawals />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="content" element={<AdminContent />} />
                <Route path="database" element={<AdminDatabase />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </SiteSettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;