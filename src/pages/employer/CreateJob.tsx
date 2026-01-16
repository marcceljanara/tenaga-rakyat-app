import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { jobsService } from '../../api';
import { Card, CardContent, Button, Input, Textarea } from '../../components/ui';
import { Briefcase, MapPin, Banknote, ArrowLeft, Save, Shield, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';


const jobSchema = z.object({
    title: z.string().min(5, 'Judul minimal 5 karakter'),
    description: z.string().min(20, 'Deskripsi minimal 20 karakter'),
    location: z.string().min(3, 'Lokasi minimal 3 karakter'),
    compensation_amount: z.number().min(10000, 'Kompensasi minimal Rp 10.000'),
    payment_method: z.enum(['ESCROW_SYSTEM', 'CASH_OFFLINE']),
});

type JobFormData = z.infer<typeof jobSchema>;

export const CreateJob: React.FC = () => {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<JobFormData>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            compensation_amount: 50000,
            payment_method: 'ESCROW_SYSTEM',
        },
    });

    const selectedPaymentMethod = watch('payment_method');

    const createMutation = useMutation({
        mutationFn: (data: JobFormData) => jobsService.create(data),
        onSuccess: (response) => {
            toast.success('Lowongan berhasil dibuat!');
            navigate(`/employer/jobs/${response.data.id}`);
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.response?.data?.errors || 'Gagal membuat lowongan';
            toast.error(message);
        },
    });

    const onSubmit = (data: JobFormData) => {
        createMutation.mutate(data);
    };

    return (
        <div className="max-w-2xl animate-fade-in">
            <Link
                to="/employer/jobs"
                className="inline-flex items-center gap-2 text-secondary-600 hover:text-primary-600 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Daftar Lowongan
            </Link>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-secondary-900">Buat Lowongan Baru</h1>
                <p className="text-secondary-600">Isi detail pekerjaan yang ingin Anda tawarkan</p>
            </div>

            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <Input
                            {...register('title')}
                            label="Judul Pekerjaan"
                            placeholder="Contoh: Ngarit Rumput 1 Karung"
                            leftIcon={Briefcase}
                            error={errors.title?.message}
                        />

                        <Textarea
                            {...register('description')}
                            label="Deskripsi Pekerjaan"
                            placeholder="Jelaskan detail pekerjaan, persyaratan, dan informasi lainnya..."
                            rows={5}
                            error={errors.description?.message}
                        />

                        <Input
                            {...register('location')}
                            label="Lokasi"
                            placeholder="Contoh: Pekalongan, Lampung Timur"
                            leftIcon={MapPin}
                            error={errors.location?.message}
                        />

                        <div>
                            <Input
                                {...register('compensation_amount', { valueAsNumber: true })}
                                type="number"
                                label="Kompensasi (Rp)"
                                placeholder="50000"
                                leftIcon={Banknote}
                                error={errors.compensation_amount?.message}
                            />
                            <p className="text-sm text-secondary-500 mt-1">
                                Jumlah yang akan dibayarkan kepada pekerja
                            </p>
                        </div>

                        {/* Payment Method Selection */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-secondary-700">
                                Metode Pembayaran
                            </label>
                            <div className="space-y-3">
                                {/* Escrow Option */}
                                <label
                                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPaymentMethod === 'ESCROW_SYSTEM'
                                        ? 'border-success-500 bg-success-50'
                                        : 'border-secondary-200 hover:border-secondary-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        value="ESCROW_SYSTEM"
                                        {...register('payment_method')}
                                        className="mt-1 w-4 h-4 text-success-600 focus:ring-success-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-success-600" />
                                            <span className="font-semibold text-secondary-900">
                                                🛡️ Escrow - Aman & Dijamin
                                            </span>
                                        </div>
                                        <ul className="mt-2 text-sm text-secondary-600 space-y-1">
                                            <li>✅ Dana diamankan sistem</li>
                                            <li>✅ Perlindungan dispute</li>
                                            <li>✅ Rating & Reputasi publik</li>
                                            <li>✅ Pembayaran otomatis setelah selesai</li>
                                        </ul>
                                    </div>
                                </label>

                                {/* Cash Option */}
                                <label
                                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPaymentMethod === 'CASH_OFFLINE'
                                        ? 'border-warning-500 bg-warning-50'
                                        : 'border-secondary-200 hover:border-secondary-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        value="CASH_OFFLINE"
                                        {...register('payment_method')}
                                        className="mt-1 w-4 h-4 text-warning-600 focus:ring-warning-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-warning-600" />
                                            <span className="font-semibold text-secondary-900">
                                                ⚠️ Cash - Tanpa Perlindungan
                                            </span>
                                        </div>
                                        <ul className="mt-2 text-sm text-secondary-600 space-y-1">
                                            <li>❌ Tanpa escrow (dana tidak diamankan)</li>
                                            <li>❌ Tanpa proteksi & dispute</li>
                                            <li>❌ Tanpa rating resmi</li>
                                            <li>❌ Tanpa reputasi publik</li>
                                        </ul>
                                        <p className="mt-2 text-xs text-warning-700 font-medium">
                                            Pembayaran dilakukan langsung di luar sistem.
                                        </p>
                                    </div>
                                </label>
                            </div>
                            {errors.payment_method && (
                                <p className="text-sm text-danger-600">{errors.payment_method.message}</p>
                            )}
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/employer/jobs')}
                                className="flex-1"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                leftIcon={Save}
                                isLoading={isSubmitting || createMutation.isPending}
                            >
                                Buat Lowongan
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
