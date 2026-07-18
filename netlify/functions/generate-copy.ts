import type { Handler } from '@netlify/functions'
import { getSupabaseAdmin, getUserFromRequest, jsonResponse, HttpError } from './_shared/supabaseAdmin'
import { callGemini } from './_shared/gemini'
import { extractJson } from './_shared/json'
import { resolveIntegrationValue } from './_shared/integrationKeys'

interface CopyVariation {
  headline: string
  primary_text: string
  description: string
  call_to_action: string
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido.' })
  }

  try {
    const user = await getUserFromRequest(event.headers as Record<string, string | undefined>)
    const {
      product,
      platform = 'google',
      objective = '',
      tone = 'profissional',
      differentials = '',
      campaign_id = null,
    } = JSON.parse(event.body || '{}') as {
      product?: string
      platform?: 'google' | 'meta'
      objective?: string
      tone?: string
      differentials?: string
      campaign_id?: string | null
    }

    if (!product || !product.trim()) {
      return jsonResponse(400, { error: 'Descreva o produto/serviço da campanha.' })
    }

    const apiKey = await resolveIntegrationValue(user.id, 'google', 'GOOGLE_API_KEY')
    if (!apiKey) {
      return jsonResponse(400, {
        error: 'Configure sua chave do Google (Gemini) em Configurações para usar este recurso.',
      })
    }

    const platformLabel = platform === 'meta' ? 'Meta Ads (Facebook/Instagram)' : 'Google Ads'

    const systemPrompt =
      'Você é um redator publicitário sênior especializado em performance marketing. ' +
      'Responda SOMENTE com um array JSON válido, sem texto antes ou depois, sem markdown.'

    const userPrompt = `Crie 4 variações de copy para uma campanha de ${platformLabel}.
Produto/serviço: ${product}
Objetivo da campanha: ${objective || 'não informado'}
Tom de voz: ${tone}
Diferenciais: ${differentials || 'não informado'}

Regras de tamanho:
- Google Ads: headline até 30 caracteres, description até 90 caracteres.
- Meta Ads: headline até 40 caracteres, primary_text até 125 caracteres.

Retorne um array JSON com objetos no formato:
[{"headline": "...", "primary_text": "...", "description": "...", "call_to_action": "..."}]`

    const raw = await callGemini(systemPrompt, userPrompt, apiKey, { jsonMode: true })
    const variations = extractJson<CopyVariation[]>(raw)

    const admin = getSupabaseAdmin()
    const rows = variations.map((v) => ({
      owner_id: user.id,
      campaign_id,
      platform,
      headline: v.headline,
      primary_text: v.primary_text,
      description: v.description,
      call_to_action: v.call_to_action,
    }))

    const { data, error } = await admin.from('campaign_copies').insert(rows).select()
    if (error) return jsonResponse(500, { error: error.message })

    return jsonResponse(200, { copies: data })
  } catch (err) {
    if (err instanceof HttpError) return jsonResponse(err.status, { error: err.message })
    return jsonResponse(500, { error: (err as Error).message })
  }
}
