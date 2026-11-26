import { useMemo, useState } from 'react'
import { AlertTriangle, Bell, Check, MapPin, Users } from 'lucide-react'
import { demoStaff, getComplaintHotspots, getEscalatedReports } from './demo-workflow'

function NotificationPanel({ notifications, onMarkRead }) {
  return (
    <section className="panel min-w-0 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="eyebrow">Activity feed</div>
          <h3 className="mt-1 font-display text-lg font-extrabold text-slate-900 dark:text-white">Notifications</h3>
        </div>
        <Bell className="text-emerald-700 dark:text-emerald-400" size={19} />
      </div>
      {notifications.length ? (
        <div className="mt-4 space-y-2">
          {notifications.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-start gap-3 rounded-xl bg-slate-50/90 p-3 dark:bg-slate-800/70">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{item.message}</p>
                <p className="mt-1 text-[10px] text-slate-400">{new Date(item.at).toLocaleString()}</p>
              </div>
              {!item.read && (
                <button onClick={() => onMarkRead(item.id)} className="text-[10px] font-bold text-emerald-700 transition hover:underline dark:text-emerald-400">
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-400">New assignments and status changes will appear here.</p>
      )}
    </section>
  )
}

function AssignmentPanel({ reports, onAssign }) {
  const openReports = reports.filter((report) => report.status !== 'Resolved')
  return (
    <section className="panel min-w-0 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="eyebrow">Operations workflow</div>
          <h3 className="mt-1 font-display text-lg font-extrabold text-slate-900 dark:text-white">Staff assignments</h3>
        </div>
        <Users className="text-emerald-700 dark:text-emerald-400" size={19} />
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Assign each open report to a sample department staff member. Assignments remain in this browser.</p>
      <div className="mt-4 space-y-3">
        {openReports.slice(0, 8).map((report) => (
          <div key={report.id} className="flex flex-col gap-2 rounded-xl border border-slate-100 p-3 dark:border-slate-800 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{report.title}</div>
              <div className="mt-1 text-[10px] text-slate-400">{report.id} · {report.zone} · {report.status}</div>
            </div>
            <select
              aria-label={'Assign staff for ' + report.id}
              value={report.assignedTo || ''}
              onChange={(event) => onAssign(report.id, event.target.value)}
              className="field min-h-10 w-full text-xs sm:max-w-[210px]"
            >
              <option value="">Unassigned</option>
              {demoStaff.map((person) => (
                <option key={person.id} value={person.id}>{person.name} · {person.department}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {openReports.length === 0 && <p className="mt-4 text-sm text-slate-400">No open reports to assign.</p>}
    </section>
  )
}

function HotspotPanel({ reports }) {
  const hotspots = useMemo(() => getComplaintHotspots(reports), [reports])
  const max = Math.max(1, ...hotspots.map((item) => item.open))
  return (
    <section className="panel min-w-0 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="eyebrow">Geospatial patterns</div>
          <h3 className="mt-1 font-display text-lg font-extrabold text-slate-900 dark:text-white">Complaint hotspots</h3>
        </div>
        <MapPin className="text-emerald-700 dark:text-emerald-400" size={19} />
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Areas ranked by open local demo reports; not official ward-level statistics.</p>
      <div className="mt-4 space-y-4">
        {hotspots.slice(0, 6).map((item) => (
          <div key={item.zone}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{item.zone}</span>
              <span className="tabular-nums text-slate-500 dark:text-slate-400">{item.open} open · {item.total} total</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: (item.open / max * 100) + '%' }} />
            </div>
            <div className="mt-1 text-[10px] text-slate-400">
              {item.critical} critical · {Object.entries(item.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No category'} most common
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function EscalationPanel({ reports, onSelect }) {
  const escalated = useMemo(() => getEscalatedReports(reports), [reports])
  return (
    <section className="panel min-w-0 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="eyebrow">Service attention</div>
          <h3 className="mt-1 font-display text-lg font-extrabold text-slate-900 dark:text-white">Priority escalation</h3>
        </div>
        <AlertTriangle className="text-amber-600" size={19} />
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Flags critical reports (90+ severity) or reports open for at least 48 hours.</p>
      {escalated.length ? (
        <div className="mt-4 space-y-2">
          {escalated.slice(0, 6).map((report) => (
            <button
              key={report.id}
              onClick={() => onSelect(report)}
              className="flex w-full items-center justify-between gap-3 rounded-xl bg-amber-50/90 p-3 text-left transition hover:bg-amber-100/80 dark:bg-amber-950/25 dark:hover:bg-amber-950/40"
            >
              <span className="min-w-0">
                <span className="block truncate text-xs font-bold text-slate-800 dark:text-slate-100">{report.title}</span>
                <span className="mt-1 block text-[10px] text-slate-500">{report.id} · {report.zone}</span>
              </span>
              <span className="shrink-0 text-right text-[10px] font-bold text-amber-700 dark:text-amber-300">
                {report.severity >= 90 ? 'Critical' : Math.floor(report.ageHours) + 'h open'}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
          <Check size={16} /> No reports currently meet escalation rules.
        </div>
      )}
    </section>
  )
}

function FeedbackPanel({ reports, feedback, onFeedback }) {
  const [ratings, setRatings] = useState({})
  const resolved = reports.filter((report) => report.status === 'Resolved')
  return (
    <section className="panel min-w-0 p-4 sm:p-5">
      <div className="eyebrow">Citizen voice</div>
      <h3 className="mt-1 font-display text-lg font-extrabold text-slate-900 dark:text-white">Resolution feedback</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Rate completed sample reports to demonstrate the feedback loop.</p>
      {resolved.length ? (
        <div className="mt-4 space-y-3">
          {resolved.slice(0, 6).map((report) => (
            <div key={report.id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{report.title}</div>
              <div className="mt-1 text-[10px] text-slate-400">{report.id}</div>
              {feedback[report.id] ? (
                <p className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">Your rating: {feedback[report.id].rating}/5 · Feedback saved</p>
              ) : (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <select
                    className="field min-h-9 w-24 text-xs"
                    value={ratings[report.id] || '5'}
                    onChange={(event) => setRatings((prev) => ({ ...prev, [report.id]: event.target.value }))}
                    aria-label={'Rating for ' + report.id}
                  >
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} / 5</option>)}
                  </select>
                  <button onClick={() => onFeedback(report.id, Number(ratings[report.id] || 5))} className="btn-secondary min-h-9 text-xs">
                    Submit feedback
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-400">Resolved reports will appear here.</p>
      )}
    </section>
  )
}

export default function WorkflowFeatures({ role, reports, notifications, onMarkRead, onAssign, onSelect, feedback, onFeedback, myReports }) {
  return (
    <div className="mb-6 grid gap-5 xl:grid-cols-2">
      {role === 'admin' && <AssignmentPanel reports={reports} onAssign={onAssign} />}
      {role === 'admin' && <HotspotPanel reports={reports} />}
      {(role === 'staff' || role === 'admin') && <EscalationPanel reports={reports} onSelect={onSelect} />}
      {role === 'citizen' && <FeedbackPanel reports={myReports} feedback={feedback} onFeedback={onFeedback} />}
      <NotificationPanel notifications={notifications} onMarkRead={onMarkRead} />
    </div>
  )
}
