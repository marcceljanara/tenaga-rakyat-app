import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, jobsService } from '../../api';
import { Card, CardContent, Badge, Button, Skeleton, EmptyState, Modal, getStatusBadgeVariant } from '../../components/ui';
import { Briefcase, MapPin, Banknote, Clock, Play, CheckCircle, User } from 'lucide-react';
import { formatCurrency, formatRelativeTime, handleApiError } from '../../utils';
import toast from 'react-hot-toast';
import type { WorkerApplication, WorkerApplicationJob } from '../../types';

export const WorkerActiveJobs: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedJob, setSelectedJob] = useState<WorkerApplicationJob | null>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<'IN_PROGRESS' | 'COMPLETED' | null>(null);

    // Fetch worker's accepted applications (active jobs)
    const { data, isLoading } = useQuery({
        queryKey: ['worker-applications'],
        queryFn: () => usersService.getApplications({ status: 'ACCEPTED' as any }),
        refetchInterval: 5000,
    });

    const applications = data?.data.applications || [];

    // Filter to get active jobs (applications that were accepted)
    const activeJobs = applications.filter(
        (app: WorkerApplication) =>
            app.status === 'ACCEPTED' &&
            ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(app.job.status)
    );

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
            queryClient.invalidateQueries({ queryKey: ['worker-applications'] });
            setIsStatusModalOpen(false);
        },
        onError: (error: any) => {
            handleApiError(error, 'Gagal mengubah status');
        },
    });

    const handleStatusChange = (job: WorkerApplicationJob, status: 'IN_PROGRESS' | 'COMPLETED') => {
        setSelectedJob(job);
        setPendingStatus(status);
        setIsStatusModalOpen(true);
    };

    const confirmStatusChange = () => {
        if (selectedJob && pendingStatus) {
            statusMutation.mutate({ jobId: selectedJob.id, status: pendingStatus });
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Pekerjaan Aktif</h1>
                    <p className="text-secondary-600">Kelola pekerjaan yang sedang Anda kerjakan</p>
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-secondary-900">Pekerjaan Aktif</h1>
                <p className="text-secondary-600">Kelola pekerjaan yang sedang Anda kerjakan</p>
            </div>

            {activeJobs.length === 0 ? (
                <EmptyState
                    icon={Briefcase}
                    title="Tidak Ada Pekerjaan Aktif"
                    description="Anda belum memiliki pekerjaan yang sedang dikerjakan. Lamar pekerjaan baru untuk memulai!"
                />
            ) : (
                <div className="space-y-4">
                    {activeJobs.map((app: WorkerApplication) => {
                        const job = app.job;
                        const canStart = job.status === 'ASSIGNED';
                        const canComplete = job.status === 'IN_PROGRESS';

                        return (
                            <Card key={app.id}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                                            <Briefcase className="w-8 h-8 text-primary-600" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-secondary-900">
                                                        {job.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-secondary-600">
                                                        <User className="w-4 h-4" />
                                                        <span>{job.provider.full_name}</span>
                                                    </div>
                                                </div>
                                                <Badge variant={getStatusBadgeVariant(job.status)}>
                                                    {job.status}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm text-secondary-500 mb-4">
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4" />
                                                    {job.location_label || job.location}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Banknote className="w-4 h-4" />
                                                    {formatCurrency(job.compensation_amount)}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4" />
                                                    Diterima {formatRelativeTime(app.updated_at)}
                                                </span>
                                                {/* Payment Method - Cash Only */}
                                                <span className="flex items-center gap-1 text-secondary-500">
                                                    <Banknote className="w-4 h-4" />
                                                    <span className="text-xs font-medium">Cash</span>
                                                </span>
                                            </div>

                                            <p className="text-secondary-600 text-sm line-clamp-2 mb-4">
                                                {job.description}
                                            </p>

                                            <div className="flex gap-3">
                                                {canStart && (
                                                    <Button
                                                        onClick={() => handleStatusChange(job, 'IN_PROGRESS')}
                                                        leftIcon={Play}
                                                    >
                                                        Mulai Kerjakan
                                                    </Button>
                                                )}
                                                {canComplete && (
                                                    <Button
                                                        onClick={() => handleStatusChange(job, 'COMPLETED')}
                                                        leftIcon={CheckCircle}
                                                    >
                                                        Tandai Selesai
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Status Change Confirmation Modal */}
            <Modal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                title={pendingStatus === 'IN_PROGRESS' ? 'Mulai Pekerjaan' : 'Selesaikan Pekerjaan'}
            >
                <p className="text-secondary-600 mb-6">
                    {pendingStatus === 'IN_PROGRESS' && (
                        <>
                            Apakah Anda yakin ingin memulai mengerjakan <strong>{selectedJob?.title}</strong>?
                        </>
                    )}
                    {pendingStatus === 'COMPLETED' && (
                        <>
                            Apakah Anda yakin pekerjaan <strong>{selectedJob?.title}</strong> sudah selesai?
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
        </div>
    );
};
