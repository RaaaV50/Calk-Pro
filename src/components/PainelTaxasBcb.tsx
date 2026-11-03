import { useState } from 'react';
import { ChevronDown, RefreshCw, X } from 'lucide-react';
import { useSincronizarBcb } from '../hooks/useSincronizarBcb';
import { useFinanceStore } from '../store/useFinanceStore';
import { converterNumero, formatarPercentual } from '../utils/formatadores';
import { CampoNumerico } from './CampoNumerico';

export function PainelTaxasBcb() {
  const { taxasMercado, sincronizandoBcb, erroBcb, forcarSincronizacao } =
    useSincronizarBcb();
  const atualizarTaxasManuais = useFinanceStore(
    (estado) => estado.atualizarTaxasManuais
  );
  const ativarModoAutomaticoBcb = useFinanceStore(
    (estado) => estado.ativarModoAutomaticoBcb
  );

  const [aberto, setAberto] = useState(false);
  const [cdiEditado, setCdiEditado] = useState(String(taxasMercado.cdiAnual));
  const [selicEditada, setSelicEditada] = useState(String(taxasMercado.selicAnual));
  const [ipcaEditado, setIpcaEditado] = useState(String(taxasMercado.ipcaAnual));

  const alternarPainel = () => {
    setCdiEditado(String(taxasMercado.cdiAnual));
    setSelicEditada(String(taxasMercado.selicAnual));
    setIpcaEditado(String(taxasMercado.ipcaAnual));
    setAberto((atual) => !atual);
  };

  const salvarEdicaoManual = () => {
    const novaSelic = converterNumero(selicEditada, taxasMercado.selicAnual);
    const poupancaCalculada =
      novaSelic > 8.5
        ? 0.58
        : Number(((Math.pow(1 + (novaSelic * 0.7) / 100, 1 / 12) - 1) * 100).toFixed(2));

    atualizarTaxasManuais({
      cdiAnual: converterNumero(cdiEditado, taxasMercado.cdiAnual),
      selicAnual: novaSelic,
      ipcaAnual: converterNumero(ipcaEditado, taxasMercado.ipcaAnual),
      poupancaMensal: poupancaCalculada,
    });
    setAberto(false);
  };

  const restaurarAutomatico = async () => {
    await ativarModoAutomaticoBcb();
    setAberto(false);
  };

  return (
    <div className="relative">
      <div className="inline-flex items-center gap-1 rounded-full border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-3 pr-2 py-1.5 shadow-2xs text-xs numeros-tabulares">
        <button
          type="button"
          onClick={alternarPainel}
          className="flex items-center gap-2 text-slate-600 dark:text-zinc-300 cursor-pointer"
        >
          <span className="relative flex h-2 w-2">
            {taxasMercado.modoAutomaticoBcb && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                taxasMercado.modoAutomaticoBcb ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span>
            CDI{' '}
            <strong className="font-bold text-slate-900 dark:text-white">
              {formatarPercentual(taxasMercado.cdiAnual)}
            </strong>
          </span>
          <span className="hidden xl:inline text-slate-300 dark:text-zinc-700">·</span>
          <span className="hidden xl:inline">
            IPCA{' '}
            <strong className="font-bold text-slate-900 dark:text-white">
              {formatarPercentual(taxasMercado.ipcaAnual)}
            </strong>
          </span>
          <ChevronDown size={13} className="text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => void forcarSincronizacao()}
          disabled={sincronizandoBcb}
          title="Sincronizar agora com o Banco Central"
          className="p-1 rounded-full text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer disabled:opacity-40"
        >
          <RefreshCw size={12} className={sincronizandoBcb ? 'animate-spin' : ''} />
        </button>
      </div>

      {aberto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} />
          <div className="absolute right-0 mt-2.5 w-80 sm:w-88 z-50 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Taxas de Referência
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      taxasMercado.modoAutomaticoBcb
                        ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {taxasMercado.modoAutomaticoBcb ? 'API BCB' : 'Manual'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  {taxasMercado.modoAutomaticoBcb
                    ? `Banco Central do Brasil${taxasMercado.dataReferenciaBcb ? ` (${taxasMercado.dataReferenciaBcb})` : ''}`
                    : 'Valores customizados para suas simulações'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {erroBcb && <p className="text-xs text-rose-500">{erroBcb}</p>}

            <div className="grid grid-cols-3 gap-2.5">
              <CampoNumerico
                rotulo="CDI"
                sufixo="%"
                step="0.05"
                valor={cdiEditado}
                aoAlterar={setCdiEditado}
              />
              <CampoNumerico
                rotulo="Selic"
                sufixo="%"
                step="0.05"
                valor={selicEditada}
                aoAlterar={setSelicEditada}
              />
              <CampoNumerico
                rotulo="IPCA"
                sufixo="%"
                step="0.1"
                valor={ipcaEditado}
                aoAlterar={setIpcaEditado}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={salvarEdicaoManual}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Aplicar Taxas
              </button>

              <button
                type="button"
                onClick={() => void restaurarAutomatico()}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                Usar BCB
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
