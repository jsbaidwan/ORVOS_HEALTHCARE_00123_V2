import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { usePatient } from '../../context/PatientContext';
import { useClinic } from '../../context/ClinicContext';
import FormField from '../UI/FormField';
import EyeImageUploader from './EyeImageUploader';
import MedicalHistorySection from './MedicalHistorySection';
import Breadcrumb from '../Common/Breadcrumb';
import ErrorHandle from '../Common/ErrorHandle';
import { errorsFormatted } from '../../utils/errorHandler';
import { formatPhone } from '../../utils/formatPhone';
import { useLoader } from '../../context/LoaderContext';
import { toast } from 'sonner';
import { PlusIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useRoutePath } from '../../hooks/useRoutePath';
import { useNavigate, useParams } from 'react-router-dom';
import { useGoogleAutocomplete } from '../../hooks/useGoogleAutocomplete';
import { useAdditionalData } from '../../context/AdditionalDataContext';

const patientSchema = yup.object({
  clinic_id: yup.string().required('Clinic is required'),
  first_name: yup.string().required('First Name is required').trim(),
  last_name: yup.string().required('Last Name is required').trim(),
  dob: yup
    .date()
    .nullable()
    .required('Date of Birth is required')
    .typeError('Date of Birth is required'),
  gender: yup.string().required('Gender is required'),
  phone: yup.string().required('Phone is required'),
  ehr: yup.string().required('EHR # is required').trim(),
  email: yup.string().email('Invalid email address').required('Email is required').trim(),
  address: yup.string().required('Address is required').trim(),
  primary_insurance_name: yup.string().required('Primary Insurance Name is required').trim(),
  primary_insurance_group_no: yup.string().required('Primary Insurance Group No is required').trim(),
  primary_insurance_member_no: yup.string().required('Primary Insurance Member No is required').trim(),
  secondary_insurance_name: yup.string().trim(),
  secondary_insurance_group_no: yup.string().trim(),
  secondary_insurance_member_no: yup.string().trim(),
  medical_condition_id: yup.string().required('Medical Condition is required'),
  medical_history: yup.array().of(yup.string()),
});

const parseDateOfBirth = (dob) => {
  if (!dob) return null;
  const str = String(dob);
  const parts = str.split('-');
  if (parts.length === 3) {
    const [m, d, y] = parts.map(Number);
    const fullYear = y < 100 ? 2000 + y : y;
    return new Date(fullYear, m - 1, d);
  }
  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback;
};

const buildDefaults = (data) => ({
  clinic_id: data?.clinic_id || '',
  first_name: data?.first_name || '',
  last_name: data?.last_name || '',
  dob: parseDateOfBirth(data?.dob),
  gender: data?.gender || '',
  phone: data?.phone || '',
  ehr: data?.ehr || '',
  email: data?.email || '',
  address: data?.address || '',
  primary_insurance_name: data?.primary_insurance_name || '',
  primary_insurance_group_no: data?.primary_insurance_group_no || '',
  primary_insurance_member_no: data?.primary_insurance_member_no || '',
  secondary_insurance_name: data?.secondary_insurance_name || '',
  secondary_insurance_group_no: data?.secondary_insurance_group_no || '',
  secondary_insurance_member_no: data?.secondary_insurance_member_no || '',
  medical_condition_id: data?.medical_condition_id || '',
  medical_history: Array.isArray(data?.medical_history) ? data.medical_history : [],
  note: data?.note || '',
});


const PatientForm = ({ patient }) => {
  const { addPatient, updatePatient, getPatientById, getExistingPatient } = usePatient();
  const { clinics, getClinics } = useClinic();
  const { showLoader, hideLoader } = useLoader();
  const getRoutePath = useRoutePath();
  const navigate = useNavigate();
  const { id } = useParams();
  const fetched = useRef(false);
  const [patientData, setPatientData] = useState(patient);
  const { additionalData } = useAdditionalData();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(patientSchema),
    defaultValues: buildDefaults(patient),
  });

  useGoogleAutocomplete({
    setValue,
    standaloneFields: { address: 'address' },
  });

  const pId = patient?.id || id || null;

  const loadData = useCallback(async () => {
    try {
      const promises = [
        getClinics(1, {}, false),
      ];


      if (pId) {
        promises.push(getPatientById(pId));
      }

      const results = await Promise.all(promises);

      const fresh = results[1];
      if (fresh?.status) {
        if (fresh?.status !== 200) {
          errorsFormatted({ errors: { general: fresh?.errors } }, setError);
          return;
        }
      }

      if (fresh) {
        setPatientData(fresh?.patient);
        reset(buildDefaults(fresh?.patient));
      }
    } finally {
      hideLoader();
    }
  }, [pId, getClinics, getPatientById, hideLoader, reset, setError]);

  useEffect(() => {
    const existingPatient = getExistingPatient(id);

    if (existingPatient && !patientData) {
      setPatientData(existingPatient);

      setTimeout(() => {
        reset(buildDefaults(existingPatient));
      }, 10);
    }

    if (fetched.current === false) {
      loadData();
      fetched.current = true;
    }
  }, [loadData, id, getExistingPatient, reset, patientData]);

  const onSubmit = async (data) => {
    const formData = new FormData();

    formData.append('clinic_id', data.clinic_id || '');
    formData.append('first_name', data.first_name?.trim() || '');
    formData.append('last_name', data.last_name?.trim() || '');
    formData.append('dob', data.dob
      ? `${String(data.dob.getMonth() + 1).padStart(2, '0')}-${String(data.dob.getDate()).padStart(2, '0')}-${data.dob.getFullYear()}`
      : '');
    formData.append('gender', data.gender || '');
    formData.append('phone', data.phone || '');
    formData.append('ehr', data.ehr?.trim() || '');
    formData.append('email', data.email?.trim() || '');
    formData.append('address', data.address?.trim() || '');
    formData.append('primary_insurance_name', data.primary_insurance_name?.trim() || '');
    formData.append('primary_insurance_group_no', data.primary_insurance_group_no?.trim() || '');
    formData.append('primary_insurance_member_no', data.primary_insurance_member_no?.trim() || '');
    formData.append('secondary_insurance_name', data.secondary_insurance_name?.trim() || '');
    formData.append('secondary_insurance_group_no', data.secondary_insurance_group_no?.trim() || '');
    formData.append('secondary_insurance_member_no', data.secondary_insurance_member_no?.trim() || '');
    formData.append('medical_condition_id', data.medical_condition_id || '');
    formData.append('note', data?.note || '');

    const medicalHistory = data.medical_history || [];
    medicalHistory.forEach(item => formData.append('medical_history[]', item));

    try {
      showLoader();
      const result = patientData?.id
        ? await updatePatient(patientData.id, formData)
        : await addPatient(formData);

      if (result && (result.status === 200 || result.success)) {
        toast.success(result?.message);
        navigate(getRoutePath('/patients'));
      } else {
        errorsFormatted(result, setError);
      }
    } catch (error) {
      errorsFormatted(error, setError);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="py-6">
      <Breadcrumb />
      <div className="mb-3">

        <div className="bg-white px-6 py-4 border-b rounded-t-lg shadow-sm border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {patientData?.id ? 'Edit Patient' : 'Add Patient'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the patient information below.
          </p>
        </div>

        <div className="bg-white px-5 p-4">
          <div className="mt-3">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 mt-4">

              <ErrorHandle errors={errors} />

              {/* Basic Information */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Clinic"
                    name="clinic_id"
                    type="select"
                    registration={register('clinic_id')}
                    options={clinics?.map(c => ({
                      value: c.id,
                      label: c.name,
                    }))}
                    required
                    error={errors.clinic_id?.message}
                  />

                  <FormField
                    label="EHR #"
                    name="ehr"
                    registration={register('ehr')}
                    placeholder="Enter MR Number"
                    required
                    error={errors.ehr?.message}
                  />

                  <FormField
                    label="First Name"
                    name="first_name"
                    registration={register('first_name')}
                    placeholder="Enter First Name"
                    required
                    error={errors.first_name?.message}
                  />

                  <FormField
                    label="Last Name"
                    name="last_name"
                    registration={register('last_name')}
                    placeholder="Enter Last Name"
                    required
                    error={errors.last_name?.message}
                  />

                  <Controller
                    name="dob"
                    control={control}
                    render={({ field }) => (
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Date of Birth <span className="text-red-500 ml-1">*</span>
                        </label>
                        <DatePicker
                          selected={field.value}
                          onChange={field.onChange}
                          dateFormat="MM-dd-yyyy"
                          placeholderText="MM-DD-YYYY"
                          className={`w-full border ${errors.dob ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                          showYearDropdown
                          showMonthDropdown
                          dropdownMode="select"
                          maxDate={new Date()}
                        />
                        {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob.message}</p>}
                      </div>
                    )}
                  />

                  <FormField
                    label="Gender"
                    name="gender"
                    type="select"
                    registration={register('gender')}
                    options={additionalData?.genders?.map((item) => {
                      return {
                        value: item.id,
                        label: item.name.charAt(0).toUpperCase() + item.name.slice(1),
                      }
                    })}
                    required
                    error={errors.gender?.message}
                  />

                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        label="Phone"
                        name="phone"
                        value={field.value}
                        onChange={(e) => field.onChange(formatPhone(e.target.value))}
                        placeholder="(xxx) xxx-xxxx"
                        required
                        error={errors.phone?.message}
                      />
                    )}
                  />

                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    registration={register('email')}
                    placeholder="Enter Email"
                    required
                    error={errors.email?.message}
                  />
                </div>

                <div className="mt-4">
                  <FormField
                    label="Address"
                    name="address"
                    registration={register('address')}
                    placeholder="Enter Address"
                    required
                    inputClassName="gmap-autocomplete"
                    error={errors.address?.message}
                  />
                </div>
              </div>

              {/* Insurance Information */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h2>

                {/* Primary Insurance */}
                <h3 className="text-md font-semibold text-gray-700 mb-3">Primary Insurance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <FormField
                    label="Insurance Name"
                    name="primary_insurance_name"
                    registration={register('primary_insurance_name')}
                    placeholder="Enter Primary Insurance Name"
                    required
                    error={errors.primary_insurance_name?.message}
                  />

                  <FormField
                    label="Group No"
                    name="primary_insurance_group_no"
                    registration={register('primary_insurance_group_no')}
                    placeholder="Enter Group No"
                    required
                    error={errors.primary_insurance_group_no?.message}
                  />

                  <FormField
                    label="Member No"
                    name="primary_insurance_member_no"
                    registration={register('primary_insurance_member_no')}
                    placeholder="Enter Member No"
                    required
                    error={errors.primary_insurance_member_no?.message}
                  />
                </div>

                {/* Secondary Insurance */}
                <h3 className="text-md font-semibold text-gray-700 mb-3">Secondary Insurance (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="Insurance Name"
                    name="secondary_insurance_name"
                    registration={register('secondary_insurance_name')}
                    placeholder="Enter Secondary Insurance Name"
                    error={errors.secondary_insurance_name?.message}
                  />

                  <FormField
                    label="Group No"
                    name="secondary_insurance_group_no"
                    registration={register('secondary_insurance_group_no')}
                    placeholder="Enter Group No"
                    error={errors.secondary_insurance_group_no?.message}
                  />

                  <FormField
                    label="Member No"
                    name="secondary_insurance_member_no"
                    registration={register('secondary_insurance_member_no')}
                    placeholder="Enter Member No"
                    error={errors.secondary_insurance_member_no?.message}
                  />
                </div>
              </div>

              {/* Eye Images */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Eye Images</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EyeImageUploader
                    label="Left Eye Images"
                    name="leftEyeImages"
                    onChange={(e) => {
                      // handle eye image files if needed
                    }}
                    required
                    eyeType="left"
                  />

                  <EyeImageUploader
                    label="Right Eye Images"
                    name="rightEyeImages"
                    onChange={(e) => {
                      // handle eye image files if needed
                    }}
                    required
                    eyeType="right"
                  />
                </div>
              </div>

              {/* Medical Information */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h2>

                <FormField
                  label="Medical Condition"
                  name="medical_condition_id"
                  type="select"
                  registration={register('medical_condition_id')}
                  options={additionalData?.medicalConditions?.map((item) => {
                    return {
                      value: item.id,
                      label: item.name,
                    }
                  })}
                  required
                  error={errors.medical_condition_id?.message}
                />

                <div className="mt-4">
                  <Controller
                    name="medical_history"
                    control={control}
                    render={({ field }) => (
                      <MedicalHistorySection
                        selectedHistory={field.value || []}
                        medicalHistoryOptions={additionalData?.medicalHistories}
                        onChange={(updatedHistory) => field.onChange(updatedHistory)}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Note */}
              <FormField
                label="Note"
                name="note"
                type="textarea"
                registration={register('note')}
                placeholder="Enter Note"
                error={errors.note?.message}
              />

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="btn-primary flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Processing...'
                  ) : patientData?.id ? (
                    <>
                      <PencilSquareIcon className="w-4 h-4 mr-2" />
                      Update Patient
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Add Patient
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;
