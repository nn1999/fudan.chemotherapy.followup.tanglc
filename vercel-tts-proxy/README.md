# 汤立晨 ddEC Demo · 豆包 TTS HTTPS 代理

仅为公开演示提供服务端 TTS 转发。凭证只能配置为 Vercel 环境变量，禁止写入前端或提交到 GitHub。

必需环境变量：

- `VOLC_TTS_API_KEY`
- `VOLC_TTS_RESOURCE_ID=seed-tts-2.0`
- `VOLC_TTS_VOICE_TYPE=zh_female_vv_uranus_bigtts`
- `VOLC_TTS_SAMPLE_RATE=24000`

接口：`GET /api/health`、`POST /api/tts`。
