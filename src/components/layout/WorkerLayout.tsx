import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui';
import { clsx } from '../../utils/clsx';
import {
    Menu,
    X,
    Briefcase,
    LayoutDashboard,
    // User,
    Image,
    Search,
    FileText,
    // Wallet,
    LogOut,
    ChevronDown,
    Settings,
} from 'lucide-react';
import { API_BASE_URL } from '../../api/axios';

const workerNavItems = [
    { href: '/worker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    // { href: '/worker/profile', label: 'Profil', icon: User },
    { href: '/worker/photos', label: 'Foto Pekerjaan', icon: Image },
    { href: '/worker/jobs', label: 'Cari Kerja', icon: Search },
    { href: '/worker/applications', label: 'Lamaran Saya', icon: FileText },
    // { href: '/worker/wallet', label: 'Dompet', icon: Wallet },
];

export const WorkerLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

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
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-secondary-900">TenagaRakyat</span>
                    </Link>
                    <Avatar src={API_BASE_URL + user?.profile_picture_url} size="sm" />
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
                    'fixed top-0 left-0 h-full w-64 bg-white border-r border-secondary-100 z-50 transform transition-transform duration-300',
                    'lg:translate-x-0',
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between px-4 h-16 border-b border-secondary-100">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-secondary-900">TenagaRakyat</span>
                    </Link>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg text-secondary-400 hover:bg-secondary-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* User Info */}
                <div className="px-4 py-4 border-b border-secondary-100">
                    <div className="flex items-center gap-3">
                        <Avatar src={API_BASE_URL + user?.profile_picture_url} size="lg" />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-secondary-900 truncate">{user?.full_name}</p>
                            <p className="text-sm text-secondary-500">Pekerja</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {workerNavItems.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setIsSidebarOpen(false)}
                            className={clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                                location.pathname === item.href
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'text-secondary-600 hover:bg-secondary-50'
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger-600 hover:bg-danger-50 transition-colors"
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
                        {workerNavItems.find((item) => item.href === location.pathname)?.label || 'Dashboard'}
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
                                        to="/worker/profile"
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
