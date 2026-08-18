import { applyCors, json } from '../lib/http.mjs';

export default function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  return json(res, 200, {
    ok: true,
    ttsConfigured: Boolean(process.env.VOLC_TTS_API_KEY),
    voice: process.env.VOLC_TTS_VOICE_TYPE || 'zh_female_vv_uranus_bigtts'
  });
}
