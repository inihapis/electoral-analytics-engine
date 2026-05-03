import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CANDIDATE_COLORS } from '@/utils/constants';

interface CandidateComparisonChartProps {
  data: Array<{
    name: string;
    color: string;
    totalVotes: number;
    totalScore: number;
    totalBpd: number;
  }>;
}

export default function CandidateComparisonChart({ data }: CandidateComparisonChartProps) {
  const chartData = data.map(c => ({
    name: c.name,
    'Total Suara': c.totalVotes,
    'Total Skor': c.totalScore,
    'Total BPD': c.totalBpd,
    color: CANDIDATE_COLORS[c.color] || CANDIDATE_COLORS.GRAY,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Total Suara" fill="#3b82f6" name="Total Suara Riil" />
        <Bar dataKey="Total Skor" fill="#8b5cf6" name="Total Skor Probabilitas" />
        <Bar dataKey="Total BPD" fill="#10b981" name="Total BPD Dukung" />
      </BarChart>
    </ResponsiveContainer>
  );
}
