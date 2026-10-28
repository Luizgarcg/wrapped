<div align="center">

<img src="favicon.svg" alt="Logo do Meu Wrapped" width="110" height="110">

# 🎧 Meu Wrapped

### Registre o que você ouve e veja o seu ano em música. Sem login: tudo fica no seu navegador.

<img alt="HTML5" src="https://img.shields.io/badge/HTML5-14102B?style=for-the-badge&logo=html5&logoColor=FFD84D">
<img alt="CSS3" src="https://img.shields.io/badge/CSS3-14102B?style=for-the-badge&logo=css3&logoColor=22D3EE">
<img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-14102B?style=for-the-badge&logo=javascript&logoColor=FFD84D">
<img alt="Vercel" src="https://img.shields.io/badge/Vercel-14102B?style=for-the-badge&logo=vercel&logoColor=A78BFA">
<img alt="Idiomas" src="https://img.shields.io/badge/PT%20%7C%20EN-14102B?style=for-the-badge&logoColor=white">
<img alt="Vibe coding" src="https://img.shields.io/badge/vibe%20coding-Gemini%20%2B%20Claude-14102B?style=for-the-badge&logoColor=white">

**[▶ Abrir na Vercel](https://wrapped-chi-nine.vercel.app/)**  ·  **[▶ Abrir no GitHub Pages](https://luizgarcg.github.io/wrapped/)**

```
      ▂ ▅ █ ▆ ▃        ▃ ▆ █ ▅ ▂
   ▂ ▅ █ █ █ █ ▅ ▂  ▂ ▅ █ █ █ █ ▅ ▂
```

</div>

---

## 🎵 O que é isso?

Todo fim de ano os apps de música soltam o Wrapped deles, mas ele só conta o que você ouviu ali dentro. Eu queria um que contasse o resto também.

No **Meu Wrapped** você busca uma música, registra quanto ouviu (completa ou só alguns minutos) e o site monta o resumo: horas ouvidas, artistas favoritos, gêneros e até uma *personalidade musical*. No fim tem um quiz para ver se você conhece o seu próprio gosto.

> Tudo fica **só no seu navegador**. Nenhuma conta, nenhum servidor guardando o que você ouve.

---

## ✨ O que dá pra fazer

### 📝 Registrar
- 🔎 **Buscar** qualquer música ou artista (a base vem da API de busca do iTunes)
- ✅ Marcar **várias músicas de uma vez** e registrar todas juntas. A seleção continua mesmo se você fizer outra busca
- 📅 Escolher a **data** em que ouviu
- ⏱️ Dizer se ouviu **completa** ou informar só os **minutos** ouvidos
- 🗑️ Remover escutas uma a uma ou em lote

### 📊 O seu Wrapped
| Bloco | O que mostra |
|---|---|
| ⏳ **Horas ouvidas** | O tempo total que você passou ouvindo música |
| 🕒 **Minutos de audição** | A mesma conta, em minutos |
| 🧠 **Personalidade** | Um perfil musical a partir do que você escuta |
| 🎂 **Idade de escuta** | Uma estimativa pela época das suas músicas (informar o ano de nascimento é opcional) |
| 🎤 **Top artistas** | Quem mais tocou na sua vida |
| 🎶 **Top músicas** | As campeãs de repetição |
| 🏁 **Corrida dos artistas** | A disputa mês a mês entre os seus 5 artistas favoritos, com o 1º lugar no topo |
| 💿 **Álbuns mais ouvidos** | Os discos que não saem da sua cabeça |
| 🎸 **Principais gêneros** | O que define o seu som |
| 📜 **Playlist** | Uma lista das suas músicas mais ouvidas |

Dá para filtrar por **ano** ou ver **todos os anos** juntos.

### 🧩 Quiz do seu ano
As perguntas são geradas **com os seus próprios dados**: qual foi a sua música mais ouvida, o artista número 1, o álbum e o gênero favoritos.

### 🌎 Extras
- 🇧🇷🇺🇸 Site em **português e inglês**, com troca em um clique
- 💾 **Backup**: exporte as suas escutas para um arquivo e importe de volta quando quiser
- ♿ Pensado para **acessibilidade**: respeita quem prefere menos animação e não depende só de cor nas respostas do quiz

---

## 🛠️ Feito com

- **HTML, CSS e JavaScript puro**, sem frameworks
- **API de busca do iTunes** para achar as músicas, capas e durações
- **localStorage** para guardar tudo no seu navegador
- **Função serverless na Vercel** (pasta `api`) que faz a busca no iTunes pelo servidor, para o site funcionar em todos os aparelhos, inclusive no iPhone

---

## 🤖 Como foi feito

Esse projeto usou vibe coding, com **Gemini** e **Claude**, mas não foi só isso. Eu explicava em português como queria cada parte (a busca, o wrapped, o quiz, a versão em inglês) e as IAs escreviam uma base de código. Em cima dela eu apliquei o que sei de **HTML, CSS e JavaScript**: testei, ajustei o que não estava do jeito que eu queria e personalizei o **CSS** por conta própria, com as cores, as fontes e o visual.

---

## 🚀 Como rodar

**Jeito rápido (só ver o site):**
1. Baixe o projeto
2. Abra o `index.html` no navegador

**Jeito completo (com a função da busca):**
1. Instale o [Vercel CLI](https://vercel.com/docs/cli)
2. Na pasta do projeto, rode:
   ```bash
   vercel dev
   ```
3. Abra o endereço que aparecer no terminal

> Abrindo só o `index.html`, a busca tenta ir direto ao iTunes. Em alguns aparelhos (como o iPhone) isso não funciona. Por isso a função da Vercel existe.

---

## 🗂️ Estrutura

```
meu-wrapped/
├── index.html            # a página e os moldes das telas
├── style.css             # o visual (roxo, ciano e amarelo)
├── app.js                # busca, registro, wrapped e quiz
├── i18n.js               # textos em português e inglês
├── favicon.svg           # o ícone das barrinhas
├── favicon.ico
├── apple-touch-icon.png
└── api/
    └── buscar.js         # função da Vercel que consulta o iTunes
```

---

## 🔒 Privacidade

- Suas escutas ficam **apenas no seu navegador** (localStorage)
- Não existe cadastro nem login
- Trocou de aparelho ou limpou os dados do navegador? **Exporte o backup antes**, senão as escutas somem

---

## 🎨 Paleta

| Cor | Código |
|---|---|
| 🟣 Roxo | `#A78BFA` |
| 🔵 Ciano | `#22D3EE` |
| 🟡 Amarelo | `#FFD84D` |
| ⚫ Fundo | `#14102B` |

---

<div align="center">

Feito por **[Luis Eduardo](https://github.com/luizgarcg)**

Achou algum bug? Me avisa.

</div>
