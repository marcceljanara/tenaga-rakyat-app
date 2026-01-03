import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../api';
import { Card, Button, Badge, Skeleton, EmptyState, getStatusBadgeVariant } from '../../components/ui';
import { CreditCard, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils';

export const AdminWithdrawals: React.FC = () => {
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ['admin-withdraw-requests'],
        queryFn: () => adminService.getAllWithdrawRequests(),
    });

    const requests = data?.data.requests || [];

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-secondary-900">Manajemen Penarikan</h1>
                <p className="text-secondary-600">Proses permintaan penarikan saldo</p>
            </div>

            {/* Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary-50 border-b border-secondary-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">ID</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Nama Rekening</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Jumlah</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Metode</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Tanggal</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-12" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-28" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-8 w-24" /></td>
                                    </tr>
                                ))
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12">
                                        <EmptyState
                                            icon={CreditCard}
                                            title="Tidak Ada Permintaan"
                                            description="Tidak ada permintaan penarikan saat ini"
                                        />
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-secondary-50">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm text-secondary-600">#{req.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-secondary-900">{req.account_name}</p>
                                            <p className="text-sm text-secondary-500">{req.account_number}</p>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{formatCurrency(Number(req.amount))}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant="secondary">{req.method}</Badge>
                                            <p className="text-sm text-secondary-500 mt-1">{req.provider}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-secondary-600">{formatDate(req.created_at)}</td>
                                        <td className="px-6 py-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                leftIcon={Eye}
                                                onClick={() => navigate(`/admin/withdrawals/${req.id}`)}
                                            >
                                                Detail
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
