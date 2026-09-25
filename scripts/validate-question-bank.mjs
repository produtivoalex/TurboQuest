import fs from 'node:fs';

const file = process.argv[2];
if (!file) throw new Error('Uso: node scripts/validate-question-bank.mjs caminho/questions.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const questions = Array.isArray(data) ? data : data.questions;
if (!Array.isArray(questions)) throw new Error('O arquivo precisa ser um array ou possuir a chave questions.');

const errors = [];
const ids = new Set();
const statements = new Map();
for (const [index, q] of questions.entries()) {
  const where = `questão ${index + 1}`;
  if (!q.id || ids.has(q.id)) errors.push(`${where}: id ausente ou duplicado`);
  ids.add(q.id);
  if (!Array.isArray(q.roles) || !q.roles.length) errors.push(`${where}: cargo ausente`);
  if (!q.subject || !q.topic) errors.push(`${where}: disciplina ou tópico ausente`);
  if (!['easy', 'medium', 'hard', 'very-hard'].includes(q.difficulty)) errors.push(`${where}: dificuldade inválida`);
  if (String(q.statement || '').trim().length < 80) errors.push(`${where}: enunciado curto`);
  if (!Array.isArray(q.options) || q.options.length !== 5 || q.options.some(x => String(x).trim().length < 1)) errors.push(`${where}: são necessárias 5 alternativas plausíveis`);
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 4) errors.push(`${where}: gabarito inválido`);
  if (String(q.explanation || '').trim().length < 120) errors.push(`${where}: explicação insuficiente`);
  if (!Array.isArray(q.whyWrong) || q.whyWrong.length !== 5) errors.push(`${where}: justificativas dos distratores incompletas`);
  if (!Array.isArray(q.sources) || !q.sources.length) errors.push(`${where}: fonte ausente`);
  if (q.status !== 'approved') errors.push(`${where}: somente questões approved podem ser publicadas`);
  const normalized = String(q.statement || '').toLowerCase().replace(/\W+/g, ' ').trim();
  if (statements.has(normalized)) errors.push(`${where}: enunciado duplicado com ${statements.get(normalized)}`);
  statements.set(normalized, where);
}

if (errors.length) {
  console.error(`Banco inválido: ${errors.length} problema(s)`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Banco válido: ${questions.length} questão(ões) aprovadas.`);
