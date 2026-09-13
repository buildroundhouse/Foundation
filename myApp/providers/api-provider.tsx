import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  apiRequest,
  checkApiHealth,
  isApiConfigured,
  type ApiConnectionState,
} from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';

type ApiContextValue = {
  configured: boolean;
  connectionState: ApiConnectionState;
  error: string | null;
  refreshConnection: () => Promise<void>;
  request: <T>(path: string, options?: RequestInit) => Promise<T>;
};

const ApiContext = createContext<ApiContextValue | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const [connectionState, setConnectionState] = useState<ApiConnectionState>(
    isApiConfigured ? 'checking' : 'unconfigured',
  );
  const [error, setError] = useState<string | null>(null);

  const refreshConnection = useCallback(async () => {
    if (!isApiConfigured) {
      setConnectionState('unconfigured');
      setError(null);
      return;
    }

    setConnectionState('checking');
    setError(null);

    try {
      await checkApiHealth();
      setConnectionState('ready');
    } catch (nextError) {
      setConnectionState('offline');
      setError(nextError instanceof Error ? nextError.message : 'The API is unavailable.');
    }
  }, []);

  useEffect(() => {
    void refreshConnection();
  }, [refreshConnection]);

  const request = useCallback(async <T,>(path: string, options?: RequestInit) => {
    const token = await getToken();
    return apiRequest<T>(path, { ...options, token });
  }, [getToken]);

  const value = useMemo<ApiContextValue>(() => ({
    configured: isApiConfigured,
    connectionState,
    error,
    refreshConnection,
    request,
  }), [connectionState, error, refreshConnection, request]);

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const value = useContext(ApiContext);
  if (!value) throw new Error('useApi must be used inside ApiProvider');
  return value;
}
