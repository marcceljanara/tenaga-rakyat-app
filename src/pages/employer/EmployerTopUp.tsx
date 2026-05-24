import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { walletsService } from '../../api';
import { Card, CardContent, Button, Input, Skeleton, Modal } from '../../components/ui';
import { ArrowLeft, Wallet, CreditCard, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { formatCurrency, handleApiError } from '../../utils';
import toast from 'react-hot-toast';

const topUpSchema = z.object({
    balance: z.number().min(10000, 'Minimum top up Rp 10.000'),
});

type TopUpFormData = z.infer<typeof topUpSchema>;

export const EmployerTopUp: React.FC = () => {
    const queryClient = useQueryClient();
    const [paymentData, setPaymentData] = useState<{ token: string; redirect_url: string } | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Fetch wallet data
    const { data: walletData, isLoading: walletLoading } = useQuery({
        queryKey: ['employer-wallet'],
        queryFn: () => walletsService.getWallet(),
    });

    const wallet = walletData?.data;

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
        reset,
    } = useForm<TopUpFormData>({
        resolver: zodResolver(topUpSchema),
        defaultValues: {
            balance: 100000,
        },
    });

    // Top up mutation
    const topUpMutation = useMutation({
        mutationFn: (data: TopUpFormData) => walletsService.topUp(data.balance),
        onSuccess: (response) => {
            const data = response.data;
            setPaymentData({
                token: data.token,
                redirect_url: data.redirectUrl,
            });
            setIsPaymentModalOpen(true);
        },
        onError: (error: any) => {
            handleApiError(error, 'Gagal membuat permintaan top up', setError);
        },
    });

    const onSubmit = (data: TopUpFormData) => {
        topUpMutation.mutate(data);
    };

    const handlePaymentComplete = () => {
        setIsPaymentModalOpen(false);
        setPaymentData(null);
        reset();
        queryClient.invalidateQueries({ queryKey: ['employer-wallet'] });
        queryClient.invalidateQueries({ queryKey: ['employer-transactions'] });
        toast.success('Silakan cek status pembayaran Anda');
    };

    const quickAmounts = [50000, 100000, 250000, 500000, 1000000];

    if (walletLoading) {
        return (
            <div className="max-w-xl space-y-6 animate-fade-in">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="max-w-xl space-y-6 animate-fade-in">
            <Link
                to="/employer/wallet"
                className="inline-flex items-center gap-2 text-secondary-600 hover:text-primary-600 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Dompet
            </Link>

            <div>
                <h1 className="text-2xl font-bold text-secondary-900">Top Up Saldo</h1>
                <p className="text-secondary-600">Tambahkan saldo untuk membayar pekerja</p>
            </div>

            {/* Balance Card */}
            <Card className="bg-gradient-to-r from-accent-600 to-accent-700 text-white border-0">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-accent-100 mb-1">Saldo Saat Ini</p>
                            <p className="text-3xl font-bold">{formatCurrency(wallet?.balance || 0)}</p>
                        </div>
                        <Wallet className="w-10 h-10 text-accent-200" />
                    </div>
                </CardContent>
            </Card>

            {wallet?.status === 'SUSPENDED' && (
                <Card className="border-warning-200 bg-warning-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-warning-600" />
                            <p className="text-sm text-warning-800">
                                Dompet Anda sedang ditangguhkan. Hubungi admin untuk aktivasi.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Top Up Form */}
            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Quick Amount Buttons */}
                        <div>
                            <label className="text-sm font-medium text-secondary-700 block mb-3">Pilih Nominal</label>
                            <div className="grid grid-cols-3 gap-2">
                                {quickAmounts.map((amount) => (
                                    <button
                                        key={amount}
                                        type="button"
                                        onClick={() => {
                                            const input = document.getElementById('balance-input') as HTMLInputElement;
                                            if (input) {
                                                input.value = amount.toString();
                                                input.dispatchEvent(new Event('input', { bubbles: true }));
                                            }
                                        }}
                                        className="py-3 px-4 rounded-xl border border-secondary-200 hover:border-accent-500 hover:bg-accent-50 transition-colors text-sm font-medium"
                                    >
                                        {formatCurrency(amount)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Amount Input */}
                        <Input
                            {...register('balance', { valueAsNumber: true })}
                            id="balance-input"
                            type="number"
                            label="Atau Masukkan Nominal Lain"
                            placeholder="100000"
                            min={10000}
                            step={1000}
                            error={errors.balance?.message}
                        />

                        <div className="p-4 rounded-xl bg-secondary-50">
                            <div className="flex items-center gap-3 text-sm text-secondary-600">
                                <CreditCard className="w-5 h-5" />
                                <span>Pembayaran melalui Midtrans (Transfer Bank, E-Wallet, dll)</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={topUpMutation.isPending}
                            disabled={wallet?.status === 'SUSPENDED'}
                        >
                            Lanjutkan Pembayaran
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="font-medium text-secondary-900 mb-3">Informasi Top Up</h3>
                    <ul className="space-y-2 text-sm text-secondary-600">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                            Minimum top up Rp 10.000
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                            Saldo langsung masuk setelah pembayaran berhasil
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                            Mendukung berbagai metode pembayaran
                        </li>
                    </ul>
                </CardContent>
            </Card>

            {/* Payment Modal */}
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Lanjutkan Pembayaran"
            >
                <div className="space-y-4">
                    <p className="text-secondary-600">
                        Anda akan diarahkan ke halaman pembayaran Midtrans untuk menyelesaikan transaksi.
                    </p>

                    {paymentData && (
                        <div className="p-4 rounded-xl bg-accent-50 border border-accent-200">
                            <p className="text-sm text-accent-800 mb-3">
                                Klik tombol di bawah untuk membuka halaman pembayaran:
                            </p>
                            <a
                                href={paymentData.redirect_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-accent-600 font-medium hover:underline"
                            >
                                Buka Halaman Pembayaran
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setIsPaymentModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button className="flex-1" onClick={handlePaymentComplete}>
                            Saya Sudah Bayar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
