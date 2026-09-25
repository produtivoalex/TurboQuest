// Admin-only research helper. Prints candidate metadata; never publishes automatically.
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { resolve } = require('node:path');
const { writeFileSync } = require('node:fs');
const execFileAsync = promisify(execFile);
const bank = require('../content/ibge-2026/questions.json').questions.filter(q => q.status === 'approved');
const topics = [...new Map(bank.map(q => [`${q.subject} | ${q.topic}`, { subject: q.subject, topic: q.topic }])).values()];
const start = Number(process.argv[2] || 0), count = Number(process.argv[3] || 40);
const python = process.env.TQ_PYTHON;
if (!python || !process.env.PYTHONPATH) throw new Error('Configure TQ_PYTHON e PYTHONPATH para o yt-dlp isolado.');

function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
}
function queryFor(item) {
  const category = /Conhecimentos Técnicos/.test(item.subject) ? 'IBGE Censo Agropecuário 2026' :
    /Administração/.test(item.subject) ? 'administração concursos' :
    /Informática/.test(item.subject) ? 'informática Excel concursos' :
    /Língua Portuguesa/.test(item.subject) ? 'português concursos' : 'matemática raciocínio lógico concursos';
  return `${item.topic} ${category} aula`;
}
function rank(video, item) {
  const title = normalize(video.title), description = normalize(video.description);
  const words = normalize(item.topic).split(/\s+/).filter(word => word.length >= 4 && !['para', 'entre', 'sobre', 'com'].includes(word));
  const hits = words.filter(word => title.includes(word));
  const titleCoverage = words.length ? hits.length / words.length : 0;
  const exact = title.includes(normalize(item.topic).trim());
  const duration = Number(video.duration) || 0;
  const views = Number(video.view_count) || 0;
  const trusted = /IBGE|Professor Noslen|Ferretto|Curso em Vídeo|Estratégia Concursos|Gran Cursos|Marcelo Soares/i.test(video.channel || '');
  const score = (exact ? 55 : 0) + titleCoverage * 42 +
    (description.includes(normalize(item.topic).trim()) ? 12 : 0) +
    (trusted ? 10 : 0) + Math.min(15, Math.log10(views + 1) * 3) +
    (duration >= 180 && duration <= 2400 ? 6 : 0) - (duration > 3600 ? 12 : 0) - (/shorts/i.test(video.title) ? 12 : 0);
  return { score: Math.round(score), titleCoverage: Number(titleCoverage.toFixed(2)) };
}
async function research(item) {
  const query = queryFor(item);
  try {
    const { stdout } = await execFileAsync(python, ['-m', 'yt_dlp', '--flat-playlist', '--dump-json', '--no-warnings', '--skip-download', `ytsearch3:${query}`],
      { timeout: 20000, maxBuffer: 400000, windowsHide: true });
    const candidates = stdout.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line)).map(video => ({
      id: video.id, title: video.title, channel: video.channel, duration: video.duration,
      views: video.view_count, ...rank(video, item)
    })).sort((a, b) => b.score - a.score);
    return { ...item, query, candidates };
  } catch (error) { return { ...item, query, error: String(error.message).slice(0, 150), candidates: [] }; }
}
(async () => {
  const selection = topics.slice(start, start + count);
  const result = [];
  for (let index = 0; index < selection.length; index += 3) {
    result.push(...await Promise.all(selection.slice(index, index + 3).map(research)));
    process.stderr.write(`researched ${start + result.length}/${topics.length}\n`);
  }
  const output = JSON.stringify({ start, total: topics.length, result }, null, 2);
  if (process.argv[4]) writeFileSync(resolve(process.argv[4]), output);
  else process.stdout.write(output);
})().catch(error => { console.error(error); process.exitCode = 1; });
