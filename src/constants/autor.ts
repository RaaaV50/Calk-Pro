import type { TaxasReferencia } from '../types/financas';

export const DADOS_AUTOR = {
  nome: 'Cassio Cortelini',
  papel: 'Desenvolvedor Front-end',
  github: 'https://github.com/RaaaV50',
  usuarioGithub: '@RaaaV50',
  linkedin: 'https://www.linkedin.com/in/cassio-cortelini/',
  versaoProjeto: '2.0.0',
} as const;

export const TAXAS_PADRAO: TaxasReferencia = {
  cdiAnual: 14.15,
  ipcaAnual: 4.5,
  poupancaMensal: 0.67,
};

