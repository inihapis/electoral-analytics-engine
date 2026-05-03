import { formatVotes } from '@/utils/format';
import { CANDIDATE_COLORS } from '@/utils/constants';

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
      {data.map((candidate) => {
        const progress = Math.min((candidate.totalVotes / targetVotes) * 100, 100);
        const remaining = Math.max(targetVotes - candidate.totalVotes, 0);
        const color = CANDIDATE_COLORS[candidate.color] || CANDIDATE_COLORS.GRAY;

        return (
          <div key={candidate.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium text-sm">{candidate.name}</span>
              </div>
              <div className="text-sm">
                <span className="font-bold">{formatVotes(candidate.totalVotes)}</span>
                <span className="text-gray-500"> / {targetVotes}</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div 
                className="h-3 rounded-full transition-all duration-500" 
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: color
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{progress.toFixed(1)}%</span>
              <span>Dibutuhkan {formatVotes(remaining)} suara lagi</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
