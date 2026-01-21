import { useEffect, useState, useCallback } from 'react';
import { historyApi } from '../services/api';
import type { HistoryListItem, HistoryListResponse, ProcessingStatus } from '../types';

interface HistoryProps {
  onSelect: (id: string) => void;
  refreshTrigger?: number;
}

const STATUS_COLORS: Record<ProcessingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<ProcessingStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

export function History({ onSelect, refreshTrigger }: HistoryProps) {
  const [history, setHistory] = useState<HistoryListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await historyApi.list(page, 10);
      setHistory(data);
    } catch (err) {
      setError('Failed to load history');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshTrigger]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this history item?')) return;

    try {
      await historyApi.delete(id);
      fetchHistory();
    } catch {
      alert('Failed to delete');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Delete all history? This cannot be undone.')) return;

    try {
      await historyApi.deleteAll();
      fetchHistory();
    } catch {
      alert('Failed to delete all history');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPages = history ? Math.ceil(history.total / history.page_size) : 0;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">History</h2>
        {history && history.total > 0 && (
          <button
            onClick={handleDeleteAll}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Delete All
          </button>
        )}
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-200">
        {isLoading && (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        )}

        {error && (
          <div className="p-4 text-center text-red-500">{error}</div>
        )}

        {!isLoading && !error && history?.items.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No OCR history yet</p>
            <p className="text-sm">Upload a file to get started</p>
          </div>
        )}

        {!isLoading && !error && history?.items.map((item: HistoryListItem) => (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.filename}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.file_type.toUpperCase()}
                  </span>
                  {item.page_count && (
                    <span className="text-xs text-gray-500">
                      {item.page_count} pages
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(item.created_at)}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(item.id, e)}
                className="ml-2 text-gray-400 hover:text-red-500"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
