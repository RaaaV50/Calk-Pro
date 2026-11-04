import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeftRight, Award } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BotaoCompartilhar } from '../components/BotaoCompartilhar';
import { CabecalhoPagina } from '../components/CabecalhoPagina';
import { CampoNumerico } from '../components/CampoNumerico';
import { useFinanceStore } from '../store/useFinanceStore';
import { compararInvestimentosRendaFixa } from '../utils/calculosFinanceiros';
import {
  converterNumero,
  formatarMoeda,
  formatarMoedaCompacta,
  formatarPercentual,
} from '../utils/formatadores';

export default function ComparadorRendaFixa() {
  const [parametrosUrl] = useSearchParams();
  const taxasMercado = useFinanceStore((estado) => estado.taxasMercado);
  const tema = useFinanceStore((estado) => estado.tema);

  const [capitalInicial, setCapitalInicial] = useState(
    parametrosUrl.get('inicial') ?? '10000'
  );
  const [aporteMensal, setAporteMensal] = useState(
    parametrosUrl.get('aporte') ?? '500'
  );
  const [prazoMeses, setPrazoMeses] = useState(
    parametrosUrl.get('prazo') ?? '24'
  );
  const [percentualCdb, setPercentualCdb] = useState(
    parametrosUrl.get('cdb') ?? '105'
  );
  const [percentualLci, setPercentualLci] = useState(
    parametrosUrl.get('lci') ?? '90'
  );
  const [spreadIpcaMais, setSpreadIpcaMais] = useState(
    parametrosUrl.get('ipca') ?? '6.5'
  );
  const [custodiaTesouro, setCustodiaTesouro] = useState(
    parametrosUrl.get('custodia') ?? '0.20'
  );

  const comparativo = useMemo(
    () =>
      compararInvestimentosRendaFixa({
        capitalInicial: converterNumero(capitalInicial, 0),
        aporteMensal: converterNumero(aporteMensal, 0),
        prazoMeses: Math.max(1, converterNumero(prazoMeses, 12)),
        cdiAnual: taxasMercado.cdiAnual,
        ipcaAnual: taxasMercado.ipcaAnual,
        poupancaMensal: taxasMercado.poupancaMensal,
        percentualCdb: converterNumero(percentualCdb, 100),
        percentualLci: converterNumero(percentualLci, 90),
        spreadIpcaMais: converterNumero(spreadIpcaMais, 6),
        custodiaTesouro: converterNumero(custodiaTesouro, 0),
      }),
    [
      capitalInicial,
      aporteMensal,
      prazoMeses,
      taxasMercado.cdiAnual,
      taxasMercado.ipcaAnual,
      taxasMercado.poupancaMensal,
      percentualCdb,
      percentualLci,
      spreadIpcaMais,
      custodiaTesouro,
    ]
  );

  const vencedor =
    comparativo.itens.find((item) => item.melhorOpcao) ?? comparativo.itens[0];
  const corGrade = tema === 'escuro' ? '#27272a' : '#f1f5f9';

  return (
    <div className="space-y-7">
      <CabecalhoPagina
        categoria="Análise Comparativa"
        titulo="Comparador de Renda Fixa"
        descricao="Compare o retorno líquido real entre CDB, LCI/LCA, Tesouro IPCA+ e Poupança usando as taxas do Banco Central."
        acoes={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/conversor"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 shadow-2xs transition-colors"
            >
              <ArrowLeftRight size={14} />
              Conversor de Taxas
            </Link>
            <BotaoCompartilhar
              parametros={{
                inicial: capitalInicial,
                aporte: aporteMensal,
                prazo: prazoMeses,
                cdb: percentualCdb,
                lci: percentualLci,
                ipca: spreadIpcaMais,
                custodia: custodiaTesouro,
              }}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-24 rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 p-6 sm:p-7 shadow-xs space-y-5">
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
            rotulo="Prazo até o Resgate"
            sufixo="Meses"
            step="1"
            min="1"
            max="120"
            slider={{ min: 1, max: 120, passo: 1 }}
            valor={prazoMeses}
            aoAlterar={setPrazoMeses}
          />

          <div className="pt-2 border-t border-slate-200/70 dark:border-zinc-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CampoNumerico
                rotulo="Taxa do CDB (Com IR)"
                sufixo="% CDI"
                step="1"
                min="0"
                valor={percentualCdb}
                aoAlterar={setPercentualCdb}
              />
              <CampoNumerico
                rotulo="Taxa LCI/LCA (Isenta)"
                sufixo="% CDI"
                step="1"
                min="0"
                valor={percentualLci}
                aoAlterar={setPercentualLci}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CampoNumerico
                rotulo="Tesouro IPCA+"
                sufixo="% a.a."
                step="0.1"
                min="0"
                valor={spreadIpcaMais}
                aoAlterar={setSpreadIpcaMais}
              />
              <CampoNumerico
                rotulo="Custódia B3 (IPCA+)"
                sufixo="% a.a."
                step="0.05"
                min="0"
                valor={custodiaTesouro}
                aoAlterar={setCustodiaTesouro}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-zinc-950/70 border border-slate-200/80 dark:border-zinc-800 p-4 text-xs space-y-1.5 numeros-tabulares">
            <p className="font-bold text-slate-800 dark:text-zinc-200">
              Equivalência Exata ({prazoMeses} meses · IR {formatarPercentual(comparativo.aliquotaIrPrazo)})
            </p>
            <p className="text-slate-600 dark:text-zinc-400">
              • LCI {percentualLci}% CDI equivale a CDB de{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">
                {formatarPercentual(comparativo.cdbEquivalenteDaLci)} CDI
              </strong>
            </p>
            <p className="text-slate-600 dark:text-zinc-400">
              • CDB {percentualCdb}% CDI equivale a LCI de{' '}
              <strong className="text-sky-600 dark:text-sky-400">
                {formatarPercentual(comparativo.lciEquivalenteDoCdb)} CDI
              </strong>
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 shadow-xs overflow-hidden">
          <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-sky-500/[0.05] border-b border-slate-200/70 dark:border-zinc-800/80 space-y-6 numeros-tabulares">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Award size={20} />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Maior Retorno Líquido no Prazo
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    {vencedor.nome}
                  </h2>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">
                  Saldo Líquido Vencedor
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatarMoeda(vencedor.saldoLiquido)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {comparativo.itens.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl p-4 border transition-all ${
                    item.melhorOpcao
                      ? 'border-emerald-500 bg-white dark:bg-zinc-900 shadow-xs'
                      : 'border-slate-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      {item.nome}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.detalhe}</span>
                  </div>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">
                    {formatarMoeda(item.saldoLiquido)}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      +{formatarMoeda(item.ganhoLiquido)}
                    </span>
                    <span>
                      {item.imposto > 0 ? `IR: -${formatarMoedaCompacta(item.imposto)}` : 'Isento'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Disputa de Saldo Líquido Mês a Mês
            </h3>
            <div className="h-76 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={comparativo.evolucao}
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
                    formatter={(valor) => formatarMoeda(Number(valor))}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="cdb" name="CDB" stroke="#0ea5e9" strokeWidth={2.3} dot={false} />
                  <Line type="monotone" dataKey="lci" name="LCI/LCA" stroke="#10b981" strokeWidth={2.3} dot={false} />
                  <Line type="monotone" dataKey="ipcaMais" name="IPCA+" stroke="#8b5cf6" strokeWidth={2.3} dot={false} />
                  <Line type="monotone" dataKey="poupanca" name="Poupança" stroke="#94a3b8" strokeWidth={1.8} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
