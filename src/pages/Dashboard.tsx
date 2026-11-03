import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  Bookmark,
  PiggyBank,
  Plus,
  ShieldCheck,
  Trash2,
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
import type { CenarioSalvo } from '../types/financas';
import {
  formatarMoeda,
  formatarMoedaCompacta,
  formatarPercentual,
} from '../utils/formatadores';

type CurvaGrafico = 'patrimonioLiquido' | 'poderDeCompraReal' | 'patrimonioBruto';

export default function Dashboard() {
  const navegar = useNavigate();
  const metaAtiva = useFinanceStore((estado) => estado.metaAtiva);
  const cenariosSalvos = useFinanceStore((estado) => estado.cenariosSalvos);
  const tema = useFinanceStore((estado) => estado.tema);
  const definirMetaAtiva = useFinanceStore((estado) => estado.definirMetaAtiva);
  const removerCenario = useFinanceStore((estado) => estado.removerCenario);

  const [curva, setCurva] = useState<CurvaGrafico>('patrimonioLiquido');

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

  const corGrade = tema === 'escuro' ? '#27272a' : '#f1f5f9';

  return (
    <div className="space-y-7">
      <CabecalhoPagina
        categoria="Painel Consolidado"
        titulo="Visão Geral & Cenários"
        descricao={`Projeção fixada: ${nome}`}
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
          titulo="Saldo Líquido Fixado"
          valor={formatarMoeda(resultado.saldoLiquido)}
          subtitulo={`Bruto: ${formatarMoeda(resultado.valorBruto)}`}
          icone={<Wallet size={17} />}
          tom="positivo"
        />

        <CartaoResumo
          titulo="Total Aportado"
          valor={formatarMoeda(resultado.totalInvestido)}
          subtitulo={`Horizonte de ${resultado.totalMeses} meses`}
          icone={<PiggyBank size={17} />}
        />

        <CartaoResumo
          titulo="Juros Líquidos"
          valor={`+ ${formatarMoeda(resultado.jurosLiquidos)}`}
          subtitulo={`${formatarPercentual(percentualJuros)} do saldo final`}
          icone={<Activity size={17} />}
          tom="azul"
        />

        <CartaoResumo
          titulo="Poder de Compra Hoje"
          valor={formatarMoeda(resultado.poderDeCompraReal)}
          subtitulo={`Taxa real: ${formatarPercentual(resultado.taxaRealAnual)} a.a.`}
          icone={<ShieldCheck size={17} />}
          tom="ambar"
        />
      </div>

      <div className="rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Curva da Projeção Fixada
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Alterne entre valor líquido, poder de compra real e saldo bruto
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800 p-1 self-start">
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

        <div className="h-80 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
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
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Cenários Salvos
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Compare estratégias salvas no Simulador e alterne a projeção do gráfico
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300 numeros-tabulares">
            {cenariosSalvos.length}
          </span>
        </div>

        {cenariosSalvos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 py-10 px-4 text-center">
            <Bookmark size={22} className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
              Nenhum cenário salvo ainda
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Use o botão &ldquo;Salvar Cenário&rdquo; no Simulador para guardar e comparar simulações aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cenariosSalvos.map((cenario) => {
              const ativo = cenario.nome === nome;
              return (
                <div
                  key={cenario.id}
                  className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all numeros-tabulares ${
                    ativo
                      ? 'border-emerald-500 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06]'
                      : 'border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {cenario.nome}
                      </p>
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
                          onClick={() => removerCenario(cenario.id)}
                          title="Excluir"
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                      {formatarMoeda(cenario.resultado.saldoLiquido)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                      Poder real hoje: {formatarMoeda(cenario.resultado.poderDeCompraReal)}
                    </p>
                  </div>

                  {ativo ? (
                    <span className="text-center py-2 rounded-xl bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      Em exibição no gráfico
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        definirMetaAtiva(cenario.nome, cenario.parametros, cenario.resultado)
                      }
                      className="w-full py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Exibir no Gráfico
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
