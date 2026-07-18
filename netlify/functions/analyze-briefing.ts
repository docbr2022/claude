import type { Handler } from '@netlify/functions'
import { getSupabaseAdmin, getUserFromRequest, jsonResponse, HttpError } from './_shared/supabaseAdmin'
import { callGemini } from './_shared/gemini'
import { extractJson } from './_shared/json'
import { resolveIntegrationValue } from './_shared/integrationKeys'

interface BriefingAnalysis {
  summary: string
  target_audience: string
  tone: string
  image_prompts: string[]
  video_prompts: string[]
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido.' })
  }

  try {
    const user = await getUserFromRequest(event.headers as Record<string, string | undefined>)
    const { title, content } = JSON.parse(event.body || '{}') as {
      title?: string
      content?: string
    }

    if (!content || !content.trim()) {
      return jsonResponse(400, { error: 'Cole o conteúdo do briefing.' })
    }

    const apiKey = await resolveIntegrationValue(user.id, 'google', 'GOOGLE_API_KEY')
    if (!apiKey) {
      return jsonResponse(400, {
        error: 'Configure sua chave do Google (Gemini) em Configurações para usar este recurso.',
      })
    }

    const systemPrompt =
      'Você é um estrategista de marketing e diretor de criação. Leia o briefing e extraia ' +
      'informações estruturadas, além de gerar prompts prontos para geradores de imagem e vídeo ' +
      'de IA (bem descritivos: cena, estilo visual, iluminação, enquadramento). ' +
      'Responda SOMENTE com um objeto JSON válido, sem texto antes ou depois, sem markdown.'

    const userPrompt = `Briefing:
"""
${content}
"""

Retorne um objeto JSON no formato:
{
  "summary": "resumo executivo do briefing em até 4 frases",
  "target_audience": "descrição do público-alvo",
  "tone": "tom de voz recomendado para a campanha",
  "image_prompts": ["4 a 6 prompts detalhados para gerar imagens de campanha"],
  "video_prompts": ["3 a 5 prompts detalhados para gerar vídeos curtos de campanha"]
}`

    const raw = await callGemini(systemPrompt, userPrompt, apiKey, { jsonMode: true, maxTokens: 3000 })
    const analysis = extractJson<BriefingAnalysis>(raw)

    const admin = getSupabaseAdmin()
    const { data: briefing, error: briefingError } = await admin
      .from('briefings')
      .insert({
        owner_id: user.id,
        title: title?.trim() || 'Briefing sem título',
        raw_content: content,
        summary: analysis.summary,
        target_audience: analysis.target_audience,
        tone: analysis.tone,
      })
      .select()
      .single()

    if (briefingError || !briefing) {
      return jsonResponse(500, { error: briefingError?.message ?? 'Falha ao salvar briefing.' })
    }

    const promptRows = [
      ...analysis.image_prompts.map((p) => ({
        briefing_id: briefing.id,
        owner_id: user.id,
        kind: 'image' as const,
        prompt_text: p,
      })),
      ...analysis.video_prompts.map((p) => ({
        briefing_id: briefing.id,
        owner_id: user.id,
        kind: 'video' as const,
        prompt_text: p,
      })),
    ]

    const { data: prompts, error: promptsError } = await admin
      .from('generated_prompts')
      .insert(promptRows)
      .select()

    if (promptsError) return jsonResponse(500, { error: promptsError.message })

    return jsonResponse(200, { briefing, prompts })
  } catch (err) {
    if (err instanceof HttpError) return jsonResponse(err.status, { error: err.message })
    return jsonResponse(500, { error: (err as Error).message })
  }
}
