import { createClient } from '@supabase/supabase-js'

export const json = (res, status, body) => res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8').json(body)

export const supabaseAdmin = () => {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Server database is not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export const authenticate = async (req) => {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) return { error: 'Authentication required', status: 401 }
  const supabase = supabaseAdmin()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return { error: 'Invalid or expired session', status: 401 }
  const { data: profile, error: profileError } = await supabase.from('profiles').select('role, ward_number, is_active').eq('id', data.user.id).single()
  if (profileError || !profile?.is_active) return { error: 'User profile is unavailable or disabled', status: 403 }
  return { supabase, user: data.user, profile }
}

export const requireMethod = (req, res, method) => {
  res.setHeader('Allow', method)
  if (req.method !== method) {
    json(res, 405, { error: 'Method not allowed' })
    return false
  }
  return true
}
