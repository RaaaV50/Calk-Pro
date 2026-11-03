import { useMemo, useState } from 'react';
import { Award, Info, Scale } from 'lucide-react';
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
import { CabecalhoPagina } from '../components/CabecalhoPagina';
import { CampoNumerico } from '../components/CampoNumerico';
import { useFinanceStore } from '../store/useFinanceStore';
import { compararRendaFixa } from '../utils/calculosFinanceiros';
import {
  converterNumero,
  formatarMoeda,
  formatarMoedaCompacta,
  formatarPercentual,
} from '../utils/formatadores';

export default function ComparadorRendaFixa() {
  const taxasReferencia = useFinanceStore((estado) => estado.taxasReferencia);
  const tema = useFinanceStore((estado) => estado.tema);

  const [capitalInicial, setCapitalInicial] = useState('10000');
  const [aporteMensal, setAporteMensal] = useState('500');
  const [prazoMeses, setPrazoMeses] = useState('24');
  const [cdiAnual, setCdiAnual] = useState(String(taxasReferencia.cdiAnual));
  const [percentualCdb, setPercentualCdb] = useState('105');
  const [percentualLci, setPercentualLci] = useState('90');

  const comparativo = useMemo(
    () =>
      compararRendaFixa({
        capitalInicial: converterNumero(capitalInicial, 0),
        aporteMensal: converterNumero(aporteMensal, 0),
        prazoMeses: Math.max(1, converterNumero(prazoMeses, 12)),
        cdiAnual: converterNumero(cdiAnual, taxasReferencia.cdiAnual),
        percentualCdb: converterNumero(percentualCdb, 100),
        percentualLci: converterNumero(percentualLci, 90),
        taxaPoupancaMensal: taxasReferencia.poupancaMensal,
      }),
    [
      capitalInicial,
      aporteMensal,
      prazoMeses,
      cdiAnual,
      percentualCdb,
      percentualLci,
      taxasReferencia.cdiAnual,
      taxasReferencia.poupancaMensal,
    ]
  );

  const vencedor = comparativo.opcoes.find((item) => item.destaque) ?? comparativo.opcoes[0];
  const corGrade = tema === 'escuro' ? '#27272a' : '#e4e4e7';

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Comparador CDB vs LCI/LCA"
        descricao="Descubra qual título entrega o maior retorno líquido no seu prazo e calcule a taxa equivalente sem IR."
        icone={<Scale size={22} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
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

          <div className="grid grid-cols-2 gap-3">
            <CampoNumerico
              rotulo="Prazo"
              sufixo="meses"
              step="1"
              min="1"
              max="360"
              valor={prazoMeses}
              aoAlterar={setPrazoMeses}
            />

            <CampoNumerico
              rotulo="Taxa CDI"
              sufixo="% a.a."
              step="0.05"
              min="0"
              valor={cdiAnual}
              aoAlterar={setCdiAnual}
            />
          </div>

          <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
            <CampoNumerico
              rotulo="Rentabilidade do CDB / RDB"
              sufixo="% do CDI"
              step="1"
              min="0"
              valor={percentualCdb}
              aoAlterar={setPercentualCdb}
              dica="Sofre desconto regressivo de Imposto de Renda."
            />

            <CampoNumerico
              rotulo="Rentabilidade da LCI / LCA"
              sufixo="% do CDI"
              step="1"
              min="0"
              valor={percentualLci}
              aoAlterar={setPercentualLci}
              dica="Isenta de Imposto de Renda para pessoa física."
            />
          </div>

          <div className="rounded-xl bg-sky-500/10 border border-sky-500/20 p-4 text-xs text-zinc-700 dark:text-zinc-300 space-y-1.5">
            <p className="font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
              <Info size={15} />
              Equivalência no prazo de {prazoMeses} meses (IR base:{' '}
              {formatarPercentual(comparativo.aliquotaIrAplicada)})
            </p>
            <p>
              • Sua LCI de <strong>{percentualLci}% do CDI</strong> equivale a um CDB de{' '}
              <strong className="text-sky-700 dark:text-sky-300">
                {formatarPercentual(comparativo.cdbEquivalenteParaLci)} do CDI
              </strong>
              .
            </p>
            <p>
              • Seu CDB de <strong>{percentualCdb}% do CDI</strong> equivale a uma LCI de{' '}
              <strong className="text-sky-700 dark:text-sky-300">
                {formatarPercentual(comparativo.lciEquivalenteParaCdb)} do CDI
              </strong>
              .
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                <Award size={22} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Melhor Opção Líquida
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">{vencedor.nome}</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Total investido: {formatarMoeda(comparativo.totalInvestido)}
                </p>
              </div>
            </div>

            <div className="sm:text-right numeros-tabulares">
              <span className="text-xs text-zinc-400 block">Saldo Líquido Final</span>
              <span className="text-2xl font-extrabold text-emerald-400">
                {formatarMoeda(vencedor.saldoLiquido)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparativo.opcoes.map((opcao) => (
              <div
                key={opcao.nome}
                className={`rounded-2xl p-5 border transition-all flex flex-col justify-between gap-4 numeros-tabulares ${
                  opcao.destaque
                    ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-xs'
                    : 'border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {opcao.nome}
                    </h3>
                    {opcao.destaque && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500 text-zinc-950 shrink-0">
                        Vencedor
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {opcao.subtitulo}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-zinc-200/70 dark:border-zinc-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Bruto:</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {formatarMoeda(opcao.saldoBruto)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Imposto (IR):</span>
                    <span className="font-semibold text-rose-500">
                      {opcao.imposto > 0 ? `- ${formatarMoeda(opcao.imposto)}` : 'Isento'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Ganho Líquido:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      + {formatarMoeda(opcao.ganhoLiquido)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-zinc-200/70 dark:border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block">Saldo Líquido</span>
                    <span className="text-xl font-extrabold text-zinc-900 dark:text-white">
                      {formatarMoeda(opcao.saldoLiquido)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Disputa de Saldo Líquido ao Longo do Tempo
            </h3>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={comparativo.evolucaoComparativa}
                  margin={{ top: 8, right: 12, left: 8, bottom: 0 }}
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
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cdbLiquido"
                    name={`CDB (${percentualCdb}% CDI)`}
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="lciLiquida"
                    name={`LCI/LCA (${percentualLci}% CDI)`}
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="poupanca"
                    name="Poupança"
                    stroke="#a1a1aa"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

