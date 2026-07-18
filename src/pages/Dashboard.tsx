import { Link } from 'react-router-dom'
import {
  Users,
  Image,
  LayoutTemplate,
  MessageCircle,
  FileText,
  Megaphone,
  ArrowRight,
} from 'lucide-react'

const modules = [
  {
    to: '/crm',
    title: 'CRM',
    description: 'Gerencie leads em um pipeline visual, do primeiro contato ao fechamento.',
    icon: Users,
    color: 'bg-brand-600',
    iconColor: 'text-ink-950',
  },
  {
    to: '/imagens',
    title: 'Gerador de Imagens',
    description: 'Crie imagens para campanhas a partir de prompts com IA.',
    icon: Image,
    color: 'bg-fuchsia-600',
  },
  {
    to: '/landing-pages',
    title: 'Landing Pages',
    description: 'Gere landing pages completas a partir de uma descrição do produto.',
    icon: LayoutTemplate,
    color: 'bg-emerald-600',
  },
  {
    to: '/whatsapp',
    title: 'WhatsApp',
    description: 'Converse com seus leads e clientes direto pela plataforma.',
    icon: MessageCircle,
    color: 'bg-green-600',
  },
  {
    to: '/briefing',
    title: 'Leitor de Briefing',
    description: 'Envie um briefing e receba prompts prontos para imagens e vídeos.',
    icon: FileText,
    color: 'bg-amber-600',
  },
  {
    to: '/campanhas',
    title: 'Campanhas & Copy',
    description: 'Gere copies e estruture campanhas para Google e Meta Ads.',
    icon: Megaphone,
    color: 'bg-rose-600',
  },
]

export default function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-900">Bem-vindo de volta 👋</h1>
        <p className="mt-1 text-sm text-ink-500">
          Escolha um módulo para começar a trabalhar.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map(({ to, title, description, icon: Icon, color, iconColor }) => (
          <Link
            key={to}
            to={to}
            className="card group flex flex-col gap-4 p-5 transition-transform hover:-translate-y-0.5"
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconColor ?? 'text-white'} ${color}`}
            >
              <Icon size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-ink-900">{title}</h3>
              <p className="mt-1 text-sm text-ink-500">{description}</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-brand-700">
              Abrir
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
