import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onUpload: (file: File, mode: 'ocr' | 'structure') => void;
  isLoading: boolean;
}

const ACCEPTED_IMAGE_TYPES = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
};

const ACCEPTED_PDF_TYPES = {
  'application/pdf': ['.pdf'],
};

export function FileUpload({ onUpload, isLoading }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'ocr' | 'structure'>('ocr');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { ...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_PDF_TYPES },
    maxFiles: 1,
    disabled: isLoading,
  });

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile, mode);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
  };

  const isPdf = selectedFile?.type === 'application/pdf';

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {isDragActive ? (
            <p className="text-blue-500 font-medium">Drop the file here...</p>
          ) : (
            <>
              <p className="text-gray-600">
                Drag and drop a file here, or click to select
              </p>
              <p className="text-sm text-gray-400">
                Supports PNG, JPG, WEBP, PDF (max 50MB)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Selected file info */}
      {selectedFile && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {isPdf ? (
                  <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-500"
              disabled={isLoading}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Mode selection */}
      {selectedFile && (
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="mode"
              value="ocr"
              checked={mode === 'ocr'}
              onChange={() => setMode('ocr')}
              className="h-4 w-4 text-blue-600"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-700">Text OCR</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="mode"
              value="structure"
              checked={mode === 'structure'}
              onChange={() => setMode('structure')}
              className="h-4 w-4 text-blue-600"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-700">Structure Analysis</span>
          </label>
        </div>
      )}

      {/* Submit button */}
      {selectedFile && (
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`
            w-full py-2 px-4 rounded-lg font-medium text-white
            transition-colors duration-200
            ${isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            `Process ${mode === 'ocr' ? 'OCR' : 'Structure'}`
          )}
        </button>
      )}
    </div>
  );
}
