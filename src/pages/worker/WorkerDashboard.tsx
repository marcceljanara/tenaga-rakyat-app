import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { usersService, walletsService } from '../../api';
import { Card, CardContent, Badge, Button, Skeleton, Avatar } from '../../components/ui';
import { Briefcase, FileText, Wallet, ArrowRight, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '../../utils';

export const WorkerDashboard: React.FC = () => {
    const { user } = useAuth();

    const {
        data: applicationsData,
        isLoading: appsLoading,
        isError: appsError,
        refetch: refetchApps,
    } = useQuery({
        queryKey: ['worker-applications'],
        queryFn: () => usersService.getApplications(),
        retry: 2,
    });

    const {
        data: walletData,
        isLoading: walletLoading,
        isError: walletError,
        refetch: refetchWallet,
    } = useQuery({
        queryKey: ['worker-wallet'],
        queryFn: () => walletsService.getWallet(),
        retry: 2,
    });

    const applications = applicationsData?.data.applications || [];
    const wallet = walletData?.data;

    // Handle critical errors - show error state if both queries fail
    const hasCriticalError = appsError && walletError;

    if (hasCriticalError) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
                <Card className="max-w-md w-full">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-danger-100 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-danger-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
                            Gagal Memuat Data
                        </h2>
                        <p className="text-secondary-600 mb-6">
                            Terjadi kesalahan saat mengambil data. Pastikan koneksi internet Anda stabil dan coba lagi.
                        </p>
                        <Button
                            onClick={() => {
                                refetchApps();
                                refetchWallet();
                            }}
                            leftIcon={RefreshCw}
                        >
                            Coba Lagi
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    const recentApplications = applications.slice(0, 5);

    const stats = {
        total: applications.length,
        pending: applications.filter((a) => a.status === 'PENDING').length,
        accepted: applications.filter((a) => a.status === 'ACCEPTED').length,
        rejected: applications.filter((a) => a.status === 'REJECTED').length,
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">
                        Selamat datang, {user?.full_name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-secondary-600">Berikut ringkasan aktivitas Anda</p>
                </div>
                <Link to="/worker/jobs">
                    <Button rightIcon={ArrowRight}>Cari Pekerjaan</Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={FileText}
                    label="Total Lamaran"
                    value={appsError ? '-' : stats.total}
                    color="primary"
                    isLoading={appsLoading}
                    hasError={appsError}
                />
                <StatCard
                    icon={Clock}
                    label="Menunggu"
                    value={appsError ? '-' : stats.pending}
                    color="warning"
                    isLoading={appsLoading}
                    hasError={appsError}
                />
                <StatCard
                    icon={CheckCircle}
                    label="Diterima"
                    value={appsError ? '-' : stats.accepted}
                    color="success"
                    isLoading={appsLoading}
                    hasError={appsError}
                />
                <StatCard
                    icon={Wallet}
                    label="Saldo"
                    value={walletError ? '-' : formatCurrency(wallet?.balance || 0)}
                    color="accent"
                    isLoading={walletLoading}
                    isText
                    hasError={walletError}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Applications */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-secondary-900">Lamaran Terbaru</h2>
                                <Link
                                    to="/worker/applications"
                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Lihat Semua
                                </Link>
                            </div>

                            {appsLoading ? (
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
                            ) : appsError ? (
                                <div className="text-center py-8">
                                    <AlertCircle className="w-12 h-12 text-danger-300 mx-auto mb-3" />
                                    <p className="text-secondary-600 mb-3">Gagal memuat lamaran</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => refetchApps()}
                                        leftIcon={RefreshCw}
                                    >
                                        Coba Lagi
                                    </Button>
                                </div>
                            ) : recentApplications.length === 0 ? (
                                <div className="text-center py-8">
                                    <Briefcase className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                                    <p className="text-secondary-600">Belum ada lamaran</p>
                                    <Link to="/worker/jobs">
                                        <Button variant="ghost" size="sm" className="mt-2">
                                            Cari Pekerjaan
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentApplications.map((app) => (
                                        <Link
                                            key={app.id}
                                            to={`/worker/applications/${app.id}`}
                                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary-50 transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                                <Briefcase className="w-5 h-5 text-primary-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-secondary-900 truncate">{app.job.title}</p>
                                                <p className="text-sm text-secondary-500">{formatRelativeTime(app.created_at)}</p>
                                            </div>
                                            <Badge
                                                variant={
                                                    app.status === 'ACCEPTED'
                                                        ? 'success'
                                                        : app.status === 'REJECTED'
                                                            ? 'danger'
                                                            : app.status === 'PENDING'
                                                                ? 'warning'
                                                                : 'secondary'
                                                }
                                            >
                                                {app.status}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions & Profile */}
                <div className="space-y-6">
                    {/* Profile Card */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <Avatar src={user?.profile_picture_url} size="lg" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-secondary-900 truncate">{user?.full_name}</p>
                                    <p className="text-sm text-secondary-500 truncate">{user?.email}</p>
                                </div>
                            </div>
                            <Link to="/worker/profile">
                                <Button variant="secondary" className="w-full" size="sm">
                                    Edit Profil
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Aksi Cepat</h2>
                            <div className="space-y-2">
                                <Link to="/worker/jobs" className="block">
                                    <Button variant="ghost" className="w-full justify-start" leftIcon={Briefcase}>
                                        Cari Pekerjaan
                                    </Button>
                                </Link>
                                <Link to="/worker/applications" className="block">
                                    <Button variant="ghost" className="w-full justify-start" leftIcon={FileText}>
                                        Lihat Lamaran
                                    </Button>
                                </Link>
                                <Link to="/worker/wallet" className="block">
                                    <Button variant="ghost" className="w-full justify-start" leftIcon={Wallet}>
                                        Kelola Dompet
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: number | string;
    color: 'primary' | 'success' | 'warning' | 'danger' | 'accent';
    isLoading?: boolean;
    isText?: boolean;
    hasError?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color, isLoading, isText, hasError }) => {
    const colors = {
        primary: 'bg-primary-100 text-primary-600',
        success: 'bg-success-100 text-success-600',
        warning: 'bg-warning-100 text-warning-600',
        danger: 'bg-danger-100 text-danger-600',
        accent: 'bg-accent-100 text-accent-600',
    };

    const errorColors = 'bg-secondary-100 text-secondary-400';

    return (
        <Card className={hasError ? 'opacity-60' : ''}>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasError ? errorColors : colors[color]}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm text-secondary-500">{label}</p>
                        {isLoading ? (
                            <Skeleton className="h-6 w-16 mt-1" />
                        ) : (
                            <p className={`font-bold ${isText ? 'text-lg' : 'text-2xl'} ${hasError ? 'text-secondary-400' : 'text-secondary-900'}`}>
                                {value}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
