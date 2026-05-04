import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { getTheftIntensityColor, formatDate } from '../../utils/dataUtils';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-surface-800/95 backdrop-blur-xl border border-surface-700/50 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-surface-400 font-medium mb-1">{formatDate(label)}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold text-white">{data.thefts}</span>
        <span className="text-xs text-surface-500">theft events</span>
      </div>
      <p className="text-[11px] text-surface-500 mt-0.5">{data.total} total records</p>
    </div>
  );
}

export default function TheftBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-surface-300 mb-4">
          Daily Theft Events
        </h3>
        <div className="flex items-center justify-center h-64 text-surface-500 text-sm">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 animate-in-delay-2">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-surface-300">
            Daily Theft Events
          </h3>
          <p className="text-xs text-surface-500 mt-0.5">Last 7 days trend</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-surface-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success-500" /> Low
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-warning-400" /> Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-danger-500" /> High
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: '#1e293b' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="thefts" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={getTheftIntensityColor(entry.thefts)}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
