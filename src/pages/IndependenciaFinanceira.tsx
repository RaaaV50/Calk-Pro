import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BotaoCompartilhar } from '../components/BotaoCompartilhar';
import { CabecalhoPagina } from '../components/CabecalhoPagina';
import { CampoNumerico } from '../components/CampoNumerico';
import { useFinanceStore } from '../store/useFinanceStore';
import type { ModoUsufruto } from '../types/financas';
import { calcularIndependenciaFinanceira } from '../utils/calculosFinanceiros';
import {
  converterNumero,
  formatarMoeda,
  formatarMoedaCompacta,
  formatarPercentual,
  formatarPrazoMeses,
} from '../utils/formatadores';

export default function IndependenciaFinanceira() {
  const [parametrosUrl] = useSearchParams();
  const taxasMercado = useFinanceStore((estado) => estado.taxasMercado);
  const tema = useFinanceStore((estado) => estado.tema);

  const [rendaMensalDesejada, setRendaMensalDesejada] = useState(
    parametrosUrl.get('renda') ?? '6000'
  );
  const [patrimonioAtual, setPatrimonioAtual] = useState(
    parametrosUrl.get('atual') ?? '30000'
  );
  const [aporteMensal, setAporteMensal] = useState(
    parametrosUrl.get('aporte') ?? '1500'
  );
  const [rentabilidadeLiquidaAnual, setRentabilidadeLiquidaAnual] = useState(
    parametrosUrl.get('rent') ?? '11.5'
  );
  const [modoUsufruto, setModoUsufruto] = useState<ModoUsufruto>(
    (parametrosUrl.get('modo') as ModoUsufruto) || 'perpetuo'
  );
  const [anosUsufruto, setAnosUsufruto] = useState(
    parametrosUrl.get('anosUso') ?? '30'
  );
  const [taxaRetiradaFixaAnual, setTaxaRetiradaFixaAnual] = useState(
    parametrosUrl.get('taxaRet') ?? '4'
  );
  const [idadeAtual, setIdadeAtual] = useState(
    parametrosUrl.get('idade') ?? '28'
  );
  const [idadeAlvo, setIdadeAlvo] = useState(parametrosUrl.get('alvo') ?? '55');

  const resultado = useMemo(
    () =>
      calcularIndependenciaFinanceira({
        rendaMensalDesejada: converterNumero(rendaMensalDesejada, 0),
        patrimonioAtual: converterNumero(patrimonioAtual, 0),
        aporteMensal: converterNumero(aporteMensal, 0),
        rentabilidadeLiquidaAnual: converterNumero(rentabilidadeLiquidaAnual, 0),
        inflacaoAnual: taxasMercado.ipcaAnual,
        modoUsufruto,
        anosUsufruto: converterNumero(anosUsufruto, 30),
        taxaRetiradaFixaAnual: converterNumero(taxaRetiradaFixaAnual, 4),
        idadeAtual: converterNumero(idadeAtual, 0),
        idadeAlvo: converterNumero(idadeAlvo, 0),
      }),
    [
      rendaMensalDesejada,
      patrimonioAtual,
      aporteMensal,
      rentabilidadeLiquidaAnual,
      taxasMercado.ipcaAnual,
      modoUsufruto,
      anosUsufruto,
      taxaRetiradaFixaAnual,
      idadeAtual,
      idadeAlvo,
    ]
  );

  const corGrade = tema === 'escuro' ? '#27272a' : '#f1f5f9';

  return (
    <div className="space-y-7">
      <CabecalhoPagina
        categoria="Liberdade Financeira"
        titulo="Viver de Renda"
        descricao="Planeje o capital necessário para sua renda mensal em poder de compra real, já descontando o IPCA."
        acoes={
          <BotaoCompartilhar
            parametros={{
              modo: modoUsufruto,
              renda: rendaMensalDesejada,
              atual: patrimonioAtual,
              aporte: aporteMensal,
              rent: rentabilidadeLiquidaAnual,
              anosUso: modoUsufruto === 'consumirCapital' ? anosUsufruto : undefined,
              taxaRet: modoUsufruto === 'taxaFixa' ? taxaRetiradaFixaAnual : undefined,
              idade: idadeAtual,
              alvo: idadeAlvo,
            }}
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-24 rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 p-6 sm:p-7 shadow-xs space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 dark:text-zinc-300 mb-2">
              Regra de Aposentadoria
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800">
              {(
                [
                  ['perpetuo', 'Perpétua'],
                  ['consumirCapital', 'Por Prazo'],
                  ['taxaFixa', 'Regra %'],
                ] as const
              ).map(([chave, rotulo]) => (
                <button
                  key={chave}
                  type="button"
                  onClick={() => setModoUsufruto(chave)}
                  className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    modoUsufruto === chave
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  {rotulo}
                </button>
              ))}
            </div>
          </div>

          {modoUsufruto === 'consumirCapital' && (
            <CampoNumerico
              rotulo="Duração da Aposentadoria"
              sufixo="Anos"
              step="1"
              min="5"
              max="60"
              slider={{ min: 10, max: 50, passo: 1 }}
              valor={anosUsufruto}
              aoAlterar={setAnosUsufruto}
            />
          )}

          {modoUsufruto === 'taxaFixa' && (
            <CampoNumerico
              rotulo="Taxa Anual de Retirada Segura"
              sufixo="% a.a."
              step="0.25"
              min="1"
              max="12"
              slider={{ min: 2, max: 8, passo: 0.25 }}
              valor={taxaRetiradaFixaAnual}
              aoAlterar={setTaxaRetiradaFixaAnual}
            />
          )}

          <CampoNumerico
            rotulo="Renda Passiva Mensal Desejada"
            prefixo="R$"
            step="500"
            min="0"
            slider={{ min: 1000, max: 30000, passo: 500 }}
            valor={rendaMensalDesejada}
            aoAlterar={setRendaMensalDesejada}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CampoNumerico
              rotulo="Patrimônio Atual"
              prefixo="R$"
              step="1000"
              min="0"
              valor={patrimonioAtual}
              aoAlterar={setPatrimonioAtual}
            />
            <CampoNumerico
              rotulo="Aporte Mensal Atual"
              prefixo="R$"
              step="100"
              min="0"
              valor={aporteMensal}
              aoAlterar={setAporteMensal}
            />
          </div>

          <CampoNumerico
            rotulo="Rentabilidade Líquida da Carteira"
            sufixo="% a.a."
            step="0.2"
            min="0"
            valor={rentabilidadeLiquidaAnual}
            aoAlterar={setRentabilidadeLiquidaAnual}
          />

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/70 dark:border-zinc-800">
            <CampoNumerico
              rotulo="Sua Idade Hoje"
              sufixo="Anos"
              step="1"
              min="0"
              max="100"
              valor={idadeAtual}
              aoAlterar={setIdadeAtual}
            />
            <CampoNumerico
              rotulo="Idade Alvo"
              sufixo="Anos"
              step="1"
              min="1"
              max="110"
              valor={idadeAlvo}
              aoAlterar={setIdadeAlvo}
            />
          </div>
        </div>

        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 shadow-xs overflow-hidden">
          <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-amber-500/[0.05] border-b border-slate-200/70 dark:border-zinc-800/80 space-y-6 numeros-tabulares">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Patrimônio Necessário (Preços de Hoje)
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                {formatarMoeda(resultado.patrimonioNecessario)}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200/60 dark:border-zinc-800/80">
              <div>
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">
                  Prazo no Aporte Atual
                </span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {resultado.mesesParaMeta !== null
                    ? `${formatarPrazoMeses(resultado.mesesParaMeta)}${resultado.idadeNaMeta ? ` (${resultado.idadeNaMeta}a)` : ''}`
                    : '+ de 50 anos'}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">
                  Aporte p/ Aposentar aos {idadeAlvo}a
                </span>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {resultado.aporteNecessarioIdadeAlvo !== null
                    ? `${formatarMoeda(resultado.aporteNecessarioIdadeAlvo)}/mês`
                    : '—'}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">
                  Juro Real da Carteira
                </span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatarPercentual(resultado.taxaRealAnual)} a.a.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Crescimento em Poder Real vs Linha da Independência
            </h3>
            <div className="h-80 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={resultado.evolucao}
                  margin={{ top: 14, right: 10, left: 4, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradIndep" x1="0" y1="0" x2="0" y2="1">
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
                  <ReferenceLine
                    y={resultado.patrimonioNecessario}
                    stroke="#f59e0b"
                    strokeDasharray="6 4"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="patrimonioReal"
                    name="Patrimônio Real"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#gradIndep)"
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
