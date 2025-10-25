import { useState, useCallback } from 'react';

interface UseLoadingReturn {
  loading: boolean;
  error: string | null;
  startLoading: () => void;
  stopLoading: () => void;
  setError: (error: string | null) => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

/**
 * Custom Loading State Hook
 * Loading, error ve success state'lerini yönetir
 * 
 * @example
 * const { loading, error, withLoading } = useLoading();
 * 
 * const fetchData = async () => {
 *   await withLoading(api.get('/data'));
 * };
 */
export function useLoading(initialLoading = false): UseLoadingReturn {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const startLoading = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const handleError = useCallback((err: string | null) => {
    setError(err);
    setLoading(false);
  }, []);

  /**
   * Promise'i loading state ile wrap eder
   * Otomatik olarak loading başlatır, bittiğinde durdurur
   * Hata durumunda error state'ini günceller
   */
  const withLoading = useCallback(async <T,>(promise: Promise<T>): Promise<T> => {
    try {
      startLoading();
      const result = await promise;
      stopLoading();
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Bir hata oluştu';
      handleError(errorMessage);
      throw err;
    }
  }, [startLoading, stopLoading, handleError]);

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setError: handleError,
    withLoading,
  };
}

/**
 * Multiple Loading States Hook
 * Birden fazla loading state'ini yönetir
 * 
 * @example
 * const { loadingStates, setLoadingState } = useMultipleLoading(['fetch', 'submit', 'delete']);
 * 
 * setLoadingState('fetch', true);
 * if (loadingStates.fetch) { ... }
 */
export function useMultipleLoading<T extends string>(
  keys: T[]
): {
  loadingStates: Record<T, boolean>;
  setLoadingState: (key: T, value: boolean) => void;
  isAnyLoading: boolean;
} {
  const initialState = keys.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as Record<T, boolean>);

  const [loadingStates, setLoadingStates] = useState<Record<T, boolean>>(initialState);

  const setLoadingState = useCallback((key: T, value: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const isAnyLoading = Object.values(loadingStates).some((loading) => loading);

  return {
    loadingStates,
    setLoadingState,
    isAnyLoading,
  };
}
