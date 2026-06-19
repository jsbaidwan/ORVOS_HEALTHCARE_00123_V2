import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePdfTemplate } from '../../../context/PdfTemplateContext';
import { useLoader } from '../../../context/LoaderContext';
import { useRoutePath } from '../../../hooks/useRoutePath';
import { useTitle } from '../../../context/TitleContext';
import { toast } from 'sonner';
import Breadcrumb from '../../Common/Breadcrumb';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

const PdfTemplateView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPdfTemplateById } = usePdfTemplate();
  const { showLoader, hideLoader } = useLoader();
  const getRoutePath = useRoutePath();
  const { setPageTitle } = useTitle();

  const [template, setTemplate] = useState(null);

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
    showLoader();
    try {
      const result = await getPdfTemplateById(id);
      if (result?.status === 200 && result.pdfTemplate) {
        setTemplate(result.pdfTemplate);
      } else {
        toast.error('Failed to load template');
        navigate(getRoutePath('/settings/pdf-templates'));
      }
    } catch (error) {
      toast.error('Failed to load template');
      navigate(getRoutePath('/settings/pdf-templates'));
    } finally {
      hideLoader();
    }
  };

  if (!template) return null;

  return (
    <div className="space-y-4">
      <Breadcrumb />

      <div className="bg-white rounded-lg shadow-card">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{template.name}</h2>
            <p className="text-sm text-gray-500 mt-1">PDF Template Details</p>
          </div>
          <button
            onClick={() => navigate(getRoutePath(`/settings/pdf-templates/${id}/edit`))}
            className="btn-primary flex items-center space-x-1 text-sm"
          >
            <PencilSquareIcon className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Name</label>
              <p className="text-gray-900">{template.name}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Clinic</label>
              <p className="text-gray-900">{template.clinic?.name || template.clinic_name || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Category</label>
              <p className="text-gray-900">{template.category?.name || template.category_name || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Status</label>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                template.status === 1 || template.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {template.status === 1 || template.status === 'Active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">Body</label>
            <div
              className="border border-gray-200 rounded-lg p-4 prose max-w-none"
              dangerouslySetInnerHTML={{ __html: template.body || '<p>No content</p>' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfTemplateView;
