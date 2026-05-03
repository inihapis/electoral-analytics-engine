import { useQuery } from '@tanstack/react-query';
import { bpdService, candidateService } from '@/services/api';
import { formatVotes } from '@/utils/format';
import {
  Activity,
  Users,
  Map as MapIcon,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CandidateProgressChart from '@/components/charts/CandidateProgressChart';
import NationalDistributionChart from '@/components/charts/NationalDistributionChart';
import IndonesiaMapChart from '@/components/charts/IndonesiaMapChart';
import { getCandidateColor } from '@/utils/constants';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['bpdStats'],
    queryFn: bpdService.getStatsSummary
  });

  const { data: bpds, isLoading: bpdsLoading } = useQuery({
    queryKey: ['bpds'],
    queryFn: bpdService.getAll
  });

  const { data: candidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: candidateService.getAll
  });

  const isLoading = statsLoading || bpdsLoading || candidatesLoading;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Overview Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Activity className="h-16 w-16 -mr-4 -mt-4" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Suara Efektif (Nasional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{stats?.totalEfektif != null ? formatVotes(stats.totalEfektif) : 0}</div>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">Akumulasi probabilitas dari 38 Provinsi</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none bg-white shadow-xl shadow-slate-200/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 text-primary">Wilayah Terkunci</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{stats?.terkunci || 0} <span className="text-lg text-slate-400">/ 38</span></div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-1000"
                style={{ width: `${((stats?.terkunci || 0) / 38) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-none bg-white shadow-xl shadow-slate-200/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Sudah Menentukan Arah
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-4xl font-black text-slate-900">
              {(stats?.totalBpds || 38) - (stats?.unassigned || 0)}
              <span className="text-lg text-slate-400">/ 38</span>
            </div>

            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">
              BPD yang sudah memiliki arah dukungan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Candidate Status Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black tracking-tight text-slate-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            STATUS KEKUATAN CAKETUM
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {candidates?.map((c: any, idx: number) => (
            <Card key={c.id || `candidate-${idx}`} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className={`h-2.5 w-full`} style={{ backgroundColor: getCandidateColor(c.name) }} />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black truncate">{c.name}</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-tighter">{c.affiliation || 'Independen'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-100/80 p-2 rounded-sm">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-0.5">BPD Dukung</p>
                    <p className="text-base font-black text-slate-800 leading-none">{c.totalBpdDukung || 0}</p>
                  </div>
                  <div className="bg-slate-100/80 p-2 rounded-sm">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-0.5">Suara Riil</p>
                    <p className="text-base font-black text-slate-800 leading-none">{(c.totalBpdDukung || 0) * 5}</p>
                  </div>
                  <div className="col-span-2 bg-primary/5 p-3 rounded-sm border-l-4 border-primary shadow-sm mt-1 group-hover:bg-primary/10 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[9px] font-black text-primary uppercase tracking-widest">Total Suara Efektif</p>
                      <Activity className="w-3 h-3 text-primary/40" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-2xl font-black text-slate-900 tracking-tight">{formatVotes(c.totalSuaraEfektif || 0)}</p>
                      <p className="text-[9px] font-bold text-slate-400 italic uppercase">Probabilitas Skor</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-black uppercase tracking-tight">Progress Menuju Kemenangan</CardTitle>
            </div>
            <CardDescription className="text-xs">Persentase pencapaian target 96 suara (50%+1) per kandidat</CardDescription>
          </CardHeader>
          <CardContent>
            <CandidateProgressChart
              data={candidates?.map((c: any) => ({
                id: c.id,
                name: c.name,
                color: getCandidateColor(c.name),
                totalVotes: c.totalSuaraEfektif || 0,
              })) || []}
              targetVotes={96}
            />
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-black uppercase tracking-tight">Distribusi Kekuatan Nasional</CardTitle>
            </div>
            <CardDescription className="text-xs">Dominasi total skor probabilitas di 38 provinsi</CardDescription>
          </CardHeader>
          <CardContent>
            <NationalDistributionChart
              data={candidates?.map((c: any) => ({
                name: c.name,
                color: getCandidateColor(c.name),
                totalSkorProbabilitas: c.totalSkorProbabilitas || 0
              })) || []}
            />
          </CardContent>
        </Card>
      </div>

      {/* Heatmap Section */}
      <Card className="border-none shadow-xl overflow-hidden">
        <CardHeader className="bg-slate-100/50 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <MapIcon className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-black uppercase tracking-tight">Pemetaan Kekuatan (Heatmap)</CardTitle>
          </div>
          <CardDescription className="text-xs">Visualisasi dominasi kandidat di seluruh wilayah Indonesia</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[400px] sm:h-[500px]">
            <IndonesiaMapChart
              data={bpds?.map((bpd: any) => {
                return {
                  provinceName: bpd.provinceName,
                  dominantCandidate: bpd.supportedCandidate?.color || null,
                  supportStatus: bpd.supportStatus
                };
              }) || []}
            />
          </div>
        </CardContent>
      </Card>

      {/* Footer / Recent Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-base font-black">Riwayat Update Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-400">Memuat data...</div>
            ) : bpds?.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Belum ada data.</div>
            ) : (
              <div className="space-y-3">
                {bpds
                  ?.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .slice(0, 4)
                  .map((bpd: any, idx: number) => (
                    <div key={bpd.id || `bpd-update-${idx}`} className="flex items-center justify-between p-3 border border-slate-50 rounded-sm hover:bg-slate-100 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/5 rounded-sm flex items-center justify-center">
                          <MapIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{bpd.provinceName}</p>
                          <div className="flex flex-col">
                            <p className="text-[10px] text-slate-400 font-medium leading-tight">diperbarui oleh {bpd.updatedBy.username}</p>
                            {bpd.lastUpdatedFields && (
                              <p className="text-[9px] font-bold text-primary uppercase tracking-tighter mt-0.5">
                                {bpd.lastUpdatedFields}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${bpd.supportStatus === 'TERKUNCI' ? 'bg-green-100 text-green-700' :
                          bpd.supportStatus === 'MENGARAH' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                          {bpd.supportStatus}
                        </span>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 whitespace-nowrap">
                          {new Date(bpd.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          <span className="mx-1">•</span>
                          {new Date(bpd.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-base font-black">Analisa Strategis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-primary/10 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter mb-2">Kondisi Saat Ini</p>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                "Berdasarkan data terkini, terdapat {stats?.terkunci || 0} wilayah terkunci. Fokus strategi sebaiknya dialihkan ke {stats?.mengarah || 0} wilayah dengan status 'MENGARAH' untuk memastikan dukungan suara efektif mencapai target 96."
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Karakteristik Solid</p>
                <p className="text-2xl font-black text-slate-800">{stats?.solid || 0}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Karakteristik Waspada</p>
                <p className="text-2xl font-black text-red-500">{stats?.waspada || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
