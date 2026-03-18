import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../../api';
import { Button, Input, Select } from '../../components/ui';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import logoTenagaRakyat from '../../assets/logo_tenaga_rakyat.png';

const registerSchema = z.object({
    full_name: z.string().min(3, 'Nama minimal 3 karakter'),
    email: z.string().email('Email tidak valid'),
    phone_number: z.string().min(10, 'Nomor telepon minimal 10 digit').max(15, 'Nomor telepon maksimal 15 digit'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string(),
    role_id: z.string().min(1, 'Pilih jenis akun'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role_id: '',
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await authService.register({
                full_name: data.full_name,
                email: data.email,
                phone_number: data.phone_number,
                password: data.password,
                role_id: parseInt(data.role_id) as 1 | 2,
            });
            toast.success('Registrasi berhasil! Silakan cek email untuk verifikasi.');
            navigate('/login');
        } catch (error: any) {
            const message = error.response?.data?.errors || 'Registrasi gagal. Silakan coba lagi.';
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Image/Decoration */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent-500 to-accent-700 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-center text-white">
                        <h2 className="text-4xl font-bold mb-4">Bergabung Bersama Kami</h2>
                        <p className="text-lg text-accent-100 max-w-md">
                            Daftarkan diri Anda dan mulai temukan peluang kerja atau pekerja terbaik.
                        </p>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-10 right-10 w-32 h-32 border-2 border-white/20 rounded-full" />
                <div className="absolute bottom-20 left-20 w-48 h-48 border-2 border-white/20 rounded-full" />
                <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </div>

            {/* Right Side - Form */}
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
                    <div className="flex items-center mb-8">
                        <img src={logoTenagaRakyat} alt="TenagaRakyat" className="h-24 w-auto object-contain" />
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Buat Akun Baru</h1>
                        <p className="text-secondary-600">
                            Isi data diri Anda untuk mendaftar
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 w-5 h-5 text-secondary-400" />
                            <Input
                                {...register('full_name')}
                                placeholder="Nama Lengkap"
                                className="pl-12"
                                error={errors.full_name?.message}
                            />
                        </div>

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

                        <div className="relative">
                            <Phone className="absolute left-4 top-3.5 w-5 h-5 text-secondary-400" />
                            <Input
                                {...register('phone_number')}
                                placeholder="Nomor Telepon"
                                className="pl-12"
                                error={errors.phone_number?.message}
                            />
                        </div>

                        <Select
                            {...register('role_id')}
                            placeholder="Pilih Jenis Akun"
                            options={[
                                { value: '1', label: 'Pekerja - Mencari pekerjaan' },
                                { value: '2', label: 'Pemberi Kerja - Mencari pekerja' },
                            ]}
                            error={errors.role_id?.message}
                        />

                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-secondary-400" />
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
                                className="absolute right-4 top-3.5 text-secondary-400 hover:text-secondary-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-secondary-400" />
                            <Input
                                {...register('confirmPassword')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Konfirmasi Password"
                                className="pl-12"
                                error={errors.confirmPassword?.message}
                            />
                        </div>

                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                required
                                className="w-4 h-4 mt-0.5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-secondary-600">
                                Saya menyetujui{' '}
                                <a href="#" className="text-primary-600 hover:text-primary-700">
                                    Ketentuan Layanan
                                </a>{' '}
                                dan{' '}
                                <a href="#" className="text-primary-600 hover:text-primary-700">
                                    Kebijakan Privasi
                                </a>
                            </span>
                        </div>

                        <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                            Daftar
                        </Button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-8 text-center text-secondary-600">
                        Sudah punya akun?{' '}
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                            Masuk
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
