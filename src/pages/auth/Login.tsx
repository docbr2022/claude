import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogIn, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabase'
import AuthLayout from './AuthLayout'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: string })?.from || '/'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error)
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <AuthLayout title="Entrar na sua conta" subtitle="Acesse o painel do Projeto Zero.">
      {!isSupabaseConfigured && (
        <div className="mb-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>
            Supabase não configurado. Adicione <code>VITE_SUPABASE_URL</code> e{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> no arquivo <code>.env</code> (veja{' '}
            <code>.env.example</code>).
          </span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="label">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            className="input"
            placeholder="voce@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          <LogIn size={16} />
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        Ainda não tem conta?{' '}
        <Link to="/cadastro" className="font-medium text-brand-700 hover:text-brand-800">
          Criar conta
        </Link>
      </p>
    </AuthLayout>
  )
}
