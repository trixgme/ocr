#!/bin/bash

# OCR Web Application Setup Script
# Supports macOS (Intel/Apple Silicon)

set -e

echo "🚀 OCR Web Application Setup"
echo "============================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check OS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}This script is for macOS only.${NC}"
    echo "For Linux, please use Docker: docker-compose up --build"
    exit 1
fi

# Check Homebrew
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}Installing Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install system dependencies
echo -e "${GREEN}Installing system dependencies...${NC}"
brew install poppler python@3.11 node 2>/dev/null || true

# Backend setup
echo -e "${GREEN}Setting up backend...${NC}"
cd backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install greenlet

cd ..

# Frontend setup
echo -e "${GREEN}Setting up frontend...${NC}"
cd frontend
npm install
cd ..

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "To start the application, run:"
echo "  ./start.sh"
echo ""
echo "Or manually:"
echo "  Terminal 1: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "  Terminal 2: cd frontend && npm run dev"
