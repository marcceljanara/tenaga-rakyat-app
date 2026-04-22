import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
    const { data, isLoading } = useQuery({
        queryKey: ['worker-applications'],
        queryFn: () => usersService.getApplications(),
        refetchInterval: 10000,
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
                <div className="space-y-3">
                    {applications.map((app) => {
                        // Only show job urgency for ACCEPTED applications (worker is actively working)
                        const urgency = app.status === 'ACCEPTED' ? getJobUrgency(app.job.status) : null;
                        const UrgencyIcon = urgency?.icon;

                        return (
                            <Link key={app.id} to={`/worker/applications/${app.id}`}>
                                <Card
                                    interactive
                                    className={`relative overflow-hidden ${urgency ? `border-l-4 ${urgency.borderColor}` : ''
                                        } ${urgency?.level === 'high' ? 'ring-2 ring-offset-1 ring-opacity-50 ' + urgency.borderColor.replace('border-l-', 'ring-') : ''}`}
                                >
                                    {/* Urgency Banner for High Priority - Only for ACCEPTED applications */}
                                    {urgency?.level === 'high' && (
                                        <div className={`absolute top-0 right-0 ${urgency.bgColor} ${urgency.color} px-2.5 py-1 rounded-bl-lg flex items-center gap-1 text-xs font-semibold animate-pulse`}>
                                            {UrgencyIcon && <UrgencyIcon className="w-3 h-3" />}
                                            <span className="hidden xs:inline">{urgency.label}</span>
                                        </div>
                                    )}

                                    {/* Approved Badge (more subtle) - Only for ACCEPTED applications */}
                                    {urgency?.level === 'medium' && (
                                        <div className={`absolute top-0 right-0 ${urgency.bgColor} ${urgency.color} px-2.5 py-1 rounded-bl-lg flex items-center gap-1 text-xs font-medium`}>
                                            {UrgencyIcon && <UrgencyIcon className="w-3 h-3" />}
                                            <span className="hidden xs:inline">{urgency.label}</span>
                                        </div>
                                    )}

                                    {/* Application Rejected Banner */}
                                    {app.status === 'REJECTED' && (
                                        <div className="absolute top-0 right-0 bg-danger-50 text-danger-700 px-2.5 py-1 rounded-bl-lg flex items-center gap-1 text-xs font-medium">
                                            <XCircle className="w-3 h-3" />
                                            <span className="hidden xs:inline">Lamaran Ditolak</span>
                                        </div>
                                    )}

                                    {/* Application Cancelled Banner */}
                                    {app.status === 'CANCELLED' && (
                                        <div className="absolute top-0 right-0 bg-secondary-100 text-secondary-700 px-2.5 py-1 rounded-bl-lg flex items-center gap-1 text-xs font-medium">
                                            <XCircle className="w-3 h-3" />
                                            <span className="hidden xs:inline">Dibatalkan</span>
                                        </div>
                                    )}

                                    <CardContent className="p-4 sm:p-5">
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${urgency?.level === 'high'
                                                ? urgency.bgColor
                                                : app.status === 'REJECTED'
                                                    ? 'bg-danger-50'
                                                    : 'bg-gradient-to-br from-primary-100 to-primary-200'
                                                }`}>
                                                {urgency?.level === 'high' && UrgencyIcon ? (
                                                    <UrgencyIcon className={`w-6 h-6 sm:w-7 sm:h-7 ${urgency.color}`} />
                                                ) : app.status === 'REJECTED' ? (
                                                    <XCircle className="w-6 h-6 sm:w-7 sm:h-7 text-danger-500" />
                                                ) : (
                                                    <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                {/* Title + Provider */}
                                                <div className="mb-1.5 pr-6">
                                                    <h3 className="text-base sm:text-lg font-semibold text-secondary-900 leading-snug">{app.job.title}</h3>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            navigate(`/worker/users/${app.job.provider.id}`);
                                                        }}
                                                        className="text-sm text-secondary-500 hover:text-primary-600 transition-colors text-left flex items-center gap-1 mt-0.5"
                                                    >
                                                        <span className="truncate max-w-[160px] sm:max-w-none">{app.job.provider.full_name}</span>
                                                        <span className="text-xs text-primary-500 flex-shrink-0">• Lihat profil</span>
                                                    </button>
                                                </div>

                                                {/* Badge */}
                                                <div className="mb-2">
                                                    <Badge variant={getStatusBadgeVariant(app.status)} className="text-xs">{app.status}</Badge>
                                                </div>

                                                {/* Meta info */}
                                                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs sm:text-sm text-secondary-500">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                                        <span className="truncate max-w-[140px] sm:max-w-none">{app.job.location_label || app.job.location}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Banknote className="w-3.5 h-3.5 flex-shrink-0" />
                                                        {formatCurrency(app.job.compensation_amount)} · Cash
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                                        Dilamar {formatRelativeTime(app.created_at)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Chevron */}
                                            <ChevronRight className="w-5 h-5 text-secondary-300 flex-shrink-0 mt-1" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
