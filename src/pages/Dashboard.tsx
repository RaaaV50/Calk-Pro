import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  Bookmark,
  GitCompareArrows,
  PiggyBank,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  Wallet,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CabecalhoPagina } from '../components/CabecalhoPagina';
import { CartaoResumo } from '../components/CartaoResumo';
import { useFinanceStore } from '../store/useFinanceStore';
import type { CenarioSalvo, ParametrosSimulacao, PontoEvolucao } from '../types/financas';
import { calcularSimulacaoCompleta } from '../utils/calculosFinanceiros';
import {
  formatarMoeda,
  formatarMoedaCompacta,
  formatarMoedaDestaque,
  formatarPercentual,
} from '../utils/formatadores';

type CurvaGrafico = 'patrimonioLiquido' | 'poderDeCompraReal' | 'patrimonioBruto';

function converterRotuloParaMeses(rotulo: string): number {
  if (rotulo === 'Hoje') return 0;
  if (rotulo.endsWith('m')) {
    return Math.round(Number(rotulo.slice(0, -1)) || 0);
  }
  if (rotulo.endsWith('a')) {
    return Math.round((Number(rotulo.slice(0, -1)) || 0) * 12);
  }
  return 0;
}

function formatarMesesEixo(meses: number, usarMeses: boolean): string {
  if (meses === 0) return 'Hoje';
  if (usarMeses) return `${meses}m`;
  if (meses % 12 === 0) return `${meses / 12}a`;
  return `${(meses / 12).toFixed(1)}a`;
}

function mesclarHistoricosComparacao(
  historicoA: PontoEvolucao[],
  historicoB: PontoEvolucao[],
  curva: CurvaGrafico
) {
  const mapaMeses = new Map<
    number,
    { meses: number; valorA?: number; valorB?: number; investidoA?: number }
  >();

  for (const ponto of historicoA) {
    const m = converterRotuloParaMeses(ponto.rotulo);
    mapaMeses.set(m, {
      meses: m,
      valorA: ponto[curva],
      investidoA: ponto.investido,
    });
  }

  for (const ponto of historicoB) {
    const m = converterRotuloParaMeses(ponto.rotulo);
    const existente = mapaMeses.get(m);
    if (existente) {
      existente.valorB = ponto[curva];
    } else {
      mapaMeses.set(m, {
        meses: m,
        valorB: ponto[curva],
      });
    }
  }

  const ordenados = Array.from(mapaMeses.values()).sort((a, b) => a.meses - b.meses);
  const maiorMes = ordenados[ordenados.length - 1]?.meses ?? 0;
  const usarMeses = maiorMes <= 24;

  return ordenados.map((item) => ({
    rotulo: formatarMesesEixo(item.meses, usarMeses),
    valorA: item.valorA,
    valorB: item.valorB,
    investidoA: item.investidoA,
  }));
}

export default function Dashboard() {
  const navegar = useNavigate();
  const metaAtiva = useFinanceStore((estado) => estado.metaAtiva);
  const cenariosSalvos = useFinanceStore((estado) => estado.cenariosSalvos);
  const taxasMercado = useFinanceStore((estado) => estado.taxasMercado);
  const tema = useFinanceStore((estado) => estado.tema);
  const definirMetaAtiva = useFinanceStore((estado) => estado.definirMetaAtiva);
  const salvarCenario = useFinanceStore((estado) => estado.salvarCenario);
  const removerCenario = useFinanceStore((estado) => estado.removerCenario);

  const [curva, setCurva] = useState<CurvaGrafico>('patrimonioLiquido');
  const [idCenarioComparado, setIdCenarioComparado] = useState<string | null>(null);

  const cenarioB = useMemo(
    () => cenariosSalvos.find((item) => item.id === idCenarioComparado) ?? null,
    [cenariosSalvos, idCenarioComparado]
  );

  const { resultado, nome } = metaAtiva;
  const percentualJuros =
    resultado.saldoLiquido > 0
      ? (resultado.jurosLiquidos / resultado.saldoLiquido) * 100
      : 0;

  const mapaCurvas: Record<CurvaGrafico, { nome: string; cor: string }> = {
    patrimonioLiquido: { nome: 'Saldo Líquido', cor: '#10b981' },
    poderDeCompraReal: { nome: 'Poder Real', cor: '#f59e0b' },
    patrimonioBruto: { nome: 'Saldo Bruto', cor: '#0ea5e9' },
  };

  const dadosGraficoComparativo = useMemo(() => {
    if (!cenarioB) return null;
    return mesclarHistoricosComparacao(
      resultado.historico,
      cenarioB.resultado.historico,
      curva
    );
  }, [resultado.historico, cenarioB, curva]);

  const abrirNoSimulador = (cenario: CenarioSalvo) => {
    const p = cenario.parametros;
    const query = new URLSearchParams({
      inicial: String(p.capitalInicial),
      aporte: String(p.aporteMensal),
      modelo: p.modeloRentabilidade,
      taxa: String(p.taxaInformada),
      utaxa: p.unidadeTaxa,
      periodo: String(p.periodo),
      uperiodo: p.unidadePeriodo,
      inflacao: String(p.inflacaoAnual),
      ir: p.tributacao,
    });
    navegar(`/simulador?${query.toString()}`);
  };

  const gerarCenariosExemplo = () => {
    const baseConservadora: ParametrosSimulacao = {
      capitalInicial: 10000,
      aporteMensal: 1000,
      aporteExtraAnual: 0,
      reajustarAporteInflacao: true,
      crescimentoRealAporteAnual: 0,
      modeloRentabilidade: 'cdi',
      taxaInformada: 100,
      unidadeTaxa: 'anual',
      periodo: 10,
      unidadePeriodo: 'anos',
      inflacaoAnual: taxasMercado.ipcaAnual,
      taxaCustodiaAnual: 0,
      tributacao: 'regressivo',
      metaPatrimonio: 0,
    };

    const baseIpcaIsenta: ParametrosSimulacao = {
      ...baseConservadora,
      modeloRentabilidade: 'ipcaMais',
      taxaInformada: 6.5,
      tributacao: 'isento',
    };

    const resConservador = calcularSimulacaoCompleta(
      baseConservadora,
      taxasMercado.cdiAnual
    );
    const resIpca = calcularSimulacaoCompleta(baseIpcaIsenta, taxasMercado.cdiAnual);

    definirMetaAtiva('Estratégia IPCA + 6,5% (Isenta)', baseIpcaIsenta, resIpca);
    salvarCenario('Estratégia IPCA + 6,5% (Isenta)', baseIpcaIsenta, resIpca);
    salvarCenario('Reserva 100% CDI (IR Regressivo)', baseConservadora, resConservador);

    const recemCriado = useFinanceStore
      .getState()
      .cenariosSalvos.find((c) => c.nome === 'Reserva 100% CDI (IR Regressivo)');
    if (recemCriado) {
      setIdCenarioComparado(recemCriado.id);
    }
  };

  const corGrade = tema === 'escuro' ? '#27272a' : '#f1f5f9';

  const diferencaLiquida = cenarioB
    ? resultado.saldoLiquido - cenarioB.resultado.saldoLiquido
    : 0;
  const cenarioAVence = diferencaLiquida >= 0;
  const percentualVantagem =
    cenarioB && Math.min(resultado.saldoLiquido, cenarioB.resultado.saldoLiquido) > 0
      ? (Math.abs(diferencaLiquida) /
          Math.min(resultado.saldoLiquido, cenarioB.resultado.saldoLiquido)) *
        100
      : 0;

  return (
    <div className="space-y-7">
      <CabecalhoPagina
        categoria="Painel Consolidado"
        titulo="Visão Geral & Comparativo de Cenários"
        descricao={`Cenário Principal (A): ${nome}`}
        acoes={
          <Link
            to="/simulador"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus size={15} />
            Criar Nova Simulação
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CartaoResumo
          titulo="Saldo Líquido (Cenário A)"
          valor={formatarMoedaDestaque(resultado.saldoLiquido)}
          subtitulo={`Bruto: ${formatarMoedaDestaque(resultado.valorBruto)}`}
          icone={<Wallet size={17} />}
          tom="positivo"
        />

        <CartaoResumo
          titulo="Total Aportado"
          valor={formatarMoedaDestaque(resultado.totalInvestido)}
          subtitulo={`Horizonte de ${resultado.totalMeses} meses`}
          icone={<PiggyBank size={17} />}
        />

        <CartaoResumo
          titulo="Juros Líquidos"
          valor={`+ ${formatarMoedaDestaque(resultado.jurosLiquidos)}`}
          subtitulo={`${formatarPercentual(percentualJuros)} do saldo final`}
          icone={<Activity size={17} />}
          tom="azul"
        />

        <CartaoResumo
          titulo="Poder de Compra Hoje"
          valor={formatarMoedaDestaque(resultado.poderDeCompraReal)}
          subtitulo={`Taxa real: ${formatarPercentual(resultado.taxaRealAnual)} a.a.`}
          icone={<ShieldCheck size={17} />}
          tom="ambar"
        />
      </div>

      <div className="rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {cenarioB
                ? 'Comparativo Direto de Curvas (Cenário A vs. Cenário B)'
                : 'Curva da Projeção Principal (Cenário A)'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {cenarioB
                ? `Cruzando "${nome}" contra "${cenarioB.nome}"`
                : 'Selecione um segundo cenário abaixo para cruzar duas estratégias no mesmo gráfico'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {cenariosSalvos.length > 0 && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-3 py-1.5">
                <GitCompareArrows size={14} className="text-sky-500 shrink-0" />
                <select
                  aria-label="Selecionar Cenário B para comparar"
                  value={cenarioB?.id ?? ''}
                  onChange={(e) => setIdCenarioComparado(e.target.value || null)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-zinc-200 outline-none cursor-pointer max-w-52 truncate"
                >
                  <option value="" className="bg-white dark:bg-zinc-900">
                    Comparar com... (Nenhum)
                  </option>
                  {cenariosSalvos.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                      className="bg-white dark:bg-zinc-900"
                    >
                      B: {item.nome}
                    </option>
                  ))}
                </select>
                {cenarioB && (
                  <button
                    type="button"
                    onClick={() => setIdCenarioComparado(null)}
                    title="Limpar comparação"
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            )}

            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800 p-1">
              {(
                [
                  ['patrimonioLiquido', 'Líquido'],
                  ['poderDeCompraReal', 'Poder Real'],
                  ['patrimonioBruto', 'Bruto'],
                ] as const
              ).map(([chave, rotulo]) => (
                <button
                  key={chave}
                  type="button"
                  onClick={() => setCurva(chave)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    curva === chave
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {rotulo}
                </button>
              ))}
            </div>
          </div>
        </div>

        {cenarioB && (
          <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-gradient-to-r from-emerald-500/[0.06] via-transparent to-sky-500/[0.07] p-4 sm:p-5 space-y-4 numeros-tabulares">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    cenarioAVence
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                  }`}
                >
                  <Trophy size={17} />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                    Vencedor em Saldo Líquido
                  </span>
                  <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                    {diferencaLiquida === 0
                      ? 'Empate técnico entre os dois cenários'
                      : cenarioAVence
                        ? `Cenário A (${nome})`
                        : `Cenário B (${cenarioB.nome})`}
                  </p>
                </div>
              </div>

              {diferencaLiquida !== 0 && (
                <span
                  className={`inline-flex items-center self-start sm:self-center px-3 py-1.5 rounded-full text-xs font-extrabold shrink-0 ${
                    cenarioAVence
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                  }`}
                >
                  +{formatarMoedaDestaque(Math.abs(diferencaLiquida))} (+
                  {formatarPercentual(percentualVantagem)})
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200/70 dark:border-zinc-800/80 text-xs">
              <div className="rounded-xl bg-white/80 dark:bg-zinc-950/60 p-3 border border-slate-200/60 dark:border-zinc-800/70">
                <span className="text-slate-500 dark:text-zinc-400 font-medium block mb-1.5">
                  Saldo Líquido Final
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate">
                    A: {formatarMoedaDestaque(resultado.saldoLiquido)}
                  </span>
                  <span className="font-bold text-sky-600 dark:text-sky-400 truncate">
                    B: {formatarMoedaDestaque(cenarioB.resultado.saldoLiquido)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-white/80 dark:bg-zinc-950/60 p-3 border border-slate-200/60 dark:border-zinc-800/70">
                <span className="text-slate-500 dark:text-zinc-400 font-medium block mb-1.5">
                  Juros Líquidos Acumulados
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate">
                    A: {formatarMoedaDestaque(resultado.jurosLiquidos)}
                  </span>
                  <span className="font-bold text-sky-600 dark:text-sky-400 truncate">
                    B: {formatarMoedaDestaque(cenarioB.resultado.jurosLiquidos)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-white/80 dark:bg-zinc-950/60 p-3 border border-slate-200/60 dark:border-zinc-800/70">
                <span className="text-slate-500 dark:text-zinc-400 font-medium block mb-1.5">
                  Poder de Compra Real
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate">
                    A: {formatarMoedaDestaque(resultado.poderDeCompraReal)}
                  </span>
                  <span className="font-bold text-sky-600 dark:text-sky-400 truncate">
                    B: {formatarMoedaDestaque(cenarioB.resultado.poderDeCompraReal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="h-80 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            {cenarioB && dadosGraficoComparativo ? (
              <AreaChart
                data={dadosGraficoComparativo}
                margin={{ top: 10, right: 10, left: 4, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradCenarioA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradCenarioB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={corGrade} />
                <XAxis dataKey="rotulo" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v: number) => formatarMoedaCompacta(v)}
                  stroke="#94a3b8"
                  axisLine={false}
                  tickLine={false}
                  width={74}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tema === 'escuro' ? '#18181b' : '#ffffff',
                    borderColor: tema === 'escuro' ? '#27272a' : '#e2e8f0',
                    borderRadius: '14px',
                    fontSize: '12px',
                  }}
                  formatter={(valor) => formatarMoeda(Number(valor))}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="valorA"
                  name={`A · ${nome}`}
                  stroke="#10b981"
                  strokeWidth={2.6}
                  connectNulls
                  fill="url(#gradCenarioA)"
                />
                <Area
                  type="monotone"
                  dataKey="valorB"
                  name={`B · ${cenarioB.nome}`}
                  stroke="#0ea5e9"
                  strokeWidth={2.6}
                  strokeDasharray="6 3"
                  connectNulls
                  fill="url(#gradCenarioB)"
                />
              </AreaChart>
            ) : (
              <AreaChart
                data={resultado.historico}
                margin={{ top: 10, right: 10, left: 4, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradPainel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={mapaCurvas[curva].cor} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={mapaCurvas[curva].cor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={corGrade} />
                <XAxis dataKey="rotulo" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v: number) => formatarMoedaCompacta(v)}
                  stroke="#94a3b8"
                  axisLine={false}
                  tickLine={false}
                  width={74}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tema === 'escuro' ? '#18181b' : '#ffffff',
                    borderColor: tema === 'escuro' ? '#27272a' : '#e2e8f0',
                    borderRadius: '14px',
                    fontSize: '12px',
                  }}
                  formatter={(valor) => formatarMoeda(Number(valor))}
                />
                <Area
                  type="monotone"
                  dataKey={curva}
                  name={mapaCurvas[curva].nome}
                  stroke={mapaCurvas[curva].cor}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#gradPainel)"
                />
                <Area
                  type="monotone"
                  dataKey="investido"
                  name="Total Investido"
                  stroke="#94a3b8"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  fill="transparent"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Cenários Salvos
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Defina um cenário como Principal (A) ou clique em &ldquo;Comparar (B)&rdquo; para cruzar as curvas
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300 numeros-tabulares">
            {cenariosSalvos.length}
          </span>
        </div>

        {cenariosSalvos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 py-10 px-4 text-center space-y-3">
            <Bookmark size={22} className="mx-auto text-slate-400" />
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                Nenhum cenário salvo ainda
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                Salve simulações no módulo Juros Compostos ou carregue dois cenários prontos abaixo para testar o comparativo lado a lado.
              </p>
            </div>
            <button
              type="button"
              onClick={gerarCenariosExemplo}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
            >
              <Sparkles size={14} />
              Carregar 2 Cenários de Exemplo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cenariosSalvos.map((cenario) => {
              const ehPrincipalA = cenario.nome === nome;
              const ehComparadoB = cenarioB?.id === cenario.id;

              return (
                <div
                  key={cenario.id}
                  className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all numeros-tabulares ${
                    ehPrincipalA
                      ? 'border-emerald-500 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06]'
                      : ehComparadoB
                        ? 'border-sky-500 bg-sky-500/[0.04] dark:bg-sky-500/[0.07]'
                        : 'border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          {ehPrincipalA && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold">
                              CENÁRIO A
                            </span>
                          )}
                          {ehComparadoB && (
                            <span className="px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-700 dark:text-sky-300 text-[10px] font-extrabold">
                              CENÁRIO B
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {cenario.nome}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => abrirNoSimulador(cenario)}
                          title="Reabrir no simulador"
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        >
                          <ArrowUpRight size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (ehComparadoB) setIdCenarioComparado(null);
                            removerCenario(cenario.id);
                          }}
                          title="Excluir"
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <p
                      className={`text-2xl font-extrabold mt-2 ${
                        ehComparadoB
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {formatarMoedaDestaque(cenario.resultado.saldoLiquido)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                      Poder real hoje: {formatarMoedaDestaque(cenario.resultado.poderDeCompraReal)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={ehPrincipalA}
                      onClick={() => {
                        if (ehComparadoB) setIdCenarioComparado(null);
                        definirMetaAtiva(cenario.nome, cenario.parametros, cenario.resultado);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-colors ${
                        ehPrincipalA
                          ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 cursor-default'
                          : 'border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer'
                      }`}
                    >
                      {ehPrincipalA ? 'Principal (A)' : 'Definir como A'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setIdCenarioComparado((atual) =>
                          atual === cenario.id ? null : cenario.id
                        )
                      }
                      className={`inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        ehComparadoB
                          ? 'bg-sky-600 text-white hover:bg-sky-500'
                          : 'border border-sky-500/35 bg-sky-500/[0.06] text-sky-700 dark:text-sky-300 hover:bg-sky-500/15'
                      }`}
                    >
                      <GitCompareArrows size={13} />
                      {ehComparadoB ? 'Comparando (B)' : 'Comparar (B)'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
