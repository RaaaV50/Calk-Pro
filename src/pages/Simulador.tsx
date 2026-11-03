import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bookmark,
  Check,
  ChevronDown,
  Pin,
  Share2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CabecalhoPagina } from '../components/CabecalhoPagina';
import { CampoNumerico } from '../components/CampoNumerico';
import { useFinanceStore } from '../store/useFinanceStore';
import type {
  ModeloRentabilidade,
  ParametrosSimulacao,
  TipoTributacao,
  UnidadePeriodo,
  UnidadeTaxa,
} from '../types/financas';
import { calcularSimulacaoCompleta } from '../utils/calculosFinanceiros';
import {
  converterNumero,
  formatarMoeda,
  formatarMoedaCompacta,
  formatarPercentual,
  formatarPrazoMeses,
} from '../utils/formatadores';

export default function Simulador() {
  const [parametrosUrl, setParametrosUrl] = useSearchParams();
  const taxasMercado = useFinanceStore((estado) => estado.taxasMercado);
  const tema = useFinanceStore((estado) => estado.tema);
  const definirMetaAtiva = useFinanceStore((estado) => estado.definirMetaAtiva);
  const salvarCenario = useFinanceStore((estado) => estado.salvarCenario);

  const [capitalInicial, setCapitalInicial] = useState(
    parametrosUrl.get('inicial') ?? '10000'
  );
  const [aporteMensal, setAporteMensal] = useState(
    parametrosUrl.get('aporte') ?? '1000'
  );
  const [modeloRentabilidade, setModeloRentabilidade] = useState<ModeloRentabilidade>(
    (parametrosUrl.get('modelo') as ModeloRentabilidade) || 'cdi'
  );
  const [taxaInformada, setTaxaInformada] = useState(
    parametrosUrl.get('taxa') ?? '100'
  );
  const [unidadeTaxa, setUnidadeTaxa] = useState<UnidadeTaxa>(
    (parametrosUrl.get('utaxa') as UnidadeTaxa) || 'anual'
  );
  const [periodo, setPeriodo] = useState(parametrosUrl.get('periodo') ?? '10');
  const [unidadePeriodo, setUnidadePeriodo] = useState<UnidadePeriodo>(
    (parametrosUrl.get('uperiodo') as UnidadePeriodo) || 'anos'
  );
  const [tributacao, setTributacao] = useState<TipoTributacao>(
    (parametrosUrl.get('ir') as TipoTributacao) || 'regressivo'
  );

  const [mostrarAvancado, setMostrarAvancado] = useState(false);
  const [reajustarAporteInflacao, setReajustarAporteInflacao] = useState(false);
  const [crescimentoRealAporteAnual, setCrescimentoRealAporteAnual] = useState('0');
  const [aporteExtraAnual, setAporteExtraAnual] = useState('0');
  const [taxaCustodiaAnual, setTaxaCustodiaAnual] = useState('0');
  const [inflacaoCustomizada, setInflacaoCustomizada] = useState<string | null>(
    parametrosUrl.get('inflacao')
  );
  const [metaPatrimonio, setMetaPatrimonio] = useState('0');

  const [abaVisualizacao, setAbaVisualizacao] = useState<'grafico' | 'tabela'>('grafico');
  const [nomeCenario, setNomeCenario] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const inflacaoEfetiva =
    inflacaoCustomizada !== null
      ? converterNumero(inflacaoCustomizada, taxasMercado.ipcaAnual)
      : taxasMercado.ipcaAnual;

  const parametros: ParametrosSimulacao = useMemo(
    () => ({
      capitalInicial: converterNumero(capitalInicial, 0),
      aporteMensal: converterNumero(aporteMensal, 0),
      aporteExtraAnual: converterNumero(aporteExtraAnual, 0),
      reajustarAporteInflacao,
      crescimentoRealAporteAnual: converterNumero(crescimentoRealAporteAnual, 0),
      modeloRentabilidade,
      taxaInformada: converterNumero(taxaInformada, 0),
      unidadeTaxa,
      periodo: Math.max(1, converterNumero(periodo, 1)),
      unidadePeriodo,
      inflacaoAnual: inflacaoEfetiva,
      taxaCustodiaAnual: converterNumero(taxaCustodiaAnual, 0),
      tributacao,
      metaPatrimonio: converterNumero(metaPatrimonio, 0),
    }),
    [
      capitalInicial,
      aporteMensal,
      aporteExtraAnual,
      reajustarAporteInflacao,
      crescimentoRealAporteAnual,
      modeloRentabilidade,
      taxaInformada,
      unidadeTaxa,
      periodo,
      unidadePeriodo,
      inflacaoEfetiva,
      taxaCustodiaAnual,
      tributacao,
      metaPatrimonio,
    ]
  );

  const resultado = useMemo(
    () => calcularSimulacaoCompleta(parametros, taxasMercado.cdiAnual),
    [parametros, taxasMercado.cdiAnual]
  );

  const trocarModelo = (novo: ModeloRentabilidade) => {
    setModeloRentabilidade(novo);
    if (novo === 'cdi') setTaxaInformada('100');
    else if (novo === 'ipcaMais') setTaxaInformada('6.5');
    else {
      setTaxaInformada(String(taxasMercado.cdiAnual));
      setUnidadeTaxa('anual');
    }
  };

  const notificar = (texto: string) => {
    setFeedback(texto);
    window.setTimeout(() => {
      setFeedback((atual) => (atual === texto ? null : atual));
    }, 2500);
  };

  const gerarTitulo = () => {
    if (nomeCenario.trim()) return nomeCenario.trim();
    const sufixoPrazo = `${periodo}${unidadePeriodo === 'anos' ? 'a' : 'm'}`;
    if (modeloRentabilidade === 'cdi') return `${taxaInformada}% CDI · ${sufixoPrazo}`;
    if (modeloRentabilidade === 'ipcaMais') return `IPCA + ${taxaInformada}% · ${sufixoPrazo}`;
    return `Taxa ${taxaInformada}% · ${sufixoPrazo}`;
  };

  const handleSalvar = () => {
    salvarCenario(gerarTitulo(), parametros, resultado);
    setNomeCenario('');
    notificar('Cenário salvo no Painel');
  };

  const handleFixar = () => {
    definirMetaAtiva(gerarTitulo(), parametros, resultado);
    notificar('Fixado no Painel');
  };

  const handleCompartilhar = async () => {
    const query = new URLSearchParams({
      inicial: String(parametros.capitalInicial),
      aporte: String(parametros.aporteMensal),
      modelo: parametros.modeloRentabilidade,
      taxa: String(parametros.taxaInformada),
      utaxa: parametros.unidadeTaxa,
      periodo: String(parametros.periodo),
      uperiodo: parametros.unidadePeriodo,
      inflacao: String(parametros.inflacaoAnual),
      ir: parametros.tributacao,
    });
    setParametrosUrl(query, { replace: true });
    const url = `${window.location.origin}${window.location.pathname}?${query.toString()}`;
    try {
      await navigator.clipboard.writeText(url);
      notificar('Link copiado!');
    } catch {
      notificar('URL atualizada');
    }
  };

  const totalBruto = Math.max(1, resultado.valorBruto);
  const pctInvestido = (resultado.totalInvestido / totalBruto) * 100;
  const pctJuros = (Math.max(0, resultado.jurosLiquidos) / totalBruto) * 100;
  const pctImposto = (resultado.valorImposto / totalBruto) * 100;
  const multiplicadorCapital =
    resultado.totalInvestido > 0
      ? resultado.saldoLiquido / resultado.totalInvestido
      : 1;

  const corGrade = tema === 'escuro' ? '#27272a' : '#f1f5f9';

  return (
    <div className="space-y-7">
      <CabecalhoPagina
        categoria="Simulador de Patrimônio"
        titulo="Juros Compostos"
        descricao="Simule rendimentos indexados ao CDI, IPCA+ ou taxa fixa, com cálculo real de IR regressivo por aporte."
        acoes={
          <div className="flex items-center gap-2.5">
            {feedback && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <Check size={14} />
                {feedback}
              </span>
            )}
            <button
              type="button"
              onClick={handleCompartilhar}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 shadow-2xs transition-colors cursor-pointer"
            >
              <Share2 size={14} />
              Compartilhar Link
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-24 rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 p-6 sm:p-7 shadow-xs space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 dark:text-zinc-300 mb-2">
              Modelo de Rentabilidade
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800">
              {(
                [
                  ['cdi', '% do CDI'],
                  ['ipcaMais', 'IPCA +'],
                  ['fixa', 'Taxa Fixa'],
                ] as const
              ).map(([chave, rotulo]) => (
                <button
                  key={chave}
                  type="button"
                  onClick={() => trocarModelo(chave)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    modeloRentabilidade === chave
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {rotulo}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CampoNumerico
              rotulo="Valor Inicial"
              prefixo="R$"
              step="500"
              min="0"
              valor={capitalInicial}
              aoAlterar={setCapitalInicial}
            />
            <CampoNumerico
              rotulo="Aporte Mensal"
              prefixo="R$"
              step="100"
              min="0"
              valor={aporteMensal}
              aoAlterar={setAporteMensal}
            />
          </div>

          <CampoNumerico
            rotulo={
              modeloRentabilidade === 'cdi'
                ? `Rentabilidade (${formatarPercentual(resultado.taxaEfetivaAnualBruta)} a.a. bruta)`
                : modeloRentabilidade === 'ipcaMais'
                  ? `Taxa Prefixada Acima do IPCA (${formatarPercentual(resultado.taxaEfetivaAnualBruta)} a.a.)`
                  : 'Taxa de Juros'
            }
            step={modeloRentabilidade === 'cdi' ? '1' : '0.1'}
            min="0"
            valor={taxaInformada}
            aoAlterar={setTaxaInformada}
            slider={
              modeloRentabilidade === 'cdi'
                ? { min: 70, max: 140, passo: 1 }
                : modeloRentabilidade === 'ipcaMais'
                  ? { min: 3, max: 10, passo: 0.25 }
                  : undefined
            }
            sufixo={
              modeloRentabilidade === 'cdi' ? (
                '% do CDI'
              ) : modeloRentabilidade === 'ipcaMais' ? (
                '% a.a.'
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setUnidadeTaxa((u) => (u === 'anual' ? 'mensal' : 'anual'))
                  }
                  className="px-2 py-1 rounded-lg bg-slate-200/70 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold cursor-pointer"
                >
                  {unidadeTaxa === 'anual' ? '% a.a.' : '% a.m.'}
                </button>
              )
            }
          />

          <CampoNumerico
            rotulo="Prazo de Investimento"
            step="1"
            min="1"
            valor={periodo}
            aoAlterar={setPeriodo}
            slider={
              unidadePeriodo === 'anos'
                ? { min: 1, max: 40, passo: 1 }
                : { min: 1, max: 120, passo: 1 }
            }
            sufixo={
              <button
                type="button"
                onClick={() =>
                  setUnidadePeriodo((u) => (u === 'anos' ? 'meses' : 'anos'))
                }
                className="px-2 py-1 rounded-lg bg-slate-200/70 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold cursor-pointer"
              >
                {unidadePeriodo === 'anos' ? 'Anos' : 'Meses'}
              </button>
            }
          />

          <div>
            <label className="block text-[13px] font-semibold text-slate-700 dark:text-zinc-300 mb-2">
              Imposto de Renda
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800">
              {(
                [
                  ['regressivo', 'Regressivo'],
                  ['isento', 'Isento'],
                  ['fixo15', 'Fixo 15%'],
                ] as const
              ).map(([chave, rotulo]) => (
                <button
                  key={chave}
                  type="button"
                  onClick={() => setTributacao(chave)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    tributacao === chave
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {rotulo}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 px-4 py-3">
            <button
              type="button"
              onClick={() => setMostrarAvancado((v) => !v)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-emerald-600 dark:text-emerald-400" />
                Personalizar Aportes, Custódia e Meta
              </span>
              <ChevronDown
                size={15}
                className={`text-slate-400 transition-transform ${
                  mostrarAvancado ? 'rotate-180' : ''
                }`}
              />
            </button>

            {mostrarAvancado && (
              <div className="pt-4 mt-3 border-t border-slate-200/70 dark:border-zinc-800 space-y-4">
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                    Reajustar aportes anualmente pela inflação
                  </span>
                  <input
                    type="checkbox"
                    checked={reajustarAporteInflacao}
                    onChange={(e) => setReajustarAporteInflacao(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CampoNumerico
                    rotulo="Crescimento Real/Ano"
                    sufixo="%"
                    step="1"
                    min="0"
                    valor={crescimentoRealAporteAnual}
                    aoAlterar={setCrescimentoRealAporteAnual}
                  />
                  <CampoNumerico
                    rotulo="Aporte Anual Extra"
                    prefixo="R$"
                    step="500"
                    min="0"
                    valor={aporteExtraAnual}
                    aoAlterar={setAporteExtraAnual}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CampoNumerico
                    rotulo="IPCA Projetado"
                    sufixo="% a.a."
                    step="0.1"
                    min="0"
                    valor={inflacaoCustomizada ?? String(taxasMercado.ipcaAnual)}
                    aoAlterar={setInflacaoCustomizada}
                  />
                  <CampoNumerico
                    rotulo="Taxa Custódia/Adm"
                    sufixo="% a.a."
                    step="0.05"
                    min="0"
                    valor={taxaCustodiaAnual}
                    aoAlterar={setTaxaCustodiaAnual}
                  />
                </div>

                <CampoNumerico
                  rotulo="Meta de Patrimônio (Opcional)"
                  prefixo="R$"
                  step="10000"
                  min="0"
                  valor={metaPatrimonio}
                  aoAlterar={setMetaPatrimonio}
                />
              </div>
            )}
          </div>

          <div className="pt-2 space-y-2.5">
            <input
              type="text"
              placeholder="Dar um nome a este cenário (opcional)"
              value={nomeCenario}
              onChange={(e) => setNomeCenario(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 py-2.5 px-3.5 text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-emerald-500"
            />
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleSalvar}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                <Bookmark size={14} />
                Salvar Cenário
              </button>
              <button
                type="button"
                onClick={handleFixar}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Pin size={14} />
                Fixar no Painel
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 shadow-xs overflow-hidden">
          <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-sky-500/[0.05] border-b border-slate-200/70 dark:border-zinc-800/80 space-y-6 numeros-tabulares">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Saldo Líquido Estimado
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                  {formatarMoeda(resultado.saldoLiquido)}
                </h2>
              </div>

              <div className="inline-flex items-center self-start px-3 py-1.5 rounded-full bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                {multiplicadorCapital.toFixed(2).replace('.', ',')}x sobre o investido
              </div>
            </div>

            {parametros.metaPatrimonio > 0 && (
              <div className="rounded-xl bg-white/80 dark:bg-zinc-950/70 border border-slate-200/80 dark:border-zinc-800 px-4 py-2.5 text-xs flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400">
                  Tempo até atingir {formatarMoeda(parametros.metaPatrimonio)}:
                </span>
                <strong className="text-slate-900 dark:text-white font-bold">
                  {resultado.mesAtingiuMeta !== null
                    ? formatarPrazoMeses(resultado.mesAtingiuMeta)
                    : 'Acima do período simulado'}
                </strong>
              </div>
            )}

            <div className="space-y-2.5">
              <div className="h-3 w-full rounded-full bg-slate-200/70 dark:bg-zinc-800 overflow-hidden flex p-0.5 gap-0.5">
                <div
                  style={{ width: `${pctInvestido}%` }}
                  className="bg-slate-400 dark:bg-zinc-500 rounded-l-full transition-all duration-300"
                />
                <div
                  style={{ width: `${pctJuros}%` }}
                  className="bg-emerald-500 transition-all duration-300"
                />
                {pctImposto > 0 && (
                  <div
                    style={{ width: `${pctImposto}%` }}
                    className="bg-rose-400 rounded-r-full transition-all duration-300"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Total Investido
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
                    {formatarMoeda(resultado.totalInvestido)}
                  </p>
                </div>

                <div>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Juros Líquidos
                  </span>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    + {formatarMoeda(resultado.jurosLiquidos)}
                  </p>
                </div>

                <div>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    IR ({formatarPercentual(resultado.aliquotaEfetiva)})
                  </span>
                  <p className="text-sm font-bold text-rose-500 mt-0.5">
                    {resultado.valorImposto > 0
                      ? `- ${formatarMoeda(resultado.valorImposto)}`
                      : 'Isento'}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 block">
                    Poder Real Hoje
                  </span>
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    {formatarMoeda(resultado.poderDeCompraReal)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Projeção no Tempo
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Taxa real líquida estimada: {formatarPercentual(resultado.taxaRealAnual)} a.a.
                </p>
              </div>

              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAbaVisualizacao('grafico')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    abaVisualizacao === 'grafico'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  Gráfico
                </button>
                <button
                  type="button"
                  onClick={() => setAbaVisualizacao('tabela')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    abaVisualizacao === 'tabela'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  Tabela ({resultado.historico.length - 1})
                </button>
              </div>
            </div>

            {abaVisualizacao === 'grafico' ? (
              <div className="h-80 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={resultado.historico}
                    margin={{ top: 10, right: 10, left: 4, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="gradSimLiquido" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                      dataKey="patrimonioLiquido"
                      name="Saldo Líquido"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#gradSimLiquido)"
                    />
                    <Area
                      type="monotone"
                      dataKey="poderDeCompraReal"
                      name="Poder de Compra Real"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fill="transparent"
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
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 overflow-y-auto rounded-xl border border-slate-200/70 dark:border-zinc-800">
                <table className="w-full text-left text-xs numeros-tabulares">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Período</th>
                      <th className="py-3 px-4 font-semibold">Investido</th>
                      <th className="py-3 px-4 font-semibold">Juros Líquidos</th>
                      <th className="py-3 px-4 font-semibold">Saldo Líquido</th>
                      <th className="py-3 px-4 font-semibold text-right">Poder Real</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70">
                    {resultado.historico.slice(1).map((linha) => (
                      <tr
                        key={linha.rotulo}
                        className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40"
                      >
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-zinc-200">
                          {linha.rotulo}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">
                          {formatarMoeda(linha.investido)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                          + {formatarMoeda(linha.jurosLiquidos)}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {formatarMoeda(linha.patrimonioLiquido)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-amber-600 dark:text-amber-400">
                          {formatarMoeda(linha.poderDeCompraReal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
