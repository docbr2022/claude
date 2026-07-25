import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Pencil, Trash2, Copy, Check, Loader2 } from 'lucide-react'
import { callFunction, FunctionCallError } from '@/lib/functions'

export interface ProviderDef {
  id: string
  label: string
  hint: string
  placeholder: string
}

export default function IntegrationKeyCard({
  provider,
  configured,
  onChange,
}: {
  provider: ProviderDef
  configured: boolean
  onChange: () => void
}) {
  const [mode, setMode] = useState<'idle' | 'editing'>(configured ? 'idle' : 'editing')
  const [inputValue, setInputValue] = useState('')
  const [revealedValue, setRevealedValue] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [revealing, setRevealing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!inputValue.trim()) return
    setSaving(true)
    setError(null)
    try {
      await callFunction('settings-save', { provider: provider.id, value: inputValue })
      setInputValue('')
      setRevealedValue(null)
      setMode('idle')
      onChange()
    } catch (err) {
      setError(err instanceof FunctionCallError ? err.message : 'Erro ao salvar a chave.')
    } finally {
      setSaving(false)
    }
  }

  async function handleReveal() {
    if (revealedValue) {
      setRevealedValue(null)
      return
    }
    setRevealing(true)
    setError(null)
    try {
      const { value } = await callFunction<{ value: string }>('settings-reveal', {
        provider: provider.id,
      })
      setRevealedValue(value)
    } catch (err) {
      setError(err instanceof FunctionCallError ? err.message : 'Erro ao revelar a chave.')
    } finally {
      setRevealing(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Remover a chave de ${provider.label}?`)) return
    setError(null)
    try {
      await callFunction('settings-delete', { provider: provider.id })
      setRevealedValue(null)
      setMode('editing')
      onChange()
    } catch (err) {
      setError(err instanceof FunctionCallError ? err.message : 'Erro ao remover a chave.')
    }
  }

  function copyValue() {
    if (!revealedValue) return
    navigator.clipboard.writeText(revealedValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-ink-900">{provider.label}</h3>
            <span
              className={`badge ${
                configured ? 'bg-emerald-100 text-emerald-700' : 'bg-ink-100 text-ink-500'
              }`}
            >
              {configured ? 'Configurada' : 'Não configurada'}
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-500">{provider.hint}</p>
        </div>
      </div>

      {mode === 'editing' ? (
        <form onSubmit={handleSave} className="flex gap-2">
          <input
            type="password"
            autoComplete="off"
            className="input font-mono text-sm"
            placeholder={provider.placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" disabled={saving || !inputValue.trim()} className="btn-primary shrink-0">
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Salvar'}
          </button>
          {configured && (
            <button
              type="button"
              onClick={() => setMode('idle')}
              className="btn-secondary shrink-0"
            >
              Cancelar
            </button>
          )}
        </form>
      ) : (
        <div className="flex items-center gap-2">
          <div className="input flex-1 select-none font-mono text-sm text-ink-500">
            {revealedValue ?? '••••••••••••••••••••••••'}
          </div>
          <button
            type="button"
            onClick={handleReveal}
            disabled={revealing}
            className="btn-secondary shrink-0 !px-3"
            title={revealedValue ? 'Ocultar' : 'Revelar'}
          >
            {revealing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : revealedValue ? (
              <EyeOff size={16} />
            ) : (
              <Eye size={16} />
            )}
          </button>
          {revealedValue && (
            <button
              type="button"
              onClick={copyValue}
              className="btn-secondary shrink-0 !px-3"
              title="Copiar"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          )}
          <button
            type="button"
            onClick={() => setMode('editing')}
            className="btn-secondary shrink-0 !px-3"
            title="Editar"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="btn-secondary shrink-0 !px-3 text-red-600 hover:bg-red-50"
            title="Remover"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}
