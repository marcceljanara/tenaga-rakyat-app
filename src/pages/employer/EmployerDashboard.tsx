import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { jobsService } from '../../api';
import { Card, CardContent, Badge, Button, Skeleton, getStatusBadgeVariant } from '../../components/ui';
import { Briefcase, CircleX, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils';

export const EmployerDashboard: React.FC = () => {
    const { user } = useAuth();

    const { data: activeJobsData, isLoading: activeLoading } = useQuery({
        queryKey: ['employer-active-jobs'],
        queryFn: () => jobsService.getProviderActive(),
        refetchInterval: 15000,
    });

    const { data: historyData, isLoading: historyLoading } = useQuery({
        queryKey: ['employer-jobs-history'],
        queryFn: () => jobsService.getProviderHistory(),
        refetchInterval: 15000,
    });

    // DISABLED: Wallet/Escrow features - Cash only mode
    // const { data: walletData, isLoading: walletLoading } = useQuery({
    //     queryKey: ['employer-wallet'],
    //     queryFn: () => walletsService.getWallet(),
    // });

    const activeJobs = activeJobsData?.data.jobs || [];
    const allJobs = historyData?.data.jobs || [];
    console.log(allJobs);
    // const wallet = walletData?.data; // DISABLED: Wallet

    const stats = {
        total: allJobs.length,
        active: activeJobs.length,
        completed: allJobs.filter((j) => j.status === 'APPROVED').length,
        cancelled: allJobs.filter((j) => j.status === 'CANCELLED').length,
        // balance: wallet?.balance || 0, // DISABLED: Wallet
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Section */}
            <div>
                <h1 className="text-2xl font-bold text-secondary-900">
                    Selamat datang, {user?.full_name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-secondary-600">Kelola lowongan dan aplikasi Anda</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Briefcase}
                    label="Total Lowongan"
                    value={stats.total}
                    color="primary"
                    isLoading={historyLoading}
                />
                <StatCard
                    icon={Clock}
                    label="Aktif"
                    value={stats.active}
                    color="success"
                    isLoading={activeLoading}
                />
                <StatCard
                    icon={CheckCircle}
                    label="Selesai"
                    value={stats.completed}
                    color="secondary"
                    isLoading={historyLoading}
                />
                <StatCard
                    icon={CircleX}
                    label="Dibatalkan"
                    value={stats.cancelled}
                    color="danger"
                    isLoading={historyLoading}
                />
            </div>

            {/* Active Jobs - Full Width */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-secondary-900">Lowongan Aktif</h2>
                        <Link
                            to="/employer/jobs"
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                        >
                            Lihat Semua
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {activeLoading ? (
                        <div className="divide-y divide-secondary-100">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 py-4">
                                    <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                                    <div className="flex-1">
                                        <Skeleton className="h-5 w-3/4 mb-1" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : activeJobs.length === 0 ? (
                        <div className="text-center py-8">
                            <Briefcase className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                            <p className="text-secondary-600 mb-4">Belum ada lowongan aktif</p>
                            <Link to="/employer/jobs/new">
                                <Button size="sm">Buat Lowongan</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-secondary-100">
                            {activeJobs.map((job) => (
                                <Link
                                    key={job.id}
                                    to={`/employer/jobs/${job.id}`}
                                    className="flex items-center gap-4 py-3.5 px-2 -mx-2 rounded-xl hover:bg-secondary-50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                                        <Briefcase className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-secondary-900 truncate">{job.title}</p>
                                        <p className="text-sm text-secondary-500 flex items-center gap-1 mt-0.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {job.location_label || job.location} · {formatCurrency(job.compensation_amount)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Badge variant={getStatusBadgeVariant(job.status)}>{job.status}</Badge>
                                        <ArrowRight className="w-4 h-4 text-secondary-300" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: number | string;
    color: 'primary' | 'success' | 'warning' | 'danger' | 'accent' | 'secondary';
    isLoading?: boolean;
    isText?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color, isLoading, isText }) => {
    const colors = {
        primary: 'bg-primary-100 text-primary-600',
        success: 'bg-success-100 text-success-600',
        warning: 'bg-warning-100 text-warning-600',
        danger: 'bg-danger-100 text-danger-600',
        accent: 'bg-accent-100 text-accent-600',
        secondary: 'bg-secondary-100 text-secondary-600',
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm text-secondary-500">{label}</p>
                        {isLoading ? (
                            <Skeleton className="h-6 w-16 mt-1" />
                        ) : (
                            <p className={`font-bold ${isText ? 'text-lg' : 'text-2xl'} text-secondary-900`}>
                                {value}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
