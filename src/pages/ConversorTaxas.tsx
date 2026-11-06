import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Info } from 'lucide-react';
import { BotaoCompartilhar } from '../components/BotaoCompartilhar';
import { CabecalhoPagina } from '../components/CabecalhoPagina';
import { CampoNumerico } from '../components/CampoNumerico';
import { useFinanceStore } from '../store/useFinanceStore';
import { converterTaxasEquivalentes } from '../utils/calculosFinanceiros';
import {
  converterNumero,
  formatarPercentual,
  formatarPercentualPreciso,
} from '../utils/formatadores';

type PeriodoOrigem = 'anual' | 'mensal';

export default function ConversorTaxas() {
  const [parametrosUrl] = useSearchParams();
  const taxasMercado = useFinanceStore((estado) => estado.taxasMercado);

  const origemUrl = parametrosUrl.get('origem');
  const origemInicial: PeriodoOrigem = origemUrl === 'mensal' ? 'mensal' : 'anual';

  const [taxa, setTaxa] = useState(
    parametrosUrl.get('taxa') ?? String(taxasMercado.cdiAnual)
  );
  const [origem, setOrigem] = useState<PeriodoOrigem>(origemInicial);
  const [inflacao, setInflacao] = useState(
    parametrosUrl.get('inflacao') ?? String(taxasMercado.ipcaAnual)
  );

  const conversao = useMemo(
    () =>
      converterTaxasEquivalentes({
        taxaInformada: converterNumero(taxa, 0),
        periodoOrigem: origem,
        inflacaoAnual: converterNumero(inflacao, 0),
      }),
    [taxa, origem, inflacao]
  );

  const alternarPeriodoOrigem = (novoPeriodo: PeriodoOrigem) => {
    if (novoPeriodo === origem) return;
    if (novoPeriodo === 'mensal') {
      setTaxa(Number(conversao.mensal.toFixed(4)).toString());
    } else {
      setTaxa(Number(conversao.anual.toFixed(2)).toString());
    }
    setOrigem(novoPeriodo);
  };

  return (
    <div className="space-y-7">
      <CabecalhoPagina
        categoria="Utilitário Rápido"
        titulo="Conversor de Taxas & Juros Reais"
        descricao="Converta taxas equivalentes compostas entre mês e ano e calcule o retorno real descontando a inflação e o IR."
        acoes={
          <BotaoCompartilhar
            parametros={{
              taxa,
              origem,
              inflacao,
            }}
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-24 rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 p-6 sm:p-7 shadow-xs space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 dark:text-zinc-300 mb-2">
              Período da Taxa de Origem
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800">
              {(
                [
                  ['anual', 'Anual (% a.a.)'],
                  ['mensal', 'Mensal (% a.m.)'],
                ] as const
              ).map(([chave, rotulo]) => (
                <button
                  key={chave}
                  type="button"
                  onClick={() => alternarPeriodoOrigem(chave)}
                  className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    origem === chave
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {rotulo}
                </button>
              ))}
            </div>
          </div>

          <CampoNumerico
            rotulo="Taxa Nominal Informada"
            sufixo={origem === 'anual' ? '% a.a.' : '% a.m.'}
            step={origem === 'anual' ? '0.1' : '0.05'}
            valor={taxa}
            aoAlterar={setTaxa}
          />

          {conversao.foiLimitada && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/25 px-3 py-2 text-[11px] text-amber-800 dark:text-amber-300">
              <Info size={14} className="shrink-0 mt-0.5" />
              <span>
                Para manter a simulação dentro de parâmetros reais, a taxa foi limitada a{' '}
                <strong>{origem === 'mensal' ? '30% a.m.' : '1.000% a.a.'}</strong>.
              </span>
            </div>
          )}

          <CampoNumerico
            rotulo="Inflação Anual (Equação de Fisher)"
            sufixo="% a.a."
            step="0.1"
            valor={inflacao}
            aoAlterar={setInflacao}
          />

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setOrigem('anual');
                setTaxa(String(taxasMercado.cdiAnual));
              }}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
            >
              Usar CDI ({formatarPercentual(taxasMercado.cdiAnual)})
            </button>
            <button
              type="button"
              onClick={() => {
                setOrigem('anual');
                setTaxa(String(taxasMercado.selicAnual));
              }}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
            >
              Usar Selic ({formatarPercentual(taxasMercado.selicAnual)})
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 shadow-xs overflow-hidden numeros-tabulares">
          <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-sky-500/[0.05] border-b border-slate-200/70 dark:border-zinc-800/80 space-y-6">
            <div className="min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Rentabilidade Real Acima da Inflação
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1 break-words">
                {formatarPercentual(conversao.realAnual)}{' '}
                <span className="text-lg font-semibold text-slate-400">a.a.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200/60 dark:border-zinc-800/80">
              <div className="min-w-0">
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">
                  Equivalente Anual
                </span>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                  {formatarPercentual(conversao.anual)} a.a.
                </p>
              </div>
              <div className="min-w-0">
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">
                  Equivalente Mensal
                </span>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                  {formatarPercentualPreciso(conversao.mensal)} a.m.
                </p>
              </div>
              <div className="min-w-0">
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">
                  IPCA Considerado
                </span>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5 truncate">
                  {formatarPercentual(converterNumero(inflacao, 0))} a.a.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Equivalência Tributária por Prazo (Tabela Regressiva IR)
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200/70 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Prazo de Aplicação</th>
                    <th className="py-3 px-4 font-semibold">Taxa Líquida (Descontando IR)</th>
                    <th className="py-3 px-4 font-semibold text-right">
                      Bruta Necessária p/ Empatar Isento
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70">
                  {conversao.equivalenciaLiquidaPorPrazo.map((item) => (
                    <tr key={item.prazo}>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-zinc-300">
                        {item.prazo}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {formatarPercentual(item.liquida)} a.a.
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                        {formatarPercentual(item.brutaNecessariaParaEmpatarIsento)} a.a.
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
