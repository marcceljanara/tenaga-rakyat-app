import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../api';
import { Card, CardContent, Skeleton, Button } from '../../components/ui';
import { 
    Users, Briefcase, FileText, CreditCard, TrendingUp, 
    Download, Calendar, 
    TrendingDown, BarChart3
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';
import { formatCurrency } from '../../utils';
import { toast } from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
    const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
    const [csvDateRange, setCsvDateRange] = useState({
        from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });

    const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
        queryKey: ['admin-dashboard-summary', granularity],
        queryFn: () => adminService.getDashboardSummary(granularity),
    });

    const summary = summaryData?.data;

    const handleExportCsv = async () => {
        try {
            const blob = await adminService.exportCsv(csvDateRange.from, csvDateRange.to);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report-posting-credits-${csvDateRange.from}-to-${csvDateRange.to}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Laporan berhasil diunduh');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Gagal mengunduh laporan CSV');
        }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border rounded-xl shadow-lg">
                    <p className="text-sm font-bold text-secondary-900 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-xs" style={{ color: entry.color }}>
                            {entry.name}: {entry.name === 'Revenue' ? formatCurrency(entry.value) : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Section */}
            <div className="flex justify-between items-start flex-col lg:flex-row gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Dashboard Admin</h1>
                    <p className="text-secondary-600">Statistik platform dan laporan transaksi posting kredit</p>
                </div>

                {/* CSV Export Control */}
                <div className="flex flex-col sm:flex-row items-end gap-3 p-4 bg-white rounded-2xl border shadow-sm w-full lg:w-auto">
                    <div className="w-full sm:w-auto">
                        <label className="block text-xs font-medium text-secondary-500 mb-1">Dari Tanggal</label>
                        <input 
                            type="date" 
                            className="w-full sm:w-40 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            value={csvDateRange.from}
                            onChange={(e) => setCsvDateRange({ ...csvDateRange, from: e.target.value })}
                        />
                    </div>
                    <div className="w-full sm:w-auto">
                        <label className="block text-xs font-medium text-secondary-500 mb-1">Sampai Tanggal</label>
                        <input 
                            type="date" 
                            className="w-full sm:w-40 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            value={csvDateRange.to}
                            onChange={(e) => setCsvDateRange({ ...csvDateRange, to: e.target.value })}
                        />
                    </div>
                    <Button
                        leftIcon={Download}
                        className="w-full sm:w-auto"
                        onClick={handleExportCsv}
                        variant="primary"
                    >
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={TrendingUp}
                    label="Total Pendapatan"
                    value={formatCurrency(summary?.total_revenue || 0)}
                    color="primary"
                    isLoading={isSummaryLoading}
                    isCurrency
                />
                <StatCard
                    icon={CreditCard}
                    label="Kredit Terjual"
                    value={summary?.total_credits_sold || 0}
                    color="success"
                    isLoading={isSummaryLoading}
                />
                <StatCard
                    icon={Users}
                    label="Total Pengguna"
                    value={summary?.total_users || 0}
                    color="accent"
                    isLoading={isSummaryLoading}
                />
                <StatCard
                    icon={Briefcase}
                    label="Total Lowongan"
                    value={summary?.total_jobs || 0}
                    color="warning"
                    isLoading={isSummaryLoading}
                />
            </div>

            {/* Second Tier Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={FileText}
                    label="Total Lamaran"
                    value={summary?.total_applications || 0}
                    color="primary"
                    isLoading={isSummaryLoading}
                    variant="outline"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Transaksi Sukses"
                    value={summary?.paid_transactions || 0}
                    color="success"
                    isLoading={isSummaryLoading}
                    variant="outline"
                />
                <StatCard
                    icon={Calendar}
                    label="Transaksi Pending"
                    value={summary?.pending_transactions || 0}
                    color="warning"
                    isLoading={isSummaryLoading}
                    variant="outline"
                />
                <StatCard
                    icon={TrendingDown}
                    label="Transaksi Gagal"
                    value={summary?.failed_transactions || 0}
                    color="danger"
                    isLoading={isSummaryLoading}
                    variant="outline"
                />
            </div>

            {/* Main Chart Section */}
            <Card className="overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h2 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary-500" />
                                Tren Aktivitas Platform
                            </h2>
                            <p className="text-sm text-secondary-500">Pertumbuhan data berdasarkan periode waktu</p>
                        </div>

                        {/* Granularity Selector */}
                        <div className="flex bg-secondary-100 p-1 rounded-xl w-full sm:w-auto">
                            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((g) => (
                                <button
                                    key={g}
                                    onClick={() => setGranularity(g)}
                                    className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                        granularity === g 
                                        ? 'bg-white text-primary-600 shadow-sm' 
                                        : 'text-secondary-500 hover:text-secondary-700'
                                    }`}
                                >
                                    {g.charAt(0).toUpperCase() + g.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[400px] w-full mt-4">
                        {isSummaryLoading ? (
                            <Skeleton className="w-full h-full rounded-2xl" />
                        ) : summary?.timeseries && summary.timeseries.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={summary.timeseries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis 
                                        dataKey="period" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="total_revenue" 
                                        name="Revenue"
                                        stroke="#4F46E5" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorRevenue)" 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="total_users" 
                                        name="Users"
                                        stroke="#8B5CF6" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorUsers)" 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="total_jobs" 
                                        name="Jobs"
                                        stroke="#10B981" 
                                        strokeWidth={3}
                                        fillOpacity={0} 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-secondary-400">
                                <TrendingUp className="w-12 h-12 mb-3 opacity-20" />
                                <p>Tidak ada data timeseries tersedia untuk periode ini</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Distribution Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-secondary-900 font-semibold mb-4">Volume Transaksi & Lamaran</h3>
                        <div className="h-[300px]">
                            {isSummaryLoading ? (
                                <Skeleton className="w-full h-full rounded-xl" />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={summary?.timeseries}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                        <XAxis dataKey="period" hide />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="total_transactions" name="Transaksi" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={20} />
                                        <Bar dataKey="total_applications" name="Lamaran" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-secondary-900 font-semibold mb-4">Penjualan Kredit (Aggregated)</h3>
                        <div className="h-[300px]">
                            {isSummaryLoading ? (
                                <Skeleton className="w-full h-full rounded-xl" />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={summary?.timeseries}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                        <XAxis dataKey="period" hide />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="total_credits" name="Kredit" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
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
    value: string | number;
    color: 'primary' | 'success' | 'warning' | 'accent' | 'danger';
    isLoading?: boolean;
    isCurrency?: boolean;
    variant?: 'solid' | 'outline';
}

const StatCard: React.FC<StatCardProps> = ({ 
    icon: Icon, label, value, color, isLoading, variant = 'solid' 
}) => {
    const solidColors = {
        primary: 'bg-primary-50 text-primary-600',
        success: 'bg-success-50 text-success-600',
        warning: 'bg-warning-50 text-warning-600',
        accent: 'bg-accent-50 text-accent-600',
        danger: 'bg-danger-50 text-danger-600',
    };

    const outlineColors = {
        primary: 'border-primary-100 bg-white text-primary-600',
        success: 'border-success-100 bg-white text-success-600',
        warning: 'border-warning-100 bg-white text-warning-600',
        accent: 'border-accent-100 bg-white text-accent-600',
        danger: 'border-danger-100 bg-white text-danger-600',
    };

    return (
        <Card className={variant === 'outline' ? 'border shadow-none' : ''}>
            <CardContent className="p-4 lg:p-6">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        variant === 'solid' ? solidColors[color] : `border ${outlineColors[color]}`
                    }`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider mb-1 truncate">
                            {label}
                        </p>
                        {isLoading ? (
                            <Skeleton className="h-7 w-24 mb-1" />
                        ) : (
                            <p className="text-xl lg:text-2xl font-bold text-secondary-900 truncate">
                                {value}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
