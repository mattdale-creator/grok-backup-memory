#!/bin/bash
export PATH="$HOME/.local/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -f "$ROOT/.demo-server.pid" ]; then
  PID=$(cat "$ROOT/.demo-server.pid")
  kill "$PID" 2>/dev/null || true
  rm -f "$ROOT/.demo-server.pid"
  echo "Stopped process $PID (if it was still running)."
fi

# Also stop anything on port 3000 that looks like next
PIDS=$(lsof -tiTCP:3000 -sTCP:LISTEN 2>/dev/null || true)
if [ -n "$PIDS" ]; then
  echo "Stopping listeners on port 3000: $PIDS"
  kill $PIDS 2>/dev/null || true
fi

echo "Done."
if [ ! -t 0 ]; then
  read -r -p "Press Enter to close..."
fi
