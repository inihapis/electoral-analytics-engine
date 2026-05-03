import { 
  FileSpreadsheet, 
  Download, 
  BarChart3, 
  Database,
  ExternalLink,
  BookOpen,
  Calculator,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Information() {
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const userRole = user?.role || 'USER';

  return (
    <div className="space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-primary/90 text-white">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5" />
              <CardTitle className="text-lg font-bold">Dokumentasi Sistem</CardTitle>
            </div>
            <CardDescription className="text-primary-foreground/80 font-medium">
              Panduan lengkap mengenai parameter indikator dan rumus perhitungan probabilitas kemenangan.
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="border-none shadow-xl bg-white">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Database className="h-5 w-5" />
              <CardTitle className="text-lg font-bold">Integritas Data</CardTitle>
            </div>
            <CardDescription className="font-medium">
              Seluruh perhitungan dilakukan secara real-time berdasarkan bobot indikator yang telah divalidasi.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Guides & Downloads */}
        <div className="lg:col-span-1 space-y-8">
          {/* Download Center */}
          <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Download className="h-5 w-5" />
                <CardTitle className="text-lg">Download Center</CardTitle>
              </div>
              <CardDescription>Template dan dokumen pendukung</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-primary/30 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-green-600">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Template CSV BPD</h4>
                    <p className="text-xs text-slate-500 italic">Format standar upload massal</p>
                  </div>
                </div>
                <Button asChild className="w-full shadow-lg shadow-primary/20" size="sm">
                  <a href="/templates/bpd_template.csv" download>
                    <Download className="h-4 w-4 mr-2" />
                    Unduh Template (.csv)
                  </a>
                </Button>
              </div>

              {userRole === 'SUPERADMIN' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
                      <ExternalLink className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Swagger API Docs</h4>
                      <p className="text-xs text-slate-500 italic">Interaksi API backend</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <a href={(import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api-docs'} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Buka API Docs
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {userRole === 'SUPERADMIN' && (
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white">
              <CardHeader>
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Calculator className="h-5 w-5" />
                  <CardTitle className="text-lg">Metodologi Skor</CardTitle>
                </div>
                <CardDescription>Logika dasar perhitungan sistem</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Skor Probabilitas BPD
                  </p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <code className="text-[11px] font-mono text-slate-600 leading-relaxed">
                      Total Poin = Σ Bobot Indikator<br />
                      Skor (%) = Total Poin × 5
                    </code>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Estimasi Suara Efektif
                  </p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <code className="text-[11px] font-mono text-slate-600 leading-relaxed">
                      Estimasi = (Skor / 100) × 5
                    </code>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Target Kemenangan (50%+1)
                  </p>
                  <div className="bg-secondary/5 p-3 rounded-xl border border-secondary/10">
                    <code className="text-[11px] font-mono text-secondary leading-relaxed">
                      Target = 96 Suara Efektif<br />
                      Progress = Total Efektif / 96
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Detailed Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Indicator Parameters */}
          <Card className="border-none shadow-xl shadow-slate-200/50 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-2xl font-black text-slate-900">Parameter Indikator</CardTitle>
                <CardDescription>Bobot penilaian untuk setiap kriteria dukungan</CardDescription>
              </div>
              <div className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                <BarChart3 className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-[10px]">Kategori</th>
                      <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-[10px]">Indikator Penilaian</th>
                      <th className="px-6 py-4 text-center font-bold text-slate-600 uppercase tracking-wider text-[10px]">Bobot</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      { cat: 'Internal', name: 'Surat Baiat / Rekomendasi Resmi', weight: 5.5 },
                      { cat: 'Eksternal', name: 'Afiliasi Politik Lokal & Koalisi', weight: 4.2 },
                      { cat: 'Internal', name: 'Video Pernyataan Dukungan Publik', weight: 3.8 },
                      { cat: 'Eksternal', name: 'Kedekatan Personal dengan Tim MC', weight: 3.2 },
                      { cat: 'Internal', name: 'Penggunaan Atribut Fisik Kampanye', weight: 2.1 },
                      { cat: 'Internal', name: 'Interaksi & Dukungan Sosial Media', weight: 1.2 },
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.cat === 'Internal' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                          }`}>
                            {item.cat}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">{item.name}</td>
                        <td className="px-6 py-4 text-center font-black text-primary">{item.weight.toFixed(1)}</td>
                      </tr>
                    ))}
                    <tr className="bg-primary/5">
                      <td colSpan={2} className="px-6 py-4 font-black text-primary text-right uppercase tracking-wider">Total Skor Maksimal (100%)</td>
                      <td className="px-6 py-4 text-center font-black text-primary text-lg">20.0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Candidate Info */}
          <Card className="border-none shadow-xl shadow-slate-200/50 bg-white">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary mb-1">
                <UserCheck className="h-5 w-5" />
                <CardTitle className="text-2xl font-black text-slate-900">Profil Kandidat Utama</CardTitle>
              </div>
              <CardDescription>Daftar Calon Ketua Umum (Caketum) HIPMI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Reynaldo Bryan', party: 'Nasdem', color: 'bg-blue-500', text: 'text-blue-600' },
                  { name: 'Ade Jona', party: 'Gerindra', color: 'bg-red-500', text: 'text-red-600' },
                  { name: 'Afie Kalla', party: 'Golkar', color: 'bg-yellow-500', text: 'text-yellow-600' },
                  { name: 'Anthony Leong', party: 'Gerindra', color: 'bg-green-500', text: 'text-green-600' },
                ].map((c, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-primary/20 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-12 rounded-full ${c.color}`} />
                      <div>
                        <h4 className={`text-lg font-black tracking-tight ${c.text}`}>{c.name}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{c.party}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Interpretation */}
          <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <div className="bg-primary/5 px-8 py-4 border-b border-primary/10">
              <h3 className="font-black text-primary flex items-center gap-2">
                <Database className="h-5 w-5" />
                INTEPRETASI DATA & STATUS
              </h3>
            </div>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Status Dukungan</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                      <p className="text-xs leading-relaxed text-slate-600"><span className="font-bold text-slate-800">Terkunci:</span> Dukungan sudah final dan diikat dengan dokumen resmi.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                      <p className="text-xs leading-relaxed text-slate-600"><span className="font-bold text-slate-800">Mengarah:</span> Kecenderungan kuat, namun masih dalam tahap negosiasi.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5" />
                      <p className="text-xs leading-relaxed text-slate-600"><span className="font-bold text-slate-800">Dinamis:</span> Belum menentukan pilihan atau masih sangat fluktuatif.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Karakteristik</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5" />
                      <p className="text-xs leading-relaxed text-slate-600"><span className="font-bold text-slate-800">Solid:</span> Struktur BPD kompak dan loyal terhadap keputusan pimpinan.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5" />
                      <p className="text-xs leading-relaxed text-slate-600"><span className="font-bold text-slate-800">Rentan:</span> Terdapat faksi internal yang bisa beralih dukungan.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5" />
                      <p className="text-xs leading-relaxed text-slate-600"><span className="font-bold text-slate-800">Waspada:</span> Perlu perhatian ekstra tim kampanye pusat.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Metrik Analytics</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <p className="text-xs leading-relaxed text-slate-600"><span className="font-bold text-slate-800">Total Efektif:</span> Estimasi riil suara yang bisa dibawa ke kotak suara.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <p className="text-xs leading-relaxed text-slate-600"><span className="font-bold text-slate-800">Progress:</span> Proyeksi kedekatan dengan ambang batas kemenangan 96 suara.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
