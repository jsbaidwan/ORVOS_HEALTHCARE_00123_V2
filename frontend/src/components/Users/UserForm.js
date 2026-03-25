import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useClinic } from '../../context/ClinicContext';
import FormField from '../UI/FormField';
import Breadcrumb from '../Common/Breadcrumb';
import { formatPhone } from '../../utils/formatPhone';
import ErrorHandle from '../Common/ErrorHandle';
import { useLoader } from '../../context/LoaderContext';
import { toast } from 'sonner';
import { useRoutePath } from '../../hooks/useRoutePath';
import { PlusIcon, PencilSquareIcon, UserIcon, DocumentIcon,PhotoIcon } from '@heroicons/react/24/outline';
import { useGoogleAutocomplete } from '../../hooks/useGoogleAutocomplete';
import useBlobUrl from '../../hooks/useBlobUrl';
import { errorsFormatted } from '../../utils/errorHandler';
import Select from 'react-select';
import { useAdditionalData } from '../../context/AdditionalDataContext';
import BlobFileItem from '../UI/BlobFileItem';

const createUserSchema = (isEdit) =>
  yup.object({
    first_name: yup.string().required('First name is required').trim(),
    last_name: yup.string().required('Last name is required').trim(),
    email: yup.string().email('Invalid email').required('Email is required').trim(),
    phone_number: yup.string(),
    role_id: yup.string().required('User type is required'),
    clinic_ids: yup.array().of(yup.string()).when('role_id', {
      is: (val) => val && val !== '2',
      then: (schema) => schema.min(1, 'At least one clinic is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    address: yup.string().required('Address is required').trim(),
    bio: yup.string().trim(),
    status: yup.boolean().required('Status is required'),

    npi_number: yup.string().when('role_id', {
      is: '2',
      then: (schema) => schema.required('NPI Number is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    caqh_id: yup.string(),
    provider_id: yup.string(),

    licences: yup.array().of(
      yup.object({
        id: yup.mixed().nullable(),
        licence_number: yup.string(),
        l_state_id: yup.string(),
        expiry_date: yup.date().nullable().typeError('Invalid date'),
        insurance_carriers: yup.object(),
      })
    ).when('role_id', {
      is: '2',
      then: (schema) => schema.of(
        yup.object({
          id: yup.mixed().nullable(),
          licence_number: yup.string().required('Licence number is required'),
          l_state_id: yup.string().required('State is required'),
          expiry_date: yup.date().required('Expiry date is required').typeError('Invalid date'),
          insurance_carriers: yup.object(),
        })
      ).min(1, 'At least one licence is required'),
      otherwise: (schema) => schema.notRequired(),
    }),

    signature: yup.mixed(),

    password: isEdit
      ? yup
          .string()
          .transform((v) => (v === '' ? undefined : v))
          .notRequired()
          .test('len', 'Password must be at least 8 characters', (v) => !v || v.length >= 8)
      : yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
    confirm_password: isEdit
      ? yup
          .string()
          .transform((v) => (v === '' ? undefined : v))
          .test('match', 'Passwords must match', function (v) {
            const p = this.parent.password;
            if (!p && !v) return true;
            return v === p;
          })
      : yup
          .string()
          .required('Please confirm password')
          .oneOf([yup.ref('password')], 'Passwords must match'),
  });

const buildInsuranceDefaults = (carriersData, insuranceCarriersList) => {
  const defaults = {};
  const list = insuranceCarriersList || [];
  list.forEach((c) => {
    const key = String(c.id);
    defaults[key] = {
      checked: false,
      other: '',
    };
  });

  if (carriersData && typeof carriersData === 'object') {
    if (Array.isArray(carriersData)) {
      carriersData.forEach((val) => {
        if (typeof val === 'object' && val !== null) {
          Object.keys(val).forEach((k) => {
            if (defaults[k]) {
              defaults[k].checked = true;
              if (val[k]?.medicare) defaults[k].other = val[k].medicare;
              if (val[k]?.other) defaults[k].other = val[k].other;
            }
          });
        } else {
          const strVal = String(val);
          if (defaults[strVal]) {
            defaults[strVal].checked = true;
          }
        }
      });
    } else {
      Object.keys(carriersData).forEach((k) => {
        if (defaults[k]) {
          defaults[k].checked = true;
          const v = carriersData[k];
          if (typeof v === 'object' && v !== null) {
            if (v.medicare) defaults[k].other = v.medicare;
            if (v.other) defaults[k].other = v.other;
          }
        }
      });
    }
  }
  return defaults;
};

const buildDefaults = (data, insuranceCarriersList) => ({
  first_name: data?.first_name || '',
  last_name: data?.last_name || '',
  email: data?.email || '',
  phone_number: data?.phone_number || '',
  role_id: data?.role_id != null ? String(data.role_id) : '',
  clinic_ids: Array.isArray(data?.clinic_ids) && data.clinic_ids.length
    ? data.clinic_ids.map((id) => String(id))
    : Array.isArray(data?.clinic_users) && data.clinic_users.length
    ? data.clinic_users.map((cu) => String(cu.clinic_id))
    : data?.clinic_id != null
    ? [String(data.clinic_id)]
    : [],
  address: data?.address || '',
  bio: data?.bio || '',
  status: data?.status ?? true,
  npi_number: data?.npi_number || '',
  caqh_id: data?.caqh_id || '',
  provider_id: data?.provider_id || '',
  licences: Array.isArray(data?.licenses) && data.licenses.length
    ? data.licenses.map((l) => ({
        id: l.id || null,
        licence_number: l.licence_number || '',
        l_state_id: l.l_state_id != null ? String(l.l_state_id) : '',
        expiry_date: l.expiry_date ? new Date(l.expiry_date) : null,
        insurance_carriers: buildInsuranceDefaults(
          l.insurance_carriers_ids ? (typeof l.insurance_carriers_ids === 'string' ? JSON.parse(l.insurance_carriers_ids) : l.insurance_carriers_ids) : null,
          insuranceCarriersList
        ),
      }))
    : [{ id: null, licence_number: '', l_state_id: '', expiry_date: null, insurance_carriers: buildInsuranceDefaults(null, insuranceCarriersList) }],
  password: '',
  confirm_password: '',
});

const UserForm = ({ user: userProp, onClose }) => {
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const getRoutePath = useRoutePath();
  const { addUser, updateUser, getUserById, getExistingUser } = useUser();
  const { clinics, getClinics } = useClinic();
  const { showLoader, hideLoader } = useLoader();
  const {additionalData} = useAdditionalData();

  const resolvedId = userProp?.id ?? (idParam ? parseInt(idParam, 10) : null);
  const isEditMode = Boolean(resolvedId && !Number.isNaN(resolvedId));

  const [userData, setUserData] = useState(userProp || null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [states, setStates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [insuranceCarriers, setInsuranceCarriers] = useState([]);
  const [existingDocs, setExistingDocs] = useState([]);
  const [removedDocs, setRemovedDocs] = useState([]);
  const [newDocs, setNewDocs] = useState([]);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [signatureRemoved, setSignatureRemoved] = useState(false);
  const { id } = useParams();

  const userSchema = useMemo(() => createUserSchema(isEditMode), [isEditMode]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: buildDefaults(userProp || {}, []),
    
  });
  
  const { fields: licenceFields, append: appendLicence, remove: removeLicence } = useFieldArray({
    control,
    name: 'licences',
  });

  const watchedRoleId = watch('role_id');
  const isOrvosDoctor = watchedRoleId === '2';
  const showClinics = watchedRoleId && !isOrvosDoctor;

  useGoogleAutocomplete({
    setValue,
    standaloneFields: { address: 'address', city: 'city', state_id: 'state_id' },
  });

  const fetched = useRef(false);
  const uId = userProp?.id || id || null;
  
     
  const loadData = useCallback(async () => {
    try {
      
      const promises = [
        getClinics(1, {}, false),
        
      ];
      
      if (uId) {
        promises.push(getUserById(uId));
      }
      
      setStates(additionalData?.states || []);
      setRoles(additionalData?.roles || []);
      setInsuranceCarriers(additionalData?.insuranceCarriers || []);
      
      const results = await Promise.all(promises);
      const fresh = results[1];
      if(fresh?.status){
        if(fresh?.status !== 200){
          errorsFormatted({errors: {general: fresh?.errors}}, setError);
          return;
        }
      }
      if (fresh?.user) {
        setUserData(fresh.user);
        setExistingDocs(fresh.user.display_documents || []);
        reset(buildDefaults(fresh.user, additionalData?.insuranceCarriers));
      }
    } finally {
      hideLoader();
    }
  }, [uId, getClinics, additionalData, getUserById, hideLoader, reset,setError]);

  useEffect(() => {
    const existingUser = getExistingUser(id);
    
    if (existingUser && !userData) {
       
        setUserData(existingUser);
        setExistingDocs(existingUser.display_documents || []);
       
        setTimeout(() => {
          reset(buildDefaults(existingUser, additionalData?.insuranceCarriers));
        }, 10);
        
    }
   
    if (fetched.current === false) {
      loadData();
      fetched.current = true;
    }
  }, [loadData, id, getExistingUser, reset, additionalData,userData]);

  const clinicOptions =
    clinics?.map((c) => ({
      value: String(c.id),
      label: c.name || '',
    })) || [];

    
  const handleRemoveNewDoc = (index) => {
    setNewDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    
    if (isOrvosDoctor) {
      const hasExistingSignature = userData?.display_signature?.status === 200 && !signatureRemoved;
      const hasNewSignature = data.signature?.length > 0;
      if (!hasNewSignature && !hasExistingSignature) {
        setError('signature', { message: 'Signature is required' });
        return;
      }
    }

    showLoader();
    try {
      const formData = new FormData();

      formData.append('first_name', data.first_name?.trim() || '');
      formData.append('last_name', data.last_name?.trim() || '');
      formData.append('email', data.email?.trim() || '');
      formData.append('phone_number', data?.phone_number || '');
      formData.append('role_id', data.role_id || '');
      formData.append('address', data.address?.trim() || '');
      formData.append('bio', data.bio?.trim() || '');
      formData.append('status', data.status ? 1 : 0);

      if (data.clinic_ids?.length) {
        data.clinic_ids.forEach((cid) => formData.append('clinic_ids[]', cid));
      }

      if (data.password) {
        formData.append('password', data.password);
        formData.append('confirm_password', data.confirm_password || '');
      }

      if (data.avatar?.length) {
        formData.append('image', data.avatar[0]);
      } else if (avatarRemoved && userData?.image) {
        formData.append('remove_image', '1');
      }

      if (isOrvosDoctor) {
        formData.append('npi_number', data.npi_number?.trim() || '');
        formData.append('caqh_id', data.caqh_id?.trim() || '');
        formData.append('provider_id', data.provider_id?.trim() || '');

        (data.licences || []).forEach((l, index) => {
          if (l.id) {
            formData.append(`license_id[${index}]`, l.id);
          }
          formData.append(`licence_number[${index}]`, l.licence_number || '');
          formData.append(`l_state_id[${index}]`, l.l_state_id || '');
          formData.append(
            `expiry_date[${index}]`,
            l.expiry_date
              ? `${String(l.expiry_date.getMonth() + 1).padStart(2, '0')}-${String(l.expiry_date.getDate()).padStart(2, '0')}-${l.expiry_date.getFullYear()}`
              : ''
          );

          const carriers = l.insurance_carriers || {};
          Object.keys(carriers).forEach((carrierId) => {
            const entry = carriers[carrierId];
            if (entry?.checked) {
              formData.append(`insurance_carriers_ids[${index}][]`, carrierId);
              if (carrierId === '6' && entry.other) {
                formData.append(`insurance_carriers_ids[${index}][6][medicare]`, entry.other);
              }
              if (carrierId === '9' && entry.other) {
                formData.append(`insurance_carriers_ids[${index}][9][other]`, entry.other);
              }
            }
          });
        });

        if (data.signature?.length) {
          formData.append('signature', data.signature[0]);
        } else if (signatureRemoved) {
          formData.append('remove_signature', '1');
        }

        newDocs.forEach((f) => formData.append('documents[]', f.file));
        removedDocs.forEach((name) => formData.append('removed_documents[]', name));
      }

      const result = userData?.id
        ? await updateUser(userData.id, formData)
        : await addUser(formData);
      
      if (result && (result.status === 200 || result.success)) {
        toast.success(result?.message || (userData?.id ? 'User updated successfully' : 'User created successfully'));
        navigate(getRoutePath('/users'));
      } else {
 
        errorsFormatted(result, setError);
         
      }
    } catch (error) {
      errorsFormatted(error, setError);
    } finally {
      hideLoader();
    }
  };

  const dbPreview = userData?.display_avatar?.status === 200 && !avatarRemoved ? userData.display_avatar.src : null;
  const previewSrc = avatarPreview || dbPreview;
  const { blobUrl } = useBlobUrl(previewSrc);
  const imgBlobUrl = blobUrl;

  const dbSignature = userData?.display_signature?.status === 200 && !signatureRemoved ? userData.display_signature.src : null;
  const sigPreviewSrc = signaturePreview || dbSignature;
  const { blobUrl: sigBlobUrl } = useBlobUrl(sigPreviewSrc);

  return (
    <div className="py-6">
      <Breadcrumb />

      <div className="mb-3">
        <div className="bg-white px-6 py-4 border-b rounded-t-lg shadow-sm border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {userData?.id ? 'Edit User' : 'Add User'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">Basic information about the user.</p>
        </div>

        <div className="bg-white px-5 p-4">
          <div className="mt-3">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 mt-4">
             
              <ErrorHandle errors={errors} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  registration={register('email')}
                  placeholder="Enter Email"
                  required
                  error={errors.email?.message}
                />
                <Controller
                  name="phone_number"
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label="Phone"
                      name="phone_number"
                      value={field.value}
                      onChange={(e) => field.onChange(formatPhone(e.target.value))}
                      placeholder="(xxx) xxx-xxxx"
                      error={errors.phone_number?.message}
                    />
                  )}
                />
              </div>

              <div className={`grid grid-cols-1 ${showClinics ? 'md:grid-cols-2' : ''} gap-4`}>
                <FormField
                  label="User Type"
                  name="role_id"
                  type="select"
                  registration={register('role_id')}
                  options={roles?.map((r) => ({ value: r.id, label: r.name }))}
                  required
                  error={errors.role_id?.message}
                />
                {showClinics && (
                  <Controller
                    name="clinic_ids"
                    control={control}
                    render={({ field }) => (
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Choose Clinics <span className="text-red-500 ml-1">*</span>
                        </label>
                        <Select
                          isMulti
                          options={clinicOptions}
                          value={clinicOptions.filter((o) => field.value?.includes(o.value))}
                          onChange={(selected) => field.onChange(selected ? selected.map((s) => s.value) : [])}
                          placeholder="Select clinics..."
                          classNamePrefix="react-select"
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              borderColor: errors.clinic_ids ? '#ef4444' : state.isFocused ? '#009efb' : '#d1d5db',
                              boxShadow: state.isFocused ? '0 0 0 2px rgba(0, 158, 251, 0.2)' : base.boxShadow,
                              '&:hover': { borderColor: state.isFocused ? '#009efb' : '#9ca3af' },
                              minHeight: '38px',
                              borderRadius: '0.375rem',
                              fontSize: '0.875rem',
                            }),
                            multiValue: (base) => ({ ...base, backgroundColor: '#e0f2fe', borderRadius: '0.25rem' }),
                            multiValueLabel: (base) => ({ ...base, color: '#0369a1', fontSize: '0.8rem' }),
                            multiValueRemove: (base) => ({ ...base, color: '#0369a1', '&:hover': { backgroundColor: '#bae6fd', color: '#0c4a6e' } }),
                            menu: (base) => ({ ...base, zIndex: 50 }),
                          }}
                        />
                        {errors.clinic_ids && (
                          <p className="mt-1 text-sm text-red-600">{errors.clinic_ids.message}</p>
                        )}
                      </div>
                    )}
                  />
                )}
              </div>
 
              {/* ======= ORVOS DOCTOR FIELDS (role_id === 2) ======= */}
              {isOrvosDoctor && (
                <>
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        label="NPI Number"
                        name="npi_number"
                        registration={register('npi_number')}
                        placeholder="Enter NPI Number"
                        required
                        error={errors.npi_number?.message}
                      />
                      <FormField
                        label="CAQH ID"
                        name="caqh_id"
                        registration={register('caqh_id')}
                        placeholder="Enter CAQH ID"
                        error={errors.caqh_id?.message}
                      />
                      <FormField
                        label="Provider ID"
                        name="provider_id"
                        registration={register('provider_id')}
                        placeholder="Enter Provider ID"
                        error={errors.provider_id?.message}
                      />
                    </div>
                  </div>

                  {/* Licence Details */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Licence Details <span className="text-red-500 ml-1">*</span>
                    </h3>
                   
                    <div className="space-y-3">
                      {licenceFields.map((field, index) => (
                        <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           
                            <FormField
                              label="Licence Number"
                              name={`licences.${index}.licence_number`}
                              registration={register(`licences.${index}.licence_number`)}
                              placeholder="Enter Licence Number"
                              required
                              error={
                                errors?.licences?.[index]?.licence_number?.message ??
                                errors?.licence_number?.[index]?.message ??
                                errors?.licence_number?.message
                              }
                            />
                            <FormField
                              label="State"
                              name={`licences.${index}.l_state_id`}
                              type="select"
                              registration={register(`licences.${index}.l_state_id`)}
                              options={states?.map((s) => ({ value: s.id, label: s.name }))}
                              required
                              error={
                                errors?.licences?.[index]?.l_state_id?.message ??
                                errors?.l_state_id?.[index]?.message ??
                                errors?.l_state_id?.message
                              }
                             
                            />
                            <Controller
                              name={`licences.${index}.expiry_date`}
                              control={control}
                              render={({ field: dateField }) => (
                                <div className="mb-4">
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Expiry Date <span className="text-red-500 ml-1">*</span>
                                  </label>
                                  <DatePicker
                                    selected={dateField.value}
                                    onChange={dateField.onChange}
                                    dateFormat="MM-dd-yyyy"
                                    placeholderText="MM-DD-YYYY"
                                    className={`w-full border ${errors.licences?.[index]?.expiry_date ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                                  />
                                  {errors.licences?.[index]?.expiry_date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.licences[index].expiry_date.message}</p>
                                  )}
                                </div>
                              )}
                            />
                          </div>

                          {/* Insurance Carriers per licence */}
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Insurance Carriers</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                             
                              {insuranceCarriers?.map((carrier) => {
                                const key = String(carrier.id);
                               
                                const isChecked = watch(`licences.${index}.insurance_carriers.${key}.checked`);
                                const needsInput = carrier.name === 'Medicare' || carrier.name === 'Other';

                                return (
                                  <div key={carrier.id} className="border border-gray-200 rounded-md p-2 bg-white">
                                    <label className="flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        {...register(`licences.${index}.insurance_carriers.${key}.checked`)}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                                      />
                                      <span className="ml-2 text-xs font-medium text-gray-700">{carrier.name}</span>
                                    </label>
                                    {needsInput && isChecked && (
                                      <div className="mt-1.5">
                                        <input
                                          type="text"
                                          {...register(`licences.${index}.insurance_carriers.${key}.other`)}
                                          placeholder={carrier.name === 'Other' ? 'Specify carrier name' : `Enter ${carrier.name} details`}
                                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {licenceFields.length > 1 && (
                            <div className="flex justify-end mt-3">
                              <button
                                type="button"
                                onClick={() => removeLicence(index)}
                                className="px-2 py-1 text-xs text-red-600 border border-red-600 rounded hover:bg-red-50"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => appendLicence({ id: null, licence_number: '', l_state_id: '', expiry_date: null, insurance_carriers: buildInsuranceDefaults(null, insuranceCarriers) })}
                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-primary-600 text-xs font-medium rounded text-primary-600 hover:bg-primary-50"
                      >
                        + Add Licence
                      </button>
                      {errors.licences?.message && (
                        <p className="mt-1 text-sm text-red-600">{errors.licences.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Signature Upload */}
                  <div className="border-t border-gray-200 pt-4">
                    <Controller
                      name="signature"
                      control={control}
                      render={({ field: { onChange, ref } }) => (
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Signature <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            ref={ref}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              onChange(e.target.files);
                              if (file) {
                                setSignaturePreview(URL.createObjectURL(file));
                                setSignatureRemoved(false);
                              } else {
                                setSignaturePreview(null);
                              }
                            }}
                            className={`input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 ${errors.signature ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                          />
                          {errors.signature && <p className="mt-1 text-sm text-red-600">{errors.signature.message}</p>}
                          {sigPreviewSrc && (
                            <div className="mt-3 flex items-center space-x-3">
                              {sigBlobUrl ? (
                                <img src={sigBlobUrl} alt="Signature" className="h-16 rounded border border-gray-200 bg-white p-1" />
                              ) : (
                                <PhotoIcon className="w-16 h-16 rounded-full object-cover border border-gray-80 bg-gray-50" />
                              )}
                              <button
                                type="button"
                                onClick={() => { onChange(null); setSignaturePreview(null); setSignatureRemoved(true); }}
                                className="px-2 py-1 text-xs text-red-600 border border-red-600 rounded hover:bg-red-50"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* Documents Upload */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Documents</label>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => {
                          const picked = Array.from(e.target.files || []);
                          setNewDocs((prev) => [
                            ...prev,
                            ...picked.map((f) => ({ file: f, name: f.name, preview: URL.createObjectURL(f) })),
                          ]);
                          e.target.value = '';
                        }}
                        className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                    </div>

                    {existingDocs.map((file, index) =>
                      file.status === 200 && (
                        <BlobFileItem
                          key={`db-${index}`}
                          file={file}
                          index={index}
                          onRemove={() => {
                            const removed = existingDocs[index];
                            if (removed?.name) {
                              setRemovedDocs((prev) => [...prev, removed.name]);
                            }
                            setExistingDocs((prev) => prev.filter((_, i) => i !== index));
                          }}
                        />
                      )
                    )}

                    <ul className="space-y-2">
                      {newDocs.map((file, index) => (
                        <li key={`new-${index}`} className="flex items-center justify-between bg-blue-50 rounded-md px-3 py-2">
                          <div className="flex items-center space-x-2 truncate max-w-[70%]">
                            {file.file.type?.startsWith('image/') ? (
                              <img src={file.preview} alt="" className="w-8 h-8 rounded object-cover border border-gray-200 bg-gray-200" />
                            ) : (
                              <DocumentIcon className="w-8 h-8 rounded object-cover border border-gray-200 mr-2" />
                            )}
                            <span className="text-sm text-gray-800 truncate">
                              <a href={file.preview} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm max-w-[70%]">{file.name}</a>
                            </span>
                            <span className="text-xs text-green-600 font-medium whitespace-nowrap">(New)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveNewDoc(index)}
                            className="px-2 py-1 text-xs text-red-600 border border-red-600 rounded hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              <FormField
                label="Address"
                name="address"
                registration={register('address')}
                placeholder="Enter Address"
                required
                inputClassName="gmap-autocomplete"
                error={errors.address?.message}
              />

              <Controller
                name="avatar"
                control={control}
                render={({ field: { onChange, ref } }) => (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Avatar</label>
                    <input
                      ref={ref}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(e.target.files);
                        if (file) {
                          const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                          if (!validTypes.includes(file.type)) {
                            setError('avatar', { message: 'Please upload a valid image (JPEG, PNG, GIF, WebP)' });
                            onChange(null);
                            setAvatarPreview(null);
                            return;
                          }
                          if (file.size > 5 * 1024 * 1024) {
                            setError('avatar', { message: 'File size must be less than 5MB' });
                            onChange(null);
                            setAvatarPreview(null);
                            return;
                          }
                          setAvatarPreview(URL.createObjectURL(file));
                          setAvatarRemoved(false);
                        } else {
                          setAvatarPreview(null);
                        }
                      }}
                      className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    {previewSrc && (
                      <div className="mt-3 flex items-center space-x-3">
                        {!imgBlobUrl ? (
                          <UserIcon className="w-16 h-16 rounded-full object-cover border border-gray-80 bg-gray-50" />
                        ) : (
                          <img src={imgBlobUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-gray-200 bg-gray-200" />
                        )}
                        <button
                          type="button"
                          onClick={() => { onChange(null); setAvatarPreview(null); setAvatarRemoved(true); }}
                          className="px-2 py-1 text-xs text-red-600 border border-red-600 rounded hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    {errors.avatar && <p className="mt-1 text-sm text-red-600">{errors.avatar.message}</p>}
                  </div>
                )}
              />

              <FormField
                label="Short Biography"
                name="bio"
                type="textarea"
                registration={register('bio')}
                placeholder="Enter Short Biography"
                rows={3}
                error={errors.bio?.message}
              />

              <div className="flex items-center space-x-2">
                <label htmlFor="status" className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="status" {...register('status')} className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:bg-primary transition-all duration-200"></div>
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-all duration-200"></div>
                </label>
                <span className="text-sm font-medium text-gray-700">Active</span>
              </div>


              {/* Password Section */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {userData?.id ? 'Change Password (leave blank to keep current)' : 'Set Password'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Password"
                    name="password"
                    type="password"
                    registration={register('password')}
                    placeholder="••••••••••••••••"
                    required={!userData?.id}
                    error={errors.password?.message}
                  />
                  <FormField
                    label="Confirm Password"
                    name="confirm_password"
                    type="password"
                    registration={register('confirm_password')}
                    placeholder="••••••••••••••••"
                    required={!userData?.id}
                    error={errors.confirm_password?.message}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                
                <button type="submit" className="btn-primary flex items-center justify-center" disabled={isSubmitting}>
                  {isSubmitting ? (
                    'Processing...'
                  ) : userData?.id ? (
                    <>
                      <PencilSquareIcon className="w-4 h-4 mr-2" />
                      Update User
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Add User
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

export default UserForm;
