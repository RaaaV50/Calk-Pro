import type { InputHTMLAttributes, ReactNode } from 'react';

interface ConfiguracaoSlider {
  min: number;
  max: number;
  passo?: number;
}

interface PropriedadesCampoNumerico
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  rotulo: string;
  valor: string | number;
  aoAlterar: (novoValor: string) => void;
  prefixo?: string;
  sufixo?: ReactNode;
  dica?: string;
  slider?: ConfiguracaoSlider;
}

export function CampoNumerico({
  rotulo,
  valor,
  aoAlterar,
  prefixo,
  sufixo,
  dica,
  slider,
  className = '',
  ...restante
}: PropriedadesCampoNumerico) {
  return (
    <div className={className}>
      <label className="block text-[13px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
        {rotulo}
      </label>

      <div className="flex items-center rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/70 hover:border-slate-300 dark:hover:border-zinc-700 focus-within:bg-white dark:focus-within:bg-zinc-950 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 focus-within:ring-3 focus-within:ring-emerald-500/15 transition-all">
        {prefixo && (
          <span className="pl-3.5 pr-1 text-sm font-semibold text-slate-400 dark:text-zinc-500 select-none">
            {prefixo}
          </span>
        )}
        <input
          type="number"
          value={valor}
          onChange={(evento) => aoAlterar(evento.target.value)}
          className="w-full min-w-0 bg-transparent py-2.5 px-3 text-sm font-bold text-slate-900 dark:text-zinc-50 placeholder:text-slate-400 outline-none numeros-tabulares"
          {...restante}
        />
        {sufixo && (
          <div className="pr-2.5 pl-1 text-xs font-semibold text-slate-500 dark:text-zinc-400 shrink-0">
            {sufixo}
          </div>
        )}
      </div>

      {slider && (
        <input
          type="range"
          min={slider.min}
          max={slider.max}
          step={slider.passo ?? 1}
          value={Math.min(slider.max, Math.max(slider.min, Number(valor) || slider.min))}
          onChange={(evento) => aoAlterar(evento.target.value)}
          className="mt-2.5 block"
        />
      )}

      {dica && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
          {dica}
        </p>
      )}
    </div>
  );
}
