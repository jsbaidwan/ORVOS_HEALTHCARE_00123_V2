import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";
import Api from "../utils/api";
import { handleApiError } from "../utils/errorHandler";

const AdditionalDataContext = createContext();

export const AdditionalDataProvider = ({ children }) => {
  const { user, getToken, logout } = useAuth();

  // ✅ load from localStorage (decoded)
  const [additionalData, setAdditionalData] = useState(() => {
    try {
      const stored = localStorage.getItem("additionalData");
      return stored
        ? JSON.parse(decodeURIComponent(escape(atob(stored))))
        : null;
    } catch (e) {
      return null;
    }
  });

  const fetchAdditionalData = useCallback(async () => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call(`additional-data/?data=${encodeURIComponent(JSON.stringify({ user: user }))}`, "GET", null, true);

      if (response.status === 200) {
        const newData = response.data?.additionalData || response.data || {};

        setAdditionalData(prev => {
          if (!prev) {
            // ✅ encode + store
            localStorage.setItem(
              "additionalData",
              btoa(unescape(encodeURIComponent(JSON.stringify(newData))))
            );
            return newData;
          }

          for (let key in newData) {
            if (prev[key] !== newData[key]) {
              const updated = newData;

              // ✅ encode + store
              localStorage.setItem(
                "additionalData",
                btoa(unescape(encodeURIComponent(JSON.stringify(updated))))
              );

              return updated;
            }
          }

          return prev; // no change
        });

        return newData;
      } else {
        handleApiError(response.error, logout);
      }
    } catch (err) {
      handleApiError(err, logout);
    }
  }, [getToken, logout, user]);

  // ✅ auto fetch on mount
  useEffect(() => {
    fetchAdditionalData();
  }, [fetchAdditionalData]);

  return (
    <AdditionalDataContext.Provider
      value={{ additionalData, fetchAdditionalData, setAdditionalData }}
    >
      {children}
    </AdditionalDataContext.Provider>
  );
};

// ✅ custom hook
export const useAdditionalData = () => {
  const context = useContext(AdditionalDataContext);

  if (!context) {
    throw new Error("useAdditionalData must be used within AdditionalDataProvider");
  }

  return context;
};