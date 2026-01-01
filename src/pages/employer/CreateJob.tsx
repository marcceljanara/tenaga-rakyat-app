import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { jobsService } from '../../api';
import { Card, CardContent, Button, Input, Textarea } from '../../components/ui';
import { Briefcase, MapPin, Banknote, ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const jobSchema = z.object({
    title: z.string().min(5, 'Judul minimal 5 karakter'),
    description: z.string().min(20, 'Deskripsi minimal 20 karakter'),
    location: z.string().min(3, 'Lokasi minimal 3 karakter'),
    compensation_amount: z.number().min(10000, 'Kompensasi minimal Rp 10.000'),
});

type JobFormData = z.infer<typeof jobSchema>;

export const CreateJob: React.FC = () => {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<JobFormData>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            compensation_amount: 50000,
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: JobFormData) => jobsService.create(data),
        onSuccess: (response) => {
            toast.success('Lowongan berhasil dibuat!');
            navigate(`/employer/jobs/${response.data.id}`);
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Gagal membuat lowongan';
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
