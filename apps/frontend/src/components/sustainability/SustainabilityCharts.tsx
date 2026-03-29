import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell
} from 'recharts';

// Mock data for Radar Chart
const radarData = [
  { subject: 'Carbon', A: 85, fullMark: 100 },
  { subject: 'Energy', A: 72, fullMark: 100 },
  { subject: 'Waste', A: 90, fullMark: 100 },
  { subject: 'Water', A: 65, fullMark: 100 },
  { subject: 'Biolife', A: 80, fullMark: 100 },
];

// Mock data for Historical Line Chart
const lineData = [
  { name: 'Jan', score: 65 },
  { name: 'Feb', score: 68 },
  { name: 'Mar', score: 75 },
  { name: 'Apr', score: 72 },
  { name: 'May', score: 80 },
  { name: 'Jun', score: 84 },
];

// Mock data for Resource Bar Chart
const barData = [
  { name: 'Steel', value: 45, color: '#0e6c4a' },
  { name: 'Concrete', value: 30, color: '#012d1d' },
  { name: 'Transport', value: 15, color: '#10b981' },
  { name: 'Waste', value: 10, color: '#059669' },
];

export const ImpactRadar = () => (
  <div className="h-full w-full flex items-center justify-center min-h-[300px]">
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
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

export const HistoricalTrendLine = () => (
  <div className="h-64 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={lineData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
          contentStyle={{ backgroundColor: '#012d1d', border: 'none', borderRadius: '12px', color: '#fff' }}
          itemStyle={{ color: '#10b981', fontWeight: 800 }}
        />
        <Line 
          type="monotone" 
          dataKey="score" 
          stroke="#10b981" 
          strokeWidth={4} 
          dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const ResourceBarChart = () => (
  <div className="h-64 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
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
          {barData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);
