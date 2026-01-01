import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { walletsService } from '../../api';
import { Card, CardContent, Badge, Skeleton, getStatusBadgeVariant } from '../../components/ui';
import {
    ArrowLeft,
    Clock,
    CreditCard,
    Building2,
    AlertCircle,
    CheckCircle,
    XCircle,
    Loader2,
    FileText,
    Receipt
} from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '../../utils';

export const WorkerWithdrawalDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    const { data, isLoading, error } = useQuery({
        queryKey: ['worker-withdrawal-detail', id],
        queryFn: () => walletsService.getWithdrawRequestDetail(id!),
        enabled: !!id,
    });

    const withdrawal = data?.data;

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
        );
    }

    if (error || !withdrawal) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-secondary-900 mb-2">Penarikan Tidak Ditemukan</h2>
                <p className="text-secondary-600 mb-6">Data penarikan yang Anda cari tidak ditemukan.</p>
                <Link to="/worker/wallet/withdrawals">
                    <button className="btn-primary px-6 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors">
                        Kembali ke Riwayat
                    </button>
                </Link>
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED':
            case 'SENT':
                return <CheckCircle className="w-6 h-6 text-success-600" />;
            case 'REJECTED':
                return <XCircle className="w-6 h-6 text-danger-600" />;
            case 'PROCESSING':
                return <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />;
            default:
                return <Clock className="w-6 h-6 text-warning-600" />;
        }
    };

    const getStatusMessage = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'Permintaan penarikan sedang menunggu diproses oleh admin.';
            case 'PROCESSING':
                return 'Penarikan sedang diproses. Dana akan segera dikirim.';
            case 'APPROVED':
                return 'Penarikan telah disetujui dan dana sedang dalam proses pengiriman.';
            case 'SENT':
                return 'Dana telah berhasil dikirim ke rekening Anda.';
            case 'REJECTED':
                return withdrawal.admin_note || 'Penarikan ditolak oleh admin.';
            default:
                return 'Status tidak diketahui.';
        }
    };

    const amount = parseFloat(withdrawal.amount);
    const fee = parseFloat(withdrawal.fee_charged);
    const netAmount = amount - fee;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Back Button */}
            <Link
                to="/worker/wallet/withdrawals"
                className="inline-flex items-center gap-2 text-secondary-600 hover:text-primary-600 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Riwayat
            </Link>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Detail Penarikan</h1>
                    <p className="text-secondary-600">ID Transaksi: #{withdrawal.id}</p>
                </div>
                <Badge variant={getStatusBadgeVariant(withdrawal.status)} className="text-sm px-4 py-2">
                    {withdrawal.status}
                </Badge>
            </div>

            {/* Amount Card */}
            <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white border-0">
                <CardContent className="p-6">
                    <div className="text-center">
                        <p className="text-primary-100 mb-2">Jumlah Penarikan</p>
                        <p className="text-4xl font-bold mb-4">{formatCurrency(amount)}</p>
                        <div className="flex justify-center gap-6 text-sm">
                            <div>
                                <p className="text-primary-200">Biaya Admin</p>
                                <p className="font-medium">- {formatCurrency(fee)}</p>
                            </div>
                            <div>
                                <p className="text-primary-200">Yang Diterima</p>
                                <p className="font-medium">{formatCurrency(netAmount)}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Status Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${withdrawal.status === 'APPROVED' || withdrawal.status === 'SENT'
                                ? 'bg-success-100'
                                : withdrawal.status === 'REJECTED'
                                    ? 'bg-danger-100'
                                    : withdrawal.status === 'PROCESSING'
                                        ? 'bg-primary-100'
                                        : 'bg-warning-100'
                            }`}>
                            {getStatusIcon(withdrawal.status)}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-secondary-900 mb-1">
                                Status: {withdrawal.status}
                            </h3>
                            <p className="text-secondary-600 text-sm">
                                {getStatusMessage(withdrawal.status)}
                            </p>
                        </div>
                    </div>

                    {withdrawal.admin_note && withdrawal.status === 'REJECTED' && (
                        <div className="mt-4 p-4 bg-danger-50 rounded-xl border border-danger-200">
                            <p className="text-sm font-medium text-danger-700">Catatan Admin:</p>
                            <p className="text-sm text-danger-600 mt-1">{withdrawal.admin_note}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Method Details Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${withdrawal.method.method === 'BANK_TRANSFER'
                                ? 'bg-gradient-to-br from-primary-100 to-primary-200'
                                : 'bg-gradient-to-br from-success-100 to-success-200'
                            }`}>
                            {withdrawal.method.method === 'BANK_TRANSFER' ? (
                                <Building2 className="w-6 h-6 text-primary-600" />
                            ) : (
                                <CreditCard className="w-6 h-6 text-success-600" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-secondary-900">Metode Penarikan</h2>
                            <p className="text-secondary-500 text-sm">
                                {withdrawal.method.method === 'BANK_TRANSFER' ? 'Transfer Bank' : 'E-Wallet'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 bg-secondary-50 rounded-xl p-4">
                        <div className="flex justify-between">
                            <span className="text-secondary-600">Provider</span>
                            <span className="font-medium text-secondary-900">{withdrawal.method.provider}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-secondary-600">Nama Akun</span>
                            <span className="font-medium text-secondary-900">{withdrawal.method.account_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-secondary-600">Nomor Rekening</span>
                            <span className="font-medium text-secondary-900">{withdrawal.method.account_number}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Transfer Receipt */}
            {withdrawal.transfer_receipt && (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-100 to-success-200 flex items-center justify-center">
                                <Receipt className="w-6 h-6 text-success-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-secondary-900">Bukti Transfer</h2>
                                <p className="text-secondary-500 text-sm">Bukti pengiriman dana</p>
                            </div>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-secondary-200">
                            <img
                                src={withdrawal.transfer_receipt}
                                alt="Bukti Transfer"
                                className="w-full h-auto"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Timeline */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-secondary-900 mb-4">Timeline</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 text-primary-600" />
                            </div>
                            <div>
                                <p className="font-medium text-secondary-900">Permintaan Dibuat</p>
                                <p className="text-sm text-secondary-500">{formatRelativeTime(withdrawal.created_at)}</p>
                            </div>
                        </div>

                        {withdrawal.status !== 'PENDING' && (
                            <div className="flex items-start gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${withdrawal.status === 'APPROVED' || withdrawal.status === 'SENT'
                                        ? 'bg-success-100'
                                        : withdrawal.status === 'REJECTED'
                                            ? 'bg-danger-100'
                                            : 'bg-primary-100'
                                    }`}>
                                    {withdrawal.status === 'APPROVED' || withdrawal.status === 'SENT' ? (
                                        <CheckCircle className="w-4 h-4 text-success-600" />
                                    ) : withdrawal.status === 'REJECTED' ? (
                                        <XCircle className="w-4 h-4 text-danger-600" />
                                    ) : (
                                        <Loader2 className="w-4 h-4 text-primary-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-secondary-900">
                                        {withdrawal.status === 'PROCESSING' && 'Sedang Diproses'}
                                        {withdrawal.status === 'APPROVED' && 'Disetujui'}
                                        {withdrawal.status === 'SENT' && 'Dana Terkirim'}
                                        {withdrawal.status === 'REJECTED' && 'Ditolak'}
                                    </p>
                                    <p className="text-sm text-secondary-500">Status terbaru</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
