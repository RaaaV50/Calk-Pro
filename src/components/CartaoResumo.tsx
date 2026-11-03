import type { ReactNode } from 'react';

type TomCartao = 'padrao' | 'positivo' | 'azul' | 'ambar';

interface PropriedadesCartaoResumo {
  titulo: string;
  valor: string;
  subtitulo?: string;
  icone?: ReactNode;
  tom?: TomCartao;
}

const estilosIcone: Record<TomCartao, string> = {
  padrao: 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300',
  positivo: 'bg-emerald-500/12 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  azul: 'bg-sky-500/12 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
  ambar: 'bg-amber-500/12 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
};

const estilosValor: Record<TomCartao, string> = {
  padrao: 'text-slate-900 dark:text-zinc-50',
  positivo: 'text-emerald-600 dark:text-emerald-400',
  azul: 'text-sky-600 dark:text-sky-400',
  ambar: 'text-amber-600 dark:text-amber-400',
};

export function CartaoResumo({
  titulo,
  valor,
  subtitulo,
  icone,
  tom = 'padrao',
}: PropriedadesCartaoResumo) {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 p-5 shadow-xs flex flex-col justify-between gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
          {titulo}
        </span>
        {icone && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${estilosIcone[tom]}`}>
            {icone}
          </div>
        )}
      </div>

      <div>
        <p className={`text-2xl font-extrabold tracking-tight numeros-tabulares ${estilosValor[tom]}`}>
          {valor}
        </p>
        {subtitulo && (
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            {subtitulo}
          </p>
        )}
      </div>
    </div>
  );
}
