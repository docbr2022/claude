import type { Handler } from '@netlify/functions'
import { getSupabaseAdmin, getUserFromRequest, jsonResponse, HttpError } from './_shared/supabaseAdmin'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido.' })
  }

  try {
    const user = await getUserFromRequest(event.headers as Record<string, string | undefined>)
    const admin = getSupabaseAdmin()

    const { data, error } = await admin
      .from('integration_keys')
      .select('provider, updated_at')
      .eq('owner_id', user.id)

    if (error) return jsonResponse(500, { error: error.message })

    // Nunca retorna o valor, só quais provedores já têm chave salva.
    return jsonResponse(200, { configured: data ?? [] })
  } catch (err) {
    if (err instanceof HttpError) return jsonResponse(err.status, { error: err.message })
    return jsonResponse(500, { error: (err as Error).message })
  }
}
