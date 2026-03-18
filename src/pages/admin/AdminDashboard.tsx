import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../api';
import { Card, CardContent, Skeleton, Button } from '../../components/ui';
import { Users, Briefcase, FileText, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['admin-dashboard-summary'],
        queryFn: () => adminService.getDashboardSummary(),
    });

    const summary = data?.data;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center flex-col sm:flex-row gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Dashboard Admin</h1>
                    <p className="text-secondary-600">Ringkasan data platform TenagaRakyat</p>
                </div>
                <Button
                    leftIcon={Download}
                    onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        const lastMonth = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
                        adminService.exportCsv(lastMonth, today)
                            .then((blob) => {
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `report-${today}.csv`;
                                a.click();
                            })
                            .catch(() => alert('Gagal mengunduh CSV'));
                    }}
                >
                    Export CSV
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Users}
                    label="Total Pengguna"
                    value={summary?.total_users || 0}
                    trend="+12%"
                    trendUp
                    color="primary"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={Briefcase}
                    label="Total Lowongan"
                    value={summary?.total_jobs || 0}
                    trend="+8%"
                    trendUp
                    color="success"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={FileText}
                    label="Total Lamaran"
                    value={summary?.total_applications || 0}
                    trend="+23%"
                    trendUp
                    color="accent"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={CreditCard}
                    label="Penarikan Pending"
                    value={summary?.pending_withdrawals || 0}
                    trend="-5%"
                    trendUp={false}
                    color="warning"
                    isLoading={isLoading}
                />
            </div>

            {/* Info Cards */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Aktivitas Terkini</h2>
                        <div className="space-y-4">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="w-10 h-10 rounded-full" />
                                        <div className="flex-1">
                                            <Skeleton className="h-4 w-3/4 mb-1" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-secondary-500">
                                    <TrendingUp className="w-12 h-12 mx-auto mb-3 text-secondary-300" />
                                    <p>Data aktivitas akan ditampilkan di sini</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Statistik Platform</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary-50">
                                <span className="text-secondary-600">Total Transaksi</span>
                                <span className="font-semibold text-secondary-900">
                                    {isLoading ? <Skeleton className="h-5 w-16" /> : summary?.total_transactions || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary-50">
                                <span className="text-secondary-600">Penarikan Pending</span>
                                <span className="font-semibold text-warning-600">
                                    {isLoading ? <Skeleton className="h-5 w-16" /> : summary?.pending_withdrawals || 0}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: number;
    trend?: string;
    trendUp?: boolean;
    color: 'primary' | 'success' | 'warning' | 'accent';
    isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, trend, trendUp, color, isLoading }) => {
    const colors = {
        primary: 'bg-primary-100 text-primary-600',
        success: 'bg-success-100 text-success-600',
        warning: 'bg-warning-100 text-warning-600',
        accent: 'bg-accent-100 text-accent-600',
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    {trend && (
                        <div
                            className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-success-600' : 'text-danger-600'
                                }`}
                        >
                            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {trend}
                        </div>
                    )}
                </div>
                <div>
                    {isLoading ? (
                        <Skeleton className="h-8 w-20 mb-1" />
                    ) : (
                        <p className="text-2xl font-bold text-secondary-900">{value.toLocaleString()}</p>
                    )}
                    <p className="text-sm text-secondary-500">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
};
