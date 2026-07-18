import { Menu, LogOut, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-100 bg-white/80 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onMenuClick}
        className="text-ink-500 hover:text-ink-900 lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu size={22} />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-ink-100 py-1 pl-1 pr-3 text-sm text-ink-700">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-ink-950">
            <User size={14} />
          </div>
          <span className="max-w-[160px] truncate">{user?.email}</span>
        </div>
        <button
          onClick={() => signOut()}
          className="btn-ghost !px-2.5"
          title="Sair"
          aria-label="Sair"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
