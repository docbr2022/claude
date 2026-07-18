import { useEffect, useState, type FormEvent } from 'react'
import { Sparkles, AlertCircle, Download } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { callFunction, FunctionCallError } from '@/lib/functions'
import type { GeneratedImage } from '@/types/database'

export default function ImageGenerator() {
  const { user } = useAuth()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    if (!user || !isSupabaseConfigured) {
      setLoadingHistory(false)
      return
    }
    supabase
      .from('generated_images')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setImages(data ?? [])
        setLoadingHistory(false)
      })
  }, [user])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    try {
      const { image } = await callFunction<{ image: GeneratedImage }>('generate-image', {
        prompt,
      })
      setImages((prev) => [image, ...prev])
      setPrompt('')
    } catch (err) {
      setError(err instanceof FunctionCallError ? err.message : 'Erro inesperado ao gerar imagem.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Gerador de Imagens</h1>
        <p className="mt-1 text-sm text-ink-500">
          Descreva a imagem que você precisa para sua campanha e gere com IA.
        </p>
      </div>

      <div className="card mb-6 p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Prompt</label>
            <textarea
              className="input min-h-24"
              placeholder="Ex: Fotografia de produto de um tênis esportivo branco, fundo gradiente azul, iluminação de estúdio, estilo minimalista"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <button type="submit" disabled={loading} className="btn-primary">
              <Sparkles size={16} />
              {loading ? 'Gerando...' : 'Gerar imagem'}
            </button>
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}
        </form>
      </div>

      <h2 className="mb-3 text-sm font-semibold text-ink-800">Histórico</h2>
      {loadingHistory ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : images.length === 0 ? (
        <p className="text-sm text-ink-400">Nenhuma imagem gerada ainda.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="card overflow-hidden">
              <img src={img.image_url} alt={img.prompt} className="aspect-square w-full object-cover" />
              <div className="p-3">
                <p className="line-clamp-2 text-xs text-ink-600">{img.prompt}</p>
                <a
                  href={img.image_url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
                >
                  <Download size={12} /> Baixar
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
