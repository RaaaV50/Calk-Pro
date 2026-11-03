# Calk-Pro · Inteligência & Simulação Financeira

Aplicação web moderna de planejamento e simulação financeira construída para o mercado brasileiro, combinando **precisão matemática real** com uma interface limpa, responsiva e alternância entre **Modo Claro e Modo Escuro**.

---

## Principais Funcionalidades

- **Painel de Visão Geral (Dashboard):** acompanhamento da meta patrimonial ativa com curvas interativas de Saldo Líquido, Poder de Compra Real e Patrimônio Bruto contra o Total Investido.
- **Simulador de Juros Compostos:** cálculo de tabela regressiva de IR **lote a lote** (respeitando o tempo individual de cada aporte mensal) ou isenção de IR, desconto de inflação (IPCA), atalhos de mercado e **compartilhamento por link**.
- **Comparador CDB vs LCI/LCA vs Poupança:** compara o retorno líquido no horizonte escolhido e calcula automaticamente a **taxa equivalente** entre títulos tributados e isentos.
- **Viver de Renda (Independência Financeira):** estima o capital necessário para gerar uma renda passiva mensal perpétua preservando o poder de compra e o tempo até atingir o objetivo.
- **Simulador de Financiamento (SAC vs Price):** compara 1ª e última parcelas, custo efetivo em juros e a economia acumulada entre amortização constante e parcelas fixas.
- **Cenários Salvos & Backup:** salve múltiplos cenários localmente, alterne qual deles é a meta do painel e exporte/importe backups em `.json`.

---

## Tecnologias Utilizadas

- **React 19** + **TypeScript**
- **Vite 8**
- **Tailwind CSS v4** (com suporte nativo a tema claro/escuro)
- **Zustand** (gerenciamento de estado global persistido no `localStorage`)
- **Recharts** (visualização interativa de dados financeiros)
- **React Router v7** & **Lucide Icons**

---

## Como Executar Localmente

```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev

# Gerar build de produção
npm run build
```

---

## Autor

Desenvolvido por **Cassio Cortelini**
- GitHub: [@RaaaV50](https://github.com/RaaaV50)
- LinkedIn: [Cassio Cortelini](https://www.linkedin.com/in/cassio-cortelini/)
