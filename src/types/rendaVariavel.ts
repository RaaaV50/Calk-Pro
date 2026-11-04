export type TipoAtivoB3 = 'stock' | 'fund' | 'bdr';

export interface AtivoResumoB3 {
  ticker: string;
  nome: string;
  preco: number;
  variacaoDia: number;
  volume: number;
  valorMercado: number | null;
  setor: string;
  tipo: TipoAtivoB3;
  logoUrl: string | null;
}

export interface PontoHistoricoPreco {
  data: string;
  fechamento: number;
}

export interface DetalheAtivoB3 extends AtivoResumoB3 {
  nomeCompleto?: string;
  precoLucro?: number | null;
  lucroPorAcao?: number | null;
  maxima52Semanas?: number | null;
  minima52Semanas?: number | null;
  historicoRecente: PontoHistoricoPreco[];
}

export interface PontoEvolucaoFii {
  ano: number;
  rotulo: string;
  totalCotas: number;
  cotasBolaDeNeve: number;
  rendaMensal: number;
  patrimonioTotal: number;
  totalDesembolsado: number;
}

export interface ResultadoSimulacaoFii {
  cotasFinais: number;
  cotasDoBolso: number;
  cotasBolaDeNeve: number;
  patrimonioFinal: number;
  totalDesembolsado: number;
  rendaMensalFinal: number;
  dividendosAcumulados: number;
  yieldOnCostAnual: number;
  cotasNumeroMagico: number;
  valorNumeroMagico: number;
  mesAtingiuNumeroMagico: number | null;
  historico: PontoEvolucaoFii[];
}

