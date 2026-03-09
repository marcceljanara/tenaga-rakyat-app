import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { jobsService } from '../../api';
import { Card, CardContent, Button, Input, Textarea } from '../../components/ui';
import { Briefcase, MapPin, Banknote, ArrowLeft, Save, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';


const jobSchema = z.object({
    title: z.string().min(5, 'Judul minimal 5 karakter'),
    description: z.string().min(20, 'Deskripsi minimal 20 karakter'),
    location_label: z.string().min(3, 'Label lokasi minimal 3 karakter'),
    address_detail: z.string().min(10, 'Alamat lengkap minimal 10 karakter'),
    compensation_amount: z.number().min(10000, 'Kompensasi minimal Rp 10.000'),
    payment_method: z.literal('CASH_OFFLINE'), // DISABLED: Escrow - Cash only mode
    job_latitude: z.number().min(-90).max(90),
    job_longitude: z.number().min(-180).max(180),
});

type JobFormData = z.infer<typeof jobSchema>;

export const CreateJob: React.FC = () => {
    const navigate = useNavigate();
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<JobFormData>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            compensation_amount: 50000,
            payment_method: 'CASH_OFFLINE', // DISABLED: Escrow - Cash only mode
            job_latitude: 0,
            job_longitude: 0,
        },
    });

    // DISABLED: Escrow - Cash only mode
    // const selectedPaymentMethod = watch('payment_method');
    const currentLat = watch('job_latitude');
    const currentLng = watch('job_longitude');

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

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation tidak didukung oleh browser Anda');
            return;
        }

        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setValue('job_latitude', position.coords.latitude);
                setValue('job_longitude', position.coords.longitude);
                toast.success('Lokasi berhasil didapatkan!');
                setIsGettingLocation(false);
            },
            (error) => {
                let message = 'Gagal mendapatkan lokasi';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Akses lokasi ditolak. Silakan izinkan akses lokasi.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Informasi lokasi tidak tersedia.';
                        break;
                    case error.TIMEOUT:
                        message = 'Waktu permintaan lokasi habis.';
                        break;
                }
                toast.error(message);
                setIsGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
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
                            {...register('location_label')}
                            label="Label Lokasi"
                            placeholder="Contoh: Pekalongan, Lampung Timur"
                            leftIcon={MapPin}
                            error={errors.location_label?.message}
                        />

                        <Textarea
                            {...register('address_detail')}
                            label="Alamat Lengkap"
                            placeholder="Contoh: Jalan Kenangan, RT 01/RW 012, Desa Suka Makmur, Kecamatan Asik-Asik"
                            rows={3}
                            error={errors.address_detail?.message}
                        />

                        {/* Location Coordinates Section */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-secondary-700">
                                Koordinat Lokasi Pekerjaan
                            </label>
                            <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-200">
                                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                    <div className="flex-1">
                                        <Input
                                            {...register('job_latitude', { valueAsNumber: true })}
                                            type="number"
                                            step="any"
                                            label="Latitude"
                                            placeholder="-6.180084"
                                            error={errors.job_latitude?.message}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            {...register('job_longitude', { valueAsNumber: true })}
                                            type="number"
                                            step="any"
                                            label="Longitude"
                                            placeholder="106.78973"
                                            error={errors.job_longitude?.message}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={getCurrentLocation}
                                        isLoading={isGettingLocation}
                                        leftIcon={Navigation}
                                    >
                                        Gunakan Lokasi Saat Ini
                                    </Button>
                                    {currentLat !== 0 && currentLng !== 0 && (
                                        <span className="text-xs text-success-600 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            Koordinat terisi
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-secondary-500 mt-2">
                                    Koordinat digunakan untuk menghitung jarak dengan pekerja terdekat
                                </p>
                            </div>
                        </div>

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

                        {/* Payment Method - Cash Only (Escrow disabled) */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-secondary-700">
                                Metode Pembayaran
                            </label>
                            <input type="hidden" {...register('payment_method')} value="CASH_OFFLINE" />
                            <div className="p-4 rounded-xl border-2 border-secondary-200 bg-secondary-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <Banknote className="w-5 h-5 text-primary-600" />
                                    <span className="font-semibold text-secondary-900">
                                        💵 Cash - Pembayaran Langsung
                                    </span>
                                </div>
                                <p className="text-sm text-secondary-600">
                                    Pembayaran dilakukan secara langsung antara pemberi kerja dan pekerja di luar sistem.
                                </p>
                            </div>
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
