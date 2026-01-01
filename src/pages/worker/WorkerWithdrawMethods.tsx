import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { walletsService } from '../../api';
import { Card, CardContent, Button, Input, Select, Skeleton, EmptyState, Modal } from '../../components/ui';
import { ArrowLeft, CreditCard, Building2, Plus, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { WithdrawMethodData, CreateWithdrawMethodData } from '../../types';
import { BANK_PROVIDERS, EWALLET_PROVIDERS } from '../../types';

const methodSchema = z.object({
    method: z.enum(['BANK_TRANSFER', 'EWALLET'] as const),
    provider: z.string().min(1, 'Pilih provider'),
    account_name: z.string().min(3, 'Nama akun minimal 3 karakter'),
    account_number: z.string().min(5, 'Nomor akun minimal 5 karakter'),
});

type MethodFormData = z.infer<typeof methodSchema>;

export const WorkerWithdrawMethods: React.FC = () => {
    const queryClient = useQueryClient();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deleteMethod, setDeleteMethod] = useState<WithdrawMethodData | null>(null);

    // Fetch withdraw methods
    const { data, isLoading } = useQuery({
        queryKey: ['worker-withdraw-methods'],
        queryFn: () => walletsService.getWithdrawMethods(),
    });

    const methods = data?.data.withdraw_methods || [];

    // Add method form
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<MethodFormData>({
        resolver: zodResolver(methodSchema),
        defaultValues: {
            method: 'BANK_TRANSFER',
        },
    });

    const selectedMethod = watch('method');
    const providers = selectedMethod === 'BANK_TRANSFER' ? BANK_PROVIDERS : EWALLET_PROVIDERS;

    // Add method mutation
    const addMethodMutation = useMutation({
        mutationFn: (data: CreateWithdrawMethodData) => walletsService.addWithdrawMethod(data),
        onSuccess: () => {
            toast.success('Metode penarikan berhasil ditambahkan!');
            queryClient.invalidateQueries({ queryKey: ['worker-withdraw-methods'] });
            setIsAddModalOpen(false);
            reset();
        },
        onError: (error: any) => {
            const message = error.response?.data?.errors || 'Gagal menambahkan metode';
            toast.error(message);
        },
    });

    // Delete method mutation
    const deleteMethodMutation = useMutation({
        mutationFn: (methodId: number) => walletsService.deleteWithdrawMethod(methodId),
        onSuccess: () => {
            toast.success('Metode penarikan berhasil dihapus');
            queryClient.invalidateQueries({ queryKey: ['worker-withdraw-methods'] });
            setDeleteMethod(null);
        },
        onError: (error: any) => {
            const message = error.response?.data?.errors || 'Gagal menghapus metode';
            toast.error(message);
        },
    });

    const onSubmitMethod = (data: MethodFormData) => {
        addMethodMutation.mutate(data);
    };

    const handleDeleteConfirm = () => {
        if (deleteMethod) {
            deleteMethodMutation.mutate(deleteMethod.id);
        }
    };

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

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Metode Penarikan</h1>
                    <p className="text-secondary-600">Kelola rekening bank dan e-wallet Anda</p>
                </div>
                <Button leftIcon={Plus} onClick={() => setIsAddModalOpen(true)}>
                    Tambah Metode
                </Button>
            </div>

            {/* Methods List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                    ))}
                </div>
            ) : methods.length === 0 ? (
                <EmptyState
                    icon={CreditCard}
                    title="Belum Ada Metode Penarikan"
                    description="Tambahkan rekening bank atau e-wallet untuk menarik saldo Anda"
                    action={
                        <Button leftIcon={Plus} onClick={() => setIsAddModalOpen(true)}>
                            Tambah Metode
                        </Button>
                    }
                />
            ) : (
                <div className="space-y-4">
                    {methods.map((method) => (
                        <Card key={method.id}>
                            <CardContent className="p-5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method.method === 'BANK_TRANSFER'
                                            ? 'bg-gradient-to-br from-primary-100 to-primary-200'
                                            : 'bg-gradient-to-br from-success-100 to-success-200'
                                        }`}>
                                        {method.method === 'BANK_TRANSFER' ? (
                                            <Building2 className="w-6 h-6 text-primary-600" />
                                        ) : (
                                            <CreditCard className="w-6 h-6 text-success-600" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold text-secondary-900">{method.provider}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${method.method === 'BANK_TRANSFER'
                                                    ? 'bg-primary-100 text-primary-700'
                                                    : 'bg-success-100 text-success-700'
                                                }`}>
                                                {method.method === 'BANK_TRANSFER' ? 'Bank' : 'E-Wallet'}
                                            </span>
                                        </div>
                                        <p className="text-secondary-600">{method.account_name}</p>
                                        <p className="text-secondary-500 text-sm">{method.account_number}</p>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-danger-600 hover:bg-danger-50"
                                        onClick={() => setDeleteMethod(method)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <p className="text-sm text-secondary-500 text-center">
                        Maksimal 5 metode penarikan • {methods.length}/5 terpakai
                    </p>
                </div>
            )}

            {/* Add Method Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    reset();
                }}
                title="Tambah Metode Penarikan"
            >
                <form onSubmit={handleSubmit(onSubmitMethod)} className="space-y-4">
                    <Select
                        {...register('method')}
                        label="Tipe Metode"
                        options={[
                            { value: 'BANK_TRANSFER', label: 'Transfer Bank' },
                            { value: 'EWALLET', label: 'E-Wallet' },
                        ]}
                    />

                    <Select
                        {...register('provider')}
                        label="Provider"
                        options={[
                            { value: '', label: 'Pilih provider' },
                            ...providers.map((p) => ({ value: p, label: p })),
                        ]}
                        error={errors.provider?.message}
                    />

                    <Input
                        {...register('account_name')}
                        label="Nama Pemilik Akun"
                        placeholder="Nama sesuai rekening"
                        error={errors.account_name?.message}
                    />

                    <Input
                        {...register('account_number')}
                        label="Nomor Rekening/Akun"
                        placeholder="1234567890"
                        error={errors.account_number?.message}
                    />

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => {
                                setIsAddModalOpen(false);
                                reset();
                            }}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            isLoading={addMethodMutation.isPending}
                            disabled={methods.length >= 5}
                        >
                            Simpan
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteMethod}
                onClose={() => setDeleteMethod(null)}
                title="Hapus Metode Penarikan"
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-danger-100 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-danger-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                        Yakin ingin menghapus?
                    </h3>
                    <p className="text-secondary-600 mb-2">
                        Metode penarikan berikut akan dihapus:
                    </p>
                    {deleteMethod && (
                        <div className="bg-secondary-50 rounded-xl p-4 mb-6">
                            <p className="font-medium text-secondary-900">{deleteMethod.provider}</p>
                            <p className="text-secondary-600">{deleteMethod.account_name}</p>
                            <p className="text-secondary-500 text-sm">{deleteMethod.account_number}</p>
                        </div>
                    )}
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => setDeleteMethod(null)}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="primary"
                        className="flex-1 bg-danger-600 hover:bg-danger-700"
                        onClick={handleDeleteConfirm}
                        isLoading={deleteMethodMutation.isPending}
                    >
                        Hapus
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
