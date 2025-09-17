import { create } from 'zustand';

interface LoadingState {
  loadingStates: Record<string, boolean>;
  setLoading: (key: string, isLoading: boolean) => void;
  isLoading: (key: string) => boolean;
  clearLoading: (key: string) => void;
  clearAllLoading: () => void;
  getLoadingKeys: () => string[];
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
  loadingStates: {},
  
  setLoading: (key: string, isLoading: boolean) => {
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [key]: isLoading,
      },
    }));
  },
  
  isLoading: (key: string) => {
    const { loadingStates } = get();
    return Boolean(loadingStates[key]);
  },
  
  clearLoading: (key: string) => {
    set((state) => {
      const newStates = { ...state.loadingStates };
      delete newStates[key];
      return { loadingStates: newStates };
    });
  },
  
  clearAllLoading: () => {
    set({ loadingStates: {} });
  },
  
  getLoadingKeys: () => {
    const { loadingStates } = get();
    return Object.keys(loadingStates).filter(key => loadingStates[key]);
  },
}));
