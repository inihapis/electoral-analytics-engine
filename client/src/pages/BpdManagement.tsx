import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bpdService, candidateService } from '@/services/api';
import { formatPercent, formatVotes } from '@/utils/format';
import { 
  Plus, 
  Download, 
  Upload, 
  Search, 
  Edit, 
  Trash2, 
  X,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { CANDIDATE_COLORS } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
  const [editingBpd, setEditingBpd] = useState<Bpd | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const userRole = user?.role || 'USER';

  const canEdit = userRole === 'SUPERADMIN' || userRole === 'ADMIN';
  const canDelete = userRole === 'SUPERADMIN';
  const canUpload = userRole === 'SUPERADMIN' || userRole === 'ADMIN';
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
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => bpdService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bpds'] });
      setEditingBpd(null);
    }
  });

  const createMutation = useMutation({
    mutationFn: bpdService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bpds'] });
      setShowCreateForm(false);
    }
  });

  const bulkUploadMutation = useMutation({
    mutationFn: bpdService.bulkUpload,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bpds'] });
      setShowBulkUpload(false);
      setSelectedFile(null);
      alert(`Upload berhasil! ${data.count} BPD diproses.`);
    },
    onError: (error: any) => {
      alert(`Upload gagal: ${error.response?.data?.error || 'Terjadi kesalahan'}`);
    }
  });

  const saveSnapshotMutation = useMutation({
    mutationFn: bpdService.saveSnapshot,
    onSuccess: () => {
      alert(`Snapshot berhasil disimpan.`);
    },
    onError: (error: any) => {
      alert(`Gagal menyimpan snapshot: ${error.response?.data?.error || 'Terjadi kesalahan'}`);
    }
  });

  const restoreSnapshotMutation = useMutation({
    mutationFn: bpdService.restoreSnapshot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bpds'] });
      alert(`Snapshot berhasil dipulihkan.`);
    },
    onError: (error: any) => {
      alert(`Gagal merestore snapshot: ${error.response?.data?.error || 'Terjadi kesalahan'}`);
    }
  });

  const exportMutation = useMutation({
    mutationFn: bpdService.exportCsv,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bpd_export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  });

  const filteredBpds = bpds?.filter((bpd: Bpd) =>
    bpd.provinceName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleExport = () => {
    exportMutation.mutate(undefined, {
      onSuccess: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bpd_export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this BPD entry?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (bpd: Bpd) => {
    setEditingBpd(bpd);
  };

  const handleUpdate = (data: any) => {
    if (editingBpd) {
      updateMutation.mutate({ id: editingBpd.id, data });
    }
  };

  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Manajemen Database BPD</CardTitle>
              <CardDescription>
                Kelola data provinsi dan dukungan BPD
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {canUpload && (
                <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload CSV / XLSX
                    </Button>
                  </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Data BPD</DialogTitle>
                    <DialogDescription>
                      Upload file CSV untuk mengimpor data BPD secara massal
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-sm text-gray-600">
                        <label htmlFor="file-upload" className="cursor-pointer text-primary hover:text-primary/80">
                          Klik untuk upload
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          accept=".csv,.xlsx"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <p className="text-gray-500"> atau drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">CSV, XLSX (maks. 10MB)</p>
                    </div>
                    {selectedFile && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FileSpreadsheet className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm">{selectedFile.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowBulkUpload(false)}>
                      Batal
                    </Button>
                    <Button
                      onClick={() => selectedFile && bulkUploadMutation.mutate(selectedFile)}
                      disabled={!selectedFile || bulkUploadMutation.isPending}
                    >
                      {bulkUploadMutation.isPending ? 'Mengupload...' : 'Upload'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              )}
              
              {canEdit && (
                <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah BPD
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Tambah BPD Baru</DialogTitle>
                    <DialogDescription>
                      Masukkan data provinsi dan indikator dukungan
                    </DialogDescription>
                  </DialogHeader>
                  <BpdForm
                    onSubmit={handleCreate}
                    onCancel={() => setShowCreateForm(false)}
                    isLoading={createMutation.isPending}
                    candidates={candidates || []}
                  />
                </DialogContent>
              </Dialog>
              )}
              
              {userRole === 'SUPERADMIN' && (
                <Button
                  onClick={() => {
                    if (confirm('Simpan snapshot data saat ini?')) {
                      saveSnapshotMutation.mutate();
                    }
                  }}
                  disabled={saveSnapshotMutation.isPending}
                  variant="outline"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {saveSnapshotMutation.isPending ? 'Menyimpan...' : 'Simpan Snapshot'}
                </Button>
              )}
              {userRole === 'SUPERADMIN' && (
                <Button
                  onClick={() => {
                    if (confirm('Restore snapshot dari file terakhir?')) {
                      restoreSnapshotMutation.mutate();
                    }
                  }}
                  disabled={restoreSnapshotMutation.isPending}
                  variant="outline"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {restoreSnapshotMutation.isPending ? 'Merestore...' : 'Restore Snapshot'}
                </Button>
              )}
              {canExport && (
                <Button
                  onClick={handleExport}
                  disabled={exportMutation.isPending}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exportMutation.isPending ? 'Mengekspor...' : 'Ekspor CSV'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search provinces..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <BpdForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateForm(false)}
          isLoading={createMutation.isPending}
          candidates={candidates || []}
        />
      )}

      {/* Edit Form Modal */}
      {editingBpd && (
        <BpdForm
          bpd={editingBpd}
          onSubmit={handleUpdate}
          onCancel={() => setEditingBpd(null)}
          isLoading={updateMutation.isPending}
          candidates={candidates || []}
        />
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Provinsi</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Caketum Dominan</th>
                <th className="px-6 py-4">Total Dukungan</th>
                <th className="px-6 py-4">Total Efektif</th>
                <th className="px-6 py-4">Skor (%)</th>
                <th className="px-6 py-4">Karakteristik</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                    Loading data...
                  </td>
                </tr>
              ) : filteredBpds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                    No data found.
                  </td>
                </tr>
              ) : (
                filteredBpds.map((bpd: Bpd) => (
                  <tr key={bpd.id} className="hover:bg-gray-50 transition-colors text-xs sm:text-sm">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {bpd.provinceName}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          bpd.supportStatus === 'TERKUNCI'
                            ? 'bg-green-100 text-green-800'
                            : bpd.supportStatus === 'MENGARAH'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {bpd.supportStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {bpd.supportedCandidate ? (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: CANDIDATE_COLORS[bpd.supportedCandidate.color] }}
                          />
                          <span className="font-medium">{bpd.supportedCandidate.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {bpd.supportedCandidateId ? 5 : 0}
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">
                      {formatVotes(bpd.estimatedVotes)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatPercent(bpd.score)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          bpd.characteristic === 'SOLID' ? 'bg-green-50 text-green-600' :
                          bpd.characteristic === 'RENTAN' ? 'bg-red-50 text-red-600' :
                          'bg-orange-50 text-orange-600'
                        }`}>
                          {bpd.characteristic}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(bpd)}
                            className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors group"
                            title="Edit Data"
                          >
                            <Edit className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(bpd.id)}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group disabled:opacity-50"
                            title="Hapus Data"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
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
      </div>
    </div>
  );
}

interface BpdFormProps {
  bpd?: Bpd | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  candidates: Candidate[];
}

function BpdForm({ bpd, onSubmit, onCancel, isLoading, candidates }: BpdFormProps) {
  const [formData, setFormData] = useState({
    provinceName: bpd?.provinceName || '',
    targetMc: bpd?.targetMc || '',
    politicalAffiliation: bpd?.politicalAffiliation || '',
    supportStatus: bpd?.supportStatus || 'DINAMIS',
    characteristic: bpd?.characteristic || 'WASPADA',
    suratBaiat: bpd?.suratBaiat || false,
    afiliasiPolitik: bpd?.afiliasiPolitik || false,
    videoDukungan: bpd?.videoDukungan || false,
    kedekatanMc: bpd?.kedekatanMc || false,
    atributFisik: bpd?.atributFisik || false,
    sosialMedia: bpd?.sosialMedia || false,
    supportedCandidateId: bpd?.supportedCandidateId || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi frontend sebelum submit
    if (!formData.provinceName.trim()) {
      alert('Nama provinsi wajib diisi');
      return;
    }
    
    if (!formData.supportStatus) {
      alert('Status dukungan wajib dipilih');
      return;
    }
    
    if (!formData.characteristic) {
      alert('Karakteristik wajib dipilih');
      return;
    }
    
    onSubmit(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {bpd ? 'Edit BPD' : 'Create New BPD'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Provinsi <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.provinceName}
                onChange={(e) => setFormData({ ...formData, provinceName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Masukkan nama provinsi"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target MC
              </label>
              <input
                type="text"
                value={formData.targetMc}
                onChange={(e) => handleChange('targetMc', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Masukkan target MC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Afiliasi Politik
              </label>
              <input
                type="text"
                value={formData.politicalAffiliation}
                onChange={(e) => handleChange('politicalAffiliation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan afiliasi politik"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Dukungan <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.supportStatus}
                onChange={(e) => handleChange('supportStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih status dukungan</option>
                <option value="TERKUNCI">Terkunci</option>
                <option value="MENGARAH">Mengarah</option>
                <option value="DINAMIS">Dinamis</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Karakteristik <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.characteristic}
                onChange={(e) => handleChange('characteristic', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih karakteristik</option>
                <option value="SOLID">Solid</option>
                <option value="RENTAN">Rentan</option>
                <option value="WASPADA">Waspada</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caketum Pilihan (Dukungan)
              </label>
              <select
                value={formData.supportedCandidateId}
                onChange={(e) => handleChange('supportedCandidateId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Belum Menentukan</option>
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Support Indicators */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Support Indicators</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'suratBaiat', label: 'Surat Baiat', weight: 5.5 },
                { key: 'afiliasiPolitik', label: 'Afiliasi Politik', weight: 4.2 },
                { key: 'videoDukungan', label: 'Video Dukungan', weight: 3.8 },
                { key: 'kedekatanMc', label: 'Kedekatan MC', weight: 3.2 },
                { key: 'atributFisik', label: 'Atribut Fisik', weight: 2.1 },
                { key: 'sosialMedia', label: 'Sosial Media', weight: 1.2 },
              ].map((indicator) => (
                <label
                  key={indicator.key}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(formData[indicator.key as keyof typeof formData])}
                    onChange={(e) =>
                      handleChange(indicator.key, e.target.checked)
                    }
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      {indicator.label}
                    </span>
                    <span className="text-xs text-gray-500 block">
                      Weight: {indicator.weight}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : bpd ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
