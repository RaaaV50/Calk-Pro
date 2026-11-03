interface PontoSerieBcb {
  data: string;
  valor: string;
}

interface TaxaBrasilApi {
  nome: string;
  valor: number;
}

export interface RespostaTaxasBcb {
  cdiAnual: number;
  selicAnual: number;
  ipcaAnual: number;
  poupancaMensal: number;
  dataReferencia: string;
}

const URL_BASE_BCB = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs';

function calcularPoupancaOficial(selicAnual: number, trMensal = 0.08): number {
  if (selicAnual > 8.5) {
    return Number((0.5 + Math.max(0, trMensal)).toFixed(2));
  }
  const taxaAnualPoupanca = selicAnual * 0.7;
  const mensal = (Math.pow(1 + taxaAnualPoupanca / 100, 1 / 12) - 1) * 100;
  return Number(mensal.toFixed(2));
}

async function consultarSerieBcb(codigoSerie: number): Promise<{ valor: number; data: string }> {
  const resposta = await fetch(
    `${URL_BASE_BCB}.${codigoSerie}/dados/ultimos/1?formato=json`,
    { signal: AbortSignal.timeout(7000) }
  );

  if (!resposta.ok) {
    throw new Error(`Falha na série ${codigoSerie}`);
  }

  const dados = (await resposta.json()) as PontoSerieBcb[];
  const ultimo = dados[0];
  if (!ultimo) {
    throw new Error(`Série ${codigoSerie} vazia`);
  }

  const numero = Number(String(ultimo.valor).replace(',', '.'));
  if (!Number.isFinite(numero)) {
    throw new Error(`Valor inválido na série ${codigoSerie}`);
  }

  return { valor: numero, data: ultimo.data };
}

async function consultarFallbackBrasilApi(): Promise<RespostaTaxasBcb> {
  const resposta = await fetch('https://brasilapi.com.br/api/taxas/v1', {
    signal: AbortSignal.timeout(7000),
  });

  if (!resposta.ok) {
    throw new Error('Falha ao consultar fallback de taxas');
  }

  const lista = (await resposta.json()) as TaxaBrasilApi[];
  const buscar = (nome: string, padrao: number) =>
    lista.find((item) => item.nome.toUpperCase() === nome.toUpperCase())?.valor ?? padrao;

  const selicAnual = buscar('SELIC', 14.25);
  const cdiAnual = buscar('CDI', Number((selicAnual - 0.1).toFixed(2)));
  const ipcaAnual = buscar('IPCA', 4.5);

  return {
    cdiAnual,
    selicAnual,
    ipcaAnual,
    poupancaMensal: calcularPoupancaOficial(selicAnual),
    dataReferencia: new Date().toLocaleDateString('pt-BR'),
  };
}

export async function buscarTaxasBancoCentral(): Promise<RespostaTaxasBcb> {
  try {
    const [cdi, selic, ipca, tr] = await Promise.all([
      consultarSerieBcb(4389),
      consultarSerieBcb(432),
      consultarSerieBcb(13522),
      consultarSerieBcb(226).catch(() => ({ valor: 0.08, data: '' })),
    ]);

    return {
      cdiAnual: Number(cdi.valor.toFixed(2)),
      selicAnual: Number(selic.valor.toFixed(2)),
      ipcaAnual: Number(ipca.valor.toFixed(2)),
      poupancaMensal: calcularPoupancaOficial(selic.valor, tr.valor),
      dataReferencia: cdi.data,
    };
  } catch {
    return consultarFallbackBrasilApi();
  }
}

