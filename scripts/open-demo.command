#!/bin/bash
# Double-click this file (or run it in Terminal) to start the local demo.
set -e
export PATH="$HOME/.local/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT=3000
URL="http://localhost:${PORT}/demo"

echo "=========================================="
echo "  Grok Backup Memory — local demo"
echo "=========================================="
echo "Project folder: $ROOT"
echo ""

# Already running?
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PORT}/" 2>/dev/null | grep -q "200"; then
  echo "Server is already running on port ${PORT}."
else
  echo "Installing dependencies if needed (first time can take a minute)..."
  npm install
  echo "Starting web server..."
  # Start in background; logs to .demo-server.log
  nohup npm run dev > "$ROOT/.demo-server.log" 2>&1 &
  echo $! > "$ROOT/.demo-server.pid"
  echo "Waiting for server..."
  for i in $(seq 1 60); do
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PORT}/" 2>/dev/null | grep -q "200"; then
      break
    fi
    sleep 1
  done
fi

if curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PORT}/" 2>/dev/null | grep -q "200"; then
  echo "Opening browser: $URL"
  open "$URL" 2>/dev/null || open -a "Safari" "$URL" 2>/dev/null || true
  echo ""
  echo "Demo hub:     $URL"
  echo "Import demo:  http://localhost:${PORT}/import"
  echo "iOS preview:  http://localhost:${PORT}/demo/ios"
  echo "Android:      http://localhost:${PORT}/demo/android"
  echo ""
  echo "Leave this window open if you just started the server."
  echo "To stop later:  ./scripts/stop-demo.command"
else
  echo "ERROR: Server did not become ready. Check .demo-server.log"
  echo "Or open Terminal and run:"
  echo "  cd \"$ROOT\" && npm install && npm run dev"
  exit 1
fi

# Keep window open when double-clicked
if [ -t 0 ]; then
  :
else
  echo ""
  read -r -p "Press Enter to close this window..."
fi
