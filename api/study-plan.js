const MODEL = 'gemini-3.8-flash';

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function parseModelJson(text) {
  const cleaned = String(text || '').replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  try { return JSON.parse(cleaned); } catch (_) {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch (_) {} }
  return { summary: cleaned };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método não permitido.' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return json(res, 503, { error: 'Configure GEMINI_API_KEY nas variáveis do Vercel.' });
  const { action, edital, cargo, exam = 'IBGE' } = req.body || {};
  if (!edital || edital.length < 80) return json(res, 400, { error: 'O edital precisa conter mais texto.' });

  const isResearch = action === 'research';
  const prompt = isResearch
    ? `Você é o motor estratégico do TurboQuest. O estudante vai prestar ${exam}, para o cargo: ${cargo || 'não informado'}.
Analise o edital abaixo e faça uma pesquisa ampla e atualizada na web, usando fontes oficiais, provas anteriores da mesma banca e questões de concursos equivalentes. Não invente fontes: registre URLs e explique a relevância.
Crie um plano de estudo acionável e no máximo 6 questões difíceis, sem alternativas óbvias, respeitando a distribuição e os pesos do edital. Inclua gabarito e explicação curta. Responda SOMENTE JSON válido no formato:
{"sources":[{"title":"","url":"","why":""}],"strategy":{"priorities":[{"subject":"","weight":0,"questionShare":0,"topics":[]}],"notes":[]},"questions":[{"subject":"","difficulty":"medium|hard","statement":"","options":["","","",""],"answer":0,"explanation":"","sourceUrl":""}]}
EDITAL:\n${edital.slice(0, 220000)}`
    : `Você é um analista especialista em editais de concursos brasileiros. Analise integralmente este edital para o TurboQuest. Extraia cargo(s), banca, órgão, datas, número de questões, pesos, disciplinas, tópicos, critérios e qualquer regra relevante. Não faça perguntas ainda. Responda SOMENTE JSON válido no formato:
{"exam":"","board":"","roles":[""],"examDate":"","totalQuestions":0,"subjects":[{"name":"","questions":0,"weight":0,"topics":[]}],"summary":"","warnings":[]}
EDITAL:\n${edital.slice(0, 220000)}`;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 4500, thinkingConfig: { thinkingLevel: isResearch ? 'low' : 'high' } }
  };
  if (isResearch) payload.tools = [{ googleSearch: {} }];

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) return json(res, response.status, { error: data.error?.message || 'Falha na API Gemini.' });
    const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    return json(res, 200, { result: parseModelJson(text), grounding: data.candidates?.[0]?.groundingMetadata || null, model: MODEL });
  } catch (error) { return json(res, 500, { error: 'Não foi possível concluir a análise agora.' }); }
}
