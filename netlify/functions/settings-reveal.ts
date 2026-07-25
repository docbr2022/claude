import type { Handler } from '@netlify/functions'
import { getSupabaseAdmin, getUserFromRequest, jsonResponse, HttpError } from './_shared/supabaseAdmin'
import { decryptSecret } from './_shared/crypto'

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
    const { data, error } = await admin
      .from('integration_keys')
      .select('encrypted_value')
      .eq('owner_id', user.id)
      .eq('provider', provider)
      .maybeSingle()

    if (error) return jsonResponse(500, { error: error.message })
    if (!data) return jsonResponse(404, { error: 'Chave não configurada.' })

    const value = decryptSecret(data.encrypted_value)
    return jsonResponse(200, { value })
  } catch (err) {
    if (err instanceof HttpError) return jsonResponse(err.status, { error: err.message })
    return jsonResponse(500, { error: (err as Error).message })
  }
}
