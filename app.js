// ===== Elementos da página =====
const formBusca = document.getElementById("form-busca");
const campoBusca = document.getElementById("campo-busca");
const listaResultados = document.getElementById("resultados");
const msgBusca = document.getElementById("msg-busca");
const moldeFaixa = document.getElementById("tpl-faixa");
const listaEscutas = document.getElementById("escutas");

// Guarda os resultados da última busca (usados ao registrar a escuta)
let resultadosAtuais = new Map();

// ===== API do iTunes =====
const URL_API = "https://itunes.apple.com/search";

async function buscarMusicas(termo) {
  const params = new URLSearchParams({
    term: termo,
    media: "music",
    entity: "song",
    limit: 10,
    country: "BR",
  });

  const resposta = await fetch(`${URL_API}?${params}`);
  if (!resposta.ok) {
    throw new Error(`Erro na API: ${resposta.status}`);
  }

  const dados = await resposta.json();

  return dados.results
    .filter((item) => item.trackTimeMillis) // sem duração não dá para calcular as horas
    .map(normalizar);
}

// Converte o formato da API para o formato do nosso modelo conceitual
function normalizar(item) {
  return {
    id: item.trackId,
    titulo: item.trackName,
    artista: item.artistName,
    album: item.collectionName || "Sem álbum",
    ano: new Date(item.releaseDate).getFullYear(),
    duracaoSeg: Math.round(item.trackTimeMillis / 1000),
    capa: item.artworkUrl100,
    genero: item.primaryGenreName || "Desconhecido",
  };
}

// ===== Exibição dos resultados =====
function formatarDuracao(segundos) {
  const min = Math.floor(segundos / 60);
  const seg = String(segundos % 60).padStart(2, "0");
  return `${min}:${seg}`;
}

function criarItem(faixa) {
  const item = document
    .importNode(moldeFaixa.content, true)
    .querySelector(".faixa");

  item.dataset.id = faixa.id;
  item.querySelector(".faixa__capa").src = faixa.capa;
  item.querySelector(".faixa__titulo").textContent = faixa.titulo;
  item.querySelector(".faixa__artista").textContent = faixa.artista;
  item.querySelector(".faixa__duracao").textContent = formatarDuracao(
    faixa.duracaoSeg,
  );

  const campoData = item.querySelector('input[type="date"]');
  campoData.value = hoje();
  campoData.max = hoje();

  return item;
}

function mostrarResultados(faixas) {
  resultadosAtuais = new Map(faixas.map((faixa) => [String(faixa.id), faixa]));
  listaResultados.replaceChildren(...faixas.map(criarItem));
}

// ===== Evento da busca =====
formBusca.addEventListener("submit", async (evento) => {
  evento.preventDefault(); // impede a página de recarregar

  const termo = campoBusca.value.trim();
  if (!termo) return;

  const botao = formBusca.querySelector("button");
  botao.disabled = true;
  listaResultados.replaceChildren();
  msgBusca.textContent = "Buscando...";

  try {
    const faixas = await buscarMusicas(termo);

    if (faixas.length === 0) {
      msgBusca.textContent = "Nenhum resultado. Tente outro nome.";
    } else {
      mostrarResultados(faixas);
    }
  } catch (erro) {
    console.error(erro);
    msgBusca.textContent =
      "Não foi possível buscar agora. Verifique sua internet e tente de novo.";
  } finally {
    botao.disabled = false;
  }
});

// ===== Armazenamento (localStorage) =====
const CHAVE_ESCUTAS = "escutas";

function carregarEscutas() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_ESCUTAS)) || [];
  } catch (erro) {
    console.error("Não foi possível ler as escutas salvas:", erro);
    return [];
  }
}

function salvarEscutas(escutas) {
  try {
    localStorage.setItem(CHAVE_ESCUTAS, JSON.stringify(escutas));
    return true;
  } catch (erro) {
    console.error("Não foi possível salvar:", erro);
    return false;
  }
}

// Data de hoje no horário local, no formato AAAA-MM-DD
function hoje() {
  return new Date().toLocaleDateString("sv-SE");
}

function registrarEscuta(faixa, minutosOuvidos, data) {
  const escutas = carregarEscutas();

  escutas.push({
    id: Date.now(),
    musicaId: faixa.id,
    titulo: faixa.titulo,
    artista: faixa.artista,
    album: faixa.album,
    ano: faixa.ano,
    duracaoSeg: faixa.duracaoSeg,
    capa: faixa.capa,
    genero: faixa.genero || "Desconhecido",
    completa: minutosOuvidos >= faixa.duracaoSeg / 60,
    minutosOuvidos: minutosOuvidos,
    data: data,
  });

  return salvarEscutas(escutas);
}

// ===== Lista "Suas escutas" =====
function formatarMinutos(minutos) {
  return `${Math.round(minutos * 10) / 10} min`;
}

function formatarData(data) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function criarItemEscuta(escuta) {
  const item = document.createElement("li");
  item.className = "faixa";

  const capa = document.createElement("img");
  capa.className = "faixa__capa";
  capa.alt = "";
  capa.src = escuta.capa;

  const info = document.createElement("div");
  info.className = "faixa__info";

  const titulo = document.createElement("strong");
  titulo.className = "faixa__titulo";
  titulo.textContent = escuta.titulo;

  const artista = document.createElement("span");
  artista.className = "faixa__artista";
  artista.textContent = `${escuta.artista} · ${formatarData(escuta.data)}`;

  info.append(titulo, artista);

  const tempo = document.createElement("span");
  tempo.className = "faixa__duracao";
  tempo.textContent = escuta.completa
    ? "Completa"
    : formatarMinutos(escuta.minutosOuvidos);

  const remover = document.createElement("button");
  remover.type = "button";
  remover.className = "faixa__remover";
  remover.dataset.remover = escuta.id;
  remover.textContent = "Remover";

  item.append(capa, info, tempo, remover);
  return item;
}

function mostrarEscutas() {
  const escutas = carregarEscutas();
  atualizarFiltroAno(escutas);
  const maisRecentesPrimeiro = [...escutas].reverse();
  listaEscutas.replaceChildren(...maisRecentesPrimeiro.map(criarItemEscuta));
  mostrarWrapped(escutas);
}

// ===== Cliques nos botões de cada resultado =====
function mostrarAviso(item, texto) {
  let aviso = item.querySelector(".registro__aviso");
  if (!aviso) {
    aviso = document.createElement("p");
    aviso.className = "registro__aviso";
    aviso.setAttribute("role", "alert");
    item.querySelector(".registro__corpo").append(aviso);
  }
  aviso.textContent = texto;
}

listaResultados.addEventListener("click", (evento) => {
  const botao = evento.target.closest("button[data-acao]");
  if (!botao) return;

  const item = botao.closest(".faixa");
  const faixa = resultadosAtuais.get(item.dataset.id);
  if (!faixa) return;

  const duracaoMin = faixa.duracaoSeg / 60;

  const data = item.querySelector('input[type="date"]').value;
  if (!data) {
    mostrarAviso(item, "Informe a data em que você ouviu.");
    return;
  }
  if (data > hoje()) {
    mostrarAviso(item, "A data não pode ser no futuro.");
    return;
  }

  let minutos;

  if (botao.dataset.acao === "completa") {
    minutos = duracaoMin;
  } else {
    const campo = item.querySelector('input[type="number"]');
    minutos = campo.valueAsNumber;

    if (!minutos || minutos <= 0) {
      mostrarAviso(item, "Informe quantos minutos você ouviu.");
      return;
    }
    if (minutos > duracaoMin) {
      mostrarAviso(
        item,
        `A música tem só ${formatarMinutos(duracaoMin)}. Informe um valor menor.`,
      );
      return;
    }
    campo.value = "";
  }

  if (!registrarEscuta(faixa, minutos, data)) {
    mostrarAviso(
      item,
      "Não foi possível salvar. O armazenamento do navegador pode estar bloqueado.",
    );
    return;
  }

  item.querySelector(".registro__aviso")?.remove();
  item.querySelector("details").open = false; // fecha o formulário
  mostrarEscutas();
});

// ===== Cálculos do wrapped =====
const ANO_ATUAL = new Date().getFullYear();

// Soma os minutos ouvidos agrupando por uma chave (artista, música, álbum)
function somarPor(escutas, chaveFn, rotuloFn) {
  const grupos = new Map();

  for (const escuta of escutas) {
    const chave = chaveFn(escuta);
    const grupo = grupos.get(chave) || {
      rotulo: rotuloFn(escuta),
      minutos: 0,
      vezes: 0,
    };
    grupo.minutos += escuta.minutosOuvidos;
    grupo.vezes += 1;
    grupos.set(chave, grupo);
  }

  return [...grupos.values()].sort((a, b) => b.minutos - a.minutos);
}

function calcularWrapped(escutas) {
  const totalMin = escutas.reduce((soma, e) => soma + e.minutosOuvidos, 0);

  // ano médio de lançamento, com peso nos minutos ouvidos
  const anoMedio =
    totalMin > 0
      ? Math.round(
          escutas.reduce((soma, e) => soma + e.ano * e.minutosOuvidos, 0) /
            totalMin,
        )
      : null;

  return {
    qtd: escutas.length,
    totalMin,
    anoMedio,
    artistas: somarPor(
      escutas,
      (e) => e.artista,
      (e) => e.artista,
    ),
    // músicas: ranking por número de vezes ouvidas; empate decide pelos minutos
    musicas: somarPor(
      escutas,
      (e) => e.musicaId,
      (e) => `${e.titulo} — ${e.artista}`,
    ).sort((a, b) => b.vezes - a.vezes || b.minutos - a.minutos),
    // gêneros: escutas sem gênero (registradas antes dessa função) não entram
    generos: somarPor(
      escutas,
      (e) => e.genero || "Desconhecido",
      (e) => e.genero || "Desconhecido",
    ).filter((g) => g.rotulo !== "Desconhecido"),
    albuns: somarPor(
      escutas,
      (e) => `${e.album}|${e.artista}`,
      (e) => `${e.album || "Sem álbum"} — ${e.artista}`,
    ),
  };
}

// Regras simples; dá para ajustar os números depois
function definirPersonalidade(wrapped) {
  if (wrapped.qtd < 5) return "Ainda descobrindo";

  const idadeDaMusica = ANO_ATUAL - wrapped.anoMedio;
  const parteDoTopArtista = wrapped.artistas[0].minutos / wrapped.totalMin;
  const variedade = wrapped.artistas.length / wrapped.qtd; // 1 = todo registro é um artista diferente

  if (idadeDaMusica >= 15) return "Nostálgico";
  if (parteDoTopArtista >= 0.5) return "Fiel";
  if (variedade >= 0.6) return "Explorador";
  return "Eclético";
}

// ===== Tela do wrapped =====
function formatarHoras(minutos) {
  // minutos / 6 = décimos de hora; Math.round arredonda 0,35 para 0,4 (toFixed daria 0,3)
  return `${(Math.round(minutos / 6) / 10).toFixed(1).replace(".", ",")} h`;
}

function formatarTempo(minutos) {
  if (minutos < 60) return `${Math.round(minutos)} min`;
  return `${(minutos / 60).toFixed(1).replace(".", ",")} h`;
}

function preencherRanking(lista, itens, limite = 5) {
  if (itens.length === 0) {
    const vazio = document.createElement("li");
    vazio.className = "ranking__vazio";
    vazio.textContent = "Sem dados ainda";
    lista.replaceChildren(vazio);
    return;
  }

  const linhas = itens.slice(0, limite).map((item) => {
    const linha = document.createElement("li");

    const nome = document.createElement("span");
    nome.className = "ranking__nome";
    nome.textContent = item.rotulo;

    const tempo = document.createElement("span");
    tempo.className = "ranking__tempo";
    tempo.textContent = `${item.vezes}x · ${formatarTempo(item.minutos)}`;

    linha.append(nome, tempo);
    return linha;
  });

  lista.replaceChildren(...linhas);
}

const filtroAno = document.getElementById("filtro-ano");

// Monta as opções do filtro com os anos que existem nas escutas
function atualizarFiltroAno(escutas) {
  const anos = [
    ...new Set(escutas.map((e) => (e.data || "").slice(0, 4)).filter(Boolean)),
  ]
    .sort()
    .reverse();
  const selecionado = filtroAno.value;

  filtroAno.replaceChildren(
    new Option("Todos os anos", "todos"),
    ...anos.map((ano) => new Option(ano, ano)),
  );
  filtroAno.value = anos.includes(selecionado) ? selecionado : "todos";
}

filtroAno.addEventListener("change", () => mostrarWrapped(carregarEscutas()));

function escutasDoPeriodo(todasAsEscutas) {
  const ano = filtroAno.value;
  return ano === "todos"
    ? todasAsEscutas
    : todasAsEscutas.filter((e) => (e.data || "").startsWith(ano));
}

// ----- Idade de escuta -----
// Estimativa: assumimos que o gosto musical se forma por volta dos 17 anos (valor escolhido por nós, dá para ajustar).
// Se a média das suas músicas é de 2014, é como alguém que tinha 17 anos em 2014.
const IDADE_DO_GOSTO = 17;
const ANO_NASCIMENTO_MIN = 1930;
const CHAVE_NASCIMENTO = "anoNascimento";
const campoNascimento = document.getElementById("ano-nascimento");

function lerAnoNascimento() {
  try {
    const ano = Number(localStorage.getItem(CHAVE_NASCIMENTO));
    return Number.isInteger(ano) &&
      ano >= ANO_NASCIMENTO_MIN &&
      ano <= ANO_ATUAL
      ? ano
      : null;
  } catch (erro) {
    return null;
  }
}

campoNascimento.max = ANO_ATUAL;
campoNascimento.value = lerAnoNascimento() || "";

campoNascimento.addEventListener("change", () => {
  const ano = campoNascimento.valueAsNumber;
  const valido =
    Number.isInteger(ano) && ano >= ANO_NASCIMENTO_MIN && ano <= ANO_ATUAL;

  try {
    if (valido) localStorage.setItem(CHAVE_NASCIMENTO, String(ano));
    else localStorage.removeItem(CHAVE_NASCIMENTO);
  } catch (erro) {
    console.error(erro);
  }

  if (!valido) campoNascimento.value = "";
  mostrarWrapped(carregarEscutas());
});

function mostrarIdadeDeEscuta(wrapped) {
  const numero = document.getElementById("stat-idade");
  const detalhe = document.getElementById("stat-idade-detalhe");

  if (wrapped.qtd === 0) {
    numero.textContent = "—";
    detalhe.textContent = "Registre músicas para descobrir.";
    return;
  }

  const idadeDeEscuta = ANO_ATUAL - (wrapped.anoMedio - IDADE_DO_GOSTO);
  numero.textContent = `${idadeDeEscuta} anos`;

  const nascimento = lerAnoNascimento();
  let comparacao =
    "Informe seu ano de nascimento para comparar com a sua idade real.";

  if (nascimento) {
    const idadeReal = ANO_ATUAL - nascimento;
    const diferenca = idadeDeEscuta - idadeReal;

    if (Math.abs(diferenca) <= 2) {
      comparacao = `Você tem ${idadeReal} anos e escuta como alguém da sua idade.`;
    } else if (diferenca > 0) {
      comparacao = `Você tem ${idadeReal} anos, mas escuta como alguém ${diferenca} anos mais velho.`;
    } else {
      comparacao = `Você tem ${idadeReal} anos, mas escuta como alguém ${-diferenca} anos mais novo.`;
    }
  }

  detalhe.textContent = `A média das suas músicas é de ${wrapped.anoMedio}. ${comparacao}`;
}

function mostrarWrapped(todasAsEscutas) {
  const ano = filtroAno.value;
  const escutas = escutasDoPeriodo(todasAsEscutas);
  const wrapped = calcularWrapped(escutas);
  const temDados = wrapped.qtd > 0;

  document.getElementById("stat-horas").textContent = temDados
    ? formatarHoras(wrapped.totalMin)
    : "0";
  document.getElementById("stat-minutos").textContent = Math.round(
    wrapped.totalMin,
  ).toLocaleString("pt-BR");

  mostrarIdadeDeEscuta(wrapped);

  document.getElementById("stat-personalidade").textContent = temDados
    ? definirPersonalidade(wrapped)
    : "—";

  preencherRanking(document.getElementById("top-artistas"), wrapped.artistas);
  preencherRanking(document.getElementById("top-musicas"), wrapped.musicas);
  preencherRanking(document.getElementById("top-albuns"), wrapped.albuns);
  preencherRanking(document.getElementById("top-generos"), wrapped.generos);

  // playlist com as 100 músicas mais ouvidas
  const nomePeriodo = ano === "todos" ? "" : ` de ${ano}`;
  const totalNaPlaylist = Math.min(wrapped.musicas.length, 100);
  document.getElementById("titulo-playlist").textContent =
    `Suas músicas mais ouvidas${nomePeriodo} · ${totalNaPlaylist} ${totalNaPlaylist === 1 ? "música" : "músicas"}`;
  preencherRanking(
    document.getElementById("playlist-lista"),
    wrapped.musicas,
    100,
  );
}

// ===== Remover escuta =====
listaEscutas.addEventListener("click", (evento) => {
  const botao = evento.target.closest("button[data-remover]");
  if (!botao) return;

  if (!confirm("Remover esta escuta?")) return;

  const id = Number(botao.dataset.remover);
  salvarEscutas(carregarEscutas().filter((escuta) => escuta.id !== id));
  mostrarEscutas();
});

// ===== Backup (exportar e importar JSON) =====
const msgBackup = document.getElementById("msg-backup");

function montarBackup() {
  return JSON.stringify(
    { versao: 1, exportadoEm: hoje(), escutas: carregarEscutas() },
    null,
    2,
  );
}

document.getElementById("btn-exportar").addEventListener("click", () => {
  const escutas = carregarEscutas();
  if (escutas.length === 0) {
    msgBackup.textContent = "Não há escutas para exportar ainda.";
    return;
  }

  const arquivo = new Blob([montarBackup()], { type: "application/json" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = `meu-wrapped-${hoje()}.json`;
  link.click();
  URL.revokeObjectURL(url);

  msgBackup.textContent = `${escutas.length} escutas exportadas.`;
});

const campoArquivo = document.getElementById("arquivo-backup");

document
  .getElementById("btn-importar")
  .addEventListener("click", () => campoArquivo.click());

// Aceita só registros com os campos que o app precisa e copia apenas esses campos
function limparEscuta(bruta) {
  const textoOk = (v) => typeof v === "string" && v.length > 0;
  const numeroOk = (v) => typeof v === "number" && Number.isFinite(v);

  if (!bruta || typeof bruta !== "object") return null;
  if (!numeroOk(bruta.id) || !textoOk(bruta.titulo) || !textoOk(bruta.artista))
    return null;
  if (
    !numeroOk(bruta.ano) ||
    !numeroOk(bruta.duracaoSeg) ||
    bruta.duracaoSeg <= 0
  )
    return null;
  if (!numeroOk(bruta.minutosOuvidos) || bruta.minutosOuvidos <= 0) return null;

  return {
    id: bruta.id,
    musicaId: bruta.musicaId,
    titulo: bruta.titulo,
    artista: bruta.artista,
    album: textoOk(bruta.album) ? bruta.album : "Sem álbum",
    ano: bruta.ano,
    duracaoSeg: bruta.duracaoSeg,
    capa:
      typeof bruta.capa === "string" && bruta.capa.startsWith("https://")
        ? bruta.capa
        : "",
    genero: textoOk(bruta.genero) ? bruta.genero : "Desconhecido",
    completa: Boolean(bruta.completa),
    minutosOuvidos: bruta.minutosOuvidos,
    data: textoOk(bruta.data) ? bruta.data : hoje(),
  };
}

campoArquivo.addEventListener("change", async () => {
  const arquivo = campoArquivo.files[0];
  if (!arquivo) return;

  try {
    const dados = JSON.parse(await arquivo.text());
    const lista = Array.isArray(dados) ? dados : dados.escutas;
    if (!Array.isArray(lista)) throw new Error("formato inesperado");

    const atuais = carregarEscutas();
    const idsAtuais = new Set(atuais.map((escuta) => escuta.id));
    const novas = lista
      .map(limparEscuta)
      .filter((escuta) => escuta && !idsAtuais.has(escuta.id));

    salvarEscutas([...atuais, ...novas]);
    mostrarEscutas();
    msgBackup.textContent = `${novas.length} escutas importadas. ${lista.length - novas.length} ignoradas (repetidas ou inválidas).`;
  } catch (erro) {
    console.error(erro);
    msgBackup.textContent =
      "Não foi possível importar. Use um arquivo exportado por este app.";
  } finally {
    campoArquivo.value = ""; // permite escolher o mesmo arquivo de novo
  }
});

// ===== Quiz =====
const areaQuiz = document.getElementById("quiz-area");
let quiz = null;

function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Monta uma pergunta com a resposta certa (1º do ranking) e até 3 erradas sorteadas.
// Se o 1º lugar empata com o 2º, a pergunta seria ambígua e é descartada.
function criarPergunta(enunciado, ranking, empatam) {
  if (ranking.length < 2 || empatam(ranking[0], ranking[1])) return null;

  const correta = ranking[0];
  const erradas = embaralhar(ranking.slice(1)).slice(0, 3);
  return { enunciado, correta, opcoes: embaralhar([correta, ...erradas]) };
}

function gerarPerguntas(wrapped, periodo) {
  const mesmosMinutos = (a, b) => Math.abs(a.minutos - b.minutos) < 1e-9;
  const mesmaMusica = (a, b) => a.vezes === b.vezes && mesmosMinutos(a, b);

  return [
    criarPergunta(
      `Qual foi a sua música mais ouvida${periodo}?`,
      wrapped.musicas,
      mesmaMusica,
    ),
    criarPergunta(
      `Qual artista você mais ouviu${periodo}?`,
      wrapped.artistas,
      mesmosMinutos,
    ),
    criarPergunta(
      `Qual álbum você mais ouviu${periodo}?`,
      wrapped.albuns,
      mesmosMinutos,
    ),
    criarPergunta(
      `Qual gênero mais marcou o seu som${periodo}?`,
      wrapped.generos,
      mesmosMinutos,
    ),
  ].filter(Boolean);
}

function textoDoPeriodo() {
  return filtroAno.value === "todos" ? "" : ` em ${filtroAno.value}`;
}

function gerarPerguntasDoPeriodo() {
  const wrapped = calcularWrapped(escutasDoPeriodo(carregarEscutas()));
  return gerarPerguntas(wrapped, textoDoPeriodo());
}

function mostrarInicioQuiz() {
  quiz = null;
  const perguntas = gerarPerguntasDoPeriodo();
  const cartao = criarElemento("div", "quiz__cartao");

  if (perguntas.length === 0) {
    cartao.append(
      criarElemento(
        "p",
        "quiz__texto",
        "Registre pelo menos 2 músicas diferentes para jogar. Empates no primeiro lugar também impedem a pergunta.",
      ),
    );
  } else {
    const periodo =
      filtroAno.value === "todos" ? "todos os anos" : filtroAno.value;
    const botao = criarElemento(
      "button",
      "botao botao--amarelo",
      "Começar quiz",
    );
    botao.type = "button";
    botao.id = "quiz-comecar";
    botao.addEventListener("click", iniciarQuiz);

    cartao.append(
      criarElemento(
        "p",
        "quiz__texto",
        `Você sabe o que mais ouviu? Responda ${perguntas.length} perguntas sobre o seu período.`,
      ),
      criarElemento(
        "p",
        "quiz__nota",
        `Período: ${periodo}. Para mudar, use o filtro na aba Wrapped.`,
      ),
      botao,
    );
  }

  areaQuiz.replaceChildren(cartao);
}

function iniciarQuiz() {
  const perguntas = gerarPerguntasDoPeriodo();
  if (perguntas.length === 0) {
    mostrarInicioQuiz();
    return;
  }
  quiz = { perguntas, indice: 0, acertos: 0 };
  mostrarPergunta();
}

function descreverItem(item) {
  return `${item.rotulo} (${item.vezes}x · ${formatarTempo(item.minutos)})`;
}

function mostrarPergunta() {
  const pergunta = quiz.perguntas[quiz.indice];
  const cartao = criarElemento("div", "quiz__cartao");
  const titulo = criarElemento("h3", "quiz__pergunta", pergunta.enunciado);
  titulo.tabIndex = -1;

  const lista = criarElemento("ul", "quiz__opcoes");
  const botoes = [];

  for (const opcao of pergunta.opcoes) {
    const botao = criarElemento("button", "botao botao--opcao", opcao.rotulo);
    botao.type = "button";
    botao.addEventListener("click", () =>
      responder(pergunta, opcao, botao, botoes, cartao),
    );
    botoes.push(botao);

    const linha = document.createElement("li");
    linha.append(botao);
    lista.append(linha);
  }

  cartao.append(
    criarElemento(
      "p",
      "quiz__progresso",
      `Pergunta ${quiz.indice + 1} de ${quiz.perguntas.length}`,
    ),
    titulo,
    lista,
  );
  areaQuiz.replaceChildren(cartao);
  titulo.focus({ preventScroll: true });
}

function responder(pergunta, opcao, botaoEscolhido, botoes, cartao) {
  const acertou = opcao === pergunta.correta;
  if (acertou) quiz.acertos += 1;

  // marca cada botão com cor e também com símbolo, para não depender só da cor
  botoes.forEach((botao, i) => {
    botao.disabled = true;
    if (pergunta.opcoes[i] === pergunta.correta) {
      botao.classList.add("opcao--certa");
      botao.textContent += " ✓";
    } else if (botao === botaoEscolhido) {
      botao.classList.add("opcao--errada");
      botao.textContent += " ✗";
    }
  });

  const feedback = criarElemento(
    "p",
    "quiz__feedback",
    acertou
      ? `Certo! ${descreverItem(pergunta.correta)}`
      : `Quase! Era ${descreverItem(pergunta.correta)}`,
  );
  feedback.setAttribute("role", "status");

  const ultima = quiz.indice === quiz.perguntas.length - 1;
  const proxima = criarElemento(
    "button",
    "botao botao--escuro",
    ultima ? "Ver resultado" : "Próxima pergunta",
  );
  proxima.type = "button";
  proxima.id = "quiz-proxima";
  proxima.addEventListener("click", () => {
    if (ultima) {
      mostrarResultadoQuiz();
    } else {
      quiz.indice += 1;
      mostrarPergunta();
    }
  });

  cartao.append(feedback, proxima);
  proxima.focus({ preventScroll: true });
}

function mostrarResultadoQuiz() {
  const total = quiz.perguntas.length;
  const cartao = criarElemento("div", "quiz__cartao");

  const botao = criarElemento(
    "button",
    "botao botao--amarelo",
    "Jogar de novo",
  );
  botao.type = "button";
  botao.id = "quiz-de-novo";
  botao.addEventListener("click", iniciarQuiz);

  cartao.append(
    criarElemento("p", "quiz__progresso", "Resultado"),
    criarElemento("p", "quiz__placar", `${quiz.acertos} de ${total}`),
    criarElemento(
      "p",
      "quiz__texto",
      quiz.acertos === total
        ? "Você conhece bem o seu som!"
        : "Dá para melhorar. Que tal ver o Wrapped e tentar de novo?",
    ),
    botao,
  );
  areaQuiz.replaceChildren(cartao);
}

// Ao abrir a aba do quiz, volta para a tela inicial (os dados podem ter mudado)
window.addEventListener("hashchange", () => {
  if (location.hash === "#quiz") mostrarInicioQuiz();
});

// ===== Ao abrir a página =====
mostrarEscutas();
mostrarInicioQuiz();
