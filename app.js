// ===== Elementos da página =====
const formBusca = document.getElementById("form-busca");
const campoBusca = document.getElementById("campo-busca");
const listaResultados = document.getElementById("resultados");
const msgBusca = document.getElementById("msg-busca");
const moldeFaixa = document.getElementById("tpl-faixa");

// Seleção de várias músicas
const barraSelecao = document.getElementById("barra-selecao");
const selecionarTodas = document.getElementById("selecionar-todas");
const contagemSelecao = document.getElementById("contagem-selecao");
const dataSelecao = document.getElementById("data-selecao");
const avisoSelecao = document.getElementById("aviso-selecao");
const botaoRegistrarSelecionadas = document.getElementById("btn-registrar-selecionadas");
const botaoLimparSelecao = document.getElementById("btn-limpar-selecao");
const detalhesSelecionadas = document.getElementById("detalhes-selecionadas");
const resumoSelecionadas = document.getElementById("resumo-selecionadas");
const listaSelecionadas = document.getElementById("lista-selecionadas");

// Músicas selecionadas em qualquer busca (id -> música). Continua valendo quando você pesquisa outro artista.
const selecaoAcumulada = new Map();

// Seleção de várias escutas para remover
const barraRemocao = document.getElementById("barra-remocao");
const selecionarTodasEscutas = document.getElementById("selecionar-todas-escutas");
const contagemRemocao = document.getElementById("contagem-remocao");
const botaoRemoverSelecionadas = document.getElementById("btn-remover-selecionadas");
const idsParaRemover = new Set(); // continua marcado mesmo se a lista for redesenhada
const listaEscutas = document.getElementById("escutas");

// Guarda os resultados da última busca (usados ao registrar a escuta)
let resultadosAtuais = new Map();

// Ids das escutas recém-registradas (ganham um destaque na lista)
const idsNovos = new Set();

// Respeita quem pediu menos movimento no aparelho (sem matchMedia também conta como "sem animação")
const semAnimacao = () => !window.matchMedia || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Aviso rápido no pé da tela
const toast = document.getElementById("toast");
let temporizadorToast;

function mostrarToast(texto) {
  toast.textContent = texto;
  toast.classList.add("toast--visivel");
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => toast.classList.remove("toast--visivel"), 2600);
}

// Cartões "fantasma" enquanto a busca carrega
function criarEsqueleto() {
  const item = criarElemento("li", "faixa faixa--esqueleto");
  item.setAttribute("aria-hidden", "true");

  const info = criarElemento("div", "esqueleto__info");
  info.append(criarElemento("span", "esqueleto__linha"), criarElemento("span", "esqueleto__linha esqueleto__linha--curta"));

  item.append(criarElemento("div", "esqueleto__capa"), info);
  return item;
}

// Números que "sobem" até o valor final (ou aparecem direto, se o movimento estiver reduzido)
function animarNumero(elemento, fim, formatar, animar) {
  const id = String(Number(elemento.dataset.animacao || 0) + 1);
  elemento.dataset.animacao = id;

  if (!animar || semAnimacao() || fim === 0) {
    elemento.textContent = formatar(fim);
    return;
  }

  const duracao = 900;
  const inicio = performance.now();

  const passo = (agora) => {
    if (elemento.dataset.animacao !== id) return; // outra animação começou
    const progresso = Math.min(1, (agora - inicio) / duracao);
    const suave = 1 - Math.pow(1 - progresso, 3);
    elemento.textContent = formatar(progresso === 1 ? fim : fim * suave);
    if (progresso < 1) requestAnimationFrame(passo);
  };

  requestAnimationFrame(passo);
}

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
  const item = document.importNode(moldeFaixa.content, true).querySelector(".faixa");

  item.dataset.id = faixa.id;
  item.querySelector(".faixa__capa").src = faixa.capa;
  item.querySelector(".faixa__titulo").textContent = faixa.titulo;
  item.querySelector(".faixa__selecionar input").setAttribute("aria-label", `Selecionar ${faixa.titulo}`);
  item.querySelector(".faixa__artista").textContent = faixa.artista;
  item.querySelector(".faixa__duracao").textContent = formatarDuracao(faixa.duracaoSeg);

  const campoData = item.querySelector('input[type="date"]');
  campoData.value = hoje();
  campoData.max = hoje();

  return item;
}

function mostrarResultados(faixas) {
  resultadosAtuais = new Map(faixas.map((faixa) => [String(faixa.id), faixa]));
  listaResultados.replaceChildren(...faixas.map(criarItem));

  if (!dataSelecao.value) dataSelecao.value = hoje(); // mantém a data que você já escolheu
  dataSelecao.max = hoje();
  atualizarSelecao();
}

// ===== Evento da busca =====
formBusca.addEventListener("submit", async (evento) => {
  evento.preventDefault(); // impede a página de recarregar

  const termo = campoBusca.value.trim();
  if (!termo) return;

  const botao = formBusca.querySelector("button");
  botao.disabled = true;
  listaResultados.replaceChildren(...Array.from({ length: 4 }, () => criarEsqueleto()));
  atualizarSelecao();
  msgBusca.textContent = "Buscando...";

  try {
    const faixas = await buscarMusicas(termo);

    if (faixas.length === 0) {
      listaResultados.replaceChildren();
      atualizarSelecao();
      msgBusca.textContent = "Nenhum resultado. Tente outro nome.";
    } else {
      mostrarResultados(faixas);
    }
  } catch (erro) {
    console.error(erro);
    listaResultados.replaceChildren();
    atualizarSelecao();
    msgBusca.textContent = "Não foi possível buscar agora. Verifique sua internet e tente de novo.";
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

// Registra uma ou várias escutas de uma vez (uma única gravação no armazenamento).
// itens: [{ faixa, minutos }]
function registrarEscutas(itens, data) {
  const escutas = carregarEscutas();
  const usados = new Set(escutas.map((escuta) => escuta.id));
  let id = Date.now();

  for (const { faixa, minutos } of itens) {
    while (usados.has(id)) id += 1; // vários registros no mesmo milissegundo não podem repetir o id
    usados.add(id);
    idsNovos.add(id);

    escutas.push({
      id: id,
      musicaId: faixa.id,
      titulo: faixa.titulo,
      artista: faixa.artista,
      album: faixa.album,
      ano: faixa.ano,
      duracaoSeg: faixa.duracaoSeg,
      capa: faixa.capa,
      genero: faixa.genero || "Desconhecido",
      completa: minutos >= faixa.duracaoSeg / 60,
      minutosOuvidos: minutos,
      data: data,
    });
  }

  const salvou = salvarEscutas(escutas);
  if (!salvou) idsNovos.clear();
  return salvou;
}

function registrarEscuta(faixa, minutosOuvidos, data) {
  return registrarEscutas([{ faixa, minutos: minutosOuvidos }], data);
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
  if (idsNovos.has(escuta.id)) item.classList.add("faixa--nova");

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
  tempo.textContent = escuta.completa ? "Completa" : formatarMinutos(escuta.minutosOuvidos);

  const remover = document.createElement("button");
  remover.type = "button";
  remover.className = "faixa__remover";
  remover.dataset.remover = escuta.id;
  remover.textContent = "Remover";

  const caixa = document.createElement("input");
  caixa.type = "checkbox";
  caixa.dataset.id = escuta.id;
  caixa.checked = idsParaRemover.has(escuta.id);
  caixa.setAttribute("aria-label", `Selecionar ${escuta.titulo} para remover`);

  const marca = criarElemento("span", "marca");
  marca.setAttribute("aria-hidden", "true");

  const selecionar = criarElemento("label", "faixa__selecionar");
  selecionar.append(caixa, marca);

  item.classList.add("faixa--selecionavel");
  item.append(selecionar, capa, info, tempo, remover);
  return item;
}

function mostrarEscutas() {
  const escutas = carregarEscutas();

  // esquece marcações de escutas que já não existem
  const existentes = new Set(escutas.map((escuta) => escuta.id));
  for (const id of idsParaRemover) {
    if (!existentes.has(id)) idsParaRemover.delete(id);
  }

  atualizarFiltroAno(escutas);
  const maisRecentesPrimeiro = [...escutas].reverse();
  listaEscutas.replaceChildren(...maisRecentesPrimeiro.map(criarItemEscuta));
  atualizarBarraRemocao();
  idsNovos.clear(); // o destaque vale só para esta renderização
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
      mostrarAviso(item, `A música tem só ${formatarMinutos(duracaoMin)}. Informe um valor menor.`);
      return;
    }
    campo.value = "";
  }

  if (!registrarEscuta(faixa, minutos, data)) {
    mostrarAviso(item, "Não foi possível salvar. O armazenamento do navegador pode estar bloqueado.");
    return;
  }

  item.querySelector(".registro__aviso")?.remove();
  item.querySelector("details").open = false; // fecha o formulário
  mostrarEscutas();
  mostrarToast("Escuta salva ✓");
});

// ===== Selecionar várias músicas (a seleção atravessa as buscas) =====
function caixasDosResultados() {
  return [...listaResultados.querySelectorAll(".faixa__selecionar input")];
}

function idDaCaixa(caixa) {
  return caixa.closest(".faixa").dataset.id;
}

// A seleção guardada em selecaoAcumulada é a "verdade"; a tela só mostra o que está nela.
function atualizarSelecao() {
  const caixas = caixasDosResultados();

  caixas.forEach((caixa) => {
    const selecionada = selecaoAcumulada.has(idDaCaixa(caixa));
    caixa.checked = selecionada;
    caixa.closest(".faixa").classList.toggle("faixa--selecionada", selecionada);
  });

  const marcadasAqui = caixas.filter((caixa) => caixa.checked).length;
  const total = selecaoAcumulada.size;

  barraSelecao.hidden = caixas.length === 0 && total === 0;
  contagemSelecao.textContent = total === 1 ? "1 selecionada" : `${total} selecionadas`;
  botaoRegistrarSelecionadas.disabled = total === 0;
  botaoLimparSelecao.disabled = total === 0;

  // "selecionar todos" vale só para os resultados que estão na tela
  selecionarTodas.disabled = caixas.length === 0;
  selecionarTodas.checked = caixas.length > 0 && marcadasAqui === caixas.length;
  selecionarTodas.indeterminate = marcadasAqui > 0 && marcadasAqui < caixas.length;

  desenharListaSelecionadas();
  avisoSelecao.textContent = "";
}

// Lista de tudo que está selecionado, com um × para tirar cada música
function desenharListaSelecionadas() {
  const itens = [...selecaoAcumulada.entries()].map(([id, faixa]) => {
    const item = criarElemento("li", "selecao__item");
    const nome = criarElemento("span", "selecao__nome", `${faixa.titulo} — ${faixa.artista}`);

    const tirar = criarElemento("button", "selecao__tirar", "×");
    tirar.type = "button";
    tirar.dataset.id = id;
    tirar.setAttribute("aria-label", `Tirar ${faixa.titulo} da seleção`);

    item.append(nome, tirar);
    return item;
  });

  listaSelecionadas.replaceChildren(...itens);
  detalhesSelecionadas.hidden = itens.length === 0;
  resumoSelecionadas.textContent = `Ver selecionadas (${itens.length})`;
}

listaResultados.addEventListener("change", (evento) => {
  if (!evento.target.matches(".faixa__selecionar input")) return;

  const id = idDaCaixa(evento.target);
  const faixa = resultadosAtuais.get(id);

  if (evento.target.checked && faixa) selecaoAcumulada.set(id, faixa);
  else selecaoAcumulada.delete(id);

  atualizarSelecao();
});

selecionarTodas.addEventListener("change", () => {
  caixasDosResultados().forEach((caixa) => {
    const id = idDaCaixa(caixa);
    const faixa = resultadosAtuais.get(id);

    if (selecionarTodas.checked && faixa) selecaoAcumulada.set(id, faixa);
    else selecaoAcumulada.delete(id); // desmarcar tira só os desta busca; o resto continua
  });
  atualizarSelecao();
});

listaSelecionadas.addEventListener("click", (evento) => {
  const botao = evento.target.closest("button[data-id]");
  if (!botao) return;
  selecaoAcumulada.delete(botao.dataset.id);
  atualizarSelecao();
});

botaoLimparSelecao.addEventListener("click", () => {
  selecaoAcumulada.clear();
  atualizarSelecao();
});

botaoRegistrarSelecionadas.addEventListener("click", () => {
  const data = dataSelecao.value;
  if (!data) {
    avisoSelecao.textContent = "Informe a data em que você ouviu.";
    return;
  }
  if (data > hoje()) {
    avisoSelecao.textContent = "A data não pode ser no futuro.";
    return;
  }

  const itens = [...selecaoAcumulada.values()].map((faixa) => ({ faixa, minutos: faixa.duracaoSeg / 60 })); // "ouvi completa"
  if (itens.length === 0) return;

  if (!registrarEscutas(itens, data)) {
    avisoSelecao.textContent = "Não foi possível salvar. O armazenamento do navegador pode estar bloqueado.";
    return;
  }

  selecaoAcumulada.clear();
  atualizarSelecao();
  mostrarEscutas();
  mostrarToast(itens.length === 1 ? "1 música registrada ✓" : `${itens.length} músicas registradas ✓`);
});

// ===== Cálculos do wrapped =====
const ANO_ATUAL = new Date().getFullYear();

// Soma os minutos ouvidos agrupando por uma chave (artista, música, álbum)
function somarPor(escutas, chaveFn, rotuloFn) {
  const grupos = new Map();

  for (const escuta of escutas) {
    const chave = chaveFn(escuta);
    const grupo = grupos.get(chave) || { rotulo: rotuloFn(escuta), minutos: 0, vezes: 0 };
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
      ? Math.round(escutas.reduce((soma, e) => soma + e.ano * e.minutosOuvidos, 0) / totalMin)
      : null;

  return {
    qtd: escutas.length,
    totalMin,
    anoMedio,
    artistas: somarPor(escutas, (e) => e.artista, (e) => e.artista),
    // músicas: ranking por número de vezes ouvidas; empate decide pelos minutos
    musicas: somarPor(escutas, (e) => e.musicaId, (e) => `${e.titulo} — ${e.artista}`).sort(
      (a, b) => b.vezes - a.vezes || b.minutos - a.minutos
    ),
    // gêneros: escutas sem gênero (registradas antes dessa função) não entram
    generos: somarPor(escutas, (e) => e.genero || "Desconhecido", (e) => e.genero || "Desconhecido").filter(
      (g) => g.rotulo !== "Desconhecido"
    ),
    albuns: somarPor(
      escutas,
      (e) => `${e.album}|${e.artista}`,
      (e) => `${e.album || "Sem álbum"} — ${e.artista}`
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

// medida: o que a barra compara entre os itens ("minutos" ou "vezes")
function preencherRanking(lista, itens, limite = 5, medida = "minutos") {
  if (itens.length === 0) {
    const vazio = document.createElement("li");
    vazio.className = "ranking__vazio";
    vazio.textContent = "Sem dados ainda";
    lista.replaceChildren(vazio);
    return;
  }

  const mostrados = itens.slice(0, limite);
  const maior = Math.max(...mostrados.map((item) => item[medida]));

  const linhas = mostrados.map((item) => {
    const linha = document.createElement("li");

    const nome = document.createElement("span");
    nome.className = "ranking__nome";
    nome.textContent = item.rotulo;

    const tempo = document.createElement("span");
    tempo.className = "ranking__tempo";
    tempo.textContent = `${item.vezes}x · ${formatarTempo(item.minutos)}`;

    const barra = document.createElement("span");
    barra.className = "ranking__barra";
    barra.style.setProperty("--proporcao", String(maior > 0 ? item[medida] / maior : 0));

    linha.append(nome, tempo, barra);
    return linha;
  });

  lista.replaceChildren(...linhas);
}

const filtroAno = document.getElementById("filtro-ano");

// Monta as opções do filtro com os anos que existem nas escutas
function atualizarFiltroAno(escutas) {
  const anos = [...new Set(escutas.map((e) => (e.data || "").slice(0, 4)).filter(Boolean))].sort().reverse();
  const selecionado = filtroAno.value;

  filtroAno.replaceChildren(new Option("Todos os anos", "todos"), ...anos.map((ano) => new Option(ano, ano)));
  filtroAno.value = anos.includes(selecionado) ? selecionado : "todos";
}

filtroAno.addEventListener("change", () => mostrarWrapped(carregarEscutas(), true));

function escutasDoPeriodo(todasAsEscutas) {
  const ano = filtroAno.value;
  return ano === "todos" ? todasAsEscutas : todasAsEscutas.filter((e) => (e.data || "").startsWith(ano));
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
    return Number.isInteger(ano) && ano >= ANO_NASCIMENTO_MIN && ano <= ANO_ATUAL ? ano : null;
  } catch (erro) {
    return null;
  }
}

campoNascimento.max = ANO_ATUAL;
campoNascimento.value = lerAnoNascimento() || "";

campoNascimento.addEventListener("change", () => {
  const ano = campoNascimento.valueAsNumber;
  const valido = Number.isInteger(ano) && ano >= ANO_NASCIMENTO_MIN && ano <= ANO_ATUAL;

  try {
    if (valido) localStorage.setItem(CHAVE_NASCIMENTO, String(ano));
    else localStorage.removeItem(CHAVE_NASCIMENTO);
  } catch (erro) {
    console.error(erro);
  }

  if (!valido) campoNascimento.value = "";
  mostrarWrapped(carregarEscutas());
});

function mostrarIdadeDeEscuta(wrapped, animar) {
  const numero = document.getElementById("stat-idade");
  const detalhe = document.getElementById("stat-idade-detalhe");

  if (wrapped.qtd === 0) {
    numero.textContent = "—";
    detalhe.textContent = "Registre músicas para descobrir.";
    return;
  }

  const idadeDeEscuta = ANO_ATUAL - (wrapped.anoMedio - IDADE_DO_GOSTO);
  animarNumero(numero, idadeDeEscuta, (valor) => `${Math.round(valor)} anos`, animar);

  const nascimento = lerAnoNascimento();
  let comparacao = "Informe seu ano de nascimento para comparar com a sua idade real.";

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

function mostrarWrapped(todasAsEscutas, animar = false) {
  const ano = filtroAno.value;
  const escutas = escutasDoPeriodo(todasAsEscutas);
  const wrapped = calcularWrapped(escutas);
  const temDados = wrapped.qtd > 0;

  animarNumero(document.getElementById("stat-horas"), wrapped.totalMin, temDados ? formatarHoras : () => "0", animar);
  animarNumero(
    document.getElementById("stat-minutos"),
    Math.round(wrapped.totalMin),
    (valor) => Math.round(valor).toLocaleString("pt-BR"),
    animar
  );

  mostrarIdadeDeEscuta(wrapped, animar);

  document.getElementById("stat-personalidade").textContent = temDados ? definirPersonalidade(wrapped) : "—";

  preencherRanking(document.getElementById("top-artistas"), wrapped.artistas);
  mostrarCorrida(escutas);
  preencherRanking(document.getElementById("top-musicas"), wrapped.musicas, 5, "vezes");
  preencherRanking(document.getElementById("top-albuns"), wrapped.albuns);
  preencherRanking(document.getElementById("top-generos"), wrapped.generos);

  // playlist com as 100 músicas mais ouvidas
  const nomePeriodo = ano === "todos" ? "" : ` de ${ano}`;
  const totalNaPlaylist = Math.min(wrapped.musicas.length, 100);
  document.getElementById("titulo-playlist").textContent =
    `Suas músicas mais ouvidas${nomePeriodo} · ${totalNaPlaylist} ${totalNaPlaylist === 1 ? "música" : "músicas"}`;
  preencherRanking(document.getElementById("playlist-lista"), wrapped.musicas, 100, "vezes");
}

// ===== Remover escuta =====
listaEscutas.addEventListener("click", (evento) => {
  const botao = evento.target.closest("button[data-remover]");
  if (!botao) return;

  const item = botao.closest(".faixa");
  if (item.classList.contains("faixa--saindo")) return; // já está saindo

  if (!confirm("Remover esta escuta?")) return;

  const id = Number(botao.dataset.remover);
  const concluir = () => {
    salvarEscutas(carregarEscutas().filter((escuta) => escuta.id !== id));
    mostrarEscutas();
    mostrarToast("Escuta removida");
  };

  if (semAnimacao()) {
    concluir();
  } else {
    item.classList.add("faixa--saindo");
    setTimeout(concluir, 260);
  }
});

// ===== Selecionar várias escutas para remover =====
function caixasDasEscutas() {
  return [...listaEscutas.querySelectorAll(".faixa__selecionar input")];
}

function marcarParaRemover(caixa) {
  const id = Number(caixa.dataset.id);
  if (caixa.checked) idsParaRemover.add(id);
  else idsParaRemover.delete(id);
}

function atualizarBarraRemocao() {
  const caixas = caixasDasEscutas();
  const marcadas = caixas.filter((caixa) => caixa.checked);

  barraRemocao.hidden = caixas.length === 0;
  caixas.forEach((caixa) => caixa.closest(".faixa").classList.toggle("faixa--selecionada", caixa.checked));

  contagemRemocao.textContent = marcadas.length === 1 ? "1 selecionada" : `${marcadas.length} selecionadas`;
  botaoRemoverSelecionadas.disabled = marcadas.length === 0;
  selecionarTodasEscutas.checked = caixas.length > 0 && marcadas.length === caixas.length;
  selecionarTodasEscutas.indeterminate = marcadas.length > 0 && marcadas.length < caixas.length;
}

listaEscutas.addEventListener("change", (evento) => {
  if (!evento.target.matches(".faixa__selecionar input")) return;
  marcarParaRemover(evento.target);
  atualizarBarraRemocao();
});

selecionarTodasEscutas.addEventListener("change", () => {
  caixasDasEscutas().forEach((caixa) => {
    caixa.checked = selecionarTodasEscutas.checked;
    marcarParaRemover(caixa);
  });
  atualizarBarraRemocao();
});

botaoRemoverSelecionadas.addEventListener("click", () => {
  const ids = new Set(idsParaRemover);
  if (ids.size === 0) return;

  const pergunta = ids.size === 1 ? "a escuta selecionada" : `as ${ids.size} escutas selecionadas`;
  if (!confirm(`Remover ${pergunta}? Isso não pode ser desfeito.`)) return;

  const concluir = () => {
    salvarEscutas(carregarEscutas().filter((escuta) => !ids.has(escuta.id)));
    idsParaRemover.clear();
    mostrarEscutas();
    mostrarToast(ids.size === 1 ? "1 escuta removida" : `${ids.size} escutas removidas`);
  };

  if (semAnimacao()) {
    concluir();
    return;
  }

  botaoRemoverSelecionadas.disabled = true;
  caixasDasEscutas()
    .filter((caixa) => caixa.checked)
    .forEach((caixa) => caixa.closest(".faixa").classList.add("faixa--saindo"));
  setTimeout(concluir, 260);
});

// ===== Backup (exportar e importar JSON) =====
const msgBackup = document.getElementById("msg-backup");

function montarBackup() {
  return JSON.stringify({ versao: 1, exportadoEm: hoje(), escutas: carregarEscutas() }, null, 2);
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

// ----- Apagar todas as escutas (pede confirmação) -----
const painelApagar = document.getElementById("confirmar-apagar");
const textoApagar = document.getElementById("texto-confirmar");
const botaoCancelarApagar = document.getElementById("btn-cancelar-apagar");

document.getElementById("btn-apagar-tudo").addEventListener("click", () => {
  const total = carregarEscutas().length;

  if (total === 0) {
    msgBackup.textContent = "Não há escutas para apagar.";
    return;
  }

  textoApagar.textContent = `Apagar ${total === 1 ? "a escuta registrada" : `as ${total} escutas registradas`}? Isso não pode ser desfeito. Se quiser guardar uma cópia, exporte um backup antes.`;
  painelApagar.hidden = false;
  botaoCancelarApagar.focus(); // o foco começa na opção segura
});

botaoCancelarApagar.addEventListener("click", () => {
  painelApagar.hidden = true;
});

document.getElementById("btn-confirmar-apagar").addEventListener("click", () => {
  salvarEscutas([]);
  painelApagar.hidden = true;
  mostrarEscutas();
  msgBackup.textContent = "";
  mostrarToast("Todas as escutas foram apagadas");
});

const campoArquivo = document.getElementById("arquivo-backup");

document.getElementById("btn-importar").addEventListener("click", () => campoArquivo.click());

// Aceita só registros com os campos que o app precisa e copia apenas esses campos
function limparEscuta(bruta) {
  const textoOk = (v) => typeof v === "string" && v.length > 0;
  const numeroOk = (v) => typeof v === "number" && Number.isFinite(v);

  if (!bruta || typeof bruta !== "object") return null;
  if (!numeroOk(bruta.id) || !textoOk(bruta.titulo) || !textoOk(bruta.artista)) return null;
  if (!numeroOk(bruta.ano) || !numeroOk(bruta.duracaoSeg) || bruta.duracaoSeg <= 0) return null;
  if (!numeroOk(bruta.minutosOuvidos) || bruta.minutosOuvidos <= 0) return null;

  return {
    id: bruta.id,
    musicaId: bruta.musicaId,
    titulo: bruta.titulo,
    artista: bruta.artista,
    album: textoOk(bruta.album) ? bruta.album : "Sem álbum",
    ano: bruta.ano,
    duracaoSeg: bruta.duracaoSeg,
    capa: typeof bruta.capa === "string" && bruta.capa.startsWith("https://") ? bruta.capa : "",
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
    const novas = lista.map(limparEscuta).filter((escuta) => escuta && !idsAtuais.has(escuta.id));

    salvarEscutas([...atuais, ...novas]);
    mostrarEscutas();
    msgBackup.textContent = `${novas.length} escutas importadas. ${lista.length - novas.length} ignoradas (repetidas ou inválidas).`;
  } catch (erro) {
    console.error(erro);
    msgBackup.textContent = "Não foi possível importar. Use um arquivo exportado por este app.";
  } finally {
    campoArquivo.value = ""; // permite escolher o mesmo arquivo de novo
  }
});

// ===== Corrida dos artistas =====
const NOMES_MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const CORES_CORRIDA = ["var(--magenta)", "var(--ciano)", "var(--amarelo)", "#b18cff", "#ff9a3c"];
const NS_SVG = "http://www.w3.org/2000/svg";

// Lista todos os meses entre a primeira e a última escuta (inclusive meses sem escuta): "2026-01", "2026-02"...
function listarMeses(escutas) {
  const meses = escutas
    .map((e) => (e.data || "").slice(0, 7))
    .filter((m) => /^\d{4}-\d{2}$/.test(m))
    .sort();
  if (meses.length === 0) return [];

  let [ano, mes] = meses[0].split("-").map(Number);
  const [anoFim, mesFim] = meses[meses.length - 1].split("-").map(Number);
  const lista = [];

  while (ano < anoFim || (ano === anoFim && mes <= mesFim)) {
    lista.push(`${ano}-${String(mes).padStart(2, "0")}`);
    mes += 1;
    if (mes > 12) {
      mes = 1;
      ano += 1;
    }
  }
  return lista;
}

function rotuloMes(mes) {
  const [ano, numero] = mes.split("-");
  return `${NOMES_MESES[Number(numero) - 1]}/${ano.slice(2)}`;
}

// Posição de cada um dos 5 artistas favoritos em cada mês, pelo total de minutos acumulado até aquele mês.
// posição null = ainda não tinha ouvido esse artista.
function calcularCorrida(escutas) {
  const meses = listarMeses(escutas);
  const nomes = somarPor(escutas, (e) => e.artista, (e) => e.artista)
    .slice(0, 5)
    .map((artista) => artista.rotulo);

  const minutosPorMes = new Map(nomes.map((nome) => [nome, meses.map(() => 0)]));
  for (const escuta of escutas) {
    const linha = minutosPorMes.get(escuta.artista);
    const indice = meses.indexOf((escuta.data || "").slice(0, 7));
    if (linha && indice >= 0) linha[indice] += escuta.minutosOuvidos;
  }

  const acumulado = nomes.map((nome) => {
    let soma = 0;
    return minutosPorMes.get(nome).map((minutos) => (soma += minutos));
  });

  const posicoes = nomes.map(() => meses.map(() => null));
  meses.forEach((_, m) => {
    nomes
      .map((nome, i) => ({ i, total: acumulado[i][m] }))
      .filter((artista) => artista.total > 0)
      .sort((a, b) => b.total - a.total || a.i - b.i) // empate: quem está mais bem colocado no ranking geral
      .forEach((artista, posicao) => {
        posicoes[artista.i][m] = posicao + 1;
      });
  });

  return { meses, artistas: nomes.map((nome, i) => ({ nome, posicoes: posicoes[i] })) };
}

function criarSvg(tag, atributos = {}) {
  const elemento = document.createElementNS(NS_SVG, tag);
  for (const [chave, valor] of Object.entries(atributos)) elemento.setAttribute(chave, valor);
  return elemento;
}

function desenharCorrida(corrida) {
  const { meses, artistas } = corrida;
  const n = meses.length;
  const espaco = n <= 5 ? 80 : 64;
  const esquerda = 40;
  const topo = 24;
  const passoY = 34;
  const largura = esquerda + 24 + (n - 1) * espaco + 24;
  const altura = topo + 4 * passoY + 44;
  const x = (m) => esquerda + 24 + m * espaco;
  const y = (posicao) => topo + (posicao - 1) * passoY;

  const ultimo = n - 1;
  const lider = artistas.find((a) => a.posicoes[ultimo] === 1);

  const grafico = criarSvg("svg", { viewBox: `0 0 ${largura} ${altura}`, width: largura, height: altura, role: "img", "aria-labelledby": "corrida-titulo corrida-desc" });
  grafico.classList.add("corrida__svg");

  const titulo = criarSvg("title", { id: "corrida-titulo" });
  titulo.textContent = "Corrida dos artistas";
  const descricao = criarSvg("desc", { id: "corrida-desc" });
  descricao.textContent = `Posição acumulada de ${artistas.length} artistas de ${rotuloMes(meses[0])} a ${rotuloMes(meses[ultimo])}. No último mês, o primeiro lugar é ${lider ? lider.nome : "indefinido"}.`;
  grafico.append(titulo, descricao);

  // linhas de grade e posições (1º a 5º)
  for (let posicao = 1; posicao <= 5; posicao++) {
    const grade = criarSvg("line", { x1: esquerda, x2: largura - 8, y1: y(posicao), y2: y(posicao) });
    grade.classList.add("corrida__grade");
    const rotulo = criarSvg("text", { x: esquerda - 8, y: y(posicao) + 4, "text-anchor": "end" });
    rotulo.classList.add("corrida__texto");
    rotulo.textContent = `${posicao}º`;
    grafico.append(grade, rotulo);
  }

  // meses
  meses.forEach((mes, m) => {
    const rotulo = criarSvg("text", { x: x(m), y: y(5) + 30, "text-anchor": "middle" });
    rotulo.classList.add("corrida__texto");
    rotulo.textContent = rotuloMes(mes);
    grafico.append(rotulo);
  });

  // linhas e marcadores de cada artista
  artistas.forEach((artista, i) => {
    const cor = CORES_CORRIDA[i];
    const pontos = artista.posicoes
      .map((posicao, m) => (posicao === null ? null : { x: x(m), y: y(posicao) }))
      .filter(Boolean);

    let caminho = `M ${pontos[0].x} ${pontos[0].y}`;
    for (let p = 1; p < pontos.length; p++) {
      const meio = (pontos[p - 1].x + pontos[p].x) / 2;
      caminho += ` C ${meio} ${pontos[p - 1].y}, ${meio} ${pontos[p].y}, ${pontos[p].x} ${pontos[p].y}`;
    }

    const linha = criarSvg("path", { d: caminho, pathLength: 1 });
    linha.classList.add("corrida__linha");
    linha.style.stroke = cor;
    linha.style.filter = `drop-shadow(0 0 5px ${cor})`;
    linha.style.setProperty("--atraso", `${i * 0.15}s`);
    grafico.append(linha);

    for (const ponto of pontos) {
      const marcador = criarSvg("rect", { x: ponto.x - 6, y: ponto.y - 6, width: 12, height: 12 });
      marcador.classList.add("corrida__marcador");
      marcador.style.fill = cor;
      grafico.append(marcador);
    }
  });

  const rolagem = criarElemento("div", "corrida__rolagem");
  rolagem.append(grafico);
  return rolagem;
}

function criarLegendaCorrida(corrida) {
  const ultimo = corrida.meses.length - 1;
  const legenda = criarElemento("ul", "corrida__legenda");

  [...corrida.artistas.entries()]
    .sort((a, b) => a[1].posicoes[ultimo] - b[1].posicoes[ultimo])
    .forEach(([i, artista]) => {
      const cor = criarElemento("span", "corrida__cor");
      cor.style.background = CORES_CORRIDA[i];
      cor.setAttribute("aria-hidden", "true");

      const item = document.createElement("li");
      item.append(cor, `${artista.posicoes[ultimo]}º ${artista.nome}`);
      legenda.append(item);
    });

  return legenda;
}

// Versão em tabela do mesmo gráfico (útil em tela pequena e para leitores de tela)
function criarTabelaCorrida(corrida) {
  const tabela = document.createElement("table");
  tabela.className = "corrida__tabela";

  const cabecalho = document.createElement("tr");
  cabecalho.append(criarElemento("th", "", "Artista"), ...corrida.meses.map((mes) => criarElemento("th", "", rotuloMes(mes))));

  const corpo = corrida.artistas.map((artista) => {
    const linha = document.createElement("tr");
    linha.append(
      criarElemento("th", "", artista.nome),
      ...artista.posicoes.map((posicao) => criarElemento("td", "", posicao === null ? "—" : `${posicao}º`))
    );
    return linha;
  });

  tabela.append(cabecalho, ...corpo);

  const detalhes = criarElemento("details", "corrida__detalhes");
  detalhes.append(criarElemento("summary", "", "Ver em tabela"), criarElemento("div", "corrida__rolagem", ""));
  detalhes.querySelector("div").append(tabela);
  return detalhes;
}

function mostrarCorrida(escutas) {
  const area = document.getElementById("corrida-area");
  const corrida = calcularCorrida(escutas);

  if (corrida.artistas.length < 2 || corrida.meses.length < 2) {
    area.replaceChildren(
      criarElemento("p", "vazio", "Registre escutas de pelo menos 2 artistas, em pelo menos 2 meses diferentes, para ver a corrida.")
    );
    return;
  }

  area.replaceChildren(desenharCorrida(corrida), criarLegendaCorrida(corrida), criarTabelaCorrida(corrida));
}

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
    criarPergunta(`Qual foi a sua música mais ouvida${periodo}?`, wrapped.musicas, mesmaMusica),
    criarPergunta(`Qual artista você mais ouviu${periodo}?`, wrapped.artistas, mesmosMinutos),
    criarPergunta(`Qual álbum você mais ouviu${periodo}?`, wrapped.albuns, mesmosMinutos),
    criarPergunta(`Qual gênero mais marcou o seu som${periodo}?`, wrapped.generos, mesmosMinutos),
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
      criarElemento("p", "quiz__texto", "Registre pelo menos 2 músicas diferentes para jogar. Empates no primeiro lugar também impedem a pergunta.")
    );
  } else {
    const periodo = filtroAno.value === "todos" ? "todos os anos" : filtroAno.value;
    const botao = criarElemento("button", "botao botao--amarelo", "Começar quiz");
    botao.type = "button";
    botao.id = "quiz-comecar";
    botao.addEventListener("click", iniciarQuiz);

    cartao.append(
      criarElemento("p", "quiz__texto", `Você sabe o que mais ouviu? Responda ${perguntas.length} perguntas sobre o seu período.`),
      criarElemento("p", "quiz__nota", `Período: ${periodo}. Para mudar, use o filtro na aba Wrapped.`),
      botao
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
    botao.addEventListener("click", () => responder(pergunta, opcao, botao, botoes, cartao));
    botoes.push(botao);

    const linha = document.createElement("li");
    linha.append(botao);
    lista.append(linha);
  }

  cartao.append(
    criarElemento("p", "quiz__progresso", `Pergunta ${quiz.indice + 1} de ${quiz.perguntas.length}`),
    titulo,
    lista
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
    acertou ? `Certo! ${descreverItem(pergunta.correta)}` : `Quase! Era ${descreverItem(pergunta.correta)}`
  );
  feedback.setAttribute("role", "status");

  const ultima = quiz.indice === quiz.perguntas.length - 1;
  const proxima = criarElemento("button", "botao botao--escuro", ultima ? "Ver resultado" : "Próxima pergunta");
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

  const botao = criarElemento("button", "botao botao--amarelo", "Jogar de novo");
  botao.type = "button";
  botao.id = "quiz-de-novo";
  botao.addEventListener("click", iniciarQuiz);

  cartao.append(
    criarElemento("p", "quiz__progresso", "Resultado"),
    criarElemento("p", "quiz__placar", `${quiz.acertos} de ${total}`),
    criarElemento("p", "quiz__texto", quiz.acertos === total ? "Você conhece bem o seu som!" : "Dá para melhorar. Que tal ver o Wrapped e tentar de novo?"),
    botao
  );
  areaQuiz.replaceChildren(cartao);
}

// Ao abrir a aba do quiz, volta para a tela inicial (os dados podem ter mudado)
window.addEventListener("hashchange", () => {
  if (location.hash === "#quiz") mostrarInicioQuiz();
  if (location.hash === "#wrapped") mostrarWrapped(carregarEscutas(), true);
});

// ===== Ao abrir a página =====
mostrarEscutas();
mostrarInicioQuiz();
if (location.hash === "#wrapped") mostrarWrapped(carregarEscutas(), true);