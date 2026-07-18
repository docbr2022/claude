import { useState, type FormEvent } from 'react'
import { FileText, Sparkles, AlertCircle, Copy, Check, Image as ImageIcon, Video } from 'lucide-react'
import { callFunction, FunctionCallError } from '@/lib/functions'
import type { Briefing, GeneratedPrompt } from '@/types/database'

export default function BriefingReader() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ briefing: Briefing; prompts: GeneratedPrompt[] } | null>(
    null,
  )
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    setError(null)
    try {
      const data = await callFunction<{ briefing: Briefing; prompts: GeneratedPrompt[] }>(
        'analyze-briefing',
        { title, content },
      )
      setResult(data)
    } catch (err) {
      setError(
        err instanceof FunctionCallError ? err.message : 'Erro inesperado ao analisar o briefing.',
      )
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(id: string, text: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const imagePrompts = result?.prompts.filter((p) => p.kind === 'image') ?? []
  const videoPrompts = result?.prompts.filter((p) => p.kind === 'video') ?? []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Leitor de Briefing</h1>
        <p className="mt-1 text-sm text-ink-500">
          Cole o briefing da campanha e receba um resumo estruturado + prompts prontos para
          imagens e vídeos.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Título do briefing</label>
              <input
                className="input"
                placeholder="Ex: Campanha de lançamento - Coleção Verão"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Conteúdo do briefing</label>
              <textarea
                required
                className="input min-h-64"
                placeholder="Cole aqui o briefing completo da campanha: objetivos, público-alvo, produto, tom de voz, referências..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              <Sparkles size={16} />
              {loading ? 'Analisando...' : 'Analisar briefing'}
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
          {!result ? (
            <div className="card flex h-full min-h-64 flex-col items-center justify-center gap-2 p-8 text-center text-ink-400">
              <FileText size={28} />
              <p className="text-sm">O resultado da análise aparecerá aqui.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-ink-800">Resumo</h3>
                <p className="mt-1.5 text-sm text-ink-600">{result.briefing.summary}</p>
                <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-ink-400">Público-alvo</p>
                    <p className="text-ink-700">{result.briefing.target_audience}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-ink-400">Tom de voz</p>
                    <p className="text-ink-700">{result.briefing.tone}</p>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-800">
                  <ImageIcon size={16} /> Prompts de imagem
                </h3>
                <ul className="space-y-2">
                  {imagePrompts.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-start gap-2 rounded-lg border border-ink-100 p-3 text-sm text-ink-700"
                    >
                      <span className="flex-1">{p.prompt_text}</span>
                      <button
                        onClick={() => copyToClipboard(p.id, p.prompt_text)}
                        className="shrink-0 text-ink-400 hover:text-brand-600"
                      >
                        {copiedId === p.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-800">
                  <Video size={16} /> Prompts de vídeo
                </h3>
                <ul className="space-y-2">
                  {videoPrompts.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-start gap-2 rounded-lg border border-ink-100 p-3 text-sm text-ink-700"
                    >
                      <span className="flex-1">{p.prompt_text}</span>
                      <button
                        onClick={() => copyToClipboard(p.id, p.prompt_text)}
                        className="shrink-0 text-ink-400 hover:text-brand-600"
                      >
                        {copiedId === p.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
