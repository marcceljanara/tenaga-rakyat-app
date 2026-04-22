import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobsService } from '../../api';
import { Card, CardContent, Badge, Button, Skeleton, EmptyState, getStatusBadgeVariant } from '../../components/ui';
import { Briefcase, MapPin, Banknote, Clock, PlusCircle, ChevronRight } from 'lucide-react';
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
                <div className="space-y-3">
                    {jobs.map((job) => (
                        <Link key={job.id} to={`/employer/jobs/${job.id}`}>
                            <Card interactive>
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                                            <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Title + Badge */}
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <h3 className="text-base sm:text-lg font-semibold text-secondary-900 leading-snug">{job.title}</h3>
                                                <Badge variant={getStatusBadgeVariant(job.status)} className="flex-shrink-0 text-xs">{job.status}</Badge>
                                            </div>

                                            {/* Meta info */}
                                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs sm:text-sm text-secondary-500">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                                    <span className="truncate max-w-[140px] sm:max-w-none">{job.location_label || job.location}</span>
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Banknote className="w-3.5 h-3.5 flex-shrink-0" />
                                                    {formatCurrency(job.compensation_amount)} · Cash
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                                    {formatRelativeTime(job.posted_at ?? '')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Chevron */}
                                        <ChevronRight className="w-5 h-5 text-secondary-300 flex-shrink-0 mt-1" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
