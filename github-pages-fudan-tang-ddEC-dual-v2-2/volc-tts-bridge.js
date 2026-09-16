(() => {
  const manifest = window.TANG_VOICE_MANIFEST || {clips:{}};
  const endpoint = ''; // Release plays only verified, bundled original-voice recordings.
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
    report('idle');
  }
  async function speak(text) {
    cancel();
    const content = String(text || '').trim();
    if (!content) return;
    const controller = new AbortController();
    const {signal} = controller;
    active = controller;
    const timeout = setTimeout(() => controller.abort(), 90000);
    try {
      report('loading', '正在准备语音');
      let source = manifest.clips[content];
      if (manifest.voice !== 'S_DjNkK4k02' || manifest.resource !== 'seed-icl-2.0') throw new Error('原版音色配置不匹配，已停止播放');
      if (!source) throw new Error('这段话的原版音色录音尚未补齐，暂可阅读文字并回答。');
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
      if (active === controller) active = null;
    }
  }
  async function health() {
    return {ok:!!Object.keys(manifest.clips).length, voice:'S_DjNkK4k02', resource:'seed-icl-2.0',
      cachedClips:Object.keys(manifest.clips).length, endpoint};
  }
  window.TangTTS = {speak, cancel, health, endpoint, pause:()=>player.pause(), resume:()=>{if(active&&player.src)player.play().catch(()=>{})}, isPlaying:()=>!!active, setMuted:value=>{player.muted=value}};
  window.addEventListener('pagehide', cancel);
})();
