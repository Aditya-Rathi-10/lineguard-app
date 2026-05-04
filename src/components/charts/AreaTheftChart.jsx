import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-surface-700/50 shadow-2xl">
        <p className="text-surface-200 font-medium mb-1">{label}</p>
        <p className="text-brand-400 font-bold text-sm">
          {payload[0].value} Thefts
        </p>
        <p className="text-xs text-surface-500 mt-2">Click to view area details</p>
      </div>
    );
  }
  return null;
};

export default function AreaTheftChart({ data }) {
  const navigate = useNavigate();

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis
            dataKey="area"
            stroke="#ffffff40"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="#ffffff40"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dx={-10}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={false}
          />
          <Line
            type="monotone"
            dataKey="thefts"
            stroke="#8b5cf6" // brand-500
            strokeWidth={2}
            dot={{ r: 5, fill: '#a78bfa', strokeWidth: 0, cursor: 'pointer' }}
            activeDot={{ 
              r: 8, 
              fill: '#c4b5fd', 
              stroke: '#8b5cf6', 
              strokeWidth: 2,
              className: 'cursor-pointer transition-all duration-300',
              onClick: (e, payload) => {
                if (payload && payload.payload && payload.payload.area) {
                  navigate(`/area/${encodeURIComponent(payload.payload.area)}`);
                }
              }
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
