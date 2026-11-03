import { useMemo, useState } from 'react';
import { CheckCircle2, Landmark } from 'lucide-react';
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
import { calcularFinanciamento } from '../utils/calculosFinanceiros';
import {
  converterNumero,
  formatarMoeda,
  formatarMoedaCompacta,
} from '../utils/formatadores';

export default function Financiamento() {
  const tema = useFinanceStore((estado) => estado.tema);

  const [valorBem, setValorBem] = useState('400000');
  const [valorEntrada, setValorEntrada] = useState('80000');
  const [taxaJurosAnual, setTaxaJurosAnual] = useState('10.5');
  const [prazoAnos, setPrazoAnos] = useState('25');

  const resultado = useMemo(
    () =>
      calcularFinanciamento({
        valorBem: converterNumero(valorBem, 0),
        valorEntrada: converterNumero(valorEntrada, 0),
        taxaJurosAnual: converterNumero(taxaJurosAnual, 0),
        prazoAnos: Math.max(1, converterNumero(prazoAnos, 1)),
      }),
    [valorBem, valorEntrada, taxaJurosAnual, prazoAnos]
  );

  const corGrade = tema === 'escuro' ? '#27272a' : '#e4e4e7';

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Simulador de Financiamento (SAC vs Price)"
        descricao="Compare o comportamento das parcelas e descubra quanto você economiza em juros escolhendo o sistema ideal."
        icone={<Landmark size={22} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
          <CampoNumerico
            rotulo="Valor do Imóvel ou Bem"
            prefixo="R$"
            step="5000"
            min="0"
            valor={valorBem}
            aoAlterar={setValorBem}
          />

          <CampoNumerico
            rotulo="Valor de Entrada"
            prefixo="R$"
            step="5000"
            min="0"
            valor={valorEntrada}
            aoAlterar={setValorEntrada}
          />

          <div className="grid grid-cols-2 gap-3">
            <CampoNumerico
              rotulo="Juros Efetivos (CET)"
              sufixo="% a.a."
              step="0.1"
              min="0"
              valor={taxaJurosAnual}
              aoAlterar={setTaxaJurosAnual}
            />

            <CampoNumerico
              rotulo="Prazo Total"
              sufixo="Anos"
              step="1"
              min="1"
              max="40"
              valor={prazoAnos}
              aoAlterar={setPrazoAnos}
            />
          </div>

          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 p-4 numeros-tabulares space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Valor Financiado:</span>
              <strong className="text-zinc-900 dark:text-zinc-100">
                {formatarMoeda(resultado.valorFinanciado)}
              </strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Total de Parcelas:</span>
              <strong className="text-zinc-900 dark:text-zinc-100">
                {resultado.totalMeses} meses
              </strong>
            </div>
          </div>

          {resultado.economiaSac > 0 && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-4 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Economia na Tabela SAC</p>
                <p className="mt-0.5 leading-relaxed">
                  Optando pela amortização constante (SAC), você economiza{' '}
                  <strong className="numeros-tabulares">
                    {formatarMoeda(resultado.economiaSac)}
                  </strong>{' '}
                  em juros ao longo do contrato.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 numeros-tabulares">
            <div className="rounded-2xl border-2 border-emerald-500/60 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Amortização Constante
                  </span>
                  <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                    Tabela SAC
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                  Menor Juros Total
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200/70 dark:border-zinc-800">
                <div>
                  <span className="text-xs text-zinc-500 block">1ª Parcela</span>
                  <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {formatarMoeda(resultado.sac.primeiraParcela)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 block">Última Parcela</span>
                  <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {formatarMoeda(resultado.sac.ultimaParcela)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200/70 dark:border-zinc-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total de Juros Pagos:</span>
                  <span className="font-semibold text-rose-500">
                    {formatarMoeda(resultado.sac.totalJuros)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-1">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-300">
                    Custo Total Pago:
                  </span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatarMoeda(resultado.sac.totalPago)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    Parcelas Fixas
                  </span>
                  <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                    Tabela Price
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-700 dark:text-sky-300">
                  1ª Parcela Menor
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200/70 dark:border-zinc-800">
                <div>
                  <span className="text-xs text-zinc-500 block">1ª Parcela</span>
                  <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {formatarMoeda(resultado.price.primeiraParcela)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 block">Última Parcela</span>
                  <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {formatarMoeda(resultado.price.ultimaParcela)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200/70 dark:border-zinc-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total de Juros Pagos:</span>
                  <span className="font-semibold text-rose-500">
                    {formatarMoeda(resultado.price.totalJuros)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-1">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-300">
                    Custo Total Pago:
                  </span>
                  <span className="font-extrabold text-zinc-900 dark:text-white">
                    {formatarMoeda(resultado.price.totalPago)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Evolução do Valor das Parcelas (SAC Decrescente vs Price Fixa)
            </h3>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={resultado.evolucaoAnual}
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
                    dataKey="parcelaSac"
                    name="Parcela SAC"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="parcelaPrice"
                    name="Parcela Price"
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
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

