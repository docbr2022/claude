import { useCallback, useEffect, useState } from 'react'
import { KeyRound, ShieldCheck } from 'lucide-react'
import { callFunction } from '@/lib/functions'
import IntegrationKeyCard, { type ProviderDef } from './IntegrationKeyCard'

const PROVIDERS: ProviderDef[] = [
  {
    id: 'google',
    label: 'Google (Gemini / IA Studio)',
    hint: 'Usada em: Leitor de Briefing, Campanhas & Copy, Gerador de Landing Pages e Gerador de Imagens.',
    placeholder: 'AIza...',
  },
  {
    id: 'whatsapp_access_token',
    label: 'WhatsApp — Access Token',
    hint: 'Meta Cloud API. Necessário para enviar mensagens de verdade pelo WhatsApp.',
    placeholder: 'EAAG...',
  },
  {
    id: 'whatsapp_phone_number_id',
    label: 'WhatsApp — Phone Number ID',
    hint: 'ID do número de telefone conectado na Meta Cloud API.',
    placeholder: '123456789012345',
  },
  {
    id: 'whatsapp_verify_token',
    label: 'WhatsApp — Verify Token',
    hint: 'Token que você mesmo inventa para validar o webhook na Meta.',
    placeholder: 'meu-token-secreto',
  },
]

export default function Settings() {
  const [configuredSet, setConfiguredSet] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const { configured } = await callFunction<{ configured: { provider: string }[] }>(
        'settings-list',
        {},
      )
      setConfiguredSet(new Set(configured.map((c) => c.provider)))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Configurações</h1>
        <p className="mt-1 text-sm text-ink-500">
          Cadastre suas chaves de API para ativar os recursos de IA e WhatsApp.
        </p>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-800">
        <ShieldCheck size={18} className="mt-0.5 shrink-0" />
        <p>
          Suas chaves são criptografadas antes de serem salvas e ficam ocultas por padrão — nem
          mesmo você as vê depois de salvar, a menos que clique no botão de revelar. Elas nunca
          trafegam para o restante do app, só são usadas no servidor no momento de chamar cada
          serviço.
        </p>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {PROVIDERS.map((provider) => (
            <IntegrationKeyCard
              key={provider.id}
              provider={provider}
              configured={configuredSet.has(provider.id)}
              onChange={load}
            />
          ))}
        </div>
      )}

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-ink-100 bg-white p-4 text-xs text-ink-500">
        <KeyRound size={16} className="mt-0.5 shrink-0 text-ink-400" />
        <p>
          Se uma chave não for configurada aqui, o sistema tenta usar a variável de ambiente
          equivalente configurada direto na Netlify (ex: <code>GOOGLE_API_KEY</code>) como
          alternativa.
        </p>
      </div>
    </div>
  )
}
