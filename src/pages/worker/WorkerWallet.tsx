import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { walletsService } from '../../api';
import { Card, CardContent, Button, Badge, Skeleton, EmptyState, getStatusBadgeVariant } from '../../components/ui';
import { Wallet, ArrowDownCircle, Plus, CreditCard, Banknote } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '../../utils';

export const WorkerWallet: React.FC = () => {
    const { data: walletData, isLoading: walletLoading } = useQuery({
        queryKey: ['worker-wallet'],
        queryFn: () => walletsService.getWallet(),
    });

    const { data: withdrawMethodsData, isLoading: methodsLoading } = useQuery({
        queryKey: ['worker-withdraw-methods'],
        queryFn: () => walletsService.getWithdrawMethods(),
    });

    const { data: requestsData, isLoading: requestsLoading } = useQuery({
        queryKey: ['worker-withdraw-requests'],
        queryFn: () => walletsService.getWithdrawRequests(),
    });

    const wallet = walletData?.data;
    const methods = withdrawMethodsData?.data.withdraw_methods || [];
    const requests = requestsData?.data.requests || [];

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-secondary-900">Dompet Saya</h1>
                <p className="text-secondary-600">Kelola saldo dan penarikan Anda</p>
            </div>

            {/* Balance Card */}
            <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white border-0">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-primary-100 mb-1">Saldo Tersedia</p>
                            {walletLoading ? (
                                <Skeleton className="h-10 w-40 bg-white/20" />
                            ) : (
                                <p className="text-4xl font-bold">{formatCurrency(wallet?.balance || 0)}</p>
                            )}
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                            <Wallet className="w-8 h-8" />
                        </div>
                    </div>

                    {wallet?.status === 'SUSPENDED' && (
                        <div className="mt-4 p-3 bg-danger-500/20 rounded-xl border border-danger-400/30">
                            <p className="text-sm font-medium">⚠️ Dompet Anda sedang ditangguhkan. Hubungi admin.</p>
                        </div>
                    )}

                    <div className="flex gap-3 mt-6">
                        <Link to="/worker/wallet/withdraw" className="flex-1">
                            <Button
                                className="w-full bg-white text-primary-600 hover:bg-primary-50"
                                leftIcon={ArrowDownCircle}
                                disabled={wallet?.status === 'SUSPENDED'}
                            >
                                Tarik Saldo
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Withdraw Methods */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-secondary-900">Metode Penarikan</h2>
                            <Link to="/worker/wallet/methods">
                                <Button variant="ghost" size="sm" leftIcon={Plus}>
                                    Tambah
                                </Button>
                            </Link>
                        </div>

                        {methodsLoading ? (
                            <div className="space-y-3">
                                {[...Array(2)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : methods.length === 0 ? (
                            <EmptyState
                                icon={CreditCard}
                                title="Belum Ada Metode"
                                description="Tambahkan metode penarikan untuk menarik saldo"
                            />
                        ) : (
                            <div className="space-y-3">
                                {methods.slice(0, 3).map((method) => (
                                    <div
                                        key={method.id}
                                        className="flex items-center gap-4 p-4 rounded-xl border border-secondary-200"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-secondary-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-secondary-900">{method.provider}</p>
                                            <p className="text-sm text-secondary-500 truncate">
                                                {method.account_name} • {method.account_number}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Withdrawals */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-secondary-900">Riwayat Penarikan</h2>
                            <Link to="/worker/wallet/withdrawals">
                                <Button variant="ghost" size="sm">
                                    Lihat Semua
                                </Button>
                            </Link>
                        </div>

                        {requestsLoading ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : requests.length === 0 ? (
                            <EmptyState
                                icon={Banknote}
                                title="Belum Ada Penarikan"
                                description="Riwayat penarikan akan muncul di sini"
                            />
                        ) : (
                            <div className="space-y-3">
                                {requests.slice(0, 5).map((req) => (
                                    <div
                                        key={req.id}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary-50 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                            <ArrowDownCircle className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-secondary-900">
                                                {formatCurrency(parseFloat(req.amount))}
                                            </p>
                                            <p className="text-sm text-secondary-500">
                                                {formatRelativeTime(req.created_at)}
                                            </p>
                                        </div>
                                        <Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
