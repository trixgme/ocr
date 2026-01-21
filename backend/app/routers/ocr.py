"""OCR API endpoints."""

import shutil
from pathlib import Path
from typing import Optional, List
import uuid

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.schemas import OCRResultResponse, ProcessingStatus, StructureResultResponse
from app.services.ocr_service import ocr_service
from app.services.history_service import history_service

router = APIRouter(prefix="/api/ocr", tags=["OCR"])


def validate_file_type(file: UploadFile, allowed_types: List[str]) -> None:
    """Validate uploaded file type."""
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file.content_type} not allowed. Allowed types: {allowed_types}",
        )


async def save_upload_file(file: UploadFile) -> Path:
    """Save uploaded file to disk."""
    file_ext = Path(file.filename).suffix
    file_id = str(uuid.uuid4())
    file_path = settings.upload_dir / f"{file_id}{file_ext}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path


async def process_ocr_task(
    history_id: str,
    file_path: Path,
    file_type: str,
    db: AsyncSession,
):
    """Background task for OCR processing."""
    try:
        # Update status to processing
        await history_service.update_history(
            db, history_id, ProcessingStatus.PROCESSING
        )

        # Process based on file type
        if file_type == "pdf":
            result = await ocr_service.process_pdf(file_path)
            page_count = str(result.get("page_count", 1))
        else:
            result = await ocr_service.process_image(file_path)
            page_count = "1"

        # Update history with results
        await history_service.update_history(
            db,
            history_id,
            status=ProcessingStatus.COMPLETED,
            extracted_text=result.get("text", ""),
            ocr_result_json={"blocks": result.get("blocks", [])},
            markdown_result=result.get("markdown", ""),
            processing_time=result.get("processing_time"),
            page_count=page_count,
        )

    except Exception as e:
        await history_service.update_history(
            db,
            history_id,
            status=ProcessingStatus.FAILED,
            error_message=str(e),
        )


@router.post("/image", response_model=OCRResultResponse)
async def process_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Process an image file with OCR.

    Supports PNG, JPG, WEBP formats.
    """
    validate_file_type(file, settings.allowed_image_types)

    # Save file
    file_path = await save_upload_file(file)

    # Create history entry
    history = await history_service.create_history(
        db,
        filename=file.filename,
        file_type="image",
        file_path=str(file_path),
    )

    # Process OCR synchronously for now (can be made async with background task)
    try:
        result = await ocr_service.process_image(file_path)

        # Update history
        history = await history_service.update_history(
            db,
            history.id,
            status=ProcessingStatus.COMPLETED,
            extracted_text=result.get("text", ""),
            ocr_result_json={"blocks": result.get("blocks", [])},
            markdown_result=result.get("markdown", ""),
            processing_time=result.get("processing_time"),
            page_count="1",
        )

        return OCRResultResponse(
            id=history.id,
            filename=history.filename,
            file_type=history.file_type,
            created_at=history.created_at,
            processing_time=history.processing_time,
            status=ProcessingStatus.COMPLETED,
            ocr_result={
                "text": history.extracted_text,
                "blocks": history.ocr_result_json.get("blocks", []) if history.ocr_result_json else [],
                "markdown": history.markdown_result,
            },
        )

    except Exception as e:
        await history_service.update_history(
            db,
            history.id,
            status=ProcessingStatus.FAILED,
            error_message=str(e),
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pdf", response_model=OCRResultResponse)
async def process_pdf(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Process a PDF file with OCR.

    Extracts text from all pages.
    """
    validate_file_type(file, settings.allowed_pdf_types)

    # Save file
    file_path = await save_upload_file(file)

    # Create history entry
    history = await history_service.create_history(
        db,
        filename=file.filename,
        file_type="pdf",
        file_path=str(file_path),
    )

    try:
        result = await ocr_service.process_pdf(file_path)

        # Update history
        history = await history_service.update_history(
            db,
            history.id,
            status=ProcessingStatus.COMPLETED,
            extracted_text=result.get("text", ""),
            ocr_result_json={"blocks": result.get("blocks", [])},
            markdown_result=result.get("markdown", ""),
            processing_time=result.get("processing_time"),
            page_count=str(result.get("page_count", 1)),
        )

        return OCRResultResponse(
            id=history.id,
            filename=history.filename,
            file_type=history.file_type,
            created_at=history.created_at,
            processing_time=history.processing_time,
            status=ProcessingStatus.COMPLETED,
            ocr_result={
                "text": history.extracted_text,
                "blocks": history.ocr_result_json.get("blocks", []) if history.ocr_result_json else [],
                "markdown": history.markdown_result,
            },
        )

    except Exception as e:
        await history_service.update_history(
            db,
            history.id,
            status=ProcessingStatus.FAILED,
            error_message=str(e),
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/structure", response_model=StructureResultResponse)
async def analyze_structure(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Analyze document structure (tables, layout, etc.).

    Supports image and PDF files.
    """
    allowed_types = settings.allowed_image_types + settings.allowed_pdf_types
    validate_file_type(file, allowed_types)

    # Save file
    file_path = await save_upload_file(file)

    # Create history entry
    file_type = "pdf" if file.content_type in settings.allowed_pdf_types else "image"
    history = await history_service.create_history(
        db,
        filename=file.filename,
        file_type=file_type,
        file_path=str(file_path),
    )

    try:
        result = await ocr_service.process_structure(file_path)

        return StructureResultResponse(
            id=history.id,
            filename=history.filename,
            created_at=history.created_at,
            processing_time=result.get("processing_time"),
            status=ProcessingStatus.COMPLETED,
            structure_result={
                "blocks": result.get("blocks", []),
                "markdown": result.get("markdown", ""),
                "tables": result.get("tables", []),
            },
        )

    except Exception as e:
        await history_service.update_history(
            db,
            history.id,
            status=ProcessingStatus.FAILED,
            error_message=str(e),
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/result/{history_id}", response_model=OCRResultResponse)
async def get_ocr_result(
    history_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get OCR result by history ID."""
    history = await history_service.get_history(db, history_id)

    if not history:
        raise HTTPException(status_code=404, detail="History not found")

    return OCRResultResponse(
        id=history.id,
        filename=history.filename,
        file_type=history.file_type,
        created_at=history.created_at,
        processing_time=history.processing_time,
        status=ProcessingStatus(history.status),
        ocr_result={
            "text": history.extracted_text or "",
            "blocks": history.ocr_result_json.get("blocks", []) if history.ocr_result_json else [],
            "markdown": history.markdown_result or "",
        } if history.status == ProcessingStatus.COMPLETED.value else None,
        error_message=history.error_message,
    )
