import { useMemo, useState } from 'react';
import { Clock, Compass, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';
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
import { CabecalhoPagina } from '../components/CabecalhoPagina';
import { CampoNumerico } from '../components/CampoNumerico';
import { CartaoResumo } from '../components/CartaoResumo';
import { useFinanceStore } from '../store/useFinanceStore';
import { calcularIndependenciaFinanceira } from '../utils/calculosFinanceiros';
import {
  converterNumero,
  formatarMoeda,
  formatarMoedaCompacta,
  formatarPercentual,
  formatarPrazoMeses,
} from '../utils/formatadores';

export default function IndependenciaFinanceira() {
  const taxasReferencia = useFinanceStore((estado) => estado.taxasReferencia);
  const tema = useFinanceStore((estado) => estado.tema);

  const [rendaMensalDesejada, setRendaMensalDesejada] = useState('6000');
  const [patrimonioAtual, setPatrimonioAtual] = useState('25000');
  const [aporteMensal, setAporteMensal] = useState('1500');
  const [rentabilidadeAnual, setRentabilidadeAnual] = useState('11.5');
  const [inflacaoAnual, setInflacaoAnual] = useState(String(taxasReferencia.ipcaAnual));

  const resultado = useMemo(
    () =>
      calcularIndependenciaFinanceira({
        rendaMensalDesejada: converterNumero(rendaMensalDesejada, 0),
        patrimonioAtual: converterNumero(patrimonioAtual, 0),
        aporteMensal: converterNumero(aporteMensal, 0),
        rentabilidadeAnual: converterNumero(rentabilidadeAnual, 0),
        inflacaoAnual: converterNumero(inflacaoAnual, 0),
      }),
    [rendaMensalDesejada, patrimonioAtual, aporteMensal, rentabilidadeAnual, inflacaoAnual]
  );

  const percentualConcluido =
    resultado.patrimonioNecessario > 0
      ? Math.min(
          100,
          (converterNumero(patrimonioAtual, 0) / resultado.patrimonioNecessario) * 100
        )
      : 0;

  const corGrade = tema === 'escuro' ? '#27272a' : '#e4e4e7';

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Viver de Renda (Independência Financeira)"
        descricao="Descubra o capital necessário para gerar sua renda mensal perpétua preservando o poder de compra."
        icone={<Compass size={22} />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <CartaoResumo
          titulo="Patrimônio Alvo (Preços de Hoje)"
          valor={formatarMoeda(resultado.patrimonioNecessario)}
          subtitulo={`Para retirar ${formatarMoeda(resultado.rendaMensalDesejada)}/mês sem consumir o principal`}
          icone={<Wallet size={20} />}
          variante="esmeralda"
          destaqueValor
        />

        <CartaoResumo
          titulo="Tempo Estimado até a Meta"
          valor={
            resultado.mesesParaAtingir !== null
              ? formatarPrazoMeses(resultado.mesesParaAtingir)
              : '+ de 50 anos'
          }
          subtitulo={
            resultado.mesesParaAtingir !== null
              ? `Total desembolsado: ${formatarMoeda(resultado.totalAportadoAteMeta)}`
              : 'Aumente o aporte ou a rentabilidade líquida'
          }
          icone={<Clock size={20} />}
          variante="azul"
        />

        <CartaoResumo
          titulo="Taxa Real de Retirada Segura"
          valor={`${formatarPercentual(resultado.taxaRealAnual)} a.a.`}
          subtitulo={`Equivalente a ${formatarPercentual(resultado.taxaRealMensal)} ao mês acima da inflação`}
          icone={<ShieldCheck size={20} />}
          variante="ambar"
        />

        <CartaoResumo
          titulo="Progresso Atual"
          valor={formatarPercentual(percentualConcluido)}
          subtitulo={`Você já possui ${formatarMoeda(converterNumero(patrimonioAtual, 0))}`}
          icone={<TrendingUp size={20} />}
          variante="neutro"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
          <CampoNumerico
            rotulo="Renda Passiva Mensal Desejada"
            prefixo="R$"
            step="500"
            min="0"
            valor={rendaMensalDesejada}
            aoAlterar={setRendaMensalDesejada}
            dica="Quanto você quer receber todos os meses em valores de hoje."
          />

          <CampoNumerico
            rotulo="Patrimônio Já Investido"
            prefixo="R$"
            step="1000"
            min="0"
            valor={patrimonioAtual}
            aoAlterar={setPatrimonioAtual}
          />

          <CampoNumerico
            rotulo="Aporte Mensal"
            prefixo="R$"
            step="100"
            min="0"
            valor={aporteMensal}
            aoAlterar={setAporteMensal}
          />

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80">
            <CampoNumerico
              rotulo="Carteira Líquida"
              sufixo="% a.a."
              step="0.1"
              min="0"
              valor={rentabilidadeAnual}
              aoAlterar={setRentabilidadeAnual}
            />

            <CampoNumerico
              rotulo="Inflação (IPCA)"
              sufixo="% a.a."
              step="0.1"
              min="0"
              valor={inflacaoAnual}
              aoAlterar={setInflacaoAnual}
            />
          </div>

          <div className="pt-2">
            <div className="flex justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
              <span>Caminho percorrido hoje</span>
              <span className="numeros-tabulares">{formatarPercentual(percentualConcluido)}</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                style={{ width: `${percentualConcluido}%` }}
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 shadow-xs">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Trajetória em Poder de Compra Real até a Liberdade Financeira
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              A linha tracejada indica o patrimônio alvo capaz de sustentar sua renda perpétua.
            </p>
          </div>

          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={resultado.evolucao}
                margin={{ top: 14, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={corGrade} />
                <XAxis dataKey="rotulo" stroke="#71717a" axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v: number) => formatarMoedaCompacta(v)}
                  stroke="#71717a"
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
                  fill="#10b981"
                  fillOpacity={0.16}
                />
                <Area
                  type="monotone"
                  dataKey="investido"
                  name="Total Aportado"
                  stroke="#71717a"
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
  );
}

