import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';


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
    color: c.color,
  })).filter(c => c.value > 0);

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="relative w-full h-75">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              borderRadius: '16px', 
              border: '1px solid var(--border)', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              padding: '8px 12px',
              fontSize: '12px',
              zIndex: 1000
            }}
            wrapperStyle={{ zIndex: 1000 }}
            formatter={(value: any) => [`${((Number(value) / total) * 100).toFixed(1)}%`, 'Pangsa Kekuatan']}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-8">
          <span className="text-[10px] font-black text-slate-400 uppercase">Total Skor</span>
          <span className="text-xl font-black text-slate-800">{total.toFixed(1)}</span>
      </div>
    </div>
  );
}
