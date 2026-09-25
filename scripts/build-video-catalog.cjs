// Converts offline YouTube research to a compact, inspectable catalog.
// Suggestions are deliberately labelled by match confidence, not called verified.
const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const root = resolve(__dirname, '..');
const research = JSON.parse(readFileSync(resolve(root, 'content/ibge-2026/video-candidates.json'), 'utf8'));
const fallback = { id: 'cW6h020IZhs', title: 'O que é o Censo Agropecuário — IBGE Explica', channel: 'IBGE' };
const unavailable = new Set(['xhXDbFmYbEU']);
const entries = {};
for (const row of research.result) {
  const best = row.candidates.find(candidate => !unavailable.has(candidate.id));
  const video = best || (/Conhecimentos Técnicos/.test(row.subject) ? fallback : null);
  if (!video) throw new Error(`Sem vídeo para ${row.subject} | ${row.topic}`);
  entries[`${row.subject} | ${row.topic}`] = {
    id: video.id, title: video.title, channel: video.channel || '',
    match: best && best.score >= 70 && best.titleCoverage >= .5 ? 'specific' : 'related',
    ...(best ? { score: best.score } : { note: 'Aula geral de contexto; não cobre necessariamente o detalhe da questão.' })
  };
}
Object.assign(entries, {
  'Raciocínio Lógico Quantitativo | diagramas lógicos': { id: 'l_20kYKKZk0', title: 'Diagramas lógicos para concursos — Felippe Loureiro', channel: 'Felippe Loureiro', match: 'specific' },
  'Raciocínio Lógico Quantitativo | aritmética': { id: 'Sg7NT-Ab7eA', title: 'Aritmética básica — Pré Universidade Online', channel: 'Pré Universidade Online', match: 'related' },
  'Noções de Administração | sistemas abertos': { id: 'MNysnYBlkeU', title: 'Organizações como sistemas abertos — Nota Dez Play', channel: 'Nota Dez Play', match: 'specific' },
  'Noções de Administração | direção': { id: 'X9j2xGTELbs', title: 'Funções administrativas — Nota Dez Play', channel: 'Nota Dez Play', match: 'related' },
  'Noções de Administração | coordenação': { id: 'X9j2xGTELbs', title: 'Funções administrativas — Nota Dez Play', channel: 'Nota Dez Play', match: 'related' }
});
const catalog = { source: 'Pesquisa de candidatos no YouTube em 2026-09-25; sugestões não verificadas editorialmente.', entries };
writeFileSync(resolve(root, 'content/ibge-2026/video-catalog.json'), JSON.stringify(catalog));
console.log(`${Object.keys(entries).length} tópicos indexados; ${Object.values(entries).filter(v => v.match === 'specific').length} correspondências específicas automáticas.`);
