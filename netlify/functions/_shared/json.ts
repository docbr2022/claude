/** Extrai o primeiro bloco JSON de uma resposta de texto do modelo. */
export function extractJson<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
  if (!match) throw new Error('Não foi possível interpretar a resposta da IA como JSON.')
  return JSON.parse(match[0]) as T
}
