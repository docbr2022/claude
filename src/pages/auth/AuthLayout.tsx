import type { ReactNode } from 'react'
import { Sparkles, Users, Image, LayoutTemplate, MessageCircle, FileText, Megaphone } from 'lucide-react'

const features = [
  { icon: Users, label: 'CRM com pipeline visual' },
  { icon: Image, label: 'Gerador de imagens com IA' },
  { icon: LayoutTemplate, label: 'Gerador de landing pages' },
  { icon: MessageCircle, label: 'Conversas de WhatsApp' },
  { icon: FileText, label: 'Leitor de briefing' },
  { icon: Megaphone, label: 'Copies para Google & Meta Ads' },
]

export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink-50">
      <div className="hidden lg:flex flex-col justify-between bg-ink-950 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700/40 via-ink-950 to-ink-950" />
        <div className="relative flex items-center gap-2 text-lg font-semibold">
          <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          Projeto Zero
        </div>
        <div className="relative space-y-8 max-w-md">
          <h1 className="text-3xl font-bold leading-tight">
            Sua operação de marketing, do lead ao anúncio, em um só lugar.
          </h1>
          <ul className="space-y-3">
            {features.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-ink-200">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                  <Icon size={16} />
                </div>
                <span className="text-sm">{label}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-ink-400">
          © {new Date().getFullYear()} Projeto Zero. Todos os direitos reservados.
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 text-lg font-semibold mb-8 text-ink-900">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            Projeto Zero
          </div>
          <h2 className="text-2xl font-bold text-ink-900">{title}</h2>
          <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
