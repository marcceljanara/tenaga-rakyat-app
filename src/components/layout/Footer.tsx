import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone } from 'lucide-react';
import logoTenagaRakyat from '../../assets/logo_tenaga_rakyat.png';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-secondary-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="flex items-center mb-4">
                            <img src={logoTenagaRakyat} alt="TenagaRakyat" className="h-16 w-auto object-contain" />
                        </Link>
                        <p className="text-secondary-400 mb-4 max-w-md">
                            Platform marketplace kerja terpercaya yang menghubungkan pekerja dengan pemberi kerja di seluruh Indonesia.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="#"
                                className="w-10 h-10 rounded-lg bg-secondary-800 flex items-center justify-center text-secondary-400 hover:bg-primary-600 hover:text-white transition-colors"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-lg bg-secondary-800 flex items-center justify-center text-secondary-400 hover:bg-primary-600 hover:text-white transition-colors"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-lg bg-secondary-800 flex items-center justify-center text-secondary-400 hover:bg-primary-600 hover:text-white transition-colors"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Tautan Cepat</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/jobs" className="text-secondary-400 hover:text-white transition-colors">
                                    Cari Pekerjaan
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="text-secondary-400 hover:text-white transition-colors">
                                    Daftar Pekerja
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="text-secondary-400 hover:text-white transition-colors">
                                    Pasang Lowongan
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="text-secondary-400 hover:text-white transition-colors">
                                    Tentang Kami
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Hubungi Kami</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-secondary-400">
                                <Mail className="w-5 h-5" />
                                <span>support@tenagarakyat.id</span>
                            </li>
                            <li className="flex items-center gap-3 text-secondary-400">
                                <Phone className="w-5 h-5" />
                                <span>+62 812 3456 7890</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className="border-secondary-800 my-8" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-secondary-400 text-sm">
                        © 2024 TenagaRakyat. Hak cipta dilindungi undang-undang.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <Link to="/terms-and-conditions" className="text-secondary-400 hover:text-white transition-colors">
                            Ketentuan Layanan
                        </Link>
                        <Link to="/privacy-policy" className="text-secondary-400 hover:text-white transition-colors">
                            Kebijakan Privasi
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
