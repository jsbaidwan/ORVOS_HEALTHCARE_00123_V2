import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import Api from '../utils/api';
import { handleApiError } from '../utils/errorHandler';

const PdfTemplateContext = createContext();

export const usePdfTemplate = () => {
  const context = useContext(PdfTemplateContext);
  if (!context) {
    throw new Error('usePdfTemplate must be used within a PdfTemplateProvider');
  }
  return context;
};

export const PdfTemplateProvider = ({ children }) => {
  const { getToken, logout } = useAuth();
  const [pdfTemplates, setPdfTemplates] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
  });

  const getPdfTemplates = useCallback(async (page = 1, filters = {}, paginate = true) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const data = { paginate, page, ...filters };
      const endpoint = 'pdf-templates?data=' + encodeURIComponent(JSON.stringify(data));
      const response = await api.call(endpoint, 'GET', null, true);

      if (response.status === 200) {
        const responseData = response.data.pdfTemplates || response.data.pdf_templates || response.data;

        if (typeof responseData === 'object' && responseData.data && Array.isArray(responseData.data)) {
          setPdfTemplates(responseData.data);
          setPagination({
            currentPage: responseData.current_page || 1,
            lastPage: responseData.last_page || 1,
            perPage: responseData.per_page || 10,
            total: responseData.total || 0,
          });
          return responseData;
        } else if (Array.isArray(responseData)) {
          setPdfTemplates(responseData);
          setPagination({
            currentPage: 1,
            lastPage: 1,
            perPage: responseData.length,
            total: responseData.length,
          });
          return responseData;
        }
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  }, [getToken, logout]);

  const getPdfTemplateById = useCallback(async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call(`pdf-templates/${id}/edit`, 'GET', null, true);

      if (response.status === 200) {
        return { status: 200, pdfTemplate: response.data.pdfTemplate || response.data.pdf_template || response.data };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  }, [getToken, logout]);

  const addPdfTemplate = async (templateData) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call('pdf-templates', 'POST', templateData, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'PDF Template created successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const updatePdfTemplate = async (id, templateData) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call(`pdf-templates/${id}`, 'PUT', templateData, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'PDF Template updated successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const deletePdfTemplate = async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call(`pdf-templates/${id}`, 'DELETE', null, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'PDF Template deleted successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const archivePdfTemplate = async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call('archive', 'POST', { module: 'pdfTemplate', id }, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'PDF Template archived successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const unarchivePdfTemplate = async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call('unarchive', 'POST', { module: 'pdfTemplate', id }, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'PDF Template unarchived successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const getPdfTempCategory = async (categoryId,clinic_id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call('get-pdf-temp-category', 'POST', { pdf_temp_cat_id: categoryId,clinic_id:clinic_id }, true);

      if (response.status === 200) {
        return { status: 200, data: response.data };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const getExistingPdfTemplate = (id) => {
    return pdfTemplates.find(t => t.id === Number(id)) || null;
  };

  const value = {
    pdfTemplates,
    setPdfTemplates,
    pagination,
    getPdfTemplates,
    getPdfTemplateById,
    getExistingPdfTemplate,
    addPdfTemplate,
    updatePdfTemplate,
    deletePdfTemplate,
    archivePdfTemplate,
    unarchivePdfTemplate,
    getPdfTempCategory,
  };

  return (
    <PdfTemplateContext.Provider value={value}>
      {children}
    </PdfTemplateContext.Provider>
  );
};
