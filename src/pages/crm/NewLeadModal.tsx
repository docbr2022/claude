import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { PipelineStage } from '@/types/database'

export interface NewLeadInput {
  name: string
  email: string
  phone: string
  company: string
  source: string
  value: string
  stage_id: string
}

export default function NewLeadModal({
  stages,
  defaultStageId,
  onClose,
  onCreate,
}: {
  stages: PipelineStage[]
  defaultStageId: string
  onClose: () => void
  onCreate: (input: NewLeadInput) => Promise<void>
}) {
  const [form, setForm] = useState<NewLeadInput>({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    value: '',
    stage_id: defaultStageId,
  })
  const [saving, setSaving] = useState(false)

  function update<K extends keyof NewLeadInput>(key: K, value: NewLeadInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onCreate(form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink-900">Novo lead</h3>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Nome *</label>
            <input
              required
              className="input"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">E-mail</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Empresa</label>
              <input
                className="input"
                value={form.company}
                onChange={(e) => update('company', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Valor (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input"
                value={form.value}
                onChange={(e) => update('value', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label">Origem</label>
            <input
              className="input"
              placeholder="Ex: Instagram, Indicação, Google Ads"
              value={form.source}
              onChange={(e) => update('source', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Estágio</label>
            <select
              className="input"
              value={form.stage_id}
              onChange={(e) => update('stage_id', e.target.value)}
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Salvando...' : 'Criar lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
