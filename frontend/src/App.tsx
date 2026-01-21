import { useState, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { FileUpload } from './components/FileUpload';
import { OCRResult } from './components/OCRResult';
import { History } from './components/History';
import { useOCR } from './hooks/useOCR';

function App() {
  const {
    isLoading,
    error,
    result,
    structureResult,
    processImage,
    processPdf,
    analyzeStructure,
    loadFromHistory,
    reset,
  } = useOCR();

  const [refreshHistory, setRefreshHistory] = useState(0);

  const handleUpload = useCallback(async (file: File, mode: 'ocr' | 'structure') => {
    try {
      if (mode === 'structure') {
        await analyzeStructure(file);
      } else if (file.type === 'application/pdf') {
        await processPdf(file);
      } else {
        await processImage(file);
      }
      // Refresh history after successful processing
      setRefreshHistory(prev => prev + 1);
      toast.success('OCR processing completed!');
    } catch {
      toast.error('OCR processing failed');
    }
  }, [processImage, processPdf, analyzeStructure]);

  const handleHistorySelect = useCallback(async (id: string) => {
    await loadFromHistory(id);
  }, [loadFromHistory]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  // Show error toast
  if (error) {
    toast.error(error);
  }

  const hasResult = result || structureResult;

  return (
    <Layout>
      <Toaster position="top-right" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Upload Document
            </h2>
            <FileUpload onUpload={handleUpload} isLoading={isLoading} />
          </div>

          {/* Result section */}
          {hasResult && (
            <OCRResult
              result={result}
              structureResult={structureResult}
              onReset={handleReset}
            />
          )}

          {/* Error display */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Processing Error
                  </h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - History */}
        <div className="lg:col-span-1">
          <History
            onSelect={handleHistorySelect}
            refreshTrigger={refreshHistory}
          />
        </div>
      </div>
    </Layout>
  );
}

export default App;
