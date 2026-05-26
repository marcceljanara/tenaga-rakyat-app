import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoute';
import { PublicLayout, WorkerLayout, EmployerLayout, AdminLayout } from './components/layout';

// Public Pages
import { LandingPage, JobsListPage, JobDetailPage } from './pages/public';

// Auth Pages
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
  VerifyEmailRequiredPage,
} from './pages/auth';

// Worker Pages
import {
  WorkerDashboard,
  WorkerProfile,
  WorkerApplications,
  WorkerApplicationDetail,
  // DISABLED: Wallet/Escrow features - Cash only mode
  // WorkerWallet,
  // WorkerWithdraw,
  // WorkerWithdrawMethods,
  // WorkerWithdrawals,
  // WorkerWithdrawalDetail,
  WorkerActiveJobs,
  WorkerPhotos,
} from './pages/worker';

// Employer Pages
import {
  EmployerDashboard,
  EmployerJobs,
  EmployerJobDetail,
  CreateJob,
  // DISABLED: Wallet/Escrow features - Cash only mode
  // EmployerWallet,
  // EmployerTopUp,
  EmployerProfile,
  EmployerCredits,
} from './pages/employer';

// Admin Pages
// DISABLED: AdminWithdrawals, AdminWithdrawDetail - Wallet/Escrow features disabled (Cash only mode)
import { AdminDashboard, AdminUsers, AdminUserDetail, /* AdminWithdrawals, AdminWithdrawDetail, */ AdminManagement, AdminPostingCredits } from './pages/admin';

// Shared Pages
import { UserProfilePage, NotFoundPage } from './pages/shared';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  // Bug #8 fix: Deteksi status koneksi jaringan dan tampilkan notifikasi yang informatif
  useEffect(() => {
    const handleOffline = () => {
      toast.error('Koneksi internet terputus. Beberapa fitur mungkin tidak berfungsi.', {
        id: 'network-offline',
        duration: Infinity,
        icon: '📡',
      });
    };

    const handleOnline = () => {
      toast.dismiss('network-offline');
      toast.success('Koneksi internet kembali!', { duration: 3000, icon: '✅' });
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes with Layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/jobs" element={<JobsListPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />
            </Route>

            {/* Auth Routes (no layout) */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/verify-email-required" element={<VerifyEmailRequiredPage />} />

            {/* Worker Routes */}
            <Route
              path="/worker"
              element={
                <ProtectedRoute allowedRoles={['PEKERJA']}>
                  <WorkerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<WorkerDashboard />} />
              <Route path="profile" element={<WorkerProfile />} />
              <Route path="jobs" element={<JobsListPage />} />
              <Route path="jobs/:id" element={<JobDetailPage />} />
              <Route path="active-jobs" element={<WorkerActiveJobs />} />
              <Route path="applications" element={<WorkerApplications />} />
              <Route path="applications/:id" element={<WorkerApplicationDetail />} />
              {/* DISABLED: Wallet/Escrow features - Cash only mode
              <Route path="wallet" element={<WorkerWallet />} />
              <Route path="wallet/withdraw" element={<WorkerWithdraw />} />
              <Route path="wallet/methods" element={<WorkerWithdrawMethods />} />
              <Route path="wallet/withdrawals" element={<WorkerWithdrawals />} />
              <Route path="wallet/withdrawals/:id" element={<WorkerWithdrawalDetail />} />
              */}
              <Route path="photos" element={<WorkerPhotos />} />
              <Route path="users/:userId" element={<UserProfilePage />} />
            </Route>

            {/* Employer Routes */}
            <Route
              path="/employer"
              element={
                <ProtectedRoute allowedRoles={['PEMBERI_KERJA']}>
                  <EmployerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<EmployerDashboard />} />
              <Route path="profile" element={<EmployerProfile />} />
              <Route path="jobs" element={<EmployerJobs />} />
              <Route path="jobs/new" element={<CreateJob />} />
              <Route path="jobs/:id" element={<EmployerJobDetail />} />
              <Route path="credits" element={<EmployerCredits />} />
              {/* DISABLED: Wallet/Escrow features - Cash only mode
              <Route path="wallet" element={<EmployerWallet />} />
              <Route path="wallet/topup" element={<EmployerTopUp />} />
              */}
              <Route path="users/:userId" element={<UserProfilePage />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/:userId" element={<AdminUserDetail />} />
              {/* DISABLED: Wallet/Escrow features - Cash only mode
              <Route path="withdrawals" element={<AdminWithdrawals />} />
              <Route path="withdrawals/:withdrawId" element={<AdminWithdrawDetail />} />
              */}
              <Route path="admins" element={<AdminManagement />} />
              <Route path="credits" element={<AdminPostingCredits />} />
            </Route>

            {/* 404 - Catch all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#0f172a',
              boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
