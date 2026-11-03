import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TAXAS_INICIAIS } from '../constants/autor';
import { buscarTaxasBancoCentral } from '../services/apiBancoCentral';
import type {
  CenarioSalvo,
  ParametrosSimulacao,
  ResultadoSimulacao,
  TaxasMercado,
  TemaAplicacao,
} from '../types/financas';
import { calcularSimulacaoCompleta } from '../utils/calculosFinanceiros';

const PARAMETROS_INICIAIS_PADRAO: ParametrosSimulacao = {
  capitalInicial: 10000,
  aporteMensal: 1000,
  aporteExtraAnual: 0,
  reajustarAporteInflacao: true,
  crescimentoRealAporteAnual: 0,
  modeloRentabilidade: 'cdi',
  taxaInformada: 100,
  unidadeTaxa: 'anual',
  periodo: 10,
  unidadePeriodo: 'anos',
  inflacaoAnual: TAXAS_INICIAIS.ipcaAnual,
  taxaCustodiaAnual: 0,
  tributacao: 'regressivo',
  metaPatrimonio: 0,
};

interface MetaAtiva {
  nome: string;
  parametros: ParametrosSimulacao;
  resultado: ResultadoSimulacao;
}

interface EstadoFinanceiro {
  tema: TemaAplicacao;
  taxasMercado: TaxasMercado;
  sincronizandoBcb: boolean;
  erroBcb: string | null;
  metaAtiva: MetaAtiva;
  cenariosSalvos: CenarioSalvo[];

  alternarTema: () => void;
  sincronizarComBancoCentral: (forcar?: boolean) => Promise<void>;
  atualizarTaxasManuais: (taxas: Partial<Pick<TaxasMercado, 'cdiAnual' | 'selicAnual' | 'ipcaAnual' | 'poupancaMensal'>>) => void;
  ativarModoAutomaticoBcb: () => Promise<void>;

  definirMetaAtiva: (
    nome: string,
    parametros: ParametrosSimulacao,
    resultado: ResultadoSimulacao
  ) => void;
  salvarCenario: (
    nome: string,
    parametros: ParametrosSimulacao,
    resultado: ResultadoSimulacao
  ) => void;
  removerCenario: (id: string) => void;
}

export const useFinanceStore = create<EstadoFinanceiro>()(
  persist(
    (set, get) => ({
      tema: 'claro',
      taxasMercado: TAXAS_INICIAIS,
      sincronizandoBcb: false,
      erroBcb: null,
      metaAtiva: {
        nome: 'Projeção Base (100% CDI)',
        parametros: PARAMETROS_INICIAIS_PADRAO,
        resultado: calcularSimulacaoCompleta(
          PARAMETROS_INICIAIS_PADRAO,
          TAXAS_INICIAIS.cdiAnual
        ),
      },
      cenariosSalvos: [],

      alternarTema: () =>
        set((estado) => ({
          tema: estado.tema === 'claro' ? 'escuro' : 'claro',
        })),

      sincronizarComBancoCentral: async (forcar = false) => {
        const { taxasMercado, sincronizandoBcb } = get();
        if (sincronizandoBcb) return;
        if (!forcar && !taxasMercado.modoAutomaticoBcb) return;

        if (!forcar && taxasMercado.ultimaAtualizacao) {
          const decorridoMs =
            Date.now() - new Date(taxasMercado.ultimaAtualizacao).getTime();
          const quatroHorasMs = 4 * 60 * 60 * 1000;
          if (decorridoMs < quatroHorasMs) return;
        }

        set({ sincronizandoBcb: true, erroBcb: null });

        try {
          const dadosBcb = await buscarTaxasBancoCentral();
          set((estado) => {
            const novasTaxas: TaxasMercado = {
              cdiAnual: dadosBcb.cdiAnual,
              selicAnual: dadosBcb.selicAnual,
              ipcaAnual: dadosBcb.ipcaAnual,
              poupancaMensal: dadosBcb.poupancaMensal,
              modoAutomaticoBcb: true,
              ultimaAtualizacao: new Date().toISOString(),
              dataReferenciaBcb: dadosBcb.dataReferencia,
            };

            const deveAtualizarMetaPadrao =
              estado.metaAtiva.parametros.modeloRentabilidade === 'cdi' ||
              estado.metaAtiva.parametros.modeloRentabilidade === 'ipcaMais';

            return {
              sincronizandoBcb: false,
              taxasMercado: novasTaxas,
              metaAtiva: deveAtualizarMetaPadrao
                ? {
                    ...estado.metaAtiva,
                    resultado: calcularSimulacaoCompleta(
                      estado.metaAtiva.parametros,
                      novasTaxas.cdiAnual
                    ),
                  }
                : estado.metaAtiva,
            };
          });
        } catch {
          set({
            sincronizandoBcb: false,
            erroBcb: 'Não foi possível consultar o BCB agora.',
          });
        }
      },

      atualizarTaxasManuais: (novas) =>
        set((estado) => {
          const taxasAtualizadas: TaxasMercado = {
            ...estado.taxasMercado,
            ...novas,
            modoAutomaticoBcb: false,
          };

          return {
            taxasMercado: taxasAtualizadas,
            metaAtiva: {
              ...estado.metaAtiva,
              resultado: calcularSimulacaoCompleta(
                estado.metaAtiva.parametros,
                taxasAtualizadas.cdiAnual
              ),
            },
          };
        }),

      ativarModoAutomaticoBcb: async () => {
        set((estado) => ({
          taxasMercado: { ...estado.taxasMercado, modoAutomaticoBcb: true },
        }));
        await get().sincronizarComBancoCentral(true);
      },

      definirMetaAtiva: (nome, parametros, resultado) =>
        set({
          metaAtiva: { nome: nome.trim() || 'Meta Principal', parametros, resultado },
        }),

      salvarCenario: (nome, parametros, resultado) =>
        set((estado) => ({
          cenariosSalvos: [
            {
              id: crypto.randomUUID(),
              nome: nome.trim() || `Cenário ${estado.cenariosSalvos.length + 1}`,
              criadoEm: new Date().toISOString(),
              parametros,
              resultado,
            },
            ...estado.cenariosSalvos,
          ],
        })),

      removerCenario: (id) =>
        set((estado) => ({
          cenariosSalvos: estado.cenariosSalvos.filter((item) => item.id !== id),
        })),
    }),
    {
      name: 'calk-pro-storage-v3',
      partialize: (estado) => ({
        tema: estado.tema,
        taxasMercado: estado.taxasMercado,
        metaAtiva: estado.metaAtiva,
        cenariosSalvos: estado.cenariosSalvos,
      }),
    }
  )
);
