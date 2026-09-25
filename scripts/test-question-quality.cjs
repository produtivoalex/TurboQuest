const assert=require('node:assert/strict');
const bank=require('../content/ibge-2026/questions.json').questions;
const batch=require('../content/ibge-2026/batches/batch-009.json').questions;
const archive=require('../content/ibge-2026/retired/templated-questions-2026-09-25.json').questions;
const approved=bank.filter(item=>item.status==='approved');
const flagged=item=>item.statement.includes('Considere o contexto da operação descrito no edital')||
  item.explanation.includes('A alternativa correta preserva o critério do enunciado');
assert.equal(archive.length,141);
assert(archive.every(flagged));
assert.equal(batch.length,100);
assert.equal(approved.length,320);
assert(approved.every(item=>!flagged(item)));
assert.equal(new Set(approved.map(item=>item.id)).size,approved.length);
assert.equal(new Set(approved.map(item=>item.statement)).size,approved.length);
assert(batch.every(item=>item.explanation.length>=120&&item.options.length===5));
for(let index=0;index<batch.length;index++){
  const item=batch[index];
  assert.equal(item.answer,index%5,`posição do gabarito de ${item.id}`);
  assert.equal(approved.find(published=>published.id===item.id)?.answer,item.answer);
}
console.log('Substituição editorial: 141 arquivadas, 100 novas, 320 publicáveis, sem frases de molde: OK');
