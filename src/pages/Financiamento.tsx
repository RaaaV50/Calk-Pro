import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import type { FrequenciaAmortizacaoExtra } from '../types/financas';
import { calcularFinanciamentoCompleto } from '../utils/calculosFinanceiros';
import {
  converterNumero,
  formatarMoeda,
  formatarMoedaCompacta,
  formatarMoedaDestaque,
  formatarPrazoMeses,
} from '../utils/formatadores';

export default function Financiamento() {
  const [parametrosUrl] = useSearchParams();
  const tema = useFinanceStore((estado) => estado.tema);

  const [valorBem, setValorBem] = useState(parametrosUrl.get('bem') ?? '400000');
  const [valorEntrada, setValorEntrada] = useState(
    parametrosUrl.get('entrada') ?? '80000'
  );
  const [taxaJurosAnual, setTaxaJurosAnual] = useState(
    parametrosUrl.get('juros') ?? '10.5'
  );
  const [prazoAnos, setPrazoAnos] = useState(parametrosUrl.get('anos') ?? '25');
  const [frequenciaExtra, setFrequenciaExtra] = useState<FrequenciaAmortizacaoExtra>(
    (parametrosUrl.get('freq') as FrequenciaAmortizacaoExtra) || 'mensal'
  );
  const [amortizacaoExtra, setAmortizacaoExtra] = useState(
    parametrosUrl.get('extra') ?? '500'
  );

  const resultado = useMemo(
    () =>
      calcularFinanciamentoCompleto({
        valorBem: converterNumero(valorBem, 0),
        valorEntrada: converterNumero(valorEntrada, 0),
        taxaJurosAnual: converterNumero(taxaJurosAnual, 0),
        prazoAnos: Math.max(1, converterNumero(prazoAnos, 1)),
        amortizacaoExtra: converterNumero(amortizacaoExtra, 0),
        frequenciaExtra,
      }),
    [
      valorBem,
      valorEntrada,
      taxaJurosAnual,
      prazoAnos,
      amortizacaoExtra,
      frequenciaExtra,
    ]
  );

  const temExtra = converterNumero(amortizacaoExtra, 0) > 0;
  const corGrade = tema === 'escuro' ? '#27272a' : '#f1f5f9';

  const rotuloFrequencia: Record<FrequenciaAmortizacaoExtra, string> = {
    mensal: 'todo mês',
    anual: '1x por ano (ex: 13º ou FGTS)',
    bienal: 'a cada 2 anos (regra FGTS)',
  };

  return (
    <div className="space-y-7">
      <CabecalhoPagina
        categoria="Crédito Imobiliário & Bens"
        titulo="Financiamento & Amortização"
        descricao="Compare Tabela SAC vs Price e simule quanto tempo e juros você economiza com amortizações extras mensais ou de FGTS/anuais nos dois sistemas."
        acoes={
          <BotaoCompartilhar
            parametros={{
              bem: valorBem,
              entrada: valorEntrada,
              juros: taxaJurosAnual,
              anos: prazoAnos,
              freq: frequenciaExtra,
              extra: amortizacaoExtra,
            }}
          />
        }
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

          <div className="pt-3 border-t border-slate-200/70 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="frequencia-amortizacao"
                className="text-[13px] font-semibold text-slate-700 dark:text-zinc-300"
              >
                Periodicidade da Amortização
              </label>
              <select
                id="frequencia-amortizacao"
                value={frequenciaExtra}
                onChange={(e) =>
                  setFrequenciaExtra(e.target.value as FrequenciaAmortizacaoExtra)
                }
                className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200 outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="mensal">Mensal</option>
                <option value="anual">Anual (13º / FGTS)</option>
                <option value="bienal">A cada 2 anos (FGTS)</option>
              </select>
            </div>

            <CampoNumerico
              rotulo={
                frequenciaExtra === 'mensal'
                  ? 'Valor da Amortização Extra Mensal'
                  : frequenciaExtra === 'anual'
                    ? 'Valor da Amortização Extra Anual'
                    : 'Valor do FGTS a cada 2 Anos'
              }
              prefixo="R$"
              step={frequenciaExtra === 'mensal' ? '100' : '1000'}
              min="0"
              slider={
                frequenciaExtra === 'mensal'
                  ? { min: 0, max: 5000, passo: 100 }
                  : { min: 0, max: 50000, passo: 1000 }
              }
              valor={amortizacaoExtra}
              aoAlterar={setAmortizacaoExtra}
              dica={`Abate direto no saldo devedor ${rotuloFrequencia[frequenciaExtra]} tanto na SAC quanto na Price.`}
            />
          </div>
        </div>

        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 shadow-xs overflow-hidden">
          <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-sky-500/[0.05] border-b border-slate-200/70 dark:border-zinc-800/80 space-y-6 numeros-tabulares">
            {temExtra ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-1">
                <div className="min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Economia no SAC + Extra
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                    {formatarMoedaDestaque(resultado.economiaExtraSac)}
                  </h2>
                  {resultado.mesesEconomizadosSac > 0 && (
                    <span className="inline-flex mt-2 px-2.5 py-1 rounded-full bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      - {formatarPrazoMeses(resultado.mesesEconomizadosSac)} de dívida
                    </span>
                  )}
                </div>

                <div className="min-w-0 sm:border-l sm:border-slate-200/70 dark:sm:border-zinc-800 sm:pl-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                    Economia na Price + Extra
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                    {formatarMoedaDestaque(resultado.economiaExtraPrice)}
                  </h2>
                  {resultado.mesesEconomizadosPrice > 0 && (
                    <span className="inline-flex mt-2 px-2.5 py-1 rounded-full bg-sky-500/12 text-sky-700 dark:text-sky-300 text-xs font-bold">
                      - {formatarPrazoMeses(resultado.mesesEconomizadosPrice)} de dívida
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Economia Natural (SAC sobre Price)
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                  {formatarMoedaDestaque(resultado.economiaSacSobrePrice)}
                </h2>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="rounded-2xl p-4 border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/40">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Tabela SAC (Padrão)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatarPrazoMeses(resultado.sac.mesesQuitacao)}
                  </span>
                </div>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatarMoedaDestaque(resultado.sac.totalPago)}
                </p>
                <div className="flex items-center justify-between text-[11px] mt-1.5 pt-1.5 border-t border-slate-100 dark:border-zinc-800/80">
                  <span className="text-slate-500 dark:text-zinc-400">
                    1ª: {formatarMoeda(resultado.sac.primeiraParcela)}
                  </span>
                  <span className="text-rose-500 font-semibold">
                    Juros: {formatarMoedaCompacta(resultado.sac.totalJuros)}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl p-4 border border-emerald-500/80 bg-white dark:bg-zinc-900 shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    SAC + Amort. Extra
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Prazo: {formatarPrazoMeses(resultado.sacComExtra.mesesQuitacao)}
                  </span>
                </div>
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatarMoedaDestaque(resultado.sacComExtra.totalPago)}
                </p>
                <div className="flex items-center justify-between text-[11px] mt-1.5 pt-1.5 border-t border-slate-100 dark:border-zinc-800/80">
                  <span className="text-slate-500 dark:text-zinc-400">
                    1ª: {formatarMoeda(resultado.sacComExtra.primeiraParcela)}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Juros: {formatarMoedaCompacta(resultado.sacComExtra.totalJuros)}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl p-4 border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/40">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Tabela Price (Padrão)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatarPrazoMeses(resultado.price.mesesQuitacao)}
                  </span>
                </div>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatarMoedaDestaque(resultado.price.totalPago)}
                </p>
                <div className="flex items-center justify-between text-[11px] mt-1.5 pt-1.5 border-t border-slate-100 dark:border-zinc-800/80">
                  <span className="text-slate-500 dark:text-zinc-400">
                    Fixa: {formatarMoeda(resultado.price.primeiraParcela)}
                  </span>
                  <span className="text-rose-500 font-semibold">
                    Juros: {formatarMoedaCompacta(resultado.price.totalJuros)}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl p-4 border border-sky-500/80 bg-white dark:bg-zinc-900 shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-sky-700 dark:text-sky-400">
                    Price + Amort. Extra
                  </span>
                  <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                    Prazo: {formatarPrazoMeses(resultado.priceComExtra.mesesQuitacao)}
                  </span>
                </div>
                <p className="text-lg font-extrabold text-sky-600 dark:text-sky-400 mt-1">
                  {formatarMoedaDestaque(resultado.priceComExtra.totalPago)}
                </p>
                <div className="flex items-center justify-between text-[11px] mt-1.5 pt-1.5 border-t border-slate-100 dark:border-zinc-800/80">
                  <span className="text-slate-500 dark:text-zinc-400">
                    1ª: {formatarMoeda(resultado.priceComExtra.primeiraParcela)}
                  </span>
                  <span className="text-sky-600 dark:text-sky-400 font-semibold">
                    Juros: {formatarMoedaCompacta(resultado.priceComExtra.totalJuros)}
                  </span>
                </div>
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
                  <Line
                    type="monotone"
                    dataKey="saldoPrice"
                    name="Price (Padrão)"
                    stroke="#64748b"
                    strokeWidth={1.8}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="saldoSac"
                    name="SAC (Padrão)"
                    stroke="#94a3b8"
                    strokeWidth={1.8}
                    strokeDasharray="2 3"
                    dot={false}
                  />
                  {temExtra && (
                    <Line
                      type="monotone"
                      dataKey="saldoPriceExtra"
                      name="Price + Extra"
                      stroke="#0ea5e9"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  )}
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
