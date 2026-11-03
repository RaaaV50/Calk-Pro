import type { TaxasMercado } from '../types/financas';

export const DADOS_AUTOR = {
  nome: 'Cassio Cortelini',
  github: 'https://github.com/RaaaV50',
  usuarioGithub: '@RaaaV50',
  linkedin: 'https://www.linkedin.com/in/cassio-cortelini/',
} as const;

export const TAXAS_INICIAIS: TaxasMercado = {
  cdiAnual: 14.15,
  selicAnual: 14.25,
  ipcaAnual: 4.5,
  poupancaMensal: 0.58,
  modoAutomaticoBcb: true,
  ultimaAtualizacao: null,
  dataReferenciaBcb: null,
};
