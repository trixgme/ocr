"""Application configuration management."""

import os
from pathlib import Path

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # Application
    app_name: str = "PaddleOCR Web Application"
    debug: bool = True

    # File paths
    base_dir: Path = Path(__file__).parent.parent
    upload_dir: Path = base_dir / "uploads"
    output_dir: Path = base_dir / "outputs"

    # Database
    database_url: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./ocr_history.db")

    # OCR settings (PaddleOCR)
    ocr_lang: str = os.getenv("OCR_LANG", "korean")
    use_gpu: bool = False

    # File upload limits
    max_file_size: int = 50 * 1024 * 1024  # 50MB
    allowed_image_types = ["image/png", "image/jpeg", "image/webp"]
    allowed_pdf_types = ["application/pdf"]

    class Config:
        env_file = ".env"


settings = Settings()

# Ensure directories exist
settings.upload_dir.mkdir(parents=True, exist_ok=True)
settings.output_dir.mkdir(parents=True, exist_ok=True)
