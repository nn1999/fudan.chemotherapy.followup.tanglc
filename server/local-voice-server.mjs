import { createServer } from 'node:http';
import { readFileSync, existsSync, createReadStream } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { synthesizeBidirectional } from './volc-bidirectional-tts.mjs';

const root = resolve(import.meta.dirname, '..');
const appRoot = resolve(root, 'app');
const envPath = resolve(root, '.env.local');
const port = Number(process.env.PORT || 8787);

function readEnv() {
  const values = {};
  if (!existsSync(envPath)) return values;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !m[1].startsWith('#')) values[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '').trim();
  }
  return values;
}

const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml', '.json':'application/json; charset=utf-8' };
const json = (res, status, body) => { res.writeHead(status, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'Access-Control-Allow-Origin':'*' }); res.end(JSON.stringify(body)); };

async function synthesize(text) {
  const env = readEnv();
  if (!env.VOLC_TTS_API_KEY) throw new Error('未配置 VOLC_TTS_API_KEY。请复制 .env.local.example 为 .env.local 后填写。');
  const requestId = randomUUID();
  const body = await synthesizeBidirectional({
    apiKey: env.VOLC_TTS_API_KEY,
    appId: env.VOLC_TTS_APP_ID || '1524845989',
    accessKey: env.VOLC_TTS_ACCESS_KEY,
    resourceId: env.VOLC_TTS_RESOURCE_ID || 'seed-tts-2.0',
    voice: env.VOLC_TTS_VOICE_TYPE || 'zh_female_vv_uranus_bigtts',
    model: env.VOLC_TTS_MODEL || 'seed-tts-2.0-standard',
    sampleRate: Number(env.VOLC_TTS_SAMPLE_RATE || 24000),
    speedRatio: Number(env.VOLC_TTS_SPEED_RATIO || 0.92),
    text
  });
  return { body, type: 'audio/mpeg', requestId };
}

createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS', 'Access-Control-Allow-Headers':'Content-Type' }); return res.end(); }
  if (req.method === 'GET' && req.url === '/api/health') return json(res, 200, { ok:true, ttsConfigured:Boolean(readEnv().VOLC_TTS_API_KEY), voice:readEnv().VOLC_TTS_VOICE_TYPE || 'zh_female_vv_uranus_bigtts' });
  if (req.method === 'POST' && req.url === '/api/tts') {
    let raw = ''; req.on('data', chunk => raw += chunk); req.on('end', async () => {
      try {
        const text = String(JSON.parse(raw || '{}').text || '').trim();
        if (!text) return json(res, 400, { error:'请提供 text。' });
        if (text.length > 500) return json(res, 400, { error:'单次演示播报请控制在 500 字以内。' });
        const audio = await synthesize(text);
        res.writeHead(200, { 'Content-Type':audio.type, 'Cache-Control':'no-store', 'Access-Control-Allow-Origin':'*', 'X-Demo-Request-Id':audio.requestId });
        res.end(audio.body);
      } catch (error) { json(res, 502, { error:error.message || '语音合成失败。' }); }
    });
    return;
  }
  if (req.method === 'GET') {
    const pathName = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    const safePath = normalize(pathName).replace(/^([.][.][/\\])+/, '');
    const file = join(appRoot, safePath);
    if (!file.startsWith(appRoot) || !existsSync(file)) return json(res, 404, { error:'未找到页面。' });
    res.writeHead(200, { 'Content-Type':mime[extname(file)] || 'application/octet-stream' });
    return createReadStream(file).pipe(res);
  }
  json(res, 405, { error:'不支持的请求。' });
}).listen(port, '127.0.0.1', () => console.log(`本机 Demo： http://127.0.0.1:${port}/`));
