import type { Handler } from '@netlify/functions'
import { getSupabaseAdmin, getUserFromRequest, jsonResponse, HttpError } from './_shared/supabaseAdmin'
import { callGemini } from './_shared/gemini'
import { extractJson } from './_shared/json'
import { resolveIntegrationValue } from './_shared/integrationKeys'

interface LandingPageContent {
  headline: string
  subheadline: string
  cta_text: string
  benefits: { title: string; description: string }[]
  testimonial: { quote: string; author: string }
  faq: { question: string; answer: string }[]
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60)
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido.' })
  }

  try {
    const user = await getUserFromRequest(event.headers as Record<string, string | undefined>)
    const {
      name,
      product,
      audience = '',
      tone = 'profissional',
    } = JSON.parse(event.body || '{}') as {
      name?: string
      product?: string
      audience?: string
      tone?: string
    }

    if (!name || !product) {
      return jsonResponse(400, { error: 'Informe o nome da página e a descrição do produto.' })
    }

    const apiKey = await resolveIntegrationValue(user.id, 'google', 'GOOGLE_API_KEY')
    if (!apiKey) {
      return jsonResponse(400, {
        error: 'Configure sua chave do Google (Gemini) em Configurações para usar este recurso.',
      })
    }

    const systemPrompt =
      'Você é um copywriter e estrategista de conversão especializado em landing pages. ' +
      'Responda SOMENTE com um objeto JSON válido, sem texto antes ou depois, sem markdown.'

    const userPrompt = `Crie o conteúdo de uma landing page de alta conversão para:
Produto/serviço: ${product}
Público-alvo: ${audience || 'não informado'}
Tom de voz: ${tone}

Retorne um objeto JSON no formato:
{
  "headline": "título principal impactante",
  "subheadline": "subtítulo que reforça a proposta de valor",
  "cta_text": "texto do botão de call-to-action",
  "benefits": [{"title": "...", "description": "..."}] (exatamente 3 itens),
  "testimonial": {"quote": "depoimento fictício realista", "author": "Nome, Cargo"},
  "faq": [{"question": "...", "answer": "..."}] (exatamente 4 itens)
}`

    const raw = await callGemini(systemPrompt, userPrompt, apiKey, { jsonMode: true, maxTokens: 3000 })
    const content = extractJson<LandingPageContent>(raw)

    const admin = getSupabaseAdmin()
    const baseSlug = slugify(name) || `landing-${Date.now()}`
    const { data, error } = await admin
      .from('landing_pages')
      .insert({
        owner_id: user.id,
        name,
        slug: `${baseSlug}-${Date.now().toString(36)}`,
        content,
        status: 'draft',
      })
      .select()
      .single()

    if (error) return jsonResponse(500, { error: error.message })

    return jsonResponse(200, { landingPage: data })
  } catch (err) {
    if (err instanceof HttpError) return jsonResponse(err.status, { error: err.message })
    return jsonResponse(500, { error: (err as Error).message })
  }
}
