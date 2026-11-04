import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { FinanceProvider } from './context/FinanceContext'
import { AppLayout } from './components/AppLayout'
import { LandingPage } from './pages/LandingPage'
import { AuthPage } from './pages/AuthPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { DashboardPage } from './pages/DashboardPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { SettingsPage } from './pages/SettingsPage'
import { PlansPage } from './pages/PlansPage'

function ProtectedArea() {
  const { user, loading } = useAuth()
  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-950 text-emerald-400">Carregando…</div>
  if (!user) return <Navigate to="/entrar" replace />
  return <FinanceProvider><AppLayout /></FinanceProvider>
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/entrar" element={<AuthPage mode="signin" />} />
      <Route path="/cadastro" element={<AuthPage mode="signup" />} />
      <Route path="/recuperar" element={<AuthPage mode="reset" />} />
      <Route element={<ProtectedArea />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/app" element={<DashboardPage />} />
        <Route path="/movimentacoes" element={<TransactionsPage />} />
        <Route path="/perfil" element={<SettingsPage />} />
        <Route path="/planos" element={<PlansPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
