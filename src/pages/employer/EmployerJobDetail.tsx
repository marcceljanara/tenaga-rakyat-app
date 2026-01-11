import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsService, applicationsService } from '../../api';
import { Card, CardContent, Badge, Button, Skeleton, Avatar, Modal, getStatusBadgeVariant } from '../../components/ui';
import {
    MapPin, Banknote, Clock, ArrowLeft, Briefcase, Users,
    CheckCircle, XCircle, Award, Trash2
} from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '../../utils';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../api/axios';


export const EmployerJobDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<'CANCELLED' | 'APPROVED' | 'REJECTED' | null>(null);

    // Fetch job details
    const { data: jobData, isLoading: jobLoading, error: jobError } = useQuery({
        queryKey: ['job', id],
        queryFn: () => jobsService.getById(id!),
        enabled: !!id,
    });

    // Fetch applications for this job
    const { data: applicationsData, isLoading: appsLoading } = useQuery({
        queryKey: ['job-applications', id],
        queryFn: () => applicationsService.getJobApplications(id!),
        enabled: !!id,
    });

    const job = jobData?.data;
    const applications = applicationsData?.data?.applications || [];

    // Delete job mutation
    const deleteMutation = useMutation({
        mutationFn: () => jobsService.delete(id!),
        onSuccess: () => {
            toast.success('Lowongan berhasil dihapus');
            queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
            navigate('/employer/jobs');
        },
        onError: (error: any) => {
            const message = error.response?.data?.errors || 'Gagal menghapus lowongan';
            toast.error(message);
        },
    });

    // Update job status mutation
    const statusMutation = useMutation({
        mutationFn: (status: 'CANCELLED' | 'APPROVED' | 'REJECTED') =>
            jobsService.updateStatusEmployer(id!, status),
        onSuccess: (_, status) => {
            const messages = {
                CANCELLED: 'Lowongan berhasil dibatalkan',
                APPROVED: 'Pekerjaan berhasil disetujui! Pembayaran telah dirilis.',
                REJECTED: 'Pekerjaan ditolak. Worker dapat memperbaiki.',
            };
            toast.success(messages[status]);
            queryClient.invalidateQueries({ queryKey: ['job', id] });
            setIsStatusModalOpen(false);
        },
        onError: (error: any) => {
            const message = error.response?.data?.errors || 'Gagal mengubah status';
            toast.error(message);
        },
    });

    // Accept/Reject application mutation
    const applicationMutation = useMutation({
        mutationFn: ({ appId, status }: { appId: number; status: 'ACCEPTED' | 'REJECTED' }) =>
            applicationsService.updateStatus(appId, status),
        onSuccess: (_, { status }) => {
            toast.success(status === 'ACCEPTED' ? 'Pelamar berhasil diterima!' : 'Lamaran ditolak');
            queryClient.invalidateQueries({ queryKey: ['job', id] });
            queryClient.invalidateQueries({ queryKey: ['job-applications', id] });
        },
        onError: (error: any) => {
            const message = error.response?.data?.errors || 'Gagal memproses lamaran';
            toast.error(message);
        },
    });

    const handleStatusChange = (status: 'CANCELLED' | 'APPROVED' | 'REJECTED') => {
        setPendingStatus(status);
        setIsStatusModalOpen(true);
    };

    const confirmStatusChange = () => {
        if (pendingStatus) {
            statusMutation.mutate(pendingStatus);
        }
    };

    if (jobLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    if (jobError || !job) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-secondary-900 mb-2">Lowongan Tidak Ditemukan</h2>
                <p className="text-secondary-600 mb-6">Lowongan yang Anda cari tidak tersedia.</p>
                <Link to="/employer/jobs">
                    <Button>Kembali ke Daftar Lowongan</Button>
                </Link>
            </div>
        );
    }

    const canCancel = job.status === 'OPEN' && !job.worker;
    const canApprove = job.status === 'COMPLETED' && job.worker;
    const canDelete = job.status === 'OPEN' && !job.worker;

    return (
        <div className="space-y-6 animate-fade-in">
            <Link
                to="/employer/jobs"
                className="inline-flex items-center gap-2 text-secondary-600 hover:text-primary-600 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Daftar Lowongan
            </Link>

            {/* Job Header Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-10 h-10 text-primary-600" />
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-secondary-900 mb-1">{job.title}</h1>
                                    <Badge variant={getStatusBadgeVariant(job.status)} className="text-sm px-3 py-1">
                                        {job.status}
                                    </Badge>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {canCancel && (
                                        <Button
                                            variant="ghost"
                                            className="text-danger-600 hover:bg-danger-50"
                                            onClick={() => handleStatusChange('CANCELLED')}
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Batalkan
                                        </Button>
                                    )}
                                    {canDelete && (
                                        <Button
                                            variant="ghost"
                                            className="text-danger-600 hover:bg-danger-50"
                                            onClick={() => setIsDeleteModalOpen(true)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Hapus
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-6 text-secondary-600 mb-4">
                                <span className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary-500" />
                                    {job.location}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Banknote className="w-5 h-5 text-success-500" />
                                    {formatCurrency(job.compensation_amount)}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-secondary-400" />
                                    Diposting {formatRelativeTime(job.posted_at ?? '')}
                                </span>
                            </div>

                            <div className="prose prose-secondary max-w-none">
                                <p className="text-secondary-600 whitespace-pre-wrap">{job.description}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Assigned Worker Card */}
            {job.worker && (
                <Card>
                    <CardContent className="p-6">
                        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Pekerja Ditugaskan</h2>
                        <div className="flex items-center justify-between">
                            <Link
                                to={`/employer/users/${job.worker.id}`}
                                className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer"
                            >
                                <Avatar src={API_BASE_URL + job.worker.profile_picture_url} size="lg" />
                                <div>
                                    <p className="font-medium text-secondary-900 hover:text-primary-600 transition-colors">{job.worker.full_name}</p>
                                    <p className="text-sm text-secondary-500">Pekerja · Klik untuk lihat profil</p>
                                </div>
                            </Link>

                            {canApprove && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        className="text-danger-600 hover:bg-danger-50"
                                        onClick={() => handleStatusChange('REJECTED')}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Tolak
                                    </Button>
                                    <Button onClick={() => handleStatusChange('APPROVED')}>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Setujui & Bayar
                                    </Button>
                                </div>
                            )}

                            {job.status === 'APPROVED' && (
                                <Badge variant="success">
                                    <Award className="w-4 h-4 mr-1" />
                                    Selesai
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Applications List */}
            {job.status === 'OPEN' && (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-secondary-900">
                                <Users className="w-5 h-5 inline-block mr-2" />
                                Lamaran Masuk ({applications.length})
                            </h2>
                        </div>

                        {appsLoading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : applications.length === 0 ? (
                            <div className="text-center py-8 text-secondary-500">
                                <Users className="w-12 h-12 mx-auto mb-3 text-secondary-300" />
                                <p>Belum ada pelamar untuk lowongan ini</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {applications.map((app) => (
                                    <div
                                        key={app.id}
                                        className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-secondary-200 hover:border-primary-200 transition-colors"
                                    >
                                        <Link
                                            to={`/employer/users/${app.worker.id}`}
                                            className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer"
                                        >
                                            <Avatar src={API_BASE_URL + app.worker.profile_picture_url} size="lg" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-secondary-900 hover:text-primary-600 transition-colors">{app.worker.full_name}</p>
                                                <p className="text-sm text-secondary-500">{app.worker.email}</p>
                                                <p className="text-xs text-primary-500 mt-0.5">Klik untuk lihat profil</p>
                                            </div>
                                        </Link>
                                        {app.cover_letter && (
                                            <p className="text-sm text-secondary-600 mt-1 line-clamp-2 flex-1">
                                                "{app.cover_letter}"
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Badge variant={getStatusBadgeVariant(app.status)}>{app.status}</Badge>
                                            {app.status === 'PENDING' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-danger-600"
                                                        onClick={() =>
                                                            applicationMutation.mutate({
                                                                appId: app.id,
                                                                status: 'REJECTED',
                                                            })
                                                        }
                                                        isLoading={applicationMutation.isPending}
                                                    >
                                                        Tolak
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            applicationMutation.mutate({
                                                                appId: app.id,
                                                                status: 'ACCEPTED',
                                                            })
                                                        }
                                                        isLoading={applicationMutation.isPending}
                                                    >
                                                        Terima
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Hapus Lowongan"
            >
                <p className="text-secondary-600 mb-6">
                    Apakah Anda yakin ingin menghapus lowongan <strong>{job.title}</strong>? Tindakan ini tidak dapat
                    dibatalkan.
                </p>
                <div className="flex gap-3 justify-end">
                    <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                        Batal
                    </Button>
                    <Button
                        className="bg-danger-600 hover:bg-danger-700"
                        onClick={() => deleteMutation.mutate()}
                        isLoading={deleteMutation.isPending}
                    >
                        Hapus
                    </Button>
                </div>
            </Modal>

            {/* Status Change Confirmation Modal */}
            <Modal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                title={
                    pendingStatus === 'APPROVED'
                        ? 'Setujui Pekerjaan'
                        : pendingStatus === 'REJECTED'
                            ? 'Tolak Pekerjaan'
                            : 'Batalkan Lowongan'
                }
            >
                <p className="text-secondary-600 mb-6">
                    {pendingStatus === 'APPROVED' && (
                        <>
                            Apakah Anda yakin ingin menyetujui pekerjaan ini? Pembayaran sebesar{' '}
                            <strong>{formatCurrency(job.compensation_amount)}</strong> akan dirilis ke pekerja.
                        </>
                    )}
                    {pendingStatus === 'REJECTED' &&
                        'Apakah Anda yakin ingin menolak hasil pekerjaan ini? Pekerja dapat memperbaiki dan mengirimkan ulang.'}
                    {pendingStatus === 'CANCELLED' && 'Apakah Anda yakin ingin membatalkan lowongan ini?'}
                </p>
                <div className="flex gap-3 justify-end">
                    <Button variant="secondary" onClick={() => setIsStatusModalOpen(false)}>
                        Batal
                    </Button>
                    <Button
                        className={pendingStatus === 'APPROVED' ? '' : 'bg-danger-600 hover:bg-danger-700'}
                        onClick={confirmStatusChange}
                        isLoading={statusMutation.isPending}
                    >
                        {pendingStatus === 'APPROVED' ? 'Setujui & Bayar' : 'Konfirmasi'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
