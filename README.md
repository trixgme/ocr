# OCR Web Application

문서 업로드 및 OCR 처리를 위한 웹 애플리케이션

## Features

- **이미지 OCR**: PNG, JPG, WEBP 형식 지원
- **PDF OCR**: 다중 페이지 PDF 문서 처리
- **문서 구조 분석**: 표, 레이아웃 인식
- **히스토리 관리**: OCR 결과 저장 및 조회
- **결과 내보내기**: JSON/Markdown 형식 다운로드

## Tech Stack

| 구분 | 기술 |
|------|------|
| Backend | FastAPI + Python 3.10+ |
| OCR Engine | EasyOCR (한국어/영어) |
| Frontend | React + TypeScript + Vite |
| Database | SQLite |
| Styling | Tailwind CSS |

## Quick Start

### 자동 설치 (macOS)

```bash
# 설치
./setup.sh

# 실행
./start.sh
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Docker 사용

```bash
# 전체 애플리케이션 실행
docker-compose up --build

# 백그라운드 실행
docker-compose up -d --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### 수동 설치

#### 시스템 의존성 (macOS)

```bash
brew install poppler python@3.11 node
```

#### Backend 설정

```bash
cd backend

# 가상환경 생성 및 활성화
python3 -m venv venv
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend 설정

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## API Endpoints

### OCR

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ocr/image` | 이미지 OCR 처리 |
| POST | `/api/ocr/pdf` | PDF OCR 처리 |
| POST | `/api/ocr/structure` | 문서 구조 분석 |
| GET | `/api/ocr/result/{id}` | OCR 결과 조회 |

### History

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | 히스토리 목록 |
| GET | `/api/history/{id}` | 상세 조회 |
| DELETE | `/api/history/{id}` | 삭제 |
| DELETE | `/api/history` | 전체 삭제 |

## Project Structure

```
ocr/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── config.py         # Settings
│   │   ├── models/           # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   ├── routers/          # API endpoints
│   │   └── database/         # SQLite connection
│   ├── uploads/              # Uploaded files
│   ├── outputs/              # OCR results
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API client
│   │   └── types/            # TypeScript types
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Configuration

### Backend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DEBUG` | `true` | Debug mode |
| `DATABASE_URL` | `sqlite+aiosqlite:///./ocr_history.db` | Database URL |
| `OCR_LANG` | `korean` | OCR language |
| `USE_GPU` | `false` | GPU acceleration |

### Supported Languages

PaddleOCR supports 80+ languages. Common options:

- `korean` - Korean
- `en` - English
- `ch` - Chinese
- `japan` - Japanese

## Usage

1. 웹 브라우저에서 http://localhost:3000 접속
2. 드래그앤드롭 또는 클릭으로 파일 업로드
3. OCR 모드 선택 (Text OCR / Structure Analysis)
4. "Process" 버튼 클릭
5. 결과 확인 및 다운로드

## License

MIT
