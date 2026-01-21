import { useState } from 'react';
import type { OCRResultResponse, StructureResultResponse } from '../types';

interface OCRResultProps {
  result?: OCRResultResponse | null;
  structureResult?: StructureResultResponse | null;
  onReset: () => void;
}

type ViewMode = 'text' | 'markdown' | 'json';

export function OCRResult({ result, structureResult, onReset }: OCRResultProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('text');

  const activeResult = result || structureResult;

  if (!activeResult) {
    return null;
  }

  const isError = activeResult.status === 'failed';
  const ocrData = result?.ocr_result || structureResult?.structure_result;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadAsFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTextContent = (): string => {
    if (result?.ocr_result) {
      return result.ocr_result.text;
    }
    if (structureResult?.structure_result) {
      return structureResult.structure_result.blocks.map(b => b.content).join('\n\n');
    }
    return '';
  };

  const getMarkdownContent = (): string => {
    return ocrData?.markdown || '';
  };

  const getJsonContent = (): string => {
    return JSON.stringify(ocrData, null, 2);
  };

  const getDisplayContent = (): string => {
    switch (viewMode) {
      case 'text':
        return getTextContent();
      case 'markdown':
        return getMarkdownContent();
      case 'json':
        return getJsonContent();
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {activeResult.filename}
            </h3>
            <p className="text-sm text-gray-500">
              {activeResult.processing_time && `Processed in ${activeResult.processing_time}`}
              {result?.ocr_result?.blocks && ` | ${result.ocr_result.blocks.length} text blocks`}
            </p>
          </div>
          <button
            onClick={onReset}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="p-4 bg-red-50">
          <p className="text-red-600">{activeResult.error_message || 'An error occurred'}</p>
        </div>
      )}

      {/* Content */}
      {!isError && ocrData && (
        <>
          {/* View mode tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {(['text', 'markdown', 'json'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`
                    px-4 py-2 text-sm font-medium border-b-2 transition-colors
                    ${viewMode === mode
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Content area */}
          <div className="p-4">
            <pre className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96 text-sm whitespace-pre-wrap font-mono">
              {getDisplayContent()}
            </pre>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex space-x-3">
            <button
              onClick={() => copyToClipboard(getDisplayContent())}
              className="flex items-center px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy
            </button>
            <button
              onClick={() => downloadAsFile(getDisplayContent(), `${activeResult.filename}.${viewMode === 'json' ? 'json' : 'txt'}`, 'text/plain')}
              className="flex items-center px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        </>
      )}
    </div>
  );
}
