import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
interface RadarDataItem {
  subject: string;
  A: number;
  fullMark: number;
}
interface LineDataItem {
  name: string;
  score: number;
}
interface BarDataItem {
  name: string;
  value: number;
  color: string;
}
export const ImpactRadar = ({ data }: { data?: RadarDataItem[] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center min-h-[300px] text-slate-400">
        <span className="material-symbols-outlined text-4xl mb-2">radar</span>
        <p className="text-sm font-semibold">No metric data yet</p>
        <p className="text-xs mt-1">Record environmental metrics to see the impact radar</p>
      </div>
    );
  }
  return (
    <div className="h-full w-full flex items-center justify-center min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
          />
          <Radar
            name="Sustainability"
            dataKey="A"
            stroke="#0e6c4a"
            fill="#0e6c4a"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
export const HistoricalTrendLine = ({ data }: { data?: LineDataItem[] }) => {
  if (!data || data.length < 2) {
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center text-slate-400">
        <span className="material-symbols-outlined text-4xl mb-2">show_chart</span>
        <p className="text-sm font-semibold">Not enough data</p>
        <p className="text-xs mt-1">Record at least 2 metrics to see the trend line</p>
      </div>
    );
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#012d1d',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
            }}
            itemStyle={{ color: '#10b981', fontWeight: 800 }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#10b981"
            strokeWidth={4}
            dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
export const ResourceBarChart = ({ data }: { data?: BarDataItem[] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center text-slate-400">
        <span className="material-symbols-outlined text-4xl mb-2">bar_chart</span>
        <p className="text-sm font-semibold">No resource data yet</p>
        <p className="text-xs mt-1">Record environmental metrics to see resource breakdown</p>
      </div>
    );
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
          />
          <Tooltip cursor={{ fill: 'transparent' }} />
          <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
