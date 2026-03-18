import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../../components/ui';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import logoTenagaRakyat from '../../assets/logo_tenaga_rakyat.png';

const loginSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(1, 'Password wajib diisi'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        console.log('🔵 [LoginPage] onSubmit called with:', { email: data.email, passwordLength: data.password.length });
        try {
            console.log('🔵 [LoginPage] Calling login()...');
            await login(data);
            console.log('✅ [LoginPage] login() successful!');
            toast.success('Login berhasil!');
            navigate(from, { replace: true });
        } catch (error: any) {
            console.error('❌ [LoginPage] login() failed:', error);
            console.error('❌ [LoginPage] Error response:', error.response);
            console.error('❌ [LoginPage] Error response data:', error.response?.data);
            const message = error.response?.data?.errors || 'Login gagal. Silakan coba lagi.';
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 py-12">
                <div className="max-w-md w-full mx-auto">
                    {/* Back Link */}
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-secondary-600 hover:text-primary-600 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Beranda
                    </Link>

                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-8">
                        <img src={logoTenagaRakyat} alt="TenagaRakyat" className="h-24 w-auto object-contain" />
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Selamat Datang Kembali</h1>
                        <p className="text-secondary-600">
                            Masuk ke akun Anda untuk melanjutkan
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                            <Input
                                {...register('email')}
                                type="email"
                                placeholder="Email"
                                className="pl-12"
                                error={errors.email?.message}
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                            <Input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                className="pl-12 pr-12"
                                error={errors.password?.message}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm text-secondary-600">Ingat saya</span>
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Lupa password?
                            </Link>
                        </div>

                        <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                            Masuk
                        </Button>
                    </form>

                    {/* Sign Up Link */}
                    <p className="mt-8 text-center text-secondary-600">
                        Belum punya akun?{' '}
                        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                            Daftar sekarang
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Image/Decoration */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 to-primary-700 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-center text-white">
                        <h2 className="text-4xl font-bold mb-4">Temukan Peluang Baru</h2>
                        <p className="text-lg text-primary-100 max-w-md">
                            Ribuan pekerjaan menanti Anda. Mulai perjalanan karir Anda bersama TenagaRakyat.
                        </p>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/20 rounded-full" />
                <div className="absolute bottom-20 right-20 w-48 h-48 border-2 border-white/20 rounded-full" />
                <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </div>
        </div>
    );
};
