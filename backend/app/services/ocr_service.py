"""PaddleOCR service for text recognition and document structure analysis."""

import time
from pathlib import Path
from typing import Optional, List, Dict, Any

from paddleocr import PaddleOCR

from app.config import settings


class OCRService:
    """Service for OCR processing using PaddleOCR."""

    def __init__(self):
        self._ocr: Optional[PaddleOCR] = None

    @property
    def ocr(self) -> PaddleOCR:
        """Lazy initialization of PaddleOCR."""
        if self._ocr is None:
            self._ocr = PaddleOCR(
                lang=settings.ocr_lang,
                use_angle_cls=True,
                use_gpu=settings.use_gpu,
                show_log=settings.debug,
            )
        return self._ocr

    async def process_image(self, file_path) -> Dict[str, Any]:
        """
        Process an image file with OCR.
        """
        start_time = time.time()
        file_path = Path(file_path)

        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        # Run OCR
        result = self.ocr.ocr(str(file_path), cls=True)

        # Format results
        formatted_result = self._format_ocr_result(result)
        formatted_result["processing_time"] = f"{time.time() - start_time:.2f}s"

        return formatted_result

    async def process_pdf(self, file_path) -> Dict[str, Any]:
        """
        Process a PDF file with OCR.
        """
        from pdf2image import convert_from_path
        import tempfile

        start_time = time.time()
        file_path = Path(file_path)

        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        # Convert PDF to images
        images = convert_from_path(str(file_path))
        all_blocks = []
        all_text = []

        with tempfile.TemporaryDirectory() as temp_dir:
            for page_num, image in enumerate(images, 1):
                # Save page as image
                temp_image_path = Path(temp_dir) / f"page_{page_num}.png"
                image.save(str(temp_image_path), "PNG")

                # Run OCR on page
                result = self.ocr.ocr(str(temp_image_path), cls=True)
                page_result = self._format_ocr_result(result)

                # Add page number to blocks
                for block in page_result["blocks"]:
                    block["page"] = page_num

                all_blocks.extend(page_result["blocks"])
                all_text.append(f"--- Page {page_num} ---\n{page_result['text']}")

        return {
            "text": "\n\n".join(all_text),
            "blocks": all_blocks,
            "page_count": len(images),
            "markdown": self._convert_to_markdown(all_text),
            "processing_time": f"{time.time() - start_time:.2f}s",
        }

    async def process_structure(self, file_path) -> Dict[str, Any]:
        """
        Analyze document structure.
        """
        from pdf2image import convert_from_path
        import tempfile

        start_time = time.time()
        file_path = Path(file_path)

        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        # Check if PDF
        is_pdf = file_path.suffix.lower() == '.pdf'

        all_blocks = []

        if is_pdf:
            images = convert_from_path(str(file_path))

            with tempfile.TemporaryDirectory() as temp_dir:
                for page_num, image in enumerate(images, 1):
                    temp_image_path = Path(temp_dir) / f"page_{page_num}.png"
                    image.save(str(temp_image_path), "PNG")

                    result = self.ocr.ocr(str(temp_image_path), cls=True)
                    formatted = self._format_ocr_result(result)
                    page_blocks = self._detect_structure(formatted["blocks"])

                    for block in page_blocks:
                        block["page"] = page_num

                    all_blocks.extend(page_blocks)
        else:
            result = self.ocr.ocr(str(file_path), cls=True)
            formatted = self._format_ocr_result(result)
            all_blocks = self._detect_structure(formatted["blocks"])

        return {
            "blocks": all_blocks,
            "markdown": self._convert_blocks_to_markdown(all_blocks),
            "tables": self._extract_tables(all_blocks),
            "processing_time": f"{time.time() - start_time:.2f}s",
        }

    def _format_ocr_result(self, result: list) -> Dict[str, Any]:
        """Format PaddleOCR result into standardized structure."""
        blocks = []
        texts = []

        if result and result[0]:
            for line in result[0]:
                bbox = line[0]
                text_info = line[1]

                x_coords = [float(point[0]) for point in bbox]
                y_coords = [float(point[1]) for point in bbox]

                block = {
                    "text": text_info[0],
                    "confidence": round(float(text_info[1]), 4),
                    "bbox": [
                        float(min(x_coords)),
                        float(min(y_coords)),
                        float(max(x_coords)),
                        float(max(y_coords)),
                    ],
                }
                blocks.append(block)
                texts.append(text_info[0])

        return {
            "text": "\n".join(texts),
            "blocks": blocks,
            "markdown": self._convert_to_markdown(texts),
        }

    def _convert_to_markdown(self, texts: List[str]) -> str:
        """Convert text list to basic markdown format."""
        if not texts:
            return ""

        markdown_lines = []
        for text in texts:
            if isinstance(text, str):
                stripped = text.strip()
                if stripped:
                    markdown_lines.append(stripped)

        return "\n\n".join(markdown_lines)

    def _detect_structure(self, blocks: List[Dict]) -> List[Dict]:
        """Detect document structure from OCR blocks."""
        structure_blocks = []

        for block in blocks:
            text = block["text"].strip()
            block_type = "text"

            if len(text) < 50 and (text.isupper() or (text and text[0].isdigit())):
                block_type = "title"

            structure_blocks.append({
                "type": block_type,
                "content": text,
                "bbox": block["bbox"],
                "confidence": block["confidence"],
            })

        return structure_blocks

    def _convert_blocks_to_markdown(self, blocks: List[Dict]) -> str:
        """Convert structure blocks to markdown."""
        markdown_parts = []

        for block in blocks:
            if block["type"] == "title":
                markdown_parts.append(f"## {block['content']}")
            else:
                markdown_parts.append(block["content"])

        return "\n\n".join(markdown_parts)

    def _extract_tables(self, blocks: List[Dict]) -> List[Dict]:
        """Extract tables from structure blocks."""
        return []


# Singleton instance
ocr_service = OCRService()
