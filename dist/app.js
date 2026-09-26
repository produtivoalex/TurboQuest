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
  return { done: 0, correct: 0, role: '', records: {}, days: {}, achievements: {}, totalStudyMs: 0, updatedAt: 0, activeSession: null };
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
    const curated = /^ibge26-b010-/.test(q.id) ? 16 : /^ibge26-b009-/.test(q.id) ? 12 : /^ibge26-b008-/.test(q.id) ? 8 : /^ibge26-b007-/.test(q.id) ? 5 : 0;
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

function reviewQueue(pool, state, role, kind = 'all', count = 20) {
  return pool.filter(q => (!role || q.roles.includes(role)) && (() => {
    const record = state.records[q.id];
    if (!record || record.retired) return false;
    const outcome = record.lastOutcome || (record.wrong ? 'wrong' : record.hard ? 'hard' : '');
    return (kind === 'all' || outcome === kind) && (outcome === 'wrong' || outcome === 'hard');
  })()).sort((a, b) => {
    const left = state.records[a.id], right = state.records[b.id];
    return (left.lastOutcome === 'wrong' ? -1 : 0) - (right.lastOutcome === 'wrong' ? -1 : 0) ||
      (left.lastAt || 0) - (right.lastAt || 0);
  }).slice(0, count);
}

const ACHIEVEMENTS = [
  { id: 'first', icon: '✦', title: 'Primeiro passo', target: 1, value: state => state.done || 0 },
  { id: 'five', icon: '✧', title: 'Pegou ritmo', target: 5, value: state => state.done || 0 },
  { id: 'ten', icon: '⚡', title: 'Dez resolvidas', target: 10, value: state => state.done || 0 },
  { id: 'twentyfive', icon: '◆', title: '25 resolvidas', target: 25, value: state => state.done || 0 },
  { id: 'fifty', icon: '✹', title: '50 resolvidas', target: 50, value: state => state.done || 0 },
  { id: 'hundred', icon: '★', title: 'Centena', target: 100, value: state => state.done || 0 },
  { id: 'firstReview', icon: '↻', title: 'Primeira revisão', target: 1, value: state => Object.values(state.days || {}).reduce((sum, day) => sum + (day.reviewed || 0), 0) },
  { id: 'tenReviews', icon: '◎', title: 'Dez revisões', target: 10, value: state => Object.values(state.days || {}).reduce((sum, day) => sum + (day.reviewed || 0), 0) },
  { id: 'recovered', icon: '↗', title: 'Aprendeu com o erro', target: 1, value: state => Object.values(state.records || {}).filter(record => record.wrong && record.lastOutcome === 'easy').length },
  { id: 'threeDays', icon: '☀', title: 'Três dias de estudo', target: 3, value: state => Object.values(state.days || {}).filter(day => day.done > 0).length },
  { id: 'fiveSubjects', icon: '◇', title: 'Explorador', target: 5, value: state => new Set(Object.values(state.records || {}).filter(record => record.attempts).map(record => record.subject)).size }
];

function unlockAchievements(state, now = Date.now()) {
  state.achievements ||= {};
  const unlocked = [];
  for (const award of ACHIEVEMENTS) if (!state.achievements[award.id] && award.value(state) >= award.target) {
    state.achievements[award.id] = now;
    unlocked.push(award);
  }
  return unlocked;
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

const TIP_SOURCES = {
  percent: ['Khan Academy — percentuais de referência', 'https://www.khanacademy.org/math/6th-grade-illustrative-math/unit-3-unit-rates-and-percentages/lesson-13-benchmark-percentages/v/common-percentages'],
  ratio: ['Khan Academy — taxas unitárias e razões', 'https://www.khanacademy.org/math/pre-algebra/pre-algebra-ratios-rates/pre-algebra-rates/a/rate-review'],
  multiplication: ['Khan Academy — decompor multiplicações', 'https://www.khanacademy.org/math/arithmetic-home/multiply-divide/properties-of-multiplication/a/distributive-property-review'],
  averages: ['OpenStax — média, mediana e valores extremos', 'https://openstax.org/books/statistics/pages/2-5-measures-of-the-center'],
  probability: ['OpenStax — médias e probabilidade', 'https://openstax.org/books/prealgebra/pages/5-5-averages-and-probability'],
  algebra: ['OpenStax — estratégia para problemas algébricos', 'https://openstax.org/books/intermediate-algebra/pages/2-2-use-a-problem-solving-strategy'],
  geometry: ['Khan Academy — área e perímetro', 'https://www.khanacademy.org/math/geometry/basic-geometry-hs/perimeter-area-tutorial'],
  logic: ['Khan Academy — condicionais e contrapositiva', 'https://www.khanacademy.org/test-prep/lsat-prep/xdf35b2883be7178a%3Alsat-prep-lessons/xdf35b2883be7178a%3Alsat-prep-logic-toolbox/a/logic-toolbox--article--conditional-reasoning-logical-equivalence'],
  text: ['INEP — coesão e compreensão de textos', 'https://download.inep.gov.br/educacao_basica/prova_brasil_saeb/menu_do_professor/prova_lingua_portuguesa/matrizes_lp_4a_serie/TopicoIV_LP_4a_serie_EF_PROF.pdf'],
  management: ['ENAP — funções administrativas e processo decisório', 'https://repositorio.enap.gov.br/bitstream/1/5592/10/analista_adm_area_1.pdf'],
  technical: ['IBGE — material do Censo Agropecuário', 'https://anexos.cdn.selecao.net.br/uploads/747/concursos/423/anexos/c3b6eba1-4aa5-4320-9af8-adc570bcc26c.pdf'],
  spelling: ['Academia Brasileira de Letras — VOLP 2025–2026', 'https://www2.academia.org.br/nossa-lingua/vocabulario-ortografico']
};

function mathShortcut(q) {
  const topic = q.topic.toLowerCase(), prompt = q.statement.toLowerCase();
  let text, source = 'algebra';
  if (/porcent|percentual|juros/.test(topic)) {
    source = 'percent';
    if (/pontos percentuais|redução relativa/.test(prompt)) text = 'Atalho: calcule primeiro a diferença em pontos; depois divida pela taxa inicial para achar a queda relativa. Não confunda “pontos” com “por cento da base”.';
    else if (/sucessiv|semana seguinte|na seguinte/.test(topic + ' ' + prompt)) text = 'Atalho: use uma base por etapa. Subiu de 80 para 100? A alta usa 80; a queda de volta usa 100. Percentuais de ida e volta não se anulam porque a base mudou.';
    else if (/ainda falta|pendente|resta/.test(prompt)) text = 'Atalho: ache a parte que falta primeiro (total − feito) e compare com o total original. Para 25%, pense em dividir por 4; para 10%, tire uma casa decimal.';
    else text = 'Atalho mental: 10% é dividir por 10; 5% é metade de 10%; 25% é dividir por 4; 1% é dividir por 100. Quebre percentuais como 15% em 10% + 5% e some.';
    if (!/sucessiv|semana seguinte|na seguinte/.test(topic + ' ' + prompt)) {
      const fraction = q.explanation.match(/(\d+)\s*\/\s*(\d+)/);
      if (fraction) {
        let a = Number(fraction[1]), b = Number(fraction[2]);
        const originalA = a, originalB = b;
        while (b) [a, b] = [b, a % b];
        if (a > 1) text = `Atalho neste item: reduza ${originalA}/${originalB} pelo fator ${a} antes de converter em %. Fica ${originalA / a}/${originalB / a}; daí a porcentagem sai quase sem divisão longa.`;
      }
    }
  } else if (/razão|proporção|regra de três|velocidade|taxa/.test(topic)) {
    source = 'ratio';
    if (/agente|dispositivo|dia|hora/.test(prompt)) text = 'Atalho: reduza tudo a uma unidade de trabalho (por agente-hora ou agente-dia). Cancele fatores iguais antes de multiplicar; se mais agentes reduzem o tempo, a relação é inversa.';
    else if (/transfer|redistribui/.test(prompt)) text = 'Atalho: numa transferência entre dois grupos, cada unidade deslocada reduz a diferença em 2. Ache a diferença inicial pela razão e desconte o dobro do que foi transferido.';
    else text = 'Atalho: some as partes da razão, divida o total por essa soma e só então multiplique pela parte pedida. Se houver unidades diferentes, compare “por 1” (taxa unitária) antes de escalar.';
  } else if (/conjunt|inclusão-exclusão/.test(topic)) {
    source = 'probability';
    text = /exatamente uma/.test(prompt) ? 'Atalho: “exatamente uma” = total do grupo A + total do B − 2 × interseção. A interseção sai duas vezes porque foi contada nos dois grupos.' : /nenhuma|não tinham|não domina/.test(prompt) ? 'Atalho: “nenhum” = total − (A + B − interseção). Tire a interseção só uma vez para não contar duas vezes quem está nos dois grupos.' : 'Atalho: desenhe dois círculos; some A + B e subtraia a interseção uma vez. Para “nenhum”, subtraia essa união do total.';
  } else if (/probabilidad/.test(topic)) {
    source = 'probability';
    if (/ao menos|pelo menos|não seja|não ser|complemento/.test(prompt)) text = 'Atalho: para “ao menos um” ou “não acontecer”, calcule 1 − o evento contrário. Em retiradas sem reposição, reduza o total e a quantidade favorável após cada retirada.';
    else text = 'Atalho: escreva favoráveis ÷ total. Se houver duas ordens possíveis (por exemplo, verde–azul ou azul–verde), calcule uma e multiplique por 2; sem reposição, atualize o total na segunda retirada.';
  } else if (/média|mediana/.test(topic)) {
    source = 'averages';
    if (/meta|média diária|para obter média|para que a média/.test(prompt)) text = 'Atalho: média desejada × quantidade de dias = total-alvo. Subtraia a soma já feita; esse saldo é exatamente o que falta no último dia.';
    else if (/ponderada|peso/.test(topic + ' ' + prompt)) text = 'Atalho: multiplique cada nota pela quantidade/peso, some os pontos e divida pela soma dos pesos. Não faça a média simples das notas quando os pesos diferem.';
    else if (/mediana/.test(topic)) text = 'Atalho: ordene e conte posições, sem somar todos os valores. Ímpar: pegue o do meio; par: faça a média dos dois centrais. Um valor extremo não muda a posição central.';
    else text = 'Atalho: média × número de valores dá a soma total. Ao acrescentar um valor, compare-o com a média antiga: só o excedente (ou falta) altera a soma, depois divida pelo novo total.';
  } else if (/fraç/.test(topic)) {
    source = 'ratio';
    text = /resta|falta|restante/.test(prompt) ? 'Atalho: trate o todo como 1. Some as partes feitas usando denominador comum; o que falta é 1 menos essa soma. Em frações sucessivas, confirme se a segunda parte é do total ou só do restante.' : 'Atalho: simplifique antes de operar. Para somar, use o menor denominador comum; para multiplicar, cancele fatores cruzados antes da conta para manter números pequenos.';
  } else if (/sequênci/.test(topic)) {
    source = 'multiplication'; text = 'Atalho: compare diferenças entre termos antes de testar multiplicações. Se as diferenças aumentam em padrão regular, estenda esse padrão uma etapa e some ao último termo.';
  } else if (/equação|sistema/.test(topic)) {
    source = 'algebra';
    if (/a mais|a menos|diferença/.test(prompt) && /juntos|somam|totalizaram/.test(prompt)) text = 'Atalho mental: com soma S e diferença d, o maior é (S+d)÷2 e o menor (S−d)÷2. Confira qual dos dois o enunciado pediu; evita montar sistema.';
    else text = 'Atalho de prova: teste as alternativas na condição do enunciado (soma, diferença ou total). Em múltipla escolha, uma substituição rápida costuma ser mais curta que isolar a incógnita.';
  } else if (/análise combinatória|ordena|arranjo/.test(topic)) {
    source = 'probability'; text = 'Atalho: fixe o que já está determinado; para itens obrigatoriamente juntos, trate o par como um bloco e depois conte as ordens internas. Cuidado para não contar o par separado.';
  } else if (/geometria|escala/.test(topic)) {
    source = 'geometry';
    if (/faixa|contorna|margem/.test(prompt)) text = 'Atalho: na borda interna, desconte a largura duas vezes de cada dimensão (um lado de cada extremidade); só então multiplique comprimento × largura.';
    else if (/escala/.test(topic)) text = 'Atalho: aplique a escala a um lado primeiro, converta as unidades e só depois calcule área. Na escala 1:n, 1 cm vira n cm reais; em áreas, o fator de escala também seria elevado ao quadrado.';
    else text = 'Atalho: identifique se pedem área (lado × lado, unidade²) ou perímetro (contorno, unidade). Retângulo: área = base × altura; perímetro = 2 × (base + altura).';
  } else if (/condicional|proposicional|negação|argumentação|dedução|conjunção|disjunção|diagramas/.test(topic)) {
    source = 'logic';
    if (/contrapositiva/.test(topic) || /se .* então/.test(prompt)) text = 'Atalho: transforme “se P, então Q” em “P→Q”. Só é falsa em P verdadeiro e Q falso; a equivalente garantida é a contrapositiva “não Q→não P”. Não conclua P só porque viu Q.';
    else if (/negação|quantificador/.test(topic)) text = 'Atalho: negue por partes. “Todo” vira “existe pelo menos um que não”; “algum” vira “nenhum”. Negar “A e B” vira “não A ou não B”.';
    else text = 'Atalho: desenhe conjuntos como círculos e preserve apenas o que as premissas obrigam. “Alguns B são C” não garante que algum A seja C, mesmo se todo A estiver dentro de B.';
  } else {
    source = 'multiplication'; text = 'Atalho: antes da conta exata, estime o intervalo e elimine opções incompatíveis. Depois simplifique fatores ou unidades em cruz; multiplique só os números que sobrarem.';
  }
  if (source !== 'logic' && q.options?.length) text += ' Em múltipla escolha, estime para riscar opções distantes e faça a conta exata só no final.';
  return { text, source: TIP_SOURCES[source] };
}

function studyShortcut(q) {
  if (/Raciocínio Lógico Quantitativo/.test(q.subject)) return mathShortcut(q);
  let text = TIPS.find(([pattern]) => pattern.test(q.topic))?.[1];
  const topic = q.topic.toLowerCase(), statement = q.statement.toLowerCase();
  if (/Língua Portuguesa/.test(q.subject)) {
    if (/interpreta|inferência|compreensão|coesão|conector/.test(topic)) text = 'Atalho: localize no texto a frase que comprova a alternativa. Desconfie de opções que acrescentem causa, certeza ou regra que o autor não afirmou.';
    else if (/crase/.test(topic)) text = 'Atalho: troque o termo feminino por um masculino. Se surgir “ao”, há preposição + artigo; antes de verbo, pronome ou palavra sem artigo, não force crase.';
    else if (/concordância/.test(topic)) text = 'Atalho: encontre o núcleo do sujeito e ignore termos entre ele e o verbo. Com “haver” = existir e “fazer” = tempo decorrido, use singular.';
    else if (/regência/.test(topic)) text = 'Atalho: cubra o complemento e pergunte ao verbo/nome qual preposição ele exige. Depois confira se há artigo feminino para decidir a crase.';
    else if (/pontuação/.test(topic)) text = 'Atalho: nunca separe sujeito de verbo ou verbo de complemento por vírgula. Retire mentalmente o trecho entre vírgulas para ver se ele é explicativo ou essencial.';
    else if (/voz verbal/.test(topic)) text = 'Atalho: marque quem pratica a ação e quem a recebe. Na passiva, o objeto vira sujeito paciente; preserve tempo verbal e agente da ação.';
    else if (/acentuação|ortografia|parônimos/.test(topic)) text = 'Atalho: identifique a regra ou o sentido exato pedido antes de comparar grafias. Em parônimos, substitua a palavra na frase para testar o significado.';
    else text ||= 'Atalho: leia primeiro o comando, depois volte ao trecho relevante. Na reescrita, compare sentido, referente e relação lógica, não apenas a aparência gramatical.';
    return { text, source: /ortografia|acentuação|parônimos/.test(topic) ? TIP_SOURCES.spelling : TIP_SOURCES.text };
  }
  if (/Administração/.test(q.subject)) {
    if (/Noções de Administração/.test(q.subject) && !/Situações Gerenciais/.test(q.subject)) text ||= 'Atalho: identifique a função pelo verbo da situação: definir meta = planejar; distribuir recursos = organizar; orientar pessoas = dirigir; comparar resultado = controlar.';
    else text ||= 'Atalho: escolha a ação que enfrenta a causa descrita, define responsável e permite conferir o resultado. Desconfie de promessa, punição ou indicador isolado sem acompanhamento.';
    return { text, source: TIP_SOURCES.management };
  }
  if (/Conhecimentos Técnicos/.test(q.subject)) return { text: text || 'Atalho: primeiro localize o critério de classificação (território, período, sede ou exploração); só então compare as alternativas. Não substitua regra do manual por aparência ou conveniência.', source: TIP_SOURCES.technical };
  if (/Informática/.test(q.subject)) {
    text ||= /planilha|CONT.SE|MÉDIA|SOMA|filtro|gráfico/i.test(topic) ? 'Atalho: pergunte se a tarefa conta, soma, calcula média, ordena ou apenas oculta linhas. O nome da função e o efeito do comando eliminam opções de categoria errada.' :
      /arquivo|cópia|backup/i.test(topic) ? 'Atalho: pergunte o que muda: copiar duplica e preserva origem; mover troca de local; sincronizar replica mudanças; backup mantém recuperação anterior.' :
      'Atalho: identifique qual propriedade ou etapa está em jogo (acesso, integridade, transmissão ou conexão). Elimine opções que prometem garantia absoluta.';
    const source = /CONT.SE|planilha|filtro|MÉDIA|SOMA/i.test(topic) ? ['Microsoft Support — ajuda do Excel', 'https://support.microsoft.com/pt-br/excel'] : ['CERT.br — Cartilha de Segurança para Internet', 'https://cartilha.cert.br/'];
    return { text, source };
  }
  return { text: text || 'Atalho: encontre a condição que o enunciado exige e descarte primeiro alternativas que a contradizem.', source: null };
}

function studyTip(q) { return studyShortcut(q).text; }

function studyVideo(q, catalog = null) {
  const curated = VIDEOS.find(video => video.test(q));
  if (curated) return { ...curated, match: 'curated' };
  return catalog?.entries?.[`${q.subject} | ${q.topic}`] || null;
}

if (typeof module !== 'undefined') module.exports = {
  loadState, median, subjectAccuracy, priorityForQuestion, eligibleAt, examWeights, buildQueue, reviewQueue, schedule, formatClock, formatDuration, subjectReport, studyTip, studyShortcut, studyVideo, unlockAchievements, ACHIEVEMENTS, localDay
};

if (typeof document !== 'undefined') {
  const state = loadState(localStorage);
  let bank = [], manifest = null, videoCatalog = null, mathGuides = {}, queue = [], at = 0, session = null, timer = null;
  let questionMs = 0, sessionMs = 0, lastTick = 0, answered = false, confidenceSaved = false;
  let selectedAnswer = null, speedBaseline = null, speedDayRate = null;
  let sessionResult = { done: 0, correct: 0, totalMs: 0, subjects: {}, awards: [] };
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
    const upcoming = ACHIEVEMENTS.find(award => !state.achievements?.[award.id]);
    $('#nextMilestone').textContent = upcoming ? `Próximo marco: ${upcoming.title} · ${Math.min(upcoming.target, upcoming.value(state))}/${upcoming.target}` : 'Seus marcos atuais estão completos.';
    renderReviewCount();
  }

  function renderReviewCount() {
    const role = $('#role').value;
    const errors = reviewQueue(bank, state, role, 'wrong', Infinity).length;
    const doubts = reviewQueue(bank, state, role, 'hard', Infinity).length;
    $('#reviewCount').textContent = errors || doubts ? `${errors} ${errors === 1 ? 'erro' : 'erros'} · ${doubts} ${doubts === 1 ? 'dúvida' : 'dúvidas'} disponíveis para revisão voluntária.` :
      'Quando você errar ou marcar dúvida, a questão aparecerá aqui. A revisão automática respeita o intervalo programado.';
    $('#reviewNow').disabled = !reviewQueue(bank, state, role, $('#reviewKind').value, 1).length;
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
    const awards = state.achievements || {};
    $('#achievementGrid').replaceChildren(...ACHIEVEMENTS.map(award => {
      const card = document.createElement('div'); card.className = `achievement${awards[award.id] ? '' : ' locked'}`;
      const icon = document.createElement('div'); icon.className = 'icon'; icon.textContent = award.icon;
      const name = document.createElement('strong'); name.textContent = award.title;
      const detail = document.createElement('small'); detail.textContent = awards[award.id] ? 'Conquistada' : `${Math.min(award.target, award.value(state))}/${award.target}`;
      card.append(icon, name, detail); return card;
    }));
    const nextAward = ACHIEVEMENTS.find(award => !awards[award.id]);
    $('#achievementProgress').textContent = nextAward ? `Próxima: ${nextAward.title} · ${Math.min(nextAward.target, nextAward.value(state))}/${nextAward.target}. Sem pressa.` : 'Todas as conquistas atuais liberadas. Continue estudando no seu ritmo.';
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
    state.activeSession = { queueIds: queue.map(q => q.id), at, minutes: session.minutes, kind: session.kind, sessionMs,
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
    const unlocked = unlockAchievements(state);
    sessionResult.awards ||= [];
    sessionResult.awards.push(...unlocked.map(award => award.id));
    // A single quiet message at major moments; smaller badges wait for the summary/profile.
    if (previousDone < DAILY_GOAL && day.done >= DAILY_GOAL) toast('Meta de hoje concluída. Muito bem.');
  }

  function renderFeedback(index, restored = false) {
    const q = queue[at], ok = index === q.answer;
    answered = true; selectedAnswer = index;
    const buttons = [...$('#answers').children];
    buttons.forEach((button, i) => { button.disabled = true; if (i === q.answer) button.classList.add('correct'); if (i === index && !ok) button.classList.add('wrong'); });
    const learning = document.createElement('section'); learning.className = `learning-card ${ok ? 'is-correct' : 'is-wrong'}`;
    const learningHead = document.createElement('div'); learningHead.className = 'learning-head';
    const learningIcon = document.createElement('span'); learningIcon.className = 'learning-icon'; learningIcon.setAttribute('aria-hidden', 'true'); learningIcon.textContent = ok ? '✓' : '↗';
    const resultTitle = document.createElement('b'); resultTitle.textContent = ok ? 'Resposta correta' : 'Vamos aprender com essa';
    const resultLine = document.createElement('small'); resultLine.textContent = ok ? 'Boa! Veja um jeito mais rápido de chegar lá.' : 'Confira a lógica e um caminho mais enxuto.';
    const resultCopy = document.createElement('div'); resultCopy.append(resultTitle, resultLine);
    learningHead.append(learningIcon, resultCopy);
    const guide = mathGuides[q.id];
    const explanation = document.createElement(guide ? 'div' : 'p'); explanation.className = guide ? 'beginner-guide' : 'answer-explanation';
    if (guide) {
      const beginnerTitle = document.createElement('b'); beginnerTitle.className = 'beginner-title'; beginnerTitle.textContent = 'Entenda do zero · passo a passo';
      const steps = document.createElement('ol');
      guide.beginner.forEach(step => { const item = document.createElement('li'); item.textContent = step; steps.append(item); });
      explanation.append(beginnerTitle, steps);
    } else explanation.textContent = q.explanation;
    const shortcut = studyShortcut(q);
    const tip = document.createElement(guide ? 'details' : 'div'); tip.className = guide ? 'shortcut-block advanced-shortcut' : 'shortcut-block';
    const tipHead = document.createElement(guide ? 'summary' : 'div'); tipHead.className = 'shortcut-head';
    const tipTitle = document.createElement('b'); tipTitle.textContent = guide ? 'Atalho rápido · já tenho a base' : /mental|dividir por|metade|simplifique|cancele|decomponha|fração|frações/.test(shortcut.text.toLowerCase()) ? 'Cálculo mental / caminho curto' : 'Atalho de prova';
    const shortcutType = document.createElement('span'); shortcutType.className = 'shortcut-badge';
    shortcutType.textContent = guide ? ({ exact: 'EXATO', attention: 'EXATO', estimate: 'ESTIMATIVA' }[guide.type] || 'MÉTODO RÁPIDO') : /^Atalho: antes da conta exata, estime/i.test(shortcut.text) ? 'ESTIMATIVA' : /pegadinha|não confunda|cuidado/i.test(shortcut.text) ? 'ATENÇÃO' : /mental|dividir por|metade|simplifique|cancele|fração|frações|25%|10%|soma S e diferença/i.test(shortcut.text) ? 'EXATO' : 'MÉTODO RÁPIDO';
    const tipBody = document.createElement(guide ? 'div' : 'p'); tipBody.className = guide ? 'shortcut-flow' : 'shortcut-text';
    if (guide) {
      const parts = guide.shortcut.split('→').map(part => part.trim()).filter(Boolean);
      parts.forEach((part, index) => {
        const step = document.createElement('span'); step.className = 'shortcut-step';
        const label = document.createElement('small'); label.textContent = String(index + 1).padStart(2, '0') + ' · ' + (index === 0 ? 'RECONHEÇA' : index === parts.length - 1 ? 'RESULTADO' : 'FAÇA RÁPIDO');
        const content = document.createElement('span'); content.textContent = part;
        step.append(label, content); tipBody.append(step);
        if (index < parts.length - 1) { const arrow = document.createElement('span'); arrow.className = 'shortcut-arrow'; arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = '→'; tipBody.append(arrow); }
      });
    } else tipBody.textContent = shortcut.text;
    tipHead.append(tipTitle, shortcutType); tip.append(tipHead, tipBody);
    if (ok && speedBaseline && questionMs >= 10000 && questionMs <= speedBaseline * .85 && speedDayRate >= .8) {
      const speed = document.createElement('div'); speed.className = 'speed-note';
      speed.textContent = `Bom ritmo: ${Math.round((1 - questionMs / speedBaseline) * 100)}% mais rápido que seu padrão, mantendo a precisão.`;
      learning.append(speed);
    }
    learning.append(learningHead, explanation, tip);
    if (shortcut.source) {
      const source = document.createElement('a'); source.href = shortcut.source[1]; source.target = '_blank'; source.rel = 'noopener noreferrer';
      source.className = 'tip-source'; source.textContent = `Ver método: ${shortcut.source[0]} ↗`; tip.append(document.createElement('br'), source);
    }
    if (!guide) {
      const why = document.createElement('details'); why.className = 'why-shortcut';
      const whySummary = document.createElement('summary'); whySummary.textContent = 'Por que esse caminho funciona?';
      const whyText = document.createElement('p'); whyText.textContent = shortcutType.textContent === 'ESTIMATIVA' ? 'A estimativa serve para descartar opções incompatíveis; confirme a alternativa restante com o enunciado antes de marcar.' : shortcutType.textContent === 'ATENÇÃO' ? 'O atalho evita a confusão destacada sem alterar a regra cobrada. Confira a palavra-chave do enunciado antes de concluir.' : shortcutType.textContent === 'EXATO' ? 'O cálculo foi reorganizado, não aproximado: simplificar ou decompor preserva o mesmo valor e reduz as contas.' : 'A estratégia reduz etapas sem pular a condição principal. Use a explicação acima para conferir o resultado.';
      why.append(whySummary, whyText); tip.append(why);
    }
    $('#explain').append(learning);
    const video = studyVideo(q, videoCatalog);
    const videoCard = document.createElement('div'); videoCard.className = 'video-card';
    const videoTitle = document.createElement('b'); videoTitle.textContent = video?.match === 'curated' ? 'Aula selecionada para este assunto' : video?.match === 'specific' ? 'Vídeo indexado sobre este assunto' : video ? 'Vídeo relacionado ao assunto' : 'Quer ver uma aula?';
    const videoText = document.createElement('p'); videoText.textContent = video ? `${video.title}${video.startSeconds ? ` · trecho ${formatClock(video.startSeconds * 1000)}${video.endSeconds ? `–${formatClock(video.endSeconds * 1000)}` : ''}` : ''}` : `Ainda não selecionamos um vídeo específico para “${q.topic}”. Você pode pesquisar pelo tópico.`;
    videoCard.append(videoTitle, videoText);
    if (video) {
      const reason = document.createElement('small'); reason.className = 'quiet';
      reason.textContent = video.match === 'curated' ? 'Seleção editorial por assunto e canal.' : video.match === 'specific' ? 'Correspondência automática pelo título; confira se a aula cobre a dúvida exata.' : 'Sugestão de contexto, não necessariamente sobre o detalhe da questão.';
      videoCard.append(reason, document.createElement('br'));
      const play = document.createElement('button'); play.className = 'outline'; play.type = 'button'; play.textContent = 'Assistir aqui';
      play.addEventListener('click', () => {
        const frame = document.createElement('div'); frame.className = 'video-frame';
        const iframe = document.createElement('iframe'); iframe.src = `https://www.youtube-nocookie.com/embed/${video.id}${video.startSeconds ? `?start=${video.startSeconds}${video.endSeconds ? `&end=${video.endSeconds}` : ''}` : ''}`;
        iframe.title = video.title; iframe.loading = 'lazy'; iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share'; iframe.allowFullscreen = true;
        frame.append(iframe); play.replaceWith(frame);
      }); videoCard.append(play);
      const link = document.createElement('a'); link.href = `https://www.youtube.com/watch?v=${video.id}${video.startSeconds ? `&t=${video.startSeconds}s` : ''}`; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Abrir no YouTube'; link.className = 'textbtn'; videoCard.append(link);
      if (video.match === 'related') {
        const search = document.createElement('a'); search.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${q.subject} ${q.topic} aula`)}`;
        search.target = '_blank'; search.rel = 'noopener noreferrer'; search.textContent = 'Buscar aula mais específica'; search.className = 'textbtn'; videoCard.append(search);
      }
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
      lastOutcome: ok ? 'pending' : 'wrong',
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
    const unlocked = unlockAchievements(state);
    sessionResult.awards ||= [];
    sessionResult.awards.push(...unlocked.map(award => award.id));
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
    beginSession(minutes, 'regular');
  }

  function beginSession(minutes, kind) {
    session = { minutes, kind }; sessionMs = 0; at = 0; sessionResult = { done: 0, correct: 0, totalMs: 0, subjects: {}, awards: [] };
    $('#sessionSummary').hidden = true;
    $('#sessionClock').textContent = minutes ? `${minutes}:00 restantes` : '';
    $('#sessionClock').hidden = !minutes;
    show('quiz'); draw(); persistSession(); clearInterval(timer); timer = setInterval(tick, 250);
  }

  function startReview() {
    if (!bank.length) return toast('Aguarde o carregamento das questões.');
    if (state.activeSession && !confirm('Há uma sessão pausada. Iniciar revisão vai encerrar a fila anterior. Quer continuar?')) return;
    const role = $('#role').value;
    queue = reviewQueue(bank, state, role, $('#reviewKind').value, Number($('#reviewAmount').value));
    if (!queue.length) return toast('Ainda não há questões desse tipo para revisar.');
    if (role) { state.role = role; save(); }
    beginSession(0, 'review');
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
    at = saved.at; session = { minutes: saved.minutes || 0, kind: saved.kind || 'regular' }; sessionMs = saved.sessionMs || 0;
    sessionResult = saved.result || { done: 0, correct: 0, totalMs: 0, subjects: {}, awards: [] };
    state.role = saved.role || state.role;
    $('#role').value = state.role;
    $('#sessionClock').hidden = !session.minutes;
    $('#sessionClock').textContent = session.minutes ? `${formatClock(Math.max(0, session.minutes * 60000 - sessionMs))} restantes` : '';
    show('quiz'); draw(saved); renderResume(); clearInterval(timer); timer = setInterval(tick, 250);
  }

  function finish() {
    if (!session) return;
    const wasReview = session.kind === 'review';
    if (answered && !confidenceSaved && !$('#confidence').hidden) setConfidence('hard');
    clearInterval(timer); timer = null; session = null; state.activeSession = null;
    const result = sessionResult;
    const summary = $('#sessionSummary');
    if (result.done) {
      const accuracy = Math.round(result.correct / result.done * 100);
      const heading = document.createElement('h3'); heading.textContent = wasReview ? 'Revisão concluída' : 'Sessão concluída';
      const overview = document.createElement('p'); overview.textContent = `${result.done} ${result.done === 1 ? 'questão' : 'questões'} · ${result.correct} acertos · ${result.done - result.correct} erros · ${accuracy}% de aproveitamento`;
      const timing = document.createElement('p'); timing.textContent = `${formatClock(sessionMs)} de estudo · média de ${formatClock(result.totalMs / result.done)} por questão`;
      const rows = Object.values(result.subjects).sort((a, b) => a.correct / a.done - b.correct / b.done);
      const label = document.createElement('strong'); label.textContent = 'Por disciplina';
      const list = document.createElement('div'); list.className = 'subject-list'; list.append(...rows.map(makeSubjectRow));
      const insight = document.createElement('p'); insight.textContent = rows.length ?
        `Para revisar primeiro: ${rows[0].subject} (${rows[0].wrong} ${rows[0].wrong === 1 ? 'erro' : 'erros'} em ${rows[0].done} questões). ${rows[0].done < 5 ? 'É uma amostra pequena; confirme com mais exercícios.' : ''}` : '';
      const profileLink = document.createElement('button'); profileLink.type = 'button'; profileLink.className = 'textbtn'; profileLink.textContent = 'Ver todo o meu progresso →'; profileLink.addEventListener('click', () => { renderProfile(); show('profile'); });
      summary.replaceChildren(heading, overview, timing, label, list, insight, profileLink);
      if (result.awards?.length) {
        const awardLine = document.createElement('p'); awardLine.className = 'summary-awards';
        awardLine.textContent = `${result.awards.length} ${result.awards.length === 1 ? 'nova conquista' : 'novas conquistas'}: ${result.awards.map(id => ACHIEVEMENTS.find(award => award.id === id)?.title).filter(Boolean).slice(0, 2).join(' · ')}${result.awards.length > 2 ? ' · e mais no perfil' : ''}`;
        summary.append(awardLine);
      }
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
  $('#reviewNow').addEventListener('click', startReview);
  $('#reviewKind').addEventListener('change', renderReviewCount);
  $('#easy').addEventListener('click', () => setConfidence('easy'));
  $('#hard').addEventListener('click', () => setConfidence('hard'));
  $('#toggleFilters').addEventListener('click', () => { const panel = $('#customize'); panel.hidden = !panel.hidden; });
  $('#role').addEventListener('change', () => { state.role = $('#role').value; save(); renderSubjects(); renderReviewCount(); });
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
    fetch('/content/ibge-2026/banco-manifesto.json', { cache: 'no-store' }).then(response => response.ok ? response.json() : null).catch(() => null),
    fetch('/content/ibge-2026/video-catalog.json', { cache: 'no-store' }).then(response => response.ok ? response.json() : null).catch(() => null),
    fetch('/content/ibge-2026/math-guides.json', { cache: 'no-store' }).then(response => response.ok ? response.json() : {}).catch(() => ({}))
  ]).then(([data, exam, videos, guides]) => {
    bank = (data.questions || []).filter(q => q.status === 'approved'); manifest = exam; videoCatalog = videos; mathGuides = guides;
    $('#available').textContent = bank.length; renderSubjects(); renderProfile(); renderResume();
    if (manifest?.exam?.categoryLabel) $('#examType').textContent = `${manifest.exam.categoryLabel} · IBGE · ${manifest.exam.board} · 2026`;
  }).catch(() => toast('Não foi possível carregar o banco. Verifique sua conexão.'));
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js?v=visual-shortcuts-v2').then(registration => registration.update()).catch(() => {});
}
