import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersService } from '../../api';
import { Card, CardContent, Badge, Button, Skeleton, LocationDisplay } from '../../components/ui';
import type { UserPhoto } from '../../types';
import {
    ArrowLeft,
    User,
    Briefcase,
    FileText,
    ExternalLink,
    Shield,
    Camera,
    CheckCircle,
    AlertCircle,
    X,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    MapPin,
} from 'lucide-react';
import { API_BASE_URL } from '../../api/axios';

// Helper function to get verification status badge
const getVerificationBadge = (status?: string) => {
    switch (status) {
        case 'FULL_VERIFIED':
            return { variant: 'success' as const, label: 'Terverifikasi Penuh', icon: CheckCircle };
        case 'EMAIL_VERIFIED':
            return { variant: 'warning' as const, label: 'Email Terverifikasi', icon: Shield };
        default:
            return { variant: 'secondary' as const, label: 'Belum Verifikasi', icon: AlertCircle };
    }
};

// Helper function to get role display
const getRoleDisplay = (role: string) => {
    switch (role) {
        case 'PEKERJA':
            return { label: 'Pekerja', icon: User, color: 'text-primary-600', bg: 'bg-primary-100' };
        case 'PEMBERI_KERJA':
            return { label: 'Pemberi Kerja', icon: Briefcase, color: 'text-success-600', bg: 'bg-success-100' };
        default:
            return { label: role, icon: User, color: 'text-secondary-600', bg: 'bg-secondary-100' };
    }
};

export const UserProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [selectedPhoto, setSelectedPhoto] = useState<UserPhoto | null>(null);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

    // Fetch user profile by ID
    const { data, isLoading, error } = useQuery({
        queryKey: ['user-profile', userId],
        queryFn: () => usersService.getProfileById(userId!),
        enabled: !!userId,
    });

    const profile = data?.data;
    const roleInfo = profile ? getRoleDisplay(profile.role) : null;
    const verificationInfo = profile ? getVerificationBadge(profile.verification_status) : null;
    const RoleIcon = roleInfo?.icon || User;
    const VerificationIcon = verificationInfo?.icon || AlertCircle;

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Skeleton className="h-8 w-48" />
                <Card>
                    <CardContent className="p-8">
                        <div className="flex flex-col items-center gap-6">
                            <Skeleton className="w-32 h-32 rounded-full" />
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="text-center py-16 animate-fade-in">
                <AlertCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-secondary-900 mb-2">Profil Tidak Ditemukan</h2>
                <p className="text-secondary-600 mb-6">Pengguna yang Anda cari tidak tersedia.</p>
                <Button onClick={() => navigate(-1)} leftIcon={ArrowLeft}>
                    Kembali
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-secondary-600 hover:text-primary-600 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Kembali
            </button>

            {/* Profile Header Card */}
            <Card>
                <CardContent className="p-8">
                    <div className="flex flex-col items-center text-center">
                        {/* Profile Picture */}
                        <div className="relative mb-6">
                            {profile.profile_picture_url ? (
                                <img
                                    src={API_BASE_URL + profile.profile_picture_url}
                                    alt={profile.full_name}
                                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center border-4 border-white shadow-xl">
                                    <User className="w-16 h-16 text-primary-600" />
                                </div>
                            )}
                            {/* Role Badge on Avatar */}
                            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${roleInfo?.bg} ${roleInfo?.color} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg`}>
                                <RoleIcon className="w-3 h-3" />
                                {roleInfo?.label}
                            </div>
                        </div>

                        {/* Name */}
                        <h1 className="text-2xl font-bold text-secondary-900 mb-2">{profile.full_name}</h1>

                        {/* Verification Status */}
                        <Badge variant={verificationInfo?.variant || 'secondary'} className="mb-6">
                            <VerificationIcon className="w-3.5 h-3.5 mr-1" />
                            {verificationInfo?.label}
                        </Badge>

                        {/* About Section */}
                        {profile.about && (
                            <div className="max-w-2xl">
                                <h3 className="text-sm font-medium text-secondary-500 uppercase tracking-wide mb-2">
                                    {profile.role === 'PEMBERI_KERJA' ? 'Tentang Perusahaan/Bisnis' : 'Tentang'}
                                </h3>
                                <p className="text-secondary-700 whitespace-pre-wrap">{profile.about}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* CV Section (Only for Workers) */}
            {profile.role === 'PEKERJA' && profile.cv_url && (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-secondary-900">Curriculum Vitae (CV)</h3>
                                    <p className="text-sm text-secondary-500">Lihat CV pekerja untuk informasi lebih lanjut</p>
                                </div>
                            </div>
                            <a
                                href={profile.cv_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                            >
                                Lihat CV
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Link Profil Section (Only for Employers) */}
            {profile.role === 'PEMBERI_KERJA' && profile.cv_url && (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-100 to-success-200 flex items-center justify-center">
                                    <ExternalLink className="w-6 h-6 text-success-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-secondary-900">Link Profil</h3>
                                    <p className="text-sm text-secondary-500">Kunjungi profil perusahaan/bisnis untuk informasi lebih lanjut</p>
                                </div>
                            </div>
                            <a
                                href={profile.cv_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-success-600 hover:text-success-700 font-medium transition-colors"
                            >
                                Kunjungi
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Location Section */}
            {profile.latitude && profile.longitude && (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-secondary-900">Lokasi</h3>
                                {profile.location_label && (
                                    <p className="text-sm text-secondary-500">{profile.location_label}</p>
                                )}
                            </div>
                        </div>
                        <LocationDisplay
                            latitude={profile.latitude}
                            longitude={profile.longitude}
                            label={profile.location_label || undefined}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Photo Portfolio (Only for Workers with photos) */}
            {profile.role === 'PEKERJA' && profile.photos && profile.photos.length > 0 && (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-100 to-secondary-200 flex items-center justify-center">
                                <Camera className="w-6 h-6 text-secondary-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-secondary-900">Portofolio Foto</h3>
                                <p className="text-sm text-secondary-500">
                                    {profile.photos.length} foto tersedia • Klik foto untuk memperbesar
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {profile.photos.map((photo, index) => (
                                <button
                                    key={photo.id}
                                    onClick={() => {
                                        setSelectedPhoto(photo);
                                        setSelectedPhotoIndex(index);
                                    }}
                                    className="group relative aspect-square rounded-xl overflow-hidden bg-secondary-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                >
                                    <img
                                        src={API_BASE_URL + photo.photo_url}
                                        alt={photo.description || 'Portfolio photo'}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    {/* Description hint on hover */}
                                    {photo.description && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                                <p className="text-white text-sm line-clamp-2">{photo.description}</p>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Photo Viewer Modal */}
            {selectedPhoto && profile.photos && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-fade-in"
                    onClick={() => setSelectedPhoto(null)}
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Navigation - Previous */}
                    {selectedPhotoIndex > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const newIndex = selectedPhotoIndex - 1;
                                setSelectedPhotoIndex(newIndex);
                                setSelectedPhoto(profile.photos![newIndex]);
                            }}
                            className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                    )}

                    {/* Navigation - Next */}
                    {selectedPhotoIndex < profile.photos.length - 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const newIndex = selectedPhotoIndex + 1;
                                setSelectedPhotoIndex(newIndex);
                                setSelectedPhoto(profile.photos![newIndex]);
                            }}
                            className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    )}

                    {/* Photo Content */}
                    <div
                        className="max-w-4xl max-h-[90vh] mx-4 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Image */}
                        <div className="relative flex-1 flex items-center justify-center">
                            <img
                                src={API_BASE_URL + selectedPhoto.photo_url}
                                alt={selectedPhoto.description || 'Portfolio photo'}
                                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                            />
                        </div>

                        {/* Description & Counter */}
                        <div className="mt-4 text-center">
                            {/* Photo Counter */}
                            <p className="text-white/60 text-sm mb-2">
                                Foto {selectedPhotoIndex + 1} dari {profile.photos.length}
                            </p>
                            {/* Description */}
                            {selectedPhoto.description && (
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-2xl mx-auto">
                                    <p className="text-white text-base whitespace-pre-wrap">
                                        {selectedPhoto.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state for workers without photos */}
            {profile.role === 'PEKERJA' && (!profile.photos || profile.photos.length === 0) && (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 text-secondary-500">
                            <Camera className="w-8 h-8" />
                            <div>
                                <h3 className="font-medium text-secondary-700">Belum ada foto portofolio</h3>
                                <p className="text-sm">Pekerja ini belum menambahkan foto portofolio</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
