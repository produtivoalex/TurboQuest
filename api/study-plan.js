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

function validateQuestions(value, editorial = false) {
  const questions = Array.isArray(value?.questions) ? value.questions : [];
  const valid = questions.filter(question => {
    const options = Array.isArray(question?.options) ? question.options : [];
    return question && String(question.statement || '').length >= 40 && options.length >= (editorial ? 5 : 4) &&
      options.every(option => String(option || '').length >= 8) &&
      Number.isInteger(question.answer) && question.answer >= 0 && question.answer < options.length &&
      String(question.explanation || '').length >= 80;
  });
  return { ...value, questions: valid };
}

function isResearchShape(value) {
  return value && Array.isArray(value.sources) && value.strategy && Array.isArray(value.strategy.priorities);
}

function hasLiveResearch(value, grounding, model, rawData) {
  if (!isResearchShape(value)) return false;
  const urls = value.sources.filter(source => /^https?:\/\//i.test(String(source?.url || '')));
  if (model === 'gemini') {
    return Boolean(urls.length && grounding && (grounding.webSearchQueries?.length || grounding.groundingChunks?.length || grounding.groundingSupports?.length));
  }
  return Boolean(rawData?.choices?.[0]?.message?.executed_tools?.some(tool => tool.type === 'browser_search' || tool.search_results || tool.results) || urls.length);
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
    const errorMessage = data.error?.message || 'Falha na API Groq.';
    if (/tokens per day|TPD/i.test(errorMessage)) throw new Error(errorMessage);
    if (response.status === 429 && attempt < 2) {
      const retrySeconds = Number(response.headers.get('retry-after')) || Number(String(errorMessage).match(/try again in ([\d.]+)s/i)?.[1]) || 5;
      await new Promise(resolve => setTimeout(resolve, Math.min(10000, Math.ceil(retrySeconds * 1000) + 500)));
      continue;
    }
    throw new Error(errorMessage);
  }
  throw new Error('A API Groq não respondeu após as tentativas automáticas.');
}

async function groqResearch(key, prompt, compact = false) {
  const requestPrompt = compact
    ? `Concurso IBGE, cargo informado no contexto abaixo. Faça uma pesquisa web ativa curta sobre esse cargo e a banca. Retorne somente JSON compacto com sources, strategy e uma questão. Contexto: ${prompt.slice(0, 600)}`
    : prompt;
  const response = await groqChat(key, GROQ_RESEARCH_MODEL, [{ role: 'user', content: `${requestPrompt}\n\nFaça somente pesquisa web estratégica e obrigatória usando browser_search, em três frentes: (1) edital e fonte oficial do concurso, (2) provas anteriores da mesma banca, (3) padrão de cobrança e armadilhas da banca. Não faça varredura ampla. Construa um background estratégico para geração posterior em massa: prioridades, tópicos, dificuldade, distratores e recomendações de variação. Retorne SOMENTE JSON válido no formato solicitado. Gere até ${compact ? 1 : 4} questão inicial e cite somente URLs retornadas pela busca.` }], { max_completion_tokens: compact ? 400 : 1200, tool_choice: 'required', tools: [{ type: 'browser_search' }], reasoning_effort: 'low', timeoutMs: 25000 });
  const result = parseModelJson(response.text);
  addGroqSources(result, response.data, response.text);
  if (!hasLiveResearch(result, null, GROQ_RESEARCH_MODEL, response.data) && !compact) throw new Error('O Groq não retornou evidências de pesquisa web ativa.');
  result.sources = Array.isArray(result.sources) ? result.sources : [];
  result.strategy = result.strategy || { priorities: [], notes: [] };
  result.questions = Array.isArray(result.questions) ? result.questions : [];
  result.strategy.notes = [...(result.strategy.notes || []), 'Pesquisa realizada pelo Groq e estruturada automaticamente pelo TurboQuest.'];
  return { result, grounding: null, model: GROQ_RESEARCH_MODEL };
}

async function groqJson(key, prompt) {
  const response = await groqChat(key, GROQ_FORMAT_MODEL, [{ role: 'user', content: `${prompt.slice(0, 10000)}\n\nRetorne somente JSON válido, sem markdown.` }], { max_completion_tokens: 1400 });
  return { result: parseModelJson(response.text), grounding: null, model: GROQ_FORMAT_MODEL };
}

async function groqGenerate(key, prompt, count, editorial = false) {
  const response = await groqChat(key, GROQ_FORMAT_MODEL, [{ role: 'user', content: prompt + '\n\nGere exatamente ' + count + ' questões. ' + (editorial ? 'Use exatamente 5 alternativas plausíveis por questão e inclua whyWrong com 5 justificativas.' : '') + ' Retorne SOMENTE JSON válido, sem markdown.' }], {
    max_completion_tokens: 6500,
    temperature: 0.35,
    timeoutMs: 55000
  });
  const result = validateQuestions(parseModelJson(response.text), editorial);
  if (result.questions.length < Math.max(1, Math.floor(count * 0.8))) {
    throw new Error('O modelo retornou ' + result.questions.length + ' questões válidas de ' + count + ' solicitadas.');
  }
  return { result, grounding: null, model: GROQ_FORMAT_MODEL };
}

function buildGeneratePrompt({ exam, cargo, edital, background }) {
  return 'Você é um elaborador sênior de questões para concursos. Gere questões de altíssima qualidade a partir do edital e do background pesquisado.\n' +
    'Respeite disciplinas, pesos, tópicos e atribuições do cargo. Exija raciocínio, interpretação, aplicação ou distinção conceitual real. Use enunciados contextualizados no estilo da banca, sem copiar questões. Crie quatro alternativas plausíveis, homogêneas e tecnicamente próximas, sem alternativas absurdas ou que revelem a resposta. Varie a posição do gabarito entre A, B, C e D. Não repita ideia, cenário, tópico ou estrutura dentro do lote. A dificuldade deve ser real. Explique o raciocínio e por que os distratores estão errados. Nunca invente regra, número ou fonte; use sourceUrl apenas de URLs do background.\n' +
    'Formato editorial: {"questions":[{"subject":"","difficulty":"medium|hard|very-hard","topic":"","statement":"","options":["","","","",""],"answer":0,"explanation":"","whyWrong":["","","","",""],"sourceUrl":""}]}\n' +
    'CONCURSO: ' + exam + '\nCARGO: ' + (cargo || 'não informado') + '\nEDITAL:\n' + edital + '\nBACKGROUND PESQUISADO:\n' + (background || 'Nenhum background foi fornecido; use somente o edital.');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método não permitido.' });
  const groqKey = process.env.GROQ_API_KEY;
  const backupKey = process.env.GROQ_API_KEY_BACKUP;
  if (!groqKey && !backupKey) return json(res, 503, { error: 'Configure GROQ_API_KEY nas variáveis Production do Vercel.' });
  const { action, edital, cargo, exam = 'IBGE' } = req.body || {};
  if (!edital || edital.length < 80) return json(res, 400, { error: 'O edital precisa conter mais texto.' });

  const isResearch = action === 'research';
  const isGenerate = action === 'generate';
  const editorial = Boolean(req.body?.editorial);
  const requestedCount = Math.max(1, Math.min(10, Number(req.body?.count) || 5));
  const background = String(req.body?.background || '').slice(0, 30000);
  const editalForPrompt = isResearch ? edital.slice(0, 5000) : edital.slice(0, 220000);
  let prompt = isResearch
    ? `Você é o motor estratégico do TurboQuest. O estudante vai prestar ${exam}, para o cargo: ${cargo || 'não informado'}.
Analise o edital abaixo e faça uma pesquisa ampla e atualizada na web, usando fontes oficiais, provas anteriores da mesma banca e questões de concursos equivalentes. Não invente fontes: registre URLs e explique a relevância.
Crie um background estratégico completo para geração posterior em massa, sem impor limite artificial de questões. Não desperdice espaço com questões de demonstração; concentre-se em fontes, distribuição, tópicos, padrões da banca, armadilhas e critérios de qualidade. Responda SOMENTE JSON válido no formato:
{"sources":[{"title":"","url":"","why":""}],"strategy":{"priorities":[{"subject":"","weight":0,"questionShare":0,"topics":[]}],"notes":[]},"questions":[{"subject":"","difficulty":"medium|hard","statement":"","options":["","","",""],"answer":0,"explanation":"","sourceUrl":""}]}
EDITAL:\n${editalForPrompt}`
    : `Você é um analista especialista em editais de concursos brasileiros. Analise integralmente este edital para o TurboQuest. Extraia cargo(s), banca, órgão, datas, número de questões, pesos, disciplinas, tópicos, critérios e qualquer regra relevante. Não faça perguntas ainda. Responda SOMENTE JSON válido no formato:
{"exam":"","board":"","roles":[""],"examDate":"","totalQuestions":0,"subjects":[{"name":"","questions":0,"weight":0,"topics":[]}],"summary":"","warnings":[]}
EDITAL:\n${editalForPrompt}`;

  if (isGenerate) prompt = buildGeneratePrompt({ exam, cargo, edital: edital.slice(0, 50000), background });

  try {
    const run = (key, compact = false) => isResearch ? groqResearch(key, prompt, compact) : isGenerate ? groqGenerate(key, prompt, requestedCount, editorial) : groqJson(key, prompt);
    let result;
    try {
      result = await run(groqKey || backupKey);
    } catch (error) {
      if (!backupKey || backupKey === groqKey) throw error;
      try {
        result = await run(backupKey, true);
      } catch (backupError) {
        throw new Error(`Chave principal: ${error.message || 'falhou'}. Chave de backup: ${backupError.message || 'falhou'}.`);
      }
      result.result.strategy = result.result.strategy || {};
      result.result.strategy.notes = [...(result.result.strategy.notes || []), 'A chave Groq principal falhou; foi usada a chave de backup.'];
    }
    if (isResearch) {
      result.result.strategy = result.result.strategy || {};
      result.result.strategy.notes = [...(result.result.strategy.notes || []), 'Background pesquisado pelo Groq com browser_search e pronto para geração de questões em massa.'];
    }
    return json(res, 200, result);
  } catch (error) {
    return json(res, 502, { error: `Groq não conseguiu concluir a pesquisa: ${error.message || 'erro desconhecido'}.` });
  }
}
