import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { jobsService } from '../../api';
import { Card, CardContent, Button, Input, Textarea, LocationPicker } from '../../components/ui';
import { Briefcase, MapPin, Banknote, ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { handleApiError } from '../../utils';


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

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<JobFormData>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            compensation_amount: 50000,
            payment_method: 'CASH_OFFLINE',
            job_latitude: 0,
            job_longitude: 0,
        },
    });

    const currentLat = watch('job_latitude');
    const currentLng = watch('job_longitude');

    const createMutation = useMutation({
        mutationFn: (data: JobFormData) => jobsService.create(data),
        onSuccess: (response) => {
            toast.success('Lowongan berhasil dibuat!');
            navigate(`/employer/jobs/${response.data.id}`);
        },
        onError: (error: any) => {
            handleApiError(error, 'Gagal membuat lowongan', setError);
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

                        {/* Location Picker Section */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-secondary-700">
                                Lokasi Pekerjaan
                            </label>
                            <LocationPicker
                                latitude={currentLat !== 0 ? currentLat : null}
                                longitude={currentLng !== 0 ? currentLng : null}
                                onLocationSelect={(lat, lng) => {
                                    setValue('job_latitude', lat, { shouldValidate: true });
                                    setValue('job_longitude', lng, { shouldValidate: true });
                                }}
                            />
                            {(errors.job_latitude || errors.job_longitude) && (
                                <p className="text-sm text-danger-600 flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    Lokasi wajib dipilih
                                </p>
                            )}
                            <p className="text-xs text-secondary-500">
                                Klik pada peta atau gunakan GPS perangkat untuk menentukan lokasi pekerjaan.
                            </p>
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
