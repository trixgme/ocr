"""Pydantic schemas for API request/response validation."""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any

from pydantic import BaseModel, Field


class ProcessingStatus(str, Enum):
    """OCR processing status."""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class OCRBlock(BaseModel):
    """Individual OCR text block."""

    text: str
    confidence: float = Field(ge=0.0, le=1.0)
    bbox: List[float] = Field(description="Bounding box [x1, y1, x2, y2]")


class OCRResult(BaseModel):
    """OCR result data."""

    text: str = Field(description="Full extracted text")
    blocks: List[OCRBlock] = Field(default_factory=list)
    markdown: Optional[str] = Field(default=None, description="Markdown formatted result")


class OCRResultResponse(BaseModel):
    """Response for OCR processing."""

    id: str
    filename: str
    file_type: str
    created_at: datetime
    processing_time: Optional[str] = None
    status: ProcessingStatus
    ocr_result: Optional[OCRResult] = None
    error_message: Optional[str] = None

    class Config:
        orm_mode = True


class HistoryListItem(BaseModel):
    """Item in history list."""

    id: str
    filename: str
    file_type: str
    created_at: datetime
    status: ProcessingStatus
    page_count: Optional[str] = None


class HistoryListResponse(BaseModel):
    """Response for history list."""

    items: List[HistoryListItem]
    total: int
    page: int = 1
    page_size: int = 20


class HistoryDetailResponse(BaseModel):
    """Detailed history item response."""

    id: str
    filename: str
    file_type: str
    created_at: datetime
    processing_time: Optional[str] = None
    status: ProcessingStatus
    page_count: Optional[str] = None
    ocr_result: Optional[OCRResult] = None
    error_message: Optional[str] = None

    class Config:
        orm_mode = True


class StructureBlock(BaseModel):
    """Document structure block."""

    type: str = Field(description="Block type: text, table, figure, title, etc.")
    content: str
    bbox: List[float]
    confidence: float


class StructureResult(BaseModel):
    """Document structure analysis result."""

    blocks: List[StructureBlock]
    markdown: str
    tables: List[Dict[str, Any]] = Field(default_factory=list, description="Extracted tables")


class StructureResultResponse(BaseModel):
    """Response for structure analysis."""

    id: str
    filename: str
    created_at: datetime
    processing_time: Optional[str] = None
    status: ProcessingStatus
    structure_result: Optional[StructureResult] = None
    error_message: Optional[str] = None
