import { useEffect, useState, type FormEvent } from 'react'
import { LayoutTemplate, Sparkles, AlertCircle, ExternalLink } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { callFunction, FunctionCallError } from '@/lib/functions'
import type { LandingPage } from '@/types/database'
import LandingPagePreview from './LandingPagePreview'

export default function LandingPageGenerator() {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [product, setProduct] = useState('')
  const [audience, setAudience] = useState('')
  const [tone, setTone] = useState('profissional')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pages, setPages] = useState<LandingPage[]>([])
  const [previewing, setPreviewing] = useState<LandingPage | null>(null)

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return
    supabase
      .from('landing_pages')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setPages(data ?? []))
  }, [user])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !product.trim()) return
    setLoading(true)
    setError(null)
    try {
      const { landingPage } = await callFunction<{ landingPage: LandingPage }>(
        'generate-landing-page',
        { name, product, audience, tone },
      )
      setPages((prev) => [landingPage, ...prev])
      setPreviewing(landingPage)
      setName('')
      setProduct('')
      setAudience('')
    } catch (err) {
      setError(
        err instanceof FunctionCallError ? err.message : 'Erro inesperado ao gerar a página.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Gerador de Landing Pages</h1>
        <p className="mt-1 text-sm text-ink-500">
          Descreva seu produto e gere o conteúdo completo de uma landing page de conversão.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nome da página</label>
              <input
                required
                className="input"
                placeholder="Ex: Lançamento Curso de Marketing Digital"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Produto / serviço</label>
              <textarea
                required
                className="input min-h-24"
                placeholder="Descreva o que está sendo vendido, principais benefícios..."
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Público-alvo</label>
                <input
                  className="input"
                  placeholder="Ex: empreendedores iniciantes"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Tom de voz</label>
                <input className="input" value={tone} onChange={(e) => setTone(e.target.value)} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              <Sparkles size={16} />
              {loading ? 'Gerando página...' : 'Gerar landing page'}
            </button>
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}
          </form>
        </div>

        <div>
          {previewing ? (
            <LandingPagePreview page={previewing} />
          ) : (
            <div className="card flex h-full min-h-64 flex-col items-center justify-center gap-2 p-8 text-center text-ink-400">
              <LayoutTemplate size={28} />
              <p className="text-sm">A prévia da landing page aparecerá aqui.</p>
            </div>
          )}
        </div>
      </div>

      {pages.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-ink-800">Páginas geradas</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((p) => (
              <button
                key={p.id}
                onClick={() => setPreviewing(p)}
                className="card flex items-center justify-between p-4 text-left hover:-translate-y-0.5 transition-transform"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-900">{p.name}</p>
                  <p className="text-xs text-ink-400">
                    {new Date(p.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <ExternalLink size={16} className="shrink-0 text-ink-400" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
