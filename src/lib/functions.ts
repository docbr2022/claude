import { supabase } from './supabase'

export class FunctionCallError extends Error {}

/** Chama uma Netlify Function autenticada, anexando o token de sessão do Supabase. */
export async function callFunction<T = unknown>(name: string, body: unknown): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  const res = await fetch(`/.netlify/functions/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })

  const payload = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new FunctionCallError(payload?.error || `Erro ao chamar ${name} (${res.status})`)
  }

  return payload as T
}
