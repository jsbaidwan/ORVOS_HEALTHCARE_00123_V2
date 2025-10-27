import React, { useEffect, useRef,useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useClinicGroup } from '../../context/ClinicGroupContext';
import { errorsFormatted } from '../../utils/errorHandler';
import { useLoader } from '../../context/LoaderContext';
import { toast } from 'sonner';
import { useRoutePath } from '../../hooks/useRoutePath';
import { useNavigate } from 'react-router-dom';
// Validation schema
const clinicGroupSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .trim(),
  description: yup
    .string()
    .required('Description is required')
    .trim(),
  active: yup.boolean(),
});

const ClinicGroupForm = ({ clinicGroup, onClose }) => {
  const { addClinicGroup, updateClinicGroup, getClinicGroupById } = useClinicGroup();
  const { showLoader, hideLoader } = useLoader();
  const getRoutePath = useRoutePath();
  const loadDefaultsRef = useRef(true);
  const navigate = useNavigate();
  const getDefaultValues = useCallback(async (id) => {
    if(!id){
      return {};
    }
    const data = await getClinicGroupById(id);
    return {
      name: data?.name || '',
      description: data?.description || '',
      active: data?.active === 1,
    };
  }, [getClinicGroupById]);  
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError
  } = useForm({
    resolver: yupResolver(clinicGroupSchema),
    defaultValues: {}, // temporary
  });
  
  useEffect(() => {
    const loadDefaults = async () => {
      const data = await getDefaultValues(clinicGroup?.id);
      reset(data);
    };
    if(loadDefaultsRef.current === true){
      loadDefaults();
      loadDefaultsRef.current = false;
    }

  }, [clinicGroup?.id, reset,getDefaultValues]);
  
  const onSubmit = async (data) => {
    const clinicGroupData = {
      name: data.name.trim(),
      description: data.description.trim(),
      active: data.active ? 1 : 0,
    };

    showLoader();
    try {
      const result = clinicGroup && clinicGroup.id
        ? await updateClinicGroup(clinicGroup.id, clinicGroupData)
        : await addClinicGroup(clinicGroupData);

      if (result && (result.status === 200 || result.success)) {
        
        onClose();
        toast.success(result?.message);
        
        navigate(getRoutePath('/clinic-groups'));
      } else {
        // Handle error
        errorsFormatted(result,setError) 
      }
    }catch(error){
      errorsFormatted(error,setError)
    }finally{
      hideLoader();
    }
   
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          placeholder="Enter Clinic Group Name"
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors?.name 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
        />
        {errors?.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          {...register('description')}
          placeholder="Enter Description"
          rows={4}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors?.description 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
        />
        {errors?.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="active"
          {...register('active')}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="active" className="text-sm font-medium text-gray-700">
          Active
        </label>
      </div>

      {errors?.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.submit.message}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : clinicGroup ? 'Update Clinic Group' : 'Add Clinic Group'}
        </button>
      </div>
    </form>
  );
};

export default ClinicGroupForm;
