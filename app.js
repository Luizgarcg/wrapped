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

function registrarEscuta(faixa, minutosOuvidos) {
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
    completa: minutosOuvidos >= faixa.duracaoSeg / 60,
    minutosOuvidos: minutosOuvidos,
    data: hoje(),
  });

  return salvarEscutas(escutas);
}

// ===== Lista "Suas escutas" =====
function formatarMinutos(minutos) {
  return `${Math.round(minutos * 10) / 10} min`;
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
  artista.textContent = escuta.artista;

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

  if (!registrarEscuta(faixa, minutos)) {
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
    const grupo = grupos.get(chave) || { rotulo: rotuloFn(escuta), minutos: 0 };
    grupo.minutos += escuta.minutosOuvidos;
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
    musicas: somarPor(
      escutas,
      (e) => e.musicaId,
      (e) => `${e.titulo} — ${e.artista}`,
    ),
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
function formatarTempo(minutos) {
  if (minutos < 60) return `${Math.round(minutos)} min`;
  return `${(minutos / 60).toFixed(1).replace(".", ",")} h`;
}

function preencherRanking(lista, itens) {
  if (itens.length === 0) {
    const vazio = document.createElement("li");
    vazio.className = "ranking__vazio";
    vazio.textContent = "Sem dados ainda";
    lista.replaceChildren(vazio);
    return;
  }

  const linhas = itens.slice(0, 5).map((item) => {
    const linha = document.createElement("li");

    const nome = document.createElement("span");
    nome.className = "ranking__nome";
    nome.textContent = item.rotulo;

    const tempo = document.createElement("span");
    tempo.className = "ranking__tempo";
    tempo.textContent = formatarTempo(item.minutos);

    linha.append(nome, tempo);
    return linha;
  });

  lista.replaceChildren(...linhas);
}

function mostrarWrapped(escutas) {
  const wrapped = calcularWrapped(escutas);
  const temDados = wrapped.qtd > 0;

  document.getElementById("stat-horas").textContent = temDados
    ? formatarTempo(wrapped.totalMin)
    : "0";

  document.getElementById("stat-idade").textContent = temDados
    ? `${wrapped.anoMedio} · ${ANO_ATUAL - wrapped.anoMedio} anos atrás`
    : "—";

  document.getElementById("stat-personalidade").textContent = temDados
    ? definirPersonalidade(wrapped)
    : "—";
  document.getElementById("stat-album").textContent = temDados
    ? wrapped.albuns[0].rotulo
    : "—";

  preencherRanking(document.getElementById("top-artistas"), wrapped.artistas);
  preencherRanking(document.getElementById("top-musicas"), wrapped.musicas);
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

// ===== Ao abrir a página =====
mostrarEscutas();
