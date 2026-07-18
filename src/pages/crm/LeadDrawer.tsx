import { useEffect, useState, type FormEvent } from 'react'
import { X, Mail, Phone, Building2, Tag, Trash2, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Lead, LeadActivity } from '@/types/database'

export default function LeadDrawer({
  lead,
  onClose,
  onDeleted,
}: {
  lead: Lead
  onClose: () => void
  onDeleted: (leadId: string) => void
}) {
  const { user } = useAuth()
  const [activities, setActivities] = useState<LeadActivity[]>([])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false })
      if (active) {
        setActivities(data ?? [])
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [lead.id])

  async function handleAddNote(e: FormEvent) {
    e.preventDefault()
    if (!note.trim() || !user) return
    setSending(true)
    const { data, error } = await supabase
      .from('lead_activities')
      .insert({ lead_id: lead.id, owner_id: user.id, type: 'note', content: note.trim() })
      .select()
      .single()
    if (!error && data) {
      setActivities((prev) => [data, ...prev])
      setNote('')
    }
    setSending(false)
  }

  async function handleDelete() {
    if (!confirm(`Excluir o lead "${lead.name}"? Esta ação não pode ser desfeita.`)) return
    const { error } = await supabase.from('leads').delete().eq('id', lead.id)
    if (!error) onDeleted(lead.id)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink-950/40">
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-ink-100 p-5">
          <h3 className="text-lg font-semibold text-ink-900">{lead.name}</h3>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-2.5 text-sm">
            {lead.email && (
              <div className="flex items-center gap-2 text-ink-600">
                <Mail size={15} className="text-ink-400" /> {lead.email}
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-2 text-ink-600">
                <Phone size={15} className="text-ink-400" /> {lead.phone}
              </div>
            )}
            {lead.company && (
              <div className="flex items-center gap-2 text-ink-600">
                <Building2 size={15} className="text-ink-400" /> {lead.company}
              </div>
            )}
            {lead.source && (
              <div className="flex items-center gap-2 text-ink-600">
                <Tag size={15} className="text-ink-400" /> {lead.source}
              </div>
            )}
            {!!lead.value && (
              <div className="pt-1 text-base font-semibold text-ink-900">
                {Number(lead.value).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </div>
            )}
          </div>

          <div className="mt-6">
            <h4 className="mb-3 text-sm font-semibold text-ink-900">Atividades</h4>
            <form onSubmit={handleAddNote} className="mb-4 flex gap-2">
              <input
                className="input"
                placeholder="Adicionar nota..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button
                type="submit"
                disabled={sending || !note.trim()}
                className="btn-primary !px-3"
                aria-label="Enviar nota"
              >
                <Send size={16} />
              </button>
            </form>

            {loading ? (
              <p className="text-sm text-ink-400">Carregando...</p>
            ) : activities.length === 0 ? (
              <p className="text-sm text-ink-400">Nenhuma atividade ainda.</p>
            ) : (
              <ul className="space-y-3">
                {activities.map((a) => (
                  <li key={a.id} className="rounded-lg border border-ink-100 p-3 text-sm">
                    <p className="text-ink-700">{a.content}</p>
                    <p className="mt-1 text-xs text-ink-400">
                      {new Date(a.created_at).toLocaleString('pt-BR')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="border-t border-ink-100 p-4">
          <button
            onClick={handleDelete}
            className="btn-ghost w-full text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} />
            Excluir lead
          </button>
        </div>
      </div>
    </div>
  )
}
