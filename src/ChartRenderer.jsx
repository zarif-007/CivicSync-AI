import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

const lifecyclePalette = ['#f59e0b', '#64748b', '#0ea5e9', '#8b5cf6', '#10b981']

const tooltipStyle = (darkMode) => ({
  borderRadius: 12,
  border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
  background: darkMode ? '#1e293b' : '#fff',
  color: darkMode ? '#e2e8f0' : '#0f172a',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
})

export default function ChartRenderer({ type, data, palette = [], darkMode = false }) {
  const gridStroke = darkMode ? '#334155' : '#e2e8f0'
  const tickFill = darkMode ? '#94a3b8' : '#64748b'

  if (type === 'category') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="category" tick={{ fontSize: 11, fill: tickFill }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: tickFill }} />
          <Tooltip contentStyle={tooltipStyle(darkMode)} />
          <Bar dataKey="reports" name="Reports" fill="#059669" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'status') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={92} paddingAngle={3}>
            {data.map((entry, index) => <Cell key={entry.name} fill={palette[index % palette.length]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle(darkMode)} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'department') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 18, left: 18, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: tickFill }} />
          <YAxis type="category" dataKey="department" width={125} tick={{ fontSize: 10, fill: tickFill }} />
          <Tooltip contentStyle={tooltipStyle(darkMode)} />
          <Bar dataKey="open" name="Open" stackId="reports" fill="#0d9488" radius={[0, 4, 4, 0]} />
          <Bar dataKey="resolved" name="Resolved" stackId="reports" fill="#94a3b8" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'lifecycle') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>
            {data.map((entry, index) => <Cell key={entry.name} fill={lifecyclePalette[index % lifecyclePalette.length]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle(darkMode)} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'allocation') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="zone" tick={{ fontSize: 11, fill: tickFill }} />
          <YAxis tick={{ fontSize: 11, fill: tickFill }} />
          <Tooltip contentStyle={tooltipStyle(darkMode)} />
          <Bar dataKey="traditional" name="Traditional" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="optimized" name="Optimized" fill="#059669" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return null
}
