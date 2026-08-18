#!/bin/zsh
set -e
PROJECT_DIR="${0:A:h}"
cd "$PROJECT_DIR"
NODE_BIN="/Users/ningchun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
if [[ ! -x "$NODE_BIN" ]]; then
  NODE_BIN="$(command -v node)"
fi
if [[ -z "$NODE_BIN" ]]; then
  echo "未找到 Node.js，请先安装或联系开发人员。"
  read -r "?按回车退出。"
  exit 1
fi
if curl -fsS "http://127.0.0.1:8787/api/health" >/dev/null 2>&1; then
  open "http://127.0.0.1:8787/"
  exit 0
fi

"$NODE_BIN" server/local-voice-server.mjs &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT INT TERM
for _ in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS "http://127.0.0.1:8787/api/health" >/dev/null 2>&1; then
    open "http://127.0.0.1:8787/"
    wait "$SERVER_PID"
    exit $?
  fi
  sleep 0.2
done
echo "本机语音服务启动失败，请查看上方错误信息。"
wait "$SERVER_PID"
