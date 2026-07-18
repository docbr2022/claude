import { getSupabaseAdmin } from './supabaseAdmin'
import { decryptSecret } from './crypto'

export type IntegrationProvider =
  | 'anthropic'
  | 'openai'
  | 'whatsapp_access_token'
  | 'whatsapp_phone_number_id'
  | 'whatsapp_verify_token'

/** Busca a chave salva pelo usuário em Configurações. Retorna null se não configurada. */
export async function getUserIntegrationValue(
  ownerId: string,
  provider: IntegrationProvider,
): Promise<string | null> {
  const admin = getSupabaseAdmin()
  const { data } = await admin
    .from('integration_keys')
    .select('encrypted_value')
    .eq('owner_id', ownerId)
    .eq('provider', provider)
    .maybeSingle()

  if (!data) return null
  return decryptSecret(data.encrypted_value)
}

/** Chave do usuário (Configurações) com fallback para a variável de ambiente global da Netlify. */
export async function resolveIntegrationValue(
  ownerId: string,
  provider: IntegrationProvider,
  envVarName: string,
): Promise<string | null> {
  const userValue = await getUserIntegrationValue(ownerId, provider)
  if (userValue) return userValue
  return process.env[envVarName] || null
}
