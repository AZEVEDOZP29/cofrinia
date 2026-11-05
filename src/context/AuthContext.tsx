import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

interface AppUser {
  id: string
  email: string
  name: string
  isLocal: boolean
}

interface AuthContextValue {
  user: AppUser | null
  loading: boolean
  configured: boolean
  signUp: (name: string, email: string, password: string) => Promise<string>
  signIn: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  signOut: () => Promise<void>
  continueLocally: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const LOCAL_USER_KEY = 'meucontrole:local-user'

function appUrl(path: string) {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
  return new URL(`${base}${path.replace(/^\/+/, '')}`, window.location.origin).toString()
}

function fromSupabaseUser(user: User): AppUser {
  return {
    id: user.id,
    email: user.email ?? '',
    name: String(user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'Usuário'),
    isLocal: false,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      const local = localStorage.getItem(LOCAL_USER_KEY)
      if (local) {
        try {
          setUser(JSON.parse(local) as AppUser)
        } catch {
          localStorage.removeItem(LOCAL_USER_KEY)
        }
      }
      setLoading(false)
      return
    }

    let active = true
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      setUser(error || !data.session?.user ? null : fromSupabaseUser(data.session.user))
      setLoading(false)
    }).catch(() => {
      if (!active) return
      setUser(null)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setUser(session?.user ? fromSupabaseUser(session.user) : null)
      setLoading(false)
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    configured: isSupabaseConfigured,
    async signUp(name, email, password) {
      if (!supabase) throw new Error('Configure o Supabase para criar uma conta real.')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name }, emailRedirectTo: appUrl('/app') },
      })
      if (error) throw error
      return data.session ? 'Conta criada com sucesso.' : 'Confira seu e-mail para confirmar a conta.'
    },
    async signIn(email, password) {
      if (!supabase) throw new Error('Configure o Supabase para entrar em uma conta real.')
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    async resetPassword(email) {
      if (!supabase) throw new Error('Configure o Supabase para recuperar a senha.')
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: appUrl('/nova-senha'),
      })
      if (error) throw error
    },
    async updatePassword(password) {
      if (!supabase) throw new Error('Configure o Supabase para alterar a senha.')
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
    },
    async signOut() {
      if (user?.isLocal) {
        localStorage.removeItem(LOCAL_USER_KEY)
        setUser(null)
        return
      }
      const { error } = await supabase!.auth.signOut()
      if (error) throw error
    },
    continueLocally() {
      const localUser: AppUser = { id: 'local-device', email: '', name: 'Você', isLocal: true }
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser))
      setUser(localUser)
    },
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
