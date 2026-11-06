import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface EventoInstalacaoPwa extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PropriedadesBotaoInstalar {
  expandido?: boolean;
}

export function BotaoInstalarApp({ expandido = false }: PropriedadesBotaoInstalar) {
  const [eventoInstalacao, setEventoInstalacao] = useState<EventoInstalacaoPwa | null>(
    null
  );

  useEffect(() => {
    const emModoStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (emModoStandalone) return;

    const capturarPrompt = (evento: Event) => {
      evento.preventDefault();
      setEventoInstalacao(evento as EventoInstalacaoPwa);
    };

    const limparAposInstalar = () => {
      setEventoInstalacao(null);
    };

    window.addEventListener('beforeinstallprompt', capturarPrompt);
    window.addEventListener('appinstalled', limparAposInstalar);

    return () => {
      window.removeEventListener('beforeinstallprompt', capturarPrompt);
      window.removeEventListener('appinstalled', limparAposInstalar);
    };
  }, []);

  if (!eventoInstalacao) return null;

  const instalarAplicativo = async () => {
    await eventoInstalacao.prompt();
    const escolha = await eventoInstalacao.userChoice;
    if (escolha.outcome === 'accepted') {
      setEventoInstalacao(null);
    }
  };

  if (expandido) {
    return (
      <button
        type="button"
        onClick={() => void instalarAplicativo()}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-emerald-500/35 bg-emerald-500/10 hover:bg-emerald-500/18 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
      >
        <Download size={14} />
        <span>Instalar CalkPro no Dispositivo</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void instalarAplicativo()}
      title="Instalar CalkPro no dispositivo"
      aria-label="Instalar aplicativo"
      className="p-2 rounded-full border border-emerald-500/35 bg-emerald-500/10 hover:bg-emerald-500/18 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
    >
      <Download size={15} />
    </button>
  );
}
