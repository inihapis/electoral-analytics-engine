import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend
} from 'recharts';
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
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        data={chartData} 
        layout="vertical"
        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis type="number" hide />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={100} 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
        />
        <Tooltip 
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            padding: '12px'
          }}
          formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Proporsi Kekuatan']}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
