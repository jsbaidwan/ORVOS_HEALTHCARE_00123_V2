import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { usePdfTemplate } from '../../../context/PdfTemplateContext';
import { useAdditionalData } from '../../../context/AdditionalDataContext';
import { useClinic } from '../../../context/ClinicContext';
import { useAuth } from '../../../context/AuthContext';
import { useLoader } from '../../../context/LoaderContext';
import { useRoutePath } from '../../../hooks/useRoutePath';
import { useTitle } from '../../../context/TitleContext';
import { toast } from 'sonner';
import Breadcrumb from '../../Common/Breadcrumb';
import FormField from '../../UI/FormField';
import ErrorHandle from '../../Common/ErrorHandle';
import Modal from '../../Common/Modal';
// eslint-disable-next-line no-unused-vars
import { errorsFormatted } from '../../../utils/errorHandler';

import FroalaEditor from 'react-froala-wysiwyg';
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/js/plugins.pkgd.min.js';
import { getFroalaConfig } from '../../../utils/froalaConfig';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  clinic_id: yup.string().required('Clinic is required'),
  category_id: yup.string().required('Category is required'),
  //status: yup.string().required('Status is required'),
  body: yup.string().required('Body is required'),
});

const PdfTemplateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addPdfTemplate, updatePdfTemplate, getPdfTemplateById, getExistingPdfTemplate, getPdfTempCategory } = usePdfTemplate();
  const { additionalData } = useAdditionalData();
  const { clinics, getClinics } = useClinic();
  const { getToken } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const getRoutePath = useRoutePath();
  const { setPageTitle } = useTitle();
 
  const [showTagsModal, setShowTagsModal] = useState(false);

  const { register, handleSubmit, control, setValue, reset, setError,watch, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      clinic_id: '',
      category_id: '',
      //status: '1',
      body: '',
    },
  });

  const buildDefaults = (t) => {
    if (!t) return { name: '', clinic_id: '', category_id: '', /*status: '1',*/ body: '' };
    const catId = t.pdf_template_category_id || t.category_id || '';
    return {
      name: t.name || '',
      clinic_id: t.clinic_id ? String(t.clinic_id) : '',
      category_id: catId ? String(catId) : '',
      /*status: t.status !== undefined ? String(t.status) : '1',*/
      body: t.body || '',
    };
  };

  useEffect(() => {
    setPageTitle(id ? 'Edit PDF Template' : 'Create PDF Template');
  }, [setPageTitle, id]);

  useEffect(() => {
    if (!id) {
      getClinics().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (id) {
      const existing = getExistingPdfTemplate(id);
      if (existing) {
        reset(buildDefaults(existing));
        const catId = existing.pdf_template_category_id || existing.category_id || '';
        if (catId) fetchCategoryTags(catId, true);
      }
      loadTemplate(!existing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadTemplate = async (showFullLoader = false) => {
    if (showFullLoader) showLoader();
    try {
      const [, templateResult] = await Promise.all([
        getClinics().catch(() => {}),
        getPdfTemplateById(id),
      ]);

      if (templateResult?.status === 200 && templateResult.pdfTemplate) {
        const t = templateResult.pdfTemplate;
        reset(buildDefaults(t));
        const catId = t.pdf_template_category_id || t.category_id || '';
        if (catId) fetchCategoryTags(catId, true);
      }
    } catch (error) {
      toast.error('Failed to load template');
    } finally {
      if (showFullLoader) hideLoader();
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setValue('category_id', value, { shouldValidate: true });
    if (value) {

      fetchCategoryTags(value);
    } else {
      setValue('body', '');
    }
  };

  const handleClinicChange = (e) => {
    const value = e.target.value;
    if (value) {

      fetchCategoryTags(watch('category_id'));
    } else {
      setValue('body', '');
    }
  }

  const fetchCategoryTags = async (categoryId, skipTemplate = false) => {
    try {
      const result = await getPdfTempCategory(categoryId,watch('clinic_id'));
      if (result?.status === 200) {
        const catData = result.data?.pdfTempCategory || result.data || {};
        if (!skipTemplate) {
          const template = catData?.template || '';
          if (template) {
            setValue('body', template);
          }
        }
      }
    } catch (error) {
      // silently fail
    }
  };

  const onSubmit = async (formData) => {
    showLoader();

    const payload = {
      ...formData,
      pdf_template_category_id: formData.category_id,
    };

    try {
      let result;
      if (id) {
        result = await updatePdfTemplate(id, payload);
      } else {
        result = await addPdfTemplate(payload);
      }

      if (result?.status === 200) {
        toast.success(result.message);
        navigate(getRoutePath('/settings/pdf-templates'));
      } else {
        errorsFormatted(result, setError);
      }
    } catch (error) {
      errorsFormatted(error, setError);
    } finally {
      hideLoader();
    }
  };
 
  const froalaConfig = getFroalaConfig(getToken);
  
  const categories = additionalData?.pdfTempCategories || [];

  return (
    <div className="space-y-4">
      <Breadcrumb />

      <div className="bg-white rounded-lg shadow-card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {id ? 'Edit PDF Template' : 'Pdf Template Create'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {id ? 'Update the PDF template details below.' : 'Fill in the details to create a new PDF template.'}
          </p>
        </div>

        <div className="p-6">
          <ErrorHandle errors={errors} />

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <FormField
              label="Name"
              name="name"
              registration={register('name')}
              placeholder="Enter name here"
              required
              error={errors.name?.message}
            />

            <FormField
              label="Clinics"
              name="clinic_id"
              type="select"
              registration={register('clinic_id', {
                onChange: handleClinicChange,
              })}
              options={clinics?.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              required
              error={errors.clinic_id?.message}
            />

            <FormField
              label="Category"
              name="category_id"
              type="select"
              registration={register('category_id', {
                onChange: handleCategoryChange,
              })}
              options={categories?.map((cat) => ({
                value: cat.id,
                label: cat.name,
              }))}
              required
              error={errors.category_id?.message}
            />

            {/* <FormField
              label="Status"
              name="status"
              type="select"
              registration={register('status')}
              options={[
                { value: '1', label: 'Active' },
                { value: '0', label: 'Inactive' },
              ]}
              required
              error={errors.status?.message}
            /> */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Body <span className="text-red-500 ml-1">*</span>
                {' '}
                <span
                  className="text-blue-500 text-sm font-normal cursor-pointer hover:underline"
                  onClick={() => setShowTagsModal(true)}
                >
                  Tags
                </span>
              </label>
              <Controller
                name="body"
                control={control}
                render={({ field }) => (
                  <FroalaEditor
                    tag="textarea"
                    config={froalaConfig}
                    model={field.value}
                    onModelChange={(content) => {
                      const tempDiv = document.createElement('div');
                      tempDiv.innerHTML = content;
                    
                      tempDiv
                        .querySelectorAll('p[data-f-id="pbf"]')
                        .forEach((el) => el.remove());
                    
                      const cleanedContent = tempDiv.innerHTML;
                    
                      if (cleanedContent !== content) {
                        field.onChange(cleanedContent);
                      } else {
                        field.onChange(content);
                      }
                    }}
                  />
                )}
              />
              {errors.body && (
                <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(getRoutePath('/settings/pdf-templates'))}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : id ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tags Modal */}
      <Modal
        isOpen={showTagsModal}
        onClose={() => setShowTagsModal(false)}
        title="Tags"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>NOTE:</strong> You can use the following tags inside your template to make fields dynamic. When the template is rendered, each tag will be automatically replaced with the actual data from your records — such as clinic, patient, doctor, remarks, follow-ups, and more.
            </p>
            <div className="mt-3 text-sm text-gray-600">
              <p className="font-semibold mb-1">Examples:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Writing <code className="text-pink-600">{'{Patient:FirstName}'}</code> will display the patient's first name</li>
                <li>Writing <code className="text-pink-600">{'{Clinic:Name}'}</code> will display the clinic name</li>
                <li>Writing <code className="text-pink-600">{'{Patient:FollowUp}'}</code> will display a colored badge with the patient's follow-up status.</li>
              </ul>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              This allows you to create a single reusable template that works for all modules without editing it manually.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
            {(additionalData?.tempBodyTags || []).map((tag, idx) => {
              const tagValue = typeof tag === 'string' ? tag : tag.tag || tag.name || '';
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 bg-cyan-50 border border-cyan-200 rounded cursor-pointer hover:bg-cyan-100 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(tagValue);
                    toast.success('Tag copied to clipboard');
                  }}
                >
                  <span className="text-sm font-mono text-pink-600">{tagValue}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PdfTemplateForm;
