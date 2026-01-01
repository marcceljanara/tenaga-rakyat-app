import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../api';
import { Card, CardContent, Button, Badge, Skeleton, EmptyState, Modal } from '../../components/ui';
import { Users, Eye, Ban, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { User } from '../../types';

export const AdminUsers: React.FC = () => {
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', roleFilter],
        queryFn: () => adminService.getUsers(roleFilter ? { role: roleFilter } : undefined),
    });

    const { data: statsData } = useQuery({
        queryKey: ['admin-user-stats'],
        queryFn: () => adminService.getUserStats(),
    });

    const users = (data?.data as User[]) || [];
    const stats = statsData?.data;

    const suspendMutation = useMutation({
        mutationFn: (userId: string) => adminService.suspendAccount(userId),
        onSuccess: () => {
            toast.success('Akun berhasil ditangguhkan');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setIsDetailModalOpen(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal menangguhkan akun');
        },
    });

    const activateMutation = useMutation({
        mutationFn: (userId: string) => adminService.activateAccount(userId),
        onSuccess: () => {
            toast.success('Akun berhasil diaktifkan');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setIsDetailModalOpen(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal mengaktifkan akun');
        },
    });

    const openDetail = (user: User) => {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-secondary-900">Manajemen Pengguna</h1>
                <p className="text-secondary-600">Kelola semua pengguna platform</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total" value={stats?.total_users || 0} />
                <StatCard label="Pekerja" value={stats?.total_workers || 0} />
                <StatCard label="Pemberi Kerja" value={stats?.total_employers || 0} />
                <StatCard label="Terverifikasi" value={stats?.verified_users || 0} />
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={roleFilter === '' ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setRoleFilter('')}
                        >
                            Semua
                        </Button>
                        <Button
                            variant={roleFilter === 'PEKERJA' ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setRoleFilter('PEKERJA')}
                        >
                            Pekerja
                        </Button>
                        <Button
                            variant={roleFilter === 'PEMBERI_KERJA' ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setRoleFilter('PEMBERI_KERJA')}
                        >
                            Pemberi Kerja
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary-50 border-b border-secondary-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Nama</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Email</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Role</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-40" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-48" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-8 w-24" /></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12">
                                        <EmptyState
                                            icon={Users}
                                            title="Tidak Ada Pengguna"
                                            description="Tidak ada pengguna yang ditemukan"
                                        />
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-secondary-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-secondary-900">{user.full_name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-secondary-600">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={user.role.name === 'PEKERJA' ? 'primary' : 'accent'}>
                                                {user.role.name}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={user.is_active ? 'success' : 'danger'}>
                                                {user.is_active ? 'Aktif' : 'Suspended'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button variant="ghost" size="sm" leftIcon={Eye} onClick={() => openDetail(user)}>
                                                Detail
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* User Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Detail Pengguna"
                size="lg"
            >
                {selectedUser && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-secondary-500">Nama</p>
                                <p className="font-medium">{selectedUser.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary-500">Email</p>
                                <p className="font-medium">{selectedUser.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary-500">Telepon</p>
                                <p className="font-medium">{selectedUser.phone_number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary-500">Role</p>
                                <Badge variant={selectedUser.role.name === 'PEKERJA' ? 'primary' : 'accent'}>
                                    {selectedUser.role.name}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-secondary-500">Status Akun</p>
                                <Badge variant={selectedUser.is_active ? 'success' : 'danger'}>
                                    {selectedUser.is_active ? 'Aktif' : 'Suspended'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-secondary-500">Email Terverifikasi</p>
                                <Badge variant={selectedUser.email_verified ? 'success' : 'warning'}>
                                    {selectedUser.email_verified ? 'Terverifikasi' : 'Belum Verifikasi'}
                                </Badge>
                            </div>
                        </div>

                        <hr className="border-secondary-200" />

                        <div className="flex gap-3">
                            {selectedUser.is_active ? (
                                <Button
                                    variant="danger"
                                    leftIcon={Ban}
                                    onClick={() => suspendMutation.mutate(selectedUser.id)}
                                    isLoading={suspendMutation.isPending}
                                >
                                    Tangguhkan Akun
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    leftIcon={CheckCircle}
                                    onClick={() => activateMutation.mutate(selectedUser.id)}
                                    isLoading={activateMutation.isPending}
                                >
                                    Aktifkan Akun
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const StatCard: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <Card>
        <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-secondary-900">{value.toLocaleString()}</p>
            <p className="text-sm text-secondary-500">{label}</p>
        </CardContent>
    </Card>
);
