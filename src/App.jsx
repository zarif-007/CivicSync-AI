import { lazy, Suspense, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Building2, ClipboardList,
  Check, CheckCircle2, Clock3, CloudUpload, Download, Filter,
  Gauge, Layers3, Leaf, MapPin, Menu, MessageSquareText, Moon, Navigation,
  Plus, Radio, RotateCcw, Search, ShieldCheck, Sparkles, Sun, TrendingUp, Users, Wallet,
  X, Zap, Image as ImageIcon,
} from 'lucide-react'
import { allocationData, initialReports, zones } from './data'
import { loadStoredReports, readThemePreference, retainRecentEvidence } from './storage'
import { buildReportsCsv } from './csv'
import DemoLogin from './DemoLogin'
import WorkflowFeatures from './WorkflowFeatures'
import ReportTimeline from './ReportTimeline'
import PanelErrorBoundary from './PanelErrorBoundary'
import { demoStaff } from './demo-workflow'

const MapView = lazy(() => import('./MapView'))
const ChartRenderer = lazy(() => import('./ChartRenderer'))

async function optimizeEvidenceImage(file) {
  const bitmap = await createImageBitmap(file)
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d', { alpha: false })
    if (!context) throw new Error('Image processing is unavailable in this browser.')

    let blob = null
    for (const [maxDimension, quality] of [[1280, 0.68], [960, 0.58], [800, 0.48]]) {
      const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
      canvas.width = Math.max(1, Math.round(bitmap.width * scale))
      canvas.height = Math.max(1, Math.round(bitmap.height * scale))
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
      if (blob && blob.size <= 450 * 1024) break
    }

    if (!blob || blob.size > 450 * 1024) throw new Error('This image could not be reduced enough for browser storage.')
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('The optimized image could not be read.'))
      reader.onload = () => typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('The optimized image could not be read.'))
      reader.readAsDataURL(blob)
    })
  } finally {
    bitmap.close?.()
  }
}

const money = (value) => '$' + Number(value).toLocaleString('en-US')

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800',
  Assigned: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-800',
  Dispatched: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800',
  'In progress': 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-800',
  Resolved: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700',
}

const severityTone = (score) =>
  score >= 85
    ? 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/40'
    : score >= 65
    ? 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40'
    : 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40'

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl gradient-emerald text-white shadow-glow">
        <Activity size={21} />
      </div>
      <div>
        <div className="font-display text-[17px] font-extrabold tracking-tight text-slate-900 dark:text-white">
          CivicSync <span className="text-emerald-700 dark:text-emerald-400">AI</span>
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">Urban intelligence</div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, detail, icon: Icon, trend, trendUp = false, tone = 'emerald' }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  }
  return (
    <div className="panel p-5 card-hover animate-fade-in">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon size={19} />
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-2">
        <div className="font-display text-[30px] font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">{value}</div>
        {trend && (
          <span className={`mb-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${trendUp ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'}`}>
            {trendUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {trend}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-xs leading-5 text-slate-400 dark:text-slate-500">{detail}</p>
    </div>
  )
}
