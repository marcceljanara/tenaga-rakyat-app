import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { jobsService } from '../../api';
import { Card, CardContent, Badge, Button, Skeleton, getStatusBadgeVariant } from '../../components/ui';
import { Briefcase, Users, Clock, CheckCircle, PlusCircle } from 'lucide-react';
import { formatCurrency } from '../../utils';

export const EmployerDashboard: React.FC = () => {
    const { user } = useAuth();

    const { data: activeJobsData, isLoading: activeLoading } = useQuery({
        queryKey: ['employer-active-jobs'],
        queryFn: () => jobsService.getProviderActive(),
    });

    const { data: historyData, isLoading: historyLoading } = useQuery({
        queryKey: ['employer-jobs-history'],
        queryFn: () => jobsService.getProviderHistory(),
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
        completed: allJobs.filter((j) => j.status === 'COMPLETED').length,
        // balance: wallet?.balance || 0, // DISABLED: Wallet
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">
                        Selamat datang, {user?.full_name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-secondary-600">Kelola lowongan dan aplikasi Anda</p>
                </div>
                <Link to="/employer/jobs/new">
                    <Button leftIcon={PlusCircle}>Buat Lowongan</Button>
                </Link>
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
            </div>

            {/* Active Jobs */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-secondary-900">Lowongan Aktif</h2>
                        <Link
                            to="/employer/jobs"
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Lihat Semua
                        </Link>
                    </div>

                    {activeLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="w-10 h-10 rounded-lg" />
                                    <div className="flex-1">
                                        <Skeleton className="h-5 w-3/4 mb-1" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
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
                        <div className="space-y-4">
                            {activeJobs.slice(0, 5).map((job) => (
                                <Link
                                    key={job.id}
                                    to={`/employer/jobs/${job.id}`}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary-50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                        <Briefcase className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-secondary-900 truncate">{job.title}</p>
                                        <p className="text-sm text-secondary-500">
                                            {job.location} • {formatCurrency(job.compensation_amount)}
                                        </p>
                                    </div>
                                    <Badge variant={getStatusBadgeVariant(job.status)}>{job.status}</Badge>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-3 gap-4">
                <Link to="/employer/jobs/new">
                    <Card interactive className="p-6 text-center">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mx-auto mb-3">
                            <PlusCircle className="w-6 h-6 text-primary-600" />
                        </div>
                        <p className="font-medium text-secondary-900">Buat Lowongan</p>
                        <p className="text-sm text-secondary-500">Posting pekerjaan baru</p>
                    </Card>
                </Link>

                <Link to="/employer/applications">
                    <Card interactive className="p-6 text-center">
                        <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center mx-auto mb-3">
                            <Users className="w-6 h-6 text-success-600" />
                        </div>
                        <p className="font-medium text-secondary-900">Lamaran Masuk</p>
                        <p className="text-sm text-secondary-500">Kelola pelamar</p>
                    </Card>
                </Link>

                <Link to="/employer/jobs">
                    <Card interactive className="p-6 text-center">
                        <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center mx-auto mb-3">
                            <Briefcase className="w-6 h-6 text-accent-600" />
                        </div>
                        <p className="font-medium text-secondary-900">Semua Lowongan</p>
                        <p className="text-sm text-secondary-500">Kelola lowongan</p>
                    </Card>
                </Link>
            </div>
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
