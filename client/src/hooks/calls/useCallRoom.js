import { useCallback, useEffect, useState } from 'react';
import { callsApi } from '../../api/callsApi';

export function useCallRoom({ enabled = true } = {}) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCalls = useCallback(async () => {
    if (!enabled) {
      setCalls([]);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const data = await callsApi.getMyCalls();
      setCalls(data);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const createCall = useCallback(
    async (payload) => {
      const call = await callsApi.createCall(payload);
      await loadCalls();
      return call;
    },
    [loadCalls]
  );

  useEffect(() => {
    if (enabled) {
      loadCalls().catch(() => {});
    }
  }, [enabled, loadCalls]);

  return {
    calls,
    loading,
    error,
    loadCalls,
    createCall,
  };
}
