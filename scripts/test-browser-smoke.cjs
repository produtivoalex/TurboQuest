const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.TQ_PLAYWRIGHT || 'playwright');
const questions = require('../content/ibge-2026/questions.json').questions;
const root = path.resolve(__dirname, '..');

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname === '/api/config') {
    res.setHeader('Content-Type', 'application/json');
    res.end('{"supabaseUrl":"","supabaseAnonKey":""}');
    return;
  }
  const file = pathname === '/' ? 'dist/index.html' :
    ['/app.js', '/sw.js', '/manifest.webmanifest'].includes(pathname) ? `dist${pathname}` : pathname.slice(1);
  const target = path.resolve(root, file);
  if (!target.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  try {
    const data = await fs.readFile(target);
    res.setHeader('Content-Type', target.endsWith('.js') ? 'text/javascript' : target.endsWith('.json') ? 'application/json' : 'text/html');
    res.end(data);
  } catch { res.writeHead(404).end(); }
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, executablePath: process.env.TQ_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const base = `http://127.0.0.1:${server.address().port}`;
    await page.goto(base);
    await page.locator('#available').getByText('320').waitFor();
    if (process.env.TQ_SCREENSHOT) await page.screenshot({ path: process.env.TQ_SCREENSHOT });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'sem rolagem horizontal no celular');
    await page.locator('.hero-cta').click();
    await page.locator('#role').selectOption('aca');
    await page.locator('#begin').click();
    const firstStatement = await page.locator('#statement').textContent();
    const first = questions.find(q => q.statement === firstStatement);
    assert(first, 'primeira questão identificada');
    await page.locator('#answers .answer').nth((first.answer + 1) % first.options.length).click();
    await page.locator('.tip').waitFor();
    let state = await page.evaluate(() => JSON.parse(localStorage.getItem('tq-study-v4')));
    assert.equal(state.done, 1);
    assert(state.records[first.id].dueAt - Date.now() > 7 * 3600000, 'erro volta após horas, não minutos');
    await page.locator('#quit').click();
    await page.locator('#resumePanel').waitFor();
    await page.reload();
    await page.locator('.hero-cta').getByText('Ver sessão pausada').waitFor();
    await page.locator('.hero-cta').click();
    await page.locator('#resumePanel').waitFor();
    await page.locator('#resume').click();
    assert.equal(await page.locator('#statement').textContent(), first.statement);
    assert.equal(await page.locator('.explanation').count(), 1, 'explicação restaurada');
    assert.equal(await page.locator('#next').isEnabled(), true);
    await page.locator('#next').click();
    const secondStatement = await page.locator('#statement').textContent();
    const second = questions.find(q => q.statement === secondStatement);
    assert(second && second.id !== first.id, 'retomou na próxima questão');
    await page.locator('#answers .answer').nth(second.answer).click();
    await page.locator('#hard').click();
    state = await page.evaluate(() => JSON.parse(localStorage.getItem('tq-study-v4')));
    assert.equal(state.done, 2, 'retomar não duplica respostas');
    assert(state.records[second.id].dueAt - Date.now() > 17 * 3600000, 'dúvida volta após horas');
    await page.locator('#quit').click();
    await page.reload();
    await page.locator('.hero-cta').click();
    await page.locator('#resume').click();
    assert.equal(await page.locator('.explanation').count(), 1);
    assert.equal(await page.locator('#confidence').isHidden(), true, 'avaliação de dificuldade restaurada');
    await page.locator('#next').click();
    const thirdStatement = await page.locator('#statement').textContent();
    await page.locator('#quit').click();
    await page.reload();
    await page.locator('.hero-cta').click();
    await page.locator('#resume').click();
    assert.equal(await page.locator('#statement').textContent(), thirdStatement, 'questão ainda não respondida preservada');
    assert.equal(await page.locator('.explanation').count(), 0);
    await page.locator('#quit').click();
    await page.locator('#endPaused').click();
    await page.locator('#sessionSummary').waitFor();
    state = await page.evaluate(() => JSON.parse(localStorage.getItem('tq-study-v4')));
    assert.equal(state.done, 2);
    assert.equal(state.activeSession, null);
    await page.locator('#mode').selectOption('time15');
    await page.locator('#begin').click();
    await page.locator('#quit').click();
    state = await page.evaluate(() => JSON.parse(localStorage.getItem('tq-study-v4')));
    assert.equal(state.activeSession.minutes, 15, 'modo por tempo também pode ser retomado');
    await page.locator('#endPaused').click();
    await page.locator('#role').selectOption('aci');
    await page.locator('#toggleFilters').click();
    await page.locator('#subject').selectOption('Noções de Informática');
    await page.locator('#topic').selectOption('phishing');
    await page.locator('#mode').selectOption('custom');
    await page.locator('#customCount').fill('1');
    await page.locator('#begin').click();
    await page.locator('#answers .answer').first().click();
    await page.locator('.video-card').getByText('trecho 01:01–07:29').waitFor();
    await page.locator('.video-card button').click();
    assert.match(await page.locator('.video-frame iframe').getAttribute('src'), /start=61&end=449/);
    await page.locator('#quit').click();
    await page.locator('#endPaused').click();
    assert.deepEqual(errors, [], 'sem erros de JavaScript');
    console.log('Navegador móvel: pausa, recarga, retomada, revisão espaçada, vídeo com trecho e resumo: OK');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
