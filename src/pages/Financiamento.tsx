import { useMemo, useState } from 'react';
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
import { calcularFinanciamentoCompleto } from '../utils/calculosFinanceiros';
import {
  converterNumero,
  formatarMoeda,
  formatarMoedaCompacta,
  formatarPrazoMeses,
} from '../utils/formatadores';

export default function Financiamento() {
  const tema = useFinanceStore((estado) => estado.tema);

  const [valorBem, setValorBem] = useState('400000');
  const [valorEntrada, setValorEntrada] = useState('80000');
  const [taxaJurosAnual, setTaxaJurosAnual] = useState('10.5');
  const [prazoAnos, setPrazoAnos] = useState('25');
  const [amortizacaoExtraMensal, setAmortizacaoExtraMensal] = useState('500');

  const resultado = useMemo(
    () =>
      calcularFinanciamentoCompleto({
        valorBem: converterNumero(valorBem, 0),
        valorEntrada: converterNumero(valorEntrada, 0),
        taxaJurosAnual: converterNumero(taxaJurosAnual, 0),
        prazoAnos: Math.max(1, converterNumero(prazoAnos, 1)),
        amortizacaoExtraMensal: converterNumero(amortizacaoExtraMensal, 0),
      }),
    [valorBem, valorEntrada, taxaJurosAnual, prazoAnos, amortizacaoExtraMensal]
  );

  const temExtra = converterNumero(amortizacaoExtraMensal, 0) > 0;
  const corGrade = tema === 'escuro' ? '#27272a' : '#f1f5f9';

  return (
    <div className="space-y-7">
      <CabecalhoPagina
        categoria="Crédito Imobiliário & Bens"
        titulo="Financiamento & Amortização"
        descricao="Compare Tabela SAC vs Price e simule quanto tempo e juros você economiza com amortizações extras."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-24 rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CampoNumerico
              rotulo="Valor do Imóvel / Bem"
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
          </div>

          <CampoNumerico
            rotulo="Custo Efetivo Total (CET / Juros)"
            sufixo="% a.a."
            step="0.1"
            min="0"
            slider={{ min: 4, max: 18, passo: 0.25 }}
            valor={taxaJurosAnual}
            aoAlterar={setTaxaJurosAnual}
          />

          <CampoNumerico
            rotulo="Prazo do Contrato"
            sufixo="Anos"
            step="1"
            min="1"
            max="35"
            slider={{ min: 1, max: 35, passo: 1 }}
            valor={prazoAnos}
            aoAlterar={setPrazoAnos}
          />

          <div className="pt-3 border-t border-slate-200/70 dark:border-zinc-800">
            <CampoNumerico
              rotulo="Amortização Extra Mensal"
              prefixo="R$"
              step="100"
              min="0"
              slider={{ min: 0, max: 5000, passo: 100 }}
              valor={amortizacaoExtraMensal}
              aoAlterar={setAmortizacaoExtraMensal}
              dica="Valor extra pago todo mês direto no saldo devedor (SAC)."
            />
          </div>
        </div>

        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 shadow-xs overflow-hidden">
          <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-sky-500/[0.05] border-b border-slate-200/70 dark:border-zinc-800/80 space-y-6 numeros-tabulares">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {temExtra ? 'Economia com Amortização Extra' : 'Economia SAC sobre Price'}
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                  {formatarMoeda(
                    temExtra
                      ? resultado.economiaAmortizacaoExtra
                      : resultado.economiaSacSobrePrice
                  )}
                </h2>
              </div>

              {temExtra && resultado.mesesEconomizadosExtra > 0 && (
                <span className="inline-flex self-start px-3.5 py-1.5 rounded-full bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  - {formatarPrazoMeses(resultado.mesesEconomizadosExtra)} de dívida
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="rounded-2xl p-4 border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/40">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
                  Tabela SAC
                </span>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatarMoeda(resultado.sac.totalPago)}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  1ª: {formatarMoeda(resultado.sac.primeiraParcela)}
                </p>
                <p className="text-[11px] text-rose-500 font-semibold mt-0.5">
                  Juros: {formatarMoedaCompacta(resultado.sac.totalJuros)}
                </p>
              </div>

              <div className="rounded-2xl p-4 border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/40">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
                  Tabela Price
                </span>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatarMoeda(resultado.price.totalPago)}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Fixa: {formatarMoeda(resultado.price.primeiraParcela)}
                </p>
                <p className="text-[11px] text-rose-500 font-semibold mt-0.5">
                  Juros: {formatarMoedaCompacta(resultado.price.totalJuros)}
                </p>
              </div>

              <div className="rounded-2xl p-4 border border-emerald-500 bg-white dark:bg-zinc-900 shadow-2xs">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
                  SAC + Amort. Extra
                </span>
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatarMoeda(resultado.sacComExtra.totalPago)}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Prazo: {formatarPrazoMeses(resultado.sacComExtra.mesesQuitacao)}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  Juros: {formatarMoedaCompacta(resultado.sacComExtra.totalJuros)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Queda do Saldo Devedor ({formatarMoeda(resultado.valorFinanciado)} financiados)
            </h3>
            <div className="h-76 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={resultado.evolucaoSaldo}
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
                  <Line type="monotone" dataKey="saldoPrice" name="Price" stroke="#0ea5e9" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="saldoSac" name="SAC" stroke="#94a3b8" strokeWidth={2} dot={false} />
                  {temExtra && (
                    <Line
                      type="monotone"
                      dataKey="saldoSacExtra"
                      name="SAC + Extra"
                      stroke="#10b981"
                      strokeWidth={2.6}
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
