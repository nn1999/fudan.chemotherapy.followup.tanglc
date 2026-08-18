(() => {
  const native = window.speechSynthesis;
  const localHosts = new Set(['127.0.0.1', 'localhost']);
  const configuredEndpoint = String(window.TANG_TTS_ENDPOINT || '').trim();
  const endpoint = configuredEndpoint || (localHosts.has(location.hostname)
    ? `${location.origin}/api/tts`
    : location.protocol === 'file:' ? 'http://127.0.0.1:8787/api/tts' : '');
  let playing = null;

  function report(state, detail = '') {
    window.dispatchEvent(new CustomEvent('tang-tts-status', { detail: { state, detail, endpoint } }));
  }

  function cancel() {
    if (playing) {
      playing.pause();
      if (playing.dataset.objectUrl) URL.revokeObjectURL(playing.dataset.objectUrl);
      playing = null;
    }
    native?.cancel();
  }

  function nativeSpeak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!native || !window.SpeechSynthesisUtterance) return reject(new Error('当前浏览器不支持系统语音。'));
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = options.rate || 0.96;
      utterance.onend = resolve;
      utterance.onerror = () => reject(new Error('浏览器系统语音播放失败。'));
      native.speak(utterance);
      report('native', '豆包服务不可用，已回退为浏览器系统语音');
    });
  }

  async function speak(text, options = {}) {
    const content = String(text || '').trim();
    if (!content) return;
    cancel();
    if (!endpoint) {
      report('unavailable', '当前页面未配置 HTTPS 豆包语音代理');
      if (options.allowNativeFallback !== false) return nativeSpeak(content, options);
      throw new Error('当前页面未配置豆包语音代理。');
    }

    try {
      report('connecting', '正在连接豆包语音');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content })
      });
      if (!response.ok) {
        let message = `豆包语音请求失败（${response.status}）`;
        try { message = (await response.json()).error || message; } catch {}
        throw new Error(message);
      }
      const blob = await response.blob();
      if (!blob.size || !String(blob.type).startsWith('audio/')) throw new Error('豆包接口未返回有效音频。');
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.dataset.objectUrl = url;
      playing = audio;
      await new Promise((resolve, reject) => {
        audio.onplaying = () => report('doubao', '豆包语音 2.0 · vivi 2.0');
        audio.onended = resolve;
        audio.onerror = () => reject(new Error('豆包音频无法播放。'));
        audio.play().catch(reject);
      });
      URL.revokeObjectURL(url);
      if (playing === audio) playing = null;
    } catch (error) {
      report('error', error.message || '豆包语音不可用');
      if (options.allowNativeFallback !== false) return nativeSpeak(content, options);
      throw error;
    }
  }

  async function health() {
    if (!endpoint) return { ok: false, error: '未配置代理地址' };
    const healthUrl = endpoint.replace(/\/api\/tts(?:\?.*)?$/, '/api/health');
    try {
      const response = await fetch(healthUrl, { cache: 'no-store' });
      const data = await response.json();
      report(data.ok && data.ttsConfigured ? 'ready' : 'error', data.ok && data.ttsConfigured ? '豆包语音服务已就绪' : '豆包语音服务未完成配置');
      return data;
    } catch (error) {
      report('offline', '本机豆包语音服务未启动');
      return { ok: false, error: error.message };
    }
  }

  window.TangTTS = { speak, cancel, health, endpoint };
  health();
})();
