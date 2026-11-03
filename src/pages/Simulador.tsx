import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookmarkPlus,
  Calculator,
  Check,
  FileSpreadsheet,
  Share2,
  ShieldCheck,
  Target,
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
  ParametrosJurosCompostos,
  TipoTributacao,
  UnidadePeriodo,
  UnidadeTaxa,
} from '../types/financas';
import { calcularJurosCompostos } from '../utils/calculosFinanceiros';
import {
  converterNumero,
  formatarMoeda,
  formatarMoedaCompacta,
  formatarPercentual,
} from '../utils/formatadores';

export default function Simulador() {
  const [parametrosUrl, setParametrosUrl] = useSearchParams();
  const taxasReferencia = useFinanceStore((estado) => estado.taxasReferencia);
  const tema = useFinanceStore((estado) => estado.tema);
  const definirMetaAtiva = useFinanceStore((estado) => estado.definirMetaAtiva);
  const salvarCenario = useFinanceStore((estado) => estado.salvarCenario);

  const [capitalInicial, setCapitalInicial] = useState(
    parametrosUrl.get('inicial') ?? '5000'
  );
  const [aporteMensal, setAporteMensal] = useState(
    parametrosUrl.get('aporte') ?? '800'
  );
  const [taxa, setTaxa] = useState(
    parametrosUrl.get('taxa') ?? String(taxasReferencia.cdiAnual)
  );
  const [unidadeTaxa, setUnidadeTaxa] = useState<UnidadeTaxa>(
    (parametrosUrl.get('utaxa') as UnidadeTaxa) || 'anual'
  );
  const [periodo, setPeriodo] = useState(parametrosUrl.get('periodo') ?? '10');
  const [unidadePeriodo, setUnidadePeriodo] = useState<UnidadePeriodo>(
    (parametrosUrl.get('uperiodo') as UnidadePeriodo) || 'anos'
  );
  const [inflacaoAnual, setInflacaoAnual] = useState(
    parametrosUrl.get('inflacao') ?? String(taxasReferencia.ipcaAnual)
  );
  const [tributacao, setTributacao] = useState<TipoTributacao>(
    (parametrosUrl.get('ir') as TipoTributacao) || 'regressivo'
  );

  const [nomeCenario, setNomeCenario] = useState('');
  const [avisoAcao, setAvisoAcao] = useState<string | null>(null);

  const parametrosCalculo: ParametrosJurosCompostos = useMemo(
    () => ({
      capitalInicial: converterNumero(capitalInicial, 0),
      aporteMensal: converterNumero(aporteMensal, 0),
      taxa: converterNumero(taxa, 0),
      unidadeTaxa,
      periodo: Math.max(1, converterNumero(periodo, 1)),
      unidadePeriodo,
      inflacaoAnual: converterNumero(inflacaoAnual, 0),
      tributacao,
    }),
    [
      capitalInicial,
      aporteMensal,
      taxa,
      unidadeTaxa,
      periodo,
      unidadePeriodo,
      inflacaoAnual,
      tributacao,
    ]
  );

  const resultado = useMemo(
    () => calcularJurosCompostos(parametrosCalculo),
    [parametrosCalculo]
  );

  const exibirFeedback = (mensagem: string) => {
    setAvisoAcao(mensagem);
    window.setTimeout(() => {
      setAvisoAcao((atual) => (atual === mensagem ? null : atual));
    }, 2800);
  };

  const aplicarAtalhoTaxa = (tipo: 'cdi' | 'lci' | 'ipcaMais' | 'poupanca') => {
    if (tipo === 'cdi') {
      setTaxa(String(taxasReferencia.cdiAnual));
      setUnidadeTaxa('anual');
      setTributacao('regressivo');
    } else if (tipo === 'lci') {
      const taxaLci = Number((taxasReferencia.cdiAnual * 0.92).toFixed(2));
      setTaxa(String(taxaLci));
      setUnidadeTaxa('anual');
      setTributacao('isento');
    } else if (tipo === 'ipcaMais') {
      const taxaComposta =
        ((1 + taxasReferencia.ipcaAnual / 100) * (1 + 0.065) - 1) * 100;
      setTaxa(taxaComposta.toFixed(2));
      setUnidadeTaxa('anual');
      setTributacao('regressivo');
    } else {
      setTaxa(String(taxasReferencia.poupancaMensal));
      setUnidadeTaxa('mensal');
      setTributacao('isento');
    }
  };

  const handleDefinirMeta = () => {
    const titulo =
      nomeCenario.trim() ||
      `Meta (${periodo} ${unidadePeriodo === 'anos' ? 'anos' : 'meses'})`;
    definirMetaAtiva(titulo, parametrosCalculo, resultado);
    exibirFeedback('Meta atualizada no Dashboard!');
  };

  const handleSalvarCenario = () => {
    const titulo =
      nomeCenario.trim() ||
      `Simulação ${periodo}${unidadePeriodo === 'anos' ? 'a' : 'm'} · ${taxa}%`;
    salvarCenario(titulo, parametrosCalculo, resultado);
    setNomeCenario('');
    exibirFeedback('Cenário salvo em "Cenários Salvos"!');
  };

  const handleCompartilharLink = async () => {
    const novosParams = new URLSearchParams({
      inicial: String(parametrosCalculo.capitalInicial),
      aporte: String(parametrosCalculo.aporteMensal),
      taxa: String(parametrosCalculo.taxa),
      utaxa: parametrosCalculo.unidadeTaxa,
      periodo: String(parametrosCalculo.periodo),
      uperiodo: parametrosCalculo.unidadePeriodo,
      inflacao: String(parametrosCalculo.inflacaoAnual),
      ir: parametrosCalculo.tributacao,
    });
    setParametrosUrl(novosParams, { replace: true });
    const urlCompleta = `${window.location.origin}${window.location.pathname}?${novosParams.toString()}`;

    try {
      await navigator.clipboard.writeText(urlCompleta);
      exibirFeedback('Link da simulação copiado!');
    } catch {
      exibirFeedback('URL atualizada na barra de endereços!');
    }
  };

  const baseTotal = Math.max(1, resultado.valorBruto);
  const fatiaInvestido = (resultado.totalInvestido / baseTotal) * 100;
  const fatiaJurosLiquidos =
    (Math.max(0, resultado.jurosBrutos - resultado.valorImposto) / baseTotal) * 100;
  const fatiaImposto = (resultado.valorImposto / baseTotal) * 100;

  const corGrade = tema === 'escuro' ? '#27272a' : '#e4e4e7';

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Simulador de Juros Compostos"
        descricao="Projeção patrimonial com cálculo preciso de IR regressivo por aporte e desconto de inflação."
        icone={<Calculator size={22} />}
        acoes={
          <button
            type="button"
            onClick={handleCompartilharLink}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            <Share2 size={15} />
            Compartilhar Simulação
          </button>
        }
      />

      {avisoAcao && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold">
          <Check size={16} />
          <span>{avisoAcao}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-5">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Atalhos de Mercado
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => aplicarAtalhoTaxa('cdi')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-emerald-500/15 hover:text-emerald-700 dark:bg-zinc-800 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-300 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                100% CDI
              </button>
              <button
                type="button"
                onClick={() => aplicarAtalhoTaxa('lci')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-emerald-500/15 hover:text-emerald-700 dark:bg-zinc-800 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-300 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                LCI 92% CDI (Isento)
              </button>
              <button
                type="button"
                onClick={() => aplicarAtalhoTaxa('ipcaMais')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-emerald-500/15 hover:text-emerald-700 dark:bg-zinc-800 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-300 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                IPCA + 6,5%
              </button>
              <button
                type="button"
                onClick={() => aplicarAtalhoTaxa('poupanca')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-emerald-500/15 hover:text-emerald-700 dark:bg-zinc-800 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-300 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                Poupança
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CampoNumerico
              rotulo="Valor Inicial"
              prefixo="R$"
              step="100"
              min="0"
              valor={capitalInicial}
              aoAlterar={setCapitalInicial}
            />

            <CampoNumerico
              rotulo="Aporte Mensal"
              prefixo="R$"
              step="50"
              min="0"
              valor={aporteMensal}
              aoAlterar={setAporteMensal}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CampoNumerico
              rotulo="Taxa de Juros"
              step="0.01"
              min="0"
              valor={taxa}
              aoAlterar={setTaxa}
              sufixo={
                <button
                  type="button"
                  onClick={() =>
                    setUnidadeTaxa((atual) => (atual === 'anual' ? 'mensal' : 'anual'))
                  }
                  className="px-2 py-1 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300/70 dark:hover:bg-zinc-700 font-semibold cursor-pointer"
                  title="Alternar entre taxa anual e mensal"
                >
                  {unidadeTaxa === 'anual' ? '% a.a.' : '% a.m.'}
                </button>
              }
            />

            <CampoNumerico
              rotulo="Período"
              step="1"
              min="1"
              valor={periodo}
              aoAlterar={setPeriodo}
              sufixo={
                <button
                  type="button"
                  onClick={() =>
                    setUnidadePeriodo((atual) => (atual === 'anos' ? 'meses' : 'anos'))
                  }
                  className="px-2 py-1 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300/70 dark:hover:bg-zinc-700 font-semibold cursor-pointer"
                  title="Alternar entre anos e meses"
                >
                  {unidadePeriodo === 'anos' ? 'Anos' : 'Meses'}
                </button>
              }
            />
          </div>

          <CampoNumerico
            rotulo="Inflação Estimada (IPCA)"
            step="0.1"
            min="0"
            valor={inflacaoAnual}
            aoAlterar={setInflacaoAnual}
            sufixo="% a.a."
            dica="Usada para calcular o Poder de Compra Real nos valores de hoje."
          />

          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Regime de Imposto de Renda
            </span>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/70">
              <button
                type="button"
                onClick={() => setTributacao('regressivo')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  tributacao === 'regressivo'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Tabela Regressiva
              </button>
              <button
                type="button"
                onClick={() => setTributacao('isento')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  tributacao === 'isento'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Isento (LCI / LCA)
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
            <input
              type="text"
              placeholder="Nome do cenário (ex: Aposentadoria)"
              value={nomeCenario}
              onChange={(evento) => setNomeCenario(evento.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/50 py-2.5 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-emerald-500"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleSalvarCenario}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <BookmarkPlus size={16} />
                Salvar Cenário
              </button>

              <button
                type="button"
                onClick={handleDefinirMeta}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Target size={16} />
                Definir Meta no Painel
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl bg-zinc-900 dark:bg-zinc-900 border border-zinc-800 p-6 text-white shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-zinc-800">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Saldo Líquido Final (Na Conta)
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1 numeros-tabulares">
                  {formatarMoeda(resultado.saldoLiquido)}
                </h2>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-zinc-400 block">Rentabilidade Real Acima do IPCA</span>
                <span className="text-lg font-bold text-sky-400 numeros-tabulares">
                  {formatarPercentual(resultado.taxaRealAnual)} a.a.
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-2">
                <span>Composição do Patrimônio Bruto ({formatarMoeda(resultado.valorBruto)})</span>
                <span>{resultado.totalMeses} meses</span>
              </div>
              <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden flex">
                <div
                  style={{ width: `${fatiaInvestido}%` }}
                  className="bg-zinc-400 transition-all duration-300"
                  title="Total Investido"
                />
                <div
                  style={{ width: `${fatiaJurosLiquidos}%` }}
                  className="bg-emerald-500 transition-all duration-300"
                  title="Juros Líquidos"
                />
                {fatiaImposto > 0 && (
                  <div
                    style={{ width: `${fatiaImposto}%` }}
                    className="bg-rose-500 transition-all duration-300"
                    title="Imposto de Renda"
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-4 mt-2.5 text-xs text-zinc-300 numeros-tabulares">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                  Investido: <strong>{formatarMoeda(resultado.totalInvestido)}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Juros Líquidos:{' '}
                  <strong>
                    {formatarMoeda(resultado.jurosBrutos - resultado.valorImposto)}
                  </strong>
                </span>
                {resultado.valorImposto > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    IR ({formatarPercentual(resultado.aliquotaEfetiva)}):{' '}
                    <strong>- {formatarMoeda(resultado.valorImposto)}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-zinc-950/70 border border-zinc-800 p-4 flex items-start gap-3.5">
              <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 shrink-0 mt-0.5">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Poder de Compra Real Hoje
                </p>
                <p className="text-2xl font-extrabold text-white mt-0.5 numeros-tabulares">
                  {formatarMoeda(resultado.poderDeCompraReal)}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Equivalente ao que esse saldo líquido compraria nos preços atuais, descontando{' '}
                  {formatarPercentual(parametrosCalculo.inflacaoAnual)} de inflação anual.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Curva de Acumulação (Líquido vs Poder Real vs Investido)
            </h3>
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={resultado.historico}
                  margin={{ top: 8, right: 10, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={corGrade} />
                  <XAxis dataKey="rotulo" stroke="#71717a" axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v: number) => formatarMoedaCompacta(v)}
                    stroke="#71717a"
                    axisLine={false}
                    tickLine={false}
                    width={72}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tema === 'escuro' ? '#18181b' : '#ffffff',
                      borderColor: tema === 'escuro' ? '#27272a' : '#e4e4e7',
                      borderRadius: '12px',
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
                    fill="#10b981"
                    fillOpacity={0.14}
                  />
                  <Area
                    type="monotone"
                    dataKey="poderDeCompraReal"
                    name="Poder de Compra Real"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="#f59e0b"
                    fillOpacity={0.08}
                  />
                  <Area
                    type="monotone"
                    dataKey="investido"
                    name="Total Investido"
                    stroke="#71717a"
                    strokeWidth={1.8}
                    strokeDasharray="4 4"
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-emerald-600 dark:text-emerald-400" />
            Evolução Detalhada por Período
          </h3>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {resultado.historico.length - 1} marcos registrados
          </span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left border-collapse text-sm numeros-tabulares">
            <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Período</th>
                <th className="py-3.5 px-5 font-semibold">Total Investido</th>
                <th className="py-3.5 px-5 font-semibold">Juros Brutos</th>
                <th className="py-3.5 px-5 font-semibold">Saldo Líquido</th>
                <th className="py-3.5 px-5 font-semibold text-right">Poder Real</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
              {resultado.historico.slice(1).map((linha) => (
                <tr
                  key={linha.rotulo}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="py-3.5 px-5 font-semibold text-zinc-800 dark:text-zinc-200">
                    {linha.rotulo}
                  </td>
                  <td className="py-3.5 px-5 text-zinc-600 dark:text-zinc-400">
                    {formatarMoeda(linha.investido)}
                  </td>
                  <td className="py-3.5 px-5 text-sky-600 dark:text-sky-400 font-medium">
                    + {formatarMoeda(linha.jurosBrutos)}
                  </td>
                  <td className="py-3.5 px-5 text-emerald-600 dark:text-emerald-400 font-bold">
                    {formatarMoeda(linha.patrimonioLiquido)}
                  </td>
                  <td className="py-3.5 px-5 text-right font-semibold text-amber-600 dark:text-amber-400">
                    {formatarMoeda(linha.poderDeCompraReal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

