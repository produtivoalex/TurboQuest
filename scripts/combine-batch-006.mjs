import fs from 'node:fs';
const a=JSON.parse(fs.readFileSync('content/ibge-2026/batches/batch-006a.json')).questions;
const b=JSON.parse(fs.readFileSync('content/ibge-2026/batches/batch-006b.json')).questions;
fs.writeFileSync('content/ibge-2026/batches/batch-006.json',JSON.stringify({batch:'batch-006',status:'review',generatedBy:'ChatGPT editorial curation',questions:[...a,...b]},null,2)+'\n');
console.log('Lote 006 consolidado com 100 questões.');
