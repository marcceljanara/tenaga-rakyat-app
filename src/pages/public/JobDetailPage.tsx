import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { jobsService, applicationsService } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, Button, Badge, Skeleton, Textarea, Modal, Avatar, getStatusBadgeVariant } from '../../components/ui';
import { MapPin, Banknote, Clock, ArrowLeft, Briefcase, Send, CheckCircle, Navigation, Lock, Users } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '../../utils';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../api/axios';

const applySchema = z.object({
    cover_letter: z.string().min(10, 'Cover letter minimal 10 karakter'),
});

type ApplyFormData = z.infer<typeof applySchema>;

export const JobDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated, hasRole } = useAuth();
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [isApplied, setIsApplied] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['job', id],
        queryFn: () => jobsService.getPublicDetail(id!),
        enabled: !!id,
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ApplyFormData>({
        resolver: zodResolver(applySchema),
    });

    const job = data?.data;
    const canApply = isAuthenticated && hasRole(['PEKERJA']) && job?.status === 'OPEN';

    const onSubmitApplication = async (data: ApplyFormData) => {
        if (!id) return;

        try {
            await applicationsService.apply(id, { cover_letter: data.cover_letter });
            toast.success('Lamaran berhasil dikirim!');
            setIsApplied(true);
            setIsApplyModalOpen(false);
            reset();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Gagal mengirim lamaran.';
            toast.error(message);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[80vh] bg-secondary-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Skeleton className="h-8 w-48 mb-8" />
                    <Card>
                        <CardContent className="p-8">
                            <div className="flex gap-6">
                                <Skeleton className="w-20 h-20 rounded-xl" />
                                <div className="flex-1">
                                    <Skeleton className="h-8 w-3/4 mb-4" />
                                    <Skeleton className="h-5 w-1/2 mb-6" />
                                    <div className="flex gap-4 mb-6">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-5 w-32" />
                                    </div>
                                    <Skeleton className="h-40 w-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-[80vh] bg-secondary-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-secondary-900 mb-2">Lowongan Tidak Ditemukan</h2>
                    <p className="text-secondary-600 mb-6">Lowongan yang Anda cari tidak tersedia.</p>
                    <Link to="/jobs">
                        <Button>Kembali ke Daftar Lowongan</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] bg-secondary-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <Link
                    to="/jobs"
                    className="inline-flex items-center gap-2 text-secondary-600 hover:text-primary-600 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Daftar Lowongan
                </Link>

                {/* Main Card */}
                <Card>
                    <CardContent className="p-8">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row gap-6 mb-8">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                                {API_BASE_URL + job.provider.profile_picture_url ? (
                                    <Avatar src={API_BASE_URL + job.provider.profile_picture_url} size="xl" />
                                ) : (
                                    <Briefcase className="w-10 h-10 text-primary-600" />
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                    <div>
                                        <h1 className="text-2xl font-bold text-secondary-900 mb-1">{job.title}</h1>
                                        <p className="text-lg text-secondary-600">{job.provider.full_name}</p>
                                    </div>
                                    <Badge variant={getStatusBadgeVariant(job.status)} className="text-sm px-3 py-1">
                                        {job.status}
                                    </Badge>
                                </div>

                                <div className="flex flex-wrap gap-4 text-secondary-600 mb-4">
                                    <span className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-primary-500" />
                                        {job.location_label || job.location}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Banknote className="w-5 h-5 text-success-500" />
                                        {formatCurrency(job.compensation_amount)}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-secondary-400" />
                                        Diposting {formatRelativeTime(job.posted_at ?? '')}
                                    </span>
                                    {job.distance != null && (
                                        <span className="flex items-center gap-2">
                                            <Navigation className="w-5 h-5 text-info-500" />
                                            {job.distance.toFixed(2)} km dari Anda
                                        </span>
                                    )}
                                    {job._count?.jobApplications != null && (
                                        <span className="flex items-center gap-2">
                                            <Users className="w-5 h-5 text-secondary-400" />
                                            {job._count.jobApplications} Pelamar
                                        </span>
                                    )}
                                </div>

                                {/* Payment Method - Cash Only */}
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-50 border border-secondary-200">
                                    <Banknote className="w-4 h-4 text-secondary-600" />
                                    <span className="text-sm font-medium text-secondary-700">💵 Cash - Pembayaran Langsung</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-secondary-900 mb-3">Deskripsi Pekerjaan</h2>
                            <div className="prose prose-secondary max-w-none">
                                <p className="text-secondary-600 whitespace-pre-wrap">{job.description}</p>
                            </div>
                        </div>

                        {/* Login prompt for full details */}
                        {!isAuthenticated && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-200">
                                <div className="flex items-start gap-3">
                                    <Lock className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-secondary-900 mb-1">Ingin melihat alamat lengkap?</p>
                                        <p className="text-sm text-secondary-600 mb-3">
                                            Login untuk melihat alamat lengkap lokasi pekerjaan dan informasi kontak pemberi kerja.
                                        </p>
                                        <div className="flex gap-2">
                                            <Link to="/login">
                                                <Button size="sm">Masuk</Button>
                                            </Link>
                                            <Link to="/register">
                                                <Button size="sm" variant="secondary">Daftar</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-secondary-100">
                            {!isAuthenticated ? (
                                <div className="flex-1">
                                    <p className="text-secondary-600 mb-3">
                                        Silakan login untuk melamar pekerjaan ini.
                                    </p>
                                    <div className="flex gap-3">
                                        <Link to="/login">
                                            <Button>Masuk</Button>
                                        </Link>
                                        <Link to="/register">
                                            <Button variant="secondary">Daftar</Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : isApplied ? (
                                <div className="flex items-center gap-3 text-success-600">
                                    <CheckCircle className="w-6 h-6" />
                                    <span className="font-medium">Lamaran Anda telah terkirim!</span>
                                </div>
                            ) : canApply ? (
                                <Button onClick={() => setIsApplyModalOpen(true)} leftIcon={Send} size="lg">
                                    Lamar Sekarang
                                </Button>
                            ) : job.status !== 'OPEN' ? (
                                <p className="text-secondary-600">
                                    Lowongan ini tidak lagi menerima lamaran.
                                </p>
                            ) : hasRole(['PEMBERI_KERJA']) ? (
                                <p className="text-secondary-600">
                                    Anda login sebagai pemberi kerja. Hanya pekerja yang dapat melamar.
                                </p>
                            ) : null}
                        </div>
                    </CardContent>
                </Card>

                {/* Employer Info Card */}
                <Card className="mt-6">
                    <CardContent className="p-6">
                        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Tentang Pemberi Kerja</h2>
                        {isAuthenticated && hasRole(['PEKERJA']) ? (
                            <Link
                                to={`/worker/users/${job.provider.id}`}
                                className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer"
                            >
                                <Avatar src={API_BASE_URL + job.provider.profile_picture_url} size="lg" />
                                <div>
                                    <p className="font-medium text-secondary-900 hover:text-primary-600 transition-colors">{job.provider.full_name}</p>
                                    <p className="text-sm text-secondary-500">Pemberi Kerja</p>
                                    <p className="text-xs text-primary-500 mt-0.5">Klik untuk lihat profil</p>
                                </div>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Avatar src={API_BASE_URL + job.provider.profile_picture_url} size="lg" />
                                <div>
                                    <p className="font-medium text-secondary-900">{job.provider.full_name}</p>
                                    <p className="text-sm text-secondary-500">Pemberi Kerja</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Apply Modal */}
            <Modal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                title="Lamar Pekerjaan"
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmitApplication)}>
                    <div className="mb-6">
                        <p className="text-secondary-600 mb-4">
                            Tulis surat lamaran singkat untuk posisi <strong>{job.title}</strong>
                        </p>
                        <Textarea
                            {...register('cover_letter')}
                            label="Surat Lamaran"
                            placeholder="Ceritakan mengapa Anda tertarik dengan pekerjaan ini dan pengalaman relevan yang Anda miliki..."
                            rows={6}
                            error={errors.cover_letter?.message}
                        />
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button type="button" variant="secondary" onClick={() => setIsApplyModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" isLoading={isSubmitting} leftIcon={Send}>
                            Kirim Lamaran
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
