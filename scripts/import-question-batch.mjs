import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const input = process.argv[2];
const approve = process.argv.includes('--approve');
if (!input) throw new Error('Uso: node scripts/import-question-batch.mjs caminho/lote.json [--approve]');

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const incomingData = read(input);
const incoming = Array.isArray(incomingData) ? incomingData : incomingData.questions;
if (!Array.isArray(incoming) || !incoming.length) throw new Error('O lote precisa ser um array ou possuir a chave questions.');
if (approve) execFileSync(process.execPath, ['scripts/audit-question-batch.mjs', input], { stdio: 'inherit' });

const masterPath = 'content/ibge-2026/questions.json';
const masterData = read(masterPath);
const master = Array.isArray(masterData) ? masterData : masterData.questions;
const ids = new Set(master.map(q => q.id));
const statements = new Set(master.map(q => String(q.statement || '').toLowerCase().replace(/\W+/g, ' ').trim()));
const errors = [];
const clean = [];

for (const [index, original] of incoming.entries()) {
  const q = { ...original, status: approve ? 'approved' : 'review' };
  const where = `questão ${index + 1}`;
  if (!q.id) q.id = `ibge26-import-${Date.now()}-${index + 1}`;
  if (ids.has(q.id)) errors.push(`${where}: id duplicado (${q.id})`);
  if (!Array.isArray(q.roles) || !q.roles.length) errors.push(`${where}: cargo ausente`);
  if (!q.subject || !q.topic) errors.push(`${where}: disciplina ou tópico ausente`);
  if (!['easy', 'medium', 'hard', 'very-hard'].includes(q.difficulty)) errors.push(`${where}: dificuldade inválida`);
  if (String(q.statement || '').trim().length < 80) errors.push(`${where}: enunciado curto`);
  if (!Array.isArray(q.options) || q.options.length !== 5 || q.options.some(x => String(x).trim().length < 1)) errors.push(`${where}: são necessárias 5 alternativas`);
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 4) errors.push(`${where}: gabarito inválido`);
  if (String(q.explanation || '').trim().length < 120) errors.push(`${where}: explicação insuficiente`);
  if (!Array.isArray(q.whyWrong) || q.whyWrong.length !== 5) errors.push(`${where}: justificativas incompletas`);
  if (!Array.isArray(q.sources) || !q.sources.length) errors.push(`${where}: fonte ausente`);
  const statement = String(q.statement || '').toLowerCase().replace(/\W+/g, ' ').trim();
  if (statements.has(statement)) errors.push(`${where}: enunciado duplicado`);
  ids.add(q.id); statements.add(statement); clean.push(q);
}

if (errors.length) {
  console.error(`Importação bloqueada: ${errors.length} problema(s)`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

master.push(...clean);
fs.writeFileSync(masterPath, JSON.stringify({ ...masterData, questions: master }, null, 2) + '\n');
console.log(`${clean.length} questão(ões) importadas como ${approve ? 'approved' : 'review'}.`);
console.log(approve ? 'Execute o validador antes do deploy.' : 'Revise o lote e reimporte com --approve somente após a aprovação editorial.');
