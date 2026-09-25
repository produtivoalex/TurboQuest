import fs from 'node:fs';

const questions = JSON.parse(fs.readFileSync('content/ibge-2026/questions.json', 'utf8'));
const plan = JSON.parse(fs.readFileSync('content/ibge-2026/expansion-plan.json', 'utf8'));
const approved = questions.filter(q => q.status === 'approved');
console.log(`Total: ${questions.length}/${plan.target}`);
console.log(`Aprovadas: ${approved.length}`);
for (const allocation of plan.allocations) {
  const count = questions.filter(q => q.subject === allocation.subject && q.roles?.some(role => allocation.roles.includes(role))).length;
  console.log(`${allocation.subject}: ${count}/${allocation.target}`);
}
