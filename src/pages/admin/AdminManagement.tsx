import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminService } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import {
    Card,
    CardContent,
    Button,
    Input,
    Skeleton,
    EmptyState,
    Modal,
    Avatar,
    Badge,
} from '../../components/ui';
import { UserPlus, Users, Trash2, Key, Edit, Shield, ShieldCheck } from 'lucide-react';
import { formatDateTime } from '../../utils';
import toast from 'react-hot-toast';
import { handleApiError } from '../../utils';
import type { Admin, CreateAdminData, UpdateAdminData } from '../../types';

const createAdminSchema = z.object({
    full_name: z.string().min(3, 'Nama minimal 3 karakter'),
    email: z.string().email('Email tidak valid'),
    phone_number: z.string().min(10, 'Nomor telepon minimal 10 karakter'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
});

const updateAdminSchema = z.object({
    full_name: z.string().min(3, 'Nama minimal 3 karakter'),
    email: z.string().email('Email tidak valid'),
    phone_number: z.string().min(10, 'Nomor telepon minimal 10 karakter'),
});

const passwordSchema = z.object({
    new_password: z.string().min(8, 'Password minimal 8 karakter'),
    confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
    message: 'Password tidak cocok',
    path: ['confirm_password'],
});

type CreateAdminFormData = z.infer<typeof createAdminSchema>;
type UpdateAdminFormData = z.infer<typeof updateAdminSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export const AdminManagement: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

    // Only Super Admin can access this page
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    // Fetch admins
    const { data, isLoading } = useQuery({
        queryKey: ['admins'],
        queryFn: () => adminService.getAdmins(),
        enabled: isSuperAdmin,
    });

    const admins = data?.data.admins || [];

    // Create form
    const createForm = useForm<CreateAdminFormData>({
        resolver: zodResolver(createAdminSchema),
    });

    // Update form
    const updateForm = useForm<UpdateAdminFormData>({
        resolver: zodResolver(updateAdminSchema),
    });

    // Password form
    const passwordForm = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateAdminData) => adminService.createAdmin(data),
        onSuccess: () => {
            toast.success('Admin berhasil dibuat!');
            queryClient.invalidateQueries({ queryKey: ['admins'] });
            setIsCreateModalOpen(false);
            createForm.reset();
        },
        onError: (error: any) => {
            handleApiError(error, 'Gagal membuat admin', createForm.setError);
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAdminData }) => adminService.updateAdmin(id, data),
        onSuccess: () => {
            toast.success('Admin berhasil diperbarui!');
            queryClient.invalidateQueries({ queryKey: ['admins'] });
            setIsEditModalOpen(false);
        },
        onError: (error: any) => {
            handleApiError(error, 'Gagal memperbarui admin', updateForm.setError);
        },
    });

    // Password mutation
    const passwordMutation = useMutation({
        mutationFn: ({ id, password }: { id: string; password: string }) =>
            adminService.changeAdminPassword(id, password),
        onSuccess: () => {
            toast.success('Password berhasil diubah!');
            setIsPasswordModalOpen(false);
            passwordForm.reset();
        },
        onError: (error: any) => {
            handleApiError(error, 'Gagal mengubah password', passwordForm.setError);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminService.deleteAdmin(id),
        onSuccess: () => {
            toast.success('Admin berhasil dihapus!');
            queryClient.invalidateQueries({ queryKey: ['admins'] });
            setIsDeleteModalOpen(false);
        },
        onError: (error: any) => {
            handleApiError(error, 'Gagal menghapus admin');
        },
    });

    const handleEdit = (admin: Admin) => {
        setSelectedAdmin(admin);
        updateForm.reset({
            full_name: admin.full_name,
            email: admin.email,
            phone_number: admin.phone_number,
        });
        setIsEditModalOpen(true);
    };

    const handlePassword = (admin: Admin) => {
        setSelectedAdmin(admin);
        passwordForm.reset();
        setIsPasswordModalOpen(true);
    };

    const handleDelete = (admin: Admin) => {
        setSelectedAdmin(admin);
        setIsDeleteModalOpen(true);
    };

    if (!isSuperAdmin) {
        return (
            <div className="text-center py-16">
                <Shield className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-secondary-900 mb-2">Akses Ditolak</h2>
                <p className="text-secondary-600">Hanya Super Admin yang dapat mengakses halaman ini.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Manajemen Admin</h1>
                    <p className="text-secondary-600">Kelola akun administrator platform</p>
                </div>
                <Button leftIcon={UserPlus} onClick={() => setIsCreateModalOpen(true)}>
                    Tambah Admin
                </Button>
            </div>

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-48 w-full rounded-2xl" />
                    ))}
                </div>
            ) : admins.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="Belum Ada Admin"
                    description="Tambahkan admin untuk membantu mengelola platform"
                    action={
                        <Button leftIcon={UserPlus} onClick={() => setIsCreateModalOpen(true)}>
                            Tambah Admin
                        </Button>
                    }
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {admins.map((admin) => (
                        <Card key={admin.id}>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <Avatar size="lg" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-secondary-900 truncate">{admin.full_name}</p>
                                        <p className="text-sm text-secondary-500 truncate">{admin.email}</p>
                                        <Badge
                                            variant={admin.role.name === 'SUPER_ADMIN' ? 'primary' : 'secondary'}
                                            className="mt-2"
                                        >
                                            {admin.role.name === 'SUPER_ADMIN' ? (
                                                <>
                                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                                    Super Admin
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="w-3 h-3 mr-1" />
                                                    Admin
                                                </>
                                            )}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="text-sm text-secondary-500 mb-4">
                                    <p>📞 {admin.phone_number}</p>
                                    <p className="mt-1">Dibuat: {formatDateTime(admin.created_at)}</p>
                                </div>

                                {admin.id !== user?.id && (
                                    <div className="flex gap-2 pt-3 border-t border-secondary-100">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(admin)}
                                            className="flex-1"
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handlePassword(admin)}
                                            className="flex-1"
                                        >
                                            <Key className="w-4 h-4 mr-1" />
                                            Password
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(admin)}
                                            className="text-danger-600 hover:bg-danger-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Tambah Admin Baru">
                <form onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                    <Input
                        {...createForm.register('full_name')}
                        label="Nama Lengkap"
                        placeholder="John Doe"
                        error={createForm.formState.errors.full_name?.message}
                    />
                    <Input
                        {...createForm.register('email')}
                        type="email"
                        label="Email"
                        placeholder="admin@example.com"
                        error={createForm.formState.errors.email?.message}
                    />
                    <Input
                        {...createForm.register('phone_number')}
                        label="Nomor Telepon"
                        placeholder="+628123456789"
                        error={createForm.formState.errors.phone_number?.message}
                    />
                    <Input
                        {...createForm.register('password')}
                        type="password"
                        label="Password"
                        placeholder="Min. 8 karakter"
                        error={createForm.formState.errors.password?.message}
                    />
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setIsCreateModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" className="flex-1" isLoading={createMutation.isPending}>
                            Buat Admin
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Admin">
                <form
                    onSubmit={updateForm.handleSubmit((data) =>
                        updateMutation.mutate({ id: selectedAdmin!.id, data })
                    )}
                    className="space-y-4"
                >
                    <Input
                        {...updateForm.register('full_name')}
                        label="Nama Lengkap"
                        error={updateForm.formState.errors.full_name?.message}
                    />
                    <Input
                        {...updateForm.register('email')}
                        type="email"
                        label="Email"
                        error={updateForm.formState.errors.email?.message}
                    />
                    <Input
                        {...updateForm.register('phone_number')}
                        label="Nomor Telepon"
                        error={updateForm.formState.errors.phone_number?.message}
                    />
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" className="flex-1" isLoading={updateMutation.isPending}>
                            Simpan
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Password Modal */}
            <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Ubah Password">
                <form
                    onSubmit={passwordForm.handleSubmit((data) =>
                        passwordMutation.mutate({ id: selectedAdmin!.id, password: data.new_password })
                    )}
                    className="space-y-4"
                >
                    <p className="text-secondary-600">
                        Ubah password untuk <strong>{selectedAdmin?.full_name}</strong>
                    </p>
                    <Input
                        {...passwordForm.register('new_password')}
                        type="password"
                        label="Password Baru"
                        placeholder="Min. 8 karakter"
                        error={passwordForm.formState.errors.new_password?.message}
                    />
                    <Input
                        {...passwordForm.register('confirm_password')}
                        type="password"
                        label="Konfirmasi Password"
                        error={passwordForm.formState.errors.confirm_password?.message}
                    />
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setIsPasswordModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" className="flex-1" isLoading={passwordMutation.isPending}>
                            Ubah Password
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Hapus Admin">
                <p className="text-secondary-600 mb-6">
                    Apakah Anda yakin ingin menghapus admin <strong>{selectedAdmin?.full_name}</strong>? Tindakan ini
                    tidak dapat dibatalkan.
                </p>
                <div className="flex gap-3 justify-end">
                    <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                        Batal
                    </Button>
                    <Button
                        className="bg-danger-600 hover:bg-danger-700"
                        onClick={() => deleteMutation.mutate(selectedAdmin!.id)}
                        isLoading={deleteMutation.isPending}
                    >
                        Hapus
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
