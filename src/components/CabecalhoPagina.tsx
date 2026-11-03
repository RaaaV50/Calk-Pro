import type { ReactNode } from 'react';

interface PropriedadesCabecalhoPagina {
  titulo: string;
  descricao: string;
  icone?: ReactNode;
  acoes?: ReactNode;
}

export function CabecalhoPagina({
  titulo,
  descricao,
  icone,
  acoes,
}: PropriedadesCabecalhoPagina) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
      <div className="flex items-start gap-3.5">
        {icone && (
          <div className="mt-0.5 p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            {icone}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {titulo}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {descricao}
          </p>
        </div>
      </div>

      {acoes && <div className="flex items-center gap-2 shrink-0">{acoes}</div>}
    </div>
  );
}

