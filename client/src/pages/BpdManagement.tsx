import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bpdService, candidateService } from '@/services/api';
import { formatPercent, formatVotes } from '@/utils/format';
import { useAppToast } from '@/hooks/use-app-toast';
import { 
  Plus, 
  Download, 
  Upload, 
  Search, 
  Edit, 
  Trash2, 
  X,
  FileSpreadsheet,
  AlertTriangle,
  Eye,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { getCandidateColor } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface Bpd {
  id: string;
  provinceName: string;
  totalVotes: number;
  targetMc?: string;
  politicalAffiliation?: string;
  supportStatus: 'TERKUNCI' | 'MENGARAH' | 'DINAMIS';
  characteristic: 'SOLID' | 'RENTAN' | 'WASPADA';
  suratBaiat: boolean;
  afiliasiPolitik: boolean;
  videoDukungan: boolean;
  kedekatanMc: boolean;
  atributFisik: boolean;
  sosialMedia: boolean;
  score: number;
  estimatedVotes: number;
  supportedCandidateId?: string;
  supportedCandidate?: { name: string; color: string };
  updatedBy: { username: string };
  updatedAt: string;
}

interface Candidate {
  id: string;
  name: string;
  color: string;
}

export default function BpdManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCandidate, setFilterCandidate] = useState<string>('');
  const [filterCharacteristic, setFilterCharacteristic] = useState<string>('');
  const [editingBpd, setEditingBpd] = useState<Bpd | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [selectedBpdDetail, setSelectedBpdDetail] = useState<Bpd | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Bpd; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const queryClient = useQueryClient();
  const appToast = useAppToast();

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const userRole = user?.role || 'USER';

  // Debug: Log user info to console
  console.log('User:', user);
  console.log('User Role:', userRole);

  const canEdit = userRole === 'SUPERADMIN' || userRole === 'ADMIN' || userRole === 'USER';
  const canDelete = userRole === 'SUPERADMIN';
  const canUpload = userRole === 'SUPERADMIN' || userRole === 'ADMIN';
  const canCreate = userRole === 'SUPERADMIN';
  const canExport = userRole === 'SUPERADMIN' || userRole === 'ADMIN';

  const { data: bpds, isLoading } = useQuery({
    queryKey: ['bpds'],
    queryFn: bpdService.getAll
  });

  const { data: candidates } = useQuery<Candidate[]>({
    queryKey: ['candidates'],
    queryFn: candidateService.getAll
  });

  const deleteMutation = useMutation({
    mutationFn: bpdService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bpds'] });
      appToast.success(`BPD berhasil dihapus`, 'Hapus Berhasil', 3000);
    },
    onError: (error: any) => {
      const data = error.response?.data;
      const errorMessage = `Gagal menghapus BPD: ${data?.error || 'Terjadi kesalahan'}`;
      appToast.error(errorMessage, 'Hapus Gagal', 5000);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => bpdService.update(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['bpds'] });
      setEditingBpd(null);
      
      // Extract detailed change information
      const changedFields = result?.lastUpdatedFields || 'Data berhasil diperbarui';
      const provinceName = result?.provinceName || 'BPD';
      
      // Create detailed success message
      let message = `${provinceName} berhasil diperbarui`;
      if (changedFields && changedFields !== 'Tidak ada perubahan field utama') {
        message += `\n\nPerubahan:\n${changedFields}`;
      }
      
      appToast.success(message, 'Update Berhasil', 5000);
    },
    onError: (error: any) => {
      const data = error.response?.data;
      const errorMessage = `Gagal memperbarui BPD: ${data?.error || 'Terjadi kesalahan'}${data?.details ? `\n\nDetail: ${data.details}` : ''}`;
      appToast.error(errorMessage, 'Update Gagal', 5000);
    }
  });

  const createMutation = useMutation({
    mutationFn: bpdService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bpds'] });
      setShowCreateForm(false);
      appToast.success(`BPD baru berhasil ditambahkan`, 'Tambah Berhasil', 3000);
    },
    onError: (error: any) => {
      const data = error.response?.data;
      const errorMessage = `Gagal menambah BPD: ${data?.error || 'Terjadi kesalahan'}${data?.details ? `\n\nDetail: ${data.details}` : ''}`;
      appToast.error(errorMessage, 'Tambah Gagal', 5000);
    }
  });

  const bulkUploadMutation = useMutation({
    mutationFn: bpdService.bulkUpload,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bpds'] });
      setShowBulkUpload(false);
      setSelectedFile(null);
      
      let message = `Upload berhasil! ${data.count} BPD diproses.`;
      if (data.errors && data.errors.length > 0) {
        message += `\n\nCatatan:\n` + data.errors.slice(0, 5).join('\n');
        if (data.errors.length > 5) message += `\n...dan ${data.errors.length - 5} lainnya.`;
      }
      appToast.success(message, 'Upload Berhasil', 10000);
    },
    onError: (error: any) => {
      console.log('CSV Upload Error:', error);
      const data = error.response?.data;
      const errorMessage = `Upload gagal: ${data?.error || 'Terjadi kesalahan'}${data?.message ? `\n\nDetail: ${data.message}` : ''}`;
      console.log('Error Message:', errorMessage);
      
      appToast.error(errorMessage, 'Upload Gagal', 15000);
    }
  });

  const saveSnapshotMutation = useMutation({
    mutationFn: bpdService.saveSnapshot,
    onSuccess: () => appToast.success('Snapshot data BPD berhasil disimpan.', 'Snapshot Berhasil'),
    onError: (error: any) => appToast.error(`Terjadi kesalahan: ${error.response?.data?.error || 'Error'}`, 'Gagal Menyimpan Snapshot'),
  });

  const restoreSnapshotMutation = useMutation({
    mutationFn: bpdService.restoreSnapshot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bpds'] });
      appToast.success('Snapshot data BPD berhasil dipulihkan.', 'Snapshot Dipulihkan');
    },
    onError: (error: any) => appToast.error(`Terjadi kesalahan: ${error.response?.data?.error || 'Error'}`, 'Gagal Memulihkan Snapshot'),
  });

  const handleExport = () => {
    bpdService.exportCsv().then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bpd_export.csv';
      a.click();
      appToast.success('Data BPD berhasil diekspor ke CSV', 'Export Berhasil', 3000);
    }).catch((error: any) => {
      const errorMessage = `Gagal mengekspor data: ${error?.message || 'Terjadi kesalahan'}`;
      appToast.error(errorMessage, 'Export Gagal', 5000);
    });
  };

  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: any) => {
    if (editingBpd) {
      updateMutation.mutate({ id: editingBpd.id, data });
    }
  };

  const filteredBpds = bpds?.filter((bpd: Bpd) => {
    const matchesSearch = bpd.provinceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || bpd.supportStatus === filterStatus;
    const matchesCandidate = !filterCandidate || bpd.supportedCandidateId === filterCandidate;
    const matchesCharacteristic = !filterCharacteristic || bpd.characteristic === filterCharacteristic;
    return matchesSearch && matchesStatus && matchesCandidate && matchesCharacteristic;
  }) || [];

  const handleSort = (key: keyof Bpd) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedBpds = React.useMemo(() => {
    let sortableBpds = [...filteredBpds];
    if (sortConfig !== null) {
      sortableBpds.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nested objects
        if (sortConfig.key === 'supportedCandidate') {
          aValue = a.supportedCandidate?.name || '';
          bValue = b.supportedCandidate?.name || '';
        } else if (sortConfig.key === 'updatedBy') {
          aValue = a.updatedBy?.username || '';
          bValue = b.updatedBy?.username || '';
        }

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableBpds;
  }, [filteredBpds, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedBpds.length / itemsPerPage);
  const paginatedBpds = sortedBpds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters or sorting changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCandidate, filterCharacteristic, sortConfig]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <CardHeader className="p-5 lg:p-8 border-b border-slate-50 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">Database BPD</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mt-1">
                Kelola data provinsi & dukungan
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {canUpload && (
                <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="font-bold border-slate-200">
                      <Upload className="w-4 h-4 mr-2 text-primary" />
                      Bulk Upload
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl mx-4 sm:mx-auto">
                    <DialogHeader>
                      <DialogTitle className="font-black">Upload Data BPD</DialogTitle>
                      <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Impor data massal via CSV/XLSX
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => document.getElementById('file-upload')?.click()}>
                        <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3 group-hover:text-primary transition-colors" />
                        <p className="text-sm font-black text-slate-600">Pilih File CSV/XLSX</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Maksimal 5MB</p>
                        <input id="file-upload" type="file" className="hidden" accept=".csv,.xlsx" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                      </div>
                      
                      {selectedFile && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-sm border border-slate-100">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold truncate max-w-[200px]">{selectedFile.name}</span>
                          </div>
                          <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-red-500 cursor-pointer">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className="bg-blue-50 p-3 rounded-sm border border-blue-100 flex gap-3">
                        <Download className="w-5 h-5 text-blue-500 shrink-0" />
                        <div>
                          <p className="text-xs font-black text-blue-800 uppercase tracking-tighter">Gunakan Template</p>
                          <p className="text-[10px] text-blue-600 mb-2">Gunakan format kolom standar agar data terbaca 100%.</p>
                          <a href="/templates/bpd_template.csv" download className="text-[10px] font-black text-blue-700 underline hover:text-blue-900 uppercase tracking-tighter">Download Template CSV</a>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" className="font-bold text-xs uppercase" onClick={() => setShowBulkUpload(false)}>Batal</Button>
                      <Button onClick={() => selectedFile && bulkUploadMutation.mutate(selectedFile)} disabled={!selectedFile || bulkUploadMutation.isPending} className="font-black">
                        {bulkUploadMutation.isPending ? 'Memproses...' : 'Mulai Import'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {canCreate && (
                <Button onClick={() => setShowCreateForm(true)} className="font-black shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Data BPD
                </Button>
              )}
              
              <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block" />

              {canExport && (
                <Button variant="outline" onClick={handleExport} disabled={isLoading} className="font-bold border-slate-200">
                  <Download className="w-4 h-4 mr-2 text-primary" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Toolbar */}
      <Card className="bg-white border-slate-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-black text-slate-700 uppercase tracking-wider">Pencarian & Filter</CardTitle>
        </CardHeader>
        <div className="px-6 pb-4 flex flex-col gap-4">
          {/* Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari provinsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 font-medium text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <Select value={filterStatus || "all"} onValueChange={(value) => setFilterStatus(value === "all" ? "" : value)}>
              <SelectTrigger className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-sm text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer h-8">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="TERKUNCI">TERKUNCI</SelectItem>
                <SelectItem value="MENGARAH">MENGARAH</SelectItem>
                <SelectItem value="DINAMIS">DINAMIS</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterCandidate || "all"} onValueChange={(value) => setFilterCandidate(value === "all" ? "" : value)}>
              <SelectTrigger className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-sm text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer h-8">
                <SelectValue placeholder="Semua Caketum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Caketum</SelectItem>
                {candidates?.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterCharacteristic || "all"} onValueChange={(value) => setFilterCharacteristic(value === "all" ? "" : value)}>
              <SelectTrigger className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-sm text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer h-8">
                <SelectValue placeholder="Semua Karakteristik" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Karakteristik</SelectItem>
                <SelectItem value="SOLID">SOLID</SelectItem>
                <SelectItem value="RENTAN">RENTAN</SelectItem>
                <SelectItem value="WASPADA">WASPADA</SelectItem>
              </SelectContent>
            </Select>
            
            {(filterStatus || filterCandidate || filterCharacteristic) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterStatus('');
                  setFilterCandidate('');
                  setFilterCharacteristic('');
                }}
                className="text-[10px] font-black uppercase text-red-500 hover:text-red-700 h-8"
              >
                Reset Filter
              </Button>
            )}
          </div>

          {/* Snapshot - Only for SUPERADMIN */}
          {userRole === 'SUPERADMIN' && (
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => {
                appToast.showToast({
                  title: 'Konfirmasi Simpan Snapshot',
                  description: 'Apakah Anda yakin ingin menyimpan snapshot? Ini akan menimpa snapshot sebelumnya.',
                  action: (
                    <Button variant="ghost" onClick={() => saveSnapshotMutation.mutate()} className="text-xs font-bold">
                      Ya, Simpan
                    </Button>
                  ),
                  duration: 10000,
                  type: 'info',
                });
              }} className="text-xs font-bold">
                <AlertTriangle className="w-3 h-3 mr-2" /> Simpan Snapshot
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                appToast.showToast({
                  title: 'Konfirmasi Pulihkan Snapshot',
                  description: 'Apakah Anda yakin ingin memulihkan snapshot? Ini akan mengembalikan data ke kondisi snapshot terakhir.',
                  action: (
                    <Button variant="ghost" onClick={() => restoreSnapshotMutation.mutate()} className="text-xs font-bold">
                      Ya, Pulihkan
                    </Button>
                  ),
                  duration: 10000,
                  type: 'info',
                });
              }} className="text-xs font-bold">
                <AlertTriangle className="w-3 h-3 mr-2" /> Restore Snapshot
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Main Table - Responsive Design */}
      <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Desktop/Tablet Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">
                  <button 
                    onClick={() => handleSort('provinceName')}
                    className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                  >
                    Provinsi
                    {sortConfig?.key === 'provinceName' && (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                    {sortConfig?.key !== 'provinceName' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button 
                    onClick={() => handleSort('supportStatus')}
                    className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                  >
                    Status
                    {sortConfig?.key === 'supportStatus' && (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                    {sortConfig?.key !== 'supportStatus' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button 
                    onClick={() => handleSort('supportedCandidate')}
                    className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                  >
                    Caketum
                    {sortConfig?.key === 'supportedCandidate' && (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                    {sortConfig?.key !== 'supportedCandidate' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </button>
                </th>
                <th className="px-4 py-3 text-center">
                  <button 
                    onClick={() => handleSort('characteristic')}
                    className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                  >
                    Karakteristik
                    {sortConfig?.key === 'characteristic' && (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                    {sortConfig?.key !== 'characteristic' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button 
                    onClick={() => handleSort('estimatedVotes')}
                    className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                  >
                    Suara Efektif
                    {sortConfig?.key === 'estimatedVotes' && (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                    {sortConfig?.key !== 'estimatedVotes' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button 
                    onClick={() => handleSort('score')}
                    className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                  >
                    Skor (%)
                    {sortConfig?.key === 'score' && (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                    {sortConfig?.key !== 'score' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </button>
                </th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-bold animate-pulse uppercase tracking-widest">Memuat data...</td></tr>
              ) : paginatedBpds.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Tidak ada data ditemukan</td></tr>
              ) : (
                paginatedBpds.map((bpd: Bpd) => (
                  <tr key={bpd.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-black text-slate-800 text-sm">{bpd.provinceName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                        bpd.supportStatus === 'TERKUNCI' ? 'bg-green-100 text-green-700' :
                        bpd.supportStatus === 'MENGARAH' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{bpd.supportStatus}</span>
                    </td>
                    <td className="px-4 py-3">
                      {bpd.supportedCandidate ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCandidateColor(bpd.supportedCandidate.name) }} />
                          <span className="font-bold text-slate-700 text-sm">{bpd.supportedCandidate.name}</span>
                        </div>
                      ) : <span className="text-slate-300 font-bold">-</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                        bpd.characteristic === 'SOLID' ? 'bg-emerald-100 text-emerald-700' :
                        bpd.characteristic === 'RENTAN' ? 'bg-orange-100 text-orange-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>{bpd.characteristic}</span>
                    </td>
                    <td className="px-4 py-3 font-black text-primary text-sm">{formatVotes(bpd.estimatedVotes)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 w-12 bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${bpd.score}%` }} />
                        </div>
                        <span className="text-xs font-black">{formatPercent(bpd.score)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedBpdDetail(bpd)} className="p-2 hover:bg-slate-100 rounded-sm text-slate-400 hover:text-primary transition-all cursor-pointer">
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <button onClick={() => setEditingBpd(bpd)} className="p-2 hover:bg-slate-100 rounded-sm text-slate-400 hover:text-blue-600 transition-all cursor-pointer">
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                      <button onClick={() => {
                        appToast.showToast({
                          title: 'Konfirmasi Penghapusan',
                          description: `Apakah Anda yakin ingin menghapus BPD ${bpd.provinceName}?`,
                          action: (
                            <Button variant="ghost" onClick={() => deleteMutation.mutate(bpd.id)} className="text-xs font-bold text-red-600">
                              Ya, Hapus
                            </Button>
                          ),
                          duration: 10000,
                          type: 'info',
                        });
                      }} className="p-2 hover:bg-red-50 rounded-sm text-slate-400 hover:text-red-600 transition-all cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Card View */}
        <div className="lg:hidden space-y-3 p-4">
          {isLoading ? (
            <div className="text-center py-20 text-slate-400 font-bold animate-pulse uppercase tracking-widest">Memuat data...</div>
          ) : paginatedBpds.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">Tidak ada data ditemukan</div>
          ) : (
            paginatedBpds.map((bpd: Bpd) => (
              <div key={bpd.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-black text-slate-800 text-base">{bpd.provinceName}</h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      bpd.supportStatus === 'TERKUNCI' ? 'bg-green-100 text-green-700' :
                      bpd.supportStatus === 'MENGARAH' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{bpd.supportStatus}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setSelectedBpdDetail(bpd)} className="p-2 hover:bg-white rounded-sm text-slate-400 hover:text-primary transition-all cursor-pointer">
                      <Eye className="w-4 h-4" />
                    </button>
                    {canEdit && (
                      <button onClick={() => setEditingBpd(bpd)} className="p-2 hover:bg-white rounded-sm text-slate-400 hover:text-blue-600 transition-all cursor-pointer">
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => { if(confirm('Hapus?')) deleteMutation.mutate(bpd.id) }} className="p-2 hover:bg-red-50 rounded-sm text-slate-400 hover:text-red-600 transition-all cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2 rounded-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Caketum</p>
                    {bpd.supportedCandidate ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getCandidateColor(bpd.supportedCandidate.name) }} />
                        <span className="font-bold text-slate-700">{bpd.supportedCandidate.name}</span>
                      </div>
                    ) : <span className="text-slate-300 font-bold">-</span>}
                  </div>
                  <div className="bg-white p-2 rounded-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Karakteristik</p>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                      bpd.characteristic === 'SOLID' ? 'bg-emerald-100 text-emerald-700' :
                      bpd.characteristic === 'RENTAN' ? 'bg-orange-100 text-orange-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>{bpd.characteristic}</span>
                  </div>
                  <div className="bg-white p-2 rounded-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Suara Efektif</p>
                    <p className="font-black text-primary">{formatVotes(bpd.estimatedVotes)}</p>
                  </div>
                  <div className="bg-white p-2 rounded-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Skor</p>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${bpd.score}%` }} />
                      </div>
                      <span className="font-black text-slate-700">{formatPercent(bpd.score)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-bold">Menampilkan</span>
              <span className="font-black text-primary">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, sortedBpds.length)}</span>
              <span className="font-bold">dari</span>
              <span className="font-black text-primary">{sortedBpds.length}</span>
              <span className="font-bold">data</span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-600">Tampilkan:</span>
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="px-3 py-1 border border-slate-200 rounded-sm text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              
              {/* Page navigation */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-bold border border-slate-200 rounded-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm font-bold border rounded-sm transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-primary text-white border-primary'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-bold border border-slate-200 rounded-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forms & Modals */}
      <BpdForm open={showCreateForm} onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} isLoading={createMutation.isPending} candidates={candidates || []} />
      <BpdForm open={!!editingBpd} bpd={editingBpd} onSubmit={handleUpdate} onCancel={() => setEditingBpd(null)} isLoading={updateMutation.isPending} candidates={candidates || []} />
      
      {/* Detail Modal */}
      {selectedBpdDetail && (
        <Dialog open={!!selectedBpdDetail} onOpenChange={(open: boolean) => !open && setSelectedBpdDetail(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">{selectedBpdDetail.provinceName.substring(0, 2).toUpperCase()}</div>
                <div>
                  <DialogTitle className="text-xl font-black">{selectedBpdDetail.provinceName}</DialogTitle>
                  <DialogDescription className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Detail Informasi BPD</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4 py-4 text-xs font-bold uppercase tracking-tight">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] text-slate-400 mb-1">Status Dukungan</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black ${
                      selectedBpdDetail.supportStatus === 'TERKUNCI' ? 'bg-green-100 text-green-700' :
                      selectedBpdDetail.supportStatus === 'MENGARAH' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {selectedBpdDetail.supportStatus}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] text-slate-400 mb-1">Karakteristik</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black ${
                      selectedBpdDetail.characteristic === 'SOLID' ? 'bg-emerald-100 text-emerald-700' :
                      selectedBpdDetail.characteristic === 'RENTAN' ? 'bg-orange-100 text-orange-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {selectedBpdDetail.characteristic}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] text-slate-400 mb-1">Dukungan Caketum</p>
                  {selectedBpdDetail.supportedCandidate ? (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getCandidateColor(selectedBpdDetail.supportedCandidate.name) }}
                      />
                      <span className="text-slate-800">{selectedBpdDetail.supportedCandidate.name}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400">BELUM ADA</span>
                  )}
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] text-slate-400 mb-1">Target MC</p>
                  <p className="text-slate-800">{selectedBpdDetail.targetMc || '-'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] text-slate-400 mb-1">Afiliasi Politik</p>
                  <p className="text-slate-800">{selectedBpdDetail.politicalAffiliation || '-'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] text-slate-400 mb-1">Skor Analitik</p>
                  <p className="text-primary">{selectedBpdDetail.score}% ({formatVotes(selectedBpdDetail.estimatedVotes)} Suara)</p>
                </div>
              </div>

              {/* Indicators */}
              <div className="space-y-2">
                <p className="text-[9px] text-slate-400 tracking-widest">Indikator Terpenuhi</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: 'Surat Baiat', value: selectedBpdDetail.suratBaiat, points: 5.5 },
                    { label: 'Afiliasi Politik', value: selectedBpdDetail.afiliasiPolitik, points: 4.2 },
                    { label: 'Video Dukungan', value: selectedBpdDetail.videoDukungan, points: 3.8 },
                    { label: 'Kedekatan MC', value: selectedBpdDetail.kedekatanMc, points: 3.2 },
                    { label: 'Atribut Fisik', value: selectedBpdDetail.atributFisik, points: 2.1 },
                    { label: 'Sosial Media', value: selectedBpdDetail.sosialMedia, points: 1.2 }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">{item.label}</span>
                        <span className="text-[9px] text-slate-400">({item.points} poin)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {item.value ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-[9px] font-black text-green-600">+{item.points}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-slate-200" />
                            <span className="text-[9px] font-black text-slate-300">0</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-[9px] text-slate-400 tracking-widest">Informasi Update</p>
                <div className="flex justify-between items-center p-2 rounded bg-slate-50/50">
                  <span className="text-slate-600">Update Oleh</span>
                  <span className="text-slate-800">{selectedBpdDetail.updatedBy?.username || '-'}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-50/50">
                  <span className="text-slate-600">Update Terakhir</span>
                  <span className="text-slate-800">{new Date(selectedBpdDetail.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              {canEdit && (
                <Button onClick={() => { setEditingBpd(selectedBpdDetail); setSelectedBpdDetail(null); }} className="flex-1 font-black shadow-lg shadow-primary/20 cursor-pointer">
                  <Edit className="w-4 h-4 mr-2" />
                  EDIT
                </Button>
              )}
              <Button onClick={() => setSelectedBpdDetail(null)} className={canEdit ? "flex-1 font-black cursor-pointer" : "w-full font-black cursor-pointer"}>
                TUTUP
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// BpdForm Component inside the same file for easier management
function BpdForm({ bpd, onSubmit, onCancel, isLoading, candidates, open }: any) {
  const [formData, setFormData] = useState({
    provinceName: '',
    targetMc: '',
    politicalAffiliation: '',
    supportStatus: 'DINAMIS',
    characteristic: 'WASPADA',
    suratBaiat: false,
    afiliasiPolitik: false,
    videoDukungan: false,
    kedekatanMc: false,
    atributFisik: false,
    sosialMedia: false,
    supportedCandidateId: '',
  });

  // Reset form when bpd prop changes (for edit mode)
  React.useEffect(() => {
    if (bpd) {
      setFormData({
        provinceName: bpd.provinceName || '',
        targetMc: bpd.targetMc || '',
        politicalAffiliation: bpd.politicalAffiliation || '',
        supportStatus: bpd.supportStatus || 'DINAMIS',
        characteristic: bpd.characteristic || 'WASPADA',
        suratBaiat: bpd.suratBaiat || false,
        afiliasiPolitik: bpd.afiliasiPolitik || false,
        videoDukungan: bpd.videoDukungan || false,
        kedekatanMc: bpd.kedekatanMc || false,
        atributFisik: bpd.atributFisik || false,
        sosialMedia: bpd.sosialMedia || false,
        supportedCandidateId: bpd.supportedCandidateId || '',
      });
    } else {
      // Reset to empty form for create mode
      setFormData({
        provinceName: '',
        targetMc: '',
        politicalAffiliation: '',
        supportStatus: 'DINAMIS',
        characteristic: 'WASPADA',
        suratBaiat: false,
        afiliasiPolitik: false,
        videoDukungan: false,
        kedekatanMc: false,
        atributFisik: false,
        sosialMedia: false,
        supportedCandidateId: '',
      });
    }
  }, [bpd]);

  return (
    <Dialog open={open} onOpenChange={(open: boolean) => !open && onCancel()}>
      <DialogContent className="max-w-6xl max-h-[90vh] mx-4 sm:mx-auto">
        <DialogHeader>
          <div>
            <DialogTitle className="text-xl font-black">{bpd ? 'Edit Data BPD' : 'Tambah BPD Baru'}</DialogTitle>
            <DialogDescription className="text-[10px] uppercase font-black tracking-widest text-slate-400">Silakan lengkapi informasi di bawah</DialogDescription>
          </div>
        </DialogHeader>
        <div className="space-y-6">
          <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...formData, supportedCandidateId: formData.supportedCandidateId || null }); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Provinsi <span className="text-red-500">*</span></label>
              <Input type="text" value={formData.provinceName} onChange={e => setFormData({...formData, provinceName: e.target.value})} className="w-full font-bold" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target MC</label>
              <Input type="text" value={formData.targetMc} onChange={e => setFormData({...formData, targetMc: e.target.value})} className="w-full font-bold" placeholder="Nama target MC" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Dukungan Caketum</label>
              <Select value={formData.supportedCandidateId || "none"} onValueChange={(value) => setFormData({...formData, supportedCandidateId: value === "none" ? "" : value})}>
                <SelectTrigger className="w-full font-bold">
                  <SelectValue placeholder="Belum Menentukan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Belum Menentukan</SelectItem>
                  {candidates?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status Dukungan <span className="text-red-500">*</span></label>
              <Select value={formData.supportStatus} onValueChange={(value) => setFormData({...formData, supportStatus: value as any})}>
                <SelectTrigger className="w-full font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TERKUNCI">TERKUNCI</SelectItem>
                  <SelectItem value="MENGARAH">MENGARAH</SelectItem>
                  <SelectItem value="DINAMIS">DINAMIS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Karakteristik <span className="text-red-500">*</span></label>
              <Select value={formData.characteristic} onValueChange={(value) => setFormData({...formData, characteristic: value as any})}>
                <SelectTrigger className="w-full font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOLID">SOLID</SelectItem>
                  <SelectItem value="WASPADA">WASPADA</SelectItem>
                  <SelectItem value="RENTAN">RENTAN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Indikator Dukungan</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: 'suratBaiat', label: 'Surat Baiat', points: 5.5 },
                { key: 'afiliasiPolitik', label: 'Afiliasi Politik', points: 4.2 },
                { key: 'videoDukungan', label: 'Video Dukungan', points: 3.8 },
                { key: 'kedekatanMc', label: 'Kedekatan MC', points: 3.2 },
                { key: 'atributFisik', label: 'Atribut Fisik', points: 2.1 },
                { key: 'sosialMedia', label: 'Sosial Media', points: 1.2 }
              ].map((item) => (
                <label key={item.key} className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${formData[item.key as keyof typeof formData] ? 'bg-primary/5 border-primary' : 'bg-white border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData[item.key as keyof typeof formData] as boolean} onChange={e => setFormData({...formData, [item.key]: e.target.checked})} className="w-4 h-4 rounded text-primary cursor-pointer" />
                    <span className="text-[11px] font-bold text-slate-700">{item.label}</span>
                  </div>
                  <span className="text-[9px] font-black text-slate-400">({item.points} poin)</span>
                </label>
              ))}
            </div>
          </div>
          </form>

          <DialogFooter className="flex gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 font-bold cursor-pointer">BATAL</Button>
            <Button type="button" onClick={() => onSubmit({ ...formData, supportedCandidateId: formData.supportedCandidateId || null })} disabled={isLoading} className="flex-1 font-black shadow-lg shadow-primary/20 cursor-pointer">{isLoading ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

