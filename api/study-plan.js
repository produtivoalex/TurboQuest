function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

// A geração editorial acontece no processo de curadoria, fora do app público.
// Isso evita consumo de APIs, respostas sem revisão e publicação acidental.
export default function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método não permitido.' });
  return json(res, 410, {
    error: 'A geração por IA está desativada no app público. O TurboQuest usa o banco editorial revisado pelo administrador.'
  });
}
