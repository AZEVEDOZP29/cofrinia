import { Link } from 'react-router-dom'

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" aria-label="MeuControle — página inicial" className={`inline-flex items-center gap-3 text-[15px] font-semibold tracking-[-.02em] ${light ? 'text-white' : 'text-[#08080a] dark:text-white'}`}>
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-full border border-[#2e3038] bg-[#121317] text-xs font-medium text-white">
        MC
        <i aria-hidden="true" className="absolute -right-1 top-1 h-[1px] w-5 rotate-[-42deg] bg-[#cc9166]" />
      </span>
      <span>MeuControle<span className="text-[#cc9166]">.</span></span>
    </Link>
  )
}
