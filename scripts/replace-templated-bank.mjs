import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const masterFile='content/ibge-2026/questions.json';
const batchFile='content/ibge-2026/batches/batch-009.json';
const archiveFile='content/ibge-2026/retired/templated-questions-2026-09-25.json';
const master=JSON.parse(fs.readFileSync(masterFile,'utf8'));
const batch=JSON.parse(fs.readFileSync(batchFile,'utf8')).questions;
const flagged=question=>question.status==='approved'&&(
  question.statement.includes('Considere o contexto da operação descrito no edital')||
  question.explanation.includes('A alternativa correta preserva o critério do enunciado')
);
const removed=master.questions.filter(flagged);
if(removed.length!==141)throw new Error(`Esperadas 141 questões sinalizadas, encontradas ${removed.length}`);
if(batch.length!==100)throw new Error(`Esperadas 100 novas questões, encontradas ${batch.length}`);
if(fs.existsSync(archiveFile))throw new Error(`Arquivo de preservação já existe: ${archiveFile}`);
execFileSync(process.execPath,['scripts/audit-question-batch.mjs',batchFile,'--expected=100'],{stdio:'inherit'});
const retained=master.questions.filter(question=>!flagged(question));
const ids=new Set(retained.map(question=>question.id));
if(batch.some(question=>ids.has(question.id)))throw new Error('Há IDs repetidos no lote de substituição');
const replacement=batch.map(question=>({...question,status:'approved'}));
const next=[...retained,...replacement];
if(next.filter(question=>question.status==='approved').length!==320)throw new Error('Total aprovado inesperado');
fs.mkdirSync('content/ibge-2026/retired',{recursive:true});
fs.writeFileSync(archiveFile,JSON.stringify({reason:'Questões retiradas por enunciado de molde ou explicação genérica; preservadas para auditoria, não publicação',removedAt:'2026-09-25',questions:removed},null,2)+'\n');
fs.writeFileSync(masterFile,JSON.stringify({...master,questions:next},null,2)+'\n');
console.log(`Substituição concluída: ${removed.length} arquivadas, ${replacement.length} novas aprovadas, 320 aprovadas no banco.`);
