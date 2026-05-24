import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { isAuthenticated, isLoading, user, hasRole } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-secondary-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                    <p className="text-secondary-600">Memuat...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Debug: Log user data to see what fields are available
    console.log('🔵 [ProtectedRoute] verification_status:', user?.verification_status);
    console.log('🔵 [ProtectedRoute] User role:', user?.role);

    // Check if user's email is verified
    // verification_status can be: UNVERIFIED, EMAIL_VERIFIED, FULL_VERIFIED
    const isEmailVerified =
        user?.verification_status === 'EMAIL_VERIFIED' ||
        user?.verification_status === 'FULL_VERIFIED';

    if (user && !isEmailVerified) {
        console.log('❌ [ProtectedRoute] Email not verified, redirecting to verification page...');
        console.log('🔵 [ProtectedRoute] verification_status:', user?.verification_status);
        return <Navigate to="/verify-email-required" state={{ from: location }} replace />;
    }

    // Check role-based access
    if (allowedRoles && !hasRole(allowedRoles)) {
        // Redirect to appropriate dashboard based on role
        const redirectPath = getRedirectPath(user?.role);
        return <Navigate to={redirectPath} replace />;
    }

    return <>{children}</>;
};

export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-secondary-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                    <p className="text-secondary-600">Memuat...</p>
                </div>
            </div>
        );
    }

    // If user is authenticated and trying to access login/register, redirect to dashboard
    if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
        const redirectPath = getRedirectPath(user?.role);
        return <Navigate to={redirectPath} replace />;
    }

    return <>{children}</>;
};

function getRedirectPath(role?: string): string {
    switch (role) {
        case 'PEKERJA':
            return '/worker/dashboard';
        case 'PEMBERI_KERJA':
            return '/employer/dashboard';
        case 'ADMIN':
        case 'SUPER_ADMIN':
            return '/admin/dashboard';
        default:
            return '/';
    }
}
