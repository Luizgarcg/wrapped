// ===== Idiomas (PT / EN) =====
// Textos fixos do HTML: data-i18n (texto), data-i18n-placeholder e data-i18n-aria.
// Para usar em outros scripts: t("chave", { n: 3 })
const TEXTOS = {
  pt: {
    titulo: "Meu Wrapped",
    "idioma.grupo": "Idioma",
    "topo.texto": "Registre o que você ouve e veja seu ano em música.",
    "registrar.titulo": "O que você ouviu?",
    "busca.rotulo": "Buscar música ou artista",
    "busca.placeholder": "Ex.: Blank Space",
    "busca.botao": "Buscar",
    "busca.vazio": "Busque uma música para registrar quanto você ouviu.",
    "sel.todos": "Selecionar todos os resultados",
    "sel.nota": "A seleção continua quando você faz outra busca.",
    "sel.data": "Data em que ouviu",
    "sel.limpar": "Limpar seleção",
    "sel.completas": "Ouvi completas",
    "escutas.titulo": "Suas escutas",
    "escutas.todas": "Selecionar todas",
    "escutas.remover": "Remover selecionadas",
    "escutas.vazio": "Nenhuma escuta registrada ainda.",
    "backup.titulo": "Backup e limpeza",
    "backup.texto":
      "Seus dados ficam só neste navegador. Exporte um arquivo para não perder nada.",
    "backup.exportar": "Exportar backup",
    "backup.importar": "Importar backup",
    "backup.apagar": "Apagar todas",
    "backup.sim": "Sim, apagar tudo",
    "backup.cancelar": "Cancelar",
    "wrapped.titulo": "Seu wrapped",
    "wrapped.periodo": "Período",
    "wrapped.todos": "Todos os anos",
    "b.horas": "Horas ouvidas",
    "b.minutos": "Minutos de audição",
    "b.personalidade": "Personalidade",
    "b.idade": "Idade de escuta",
    "b.nascimento": "Seu ano de nascimento (opcional)",
    "b.nascimento.ph": "Ex.: 2003",
    "b.idade.nota":
      "Estimativa pela época das suas músicas. Não é comparada com outras pessoas.",
    "b.artistas": "Top artistas",
    "b.musicas": "Top músicas",
    "b.corrida": "Corrida dos artistas",
    "b.corrida.nota":
      "Posição acumulada mês a mês entre os seus 5 artistas favoritos. O 1º lugar fica no topo.",
    "b.albuns": "Álbuns mais ouvidos",
    "b.generos": "Principais gêneros",
    "quiz.titulo": "Quiz do seu ano",
    "menu.aria": "Navegação principal",
    "menu.registrar": "Registrar",
    "menu.wrapped": "Wrapped",
    "menu.quiz": "Quiz",
    "tpl.selecionar": "Selecionar música",
    "tpl.registrar": "Registrar",
    "tpl.data": "Data em que você ouviu",
    "tpl.completa": "Ouvi completa",
    "tpl.minutos": "Ou informe os minutos ouvidos",
    "tpl.minutos.ph": "Ex.: 2,5",
    "tpl.salvar": "Salvar minutos",
    "busca.buscando": "Buscando...",
    "busca.nenhum": "Nenhum resultado. Tente outro nome.",
    "busca.erro":
      "Não foi possível buscar agora. Verifique sua internet e tente de novo.",
    "sem.album": "Sem álbum",
    "sem.dados": "Sem dados ainda",
    "sel.um": "1 selecionada",
    "sel.varios": "{n} selecionadas",
    "sel.ver": "Ver selecionadas ({n})",
    "sel.tirar.aria": "Tirar {titulo} da seleção",
    "sel.aria.musica": "Selecionar {titulo}",
    "sel.aria.escuta": "Selecionar {titulo} para remover",
    "aviso.data": "Informe a data em que você ouviu.",
    "aviso.futuro": "A data não pode ser no futuro.",
    "aviso.minutos": "Informe quantos minutos você ouviu.",
    "aviso.maximo": "A música tem só {min}. Informe um valor menor.",
    "aviso.salvar":
      "Não foi possível salvar. O armazenamento do navegador pode estar bloqueado.",
    "toast.salva": "Escuta salva ✓",
    "toast.um": "1 música registrada ✓",
    "toast.varios": "{n} músicas registradas ✓",
    "toast.removida": "Escuta removida",
    "toast.removida.um": "1 escuta removida",
    "toast.removidas": "{n} escutas removidas",
    "toast.apagadas": "Todas as escutas foram apagadas",
    "escuta.completa": "Completa",
    "escuta.remover": "Remover",
    "confirm.uma": "Remover esta escuta?",
    "confirm.sel.um":
      "Remover a escuta selecionada? Isso não pode ser desfeito.",
    "confirm.sel.varios":
      "Remover as {n} escutas selecionadas? Isso não pode ser desfeito.",
    "apagar.um":
      "Apagar a escuta registrada? Isso não pode ser desfeito. Se quiser guardar uma cópia, exporte um backup antes.",
    "apagar.varios":
      "Apagar as {n} escutas registradas? Isso não pode ser desfeito. Se quiser guardar uma cópia, exporte um backup antes.",
    "backup.vazio.exportar": "Não há escutas para exportar ainda.",
    "backup.exportadas": "{n} escutas exportadas.",
    "backup.vazio.apagar": "Não há escutas para apagar.",
    "backup.importadas":
      "{n} escutas importadas. {i} ignoradas (repetidas ou inválidas).",
    "backup.erro":
      "Não foi possível importar. Use um arquivo exportado por este app.",
    "periodo.de": " de {ano}",
    "periodo.em": " em {ano}",
    "playlist.titulo": "Suas músicas mais ouvidas{p} · {n} {u}",
    "musica.um": "música",
    "musica.varios": "músicas",
    "idade.registre": "Registre músicas para descobrir.",
    "idade.anos": "{n} anos",
    "idade.informe":
      "Informe seu ano de nascimento para comparar com a sua idade real.",
    "idade.igual": "Você tem {idade} anos e escuta como alguém da sua idade.",
    "idade.mais":
      "Você tem {idade} anos, mas escuta como alguém {dif} anos mais velho.",
    "idade.menos":
      "Você tem {idade} anos, mas escuta como alguém {dif} anos mais novo.",
    "idade.detalhe": "A média das suas músicas é de {ano}. {comp}",
    "pers.descobrindo": "Ainda descobrindo",
    "pers.nostalgico": "Nostálgico",
    "pers.fiel": "Fiel",
    "pers.explorador": "Explorador",
    "pers.ecletico": "Eclético",
    "corrida.desc":
      "Posição acumulada de {n} artistas de {de} a {ate}. No último mês, o primeiro lugar é {lider}.",
    "corrida.indefinido": "indefinido",
    "corrida.artista": "Artista",
    "corrida.tabela": "Ver em tabela",
    "corrida.vazio":
      "Registre escutas de pelo menos 2 artistas, em pelo menos 2 meses diferentes, para ver a corrida.",
    "q.musica": "Qual foi a sua música mais ouvida{p}?",
    "q.artista": "Qual artista você mais ouviu{p}?",
    "q.album": "Qual álbum você mais ouviu{p}?",
    "q.genero": "Qual gênero mais marcou o seu som{p}?",
    "quiz.vazio":
      "Registre pelo menos 2 músicas diferentes para jogar. Empates no primeiro lugar também impedem a pergunta.",
    "quiz.todos": "todos os anos",
    "quiz.comecar": "Começar quiz",
    "quiz.intro":
      "Você sabe o que mais ouviu? Responda {n} perguntas sobre o seu período.",
    "quiz.periodo": "Período: {p}. Para mudar, use o filtro na aba Wrapped.",
    "quiz.progresso": "Pergunta {i} de {n}",
    "quiz.certo": "Certo! {d}",
    "quiz.errado": "Quase! Era {d}",
    "quiz.ver": "Ver resultado",
    "quiz.proxima": "Próxima pergunta",
    "quiz.resultado": "Resultado",
    "quiz.placar": "{a} de {n}",
    "quiz.otimo": "Você conhece bem o seu som!",
    "quiz.melhorar":
      "Dá para melhorar. Que tal ver o Wrapped e tentar de novo?",
    "quiz.denovo": "Jogar de novo",
  },
  en: {
    titulo: "My Wrapped",
    "idioma.grupo": "Language",
    "topo.texto": "Log what you listen to and see your year in music.",
    "registrar.titulo": "What did you listen to?",
    "busca.rotulo": "Search for a song or artist",
    "busca.placeholder": "E.g.: Blank Space",
    "busca.botao": "Search",
    "busca.vazio": "Search for a song to log how much you listened.",
    "sel.todos": "Select all results",
    "sel.nota": "Your selection stays when you search again.",
    "sel.data": "Date you listened",
    "sel.limpar": "Clear selection",
    "sel.completas": "Listened in full",
    "escutas.titulo": "Your listens",
    "escutas.todas": "Select all",
    "escutas.remover": "Remove selected",
    "escutas.vazio": "No listens logged yet.",
    "backup.titulo": "Backup and cleanup",
    "backup.texto":
      "Your data stays only in this browser. Export a file so you don't lose anything.",
    "backup.exportar": "Export backup",
    "backup.importar": "Import backup",
    "backup.apagar": "Delete all",
    "backup.sim": "Yes, delete everything",
    "backup.cancelar": "Cancel",
    "wrapped.titulo": "Your wrapped",
    "wrapped.periodo": "Period",
    "wrapped.todos": "All years",
    "b.horas": "Hours listened",
    "b.minutos": "Minutes listened",
    "b.personalidade": "Personality",
    "b.idade": "Listening age",
    "b.nascimento": "Your birth year (optional)",
    "b.nascimento.ph": "E.g.: 2003",
    "b.idade.nota":
      "Estimated from the era of your songs. Not compared with other people.",
    "b.artistas": "Top artists",
    "b.musicas": "Top songs",
    "b.corrida": "Artist race",
    "b.corrida.nota":
      "Cumulative ranking month by month among your top 5 artists. 1st place is at the top.",
    "b.albuns": "Most played albums",
    "b.generos": "Top genres",
    "quiz.titulo": "Your year quiz",
    "menu.aria": "Main navigation",
    "menu.registrar": "Log",
    "menu.wrapped": "Wrapped",
    "menu.quiz": "Quiz",
    "tpl.selecionar": "Select song",
    "tpl.registrar": "Log",
    "tpl.data": "Date you listened",
    "tpl.completa": "Listened in full",
    "tpl.minutos": "Or enter the minutes listened",
    "tpl.minutos.ph": "E.g.: 2.5",
    "tpl.salvar": "Save minutes",
    "busca.buscando": "Searching...",
    "busca.nenhum": "No results. Try another name.",
    "busca.erro":
      "Couldn't search right now. Check your connection and try again.",
    "sem.album": "No album",
    "sem.dados": "No data yet",
    "sel.um": "1 selected",
    "sel.varios": "{n} selected",
    "sel.ver": "View selected ({n})",
    "sel.tirar.aria": "Remove {titulo} from selection",
    "sel.aria.musica": "Select {titulo}",
    "sel.aria.escuta": "Select {titulo} to remove",
    "aviso.data": "Enter the date you listened.",
    "aviso.futuro": "The date can't be in the future.",
    "aviso.minutos": "Enter how many minutes you listened.",
    "aviso.maximo": "The song is only {min} long. Enter a smaller value.",
    "aviso.salvar": "Couldn't save. Your browser storage may be blocked.",
    "toast.salva": "Listen saved ✓",
    "toast.um": "1 song logged ✓",
    "toast.varios": "{n} songs logged ✓",
    "toast.removida": "Listen removed",
    "toast.removida.um": "1 listen removed",
    "toast.removidas": "{n} listens removed",
    "toast.apagadas": "All listens were deleted",
    "escuta.completa": "Full",
    "escuta.remover": "Remove",
    "confirm.uma": "Remove this listen?",
    "confirm.sel.um": "Remove the selected listen? This can't be undone.",
    "confirm.sel.varios":
      "Remove the {n} selected listens? This can't be undone.",
    "apagar.um":
      "Delete the logged listen? This can't be undone. To keep a copy, export a backup first.",
    "apagar.varios":
      "Delete all {n} logged listens? This can't be undone. To keep a copy, export a backup first.",
    "backup.vazio.exportar": "There are no listens to export yet.",
    "backup.exportadas": "{n} listens exported.",
    "backup.vazio.apagar": "There are no listens to delete.",
    "backup.importadas":
      "{n} listens imported. {i} skipped (duplicate or invalid).",
    "backup.erro": "Couldn't import. Use a file exported by this app.",
    "periodo.de": " of {ano}",
    "periodo.em": " in {ano}",
    "playlist.titulo": "Your most played songs{p} · {n} {u}",
    "musica.um": "song",
    "musica.varios": "songs",
    "idade.registre": "Log songs to find out.",
    "idade.anos": "{n} years",
    "idade.informe": "Enter your birth year to compare with your real age.",
    "idade.igual": "You are {idade} and you listen like someone your age.",
    "idade.mais":
      "You are {idade}, but you listen like someone {dif} years older.",
    "idade.menos":
      "You are {idade}, but you listen like someone {dif} years younger.",
    "idade.detalhe": "The average year of your songs is {ano}. {comp}",
    "pers.descobrindo": "Still discovering",
    "pers.nostalgico": "Nostalgic",
    "pers.fiel": "Loyal",
    "pers.explorador": "Explorer",
    "pers.ecletico": "Eclectic",
    "corrida.desc":
      "Cumulative ranking of {n} artists from {de} to {ate}. In the last month, first place is {lider}.",
    "corrida.indefinido": "undefined",
    "corrida.artista": "Artist",
    "corrida.tabela": "View as table",
    "corrida.vazio":
      "Log listens from at least 2 artists, in at least 2 different months, to see the race.",
    "q.musica": "What was your most played song{p}?",
    "q.artista": "Which artist did you listen to most{p}?",
    "q.album": "Which album did you listen to most{p}?",
    "q.genero": "Which genre defined your sound most{p}?",
    "quiz.vazio":
      "Log at least 2 different songs to play. Ties for first place also prevent a question.",
    "quiz.todos": "all years",
    "quiz.comecar": "Start quiz",
    "quiz.intro":
      "Do you know what you listened to most? Answer {n} questions about your period.",
    "quiz.periodo":
      "Period: {p}. To change it, use the filter on the Wrapped tab.",
    "quiz.progresso": "Question {i} of {n}",
    "quiz.certo": "Correct! {d}",
    "quiz.errado": "Almost! It was {d}",
    "quiz.ver": "See result",
    "quiz.proxima": "Next question",
    "quiz.resultado": "Result",
    "quiz.placar": "{a} of {n}",
    "quiz.otimo": "You know your sound well!",
    "quiz.melhorar":
      "There's room to improve. How about checking the Wrapped and trying again?",
    "quiz.denovo": "Play again",
  },
};

const CHAVE_IDIOMA = "idioma";

function idiomaInicial() {
  try {
    const salvo = localStorage.getItem(CHAVE_IDIOMA);
    if (salvo in TEXTOS) return salvo;
  } catch (erro) {}
  return (navigator.language || "pt").toLowerCase().startsWith("pt")
    ? "pt"
    : "en";
}

let idiomaAtual = idiomaInicial();

// Busca o texto da chave no idioma atual ({n} vira o valor passado em vars)
function t(chave, vars = {}) {
  const texto = TEXTOS[idiomaAtual][chave] ?? TEXTOS.pt[chave] ?? chave;
  return texto.replace(/\{(\w+)\}/g, (_, nome) => vars[nome] ?? "");
}

// Textos com valores ({n}, {titulo}...) guardam as variáveis em data-i18n-vars (JSON)
function aplicar(el) {
  const vars = el.dataset.i18nVars ? JSON.parse(el.dataset.i18nVars) : {};
  if (el.dataset.i18n) el.textContent = t(el.dataset.i18n, vars);
  if (el.dataset.i18nPlaceholder)
    el.placeholder = t(el.dataset.i18nPlaceholder, vars);
  if (el.dataset.i18nAria)
    el.setAttribute("aria-label", t(el.dataset.i18nAria, vars));
}

function traduzir(raiz) {
  raiz
    .querySelectorAll("[data-i18n],[data-i18n-placeholder],[data-i18n-aria]")
    .forEach(aplicar);
}

function guardarVars(el, vars) {
  if (vars) el.dataset.i18nVars = JSON.stringify(vars);
  else delete el.dataset.i18nVars;
}

// Define um texto que continua traduzido quando o idioma muda (chave vazia limpa o texto)
function definir(el, chave, vars) {
  if (!chave) {
    el.textContent = "";
    delete el.dataset.i18n;
    delete el.dataset.i18nVars;
    return;
  }
  el.dataset.i18n = chave;
  guardarVars(el, vars);
  aplicar(el);
}

function definirAria(el, chave, vars) {
  el.dataset.i18nAria = chave;
  guardarVars(el, vars);
  aplicar(el);
}

function aplicarIdioma(novo) {
  idiomaAtual = novo;
  try {
    localStorage.setItem(CHAVE_IDIOMA, novo);
  } catch (erro) {}

  document.documentElement.lang = novo === "pt" ? "pt-BR" : "en";
  document.title = t("titulo");

  traduzir(document);
  const molde = document.getElementById("tpl-faixa");
  if (molde) traduzir(molde.content); // o molde de músicas também precisa estar traduzido

  document.querySelectorAll(".idioma__btn").forEach((botao) => {
    botao.setAttribute("aria-pressed", String(botao.dataset.idioma === novo));
  });

  // avisa o resto do site (útil para redesenhar textos criados pelo app.js)
  document.dispatchEvent(new CustomEvent("idioma:mudou", { detail: novo }));
}

document.querySelector(".idioma").addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-idioma]");
  if (botao && botao.dataset.idioma !== idiomaAtual)
    aplicarIdioma(botao.dataset.idioma);
});

aplicarIdioma(idiomaAtual);