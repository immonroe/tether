import { useCallback } from 'react';
import { useLoadingStore } from '@/stores/loading';

export const useLoading = (key: string) => {
  const isLoading = useLoadingStore((state) => state.isLoading(key));
  const setLoading = useLoadingStore((state) => state.setLoading);
  const clearLoading = useLoadingStore((state) => state.clearLoading);

  const startLoading = useCallback(() => {
    setLoading(key, true);
  }, [key, setLoading]);

  const stopLoading = useCallback(() => {
    setLoading(key, false);
  }, [key, setLoading]);

  const clear = useCallback(() => {
    clearLoading(key);
  }, [key, clearLoading]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    clear,
  };
};

export const useAsyncOperation = <T>(
  key: string,
  operation: () => Promise<T>
) => {
  const { isLoading, startLoading, stopLoading } = useLoading(key);

  const execute = useCallback(async (): Promise<T> => {
    try {
      startLoading();
      const result = await operation();
      return result;
    } finally {
      stopLoading();
    }
  }, [key, operation, startLoading, stopLoading]);

  return {
    isLoading,
    execute,
  };
};
