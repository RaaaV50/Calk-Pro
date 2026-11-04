const formatadorBrl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const formatadorBrlCompacto = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const formatadorDecimal = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatadorPreciso = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

export function formatarMoeda(valor: number): string {
  if (!Number.isFinite(valor)) return 'R$ 0,00';
  return formatadorBrl.format(valor);
}

export function formatarMoedaCompacta(valor: number): string {
  if (!Number.isFinite(valor)) return 'R$ 0';
  if (Math.abs(valor) >= 1e15) {
    return `R$ ${(valor / 1e12).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} tri`;
  }
  return formatadorBrlCompacto.format(valor);
}

export function formatarMoedaDestaque(valor: number): string {
  if (!Number.isFinite(valor)) return 'R$ 0,00';
  if (Math.abs(valor) >= 100_000_000) {
    return formatarMoedaCompacta(valor);
  }
  return formatadorBrl.format(valor);
}

export function formatarPercentual(valor: number): string {
  if (!Number.isFinite(valor)) return '0,00%';
  return `${formatadorDecimal.format(valor)}%`;
}

export function formatarPercentualPreciso(valor: number): string {
  if (!Number.isFinite(valor)) return '0,0000%';
  return `${formatadorPreciso.format(valor)}%`;
}

export function converterNumero(texto: string | number, padrao = 0): number {
  if (typeof texto === 'number') {
    return Number.isFinite(texto) ? texto : padrao;
  }
  const limpo = texto.replace(',', '.').trim();
  if (!limpo) return padrao;
  const convertido = Number(limpo);
  return Number.isFinite(convertido) ? convertido : padrao;
}

export function formatarPrazoMeses(totalMeses: number): string {
  if (totalMeses <= 0) return 'Imediato';
  const anos = Math.floor(totalMeses / 12);
  const meses = totalMeses % 12;

  if (anos === 0) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  if (meses === 0) return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
  return `${anos}a ${meses}m`;
}
