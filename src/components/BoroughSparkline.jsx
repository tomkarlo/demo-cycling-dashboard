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
    <ResponsiveContainer width="100%" height={72}>
      <AreaChart data={series} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#16a34a" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="day"
          tickFormatter={fmt}
          tick={{ fontSize: 10, fill: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          interval="preserveStartEnd"
          tickLine={false}
          axisLine={false}
        />
        <YAxis hide domain={['auto', 'auto']} />
        <ReferenceLine
          y={avg}
          stroke="var(--border2)"
          strokeDasharray="4 3"
          strokeWidth={1}
        />
        <Tooltip
          formatter={(v) => [v.toLocaleString(), 'cyclists']}
          labelFormatter={fmt}
          contentStyle={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 12,
            color: 'var(--text)',
            fontFamily: 'var(--font-body)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
          labelStyle={{ color: 'var(--muted)', fontSize: 11 }}
          cursor={{ stroke: 'var(--border2)', strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#16a34a"
          strokeWidth={1.5}
          fill="url(#sparkGrad)"
          dot={false}
          activeDot={{ r: 3, fill: '#16a34a', stroke: 'white', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
