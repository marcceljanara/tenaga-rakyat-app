import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import {
    Search,
    Users,
    Shield,
    Wallet,
    ArrowRight,
    CheckCircle,
    TrendingUp,
    Star,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-200/30 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6 animate-fade-in">
                                <Star className="w-4 h-4" />
                                Platform Kerja #1 di Indonesia
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 mb-6 animate-fade-in-up">
                                Temukan <span className="text-primary-600">Pekerjaan</span> Impian atau{' '}
                                <span className="text-accent-600">Pekerja</span> Terbaik
                            </h1>

                            <p className="text-lg text-secondary-600 mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up">
                                TenagaRakyat menghubungkan pekerja terampil dengan pemberi kerja terpercaya.
                                Mulai perjalanan karir Anda atau temukan talenta terbaik untuk bisnis Anda.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up">
                                <Link to="/register">
                                    <Button size="lg" rightIcon={ArrowRight}>
                                        Mulai Sekarang
                                    </Button>
                                </Link>
                                <Link to="/jobs">
                                    <Button variant="secondary" size="lg" leftIcon={Search}>
                                        Cari Pekerjaan
                                    </Button>
                                </Link>
                            </div>

                            <div className="flex items-center gap-8 mt-12 justify-center lg:justify-start">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-secondary-900">10K+</p>
                                    <p className="text-sm text-secondary-500">Pekerja Aktif</p>
                                </div>
                                <div className="w-px h-12 bg-secondary-200" />
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-secondary-900">5K+</p>
                                    <p className="text-sm text-secondary-500">Lowongan</p>
                                </div>
                                <div className="w-px h-12 bg-secondary-200" />
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-secondary-900">98%</p>
                                    <p className="text-sm text-secondary-500">Kepuasan</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative hidden lg:block">
                            <div className="relative w-full aspect-square max-w-lg mx-auto">
                                {/* Decorative Cards */}
                                <div className="absolute top-0 left-0 p-6 bg-white rounded-2xl shadow-soft-lg animate-fade-in-up">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center">
                                            <CheckCircle className="w-6 h-6 text-success-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-secondary-900">Pekerjaan Selesai</p>
                                            <p className="text-sm text-secondary-500">+2,450 bulan ini</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute top-1/3 right-0 p-6 bg-white rounded-2xl shadow-soft-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-secondary-900">Pendapatan Naik</p>
                                            <p className="text-sm text-success-600">+35% bulan ini</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute bottom-10 left-10 p-6 bg-white rounded-2xl shadow-soft-lg animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center">
                                            <Users className="w-6 h-6 text-accent-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-secondary-900">Pengguna Baru</p>
                                            <p className="text-sm text-secondary-500">+150 hari ini</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Central Image */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 opacity-20 blur-2xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
                            Mengapa Memilih TenagaRakyat?
                        </h2>
                        <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
                            Platform terpercaya dengan fitur lengkap untuk memudahkan pencarian kerja dan rekrutmen
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: Search,
                                title: 'Pencarian Mudah',
                                description: 'Temukan pekerjaan atau pekerja sesuai kebutuhan dengan filter lengkap',
                                color: 'primary',
                            },
                            {
                                icon: Shield,
                                title: 'Aman & Terpercaya',
                                description: 'Verifikasi pengguna dan sistem keamanan untuk melindungi transaksi',
                                color: 'success',
                            },
                            {
                                icon: Wallet,
                                title: 'Pembayaran Mudah',
                                description: 'Sistem pembayaran terintegrasi dengan berbagai metode pembayaran',
                                color: 'accent',
                            },
                            {
                                icon: Users,
                                title: 'Komunitas Aktif',
                                description: 'Bergabung dengan ribuan pekerja dan pemberi kerja di seluruh Indonesia',
                                color: 'warning',
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="group p-6 rounded-2xl border border-secondary-100 hover:border-primary-200 hover:shadow-soft-lg transition-all duration-300"
                            >
                                <div
                                    className={`w-14 h-14 rounded-xl bg-${feature.color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                                >
                                    <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
                                </div>
                                <h3 className="text-lg font-semibold text-secondary-900 mb-2">{feature.title}</h3>
                                <p className="text-secondary-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-secondary-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
                            Cara Kerja TenagaRakyat
                        </h2>
                        <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
                            Proses sederhana untuk memulai perjalanan Anda
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '01',
                                title: 'Daftar Akun',
                                description: 'Buat akun gratis sebagai pekerja atau pemberi kerja dalam hitungan menit',
                            },
                            {
                                step: '02',
                                title: 'Lengkapi Profil',
                                description: 'Tambahkan informasi dan portofolio untuk meningkatkan kredibilitas',
                            },
                            {
                                step: '03',
                                title: 'Mulai Bekerja',
                                description: 'Cari pekerjaan atau posting lowongan dan mulai berkolaborasi',
                            },
                        ].map((item, index) => (
                            <div key={index} className="relative text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 text-white text-2xl font-bold mb-6">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-semibold text-secondary-900 mb-3">{item.title}</h3>
                                <p className="text-secondary-600">{item.description}</p>

                                {index < 2 && (
                                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-secondary-300" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                        Siap Untuk Memulai?
                    </h2>
                    <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
                        Bergabunglah dengan ribuan pekerja dan pemberi kerja yang sudah merasakan kemudahan TenagaRakyat
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <Button
                                size="lg"
                                className="bg-white text-primary-600 hover:bg-primary-50 shadow-lg"
                            >
                                Daftar Sebagai Pekerja
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button
                                variant="ghost"
                                size="lg"
                                className="text-white border-2 border-white/30 hover:bg-white/10"
                            >
                                Daftar Sebagai Pemberi Kerja
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};
