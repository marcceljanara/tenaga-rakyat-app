import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { usersService } from '../../api';
import { Card, CardContent, Button, Input, Textarea, Avatar } from '../../components/ui';
import { Camera, Trash2, Save, User, Mail, Phone, Link as LinkIcon } from 'lucide-react';
import { API_BASE_URL } from '../../api/axios';
import toast from 'react-hot-toast';

const profileSchema = z.object({
    full_name: z.string().min(3, 'Nama minimal 3 karakter'),
    about: z.string().optional(),
    cv_url: z.string().url('URL tidak valid').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const WorkerProfile: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: user?.full_name || '',
            about: user?.about || '',
            cv_url: user?.cv_url || '',
        },
    });

    const updateProfileMutation = useMutation({
        mutationFn: (data: ProfileFormData) =>
            usersService.updateProfile({
                full_name: data.full_name,
                about: data.about || undefined,
                cv_url: data.cv_url || undefined,
            }),
        onSuccess: () => {
            toast.success('Profil berhasil diperbarui!');
            refreshUser();
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Gagal memperbarui profil';
            toast.error(message);
        },
    });

    const onSubmit = (data: ProfileFormData) => {
        updateProfileMutation.mutate(data);
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ukuran file maksimal 5MB');
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('File harus berupa gambar');
            return;
        }

        setIsUploadingPhoto(true);
        try {
            await usersService.uploadProfilePicture(file);
            // Set preview lokal agar foto langsung tampil tanpa reload
            const previewUrl = URL.createObjectURL(file);
            setPhotoPreview(previewUrl);
            toast.success('Foto profil berhasil diperbarui!');
            refreshUser();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Gagal mengunggah foto';
            toast.error(message);
        } finally {
            setIsUploadingPhoto(false);
            // Reset input file agar bisa upload file yang sama
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDeletePhoto = async () => {
        setIsDeletingPhoto(true);
        try {
            await usersService.deleteProfilePicture();
            // Hapus preview lokal
            setPhotoPreview(null);
            toast.success('Foto profil berhasil dihapus');
            refreshUser();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Gagal menghapus foto';
            toast.error(message);
        } finally {
            setIsDeletingPhoto(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-6 animate-fade-in">
            {/* Profile Picture */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-secondary-900 mb-4">Foto Profil</h2>
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Avatar src={photoPreview || (user?.profile_picture_url ? API_BASE_URL + user.profile_picture_url : undefined)} size="xl" />
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />
                        </div>
                        <div className="space-y-2">
                            <Button
                                variant="secondary"
                                leftIcon={Camera}
                                onClick={() => fileInputRef.current?.click()}
                                isLoading={isUploadingPhoto}
                            >
                                Ubah Foto
                            </Button>
                            {user?.profile_picture_url && (
                                <Button
                                    variant="ghost"
                                    leftIcon={Trash2}
                                    onClick={handleDeletePhoto}
                                    isLoading={isDeletingPhoto}
                                    className="text-danger-600 hover:bg-danger-50"
                                >
                                    Hapus Foto
                                </Button>
                            )}
                            <p className="text-sm text-secondary-500">JPG, PNG atau GIF. Maks 5MB</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Profile Form */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-secondary-900 mb-4">Informasi Profil</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <User className="w-4 h-4 text-secondary-400" />
                                <label className="text-sm font-medium text-secondary-700">Nama Lengkap</label>
                            </div>
                            <Input
                                {...register('full_name')}
                                placeholder="Nama lengkap Anda"
                                error={errors.full_name?.message}
                            />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <Mail className="w-4 h-4 text-secondary-400" />
                                <label className="text-sm font-medium text-secondary-700">Email</label>
                            </div>
                            <Input value={user?.email || ''} disabled className="bg-secondary-50" />
                            <p className="text-sm text-secondary-500 mt-1">Email tidak dapat diubah langsung</p>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <Phone className="w-4 h-4 text-secondary-400" />
                                <label className="text-sm font-medium text-secondary-700">Telepon</label>
                            </div>
                            <Input value={user?.phone_number || ''} disabled className="bg-secondary-50" />
                        </div>

                        <Textarea
                            {...register('about')}
                            label="Tentang Saya"
                            placeholder="Ceritakan tentang diri Anda, keahlian, dan pengalaman kerja..."
                            rows={4}
                            error={errors.about?.message}
                        />

                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <LinkIcon className="w-4 h-4 text-secondary-400" />
                                <label className="text-sm font-medium text-secondary-700">Link CV/Portfolio</label>
                            </div>
                            <Input
                                {...register('cv_url')}
                                placeholder="https://contoh.com/cv-saya"
                                error={errors.cv_url?.message}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                leftIcon={Save}
                                isLoading={isSubmitting || updateProfileMutation.isPending}
                                disabled={!isDirty}
                            >
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
