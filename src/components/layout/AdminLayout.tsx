import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui';
import { clsx } from '../../utils/clsx';
import {
    Menu,
    X,
    LayoutDashboard,
    Users,
    // CreditCard, // DISABLED: Wallet/Escrow features - Cash only mode
    Shield,
    // Wallet, // DISABLED: Wallet/Escrow features - Cash only mode
    LogOut,
    ChevronDown,
    Settings,
    Coins,
} from 'lucide-react';
import { API_BASE_URL } from '../../api/axios';
import logoTenagaRakyat from '../../assets/logo_tenaga_rakyat.png';

export const AdminLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { user, logout, hasRole } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isSuperAdmin = hasRole(['SUPER_ADMIN']);

    const adminNavItems = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/users', label: 'Pengguna', icon: Users },
        // DISABLED: Wallet/Escrow features - Cash only mode
        // { href: '/admin/withdrawals', label: 'Penarikan', icon: CreditCard },
        { href: '/admin/credits', label: 'Paket Kredit', icon: Coins },
        ...(isSuperAdmin
            ? [
                { href: '/admin/admins', label: 'Manajemen Admin', icon: Shield },
                // DISABLED: Wallet/Escrow features - Cash only mode
                // { href: '/admin/wallets', label: 'Inisialisasi Wallet', icon: Wallet },
            ]
            : []),
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-secondary-50">
            {/* Mobile Header */}
            <header className="lg:hidden bg-white border-b border-secondary-100 sticky top-0 z-40">
                <div className="flex items-center justify-between px-4 h-16">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-100"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <Link to="/" className="flex items-center gap-2">
                        <img src={logoTenagaRakyat} alt="TenagaRakyat" className="h-10 w-auto object-contain" />
                        <span className="text-lg font-bold text-secondary-900">Admin Panel</span>
                    </Link>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-1 rounded-full hover:ring-2 hover:ring-primary-300 transition-all"
                    >
                        <Avatar src={API_BASE_URL + user?.profile_picture_url} size="sm" />
                    </button>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-secondary-900/50 z-50"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    'fixed top-0 left-0 h-full w-64 bg-secondary-900 text-white z-50 transform transition-transform duration-300',
                    'lg:translate-x-0',
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between px-4 h-16 border-b border-secondary-800">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={logoTenagaRakyat} alt="TenagaRakyat" className="h-10 w-auto object-contain" />
                        <span className="text-lg font-bold">Admin Panel</span>
                    </Link>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg text-secondary-400 hover:bg-secondary-800"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* User Info */}
                <div className="px-4 py-4 border-b border-secondary-800">
                    <div className="flex items-center gap-3">
                        <Avatar src={API_BASE_URL + user?.profile_picture_url} size="lg" />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{user?.full_name}</p>
                            <p className="text-sm text-secondary-400">
                                {isSuperAdmin ? 'Super Admin' : 'Admin'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {adminNavItems.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setIsSidebarOpen(false)}
                            className={clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                                location.pathname === item.href
                                    ? 'bg-primary-600 text-white'
                                    : 'text-secondary-300 hover:bg-secondary-800 hover:text-white'
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Settings & Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-800 space-y-1">
                    <Link
                        to="/admin/profile"
                        onClick={() => setIsSidebarOpen(false)}
                        className={clsx(
                            'lg:hidden flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                            location.pathname === '/admin/profile'
                                ? 'bg-primary-600 text-white'
                                : 'text-secondary-300 hover:bg-secondary-800 hover:text-white'
                        )}
                    >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Pengaturan</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="lg:hidden w-full flex items-center gap-3 px-4 py-3 rounded-xl text-secondary-300 hover:bg-secondary-800 hover:text-white transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Keluar</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Desktop Header */}
                <header className="hidden lg:flex items-center justify-between px-8 h-16 bg-white border-b border-secondary-100 sticky top-0 z-30">
                    <h1 className="text-xl font-semibold text-secondary-900">
                        {adminNavItems.find((item) => item.href === location.pathname)?.label || 'Dashboard'}
                    </h1>

                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 p-2 rounded-xl hover:bg-secondary-100 transition-colors"
                        >
                            <Avatar src={API_BASE_URL + user?.profile_picture_url} size="sm" />
                            <span className="text-sm font-medium text-secondary-700">{user?.full_name}</span>
                            <ChevronDown className="w-4 h-4 text-secondary-400" />
                        </button>

                        {isDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-soft-lg border border-secondary-100 py-2 z-20 animate-scale-in">
                                    <Link
                                        to="/admin/profile"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Pengaturan
                                    </Link>
                                    <hr className="my-2 border-secondary-100" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Keluar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
