import test from 'node:test'
import assert from 'node:assert/strict'
import { initialReports } from '../src/data.js'
import { isValidStoredReport, loadStoredReports, readThemePreference, retainRecentEvidence } from '../src/storage.js'

function mockStorage(value, shouldThrow = false) {
  return {
    getItem(key) {
      assert.ok(['civicsync-reports-v2', 'civicsync-theme'].includes(key))
      if (shouldThrow) throw new Error('Storage blocked')
      return value
    },
  }
}

test('stored report validation accepts valid demo reports and rejects malformed data', () => {
  assert.equal(isValidStoredReport(initialReports[0]), true)
  assert.equal(isValidStoredReport({ ...initialReports[0], severity: 'critical' }), false)
  assert.equal(isValidStoredReport({ ...initialReports[0], zoneId: 'unknown-zone' }), false)
  assert.equal(isValidStoredReport({ ...initialReports[0], status: 'untrusted-status' }), false)
})

test('stored report validation rejects coordinates outside geographic bounds', () => {
  assert.equal(isValidStoredReport({ ...initialReports[0], latitude: 91 }), false)
  assert.equal(isValidStoredReport({ ...initialReports[0], latitude: -91 }), false)
  assert.equal(isValidStoredReport({ ...initialReports[0], longitude: 181 }), false)
  assert.equal(isValidStoredReport({ ...initialReports[0], longitude: -181 }), false)
  assert.equal(isValidStoredReport({ ...initialReports[0], latitude: 90, longitude: 180 }), true)
})

test('stored report loader merges valid reports and ignores invalid records', () => {
  const extra = { ...initialReports[0], id: 'CS-9001', title: 'New local demo report' }
  const malformed = { id: 'broken', status: 'Pending', zoneId: 'commercial', severity: 30, cost: 10 }
  const loaded = loadStoredReports(mockStorage(JSON.stringify([extra, malformed])), initialReports)
  assert.ok(loaded.some((report) => report.id === 'CS-9001'))
  assert.ok(!loaded.some((report) => report.id === 'broken'))
  assert.equal(loaded.filter((report) => report.id === 'CS-2048').length, 1)
})

test('stored report loader safely falls back for corrupt or unavailable storage', () => {
  assert.equal(loadStoredReports(mockStorage('{invalid'), initialReports), initialReports)
  assert.equal(loadStoredReports(mockStorage(null, true), initialReports), initialReports)
})

test('theme preference respects explicit saved choice and safely falls back', () => {
  assert.equal(readThemePreference(mockStorage('dark'), false), true)
  assert.equal(readThemePreference(mockStorage('light'), true), false)
  assert.equal(readThemePreference(mockStorage('unknown'), true), true)
  assert.equal(readThemePreference(mockStorage(null, true), false), false)
})

test('stored report loader retains only the five newest evidence images', () => {
  const reports = Array.from({ length: 7 }, (_, index) => ({
    ...initialReports[0],
    id: 'CS-IMAGE-' + index,
    imageData: 'data:image/jpeg;base64,AAAA',
  }))
  const retained = retainRecentEvidence(reports)
  assert.equal(retained.filter((report) => report.imageData).length, 5)
  assert.equal(retained[0].imageData, reports[0].imageData)
  assert.equal(retained[5].imageData, null)
})

test('report retention caps the active demo dataset at 500 newest reports', () => {
  const reports = Array.from({ length: 510 }, (_, index) => ({
    ...initialReports[0],
    id: 'CS-LIMIT-' + index,
  }))
  const retained = retainRecentEvidence(reports)
  assert.equal(retained.length, 500)
  assert.equal(retained[0].id, 'CS-LIMIT-0')
  assert.equal(retained[499].id, 'CS-LIMIT-499')
})
