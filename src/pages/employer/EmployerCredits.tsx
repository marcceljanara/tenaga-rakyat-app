import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { creditsService } from '../../api';
import { Card, CardContent, Button, Skeleton, Badge } from '../../components/ui';
import { Coins, ShoppingCart, History } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '../../utils';
import toast from 'react-hot-toast';

export const EmployerCredits: React.FC = () => {
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ['employer-credits-balance'],
    queryFn: () => creditsService.getCreditBalance(),
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['employer-credits-history'],
    queryFn: () => creditsService.getCreditHistory(1, 10),
  });

  const { data: packagesData, isLoading: packagesLoading } = useQuery({
    queryKey: ['employer-posting-credits'],
    queryFn: () => creditsService.getPostingCreditPackages(),
  });

  const purchaseMutation = useMutation({
    mutationFn: (packageId: number) => creditsService.topUpCredit({ package_id: packageId }),
    onSuccess: (res) => {
      if (res.data?.redirectUrl) {
        window.location.href = res.data.redirectUrl;
      } else {
        toast.success('Berhasil memproses pembelian.');
      }
    },
    onError: (err: any) => toast.error(err.response?.data?.errors || 'Gagal memulai pembelian'),
  });

  const balance = balanceData?.data;
  const packages = packagesData?.data?.packages || [];
  const histories = historyData?.data || [];

  const totalCredits = (balance?.free_quota || 0) + (balance?.paid_credit || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Kredit Posting</h1>
          <p className="text-secondary-600">Kelola kuota posting lowongan pekerjaan Anda</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white md:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col h-full justify-between">
              <div>
                <h2 className="text-primary-100 font-medium mb-1">Total Kredit Saat Ini</h2>
                <div className="text-4xl font-bold flex items-center gap-2">
                  <Coins className="w-8 h-8 text-primary-200" />
                  {balanceLoading ? <Skeleton className="w-16 h-10 bg-primary-400" /> : totalCredits}
                </div>
              </div>
              <div className="mt-8 space-y-2 text-sm text-primary-100">
                <div className="flex justify-between border-b border-primary-500 pb-2">
                  <span>Kuota Gratis</span>
                  <span className="font-semibold">{balance?.free_quota || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kredit Berbayar</span>
                  <span className="font-semibold">{balance?.paid_credit || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buy Credits */}
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="text-primary-600 w-5 h-5" />
              <h2 className="text-lg font-semibold text-secondary-900">Beli Kredit</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {packagesLoading ? (
                Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
              ) : packages.length === 0 ? (
                <p className="text-secondary-500 col-span-2 py-4">Paket kredit belum tersedia.</p>
              ) : (
                packages.map((pkg) => (
                  <div key={pkg.id} className="border border-secondary-200 rounded-xl p-4 flex flex-col justify-between hover:border-primary-300 transition-colors">
                    <div>
                      <h3 className="font-bold text-lg text-secondary-900">{pkg.name}</h3>
                      <p className="text-primary-600 font-bold mt-1 text-xl">{formatCurrency(Number(pkg.price))}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-secondary-600 flex items-center gap-1"><Coins className="w-4 h-4" /> {pkg.credit_amount} Credit</span>
                      <Button
                        size="sm"
                        onClick={() => purchaseMutation.mutate(pkg.id)}
                        isLoading={purchaseMutation.isPending}
                      >
                        Beli
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="text-secondary-500 w-5 h-5" />
            <h2 className="text-lg font-semibold text-secondary-900">Riwayat Pembelian</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary-50 border-b border-secondary-200">
                  <th className="p-4 text-sm font-semibold text-secondary-600">ID Referensi</th>
                  <th className="p-4 text-sm font-semibold text-secondary-600">Tanggal</th>
                  <th className="p-4 text-sm font-semibold text-secondary-600">Kredit</th>
                  <th className="p-4 text-sm font-semibold text-secondary-600">Total Harga</th>
                  <th className="p-4 text-sm font-semibold text-secondary-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {historyLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-4"><Skeleton className="h-6 w-16" /></td>
                    </tr>
                  ))
                ) : histories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-secondary-500">
                      Belum ada riwayat pembelian
                    </td>
                  </tr>
                ) : (
                  histories.map((hist: any, i) => (
                    <tr key={i} className="hover:bg-secondary-50">
                      <td className="p-4 font-mono text-xs text-secondary-600">{hist.payment_reference}</td>
                      <td className="p-4 text-sm text-secondary-600">{hist.paid_at ? formatRelativeTime(hist.paid_at) : '-'}</td>
                      <td className="p-4 font-medium text-secondary-900">+{hist.credit_amount}</td>
                      <td className="p-4 font-medium text-secondary-900">{formatCurrency(Number(hist.total_price))}</td>
                      <td className="p-4">
                        <Badge variant={hist.status === 'PAID' ? 'success' : hist.status === 'PENDING' ? 'warning' : 'danger'}>
                          {hist.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
