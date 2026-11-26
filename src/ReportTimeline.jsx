function getTimelineEntries(report) {
  if (Array.isArray(report.history) && report.history.length) return report.history
  const entries = [{ status: 'Submitted', note: 'Seeded demonstration record. Original event time is not available.', at: null }]
  if (report.status !== 'Pending') {
    entries.push({ status: report.status, note: 'Current sample status; historical event timestamps are not available.', at: null })
  }
  return entries
}

export default function ReportTimeline({ report, compact = false }) {
  const entries = getTimelineEntries(report)
  const latestIndex = entries.length - 1

  return (
    <ol aria-label={`Response timeline for ${report.id}`} className={compact ? 'space-y-3' : 'space-y-4'}>
      {entries.map((entry, index) => (
        <li key={`${entry.status}-${index}`} className="relative flex gap-3">
          {index < latestIndex && (
            <span aria-hidden="true" className="absolute left-[5px] top-3 h-[calc(100%+0.25rem)] w-px bg-slate-200 dark:bg-slate-700" />
          )}
          <span
            aria-hidden="true"
            className={`relative mt-1 h-3 w-3 shrink-0 rounded-full ring-4 ${index === latestIndex ? 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-950' : 'bg-slate-300 ring-slate-100 dark:bg-slate-600 dark:ring-slate-800'}`}
          />
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{entry.status}</span>
              {index === latestIndex && (
                <span aria-current="step" className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  Latest update
                </span>
              )}
            </div>
            {entry.note && <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">{entry.note}</p>}
            {entry.at && (
              <time className="mt-1 block text-[10px] text-slate-400" dateTime={entry.at}>
                {new Date(entry.at).toLocaleString()}
              </time>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
