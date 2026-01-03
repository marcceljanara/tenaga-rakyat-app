import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../api';
import { Card, CardContent, Button, Badge, Skeleton, Modal, Textarea, Input, getStatusBadgeVariant } from '../../components/ui';
import {
    ArrowLeft,
    Lock,
    Unlock,
    CheckCircle,
    XCircle,
    Send,
    CreditCard,
    Calendar,
    User,
    Wallet,
    FileText,
    Copy
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils';
import toast from 'react-hot-toast';

export const AdminWithdrawDetail: React.FC = () => {
    const { withdrawId } = useParams<{ withdrawId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [adminNote, setAdminNote] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [transferReceipt, setTransferReceipt] = useState('');

    const { data, isLoading, error } = useQuery({
        queryKey: ['withdraw-detail', withdrawId],
        queryFn: () => adminService.getWithdrawRequestDetail(withdrawId!),
        enabled: !!withdrawId,
    });

    const request = data?.data;

    // Mutations
    const lockMutation = useMutation({
        mutationFn: () => adminService.lockWithdrawRequest(withdrawId!, adminNote || undefined),
        onSuccess: () => {
            toast.success('Request berhasil dikunci untuk diproses');
            queryClient.invalidateQueries({ queryKey: ['withdraw-detail', withdrawId] });
            queryClient.invalidateQueries({ queryKey: ['admin-withdraw-requests'] });
            setAdminNote('');
        },
        onError: (error: any) => toast.error(error.response?.data?.message || 'Gagal mengunci request'),
    });

    const unlockMutation = useMutation({
        mutationFn: () => adminService.unlockWithdrawRequest(withdrawId!),
        onSuccess: () => {
            toast.success('Request berhasil dibuka kembali');
            queryClient.invalidateQueries({ queryKey: ['withdraw-detail', withdrawId] });
            queryClient.invalidateQueries({ queryKey: ['admin-withdraw-requests'] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || 'Gagal membuka request'),
    });

    const approveMutation = useMutation({
        mutationFn: () => adminService.approveWithdrawRequest(withdrawId!, adminNote || undefined),
        onSuccess: () => {
            toast.success('Request disetujui! Silakan lakukan transfer.');
            queryClient.invalidateQueries({ queryKey: ['withdraw-detail', withdrawId] });
            queryClient.invalidateQueries({ queryKey: ['admin-withdraw-requests'] });
            setAdminNote('');
            setIsPaymentModalOpen(true);
        },
        onError: (error: any) => toast.error(error.response?.data?.message || 'Gagal menyetujui request'),
    });

    const rejectMutation = useMutation({
        mutationFn: () => adminService.rejectWithdrawRequest(withdrawId!, adminNote),
        onSuccess: () => {
            toast.success('Request ditolak. Saldo dikembalikan ke user.');
            queryClient.invalidateQueries({ queryKey: ['withdraw-detail', withdrawId] });
            queryClient.invalidateQueries({ queryKey: ['admin-withdraw-requests'] });
            setAdminNote('');
        },
        onError: (error: any) => toast.error(error.response?.data?.message || 'Gagal menolak request'),
    });

    const sendMutation = useMutation({
        mutationFn: () => adminService.sendWithdrawRequest(withdrawId!, transferReceipt),
        onSuccess: () => {
            toast.success('Penarikan berhasil ditandai sebagai terkirim!');
            queryClient.invalidateQueries({ queryKey: ['withdraw-detail', withdrawId] });
            queryClient.invalidateQueries({ queryKey: ['admin-withdraw-requests'] });
            setIsPaymentModalOpen(false);
            setTransferReceipt('');
        },
        onError: (error: any) => toast.error(error.response?.data?.message || 'Gagal menandai terkirim'),
    });

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} disalin ke clipboard`);
    };

    const isPending = lockMutation.isPending || unlockMutation.isPending || approveMutation.isPending || rejectMutation.isPending;

    // Determine visible actions based on status
    const getVisibleActions = () => {
        if (!request) return { lock: false, unlock: false, approve: false, reject: false, showPayment: false };

        switch (request.status) {
            case 'PENDING':
                return { lock: true, unlock: false, approve: false, reject: false, showPayment: false };
            case 'PROCESSING':
                return { lock: false, unlock: true, approve: true, reject: true, showPayment: false };
            case 'APPROVED':
                return { lock: false, unlock: false, approve: false, reject: false, showPayment: true };
            case 'REJECTED':
            case 'SENT':
                return { lock: false, unlock: false, approve: false, reject: false, showPayment: false };
            default:
                return { lock: false, unlock: false, approve: false, reject: false, showPayment: false };
        }
    };

    const actions = getVisibleActions();

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Skeleton className="h-8 w-48" />
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !request) {
        return (
            <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                <p className="text-secondary-500">Request tidak ditemukan</p>
                <Button variant="ghost" onClick={() => navigate('/admin/withdrawals')} className="mt-4">
                    Kembali ke Daftar Penarikan
                </Button>
            </div>
        );
    }

    const netAmount = Number(request.amount) - Number(request.fee_charged);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/withdrawals')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-secondary-900">Detail Penarikan #{request.id}</h1>
                    <p className="text-secondary-600">Kelola permintaan penarikan saldo</p>
                </div>
                <Badge variant={getStatusBadgeVariant(request.status)} className="text-base px-4 py-2">
                    {request.status}
                </Badge>
            </div>

            {/* Main Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Amount Card */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                            <Wallet className="w-5 h-5" /> Informasi Jumlah
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-secondary-100">
                                <span className="text-secondary-600">Jumlah Penarikan</span>
                                <span className="font-semibold text-lg">{formatCurrency(Number(request.amount))}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-secondary-100">
                                <span className="text-secondary-600">Biaya Admin</span>
                                <span className="font-medium text-danger-600">- {formatCurrency(Number(request.fee_charged))}</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-secondary-900 font-medium">Total Diterima</span>
                                <span className="font-bold text-xl text-success-600">{formatCurrency(netAmount)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Method Card */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" /> Metode Penarikan
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-secondary-100">
                                <span className="text-secondary-600">Metode</span>
                                <Badge variant="secondary">{request.method.method}</Badge>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-secondary-100">
                                <span className="text-secondary-600">Provider</span>
                                <span className="font-semibold">{request.method.provider}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-secondary-100">
                                <span className="text-secondary-600">Nama Rekening</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{request.method.account_name}</span>
                                    <button
                                        onClick={() => copyToClipboard(request.method.account_name, 'Nama')}
                                        className="text-primary-600 hover:text-primary-700"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-secondary-600">Nomor Rekening</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-lg">{request.method.account_number}</span>
                                    <button
                                        onClick={() => copyToClipboard(request.method.account_number, 'No. Rekening')}
                                        className="text-primary-600 hover:text-primary-700"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Details Card */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" /> Detail Request
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <p className="text-sm text-secondary-500 flex items-center gap-1.5 mb-1">
                                <Calendar className="w-4 h-4" /> Tanggal Request
                            </p>
                            <p className="font-medium">{formatDateTime(request.created_at)}</p>
                        </div>
                        {request.admin_locked_by && (
                            <div>
                                <p className="text-sm text-secondary-500 flex items-center gap-1.5 mb-1">
                                    <Lock className="w-4 h-4" /> Dikunci Oleh
                                </p>
                                <p className="font-medium">{request.admin_locked_by}</p>
                            </div>
                        )}
                        {request.admin_approved_by && (
                            <div>
                                <p className="text-sm text-secondary-500 flex items-center gap-1.5 mb-1">
                                    <CheckCircle className="w-4 h-4" /> Disetujui Oleh
                                </p>
                                <p className="font-medium">{request.admin_approved_by}</p>
                            </div>
                        )}
                        {request.admin_rejected_by && (
                            <div>
                                <p className="text-sm text-secondary-500 flex items-center gap-1.5 mb-1">
                                    <XCircle className="w-4 h-4" /> Ditolak Oleh
                                </p>
                                <p className="font-medium">{request.admin_rejected_by}</p>
                            </div>
                        )}
                    </div>

                    {request.admin_note && (
                        <div className="mt-6 p-4 bg-amber-50 rounded-xl">
                            <p className="text-sm text-amber-700 mb-1">Catatan Admin</p>
                            <p className="text-amber-800">{request.admin_note}</p>
                        </div>
                    )}

                    {request.transfer_receipt && (
                        <div className="mt-6 p-4 bg-success-50 rounded-xl">
                            <p className="text-sm text-success-700 mb-1">Bukti Transfer</p>
                            <p className="text-success-800 font-mono">{request.transfer_receipt}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Actions Card */}
            {(actions.lock || actions.unlock || actions.approve || actions.reject || actions.showPayment) && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" /> Aksi Admin
                        </h3>

                        {/* Admin Note Input - only show for lock/approve/reject */}
                        {(actions.lock || actions.approve || actions.reject) && (
                            <div className="mb-6">
                                <Textarea
                                    label="Catatan Admin"
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Tambahkan catatan (opsional untuk lock/approve, wajib untuk reject)"
                                    rows={3}
                                />
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                            {/* LOCK - Only visible on PENDING */}
                            {actions.lock && (
                                <Button
                                    variant="secondary"
                                    leftIcon={Lock}
                                    onClick={() => lockMutation.mutate()}
                                    isLoading={lockMutation.isPending}
                                    disabled={isPending}
                                >
                                    Kunci untuk Proses
                                </Button>
                            )}

                            {/* UNLOCK - Only visible on PROCESSING */}
                            {actions.unlock && (
                                <Button
                                    variant="secondary"
                                    leftIcon={Unlock}
                                    onClick={() => unlockMutation.mutate()}
                                    isLoading={unlockMutation.isPending}
                                    disabled={isPending}
                                >
                                    Buka Kunci
                                </Button>
                            )}

                            {/* APPROVE - Only visible on PROCESSING */}
                            {actions.approve && (
                                <Button
                                    leftIcon={CheckCircle}
                                    onClick={() => approveMutation.mutate()}
                                    isLoading={approveMutation.isPending}
                                    disabled={isPending}
                                >
                                    Setujui
                                </Button>
                            )}

                            {/* REJECT - Only visible on PROCESSING */}
                            {actions.reject && (
                                <Button
                                    variant="danger"
                                    leftIcon={XCircle}
                                    onClick={() => {
                                        if (!adminNote.trim()) {
                                            toast.error('Catatan wajib diisi untuk penolakan');
                                            return;
                                        }
                                        rejectMutation.mutate();
                                    }}
                                    isLoading={rejectMutation.isPending}
                                    disabled={isPending}
                                >
                                    Tolak
                                </Button>
                            )}

                            {/* Show Payment Modal Button - Only visible on APPROVED */}
                            {actions.showPayment && (
                                <Button
                                    leftIcon={Send}
                                    onClick={() => setIsPaymentModalOpen(true)}
                                >
                                    Lakukan Transfer
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Completed Status */}
            {request.status === 'SENT' && (
                <Card className="bg-success-50 border-success-200">
                    <CardContent className="p-6 text-center">
                        <CheckCircle className="w-12 h-12 text-success-500 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-success-800">Transfer Selesai</h3>
                        <p className="text-success-600">Penarikan ini sudah ditransfer ke rekening tujuan.</p>
                    </CardContent>
                </Card>
            )}

            {request.status === 'REJECTED' && (
                <Card className="bg-danger-50 border-danger-200">
                    <CardContent className="p-6 text-center">
                        <XCircle className="w-12 h-12 text-danger-500 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-danger-800">Ditolak</h3>
                        <p className="text-danger-600">Permintaan penarikan ini ditolak. Saldo telah dikembalikan ke wallet user.</p>
                    </CardContent>
                </Card>
            )}

            {/* Payment Modal */}
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Transfer Penarikan"
                size="lg"
            >
                <div className="space-y-6">
                    <div className="p-4 bg-primary-50 rounded-xl">
                        <p className="text-sm text-primary-700 mb-2">Silakan transfer ke rekening berikut:</p>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-primary-600">ID Request</span>
                                <span className="font-bold">#{request.id}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-primary-600">Provider</span>
                                <span className="font-bold">{request.method.provider}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-primary-600">Nama Rekening</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">{request.method.account_name}</span>
                                    <button
                                        onClick={() => copyToClipboard(request.method.account_name, 'Nama')}
                                        className="text-primary-600 hover:text-primary-700"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-primary-600">Nomor Rekening</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-lg">{request.method.account_number}</span>
                                    <button
                                        onClick={() => copyToClipboard(request.method.account_number, 'No. Rekening')}
                                        className="text-primary-600 hover:text-primary-700"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <hr className="border-primary-200" />
                            <div className="flex justify-between items-center">
                                <span className="text-primary-600 font-medium">Jumlah Transfer</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-xl text-primary-800">{formatCurrency(netAmount)}</span>
                                    <button
                                        onClick={() => copyToClipboard(netAmount.toString(), 'Jumlah')}
                                        className="text-primary-600 hover:text-primary-700"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Input
                        label="Bukti Transfer / Referensi"
                        value={transferReceipt}
                        onChange={(e) => setTransferReceipt(e.target.value)}
                        placeholder="Masukkan nomor referensi atau ID transaksi"
                        required
                    />

                    <div className="flex gap-3 justify-end">
                        <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            leftIcon={Send}
                            onClick={() => {
                                if (!transferReceipt.trim()) {
                                    toast.error('Bukti transfer wajib diisi');
                                    return;
                                }
                                sendMutation.mutate();
                            }}
                            isLoading={sendMutation.isPending}
                        >
                            Tandai Terkirim
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
