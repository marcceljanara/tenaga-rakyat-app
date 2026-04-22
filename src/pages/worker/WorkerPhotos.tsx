import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usersService } from '../../api';
import { Card, CardContent, Button, Textarea, Skeleton, EmptyState, Modal } from '../../components/ui';
import {
    Image,
    Plus,
    Trash2,
    AlertTriangle,
    Upload,
    X,
    Edit3,
    ZoomIn,
    Calendar,
    FileImage,
    Check,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { UserPhoto } from '../../types';
import { API_BASE_URL } from '../../api/axios';

// Validation schemas
const uploadSchema = z.object({
    description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),
});

const editSchema = z.object({
    description: z.string().max(500, 'Deskripsi maksimal 500 karakter'),
});

type UploadFormData = z.infer<typeof uploadSchema>;
type EditFormData = z.infer<typeof editSchema>;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const WorkerPhotos: React.FC = () => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modal states
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [editPhoto, setEditPhoto] = useState<UserPhoto | null>(null);
    const [deletePhoto, setDeletePhoto] = useState<UserPhoto | null>(null);
    const [previewPhoto, setPreviewPhoto] = useState<UserPhoto | null>(null);

    // Upload states
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Fetch photos
    const { data, isLoading, error } = useQuery({
        queryKey: ['worker-photos'],
        queryFn: () => usersService.getPhotos(),
    });

    const photos = data?.data || [];

    // Upload form
    const uploadForm = useForm<UploadFormData>({
        resolver: zodResolver(uploadSchema),
        defaultValues: { description: '' },
    });

    // Edit form
    const editForm = useForm<EditFormData>({
        resolver: zodResolver(editSchema),
        defaultValues: { description: '' },
    });

    // Upload mutation
    const uploadMutation = useMutation({
        mutationFn: ({ file, description }: { file: File; description: string }) =>
            usersService.uploadPhoto(file, description),
        onSuccess: () => {
            toast.success('Foto berhasil diunggah!');
            queryClient.invalidateQueries({ queryKey: ['worker-photos'] });
            handleCloseUploadModal();
        },
        onError: (error: any) => {
            const message = error.response?.data?.errors || 'Gagal mengunggah foto';
            toast.error(message);
        },
    });

    // Edit mutation
    const editMutation = useMutation({
        mutationFn: ({ photoId, description }: { photoId: number; description: string }) =>
            usersService.updatePhoto(photoId, description),
        onSuccess: () => {
            toast.success('Deskripsi foto berhasil diperbarui!');
            queryClient.invalidateQueries({ queryKey: ['worker-photos'] });
            setEditPhoto(null);
            editForm.reset();
        },
        onError: (error: any) => {
            const message = error.response?.data?.errors || 'Gagal memperbarui deskripsi';
            toast.error(message);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (photoId: number) => usersService.deletePhoto(photoId),
        onSuccess: () => {
            toast.success('Foto berhasil dihapus');
            queryClient.invalidateQueries({ queryKey: ['worker-photos'] });
            setDeletePhoto(null);
            // Close preview if the deleted photo was being previewed
            if (previewPhoto && previewPhoto.id === deletePhoto?.id) {
                setPreviewPhoto(null);
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.errors || 'Gagal menghapus foto';
            toast.error(message);
        },
    });

    // File handling
    const validateFile = (file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return 'Format file tidak didukung. Gunakan JPEG, PNG, atau WebP';
        }
        if (file.size > MAX_FILE_SIZE) {
            return 'Ukuran file melebihi 5MB';
        }
        return null;
    };

    const handleFileSelect = useCallback((file: File) => {
        const error = validateFile(file);
        if (error) {
            toast.error(error);
            return;
        }
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    }, []);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleCloseUploadModal = () => {
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        uploadForm.reset();
    };

    const onSubmitUpload = (data: UploadFormData) => {
        if (!selectedFile) {
            toast.error('Pilih file foto terlebih dahulu');
            return;
        }
        uploadMutation.mutate({
            file: selectedFile,
            description: data.description || '',
        });
    };

    const onSubmitEdit = (data: EditFormData) => {
        if (!editPhoto) return;
        editMutation.mutate({
            photoId: editPhoto.id,
            description: data.description,
        });
    };

    const handleDeleteConfirm = () => {
        if (deletePhoto) {
            deleteMutation.mutate(deletePhoto.id);
        }
    };

    const openEditModal = (photo: UserPhoto) => {
        setEditPhoto(photo);
        editForm.reset({ description: photo.description || '' });
    };

    // Photo navigation in preview
    const navigatePhoto = (direction: 'prev' | 'next') => {
        if (!previewPhoto) return;
        const currentIndex = photos.findIndex((p) => p.id === previewPhoto.id);
        let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0) newIndex = photos.length - 1;
        if (newIndex >= photos.length) newIndex = 0;
        setPreviewPhoto(photos[newIndex]);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    if (error) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Link
                    to="/worker/profile"
                    className="inline-flex items-center gap-2 text-secondary-600 hover:text-primary-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali
                </Link>
                <EmptyState
                    icon={AlertTriangle}
                    title="Gagal Memuat Foto"
                    description="Terjadi kesalahan saat memuat foto portfolio Anda"
                    action={
                        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['worker-photos'] })}>
                            Coba Lagi
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Portfolio Foto</h1>
                    <p className="text-secondary-600">
                        Kelola foto-foto karya Anda untuk menarik perhatian pemberi kerja
                    </p>
                </div>
                <Button leftIcon={Plus} onClick={() => setIsUploadModalOpen(true)}>
                    Tambah Foto
                </Button>
            </div>

            {/* Stats Card */}
            {!isLoading && photos.length > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                <FileImage className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-secondary-900">{photos.length}</p>
                                <p className="text-secondary-600 text-sm">Total Foto Portfolio</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Photos Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="aspect-square rounded-2xl" />
                    ))}
                </div>
            ) : photos.length === 0 ? (
                <EmptyState
                    icon={Image}
                    title="Belum Ada Foto Portfolio"
                    description="Unggah foto-foto hasil kerja terbaik Anda untuk menunjukkan kemampuan kepada pemberi kerja"
                    action={
                        <Button leftIcon={Plus} onClick={() => setIsUploadModalOpen(true)}>
                            Unggah Foto Pertama
                        </Button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo, index) => (
                        <Card key={photo.id} className="group overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300">
                            <div
                                className="aspect-square relative overflow-hidden"
                                onClick={() => setPreviewPhoto(photo)}
                            >
                                <img
                                    src={API_BASE_URL + photo.photo_url}
                                    alt={photo.description || `Portfolio ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="lazy"
                                />
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <ZoomIn className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    {/* Description overlay */}
                                    {photo.description && (
                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <p className="text-white text-sm line-clamp-2">{photo.description}</p>
                                        </div>
                                    )}
                                </div>
                                {/* Action buttons */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditModal(photo);
                                        }}
                                        className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center text-secondary-700 hover:bg-white hover:text-primary-600 transition-colors shadow-md"
                                        title="Edit deskripsi"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeletePhoto(photo);
                                        }}
                                        className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center text-secondary-700 hover:bg-white hover:text-danger-600 transition-colors shadow-md"
                                        title="Hapus foto"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            {/* Photo info below */}
                            <CardContent className="p-3">
                                <div className="flex items-center gap-1.5 text-xs text-secondary-500">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDate(photo.created_at)}
                                </div>
                                {photo.description && (
                                    <p className="mt-1.5 text-sm text-secondary-700 line-clamp-1">{photo.description}</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            <Modal
                isOpen={isUploadModalOpen}
                onClose={handleCloseUploadModal}
                title="Unggah Foto Baru"
                size="lg"
            >
                <form onSubmit={uploadForm.handleSubmit(onSubmitUpload)} className="space-y-6">
                    {/* Drag & Drop Area */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragging
                            ? 'border-primary-500 bg-primary-50'
                            : selectedFile
                                ? 'border-success-500 bg-success-50'
                                : 'border-secondary-300 hover:border-primary-400 hover:bg-primary-50/50'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={handleFileInputChange}
                            className="hidden"
                        />

                        {previewUrl ? (
                            <div className="space-y-4">
                                <div className="relative inline-block">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="max-h-48 rounded-xl shadow-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                            URL.revokeObjectURL(previewUrl);
                                            setPreviewUrl(null);
                                        }}
                                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-danger-500 text-white flex items-center justify-center hover:bg-danger-600 transition-colors shadow-md"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-success-600">
                                    <Check className="w-5 h-5" />
                                    <span className="font-medium">{selectedFile?.name}</span>
                                </div>
                                <p className="text-sm text-secondary-500">
                                    Klik untuk mengganti foto
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mx-auto">
                                    <Upload className="w-8 h-8 text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-secondary-900 font-medium">
                                        Drag & drop foto di sini
                                    </p>
                                    <p className="text-secondary-500 text-sm mt-1">
                                        atau klik untuk memilih file
                                    </p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-2 text-xs text-secondary-400">
                                    <span className="px-2 py-1 bg-secondary-100 rounded-lg">JPEG</span>
                                    <span className="px-2 py-1 bg-secondary-100 rounded-lg">PNG</span>
                                    <span className="px-2 py-1 bg-secondary-100 rounded-lg">WebP</span>
                                    <span className="px-2 py-1 bg-secondary-100 rounded-lg">Maks 5MB</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <Textarea
                        {...uploadForm.register('description')}
                        label="Deskripsi (Opsional)"
                        placeholder="Jelaskan tentang foto ini, misalnya: Hasil renovasi rumah klien di Jakarta Selatan"
                        rows={3}
                        error={uploadForm.formState.errors.description?.message}
                    />

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={handleCloseUploadModal}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            isLoading={uploadMutation.isPending}
                            disabled={!selectedFile}
                        >
                            Unggah Foto
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Description Modal */}
            <Modal
                isOpen={!!editPhoto}
                onClose={() => {
                    setEditPhoto(null);
                    editForm.reset();
                }}
                title="Edit Deskripsi Foto"
            >
                {editPhoto && (
                    <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-6">
                        {/* Photo Preview */}
                        <div className="flex justify-center">
                            <img
                                src={API_BASE_URL + editPhoto.photo_url}
                                alt={editPhoto.description || 'Photo'}
                                className="max-h-48 rounded-xl shadow-lg"
                            />
                        </div>

                        {/* Description */}
                        <Textarea
                            {...editForm.register('description')}
                            label="Deskripsi"
                            placeholder="Jelaskan tentang foto ini"
                            rows={3}
                            error={editForm.formState.errors.description?.message}
                        />

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                className="flex-1"
                                onClick={() => {
                                    setEditPhoto(null);
                                    editForm.reset();
                                }}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                isLoading={editMutation.isPending}
                            >
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deletePhoto}
                onClose={() => setDeletePhoto(null)}
                title="Hapus Foto"
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-danger-100 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-danger-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                        Yakin ingin menghapus foto ini?
                    </h3>
                    <p className="text-secondary-600 mb-4">
                        Tindakan ini tidak dapat dibatalkan. Foto akan dihapus secara permanen dari portfolio Anda.
                    </p>
                    {deletePhoto && (
                        <div className="flex justify-center mb-6">
                            <img
                                src={API_BASE_URL + deletePhoto.photo_url}
                                alt={deletePhoto.description || 'Photo to delete'}
                                className="max-h-32 rounded-xl shadow-md"
                            />
                        </div>
                    )}
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => setDeletePhoto(null)}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="primary"
                        className="flex-1 bg-danger-600 hover:bg-danger-700"
                        onClick={handleDeleteConfirm}
                        isLoading={deleteMutation.isPending}
                    >
                        Hapus Foto
                    </Button>
                </div>
            </Modal>

            {/* Photo Preview Modal */}
            <Modal
                isOpen={!!previewPhoto}
                onClose={() => setPreviewPhoto(null)}
                title=""
                size="full"
            >
                {previewPhoto && (
                    <div className="space-y-4">
                        {/* Large Image */}
                        <div className="relative flex items-center justify-center bg-secondary-900 rounded-2xl overflow-hidden" style={{ minHeight: '200px', maxHeight: 'calc(90vh - 200px)' }}>
                            <img
                                src={API_BASE_URL + previewPhoto.photo_url}
                                alt={previewPhoto.description || 'Photo preview'}
                                className="w-full h-auto max-h-[50vh] object-contain"
                            />

                            {/* Navigation Arrows (only if more than 1 photo) */}
                            {photos.length > 1 && (
                                <>
                                    <button
                                        onClick={() => navigatePhoto('prev')}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => navigatePhoto('next')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}

                            {/* Photo counter */}
                            {photos.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm">
                                    {photos.findIndex((p) => p.id === previewPhoto.id) + 1} / {photos.length}
                                </div>
                            )}
                        </div>

                        {/* Photo Details */}
                        <div className="bg-secondary-50 rounded-xl p-4">
                            {previewPhoto.description ? (
                                <p className="text-secondary-800">{previewPhoto.description}</p>
                            ) : (
                                <p className="text-secondary-500 italic">Tidak ada deskripsi</p>
                            )}
                            <div className="flex items-center gap-1.5 mt-2 text-sm text-secondary-500">
                                <Calendar className="w-4 h-4" />
                                Diunggah pada {formatDate(previewPhoto.created_at)}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                leftIcon={Edit3}
                                onClick={() => {
                                    setPreviewPhoto(null);
                                    openEditModal(previewPhoto);
                                }}
                            >
                                Edit Deskripsi
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1 bg-danger-600 hover:bg-danger-700"
                                leftIcon={Trash2}
                                onClick={() => {
                                    setPreviewPhoto(null);
                                    setDeletePhoto(previewPhoto);
                                }}
                            >
                                Hapus Foto
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
