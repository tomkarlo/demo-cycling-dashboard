import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function BoroughSparkline({ series }) {
  if (!series.length) return null;

  const fmt = (day) => {
    if (!day) return '';
    const d = new Date(day);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
  };

  const avg = series.reduce((s, r) => s + r.total, 0) / series.length;

  return (
    <ResponsiveContainer width="100%" height={70}>
      <AreaChart data={series} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#b4ff4d" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#b4ff4d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="day"
          tickFormatter={fmt}
          tick={{ fontSize: 9, fill: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
          interval="preserveStartEnd"
          tickLine={false}
          axisLine={false}
        />
        <YAxis hide domain={['auto', 'auto']} />
        <ReferenceLine
          y={avg}
          stroke="var(--muted)"
          strokeDasharray="3 3"
          strokeOpacity={0.4}
          strokeWidth={1}
        />
        <Tooltip
          formatter={(v) => [v.toLocaleString(), 'cyclists']}
          labelFormatter={fmt}
          contentStyle={{
            background: 'var(--surface2)',
            border: '1px solid var(--border2)',
            borderRadius: 3,
            fontSize: 11,
            color: 'var(--text)',
            fontFamily: 'var(--font-mono)',
          }}
          labelStyle={{ color: 'var(--muted)', fontSize: 10 }}
          cursor={{ stroke: 'var(--border2)', strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#b4ff4d"
          strokeWidth={1.5}
          fill="url(#sparkGrad)"
          dot={false}
          activeDot={{ r: 3, fill: '#b4ff4d', stroke: 'none' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
