import { WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 text-lg font-bold tracking-tight ${light ? 'text-white' : 'text-slate-950 dark:text-white'}`}>
      <span className="grid size-9 place-items-center rounded-xl bg-emerald-400 text-slate-950"><WalletCards size={19} /></span>
      Meu<span className="-ml-2.5 text-emerald-400">Controle</span>
    </Link>
  )
}
