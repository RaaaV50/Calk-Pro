export type TemaAplicacao = 'claro' | 'escuro';

export type TipoTributacao = 'regressivo' | 'isento';

export type UnidadePeriodo = 'anos' | 'meses';

export type UnidadeTaxa = 'anual' | 'mensal';

export interface PontoEvolucaoAnual {
  ano: number;
  rotulo: string;
  investido: number;
  patrimonioBruto: number;
  patrimonioLiquido: number;
  poderDeCompraReal: number;
  jurosBrutos: number;
}

export interface ParametrosJurosCompostos {
  capitalInicial: number;
  aporteMensal: number;
  taxa: number;
  unidadeTaxa: UnidadeTaxa;
  periodo: number;
  unidadePeriodo: UnidadePeriodo;
  inflacaoAnual: number;
  tributacao: TipoTributacao;
}

export interface ResultadoJurosCompostos {
  valorBruto: number;
  totalInvestido: number;
  jurosBrutos: number;
  valorImposto: number;
  aliquotaEfetiva: number;
  saldoLiquido: number;
  poderDeCompraReal: number;
  taxaRealAnual: number;
  totalMeses: number;
  historico: PontoEvolucaoAnual[];
}

export interface CenarioSalvo {
  id: string;
  nome: string;
  criadoEm: string;
  parametros: ParametrosJurosCompostos;
  resultado: ResultadoJurosCompostos;
}

export interface TaxasReferencia {
  cdiAnual: number;
  ipcaAnual: number;
  poupancaMensal: number;
}

export interface OpcaoRendaFixa {
  nome: string;
  subtitulo: string;
  saldoBruto: number;
  imposto: number;
  saldoLiquido: number;
  ganhoLiquido: number;
  rentabilidadeLiquidaAnual: number;
  destaque: boolean;
}

export interface ResultadoComparativoRendaFixa {
  totalInvestido: number;
  cdbEquivalenteParaLci: number;
  lciEquivalenteParaCdb: number;
  aliquotaIrAplicada: number;
  opcoes: OpcaoRendaFixa[];
  evolucaoComparativa: {
    mes: number;
    rotulo: string;
    cdbLiquido: number;
    lciLiquida: number;
    poupanca: number;
  }[];
}

export interface ResultadoIndependencia {
  patrimonioNecessario: number;
  rendaMensalDesejada: number;
  taxaRealAnual: number;
  taxaRealMensal: number;
  mesesParaAtingir: number | null;
  anosParaAtingir: number | null;
  totalAportadoAteMeta: number;
  patrimonioFinalEstimado: number;
  evolucao: {
    ano: number;
    rotulo: string;
    patrimonioReal: number;
    meta: number;
    investido: number;
  }[];
}

export interface ResumoSistemaAmortizacao {
  sistema: 'SAC' | 'PRICE';
  primeiraParcela: number;
  ultimaParcela: number;
  totalPago: number;
  totalJuros: number;
}

export interface ResultadoFinanciamento {
  valorFinanciado: number;
  totalMeses: number;
  sac: ResumoSistemaAmortizacao;
  price: ResumoSistemaAmortizacao;
  economiaSac: number;
  evolucaoAnual: {
    ano: number;
    rotulo: string;
    saldoSac: number;
    saldoPrice: number;
    parcelaSac: number;
    parcelaPrice: number;
  }[];
}

