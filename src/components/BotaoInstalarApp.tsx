import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface EventoInstalacaoPwa extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function BotaoInstalarApp() {
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

  return (
    <button
      type="button"
      onClick={() => void instalarAplicativo()}
      title="Instalar Calk-Pro no dispositivo"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/10 hover:bg-emerald-500/18 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
    >
      <Download size={13} />
      <span className="hidden sm:inline">Instalar App</span>
    </button>
  );
}

