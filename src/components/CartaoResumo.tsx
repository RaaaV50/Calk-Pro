import type { ReactNode } from 'react';

type VarianteCor = 'esmeralda' | 'azul' | 'ambar' | 'neutro';

interface PropriedadesCartaoResumo {
  titulo: string;
  valor: string;
  subtitulo?: string;
  icone: ReactNode;
  variante?: VarianteCor;
  destaqueValor?: boolean;
}

const estilosIcone: Record<VarianteCor, string> = {
  esmeralda:
    'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  azul: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
  ambar: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  neutro: 'bg-zinc-500/10 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
};

const estilosTextoDestaque: Record<VarianteCor, string> = {
  esmeralda: 'text-emerald-600 dark:text-emerald-400',
  azul: 'text-sky-600 dark:text-sky-400',
  ambar: 'text-amber-600 dark:text-amber-400',
  neutro: 'text-zinc-900 dark:text-zinc-100',
};

export function CartaoResumo({
  titulo,
  valor,
  subtitulo,
  icone,
  variante = 'neutro',
  destaqueValor = false,
}: PropriedadesCartaoResumo) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {titulo}
        </span>
        <div className={`p-2.5 rounded-xl shrink-0 ${estilosIcone[variante]}`}>
          {icone}
        </div>
      </div>

      <div>
        <p
          className={`text-2xl xl:text-3xl font-extrabold tracking-tight numeros-tabulares ${
            destaqueValor
              ? estilosTextoDestaque[variante]
              : 'text-zinc-900 dark:text-zinc-50'
          }`}
        >
          {valor}
        </p>
        {subtitulo && (
          <p className="mt-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {subtitulo}
          </p>
        )}
      </div>
    </div>
  );
}

