import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePdfTemplate } from '../../../context/PdfTemplateContext';
import { useRoutePath } from '../../../hooks/useRoutePath';
import { useTitle } from '../../../context/TitleContext';
import { toast } from 'sonner';
import Breadcrumb from '../../Common/Breadcrumb';
import PageLoader from '../../Common/PageLoader';
import { PencilSquareIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const PdfTemplateView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPdfTemplateById } = usePdfTemplate();
  const getRoutePath = useRoutePath();
  const { setPageTitle } = useTitle();

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageTitle('View PDF Template');
  }, [setPageTitle]);

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadTemplate = async () => {
    setLoading(true);
    try {
      const result = await getPdfTemplateById(id, { action: 'view' });

      if (result?.status === 200 && result.pdfTemplate) {
        const pdfBase64 = result.pdfTemplate.pdf;

        const byteCharacters = atob(pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(blob);

        setTemplate({ ...result.pdfTemplate, pdfUrl });
      } else {
        toast.error('Failed to load template');
      }
    } catch (error) {
      toast.error('Failed to load template');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="space-y-4">
      <Breadcrumb />

      <div className={`bg-white text-sm rounded-lg shadow-card overflow-hidden ${loading ? 'animate-pulse opacity-70' : ''}`}>
        {/* Header - Always visible */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                to={getRoutePath('/settings/pdf-templates')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                 {template?.name ? `${template.name} Template` : 'PDF Template'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">View template details and preview.</p>
              </div>
            </div>
            {template && (
              <div className="flex items-center gap-2">
                 
                <button
                  onClick={() => navigate(getRoutePath(`/settings/pdf-templates/${id}/edit`))}
                  className="btn-primary flex items-center space-x-1.5 text-sm"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <PageLoader loading={loading} title="Loading PDF Template..." />

        {/* Content - After loading */}
        {!loading && template && (
          <>
            {/* Details */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Name</span>
                  <span className="mt-1 text-sm font-medium text-gray-900">{template.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Clinic</span>
                  <span className="mt-1 text-sm font-medium text-gray-900">
                    {template.clinic?.name || template.clinic_name || '-'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Category</span>
                  <span className="mt-1 text-sm font-medium text-gray-900">
                    {template.category?.name || template.category_name || '-'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Status</span>
                  <span className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      template.status === 1 || template.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {template.status === 1 || template.status === 'Active' ? 'Active' : 'Inactive'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* PDF Preview */}
            <div className="p-0">
            {!loading && (
              <>
              {template.pdfUrl ? (
                <iframe
                  src={`${template.pdfUrl}#view=FitH`}
                  title={`PDF Preview - ${template.name}`}
                  className="w-full border-0"
                  style={{ height: '60vh' }}
                />
              ) : (
                <div className="flex items-center justify-center py-20 text-gray-400">
                  <p>No preview available</p>
                </div>
              )}
              </>
            )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PdfTemplateView;
