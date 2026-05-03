import { useQuery } from '@tanstack/react-query';
import { bpdService, candidateService } from '@/services/api';
import { formatPercent, formatVotes } from '@/utils/format';
import {
  Target,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CandidateComparisonChart from '@/components/charts/CandidateComparisonChart';
import CandidateProgressChart from '@/components/charts/CandidateProgressChart';
import NationalDistributionChart from '@/components/charts/NationalDistributionChart';
import IndonesiaMapChart from '@/components/charts/IndonesiaMapChart';

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary to-primary/90 text-white shadow-2xl shadow-primary/20 group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <Activity className="h-24 w-24 -mr-8 -mt-8" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit mb-2">
              <Activity className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Aktivitas Real-time</span>
            </div>
            <CardTitle className="text-lg font-bold text-white/90">Total Suara Efektif</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 pt-4">
            <div className="text-5xl font-black tracking-tighter mb-1 animate-subtle-float">
              {stats?.totalEfektif != null ? formatVotes(stats.totalEfektif) : 0}
            </div>
            <div className="flex items-center gap-2 mt-4 text-primary-foreground/80">
              <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-secondary transition-all duration-1000" 
                  style={{ width: `${Math.min(((stats?.totalEfektif || 0) / 96) * 100, 100)}%` }} 
                />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider">
                {stats?.totalDukungan || 0} Dukungan
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-white to-slate-50 shadow-xl shadow-slate-200/50 group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Target className="h-24 w-24 -mr-8 -mt-8 text-primary" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full w-fit mb-2">
              <Target className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Target Kemenangan</span>
            </div>
            <CardTitle className="text-lg font-bold text-slate-800">Progress Menuju 50%+1</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 pt-4">
            <div className="text-5xl font-black tracking-tighter text-slate-900 mb-1">
              {stats?.progress != null ? formatPercent(stats.progress) : 0}<span className="text-2xl text-slate-400">%</span>
            </div>
            <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Butuh {formatVotes(Math.max(0, 96 - (stats?.totalEfektif || 0)))} suara lagi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Candidate Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Perbandingan Kekuatan Kandidat</CardTitle>
            <CardDescription>
              Total suara riil, skor probabilitas, dan BPD dukung per kandidat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CandidateComparisonChart 
              data={candidates?.map((c: any) => ({
                name: c.name,
                color: c.color,
                totalVotes: c.totalSuaraRiil || 0,
                totalScore: c.totalSkorProbabilitas || 0,
                totalBpd: c.totalBpdDukung || 0,
              })) || []}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Menuju 50%+1</CardTitle>
            <CardDescription>
              Progress masing-masing kandidat menuju 96 suara
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CandidateProgressChart 
              data={candidates?.map((c: any) => ({
                id: c.id,
                name: c.name,
                color: c.color,
                totalVotes: c.totalSuaraRiil || 0,
              })) || []}
              targetVotes={96}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribusi Kekuatan Nasional</CardTitle>
            <CardDescription>
              Persentase distribusi skor kandidat terhadap total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NationalDistributionChart 
              data={candidates?.map((c: any) => ({
                name: c.name,
                color: c.color,
                totalSkorProbabilitas: c.totalSkorProbabilitas || 0
              })) || []}
            />
          </CardContent>
        </Card>
      </div>

      {/* BPD Status Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pemetaan Wilayah (Heatmap)</CardTitle>
            <CardDescription>
              Visualisasi distribusi dukungan kandidat per provinsi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IndonesiaMapChart 
              data={bpds?.map((bpd: any) => {
                // Get candidate indicators for this BPD
                const candidateIndicators = candidates?.map((c: any) => {
                  const indicator = c.indicators?.find((ind: any) => ind.bpdId === bpd.id);
                  return {
                    name: c.name,
                    color: c.color,
                    estimatedVotes: indicator?.estimatedVotes || 0
                  };
                }) || [];
                
                // Find dominant candidate
                const dominant = candidateIndicators.reduce((max: any, curr: any) => 
                  curr.estimatedVotes > max.estimatedVotes ? curr : max, 
                  { name: null, estimatedVotes: 0 }
                );
                
                return {
                  provinceName: bpd.provinceName,
                  dominantCandidate: dominant.estimatedVotes > 0 ? dominant.color : null,
                  supportStatus: bpd.supportStatus
                };
              }) || []}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Riwayat Update Terbaru</CardTitle>
            <CardDescription>
              5 provinsi terakhir yang diperbarui
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-400">Memuat data...</div>
            ) : bpds?.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Belum ada data.</div>
            ) : (
              <div className="space-y-4">
                {bpds
                  ?.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .slice(0, 5)
                  .map((bpd: any) => (
                    <div key={bpd.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{bpd.provinceName}</div>
                          <div className="text-sm text-gray-500">
                            oleh {bpd.updatedBy.username}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            bpd.supportStatus === 'TERKUNCI' ? 'bg-green-100 text-green-800' :
                            bpd.supportStatus === 'MENGARAH' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {bpd.supportStatus === 'TERKUNCI' ? 'Terkunci' : 
                             bpd.supportStatus === 'MENGARAH' ? 'Mengarah' : 'Dinamis'}
                          </span>
                          <span className="text-sm font-semibold text-gray-700">
                            {formatVotes(bpd.estimatedVotes)} suara
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(bpd.updatedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
