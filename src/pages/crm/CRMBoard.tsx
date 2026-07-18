import { useEffect, useMemo, useState } from 'react'
import { Plus, AlertCircle, Building2 } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Lead, PipelineStage } from '@/types/database'
import NewLeadModal, { type NewLeadInput } from './NewLeadModal'
import LeadDrawer from './LeadDrawer'

export default function CRMBoard() {
  const { user } = useAuth()
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [newLeadStageId, setNewLeadStageId] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let active = true

    async function load() {
      setLoading(true)
      const [{ data: stagesData }, { data: leadsData }] = await Promise.all([
        supabase
          .from('pipeline_stages')
          .select('*')
          .eq('owner_id', user!.id)
          .order('position', { ascending: true }),
        supabase
          .from('leads')
          .select('*')
          .eq('owner_id', user!.id)
          .order('created_at', { ascending: false }),
      ])
      if (active) {
        setStages(stagesData ?? [])
        setLeads(leadsData ?? [])
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [user])

  const leadsByStage = useMemo(() => {
    const map = new Map<string, Lead[]>()
    for (const stage of stages) map.set(stage.id, [])
    for (const lead of leads) {
      if (lead.stage_id && map.has(lead.stage_id)) {
        map.get(lead.stage_id)!.push(lead)
      }
    }
    return map
  }, [stages, leads])

  const totalsByStage = useMemo(() => {
    const map = new Map<string, number>()
    for (const [stageId, stageLeads] of leadsByStage) {
      map.set(stageId, stageLeads.reduce((sum, l) => sum + Number(l.value ?? 0), 0))
    }
    return map
  }, [leadsByStage])

  async function handleCreateLead(input: NewLeadInput) {
    if (!user) return
    const { data, error } = await supabase
      .from('leads')
      .insert({
        owner_id: user.id,
        stage_id: input.stage_id,
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        company: input.company || null,
        source: input.source || null,
        value: input.value ? Number(input.value) : 0,
      })
      .select()
      .single()

    if (!error && data) {
      setLeads((prev) => [data, ...prev])
      setNewLeadStageId(null)
    }
  }

  async function moveLead(leadId: string, stageId: string) {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage_id: stageId } : l)))
    await supabase.from('leads').update({ stage_id: stageId }).eq('id', leadId)
  }

  function handleLeadDeleted(leadId: string) {
    setLeads((prev) => prev.filter((l) => l.id !== leadId))
    setSelectedLead(null)
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-medium">Supabase não configurado</p>
          <p className="mt-1">
            Configure <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> no
            arquivo <code>.env</code> e rode o script <code>supabase/schema.sql</code> no seu
            projeto para o CRM funcionar.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">CRM</h1>
          <p className="mt-1 text-sm text-ink-500">
            Arraste os cartões entre as colunas para atualizar o estágio do lead.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setNewLeadStageId(stages[0]?.id ?? null)}
          disabled={stages.length === 0}
        >
          <Plus size={16} />
          Novo lead
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="flex w-72 shrink-0 flex-col rounded-xl bg-ink-100/60 p-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const leadId = e.dataTransfer.getData('text/plain')
                if (leadId) moveLead(leadId, stage.id)
                setDraggingLeadId(null)
              }}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <h3 className="text-sm font-semibold text-ink-800">{stage.name}</h3>
                  <span className="text-xs text-ink-400">
                    {leadsByStage.get(stage.id)?.length ?? 0}
                  </span>
                </div>
                <button
                  onClick={() => setNewLeadStageId(stage.id)}
                  className="text-ink-400 hover:text-ink-700"
                  aria-label={`Novo lead em ${stage.name}`}
                >
                  <Plus size={16} />
                </button>
              </div>
              <p className="mb-2 px-1 text-xs text-ink-400">
                {(totalsByStage.get(stage.id) ?? 0).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>

              <div className="flex flex-col gap-2">
                {(leadsByStage.get(stage.id) ?? []).map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', lead.id)
                      setDraggingLeadId(lead.id)
                    }}
                    onDragEnd={() => setDraggingLeadId(null)}
                    onClick={() => setSelectedLead(lead)}
                    className={`cursor-grab rounded-lg border border-ink-100 bg-white p-3 shadow-soft transition-opacity active:cursor-grabbing ${
                      draggingLeadId === lead.id ? 'opacity-40' : ''
                    }`}
                  >
                    <p className="text-sm font-medium text-ink-900">{lead.name}</p>
                    {lead.company && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
                        <Building2 size={12} /> {lead.company}
                      </p>
                    )}
                    {!!lead.value && (
                      <p className="mt-2 text-xs font-semibold text-brand-700">
                        {Number(lead.value).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </p>
                    )}
                  </div>
                ))}
                {(leadsByStage.get(stage.id) ?? []).length === 0 && (
                  <p className="rounded-lg border border-dashed border-ink-200 p-4 text-center text-xs text-ink-400">
                    Nenhum lead
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {newLeadStageId && (
        <NewLeadModal
          stages={stages}
          defaultStageId={newLeadStageId}
          onClose={() => setNewLeadStageId(null)}
          onCreate={handleCreateLead}
        />
      )}

      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onDeleted={handleLeadDeleted}
        />
      )}
    </div>
  )
}
