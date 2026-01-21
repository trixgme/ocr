// Processing status enum
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

// OCR text block
export interface OCRBlock {
  text: string;
  confidence: number;
  bbox: number[];
  page?: number;
}

// OCR result
export interface OCRResult {
  text: string;
  blocks: OCRBlock[];
  markdown: string | null;
}

// OCR response from API
export interface OCRResultResponse {
  id: string;
  filename: string;
  file_type: string;
  created_at: string;
  processing_time: string | null;
  status: ProcessingStatus;
  ocr_result: OCRResult | null;
  error_message: string | null;
}

// History list item
export interface HistoryListItem {
  id: string;
  filename: string;
  file_type: string;
  created_at: string;
  status: ProcessingStatus;
  page_count: string | null;
}

// History list response
export interface HistoryListResponse {
  items: HistoryListItem[];
  total: number;
  page: number;
  page_size: number;
}

// Structure block
export interface StructureBlock {
  type: string;
  content: string;
  bbox: number[];
  confidence: number;
}

// Structure result
export interface StructureResult {
  blocks: StructureBlock[];
  markdown: string;
  tables: Record<string, unknown>[];
}

// Structure response
export interface StructureResultResponse {
  id: string;
  filename: string;
  created_at: string;
  processing_time: string | null;
  status: ProcessingStatus;
  structure_result: StructureResult | null;
  error_message: string | null;
}
