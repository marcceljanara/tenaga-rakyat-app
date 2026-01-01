import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../../api';
import { Button, Input } from '../../components/ui';
import { Briefcase, Mail, ArrowLeft, CheckCircle, XCircle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

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
            const message = error.response?.data?.message || 'Gagal mengirim email. Silakan coba lagi.';
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

                <div className="flex items-center gap-2 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-secondary-900">TenagaRakyat</span>
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
            const message = error.response?.data?.message || 'Gagal reset password.';
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
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-secondary-900">TenagaRakyat</span>
                </div>

                <h1 className="text-3xl font-bold text-secondary-900 mb-2">Reset Password</h1>
                <p className="text-secondary-600 mb-8">
                    Masukkan password baru Anda.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-secondary-400" />
                        <Input
                            {...register('newPassword')}
                            type="password"
                            placeholder="Password Baru"
                            className="pl-12"
                            error={errors.newPassword?.message}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-secondary-400" />
                        <Input
                            {...register('confirmNewPassword')}
                            type="password"
                            placeholder="Konfirmasi Password Baru"
                            className="pl-12"
                            error={errors.confirmNewPassword?.message}
                        />
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

    const handleResend = async () => {
        setIsResending(true);
        try {
            await authService.resendVerification('REGISTRATION');
            toast.success('Email verifikasi telah dikirim ulang!');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Gagal mengirim email.';
            toast.error(message);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-secondary-50">
            <div className="max-w-md w-full text-center">
                <div className="w-16 h-16 rounded-full bg-warning-100 flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-warning-600" />
                </div>
                <h1 className="text-2xl font-bold text-secondary-900 mb-2">Verifikasi Email Diperlukan</h1>
                <p className="text-secondary-600 mb-8">
                    Anda perlu memverifikasi email terlebih dahulu untuk mengakses halaman ini.
                    Silakan cek inbox email Anda.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={handleResend} isLoading={isResending}>
                        Kirim Ulang Email
                    </Button>
                    <Link to="/login">
                        <Button variant="secondary">Kembali ke Login</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
