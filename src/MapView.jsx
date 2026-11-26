import { useMemo, useState } from 'react'
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const DEMO_DNCC_CENTER = [23.7937, 90.4066]

const severityColor = (severity) => severity >= 85 ? '#e11d48' : severity >= 65 ? '#d97706' : '#059669'
const statusColor = (status) => ({
  Pending: '#64748b',
  Assigned: '#0ea5e9',
  Dispatched: '#7c3aed',
  'In progress': '#0891b2',
  Resolved: '#10b981',
}[status] || '#64748b')

export default function MapView({ zones = [], reports = [], selected, onSelect, onReportSelect }) {
  const [category, setCategory] = useState('All categories')
  const [status, setStatus] = useState('All statuses')
  const [priority, setPriority] = useState('All priorities')
  const [showHotspots, setShowHotspots] = useState(true)
  const [tileError, setTileError] = useState(false)

  const points = useMemo(() => zones.map((zone) => {
    const zoneReports = reports.filter((report) => report.zoneId === zone.id)
    return {
      ...zone,
      count: zoneReports.filter((report) => report.status !== 'Resolved').length,
      critical: zoneReports.filter((report) => report.status !== 'Resolved' && report.severity >= 85).length,
    }
  }), [zones, reports])

  const reportPoints = useMemo(() => {
    const perZone = {}
    return reports
      .filter((report) =>
        (category === 'All categories' || report.category === category) &&
        (status === 'All statuses' || report.status === status) &&
        (priority === 'All priorities' ||
          (priority === 'Critical' && report.severity >= 85) ||
          (priority === 'High' && report.severity >= 65 && report.severity < 85) ||
          (priority === 'Standard' && report.severity < 65))
      )
      .map((report) => {
        const zone = zones.find((item) => item.id === report.zoneId)
        if (!zone) return null
        const index = perZone[zone.id] || 0
        perZone[zone.id] = index + 1
        // Small deterministic offsets keep reports in the same demo zone individually selectable.
        const angle = index * 2.399963
        const distance = 0.0015 + (index % 4) * 0.0007
        return {
          ...report,
          latitude: zone.latitude + Math.sin(angle) * distance,
          longitude: zone.longitude + Math.cos(angle) * distance,
        }
      })
      .filter(Boolean)
  }, [reports, zones, category, status, priority])

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-soft dark:border-slate-700/80">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 bg-white/95 p-3 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/80">
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="field min-w-0 w-full flex-1 py-2 text-xs sm:w-auto sm:min-w-[145px]" aria-label="Filter map by category">
          <option>All categories</option>
          <option>Road damage</option>
          <option>Waterlogging</option>
          <option>Streetlight</option>
          <option>Waste accumulation</option>
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="field min-w-0 w-full flex-1 py-2 text-xs sm:w-auto sm:min-w-[130px]" aria-label="Filter map by status">
          <option>All statuses</option>
          <option>Pending</option>
          <option>Assigned</option>
          <option>Dispatched</option>
          <option>In progress</option>
          <option>Resolved</option>
        </select>
        <select value={priority} onChange={(event) => setPriority(event.target.value)} className="field min-w-0 w-full flex-1 py-2 text-xs sm:w-auto sm:min-w-[130px]" aria-label="Filter map by priority">
          <option>All priorities</option>
          <option>Critical</option>
          <option>High</option>
          <option>Standard</option>
        </select>
        <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
          <input type="checkbox" checked={showHotspots} onChange={(event) => setShowHotspots(event.target.checked)} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
          Hotspots
        </label>
      </div>
      <MapContainer center={DEMO_DNCC_CENTER} zoom={12} scrollWheelZoom={false} className="h-[300px] w-full sm:h-[390px]">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            tileerror: () => setTileError(true),
            load: () => setTileError(false),
          }}
        />
        {showHotspots && points.map((point) => point.count > 0 && (
          <Circle
            key={'hotspot-' + point.id}
            center={[point.latitude, point.longitude]}
            radius={180 + point.count * 24}
            pathOptions={{
              color: severityColor(point.critical ? 90 : point.density),
              weight: 1,
              fillColor: severityColor(point.critical ? 90 : point.density),
              fillOpacity: 0.10 + Math.min(point.count, 8) * 0.012,
            }}
          />
        ))}
        {points.map((point) => (
          <CircleMarker
            key={'zone-' + point.id}
            center={[point.latitude, point.longitude]}
            radius={selected === point.id ? 12 : 8}
            pathOptions={{
              color: selected === point.id ? '#047857' : '#ffffff',
              weight: 2,
              fillColor: point.critical > 0 ? '#e11d48' : point.count > 0 ? '#d97706' : '#059669',
              fillOpacity: 0.9,
            }}
            eventHandlers={{ click: () => onSelect?.(point.id) }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <strong>{point.name}</strong><br />
              {point.count} open reports · {point.critical} critical
            </Tooltip>
          </CircleMarker>
        ))}
        {reportPoints.map((report) => (
          <CircleMarker
            key={'report-' + report.id}
            center={[report.latitude, report.longitude]}
            radius={report.status === 'Resolved' ? 5 : 7}
            pathOptions={{
              color: statusColor(report.status),
              weight: 3,
              fillColor: severityColor(report.severity),
              fillOpacity: report.status === 'Resolved' ? 0.35 : 0.95,
            }}
            eventHandlers={{ click: () => onReportSelect?.(report) }}
          >
            <Tooltip direction="top" offset={[0, -7]}>
              <strong>{report.id} · {report.title}</strong><br />
              Severity {report.severity}/100 · {report.status}<br />
              {report.category} · {report.zone}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
      {tileError && (
        <p role="status" className="border-t border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Map tiles could not be loaded. Check your connection; report data and the rest of the dashboard remain available.
        </p>
      )}
      <div className="flex flex-col gap-2 bg-slate-50/90 px-3 py-3 text-[10px] text-slate-500 dark:bg-slate-900/90 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <strong className="text-slate-700 dark:text-slate-200">Severity</strong>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-emerald-600" />Standard</span>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-amber-500" />High</span>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-rose-600" />Critical</span>
          <strong className="ml-1 text-slate-700 dark:text-slate-200">Status outline</strong>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full border-2 border-slate-500" />Pending</span>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full border-2 border-sky-500" />Assigned</span>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full border-2 border-violet-600" />Dispatched</span>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full border-2 border-cyan-600" />In progress</span>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full border-2 border-emerald-600" />Resolved</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>{reportPoints.length} matching demo reports · {points.length} illustrative zones</span>
          <span>OpenStreetMap · illustrative Dhaka North locations, not official DNCC ward boundaries</span>
        </div>
      </div>
    </div>
  )
}
