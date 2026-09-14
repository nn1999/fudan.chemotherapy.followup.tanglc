(() => {
  const manifest = window.TANG_VOICE_MANIFEST || {clips:{}};
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  const endpoint = local ? `${location.origin}/api/tts` : '';
  const player = new Audio();
  player.preload = 'auto';
  let active = null;
  const aborted = () => new DOMException('播放已取消', 'AbortError');
  function report(state, detail = '') {
    window.dispatchEvent(new CustomEvent('tang-tts-status', {detail:{state, detail, voice:'S_DjNkK4k02'}}));
  }
  function cancel() {
    if (active) active.abort();
    active = null;
    player.pause();
    player.removeAttribute('src');
    player.load();
    window.speechSynthesis?.cancel();
    report('idle');
  }
  async function speak(text) {
    cancel();
    const content = String(text || '').trim();
    if (!content) return;
    const controller = new AbortController();
    const {signal} = controller;
    active = controller;
    let objectUrl = '';
    const timeout = setTimeout(() => controller.abort(), 90000);
    try {
      report('loading', '正在准备语音');
      let source = manifest.clips[content];
      if (!source) {
        if (!endpoint) throw new Error('当前文案尚未合成，请启动本机服务生成语音。');
        const response = await fetch(endpoint, {method:'POST', signal,
          headers:{'Content-Type':'application/json'}, body:JSON.stringify({text:content})});
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || '语音合成失败，请重试。');
        }
        const blob = await response.blob();
        if (!blob.size || !blob.type.startsWith('audio/')) throw new Error('未收到有效音频。');
        objectUrl = URL.createObjectURL(blob);
        source = objectUrl;
      }
      if (signal.aborted) throw aborted();
      await new Promise((resolve, reject) => {
        let settled = false;
        const finish = error => {
          if(settled)return;
          settled = true;
          signal.removeEventListener('abort', onAbort);
          player.onended = player.onerror = player.onplaying = null;
          error ? reject(error) : resolve();
        };
        const onAbort = () => {player.pause();finish(aborted())};
        signal.addEventListener('abort', onAbort, {once:true});
        player.onplaying = () => report('playing', '卢伶俐合成音色');
        player.onended = () => finish();
        player.onerror = () => finish(new Error('语音无法播放，请重试。'));
        player.src = source;
        player.play().catch(error => finish(error));
      });
      report('ended');
    } catch (error) {
      if (active === controller) report(error.name === 'AbortError' ? 'idle' : 'error', error.message);
      throw error;
    } finally {
      clearTimeout(timeout);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (active === controller) active = null;
    }
  }
  async function health() {
    return {ok:!!Object.keys(manifest.clips).length, voice:'S_DjNkK4k02', resource:'seed-icl-2.0',
      cachedClips:Object.keys(manifest.clips).length, endpoint};
  }
  window.TangTTS = {speak, cancel, health, endpoint};
  window.addEventListener('pagehide', cancel);
})();
