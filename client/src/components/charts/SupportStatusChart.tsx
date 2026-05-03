import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SupportStatusChartProps {
  data: {
    terkunci: number;
    mengarah: number;
    dinamis: number;
  };
}

const COLORS = {
  terkunci: '#10b981',
  mengarah: '#3b82f6', 
  dinamis: '#f97316'
};

const LABELS = {
  terkunci: 'Terkunci',
  mengarah: 'Mengarah',
  dinamis: 'Dinamis'
};

export default function SupportStatusChart({ data }: SupportStatusChartProps) {
  const chartData = [
    { name: LABELS.terkunci, value: data.terkunci, color: COLORS.terkunci },
    { name: LABELS.mengarah, value: data.mengarah, color: COLORS.mengarah },
    { name: LABELS.dinamis, value: data.dinamis, color: COLORS.dinamis }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(Math.round(((percent || 0) * 100) * 100) / 100).toFixed(2).replace(/\.?0+$/, '')}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: '1px solid var(--border)', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              padding: '8px 12px',
              fontSize: '12px',
              zIndex: 1000
            }}
            wrapperStyle={{ zIndex: 1000 }}
          />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
