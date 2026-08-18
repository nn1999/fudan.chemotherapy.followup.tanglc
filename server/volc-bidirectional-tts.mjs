import WebSocket from 'ws';
import { randomUUID } from 'node:crypto';

const EVENT = {
  START_CONNECTION: 1,
  FINISH_CONNECTION: 2,
  CONNECTION_STARTED: 50,
  CONNECTION_FAILED: 51,
  START_SESSION: 100,
  FINISH_SESSION: 102,
  SESSION_STARTED: 150,
  SESSION_FINISHED: 152,
  SESSION_FAILED: 153,
  TASK_REQUEST: 200
};

function i32(value) { const buffer = Buffer.alloc(4); buffer.writeInt32BE(value); return buffer; }
function u32(value) { const buffer = Buffer.alloc(4); buffer.writeUInt32BE(value); return buffer; }

// 与火山官方 TTS Websocket Bidirection protocols 中的 Message.marshal 对齐。
function eventMessage(event, sessionId, payload) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8');
  const parts = [Buffer.from([0x11, 0x14, 0x10, 0x00]), i32(event)];
  if (event !== EVENT.START_CONNECTION && event !== EVENT.FINISH_CONNECTION) {
    const session = Buffer.from(sessionId, 'utf8');
    parts.push(u32(session.length), session);
  }
  parts.push(u32(body.length), body);
  return Buffer.concat(parts);
}

function parseMessage(raw) {
  const buffer = Buffer.from(raw);
  if (buffer.length < 8) throw new Error('豆包语音返回了不完整的协议帧。');
  const type = buffer[1] >> 4;
  const flag = buffer[1] & 0x0f;
  let offset = (buffer[0] & 0x0f) * 4;
  if (offset < 4 || offset > buffer.length) throw new Error('豆包语音返回了无效协议帧。');
  let errorCode = 0;
  if (type === 15) { errorCode = buffer.readUInt32BE(offset); offset += 4; }
  else if ((type === 1 || type === 9 || type === 11 || type === 12) && (flag === 1 || flag === 3)) offset += 4;

  let event = 0;
  let sessionId = '';
  if (flag === 4) {
    event = buffer.readInt32BE(offset); offset += 4;
    const connectionEvent = event === EVENT.CONNECTION_STARTED || event === EVENT.CONNECTION_FAILED || event === 52;
    if (!connectionEvent) {
      const length = buffer.readUInt32BE(offset); offset += 4;
      sessionId = buffer.subarray(offset, offset + length).toString('utf8'); offset += length;
    } else if (offset + 4 <= buffer.length) {
      const length = buffer.readUInt32BE(offset); offset += 4 + length;
    }
  }
  if (offset + 4 > buffer.length) return { type, flag, event, sessionId, errorCode, payload: Buffer.alloc(0) };
  const length = buffer.readUInt32BE(offset); offset += 4;
  return { type, flag, event, sessionId, errorCode, payload: buffer.subarray(offset, offset + length) };
}

function readableError(message) {
  const text = message?.payload?.toString('utf8').trim();
  if (!text) return `豆包语音会话失败${message?.errorCode ? `（${message.errorCode}）` : ''}`;
  try {
    const parsed = JSON.parse(text);
    return parsed?.message || parsed?.header?.message || text;
  } catch { return text; }
}

export function synthesizeBidirectional({ apiKey, appId, accessKey, resourceId, voice, model, sampleRate, speedRatio, text }) {
  if (!apiKey && !accessKey) return Promise.reject(new Error('未配置 VOLC_TTS_API_KEY。'));
  const endpoint = 'wss://openspeech.bytedance.com/api/v3/tts/bidirection';
  const connectId = randomUUID();
  const sessionId = randomUUID();
  const userId = 'tanglichen-ddEC-local-demo';

  return new Promise((resolve, reject) => {
    let settled = false;
    const audio = [];
    const fail = (error) => {
      if (settled) return;
      settled = true;
      try { socket.close(); } catch {}
      reject(error instanceof Error ? error : new Error(String(error)));
    };
    const finish = () => {
      if (settled) return;
      settled = true;
      try { socket.send(eventMessage(EVENT.FINISH_CONNECTION, '', {})); } catch {}
      try { socket.close(); } catch {}
      if (!audio.length) return reject(new Error('豆包语音未返回可播放音频。'));
      resolve(Buffer.concat(audio));
    };
    // 官方 seed-tts-2.0 双向示例使用 API Key；保留旧认证仅作历史兼容。
    // 凭证均只读取本机 .env.local，不会发送至前端。
    const credentials = apiKey ? { 'X-Api-Key': apiKey } : {
      'X-Api-App-Id': appId,
      'X-Api-App-Key': 'aGjiRDfUWi',
      'X-Api-Access-Key': accessKey
    };
    const socket = new WebSocket(endpoint, {
      perMessageDeflate: false,
      handshakeTimeout: 15000,
      headers: {
        ...credentials,
        'X-Api-Resource-Id': resourceId,
        'X-Api-Connect-Id': connectId,
        'X-Control-Require-Usage-Tokens-Return': '*'
      }
    });
    const timer = setTimeout(() => fail(new Error('等待豆包语音响应超时，请稍后重试。')), 45000);
    const safeFinish = () => { clearTimeout(timer); finish(); };
    const safeFail = (error) => { clearTimeout(timer); fail(error); };

    socket.on('open', () => socket.send(eventMessage(EVENT.START_CONNECTION, '', {})));
    socket.on('error', (error) => safeFail(new Error(`豆包语音连接失败：${error.message}`)));
    socket.on('message', (raw) => {
      let message;
      try { message = parseMessage(raw); } catch (error) { return safeFail(error); }
      if (message.type === 15 || message.event === EVENT.CONNECTION_FAILED || message.event === EVENT.SESSION_FAILED) return safeFail(new Error(readableError(message)));
      if (message.event === EVENT.CONNECTION_STARTED) {
        const params = { event: EVENT.START_SESSION, req_params: { speaker: voice, audio_params: { format: 'mp3', sample_rate: sampleRate } } };
        return socket.send(eventMessage(EVENT.START_SESSION, sessionId, params));
      }
      if (message.event === EVENT.SESSION_STARTED) {
        const request = { event: EVENT.TASK_REQUEST, req_params: { text } };
        socket.send(eventMessage(EVENT.TASK_REQUEST, sessionId, request));
        return socket.send(eventMessage(EVENT.FINISH_SESSION, sessionId, {}));
      }
      // 音频帧为 AudioOnlyServer（11）；保留兼容性，将 TTSResponse 的二进制有效载荷也接收。
      if ((message.type === 11 || message.event === 352) && message.payload?.length) audio.push(message.payload);
      if (message.event === EVENT.SESSION_FINISHED) return safeFinish();
    });
  });
}
