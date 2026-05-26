import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '../../components/ui';

export const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Animated 404 Number */}
                <div className="relative mb-8">
                    <p className="text-[10rem] font-black text-secondary-100 leading-none select-none">
                        404
                    </p>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shadow-lg animate-bounce">
                            <Search className="w-12 h-12 text-primary-500" />
                        </div>
                    </div>
                </div>

                {/* Message */}
                <h1 className="text-2xl font-bold text-secondary-900 mb-3">
                    Halaman Tidak Ditemukan
                </h1>
                <p className="text-secondary-500 mb-8 leading-relaxed">
                    Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
                    Silakan kembali ke beranda atau cek URL yang Anda masukkan.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                        variant="ghost"
                        leftIcon={ArrowLeft}
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto"
                    >
                        Kembali
                    </Button>
                    <Link to="/" className="w-full sm:w-auto">
                        <Button leftIcon={Home} className="w-full">
                            Ke Beranda
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
