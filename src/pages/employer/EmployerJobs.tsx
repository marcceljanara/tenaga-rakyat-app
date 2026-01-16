import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobsService } from '../../api';
import { Card, CardContent, Badge, Button, Skeleton, EmptyState, getStatusBadgeVariant } from '../../components/ui';
import { Briefcase, MapPin, Banknote, Clock, PlusCircle, ChevronRight, Shield, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '../../utils';

export const EmployerJobs: React.FC = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['employer-jobs-history'],
        queryFn: () => jobsService.getProviderHistory(),
    });

    const jobs = data?.data.jobs || [];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Lowongan Saya</h1>
                    <p className="text-secondary-600">Kelola semua lowongan pekerjaan Anda</p>
                </div>
                <Link to="/employer/jobs/new">
                    <Button leftIcon={PlusCircle}>Buat Lowongan</Button>
                </Link>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="flex gap-4">
                                    <Skeleton className="w-14 h-14 rounded-xl" />
                                    <div className="flex-1">
                                        <Skeleton className="h-6 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-1/2 mb-4" />
                                        <div className="flex gap-4">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : jobs.length === 0 ? (
                <EmptyState
                    icon={Briefcase}
                    title="Belum Ada Lowongan"
                    description="Anda belum membuat lowongan kerja. Buat lowongan pertama Anda sekarang!"
                    action={
                        <Link to="/employer/jobs/new">
                            <Button leftIcon={PlusCircle}>Buat Lowongan</Button>
                        </Link>
                    }
                />
            ) : (
                <div className="space-y-4">
                    {jobs.map((job) => (
                        <Link key={job.id} to={`/employer/jobs/${job.id}`}>
                            <Card interactive className="p-6">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                                        <Briefcase className="w-7 h-7 text-primary-600" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h3 className="text-lg font-semibold text-secondary-900">{job.title}</h3>
                                            <Badge variant={getStatusBadgeVariant(job.status)}>{job.status}</Badge>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-secondary-500">
                                            <span className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4" />
                                                {job.location}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Banknote className="w-4 h-4" />
                                                {formatCurrency(job.compensation_amount)}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                {formatRelativeTime(job.posted_at ?? '')}
                                            </span>
                                            {/* Payment Method Indicator */}
                                            {job.payment_method === 'ESCROW_SYSTEM' ? (
                                                <span className="flex items-center gap-1 text-success-600">
                                                    <Shield className="w-4 h-4" />
                                                    <span className="text-xs font-medium">Escrow</span>
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-warning-600">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    <span className="text-xs font-medium">Cash</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="hidden sm:flex items-center">
                                        <ChevronRight className="w-5 h-5 text-secondary-400" />
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
