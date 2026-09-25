const STORAGE_KEY = 'tq-study-v4';
const LEGACY_KEY = 'tq-state-v3';
const DAY_MS = 86400000;
const DAILY_GOAL = 10;
const $ = selector => document.querySelector(selector);

function localDay(now = Date.now()) {
  const date = new Date(now);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function freshState() {
  return { done: 0, correct: 0, role: '', records: {}, days: {}, totalStudyMs: 0, updatedAt: 0, activeSession: null };
}

function loadState(storage) {
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      return { ...freshState(), ...saved, records: saved.records || {}, days: saved.days || {} };
    }
  } catch { /* A damaged local record must not block studying. */ }
  const state = freshState();
  try {
    const old = JSON.parse(storage.getItem(LEGACY_KEY) || 'null');
    if (old) {
      state.done = Number(old.done) || 0;
      state.correct = Number(old.correct) || 0;
    }
  } catch { /* Keep a fresh state. */ }
  return state;
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function subjectAccuracy(state, subject, bank) {
  const ids = new Set(bank.filter(q => q.subject === subject).map(q => q.id));
  let attempts = 0, correct = 0;
  for (const [id, record] of Object.entries(state.records)) {
    if (ids.has(id)) { attempts += record.attempts || 0; correct += record.correct || 0; }
  }
  return attempts ? correct / attempts : null;
}

function priorityForQuestion(q, state, bank, now) {
  const record = state.records[q.id];
  if (record && eligibleAt(record) > now) return -Infinity;
  const subjectRate = subjectAccuracy(state, q.subject, bank);
  const subjectNeed = subjectRate === null ? 0 : Math.max(0, .85 - subjectRate);
  const topicRecords = bank.filter(item => item.topic === q.topic && item.subject === q.subject)
    .map(item => state.records[item.id]).filter(Boolean);
  const topicAttempts = topicRecords.reduce((sum, item) => sum + (item.attempts || 0), 0);
  const topicCorrect = topicRecords.reduce((sum, item) => sum + (item.correct || 0), 0);
  const topicNeed = topicAttempts ? Math.max(0, .85 - topicCorrect / topicAttempts) : 0;
  if (!record) {
    const curated = /^ibge26-b009-/.test(q.id) ? 12 : /^ibge26-b008-/.test(q.id) ? 8 : /^ibge26-b007-/.test(q.id) ? 5 : 0;
    const templated = q.statement.includes('Considere o contexto da operação descrito no edital') ||
      q.explanation.includes('A alternativa correta preserva o critério do enunciado') ? 15 : 0;
    return 40 + curated - templated + 16 * subjectNeed + 18 * topicNeed;
  }
  const overdueDays = Math.max(0, (now - (record.dueAt || 0)) / DAY_MS);
  const difficulty = (record.wrong || 0) * 4 + (record.hard || 0) * 2;
  return 55 + Math.min(15, overdueDays * 2) + difficulty + 16 * subjectNeed + 18 * topicNeed;
}

function eligibleAt(record) {
  if (!record || record.retired) return Infinity;
  // Protect older 5/30-minute schedules too; recognition right after an answer is not recall.
  const minimumGap = record.lastOutcome === 'hard' ? 18 : record.lastOutcome === 'wrong' ? 8 :
    record.hard || record.wrong ? 8 : 0;
  return Math.max(Number(record.dueAt) || 0, (Number(record.lastAt) || 0) + minimumGap * 3600000);
}

function examWeights(manifest, role, subjects) {
  const row = manifest?.roles?.find(item => item.id === role);
  const source = row?.subjects || [];
  const raw = Object.fromEntries(subjects.map(subject => [subject,
    source.find(item => item.name === subject)?.points || source.find(item => item.name === subject)?.questions || 1]));
  const total = Object.values(raw).reduce((sum, value) => sum + value, 0);
  return Object.fromEntries(subjects.map(subject => [subject, raw[subject] / total]));
}

function buildQueue(pool, state, manifest, role, count, now = Date.now()) {
  const allowed = manifest?.roles?.find(item => item.id === role)?.subjects.map(item => item.name);
  const scope = allowed ? pool.filter(q => allowed.includes(q.subject)) : pool;
  const available = scope.filter(q => !state.records[q.id] || eligibleAt(state.records[q.id]) <= now);
  if (!available.length) return [];
  const subjects = [...new Set(available.map(q => q.subject))];
  const base = examWeights(manifest, role, subjects);
  const weights = Object.fromEntries(subjects.map(subject => {
    const accuracy = subjectAccuracy(state, subject, scope);
    const weakness = accuracy === null ? 0 : Math.max(0, .85 - accuracy);
    return [subject, base[subject] * (1 + 1.5 * weakness)];
  }));
  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0);
  const chosen = [], picked = new Set(), subjectCounts = Object.fromEntries(subjects.map(s => [s, 0]));
  const scores = new Map(available.map(q => [q.id, priorityForQuestion(q, state, scope, now) + Math.random() * .1]));
  const limit = Math.min(count, available.length);
  while (chosen.length < limit) {
    const target = subjects.filter(subject => available.some(q => q.subject === subject && !picked.has(q.id)))
      .sort((a, b) => ((chosen.length + 1) * weights[b] / totalWeight - subjectCounts[b]) -
                       ((chosen.length + 1) * weights[a] / totalWeight - subjectCounts[a]))[0];
    if (!target) break;
    const next = available.filter(q => q.subject === target && !picked.has(q.id))
      .sort((a, b) => scores.get(b.id) - scores.get(a.id))[0];
    chosen.push(next); picked.add(next.id); subjectCounts[target]++;
  }
  return chosen;
}

function schedule(record, ok, confidence, now) {
  const next = { ...record };
  const previousInterval = Math.max(0, Number(next.intervalDays) || 0);
  if (!ok) {
    next.wrong = (next.wrong || 0) + 1;
    next.lastOutcome = 'wrong';
    next.intervalDays = next.wrong > 1 ? 16 / 24 : 8 / 24;
    next.dueAt = now + next.intervalDays * DAY_MS;
  } else if (confidence === 'hard') {
    next.hard = (next.hard || 0) + 1;
    next.lastOutcome = 'hard';
    next.intervalDays = previousInterval < 1 ? 18 / 24 : Math.max(2, Math.round(previousInterval / 2));
    next.dueAt = now + next.intervalDays * DAY_MS;
  } else {
    next.easyCount = (next.easyCount || 0) + 1;
    next.lastOutcome = 'easy';
    if (next.easyCount >= 2) {
      next.retired = true;
      next.dueAt = null;
    } else {
      next.intervalDays = (next.wrong || next.hard) ? 3 : 14;
      next.dueAt = now + next.intervalDays * DAY_MS;
    }
  }
  return next;
}

function formatClock(ms) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function formatDuration(ms) {
  const minutes = Math.floor(Math.max(0, ms) / 60000);
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}min` :
    minutes ? `${minutes} min` : `${Math.floor(Math.max(0, ms) / 1000)} s`;
}

function subjectReport(state, bank) {
  const byId = new Map(bank.map(q => [q.id, q]));
  const result = new Map();
  for (const [id, record] of Object.entries(state.records || {})) {
    const subject = record.subject || byId.get(id)?.subject || 'Questões de versões anteriores';
    const row = result.get(subject) || { subject, done: 0, correct: 0, wrong: 0, timeMs: 0 };
    row.done += record.attempts || 0;
    row.correct += record.correct || 0;
    row.wrong += Math.max(0, (record.attempts || 0) - (record.correct || 0));
    row.timeMs += record.timeMs || 0;
    result.set(subject, row);
  }
  const reported = [...result.values()].reduce((sum, row) => sum + row.done, 0);
  if ((state.done || 0) > reported) {
    const extra = (state.done || 0) - reported;
    const right = Math.max(0, (state.correct || 0) - [...result.values()].reduce((sum, row) => sum + row.correct, 0));
    result.set('Histórico sem disciplina', { subject: 'Histórico sem disciplina', done: extra, correct: Math.min(extra, right), wrong: Math.max(0, extra - right), timeMs: 0 });
  }
  return [...result.values()].sort((a, b) => b.done - a.done || a.subject.localeCompare(b.subject));
}

const TIPS = [
  [/data e período|período de referência/i, 'Separe a data da entrevista do período a que a resposta deve se referir. A atividade precisa ser julgada pelo recorte temporal pedido, não pelo momento atual.'],
  [/geometria/i, 'Desenhe a figura e anote as medidas com unidades. Em retângulos, área é base × altura e perímetro soma todos os lados.'],
  [/atendimento ao público|abordagem inicial/i, 'Identifique a necessidade, comunique com clareza e confirme o entendimento. Não confunda acolhimento com promessa fora da competência do agente.'],
  [/processo decisório|tomada de decisão|decisão programada/i, 'Liste objetivo, alternativas e critérios. Decisão programada é repetitiva e segue procedimento; a não programada exige análise nova.'],
  [/sistemas abertos/i, 'Pense em entradas, transformação, saídas e feedback. Um sistema aberto interage com o ambiente; não funciona isolado.'],
  [/qualidade em serviços|controle de qualidade|qualidade$/i, 'Verifique se a alternativa atende ao padrão definido e à necessidade do usuário. Qualidade não é apenas rapidez nem ausência de reclamação.'],
  [/responsabilidade e autoridade|unidade de comando/i, 'Autoridade permite decidir e orientar; responsabilidade é prestar contas pelo resultado. Unidade de comando evita ordens conflitantes.'],
  [/avaliação de desempenho|análise de causa/i, 'Compare o resultado com critérios previamente definidos. Trate causa, não só sintoma; um indicador isolado não explica todo o desempenho.'],
  [/gestão de riscos|continuidade operacional/i, 'Risco combina chance e impacto. Identifique prevenção, resposta e recuperação; um plano de continuidade mantém as atividades essenciais.'],
  [/documentação e arquivo|arquivos e pastas|arquivos e cópias|extensões de arquivo/i, 'Separe nome, extensão e localização. Mover muda o local; copiar mantém o original; renomear a extensão não converte o conteúdo.'],
  [/operação offline|logs de transmissão/i, 'Offline significa registrar localmente e transmitir depois. Confirme no log ou recibo se a sincronização terminou antes de concluir que os dados chegaram.'],
  [/confidencialidade/i, 'Confidencialidade limita quem pode ler. Não confunda com integridade (dados corretos) nem disponibilidade (acesso quando necessário).'],
  [/Android|Wi-Fi|dados móveis|redes$|DNS|HTTPS|navegadores|navegação na web|navegação privada/i, 'Distinga conexão, identificação do destino e proteção dos dados. Navegação privada não torna a conexão anônima; HTTPS protege o tráfego, não garante que o site seja confiável.'],
  [/recortar e copiar|atalhos de teclado|editor de texto|formatação/i, 'Simule a ação passo a passo. Copiar preserva o original; recortar prepara a remoção ao colar; formatar muda aparência, não necessariamente conteúdo.'],
  [/referência pronominal|colocação pronominal/i, 'Identifique o termo retomado pelo pronome. Em colocação, procure palavras atrativas antes de aplicar a regra de próclise/ênclise.'],
  [/voz verbal|voz passiva/i, 'Ache quem pratica e quem sofre a ação. Ao passar para a passiva, preserve o tempo verbal e o sentido original.'],
  [/valor semântico|reescrita|ambiguidade|paralelismo|parônimos/i, 'Compare as frases pelo sentido, não só pela gramática. Troque a expressão por uma paráfrase curta e veja se a relação lógica permanece.'],
  [/acentuação|ortografia/i, 'Separe sílabas, localize a tônica e aplique a regra ao padrão identificado; não decida apenas pela aparência da palavra.'],
  [/equação|equações|sequência/i, 'Escreva a relação em símbolos e teste com os dados do enunciado. Em sequência, compare diferenças ou razões antes de escolher a próxima posição.'],
  [/estrutura censitária|atribuições|instrumentos de trabalho|áreas de interesse operacional/i, 'Identifique o agente, sua atribuição e o instrumento citado. Uma ação operacional não deve ser atribuída automaticamente a qualquer cargo.'],
  [/imagem de satélite|ponto de referência/i, 'Use a imagem ou referência para localizar, mas confirme a delimitação pelo mapa e descritivo. Aparência visual não substitui critério territorial.'],
  [/identidade autodeclarada/i, 'Se o quesito é autodeclarado, registre a resposta da pessoa; não a substitua por inferência do entrevistador.'],
  [/áreas não contínuas|rios e estradas|continuidade territorial|litígio|sucessão e partilha/i, 'Não decida só pelo limite físico ou documento de propriedade. Confira continuidade, administração da exploração e referência temporal exigidas pelo conceito.'],
  [/estrutura organizacional|departamentalização|estrutura informal/i, 'Desenhe mentalmente quem responde a quem. Estrutura formal está no organograma; relações informais surgem da interação real.'],
  [/motivação|gestão de processos|processos$|gestão de mudanças|capacitação/i, 'Distinga pessoas, fluxo de trabalho e resultado. Escolha a intervenção que ataca a causa identificada e permite verificar o efeito.'],
  [/SWOT/i, 'Forças e fraquezas são internas; oportunidades e ameaças vêm do ambiente externo. Classifique antes de comparar as alternativas.'],
  [/priorização|distribuição de trabalho|negociação|metas SMART|prestação de contas/i, 'Ordene por urgência e impacto, explicite responsável e prazo e defina um critério observável de conclusão. Evite ações vagas.'],
  [/e-mail|cópia oculta/i, 'Destinatários em Cc ficam visíveis; em Cco, não aparecem aos demais destinatários. Verifique também assunto, anexo e destinatário antes de enviar.'],
  [/armazenamento/i, 'Compare capacidade e finalidade: memória temporária, armazenamento persistente e cópia de segurança não exercem a mesma função.'],
  [/modificador e complemento|alteração de limites/i, 'No endereço, modificador e complemento refinam a localização. Mudança territorial exige conferir a delimitação oficial, não apenas a descrição informal.'],
  [/lazer versus produção|atividade industrial|arrendatário sem área/i, 'Pergunte se há exploração agropecuária no período de referência. Posse da terra, lazer ou transformação industrial isolados não bastam para definir estabelecimento.'],
  [/crase/i, 'Troque o termo feminino por um masculino: se surgir “ao”, há forte indicação de “à”. Confira também as exceções da expressão.'],
  [/concordância|impessoalidade/i, 'Localize o núcleo do sujeito antes de escolher o verbo. Em “haver” com sentido de existir e “fazer” indicando tempo, use o singular.'],
  [/regência/i, 'Ache primeiro o verbo ou nome regente e pergunte qual preposição ele exige; só depois compare as alternativas.'],
  [/pontuação|oração restritiva/i, 'Leia o trecho sem a expressão entre vírgulas: se o sentido essencial mudar, a vírgula pode estar isolando indevidamente uma restrição.'],
  [/coesão|pronome|conector|conectivo|inferência|interpretação|compreensão/i, 'Volte à frase anterior e substitua o pronome ou conectivo por seu referente ou relação lógica. Releia o parágrafo inteiro antes de concluir.'],
  [/porcentag|variação percentual|juros simples/i, 'Converta a taxa em fator antes da conta: aumento de 20% = multiplicar por 1,20; desconto de 20% = por 0,80. Percentuais sucessivos não se somam.'],
  [/regra de três|razão|razões|proporção|escala|velocidade/i, 'Anote unidades e sentido da relação antes de montar a proporção. Grandezas inversas exigem inverter uma das razões.'],
  [/probabilidade|combinatória|conjuntos|inclusão-exclusão/i, 'Conte o universo primeiro. Para “pelo menos um”, tente o complemento; para união de conjuntos, subtraia a interseção contada duas vezes.'],
  [/média|mediana|frações/i, 'Escreva os valores em uma linha. Para média ponderada, some produto × peso e divida pela soma dos pesos; para mediana, ordene antes.'],
  [/negação|condicional|proposicional|equivalência|dedução|argumentação|disjunção/i, 'Traduza a frase para P e Q. “Se P, então Q” só é falsa quando P é verdadeira e Q é falsa; negue quantificadores trocando “todo” por “existe ... não”.'],
  [/CONT.SE/i, 'Separe intervalo e critério. CONT.SE conta células que atendem ao critério; não soma seus valores.'],
  [/referência absoluta|referência mista|referências absolutas|referências mistas/i, 'Em planilhas, o cifrão fixa a parte imediatamente seguinte: $A fixa a coluna; $1 fixa a linha. Simule copiar a fórmula uma célula.'],
  [/planilha|filtro|classificação|ordenação|CSV|gráfico/i, 'Diferencie alterar a visualização de alterar os dados: filtro oculta linhas, ordenação muda a ordem, fórmula calcula e CSV não guarda toda a formatação.'],
  [/backup|sincronização|nuvem|integridade|segurança|phishing|senha|autenticação|privilégio|permissões/i, 'Pergunte qual propriedade está em jogo: confidencialidade, integridade ou disponibilidade. Backup recupera dados; sincronização sozinha pode replicar um erro.'],
  [/planejamento|controle|organização|direção|funções administrativas/i, 'Use a sequência PODC: planejar define objetivos; organizar distribui recursos; dirigir conduz pessoas; controlar compara resultado e corrige desvios.'],
  [/eficácia|eficiência|efetividade|indicadores/i, 'Eficiência olha o uso de recursos; eficácia olha o alcance da meta; efetividade olha o impacto real. Identifique o que o indicador está medindo.'],
  [/delegação|centralização|liderança|feedback|conflito|comunicação|equipe/i, 'Separe decisão, execução e responsabilidade final. Em cenários gerenciais, procure a ação que esclarece prioridades e mantém acompanhamento.'],
  [/estabelecimento|produtor|subsistência|lavoura|aquicultura|boitel|exploração/i, 'No conceito censitário, priorize a exploração agropecuária sob uma mesma administração, não apenas a titularidade da propriedade. Confira o período de referência.'],
  [/setor|mapa|descritivo|coordenadas|sede|endereço|CNEFE|logradouro|localidade/i, 'Leia o limite territorial e o descritivo antes de decidir o setor. Endereço, sede e área explorada cumprem papéis diferentes na classificação.']
];

const VIDEOS = [
  { test: q => /Língua Portuguesa/.test(q.subject) && /crase/i.test(q.topic), id: 'yUpRa62vcSI', title: 'Crase — Professor Noslen' },
  { test: q => /Língua Portuguesa/.test(q.subject) && /concordância nominal/i.test(q.topic), id: 'wtYgEDzjcWM', title: 'Concordância nominal — Professor Noslen' },
  { test: q => /Língua Portuguesa/.test(q.subject) && /colocação pronominal/i.test(q.topic), id: 'l_WxqVvmyGo', title: 'Colocação pronominal — Professor Noslen' },
  { test: q => /Língua Portuguesa/.test(q.subject) && /regência verbal/i.test(q.topic), id: 'B0EgJVneeGE', title: 'Regência verbal — Professor Noslen' },
  { test: q => /Língua Portuguesa/.test(q.subject) && /interpretação|compreensão/i.test(q.topic), id: '6t3lnCNCB6Q', title: 'Compreensão e interpretação de texto — Professor Noslen' },
  { test: q => /Língua Portuguesa/.test(q.subject) && /coesão textual/i.test(q.topic), id: 'IIU6i3UXyi0', title: 'Coesão e coerência — Professor Noslen' },
  { test: q => /Língua Portuguesa/.test(q.subject) && /^pontuação$/i.test(q.topic), id: '9tdpcfdr244', title: 'Pontuação: vírgula e outros sinais — Professor Noslen' },
  { test: q => /Língua Portuguesa/.test(q.subject) && /concordância verbal/i.test(q.topic) && !/haver|fazer|impessoalidade/i.test(q.topic), id: '4ZJnTqTk4_Y', title: 'Concordância verbal — Professor Noslen' },
  { test: q => /Língua Portuguesa/.test(q.subject) && /concordância.*(haver|fazer|impessoalidade)/i.test(q.topic), id: 'iZ7Ryffdoc0', title: 'Verbos impessoais — Professor Noslen' },
  { test: q => /Raciocínio Lógico/.test(q.subject) && /negação|proposicional/i.test(q.topic), id: 'XLEJ236hXr4', title: 'Proposições e negação — Julio Bara' },
  { test: q => /Raciocínio Lógico/.test(q.subject) && /^conjuntos$/i.test(q.topic), id: '0aUEDxYjZg8', title: 'Conjuntos: introdução — Professor Ferretto' },
  { test: q => /Raciocínio Lógico/.test(q.subject) && /^razão$|^razão e proporção$/i.test(q.topic), id: '8f8BMdUXXV8', title: 'Razão e proporção — Professor Ferretto' },
  { test: q => /Raciocínio Lógico/.test(q.subject) && /regra de três composta/i.test(q.topic), id: 'buYey1YGJhA', title: 'Regra de três composta — Professor Ferretto' },
  { test: q => /Raciocínio Lógico/.test(q.subject) && /regra de três$/i.test(q.topic), id: 'alLifth7gxE', title: 'Regra de três simples — Professor Ferretto' },
  { test: q => /Raciocínio Lógico/.test(q.subject) && /^probabilidade$/i.test(q.topic), id: 'WAlsxyDf0U8', title: 'Probabilidade básica — Rafa Jesus' },
  { test: q => /Raciocínio Lógico/.test(q.subject) && /^porcentagem$/i.test(q.topic), id: 'CERiIwParX4', title: 'Porcentagem: teoria e exemplos — Professor Ferretto' },
  { test: q => /Informática/.test(q.subject) && /phishing/i.test(q.topic), id: 'EihZ8WFBGKA', startSeconds: 61, endSeconds: 449, title: 'Phishing — Curso em Vídeo (trecho específico)' },
  { test: q => /Informática/.test(q.subject) && /CONT.SE/i.test(q.topic), id: 'CdKZHHKaVd0', title: 'Função CONT.SE — Curso de Excel Online' },
  { test: q => /Administração/.test(q.subject) && /gestão de riscos/i.test(q.topic), id: 'TQPuT9IPYWs', title: 'Gestão de riscos para concursos — Prof. Marcelo Soares' },
  { test: q => /Administração/.test(q.subject) && /análise SWOT/i.test(q.topic), id: 'UD0E32fK9Yg', title: 'Análise SWOT — Prof. Marcelo Soares' },
  { test: q => /Administração/.test(q.subject) && /funções administrativas|planejamento e controle/i.test(q.topic), id: 'J9p1h3JqB5U', title: 'Funções da administração — Mundo da Administração' },
  { test: q => /Conhecimentos Técnicos/.test(q.subject) && /estrutura censitária/i.test(q.topic), id: 'cW6h020IZhs', title: 'O que é o Censo Agropecuário — IBGE Explica' }
];

function studyTip(q) {
  return TIPS.find(([pattern]) => pattern.test(q.topic))?.[1] ||
    'Antes de olhar as alternativas, sublinhe a condição decisiva do enunciado e formule sua resposta em uma frase. Depois compare com a explicação.';
}

function studyVideo(q) { return VIDEOS.find(video => video.test(q)) || null; }

if (typeof module !== 'undefined') module.exports = {
  loadState, median, subjectAccuracy, priorityForQuestion, eligibleAt, examWeights, buildQueue, schedule, formatClock, formatDuration, subjectReport, studyTip, studyVideo, localDay
};

if (typeof document !== 'undefined') {
  const state = loadState(localStorage);
  let bank = [], manifest = null, queue = [], at = 0, session = null, timer = null;
  let questionMs = 0, sessionMs = 0, lastTick = 0, answered = false, confidenceSaved = false;
  let selectedAnswer = null, speedBaseline = null, speedDayRate = null;
  let sessionResult = { done: 0, correct: 0, totalMs: 0, subjects: {} };
  let authConfig = null, auth = null, syncReady = false, syncTimer = null, syncing = false, dirty = false;
  const AUTH_KEY = 'tq-auth-v1';

  function save() {
    state.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (auth && syncReady) {
      dirty = true;
      clearTimeout(syncTimer);
      syncTimer = setTimeout(syncProgress, 1200);
    }
  }
  const show = id => { document.querySelectorAll('.view').forEach(el => el.classList.remove('active')); $(`#${id}`).classList.add('active'); scrollTo(0, 0); };
  const toast = message => { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(el.hideTimer); el.hideTimer = setTimeout(() => el.classList.remove('show'), 3500); };
  const today = () => state.days[localDay()] || { done: 0, correct: 0, reviewed: 0 };

  function renderStats() {
    $('#answered').textContent = state.done;
    $('#accuracy').textContent = state.done ? `${Math.round(state.correct / state.done * 100)}%` : '—';
    const day = today();
    $('#dailyCount').textContent = `${Math.min(DAILY_GOAL, day.done)} / ${DAILY_GOAL}`;
    $('#dailyBar').style.width = `${Math.min(100, day.done / DAILY_GOAL * 100)}%`;
    $('#dailyNote').textContent = day.done >= DAILY_GOAL ? 'Meta de hoje concluída. Continue se fizer sentido para você.' :
      day.done ? `Mais ${DAILY_GOAL - day.done} para a meta de hoje.` : 'Comece com uma sessão curta. Sem pressão.';
  }

  function makeSubjectRow(row) {
    const el = document.createElement('div'); el.className = 'subject-row';
    const title = document.createElement('strong'); title.textContent = row.subject;
    const detail = document.createElement('small');
    detail.textContent = `${row.done} ${row.done === 1 ? 'questão' : 'questões'} · ${row.correct} acertos · ${row.wrong} erros · ${Math.round(row.correct / row.done * 100)}%${row.timeMs ? ` · ${formatClock(row.timeMs)} resolvendo` : ''}`;
    const meter = document.createElement('div'); meter.className = 'meter';
    const fill = document.createElement('i'); fill.style.width = `${Math.round(row.correct / row.done * 100)}%`; meter.append(fill);
    el.append(title, detail, meter); return el;
  }

  function renderProfile() {
    $('#profileDone').textContent = state.done;
    $('#profileCorrect').textContent = state.correct;
    $('#profileWrong').textContent = Math.max(0, state.done - state.correct);
    $('#profileTime').textContent = formatDuration(state.totalStudyMs || 0);
    const rows = subjectReport(state, bank);
    $('#profileSubjects').replaceChildren(...(rows.length ? rows.map(makeSubjectRow) : [document.createTextNode('Responda sua primeira questão para ver o desempenho por disciplina.')]));
    const weakest = rows.filter(row => !/^(Questões de versões anteriores|Histórico sem disciplina)$/.test(row.subject) && row.done >= 2).sort((a, b) => a.correct / a.done - b.correct / b.done)[0];
    $('#profileInsight').textContent = weakest ? `Sua maior oportunidade de revisão agora: ${weakest.subject} (${Math.round(weakest.correct / weakest.done * 100)}% em ${weakest.done} questões). ${weakest.done < 5 ? 'A amostra ainda é pequena; continue praticando.' : 'Priorize alguns exercícios desse assunto.'}` :
      'Comece a responder para descobrir onde vale concentrar a revisão. A análise de dificuldade precisa de pelo menos 2 questões por disciplina.';
    $('#footerStatus').textContent = auth && syncReady ? 'TurboQuest · progresso sincronizado com sua conta quando há internet' : 'TurboQuest · progresso salvo neste dispositivo';
  }

  function renderResume() {
    const saved = state.activeSession;
    $('#openStudy .hero-cta span').textContent = saved && !session ? 'Ver sessão pausada' : 'Começar a estudar';
    $('#resumePanel').hidden = !saved || !!session;
    if (!saved || session) return;
    const completed = (saved.result?.done || 0);
    const total = saved.queueIds?.length || 0;
    $('#resumeTitle').textContent = completed ? `${completed} respondidas. Sua sessão está guardada.` : 'Sua sessão está guardada.';
    $('#resumeDescription').textContent = `${Math.min(saved.at + 1, total)} de ${total} na fila · ${formatClock(saved.sessionMs || 0)} de estudo${saved.minutes ? ` · ${formatClock(Math.max(0, saved.minutes * 60000 - (saved.sessionMs || 0)))} restantes` : ''}.`;
  }

  function authStatus(message) { $('#authStatus').textContent = message; }
  function setAuthUi() {
    $('#authForm').hidden = !!auth;
    $('#signOut').hidden = !auth;
    $('#openProfile').textContent = auth?.user?.email ? auth.user.email.slice(0, 2).toUpperCase() : 'EU';
    renderProfile();
  }
  async function supabase(path, options = {}, token = auth?.access_token) {
    const response = await fetch(`${authConfig.supabaseUrl}${path}`, {
      ...options,
      headers: { apikey: authConfig.supabaseAnonKey, 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.msg || data?.error_description || data?.message || `Erro ${response.status}`);
    return data;
  }
  async function refreshAuth() {
    if (!auth?.refresh_token) throw new Error('Sessão expirada. Entre novamente.');
    const next = await supabase('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: auth.refresh_token }) }, null);
    auth = next; localStorage.setItem(AUTH_KEY, JSON.stringify(auth)); setAuthUi(); return auth;
  }
  async function cloudGet() {
    const path = `/rest/v1/tq_progress?user_id=eq.${encodeURIComponent(auth.user.id)}&select=payload,updated_at`;
    try { return (await supabase(path))[0] || null; }
    catch (error) { if (/401|JWT|expired/i.test(error.message)) { await refreshAuth(); return (await supabase(path))[0] || null; } throw error; }
  }
  async function cloudPut() {
    const payload = { user_id: auth.user.id, payload: state, updated_at: new Date().toISOString() };
    try { await supabase('/rest/v1/tq_progress?on_conflict=user_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify(payload) }); }
    catch (error) { if (/401|JWT|expired/i.test(error.message)) { await refreshAuth(); await supabase('/rest/v1/tq_progress?on_conflict=user_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify(payload) }); } else throw error; }
  }
  async function syncProgress() {
    if (!auth || !syncReady || syncing || !dirty) return;
    syncing = true; dirty = false; authStatus(`Conectado como ${auth.user.email} · sincronizando…`);
    try { await cloudPut(); authStatus(`Conectado como ${auth.user.email} · progresso salvo na nuvem`); }
    catch (error) { dirty = true; authStatus(`Progresso salvo neste aparelho; sincronização pendente: ${error.message}`); }
    finally { syncing = false; if (dirty && navigator.onLine) { clearTimeout(syncTimer); syncTimer = setTimeout(syncProgress, 10000); } }
  }
  async function restoreCloud() {
    syncReady = false;
    const remote = await cloudGet();
    if (remote?.payload?.records) {
      const cloudState = { ...freshState(), ...remote.payload };
      const preferLocal = state.done && state.updatedAt > cloudState.updatedAt &&
        confirm(`Há progresso neste aparelho (${state.done} respostas) e na conta (${cloudState.done} respostas). OK: enviar o progresso deste aparelho. Cancelar: carregar o progresso da conta. Uma cópia local será guardada.`);
      if (!preferLocal) {
        if (state.done && (state.done !== cloudState.done || state.updatedAt !== cloudState.updatedAt))
          localStorage.setItem(`tq-backup-${Date.now()}`, JSON.stringify(state));
        Object.assign(state, cloudState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
      syncReady = true;
      if (preferLocal) { dirty = true; await syncProgress(); }
    } else { syncReady = true; dirty = true; await syncProgress(); }
    $('#role').value = state.role || '';
    renderSubjects(); renderStats(); renderProfile(); renderResume();
    if (!dirty) authStatus(`Conectado como ${auth.user.email} · progresso carregado da nuvem`);
    setAuthUi();
  }
  async function initAuth() {
    try {
      authConfig = await fetch('/api/config', { cache: 'no-store' }).then(response => response.json());
      if (!authConfig.supabaseUrl || !authConfig.supabaseAnonKey) { authStatus('Sincronização ainda não configurada. Seu progresso continua salvo neste aparelho.'); $('#authForm').hidden = true; return; }
      auth = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
      if (auth) {
        try { await refreshAuth(); await restoreCloud(); }
        catch (error) { auth = null; localStorage.removeItem(AUTH_KEY); authStatus(`Entre novamente para sincronizar. ${error.message}`); }
      } else authStatus('Crie uma conta ou entre para continuar no celular e no computador.');
    } catch { authStatus('Sem conexão com o serviço de contas. Seu progresso permanece neste aparelho.'); }
    setAuthUi();
  }
  async function submitAuth(kind) {
    if (!authConfig?.supabaseUrl) return;
    const email = $('#authEmail').value.trim(), password = $('#authPassword').value;
    if (!email || password.length < 6) return authStatus('Informe um e-mail válido e senha de pelo menos 6 caracteres.');
    authStatus(kind === 'signup' ? 'Criando conta…' : 'Entrando…');
    try {
      const data = kind === 'signup' ? await supabase('/auth/v1/signup', { method: 'POST', body: JSON.stringify({ email, password }) }, null) :
        await supabase('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) }, null);
      if (!data.access_token) { authStatus('Conta criada. Confirme o e-mail recebido e depois toque em Entrar.'); return; }
      auth = data; localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
      await restoreCloud(); $('#authPassword').value = '';
    } catch (error) { authStatus(`Não foi possível ${kind === 'signup' ? 'criar a conta' : 'entrar'}: ${error.message}`); }
    setAuthUi();
  }

  function renderSubjects() {
    const role = $('#role').value, previous = $('#subject').value;
    const official = manifest?.roles?.find(item => item.id === role)?.subjects.map(item => item.name);
    const subjects = [...new Set(bank.filter(q => (!role || q.roles.includes(role)) && (!official || official.includes(q.subject))).map(q => q.subject))].sort();
    $('#subject').replaceChildren(new Option('Todas as disciplinas', ''), ...subjects.map(subject => new Option(subject, subject)));
    if (subjects.includes(previous)) $('#subject').value = previous;
    renderTopics();
  }
  function renderTopics() {
    const role = $('#role').value, subject = $('#subject').value, previous = $('#topic').value;
    const official = manifest?.roles?.find(item => item.id === role)?.subjects.map(item => item.name);
    const topics = [...new Set(bank.filter(q => (!role || q.roles.includes(role)) && (!official || official.includes(q.subject)) && (!subject || q.subject === subject)).map(q => q.topic))].sort();
    $('#topic').replaceChildren(new Option('Todos os tópicos', ''), ...topics.map(topic => new Option(topic, topic)));
    if (topics.includes(previous)) $('#topic').value = previous;
  }
  function filtered() {
    const role = $('#role').value, subject = $('#subject').value, topic = $('#topic').value, difficulty = $('#difficulty').value;
    const official = manifest?.roles?.find(item => item.id === role)?.subjects.map(item => item.name);
    return bank.filter(q => (!role || q.roles.includes(role)) && (!official || official.includes(q.subject)) && (!subject || q.subject === subject) &&
      (!topic || q.topic === topic) && (!difficulty || q.difficulty === difficulty));
  }

  function persistSession() {
    if (!session) return;
    state.activeSession = { queueIds: queue.map(q => q.id), at, minutes: session.minutes, sessionMs,
      questionMs, result: sessionResult, answeredIndex: selectedAnswer, confidenceSaved, speedBaseline, speedDayRate, role: state.role };
    save();
    renderResume();
  }

  function tick() {
    if (!session || document.hidden) { lastTick = performance.now(); return; }
    const now = performance.now(), delta = Math.max(0, now - lastTick); lastTick = now;
    sessionMs += delta;
    state.totalStudyMs += delta;
    if (!answered) questionMs += delta;
    if (Math.floor(sessionMs / 15000) !== Math.floor((sessionMs - delta) / 15000)) persistSession();
    $('#questionClock').textContent = formatClock(questionMs);
    if (session.minutes) {
      const remaining = session.minutes * 60000 - sessionMs;
      $('#sessionClock').textContent = `${formatClock(remaining)} restantes`;
      if (remaining <= 0) finish();
    }
  }

  function draw(snapshot = null) {
    const q = queue[at];
    if (!q) return finish();
    questionMs = snapshot?.questionMs || 0; answered = false; confidenceSaved = !!snapshot?.confidenceSaved;
    selectedAnswer = null; speedBaseline = snapshot?.speedBaseline || null; speedDayRate = snapshot?.speedDayRate || null;
    $('#questionClock').textContent = formatClock(questionMs);
    $('#counter').textContent = session.minutes ? `Questão ${at + 1}` : `${at + 1} / ${queue.length}`;
    $('#progress').style.width = session.minutes ? `${Math.min(100, sessionMs / (session.minutes * 60000) * 100)}%` : `${at / queue.length * 100}%`;
    $('#qsubject').textContent = q.subject; $('#qtopic').textContent = q.topic;
    $('#statement').textContent = q.statement;
    $('#explain').replaceChildren(); $('#confidence').hidden = true;
    $('#next').disabled = true;
    $('#answers').replaceChildren(...q.options.map((option, index) => {
      const button = document.createElement('button'); button.className = 'answer'; button.type = 'button';
      const letter = document.createElement('b'); letter.textContent = String.fromCharCode(65 + index);
      const label = document.createElement('span'); label.textContent = option;
      button.append(letter, label); button.addEventListener('click', () => answer(index)); return button;
    }));
    if (Number.isInteger(snapshot?.answeredIndex)) renderFeedback(snapshot.answeredIndex, true);
    lastTick = performance.now();
  }

  function updateMilestones(day, previousDone) {
    if (previousDone < DAILY_GOAL && day.done >= DAILY_GOAL) toast('Meta de hoje concluída. Você construiu consistência.');
    else if (day.done === 5) toast('Cinco questões feitas. Bom começo.');
    else if (day.reviewed === 5) toast('Cinco revisões concluídas. Seu conhecimento está ficando mais firme.');
  }

  function renderFeedback(index, restored = false) {
    const q = queue[at], ok = index === q.answer;
    answered = true; selectedAnswer = index;
    const buttons = [...$('#answers').children];
    buttons.forEach((button, i) => { button.disabled = true; if (i === q.answer) button.classList.add('correct'); if (i === index && !ok) button.classList.add('wrong'); });
    const explanation = document.createElement('div'); explanation.className = 'explanation';
    const title = document.createElement('b'); title.textContent = ok ? 'Correto.' : 'Ainda não.';
    const body = document.createElement('span'); body.textContent = ` ${q.explanation}`;
    explanation.append(title, document.createElement('br'), body);
    if (ok && speedBaseline && questionMs >= 10000 && questionMs <= speedBaseline * .85 && speedDayRate >= .8) {
      const speed = document.createElement('div'); speed.className = 'speed-note';
      speed.textContent = `Bom ritmo: ${Math.round((1 - questionMs / speedBaseline) * 100)}% mais rápido que seu padrão, mantendo a precisão.`;
      explanation.append(speed);
    }
    $('#explain').append(explanation);
    const tip = document.createElement('div'); tip.className = 'tip';
    const tipTitle = document.createElement('b'); tipTitle.textContent = 'Dica para resolver mais rápido';
    const tipBody = document.createElement('span'); tipBody.textContent = studyTip(q);
    tip.append(tipTitle, tipBody); $('#explain').append(tip);
    const video = studyVideo(q);
    const videoCard = document.createElement('div'); videoCard.className = 'video-card';
    const videoTitle = document.createElement('b'); videoTitle.textContent = video ? 'Aula selecionada para este assunto' : 'Quer ver uma aula?';
    const videoText = document.createElement('p'); videoText.textContent = video ? `${video.title}${video.startSeconds ? ` · trecho ${formatClock(video.startSeconds * 1000)}${video.endSeconds ? `–${formatClock(video.endSeconds * 1000)}` : ''}` : ''}` : `Ainda não selecionamos um vídeo específico para “${q.topic}”. Você pode pesquisar pelo tópico.`;
    videoCard.append(videoTitle, videoText);
    if (video) {
      const reason = document.createElement('small'); reason.className = 'quiet';
      reason.textContent = 'Seleção editorial: assunto específico, canal confiável e vídeo disponível.';
      videoCard.append(reason, document.createElement('br'));
      const play = document.createElement('button'); play.className = 'outline'; play.type = 'button'; play.textContent = 'Assistir aqui';
      play.addEventListener('click', () => {
        const frame = document.createElement('div'); frame.className = 'video-frame';
        const iframe = document.createElement('iframe'); iframe.src = `https://www.youtube-nocookie.com/embed/${video.id}${video.startSeconds ? `?start=${video.startSeconds}${video.endSeconds ? `&end=${video.endSeconds}` : ''}` : ''}`;
        iframe.title = video.title; iframe.loading = 'lazy'; iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share'; iframe.allowFullscreen = true;
        frame.append(iframe); play.replaceWith(frame);
      }); videoCard.append(play);
      const link = document.createElement('a'); link.href = `https://www.youtube.com/watch?v=${video.id}${video.startSeconds ? `&t=${video.startSeconds}s` : ''}`; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Abrir no YouTube'; link.className = 'textbtn'; videoCard.append(link);
    } else {
      const link = document.createElement('a'); link.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${q.subject} ${q.topic} aula`)}`;
      link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = `Buscar aula de ${q.topic}`; link.className = 'textbtn'; videoCard.append(link);
    }
    $('#explain').append(videoCard);
    $('#confidence').hidden = !ok || confidenceSaved;
    $('#next').disabled = false;
    if (restored && confidenceSaved && ok) {
      const note = document.createElement('small'); note.className = 'review-note'; note.textContent = 'Sua avaliação desta questão já foi salva.';
      $('#explain').append(note);
    }
  }

  function answer(index) {
    if (answered || !session) return;
    tick(); if (!session) return;
    const q = queue[at], ok = index === q.answer, now = Date.now();
    const previous = state.records[q.id] || { attempts: 0, correct: 0, wrong: 0, hard: 0, times: [] };
    const oldTimes = Object.values(state.records).flatMap(record => record.correctTimes || []).filter(value => value >= 10000 && value <= 600000);
    speedBaseline = median(oldTimes.length >= 5 ? oldTimes.slice(-30) : []);
    const day = state.days[localDay(now)] || { done: 0, correct: 0, reviewed: 0 };
    const oldDone = day.done;
    day.done++; if (ok) day.correct++; if (previous.attempts) day.reviewed++;
    speedDayRate = day.correct / day.done;
    state.days[localDay(now)] = day;
    state.done++; if (ok) state.correct++;
    const record = { ...previous, subject: q.subject, topic: q.topic, attempts: previous.attempts + 1, correct: previous.correct + (ok ? 1 : 0),
      lastAt: now, lastMs: Math.round(questionMs),
      timeMs: (previous.timeMs || 0) + Math.round(questionMs),
      correctTimes: ok ? [...(previous.correctTimes || []).slice(-4), Math.round(questionMs)] : (previous.correctTimes || []) };
    state.records[q.id] = ok ? record : schedule(record, false, null, now);
    sessionResult.done++; if (ok) sessionResult.correct++; sessionResult.totalMs += questionMs;
    const subject = sessionResult.subjects[q.subject] || { subject: q.subject, done: 0, correct: 0, wrong: 0, timeMs: 0 };
    subject.done++; if (ok) subject.correct++; else subject.wrong++; subject.timeMs += questionMs;
    sessionResult.subjects[q.subject] = subject;
    renderFeedback(index);
    persistSession(); renderStats(); updateMilestones(day, oldDone);
  }

  function setConfidence(level) {
    if (confidenceSaved || !answered || !session) return;
    const q = queue[at], record = state.records[q.id];
    state.records[q.id] = schedule(record, true, level, Date.now());
    confidenceSaved = true; persistSession();
    $('#confidence').hidden = true;
    const message = document.createElement('small'); message.className = 'review-note';
    message.textContent = level === 'hard' ? `Revisão agendada para daqui a cerca de ${formatDuration(state.records[q.id].dueAt - Date.now())}.` :
      state.records[q.id].retired ? 'Ótimo. Esta questão saiu da fila de revisão.' : 'Ótimo. Uma revisão longa foi programada.';
    $('#explain').append(message);
  }

  function next() {
    if (!answered) return;
    if (!confidenceSaved && state.records[queue[at].id]?.lastAt && $('#confidence').hidden === false) setConfidence('hard');
    if (session.minutes && at + 1 >= queue.length) {
      const remaining = filtered().filter(q => !queue.some(item => item.id === q.id));
      const refill = buildQueue(remaining, state, manifest, state.role, 40, Date.now());
      queue.push(...refill);
    }
    at++; draw(); persistSession();
  }

  function start() {
    if (!bank.length) return toast('O banco ainda está carregando. Tente novamente.');
    const role = $('#role').value;
    if (!role) return toast('Escolha seu cargo para priorizar as disciplinas da sua prova.');
    if (state.activeSession && !confirm('Há uma sessão pausada. Iniciar outra vai encerrar a fila anterior. Quer continuar?')) return;
    state.role = role; save();
    const mode = $('#mode').value, minutes = mode === 'time15' ? 15 : mode === 'time30' ? 30 : 0;
    const count = mode === 'custom' ? Math.max(1, Math.min(100, Number($('#customCount').value) || 10)) : mode === 'count20' ? 20 : 10;
    queue = buildQueue(filtered(), state, manifest, role, minutes ? 100 : count);
    if (!queue.length) return toast('Nenhuma questão disponível agora com esses filtros. Tente outra disciplina ou aguarde a revisão.');
    session = { minutes }; sessionMs = 0; at = 0; sessionResult = { done: 0, correct: 0, totalMs: 0, subjects: {} };
    $('#sessionSummary').hidden = true;
    $('#sessionClock').textContent = minutes ? `${minutes}:00 restantes` : '';
    $('#sessionClock').hidden = !minutes;
    show('quiz'); draw(); persistSession(); clearInterval(timer); timer = setInterval(tick, 250);
  }

  function pause() {
    if (!session) return;
    tick(); if (!session) return;
    persistSession(); clearInterval(timer); timer = null; session = null;
    renderResume(); show('study'); if (auth && syncReady) syncProgress();
    toast('Sessão pausada. Continue quando quiser, sem perder sua fila.');
  }

  function resume() {
    const saved = state.activeSession;
    if (!saved || !bank.length) return toast('Aguarde o carregamento das questões para continuar.');
    const byId = new Map(bank.map(q => [q.id, q]));
    if (!saved.queueIds?.length || saved.queueIds.some(id => !byId.has(id)) || saved.at >= saved.queueIds.length)
      return toast('A fila salva contém questões indisponíveis. Encerre esta sessão para iniciar outra.');
    queue = saved.queueIds.map(id => byId.get(id));
    at = saved.at; session = { minutes: saved.minutes || 0 }; sessionMs = saved.sessionMs || 0;
    sessionResult = saved.result || { done: 0, correct: 0, totalMs: 0, subjects: {} };
    state.role = saved.role || state.role;
    $('#role').value = state.role;
    $('#sessionClock').hidden = !session.minutes;
    $('#sessionClock').textContent = session.minutes ? `${formatClock(Math.max(0, session.minutes * 60000 - sessionMs))} restantes` : '';
    show('quiz'); draw(saved); renderResume(); clearInterval(timer); timer = setInterval(tick, 250);
  }

  function finish() {
    if (!session) return;
    if (answered && !confidenceSaved && !$('#confidence').hidden) setConfidence('hard');
    clearInterval(timer); timer = null; session = null; state.activeSession = null;
    const result = sessionResult;
    const summary = $('#sessionSummary');
    if (result.done) {
      const accuracy = Math.round(result.correct / result.done * 100);
      const heading = document.createElement('h3'); heading.textContent = 'Sessão concluída';
      const overview = document.createElement('p'); overview.textContent = `${result.done} ${result.done === 1 ? 'questão' : 'questões'} · ${result.correct} acertos · ${result.done - result.correct} erros · ${accuracy}% de aproveitamento`;
      const timing = document.createElement('p'); timing.textContent = `${formatClock(sessionMs)} de estudo · média de ${formatClock(result.totalMs / result.done)} por questão`;
      const rows = Object.values(result.subjects).sort((a, b) => a.correct / a.done - b.correct / b.done);
      const label = document.createElement('strong'); label.textContent = 'Por disciplina';
      const list = document.createElement('div'); list.className = 'subject-list'; list.append(...rows.map(makeSubjectRow));
      const insight = document.createElement('p'); insight.textContent = rows.length ?
        `Para revisar primeiro: ${rows[0].subject} (${rows[0].wrong} ${rows[0].wrong === 1 ? 'erro' : 'erros'} em ${rows[0].done} questões). ${rows[0].done < 5 ? 'É uma amostra pequena; confirme com mais exercícios.' : ''}` : '';
      const profileLink = document.createElement('button'); profileLink.type = 'button'; profileLink.className = 'textbtn'; profileLink.textContent = 'Ver todo o meu progresso →'; profileLink.addEventListener('click', () => { renderProfile(); show('profile'); });
      summary.replaceChildren(heading, overview, timing, label, list, insight, profileLink);
      summary.hidden = false;
      toast(accuracy >= 80 ? 'Sessão concluída com boa precisão. Continue no seu ritmo.' : 'Sessão concluída. Os erros já entraram na fila de revisão.');
    }
    save(); renderStats(); renderProfile(); renderResume(); show('study');
    if (auth && syncReady) syncProgress();
  }

  $('#openStudy').addEventListener('click', () => show('study'));
  $('#back').addEventListener('click', () => show('home'));
  $('#openProfile').addEventListener('click', () => { if (session) pause(); renderProfile(); show('profile'); });
  $('#profileBack').addEventListener('click', () => show('home'));
  $('#authForm').addEventListener('submit', event => { event.preventDefault(); submitAuth('signin'); });
  $('#signUp').addEventListener('click', () => submitAuth('signup'));
  $('#signOut').addEventListener('click', async () => {
    if (dirty) await syncProgress();
    if (dirty && !confirm('A sincronização está pendente. Sair agora? O progresso continuará neste aparelho.')) return;
    auth = null; syncReady = false; localStorage.removeItem(AUTH_KEY); setAuthUi(); authStatus('Você saiu. O progresso continua salvo neste aparelho.');
  });
  $('#quit').addEventListener('click', pause);
  $('#resume').addEventListener('click', resume);
  $('#endPaused').addEventListener('click', () => { resume(); if (session) finish(); });
  $('#next').addEventListener('click', next);
  $('#begin').addEventListener('click', start);
  $('#easy').addEventListener('click', () => setConfidence('easy'));
  $('#hard').addEventListener('click', () => setConfidence('hard'));
  $('#toggleFilters').addEventListener('click', () => { const panel = $('#customize'); panel.hidden = !panel.hidden; });
  $('#role').addEventListener('change', () => { state.role = $('#role').value; save(); renderSubjects(); });
  $('#subject').addEventListener('change', renderTopics);
  $('#mode').addEventListener('change', () => { $('#customCountField').hidden = $('#mode').value !== 'custom'; });
  document.addEventListener('visibilitychange', () => { if (document.hidden && session) persistSession(); lastTick = performance.now(); });
  window.addEventListener('pagehide', () => { if (session) persistSession(); });
  window.addEventListener('online', () => { if (dirty) syncProgress(); });
  $('#clear').addEventListener('click', () => { $('#subject').value = ''; renderTopics(); $('#topic').value = ''; $('#difficulty').value = ''; });
  $('#apply').addEventListener('click', () => { $('#customize').hidden = true; toast('Filtros aplicados à próxima sessão.'); });
  $('#role').value = state.role || '';
  renderStats(); renderProfile(); renderResume(); initAuth();
  Promise.all([
    fetch(`/content/ibge-2026/questions.json?v=${Date.now()}`, { cache: 'no-store' }).then(response => { if (!response.ok) throw new Error('Banco indisponível'); return response.json(); }),
    fetch('/content/ibge-2026/banco-manifesto.json', { cache: 'no-store' }).then(response => response.ok ? response.json() : null).catch(() => null)
  ]).then(([data, exam]) => {
    bank = (data.questions || []).filter(q => q.status === 'approved'); manifest = exam;
    $('#available').textContent = bank.length; renderSubjects(); renderProfile(); renderResume();
    if (manifest?.exam?.categoryLabel) $('#examType').textContent = `${manifest.exam.categoryLabel} · IBGE · ${manifest.exam.board} · 2026`;
  }).catch(() => toast('Não foi possível carregar o banco. Verifique sua conexão.'));
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js?v=resume-v1').then(registration => registration.update()).catch(() => {});
}
