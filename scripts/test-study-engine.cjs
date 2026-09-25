const assert = require('node:assert/strict');
const engine = require('../dist/app.js');
const manifest = require('../content/ibge-2026/banco-manifesto.json');
const bank = require('../content/ibge-2026/questions.json').questions.filter(q => q.status === 'approved');
const now = Date.now();

for (const role of manifest.roles) {
  const pool = bank.filter(q => q.roles.includes(role.id));
  const queue = engine.buildQueue(pool, { records: {} }, manifest, role.id, 60, now);
  assert.equal(queue.length, 60, `sessão completa para ${role.id}`);
  assert.equal(new Set(queue.map(q => q.id)).size, 60, `sem duplicidade para ${role.id}`);
  for (const subject of role.subjects) {
    assert.equal(queue.filter(q => q.subject === subject.name).length, subject.questions,
      `matriz do edital para ${role.id}: ${subject.name}`);
  }
}

const aca = bank.filter(q => q.roles.includes('aca'));
const portuguese = aca.filter(q => q.subject === 'Língua Portuguesa');
const freshAdmin = engine.buildQueue(aca.filter(q => q.subject === 'Noções de Administração'),
  { records: {} }, manifest, 'aca', 1, now);
assert(/^ibge26-b009-/.test(freshAdmin[0].id), 'lote de substituição precede lotes antigos não revisados');
const missed = portuguese[portuguese.length - 1];
const weakRecords = Object.fromEntries(portuguese.slice(0, 12).map(q => [q.id,
  { attempts: 2, correct: 0, wrong: 2, dueAt: now - 1000 }]));
const weakQueue = engine.buildQueue(aca, { records: weakRecords }, manifest, 'aca', 60, now);
assert(weakQueue.filter(q => q.subject === 'Língua Portuguesa').length > 15,
  'disciplina fraca recebe mais espaço que os 15 itens base');

const due = { attempts: 1, correct: 0, wrong: 1, dueAt: now - 1000 };
const subjectPool = [missed, ...portuguese.slice(0, 10)];
const dueQueue = engine.buildQueue(subjectPool, { records: { [missed.id]: due } }, manifest, 'aca', 1, now);
assert.equal(dueQueue[0].id, missed.id, 'erro vencido vem antes de questão inédita na disciplina');

const wrong = engine.schedule({ attempts: 1 }, false, null, now);
assert.equal(wrong.dueAt - now, 5 * 60000);
const hard = engine.schedule({ attempts: 1, correct: 1 }, true, 'hard', now);
assert.equal(hard.dueAt - now, 30 * 60000);
const easy = engine.schedule({ attempts: 1, correct: 1 }, true, 'easy', now);
assert.equal(easy.dueAt - now, 14 * 86400000);
assert.equal(engine.buildQueue([missed], { records: { [missed.id]: easy } }, manifest, 'aca', 1, now).length, 0);
const easyAgain = engine.schedule(easy, true, 'easy', now + 14 * 86400000);
assert.equal(easyAgain.retired, true);
assert.equal(engine.buildQueue([missed], { records: { [missed.id]: easyAgain } }, manifest, 'aca', 1, now + 50 * 86400000).length, 0);

const old = engine.loadState({ getItem: key => key === 'tq-state-v3' ? '{"done":25,"correct":18}' : null });
assert.equal(old.done, 25); assert.equal(old.correct, 18);
assert.equal(engine.formatClock(125000), '02:05');
assert.equal(engine.formatDuration(7500000), '2h 05min');
assert.equal(engine.formatDuration(45000), '45 s');
const report = engine.subjectReport({ records: {
  [bank[0].id]: { attempts: 2, correct: 1, timeMs: 60000 },
  older: { subject: 'Língua Portuguesa', attempts: 1, correct: 0, timeMs: 30000 }
} }, bank);
assert.equal(report.reduce((sum, row) => sum + row.done, 0), 3);
assert.equal(report.find(row => row.subject === bank[0].subject).correct, 1);
assert.equal(report.find(row => row.subject === 'Língua Portuguesa').wrong, 1);
const legacyReport = engine.subjectReport({ done: 5, correct: 3, records: {} }, bank);
assert.equal(legacyReport[0].subject, 'Histórico sem disciplina');
assert.equal(legacyReport[0].wrong, 2);
assert(bank.every(q => engine.studyTip(q).length > 50), 'todas as questões têm dica');
assert.equal(manifest.exam.category, 'processo_seletivo_simplificado');
console.log('Fila, matriz, revisões, migração, tempo, relatórios e dicas: OK');
