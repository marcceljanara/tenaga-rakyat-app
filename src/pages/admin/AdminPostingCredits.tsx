import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creditsService } from '../../api';
import { Card, CardContent, Button, Modal, Input, Skeleton } from '../../components/ui';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency, handleApiError } from '../../utils';
import toast from 'react-hot-toast';

export const AdminPostingCredits: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    credit_amount: 0,
    price: 0,
    is_active: true,
  });

  const { data: packagesData, isLoading } = useQuery({
    queryKey: ['admin-posting-credits'],
    queryFn: () => creditsService.getAllPostingCreditPackages(),
  });

  const packages = packagesData?.data?.packages || [];

  const createMutation = useMutation({
    mutationFn: () => creditsService.createPostingCreditPackage(formData),
    onSuccess: () => {
      toast.success('Paket berhasil ditambahkan');
      queryClient.invalidateQueries({ queryKey: ['admin-posting-credits'] });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => handleApiError(err, 'Gagal menambahkan paket'),
  });

  const editMutation = useMutation({
    mutationFn: () => creditsService.updatePostingCreditPackage(selectedPackage.id, formData),
    onSuccess: () => {
      toast.success('Paket berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['admin-posting-credits'] });
      setIsEditModalOpen(false);
    },
    onError: (err: any) => handleApiError(err, 'Gagal memperbarui paket'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => creditsService.deletePostingCreditPackage(selectedPackage.id),
    onSuccess: () => {
      toast.success('Paket berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['admin-posting-credits'] });
      setIsDeleteModalOpen(false);
    },
    onError: (err: any) => handleApiError(err, 'Gagal menghapus paket'),
  });

  const resetForm = () => {
    setFormData({ name: '', credit_amount: 0, price: 0, is_active: true });
    setSelectedPackage(null);
  };

  const handleEdit = (pkg: any) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      credit_amount: pkg.credit_amount,
      price: Number(pkg.price),
      is_active: pkg.is_active,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (pkg: any) => {
    setSelectedPackage(pkg);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Manajemen Posting Credit</h1>
          <p className="text-secondary-600">Kelola paket kredit untuk Employer</p>
        </div>
        <Button leftIcon={PlusCircle} onClick={() => { resetForm(); setIsCreateModalOpen(true); }}>
          Tambah Paket
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                <th className="p-4 text-sm font-semibold text-secondary-600">Nama Paket</th>
                <th className="p-4 text-sm font-semibold text-secondary-600">Jumlah Kredit</th>
                <th className="p-4 text-sm font-semibold text-secondary-600">Harga</th>
                <th className="p-4 text-sm font-semibold text-secondary-600">Status</th>
                <th className="p-4 text-sm font-semibold text-secondary-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-6 w-16" /></td>
                  </tr>
                ))
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-secondary-500">
                    Belum ada paket kredit
                  </td>
                </tr>
              ) : (
                packages.map((pkg: any) => (
                  <tr key={pkg.id} className="hover:bg-secondary-50">
                    <td className="p-4 font-medium text-secondary-900">{pkg.name}</td>
                    <td className="p-4 text-secondary-600">{pkg.credit_amount} Credit</td>
                    <td className="p-4 text-secondary-600">{formatCurrency(Number(pkg.price))}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${pkg.is_active ? 'bg-success-100 text-success-700' : 'bg-secondary-100 text-secondary-700'}`}>
                        {pkg.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(pkg)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-danger-600" onClick={() => handleDelete(pkg)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
        title={isCreateModalOpen ? "Tambah Paket Kredit" : "Edit Paket Kredit"}
      >
        <div className="space-y-4">
          <Input
            label="Nama Paket"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contoh: Paket Basic"
          />
          <Input
            label="Jumlah Kredit"
            type="number"
            min="1"
            value={formData.credit_amount || ''}
            onChange={e => setFormData({ ...formData, credit_amount: parseInt(e.target.value) || 0 })}
          />
          <Input
            label="Harga (Rp)"
            type="number"
            min="0"
            value={formData.price || ''}
            onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
          />
          {isEditModalOpen && (
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded border-secondary-300 focus:ring-primary-500"
              />
              <label htmlFor="is_active" className="text-sm text-secondary-700">Paket Aktif</label>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}>Batal</Button>
            <Button
              onClick={() => isCreateModalOpen ? createMutation.mutate() : editMutation.mutate()}
              isLoading={createMutation.isPending || editMutation.isPending}
            >
              Simpan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Paket"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">Apakah Anda yakin ingin menghapus paket <b>{selectedPackage?.name}</b>? Tindakan ini tidak dapat dibatalkan.</p>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Batal</Button>
            <Button className="bg-danger-600 hover:bg-danger-700" onClick={() => deleteMutation.mutate()} isLoading={deleteMutation.isPending}>
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
