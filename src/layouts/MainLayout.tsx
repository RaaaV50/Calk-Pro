import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  ArrowLeftRight,
  Building2,
  Calculator,
  Compass,
  Flame,
  Landmark,
  LayoutDashboard,
  type LucideIcon,
  Moon,
  PanelLeftOpen,
  Scale,
  Sun,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import { BotaoInstalarApp } from '../components/BotaoInstalarApp';
import { IconeGithub, IconeLinkedin } from '../components/IconesRedes';
import { PainelTaxasBcb } from '../components/PainelTaxasBcb';
import { DADOS_AUTOR } from '../constants/autor';
import { useTema } from '../hooks/useTema';
import { useFinanceStore } from '../store/useFinanceStore';

interface PropriedadesMainLayout {
  children: ReactNode;
}

interface ItemModulo {
  rota: string;
  rotulo: string;
  icone: LucideIcon;
}

const MODULOS_PRINCIPAIS: ItemModulo[] = [
  { rota: '/simulador', rotulo: 'Juros Compostos', icone: Calculator },
  { rota: '/comparador', rotulo: 'Renda Fixa', icone: Scale },
  { rota: '/fiis', rotulo: 'Fundos Imobiliários (FIIs)', icone: Building2 },
  { rota: '/acoes', rotulo: 'Ações B3 & Bazin', icone: Flame },
  { rota: '/metas', rotulo: 'Planejador de Metas', icone: Target },
  { rota: '/independencia', rotulo: 'Viver de Renda', icone: Compass },
  { rota: '/financiamento', rotulo: 'Financiamento SAC & Price', icone: Landmark },
  { rota: '/conversor', rotulo: 'Conversor de Taxas', icone: ArrowLeftRight },
];

export default function MainLayout({ children }: PropriedadesMainLayout) {
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const { tema, alternarTema } = useTema();
  const localizacao = useLocation();
  const totalCenarios = useFinanceStore((estado) => estado.cenariosSalvos.length);

  useEffect(() => {
    if (!gavetaAberta) return;
    const fecharNoEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGavetaAberta(false);
    };
    window.addEventListener('keydown', fecharNoEsc);
    return () => window.removeEventListener('keydown', fecharNoEsc);
  }, [gavetaAberta]);

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-emerald-500/20">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.11),transparent)]"
      />

      <header className="sticky top-0 z-30 border-b border-slate-200/70 dark:border-zinc-800/70 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGavetaAberta(true)}
              aria-label="Abrir navegacao de modulos"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 hover:bg-slate-100/80 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <PanelLeftOpen size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>Simuladores</span>
              {totalCenarios > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>

            <Link to="/simulador" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <TrendingUp size={17} strokeWidth={2.5} />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                Calk<span className="text-emerald-600 dark:text-emerald-400">Pro</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <PainelTaxasBcb />

            <button
              type="button"
              onClick={alternarTema}
              className="p-2 rounded-full border border-slate-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
              title={tema === 'claro' ? 'Modo escuro' : 'Modo claro'}
              aria-label="Alternar tema"
            >
              {tema === 'claro' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
          </div>
        </div>
      </header>

      <div
        aria-hidden={!gavetaAberta}
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          gavetaAberta ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
        }`}
      >
        <div
          onClick={() => setGavetaAberta(false)}
          className={`fixed inset-0 bg-slate-950/35 dark:bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
            gavetaAberta ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          className={`fixed top-0 left-0 z-10 h-full w-76 max-w-[85vw] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-zinc-800/90 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            gavetaAberta ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-5 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <Link
                to="/simulador"
                onClick={() => setGavetaAberta(false)}
                className="flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <TrendingUp size={17} strokeWidth={2.5} />
                </div>
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Calk<span className="text-emerald-600 dark:text-emerald-400">Pro</span>
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setGavetaAberta(false)}
                aria-label="Fechar menu"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X size={17} />
              </button>
            </div>

            <nav className="space-y-1">
              {MODULOS_PRINCIPAIS.map((item) => {
                const Icone = item.icone;
                return (
                  <NavLink
                    key={item.rota}
                    to={item.rota}
                    onClick={() => setGavetaAberta(false)}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
                          : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100/80 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-500" />
                        )}
                        <Icone
                          size={16}
                          className={
                            isActive
                              ? 'text-emerald-600 dark:text-emerald-400 shrink-0'
                              : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300 shrink-0 transition-colors'
                          }
                        />
                        <span className="truncate">{item.rotulo}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-200/70 dark:border-zinc-800/80">
              <NavLink
                to="/dashboard"
                onClick={() => setGavetaAberta(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
                      : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-zinc-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard
                    size={16}
                    className="text-emerald-600 dark:text-emerald-400 shrink-0"
                  />
                  <span>Painel & Cenários</span>
                </div>
                {totalCenarios > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold numeros-tabulares">
                    {totalCenarios}
                  </span>
                )}
              </NavLink>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200/70 dark:border-zinc-800/80 space-y-2.5">
            <BotaoInstalarApp expandido />
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-400 dark:text-zinc-500">
              <span>{DADOS_AUTOR.nome}</span>
              <div className="flex items-center gap-2">
                <a
                  href={DADOS_AUTOR.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-700 dark:hover:text-zinc-300 transition-colors"
                >
                  GitHub
                </a>
                <span>·</span>
                <a
                  href={DADOS_AUTOR.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div key={localizacao.pathname} className="animar-entrada-modulo">
          {children}
        </div>
      </main>

      <footer className="relative z-10 border-t border-slate-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-zinc-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="font-bold text-slate-800 dark:text-zinc-200">CalkPro</span>
            <span>·</span>
            <span>APIs integradas: Banco Central do Brasil (SGS) & B3 (Brapi)</span>
          </div>

          <div className="flex items-center gap-3">
            <span>
              Desenvolvido por{' '}
              <strong className="font-semibold text-slate-800 dark:text-zinc-200">
                {DADOS_AUTOR.nome}
              </strong>
            </span>
            <div className="flex items-center gap-1.5">
              <a
                href={DADOS_AUTOR.github}
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub de Cassio Cortelini"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
              >
                <IconeGithub tamanho={14} />
                <span>GitHub</span>
              </a>
              <a
                href={DADOS_AUTOR.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn de Cassio Cortelini"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-sky-500/40 hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-medium"
              >
                <IconeLinkedin tamanho={14} />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
