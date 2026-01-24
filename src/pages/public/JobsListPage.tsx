import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobsService } from '../../api';
import { Card, Badge, Button, Input, Skeleton, EmptyState, getStatusBadgeVariant } from '../../components/ui';
import { Search, MapPin, Banknote, Clock, Briefcase, ChevronRight, Shield, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '../../utils';
import type { Job } from '../../types';

export const JobsListPage: React.FC = () => {
    const [searchLocation, setSearchLocation] = useState('');
    const [appliedFilter, setAppliedFilter] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['jobs', appliedFilter],
        queryFn: () => jobsService.getAll(appliedFilter ? { location: appliedFilter } : undefined),
    });

    const jobs = data?.data.jobs || [];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setAppliedFilter(searchLocation);
    };

    return (
        <div className="min-h-[80vh] bg-secondary-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
                        Temukan Pekerjaan Impian Anda
                    </h1>
                    <p className="text-primary-100 text-center mb-8 max-w-2xl mx-auto">
                        Ribuan lowongan pekerjaan menanti Anda. Mulai cari dan lamar sekarang!
                    </p>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                                <Input
                                    value={searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                    placeholder="Cari berdasarkan lokasi..."
                                    className="pl-12 bg-white"
                                />
                            </div>
                            <Button type="submit" size="lg" leftIcon={Search}>
                                Cari
                            </Button>
                        </div>
                    </form>

                    {appliedFilter && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <span className="text-primary-100">Filter aktif:</span>
                            <Badge variant="primary" className="bg-white/20 text-white">
                                {appliedFilter}
                            </Badge>
                            <button
                                onClick={() => {
                                    setSearchLocation('');
                                    setAppliedFilter('');
                                }}
                                className="text-white/80 hover:text-white text-sm underline"
                            >
                                Hapus filter
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Jobs List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-secondary-900">
                        {isLoading ? 'Memuat...' : `${jobs.length} Lowongan Ditemukan`}
                    </h2>
                </div>

                {isLoading ? (
                    <div className="grid gap-4">
                        {[...Array(5)].map((_, i) => (
                            <Card key={i} className="p-6">
                                <div className="flex gap-4">
                                    <Skeleton className="w-14 h-14 rounded-xl" />
                                    <div className="flex-1">
                                        <Skeleton className="h-6 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-1/2 mb-4" />
                                        <div className="flex gap-4">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    <EmptyState
                        icon={Briefcase}
                        title="Tidak Ada Lowongan"
                        description={
                            appliedFilter
                                ? `Tidak ada lowongan ditemukan untuk lokasi "${appliedFilter}"`
                                : 'Belum ada lowongan tersedia saat ini'
                        }
                        action={
                            appliedFilter && (
                                <Button variant="secondary" onClick={() => {
                                    setSearchLocation('');
                                    setAppliedFilter('');
                                }}>
                                    Lihat Semua Lowongan
                                </Button>
                            )
                        }
                    />
                ) : (
                    <div className="grid gap-4">
                        {jobs.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const JobCard: React.FC<{ job: Job }> = ({ job }) => {
    return (
        <Link to={`/jobs/${job.id}`}>
            <Card interactive className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Employer Avatar */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-7 h-7 text-primary-600" />
                    </div>

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                                <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                                    {job.title}
                                </h3>
                                <p className="text-secondary-600">{job.provider?.full_name}</p>
                            </div>
                            <Badge variant={getStatusBadgeVariant(job.status)}>{job.status}</Badge>
                        </div>

                        <p className="text-secondary-600 mb-4 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-secondary-500">
                            <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                {job.location_label || job.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Banknote className="w-4 h-4" />
                                {formatCurrency(job.compensation_amount)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {formatRelativeTime(job.posted_at ?? '')}
                            </span>
                            {/* Payment Method Indicator */}
                            {job.payment_method === 'ESCROW_SYSTEM' ? (
                                <span className="flex items-center gap-1 text-success-600">
                                    <Shield className="w-4 h-4" />
                                    <span className="text-xs font-medium">🛡️ Escrow</span>
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-warning-600">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-xs font-medium">⚠️ Cash</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden sm:flex items-center">
                        <ChevronRight className="w-5 h-5 text-secondary-400" />
                    </div>
                </div>
            </Card>
        </Link>
    );
};
