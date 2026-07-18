import type { Handler } from '@netlify/functions'
import { getSupabaseAdmin, getUserFromRequest, jsonResponse, HttpError } from './_shared/supabaseAdmin'
import { encryptSecret } from './_shared/crypto'
import type { IntegrationProvider } from './_shared/integrationKeys'

const VALID_PROVIDERS: IntegrationProvider[] = [
  'anthropic',
  'openai',
  'whatsapp_access_token',
  'whatsapp_phone_number_id',
  'whatsapp_verify_token',
]

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido.' })
  }

  try {
    const user = await getUserFromRequest(event.headers as Record<string, string | undefined>)
    const { provider, value } = JSON.parse(event.body || '{}') as {
      provider?: string
      value?: string
    }

    if (!provider || !VALID_PROVIDERS.includes(provider as IntegrationProvider)) {
      return jsonResponse(400, { error: 'Provedor inválido.' })
    }
    if (!value || !value.trim()) {
      return jsonResponse(400, { error: 'Informe um valor para a chave.' })
    }

    const admin = getSupabaseAdmin()
    const encrypted_value = encryptSecret(value.trim())

    const { error } = await admin.from('integration_keys').upsert(
      {
        owner_id: user.id,
        provider,
        encrypted_value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'owner_id,provider' },
    )

    if (error) return jsonResponse(500, { error: error.message })

    return jsonResponse(200, { ok: true })
  } catch (err) {
    if (err instanceof HttpError) return jsonResponse(err.status, { error: err.message })
    return jsonResponse(500, { error: (err as Error).message })
  }
}
