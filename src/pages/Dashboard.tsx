import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Calculator,
  Compass,
  Landmark,
  LayoutDashboard,
  PiggyBank,
  Scale,
  ShieldCheck,
  Sparkles,
  Wallet,
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
import { CartaoResumo } from '../components/CartaoResumo';
import { useFinanceStore } from '../store/useFinanceStore';
import {
  formatarMoeda,
  formatarMoedaCompacta,
  formatarPercentual,
} from '../utils/formatadores';

type ModoCurvaGrafico = 'patrimonioLiquido' | 'poderDeCompraReal' | 'patrimonioBruto';

export default function Dashboard() {
  const metaAtiva = useFinanceStore((estado) => estado.metaAtiva);
  const tema = useFinanceStore((estado) => estado.tema);
  const carregarExemploDemonstracao = useFinanceStore(
    (estado) => estado.carregarExemploDemonstracao
  );

  const [modoGrafico, setModoGrafico] = useState<ModoCurvaGrafico>('patrimonioLiquido');

  const resultado = metaAtiva?.resultado;
  const ganhoLiquido = resultado ? resultado.saldoLiquido - resultado.totalInvestido : 0;
  const percentualJurosNoSaldo =
    resultado && resultado.saldoLiquido > 0
      ? (ganhoLiquido / resultado.saldoLiquido) * 100
      : 0;

  const configuracaoCurva: Record<
    ModoCurvaGrafico,
    { rotulo: string; cor: string }
  > = {
    patrimonioLiquido: { rotulo: 'Patrimônio Líquido', cor: '#10b981' },
    poderDeCompraReal: { rotulo: 'Poder de Compra Real', cor: '#f59e0b' },
    patrimonioBruto: { rotulo: 'Patrimônio Bruto', cor: '#0ea5e9' },
  };

  const corGrade = tema === 'escuro' ? '#27272a' : '#e4e4e7';
  const corEixo = tema === 'escuro' ? '#71717a' : '#71717a';

  const atalhosFerramentas = [
    {
      rota: '/simulador',
      titulo: 'Juros Compostos',
      descricao: 'Projeção com IR regressivo lote a lote e inflação.',
      icone: <Calculator size={20} />,
      cor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    },
    {
      rota: '/renda-fixa',
      titulo: 'CDB vs LCI/LCA',
      descricao: 'Descubra a equivalência exata entre títulos com e sem IR.',
      icone: <Scale size={20} />,
      cor: 'text-sky-600 dark:text-sky-400 bg-sky-500/10',
    },
    {
      rota: '/independencia',
      titulo: 'Viver de Renda',
      descricao: 'Calcule o patrimônio ideal para sua renda mensal perpétua.',
      icone: <Compass size={20} />,
      cor: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    },
    {
      rota: '/financiamento',
      titulo: 'SAC vs Price',
      descricao: 'Compare parcelas e economia real de juros em financiamentos.',
      icone: <Landmark size={20} />,
      cor: 'text-violet-600 dark:text-violet-400 bg-violet-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Visão Geral"
        descricao={
          metaAtiva
            ? `Meta ativa: ${metaAtiva.nome}`
            : 'Acompanhe suas metas patrimoniais e acesse os simuladores financeiros.'
        }
        icone={<LayoutDashboard size={22} />}
        acoes={
          <Link
            to="/simulador"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors shadow-xs"
          >
            <Calculator size={16} />
            Nova Simulação
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <CartaoResumo
          titulo="Saldo Líquido Projetado"
          valor={formatarMoeda(resultado?.saldoLiquido ?? 0)}
          subtitulo={
            resultado
              ? `Já descontando ${formatarMoeda(resultado.valorImposto)} de IR`
              : 'Defina uma meta no simulador'
          }
          icone={<Wallet size={20} />}
          variante="esmeralda"
          destaqueValor={Boolean(resultado)}
        />

        <CartaoResumo
          titulo="Total Investido"
          valor={formatarMoeda(resultado?.totalInvestido ?? 0)}
          subtitulo={
            metaAtiva
              ? `Aporte de ${formatarMoeda(metaAtiva.parametros.aporteMensal)}/mês`
              : 'Soma dos aportes do seu bolso'
          }
          icone={<PiggyBank size={20} />}
          variante="neutro"
        />

        <CartaoResumo
          titulo="Ganho Líquido em Juros"
          valor={`+ ${formatarMoeda(ganhoLiquido)}`}
          subtitulo={
            resultado
              ? `${formatarPercentual(percentualJurosNoSaldo)} do patrimônio final vem dos juros`
              : 'Efeito bola de neve acumulado'
          }
          icone={<Activity size={20} />}
          variante="azul"
          destaqueValor={Boolean(resultado)}
        />

        <CartaoResumo
          titulo="Poder de Compra Real"
          valor={formatarMoeda(resultado?.poderDeCompraReal ?? 0)}
          subtitulo={
            resultado
              ? `Taxa real de ${formatarPercentual(resultado.taxaRealAnual)} a.a. acima da inflação`
              : 'Valor ajustado para o dinheiro de hoje'
          }
          icone={<ShieldCheck size={20} />}
          variante="ambar"
        />
      </div>

      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Evolução Patrimonial Projetada
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Compare o crescimento do patrimônio contra o valor saído do seu bolso
            </p>
          </div>

          {resultado && (
            <div className="inline-flex rounded-xl bg-zinc-100 dark:bg-zinc-800/80 p-1 self-start">
              {(
                [
                  ['patrimonioLiquido', 'Líquido'],
                  ['poderDeCompraReal', 'Poder Real'],
                  ['patrimonioBruto', 'Bruto'],
                ] as const
              ).map(([chave, texto]) => (
                <button
                  key={chave}
                  type="button"
                  onClick={() => setModoGrafico(chave)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    modoGrafico === chave
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  {texto}
                </button>
              ))}
            </div>
          )}
        </div>

        {resultado && resultado.historico.length > 0 ? (
          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={resultado.historico}
                margin={{ top: 10, right: 12, left: 8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradientePrincipal" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={configuracaoCurva[modoGrafico].cor}
                      stopOpacity={0.28}
                    />
                    <stop
                      offset="95%"
                      stopColor={configuracaoCurva[modoGrafico].cor}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="gradienteInvestido" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#71717a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={corGrade}
                />
                <XAxis
                  dataKey="rotulo"
                  stroke={corEixo}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(valor: number) => formatarMoedaCompacta(valor)}
                  stroke={corEixo}
                  axisLine={false}
                  tickLine={false}
                  width={76}
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
                  dataKey={modoGrafico}
                  name={configuracaoCurva[modoGrafico].rotulo}
                  stroke={configuracaoCurva[modoGrafico].cor}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#gradientePrincipal)"
                />
                <Area
                  type="monotone"
                  dataKey="investido"
                  name="Total Investido"
                  stroke="#71717a"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#gradienteInvestido)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Sparkles size={24} />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Nenhuma meta patrimonial ativa ainda
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mt-1 mb-6">
              Crie uma projeção personalizada no Simulador ou carregue um cenário de
              demonstração para visualizar os gráficos imediatamente.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/simulador"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
              >
                Simular Meu Patrimônio
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={carregarExemploDemonstracao}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-sm font-semibold transition-colors cursor-pointer"
              >
                Carregar Exemplo Prático
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
          Ferramentas Financeiras
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {atalhosFerramentas.map((ferramenta) => (
            <Link
              key={ferramenta.rota}
              to={ferramenta.rota}
              className="group rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-5 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 transition-all shadow-xs flex flex-col justify-between gap-4"
            >
              <div>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 ${ferramenta.cor}`}
                >
                  {ferramenta.icone}
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {ferramenta.titulo}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  {ferramenta.descricao}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 group-hover:text-emerald-600 dark:text-zinc-400 dark:group-hover:text-emerald-400 transition-colors">
                Abrir ferramenta
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

