import type { Handler } from '@netlify/functions'
import { getSupabaseAdmin, getUserFromRequest, jsonResponse, HttpError } from './_shared/supabaseAdmin'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido.' })
  }

  try {
    const user = await getUserFromRequest(event.headers as Record<string, string | undefined>)
    const { prompt, size = '1024x1024' } = JSON.parse(event.body || '{}') as {
      prompt?: string
      size?: string
    }

    if (!prompt || !prompt.trim()) {
      return jsonResponse(400, { error: 'Informe um prompt para gerar a imagem.' })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return jsonResponse(500, {
        error: 'OPENAI_API_KEY não configurada nas variáveis de ambiente da Netlify.',
      })
    }

    const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        size,
        n: 1,
      }),
    })

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text()
      return jsonResponse(502, { error: `Falha ao gerar imagem: ${errBody}` })
    }

    const openaiData = (await openaiRes.json()) as { data: { b64_json?: string; url?: string }[] }
    const first = openaiData.data?.[0]
    const imageUrl = first?.url ?? (first?.b64_json ? `data:image/png;base64,${first.b64_json}` : null)

    if (!imageUrl) {
      return jsonResponse(502, { error: 'A API de imagens não retornou nenhum resultado.' })
    }

    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('generated_images')
      .insert({ owner_id: user.id, prompt, image_url: imageUrl, provider: 'openai' })
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
