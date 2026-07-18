import { useEffect, useState, type FormEvent } from 'react'
import { Send, Plus, MessageCircle, AlertCircle } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { callFunction, FunctionCallError } from '@/lib/functions'
import type { WhatsappConversation, WhatsappMessage } from '@/types/database'

export default function WhatsappInbox() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<WhatsappConversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<WhatsappMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newPhone, setNewPhone] = useState('')
  const [newName, setNewName] = useState('')

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return
    supabase
      .from('whatsapp_conversations')
      .select('*')
      .eq('owner_id', user.id)
      .order('last_message_at', { ascending: false })
      .then(({ data }) => {
        setConversations(data ?? [])
        if (data && data.length > 0) setActiveId(data[0].id)
      })
  }, [user])

  useEffect(() => {
    if (!activeId) {
      setMessages([])
      return
    }
    supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('conversation_id', activeId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data ?? []))
  }, [activeId])

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!draft.trim() || !activeId) return
    setSending(true)
    setError(null)
    try {
      const { message } = await callFunction<{ message: WhatsappMessage }>('whatsapp-send', {
        conversation_id: activeId,
        content: draft,
      })
      setMessages((prev) => [...prev, message])
      setDraft('')
    } catch (err) {
      setError(err instanceof FunctionCallError ? err.message : 'Erro ao enviar mensagem.')
    } finally {
      setSending(false)
    }
  }

  async function handleNewConversation(e: FormEvent) {
    e.preventDefault()
    if (!newPhone.trim()) return
    setSending(true)
    setError(null)
    try {
      const { conversation_id } = await callFunction<{ conversation_id: string }>(
        'whatsapp-send',
        { contact_phone: newPhone, contact_name: newName, content: 'Olá! 👋' },
      )
      const { data } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .eq('id', conversation_id)
        .single()
      if (data) {
        setConversations((prev) => [data, ...prev])
        setActiveId(data.id)
      }
      setShowNew(false)
      setNewPhone('')
      setNewName('')
    } catch (err) {
      setError(err instanceof FunctionCallError ? err.message : 'Erro ao iniciar conversa.')
    } finally {
      setSending(false)
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-medium">Supabase não configurado</p>
          <p className="mt-1">
            Configure o Supabase e as variáveis <code>WHATSAPP_ACCESS_TOKEN</code>,{' '}
            <code>WHATSAPP_PHONE_NUMBER_ID</code> e <code>WHATSAPP_VERIFY_TOKEN</code> na Netlify
            para conectar sua conta do WhatsApp Business (Meta Cloud API).
          </p>
        </div>
      </div>
    )
  }

  const activeConversation = conversations.find((c) => c.id === activeId)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">WhatsApp</h1>
          <p className="mt-1 text-sm text-ink-500">Converse com seus leads e clientes.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNew(true)}>
          <Plus size={16} />
          Nova conversa
        </button>
      </div>

      <div className="card grid h-[600px] grid-cols-1 overflow-hidden sm:grid-cols-[280px_1fr]">
        <div className="overflow-y-auto border-r border-ink-100">
          {conversations.length === 0 ? (
            <p className="p-4 text-sm text-ink-400">Nenhuma conversa ainda.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`flex w-full items-center gap-3 border-b border-ink-50 p-3 text-left hover:bg-ink-50 ${
                  activeId === c.id ? 'bg-brand-50' : ''
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <MessageCircle size={16} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-900">
                    {c.contact_name || c.contact_phone}
                  </p>
                  <p className="truncate text-xs text-ink-400">{c.contact_phone}</p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex flex-col">
          {activeConversation ? (
            <>
              <div className="border-b border-ink-100 p-4">
                <p className="text-sm font-semibold text-ink-900">
                  {activeConversation.contact_name || activeConversation.contact_phone}
                </p>
                <p className="text-xs text-ink-400">{activeConversation.contact_phone}</p>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                        m.direction === 'outbound'
                          ? 'bg-brand-600 text-white'
                          : 'bg-ink-100 text-ink-800'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSend} className="flex gap-2 border-t border-ink-100 p-3">
                <input
                  className="input"
                  placeholder="Digite uma mensagem..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button type="submit" disabled={sending || !draft.trim()} className="btn-primary !px-3">
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-ink-400">
              Selecione ou inicie uma conversa
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-ink-900">Nova conversa</h3>
            <form onSubmit={handleNewConversation} className="space-y-3">
              <div>
                <label className="label">Telefone (com DDI)</label>
                <input
                  required
                  className="input"
                  placeholder="Ex: 5511999999999"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Nome do contato</label>
                <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowNew(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={sending} className="btn-primary">
                  {sending ? 'Iniciando...' : 'Iniciar conversa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
