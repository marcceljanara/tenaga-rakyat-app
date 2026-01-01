import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../api';
import { Card, Button, Badge, Skeleton, EmptyState, Modal, Textarea, getStatusBadgeVariant } from '../../components/ui';
import { CreditCard, Lock, Unlock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils';
import toast from 'react-hot-toast';
import type { WithdrawRequest } from '../../types';

export const AdminWithdrawals: React.FC = () => {
    const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [adminNote, setAdminNote] = useState('');
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['admin-withdraw-requests'],
        queryFn: () => adminService.getAllWithdrawRequests(),
    });

    const requests = data?.data || [];

    const lockMutation = useMutation({
        mutationFn: (id: number) => adminService.lockWithdrawRequest(String(id), adminNote),
        onSuccess: () => {
            toast.success('Request dikunci');
            queryClient.invalidateQueries({ queryKey: ['admin-withdraw-requests'] });
            setIsDetailModalOpen(false);
        },
        onError: (error: any) => toast.error(error.response?.data?.message || 'Gagal'),
    });

    const unlockMutation = useMutation({
        mutationFn: (id: number) => adminService.unlockWithdrawRequest(String(id)),
        onSuccess: () => {
            toast.success('Request dibuka');
            queryClient.invalidateQueries({ queryKey: ['admin-withdraw-requests'] });
            setIsDetailModalOpen(false);
        },
        onError: (error: any) => toast.error(error.response?.data?.message || 'Gagal'),
    });

    const approveMutation = useMutation({
        mutationFn: (id: number) => adminService.approveWithdrawRequest(String(id), adminNote),
        onSuccess: () => {
            toast.success('Request disetujui');
            queryClient.invalidateQueries({ queryKey: ['admin-withdraw-requests'] });
            setIsDetailModalOpen(false);
        },
        onError: (error: any) => toast.error(error.response?.data?.message || 'Gagal'),
    });

    const rejectMutation = useMutation({
        mutationFn: (id: number) => adminService.rejectWithdrawRequest(String(id), adminNote),
        onSuccess: () => {
            toast.success('Request ditolak');
            queryClient.invalidateQueries({ queryKey: ['admin-withdraw-requests'] });
            setIsDetailModalOpen(false);
        },
        onError: (error: any) => toast.error(error.response?.data?.message || 'Gagal'),
    });

    const openDetail = (req: WithdrawRequest) => {
        setSelectedRequest(req);
        setAdminNote('');
        setIsDetailModalOpen(true);
    };

    const isPending = lockMutation.isPending || unlockMutation.isPending || approveMutation.isPending || rejectMutation.isPending;

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
                                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Pengguna</th>
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
                                    <td colSpan={6} className="px-6 py-12">
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
                                            <p className="font-medium text-secondary-900">{req.user.full_name}</p>
                                            <p className="text-sm text-secondary-500">{req.user.email}</p>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{formatCurrency(req.net_amount)}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-secondary-900">{req.withdraw_method.provider}</p>
                                            <p className="text-sm text-secondary-500">{req.withdraw_method.account_number}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-secondary-600">{formatDate(req.created_at)}</td>
                                        <td className="px-6 py-4">
                                            <Button variant="ghost" size="sm" leftIcon={Eye} onClick={() => openDetail(req)}>
                                                Proses
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Detail Penarikan"
                size="lg"
            >
                {selectedRequest && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-secondary-500">Pengguna</p>
                                <p className="font-medium">{selectedRequest.user.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary-500">Email</p>
                                <p className="font-medium">{selectedRequest.user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary-500">Jumlah</p>
                                <p className="font-bold text-lg">{formatCurrency(selectedRequest.amount)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary-500">Biaya</p>
                                <p className="font-medium">{formatCurrency(selectedRequest.fee)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary-500">Total Diterima</p>
                                <p className="font-bold text-success-600">{formatCurrency(selectedRequest.net_amount)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary-500">Status</p>
                                <Badge variant={getStatusBadgeVariant(selectedRequest.status)}>{selectedRequest.status}</Badge>
                            </div>
                        </div>

                        <div className="p-4 bg-secondary-50 rounded-xl">
                            <p className="text-sm text-secondary-500 mb-1">Metode Penarikan</p>
                            <p className="font-medium">{selectedRequest.withdraw_method.provider}</p>
                            <p className="text-secondary-600">
                                {selectedRequest.withdraw_method.account_name} • {selectedRequest.withdraw_method.account_number}
                            </p>
                        </div>

                        <Textarea
                            label="Catatan Admin"
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            placeholder="Tambahkan catatan (opsional)"
                            rows={3}
                        />

                        <hr className="border-secondary-200" />

                        <div className="flex flex-wrap gap-3">
                            {selectedRequest.status === 'PENDING' && (
                                <Button
                                    variant="secondary"
                                    leftIcon={Lock}
                                    onClick={() => lockMutation.mutate(selectedRequest.id)}
                                    isLoading={lockMutation.isPending}
                                    disabled={isPending}
                                >
                                    Kunci
                                </Button>
                            )}
                            {selectedRequest.status === 'PROCESSING' && (
                                <>
                                    <Button
                                        variant="secondary"
                                        leftIcon={Unlock}
                                        onClick={() => unlockMutation.mutate(selectedRequest.id)}
                                        isLoading={unlockMutation.isPending}
                                        disabled={isPending}
                                    >
                                        Buka Kunci
                                    </Button>
                                    <Button
                                        leftIcon={CheckCircle}
                                        onClick={() => approveMutation.mutate(selectedRequest.id)}
                                        isLoading={approveMutation.isPending}
                                        disabled={isPending}
                                    >
                                        Setujui
                                    </Button>
                                    <Button
                                        variant="danger"
                                        leftIcon={XCircle}
                                        onClick={() => rejectMutation.mutate(selectedRequest.id)}
                                        isLoading={rejectMutation.isPending}
                                        disabled={isPending}
                                    >
                                        Tolak
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
