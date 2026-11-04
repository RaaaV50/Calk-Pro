import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BotaoCompartilhar } from '../components/BotaoCompartilhar';
import { CabecalhoPagina } from '../components/CabecalhoPagina';
import { CampoNumerico } from '../components/CampoNumerico';
import { consultarDetalheAtivoB3, listarAtivosB3 } from '../services/apiBolsaB3';
import { useFinanceStore } from '../store/useFinanceStore';
import type { AtivoResumoB3, DetalheAtivoB3 } from '../types/rendaVariavel';
import {
  calcularAnaliseAcao,
  calcularBolaDeNeveFiis,
} from '../utils/calculosRendaVariavel';
import {
  converterNumero,
  formatarMoeda,
  formatarMoedaCompacta,
  formatarPercentual,
} from '../utils/formatadores';

type CriterioMapa = 'market_cap_basic' | 'change' | 'volume';

const DY_REFERENCIA_ACOES: Record<string, number> = {
  PETR4: 12.5,
  VALE3: 8.5,
  ITUB4: 7.2,
  BBAS3: 9.8,
  WEGE3: 1.8,
  TAEE11: 9.5,
  BBDC4: 7.8,
  ELET3: 4.2,
  ABEV3: 6.1,
  BPAC11: 3.2,
};

function obterClasseCalor(variacao: number, selecionado: boolean): string {
  const anel = selecionado
    ? 'ring-2 ring-slate-900 dark:ring-white scale-[1.01]'
    : 'hover:scale-[1.01]';

  if (variacao >= 1.5) {
    return `${anel} bg-emerald-500/20 dark:bg-emerald-500/25 border-emerald-500/40 text-emerald-950 dark:text-emerald-100`;
  }
  if (variacao > 0) {
    return `${anel} bg-emerald-500/10 dark:bg-emerald-500/12 border-emerald-500/25 text-slate-900 dark:text-zinc-100`;
  }
  if (variacao <= -1.5) {
    return `${anel} bg-rose-500/20 dark:bg-rose-500/25 border-rose-500/40 text-rose-950 dark:text-rose-100`;
  }
  if (variacao < 0) {
    return `${anel} bg-rose-500/10 dark:bg-rose-500/12 border-rose-500/25 text-slate-900 dark:text-zinc-100`;
  }
  return `${anel} bg-slate-100 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100`;
}

export default function RadarAcoes() {
  const [parametrosUrl] = useSearchParams();
  const tema = useFinanceStore((estado) => estado.tema);
  const taxasMercado = useFinanceStore((estado) => estado.taxasMercado);

  const [tickerInicialUrl] = useState(
    () => parametrosUrl.get('ticker')?.trim().toUpperCase() || null
  );
  const [dyVeioDaUrl] = useState(() => parametrosUrl.has('dy'));

  const [criterioMapa, setCriterioMapa] = useState<CriterioMapa>('market_cap_basic');
  const [ativosMapa, setAtivosMapa] = useState<AtivoResumoB3[]>([]);
  const [dadosAoVivo, setDadosAoVivo] = useState(true);
  const [carregandoMapa, setCarregandoMapa] = useState(true);

  const [buscaTicker, setBuscaTicker] = useState('');
  const [buscandoAtivo, setBuscandoAtivo] = useState(false);
  const [ativoSelecionado, setAtivoSelecionado] = useState<DetalheAtivoB3 | null>(null);

  const [valorAporteHoje, setValorAporteHoje] = useState(
    parametrosUrl.get('aporte') ?? '5000'
  );
  const [aporteMensalRecorrente, setAporteMensalRecorrente] = useState(
    parametrosUrl.get('mensal') ?? '500'
  );
  const [prazoAnos, setPrazoAnos] = useState(parametrosUrl.get('anos') ?? '10');
  const [dyEstimadoAnual, setDyEstimadoAnual] = useState(
    parametrosUrl.get('dy') ?? '10'
  );
  const [yieldMinimoBazin, setYieldMinimoBazin] = useState(
    parametrosUrl.get('bazin') ?? '6'
  );
  const [abaGrafico, setAbaGrafico] = useState<'projecao' | 'cotacao30d'>('projecao');

  const selecionarAtivo = async (resumo: AtivoResumoB3) => {
    const dySugerido = DY_REFERENCIA_ACOES[resumo.ticker] ?? 6.5;
    setDyEstimadoAnual(String(dySugerido));

    const detalhe = await consultarDetalheAtivoB3(resumo.ticker, resumo);
    if (detalhe) {
      setAtivoSelecionado(detalhe);
      if (detalhe.historicoRecente.length === 0) {
        setAbaGrafico('projecao');
      }
    }
  };

  useEffect(() => {
    let montado = true;
    void listarAtivosB3({
      tipo: 'stock',
      limite: 12,
      ordenarPor: 'market_cap_basic',
    }).then(async ({ ativos, aoVivo }) => {
      if (!montado) return;
      setAtivosMapa(ativos.slice(0, 12));
      setDadosAoVivo(aoVivo);
      setCarregandoMapa(false);

      const tickerAlvo = tickerInicialUrl ?? ativos[0]?.ticker;
      const resumoAlvo = ativos.find((a) => a.ticker === tickerAlvo);

      if (tickerAlvo) {
        if (!dyVeioDaUrl) {
          const dySugerido = DY_REFERENCIA_ACOES[tickerAlvo] ?? 6.5;
          setDyEstimadoAnual(String(dySugerido));
        }
        const detalhe = await consultarDetalheAtivoB3(tickerAlvo, resumoAlvo);
        if (montado && detalhe) {
          setAtivoSelecionado(detalhe);
        }
      }
    });

    return () => {
      montado = false;
    };
  }, [tickerInicialUrl, dyVeioDaUrl]);

  const trocarCriterioMapa = async (novoCriterio: CriterioMapa) => {
    setCriterioMapa(novoCriterio);
    setCarregandoMapa(true);
    const { ativos, aoVivo } = await listarAtivosB3({
      tipo: 'stock',
      limite: 12,
      ordenarPor: novoCriterio,
    });
    setAtivosMapa(ativos.slice(0, 12));
    setDadosAoVivo(aoVivo);
    setCarregandoMapa(false);
  };

  const atualizarMapaManual = () => {
    void trocarCriterioMapa(criterioMapa);
  };

  const pesquisarQualquerAcao = async () => {
    const ticker = buscaTicker.trim().toUpperCase();
    if (!ticker) return;
    setBuscandoAtivo(true);
    const detalhe = await consultarDetalheAtivoB3(ticker);
    setBuscandoAtivo(false);
    if (detalhe) {
      const dySugerido = DY_REFERENCIA_ACOES[detalhe.ticker] ?? 6.5;
      setDyEstimadoAnual(String(dySugerido));
      setAtivoSelecionado(detalhe);
      setBuscaTicker('');
      if (detalhe.historicoRecente.length === 0) {
        setAbaGrafico('projecao');
      }
    }
  };

  const precoAcao = ativoSelecionado?.preco ?? 35;

  const dyAnualNumero = converterNumero(dyEstimadoAnual, 6);

  const analise = useMemo(
    () =>
      calcularAnaliseAcao({
        precoAtual: precoAcao,
        valorAporte: converterNumero(valorAporteHoje, 0),
        dividendYieldEstimadoAnual: dyAnualNumero,
        yieldMinimoBazin: converterNumero(yieldMinimoBazin, 6),
      }),
    [precoAcao, valorAporteHoje, dyAnualNumero, yieldMinimoBazin]
  );

  const projecaoDividendos = useMemo(
    () =>
      calcularBolaDeNeveFiis({
        precoCota: precoAcao,
        dividendYieldMensalPercentual: Math.min(35, Math.max(0, dyAnualNumero)) / 12,
        cotasIniciais: analise.quantidadeAcoes,
        aporteMensal: converterNumero(aporteMensalRecorrente, 0),
        prazoAnos: converterNumero(prazoAnos, 10),
        reinvestirDividendos: true,
        corrigirPelaInflacao: false,
        ipcaAnual: taxasMercado.ipcaAnual,
      }),
    [
      precoAcao,
      dyAnualNumero,
      analise.quantidadeAcoes,
      aporteMensalRecorrente,
      prazoAnos,
      taxasMercado.ipcaAnual,
    ]
  );

  const corGrade = tema === 'escuro' ? '#27272a' : '#f1f5f9';

  return (
    <div className="space-y-7">
      <CabecalhoPagina
        categoria="Renda Variável & Valuation (B3)"
        titulo="Mapa de Calor & Análise de Ações"
        descricao="Acompanhe a variação das ações da B3 via API, consulte indicadores e calcule Preço Teto (Método Bazin) e dividendos."
        acoes={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-600 dark:text-zinc-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  dadosAoVivo ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              {dadosAoVivo ? 'Cotação B3 via Brapi' : 'Base de Referência'}
            </span>
            <button
              type="button"
              onClick={atualizarMapaManual}
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 cursor-pointer"
              title="Atualizar cotações"
            >
              <RefreshCw size={15} className={carregandoMapa ? 'animate-spin' : ''} />
            </button>
            <BotaoCompartilhar
              parametros={{
                ticker: ativoSelecionado?.ticker,
                aporte: valorAporteHoje,
                mensal: aporteMensalRecorrente,
                anos: prazoAnos,
                dy: dyEstimadoAnual,
                bazin: yieldMinimoBazin,
              }}
            />
          </div>
        }
      />

      <div className="rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800 self-start">
            {(
              [
                ['market_cap_basic', 'Maiores Empresas'],
                ['change', 'Maiores Altas'],
                ['volume', 'Mais Negociadas'],
              ] as const
            ).map(([chave, rotulo]) => (
              <button
                key={chave}
                type="button"
                onClick={() => trocarCriterioMapa(chave)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  criterioMapa === chave
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-zinc-400'
                }`}
              >
                {rotulo}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-80">
            <div className="flex-1 flex items-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3">
              <Search size={14} className="text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Consultar qualquer ticker (ex: TAEE11)"
                value={buscaTicker}
                onChange={(e) => setBuscaTicker(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void pesquisarQualquerAcao();
                }}
                className="w-full py-2 text-xs font-semibold bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 outline-none uppercase"
              />
            </div>
            <button
              type="button"
              onClick={() => void pesquisarQualquerAcao()}
              disabled={buscandoAtivo}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {buscandoAtivo ? '...' : 'Ir'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 numeros-tabulares">
          {ativosMapa.map((item) => {
            const selecionado = ativoSelecionado?.ticker === item.ticker;
            const alta = item.variacaoDia >= 0;

            return (
              <button
                key={item.ticker}
                type="button"
                onClick={() => void selecionarAtivo(item)}
                className={`rounded-2xl border p-3.5 text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${obterClasseCalor(
                  item.variacaoDia,
                  selecionado
                )}`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs font-extrabold tracking-tight">
                    {item.ticker}
                  </span>
                  <span
                    className={`inline-flex items-center text-[11px] font-bold ${
                      alta
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-rose-600 dark:text-rose-300'
                    }`}
                  >
                    {alta ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(item.variacaoDia).toFixed(2).replace('.', ',')}%
                  </span>
                </div>

                <div>
                  <p className="text-base font-extrabold">{formatarMoeda(item.preco)}</p>
                  <p className="text-[10px] opacity-70 truncate mt-0.5">{item.nome}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {ativoSelecionado && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-24 rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 p-4 space-y-3 numeros-tabulares">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {ativoSelecionado.logoUrl ? (
                    <img
                      src={ativoSelecionado.logoUrl}
                      alt={ativoSelecionado.ticker}
                      className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-200/80 object-contain shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      {ativoSelecionado.ticker.slice(0, 4)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                      {ativoSelecionado.ticker} · {ativoSelecionado.nome}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                      {ativoSelecionado.setor}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {formatarMoeda(ativoSelecionado.preco)}
                  </p>
                  <span
                    className={`text-xs font-bold ${
                      ativoSelecionado.variacaoDia >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-500'
                    }`}
                  >
                    {ativoSelecionado.variacaoDia >= 0 ? '+' : ''}
                    {formatarPercentual(ativoSelecionado.variacaoDia)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2.5 border-t border-slate-200/70 dark:border-zinc-800 text-xs">
                <div>
                  <span className="text-slate-400 block">Valor de Mercado</span>
                  <strong className="text-slate-800 dark:text-zinc-200">
                    {ativoSelecionado.valorMercado
                      ? formatarMoedaCompacta(ativoSelecionado.valorMercado)
                      : '—'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Volume Diário</span>
                  <strong className="text-slate-800 dark:text-zinc-200">
                    {ativoSelecionado.volume > 0
                      ? ativoSelecionado.volume.toLocaleString('pt-BR')
                      : '—'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Índice P/L</span>
                  <strong className="text-slate-800 dark:text-zinc-200">
                    {ativoSelecionado.precoLucro
                      ? `${ativoSelecionado.precoLucro.toFixed(1).replace('.', ',')}x`
                      : 'Sob consulta'}
                  </strong>
                </div>
              </div>
            </div>

            <CampoNumerico
              rotulo="Quanto Pretende Investir Hoje"
              prefixo="R$"
              step="500"
              min="0"
              slider={{ min: 500, max: 50000, passo: 500 }}
              valor={valorAporteHoje}
              aoAlterar={setValorAporteHoje}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CampoNumerico
                rotulo="Dividend Yield Estimado"
                sufixo="% a.a."
                step="0.2"
                min="0"
                valor={dyEstimadoAnual}
                aoAlterar={setDyEstimadoAnual}
              />
              <CampoNumerico
                rotulo="Meta Mínima Bazin"
                sufixo="% a.a."
                step="0.5"
                min="1"
                valor={yieldMinimoBazin}
                aoAlterar={setYieldMinimoBazin}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/70 dark:border-zinc-800">
              <CampoNumerico
                rotulo="Aporte Mensal Futuro"
                prefixo="R$"
                step="100"
                min="0"
                valor={aporteMensalRecorrente}
                aoAlterar={setAporteMensalRecorrente}
              />
              <CampoNumerico
                rotulo="Horizonte"
                sufixo="Anos"
                step="1"
                min="1"
                max="30"
                valor={prazoAnos}
                aoAlterar={setPrazoAnos}
              />
            </div>
          </div>

          <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 shadow-xs overflow-hidden numeros-tabulares">
            <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-sky-500/[0.05] border-b border-slate-200/70 dark:border-zinc-800/80 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Preço Teto Justo · Método Décio Bazin ({yieldMinimoBazin}% a.a.)
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                    {formatarMoeda(analise.precoTetoBazin)}
                  </h2>
                </div>

                <div
                  className={`inline-flex items-center gap-1.5 self-start px-3.5 py-1.5 rounded-full text-xs font-bold ${
                    analise.abaixoDoTeto
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {analise.abaixoDoTeto ? (
                    <>
                      <ShieldCheck size={15} />
                      Margem: +{formatarPercentual(analise.margemSeguranca)}
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={15} />
                      Acima do Teto ({formatarPercentual(analise.margemSeguranca)})
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-200/60 dark:border-zinc-800/80">
                <div>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 block">
                    Lote Comprável Hoje
                  </span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {analise.quantidadeAcoes.toLocaleString('pt-BR')} ações
                  </p>
                  <span className="text-[11px] text-slate-400">
                    Troco: {formatarMoeda(analise.troco)}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 block">
                    Dividendo / Ação
                  </span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {formatarMoeda(analise.dividendoAnualPorAcao)}/ano
                  </p>
                </div>

                <div>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 block">
                    Dividendos no 1º Ano
                  </span>
                  <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatarMoeda(analise.rendaAnualEstimada)}
                  </p>
                  <span className="text-[11px] text-slate-400">
                    ~{formatarMoeda(analise.rendaMensalMedia)}/mês
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 block">
                    Ações em {prazoAnos} Anos
                  </span>
                  <p className="text-base font-extrabold text-sky-600 dark:text-sky-400 mt-0.5">
                    {projecaoDividendos.cotasFinais.toLocaleString('pt-BR')} ações
                  </p>
                  <span className="text-[11px] text-slate-400">
                    Reinvestindo proventos
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {abaGrafico === 'projecao'
                      ? `Projeção de Renda Mensal com ${ativoSelecionado.ticker}`
                      : `Histórico Recente de Fechamento (${ativoSelecionado.ticker})`}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {abaGrafico === 'projecao'
                      ? `Renda mensal estimada no ano ${prazoAnos}: ${formatarMoeda(projecaoDividendos.rendaMensalFinal)}/mês`
                      : 'Comparado com a linha tracejada do Preço Teto Bazin'}
                  </p>
                </div>

                {ativoSelecionado.historicoRecente.length > 0 && (
                  <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800 self-start">
                    <button
                      type="button"
                      onClick={() => setAbaGrafico('projecao')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        abaGrafico === 'projecao'
                          ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-500 dark:text-zinc-400'
                      }`}
                    >
                      Dividendos
                    </button>
                    <button
                      type="button"
                      onClick={() => setAbaGrafico('cotacao30d')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        abaGrafico === 'cotacao30d'
                          ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-500 dark:text-zinc-400'
                      }`}
                    >
                      Cotação 30d
                    </button>
                  </div>
                )}
              </div>

              {abaGrafico === 'projecao' ? (
                <div className="h-76 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={projecaoDividendos.historico.slice(1)}
                      margin={{ top: 10, right: 10, left: 4, bottom: 0 }}
                    >
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
                        formatter={(valor) => [
                          formatarMoeda(Number(valor)),
                          'Média Mensal Dividendos',
                        ]}
                      />
                      <Bar
                        dataKey="rendaMensal"
                        name="Dividendos/Mês"
                        fill="#10b981"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-76 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={ativoSelecionado.historicoRecente}
                      margin={{ top: 12, right: 10, left: 4, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="gradCotacao" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.22} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={corGrade} />
                      <XAxis dataKey="data" stroke="#94a3b8" axisLine={false} tickLine={false} />
                      <YAxis
                        domain={['auto', 'auto']}
                        tickFormatter={(v: number) => formatarMoeda(v)}
                        stroke="#94a3b8"
                        axisLine={false}
                        tickLine={false}
                        width={76}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: tema === 'escuro' ? '#18181b' : '#ffffff',
                          borderColor: tema === 'escuro' ? '#27272a' : '#e2e8f0',
                          borderRadius: '14px',
                          fontSize: '12px',
                        }}
                        formatter={(valor) => [formatarMoeda(Number(valor)), 'Fechamento']}
                      />
                      <ReferenceLine
                        y={analise.precoTetoBazin}
                        stroke="#10b981"
                        strokeDasharray="6 4"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="fechamento"
                        name="Preço Fechamento"
                        stroke="#0ea5e9"
                        strokeWidth={2.5}
                        fill="url(#gradCotacao)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
