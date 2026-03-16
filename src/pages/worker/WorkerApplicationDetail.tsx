import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsService, jobsService } from '../../api';
import { Card, CardContent, Badge, Button, Skeleton, Modal, getStatusBadgeVariant } from '../../components/ui';
import {
    ArrowLeft,
    Briefcase,
    MapPin,
    Banknote,
    Clock,
    User,
    FileText,
    Play,
    CheckCircle,
    AlertCircle,
    Mail,
    Phone,
    Home,
    Navigation
} from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '../../utils';
import toast from 'react-hot-toast';
import { ReviewModal } from '../../components/ReviewModal';

export const WorkerApplicationDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<'IN_PROGRESS' | 'COMPLETED' | null>(null);

    // Fetch application detail
    const { data, isLoading, error } = useQuery({
        queryKey: ['worker-application-detail', id],
        queryFn: () => applicationsService.getWorkerDetail(id!),
        enabled: !!id,
    });

    const application = data?.data;
    const job = application?.job;

    // Fetch private job details for ACCEPTED applications to get provider contact info
    const { data: privateJobData } = useQuery({
        queryKey: ['job-private', job?.id],
        queryFn: () => jobsService.getPrivateDetail(job!.id),
        enabled: !!job?.id && application?.status === 'ACCEPTED',
    });

    // Use private job data for contact info if available (for accepted applications)
    const providerContactInfo = privateJobData?.data?.provider;

    // Update job status mutation
    const statusMutation = useMutation({
        mutationFn: ({ jobId, status }: { jobId: number; status: 'IN_PROGRESS' | 'COMPLETED' }) =>
            jobsService.updateStatusWorker(jobId, status),
        onSuccess: (_, { status }) => {
            const messages = {
                IN_PROGRESS: 'Pekerjaan dimulai!',
                COMPLETED: 'Pekerjaan ditandai selesai! Menunggu persetujuan pemberi kerja.',
            };
            toast.success(messages[status]);
            queryClient.invalidateQueries({ queryKey: ['worker-application-detail', id] });
            queryClient.invalidateQueries({ queryKey: ['worker-applications'] });
            setIsStatusModalOpen(false);
        },
        onError: (error: any) => {
            const message = error.response?.data?.errors || 'Gagal mengubah status';
            toast.error(message);
        },
    });

    const handleStatusChange = (status: 'IN_PROGRESS' | 'COMPLETED') => {
        setPendingStatus(status);
        setIsStatusModalOpen(true);
    };

    const confirmStatusChange = () => {
        if (job && pendingStatus) {
            statusMutation.mutate({ jobId: job.id, status: pendingStatus });
        }
    };

    // Determine if status update is allowed
    const canUpdateStatus = () => {
        if (!application || !job) return { canStart: false, canComplete: false };

        // Only ACCEPTED applications can update job status
        if (application.status !== 'ACCEPTED') return { canStart: false, canComplete: false };

        // Status progression: ASSIGNED -> IN_PROGRESS -> COMPLETED
        // After COMPLETED, locked until REJECTED by employer. If APPROVED, locked permanently.
        // When REJECTED, worker can restart: REJECTED -> IN_PROGRESS -> COMPLETED
        const canStart = job.status === 'ASSIGNED' || job.status === 'REJECTED';
        const canComplete = job.status === 'IN_PROGRESS';

        return { canStart, canComplete };
    };

    const { canStart, canComplete } = canUpdateStatus();
    const isLocked = job?.status === 'COMPLETED' || job?.status === 'APPROVED';

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-secondary-900 mb-2">Lamaran Tidak Ditemukan</h2>
                <p className="text-secondary-600 mb-6">Lamaran yang Anda cari tidak ditemukan atau tidak tersedia.</p>
                <Link to="/worker/applications">
                    <Button leftIcon={ArrowLeft}>Kembali ke Daftar Lamaran</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Back Button */}
            <Link
                to="/worker/applications"
                className="inline-flex items-center gap-2 text-secondary-600 hover:text-primary-600 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Daftar Lamaran
            </Link>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Detail Lamaran</h1>
                    <p className="text-secondary-600">ID Lamaran: #{application.id}</p>
                </div>
                <Badge variant={getStatusBadgeVariant(application.status)} className="text-sm px-4 py-2">
                    {application.status}
                </Badge>
            </div>

            {/* Job Information Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-secondary-900">Informasi Pekerjaan</h2>
                            <p className="text-secondary-500 text-sm">Detail pekerjaan yang dilamar</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xl font-semibold text-secondary-900">{job?.title}</h3>
                            <Link
                                to={`/worker/users/${job?.provider.id}`}
                                className="inline-flex items-center gap-2 text-secondary-600 mt-1 hover:text-primary-600 transition-colors"
                            >
                                <User className="w-4 h-4" />
                                <span>{job?.provider.full_name}</span>
                                <span className="text-xs text-primary-500">Klik untuk lihat profil</span>
                            </Link>

                            {/* Provider Contact Info - Only shown for ACCEPTED applications */}
                            {application?.status === 'ACCEPTED' && providerContactInfo && (
                                <div className="mt-2 flex flex-wrap gap-3 text-sm">
                                    {providerContactInfo.email && (
                                        <a
                                            href={`mailto:${providerContactInfo.email}`}
                                            className="flex items-center gap-1.5 text-secondary-600 hover:text-primary-600 transition-colors"
                                        >
                                            <Mail className="w-4 h-4" />
                                            {providerContactInfo.email}
                                        </a>
                                    )}
                                    {providerContactInfo.phone_number && (
                                        <a
                                            href={`tel:${providerContactInfo.phone_number}`}
                                            className="flex items-center gap-1.5 text-secondary-600 hover:text-primary-600 transition-colors"
                                        >
                                            <Phone className="w-4 h-4" />
                                            {providerContactInfo.phone_number}
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        <p className="text-secondary-700">{job?.description}</p>

                        <div className="flex flex-wrap gap-4 text-sm">
                            <span className="flex items-center gap-1.5 text-secondary-600">
                                <MapPin className="w-4 h-4" />
                                {job?.location_label || job?.location}
                            </span>
                            <span className="flex items-center gap-1.5 text-success-600 font-medium">
                                <Banknote className="w-4 h-4" />
                                {formatCurrency(job?.compensation_amount || 0)}
                            </span>
                            <span className="flex items-center gap-1.5 text-secondary-600">
                                <Clock className="w-4 h-4" />
                                Dilamar {formatRelativeTime(application.created_at)}
                            </span>
                            {application?.distance != null && (
                                <span className="flex items-center gap-1.5 text-info-600">
                                    <Navigation className="w-4 h-4" />
                                    {application.distance.toFixed(2)} km dari Anda
                                </span>
                            )}
                        </div>

                        {/* Address Detail - Only shown for ACCEPTED applications */}
                        {application?.status === 'ACCEPTED' && job?.address_detail && (
                            <div className="p-3 bg-secondary-50 rounded-xl border border-secondary-200">
                                <div className="flex items-start gap-2">
                                    <Home className="w-5 h-5 text-secondary-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium text-secondary-500 mb-1">Alamat Lengkap</p>
                                        <p className="text-sm text-secondary-700">{job.address_detail}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-secondary-500">Status Pekerjaan:</span>
                            <Badge variant={getStatusBadgeVariant(job?.status || '')}>{job?.status}</Badge>
                        </div>

                        {/* Payment Method - Cash Only */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-secondary-500">Metode Pembayaran:</span>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-50 border border-secondary-200">
                                <Banknote className="w-3.5 h-3.5 text-secondary-600" />
                                <span className="text-xs font-medium text-secondary-700">💵 Cash</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Cover Letter Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-100 to-secondary-200 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-secondary-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-secondary-900">Surat Lamaran</h2>
                            <p className="text-secondary-500 text-sm">Pesan yang Anda kirim ke pemberi kerja</p>
                        </div>
                    </div>

                    <div className="p-4 bg-secondary-50 rounded-xl">
                        <p className="text-secondary-700 whitespace-pre-wrap">{application.cover_letter}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Action Card - Only show for accepted applications */}
            {application.status === 'ACCEPTED' && (
                <Card className={job?.status === 'COMPLETED' ? 'border-warning-200' : job?.status === 'APPROVED' ? 'border-success-200' : ''}>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${job?.status === 'APPROVED'
                                ? 'bg-gradient-to-br from-success-100 to-success-200'
                                : job?.status === 'COMPLETED'
                                    ? 'bg-gradient-to-br from-warning-100 to-warning-200'
                                    : 'bg-gradient-to-br from-primary-100 to-primary-200'
                                }`}>
                                {job?.status === 'APPROVED' ? (
                                    <CheckCircle className="w-6 h-6 text-success-600" />
                                ) : job?.status === 'COMPLETED' ? (
                                    <Clock className="w-6 h-6 text-warning-600" />
                                ) : (
                                    <Play className="w-6 h-6 text-primary-600" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-secondary-900">
                                    {job?.status === 'APPROVED'
                                        ? 'Pekerjaan Selesai'
                                        : job?.status === 'COMPLETED'
                                            ? 'Menunggu Review'
                                            : 'Kelola Pekerjaan'}
                                </h2>
                                <p className="text-secondary-500 text-sm">
                                    {job?.status === 'APPROVED'
                                        ? 'Hasil pekerjaan telah disetujui'
                                        : job?.status === 'COMPLETED'
                                            ? 'Pemberi kerja sedang mereview hasil kerja'
                                            : 'Perbarui status pekerjaan Anda'}
                                </p>
                            </div>
                        </div>

                        {isLocked ? (
                            job?.status === 'APPROVED' ? (
                                <div className="p-4 rounded-xl bg-success-50 border border-success-200">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-6 h-6 text-success-600" />
                                        <div>
                                            <p className="font-semibold text-success-700">
                                                🎉 Selamat! Pekerjaan Anda telah disetujui!
                                            </p>
                                            <p className="text-sm text-success-600 mt-1">
                                                Pembayaran sebesar {formatCurrency(job?.compensation_amount || 0)} telah ditransfer ke dompet Anda. Terima kasih atas kerja keras Anda!
                                            </p>
                                            <div className="mt-3">
                                                <Button size="sm" onClick={() => setIsReviewModalOpen(true)}>Berikan Review</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-warning-50 border border-warning-200">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-warning-600" />
                                        <div>
                                            <p className="font-medium text-warning-700">
                                                Menunggu persetujuan dari pemberi kerja
                                            </p>
                                            <p className="text-sm text-warning-600 mt-1">
                                                Pemberi kerja sedang mereview hasil pekerjaan Anda. Status akan terbuka kembali jika hasil kerja perlu diperbaiki.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {canStart && (
                                    <Button
                                        onClick={() => handleStatusChange('IN_PROGRESS')}
                                        leftIcon={Play}
                                        className="bg-primary-600 hover:bg-primary-700"
                                    >
                                        Mulai Kerjakan
                                    </Button>
                                )}
                                {canComplete && (
                                    <Button
                                        onClick={() => handleStatusChange('COMPLETED')}
                                        leftIcon={CheckCircle}
                                        className="bg-success-600 hover:bg-success-700"
                                    >
                                        Tandai Selesai
                                    </Button>
                                )}
                                {!canStart && !canComplete && !isLocked && (
                                    <p className="text-secondary-500">
                                        Tidak ada aksi yang tersedia untuk status saat ini.
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Status Timeline */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-secondary-900 mb-4">Timeline</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 text-primary-600" />
                            </div>
                            <div>
                                <p className="font-medium text-secondary-900">Lamaran Dikirim</p>
                                <p className="text-sm text-secondary-500">{formatRelativeTime(application.created_at)}</p>
                            </div>
                        </div>
                        {application.status !== 'PENDING' && application.status !== 'UNDER_REVIEW' && (
                            <div className="flex items-start gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${application.status === 'ACCEPTED' ? 'bg-success-100' :
                                    application.status === 'REJECTED' ? 'bg-danger-100' : 'bg-secondary-100'
                                    }`}>
                                    <CheckCircle className={`w-4 h-4 ${application.status === 'ACCEPTED' ? 'text-success-600' :
                                        application.status === 'REJECTED' ? 'text-danger-600' : 'text-secondary-600'
                                        }`} />
                                </div>
                                <div>
                                    <p className="font-medium text-secondary-900">
                                        Lamaran {application.status === 'ACCEPTED' ? 'Diterima' :
                                            application.status === 'REJECTED' ? 'Ditolak' :
                                                application.status === 'CANCELLED' ? 'Dibatalkan' : application.status}
                                    </p>
                                    <p className="text-sm text-secondary-500">{formatRelativeTime(application.updated_at)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Status Change Confirmation Modal */}
            <Modal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                title={pendingStatus === 'IN_PROGRESS' ? 'Mulai Pekerjaan' : 'Selesaikan Pekerjaan'}
            >
                <p className="text-secondary-600 mb-6">
                    {pendingStatus === 'IN_PROGRESS' && (
                        <>
                            Apakah Anda yakin ingin memulai mengerjakan <strong>{job?.title}</strong>?
                        </>
                    )}
                    {pendingStatus === 'COMPLETED' && (
                        <>
                            Apakah Anda yakin pekerjaan <strong>{job?.title}</strong> sudah selesai?
                            Pemberi kerja akan mereview hasil pekerjaan Anda.
                        </>
                    )}
                </p>
                <div className="flex gap-3 justify-end">
                    <Button variant="secondary" onClick={() => setIsStatusModalOpen(false)}>
                        Batal
                    </Button>
                    <Button onClick={confirmStatusChange} isLoading={statusMutation.isPending}>
                        {pendingStatus === 'IN_PROGRESS' ? 'Mulai Kerjakan' : 'Tandai Selesai'}
                    </Button>
                </div>
            </Modal>

            {job?.provider && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    jobId={job.id}
                />
            )}
        </div>
    );
};
