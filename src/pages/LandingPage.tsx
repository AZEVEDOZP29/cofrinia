import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  LockKeyhole,
  PieChart,
  ShieldCheck,
  Target,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Brand } from '../components/Brand'

const benefits = [
  { icon: Zap, number: '01', title: 'Registre em segundos', text: 'Receitas e despesas entram no seu histórico sem planilhas ou etapas desnecessárias.' },
  { icon: PieChart, number: '02', title: 'Entenda seus gastos', text: 'Categorias e gráficos são recalculados a partir dos seus próprios lançamentos.' },
  { icon: Target, number: '03', title: 'Planeje com realidade', text: 'Valores previstos e realizados ficam separados para você decidir com clareza.' },
  { icon: ShieldCheck, number: '04', title: 'Mantenha tudo privado', text: 'Autenticação e regras de acesso isolam os dados financeiros de cada usuário.' },
]

const steps = [
  ['01', 'Configure seu ponto de partida', 'Informe saldo, renda de referência e objetivo sem criar movimentações fictícias.'],
  ['02', 'Registre o que acontece', 'Adicione uma receita ou despesa pelo celular ou computador em poucos segundos.'],
  ['03', 'Leia o seu mês', 'Saldo, resultado e categorias se atualizam imediatamente a cada lançamento.'],
]

const faqs = [
  ['Preciso cadastrar um cartão para testar?', 'Não. O período gratuito de três dias começa sem exigir cartão de crédito.'],
  ['Os gráficos usam dados de demonstração?', 'Dentro da sua conta, não. O dashboard é calculado somente a partir dos seus saldos e movimentações.'],
  ['Consigo usar no celular?', 'Sim. A interface é responsiva e pode ser adicionada à tela inicial como aplicativo web.'],
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#08080a] text-[#e2e3e9] selection:bg-[#cc9166] selection:text-[#08080a]">
      <header className="sticky top-0 z-30 border-b border-[#1c1d22] bg-[#08080a]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[1216px] items-center justify-between px-5 lg:px-0">
          <Brand light />
          <nav aria-label="Navegação principal" className="hidden items-center gap-2 text-sm text-[#9194a1] md:flex">
            <a href="#recursos" className="rounded-sm px-3 py-2 hover:text-white">Recursos</a>
            <a href="#como-funciona" className="rounded-sm px-3 py-2 hover:text-white">Como funciona</a>
            <a href="#preco" className="rounded-sm px-3 py-2 hover:text-white">Preço</a>
            <a href="#duvidas" className="rounded-sm px-3 py-2 hover:text-white">Dúvidas</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/entrar" className="hidden rounded-full border border-[#464853] px-5 py-2.5 text-sm font-medium text-white hover:border-[#777a88] sm:inline-flex">Entrar</Link>
            <Link to="/cadastro" className="secondary !px-5 !py-2.5">Começar grátis <ArrowRight size={15} /></Link>
          </div>
        </div>
      </header>

      <main>
        <section className="overflow-hidden border-b border-[#1c1d22]">
          <div className="mx-auto grid max-w-[1216px] items-center gap-16 px-5 py-20 md:py-28 lg:grid-cols-[.88fr_1.12fr] lg:px-0 lg:py-32">
            <div>
              <p className="text-[13px] font-semibold tracking-[-.02em] text-[#cc9166]">FINANÇAS PESSOAIS, SEM RUÍDO</p>
              <h1 className="font-display mt-6 max-w-[640px] text-[52px] font-normal leading-[.98] tracking-[.01em] text-white sm:text-[68px] lg:text-[82px]">Assuma o controle do seu dinheiro.</h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-[#9194a1] sm:text-lg">Organize seus gastos, acompanhe sua renda e compreenda sua vida financeira em poucos minutos por dia.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/cadastro" className="primary !px-6 !py-3">Começar meus 3 dias grátis <ArrowRight size={17} /></Link>
                <a href="#recursos" className="secondary !px-6 !py-3">Conhecer funcionalidades <ChevronRight size={17} /></a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[13px] text-[#777a88]">
                <span className="flex items-center gap-2"><Check size={14} className="text-[#c7c9d1]" /> Sem cartão</span>
                <span className="flex items-center gap-2"><Clock3 size={14} className="text-[#c7c9d1]" /> 72 horas grátis</span>
                <span className="flex items-center gap-2"><LockKeyhole size={14} className="text-[#c7c9d1]" /> Dados privados</span>
              </div>
            </div>

            <div className="min-w-0">
              <div className="rounded-[10px] border border-[#1c1d22] bg-[#040406] p-4 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#1c1d22] pb-5">
                  <div><p className="text-[12px] font-semibold tracking-[.08em] text-[#cc9166]">PRÉVIA ILUSTRATIVA</p><p className="mt-2 text-sm text-[#777a88]">Cenário demonstrativo · não representa dados de cliente</p></div>
                  <span className="rounded-full border border-[#2e3038] px-3 py-1.5 text-xs text-[#acafb9]">Novembro</span>
                </div>
                <div className="grid gap-3 py-5 sm:grid-cols-3">
                  <div className="rounded-[10px] border border-[#1c1d22] bg-[#121317] p-4 sm:col-span-2">
                    <p className="text-xs text-[#9194a1]">Saldo disponível</p><p className="font-display mt-3 text-[34px] leading-none text-white">R$ 4.280,00</p>
                    <div className="mt-8 h-24 w-full" aria-hidden="true">
                      <svg viewBox="0 0 420 100" className="h-full w-full" preserveAspectRatio="none">
                        <defs><linearGradient id="landing-chart" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ae9357" /><stop offset=".42" stopColor="#fff0cc" /><stop offset=".72" stopColor="#ae9357" /><stop offset="1" stopColor="#bd9d4f" stopOpacity="0" /></linearGradient></defs>
                        <path d="M0 82 C42 78, 62 42, 108 55 S174 76, 215 45 S278 16, 316 34 S370 70, 420 12" fill="none" stroke="url(#landing-chart)" strokeWidth="2" /><path d="M0 99H420" stroke="#1c1d22" strokeWidth="1" />
                      </svg>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                    <div className="rounded-[10px] border border-[#1c1d22] p-4"><p className="text-xs text-[#777a88]">Entradas</p><p className="mt-3 text-lg font-medium text-white">R$ 6.500</p></div>
                    <div className="rounded-[10px] border border-[#1c1d22] p-4"><p className="text-xs text-[#777a88]">Saídas</p><p className="mt-3 text-lg font-medium text-[#e2e3e9]">R$ 2.220</p></div>
                  </div>
                </div>
                <div className="grid gap-3 border-t border-[#1c1d22] pt-5 md:grid-cols-[1fr_.8fr]">
                  <div>
                    <div className="mb-4 flex items-center justify-between"><p className="text-sm font-medium text-white">Últimos registros</p><span className="text-xs text-[#777a88]">Hoje</span></div>
                    {[['Mercado do bairro', 'Alimentação', '− R$ 86,40'], ['Pagamento mensal', 'Receita', '+ R$ 3.250,00'], ['Internet', 'Contas', '− R$ 109,90']].map(([name, category, value]) => <div key={name} className="flex items-center justify-between border-t border-[#1c1d22] py-3 first:border-t-0"><div className="min-w-0"><p className="truncate text-sm text-[#e2e3e9]">{name}</p><p className="mt-0.5 text-xs text-[#777a88]">{category}</p></div><p className="ml-3 text-sm font-medium text-[#c7c9d1]">{value}</p></div>)}
                  </div>
                  <div className="rounded-[10px] bg-[#121317] p-5">
                    <p className="text-xs text-[#9194a1]">Distribuição do mês</p>
                    <div className="mt-5 flex items-center gap-5"><div className="grid size-24 shrink-0 place-items-center rounded-full border-[12px] border-[#2e3038] border-r-[#cc9166] border-t-[#ae9357]"><PieChart size={18} className="text-[#9194a1]" /></div><div className="space-y-3 text-xs text-[#9194a1]"><p><i className="mr-2 inline-block size-1.5 rounded-full bg-[#cc9166]" />Moradia</p><p><i className="mr-2 inline-block size-1.5 rounded-full bg-[#ae9357]" />Alimentação</p><p><i className="mr-2 inline-block size-1.5 rounded-full bg-[#464853]" />Outros</p></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="recursos" className="mx-auto max-w-[1216px] px-5 py-24 md:py-36 lg:px-0 lg:py-40">
          <div className="max-w-3xl"><p className="text-[13px] font-semibold text-[#cc9166]">CLAREZA PARA DECIDIR MELHOR</p><h2 className="font-display mt-5 text-[40px] font-normal leading-[1.08] text-white sm:text-[52px]">Sua realidade financeira em um só lugar.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-[#9194a1]">Veja o que entrou, o que saiu e o que ainda está por vencer com números que vêm dos seus próprios registros.</p></div>
          <div className="mt-14 grid border-l border-t border-[#1c1d22] md:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, number, title, text }) => <article key={title} className="min-h-[300px] border-b border-r border-[#1c1d22] p-6"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-full border border-[#2e3038] text-[#9194a1]"><Icon size={17} strokeWidth={1.5} /></span><span className="text-xs text-[#5e616e]">{number}</span></div><h3 className="mt-20 text-lg font-medium text-white">{title}</h3><p className="mt-3 text-sm leading-6 text-[#9194a1]">{text}</p></article>)}
          </div>
        </section>

        <section id="como-funciona" className="border-y border-[#1c1d22]">
          <div className="mx-auto grid max-w-[1216px] gap-14 px-5 py-24 md:py-32 lg:grid-cols-[.8fr_1.2fr] lg:px-0">
            <div><p className="text-[13px] font-semibold text-[#cc9166]">DO PRIMEIRO SALDO À ROTINA</p><h2 className="font-display mt-5 text-[40px] font-normal leading-[1.08] text-white sm:text-[52px]">Organize hoje.<br />Respire melhor amanhã.</h2><p className="mt-6 max-w-md text-base leading-7 text-[#9194a1]">Um fluxo curto para transformar registros cotidianos em uma leitura confiável do seu mês.</p></div>
            <div className="border-t border-[#1c1d22]">{steps.map(([number, title, text]) => <article key={number} className="grid gap-4 border-b border-[#1c1d22] py-7 sm:grid-cols-[60px_1fr_1.3fr] sm:items-start"><span className="text-xs text-[#cc9166]">{number}</span><h3 className="text-base font-medium text-white">{title}</h3><p className="text-sm leading-6 text-[#9194a1]">{text}</p></article>)}</div>
          </div>
        </section>

        <section id="preco" className="mx-auto max-w-[1216px] px-5 py-24 md:py-36 lg:px-0 lg:py-40">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_.85fr]">
            <div><p className="text-[13px] font-semibold text-[#cc9166]">PREÇO TRANSPARENTE</p><h2 className="font-display mt-5 max-w-2xl text-[42px] font-normal leading-[1.08] text-white sm:text-[58px]">Comece sem compromisso. Continue porque faz sentido.</h2><p className="mt-6 max-w-xl text-base leading-7 text-[#9194a1]">Três dias para organizar seus primeiros registros. Depois, uma assinatura mensal simples e sem planos confusos.</p></div>
            <div className="rounded-[10px] border border-[#2e3038] bg-[#040406] p-7 sm:p-8">
              <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-white">MeuControle Premium</p><p className="mt-2 text-xs text-[#9194a1]">Acesso completo</p></div><span className="rounded-full border border-[#464853] px-3 py-1.5 text-xs text-[#cc9166]">3 dias grátis</span></div>
              <p className="font-display mt-9 text-[48px] leading-none text-white">R$ 19,90 <span className="font-sans text-sm text-[#777a88]">/ mês</span></p>
              <ul className="my-8 space-y-3 border-y border-[#1c1d22] py-7 text-sm text-[#c7c9d1]">{['Registros ilimitados', 'Dashboard calculado com seus dados', 'Contas e categorias personalizadas', 'Histórico financeiro protegido'].map((item) => <li key={item} className="flex items-center gap-3"><Check size={15} className="text-[#9194a1]" />{item}</li>)}</ul>
              <Link to="/cadastro" className="primary w-full">Experimentar gratuitamente <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>

        <section id="duvidas" className="border-t border-[#1c1d22]">
          <div className="mx-auto grid max-w-[1216px] gap-14 px-5 py-24 md:py-32 lg:grid-cols-[.7fr_1.3fr] lg:px-0">
            <div><p className="text-[13px] font-semibold text-[#cc9166]">DÚVIDAS FREQUENTES</p><h2 className="font-display mt-5 text-[40px] font-normal leading-tight text-white">Antes de começar.</h2></div>
            <div className="border-t border-[#1c1d22]">{faqs.map(([question, answer]) => <details key={question} className="group border-b border-[#1c1d22] py-6"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-medium text-white"><span>{question}</span><CircleDollarSign size={17} strokeWidth={1.5} className="text-[#777a88] group-open:text-[#cc9166]" /></summary><p className="mt-4 max-w-2xl text-sm leading-6 text-[#9194a1]">{answer}</p></details>)}</div>
          </div>
        </section>

        <section className="border-t border-[#1c1d22]">
          <div className="mx-auto flex max-w-[1216px] flex-col items-start justify-between gap-8 px-5 py-20 sm:flex-row sm:items-end lg:px-0">
            <div><p className="text-[13px] font-semibold text-[#cc9166]">SEU PRÓXIMO MÊS COMEÇA AGORA</p><h2 className="font-display mt-4 max-w-2xl text-[38px] font-normal leading-tight text-white sm:text-[50px]">Troque a dúvida por uma visão clara.</h2></div><Link to="/cadastro" className="primary shrink-0 !px-6 !py-3">Criar minha conta <ArrowRight size={16} /></Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1c1d22] bg-[#040406]">
        <div className="mx-auto flex max-w-[1216px] flex-col gap-8 px-5 py-10 sm:flex-row sm:items-end sm:justify-between lg:px-0">
          <div><Brand light /><p className="mt-4 max-w-sm text-sm leading-6 text-[#777a88]">Organização financeira pessoal com informações que vêm dos seus próprios registros.</p></div>
          <div className="flex flex-wrap gap-5 text-xs text-[#777a88]"><a href="#recursos" className="hover:text-white">Recursos</a><a href="#preco" className="hover:text-white">Preço</a><Link to="/entrar" className="hover:text-white">Entrar</Link><span>© 2026 MeuControle</span></div>
        </div>
      </footer>
    </div>
  )
}
