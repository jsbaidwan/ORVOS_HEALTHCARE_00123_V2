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
import ErrorHandle from '../Common/ErrorHandle';
import { PlusIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
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
      name: data?.clinicGroup?.name || '',
      description: data?.clinicGroup?.description || '',
      active: data?.clinicGroup?.active === 1,
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
      showLoader()
      //const data = await getDefaultValues(clinicGroup?.id);
      const data = clinicGroup;
      reset(data);
      hideLoader()
    };
    if(loadDefaultsRef.current === true){
      loadDefaults();
      loadDefaultsRef.current = false;
    }

  }, [clinicGroup, reset,getDefaultValues,showLoader,hideLoader]);
  
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
      <ErrorHandle errors={errors} />
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
        <label htmlFor="active" className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="active"
            {...register('active')}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:bg-primary transition-all duration-200"></div>
          <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-all duration-200"></div>
        </label>
        <span className="text-sm font-medium text-gray-700">Active</span>
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
          className="btn-primary flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            'Processing...'
          ) : clinicGroup ? (
            <>
              <PencilSquareIcon className="w-4 h-4 mr-2" />
              Update Clinic Group
            </>
          ) : (
            <>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Clinic Group
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ClinicGroupForm;
