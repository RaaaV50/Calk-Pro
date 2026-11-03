import { useRef, useState, type ChangeEvent } from 'react';
import {
  Check,
  Download,
  ExternalLink,
  Moon,
  RotateCcw,
  Settings,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import { CabecalhoPagina } from '../components/CabecalhoPagina';
import { CampoNumerico } from '../components/CampoNumerico';
import { IconeGithub, IconeLinkedin } from '../components/IconesRedes';
import { DADOS_AUTOR } from '../constants/autor';
import { useTema } from '../hooks/useTema';
import { useFinanceStore } from '../store/useFinanceStore';
import { converterNumero } from '../utils/formatadores';

export default function Configuracoes() {
  const { tema, definirTema } = useTema();
  const taxasReferencia = useFinanceStore((estado) => estado.taxasReferencia);
  const cenariosSalvos = useFinanceStore((estado) => estado.cenariosSalvos);
  const atualizarTaxasReferencia = useFinanceStore(
    (estado) => estado.atualizarTaxasReferencia
  );
  const restaurarTaxasPadrao = useFinanceStore((estado) => estado.restaurarTaxasPadrao);
  const importarCenarios = useFinanceStore((estado) => estado.importarCenarios);
  const resetarDados = useFinanceStore((estado) => estado.resetarDados);

  const [cdi, setCdi] = useState(String(taxasReferencia.cdiAnual));
  const [ipca, setIpca] = useState(String(taxasReferencia.ipcaAnual));
  const [poupanca, setPoupanca] = useState(String(taxasReferencia.poupancaMensal));
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [confirmandoReset, setConfirmandoReset] = useState(false);

  const referenciaArquivo = useRef<HTMLInputElement | null>(null);

  const notificar = (texto: string) => {
    setMensagem(texto);
    window.setTimeout(() => {
      setMensagem((atual) => (atual === texto ? null : atual));
    }, 3000);
  };

  const salvarTaxas = () => {
    atualizarTaxasReferencia({
      cdiAnual: converterNumero(cdi, taxasReferencia.cdiAnual),
      ipcaAnual: converterNumero(ipca, taxasReferencia.ipcaAnual),
      poupancaMensal: converterNumero(poupanca, taxasReferencia.poupancaMensal),
    });
    notificar('Taxas de referência salvas com sucesso!');
  };

  const handleRestaurarPadrao = () => {
    restaurarTaxasPadrao();
    setCdi('14.15');
    setIpca('4.5');
    setPoupanca('0.67');
    notificar('Taxas restauradas para o padrão!');
  };

  const exportarBackupJson = () => {
    const conteudo = JSON.stringify(cenariosSalvos, null, 2);
    const blob = new Blob([conteudo], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calk-pro-cenarios-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notificar('Arquivo de backup exportado!');
  };

  const importarBackupJson = (evento: ChangeEvent<HTMLInputElement>) => {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = () => {
      try {
        const dados = JSON.parse(String(leitor.result));
        if (Array.isArray(dados)) {
          importarCenarios(dados);
          notificar(`${dados.length} cenário(s) importado(s) com sucesso!`);
        }
      } catch {
        notificar('Arquivo JSON inválido.');
      }
    };
    leitor.readAsText(arquivo);
    evento.target.value = '';
  };

  const confirmarLimpezaGeral = () => {
    resetarDados();
    setConfirmandoReset(false);
    notificar('Todos os dados salvos foram limpos.');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <CabecalhoPagina
        titulo="Configurações & Sobre"
        descricao="Personalize a aparência, ajuste os indexadores de referência e conheça o projeto."
        icone={<Settings size={22} />}
      />

      {mensagem && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold">
          <Check size={16} />
          <span>{mensagem}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Aparência da Interface
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Escolha o tema que for mais confortável para sua leitura.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => definirTema('claro')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                tema === 'claro'
                  ? 'border-emerald-500 bg-emerald-500/8 text-zinc-900 dark:text-white'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Sun size={20} className="text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-bold">Modo Claro</p>
                <p className="text-[11px] opacity-75">Visual limpo e editorial</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => definirTema('escuro')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                tema === 'escuro'
                  ? 'border-emerald-500 bg-emerald-500/12 text-zinc-900 dark:text-white'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Moon size={20} className="text-sky-400 shrink-0" />
              <div>
                <p className="text-sm font-bold">Modo Escuro</p>
                <p className="text-[11px] opacity-75">Conforto noturno e contraste</p>
              </div>
            </button>
          </div>

          <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Backup e Armazenamento Local
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Seus dados ficam salvos apenas no seu navegador com total privacidade.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={exportarBackupJson}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                <Download size={14} />
                Exportar Cenários (.json)
              </button>

              <button
                type="button"
                onClick={() => referenciaArquivo.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                <Upload size={14} />
                Importar Backup
              </button>
              <input
                ref={referenciaArquivo}
                type="file"
                accept="application/json"
                onChange={importarBackupJson}
                className="hidden"
              />
            </div>

            <div className="pt-2">
              {!confirmandoReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmandoReset(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  <Trash2 size={14} />
                  Apagar todas as metas e cenários salvos
                </button>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25">
                  <span className="text-xs font-medium text-rose-700 dark:text-rose-300 flex-1">
                    Confirmar exclusão permanente dos cenários locais?
                  </span>
                  <button
                    type="button"
                    onClick={confirmarLimpezaGeral}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmandoReset(false)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Indexadores de Referência
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Valores usados nos atalhos rápidos do Simulador e Comparador de Renda Fixa.
            </p>
          </div>

          <CampoNumerico
            rotulo="Taxa CDI / Selic Atual"
            sufixo="% a.a."
            step="0.05"
            min="0"
            valor={cdi}
            aoAlterar={setCdi}
          />

          <CampoNumerico
            rotulo="Inflação Anual Estimada (IPCA)"
            sufixo="% a.a."
            step="0.1"
            min="0"
            valor={ipca}
            aoAlterar={setIpca}
          />

          <CampoNumerico
            rotulo="Rendimento Mensal da Poupança"
            sufixo="% a.m."
            step="0.01"
            min="0"
            valor={poupanca}
            aoAlterar={setPoupanca}
          />

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={salvarTaxas}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Salvar Indexadores
            </button>
            <button
              type="button"
              onClick={handleRestaurarPadrao}
              className="inline-flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              Padrão
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 dark:bg-emerald-500 text-emerald-400 dark:text-zinc-950 font-extrabold text-xl flex items-center justify-center shrink-0">
              CC
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Sobre o Projeto & Autor
              </span>
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white mt-0.5">
                Desenvolvido por {DADOS_AUTOR.nome}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 max-w-2xl leading-relaxed">
                O <strong>Calk-Pro</strong> nasceu como uma evolução moderna para tornar o
                planejamento financeiro acessível, transparente e visual — unindo cálculos
                reais do mercado brasileiro (IR regressivo por aporte, inflação, equivalência
                de renda fixa e sistemas SAC/Price) em uma interface rápida construída com
                React, TypeScript, Tailwind CSS e Zustand.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <a
              href={DADOS_AUTOR.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold transition-colors"
            >
              <IconeGithub tamanho={16} />
              GitHub
              <ExternalLink size={13} className="opacity-60" />
            </a>

            <a
              href={DADOS_AUTOR.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors"
            >
              <IconeLinkedin tamanho={16} />
              LinkedIn
              <ExternalLink size={13} className="opacity-70" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

