# 🎵 Meu Wrapped

![Versão](https://img.shields.io/badge/version-1.0.0-ff4fa3)
![Licença](https://img.shields.io/badge/license-MIT-22d3ee)
![Status](https://img.shields.io/badge/status-concluído-4ade9a)

O **Meu Wrapped** é uma aplicação web interativa e responsiva criada para registrar suas escutas musicais e gerar uma retrospectiva anual personalizada com métricas de tempo, ranking de artistas/músicas/gêneros, análise de personalidade musical, estimativa de idade de escuta, gráficos de evolução e um quiz dinâmico sobre o seu ano em música.

---

## 🌟 Destaques do Projeto

- **Sincronização com API em Tempo Real:** Integração direta com a API pública do iTunes para busca de faixas, álbuns, capas e durações oficiais.
- **Suporte Multilíngue (i18n):** Alternador de idioma dinâmico em **Português (PT)** e **Inglês (EN)** sem necessidade de recarregar a página.
- **Visual Pop Escuro:** Design limpo e moderno com estética vibrante, transições suaves e tipografia moderna (*Plus Jakarta Sans* e *Inter*), sem depender de variáveis CSS para facilitar customizações manuais.
- **Gráfico SVG Dinâmico:** Gráfico interativo da *"Corrida dos Artistas"* construído via SVG nativo para acompanhar a evolução mensal dos seus 5 artistas favoritos.
- **Privacidade & Backup Local:** Todos os dados ficam salvos exclusivamente no `localStorage` do navegador do usuário. Inclui exportação e importação de backups em formato JSON.
- **Quiz Personalizado:** Pergunta sobre o seu ano com base nos seus dados reais gravados no aplicativo.
- **Design Mobile-First:** Totalmente responsivo e otimizado para celulares, tablets e desktops.

---

## 🚀 Funcionalidades

### 1. Registrar Escutas
- Busca de músicas e artistas em tempo real.
- Registro por música completa ou minutos personalizados ouvida.
- Seleção múltipla para registro em lote.
- Histórico de escutas ordenado com opção de exclusão individual ou em lote.

### 2. Painel Wrapped (Retrospectiva)
- **Métricas:** Total de horas e minutos ouvidos.
- **Personalidade Musical:** Algoritmo que analisa a diversidade e épocas das suas escutas (ex: *Nostálgico*, *Fiel*, *Explorador*, *Eclético*).
- **Idade de Escuta:** Estimativa da faixa etária baseada na época das músicas consumidas em comparação com a idade real do usuário.
- **Top Rankings:** Posição e tempo acumulado de Top Artistas, Top Músicas, Top Álbuns e Principais Gêneros.
- **Corrida dos Artistas:** Gráfico de posições acumuladas mês a mês.
- **Playlist Top 100:** Lista expansível das faixas mais tocadas no período selecionado.

### 3. Quiz do Seu Ano
- Perguntas geradas dinamicamente sobre suas estatísticas reais.
- Sistema de pontuação, feedback visual imediato e resultado final com opção de jogar novamente.

### 4. Gerenciamento de Dados
- Exportação de dados do histórico para arquivo `.json`.
- Importação e mesclagem de históricos sem duplicação de IDs.
- Opção de limpeza completa com confirmação de segurança.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estrutura semântica e acessível (com uso de `data-attributes` para tradução).
- **CSS3:** Estilização responsiva em CSS puro, sem uso de variáveis, com animações suaves, suporte a `prefers-reduced-motion` e layout em CSS Grid/Flexbox.
- **JavaScript (ES6+):** Código assíncrono (`fetch`, `async/await`), manipulação dinâmica do DOM, cálculos estatísticos e renderização de SVG.
- **iTunes Search API:** Consulta pública de metadados de mídia.
- **Google Fonts:** Famílias tipográficas *Plus Jakarta Sans* e *Inter*.

---

## 📁 Estrutura de Arquivos

```text
├── index.html   # Estrutura principal da aplicação e templates HTML
├── style.css    # Estilização completa do aplicativo (Pop Escuro)
├── i18n.js      # Sistema de internacionalização (Português / Inglês)
├── app.js       # Lógica do aplicativo, consumo de API, cálculos do Wrapped e Quiz
└── README.md    # Documentação do projeto
