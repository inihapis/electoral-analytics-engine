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
  AlertTriangle,
  Eye,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { CANDIDATE_COLORS, getCandidateColor } from '@/utils/constants';
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
  const [selectedBpdDetail, setSelectedBpdDetail] = useState<Bpd | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const userRole = user?.role || 'USER';

  // Debug: Log user info to console
  console.log('User:', user);
  console.log('User Role:', userRole);

  const canEdit = userRole === 'SUPERADMIN' || userRole === 'ADMIN' || userRole === 'USER';
  const canDelete = userRole === 'SUPERADMIN';
  const canUpload = userRole === 'SUPERADMIN';
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
      
      let message = `Upload berhasil! ${data.count} BPD diproses.`;
      if (data.errors && data.errors.length > 0) {
        message += `\n\nCatatan:\n` + data.errors.slice(0, 5).join('\n');
        if (data.errors.length > 5) message += `\n...dan ${data.errors.length - 5} lainnya.`;
      }
      alert(message);
    },
    onError: (error: any) => {
      const data = error.response?.data;
      alert(`Upload gagal: ${data?.error || 'Terjadi kesalahan'}${data?.message ? `\n\nDetail: ${data.message}` : ''}`);
    }
  });

  const saveSnapshotMutation = useMutation({
    mutationFn: bpdService.saveSnapshot,
    onSuccess: () => alert('Snapshot berhasil disimpan.'),
    onError: (error: any) => alert(`Gagal: ${error.response?.data?.error || 'Error'}`)
  });

  const restoreSnapshotMutation = useMutation({
    mutationFn: bpdService.restoreSnapshot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bpds'] });
      alert('Snapshot berhasil dipulihkan.');
    },
    onError: (error: any) => alert(`Gagal: ${error.response?.data?.error || 'Error'}`)
  });

  const handleExport = () => {
    bpdService.exportCsv().then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bpd_export.csv';
      a.click();
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

  const filteredBpds = bpds?.filter((bpd: Bpd) =>
    bpd.provinceName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-black text-slate-800">Manajemen Database BPD</CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Kelola data provinsi dan dukungan BPD
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {canUpload && (
                <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="font-bold border-slate-200">
                      <Upload className="w-4 h-4 mr-2 text-primary" />
                      Bulk Upload
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
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
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold truncate max-w-[200px]">{selectedFile.name}</span>
                          </div>
                          <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-red-500">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-3">
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
                <Button variant="outline" size="icon" onClick={handleExport} disabled={isLoading} title="Ekspor ke CSV">
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 p-2 rounded-xl border border-slate-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari provinsi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
          />
        </div>
        
        {userRole === 'SUPERADMIN' && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => { if(confirm('Simpan snapshot?')) saveSnapshotMutation.mutate() }} className="text-[10px] font-black uppercase text-slate-500 hover:text-primary">
              <AlertTriangle className="w-3 h-3 mr-1" /> Simpan Snapshot
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { if(confirm('Restore snapshot?')) restoreSnapshotMutation.mutate() }} className="text-[10px] font-black uppercase text-slate-500 hover:text-primary">
              <AlertTriangle className="w-3 h-3 mr-1" /> Restore Snapshot
            </Button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Provinsi</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Caketum</th>
                <th className="px-6 py-4 text-center">BPD</th>
                <th className="px-6 py-4">Suara Efektif</th>
                <th className="px-6 py-4">Skor (%)</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-bold animate-pulse uppercase tracking-widest">Memuat data...</td></tr>
              ) : filteredBpds.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Tidak ada data ditemukan</td></tr>
              ) : (
                filteredBpds.map((bpd: Bpd) => (
                  <tr key={bpd.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-800">{bpd.provinceName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                        bpd.supportStatus === 'TERKUNCI' ? 'bg-green-100 text-green-700' :
                        bpd.supportStatus === 'MENGARAH' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{bpd.supportStatus}</span>
                    </td>
                    <td className="px-6 py-4">
                      {bpd.supportedCandidate ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCandidateColor(bpd.supportedCandidate.name) }} />
                          <span className="font-bold text-slate-700">{bpd.supportedCandidate.name}</span>
                        </div>
                      ) : <span className="text-slate-300 font-bold">-</span>}
                    </td>
                    <td className="px-6 py-4 text-center font-black text-slate-600">{bpd.supportedCandidateId ? 5 : 0}</td>
                    <td className="px-6 py-4 font-black text-primary">{formatVotes(bpd.estimatedVotes)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 w-12 bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${bpd.score}%` }} />
                        </div>
                        <span className="text-xs font-black">{formatPercent(bpd.score)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedBpdDetail(bpd)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-all cursor-pointer">
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <button onClick={() => setEditingBpd(bpd)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-all cursor-pointer">
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => { if(confirm('Hapus?')) deleteMutation.mutate(bpd.id) }} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-all cursor-pointer">
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
      </div>

      {/* Forms & Modals */}
      {showCreateForm && <BpdForm onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} isLoading={createMutation.isPending} candidates={candidates || []} />}
      {editingBpd && <BpdForm bpd={editingBpd} onSubmit={handleUpdate} onCancel={() => setEditingBpd(null)} isLoading={updateMutation.isPending} candidates={candidates || []} />}
      
      {/* Detail Modal */}
      {selectedBpdDetail && (
        <Dialog open={!!selectedBpdDetail} onOpenChange={(open) => !open && setSelectedBpdDetail(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">{selectedBpdDetail.provinceName.substring(0, 2).toUpperCase()}</div>
                <div>
                  <DialogTitle className="text-xl font-black">{selectedBpdDetail.provinceName}</DialogTitle>
                  <DialogDescription className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Detail Informasi BPD</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-6 py-4 text-xs font-bold uppercase tracking-tight">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] text-slate-400 mb-1">Dukungan</p>
                  <p className="text-slate-800">{selectedBpdDetail.supportedCandidate?.name || 'BELUM ADA'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] text-slate-400 mb-1">Skor Analitik</p>
                  <p className="text-primary">{selectedBpdDetail.score}% ({formatVotes(selectedBpdDetail.estimatedVotes)} Suara)</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] text-slate-400 tracking-widest">Indikator Terpenuhi</p>
                {[
                  { label: 'Surat Baiat', value: selectedBpdDetail.suratBaiat },
                  { label: 'Afiliasi Politik', value: selectedBpdDetail.afiliasiPolitik },
                  { label: 'Video Dukungan', value: selectedBpdDetail.videoDukungan },
                  { label: 'Kedekatan MC', value: selectedBpdDetail.kedekatanMc },
                  { label: 'Atribut Fisik', value: selectedBpdDetail.atributFisik },
                  { label: 'Sosial Media', value: selectedBpdDetail.sosialMedia }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded bg-slate-50/50">
                    <span className="text-slate-600">{item.label}</span>
                    {item.value ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-slate-200" />}
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter><Button onClick={() => setSelectedBpdDetail(null)} className="w-full font-black">TUTUP</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// BpdForm Component inside the same file for easier management
function BpdForm({ bpd, onSubmit, onCancel, isLoading, candidates }: any) {
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

  const getCandidateColor = (name: string) => {
    const map: any = { 'Ade Jona': '#3b82f6', 'Anthony Leong': '#ef4444', 'Afie Kalla': '#eab308' };
    return map[name] || '#64748b';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto border-none shadow-2xl">
        <CardHeader className="border-b border-slate-100 flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black">{bpd ? 'Edit Data BPD' : 'Tambah BPD Baru'}</CardTitle>
            <CardDescription className="text-[10px] uppercase font-black tracking-widest text-slate-400">Silakan lengkapi informasi di bawah</CardDescription>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
        </CardHeader>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...formData, supportedCandidateId: formData.supportedCandidateId || null }); }} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Provinsi <span className="text-red-500">*</span></label>
              <input type="text" value={formData.provinceName} onChange={e => setFormData({...formData, provinceName: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Dukungan Caketum</label>
              <select value={formData.supportedCandidateId} onChange={e => setFormData({...formData, supportedCandidateId: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none font-bold cursor-pointer">
                <option value="">Belum Menentukan</option>
                {candidates.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status Dukungan <span className="text-red-500">*</span></label>
              <select value={formData.supportStatus} onChange={e => setFormData({...formData, supportStatus: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none font-bold cursor-pointer">
                <option value="TERKUNCI">TERKUNCI</option>
                <option value="MENGARAH">MENGARAH</option>
                <option value="DINAMIS">DINAMIS</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Karakteristik <span className="text-red-500">*</span></label>
              <select value={formData.characteristic} onChange={e => setFormData({...formData, characteristic: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none font-bold cursor-pointer">
                <option value="SOLID">SOLID</option>
                <option value="WASPADA">WASPADA</option>
                <option value="RENTAN">RENTAN</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Indikator Dukungan</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: 'suratBaiat', label: 'Surat Baiat' },
                { key: 'afiliasiPolitik', label: 'Afiliasi Politik' },
                { key: 'videoDukungan', label: 'Video Dukungan' },
                { key: 'kedekatanMc', label: 'Kedekatan MC' },
                { key: 'atributFisik', label: 'Atribut Fisik' },
                { key: 'sosialMedia', label: 'Sosial Media' }
              ].map((item) => (
                <label key={item.key} className={`flex items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${formData[item.key as keyof typeof formData] ? 'bg-primary/5 border-primary' : 'bg-white border-slate-100'}`}>
                  <input type="checkbox" checked={formData[item.key as keyof typeof formData] as boolean} onChange={e => setFormData({...formData, [item.key]: e.target.checked})} className="w-4 h-4 rounded text-primary cursor-pointer" />
                  <span className="text-[11px] font-bold text-slate-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 font-bold cursor-pointer">BATAL</Button>
            <Button type="submit" disabled={isLoading} className="flex-1 font-black shadow-lg shadow-primary/20 cursor-pointer">{isLoading ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

