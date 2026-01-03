import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersService } from '../../api';
import { Card, CardContent, Badge, Skeleton, EmptyState, getStatusBadgeVariant } from '../../components/ui';
import { FileText, MapPin, Banknote, Clock, ChevronRight, Briefcase, AlertTriangle, CheckCircle2, Zap, XCircle } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '../../utils';

// Fungsi untuk menentukan urgensi berdasarkan job.status
const getJobUrgency = (jobStatus: string): { level: 'high' | 'medium' | 'none'; label: string; icon: React.ElementType; color: string; bgColor: string; borderColor: string } | null => {
    switch (jobStatus) {
        case 'ASSIGNED':
            return {
                level: 'high',
                label: 'Segera Mulai!',
                icon: Zap,
                color: 'text-amber-700',
                bgColor: 'bg-amber-50',
                borderColor: 'border-l-amber-500'
            };
        case 'IN_PROGRESS':
            return {
                level: 'high',
                label: 'Sedang Dikerjakan',
                icon: AlertTriangle,
                color: 'text-blue-700',
                bgColor: 'bg-blue-50',
                borderColor: 'border-l-blue-500'
            };
        case 'COMPLETED':
            return {
                level: 'high',
                label: 'Menunggu Approval',
                icon: CheckCircle2,
                color: 'text-purple-700',
                bgColor: 'bg-purple-50',
                borderColor: 'border-l-purple-500'
            };
        case 'REJECTED':
            return {
                level: 'high',
                label: 'Perlu Revisi!',
                icon: XCircle,
                color: 'text-red-700',
                bgColor: 'bg-red-50',
                borderColor: 'border-l-red-500'
            };
        case 'APPROVED':
            return {
                level: 'medium',
                label: 'Selesai',
                icon: CheckCircle2,
                color: 'text-green-700',
                bgColor: 'bg-green-50',
                borderColor: 'border-l-green-500'
            };
        default:
            return null;
    }
};

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
                    {applications.map((app) => {
                        const urgency = getJobUrgency(app.job.status);
                        const UrgencyIcon = urgency?.icon;

                        return (
                            <Link key={app.id} to={`/worker/applications/${app.id}`}>
                                <Card
                                    interactive
                                    className={`p-6 relative overflow-hidden ${urgency ? `border-l-4 ${urgency.borderColor}` : ''
                                        } ${urgency?.level === 'high' ? 'ring-2 ring-offset-1 ring-opacity-50 ' + urgency.borderColor.replace('border-l-', 'ring-') : ''}`}
                                >
                                    {/* Urgency Banner for High Priority */}
                                    {urgency?.level === 'high' && (
                                        <div className={`absolute top-0 right-0 ${urgency.bgColor} ${urgency.color} px-3 py-1 rounded-bl-lg flex items-center gap-1.5 text-xs font-semibold animate-pulse`}>
                                            {UrgencyIcon && <UrgencyIcon className="w-3.5 h-3.5" />}
                                            {urgency.label}
                                        </div>
                                    )}

                                    {/* Approved Badge (more subtle) */}
                                    {urgency?.level === 'medium' && (
                                        <div className={`absolute top-0 right-0 ${urgency.bgColor} ${urgency.color} px-3 py-1 rounded-bl-lg flex items-center gap-1.5 text-xs font-medium`}>
                                            {UrgencyIcon && <UrgencyIcon className="w-3.5 h-3.5" />}
                                            {urgency.label}
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${urgency?.level === 'high'
                                                ? urgency.bgColor
                                                : 'bg-gradient-to-br from-primary-100 to-primary-200'
                                            }`}>
                                            {urgency?.level === 'high' && UrgencyIcon ? (
                                                <UrgencyIcon className={`w-7 h-7 ${urgency.color}`} />
                                            ) : (
                                                <Briefcase className="w-7 h-7 text-primary-600" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2 pr-24">
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
                        );
                    })}
                </div>
            )}
        </div>
    );
};
