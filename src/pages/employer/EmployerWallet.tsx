import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { walletsService } from '../../api';
import { Card, CardContent, Button, Skeleton, EmptyState } from '../../components/ui';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Banknote } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '../../utils';
import type { TransactionType } from '../../types';

// Helper to determine if transaction is incoming (positive for balance)
const isIncomingTransaction = (type: TransactionType): boolean => {
    return type === 'FUNDING' || type === 'ESCROW_RELEASE' || type === 'REFUND';
};

export const EmployerWallet: React.FC = () => {
    const { data: walletData, isLoading: walletLoading } = useQuery({
        queryKey: ['employer-wallet'],
        queryFn: () => walletsService.getWallet(),
    });

    const wallet = walletData?.data;

    const { data: transactionsData, isLoading: txLoading } = useQuery({
        queryKey: ['employer-transactions', wallet?.id],
        queryFn: () => walletsService.getTransactions(wallet!.id),
        enabled: !!wallet?.id,
    });

    const transactions = transactionsData?.data.transactions || [];

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-secondary-900">Dompet Saya</h1>
                <p className="text-secondary-600">Kelola saldo untuk pembayaran pekerjaan</p>
            </div>

            {/* Balance Card */}
            <Card className="bg-gradient-to-r from-accent-600 to-accent-700 text-white border-0">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-accent-100 mb-1">Saldo Tersedia</p>
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
                        <Link to="/employer/wallet/topup" className="flex-1">
                            <Button
                                className="w-full bg-white text-accent-600 hover:bg-accent-50"
                                leftIcon={ArrowUpCircle}
                                disabled={wallet?.status === 'SUSPENDED'}
                            >
                                Top Up Saldo
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Transactions */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-secondary-900 mb-4">Riwayat Transaksi</h2>

                    {txLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : transactions.length === 0 ? (
                        <EmptyState
                            icon={Banknote}
                            title="Belum Ada Transaksi"
                            description="Riwayat transaksi akan muncul di sini setelah Anda melakukan top up atau pembayaran"
                        />
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((tx) => {
                                const isIncoming = isIncomingTransaction(tx.type);
                                return (
                                    <div
                                        key={tx.id}
                                        className="flex items-center gap-4 p-4 rounded-xl border border-secondary-200"
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${isIncoming ? 'bg-success-100' : 'bg-danger-100'
                                                }`}
                                        >
                                            {isIncoming ? (
                                                <ArrowDownCircle className="w-5 h-5 text-success-600" />
                                            ) : (
                                                <ArrowUpCircle className="w-5 h-5 text-danger-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-secondary-900">
                                                {tx.description || tx.type}
                                            </p>
                                            <p className="text-sm text-secondary-500">
                                                {formatRelativeTime(tx.created_at)}
                                            </p>
                                        </div>
                                        <p
                                            className={`font-semibold ${isIncoming ? 'text-success-600' : 'text-danger-600'
                                                }`}
                                        >
                                            {isIncoming ? '+' : '-'}
                                            {formatCurrency(tx.amount)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
