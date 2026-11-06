export type TemaAplicacao = 'claro' | 'escuro';

export type TipoTributacao = 'regressivo' | 'isento' | 'fixo15';

export type ModeloRentabilidade = 'fixa' | 'cdi' | 'ipcaMais';

export type UnidadePeriodo = 'anos' | 'meses';

export type UnidadeTaxa = 'anual' | 'mensal';

export interface TaxasMercado {
  cdiAnual: number;
  selicAnual: number;
  ipcaAnual: number;
  poupancaMensal: number;
  modoAutomaticoBcb: boolean;
  ultimaAtualizacao: string | null;
  dataReferenciaBcb: string | null;
}

export interface PontoEvolucao {
  periodo: number;
  rotulo: string;
  investido: number;
  patrimonioBruto: number;
  patrimonioLiquido: number;
  poderDeCompraReal: number;
  jurosLiquidos: number;
}

export interface ParametrosSimulacao {
  capitalInicial: number;
  aporteMensal: number;
  aporteExtraAnual: number;
  reajustarAporteInflacao: boolean;
  crescimentoRealAporteAnual: number;
  modeloRentabilidade: ModeloRentabilidade;
  taxaInformada: number;
  unidadeTaxa: UnidadeTaxa;
  periodo: number;
  unidadePeriodo: UnidadePeriodo;
  inflacaoAnual: number;
  taxaCustodiaAnual: number;
  tributacao: TipoTributacao;
  metaPatrimonio: number;
}

export interface ResultadoSimulacao {
  valorBruto: number;
  totalInvestido: number;
  jurosBrutos: number;
  valorImposto: number;
  custoCustodiaTotal: number;
  aliquotaEfetiva: number;
  saldoLiquido: number;
  jurosLiquidos: number;
  poderDeCompraReal: number;
  taxaEfetivaAnualBruta: number;
  taxaRealAnual: number;
  totalMeses: number;
  mesAtingiuMeta: number | null;
  historico: PontoEvolucao[];
}

export interface CenarioSalvo {
  id: string;
  nome: string;
  criadoEm: string;
  parametros: ParametrosSimulacao;
  resultado: ResultadoSimulacao;
}

export interface ItemComparativoRendaFixa {
  id: string;
  nome: string;
  detalhe: string;
  saldoBruto: number;
  imposto: number;
  saldoLiquido: number;
  ganhoLiquido: number;
  poderReal: number;
  taxaLiquidaAnual: number;
  melhorOpcao: boolean;
}

export interface ResultadoComparativo {
  totalInvestido: number;
  aliquotaIrPrazo: number;
  cdbEquivalenteDaLci: number;
  lciEquivalenteDoCdb: number;
  itens: ItemComparativoRendaFixa[];
  evolucao: {
    rotulo: string;
    cdb: number;
    lci: number;
    ipcaMais: number;
    poupanca: number;
  }[];
}

export type ModoUsufruto = 'perpetuo' | 'consumirCapital' | 'taxaFixa';

export interface ResultadoIndependencia {
  patrimonioNecessario: number;
  rendaMensalDesejada: number;
  taxaRealAnual: number;
  mesesParaMeta: number | null;
  idadeNaMeta: number | null;
  aporteNecessarioIdadeAlvo: number | null;
  totalAportado: number;
  evolucao: {
    ano: number;
    rotulo: string;
    patrimonioReal: number;
    meta: number;
    investido: number;
  }[];
}

export type FrequenciaAmortizacaoExtra = 'mensal' | 'anual' | 'bienal';

export interface ResumoAmortizacao {
  primeiraParcela: number;
  ultimaParcela: number;
  totalPago: number;
  totalJuros: number;
  mesesQuitacao: number;
}

export interface ResultadoFinanciamento {
  valorFinanciado: number;
  prazoOriginalMeses: number;
  sac: ResumoAmortizacao;
  price: ResumoAmortizacao;
  sacComExtra: ResumoAmortizacao;
  priceComExtra: ResumoAmortizacao;
  economiaSacSobrePrice: number;
  economiaExtraSac: number;
  economiaExtraPrice: number;
  mesesEconomizadosSac: number;
  mesesEconomizadosPrice: number;
  evolucaoSaldo: {
    rotulo: string;
    saldoSac: number;
    saldoPrice: number;
    saldoSacExtra: number;
    saldoPriceExtra: number;
  }[];
}

export interface ResultadoMetaReversa {
  aporteMensalNecessario: number;
  totalAportado: number;
  rendimentoLiquido: number;
  valorMetaNominal: number;
  evolucao: {
    rotulo: string;
    saldoLiquido: number;
    investido: number;
  }[];
}
