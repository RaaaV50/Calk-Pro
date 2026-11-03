import type {
  OpcaoRendaFixa,
  ParametrosJurosCompostos,
  PontoEvolucaoAnual,
  ResultadoComparativoRendaFixa,
  ResultadoFinanciamento,
  ResultadoIndependencia,
  ResultadoJurosCompostos,
} from '../types/financas';

interface LoteInvestimento {
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

export function converterTaxaParaMensal(taxa: number, unidade: 'anual' | 'mensal'): number {
  if (taxa <= 0) return 0;
  if (unidade === 'mensal') return taxa / 100;
  return Math.pow(1 + taxa / 100, 1 / 12) - 1;
}

export function converterTaxaParaAnual(taxa: number, unidade: 'anual' | 'mensal'): number {
  if (taxa <= 0) return 0;
  if (unidade === 'anual') return taxa / 100;
  return Math.pow(1 + taxa / 100, 12) - 1;
}

export function calcularJurosCompostos(
  parametros: ParametrosJurosCompostos
): ResultadoJurosCompostos {
  const capitalInicial = Math.max(0, parametros.capitalInicial);
  const aporteMensal = Math.max(0, parametros.aporteMensal);
  const inflacaoAnual = Math.max(0, parametros.inflacaoAnual);

  const totalMeses = Math.max(
    1,
    Math.min(
      720,
      Math.round(
        parametros.unidadePeriodo === 'anos' ? parametros.periodo * 12 : parametros.periodo
      )
    )
  );

  const taxaMensal = converterTaxaParaMensal(parametros.taxa, parametros.unidadeTaxa);
  const taxaAnualDecimal = converterTaxaParaAnual(parametros.taxa, parametros.unidadeTaxa);
  const inflacaoDecimal = inflacaoAnual / 100;

  const lotes: LoteInvestimento[] = [];
  if (capitalInicial > 0) {
    lotes.push({ principal: capitalInicial, saldo: capitalInicial, mesesInvestido: 0 });
  }

  const usarEscalaMensal = totalMeses <= 24;
  const historico: PontoEvolucaoAnual[] = [
    {
      ano: 0,
      rotulo: 'Início',
      investido: capitalInicial,
      patrimonioBruto: capitalInicial,
      patrimonioLiquido: capitalInicial,
      poderDeCompraReal: capitalInicial,
      jurosBrutos: 0,
    },
  ];

  const resumirLotesNoMes = (mesAtual: number) => {
    let investido = 0;
    let patrimonioBruto = 0;
    let imposto = 0;

    for (const lote of lotes) {
      investido += lote.principal;
      patrimonioBruto += lote.saldo;
      if (parametros.tributacao === 'regressivo') {
        const lucroLote = Math.max(0, lote.saldo - lote.principal);
        imposto += lucroLote * obterAliquotaIrRegressivo(lote.mesesInvestido);
      }
    }

    const patrimonioLiquido = patrimonioBruto - imposto;
    const fatorInflacao = Math.pow(1 + inflacaoDecimal, mesAtual / 12);
    const poderDeCompraReal = fatorInflacao > 0 ? patrimonioLiquido / fatorInflacao : patrimonioLiquido;

    return {
      investido,
      patrimonioBruto,
      imposto,
      patrimonioLiquido,
      poderDeCompraReal,
      jurosBrutos: patrimonioBruto - investido,
    };
  };

  for (let mes = 1; mes <= totalMeses; mes++) {
    for (const lote of lotes) {
      lote.saldo *= 1 + taxaMensal;
      lote.mesesInvestido += 1;
    }

    if (aporteMensal > 0) {
      lotes.push({ principal: aporteMensal, saldo: aporteMensal, mesesInvestido: 0 });
    }

    const deveRegistrarPonto =
      usarEscalaMensal || mes % 12 === 0 || mes === totalMeses;

    if (deveRegistrarPonto) {
      const resumoMes = resumirLotesNoMes(mes);
      const numeroPeriodo = usarEscalaMensal ? mes : Number((mes / 12).toFixed(1));
      const rotulo = usarEscalaMensal
        ? `${mes}m`
        : mes % 12 === 0
          ? `Ano ${mes / 12}`
          : `${(mes / 12).toFixed(1)}a`;

      historico.push({
        ano: numeroPeriodo,
        rotulo,
        investido: resumoMes.investido,
        patrimonioBruto: resumoMes.patrimonioBruto,
        patrimonioLiquido: resumoMes.patrimonioLiquido,
        poderDeCompraReal: resumoMes.poderDeCompraReal,
        jurosBrutos: resumoMes.jurosBrutos,
      });
    }
  }

  const final = resumirLotesNoMes(totalMeses);
  const aliquotaEfetiva =
    final.jurosBrutos > 0 ? (final.imposto / final.jurosBrutos) * 100 : 0;
  const taxaRealAnual = ((1 + taxaAnualDecimal) / (1 + inflacaoDecimal) - 1) * 100;

  return {
    valorBruto: final.patrimonioBruto,
    totalInvestido: final.investido,
    jurosBrutos: final.jurosBrutos,
    valorImposto: final.imposto,
    aliquotaEfetiva,
    saldoLiquido: final.patrimonioLiquido,
    poderDeCompraReal: final.poderDeCompraReal,
    taxaRealAnual,
    totalMeses,
    historico,
  };
}

export function compararRendaFixa(dados: {
  capitalInicial: number;
  aporteMensal: number;
  prazoMeses: number;
  cdiAnual: number;
  percentualCdb: number;
  percentualLci: number;
  taxaPoupancaMensal: number;
}): ResultadoComparativoRendaFixa {
  const prazoMeses = Math.max(1, Math.min(360, Math.round(dados.prazoMeses)));
  const taxaBrutaCdbAnual = dados.cdiAnual * (dados.percentualCdb / 100);
  const taxaLciAnual = dados.cdiAnual * (dados.percentualLci / 100);

  const resultadoCdb = calcularJurosCompostos({
    capitalInicial: dados.capitalInicial,
    aporteMensal: dados.aporteMensal,
    taxa: taxaBrutaCdbAnual,
    unidadeTaxa: 'anual',
    periodo: prazoMeses,
    unidadePeriodo: 'meses',
    inflacaoAnual: 0,
    tributacao: 'regressivo',
  });

  const resultadoLci = calcularJurosCompostos({
    capitalInicial: dados.capitalInicial,
    aporteMensal: dados.aporteMensal,
    taxa: taxaLciAnual,
    unidadeTaxa: 'anual',
    periodo: prazoMeses,
    unidadePeriodo: 'meses',
    inflacaoAnual: 0,
    tributacao: 'isento',
  });

  const resultadoPoupanca = calcularJurosCompostos({
    capitalInicial: dados.capitalInicial,
    aporteMensal: dados.aporteMensal,
    taxa: dados.taxaPoupancaMensal,
    unidadeTaxa: 'mensal',
    periodo: prazoMeses,
    unidadePeriodo: 'meses',
    inflacaoAnual: 0,
    tributacao: 'isento',
  });

  const aliquotaPrazo = obterAliquotaIrRegressivo(prazoMeses);
  const cdbEquivalenteParaLci = dados.percentualLci / (1 - aliquotaPrazo);
  const lciEquivalenteParaCdb = dados.percentualCdb * (1 - aliquotaPrazo);

  const taxaLiquidaCdbAnual = taxaBrutaCdbAnual * (1 - aliquotaPrazo);
  const taxaPoupancaAnual = (Math.pow(1 + dados.taxaPoupancaMensal / 100, 12) - 1) * 100;

  const maiorLiquido = Math.max(
    resultadoCdb.saldoLiquido,
    resultadoLci.saldoLiquido,
    resultadoPoupanca.saldoLiquido
  );

  const opcoes: OpcaoRendaFixa[] = [
    {
      nome: `CDB / Tesouro (${dados.percentualCdb}% do CDI)`,
      subtitulo: 'Tributado pela tabela regressiva de IR',
      saldoBruto: resultadoCdb.valorBruto,
      imposto: resultadoCdb.valorImposto,
      saldoLiquido: resultadoCdb.saldoLiquido,
      ganhoLiquido: resultadoCdb.saldoLiquido - resultadoCdb.totalInvestido,
      rentabilidadeLiquidaAnual: taxaLiquidaCdbAnual,
      destaque: Math.abs(resultadoCdb.saldoLiquido - maiorLiquido) < 0.01,
    },
    {
      nome: `LCI / LCA (${dados.percentualLci}% do CDI)`,
      subtitulo: 'Isento de Imposto de Renda para Pessoa Física',
      saldoBruto: resultadoLci.valorBruto,
      imposto: 0,
      saldoLiquido: resultadoLci.saldoLiquido,
      ganhoLiquido: resultadoLci.saldoLiquido - resultadoLci.totalInvestido,
      rentabilidadeLiquidaAnual: taxaLciAnual,
      destaque: Math.abs(resultadoLci.saldoLiquido - maiorLiquido) < 0.01,
    },
    {
      nome: 'Caderneta de Poupança',
      subtitulo: 'Isenta de IR · Referência tradicional',
      saldoBruto: resultadoPoupanca.valorBruto,
      imposto: 0,
      saldoLiquido: resultadoPoupanca.saldoLiquido,
      ganhoLiquido: resultadoPoupanca.saldoLiquido - resultadoPoupanca.totalInvestido,
      rentabilidadeLiquidaAnual: taxaPoupancaAnual,
      destaque: Math.abs(resultadoPoupanca.saldoLiquido - maiorLiquido) < 0.01,
    },
  ];

  const evolucaoComparativa = resultadoCdb.historico.map((ponto, indice) => ({
    mes: ponto.ano,
    rotulo: ponto.rotulo,
    cdbLiquido: ponto.patrimonioLiquido,
    lciLiquida: resultadoLci.historico[indice]?.patrimonioLiquido ?? 0,
    poupanca: resultadoPoupanca.historico[indice]?.patrimonioLiquido ?? 0,
  }));

  return {
    totalInvestido: resultadoCdb.totalInvestido,
    cdbEquivalenteParaLci,
    lciEquivalenteParaCdb,
    aliquotaIrAplicada: aliquotaPrazo * 100,
    opcoes,
    evolucaoComparativa,
  };
}

export function calcularIndependenciaFinanceira(dados: {
  rendaMensalDesejada: number;
  patrimonioAtual: number;
  aporteMensal: number;
  rentabilidadeAnual: number;
  inflacaoAnual: number;
}): ResultadoIndependencia {
  const rendaDesejada = Math.max(0, dados.rendaMensalDesejada);
  const patrimonioInicial = Math.max(0, dados.patrimonioAtual);
  const aporteMensal = Math.max(0, dados.aporteMensal);

  const taxaRealAnualDecimal =
    (1 + dados.rentabilidadeAnual / 100) / (1 + dados.inflacaoAnual / 100) - 1;
  const taxaRealMensal =
    taxaRealAnualDecimal > -0.99 ? Math.pow(1 + taxaRealAnualDecimal, 1 / 12) - 1 : 0;

  const patrimonioNecessario =
    taxaRealMensal > 0.0002 ? rendaDesejada / taxaRealMensal : rendaDesejada * 300;

  let saldoReal = patrimonioInicial;
  let totalAportado = patrimonioInicial;
  let mesesParaAtingir: number | null =
    patrimonioInicial >= patrimonioNecessario && patrimonioNecessario > 0 ? 0 : null;

  const limiteMeses = 600;
  const evolucao: ResultadoIndependencia['evolucao'] = [
    {
      ano: 0,
      rotulo: 'Hoje',
      patrimonioReal: patrimonioInicial,
      meta: patrimonioNecessario,
      investido: patrimonioInicial,
    },
  ];

  for (let mes = 1; mes <= limiteMeses; mes++) {
    saldoReal = saldoReal * (1 + Math.max(0, taxaRealMensal)) + aporteMensal;
    totalAportado += aporteMensal;

    if (mesesParaAtingir === null && saldoReal >= patrimonioNecessario && patrimonioNecessario > 0) {
      mesesParaAtingir = mes;
    }

    if (mes % 12 === 0) {
      const anoAtual = mes / 12;
      evolucao.push({
        ano: anoAtual,
        rotulo: `Ano ${anoAtual}`,
        patrimonioReal: saldoReal,
        meta: patrimonioNecessario,
        investido: totalAportado,
      });

      if (mesesParaAtingir !== null && mes >= mesesParaAtingir + 36 && anoAtual >= 10) {
        break;
      }
    }
  }

  return {
    patrimonioNecessario,
    rendaMensalDesejada: rendaDesejada,
    taxaRealAnual: taxaRealAnualDecimal * 100,
    taxaRealMensal: taxaRealMensal * 100,
    mesesParaAtingir,
    anosParaAtingir: mesesParaAtingir !== null ? Number((mesesParaAtingir / 12).toFixed(1)) : null,
    totalAportadoAteMeta:
      mesesParaAtingir !== null
        ? patrimonioInicial + aporteMensal * mesesParaAtingir
        : totalAportado,
    patrimonioFinalEstimado: saldoReal,
    evolucao,
  };
}

export function calcularFinanciamento(dados: {
  valorBem: number;
  valorEntrada: number;
  taxaJurosAnual: number;
  prazoAnos: number;
}): ResultadoFinanciamento {
  const valorFinanciado = Math.max(0, dados.valorBem - dados.valorEntrada);
  const totalMeses = Math.max(1, Math.min(480, Math.round(dados.prazoAnos * 12)));
  const taxaMensal = converterTaxaParaMensal(dados.taxaJurosAnual, 'anual');

  const amortizacaoSac = valorFinanciado / totalMeses;
  const parcelaFixaPrice =
    taxaMensal > 0
      ? (valorFinanciado * (taxaMensal * Math.pow(1 + taxaMensal, totalMeses))) /
        (Math.pow(1 + taxaMensal, totalMeses) - 1)
      : valorFinanciado / totalMeses;

  let saldoSac = valorFinanciado;
  let saldoPrice = valorFinanciado;

  let totalPagoSac = 0;
  let totalPagoPrice = 0;
  let primeiraParcelaSac = 0;
  let ultimaParcelaSac = 0;

  const evolucaoAnual: ResultadoFinanciamento['evolucaoAnual'] = [
    {
      ano: 0,
      rotulo: 'Início',
      saldoSac: valorFinanciado,
      saldoPrice: valorFinanciado,
      parcelaSac: valorFinanciado > 0 ? amortizacaoSac + valorFinanciado * taxaMensal : 0,
      parcelaPrice: parcelaFixaPrice,
    },
  ];

  for (let mes = 1; mes <= totalMeses; mes++) {
    const jurosSac = saldoSac * taxaMensal;
    const parcelaAtualSac = amortizacaoSac + jurosSac;
    saldoSac = Math.max(0, saldoSac - amortizacaoSac);
    totalPagoSac += parcelaAtualSac;

    if (mes === 1) primeiraParcelaSac = parcelaAtualSac;
    if (mes === totalMeses) ultimaParcelaSac = parcelaAtualSac;

    const jurosPrice = saldoPrice * taxaMensal;
    const amortizacaoPrice = parcelaFixaPrice - jurosPrice;
    saldoPrice = Math.max(0, saldoPrice - amortizacaoPrice);
    totalPagoPrice += parcelaFixaPrice;

    if (mes % 12 === 0 || mes === totalMeses) {
      const ano = Number((mes / 12).toFixed(1));
      evolucaoAnual.push({
        ano,
        rotulo: mes % 12 === 0 ? `Ano ${mes / 12}` : `${ano}a`,
        saldoSac,
        saldoPrice,
        parcelaSac: parcelaAtualSac,
        parcelaPrice: parcelaFixaPrice,
      });
    }
  }

  return {
    valorFinanciado,
    totalMeses,
    sac: {
      sistema: 'SAC',
      primeiraParcela: primeiraParcelaSac,
      ultimaParcela: ultimaParcelaSac,
      totalPago: totalPagoSac,
      totalJuros: Math.max(0, totalPagoSac - valorFinanciado),
    },
    price: {
      sistema: 'PRICE',
      primeiraParcela: parcelaFixaPrice,
      ultimaParcela: parcelaFixaPrice,
      totalPago: totalPagoPrice,
      totalJuros: Math.max(0, totalPagoPrice - valorFinanciado),
    },
    economiaSac: Math.max(0, totalPagoPrice - totalPagoSac),
    evolucaoAnual,
  };
}

