import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../../components/ui';
import { Mail, ArrowLeft, CheckCircle, XCircle, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import logoTenagaRakyat from '../../assets/logo_tenaga_rakyat.png';

// Forgot Password Schema
const forgotPasswordSchema = z.object({
    email: z.string().email('Email tidak valid'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            await authService.forgotPassword(data.email);
            setIsSubmitted(true);
            toast.success('Email reset password telah dikirim!');
        } catch (error: any) {
            const message = error.response?.data?.errors || 'Gagal mengirim email. Silakan coba lagi.';
            toast.error(message);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-secondary-50">
                <div className="max-w-md w-full text-center">
                    <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-success-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-secondary-900 mb-2">Cek Email Anda</h1>
                    <p className="text-secondary-600 mb-8">
                        Kami telah mengirim link reset password ke email Anda. Silakan cek inbox atau folder spam.
                    </p>
                    <Link to="/login">
                        <Button variant="secondary">Kembali ke Login</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-secondary-50">
            <div className="max-w-md w-full">
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-secondary-600 hover:text-primary-600 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Login
                </Link>

                <div className="flex items-center mb-8">
                    <img src={logoTenagaRakyat} alt="TenagaRakyat" className="h-24 w-auto object-contain" />
                </div>

                <h1 className="text-3xl font-bold text-secondary-900 mb-2">Lupa Password</h1>
                <p className="text-secondary-600 mb-8">
                    Masukkan email Anda dan kami akan mengirim link untuk reset password.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-secondary-400" />
                        <Input
                            {...register('email')}
                            type="email"
                            placeholder="Email"
                            className="pl-12"
                            error={errors.email?.message}
                        />
                    </div>

                    <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                        Kirim Link Reset
                    </Button>
                </form>
            </div>
        </div>
    );
};

// Reset Password Schema
const resetPasswordSchema = z.object({
    newPassword: z.string().min(8, 'Password minimal 8 karakter'),
    confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Password tidak cocok',
    path: ['confirmNewPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const token = searchParams.get('token');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            toast.error('Token tidak valid');
            return;
        }

        try {
            await authService.resetPassword({
                token,
                newPassword: data.newPassword,
                confirmNewPassword: data.confirmNewPassword,
            });
            setIsSuccess(true);
            toast.success('Password berhasil direset!');
        } catch (error: any) {
            const message = error.response?.data?.errors || 'Gagal reset password.';
            toast.error(message);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-secondary-50">
                <div className="max-w-md w-full text-center">
                    <div className="w-16 h-16 rounded-full bg-danger-100 flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-8 h-8 text-danger-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-secondary-900 mb-2">Link Tidak Valid</h1>
                    <p className="text-secondary-600 mb-8">
                        Link reset password tidak valid atau sudah kedaluwarsa.
                    </p>
                    <Link to="/forgot-password">
                        <Button>Minta Link Baru</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-secondary-50">
                <div className="max-w-md w-full text-center">
                    <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-success-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-secondary-900 mb-2">Password Berhasil Direset</h1>
                    <p className="text-secondary-600 mb-8">
                        Password Anda telah berhasil diperbarui. Silakan login dengan password baru.
                    </p>
                    <Link to="/login">
                        <Button>Masuk</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-secondary-50">
            <div className="max-w-md w-full">
                <div className="flex items-center mb-8">
                    <img src={logoTenagaRakyat} alt="TenagaRakyat" className="h-24 w-auto object-contain" />
                </div>

                <h1 className="text-3xl font-bold text-secondary-900 mb-2">Reset Password</h1>
                <p className="text-secondary-600 mb-8">
                    Masukkan password baru Anda.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Password Field */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-secondary-700">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-secondary-400" />
                            <Input
                                {...register('newPassword')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Masukkan password baru"
                                className="pl-12 pr-12"
                                error={errors.newPassword?.message}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5 text-secondary-400 hover:text-secondary-600 transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-secondary-700">
                            Konfirmasi Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-secondary-400" />
                            <Input
                                {...register('confirmNewPassword')}
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Konfirmasi password baru"
                                className="pl-12 pr-12"
                                error={errors.confirmNewPassword?.message}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-3.5 text-secondary-400 hover:text-secondary-600 transition-colors"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                        Reset Password
                    </Button>
                </form>
            </div>
        </div>
    );
};

// Verify Email Page
export const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const token = searchParams.get('token');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus('error');
                return;
            }

            try {
                await authService.verifyEmail(token);
                setStatus('success');
            } catch {
                setStatus('error');
            }
        };

        verifyEmail();
    }, [token]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-secondary-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-secondary-600">Memverifikasi email...</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-secondary-50">
                <div className="max-w-md w-full text-center">
                    <div className="w-16 h-16 rounded-full bg-danger-100 flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-8 h-8 text-danger-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-secondary-900 mb-2">Verifikasi Gagal</h1>
                    <p className="text-secondary-600 mb-8">
                        Link verifikasi tidak valid atau sudah kedaluwarsa.
                    </p>
                    <Link to="/login">
                        <Button>Kembali ke Login</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-secondary-50">
            <div className="max-w-md w-full text-center">
                <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-success-600" />
                </div>
                <h1 className="text-2xl font-bold text-secondary-900 mb-2">Email Terverifikasi!</h1>
                <p className="text-secondary-600 mb-8">
                    Email Anda telah berhasil diverifikasi. Silakan login untuk melanjutkan.
                </p>
                <Link to="/login">
                    <Button>Masuk</Button>
                </Link>
            </div>
        </div>
    );
};

// Verify Email Required Page
export const VerifyEmailRequiredPage: React.FC = () => {
    const [isResending, setIsResending] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const navigate = useNavigate();

    // Get user info from auth context
    const { user, logout, isAuthenticated } = useAuth();

    // If not authenticated, redirect to login
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleResend = async () => {
        setIsResending(true);
        try {
            // Use REGISTER purpose for new user email verification
            await authService.resendVerification('REGISTER');
            setEmailSent(true);
            toast.success('Email verifikasi telah dikirim ulang!');
        } catch (error: any) {
            const message = error.response?.data?.errors || 'Gagal mengirim email.';
            toast.error(message);
        } finally {
            setIsResending(false);
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            navigate('/login', { replace: true });
        } catch {
            // Logout errors are handled in AuthContext
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary-50 via-white to-accent-50">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="flex items-center justify-center mb-8">
                    <img src={logoTenagaRakyat} alt="TenagaRakyat" className="h-24 w-auto object-contain" />
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-secondary-100 p-8 text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-warning-100 to-warning-200 flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-10 h-10 text-warning-600" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-secondary-900 mb-2">
                        Verifikasi Email Diperlukan
                    </h1>

                    {/* Description */}
                    <p className="text-secondary-600 mb-4">
                        Untuk melanjutkan, Anda perlu memverifikasi alamat email Anda terlebih dahulu.
                    </p>

                    {/* User Email Display */}
                    {user?.email && (
                        <div className="bg-secondary-50 rounded-xl px-4 py-3 mb-6">
                            <p className="text-sm text-secondary-500 mb-1">Email terdaftar:</p>
                            <p className="font-medium text-secondary-900">{user.email}</p>
                        </div>
                    )}

                    {/* Success message after resend */}
                    {emailSent && (
                        <div className="bg-success-50 border border-success-200 rounded-xl px-4 py-3 mb-6">
                            <div className="flex items-center gap-2 text-success-700">
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">
                                    Email verifikasi telah dikirim! Silakan cek inbox atau folder spam Anda.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-primary-50 rounded-xl px-4 py-3 mb-6 text-left">
                        <p className="text-sm text-primary-800 font-medium mb-2">Langkah-langkah:</p>
                        <ol className="text-sm text-primary-700 space-y-1 list-decimal list-inside">
                            <li>Buka inbox email Anda</li>
                            <li>Cari email dari TenagaRakyat</li>
                            <li>Klik link verifikasi di email</li>
                            <li>Kembali ke halaman ini dan refresh</li>
                        </ol>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button
                            onClick={handleResend}
                            isLoading={isResending}
                            className="w-full"
                            size="lg"
                            disabled={isResending}
                        >
                            {emailSent ? 'Kirim Ulang Email' : 'Kirim Email Verifikasi'}
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={handleLogout}
                            isLoading={isLoggingOut}
                            className="w-full"
                        >
                            Logout & Gunakan Email Lain
                        </Button>
                    </div>

                    {/* Help text */}
                    <p className="text-xs text-secondary-400 mt-6">
                        Tidak menerima email? Cek folder spam atau hubungi support kami.
                    </p>
                </div>
            </div>
        </div>
    );
};

