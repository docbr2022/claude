import type { Handler } from '@netlify/functions'
import { getSupabaseAdmin, getUserFromRequest, jsonResponse, HttpError } from './_shared/supabaseAdmin'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido.' })
  }

  try {
    const user = await getUserFromRequest(event.headers as Record<string, string | undefined>)
    const { provider } = JSON.parse(event.body || '{}') as { provider?: string }

    if (!provider) {
      return jsonResponse(400, { error: 'Informe o provedor.' })
    }

    const admin = getSupabaseAdmin()
    const { error } = await admin
      .from('integration_keys')
      .delete()
      .eq('owner_id', user.id)
      .eq('provider', provider)

    if (error) return jsonResponse(500, { error: error.message })

    return jsonResponse(200, { ok: true })
  } catch (err) {
    if (err instanceof HttpError) return jsonResponse(err.status, { error: err.message })
    return jsonResponse(500, { error: (err as Error).message })
  }
}
