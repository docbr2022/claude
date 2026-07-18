/** Chama a API da Anthropic e retorna o texto da resposta. Pede JSON quando `jsonMode` é true. */
export async function callClaude(systemPrompt: string, userPrompt: string, maxTokens = 2000) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY não configurada nas variáveis de ambiente da Netlify.')
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Falha ao chamar a Anthropic API: ${errBody}`)
  }

  const data = (await res.json()) as { content: { type: string; text?: string }[] }
  const text = data.content?.find((c) => c.type === 'text')?.text ?? ''
  return text
}

/** Extrai o primeiro bloco JSON de uma resposta de texto do modelo. */
export function extractJson<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
  if (!match) throw new Error('Não foi possível interpretar a resposta da IA como JSON.')
  return JSON.parse(match[0]) as T
}
