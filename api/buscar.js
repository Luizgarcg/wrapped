module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const termo = String(req.query.term || "").trim();
  if (!termo) {
    res.status(400).json({ erro: "Informe o parâmetro term" });
    return;
  }

  const params = new URLSearchParams({
    term: termo,
    media: "music",
    entity: "song",
    limit: "10",
    country: "BR",
  });

  try {
    const resposta = await fetch(`https://itunes.apple.com/search?${params}`);
    if (!resposta.ok) {
      res.status(502).json({ erro: `iTunes respondeu ${resposta.status}` });
      return;
    }
    const dados = await resposta.json();
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    res.status(200).json(dados);
  } catch (erro) {
    res.status(502).json({ erro: "Falha ao consultar o iTunes" });
  }
};