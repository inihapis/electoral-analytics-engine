import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CANDIDATE_COLORS } from '@/utils/constants';

interface NationalDistributionChartProps {
  data: Array<{
    name: string;
    color: string;
    totalSkorProbabilitas: number;
  }>;
}

export default function NationalDistributionChart({ data }: NationalDistributionChartProps) {
  const chartData = data.map(c => ({
    name: c.name,
    value: c.totalSkorProbabilitas,
    color: CANDIDATE_COLORS[c.color] || CANDIDATE_COLORS.GRAY,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={80} />
        <Tooltip 
          formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Distribusi']}
        />
        <Legend />
        <Bar dataKey="Distribusi (%)" fill="#8b5cf6" name="Distribusi Kekuatan Nasional" />
      </BarChart>
    </ResponsiveContainer>
  );
}
