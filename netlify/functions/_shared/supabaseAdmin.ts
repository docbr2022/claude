import { createClient, type User } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não configuradas nas Netlify Functions.')
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

/** Extrai e valida o usuário autenticado a partir do header Authorization: Bearer <token> */
export async function getUserFromRequest(headers: Record<string, string | undefined>): Promise<User> {
  const authHeader = headers.authorization || headers.Authorization
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) {
    throw new HttpError(401, 'Token de autenticação ausente.')
  }
  const admin = getSupabaseAdmin()
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user) {
    throw new HttpError(401, 'Token de autenticação inválido.')
  }
  return data.user
}

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function jsonResponse(status: number, body: unknown) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}
