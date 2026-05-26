import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, HelpCircle, CheckCircle, ArrowRight } from 'lucide-react';

export const TermsAndConditionsPage: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>('definisi');

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
                        <FileText className="w-3.5 h-3.5" /> Dokumen Legal
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold mt-2 tracking-tight">Syarat & Ketentuan</h1>
                    <p className="text-primary-200 mt-4 max-w-2xl text-lg leading-relaxed">
                        Aturan main, panduan penggunaan, serta batasan tanggung jawab dalam menggunakan platform Tenaga Rakyat.
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
                                        className="flex-1 lg:flex-initial text-center lg:text-left px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary-50 text-primary-700 transition-colors"
                                    >
                                        Syarat & Ketentuan
                                    </Link>
                                    <Link
                                        to="/privacy-policy"
                                        className="flex-1 lg:flex-initial text-center lg:text-left px-4 py-2.5 rounded-lg text-sm font-medium text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 transition-colors"
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
                                        { id: 'definisi', label: '1. Definisi & Layanan' },
                                        { id: 'penerimaan', label: '2. Penerimaan & Akun' },
                                        { id: 'hak-kewajiban', label: '3. Hak & Kewajiban' },
                                        { id: 'tanggung-jawab', label: '4. Batasan Tanggung Jawab' },
                                        { id: 'penutupan', label: '5. Penutupan Akun' },
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
                                    Selamat datang di aplikasi <strong>Tenaga Rakyat</strong>. Dengan mengunduh, mengakses, dan menggunakan platform Tenaga Rakyat, Anda dengan ini menyetujui dan mengikatkan diri terhadap seluruh Syarat & Ketentuan yang berlaku di bawah ini. Jika Anda tidak menyetujui sebagian atau seluruh Syarat & Ketentuan ini, Anda tidak diperkenankan menggunakan layanan kami.
                                </p>
                            </div>

                            {/* Section 1 */}
                            <section id="definisi" className="scroll-mt-24 space-y-4">
                                <h2 className="text-2xl font-bold text-secondary-900 border-b border-secondary-100 pb-2 flex items-center gap-2">
                                    <span className="text-primary-600 font-mono">1.</span> Definisi dan Layanan Aplikasi
                                </h2>
                                <ul className="list-disc list-outside pl-5 space-y-3">
                                    <li>
                                        <strong>Aplikasi:</strong> Tenaga Rakyat, platform berbasis web yang berfungsi sebagai penghubung dan marketplace untuk mempertemukan Penyedia Kerja (Pemberi Kerja) dengan Pekerja secara langsung.
                                    </li>
                                    <li>
                                        <strong>Layanan Utama:</strong> Aplikasi ini menyediakan fasilitas bagi Pemberi Kerja untuk mempublikasikan lowongan pekerjaan dan mencari pekerja yang sesuai, serta fasilitas bagi Pekerja untuk melamar pekerjaan secara langsung. Transaksi dan kesepakatan pekerjaan diselesaikan secara langsung secara tunai/offline antar pengguna.
                                    </li>
                                    <li>
                                        <strong>Pembelian Kuota Publikasi (Top-Up Credit Posting):</strong> Untuk dapat mempublikasikan lowongan pekerjaan, Pemberi Kerja dapat membeli kuota publikasi lowongan melalui skema transfer bank manual secara langsung (<i className="italic">cash offline</i> / bank transfer) yang akan dikonfirmasi secara manual oleh Admin.
                                    </li>
                                    <li>
                                        <strong>Penyelesaian Transaksi Kerja:</strong> Pekerjaan diselesaikan langsung di lapangan secara offline. Seluruh pembayaran upah diselesaikan secara langsung di antara pengguna (tunai/transfer langsung) tanpa adanya penampungan dana sementara (<i className="italic">escrow</i>) atau dompet digital (<i className="italic">wallet</i>) di dalam aplikasi.
                                    </li>
                                    <li>
                                        <strong>Yurisdiksi:</strong> Seluruh ketentuan penggunaan ini diatur, tunduk, dan ditafsirkan berdasarkan Hukum Negara Republik Indonesia.
                                    </li>
                                </ul>
                            </section>

                            {/* Section 2 */}
                            <section id="penerimaan" className="scroll-mt-24 space-y-4">
                                <h2 className="text-2xl font-bold text-secondary-900 border-b border-secondary-100 pb-2 flex items-center gap-2">
                                    <span className="text-primary-600 font-mono">2.</span> Penerimaan Syarat dan Akun Pengguna
                                </h2>
                                <ul className="list-disc list-outside pl-5 space-y-3">
                                    <li>
                                        Dengan mendaftar dan menggunakan aplikasi, Anda secara tegas menyatakan persetujuan terhadap semua syarat yang berlaku tanpa terkecuali.
                                    </li>
                                    <li>
                                        Pengguna wajib memberikan informasi yang akurat, lengkap, dan terkini saat pendaftaran, serta menjaga kerahasiaan kata sandi (<i className="italic">password</i>) akun Anda.
                                    </li>
                                    <li>
                                        Satu akun hanya boleh digunakan oleh satu individu atau badan usaha yang terdaftar resmi. Pengguna bertanggung jawab penuh atas segala aktivitas yang terjadi di bawah nama akun pribadi.
                                    </li>
                                </ul>
                            </section>

                            {/* Section 3 */}
                            <section id="hak-kewajiban" className="scroll-mt-24 space-y-4">
                                <h2 className="text-2xl font-bold text-secondary-900 border-b border-secondary-100 pb-2 flex items-center gap-2">
                                    <span className="text-primary-600 font-mono">3.</span> Hak dan Kewajiban Pengguna
                                </h2>
                                <ul className="list-disc list-outside pl-5 space-y-3">
                                    <li>
                                        <strong>Penggunaan yang Sah:</strong> Aplikasi hanya boleh digunakan untuk tujuan yang sah secara hukum. Pengguna dilarang keras menggunakan aplikasi untuk penipuan, aktivitas ilegal, diskriminasi, eksploitasi, atau tindakan lain yang melanggar hukum di Indonesia.
                                    </li>
                                    <li>
                                        <strong>Penyelesaian Pembayaran Pekerjaan:</strong> Pembayaran disepakati dan diselesaikan secara mandiri di luar sistem aplikasi. Pemberi Kerja berkewajiban membayarkan upah yang disepakati secara penuh kepada Pekerja setelah pekerjaan selesai.
                                    </li>
                                    <li>
                                        <strong>Penyalahgunaan Platform:</strong> Pengguna dilarang menyalahgunakan sistem pembelian kuota publikasi (<i className="italic">Top-Up Credit Posting</i>), termasuk namun tidak terbatas pada mengirimkan bukti pembayaran palsu atau melakukan kecurangan saat pengisian saldo kredit lowongan.
                                    </li>
                                    <li>
                                        <strong>Hak Akses Perangkat:</strong> Pengguna setuju memberikan aplikasi izin untuk mengakses layanan perangkat tertentu guna fungsionalitas optimal, termasuk lokasi GPS (untuk pencocokan jarak kerja terdekat) dan penyimpanan/kamera (untuk mengunggah foto profil, portofolio hasil pekerjaan, dan CV).
                                    </li>
                                </ul>
                            </section>

                            {/* Section 4 */}
                            <section id="tanggung-jawab" className="scroll-mt-24 space-y-4">
                                <h2 className="text-2xl font-bold text-secondary-900 border-b border-secondary-100 pb-2 flex items-center gap-2">
                                    <span className="text-primary-600 font-mono">4.</span> Batasan Tanggung Jawab (Limitation of Liability)
                                </h2>
                                <ul className="list-disc list-outside pl-5 space-y-3">
                                    <li>
                                        Pengembang tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul akibat:
                                        <ul className="list-circle list-outside pl-5 mt-2 space-y-2">
                                            <li>Masalah teknis di luar kendali wajar kami (misalnya server <i className="italic">down</i>, gangguan jaringan internet, atau <i className="italic">force majeure</i>).</li>
                                            <li>Peretasan atau akses tidak sah yang terjadi akibat kelalaian pengguna dalam menjaga kerahasiaan akun dan kata sandi.</li>
                                            <li>Perselisihan kontrak, kualitas kerja, kelalaian kerja, kerusakan barang, cedera fisik, atau sengketa pembayaran upah yang terjadi antara Pemberi Kerja dan Pekerja.</li>
                                        </ul>
                                    </li>
                                    <li>
                                        Aplikasi ini bertindak murni sebagai perantara penghubung digital dan tidak memikul tanggung jawab atas hubungan hukum kerja, kualitas kerja, maupun transaksi keuangan di antara para pengguna.
                                    </li>
                                </ul>
                            </section>

                            {/* Section 5 */}
                            <section id="penutupan" className="scroll-mt-24 space-y-4">
                                <h2 className="text-2xl font-bold text-secondary-900 border-b border-secondary-100 pb-2 flex items-center gap-2">
                                    <span className="text-primary-600 font-mono">5.</span> Penutupan dan Penghapusan Akun
                                </h2>
                                <ul className="list-disc list-outside pl-5 space-y-3">
                                    <li>
                                        Pengguna memiliki hak penuh untuk meminta penutupan akun dan penghapusan data pribadinya secara permanen melalui menu pengaturan di dalam aplikasi.
                                    </li>
                                    <li>
                                        Kami berhak sepenuhnya untuk menangguhkan (<i className="italic">suspend</i>) atau menghapus akun pengguna secara sepihak tanpa pemberitahuan sebelumnya, apabila ditemukan indikasi pelanggaran terhadap Syarat & Ketentuan ini atau adanya aduan valid mengenai penipuan dan perbuatan tidak menyenangkan.
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
