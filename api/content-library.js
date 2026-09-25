import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = new URL('../', import.meta.url);

async function readJson(file, fallback, request) {
  try { return JSON.parse(await fs.readFile(new URL(file, sourceRoot), 'utf8')); }
  catch (_) {
    try { return JSON.parse(await fs.readFile(path.join(root, file), 'utf8')); }
    catch (_) {
      try {
        const host = request?.headers?.host || process.env.VERCEL_URL;
        const protocol = request?.headers?.['x-forwarded-proto'] || 'https';
        if (!host) return fallback;
        const response = await fetch(`${protocol}://${host}/${file}`);
        return response.ok ? await response.json() : fallback;
      } catch (_) { return fallback; }
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });
  const bank = String(req.query?.bank || 'ibge-2026');
  if (bank !== 'ibge-2026') return res.status(404).json({ error: 'Banco não encontrado.' });
  const [manifest, taxonomy, questions] = await Promise.all([
    readJson('content/ibge-2026/banco-manifesto.json', {}, req),
    readJson('content/ibge-2026/taxonomia.json', {}, req),
    readJson('content/ibge-2026/questions.json', [], req)
  ]);
  const published = questions.filter(question => question.status === 'approved');
  return res.status(200).json({
    bank: manifest,
    taxonomy,
    questions: published,
    stats: { published: published.length, underReview: questions.filter(q => q.status === 'review').length }
  });
}
