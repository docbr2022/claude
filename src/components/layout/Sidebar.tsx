import { NavLink } from 'react-router-dom'
import {
  Sparkles,
  LayoutDashboard,
  Users,
  Image,
  LayoutTemplate,
  MessageCircle,
  FileText,
  Megaphone,
  X,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/crm', label: 'CRM', icon: Users },
  { to: '/imagens', label: 'Gerador de Imagens', icon: Image },
  { to: '/landing-pages', label: 'Landing Pages', icon: LayoutTemplate },
  { to: '/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { to: '/briefing', label: 'Leitor de Briefing', icon: FileText },
  { to: '/campanhas', label: 'Campanhas & Copy', icon: Megaphone },
]

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink-950/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 transform bg-ink-950 text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2 font-semibold">
            <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            Projeto Zero
          </div>
          <button onClick={onClose} className="text-ink-400 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        </div>
        <nav className="mt-2 space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-ink-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
