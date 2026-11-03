import { useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Bookmark,
  Calculator,
  Compass,
  Landmark,
  LayoutDashboard,
  Menu,
  Moon,
  Scale,
  Settings,
  Sun,
  TrendingUp,
  X,
} from 'lucide-react';
import { DADOS_AUTOR } from '../constants/autor';
import { useTema } from '../hooks/useTema';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatarPercentual } from '../utils/formatadores';
import { IconeGithub, IconeLinkedin } from '../components/IconesRedes';

interface PropriedadesMainLayout {
  children: ReactNode;
}

export default function MainLayout({ children }: PropriedadesMainLayout) {
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const { tema, alternarTema } = useTema();
  const totalCenarios = useFinanceStore((estado) => estado.cenariosSalvos.length);
  const taxasReferencia = useFinanceStore((estado) => estado.taxasReferencia);

  const fecharMenuMobile = () => setMenuMobileAberto(false);

  const classeItemNavegacao = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 font-semibold'
        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/70'
    }`;

  const conteudoSidebar = (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800/80">
      <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <Link
          to="/dashboard"
          onClick={fecharMenuMobile}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-emerald-500 flex items-center justify-center text-emerald-400 dark:text-zinc-950 shadow-xs">
            <TrendingUp size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Calk-Pro
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-none mt-0.5">
              Planejamento Financeiro
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={fecharMenuMobile}
          className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-5 px-3.5 space-y-6">
        <div className="space-y-1">
          <p className="px-3.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
            Painel Principal
          </p>
          <NavLink to="/dashboard" onClick={fecharMenuMobile} className={classeItemNavegacao}>
            <span className="flex items-center gap-3">
              <LayoutDashboard size={18} />
              Visão Geral
            </span>
          </NavLink>

          <NavLink to="/cenarios" onClick={fecharMenuMobile} className={classeItemNavegacao}>
            <span className="flex items-center gap-3">
              <Bookmark size={18} />
              Cenários Salvos
            </span>
            {totalCenarios > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-zinc-200/80 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 numeros-tabulares">
                {totalCenarios}
              </span>
            )}
          </NavLink>
        </div>

        <div className="space-y-1">
          <p className="px-3.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
            Simuladores
          </p>
          <NavLink to="/simulador" onClick={fecharMenuMobile} className={classeItemNavegacao}>
            <span className="flex items-center gap-3">
              <Calculator size={18} />
              Juros Compostos
            </span>
          </NavLink>

          <NavLink to="/renda-fixa" onClick={fecharMenuMobile} className={classeItemNavegacao}>
            <span className="flex items-center gap-3">
              <Scale size={18} />
              CDB vs LCI/LCA
            </span>
          </NavLink>

          <NavLink to="/independencia" onClick={fecharMenuMobile} className={classeItemNavegacao}>
            <span className="flex items-center gap-3">
              <Compass size={18} />
              Viver de Renda
            </span>
          </NavLink>

          <NavLink to="/financiamento" onClick={fecharMenuMobile} className={classeItemNavegacao}>
            <span className="flex items-center gap-3">
              <Landmark size={18} />
              Financiamento SAC/Price
            </span>
          </NavLink>
        </div>

        <div className="space-y-1">
          <p className="px-3.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
            Preferências
          </p>
          <NavLink to="/configuracoes" onClick={fecharMenuMobile} className={classeItemNavegacao}>
            <span className="flex items-center gap-3">
              <Settings size={18} />
              Configurações & Sobre
            </span>
          </NavLink>
        </div>
      </nav>

      <div className="p-3.5 border-t border-zinc-200/80 dark:border-zinc-800/80">
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                CC
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                  {DADOS_AUTOR.nome}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  {DADOS_AUTOR.usuarioGithub}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <a
                href={DADOS_AUTOR.github}
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub de Cassio Cortelini"
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
              >
                <IconeGithub tamanho={16} />
              </a>
              <a
                href={DADOS_AUTOR.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn de Cassio Cortelini"
                className="p-1.5 rounded-lg text-zinc-500 hover:text-sky-600 hover:bg-sky-500/10 dark:text-zinc-400 dark:hover:text-sky-400 dark:hover:bg-sky-500/15 transition-colors"
              >
                <IconeLinkedin tamanho={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <aside className="hidden lg:block w-68 shrink-0">{conteudoSidebar}</aside>

      {menuMobileAberto && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={fecharMenuMobile}
          />
          <aside className="relative w-72 max-w-[85vw] h-full z-10">{conteudoSidebar}</aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 shrink-0 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuMobileAberto(true)}
              className="lg:hidden p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>

            <Link
              to="/configuracoes"
              title="Clique para editar as taxas de referência"
              className="hidden sm:flex items-center gap-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-800/60 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-full transition-colors numeros-tabulares"
            >
              <span>
                CDI Ref:{' '}
                <strong className="text-zinc-800 dark:text-zinc-200">
                  {formatarPercentual(taxasReferencia.cdiAnual)} a.a.
                </strong>
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span>
                IPCA Ref:{' '}
                <strong className="text-zinc-800 dark:text-zinc-200">
                  {formatarPercentual(taxasReferencia.ipcaAnual)} a.a.
                </strong>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={alternarTema}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
              aria-label="Alternar tema claro ou escuro"
            >
              {tema === 'claro' ? (
                <>
                  <Moon size={15} className="text-zinc-600" />
                  <span>Modo Escuro</span>
                </>
              ) : (
                <>
                  <Sun size={15} className="text-amber-400" />
                  <span>Modo Claro</span>
                </>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

