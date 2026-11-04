import type { AtivoResumoB3, DetalheAtivoB3, TipoAtivoB3 } from '../types/rendaVariavel';

interface ItemListaBrapi {
  stock: string;
  name: string;
  close: number;
  change: number;
  volume: number;
  market_cap: number | null;
  sector: string | null;
  type: TipoAtivoB3;
  logo: string | null;
}

interface RespostaListaBrapi {
  stocks: ItemListaBrapi[];
}

interface ItemCotacaoDetalhadaBrapi {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
  marketCap?: number;
  priceEarnings?: number | null;
  earningsPerShare?: number | null;
  fiftyTwoWeekHigh?: number | null;
  fiftyTwoWeekLow?: number | null;
  logourl?: string;
  historicalDataPrice?: {
    date: number;
    close: number;
  }[];
}

const TRADUCAO_SETORES: Record<string, string> = {
  Finance: 'Financeiro & Bancos',
  'Energy Minerals': 'Petróleo, Gás & Combustíveis',
  'Non-Energy Minerals': 'Mineração & Siderurgia',
  Utilities: 'Energia Elétrica & Saneamento',
  'Retail Trade': 'Varejo & Comércio',
  'Electronic Technology': 'Tecnologia & Equipamentos',
  'Technology Services': 'Software & Serviços Tech',
  'Health Services': 'Saúde & Hospitais',
  'Health Technology': 'Farmacêutico & Diagnósticos',
  'Consumer Non-Durables': 'Alimentos, Bebidas & Consumo',
  'Consumer Durables': 'Bens Duráveis & Construção',
  'Process Industries': 'Papel, Celulose & Química',
  'Producer Manufacturing': 'Indústria & Máquinas',
  Transportation: 'Logística & Transporte',
  Communications: 'Telecomunicações',
  'Commercial Services': 'Serviços Corporativos',
  Miscellaneous: 'Fundos & Outros',
};

const FIIS_PRINCIPAIS = new Set([
  'MXRF11',
  'HGLG11',
  'XPML11',
  'KNCR11',
  'BTLG11',
  'VISC11',
  'XPLG11',
  'KNRI11',
  'CPTS11',
  'KNIP11',
  'IRDM11',
  'TGAR11',
]);

const FUNDOS_REGIO_EXCLUIDOS = new Set(['FNAM11', 'FNOR11', 'FSNE11']);

const ATIVOS_CONTINGENCIA: AtivoResumoB3[] = [
  { ticker: 'PETR4', nome: 'Petrobras PN', preco: 36.8, variacaoDia: 1.15, volume: 32000000, valorMercado: 482000000000, setor: 'Petróleo, Gás & Combustíveis', tipo: 'stock', logoUrl: 'https://icons.brapi.dev/icons/PETR4.svg' },
  { ticker: 'VALE3', nome: 'Vale ON', preco: 58.4, variacaoDia: -0.65, volume: 21000000, valorMercado: 258000000000, setor: 'Mineração & Siderurgia', tipo: 'stock', logoUrl: 'https://icons.brapi.dev/icons/VALE3.svg' },
  { ticker: 'ITUB4', nome: 'Itaú Unibanco PN', preco: 34.9, variacaoDia: 0.85, volume: 24000000, valorMercado: 335000000000, setor: 'Financeiro & Bancos', tipo: 'stock', logoUrl: 'https://icons.brapi.dev/icons/ITUB4.svg' },
  { ticker: 'WEGE3', nome: 'WEG ON', preco: 52.1, variacaoDia: 1.92, volume: 14500000, valorMercado: 218000000000, setor: 'Indústria & Máquinas', tipo: 'stock', logoUrl: 'https://icons.brapi.dev/icons/WEGE3.svg' },
  { ticker: 'BBAS3', nome: 'Banco do Brasil ON', preco: 27.6, variacaoDia: 0.42, volume: 19000000, valorMercado: 158000000000, setor: 'Financeiro & Bancos', tipo: 'stock', logoUrl: 'https://icons.brapi.dev/icons/BBAS3.svg' },
  { ticker: 'BPAC11', nome: 'BTG Pactual Unit', preco: 33.4, variacaoDia: -0.35, volume: 9800000, valorMercado: 145000000000, setor: 'Financeiro & Bancos', tipo: 'stock', logoUrl: 'https://icons.brapi.dev/icons/BPAC11.svg' },
  { ticker: 'ABEV3', nome: 'Ambev ON', preco: 12.4, variacaoDia: -0.8, volume: 22000000, valorMercado: 195000000000, setor: 'Alimentos, Bebidas & Consumo', tipo: 'stock', logoUrl: 'https://icons.brapi.dev/icons/ABEV3.svg' },
  { ticker: 'ELET3', nome: 'Eletrobras ON', preco: 39.2, variacaoDia: 1.4, volume: 8900000, valorMercado: 89000000000, setor: 'Energia Elétrica & Saneamento', tipo: 'stock', logoUrl: 'https://icons.brapi.dev/icons/ELET3.svg' },
];

const FIIS_CONTINGENCIA: AtivoResumoB3[] = [
  { ticker: 'MXRF11', nome: 'Maxi Renda FII', preco: 9.85, variacaoDia: 0.2, volume: 1200000, valorMercado: 4200000000, setor: 'Fundo Imobiliário', tipo: 'fund', logoUrl: null },
  { ticker: 'HGLG11', nome: 'CSHG Logística FII', preco: 156.5, variacaoDia: 0.35, volume: 420000, valorMercado: 5300000000, setor: 'Fundo Imobiliário', tipo: 'fund', logoUrl: null },
  { ticker: 'XPML11', nome: 'XP Malls FII', preco: 104.2, variacaoDia: -0.18, volume: 580000, valorMercado: 5700000000, setor: 'Fundo Imobiliário', tipo: 'fund', logoUrl: null },
  { ticker: 'KNCR11', nome: 'Kinea Rendimentos FII', preco: 103.8, variacaoDia: 0.12, volume: 610000, valorMercado: 6900000000, setor: 'Fundo Imobiliário', tipo: 'fund', logoUrl: null },
  { ticker: 'VISC11', nome: 'Vinci Shopping Centers', preco: 106.4, variacaoDia: 0.45, volume: 310000, valorMercado: 3100000000, setor: 'Fundo Imobiliário', tipo: 'fund', logoUrl: null },
  { ticker: 'BTLG11', nome: 'BTG Pactual Logística', preco: 98.9, variacaoDia: -0.1, volume: 490000, valorMercado: 4300000000, setor: 'Fundo Imobiliário', tipo: 'fund', logoUrl: null },
];

function traduzirSetor(setorIngles: string | null, tipo: TipoAtivoB3): string {
  if (tipo === 'fund') return 'Fundo Imobiliário';
  if (!setorIngles) return 'Mercado B3';
  return TRADUCAO_SETORES[setorIngles] ?? setorIngles;
}

function mapearItemLista(item: ItemListaBrapi): AtivoResumoB3 {
  return {
    ticker: item.stock,
    nome: item.name || item.stock,
    preco: Number(item.close) || 0,
    variacaoDia: Number(item.change) || 0,
    volume: Number(item.volume) || 0,
    valorMercado: item.market_cap ? Number(item.market_cap) : null,
    setor: traduzirSetor(item.sector, item.type),
    tipo: item.type,
    logoUrl: item.logo,
  };
}

export async function listarAtivosB3(opcoes: {
  tipo?: 'stock' | 'fund';
  busca?: string;
  limite?: number;
  ordenarPor?: 'market_cap_basic' | 'volume' | 'change';
}): Promise<{ ativos: AtivoResumoB3[]; aoVivo: boolean }> {
  const params = new URLSearchParams();
  if (opcoes.tipo) params.set('type', opcoes.tipo);
  if (opcoes.tipo === 'fund') params.set('subType', 'fii');
  if (opcoes.busca) params.set('search', opcoes.busca.trim().toUpperCase());

  const criterioPadrao =
    opcoes.tipo === 'fund' ? 'volume' : (opcoes.ordenarPor ?? 'market_cap_basic');

  params.set('limit', String(opcoes.tipo === 'fund' && !opcoes.busca ? 40 : (opcoes.limite ?? 16)));
  params.set('sortBy', criterioPadrao);
  params.set('sortOrder', 'desc');

  try {
    const resposta = await fetch(
      `https://brapi.dev/api/quote/list?${params.toString()}`,
      { signal: AbortSignal.timeout(8000) }
    );

    if (!resposta.ok) {
      throw new Error('Falha ao listar ativos B3');
    }

    const json = (await resposta.json()) as RespostaListaBrapi;
    let filtrados = (json.stocks ?? [])
      .map(mapearItemLista)
      .filter((item) => item.preco > 0 && !item.ticker.endsWith('F'));

    if (opcoes.tipo === 'fund') {
      filtrados = filtrados.filter(
        (item) =>
          item.ticker.endsWith('11') &&
          !FUNDOS_REGIO_EXCLUIDOS.has(item.ticker) &&
          (Boolean(opcoes.busca) || item.preco >= 6)
      );

      if (!opcoes.busca) {
        filtrados.sort((a, b) => {
          const aDestaque = FIIS_PRINCIPAIS.has(a.ticker) ? 1 : 0;
          const bDestaque = FIIS_PRINCIPAIS.has(b.ticker) ? 1 : 0;
          if (aDestaque !== bDestaque) return bDestaque - aDestaque;
          return b.volume - a.volume;
        });
      }
    } else if (opcoes.tipo === 'stock' && !opcoes.busca) {
      filtrados = filtrados.filter(
        (item) => item.preco >= 1 && /^[A-Z]{4}(3|4|5|6|11)$/.test(item.ticker)
      );
    }

    if (filtrados.length === 0 && !opcoes.busca) {
      return {
        ativos: opcoes.tipo === 'fund' ? FIIS_CONTINGENCIA : ATIVOS_CONTINGENCIA,
        aoVivo: false,
      };
    }

    return {
      ativos: filtrados.slice(0, opcoes.limite ?? 16),
      aoVivo: true,
    };
  } catch {
    const base = opcoes.tipo === 'fund' ? FIIS_CONTINGENCIA : ATIVOS_CONTINGENCIA;
    const termo = opcoes.busca?.trim().toUpperCase();
    const filtrados = termo
      ? base.filter(
          (a) => a.ticker.includes(termo) || a.nome.toUpperCase().includes(termo)
        )
      : base;
    return { ativos: filtrados, aoVivo: false };
  }
}

export async function consultarDetalheAtivoB3(
  tickerInformado: string,
  baseResumo?: AtivoResumoB3
): Promise<DetalheAtivoB3 | null> {
  const ticker = tickerInformado.trim().toUpperCase();
  if (!ticker) return null;

  let resumo: AtivoResumoB3 | undefined = baseResumo;

  if (!resumo) {
    const buscaLista = await listarAtivosB3({ busca: ticker, limite: 8 });
    resumo =
      buscaLista.ativos.find((item) => item.ticker === ticker) ?? buscaLista.ativos[0];
  }

  const tokenOpcional = import.meta.env.VITE_BRAPI_TOKEN as string | undefined;
  const tickersPublicosDetalhados = new Set(['PETR4', 'VALE3', 'ITUB4', 'MGLU3']);

  if (tickersPublicosDetalhados.has(ticker) || Boolean(tokenOpcional)) {
    try {
      const headers: Record<string, string> = {};
      if (tokenOpcional) {
        headers.Authorization = `Bearer ${tokenOpcional}`;
      }

      const resposta = await fetch(
        `https://brapi.dev/api/quote/${encodeURIComponent(ticker)}?range=1mo&interval=1d&fundamental=true`,
        { headers, signal: AbortSignal.timeout(7000) }
      );

      if (resposta.ok) {
        const json = (await resposta.json()) as { results?: ItemCotacaoDetalhadaBrapi[] };
        const det = json.results?.[0];
        if (det) {
          const historicoRecente = (det.historicalDataPrice ?? [])
            .filter((p) => Number.isFinite(p.close))
            .map((p) => ({
              data: new Date(p.date * 1000).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
              }),
              fechamento: p.close,
            }));

          return {
            ticker: det.symbol || ticker,
            nome: det.shortName || resumo?.nome || ticker,
            nomeCompleto: det.longName,
            preco: det.regularMarketPrice ?? resumo?.preco ?? 0,
            variacaoDia: det.regularMarketChangePercent ?? resumo?.variacaoDia ?? 0,
            volume: det.regularMarketVolume ?? resumo?.volume ?? 0,
            valorMercado: det.marketCap ?? resumo?.valorMercado ?? null,
            setor: resumo?.setor ?? 'Mercado B3',
            tipo: resumo?.tipo ?? 'stock',
            logoUrl: det.logourl ?? resumo?.logoUrl ?? null,
            precoLucro: det.priceEarnings ?? null,
            lucroPorAcao: det.earningsPerShare ?? null,
            maxima52Semanas: det.fiftyTwoWeekHigh ?? null,
            minima52Semanas: det.fiftyTwoWeekLow ?? null,
            historicoRecente,
          };
        }
      }
    } catch {
      // Usa dados resumidos da listagem
    }
  }

  if (!resumo) return null;

  return {
    ...resumo,
    historicoRecente: [],
  };
}
