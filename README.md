# Calk-Pro · Inteligência & Simulação Financeira

Ferramenta web minimalista de simulação e planejamento financeiro integrada automaticamente à **API do Banco Central do Brasil (SGS/BCB)** para atualização em tempo real do **CDI, Selic e IPCA**.

---

## Módulos

- **Visão Geral:** painel enxuto de acompanhamento patrimonial (Saldo Líquido, Poder de Compra Real e Bruto) e gestão rápida de cenários salvos.
- **Juros Compostos Avançado:** indexação por `% do CDI`, `IPCA +` ou `Taxa Fixa`, IR regressivo calculado lote a lote, reajuste anual de aportes pela inflação, crescimento real de aportes, 13º/aporte extra anual, taxa de custódia e meta de tempo.
- **Comparador Renda Fixa:** comparação simultânea entre CDB, LCI/LCA, Tesouro IPCA+ (com taxa B3) e Poupança, incluindo equivalência tributária automática.
- **Planejador de Metas & Reserva de Emergência:** cálculo reverso do aporte mensal exato para atingir um objetivo financeiro ou montar o colchão de segurança.
- **Viver de Renda:** simulação de independência financeira em 3 regimes (renda perpétua, consumo de capital por prazo ou taxa de retirada fixa) e cálculo reverso pela idade alvo.
- **Financiamento & Amortização Extra:** comparativo SAC vs Price somado ao simulador de amortização mensal extra (economia de juros e meses cortados).
- **Conversor de Taxas & Juros Reais:** conversão instantânea entre ano, mês e dia útil (base 252), ganho real (equação de Fisher) e equivalência líquida/bruta por faixa de IR.

---

## Stack

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS v4** (Modo Claro / Escuro)
- **Zustand** (estado persistido no navegador)
- **Recharts** + **API SGS Banco Central (`api.bcb.gov.br`)**

---

## Execução Local

```bash
npm install
npm run dev
```

---

## Autor

**Cassio Cortelini**
- GitHub: [@RaaaV50](https://github.com/RaaaV50)
- LinkedIn: [Cassio Cortelini](https://www.linkedin.com/in/cassio-cortelini/)
