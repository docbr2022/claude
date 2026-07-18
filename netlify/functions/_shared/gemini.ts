const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

/** Chama a API do Gemini (texto) e retorna a resposta como string. */
export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  options: { jsonMode?: boolean; maxTokens?: number; model?: string } = {},
) {
  const { jsonMode = false, maxTokens = 2000, model = 'gemini-2.5-flash' } = options

  const res = await fetch(`${BASE_URL}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Falha ao chamar a API do Gemini: ${errBody}`)
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
  if (!text) throw new Error('O Gemini não retornou nenhum texto.')
  return text
}

/** Gera uma imagem com o Gemini e retorna como data URL (base64). */
export async function generateGeminiImage(
  prompt: string,
  apiKey: string,
  model = 'gemini-2.5-flash-image',
) {
  const res = await fetch(`${BASE_URL}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Falha ao gerar imagem com o Gemini: ${errBody}`)
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { mimeType: string; data: string } }[] } }[]
  }

  const imagePart = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData
  if (!imagePart) throw new Error('O Gemini não retornou nenhuma imagem.')

  return `data:${imagePart.mimeType};base64,${imagePart.data}`
}
