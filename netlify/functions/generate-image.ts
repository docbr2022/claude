import type { Handler } from '@netlify/functions'
import { getSupabaseAdmin, getUserFromRequest, jsonResponse, HttpError } from './_shared/supabaseAdmin'
import { resolveIntegrationValue } from './_shared/integrationKeys'
import { generateGeminiImage } from './_shared/gemini'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido.' })
  }

  try {
    const user = await getUserFromRequest(event.headers as Record<string, string | undefined>)
    const { prompt } = JSON.parse(event.body || '{}') as { prompt?: string }

    if (!prompt || !prompt.trim()) {
      return jsonResponse(400, { error: 'Informe um prompt para gerar a imagem.' })
    }

    const apiKey = await resolveIntegrationValue(user.id, 'google', 'GOOGLE_API_KEY')
    if (!apiKey) {
      return jsonResponse(400, {
        error: 'Configure sua chave do Google (Gemini) em Configurações para usar este recurso.',
      })
    }

    const imageUrl = await generateGeminiImage(prompt, apiKey)

    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('generated_images')
      .insert({ owner_id: user.id, prompt, image_url: imageUrl, provider: 'google' })
      .select()
      .single()

    if (error) {
      return jsonResponse(500, { error: error.message })
    }

    return jsonResponse(200, { image: data })
  } catch (err) {
    if (err instanceof HttpError) return jsonResponse(err.status, { error: err.message })
    return jsonResponse(500, { error: (err as Error).message })
  }
}
