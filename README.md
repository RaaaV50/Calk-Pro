# CalkPro · Inteligência & Simulação Financeira

Plataforma web moderna de simulação e análise financeira integrada em tempo real à **API SGS do Banco Central do Brasil** (CDI, Selic e IPCA) e à **API de cotações da B3 (Brapi)** para consulta de Ações e Fundos Imobiliários.

---

## Módulos

- **Juros Compostos:** simulação indexada a `% do CDI`, `IPCA +` ou `Taxa Fixa`, com IR regressivo calculado aporte a aporte, reajuste anual pela inflação, aportes extras e compartilhamento via link.
- **Comparador Renda Fixa & Conversor de Taxas:** disputa líquida entre CDB, LCI/LCA, Tesouro IPCA+ (com custódia B3) e Poupança, equivalência tributária e conversão entre taxas anuais, mensais e diárias (base 252).
- **Fundos Imobiliários (FIIs) — Bola de Neve & Número Mágico:** busca automática do preço da cota de qualquer FII na B3, cálculo do *Magic Number* (cotas necessárias para os aluguéis comprarem +1 cota/mês sozinhos), Yield on Cost e cotas geradas pelos dividendos.
- **Mapa de Calor & Análise de Ações (B3):** mapa térmico interativo das empresas da Bolsa (Maiores da B3, Maiores Altas e Mais Negociadas), busca de qualquer ticker, indicadores de mercado, cálculo de **Preço Teto Justo (Método Décio Bazin)**, margem de segurança e projeção de dividendos.
- **Planejador de Metas & Reserva de Emergência:** cálculo reverso do aporte mensal exato para atingir objetivos ou construir colchão de segurança (CLT, Autônomo ou Empresário).
- **Viver de Renda (Aposentadoria):** cálculo em poder de compra real nos modos Renda Perpétua, Consumo por Prazo ou Regra %, com meta reversa pela idade alvo.
- **Financiamento & Amortização Extra:** comparativo Tabela SAC vs Price somado ao impacto de amortizações mensais extras no saldo devedor.
- **Painel Consolidado:** acompanhamento da projeção principal fixada e gestão dos cenários salvos.

---

## Stack

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS v4** (Modo Claro / Escuro)
- **Zustand** (estado persistido no `localStorage`)
- **Recharts** (visualização de dados)
- **APIs Públicas:** Banco Central (`api.bcb.gov.br`) & B3 (`brapi.dev`)

---

## Execução Local

```bash
npm install
npm run dev
```

*(Opcional)* Para liberar histórico de 30 pregões e P/L detalhado em 100% dos tickers na rota individual da Brapi (além da listagem e busca geral que já funcionam sem chave), defina `VITE_BRAPI_TOKEN=seu_token_gratuito` em um arquivo `.env`.

---

## Autor

**Cassio Cortelini**
- GitHub: [@RaaaV50](https://github.com/RaaaV50)
- LinkedIn: [Cassio Cortelini](https://www.linkedin.com/in/cassio-cortelini/)
