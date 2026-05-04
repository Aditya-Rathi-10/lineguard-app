import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-surface-800/95 backdrop-blur-xl border border-surface-700/50 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-surface-400 font-medium mb-1.5">{data.time}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-400">Difference:</span>
          <span className={`text-sm font-bold ${data.diff > 1 ? 'text-danger-400' : 'text-success-400'}`}>
            {data.diff.toFixed(2)} A
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-400">Input:</span>
          <span className="text-xs text-surface-200">{data.input} A</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-400">Output:</span>
          <span className="text-xs text-surface-200">{data.output} A</span>
        </div>
        {data.theft && (
          <span className="badge-danger text-[10px] mt-1">⚡ Theft Detected</span>
        )}
      </div>
    </div>
  );
}

export default function CurrentDiffChart({ records }) {
  if (!records || records.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-surface-300 mb-4">
          Current Difference Over Time
        </h3>
        <div className="flex items-center justify-center h-64 text-surface-500 text-sm">
          No data available
        </div>
      </div>
    );
  }

  const chartData = [...records]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((r) => {
      const d = new Date(r.createdAt);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return {
        time: `${day}-${month}-${year} ${hours}:${minutes}`,
        diff: Math.round((r.input - r.output) * 100) / 100,
        input: r.input,
        output: r.output,
        theft: r.theft,
        createdAt: r.createdAt,
      };
    });

  return (
    <div className="glass-card p-5 animate-in-delay-1">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-surface-300">
            Current Difference Over Time
          </h3>
          <p className="text-xs text-surface-500 mt-0.5">
            Input − Output (Amperes)
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="diffGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: '#1e293b' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            unit=" A"
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={1}
            stroke="#fbbf24"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
            label={{
              value: 'Threshold',
              fill: '#fbbf24',
              fontSize: 10,
              position: 'insideTopRight',
            }}
          />
          <Area
            type="monotone"
            dataKey="diff"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#diffGradient)"
            dot={(props) => {
              const { cx, cy, payload } = props;
              if (payload.theft) {
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill="#ef4444"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                );
              }
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={3}
                  fill="#22c55e"
                  stroke="none"
                  fillOpacity={0.7}
                />
              );
            }}
            activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
