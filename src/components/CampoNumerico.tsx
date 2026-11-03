import type { InputHTMLAttributes, ReactNode } from 'react';

interface PropriedadesCampoNumerico
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  rotulo: string;
  valor: string | number;
  aoAlterar: (novoValor: string) => void;
  prefixo?: string;
  sufixo?: ReactNode;
  dica?: string;
}

export function CampoNumerico({
  rotulo,
  valor,
  aoAlterar,
  prefixo,
  sufixo,
  dica,
  className = '',
  ...restante
}: PropriedadesCampoNumerico) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
        {rotulo}
      </label>
      <div className="relative flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
        {prefixo && (
          <span className="pl-3.5 pr-1 text-sm font-semibold text-zinc-400 dark:text-zinc-500 select-none">
            {prefixo}
          </span>
        )}
        <input
          type="number"
          value={valor}
          onChange={(evento) => aoAlterar(evento.target.value)}
          className="w-full bg-transparent py-2.5 px-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none numeros-tabulares"
          {...restante}
        />
        {sufixo && (
          <div className="pr-2.5 pl-1 text-xs font-medium text-zinc-400 dark:text-zinc-500 shrink-0">
            {sufixo}
          </div>
        )}
      </div>
      {dica && (
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{dica}</p>
      )}
    </div>
  );
}

