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
  return { done: 0, correct: 0, role: '', records: {}, days: {} };
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
  if (record && record.dueAt > now) return -Infinity;
  const subjectRate = subjectAccuracy(state, q.subject, bank);
  const subjectNeed = subjectRate === null ? 0 : Math.max(0, .85 - subjectRate);
  const topicRecords = bank.filter(item => item.topic === q.topic && item.subject === q.subject)
    .map(item => state.records[item.id]).filter(Boolean);
  const topicAttempts = topicRecords.reduce((sum, item) => sum + (item.attempts || 0), 0);
  const topicCorrect = topicRecords.reduce((sum, item) => sum + (item.correct || 0), 0);
  const topicNeed = topicAttempts ? Math.max(0, .85 - topicCorrect / topicAttempts) : 0;
  if (!record) return 40 + 16 * subjectNeed + 18 * topicNeed;
  const overdueDays = Math.max(0, (now - (record.dueAt || 0)) / DAY_MS);
  const difficulty = (record.wrong || 0) * 4 + (record.hard || 0) * 2;
  return 55 + Math.min(15, overdueDays * 2) + difficulty + 16 * subjectNeed + 18 * topicNeed;
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
  const available = scope.filter(q => !state.records[q.id] || (!state.records[q.id].retired && (state.records[q.id].dueAt || 0) <= now));
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
    next.intervalDays = 0;
    next.dueAt = now + 5 * 60000;
  } else if (confidence === 'hard') {
    next.hard = (next.hard || 0) + 1;
    next.intervalDays = previousInterval < 1 ? 0 : Math.max(1, Math.round(previousInterval / 2));
    next.dueAt = now + (next.intervalDays ? next.intervalDays * DAY_MS : 30 * 60000);
  } else {
    next.easyCount = (next.easyCount || 0) + 1;
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

if (typeof module !== 'undefined') module.exports = {
  loadState, median, subjectAccuracy, priorityForQuestion, examWeights, buildQueue, schedule, formatClock, localDay
};

if (typeof document !== 'undefined') {
  const state = loadState(localStorage);
  let bank = [], manifest = null, queue = [], at = 0, session = null, timer = null;
  let questionMs = 0, sessionMs = 0, lastTick = 0, answered = false, confidenceSaved = false;
  let sessionResult = { done: 0, correct: 0, totalMs: 0 };

  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

  function tick() {
    if (!session || document.hidden) { lastTick = performance.now(); return; }
    const now = performance.now(), delta = Math.max(0, now - lastTick); lastTick = now;
    sessionMs += delta;
    if (!answered) questionMs += delta;
    $('#questionClock').textContent = formatClock(questionMs);
    if (session.minutes) {
      const remaining = session.minutes * 60000 - sessionMs;
      $('#sessionClock').textContent = `${formatClock(remaining)} restantes`;
      if (remaining <= 0) finish();
    }
  }

  function draw() {
    const q = queue[at];
    if (!q) return finish();
    questionMs = 0; answered = false; confidenceSaved = false;
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
    lastTick = performance.now();
  }

  function updateMilestones(day, previousDone) {
    if (previousDone < DAILY_GOAL && day.done >= DAILY_GOAL) toast('Meta de hoje concluída. Você construiu consistência.');
    else if (day.done === 5) toast('Cinco questões feitas. Bom começo.');
    else if (day.reviewed === 5) toast('Cinco revisões concluídas. Seu conhecimento está ficando mais firme.');
  }

  function answer(index) {
    if (answered || !session) return;
    tick(); if (!session) return; answered = true;
    const q = queue[at], ok = index === q.answer, now = Date.now();
    const buttons = [...$('#answers').children];
    buttons.forEach((button, i) => { button.disabled = true; if (i === q.answer) button.classList.add('correct'); if (i === index && !ok) button.classList.add('wrong'); });
    const previous = state.records[q.id] || { attempts: 0, correct: 0, wrong: 0, hard: 0, times: [] };
    const oldTimes = Object.values(state.records).flatMap(record => record.correctTimes || []).filter(value => value >= 10000 && value <= 600000);
    const baseline = median(oldTimes.length >= 5 ? oldTimes.slice(-30) : []);
    const day = state.days[localDay(now)] || { done: 0, correct: 0, reviewed: 0 };
    const oldDone = day.done;
    day.done++; if (ok) day.correct++; if (previous.attempts) day.reviewed++;
    state.days[localDay(now)] = day;
    state.done++; if (ok) state.correct++;
    const record = { ...previous, attempts: previous.attempts + 1, correct: previous.correct + (ok ? 1 : 0),
      lastAt: now, lastMs: Math.round(questionMs),
      correctTimes: ok ? [...(previous.correctTimes || []).slice(-4), Math.round(questionMs)] : (previous.correctTimes || []) };
    state.records[q.id] = ok ? record : schedule(record, false, null, now);
    sessionResult.done++; if (ok) sessionResult.correct++; sessionResult.totalMs += questionMs;
    save(); renderStats(); updateMilestones(day, oldDone);
    const explanation = document.createElement('div'); explanation.className = 'explanation';
    const title = document.createElement('b'); title.textContent = ok ? 'Correto.' : 'Ainda não.';
    const body = document.createElement('span'); body.textContent = ` ${q.explanation}`;
    explanation.append(title, document.createElement('br'), body);
    if (ok && baseline && questionMs >= 10000 && questionMs <= baseline * .85 && day.correct / day.done >= .8) {
      const speed = document.createElement('div'); speed.className = 'speed-note';
      speed.textContent = `Bom ritmo: ${Math.round((1 - questionMs / baseline) * 100)}% mais rápido que seu padrão, mantendo a precisão.`;
      explanation.append(speed);
    }
    $('#explain').append(explanation);
    $('#confidence').hidden = !ok;
    $('#next').disabled = false;
  }

  function setConfidence(level) {
    if (confidenceSaved || !answered || !session) return;
    const q = queue[at], record = state.records[q.id];
    state.records[q.id] = schedule(record, true, level, Date.now());
    confidenceSaved = true; save();
    $('#confidence').hidden = true;
    const message = document.createElement('small'); message.className = 'review-note';
    message.textContent = level === 'hard' ? 'Vou trazer esta questão de volta em cerca de 30 minutos.' :
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
    at++; draw();
  }

  function start() {
    if (!bank.length) return toast('O banco ainda está carregando. Tente novamente.');
    const role = $('#role').value;
    if (!role) return toast('Escolha seu cargo para priorizar as disciplinas da sua prova.');
    state.role = role; save();
    const mode = $('#mode').value, minutes = mode === 'time15' ? 15 : mode === 'time30' ? 30 : 0;
    const count = mode === 'custom' ? Math.max(1, Math.min(100, Number($('#customCount').value) || 10)) : mode === 'count20' ? 20 : 10;
    queue = buildQueue(filtered(), state, manifest, role, minutes ? 100 : count);
    if (!queue.length) return toast('Nenhuma questão disponível agora com esses filtros. Tente outra disciplina ou aguarde a revisão.');
    session = { minutes }; sessionMs = 0; at = 0; sessionResult = { done: 0, correct: 0, totalMs: 0 };
    $('#sessionClock').textContent = minutes ? `${minutes}:00 restantes` : '';
    $('#sessionClock').hidden = !minutes;
    show('quiz'); draw(); clearInterval(timer); timer = setInterval(tick, 250);
  }

  function finish() {
    if (!session) return;
    if (answered && !confidenceSaved && !$('#confidence').hidden) setConfidence('hard');
    clearInterval(timer); timer = null; session = null;
    const result = sessionResult;
    const summary = $('#sessionSummary');
    if (result.done) {
      const accuracy = Math.round(result.correct / result.done * 100);
      summary.textContent = `Sessão concluída: ${result.done} questões · ${accuracy}% de acertos · média de ${formatClock(result.totalMs / result.done)} por questão.`;
      summary.hidden = false;
      toast(accuracy >= 80 ? 'Sessão concluída com boa precisão. Continue no seu ritmo.' : 'Sessão concluída. Os erros já entraram na fila de revisão.');
    }
    renderStats(); show('study');
  }

  $('#openStudy').addEventListener('click', () => show('study'));
  $('#openStudy').addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); show('study'); } });
  $('#back').addEventListener('click', () => show('home'));
  $('#quit').addEventListener('click', finish);
  $('#next').addEventListener('click', next);
  $('#begin').addEventListener('click', start);
  $('#easy').addEventListener('click', () => setConfidence('easy'));
  $('#hard').addEventListener('click', () => setConfidence('hard'));
  $('#toggleFilters').addEventListener('click', () => { const panel = $('#customize'); panel.hidden = !panel.hidden; });
  $('#role').addEventListener('change', () => { state.role = $('#role').value; save(); renderSubjects(); });
  $('#subject').addEventListener('change', renderTopics);
  $('#mode').addEventListener('change', () => { $('#customCountField').hidden = $('#mode').value !== 'custom'; });
  $('#clear').addEventListener('click', () => { $('#subject').value = ''; renderTopics(); $('#topic').value = ''; $('#difficulty').value = ''; });
  $('#apply').addEventListener('click', () => { $('#customize').hidden = true; toast('Filtros aplicados à próxima sessão.'); });
  $('#role').value = state.role || '';
  renderStats();
  Promise.all([
    fetch(`/content/ibge-2026/questions.json?v=${Date.now()}`, { cache: 'no-store' }).then(response => { if (!response.ok) throw new Error('Banco indisponível'); return response.json(); }),
    fetch('/content/ibge-2026/banco-manifesto.json', { cache: 'no-store' }).then(response => response.ok ? response.json() : null).catch(() => null)
  ]).then(([data, exam]) => {
    bank = (data.questions || []).filter(q => q.status === 'approved'); manifest = exam;
    $('#available').textContent = bank.length; renderSubjects();
  }).catch(() => toast('Não foi possível carregar o banco. Verifique sua conexão.'));
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js?v=study-v1').then(registration => registration.update()).catch(() => {});
}
