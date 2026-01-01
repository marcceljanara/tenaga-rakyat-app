import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { usersService } from '../api/users.service';
import { authService } from '../api/auth.service';
import type { User, LoginCredentials } from '../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isInitialized = useRef(false);

    const refreshUser = useCallback(async () => {
        try {
            const response = await usersService.getProfile();
            setUser(response.data);
        } catch {
            setUser(null);
        }
    }, []);

    const login = useCallback(async (credentials: LoginCredentials) => {
        console.log('🔵 [AuthContext] login() called');
        console.log('🔵 [AuthContext] Calling authService.login()...');
        await authService.login(credentials);
        console.log('✅ [AuthContext] authService.login() successful');

        // After successful login, fetch the user profile
        console.log('🔵 [AuthContext] Calling usersService.getProfile()...');
        const response = await usersService.getProfile();
        console.log('✅ [AuthContext] getProfile() response:', response);
        console.log('✅ [AuthContext] User data:', response.data);
        setUser(response.data);
    }, []);

    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch {
            // Ignore logout errors
        } finally {
            setUser(null);
        }
    }, []);

    const hasRole = useCallback(
        (roles: string[]) => {
            if (!user) return false;
            console.log(user.role);
            return roles.includes(user.role);
        },
        [user]
    );

    // Check auth state on mount - only once
    useEffect(() => {
        if (isInitialized.current) return;
        isInitialized.current = true;

        const checkAuth = async () => {
            try {
                const response = await usersService.getProfile();
                setUser(response.data);
            } catch {
                // User is not authenticated - this is fine for public routes
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Listen for logout events from axios interceptor
    useEffect(() => {
        const handleLogout = () => {
            setUser(null);
            setIsLoading(false); // Ensure loading is set to false on logout
        };
        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                refreshUser,
                hasRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
