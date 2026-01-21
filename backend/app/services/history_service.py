"""Service for managing OCR history."""

from typing import Optional, Tuple, List
from datetime import datetime

from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import OCRHistory
from app.models.schemas import ProcessingStatus


class HistoryService:
    """Service for OCR history management."""

    async def create_history(
        self,
        db: AsyncSession,
        filename: str,
        file_type: str,
        file_path: Optional[str] = None,
    ) -> OCRHistory:
        """Create a new history entry."""
        history = OCRHistory(
            filename=filename,
            file_type=file_type,
            file_path=file_path,
            status=ProcessingStatus.PENDING.value,
        )
        db.add(history)
        await db.commit()
        await db.refresh(history)
        return history

    async def update_history(
        self,
        db: AsyncSession,
        history_id: str,
        status: ProcessingStatus,
        extracted_text: Optional[str] = None,
        ocr_result_json: Optional[dict] = None,
        markdown_result: Optional[str] = None,
        processing_time: Optional[str] = None,
        page_count: Optional[str] = None,
        error_message: Optional[str] = None,
    ) -> Optional[OCRHistory]:
        """Update an existing history entry."""
        result = await db.execute(
            select(OCRHistory).where(OCRHistory.id == history_id)
        )
        history = result.scalar_one_or_none()

        if not history:
            return None

        history.status = status.value

        if extracted_text is not None:
            history.extracted_text = extracted_text
        if ocr_result_json is not None:
            history.ocr_result_json = ocr_result_json
        if markdown_result is not None:
            history.markdown_result = markdown_result
        if processing_time is not None:
            history.processing_time = processing_time
        if page_count is not None:
            history.page_count = page_count
        if error_message is not None:
            history.error_message = error_message

        await db.commit()
        await db.refresh(history)
        return history

    async def get_history(
        self,
        db: AsyncSession,
        history_id: str,
    ) -> Optional[OCRHistory]:
        """Get a single history entry by ID."""
        result = await db.execute(
            select(OCRHistory).where(OCRHistory.id == history_id)
        )
        return result.scalar_one_or_none()

    async def list_history(
        self,
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
        status: Optional[ProcessingStatus] = None,
    ) -> Tuple[List[OCRHistory], int]:
        """List history entries with pagination."""
        query = select(OCRHistory)

        if status:
            query = query.where(OCRHistory.status == status.value)

        # Get total count
        count_query = select(func.count()).select_from(OCRHistory)
        if status:
            count_query = count_query.where(OCRHistory.status == status.value)
        total_result = await db.execute(count_query)
        total = total_result.scalar()

        # Get paginated results
        query = query.order_by(OCRHistory.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)

        result = await db.execute(query)
        items = result.scalars().all()

        return list(items), total

    async def delete_history(
        self,
        db: AsyncSession,
        history_id: str,
    ) -> bool:
        """Delete a history entry."""
        result = await db.execute(
            delete(OCRHistory).where(OCRHistory.id == history_id)
        )
        await db.commit()
        return result.rowcount > 0

    async def delete_all_history(self, db: AsyncSession) -> int:
        """Delete all history entries."""
        result = await db.execute(delete(OCRHistory))
        await db.commit()
        return result.rowcount


# Singleton instance
history_service = HistoryService()
