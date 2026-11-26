import { zones } from './data.js'

const validStatuses = new Set(['Pending', 'Assigned', 'Dispatched', 'In progress', 'Resolved'])
const validCategories = new Set(['Road damage', 'Waterlogging', 'Streetlight', 'Waste accumulation', 'Other'])
const zoneIds = new Set(zones.map((zone) => zone.id))
const MAX_STORED_REPORTS = 500
const MAX_IMAGE_DATA_LENGTH = 620 * 1024
const MAX_STORED_EVIDENCE_IMAGES = 5

function boundedString(value, maxLength, allowEmpty = true) {
  return typeof value === 'string' && value.length <= maxLength && (allowEmpty || value.trim().length > 0)
}

function validHistory(history) {
  return history === undefined || (
    Array.isArray(history) &&
    history.length <= 100 &&
    history.every((entry) =>
      entry &&
      typeof entry === 'object' &&
      boundedString(entry.status, 40, false) &&
      boundedString(entry.note, 300) &&
      (entry.at == null || boundedString(entry.at, 40))
    )
  )
}

export function isValidStoredReport(report) {
  if (!report || typeof report !== 'object' || Array.isArray(report)) return false
  if (
    !boundedString(report.id, 80, false) ||
    !boundedString(report.title, 180, false) ||
    !validCategories.has(report.category) ||
    !boundedString(report.zone, 100, false) ||
    !zoneIds.has(report.zoneId) ||
    !Number.isFinite(report.severity) || report.severity < 0 || report.severity > 100 ||
    !validStatuses.has(report.status) ||
    !boundedString(report.unit, 100, false) ||
    !Number.isFinite(report.impact) || report.impact < 0 || report.impact > 1_000_000_000 ||
    !Number.isFinite(report.cost) || report.cost < 0 || report.cost > 1_000_000_000 ||
    !boundedString(report.age, 40) ||
    !boundedString(report.description, 3_000) ||
    !validHistory(report.history)
  ) return false

  const optionalStrings = [
    ['citizenId', 80], ['createdAt', 40], ['locationNote', 100], ['duplicate', 180],
    ['aiSummary', 180], ['triageProvider', 80], ['municipalAdapter', 100],
    ['resolvedAt', 40], ['resolutionNote', 300],
  ]
  if (optionalStrings.some(([key, max]) => report[key] !== undefined && !boundedString(report[key], max))) return false
  if (report.latitude !== undefined && (!Number.isFinite(report.latitude) || report.latitude < -90 || report.latitude > 90)) return false
  if (report.longitude !== undefined && (!Number.isFinite(report.longitude) || report.longitude < -180 || report.longitude > 180)) return false
  if (report.confidence !== undefined && (!Number.isFinite(report.confidence) || report.confidence < 0 || report.confidence > 1)) return false
  if (report.safetyFlags !== undefined && (
    !Array.isArray(report.safetyFlags) ||
    report.safetyFlags.length > 5 ||
    !report.safetyFlags.every((flag) => boundedString(flag, 100, false))
  )) return false
  if (report.imageData !== undefined && report.imageData !== null) {
    if (
      typeof report.imageData !== 'string' ||
      report.imageData.length > MAX_IMAGE_DATA_LENGTH ||
      !/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(report.imageData)
    ) return false
  }
  return true
}

export function loadStoredReports(storage, defaults) {
  try {
    const saved = storage?.getItem('civicsync-reports-v2')
    if (!saved) return defaults
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return defaults

    const validReports = parsed.slice(-MAX_STORED_REPORTS).filter(isValidStoredReport)
    const merged = new Map([...defaults, ...validReports].map((report) => [report.id, report]))
    return retainRecentEvidence(Array.from(merged.values()).slice(-MAX_STORED_REPORTS))
  } catch {
    return defaults
  }
}

export function readThemePreference(storage, prefersDark = false) {
  try {
    const saved = storage?.getItem('civicsync-theme')
    if (saved === 'dark') return true
    if (saved === 'light') return false
  } catch {
    // Fall back to the operating-system preference.
  }
  return Boolean(prefersDark)
}

export function retainRecentEvidence(reports, maxImages = MAX_STORED_EVIDENCE_IMAGES) {
  let retained = 0
  return reports.slice(0, MAX_STORED_REPORTS).map((report) => {
    if (!report.imageData) return report
    retained += 1
    return retained <= maxImages ? report : { ...report, imageData: null }
  })
}
