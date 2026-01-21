"""Database models for OCR history."""

import uuid
from datetime import datetime
from typing import Optional, Dict, Any

from sqlalchemy import Column, String, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class OCRHistory(Base):
    """Model for storing OCR processing history."""

    __tablename__ = "ocr_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # image, pdf
    file_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    processing_time = Column(String(50), nullable=True)

    # OCR Results
    extracted_text = Column(Text, nullable=True)
    ocr_result_json = Column(JSON, nullable=True)
    markdown_result = Column(Text, nullable=True)

    # Metadata
    page_count = Column(String(10), nullable=True)
    status = Column(String(20), default="pending")  # pending, processing, completed, failed
    error_message = Column(Text, nullable=True)

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "filename": self.filename,
            "file_type": self.file_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "processing_time": self.processing_time,
            "status": self.status,
            "page_count": self.page_count,
            "ocr_result": {
                "text": self.extracted_text,
                "blocks": self.ocr_result_json.get("blocks", []) if self.ocr_result_json else [],
                "markdown": self.markdown_result,
            },
            "error_message": self.error_message,
        }
