import { authenticate, json, requireMethod } from './_lib/http.js'

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) return json(res, 405, { error: 'Method not allowed' })
  const auth = await authenticate(req).catch(() => ({ error: 'Server authentication is not configured', status: 503 }))
  if (auth.error) return json(res, auth.status, { error: auth.error })

  if (req.method === 'GET') {
    let query = auth.supabase.from('reports').select('id, title, description, category, status, severity, latitude, longitude, ward_number, created_at, updated_at').order('created_at', { ascending: false }).limit(100)
    if (auth.profile.role === 'citizen') query = query.eq('reporter_id', auth.user.id)
    if (auth.profile.role === 'staff' && auth.profile.ward_number) query = query.eq('ward_number', auth.profile.ward_number)
    const { data, error } = await query
    if (error) return json(res, 500, { error: 'Could not load reports' })
    return json(res, 200, { reports: data })
  }

  const body = req.body || {}
  if (typeof body.title !== 'string' || body.title.trim().length < 5 || body.title.length > 160 ||
      typeof body.description !== 'string' || body.description.trim().length < 8 || body.description.length > 3000 ||
      !['Road damage', 'Waterlogging', 'Streetlight', 'Waste accumulation', 'Other'].includes(body.category))
    return json(res, 400, { error: 'Invalid report fields' })
  const lat = body.latitude
  const lon = body.longitude
  if (typeof lat !== 'number' || typeof lon !== 'number' || lat < 23.60 || lat > 24.10 || lon < 90.25 || lon > 90.65)
    return json(res, 400, { error: 'A valid location within the approximate DNCC area is required' })
  const { data, error } = await auth.supabase.from('reports').insert({
    reporter_id: auth.user.id, title: body.title.trim(), description: body.description.trim(),
    category: body.category, latitude: lat, longitude: lon, status: 'submitted',
  }).select('id, title, category, status, latitude, longitude, created_at').single()
  if (error) return json(res, 500, { error: 'Could not save report' })
  return json(res, 201, { report: data })
}
