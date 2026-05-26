import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobsService } from '../../api';
import { Card, Badge, Button, Input, Skeleton, EmptyState, getStatusBadgeVariant, Select } from '../../components/ui';
import { Search, MapPin, Banknote, Clock, Briefcase, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '../../utils';
import type { Job, JobSearchParams } from '../../types';

export const JobsListPage: React.FC = () => {
    const [queryParams, setQueryParams] = useState<JobSearchParams>({
        page: 1,
        limit: 10,
        status: 'OPEN',
        sort_by: 'posted_at',
        sort_order: 'desc',
    });

    const [keywordInput, setKeywordInput] = useState('');
    const [locationInput, setLocationInput] = useState('');
    const [minCompensationInput, setMinCompensationInput] = useState<number | ''>('');
    const [maxCompensationInput, setMaxCompensationInput] = useState<number | ''>('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            setQueryParams(prev => {
                const newKeyword = keywordInput || undefined;
                if (prev.keyword === newKeyword) return prev;
                return {
                    ...prev,
                    keyword: newKeyword,
                    page: 1
                };
            });
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [keywordInput]);

    const { data, isLoading } = useQuery({
        queryKey: ['jobs', queryParams],
        queryFn: () => jobsService.getAll(queryParams),
    });

    const jobs = data?.data.jobs || [];
    const totalJobs = data?.data.total || 0;
    const limit = queryParams.limit || 10;
    const totalPages = Math.ceil(totalJobs / limit);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setQueryParams(prev => ({
            ...prev,
            keyword: keywordInput || undefined,
            page: 1
        }));
    };

    const handleApplyFilters = () => {
        let minComp = minCompensationInput !== '' ? Number(minCompensationInput) : undefined;
        let maxComp = maxCompensationInput !== '' ? Number(maxCompensationInput) : undefined;

        if (minComp !== undefined && maxComp !== undefined && minComp > maxComp) {
            const temp = minComp;
            minComp = maxComp;
            maxComp = temp;
            setMinCompensationInput(minComp);
            setMaxCompensationInput(maxComp);
        }

        setQueryParams(prev => ({
            ...prev,
            location: locationInput || undefined,
            min_compensation: minComp,
            max_compensation: maxComp,
            page: 1
        }));
    };

    const handleResetFilters = () => {
        setLocationInput('');
        setMinCompensationInput('');
        setMaxCompensationInput('');
        setQueryParams(prev => ({
            ...prev,
            location: undefined,
            min_compensation: undefined,
            max_compensation: undefined,
            page: 1
        }));
    };

    const hasActiveFilters = Object.entries(queryParams).some(
        ([key, val]) => val !== undefined && !['page', 'limit', 'status', 'sort_by', 'sort_order'].includes(key)
    );

    return (
        <div className="min-h-[80vh] bg-secondary-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-10 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-4">
                        Temukan Pekerjaan Impian Anda
                    </h1>
                    <p className="text-primary-100 text-center mb-5 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
                        Ribuan lowongan pekerjaan menanti Anda. Mulai cari dan lamar sekarang!
                    </p>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                                <Input
                                    value={keywordInput}
                                    onChange={(e) => setKeywordInput(e.target.value)}
                                    placeholder="Cari posisi atau pekerjaan..."
                                    leftIcon={Search}
                                    className="bg-white"
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="lg"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    leftIcon={SlidersHorizontal}
                                    className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30 flex-1 sm:flex-initial"
                                >
                                    Filter
                                </Button>
                                <Button type="submit" size="lg" leftIcon={Search} className="flex-1 sm:flex-initial">
                                    Cari
                                </Button>
                            </div>
                        </div>

                        {showAdvanced && (
                            <Card className="p-4 sm:p-6 bg-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-200 text-left">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">Lokasi</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                                            <Input
                                                value={locationInput}
                                                onChange={(e) => setLocationInput(e.target.value)}
                                                placeholder="Kota atau wilayah..."
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">Rentang Gaji (Rp)</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Input
                                                type="number"
                                                value={minCompensationInput}
                                                onChange={(e) => setMinCompensationInput(e.target.value ? Number(e.target.value) : '')}
                                                placeholder="Min..."
                                            />
                                            <Input
                                                type="number"
                                                value={maxCompensationInput}
                                                onChange={(e) => setMaxCompensationInput(e.target.value ? Number(e.target.value) : '')}
                                                placeholder="Max..."
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleResetFilters}
                                        className="w-full sm:w-auto"
                                    >
                                        Reset Filter
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleApplyFilters}
                                        className="w-full sm:w-auto"
                                    >
                                        Terapkan
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </form>

                    {hasActiveFilters && (
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                            <span className="text-primary-100 text-sm">Filter aktif:</span>
                            {queryParams.keyword && (
                                <Badge variant="primary" className="bg-white/20 text-white flex items-center gap-1.5">
                                    Kata kunci: "{queryParams.keyword}"
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setKeywordInput('');
                                            setQueryParams(prev => ({ ...prev, keyword: undefined, page: 1 }));
                                        }}
                                        className="hover:text-primary-200 focus:outline-none"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </Badge>
                            )}
                            {queryParams.location && (
                                <Badge variant="primary" className="bg-white/20 text-white flex items-center gap-1.5">
                                    Lokasi: "{queryParams.location}"
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLocationInput('');
                                            setQueryParams(prev => ({ ...prev, location: undefined, page: 1 }));
                                        }}
                                        className="hover:text-primary-200 focus:outline-none"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </Badge>
                            )}
                            {(queryParams.min_compensation !== undefined || queryParams.max_compensation !== undefined) && (
                                <Badge variant="primary" className="bg-white/20 text-white flex items-center gap-1.5">
                                    Gaji: {queryParams.min_compensation ? `Min ${formatCurrency(queryParams.min_compensation)}` : ''} 
                                    {queryParams.min_compensation && queryParams.max_compensation ? ' - ' : ''}
                                    {queryParams.max_compensation ? `Max ${formatCurrency(queryParams.max_compensation)}` : ''}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMinCompensationInput('');
                                            setMaxCompensationInput('');
                                            setQueryParams(prev => ({
                                                ...prev,
                                                min_compensation: undefined,
                                                max_compensation: undefined,
                                                page: 1
                                            }));
                                        }}
                                        className="hover:text-primary-200 focus:outline-none"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </Badge>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setKeywordInput('');
                                    setLocationInput('');
                                    setMinCompensationInput('');
                                    setMaxCompensationInput('');
                                    setQueryParams({
                                        page: 1,
                                        limit: 10,
                                        status: 'OPEN',
                                        sort_by: 'posted_at',
                                        sort_order: 'desc',
                                    });
                                }}
                                className="text-white/80 hover:text-white text-sm underline font-medium focus:outline-none"
                            >
                                Hapus semua filter
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Jobs List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-semibold text-secondary-900">
                        {isLoading ? 'Memuat...' : `${totalJobs} Lowongan Ditemukan`}
                    </h2>
                    {!isLoading && jobs.length > 0 && (
                        <div className="w-full sm:w-64">
                            <Select
                                value={`${queryParams.sort_by}-${queryParams.sort_order}`}
                                onChange={(e) => {
                                    const [sort_by, sort_order] = e.target.value.split('-');
                                    setQueryParams(prev => ({
                                        ...prev,
                                        sort_by: sort_by as JobSearchParams['sort_by'],
                                        sort_order: sort_order as JobSearchParams['sort_order'],
                                        page: 1
                                    }));
                                }}
                                options={[
                                    { value: 'posted_at-desc', label: 'Terbaru' },
                                    { value: 'posted_at-asc', label: 'Terlama' },
                                    { value: 'compensation_amount-desc', label: 'Gaji Tertinggi' },
                                    { value: 'compensation_amount-asc', label: 'Gaji Terendah' },
                                    { value: 'title-asc', label: 'Judul (A-Z)' },
                                    { value: 'title-desc', label: 'Judul (Z-A)' },
                                ]}
                            />
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="grid gap-4">
                        {[...Array(5)].map((_, i) => (
                            <Card key={i} className="p-4 sm:p-6">
                                <div className="flex gap-3 sm:gap-4 items-start">
                                    <Skeleton className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex-shrink-0" />
                                    <div className="flex-1">
                                        <Skeleton className="h-6 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-1/2 mb-4" />
                                        <div className="flex gap-3 sm:gap-4">
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
                            hasActiveFilters
                                ? 'Tidak ada lowongan ditemukan dengan filter aktif saat ini'
                                : 'Belum ada lowongan tersedia saat ini'
                        }
                        action={
                            hasActiveFilters && (
                                <Button variant="secondary" onClick={() => {
                                    setKeywordInput('');
                                    setLocationInput('');
                                    setMinCompensationInput('');
                                    setMaxCompensationInput('');
                                    setQueryParams({
                                        page: 1,
                                        limit: 10,
                                        status: 'OPEN',
                                        sort_by: 'posted_at',
                                        sort_order: 'desc',
                                    });
                                }}>
                                    Lihat Semua Lowongan
                                </Button>
                            )
                        }
                    />
                ) : (
                    <>
                        <div className="grid gap-4 w-full max-w-full overflow-hidden">
                            {jobs.map((job) => (
                                <JobCard key={job.id} job={job} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-8">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="sm:px-4 sm:py-2.5"
                                    disabled={queryParams.page === 1}
                                    onClick={() => setQueryParams(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                                >
                                    <span className="hidden sm:inline">Sebelumnya</span>
                                    <span className="sm:hidden">&larr;</span>
                                </Button>
                                <span className="text-secondary-600 text-sm font-medium">
                                    Halaman {queryParams.page} dari {totalPages}
                                </span>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="sm:px-4 sm:py-2.5"
                                    disabled={queryParams.page === totalPages}
                                    onClick={() => setQueryParams(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                                >
                                    <span className="hidden sm:inline">Selanjutnya</span>
                                    <span className="sm:hidden">&rarr;</span>
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const JobCard: React.FC<{ job: Job }> = ({ job }) => {
    return (
        <Link to={`/jobs/${job.id}`} className="block w-full min-w-0">
            <Card interactive className={`p-3 sm:p-6 overflow-hidden ${job.is_applied ? 'opacity-70 bg-secondary-50/50' : ''}`}>
                <div className="flex gap-3 sm:gap-4 items-start">
                    {/* Employer Avatar */}
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 sm:w-7 sm:h-7 text-primary-600" />
                    </div>

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-2 sm:line-clamp-none break-words">
                                    {job.title}
                                </h3>
                                <p className="text-sm sm:text-base text-secondary-600">{job.provider?.full_name}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1 md:mt-0">
                                {job.is_applied && (
                                    <Badge variant="success" className="text-[10px] sm:text-xs">Sudah Dilamar</Badge>
                                )}
                                <Badge variant={getStatusBadgeVariant(job.status)} className="text-[10px] sm:text-xs">{job.status}</Badge>
                            </div>
                        </div>

                        <p className="text-sm sm:text-base text-secondary-600 mb-4 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm text-secondary-500">
                            <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                {job.location_label || job.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                {formatCurrency(job.compensation_amount)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                {formatRelativeTime(job.posted_at ?? '')}
                            </span>
                            {/* Payment Method - Cash Only */}
                            <span className="flex items-center gap-1 text-secondary-500">
                                <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="text-[10px] sm:text-xs font-medium">Cash</span>
                            </span>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden sm:flex items-center self-center flex-shrink-0">
                        <ChevronRight className="w-5 h-5 text-secondary-400" />
                    </div>
                </div>
            </Card>
        </Link>
    );
};
