import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis
} from 'recharts';
import { formatDate } from '../../utils/dataUtils';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  
  return (
    <div className="bg-surface-800/95 backdrop-blur-xl border border-surface-700/50 rounded-xl p-3 shadow-xl pointer-events-none">
      <p className="text-xs text-surface-400 font-medium mb-1">{formatDate(data.date)}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold text-danger-400">{data.thefts}</span>
        <span className="text-xs text-surface-500">thefts</span>
      </div>
      <p className="text-[10px] text-surface-500 mt-1">Click point to filter history</p>
    </div>
  );
}

export default function PoleTheftScatterChart({ records, onPointClick, selectedDate }) {
  if (!records || records.length === 0) return null;

  // Aggregate thefts per day for this specific pole
  const dateMap = new Map();
  records.forEach((r) => {
    if (r.theft && r.createdAt) {
      const rDate = new Date(r.createdAt);
      const date = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, '0')}-${String(rDate.getDate()).padStart(2, '0')}`;
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    }
  });

  const chartData = Array.from(dateMap.entries()).map(([date, thefts]) => ({
    date,
    thefts,
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  if (chartData.length === 0) {
    return (
      <div className="glass-card p-5 animate-in-delay-1">
        <h3 className="text-sm font-semibold text-surface-300 mb-4">
          Daily Theft Occurrences
        </h3>
        <div className="flex items-center justify-center h-64 text-surface-500 text-sm">
          No thefts detected for this pole
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 animate-in-delay-1">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-surface-300">
            Daily Theft Occurrences
          </h3>
          <p className="text-xs text-surface-500 mt-0.5">
            Total number of thefts across days
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-800)" vertical={false} />
          <XAxis 
            dataKey="date" 
            name="Date" 
            tickFormatter={formatDate}
            tick={{ fill: 'var(--surface-500)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--surface-800)' }}
            tickLine={false}
          />
          <YAxis 
            dataKey="thefts" 
            name="Thefts" 
            allowDecimals={false}
            tick={{ fill: 'var(--surface-500)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <ZAxis range={[60, 200]} />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Line 
            type="monotone" 
            dataKey="thefts" 
            stroke="#ef4444" 
            strokeWidth={2} 
            dot={(props) => {
              const { cx, cy, payload } = props;
              const isSelected = selectedDate === payload.date;
              return (
                <circle
                  key={`dot-${payload.date}`}
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 8 : 5}
                  fill={isSelected ? '#fca5a5' : '#ef4444'}
                  stroke="#fff"
                  strokeWidth={isSelected ? 3 : 2}
                  className="cursor-pointer transition-all duration-300 hover:scale-125"
                  onClick={() => onPointClick && onPointClick(payload.date)}
                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                />
              );
            }}
            activeDot={(props) => {
              const { cx, cy, payload } = props;
              const isSelected = selectedDate === payload.date;
              return (
                <circle
                  key={`activedot-${payload.date}`}
                  cx={cx}
                  cy={cy}
                  r={10}
                  fill={isSelected ? '#fca5a5' : '#ef4444'}
                  stroke="#fff"
                  strokeWidth={3}
                  className="cursor-pointer transition-all duration-300"
                  onClick={() => onPointClick && onPointClick(payload.date)}
                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                />
              );
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
