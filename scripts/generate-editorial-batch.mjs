import fs from 'node:fs/promises';

if (process.env.TURBOQUEST_ALLOW_GROQ !== 'true') {
  throw new Error('Geração editorial por Groq desativada. Gere os lotes na curadoria e importe com scripts/import-question-batch.mjs.');
}

const endpoint = process.env.TURBOQUEST_API || 'https://turboquest.vercel.app/api/study-plan';
const count = Number(process.argv[2] || 50);
const batchSize = 10;
const manifest = await fs.readFile('content/ibge-2026/banco-manifesto.json', 'utf8');
const taxonomy = await fs.readFile('content/ibge-2026/taxonomia.json', 'utf8');
const edital = `IBGE PSS 2026, Edital 01/2026, banca IBFC. Prova de 60 questões e cinco alternativas. Cargos ACA, ACI, AOR, ACR e ACS. Matriz, tópicos e fontes estão no background editorial. Este lote deve priorizar conteúdos ainda pouco representados.`;
const questions = [];
const output = `content/ibge-2026/batches/batch-auto-${Date.now()}.json`;
const save = async () => fs.writeFile(output, JSON.stringify({batch: output, status: 'review', questions}, null, 2) + '\n');
for (let offset = 0; offset < count; offset += batchSize) {
  const requested = Math.min(batchSize, count - offset);
  process.stdout.write(`Lote ${offset + 1}-${offset + requested}/${count}... `);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({
      action: 'generate', editorial: true, count: requested, exam: 'IBGE', cargo: 'todos os cargos compatíveis', edital,
      background: `${manifest}\n${taxonomy}\nGere questões novas, distribuídas entre disciplinas e cargos, sem repetir as já existentes.`
    })
  });
  const data = await response.json();
  if (!response.ok) {
    console.error(data.error || `HTTP ${response.status}`);
    break;
  }
  const incoming = data.result?.questions || [];
  for (const question of incoming) {
    if (!Array.isArray(question.options) || question.options.length < 5) continue;
    questions.push({
      ...question,
      id: `ibge26-auto-${Date.now()}-${questions.length + 1}`,
      roles: question.roles || ['aca', 'aci', 'aor', 'acr', 'acs'],
      sources: question.sources || (question.sourceUrl ? [{title: 'Fonte indicada pelo gerador', locator: 'background editorial', url: question.sourceUrl}] : [{title: 'Edital IBGE 2026 e taxonomia editorial', locator: 'background editorial'}]),
      status: 'review'
    });
  }
  await save();
  console.log(`${incoming.length} recebidas`);
}
console.log(`Salvas ${questions.length} questões em ${output}.`);
