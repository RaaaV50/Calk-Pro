import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Bookmark,
  Calculator,
  CheckCircle2,
  Target,
  Trash2,
} from 'lucide-react';
import { CabecalhoPagina } from '../components/CabecalhoPagina';
import { useFinanceStore } from '../store/useFinanceStore';
import type { CenarioSalvo } from '../types/financas';
import { formatarMoeda } from '../utils/formatadores';

export default function CenariosSalvos() {
  const navegar = useNavigate();
  const cenariosSalvos = useFinanceStore((estado) => estado.cenariosSalvos);
  const metaAtiva = useFinanceStore((estado) => estado.metaAtiva);
  const definirMetaAtiva = useFinanceStore((estado) => estado.definirMetaAtiva);
  const removerCenario = useFinanceStore((estado) => estado.removerCenario);
  const carregarExemploDemonstracao = useFinanceStore(
    (estado) => estado.carregarExemploDemonstracao
  );

  const reabrirNoSimulador = (cenario: CenarioSalvo) => {
    const p = cenario.parametros;
    const query = new URLSearchParams({
      inicial: String(p.capitalInicial),
      aporte: String(p.aporteMensal),
      taxa: String(p.taxa),
      utaxa: p.unidadeTaxa,
      periodo: String(p.periodo),
      uperiodo: p.unidadePeriodo,
      inflacao: String(p.inflacaoAnual),
      ir: p.tributacao,
    });
    navegar(`/simulador?${query.toString()}`);
  };

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Cenários Salvos"
        descricao="Compare diferentes estratégias que você salvou e escolha qual será a meta ativa do Dashboard."
        icone={<Bookmark size={22} />}
        acoes={
          <Link
            to="/simulador"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
          >
            <Calculator size={16} />
            Criar Novo Cenário
          </Link>
        }
      />

      {cenariosSalvos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center mb-4">
            <Bookmark size={24} />
          </div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Você ainda não salvou nenhum cenário
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mt-1 mb-6">
            No Simulador de Juros Compostos, clique em &ldquo;Salvar Cenário&rdquo; para
            guardar simulações e compará-las lado a lado aqui.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/simulador"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
            >
              Ir para o Simulador
            </Link>
            <button
              type="button"
              onClick={carregarExemploDemonstracao}
              className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-sm font-semibold transition-colors cursor-pointer"
            >
              Carregar Exemplos
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {cenariosSalvos.map((cenario) => {
            const ehMetaAtual = metaAtiva?.nome === cenario.nome;
            const { parametros, resultado } = cenario;

            return (
              <div
                key={cenario.id}
                className={`rounded-2xl border p-6 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between gap-5 transition-all numeros-tabulares ${
                  ehMetaAtual
                    ? 'border-emerald-500 ring-1 ring-emerald-500/30'
                    : 'border-zinc-200/80 dark:border-zinc-800/80'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {cenario.nome}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {parametros.periodo}{' '}
                        {parametros.unidadePeriodo === 'anos' ? 'anos' : 'meses'} •{' '}
                        {parametros.taxa}% {parametros.unidadeTaxa === 'anual' ? 'a.a.' : 'a.m.'} •{' '}
                        {parametros.tributacao === 'isento' ? 'Isento de IR' : 'IR Regressivo'}
                      </p>
                    </div>
                    {ehMetaAtual && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shrink-0">
                        <CheckCircle2 size={12} />
                        Meta Ativa
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-xs text-zinc-400 block">Saldo Líquido Final</span>
                    <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatarMoeda(resultado.saldoLiquido)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                    <div>
                      <span className="text-zinc-400 block">Aporte Inicial + Mensal</span>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {formatarMoeda(parametros.capitalInicial)} +{' '}
                        {formatarMoeda(parametros.aporteMensal)}/m
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Poder de Compra Real</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {formatarMoeda(resultado.poderDeCompraReal)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() =>
                      definirMetaAtiva(cenario.nome, cenario.parametros, cenario.resultado)
                    }
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Target size={14} />
                    Usar no Painel
                  </button>

                  <button
                    type="button"
                    onClick={() => reabrirNoSimulador(cenario)}
                    title="Abrir e editar no Simulador"
                    className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    <ArrowUpRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => removerCenario(cenario.id)}
                    title="Excluir cenário"
                    className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-rose-500/10 hover:border-rose-500/30 text-zinc-500 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

