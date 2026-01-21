#!/bin/bash

# OCR Web Application Start Script

set -e

echo "🚀 Starting OCR Web Application..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if setup was run
if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}Setup not complete. Running setup first...${NC}"
    ./setup.sh
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Frontend dependencies not installed. Running setup...${NC}"
    cd frontend && npm install && cd ..
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${GREEN}Starting backend server...${NC}"
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo -e "${GREEN}Starting frontend server...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Application started!${NC}"
echo ""
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for processes
wait
