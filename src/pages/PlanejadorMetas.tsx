import { useMemo, useState } from 'react';
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
import type { TipoTributacao } from '../types/financas';
import { calcularMetaReversa } from '../utils/calculosFinanceiros';
import {
  converterNumero,
  formatarMoeda,
  formatarMoedaCompacta,
} from '../utils/formatadores';

type ModoObjetivo = 'metaLivre' | 'reservaEmergencia';

export default function PlanejadorMetas() {
  const taxasMercado = useFinanceStore((estado) => estado.taxasMercado);
  const tema = useFinanceStore((estado) => estado.tema);

  const [modo, setModo] = useState<ModoObjetivo>('metaLivre');
  const [valorMeta, setValorMeta] = useState('100000');
  const [custoMensalVida, setCustoMensalVida] = useState('4500');
  const [mesesSeguranca, setMesesSeguranca] = useState('6');

  const [capitalInicial, setCapitalInicial] = useState('5000');
  const [prazoMeses, setPrazoMeses] = useState('36');
  const [percentualCdi, setPercentualCdi] = useState('100');
  const [corrigirPelaInflacao, setCorrigirPelaInflacao] = useState(true);
  const [tributacao, setTributacao] = useState<TipoTributacao>('regressivo');

  const valorAlvo =
    modo === 'reservaEmergencia'
      ? converterNumero(custoMensalVida, 0) * Math.max(1, converterNumero(mesesSeguranca, 6))
      : converterNumero(valorMeta, 0);

  const taxaAnualBruta =
    taxasMercado.cdiAnual * (converterNumero(percentualCdi, 100) / 100);

  const resultado = useMemo(
    () =>
      calcularMetaReversa({
        valorMetaDesejada: valorAlvo,
        capitalInicial: converterNumero(capitalInicial, 0),
        prazoMeses: Math.max(1, converterNumero(prazoMeses, 12)),
        taxaAnualBruta,
        inflacaoAnual: taxasMercado.ipcaAnual,
        corrigirPelaInflacao: modo === 'metaLivre' ? corrigirPelaInflacao : false,
        tributacao,
        cdiReferencia: taxasMercado.cdiAnual,
      }),
    [
      valorAlvo,
      capitalInicial,
      prazoMeses,
      taxaAnualBruta,
      taxasMercado.ipcaAnual,
      modo,
      corrigirPelaInflacao,
      tributacao,
      taxasMercado.cdiAnual,
    ]
  );

  const corGrade = tema === 'escuro' ? '#27272a' : '#f1f5f9';

  return (
    <div className="space-y-7">
      <CabecalhoPagina
        categoria="Cálculo Reverso"
        titulo="Planejador de Metas & Reserva"
        descricao="Defina quanto quer alcançar e descubra o aporte mensal exato para chegar lá no prazo escolhido."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-24 rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setModo('metaLivre')}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                modo === 'metaLivre'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400'
              }`}
            >
              Objetivo Financeiro
            </button>
            <button
              type="button"
              onClick={() => setModo('reservaEmergencia')}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                modo === 'reservaEmergencia'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400'
              }`}
            >
              Reserva de Emergência
            </button>
          </div>

          {modo === 'metaLivre' ? (
            <div className="space-y-3">
              <CampoNumerico
                rotulo="Valor do Objetivo (Preços de Hoje)"
                prefixo="R$"
                step="5000"
                min="0"
                valor={valorMeta}
                aoAlterar={setValorMeta}
              />
              <label className="flex items-center justify-between gap-3 cursor-pointer py-1">
                <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                  Corrigir valor da meta pela inflação (IPCA)
                </span>
                <input
                  type="checkbox"
                  checked={corrigirPelaInflacao}
                  onChange={(e) => setCorrigirPelaInflacao(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <CampoNumerico
                rotulo="Seu Custo Mensal Essencial"
                prefixo="R$"
                step="500"
                min="0"
                valor={custoMensalVida}
                aoAlterar={setCustoMensalVida}
              />

              <div>
                <CampoNumerico
                  rotulo="Meses de Segurança"
                  sufixo="Meses"
                  step="1"
                  min="1"
                  max="24"
                  valor={mesesSeguranca}
                  aoAlterar={setMesesSeguranca}
                />
                <div className="grid grid-cols-3 gap-2 mt-2.5">
                  {[
                    ['6', 'CLT · 6m'],
                    ['9', 'Autônomo · 9m'],
                    ['12', 'Empresa · 12m'],
                  ].map(([m, rotulo]) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMesesSeguranca(m)}
                      className={`py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                        mesesSeguranca === m
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400'
                      }`}
                    >
                      {rotulo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200/70 dark:border-zinc-800 space-y-4">
            <CampoNumerico
              rotulo="Capital Já Disponível"
              prefixo="R$"
              step="500"
              min="0"
              valor={capitalInicial}
              aoAlterar={setCapitalInicial}
            />

            <CampoNumerico
              rotulo="Prazo para Conquistar"
              sufixo="Meses"
              step="1"
              min="1"
              max="180"
              slider={{ min: 3, max: 120, passo: 1 }}
              valor={prazoMeses}
              aoAlterar={setPrazoMeses}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CampoNumerico
                rotulo="Rentabilidade"
                sufixo="% CDI"
                step="1"
                min="0"
                valor={percentualCdi}
                aoAlterar={setPercentualCdi}
              />

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Tributação
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800">
                  {(
                    [
                      ['regressivo', 'Com IR'],
                      ['isento', 'Isento'],
                    ] as const
                  ).map(([chave, rotulo]) => (
                    <button
                      key={chave}
                      type="button"
                      onClick={() => setTributacao(chave)}
                      className={`py-2 rounded-lg text-xs font-bold cursor-pointer ${
                        tributacao === chave
                          ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-500'
                      }`}
                    >
                      {rotulo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 shadow-xs overflow-hidden">
          <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-sky-500/[0.05] border-b border-slate-200/70 dark:border-zinc-800/80 space-y-6 numeros-tabulares">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Aporte Mensal Necessário
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                {formatarMoeda(resultado.aporteMensalNecessario)}
                <span className="text-lg font-semibold text-slate-400 dark:text-zinc-500">
                  /mês
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200/60 dark:border-zinc-800/80">
              <div>
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">
                  Meta Líquida Final
                </span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatarMoeda(resultado.valorMetaNominal)}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">
                  Total Desembolsado
                </span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatarMoeda(resultado.totalAportado)}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">
                  Juros a Seu Favor
                </span>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  + {formatarMoeda(resultado.rendimentoLiquido)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Evolução até Conquistar a Meta
            </h3>
            <div className="h-80 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={resultado.evolucao}
                  margin={{ top: 10, right: 10, left: 4, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradMeta" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="saldoLiquido"
                    name="Saldo Acumulado"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#gradMeta)"
                  />
                  <Area
                    type="monotone"
                    dataKey="investido"
                    name="Total Aportado"
                    stroke="#94a3b8"
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
    </div>
  );
}
