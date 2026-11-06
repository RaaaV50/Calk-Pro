import type {
  FrequenciaAmortizacaoExtra,
  ItemComparativoRendaFixa,
  ModoUsufruto,
  ParametrosSimulacao,
  PontoEvolucao,
  ResultadoComparativo,
  ResultadoFinanciamento,
  ResultadoIndependencia,
  ResultadoMetaReversa,
  ResultadoSimulacao,
  TipoTributacao,
} from '../types/financas';

interface LoteAporte {
  principal: number;
  saldo: number;
  mesesInvestido: number;
}

export function obterAliquotaIrRegressivo(mesesAplicado: number): number {
  if (mesesAplicado <= 6) return 0.225;
  if (mesesAplicado <= 12) return 0.2;
  if (mesesAplicado <= 24) return 0.175;
  return 0.15;
}

function obterAliquotaLote(mesesInvestido: number, tributacao: TipoTributacao): number {
  if (tributacao === 'isento') return 0;
  if (tributacao === 'fixo15') return 0.15;
  return obterAliquotaIrRegressivo(mesesInvestido);
}

export function taxaAnualParaMensal(taxaAnualPercentual: number): number {
  if (taxaAnualPercentual <= -100) return 0;
  return Math.pow(1 + taxaAnualPercentual / 100, 1 / 12) - 1;
}

export function resolverTaxaAnualBruta(
  parametros: Pick<
    ParametrosSimulacao,
    'modeloRentabilidade' | 'taxaInformada' | 'unidadeTaxa' | 'inflacaoAnual'
  >,
  cdiReferenciaAnual: number
): number {
  if (parametros.modeloRentabilidade === 'cdi') {
    return cdiReferenciaAnual * (parametros.taxaInformada / 100);
  }

  if (parametros.modeloRentabilidade === 'ipcaMais') {
    const ipca = parametros.inflacaoAnual / 100;
    const spread = parametros.taxaInformada / 100;
    return ((1 + ipca) * (1 + spread) - 1) * 100;
  }

  if (parametros.unidadeTaxa === 'mensal') {
    return (Math.pow(1 + parametros.taxaInformada / 100, 12) - 1) * 100;
  }

  return parametros.taxaInformada;
}

export function calcularSimulacaoCompleta(
  parametros: ParametrosSimulacao,
  cdiReferenciaAnual: number
): ResultadoSimulacao {
  const capitalInicial = Math.max(0, parametros.capitalInicial);
  const aporteBase = Math.max(0, parametros.aporteMensal);
  const aporteExtraBase = Math.max(0, parametros.aporteExtraAnual);
  const inflacaoAnual = Math.max(0, parametros.inflacaoAnual);
  const custodiaAnual = Math.max(0, parametros.taxaCustodiaAnual);

  const totalMeses = Math.max(
    1,
    Math.min(
      720,
      Math.round(
        parametros.unidadePeriodo === 'anos' ? parametros.periodo * 12 : parametros.periodo
      )
    )
  );

  const taxaEfetivaAnualBruta = resolverTaxaAnualBruta(parametros, cdiReferenciaAnual);
  const taxaMensalBruta = taxaAnualParaMensal(taxaEfetivaAnualBruta);
  const taxaCustodiaMensal = taxaAnualParaMensal(custodiaAnual);
  const inflacaoDecimal = inflacaoAnual / 100;

  const lotes: LoteAporte[] = [];
  if (capitalInicial > 0) {
    lotes.push({ principal: capitalInicial, saldo: capitalInicial, mesesInvestido: 0 });
  }

  let custoCustodiaTotal = 0;
  let mesAtingiuMeta: number | null =
    parametros.metaPatrimonio > 0 && capitalInicial >= parametros.metaPatrimonio ? 0 : null;

  const usarEscalaMensal = totalMeses <= 24;
  const historico: PontoEvolucao[] = [
    {
      periodo: 0,
      rotulo: 'Hoje',
      investido: capitalInicial,
      patrimonioBruto: capitalInicial,
      patrimonioLiquido: capitalInicial,
      poderDeCompraReal: capitalInicial,
      jurosLiquidos: 0,
    },
  ];

  const consolidarMes = (mesAtual: number) => {
    let investido = 0;
    let patrimonioBruto = 0;
    let imposto = 0;

    for (const lote of lotes) {
      investido += lote.principal;
      patrimonioBruto += lote.saldo;
      const lucro = Math.max(0, lote.saldo - lote.principal);
      imposto += lucro * obterAliquotaLote(lote.mesesInvestido, parametros.tributacao);
    }

    const patrimonioLiquido = patrimonioBruto - imposto;
    const fatorInflacao = Math.pow(1 + inflacaoDecimal, mesAtual / 12);
    const poderDeCompraReal =
      fatorInflacao > 0 ? patrimonioLiquido / fatorInflacao : patrimonioLiquido;

    return {
      investido,
      patrimonioBruto,
      imposto,
      patrimonioLiquido,
      poderDeCompraReal,
      jurosLiquidos: patrimonioLiquido - investido,
    };
  };

  let multiplicadorAporte = 1;

  for (let mes = 1; mes <= totalMeses; mes++) {
    if (mes > 1 && (mes - 1) % 12 === 0) {
      const fatorInflacaoAporte = parametros.reajustarAporteInflacao ? 1 + inflacaoDecimal : 1;
      const fatorCrescimentoReal = 1 + Math.max(0, parametros.crescimentoRealAporteAnual) / 100;
      multiplicadorAporte *= fatorInflacaoAporte * fatorCrescimentoReal;
    }

    for (const lote of lotes) {
      lote.saldo *= 1 + taxaMensalBruta;
      if (taxaCustodiaMensal > 0) {
        const desconto = lote.saldo * taxaCustodiaMensal;
        lote.saldo -= desconto;
        custoCustodiaTotal += desconto;
      }
      lote.mesesInvestido += 1;
    }

    const aporteDoMes = aporteBase * multiplicadorAporte;
    const extraDoMes = mes % 12 === 0 ? aporteExtraBase * multiplicadorAporte : 0;
    const totalNovoAporte = aporteDoMes + extraDoMes;

    if (totalNovoAporte > 0) {
      lotes.push({ principal: totalNovoAporte, saldo: totalNovoAporte, mesesInvestido: 0 });
    }

    const resumoAtual = consolidarMes(mes);

    if (
      mesAtingiuMeta === null &&
      parametros.metaPatrimonio > 0 &&
      resumoAtual.patrimonioLiquido >= parametros.metaPatrimonio
    ) {
      mesAtingiuMeta = mes;
    }

    if (usarEscalaMensal || mes % 12 === 0 || mes === totalMeses) {
      const rotulo = usarEscalaMensal
        ? `${mes}m`
        : mes % 12 === 0
          ? `${mes / 12}a`
          : `${(mes / 12).toFixed(1)}a`;

      historico.push({
        periodo: usarEscalaMensal ? mes : Number((mes / 12).toFixed(1)),
        rotulo,
        investido: resumoAtual.investido,
        patrimonioBruto: resumoAtual.patrimonioBruto,
        patrimonioLiquido: resumoAtual.patrimonioLiquido,
        poderDeCompraReal: resumoAtual.poderDeCompraReal,
        jurosLiquidos: resumoAtual.jurosLiquidos,
      });
    }
  }

  const final = consolidarMes(totalMeses);
  const jurosBrutos = final.patrimonioBruto - final.investido;
  const aliquotaEfetiva = jurosBrutos > 0 ? (final.imposto / jurosBrutos) * 100 : 0;
  const taxaLiquidaAproximadaAnual =
    ((1 + taxaEfetivaAnualBruta / 100) * (1 - custodiaAnual / 100) - 1) *
    (1 - aliquotaEfetiva / 100);
  const taxaRealAnual = ((1 + taxaLiquidaAproximadaAnual) / (1 + inflacaoDecimal) - 1) * 100;

  return {
    valorBruto: final.patrimonioBruto,
    totalInvestido: final.investido,
    jurosBrutos,
    valorImposto: final.imposto,
    custoCustodiaTotal,
    aliquotaEfetiva,
    saldoLiquido: final.patrimonioLiquido,
    jurosLiquidos: final.jurosLiquidos,
    poderDeCompraReal: final.poderDeCompraReal,
    taxaEfetivaAnualBruta,
    taxaRealAnual,
    totalMeses,
    mesAtingiuMeta,
    historico,
  };
}

export function compararInvestimentosRendaFixa(dados: {
  capitalInicial: number;
  aporteMensal: number;
  prazoMeses: number;
  cdiAnual: number;
  ipcaAnual: number;
  poupancaMensal: number;
  percentualCdb: number;
  percentualLci: number;
  spreadIpcaMais: number;
  custodiaTesouro: number;
}): ResultadoComparativo {
  const prazoMeses = Math.max(1, Math.min(360, Math.round(dados.prazoMeses)));
  const baseComum = {
    capitalInicial: dados.capitalInicial,
    aporteMensal: dados.aporteMensal,
    aporteExtraAnual: 0,
    reajustarAporteInflacao: false,
    crescimentoRealAporteAnual: 0,
    periodo: prazoMeses,
    unidadePeriodo: 'meses' as const,
    inflacaoAnual: dados.ipcaAnual,
    metaPatrimonio: 0,
  };

  const cdb = calcularSimulacaoCompleta(
    {
      ...baseComum,
      modeloRentabilidade: 'cdi',
      taxaInformada: dados.percentualCdb,
      unidadeTaxa: 'anual',
      taxaCustodiaAnual: 0,
      tributacao: 'regressivo',
    },
    dados.cdiAnual
  );

  const lci = calcularSimulacaoCompleta(
    {
      ...baseComum,
      modeloRentabilidade: 'cdi',
      taxaInformada: dados.percentualLci,
      unidadeTaxa: 'anual',
      taxaCustodiaAnual: 0,
      tributacao: 'isento',
    },
    dados.cdiAnual
  );

  const ipcaMais = calcularSimulacaoCompleta(
    {
      ...baseComum,
      modeloRentabilidade: 'ipcaMais',
      taxaInformada: dados.spreadIpcaMais,
      unidadeTaxa: 'anual',
      taxaCustodiaAnual: dados.custodiaTesouro,
      tributacao: 'regressivo',
    },
    dados.cdiAnual
  );

  const poupanca = calcularSimulacaoCompleta(
    {
      ...baseComum,
      modeloRentabilidade: 'fixa',
      taxaInformada: dados.poupancaMensal,
      unidadeTaxa: 'mensal',
      taxaCustodiaAnual: 0,
      tributacao: 'isento',
    },
    dados.cdiAnual
  );

  const aliquotaPrazo = obterAliquotaIrRegressivo(prazoMeses);
  const cdbEquivalenteDaLci = dados.percentualLci / (1 - aliquotaPrazo);
  const lciEquivalenteDoCdb = dados.percentualCdb * (1 - aliquotaPrazo);

  const maiorLiquido = Math.max(
    cdb.saldoLiquido,
    lci.saldoLiquido,
    ipcaMais.saldoLiquido,
    poupanca.saldoLiquido
  );

  const montarItem = (
    id: string,
    nome: string,
    detalhe: string,
    res: ResultadoSimulacao
  ): ItemComparativoRendaFixa => ({
    id,
    nome,
    detalhe,
    saldoBruto: res.valorBruto,
    imposto: res.valorImposto,
    saldoLiquido: res.saldoLiquido,
    ganhoLiquido: res.jurosLiquidos,
    poderReal: res.poderDeCompraReal,
    taxaLiquidaAnual: res.taxaEfetivaAnualBruta * (1 - res.aliquotaEfetiva / 100),
    melhorOpcao: Math.abs(res.saldoLiquido - maiorLiquido) < 0.01,
  });

  const itens = [
    montarItem(
      'cdb',
      `CDB ${dados.percentualCdb}% CDI`,
      'IR regressivo',
      cdb
    ),
    montarItem(
      'lci',
      `LCI / LCA ${dados.percentualLci}% CDI`,
      'Isento de IR',
      lci
    ),
    montarItem(
      'ipca',
      `IPCA + ${dados.spreadIpcaMais}%`,
      dados.custodiaTesouro > 0 ? `IR + B3 (${dados.custodiaTesouro}% a.a.)` : 'IR regressivo',
      ipcaMais
    ),
    montarItem('poupanca', 'Poupança', 'Isento de IR', poupanca),
  ];

  const evolucao = cdb.historico.map((ponto, i) => ({
    rotulo: ponto.rotulo,
    cdb: ponto.patrimonioLiquido,
    lci: lci.historico[i]?.patrimonioLiquido ?? 0,
    ipcaMais: ipcaMais.historico[i]?.patrimonioLiquido ?? 0,
    poupanca: poupanca.historico[i]?.patrimonioLiquido ?? 0,
  }));

  return {
    totalInvestido: cdb.totalInvestido,
    aliquotaIrPrazo: aliquotaPrazo * 100,
    cdbEquivalenteDaLci,
    lciEquivalenteDoCdb,
    itens,
    evolucao,
  };
}

export function calcularIndependenciaFinanceira(dados: {
  rendaMensalDesejada: number;
  patrimonioAtual: number;
  aporteMensal: number;
  rentabilidadeLiquidaAnual: number;
  inflacaoAnual: number;
  modoUsufruto: ModoUsufruto;
  anosUsufruto: number;
  taxaRetiradaFixaAnual: number;
  idadeAtual: number;
  idadeAlvo: number;
}): ResultadoIndependencia {
  const rendaDesejada = Math.max(0, dados.rendaMensalDesejada);
  const patrimonioInicial = Math.max(0, dados.patrimonioAtual);
  const aporte = Math.max(0, dados.aporteMensal);

  const taxaRealAnualDecimal =
    (1 + dados.rentabilidadeLiquidaAnual / 100) / (1 + dados.inflacaoAnual / 100) - 1;
  const taxaRealMensal =
    taxaRealAnualDecimal > -0.99 ? Math.pow(1 + taxaRealAnualDecimal, 1 / 12) - 1 : 0;

  let patrimonioNecessario = 0;

  if (dados.modoUsufruto === 'taxaFixa') {
    const swrDecimal = Math.max(0.005, dados.taxaRetiradaFixaAnual / 100);
    patrimonioNecessario = (rendaDesejada * 12) / swrDecimal;
  } else if (dados.modoUsufruto === 'consumirCapital') {
    const mesesUsufruto = Math.max(12, Math.round(dados.anosUsufruto * 12));
    if (taxaRealMensal > 0.0001) {
      patrimonioNecessario =
        rendaDesejada *
        ((1 - Math.pow(1 + taxaRealMensal, -mesesUsufruto)) / taxaRealMensal);
    } else {
      patrimonioNecessario = rendaDesejada * mesesUsufruto;
    }
  } else {
    patrimonioNecessario =
      taxaRealMensal > 0.0002 ? rendaDesejada / taxaRealMensal : rendaDesejada * 300;
  }

  let saldo = patrimonioInicial;
  let investido = patrimonioInicial;
  let mesesParaMeta: number | null =
    patrimonioInicial >= patrimonioNecessario && patrimonioNecessario > 0 ? 0 : null;

  const evolucao: ResultadoIndependencia['evolucao'] = [
    {
      ano: 0,
      rotulo: dados.idadeAtual > 0 ? `${dados.idadeAtual}a` : 'Hoje',
      patrimonioReal: patrimonioInicial,
      meta: patrimonioNecessario,
      investido: patrimonioInicial,
    },
  ];

  const rMensalPositiva = Math.max(0, taxaRealMensal);

  for (let mes = 1; mes <= 600; mes++) {
    saldo = saldo * (1 + rMensalPositiva) + aporte;
    investido += aporte;

    if (mesesParaMeta === null && saldo >= patrimonioNecessario && patrimonioNecessario > 0) {
      mesesParaMeta = mes;
    }

    if (mes % 12 === 0) {
      const anosPassados = mes / 12;
      evolucao.push({
        ano: anosPassados,
        rotulo:
          dados.idadeAtual > 0 ? `${dados.idadeAtual + anosPassados}a` : `${anosPassados}a`,
        patrimonioReal: saldo,
        meta: patrimonioNecessario,
        investido,
      });

      if (mesesParaMeta !== null && mes >= mesesParaMeta + 24 && anosPassados >= 8) {
        break;
      }
    }
  }

  let aporteNecessarioIdadeAlvo: number | null = null;
  const mesesAteIdadeAlvo = (dados.idadeAlvo - dados.idadeAtual) * 12;
  if (mesesAteIdadeAlvo > 0 && patrimonioNecessario > 0) {
    const futuroDoCapitalInicial =
      patrimonioInicial * Math.pow(1 + rMensalPositiva, mesesAteIdadeAlvo);
    const faltaAcumular = Math.max(0, patrimonioNecessario - futuroDoCapitalInicial);

    if (faltaAcumular === 0) {
      aporteNecessarioIdadeAlvo = 0;
    } else if (rMensalPositiva > 0.00001) {
      aporteNecessarioIdadeAlvo =
        (faltaAcumular * rMensalPositiva) /
        (Math.pow(1 + rMensalPositiva, mesesAteIdadeAlvo) - 1);
    } else {
      aporteNecessarioIdadeAlvo = faltaAcumular / mesesAteIdadeAlvo;
    }
  }

  const idadeNaMeta =
    mesesParaMeta !== null && dados.idadeAtual > 0
      ? Number((dados.idadeAtual + mesesParaMeta / 12).toFixed(1))
      : null;

  return {
    patrimonioNecessario,
    rendaMensalDesejada: rendaDesejada,
    taxaRealAnual: taxaRealAnualDecimal * 100,
    mesesParaMeta,
    idadeNaMeta,
    aporteNecessarioIdadeAlvo,
    totalAportado:
      mesesParaMeta !== null ? patrimonioInicial + aporte * mesesParaMeta : investido,
    evolucao,
  };
}

export function calcularFinanciamentoCompleto(dados: {
  valorBem: number;
  valorEntrada: number;
  taxaJurosAnual: number;
  prazoAnos: number;
  amortizacaoExtra: number;
  frequenciaExtra?: FrequenciaAmortizacaoExtra;
}): ResultadoFinanciamento {
  const valorFinanciado = Math.max(0, dados.valorBem - dados.valorEntrada);
  const prazoOriginalMeses = Math.max(1, Math.min(480, Math.round(dados.prazoAnos * 12)));
  const taxaMensal = taxaAnualParaMensal(dados.taxaJurosAnual);
  const valorExtra = Math.max(0, dados.amortizacaoExtra);
  const frequencia = dados.frequenciaExtra ?? 'mensal';

  const amortizacaoSacFixa = valorFinanciado / prazoOriginalMeses;
  const parcelaFixaPrice =
    taxaMensal > 0
      ? (valorFinanciado * (taxaMensal * Math.pow(1 + taxaMensal, prazoOriginalMeses))) /
        (Math.pow(1 + taxaMensal, prazoOriginalMeses) - 1)
      : valorFinanciado / prazoOriginalMeses;

  let saldoSac = valorFinanciado;
  let saldoPrice = valorFinanciado;
  let saldoSacExtra = valorFinanciado;
  let saldoPriceExtra = valorFinanciado;

  let totalSac = 0;
  let totalPrice = 0;
  let totalSacExtra = 0;
  let totalPriceExtra = 0;

  let primeiraSac = 0;
  let ultimaSac = 0;
  let primeiraSacExtra = 0;
  let ultimaSacExtra = 0;
  let primeiraPriceExtra = 0;
  let ultimaPriceExtra = 0;
  let mesesSacExtra = 0;
  let mesesPriceExtra = 0;

  const evolucaoSaldo: ResultadoFinanciamento['evolucaoSaldo'] = [
    {
      rotulo: 'Início',
      saldoSac: valorFinanciado,
      saldoPrice: valorFinanciado,
      saldoSacExtra: valorFinanciado,
      saldoPriceExtra: valorFinanciado,
    },
  ];

  for (let mes = 1; mes <= prazoOriginalMeses; mes++) {
    const aplicarExtraNoMes =
      valorExtra > 0 &&
      (frequencia === 'mensal' ||
        (frequencia === 'anual' && mes % 12 === 0) ||
        (frequencia === 'bienal' && mes % 24 === 0));

    const extraDoMes = aplicarExtraNoMes ? valorExtra : 0;

    if (saldoSac > 0) {
      const juros = saldoSac * taxaMensal;
      const parcela = amortizacaoSacFixa + juros;
      saldoSac = Math.max(0, saldoSac - amortizacaoSacFixa);
      totalSac += parcela;
      if (mes === 1) primeiraSac = parcela;
      if (mes === prazoOriginalMeses) ultimaSac = parcela;
    }

    if (saldoPrice > 0) {
      const juros = saldoPrice * taxaMensal;
      const amortizacao = parcelaFixaPrice - juros;
      saldoPrice = Math.max(0, saldoPrice - amortizacao);
      totalPrice += parcelaFixaPrice;
    }

    if (saldoSacExtra > 0.01) {
      const juros = saldoSacExtra * taxaMensal;
      const amortizacaoDesejada = amortizacaoSacFixa + extraDoMes;
      const amortizacaoEfetiva = Math.min(saldoSacExtra, amortizacaoDesejada);
      const desembolsoMes = amortizacaoEfetiva + juros;
      saldoSacExtra = Math.max(0, saldoSacExtra - amortizacaoEfetiva);
      totalSacExtra += desembolsoMes;
      mesesSacExtra = mes;
      if (mes === 1) primeiraSacExtra = desembolsoMes;
      ultimaSacExtra = desembolsoMes;
    }

    if (saldoPriceExtra > 0.01) {
      const juros = saldoPriceExtra * taxaMensal;
      const amortizacaoNormal = Math.max(0, parcelaFixaPrice - juros);
      const amortizacaoDesejada = amortizacaoNormal + extraDoMes;
      const amortizacaoEfetiva = Math.min(saldoPriceExtra, amortizacaoDesejada);
      const desembolsoMes = amortizacaoEfetiva + juros;
      saldoPriceExtra = Math.max(0, saldoPriceExtra - amortizacaoEfetiva);
      totalPriceExtra += desembolsoMes;
      mesesPriceExtra = mes;
      if (mes === 1) primeiraPriceExtra = desembolsoMes;
      ultimaPriceExtra = desembolsoMes;
    }

    if (mes % 12 === 0 || mes === prazoOriginalMeses) {
      evolucaoSaldo.push({
        rotulo: mes % 12 === 0 ? `${mes / 12}a` : `${(mes / 12).toFixed(1)}a`,
        saldoSac,
        saldoPrice,
        saldoSacExtra,
        saldoPriceExtra,
      });
    }
  }

  return {
    valorFinanciado,
    prazoOriginalMeses,
    sac: {
      primeiraParcela: primeiraSac,
      ultimaParcela: ultimaSac,
      totalPago: totalSac,
      totalJuros: Math.max(0, totalSac - valorFinanciado),
      mesesQuitacao: valorFinanciado > 0 ? prazoOriginalMeses : 0,
    },
    price: {
      primeiraParcela: parcelaFixaPrice,
      ultimaParcela: parcelaFixaPrice,
      totalPago: totalPrice,
      totalJuros: Math.max(0, totalPrice - valorFinanciado),
      mesesQuitacao: valorFinanciado > 0 ? prazoOriginalMeses : 0,
    },
    sacComExtra: {
      primeiraParcela: primeiraSacExtra,
      ultimaParcela: ultimaSacExtra,
      totalPago: totalSacExtra,
      totalJuros: Math.max(0, totalSacExtra - valorFinanciado),
      mesesQuitacao: mesesSacExtra,
    },
    priceComExtra: {
      primeiraParcela: primeiraPriceExtra,
      ultimaParcela: ultimaPriceExtra,
      totalPago: totalPriceExtra,
      totalJuros: Math.max(0, totalPriceExtra - valorFinanciado),
      mesesQuitacao: mesesPriceExtra,
    },
    economiaSacSobrePrice: Math.max(0, totalPrice - totalSac),
    economiaExtraSac: Math.max(0, totalSac - totalSacExtra),
    economiaExtraPrice: Math.max(0, totalPrice - totalPriceExtra),
    mesesEconomizadosSac:
      valorFinanciado > 0 ? Math.max(0, prazoOriginalMeses - mesesSacExtra) : 0,
    mesesEconomizadosPrice:
      valorFinanciado > 0 ? Math.max(0, prazoOriginalMeses - mesesPriceExtra) : 0,
    evolucaoSaldo,
  };
}

export function calcularMetaReversa(dados: {
  valorMetaDesejada: number;
  capitalInicial: number;
  prazoMeses: number;
  taxaAnualBruta: number;
  inflacaoAnual: number;
  corrigirPelaInflacao: boolean;
  tributacao: TipoTributacao;
  cdiReferencia: number;
}): ResultadoMetaReversa {
  const prazoMeses = Math.max(1, Math.min(600, Math.round(dados.prazoMeses)));
  const fatorInflacao = Math.pow(1 + Math.max(0, dados.inflacaoAnual) / 100, prazoMeses / 12);
  const valorMetaNominal = dados.corrigirPelaInflacao
    ? dados.valorMetaDesejada * fatorInflacao
    : dados.valorMetaDesejada;

  const simularComAporte = (aporteTeste: number) =>
    calcularSimulacaoCompleta(
      {
        capitalInicial: dados.capitalInicial,
        aporteMensal: aporteTeste,
        aporteExtraAnual: 0,
        reajustarAporteInflacao: false,
        crescimentoRealAporteAnual: 0,
        modeloRentabilidade: 'fixa',
        taxaInformada: dados.taxaAnualBruta,
        unidadeTaxa: 'anual',
        periodo: prazoMeses,
        unidadePeriodo: 'meses',
        inflacaoAnual: dados.inflacaoAnual,
        taxaCustodiaAnual: 0,
        tributacao: dados.tributacao,
        metaPatrimonio: 0,
      },
      dados.cdiReferencia
    );

  const semAporte = simularComAporte(0);
  if (semAporte.saldoLiquido >= valorMetaNominal) {
    return {
      aporteMensalNecessario: 0,
      totalAportado: semAporte.totalInvestido,
      rendimentoLiquido: semAporte.jurosLiquidos,
      valorMetaNominal,
      evolucao: semAporte.historico.map((p) => ({
        rotulo: p.rotulo,
        saldoLiquido: p.patrimonioLiquido,
        investido: p.investido,
      })),
    };
  }

  let minimo = 0;
  let maximo = Math.max(100, valorMetaNominal / prazoMeses) * 2;
  while (simularComAporte(maximo).saldoLiquido < valorMetaNominal && maximo < 1e8) {
    maximo *= 2;
  }

  for (let i = 0; i < 32; i++) {
    const meio = (minimo + maximo) / 2;
    if (simularComAporte(meio).saldoLiquido >= valorMetaNominal) {
      maximo = meio;
    } else {
      minimo = meio;
    }
  }

  const resultadoIdeal = simularComAporte(maximo);

  return {
    aporteMensalNecessario: maximo,
    totalAportado: resultadoIdeal.totalInvestido,
    rendimentoLiquido: resultadoIdeal.jurosLiquidos,
    valorMetaNominal,
    evolucao: resultadoIdeal.historico.map((p) => ({
      rotulo: p.rotulo,
      saldoLiquido: p.patrimonioLiquido,
      investido: p.investido,
    })),
  };
}

export function converterTaxasEquivalentes(dados: {
  taxaInformada: number;
  periodoOrigem: 'anual' | 'mensal';
  inflacaoAnual: number;
}) {
  const taxaLimitada =
    dados.periodoOrigem === 'mensal'
      ? Math.min(30, Math.max(-50, dados.taxaInformada))
      : Math.min(1000, Math.max(-90, dados.taxaInformada));

  const valor = taxaLimitada / 100;
  const taxaAnualDecimal =
    dados.periodoOrigem === 'anual' ? valor : Math.pow(1 + valor, 12) - 1;

  const taxaMensalDecimal = Math.pow(1 + Math.max(-0.99, taxaAnualDecimal), 1 / 12) - 1;
  const taxaRealAnualDecimal =
    (1 + taxaAnualDecimal) / (1 + Math.max(0, dados.inflacaoAnual) / 100) - 1;

  const anualPercentual = taxaAnualDecimal * 100;

  return {
    anual: anualPercentual,
    mensal: taxaMensalDecimal * 100,
    realAnual: taxaRealAnualDecimal * 100,
    foiLimitada: taxaLimitada !== dados.taxaInformada,
    equivalenciaLiquidaPorPrazo: [
      { prazo: 'Até 180 dias (22,5% IR)', liquida: anualPercentual * (1 - 0.225), brutaNecessariaParaEmpatarIsento: anualPercentual / (1 - 0.225) },
      { prazo: '181 a 360 dias (20,0% IR)', liquida: anualPercentual * (1 - 0.2), brutaNecessariaParaEmpatarIsento: anualPercentual / (1 - 0.2) },
      { prazo: '361 a 720 dias (17,5% IR)', liquida: anualPercentual * (1 - 0.175), brutaNecessariaParaEmpatarIsento: anualPercentual / (1 - 0.175) },
      { prazo: 'Acima de 720 dias (15,0% IR)', liquida: anualPercentual * (1 - 0.15), brutaNecessariaParaEmpatarIsento: anualPercentual / (1 - 0.15) },
    ],
  };
}
