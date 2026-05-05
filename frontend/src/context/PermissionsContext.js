import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import Api from '../utils/api';
import { handleApiError } from '../utils/errorHandler';
import { useLocation } from 'react-router-dom';

const PermissionsContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

export const PermissionsProvider = ({ children }) => {
  const { getToken, logout, user } = useAuth();
  const location = useLocation();
  const [permissions, setPermissions] = useState(() => {
    try {
      const saved = localStorage.getItem('permissions');
      if (!saved) return [];
      // Decode safely
      const decoded = decodeURIComponent(escape(atob(saved)));
      return JSON.parse(decoded);
    } catch (e) {
      // If decoding fails (old plain JSON or corrupted)
      try {
        // Try plain JSON fallback
        return JSON.parse(localStorage.getItem('permissions') || '[]');
      } catch {
        return [];
      }
    }
  });
  const permissionRef = useRef(null);

  // Fetch permissions once on load
  const fetchPermissions = useCallback(async () => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call('get-permissions', 'GET', null, true);

      if (response.status === 200) {
        const newPermissions = response.data.permissions || [];

        // ✅ Only update if new data is different
        setPermissions(prev => {
          const same = JSON.stringify(prev) === JSON.stringify(newPermissions);

          if (!same) {
            localStorage.setItem(
              'permissions',
              btoa(unescape(encodeURIComponent(JSON.stringify(newPermissions))))
            );
            return newPermissions;
          }
          return prev;
        });
      } else {
        handleApiError(response.error, logout);
      }
    } catch (err) {
      handleApiError(err, logout);
    }
  }, [getToken, logout]);


  useEffect(() => {
    if (user && permissionRef.current !== location.pathname) {
      fetchPermissions();
      permissionRef.current = location.pathname;
    }
  }, [fetchPermissions, user, location]);



  // ✅ Helper function to check permission
  const permission = useCallback(
    (module_id, field) => {
      if (module_id === true) {
        return true;
      }

      const record = permissions.find(p => p.module_id === module_id);
      return record ? !!record[field] : false;
    },
    [permissions]
  );

  const value = {
    permissions,
    permission,
    reloadPermissions: fetchPermissions, // Optional manual refresh
  };

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
};
