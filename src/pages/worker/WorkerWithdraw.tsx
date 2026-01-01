import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { walletsService } from '../../api';
import { Card, CardContent, Button, Input, Skeleton } from '../../components/ui';
import { ArrowLeft, Wallet, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils';
import toast from 'react-hot-toast';
import type { WithdrawMethodData } from '../../types';

const withdrawSchema = z.object({
    amount: z.number().min(10000, 'Minimum penarikan Rp 10.000'),
    method_id: z.number().min(1, 'Pilih metode penarikan'),
});

type WithdrawFormData = z.infer<typeof withdrawSchema>;

export const WorkerWithdraw: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [preview, setPreview] = useState<{ amount: number; fee: number; net: number; canWithdraw: boolean; reason: string } | null>(null);

    // Fetch wallet data
    const { data: walletData, isLoading: walletLoading } = useQuery({
        queryKey: ['worker-wallet'],
        queryFn: () => walletsService.getWallet(),
    });

    // Fetch withdraw methods
    const { data: methodsData, isLoading: methodsLoading } = useQuery({
        queryKey: ['worker-withdraw-methods'],
        queryFn: () => walletsService.getWithdrawMethods(),
    });

    const wallet = walletData?.data;
    const methods = methodsData?.data.withdraw_methods || [];

    // Withdraw form
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<WithdrawFormData>({
        resolver: zodResolver(withdrawSchema),
        defaultValues: {
            amount: 50000,
        },
    });

    const selectedMethodId = watch('method_id');
    const amount = watch('amount');

    // Preview mutation
    const previewMutation = useMutation({
        mutationFn: ({ amount, methodId }: { amount: number; methodId: number }) =>
            walletsService.previewWithdraw(amount, methodId),
        onSuccess: (response) => {
            const data = response.data;
            setPreview({
                amount: parseFloat(data.amount_requested),
                fee: parseFloat(data.fee_charged),
                net: parseFloat(data.net_amount),
                canWithdraw: data.can_withdraw,
                reason: data.reason,
            });
        },
        onError: (error: any) => {
            const message = error.response?.data?.errors || 'Gagal menghitung preview';
            toast.error(message);
            setPreview(null);
        },
    });

    // Create withdraw request mutation
    const withdrawMutation = useMutation({
        mutationFn: (data: WithdrawFormData) =>
            walletsService.createWithdrawRequest({
                amount: data.amount,
                method_id: data.method_id,
            }),
        onSuccess: () => {
            toast.success('Permintaan penarikan berhasil dibuat!');
            queryClient.invalidateQueries({ queryKey: ['worker-wallet'] });
            queryClient.invalidateQueries({ queryKey: ['worker-withdraw-requests'] });
            navigate('/worker/wallet');
        },
        onError: (error: any) => {
            const message = error.response?.data?.errors || 'Gagal membuat permintaan penarikan';
            toast.error(message);
        },
    });

    const handlePreview = () => {
        if (amount >= 10000 && selectedMethodId) {
            previewMutation.mutate({ amount, methodId: selectedMethodId });
        }
    };

    const onSubmitWithdraw = (data: WithdrawFormData) => {
        if (!preview) {
            toast.error('Silakan hitung preview terlebih dahulu');
            return;
        }
        withdrawMutation.mutate(data);
    };

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
                to="/worker/wallet"
                className="inline-flex items-center gap-2 text-secondary-600 hover:text-primary-600 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Dompet
            </Link>

            <div>
                <h1 className="text-2xl font-bold text-secondary-900">Tarik Saldo</h1>
                <p className="text-secondary-600">Tarik saldo ke rekening bank atau e-wallet</p>
            </div>

            {/* Balance Card */}
            <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white border-0">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-primary-100 mb-1">Saldo Tersedia</p>
                            <p className="text-3xl font-bold">{formatCurrency(wallet?.balance || 0)}</p>
                        </div>
                        <Wallet className="w-10 h-10 text-primary-200" />
                    </div>
                </CardContent>
            </Card>

            {/* Withdraw Form */}
            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmitWithdraw)} className="space-y-5">
                        {/* Method Selection */}
                        <div>
                            <label className="text-sm font-medium text-secondary-700 block mb-2">Metode Penarikan</label>

                            {methodsLoading ? (
                                <Skeleton className="h-12 w-full rounded-xl" />
                            ) : methods.length === 0 ? (
                                <div className="p-4 rounded-xl bg-warning-50 border border-warning-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <AlertCircle className="w-5 h-5 text-warning-600" />
                                        <p className="text-sm text-warning-800">
                                            Belum ada metode penarikan.
                                        </p>
                                    </div>
                                    <Link to="/worker/wallet/methods">
                                        <Button size="sm" variant="secondary">
                                            Tambah Metode Penarikan
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <select
                                    {...register('method_id', { valueAsNumber: true })}
                                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">Pilih metode</option>
                                    {methods.map((method: WithdrawMethodData) => (
                                        <option key={method.id} value={method.id}>
                                            {method.provider} - {method.account_name} ({method.account_number})
                                        </option>
                                    ))}
                                </select>
                            )}
                            {errors.method_id && (
                                <p className="text-sm text-danger-600 mt-1">{errors.method_id.message}</p>
                            )}
                        </div>

                        {/* Amount */}
                        <Input
                            {...register('amount', { valueAsNumber: true })}
                            type="number"
                            label="Jumlah Penarikan (Rp)"
                            placeholder="50000"
                            error={errors.amount?.message}
                        />

                        {/* Preview Button */}
                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full"
                            onClick={handlePreview}
                            isLoading={previewMutation.isPending}
                            disabled={!selectedMethodId || amount < 10000}
                        >
                            Hitung Biaya
                        </Button>

                        {/* Preview Result */}
                        {preview && (
                            <div className={`p-4 rounded-xl space-y-2 ${preview.canWithdraw ? 'bg-secondary-50' : 'bg-danger-50 border border-danger-200'}`}>
                                {!preview.canWithdraw && (
                                    <div className="flex items-center gap-2 text-danger-600 mb-3">
                                        <AlertCircle className="w-5 h-5" />
                                        <span className="font-medium">{preview.reason}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-secondary-600">Jumlah Penarikan</span>
                                    <span className="font-medium">{formatCurrency(preview.amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary-600">Biaya Admin</span>
                                    <span className="font-medium text-danger-600">- {formatCurrency(preview.fee)}</span>
                                </div>
                                <div className="border-t border-secondary-200 pt-2 flex justify-between">
                                    <span className="font-medium text-secondary-900">Yang Diterima</span>
                                    <span className="font-bold text-success-600">{formatCurrency(preview.net)}</span>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={withdrawMutation.isPending}
                            disabled={!preview || !preview.canWithdraw || methods.length === 0}
                        >
                            Ajukan Penarikan
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
