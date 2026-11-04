import type { PontoEvolucaoFii, ResultadoSimulacaoFii } from '../types/rendaVariavel';

export function calcularBolaDeNeveFiis(dados: {
  precoCota: number;
  dividendYieldMensalPercentual: number;
  cotasIniciais: number;
  aporteMensal: number;
  prazoAnos: number;
  reinvestirDividendos: boolean;
  corrigirPelaInflacao: boolean;
  ipcaAnual: number;
}): ResultadoSimulacaoFii {
  const precoInicial = Math.max(0.5, dados.precoCota);
  const dyMensalSeguro = Math.min(3, Math.max(0, dados.dividendYieldMensalPercentual)) / 100;
  const dividendoInicial = precoInicial * dyMensalSeguro;

  const cotasIniciais = Math.max(0, Math.floor(dados.cotasIniciais));
  const aporteBase = Math.max(0, dados.aporteMensal);
  const totalMeses = Math.max(12, Math.min(480, Math.round(dados.prazoAnos * 12)));
  const inflacaoDecimal = Math.min(0.3, Math.max(0, dados.ipcaAnual) / 100);

  const cotasNumeroMagico =
    dividendoInicial > 0
      ? Math.ceil(Number((precoInicial / dividendoInicial).toFixed(6)))
      : 0;
  const valorNumeroMagico = cotasNumeroMagico * precoInicial;

  let cotasTotais = cotasIniciais;
  let cotasDoBolso = cotasIniciais;
  let cotasBolaDeNeve = 0;

  let precoAtualCota = precoInicial;
  let dividendoAtualPorCota = dividendoInicial;
  let aporteAtual = aporteBase;

  let caixaAporte = 0;
  let caixaDividendos = 0;
  let totalDesembolsado = cotasIniciais * precoInicial;
  let dividendosAcumulados = 0;

  let mesAtingiuNumeroMagico: number | null =
    cotasNumeroMagico > 0 && cotasTotais >= cotasNumeroMagico ? 0 : null;

  const historico: PontoEvolucaoFii[] = [
    {
      ano: 0,
      rotulo: 'Hoje',
      totalCotas: cotasTotais,
      cotasBolaDeNeve: 0,
      rendaMensal: cotasTotais * dividendoAtualPorCota,
      patrimonioTotal: cotasTotais * precoAtualCota,
      totalDesembolsado,
    },
  ];

  for (let mes = 1; mes <= totalMeses; mes++) {
    if (mes > 1 && (mes - 1) % 12 === 0 && dados.corrigirPelaInflacao) {
      const fator = 1 + inflacaoDecimal;
      precoAtualCota *= fator;
      dividendoAtualPorCota *= fator;
      aporteAtual *= fator;
    }

    const proventosDoMes = cotasTotais * dividendoAtualPorCota;
    dividendosAcumulados += proventosDoMes;

    totalDesembolsado += aporteAtual;
    caixaAporte += aporteAtual;

    if (caixaAporte >= precoAtualCota) {
      const compradasBolso = Math.floor(caixaAporte / precoAtualCota);
      cotasDoBolso += compradasBolso;
      cotasTotais += compradasBolso;
      caixaAporte -= compradasBolso * precoAtualCota;
    }

    if (dados.reinvestirDividendos) {
      caixaDividendos += proventosDoMes;

      if (caixaDividendos >= precoAtualCota) {
        const compradasDividendos = Math.floor(caixaDividendos / precoAtualCota);
        cotasBolaDeNeve += compradasDividendos;
        cotasTotais += compradasDividendos;
        caixaDividendos -= compradasDividendos * precoAtualCota;
      }

      if (caixaDividendos + caixaAporte >= precoAtualCota) {
        if (caixaDividendos >= caixaAporte) {
          cotasBolaDeNeve += 1;
        } else {
          cotasDoBolso += 1;
        }
        const restante = caixaDividendos + caixaAporte - precoAtualCota;
        caixaDividendos = restante;
        caixaAporte = 0;
        cotasTotais += 1;
      }
    }

    if (
      mesAtingiuNumeroMagico === null &&
      cotasNumeroMagico > 0 &&
      cotasTotais >= cotasNumeroMagico
    ) {
      mesAtingiuNumeroMagico = mes;
    }

    if (mes % 12 === 0 || mes === totalMeses) {
      const ano = Number((mes / 12).toFixed(1));
      const sobraCaixa = caixaAporte + (dados.reinvestirDividendos ? caixaDividendos : 0);

      historico.push({
        ano,
        rotulo: mes % 12 === 0 ? `${mes / 12}a` : `${ano}a`,
        totalCotas: cotasTotais,
        cotasBolaDeNeve,
        rendaMensal: cotasTotais * dividendoAtualPorCota,
        patrimonioTotal: cotasTotais * precoAtualCota + sobraCaixa,
        totalDesembolsado,
      });
    }
  }

  const rendaMensalFinal = cotasTotais * dividendoAtualPorCota;
  const sobraFinal = caixaAporte + (dados.reinvestirDividendos ? caixaDividendos : 0);
  const patrimonioFinal = cotasTotais * precoAtualCota + sobraFinal;
  const yieldOnCostAnual =
    totalDesembolsado > 0 ? ((rendaMensalFinal * 12) / totalDesembolsado) * 100 : 0;

  return {
    cotasFinais: cotasTotais,
    cotasDoBolso,
    cotasBolaDeNeve,
    patrimonioFinal,
    totalDesembolsado,
    rendaMensalFinal,
    dividendosAcumulados,
    yieldOnCostAnual,
    cotasNumeroMagico,
    valorNumeroMagico,
    mesAtingiuNumeroMagico,
    historico,
  };
}

export function calcularAnaliseAcao(dados: {
  precoAtual: number;
  valorAporte: number;
  dividendYieldEstimadoAnual: number;
  yieldMinimoBazin: number;
}) {
  const preco = Math.max(0.1, dados.precoAtual);
  const aporte = Math.max(0, dados.valorAporte);
  const dyDecimal = Math.min(0.35, Math.max(0, dados.dividendYieldEstimadoAnual) / 100);
  const bazinDecimal = Math.max(0.01, dados.yieldMinimoBazin) / 100;

  const quantidadeAcoes = Math.floor(aporte / preco);
  const valorInvestido = quantidadeAcoes * preco;
  const troco = aporte - valorInvestido;

  const dividendoAnualPorAcao = preco * dyDecimal;
  const precoTetoBazin = dividendoAnualPorAcao / bazinDecimal;
  const margemSeguranca = ((precoTetoBazin - preco) / preco) * 100;

  const rendaAnualEstimada = quantidadeAcoes * dividendoAnualPorAcao;
  const rendaMensalMedia = rendaAnualEstimada / 12;

  return {
    quantidadeAcoes,
    valorInvestido,
    troco,
    dividendoAnualPorAcao,
    precoTetoBazin,
    margemSeguranca,
    abaixoDoTeto: preco <= precoTetoBazin && dividendoAnualPorAcao > 0,
    rendaAnualEstimada,
    rendaMensalMedia,
  };
}
