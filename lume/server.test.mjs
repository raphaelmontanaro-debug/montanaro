import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createAppServer } from './server.mjs';

async function setup(t, options = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'lume-server-'));
  const dist = path.join(root, 'dist');
  await mkdir(dist);
  await writeFile(path.join(dist, 'index.html'), '<!doctype html><title>Lume</title>');
  await writeFile(path.join(root, '.env'), 'OPENAI_API_KEY=do-not-serve');
  await symlink(path.join(root, '.env'), path.join(dist, 'outside.txt'));
  const server = createAppServer({ apiKey: '', distDir: dist, ...options });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const port = server.address().port;
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  });
  return (pathname, { method = 'GET', headers = {}, body } = {}) => new Promise((resolve, reject) => {
    const request = http.request({ hostname: '127.0.0.1', port, path: pathname, method, headers }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, text: Buffer.concat(chunks).toString('utf8') }));
      response.on('error', reject);
    });
    request.on('error', reject);
    request.end(body);
  });
}

const article = { title: 'Artigo de teste', text: 'A leitura científica exige observar os resultados e os limites apresentados no artigo. '.repeat(8) };
const post = (input = article) => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });

test('funciona sem chave e não tenta acessar o serviço de IA', async (t) => {
  let calls = 0;
  const request = await setup(t, { fetchImpl: () => { calls += 1; throw new Error('não deveria ser chamado'); } });
  const index = await request('/');
  assert.equal(index.status, 200);
  assert.match(index.headers['content-type'], /text\/html/);
  const status = await request('/api/status');
  assert.deepEqual(JSON.parse(status.text), { aiAvailable: false });
  assert.equal(status.headers['cache-control'], 'no-store');
  const study = await request('/api/study', post());
  assert.equal(study.status, 503);
  assert.match(JSON.parse(study.text).error, /roteiro local/);
  assert.equal(calls, 0);
});

test('não publica segredos, código do servidor ou links fora de dist', async (t) => {
  const request = await setup(t);
  for (const pathname of ['/.env', '/server.mjs', '/outside.txt', '/%2eenv', '/%2e%2e%2f.env', '/%00']) {
    const response = await request(pathname);
    assert.equal(response.status, 404, pathname);
    assert.doesNotMatch(response.text, /do-not-serve/);
  }
});

test('rejeita origens e hosts externos antes de processar dados', async (t) => {
  const request = await setup(t);
  assert.equal((await request('/api/status', { headers: { Host: 'evil.example' } })).status, 403);
  assert.equal((await request('/api/study', { ...post(), headers: { ...post().headers, Origin: 'https://evil.example' } })).status, 403);
  assert.equal((await request('/api/status', { headers: { 'sec-fetch-site': 'cross-site' } })).status, 403);
});

test('valida método, tipo, JSON e limites antes de solicitar IA', async (t) => {
  const request = await setup(t);
  const method = await request('/api/study');
  assert.equal(method.status, 405);
  assert.equal(method.headers.allow, 'POST');
  assert.equal((await request('/api/status', { method: 'POST' })).status, 405);
  assert.equal((await request('/api/study', { method: 'POST', body: '{}' })).status, 415);
  assert.equal((await request('/api/study', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{bad' })).status, 400);
  assert.equal((await request('/api/study', post({ text: 'curto' }))).status, 400);
  assert.equal((await request('/api/study', post({ text: 'a'.repeat(150_001) }))).status, 400);
  assert.equal((await request('/api/study', post({ ...article, title: 'x'.repeat(501) }))).status, 400);
  assert.equal((await request('/api/study', post(null))).status, 400);
  assert.equal((await request('/api/unknown')).status, 404);
});

test('não repassa detalhes sensíveis de falhas do serviço de IA', async (t) => {
  const secret = 'sk-only-a-fake-secret-for-test';
  const request = await setup(t, { apiKey: secret, fetchImpl: async () => { throw new Error(`upstream included ${secret}`); } });
  assert.deepEqual(JSON.parse((await request('/api/status')).text), { aiAvailable: true });
  const response = await request('/api/study', post());
  assert.equal(response.status, 502);
  assert.match(JSON.parse(response.text).error, /roteiro local/);
  assert.doesNotMatch(response.text, /sk-only|upstream/);
});

test('encerra uma solicitação de IA que excede o tempo limite', async (t) => {
  const request = await setup(t, {
    apiKey: 'fake-key',
    timeoutMs: 25,
    fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    }),
  });
  const response = await request('/api/study', post());
  assert.equal(response.status, 504);
  assert.match(JSON.parse(response.text).error, /demorou/);
});
