import { randomUUID } from 'node:crypto';
import { applyCors, json, readJson } from '../lib/http.mjs';
import { synthesize } from '../lib/volc-bidirectional-tts.mjs';

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  try {
    const body = await readJson(req);
    const text = String(body.text || '').trim();
    if (!text) return json(res, 400, { error: '请提供 text。' });
    if (text.length > 360) return json(res, 400, { error: '单次演示播报请控制在 360 字以内。' });
    const audio = await synthesize({
      apiKey: process.env.VOLC_TTS_API_KEY,
      resourceId: process.env.VOLC_TTS_RESOURCE_ID || 'seed-tts-2.0',
      voice: process.env.VOLC_TTS_VOICE_TYPE || 'zh_female_vv_uranus_bigtts',
      sampleRate: Number(process.env.VOLC_TTS_SAMPLE_RATE || 24000),
      text
    });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-Demo-Request-Id', randomUUID());
    return res.end(audio);
  } catch (error) {
    return json(res, 502, { error: error.message || '语音合成失败。' });
  }
}
