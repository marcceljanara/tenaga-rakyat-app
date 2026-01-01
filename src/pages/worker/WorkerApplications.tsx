import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersService } from '../../api';
import { Card, CardContent, Badge, Skeleton, EmptyState, getStatusBadgeVariant } from '../../components/ui';
import { FileText, MapPin, Banknote, Clock, ChevronRight, Briefcase } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '../../utils';

export const WorkerApplications: React.FC = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['worker-applications'],
        queryFn: () => usersService.getApplications(),
    });

    const applications = data?.data.applications || [];

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-secondary-900">Lamaran Saya</h1>
                <p className="text-secondary-600">Pantau status lamaran pekerjaan Anda</p>
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
            ) : applications.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="Belum Ada Lamaran"
                    description="Anda belum mengirim lamaran kerja. Cari pekerjaan dan mulai melamar!"
                    action={
                        <Link to="/worker/jobs">
                            <button className="btn-primary">Cari Pekerjaan</button>
                        </Link>
                    }
                />
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => (
                        <Link key={app.id} to={`/worker/applications/${app.id}`}>
                            <Card interactive className="p-6">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                                        <Briefcase className="w-7 h-7 text-primary-600" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div>
                                                <h3 className="text-lg font-semibold text-secondary-900">{app.job.title}</h3>
                                                <p className="text-secondary-600">{app.job.provider.full_name}</p>
                                            </div>
                                            <Badge variant={getStatusBadgeVariant(app.status)}>{app.status}</Badge>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-secondary-500">
                                            <span className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4" />
                                                {app.job.location}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Banknote className="w-4 h-4" />
                                                {formatCurrency(app.job.compensation_amount)}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                Dilamar {formatRelativeTime(app.created_at)}
                                            </span>
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
