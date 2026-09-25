const MODEL = 'gemini-3.1-flash-lite';
const GROQ_RESEARCH_MODEL = process.env.GROQ_RESEARCH_MODEL || 'openai/gpt-oss-20b';
const GROQ_FORMAT_MODEL = process.env.GROQ_FORMAT_MODEL || 'openai/gpt-oss-20b';

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

function isResearchShape(value) {
  return value && Array.isArray(value.sources) && value.strategy && Array.isArray(value.strategy.priorities);
}

function hasLiveResearch(value, grounding, model) {
  if (!isResearchShape(value)) return false;
  const urls = value.sources.filter(source => /^https?:\/\//i.test(String(source?.url || '')));
  if (!urls.length) return false;
  if (model === MODEL) {
    return Boolean(grounding && (grounding.webSearchQueries?.length || grounding.groundingChunks?.length || grounding.groundingSupports?.length));
  }
  return true;
}

function addGroundingSources(value, grounding) {
  if (!isResearchShape(value) || !grounding?.groundingChunks) return value;
  const groundingSources = grounding.groundingChunks
    .map(chunk => chunk.web)
    .filter(web => web?.uri)
    .map(web => ({ title: web.title || web.uri, url: web.uri, why: 'Fonte retornada pela pesquisa Google.' }));
  const known = new Set(value.sources.map(source => source?.url));
  value.sources = [...value.sources, ...groundingSources.filter(source => !known.has(source.url))];
  return value;
}

async function groqChat(key, model, messages, extra = {}) {
  const { timeoutMs = 30000, ...requestOptions } = extra;
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({ model, messages, max_tokens: 3500, temperature: 0.2, ...requestOptions })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Falha na API Groq.');
  return { text: data.choices?.[0]?.message?.content || '', data };
}

async function groqResearch(key, prompt) {
  const response = await groqChat(key, GROQ_RESEARCH_MODEL, [{ role: 'user', content: `${prompt}\n\nFaça pesquisa web ativa e obrigatória usando browser_search. Consulte fontes oficiais, provas anteriores da banca e materiais relevantes. Retorne SOMENTE JSON válido, sem markdown, neste formato: {"sources":[{"title":"","url":"","why":""}],"strategy":{"priorities":[{"subject":"","weight":0,"questionShare":0,"topics":[]}],"notes":[]},"questions":[{"subject":"","difficulty":"medium|hard","statement":"","options":["","","",""],"answer":0,"explanation":"","sourceUrl":""}]}. Use no máximo 4 questões e cite somente URLs retornadas pela busca.` }], { max_tokens: 3000, tool_choice: 'required', tools: [{ type: 'browser_search' }], reasoning_effort: 'low', timeoutMs: 25000 });
  const result = parseModelJson(response.text);
  if (!hasLiveResearch(result, null, GROQ_RESEARCH_MODEL)) throw new Error('O Groq não retornou evidências de pesquisa web ativa.');
  result.strategy.notes = [...(result.strategy.notes || []), 'Pesquisa realizada pelo Groq e estruturada automaticamente pelo TurboQuest.'];
  return { result, grounding: null, model: GROQ_RESEARCH_MODEL };
}

async function groqJson(key, prompt) {
  const response = await groqChat(key, GROQ_FORMAT_MODEL, [{ role: 'user', content: `${prompt.slice(0, 16000)}\n\nRetorne somente JSON válido, sem markdown.` }], { max_tokens: 2500 });
  return { result: parseModelJson(response.text), grounding: null, model: GROQ_FORMAT_MODEL };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método não permitido.' });
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  if (!geminiKey && !groqKey) return json(res, 503, { error: 'Configure GEMINI_API_KEY ou GROQ_API_KEY nas variáveis Production do Vercel.' });
  const { action, edital, cargo, exam = 'IBGE' } = req.body || {};
  if (!edital || edital.length < 80) return json(res, 400, { error: 'O edital precisa conter mais texto.' });

  const isResearch = action === 'research';
  const editalForPrompt = isResearch ? edital.slice(0, 16000) : edital.slice(0, 220000);
  const prompt = isResearch
    ? `Você é o motor estratégico do TurboQuest. O estudante vai prestar ${exam}, para o cargo: ${cargo || 'não informado'}.
Analise o edital abaixo e faça uma pesquisa ampla e atualizada na web, usando fontes oficiais, provas anteriores da mesma banca e questões de concursos equivalentes. Não invente fontes: registre URLs e explique a relevância.
Crie um plano de estudo acionável e no máximo 6 questões difíceis, sem alternativas óbvias, respeitando a distribuição e os pesos do edital. Inclua gabarito e explicação curta. Responda SOMENTE JSON válido no formato:
{"sources":[{"title":"","url":"","why":""}],"strategy":{"priorities":[{"subject":"","weight":0,"questionShare":0,"topics":[]}],"notes":[]},"questions":[{"subject":"","difficulty":"medium|hard","statement":"","options":["","","",""],"answer":0,"explanation":"","sourceUrl":""}]}
EDITAL:\n${editalForPrompt}`
    : `Você é um analista especialista em editais de concursos brasileiros. Analise integralmente este edital para o TurboQuest. Extraia cargo(s), banca, órgão, datas, número de questões, pesos, disciplinas, tópicos, critérios e qualquer regra relevante. Não faça perguntas ainda. Responda SOMENTE JSON válido no formato:
{"exam":"","board":"","roles":[""],"examDate":"","totalQuestions":0,"subjects":[{"name":"","questions":0,"weight":0,"topics":[]}],"summary":"","warnings":[]}
EDITAL:\n${editalForPrompt}`;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 4500, thinkingConfig: { thinkingLevel: isResearch ? 'low' : 'high' } },
    ...(isResearch ? { tools: [{ googleSearch: {} }] } : {})
  };

  try {
    if (!geminiKey) throw new Error('Gemini não configurado.');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiKey },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || `Gemini retornou HTTP ${response.status}.`);
    const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    const result = parseModelJson(text);
    const grounding = data.candidates?.[0]?.groundingMetadata || null;
    addGroundingSources(result, grounding);
    if (isResearch && !hasLiveResearch(result, grounding, MODEL)) throw new Error('Gemini não retornou evidências de pesquisa web ativa.');
    return json(res, 200, { result, grounding, model: MODEL });
  } catch (error) {
    if (groqKey) {
      try {
        const fallback = isResearch ? await groqResearch(groqKey, prompt) : await groqJson(groqKey, prompt);
        fallback.result.strategy = fallback.result.strategy || {};
        fallback.result.strategy.notes = [...(fallback.result.strategy.notes || []), `Gemini falhou (${error.message || 'resposta inválida'}); Groq assumiu automaticamente.`];
        return json(res, 200, fallback);
      } catch (fallbackError) {
        return json(res, 502, { error: `Gemini falhou: ${error.message || 'resposta inválida'}. Groq também falhou: ${fallbackError.message || 'erro desconhecido'}.` });
      }
    }
    return json(res, 502, { error: `Gemini falhou: ${error.message || 'resposta inválida'}. Configure também GROQ_API_KEY para fallback.` });
  }
}
