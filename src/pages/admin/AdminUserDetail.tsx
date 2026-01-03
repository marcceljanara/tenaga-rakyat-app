import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../api';
import { Card, CardContent, Button, Badge, Skeleton, Modal, Input } from '../../components/ui';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    Shield,
    Wallet,
    Trash2,
    Ban,
    CheckCircle,
    ShieldCheck,
    AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils';
import type { VerificationStatus } from '../../types';

type ConfirmAction =
    | 'delete'
    | 'suspend_account'
    | 'activate_account'
    | 'suspend_wallet'
    | 'activate_wallet'
    | 'update_verification'
    | null;

const VERIFICATION_OPTIONS: { value: VerificationStatus; label: string }[] = [
    { value: 'UNVERIFIED', label: 'Belum Verifikasi' },
    { value: 'EMAIL_VERIFIED', label: 'Email Terverifikasi' },
    { value: 'FULL_VERIFIED', label: 'Terverifikasi Penuh' },
];

export const AdminUserDetail: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
    const [walletSuspendReason, setWalletSuspendReason] = useState('');
    const [selectedVerificationStatus, setSelectedVerificationStatus] = useState<VerificationStatus>('UNVERIFIED');

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-user-detail', userId],
        queryFn: () => adminService.getUserDetail(userId!),
        enabled: !!userId,
    });

    const user = data?.data;

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: () => adminService.deleteUser(userId!),
        onSuccess: () => {
            toast.success('User berhasil dihapus');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            navigate('/admin/users');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal menghapus user');
        },
    });

    const suspendAccountMutation = useMutation({
        mutationFn: () => adminService.suspendAccount(userId!),
        onSuccess: () => {
            toast.success('Akun berhasil ditangguhkan');
            queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] });
            setConfirmAction(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal menangguhkan akun');
        },
    });

    const activateAccountMutation = useMutation({
        mutationFn: () => adminService.activateAccount(userId!),
        onSuccess: () => {
            toast.success('Akun berhasil diaktifkan');
            queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] });
            setConfirmAction(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal mengaktifkan akun');
        },
    });

    const suspendWalletMutation = useMutation({
        mutationFn: () => adminService.suspendWallet(userId!, walletSuspendReason),
        onSuccess: () => {
            toast.success('Wallet berhasil ditangguhkan');
            queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] });
            setConfirmAction(null);
            setWalletSuspendReason('');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal menangguhkan wallet');
        },
    });

    const activateWalletMutation = useMutation({
        mutationFn: () => adminService.activateWallet(userId!),
        onSuccess: () => {
            toast.success('Wallet berhasil diaktifkan');
            queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] });
            setConfirmAction(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal mengaktifkan wallet');
        },
    });

    const updateVerificationMutation = useMutation({
        mutationFn: () => adminService.updateVerification(userId!, selectedVerificationStatus),
        onSuccess: () => {
            toast.success('Status verifikasi berhasil diperbarui');
            queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] });
            setConfirmAction(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal memperbarui status verifikasi');
        },
    });

    const handleConfirmAction = () => {
        switch (confirmAction) {
            case 'delete':
                deleteMutation.mutate();
                break;
            case 'suspend_account':
                suspendAccountMutation.mutate();
                break;
            case 'activate_account':
                activateAccountMutation.mutate();
                break;
            case 'suspend_wallet':
                if (!walletSuspendReason.trim()) {
                    toast.error('Alasan penangguhan wallet wajib diisi');
                    return;
                }
                suspendWalletMutation.mutate();
                break;
            case 'activate_wallet':
                activateWalletMutation.mutate();
                break;
            case 'update_verification':
                updateVerificationMutation.mutate();
                break;
        }
    };

    const getConfirmModalContent = () => {
        switch (confirmAction) {
            case 'delete':
                return {
                    title: 'Hapus User',
                    description: 'Apakah Anda yakin ingin menghapus user ini? Data akan dianonimkan dan tidak dapat dikembalikan.',
                    confirmText: 'Ya, Hapus',
                    variant: 'danger' as const,
                    isLoading: deleteMutation.isPending,
                };
            case 'suspend_account':
                return {
                    title: 'Tangguhkan Akun',
                    description: 'Apakah Anda yakin ingin menangguhkan akun ini? User tidak akan bisa mengakses platform.',
                    confirmText: 'Ya, Tangguhkan',
                    variant: 'danger' as const,
                    isLoading: suspendAccountMutation.isPending,
                };
            case 'activate_account':
                return {
                    title: 'Aktifkan Akun',
                    description: 'Apakah Anda yakin ingin mengaktifkan kembali akun ini?',
                    confirmText: 'Ya, Aktifkan',
                    variant: 'primary' as const,
                    isLoading: activateAccountMutation.isPending,
                };
            case 'suspend_wallet':
                return {
                    title: 'Tangguhkan Wallet',
                    description: 'Apakah Anda yakin ingin menangguhkan wallet user ini? User tidak akan bisa melakukan transaksi.',
                    confirmText: 'Ya, Tangguhkan',
                    variant: 'danger' as const,
                    isLoading: suspendWalletMutation.isPending,
                    showReasonInput: true,
                };
            case 'activate_wallet':
                return {
                    title: 'Aktifkan Wallet',
                    description: 'Apakah Anda yakin ingin mengaktifkan kembali wallet user ini?',
                    confirmText: 'Ya, Aktifkan',
                    variant: 'primary' as const,
                    isLoading: activateWalletMutation.isPending,
                };
            case 'update_verification':
                return {
                    title: 'Ubah Status Verifikasi',
                    description: 'Pilih status verifikasi baru untuk user ini.',
                    confirmText: 'Simpan',
                    variant: 'primary' as const,
                    isLoading: updateVerificationMutation.isPending,
                    showVerificationSelect: true,
                };
            default:
                return null;
        }
    };

    const modalContent = getConfirmModalContent();

    // Determine button visibility based on user state
    const isAccountSuspended = user?.is_suspended === true;
    const isWalletSuspended = user?.wallet?.status === 'SUSPENDED' || user?.wallet?.status === 'CLOSED';

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

    if (error || !user) {
        return (
            <div className="text-center py-12">
                <p className="text-secondary-500">User tidak ditemukan</p>
                <Button variant="ghost" onClick={() => navigate('/admin/users')} className="mt-4">
                    Kembali ke Daftar User
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Detail Pengguna</h1>
                    <p className="text-secondary-600">Kelola informasi dan akses pengguna</p>
                </div>
            </div>

            {/* User Info Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                            <User className="w-10 h-10 text-white" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-secondary-500 flex items-center gap-1.5">
                                    <User className="w-4 h-4" /> Nama Lengkap
                                </p>
                                <p className="font-medium text-secondary-900">{user.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary-500 flex items-center gap-1.5">
                                    <Mail className="w-4 h-4" /> Email
                                </p>
                                <p className="font-medium text-secondary-900">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary-500 flex items-center gap-1.5">
                                    <Phone className="w-4 h-4" /> Telepon
                                </p>
                                <p className="font-medium text-secondary-900">{user.phone_number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary-500 flex items-center gap-1.5">
                                    <Shield className="w-4 h-4" /> Role
                                </p>
                                <Badge variant={user.role === 'PEKERJA' ? 'primary' : 'accent'}>
                                    {user.role}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-secondary-500 flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4" /> Status Verifikasi
                                </p>
                                <Badge
                                    variant={
                                        user.verification_status === 'FULL_VERIFIED' ? 'success' :
                                            user.verification_status === 'EMAIL_VERIFIED' ? 'accent' : 'secondary'
                                    }
                                >
                                    {user.verification_status === 'FULL_VERIFIED' ? 'Terverifikasi Penuh' :
                                        user.verification_status === 'EMAIL_VERIFIED' ? 'Email Terverifikasi' : 'Belum Verifikasi'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-secondary-500 flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" /> Terdaftar
                                </p>
                                <p className="font-medium text-secondary-900">{formatDate(user.created_at)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-secondary-200">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-secondary-500">Status Akun:</span>
                            <Badge variant={user.is_suspended ? 'danger' : 'success'}>
                                {user.is_suspended ? 'Ditangguhkan' : 'Aktif'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-secondary-500">Status Hapus:</span>
                            <Badge variant={user.is_deleted ? 'danger' : 'success'}>
                                {user.is_deleted ? 'Dihapus' : 'Aktif'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Wallet Info Card */}
            {user.wallet && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                            <Wallet className="w-5 h-5" /> Informasi Wallet
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-secondary-500">ID Wallet</p>
                                <p className="font-medium text-secondary-900">{user.wallet.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary-500">Saldo</p>
                                <p className="font-medium text-secondary-900">
                                    Rp {Number(user.wallet.balance).toLocaleString('id-ID')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary-500">Status Wallet</p>
                                <Badge
                                    variant={
                                        user.wallet.status === 'ACTIVE' ? 'success' :
                                            user.wallet.status === 'SUSPENDED' ? 'accent' : 'danger'
                                    }
                                >
                                    {user.wallet.status === 'ACTIVE' ? 'Aktif' :
                                        user.wallet.status === 'SUSPENDED' ? 'Ditangguhkan' : 'Ditutup'}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Actions Card */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Aksi Manajemen
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Update Verification - Always visible when account is not suspended */}
                        {!isAccountSuspended && (
                            <Button
                                variant="secondary"
                                leftIcon={ShieldCheck}
                                onClick={() => {
                                    setSelectedVerificationStatus(user.verification_status || 'UNVERIFIED');
                                    setConfirmAction('update_verification');
                                }}
                                className="justify-start"
                            >
                                Ubah Status Verifikasi
                            </Button>
                        )}

                        {/* Suspend Account - Only when account is NOT suspended */}
                        {!isAccountSuspended && (
                            <Button
                                variant="danger"
                                leftIcon={Ban}
                                onClick={() => setConfirmAction('suspend_account')}
                                className="justify-start"
                            >
                                Tangguhkan Akun
                            </Button>
                        )}

                        {/* Activate Account - Only when account IS suspended */}
                        {isAccountSuspended && (
                            <Button
                                variant="primary"
                                leftIcon={CheckCircle}
                                onClick={() => setConfirmAction('activate_account')}
                                className="justify-start"
                            >
                                Aktifkan Akun
                            </Button>
                        )}

                        {/* Suspend Wallet - Only when account is NOT suspended AND wallet is NOT suspended */}
                        {!isAccountSuspended && !isWalletSuspended && user.wallet && (
                            <Button
                                variant="secondary"
                                leftIcon={Wallet}
                                onClick={() => setConfirmAction('suspend_wallet')}
                                className="justify-start bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
                            >
                                Tangguhkan Wallet
                            </Button>
                        )}

                        {/* Activate Wallet - Only when account is NOT suspended AND wallet IS suspended */}
                        {!isAccountSuspended && isWalletSuspended && user.wallet && (
                            <Button
                                variant="secondary"
                                leftIcon={Wallet}
                                onClick={() => setConfirmAction('activate_wallet')}
                                className="justify-start"
                            >
                                Aktifkan Wallet
                            </Button>
                        )}

                        {/* Delete User - Always visible */}
                        <Button
                            variant="danger"
                            leftIcon={Trash2}
                            onClick={() => setConfirmAction('delete')}
                            className="justify-start"
                        >
                            Hapus User
                        </Button>
                    </div>

                    <p className="text-sm text-secondary-500 mt-4">
                        * Semua aksi akan memerlukan konfirmasi sebelum dijalankan.
                    </p>
                </CardContent>
            </Card>

            {/* Confirmation Modal */}
            <Modal
                isOpen={confirmAction !== null}
                onClose={() => {
                    setConfirmAction(null);
                    setWalletSuspendReason('');
                }}
                title={modalContent?.title || ''}
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-secondary-600">{modalContent?.description}</p>

                    {/* Reason input for wallet suspension */}
                    {modalContent?.showReasonInput && (
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Alasan Penangguhan <span className="text-danger-500">*</span>
                            </label>
                            <Input
                                value={walletSuspendReason}
                                onChange={(e) => setWalletSuspendReason(e.target.value)}
                                placeholder="Masukkan alasan penangguhan wallet..."
                            />
                        </div>
                    )}

                    {/* Verification status select */}
                    {modalContent?.showVerificationSelect && (
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Status Verifikasi
                            </label>
                            <select
                                value={selectedVerificationStatus}
                                onChange={(e) => setSelectedVerificationStatus(e.target.value as VerificationStatus)}
                                className="w-full px-4 py-2.5 rounded-xl border border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                            >
                                {VERIFICATION_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex gap-3 justify-end pt-4">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setConfirmAction(null);
                                setWalletSuspendReason('');
                            }}
                        >
                            Batal
                        </Button>
                        <Button
                            variant={modalContent?.variant || 'primary'}
                            onClick={handleConfirmAction}
                            isLoading={modalContent?.isLoading}
                        >
                            {modalContent?.confirmText}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
