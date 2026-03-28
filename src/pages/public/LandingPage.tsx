import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import {
    Search,
    Users,
    Shield,
    Banknote,
    ArrowRight,
    Wrench,
    Leaf,
    Truck,
} from 'lucide-react';
import LandingImage from '../../assets/landing_page_village.webp';

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
                                <Users className="w-4 h-4" />
                                Dari Warga, Untuk Warga
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 mb-6 animate-fade-in-up">
                                Cari <span className="text-primary-600">Tambahan Penghasilan</span> atau{' '}
                                Butuh <span className="text-accent-600">Bantuan Tenaga</span> di Sekitar Anda?
                            </h1>

                            <p className="text-lg text-secondary-600 mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up">
                                TenagaRakyat hadir membantu menghubungkan Anda dengan tetangga atau warga sekitar yang butuh jasa pertukangan, kebersihan, pertanian, dan pekerjaan harian lainnya.
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

                            <div className="flex flex-wrap gap-4 mt-12 justify-center lg:justify-start">
                                <div className="flex items-center gap-2 text-secondary-600 bg-secondary-50 px-4 py-2 rounded-full text-sm font-medium border border-secondary-200">
                                    <Shield className="w-4 h-4 text-success-500" />
                                    <span>Aman & Saling Percaya</span>
                                </div>
                                <div className="flex items-center gap-2 text-secondary-600 bg-secondary-50 px-4 py-2 rounded-full text-sm font-medium border border-secondary-200">
                                    <Banknote className="w-4 h-4 text-success-500" />
                                    <span>Langsung Bayar Cash</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative block mt-12 lg:mt-0">
                            <div className="relative w-full aspect-square max-w-[320px] sm:max-w-lg mx-auto">
                                {/* Central Image */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 opacity-20 blur-2xl" />
                                    <div className="w-[85%] h-[85%] rounded-full overflow-hidden border-4 sm:border-8 border-white shadow-soft-xl relative z-0">
                                        <img 
                                            src={LandingImage} 
                                            alt="Ilustrasi Pekerja Desa" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Decorative Cards */}
                                <div className="absolute -top-4 -left-4 sm:top-0 sm:left-0 p-3 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-soft-lg animate-fade-in-up z-10 scale-75 sm:scale-100 origin-top-left">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-orange-100 flex items-center justify-center">
                                            <Wrench className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-secondary-900">Tukang Bangunan</p>
                                            <p className="text-sm text-secondary-500">Renovasi & Perbaikan</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute top-1/4 -right-4 sm:top-1/3 sm:right-0 p-3 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-soft-lg animate-fade-in-up z-10 scale-75 sm:scale-100 origin-top-right" style={{ animationDelay: '0.2s' }}>
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-green-100 flex items-center justify-center">
                                            <Leaf className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-secondary-900">Pekerja Kebun</p>
                                            <p className="text-sm text-green-600">Siap bantu panen</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -bottom-4 -left-4 sm:bottom-10 sm:left-10 p-3 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-soft-lg animate-fade-in-up z-10 scale-75 sm:scale-100 origin-bottom-left" style={{ animationDelay: '0.4s' }}>
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center">
                                            <Truck className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-secondary-900">Pekerja Serabutan</p>
                                            <p className="text-sm text-secondary-500">Angkat barang, kurir</p>
                                        </div>
                                    </div>
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
                            Kenapa Pakai TenagaRakyat?
                        </h2>
                        <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
                            Aplikasi karya anak bangsa untuk memudahkan warga saling membantu dan berbagi rezeki.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: Search,
                                title: 'Praktis & Mudah',
                                description: 'Cepat dapat info pekerjaan dan tenaga bantuan terdekat dari lokasi Anda.',
                                color: 'primary',
                            },
                            {
                                icon: Shield,
                                title: 'Saling Percaya',
                                description: 'Kenali tetangga dan warga sekitar untuk membangun sistem yang aman.',
                                color: 'success',
                            },
                            {
                                icon: Banknote,
                                title: 'Sistem Bayar Tunai (Cash)',
                                description: 'Upah diberikan langsung setelah pekerjaan selesai, mudah dipahami masyarakat.',
                                color: 'accent',
                            },
                            {
                                icon: Users,
                                title: 'Kekeluargaan',
                                description: 'Meningkatkan kerukunan warga dan saling memberi peluang satu sama lain.',
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
                            Cara Pakai yang Sangat Gampang
                        </h2>
                        <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
                            Cuma 3 langkah gampang untuk mulai cari tambahan pendapatan atau cari bantuan
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '01',
                                title: 'Daftar Gratis',
                                description: 'Bikin akun pakai HP Anda. Bebas pilih jadi Pekerja atau yang Cari Bantuan.',
                            },
                            {
                                step: '02',
                                title: 'Isi Keahlian',
                                description: 'Masukin keahlian apa yang Anda bisa, misal: Tukang Kayu, Bersih-bersih, dll.',
                            },
                            {
                                step: '03',
                                title: 'Mulai Dapat Rezeki',
                                description: 'Cari lowongan di sekitar rumah Anda, kerja, dan langsung terima upah tunai.',
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
                        Mari Bergabung Bersama Kami
                    </h2>
                    <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
                        Mari hidupkan budaya gotong royong dan saling bantu untuk lingkungan sekitar yang lebih sejahtera.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <Button
                                size="lg"
                                className="bg-white text-primary-600 hover:bg-primary-50 shadow-lg"
                            >
                                Butuh Pekerjaan (Pekerja)
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button
                                variant="ghost"
                                size="lg"
                                className="text-white border-2 border-white/30 hover:bg-white/10"
                            >
                                Butuh Bantuan (Pemberi Kerja)
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};
