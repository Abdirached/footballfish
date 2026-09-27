#!/usr/bin/env bash
set -e

# Ensure nvm is loaded (needed if node installed via nvm)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "=== Starting FOOTBALLFISH ==="

# Start backend
cd "$(dirname "$0")/fish-server"
PORT=3001 node bin/www &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID) on http://localhost:3001"

# Start frontend
cd "$(dirname "$0")/fish-client"
node node_modules/.bin/vite --port 5173 --host 0.0.0.0 &
FRONTEND_PID=$!
echo "Frontend starting (PID: $FRONTEND_PID) on http://localhost:5173"

echo ""
echo "  Backend:  http://localhost:3001"
echo "  Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers."
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
