import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import Api from "../utils/api";
import { handleApiError } from "../utils/errorHandler";

export function useGetAdditionalData() {
  const { getToken, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAdditionalData = useCallback(async () => {
    const api = Api(() => getToken());
    if (!api) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.call("additional-data", "GET", null, true);
      if (response.status === 200) {
       
        const newData = response.data || {};

        // ✅ compare safely using previous state
        setData(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(newData)) {
            return newData;
          }
          return prev;
        });

        return newData;
         
      } else {
        const err = handleApiError(response.error, logout);
        setError(err);
        return err;
      }
    } catch (err) {
      const handled = handleApiError(err, logout);
      setError(handled);
      return handled;
    } finally {
      setLoading(false);
    }
  }, [getToken, logout]);

  return { data, loading, error, fetchAdditionalData };
}
