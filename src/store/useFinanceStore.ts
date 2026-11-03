import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TAXAS_PADRAO } from '../constants/autor';
import type {
  CenarioSalvo,
  ParametrosJurosCompostos,
  ResultadoJurosCompostos,
  TaxasReferencia,
  TemaAplicacao,
} from '../types/financas';
import { calcularJurosCompostos } from '../utils/calculosFinanceiros';

interface MetaAtiva {
  nome: string;
  parametros: ParametrosJurosCompostos;
  resultado: ResultadoJurosCompostos;
}

interface EstadoFinanceiro {
  tema: TemaAplicacao;
  taxasReferencia: TaxasReferencia;
  metaAtiva: MetaAtiva | null;
  cenariosSalvos: CenarioSalvo[];

  alternarTema: () => void;
  definirTema: (novoTema: TemaAplicacao) => void;
  atualizarTaxasReferencia: (novasTaxas: Partial<TaxasReferencia>) => void;
  restaurarTaxasPadrao: () => void;

  definirMetaAtiva: (
    nome: string,
    parametros: ParametrosJurosCompostos,
    resultado: ResultadoJurosCompostos
  ) => void;
  salvarCenario: (
    nome: string,
    parametros: ParametrosJurosCompostos,
    resultado: ResultadoJurosCompostos
  ) => CenarioSalvo;
  removerCenario: (id: string) => void;
  importarCenarios: (cenarios: CenarioSalvo[]) => void;
  carregarExemploDemonstracao: () => void;
  resetarDados: () => void;
}

export const useFinanceStore = create<EstadoFinanceiro>()(
  persist(
    (set) => ({
      tema: 'claro',
      taxasReferencia: TAXAS_PADRAO,
      metaAtiva: null,
      cenariosSalvos: [],

      alternarTema: () =>
        set((estado) => ({
          tema: estado.tema === 'claro' ? 'escuro' : 'claro',
        })),

      definirTema: (novoTema) => set({ tema: novoTema }),

      atualizarTaxasReferencia: (novasTaxas) =>
        set((estado) => ({
          taxasReferencia: { ...estado.taxasReferencia, ...novasTaxas },
        })),

      restaurarTaxasPadrao: () => set({ taxasReferencia: TAXAS_PADRAO }),

      definirMetaAtiva: (nome, parametros, resultado) =>
        set({
          metaAtiva: { nome, parametros, resultado },
        }),

      salvarCenario: (nome, parametros, resultado) => {
        const novoCenario: CenarioSalvo = {
          id: crypto.randomUUID(),
          nome: nome.trim() || 'Simulação Personalizada',
          criadoEm: new Date().toISOString(),
          parametros,
          resultado,
        };

        set((estado) => ({
          cenariosSalvos: [novoCenario, ...estado.cenariosSalvos],
        }));

        return novoCenario;
      },

      removerCenario: (id) =>
        set((estado) => ({
          cenariosSalvos: estado.cenariosSalvos.filter((cenario) => cenario.id !== id),
        })),

      importarCenarios: (cenarios) =>
        set({
          cenariosSalvos: cenarios,
        }),

      carregarExemploDemonstracao: () => {
        const parametrosLiberdade: ParametrosJurosCompostos = {
          capitalInicial: 10000,
          aporteMensal: 1200,
          taxa: 12.5,
          unidadeTaxa: 'anual',
          periodo: 15,
          unidadePeriodo: 'anos',
          inflacaoAnual: 4.5,
          tributacao: 'regressivo',
        };

        const parametrosReserva: ParametrosJurosCompostos = {
          capitalInicial: 5000,
          aporteMensal: 600,
          taxa: 11.2,
          unidadeTaxa: 'anual',
          periodo: 4,
          unidadePeriodo: 'anos',
          inflacaoAnual: 4.5,
          tributacao: 'isento',
        };

        const resultadoLiberdade = calcularJurosCompostos(parametrosLiberdade);
        const resultadoReserva = calcularJurosCompostos(parametrosReserva);
        const agora = new Date().toISOString();

        set({
          metaAtiva: {
            nome: 'Plano Construção de Patrimônio (15 anos)',
            parametros: parametrosLiberdade,
            resultado: resultadoLiberdade,
          },
          cenariosSalvos: [
            {
              id: crypto.randomUUID(),
              nome: 'Plano Construção de Patrimônio (15 anos)',
              criadoEm: agora,
              parametros: parametrosLiberdade,
              resultado: resultadoLiberdade,
            },
            {
              id: crypto.randomUUID(),
              nome: 'Médio Prazo Isento — LCI/LCA (4 anos)',
              criadoEm: agora,
              parametros: parametrosReserva,
              resultado: resultadoReserva,
            },
          ],
        });
      },

      resetarDados: () =>
        set({
          metaAtiva: null,
          cenariosSalvos: [],
          taxasReferencia: TAXAS_PADRAO,
        }),
    }),
    {
      name: 'calk-pro-storage-v2',
    }
  )
);

