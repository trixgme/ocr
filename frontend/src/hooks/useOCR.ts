import { useState, useCallback } from 'react';
import { ocrApi } from '../services/api';
import type { OCRResultResponse, StructureResultResponse } from '../types';

interface UseOCRReturn {
  isLoading: boolean;
  error: string | null;
  result: OCRResultResponse | null;
  structureResult: StructureResultResponse | null;
  processImage: (file: File) => Promise<void>;
  processPdf: (file: File) => Promise<void>;
  analyzeStructure: (file: File) => Promise<void>;
  loadFromHistory: (id: string) => Promise<void>;
  reset: () => void;
}

export function useOCR(): UseOCRReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OCRResultResponse | null>(null);
  const [structureResult, setStructureResult] = useState<StructureResultResponse | null>(null);

  const processImage = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setStructureResult(null);

    try {
      const response = await ocrApi.processImage(file);
      setResult(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process image';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processPdf = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setStructureResult(null);

    try {
      const response = await ocrApi.processPdf(file);
      setResult(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process PDF';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeStructure = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setStructureResult(null);

    try {
      const response = await ocrApi.analyzeStructure(file);
      setStructureResult(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze structure';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFromHistory = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setStructureResult(null);

    try {
      const response = await ocrApi.getResult(id);
      setResult(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load history';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
    setStructureResult(null);
  }, []);

  return {
    isLoading,
    error,
    result,
    structureResult,
    processImage,
    processPdf,
    analyzeStructure,
    loadFromHistory,
    reset,
  };
}
