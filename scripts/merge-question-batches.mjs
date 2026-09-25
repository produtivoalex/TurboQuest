import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const masterFile = path.join(root, 'content/ibge-2026/questions.json');
const batchDir = path.join(root, 'content/ibge-2026/batches');
const master = JSON.parse(fs.readFileSync(masterFile, 'utf8'));
const ids = new Set(master.map(question => question.id));
const files = fs.readdirSync(batchDir).filter(file => file.endsWith('.json')).sort();
let added = 0;
for (const file of files) {
  const batch = JSON.parse(fs.readFileSync(path.join(batchDir, file), 'utf8'));
  for (const question of batch.questions || []) {
    if (ids.has(question.id)) continue;
    master.push({ ...question, status: question.status || 'review' });
    ids.add(question.id);
    added += 1;
  }
}
fs.writeFileSync(masterFile, JSON.stringify(master, null, 2) + '\n');
console.log(`Mescladas ${added} questões; total no banco: ${master.length}.`);
