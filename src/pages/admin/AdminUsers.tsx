import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../api';
import { Card, CardContent, Button, Badge, Skeleton, EmptyState } from '../../components/ui';
import { Users, Eye } from 'lucide-react';

export const AdminUsers: React.FC = () => {
    const navigate = useNavigate();
    const [roleFilter, setRoleFilter] = useState<string>('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', roleFilter],
        queryFn: () => adminService.getUsers(roleFilter ? { role: roleFilter } : undefined),
    });

    const { data: statsData } = useQuery({
        queryKey: ['admin-user-stats'],
        queryFn: () => adminService.getUserStats(),
    });

    const users = data?.data.users || [];
    const stats = statsData?.data;

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-secondary-900">Manajemen Pengguna</h1>
                <p className="text-secondary-600">Kelola semua pengguna platform</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                <StatCard label="Total Pengguna" value={stats?.total_users || 0} />
                <StatCard label="Pekerja" value={stats?.workers || 0} />
                <StatCard label="Pemberi Kerja" value={stats?.job_providers || 0} />
                <StatCard label="Email Terverifikasi" value={stats?.email_verified_users || 0} />
                <StatCard label="Belum Verifikasi" value={stats?.unverified_users || 0} />
                <StatCard label="Full Verified" value={stats?.full_verified_users || 0} />
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
                                            <Badge variant={user.role === 'PEKERJA' ? 'primary' : 'accent'}>
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={user.is_suspended ? 'danger' : 'success'}>
                                                {user.is_suspended ? 'Ditangguhkan' : 'Aktif'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button variant="ghost" size="sm" leftIcon={Eye} onClick={() => navigate(`/admin/users/${user.id}`)}>
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
