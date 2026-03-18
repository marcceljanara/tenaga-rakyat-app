import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, Button } from '../ui';
import {
    Menu,
    X,
    Briefcase,
    ChevronDown,
    LogOut,
    User,
    Home,
} from 'lucide-react';
import { clsx } from '../../utils/clsx';
import { API_BASE_URL } from '../../api/axios';
import logoTenagaRakyat from '../../assets/logo_tenaga_rakyat.png';

export const PublicNavbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navLinks = [
        { href: '/', label: 'Beranda', icon: Home },
        { href: '/jobs', label: 'Lowongan', icon: Briefcase },
    ];

    const getDashboardLink = () => {
        if (!user) return '/';
        switch (user.role) {
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
    };

    return (
        <nav className="bg-white/80 backdrop-blur-lg border-b border-secondary-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <img src={logoTenagaRakyat} alt="TenagaRakyat" className="h-12 w-auto object-contain" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={clsx(
                                    'flex items-center gap-2 text-sm font-medium transition-colors',
                                    location.pathname === link.href
                                        ? 'text-primary-600'
                                        : 'text-secondary-600 hover:text-primary-600'
                                )}
                            >
                                <link.icon className="w-4 h-4" />
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-secondary-100 transition-colors"
                                >
                                    <Avatar src={API_BASE_URL + user?.profile_picture_url} size="sm" />
                                    <span className="text-sm font-medium text-secondary-700 max-w-[150px] truncate">
                                        {user?.full_name}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-secondary-400" />
                                </button>

                                {isDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsDropdownOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-soft-lg border border-secondary-100 py-2 z-20 animate-scale-in">
                                            <Link
                                                to={getDashboardLink()}
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                                            >
                                                <User className="w-4 h-4" />
                                                Dashboard
                                            </Link>
                                            <hr className="my-2 border-secondary-100" />
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Keluar
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">
                                        Masuk
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm">Daftar</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg text-secondary-600 hover:bg-secondary-100"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-secondary-100 animate-slide-in-left">
                    <div className="px-4 py-4 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                onClick={() => setIsOpen(false)}
                                className={clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                                    location.pathname === link.href
                                        ? 'bg-primary-50 text-primary-600'
                                        : 'text-secondary-600 hover:bg-secondary-50'
                                )}
                            >
                                <link.icon className="w-5 h-5" />
                                {link.label}
                            </Link>
                        ))}

                        <hr className="border-secondary-100" />

                        {isAuthenticated ? (
                            <>
                                <Link
                                    to={getDashboardLink()}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-secondary-600 hover:bg-secondary-50 transition-colors"
                                >
                                    <User className="w-5 h-5" />
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger-600 hover:bg-danger-50 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Keluar
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-3 pt-2">
                                <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                                    <Button variant="secondary" className="w-full">
                                        Masuk
                                    </Button>
                                </Link>
                                <Link to="/register" className="flex-1" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full">Daftar</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};
