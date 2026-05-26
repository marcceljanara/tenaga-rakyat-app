import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, HelpCircle, CheckCircle, ArrowRight } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>('pengumpulan-pribadi');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-20% 0px -60% 0px',
                threshold: 0.1,
            }
        );

        const sections = document.querySelectorAll('section[id]');
        sections.forEach((section) => observer.observe(section));

        return () => {
            sections.forEach((section) => observer.unobserve(section));
        };
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -100; // Offset for sticky navbar
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-secondary-50/50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary-800 to-primary-950 text-white py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-700/50 text-primary-200 uppercase tracking-wider mb-4 border border-primary-600/30">
                        <Shield className="w-3.5 h-3.5" /> Dokumen Legal
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold mt-2 tracking-tight">Kebijakan Privasi</h1>
                    <p className="text-primary-200 mt-4 max-w-2xl text-lg leading-relaxed">
                        Bagaimana kami di Tenaga Rakyat mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda.
                    </p>
                </div>
            </div>

            {/* Content & Navigation Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    
                    {/* Sticky Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            
                            {/* Document Toggle */}
                            <div className="bg-white rounded-xl shadow-soft border border-secondary-100 p-4 lg:p-6">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-400 mb-3 lg:mb-4 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-secondary-400" /> Jenis Dokumen
                                </h3>
                                <nav className="flex flex-row lg:flex-col gap-2">
                                    <Link
                                        to="/terms-and-conditions"
                                        className="flex-1 lg:flex-initial text-center lg:text-left px-4 py-2.5 rounded-lg text-sm font-medium text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 transition-colors"
                                    >
                                        Syarat & Ketentuan
                                    </Link>
                                    <Link
                                        to="/privacy-policy"
                                        className="flex-1 lg:flex-initial text-center lg:text-left px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary-50 text-primary-700 transition-colors"
                                    >
                                        Kebijakan Privasi
                                    </Link>
                                </nav>
                            </div>

                            {/* Table of Contents (Scrollspy) */}
                            <div className="hidden lg:block bg-white rounded-xl shadow-soft border border-secondary-100 p-6">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-400 mb-4 flex items-center gap-2">
                                    <HelpCircle className="w-4 h-4 text-secondary-400" /> Daftar Isi
                                </h3>
                                <nav className="space-y-1">
                                    {[
                                        { id: 'pengumpulan-pribadi', label: '1. Pengumpulan Data Pribadi' },
                                        { id: 'pengumpulan-teknis', label: '2. Data Non-Pribadi & Teknis' },
                                        { id: 'keamanan-data', label: '3. Penyimpanan & Keamanan' },
                                        { id: 'tindakan-sistem', label: '4. Tindakan Otomatis Sistem' },
                                        { id: 'pihak-ketiga', label: '5. Berbagi Pihak Ketiga' },
                                        { id: 'penghapusan-data', label: '6. Hak Penghapusan Data' },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => scrollToSection(item.id)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                                                activeSection === item.id
                                                    ? 'bg-primary-50 text-primary-700 pl-4 border-l-2 border-primary-600 shadow-sm'
                                                    : 'text-secondary-500 hover:text-secondary-900 hover:bg-secondary-50/80'
                                            }`}
                                        >
                                            <ArrowRight className={`w-3 h-3 transition-transform ${activeSection === item.id ? 'translate-x-0' : '-translate-x-1 opacity-0'}`} />
                                            {item.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                        </div>
                    </aside>

                    {/* Main Legal Content */}
                    <main className="lg:col-span-3 bg-white rounded-2xl shadow-soft border border-secondary-100 p-6 sm:p-10 lg:p-12">
                        <div className="space-y-10 text-secondary-700 leading-relaxed text-base">
                            
                            {/* Date updated */}
                            <div className="flex items-center gap-2 pb-6 border-b border-secondary-100 text-sm text-secondary-500 font-medium">
                                <CheckCircle className="w-4 h-4 text-success-500" />
                                Pembaruan Terakhir: 26 Mei 2026
                            </div>

                            {/* Welcome text */}
                            <div className="prose-like-css">
                                <p className="text-lg text-secondary-800 leading-relaxed font-normal">
                                    Kami di <strong>Tenaga Rakyat</strong> sangat menghargai dan berkomitmen penuh untuk melindungi privasi data pribadi Anda. Dokumen ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi yang Anda berikan saat menggunakan platform kami.
                                </p>
                            </div>

                            {/* Section 1 */}
                            <section id="pengumpulan-pribadi" className="scroll-mt-24 space-y-4">
                                <h2 className="text-2xl font-bold text-secondary-900 border-b border-secondary-100 pb-2 flex items-center gap-2">
                                    <span className="text-primary-600 font-mono">1.</span> Pengumpulan Data Pribadi
                                </h2>
                                <p className="text-secondary-600 leading-relaxed">
                                    Kami mengumpulkan data pribadi yang Anda berikan secara langsung saat melakukan pendaftaran akun, melengkapi profil, atau menggunakan layanan kami. Data tersebut mencakup namun tidak terbatas pada:
                                </p>
                                <ul className="list-disc list-outside pl-5 space-y-2">
                                    <li>Nama lengkap pengguna.</li>
                                    <li>Alamat email aktif dan nomor telepon seluler.</li>
                                    <li>Kata sandi (*password*) yang disimpan dalam bentuk terenkripsi satu arah menggunakan algoritma *hashing* yang aman.</li>
                                    <li>Foto profil dan tautan berkas *Curriculum Vitae* (CV) bagi Pekerja.</li>
                                    <li>Titik koordinat geografis (Latitude & Longitude) tempat tinggal Pekerja atau lokasi pekerjaan Pemberi Kerja beserta detail alamat lengkapnya.</li>
                                    <li>Nomor Induk Kependudukan / KTP yang disimpan dalam bentuk terenkripsi demi keamanan proses verifikasi identitas resmi.</li>
                                    <li>Informasi dan berkas bukti pembayaran transfer bank/cash manual yang diunggah untuk konfirmasi pembelian kredit posting lowongan kerja.</li>
                                </ul>
                            </section>

                            {/* Section 2 */}
                            <section id="pengumpulan-teknis" className="scroll-mt-24 space-y-4">
                                <h2 className="text-2xl font-bold text-secondary-900 border-b border-secondary-100 pb-2 flex items-center gap-2">
                                    <span className="text-primary-600 font-mono">2.</span> Pengumpulan Data Non-Pribadi dan Teknis
                                </h2>
                                <p className="text-secondary-600 leading-relaxed">
                                    Sistem kami secara otomatis merekam data aktivitas teknis dan non-pribadi untuk mendukung operasional platform:
                                </p>
                                <ul className="list-disc list-outside pl-5 space-y-2">
                                    <li>Log aktivitas operasional, riwayat pelamaran kerja, riwayat posting lowongan, serta catatan ulasan dan penilaian (*rating/review*) antar pengguna.</li>
                                    <li>Koordinat GPS perangkat ketika melakukan pencarian lowongan kerja terdekat atau ketika mempublikasikan pekerjaan baru.</li>
                                    <li>Token keamanan otentikasi (termasuk *Refresh Token* terenkripsi) untuk menjaga status masuk akun Anda secara aman.</li>
                                </ul>
                            </section>

                            {/* Section 3 */}
                            <section id="keamanan-data" className="scroll-mt-24 space-y-4">
                                <h2 className="text-2xl font-bold text-secondary-900 border-b border-secondary-100 pb-2 flex items-center gap-2">
                                    <span className="text-primary-600 font-mono">3.</span> Penyimpanan dan Keamanan Data
                                </h2>
                                <ul className="list-disc list-outside pl-5 space-y-3">
                                    <li>
                                        Seluruh data pribadi Anda disimpan secara terpusat di server cloud terenkripsi milik kami atau infrastruktur mitra penyedia layanan cloud terpercaya kami.
                                    </li>
                                    <li>
                                        Kami menerapkan pengamanan teknis standar industri untuk mencegah kebocoran data, penyalahgunaan, peretasan, modifikasi tanpa izin, maupun akses tidak sah lainnya terhadap database pengguna kami.
                                    </li>
                                </ul>
                            </section>

                            {/* Section 4 */}
                            <section id="tindakan-sistem" className="scroll-mt-24 space-y-4">
                                <h2 className="text-2xl font-bold text-secondary-900 border-b border-secondary-100 pb-2 flex items-center gap-2">
                                    <span className="text-primary-600 font-mono">4.</span> Tindakan Otomatis Sistem (Program Actions)
                                </h2>
                                <p className="text-secondary-600 leading-relaxed">
                                    Aplikasi secara otomatis memproses data yang Anda masukkan untuk menjalankan fungsionalitas berikut:
                                </p>
                                <ul className="list-disc list-outside pl-5 space-y-2">
                                    <li>Melakukan kalkulasi jarak geografis secara *real-time* di latar belakang untuk mencocokkan Pekerja dengan lowongan kerja terdekat yang relevan.</li>
                                    <li>Mengirimkan notifikasi push dan email otomatis untuk memberi tahu tentang status lamaran pekerjaan baru atau verifikasi akun.</li>
                                    <li>Melakukan verifikasi keamanan berkala terhadap status login dan hak akses akun.</li>
                                </ul>
                            </section>

                            {/* Section 5 */}
                            <section id="pihak-ketiga" className="scroll-mt-24 space-y-4">
                                <h2 className="text-2xl font-bold text-secondary-900 border-b border-secondary-100 pb-2 flex items-center gap-2">
                                    <span className="text-primary-600 font-mono">5.</span> Berbagi Data dengan Pihak Ketiga
                                </h2>
                                <p className="text-secondary-600 leading-relaxed">
                                    Kami menjaga kerahasiaan data Anda dan **tidak memperjualbelikan** atau **membagikan** data pribadi Anda kepada pihak ketiga untuk tujuan pemasaran/iklan eksternal. Kami hanya membagikan data yang sangat terbatas dan diperlukan dalam kondisi berikut:
                                </p>
                                <ul className="list-disc list-outside pl-5 space-y-2">
                                    <li>
                                        <strong>Layanan Infrastruktur Cloud:</strong> Untuk keperluan penyimpanan database yang terenkripsi dan pengiriman email otomatis (transaksional email seperti verifikasi password).
                                    </li>
                                    <li>
                                        <strong>Kewajiban Hukum:</strong> Apabila secara resmi diwajibkan oleh proses hukum nasional, perintah pengadilan, atau perintah resmi instansi pemerintah yang berwenang berdasarkan hukum Negara Republik Indonesia.
                                    </li>
                                </ul>
                            </section>

                            {/* Section 6 */}
                            <section id="penghapusan-data" className="scroll-mt-24 space-y-4">
                                <h2 className="text-2xl font-bold text-secondary-900 border-b border-secondary-100 pb-2 flex items-center gap-2">
                                    <span className="text-primary-600 font-mono">6.</span> Hak Penghapusan Data (Data Deletion Request)
                                </h2>
                                <ul className="list-disc list-outside pl-5 space-y-3">
                                    <li>
                                        Anda memiliki hak penuh untuk mengakses, memperbarui, serta meminta penghapusan akun beserta seluruh data pribadi terkait dari sistem kami.
                                    </li>
                                    <li>
                                        Permintaan penghapusan dapat diajukan secara langsung di menu profil/pengaturan akun dalam aplikasi. Setelah permintaan diproses dan diverifikasi, data pribadi Anda akan dihapus secara permanen atau dianonimkan dari database aktif kami, kecuali untuk data transaksi historis pembelian kredit posting lowongan yang diwajibkan oleh hukum untuk disimpan dalam jangka waktu regulasi perpajakan yang berlaku.
                                    </li>
                                </ul>
                            </section>

                        </div>
                    </main>

                </div>
            </div>
        </div>
    );
};
