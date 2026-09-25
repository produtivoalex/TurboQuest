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
  if (model === 'gemini') {
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

function addGroqSources(value, data, text) {
  if (!isResearchShape(value)) return value;
  const urls = [...String(text || '').matchAll(/https?:\/\/[^\s\]})>"]+/gi)].map(match => match[0].replace(/[.,;]+$/, ''));
  const executed = data?.choices?.[0]?.message?.executed_tools || [];
  const searchResults = executed.flatMap(tool => tool.search_results || tool.results || []);
  const candidates = [...urls.map(url => ({ title: url, url, why: 'Fonte citada pela pesquisa web do Groq.' })), ...searchResults.map(item => ({ title: item.title || item.url, url: item.url || item.link, why: 'Fonte retornada pelo browser_search do Groq.' }))].filter(source => /^https?:\/\//i.test(String(source.url || '')));
  const known = new Set(value.sources.map(source => source?.url));
  value.sources = [...value.sources, ...candidates.filter(source => !known.has(source.url))];
  return value;
}

async function groqChat(key, model, messages, extra = {}) {
  const { timeoutMs = 30000, ...requestOptions } = extra;
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({ model, messages, max_completion_tokens: 1800, temperature: 0.2, ...requestOptions })
    });
    const data = await response.json();
    if (response.ok) return { text: data.choices?.[0]?.message?.content || '', data };
    if (response.status === 429 && attempt < 2) {
      const retrySeconds = Number(response.headers.get('retry-after')) || Number(String(data.error?.message || '').match(/try again in ([\d.]+)s/i)?.[1]) || 5;
      await new Promise(resolve => setTimeout(resolve, Math.min(10000, Math.ceil(retrySeconds * 1000) + 500)));
      continue;
    }
    throw new Error(data.error?.message || 'Falha na API Groq.');
  }
  throw new Error('A API Groq não respondeu após as tentativas automáticas.');
}

async function groqResearch(key, prompt) {
  const response = await groqChat(key, GROQ_RESEARCH_MODEL, [{ role: 'user', content: `${prompt}\n\nFaça pesquisa web ativa e obrigatória usando browser_search. Consulte fontes oficiais e provas anteriores da banca. Construa um background estratégico para geração posterior em massa: padrões de cobrança, prioridades, armadilhas, dificuldade e regras para distratores. Retorne SOMENTE JSON válido no formato solicitado. Gere até 4 questões iniciais e cite somente URLs retornadas pela busca.` }], { max_completion_tokens: 1200, tool_choice: 'required', tools: [{ type: 'browser_search' }], reasoning_effort: 'low', timeoutMs: 25000 });
  const result = parseModelJson(response.text);
  addGroqSources(result, response.data, response.text);
  if (!hasLiveResearch(result, null, GROQ_RESEARCH_MODEL)) throw new Error('O Groq não retornou evidências de pesquisa web ativa.');
  result.strategy.notes = [...(result.strategy.notes || []), 'Pesquisa realizada pelo Groq e estruturada automaticamente pelo TurboQuest.'];
  return { result, grounding: null, model: GROQ_RESEARCH_MODEL };
}

async function groqJson(key, prompt) {
  const response = await groqChat(key, GROQ_FORMAT_MODEL, [{ role: 'user', content: `${prompt.slice(0, 10000)}\n\nRetorne somente JSON válido, sem markdown.` }], { max_completion_tokens: 1400 });
  return { result: parseModelJson(response.text), grounding: null, model: GROQ_FORMAT_MODEL };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método não permitido.' });
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return json(res, 503, { error: 'GROQ_API_KEY não está configurada nas variáveis Production do Vercel.' });
  const { action, edital, cargo, exam = 'IBGE' } = req.body || {};
  if (!edital || edital.length < 80) return json(res, 400, { error: 'O edital precisa conter mais texto.' });

  const isResearch = action === 'research';
  const editalForPrompt = isResearch ? edital.slice(0, 5000) : edital.slice(0, 220000);
  const prompt = isResearch
    ? `Você é o motor estratégico do TurboQuest. O estudante vai prestar ${exam}, para o cargo: ${cargo || 'não informado'}.
Analise o edital abaixo e faça uma pesquisa ampla e atualizada na web, usando fontes oficiais, provas anteriores da mesma banca e questões de concursos equivalentes. Não invente fontes: registre URLs e explique a relevância.
Crie um background estratégico completo para geração posterior em massa e até 6 questões difíceis, sem alternativas óbvias, respeitando a distribuição e os pesos do edital. Inclua gabarito e explicação curta. Responda SOMENTE JSON válido no formato:
{"sources":[{"title":"","url":"","why":""}],"strategy":{"priorities":[{"subject":"","weight":0,"questionShare":0,"topics":[]}],"notes":[]},"questions":[{"subject":"","difficulty":"medium|hard","statement":"","options":["","","",""],"answer":0,"explanation":"","sourceUrl":""}]}
EDITAL:\n${editalForPrompt}`
    : `Você é um analista especialista em editais de concursos brasileiros. Analise integralmente este edital para o TurboQuest. Extraia cargo(s), banca, órgão, datas, número de questões, pesos, disciplinas, tópicos, critérios e qualquer regra relevante. Não faça perguntas ainda. Responda SOMENTE JSON válido no formato:
{"exam":"","board":"","roles":[""],"examDate":"","totalQuestions":0,"subjects":[{"name":"","questions":0,"weight":0,"topics":[]}],"summary":"","warnings":[]}
EDITAL:\n${editalForPrompt}`;

  try {
    const result = isResearch ? await groqResearch(groqKey, prompt) : await groqJson(groqKey, prompt);
    result.result.strategy = result.result.strategy || {};
    result.result.strategy.notes = [...(result.result.strategy.notes || []), 'Background pesquisado pelo Groq com browser_search e pronto para geração de questões em massa.'];
    return json(res, 200, result);
  } catch (error) {
    return json(res, 502, { error: `Groq não conseguiu concluir a pesquisa: ${error.message || 'erro desconhecido'}.` });
  }
}
