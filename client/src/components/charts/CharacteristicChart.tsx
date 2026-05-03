import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CharacteristicChartProps {
  data: {
    solid: number;
    rentan: number;
    waspada: number;
  };
}

const LABELS = {
  solid: 'Solid',
  rentan: 'Rentan',
  waspada: 'Waspada'
};

export default function CharacteristicChart({ data }: CharacteristicChartProps) {
  const chartData = [
    { name: LABELS.solid, value: data.solid },
    { name: LABELS.rentan, value: data.rentan },
    { name: LABELS.waspada, value: data.waspada }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8b5cf6" />
      </BarChart>
    </ResponsiveContainer>
  );
}
