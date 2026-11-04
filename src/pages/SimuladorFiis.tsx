import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Info, Search, Sparkles } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BotaoCompartilhar } from '../components/BotaoCompartilhar';
import { CabecalhoPagina } from '../components/CabecalhoPagina';
import { CampoNumerico } from '../components/CampoNumerico';
import { listarAtivosB3 } from '../services/apiBolsaB3';
import { useFinanceStore } from '../store/useFinanceStore';
import type { AtivoResumoB3 } from '../types/rendaVariavel';
import { calcularBolaDeNeveFiis } from '../utils/calculosRendaVariavel';
import {
  converterNumero,
  formatarMoeda,
  formatarMoedaCompacta,
  formatarMoedaDestaque,
  formatarPercentual,
  formatarPrazoMeses,
} from '../utils/formatadores';

const DY_MENSAL_REFERENCIA_FII: Record<string, number> = {
  MXRF11: 1.02,
  KNCR11: 1.0,
  CPTS11: 0.98,
  IRDM11: 1.05,
  KNIP11: 0.92,
  TGAR11: 1.08,
  XPML11: 0.88,
  VISC11: 0.8,
  BTLG11: 0.79,
  XPLG11: 0.78,
  HGLG11: 0.72,
  KNRI11: 0.7,
};

export default function SimuladorFiis() {
  const [parametrosUrl] = useSearchParams();
  const taxasMercado = useFinanceStore((estado) => estado.taxasMercado);
  const tema = useFinanceStore((estado) => estado.tema);

  const [veioDaUrl] = useState(
    () =>
      parametrosUrl.has('ticker') ||
      parametrosUrl.has('preco') ||
      parametrosUrl.has('dy')
  );

  const [fiisPopulares, setFiisPopulares] = useState<AtivoResumoB3[]>([]);
  const [tickerSelecionado, setTickerSelecionado] = useState(
    parametrosUrl.get('ticker')?.toUpperCase() ?? 'MXRF11'
  );
  const [termoBusca, setTermoBusca] = useState('');
  const [buscandoFii, setBuscandoFii] = useState(false);

  const [precoCota, setPrecoCota] = useState(parametrosUrl.get('preco') ?? '9.85');
  const [dyMensal, setDyMensal] = useState(parametrosUrl.get('dy') ?? '1.02');
  const [cotasIniciais, setCotasIniciais] = useState(
    parametrosUrl.get('cotas') ?? '50'
  );
  const [aporteMensal, setAporteMensal] = useState(
    parametrosUrl.get('aporte') ?? '600'
  );
  const [prazoAnos, setPrazoAnos] = useState(parametrosUrl.get('anos') ?? '12');
  const [reinvestirDividendos, setReinvestirDividendos] = useState(
    parametrosUrl.get('reinvestir') ? parametrosUrl.get('reinvestir') === '1' : true
  );
  const [corrigirPelaInflacao, setCorrigirPelaInflacao] = useState(
    parametrosUrl.get('inflacao') === '1'
  );

  const [abaGrafico, setAbaGrafico] = useState<'renda' | 'patrimonio' | 'tabela'>('renda');

  useEffect(() => {
    let ativo = true;
    void listarAtivosB3({ tipo: 'fund', limite: 8 }).then(({ ativos }) => {
      if (!ativo || ativos.length === 0) return;
      setFiisPopulares(ativos.slice(0, 6));
      if (veioDaUrl) return;
      const preferido = ativos.find((a) => a.ticker === 'MXRF11') ?? ativos[0];
      if (preferido) {
        setTickerSelecionado(preferido.ticker);
        setPrecoCota(preferido.preco.toFixed(2));
        const dySugerido = DY_MENSAL_REFERENCIA_FII[preferido.ticker] ?? 0.85;
        setDyMensal(dySugerido.toFixed(2));
      }
    });
    return () => {
      ativo = false;
    };
  }, [veioDaUrl]);

  const selecionarFii = (fii: AtivoResumoB3) => {
    setTickerSelecionado(fii.ticker);
    setPrecoCota(fii.preco.toFixed(2));
    const dySugerido = DY_MENSAL_REFERENCIA_FII[fii.ticker] ?? 0.85;
    setDyMensal(dySugerido.toFixed(2));
  };

  const buscarFiiPorTicker = async () => {
    const limpo = termoBusca.trim().toUpperCase();
    if (!limpo) return;
    setBuscandoFii(true);
    const { ativos } = await listarAtivosB3({ tipo: 'fund', busca: limpo, limite: 5 });
    setBuscandoFii(false);
    const encontrado = ativos.find((a) => a.ticker === limpo) ?? ativos[0];
    if (encontrado) {
      selecionarFii(encontrado);
      setTermoBusca('');
    }
  };

  const precoInformado = converterNumero(precoCota, 10);
  const precoEfetivo = Math.max(0.5, precoInformado);
  const dyInformado = converterNumero(dyMensal, 0.85);
  const dyEfetivo = Math.min(3, Math.max(0, dyInformado));
  const dividendoPorCotaEstimado = precoEfetivo * (dyEfetivo / 100);
  const exibirAvisoTetoRealista = dyInformado > 3 || (precoInformado > 0 && precoInformado < 0.5);

  const resultado = useMemo(
    () =>
      calcularBolaDeNeveFiis({
        precoCota: precoEfetivo,
        dividendYieldMensalPercentual: dyEfetivo,
        cotasIniciais: converterNumero(cotasIniciais, 0),
        aporteMensal: converterNumero(aporteMensal, 0),
        prazoAnos: converterNumero(prazoAnos, 10),
        reinvestirDividendos,
        corrigirPelaInflacao,
        ipcaAnual: taxasMercado.ipcaAnual,
      }),
    [
      precoEfetivo,
      dyEfetivo,
      cotasIniciais,
      aporteMensal,
      prazoAnos,
      reinvestirDividendos,
      corrigirPelaInflacao,
      taxasMercado.ipcaAnual,
    ]
  );

  const corGrade = tema === 'escuro' ? '#27272a' : '#f1f5f9';

  return (
    <div className="space-y-7">
      <CabecalhoPagina
        categoria="Fundos Imobiliários (B3)"
        titulo="Simulador Bola de Neve & Número Mágico"
        descricao="Consulte a cotação real dos principais FIIs da B3 e descubra quando os aluguéis mensais passam a comprar novas cotas sozinhos."
        acoes={
          <BotaoCompartilhar
            parametros={{
              ticker: tickerSelecionado,
              preco: precoCota,
              dy: dyMensal,
              cotas: cotasIniciais,
              aporte: aporteMensal,
              anos: prazoAnos,
              reinvestir: reinvestirDividendos ? '1' : '0',
              inflacao: corrigirPelaInflacao ? '1' : '0',
            }}
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-24 rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="space-y-2.5">
            <label className="block text-[13px] font-semibold text-slate-700 dark:text-zinc-300">
              Buscar FII na B3 (Cotação Automática)
            </label>

            <div className="flex gap-2">
              <div className="flex-1 flex items-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3">
                <Search size={15} className="text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Ex: MXRF11, HGLG11, XPML11, KNCR11..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void buscarFiiPorTicker();
                  }}
                  className="w-full py-2 text-xs font-semibold bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 outline-none uppercase"
                />
              </div>
              <button
                type="button"
                onClick={() => void buscarFiiPorTicker()}
                disabled={buscandoFii}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {buscandoFii ? '...' : 'Buscar'}
              </button>
            </div>

            {fiisPopulares.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {fiisPopulares.map((fii) => (
                  <button
                    key={fii.ticker}
                    type="button"
                    onClick={() => selecionarFii(fii)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer numeros-tabulares ${
                      tickerSelecionado === fii.ticker
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {fii.ticker} · {formatarMoeda(fii.preco)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-200/70 dark:border-zinc-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CampoNumerico
                rotulo={`Preço da Cota (${tickerSelecionado})`}
                prefixo="R$"
                step="0.1"
                min="0.5"
                valor={precoCota}
                aoAlterar={setPrecoCota}
              />
              <CampoNumerico
                rotulo={`DY Mensal (${formatarMoeda(dividendoPorCotaEstimado)}/cota)`}
                sufixo="% a.m."
                step="0.05"
                min="0.1"
                max="3"
                valor={dyMensal}
                aoAlterar={setDyMensal}
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 mr-1">
                Perfis típicos:
              </span>
              {[
                { nome: 'Tijolo (~0,78% a.m.)', dy: '0.78' },
                { nome: 'Híbrido (~0,90% a.m.)', dy: '0.90' },
                { nome: 'Papel CRI (~1,02% a.m.)', dy: '1.02' },
              ].map((perfil) => (
                <button
                  key={perfil.nome}
                  type="button"
                  onClick={() => setDyMensal(perfil.dy)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    dyMensal === perfil.dy
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-100/80 dark:bg-zinc-800/70 text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
                  }`}
                >
                  {perfil.nome}
                </button>
              ))}
            </div>

            {exibirAvisoTetoRealista && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/25 px-3 py-2 text-[11px] text-amber-800 dark:text-amber-300">
                <Info size={14} className="shrink-0 mt-0.5" />
                <span>
                  Para evitar projeções irreais, o cálculo limita o Dividend Yield a{' '}
                  <strong>3,00% a.m.</strong> e o preço mínimo a <strong>R$ 0,50</strong>.
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CampoNumerico
              rotulo="Cotas Iniciais"
              sufixo="cotas"
              step="1"
              min="0"
              valor={cotasIniciais}
              aoAlterar={setCotasIniciais}
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
            rotulo="Horizonte de Acumulação"
            sufixo="Anos"
            step="1"
            min="1"
            max="35"
            slider={{ min: 1, max: 35, passo: 1 }}
            valor={prazoAnos}
            aoAlterar={setPrazoAnos}
          />

          <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/50 p-4 space-y-3">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Reinvestir dividendos mensais (Bola de Neve)
              </span>
              <input
                type="checkbox"
                checked={reinvestirDividendos}
                onChange={(e) => setReinvestirDividendos(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Corrigir cota, aluguel e aporte pelo IPCA ({formatarPercentual(taxasMercado.ipcaAnual)})
              </span>
              <input
                type="checkbox"
                checked={corrigirPelaInflacao}
                onChange={(e) => setCorrigirPelaInflacao(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 shadow-xs overflow-hidden numeros-tabulares">
          <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-sky-500/[0.05] border-b border-slate-200/70 dark:border-zinc-800/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Renda Mensal Passiva Isenta de IR
                </span>
                <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1 break-words">
                  {formatarMoedaDestaque(resultado.rendaMensalFinal)}
                  <span className="text-base sm:text-lg font-semibold text-slate-400 ml-1">
                    /mês
                  </span>
                </h2>
              </div>

              <div className="inline-flex items-center gap-1.5 self-start shrink-0 px-3.5 py-1.5 rounded-full bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <Building2 size={14} />
                {resultado.cotasFinais.toLocaleString('pt-BR')} cotas acumuladas
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] dark:bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                  <Sparkles size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    Número Mágico de {tickerSelecionado}:{' '}
                    {resultado.cotasNumeroMagico.toLocaleString('pt-BR')} cotas (
                    {formatarMoedaDestaque(resultado.valorNumeroMagico)})
                  </p>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">
                    A partir dessa marca, os próprios dividendos compram +1 nova cota todo mês.
                  </p>
                </div>
              </div>

              <span className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-zinc-900 text-xs font-extrabold text-slate-900 dark:text-white shrink-0 self-start sm:self-center">
                {resultado.mesAtingiuNumeroMagico !== null
                  ? resultado.mesAtingiuNumeroMagico === 0
                    ? 'Já atingido!'
                    : `Em ${formatarPrazoMeses(resultado.mesAtingiuNumeroMagico)}`
                  : 'Acima do prazo'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div className="min-w-0">
                <span className="text-xs text-slate-500 dark:text-zinc-400 block truncate">
                  Patrimônio Total
                </span>
                <p
                  className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate"
                  title={formatarMoeda(resultado.patrimonioFinal)}
                >
                  {formatarMoedaDestaque(resultado.patrimonioFinal)}
                </p>
              </div>
              <div className="min-w-0">
                <span className="text-xs text-slate-500 dark:text-zinc-400 block truncate">
                  Saiu do Bolso
                </span>
                <p
                  className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate"
                  title={formatarMoeda(resultado.totalDesembolsado)}
                >
                  {formatarMoedaDestaque(resultado.totalDesembolsado)}
                </p>
              </div>
              <div className="min-w-0">
                <span className="text-xs text-slate-500 dark:text-zinc-400 block truncate">
                  Cotas &ldquo;Grátis&rdquo; (Dividendos)
                </span>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                  +{resultado.cotasBolaDeNeve.toLocaleString('pt-BR')} cotas
                </p>
              </div>
              <div className="min-w-0">
                <span className="text-xs text-slate-500 dark:text-zinc-400 block truncate">
                  Yield on Cost (YoC)
                </span>
                <p className="text-sm font-bold text-sky-600 dark:text-sky-400 mt-0.5 truncate">
                  {formatarPercentual(resultado.yieldOnCostAnual)} a.a.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Crescimento da Bola de Neve ({formatarPercentual(dyEfetivo)} a.m.)
              </h3>

              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800 self-start">
                {(
                  [
                    ['renda', 'Aluguéis/Mês'],
                    ['patrimonio', 'Patrimônio'],
                    ['tabela', 'Tabela de Cotas'],
                  ] as const
                ).map(([chave, rotulo]) => (
                  <button
                    key={chave}
                    type="button"
                    onClick={() => setAbaGrafico(chave)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      abaGrafico === chave
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500 dark:text-zinc-400'
                    }`}
                  >
                    {rotulo}
                  </button>
                ))}
              </div>
            </div>

            {abaGrafico === 'renda' && (
              <div className="h-80 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={resultado.historico.slice(1)}
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
                      formatter={(valor) => [formatarMoeda(Number(valor)), 'Aluguel Mensal']}
                    />
                    <Bar
                      dataKey="rendaMensal"
                      name="Aluguel Mensal"
                      fill="#10b981"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {abaGrafico === 'patrimonio' && (
              <div className="h-80 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={resultado.historico}
                    margin={{ top: 10, right: 10, left: 4, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="gradFiiPat" x1="0" y1="0" x2="0" y2="1">
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
                      dataKey="patrimonioTotal"
                      name="Patrimônio em FIIs"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#gradFiiPat)"
                    />
                    <Area
                      type="monotone"
                      dataKey="totalDesembolsado"
                      name="Investido do Bolso"
                      stroke="#94a3b8"
                      strokeWidth={1.8}
                      strokeDasharray="4 4"
                      fill="transparent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {abaGrafico === 'tabela' && (
              <div className="h-80 overflow-y-auto rounded-xl border border-slate-200/70 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Ano</th>
                      <th className="py-3 px-4 font-semibold">Total Cotas</th>
                      <th className="py-3 px-4 font-semibold">Cotas Bola de Neve</th>
                      <th className="py-3 px-4 font-semibold">Aluguel/Mês</th>
                      <th className="py-3 px-4 font-semibold text-right">Patrimônio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70">
                    {resultado.historico.slice(1).map((linha) => (
                      <tr key={linha.rotulo}>
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-zinc-200">
                          {linha.rotulo}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700 dark:text-zinc-300">
                          {linha.totalCotas.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                          +{linha.cotasBolaDeNeve.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {formatarMoedaDestaque(linha.rendaMensal)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                          {formatarMoedaDestaque(linha.patrimonioTotal)}
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
