import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Share2 } from 'lucide-react';

interface PropriedadesBotaoCompartilhar {
  parametros: Record<string, string | number | boolean | undefined | null>;
  rotulo?: string;
}

export function BotaoCompartilhar({
  parametros,
  rotulo = 'Compartilhar Link',
}: PropriedadesBotaoCompartilhar) {
  const [, setParametrosUrl] = useSearchParams();
  const [copiado, setCopiado] = useState(false);

  const copiarLinkSimulacao = async () => {
    const query = new URLSearchParams();
    for (const [chave, valor] of Object.entries(parametros)) {
      if (valor !== undefined && valor !== null && String(valor) !== '') {
        query.set(chave, String(valor));
      }
    }

    setParametrosUrl(query, { replace: true });
    const urlCompleta = `${window.location.origin}${window.location.pathname}?${query.toString()}`;

    try {
      await navigator.clipboard.writeText(urlCompleta);
    } catch {
      // Caso a área de transferência esteja restrita, a URL da barra já foi atualizada
    }

    setCopiado(true);
    window.setTimeout(() => {
      setCopiado(false);
    }, 2400);
  };

  return (
    <button
      type="button"
      onClick={() => void copiarLinkSimulacao()}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
        copiado
          ? 'border-emerald-500/40 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
          : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200'
      }`}
    >
      {copiado ? <Check size={14} /> : <Share2 size={14} />}
      <span>{copiado ? 'Link copiado!' : rotulo}</span>
    </button>
  );
}

