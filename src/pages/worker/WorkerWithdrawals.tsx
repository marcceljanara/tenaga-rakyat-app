import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { walletsService } from '../../api';
import { Card, Badge, Skeleton, EmptyState, getStatusBadgeVariant } from '../../components/ui';
import { ArrowLeft, Banknote, Clock, ChevronRight, CreditCard, Building2 } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '../../utils';

export const WorkerWithdrawals: React.FC = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['worker-withdraw-requests'],
        queryFn: () => walletsService.getWithdrawRequests(),
    });

    const requests = data?.data.requests || [];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Back Button */}
            <Link
                to="/worker/wallet"
                className="inline-flex items-center gap-2 text-secondary-600 hover:text-primary-600 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Dompet
            </Link>

            <div>
                <h1 className="text-2xl font-bold text-secondary-900">Riwayat Penarikan</h1>
                <p className="text-secondary-600">Lihat semua permintaan penarikan Anda</p>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                    ))}
                </div>
            ) : requests.length === 0 ? (
                <EmptyState
                    icon={Banknote}
                    title="Belum Ada Penarikan"
                    description="Anda belum pernah melakukan penarikan. Ajukan penarikan dari halaman dompet."
                    action={
                        <Link to="/worker/wallet/withdraw">
                            <button className="btn-primary px-6 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors">
                                Tarik Saldo
                            </button>
                        </Link>
                    }
                />
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => (
                        <Link key={req.id} to={`/worker/wallet/withdrawals/${req.id}`}>
                            <Card interactive className="p-5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${req.method === 'BANK_TRANSFER'
                                        ? 'bg-gradient-to-br from-primary-100 to-primary-200'
                                        : 'bg-gradient-to-br from-success-100 to-success-200'
                                        }`}>
                                        {req.method === 'BANK_TRANSFER' ? (
                                            <Building2 className="w-6 h-6 text-primary-600" />
                                        ) : (
                                            <CreditCard className="w-6 h-6 text-success-600" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-1">
                                            <div>
                                                <p className="font-semibold text-secondary-900">
                                                    {formatCurrency(parseFloat(req.amount))}
                                                </p>
                                                <p className="text-sm text-secondary-600">
                                                    {req.provider} • {req.account_name}
                                                </p>
                                            </div>
                                            <Badge variant={getStatusBadgeVariant(req.status)}>
                                                {req.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm text-secondary-500">
                                            <Clock className="w-3.5 h-3.5" />
                                            {formatRelativeTime(req.created_at)}
                                        </div>
                                    </div>

                                    <ChevronRight className="w-5 h-5 text-secondary-400 flex-shrink-0" />
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
