"""History API endpoints."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.schemas import (
    HistoryListResponse,
    HistoryDetailResponse,
    HistoryListItem,
    ProcessingStatus,
)
from app.services.history_service import history_service

router = APIRouter(prefix="/api/history", tags=["History"])


@router.get("", response_model=HistoryListResponse)
async def list_history(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[ProcessingStatus] = Query(None, description="Filter by status"),
    db: AsyncSession = Depends(get_db),
):
    """
    List OCR history with pagination.

    - **page**: Page number (default: 1)
    - **page_size**: Items per page (default: 20, max: 100)
    - **status**: Optional filter by processing status
    """
    items, total = await history_service.list_history(
        db, page=page, page_size=page_size, status=status
    )

    return HistoryListResponse(
        items=[
            HistoryListItem(
                id=item.id,
                filename=item.filename,
                file_type=item.file_type,
                created_at=item.created_at,
                status=ProcessingStatus(item.status),
                page_count=item.page_count,
            )
            for item in items
        ],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{history_id}", response_model=HistoryDetailResponse)
async def get_history_detail(
    history_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get detailed history entry by ID."""
    history = await history_service.get_history(db, history_id)

    if not history:
        raise HTTPException(status_code=404, detail="History not found")

    ocr_result = None
    if history.status == ProcessingStatus.COMPLETED.value:
        ocr_result = {
            "text": history.extracted_text or "",
            "blocks": history.ocr_result_json.get("blocks", []) if history.ocr_result_json else [],
            "markdown": history.markdown_result or "",
        }

    return HistoryDetailResponse(
        id=history.id,
        filename=history.filename,
        file_type=history.file_type,
        created_at=history.created_at,
        processing_time=history.processing_time,
        status=ProcessingStatus(history.status),
        page_count=history.page_count,
        ocr_result=ocr_result,
        error_message=history.error_message,
    )


@router.delete("/{history_id}")
async def delete_history(
    history_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a history entry."""
    deleted = await history_service.delete_history(db, history_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="History not found")

    return {"message": "History deleted successfully"}


@router.delete("")
async def delete_all_history(
    db: AsyncSession = Depends(get_db),
):
    """Delete all history entries."""
    count = await history_service.delete_all_history(db)
    return {"message": f"Deleted {count} history entries"}
