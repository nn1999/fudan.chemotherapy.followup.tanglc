# 本机豆包语音配置

本目录的语音接入仅用于本机 Demo。密钥绝不写入 HTML、GitHub 或飞书。

1. 复制 `.env.local.example` 为 `.env.local`。
2. 在 `VOLC_TTS_API_KEY=` 后粘贴控制台创建的 API Key；`VOLC_TTS_APP_ID` 填豆包语音应用的 App ID；不要把 Key 发到聊天中。
3. 保持默认资源 `seed-tts-2.0`、模型 `seed-tts-2.0-standard` 与音色 `zh_female_vv_uranus_bigtts`（vivi 2.0）。本机服务按火山官方 V3 双向 WebSocket 协议建立语音会话，将音频帧合并为浏览器可播放的 MP3。
4. 启动：双击项目根目录的 `启动本机豆包语音.command`；或在终端执行：

   ```bash
   /Users/ningchun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node server/local-voice-server.mjs
   ```

5. 请用 Chrome、Edge 或 Safari 打开 `http://127.0.0.1:8787/`，不要直接双击 HTML，也不要使用 GitHub Pages 地址测试本机代理。进入通话后页面会明确显示“声音来源：豆包语音 2.0 · vivi 2.0”；如果显示系统语音，会同时提示本机服务未启动或连接失败。

麦克风说明：`http://127.0.0.1` 和 `http://localhost` 属于浏览器允许录音的本机安全来源。首次使用时请选择“允许麦克风”；若曾拒绝，请在地址栏左侧的网站权限中重新开启。ChatGPT 内置浏览器当前可能无法向网页开放麦克风，因此完整双向演示优先使用外部 Chrome。

`seed-tts-2.0` 的官方双向 WebSocket 示例使用 API Key。`VOLC_TTS_ACCESS_KEY` 仅保留给旧版认证兼容，不需要填写；不要使用或上传 Secret Key。

目前仅接入“动态问题播报”TTS。患者回答仍使用浏览器语音识别作为本机 Demo 兜底；它不需要额外 API，但兼容性和稳定性受浏览器影响。若要在不同电脑上稳定识别患者自由回答，再接入豆包流式 ASR。
