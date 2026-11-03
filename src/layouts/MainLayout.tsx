import { useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  ArrowLeftRight,
  Calculator,
  Compass,
  Landmark,
  LayoutDashboard,
  Menu,
  Moon,
  Scale,
  Sun,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import { IconeGithub, IconeLinkedin } from '../components/IconesRedes';
import { PainelTaxasBcb } from '../components/PainelTaxasBcb';
import { DADOS_AUTOR } from '../constants/autor';
import { useTema } from '../hooks/useTema';

interface PropriedadesMainLayout {
  children: ReactNode;
}

const ROTAS_NAVEGACAO = [
  { rota: '/simulador', rotulo: 'Simulador', icone: Calculator },
  { rota: '/comparador', rotulo: 'Renda Fixa', icone: Scale },
  { rota: '/metas', rotulo: 'Metas', icone: Target },
  { rota: '/independencia', rotulo: 'Viver de Renda', icone: Compass },
  { rota: '/financiamento', rotulo: 'Financiamento', icone: Landmark },
  { rota: '/conversor', rotulo: 'Taxas', icone: ArrowLeftRight },
  { rota: '/dashboard', rotulo: 'Painel', icone: LayoutDashboard },
] as const;

export default function MainLayout({ children }: PropriedadesMainLayout) {
  const [menuAberto, setMenuAberto] = useState(false);
  const { tema, alternarTema } = useTema();

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-emerald-500/20">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.09),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]"
      />

      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/simulador" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <TrendingUp size={17} strokeWidth={2.5} />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              Calk<span className="text-emerald-600 dark:text-emerald-400">Pro</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full border border-slate-200/80 dark:border-zinc-800/90 bg-slate-100/80 dark:bg-zinc-900/90">
            {ROTAS_NAVEGACAO.map((item) => {
              const Icone = item.icone;
              return (
                <NavLink
                  key={item.rota}
                  to={item.rota}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                    }`
                  }
                >
                  <Icone size={14} />
                  <span>{item.rotulo}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <PainelTaxasBcb />

            <button
              type="button"
              onClick={alternarTema}
              className="p-2 rounded-full border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
              title={tema === 'claro' ? 'Modo escuro' : 'Modo claro'}
              aria-label="Alternar tema"
            >
              {tema === 'claro' ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            <button
              type="button"
              onClick={() => setMenuAberto((v) => !v)}
              className="lg:hidden p-2 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 cursor-pointer"
              aria-label="Menu"
            >
              {menuAberto ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {menuAberto && (
          <div className="lg:hidden border-t border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {ROTAS_NAVEGACAO.map((item) => {
              const Icone = item.icone;
              return (
                <NavLink
                  key={item.rota}
                  to={item.rota}
                  onClick={() => setMenuAberto(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive
                        ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`
                  }
                >
                  <Icone size={15} />
                  <span>{item.rotulo}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {children}
      </main>

      <footer className="relative z-10 border-t border-slate-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-zinc-200">CalkPro</span>
            <span>·</span>
            <span>Dados sincronizados com a API SGS do Banco Central do Brasil</span>
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
