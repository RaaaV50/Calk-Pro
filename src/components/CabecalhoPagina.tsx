import type { ReactNode } from 'react';

interface PropriedadesCabecalhoPagina {
  categoria?: string;
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
}

export function CabecalhoPagina({
  categoria,
  titulo,
  descricao,
  acoes,
}: PropriedadesCabecalhoPagina) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-1">
      <div>
        {categoria && (
          <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
            {categoria}
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {titulo}
        </h1>
        {descricao && (
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            {descricao}
          </p>
        )}
      </div>

      {acoes && <div className="flex items-center gap-2.5 shrink-0">{acoes}</div>}
    </div>
  );
}
