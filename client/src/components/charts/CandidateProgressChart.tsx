import { formatVotes } from '@/utils/format';

interface CandidateProgressChartProps {
  data: Array<{
    id: string; // Add id to interface
    name: string;
    color: string;
    totalVotes: number;
  }>;
  targetVotes: number;
}

export default function CandidateProgressChart({ data, targetVotes }: CandidateProgressChartProps) {
  return (
    <div className="space-y-4">
      {data.map((candidate, idx) => {
        const progress = Math.min((candidate.totalVotes / targetVotes) * 100, 100);
        const remaining = Math.max(targetVotes - candidate.totalVotes, 0);
        const color = candidate.color;

        return (
          <div key={candidate.id || `progress-${idx}`} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: color }}
                />
                <span className="font-bold text-[13px] text-slate-700">{candidate.name}</span>
              </div>
              <span className="text-[13px] font-black text-slate-900">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full transition-all duration-1000" 
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: color
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
