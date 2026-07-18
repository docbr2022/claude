import { useState, type FormEvent } from 'react'
import { Megaphone, AlertCircle, Copy, Check } from 'lucide-react'
import { callFunction, FunctionCallError } from '@/lib/functions'
import type { CampaignCopy } from '@/types/database'

export default function CampaignCopyGenerator() {
  const [product, setProduct] = useState('')
  const [platform, setPlatform] = useState<'google' | 'meta'>('google')
  const [objective, setObjective] = useState('')
  const [tone, setTone] = useState('profissional')
  const [differentials, setDifferentials] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copies, setCopies] = useState<CampaignCopy[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!product.trim()) return
    setLoading(true)
    setError(null)
    try {
      const { copies: result } = await callFunction<{ copies: CampaignCopy[] }>('generate-copy', {
        product,
        platform,
        objective,
        tone,
        differentials,
      })
      setCopies(result)
    } catch (err) {
      setError(err instanceof FunctionCallError ? err.message : 'Erro inesperado ao gerar copies.')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(id: string, text: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  function fullCopyText(c: CampaignCopy) {
    return [c.headline, c.primary_text, c.description, c.call_to_action]
      .filter(Boolean)
      .join('\n')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Campanhas & Copy</h1>
        <p className="mt-1 text-sm text-ink-500">
          Gere variações de copy prontas para Google Ads e Meta Ads.
        </p>
      </div>

      <div className="card mb-6 p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Produto ou serviço</label>
              <textarea
                required
                className="input min-h-20"
                placeholder="Descreva o que está sendo anunciado"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Plataforma</label>
              <select
                className="input"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as 'google' | 'meta')}
              >
                <option value="google">Google Ads</option>
                <option value="meta">Meta Ads (Facebook/Instagram)</option>
              </select>
            </div>
            <div>
              <label className="label">Tom de voz</label>
              <input
                className="input"
                placeholder="Ex: divertido, urgente, profissional"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Objetivo da campanha</label>
              <input
                className="input"
                placeholder="Ex: gerar leads, vendas diretas, tráfego"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Diferenciais</label>
              <input
                className="input"
                placeholder="Ex: frete grátis, garantia de 1 ano"
                value={differentials}
                onChange={(e) => setDifferentials(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            <Megaphone size={16} />
            {loading ? 'Gerando copies...' : 'Gerar copies'}
          </button>
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}
        </form>
      </div>

      {copies.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {copies.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="badge bg-brand-100 text-brand-700">
                  {c.platform === 'google' ? 'Google Ads' : 'Meta Ads'}
                </span>
                <button
                  onClick={() => copyToClipboard(c.id, fullCopyText(c))}
                  className="text-ink-400 hover:text-brand-600"
                  title="Copiar tudo"
                >
                  {copiedId === c.id ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className="font-semibold text-ink-900">{c.headline}</p>
              {c.primary_text && <p className="mt-1 text-sm text-ink-600">{c.primary_text}</p>}
              {c.description && <p className="mt-1 text-sm text-ink-500">{c.description}</p>}
              {c.call_to_action && (
                <span className="mt-3 inline-block rounded-full bg-ink-900 px-3 py-1 text-xs font-medium text-white">
                  {c.call_to_action}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
