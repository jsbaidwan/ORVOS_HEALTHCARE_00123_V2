import React, { useEffect , useState , useCallback,useRef} from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useClinic } from '../../context/ClinicContext';
import FormField from '../UI/FormField';
import { useGoogleAutocomplete } from "../../hooks/useGoogleAutocomplete";
import { formatPhone } from "../../utils/formatPhone";
import { useClinicGroup } from '../../context/ClinicGroupContext';
import ErrorHandle from '../Common/ErrorHandle';
import { errorsFormatted } from '../../utils/errorHandler';
import { useLoader } from '../../context/LoaderContext';
import { toast } from 'sonner';
import { PlusIcon, PencilSquareIcon, DocumentIcon,UserIcon } from '@heroicons/react/24/outline';
import { useGetAdditionalData } from '../../hooks/getAdditionalData';
import { useRoutePath } from '../../hooks/useRoutePath';
import { useNavigate,useParams  } from 'react-router-dom';
import Breadcrumb from '../Common/Breadcrumb';
import useBlobUrl from '../../hooks/useBlobUrl';
import BlobFileItem from '../UI/BlobFileItem';

const clinicSchema = yup.object({
  clinic_group_id: yup.string().required('Clinic Group is required'),
  name: yup.string().required('Clinic Name is required').trim(),
  poc_email: yup.string().email('Invalid email address').required('POC Email is required').trim(),
  phone: yup.string(),
  doi: yup
    .date()
    .nullable()
    .required('Date of Initiation is required')
    .typeError('Date of Initiation is required'),
  address: yup.string().required('Address is required').trim(),
  city: yup.string().required('City is required').trim(),
  state_id: yup.string().required('State is required'),
  zip: yup.string().required('Zip is required').trim(),
  description: yup.string().trim(), 
  status: yup.boolean().required('Status is required'),
  is_dicom_enabled: yup.boolean(),
  device_type_id: yup.string().when('is_dicom_enabled', {
    is: true,
    then: (schema) => schema.required('Device Type is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  device_ids: yup.array().of(
    yup.object({ value: yup.string() })
  ).when('is_dicom_enabled', {
    is: true,
    then: (schema) => schema.of(
      yup.object({ value: yup.string().required('Device ID is required') })
    ).min(1, 'At least one Device ID is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  is_patient_report_email_enabled: yup.boolean(),
  is_fax_enabled: yup.boolean(),
  fax_number: yup.string().when('is_fax_enabled', {
    is: true,
    then: (schema) => schema.required('Fax Number is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const parseDoi = (doi) => {
  if (!doi) return null;
  const str = String(doi);
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
  clinic_group_id: data?.clinic_group_id || '',
  name: data?.name || '',
  poc_email: data?.poc_email || '',
  phone: data?.phone || '',
  doi: parseDoi(data?.doi),
  address: data?.address || '',
  city: data?.city || '',
  state_id: data?.state_id || '',
  zip: data?.zip || '',
  description: data?.description || '',
  status: data?.status ?? 0,
  is_dicom_enabled: data?.is_dicom_enabled || false,
  device_type_id: data?.device_type_id || '',
  device_ids: Array.isArray(data?.device_ids) && data.device_ids.length
    ? data.device_ids.map(id => ({ value: id }))
    : [{ value: '' }],
  is_patient_report_email_enabled: data?.is_patient_report_email_enabled || false,
  is_fax_enabled: data?.is_fax_enabled || false,
  fax_number: data?.fax_number || '',
});

const ClinicForm = ({ clinic, onClose }) => {
  const { addClinic, updateClinic, getClinicById , getExistingClinic} = useClinic();
  const { clinicGroups, getClinicGroups } = useClinicGroup();
  const {showLoader, hideLoader } = useLoader();
  const getRoutePath = useRoutePath();
  const navigate = useNavigate();
  const { fetchAdditionalData } = useGetAdditionalData();
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [states, setStates] = useState([]);
  const [files, setFiles] = useState(clinic?.display_files || []);
  const [removedFiles, setRemovedFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [clinicData, setClinicData] = useState(clinic);
  const { id } = useParams();
  const fetched = useRef(false);
   
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
    resolver: yupResolver(clinicSchema),
    defaultValues: buildDefaults(clinic),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'device_ids',
  });

  const isDicomEnabled = watch('is_dicom_enabled');
  const isFaxEnabled = watch('is_fax_enabled');

  useGoogleAutocomplete({
    setValue,
    standaloneFields: { address: 'address', city: 'city', state_id: 'state_id' },
  });
 
  const handleRemoveFile = (index) => {
    const removed = files[index];
    if (removed?.name) {
      setRemovedFiles(prev => [...prev, removed.name]);
    }
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };
   
  const cId = clinic?.id || id || null;

  const loadData = useCallback(async () => {
    try {
      const getAdditionalData = await fetchAdditionalData()
      const promises = [
        getClinicGroups(1, {}, false),
         
      ];

      if (cId) {
        promises.push(getClinicById(cId));
      }
      const additionalData = getAdditionalData?.additionalData;
      setDeviceTypes(additionalData?.deviceTypes || []);
      setStates(additionalData?.states || []);
       
      const results = await Promise.all(promises);
      const fresh = results[1];
  
      if (fresh) {
        setClinicData(fresh?.clinic);
        setFiles(fresh?.clinic?.display_files || []);
        reset(buildDefaults(fresh?.clinic));
      }
    } finally {
      hideLoader();
    }
  }, [cId, getClinicGroups, fetchAdditionalData, getClinicById, hideLoader, reset]);
 
   useEffect(() => {
    const existingClinic = getExistingClinic(id);
  
    if (existingClinic && !clinicData) {
      setClinicData(existingClinic);
      setFiles(existingClinic.display_files || []);
  
      setTimeout(() => {
        reset(buildDefaults(existingClinic));
      }, 10);
    }
  
    if (fetched.current === false) {
      loadData();
      fetched.current = true;
    }
  
  }, [loadData, id, getExistingClinic, reset, clinicData]);

  const onSubmit = async (data) => {
    const formData = new FormData();

    formData.append('clinic_group_id', data.clinic_group_id || '');
    formData.append('name', data.name?.trim() || '');
    formData.append('poc_email', data.poc_email?.trim() || '');
    formData.append('phone', data.phone || '');
    formData.append('doi', data.doi
      ? `${String(data.doi.getMonth() + 1).padStart(2, '0')}-${String(data.doi.getDate()).padStart(2, '0')}-${data.doi.getFullYear()}`
      : '');
    formData.append('address', data.address?.trim() || '');
    formData.append('city', data.city?.trim() || '');
    formData.append('state_id', data.state_id || '');
    formData.append('zip', data.zip?.trim() || '');
    formData.append('description', data.description?.trim() || '');
    formData.append('status', data.status || '');
    formData.append('is_dicom_enabled', data.is_dicom_enabled ? 1 : 0);
    formData.append('device_type_id', data.device_type_id || '');
    formData.append('is_patient_report_email_enabled', data.is_patient_report_email_enabled ? 1 : 0);
    formData.append('is_fax_enabled', data.is_fax_enabled ? 1 : 0);
    formData.append('fax_number', data.fax_number || '');

    const deviceIds = data.device_ids?.map(d => d.value).filter(Boolean) || [];
    deviceIds.forEach(id => formData.append('device_ids[]', id));

    newFiles.forEach(f => formData.append('files[]', f.file));

    removedFiles.forEach(name => formData.append('removed_files[]', name));

    if (imageRemoved) {
      formData.append('remove_image', '1');
    }

    if (data.image?.length) {
      formData.append('image', data.image[0]);
    }

    try {
      showLoader()
      const result = clinicData?.id
        ? await updateClinic(clinicData.id, formData)
        : await addClinic(formData);

      if (result && (result.status === 200 || result.success)) {
       // onClose();
        toast.success(result?.message);
        navigate(getRoutePath('/clinics'));
      } else {
        errorsFormatted(result, setError);
      }
    } catch (error) {
      errorsFormatted(error, setError);
    } finally {
      hideLoader();
    }
  };

  const dbPreview = clinicData?.display_image?.status === 200 && !imageRemoved ? clinicData.display_image.src : null;
  const previewSrc = imagePreview || dbPreview;
  const { blobUrl } = useBlobUrl(previewSrc);
  const imgBlobUrl = blobUrl
  
  return (
    <div className="py-6">
      <Breadcrumb />
      <div className="mb-3">

        <div className="bg-white px-6 py-4 border-b rounded-t-lg shadow-sm border-gray-200" bis_skin_checked="1">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{clinicData?.id ? 'Edit Clinic' : 'Add Clinic'}</h3>
         <p className="mt-1 text-sm text-gray-500">
          Basic information about the clinic.</p>
        </div>
 
        <div className="bg-white px-5 p-4">
 
          <div className='mt-3'>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 mt-4">
            <ErrorHandle errors={errors} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Clinic Group"
                name="clinic_group_id"
                type="select"
                registration={register('clinic_group_id')}
                required
                options={clinicGroups?.map(cg => ({
                  value: cg.id,
                  label: cg.name,
                }))}
                error={errors.clinic_group_id?.message}
              />

              <FormField
                label="Clinic Name"
                name="name"
                registration={register('name')}
                placeholder="Enter Clinic Name"
                required
                error={errors.name?.message}
              />

              <FormField
                label="POC Email"
                name="poc_email"
                type="email"
                registration={register('poc_email')}
                placeholder="Enter POC Email"
                required
                error={errors.poc_email?.message}
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
                    error={errors.phone?.message}
                  />
                )}
              />

              <Controller
                name="doi"
                control={control}
                render={({ field }) => (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date of Initiation <span className="text-red-500 ml-1">*</span>
                    </label>
                    <DatePicker
                      selected={field.value}
                      onChange={field.onChange}
                      dateFormat="MM-dd-yyyy"
                      placeholderText="MM-DD-YYYY"
                      className={`w-full border ${errors.doi ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                      
                    />
                    {errors.doi && <p className="mt-1 text-sm text-red-600">{errors.doi.message}</p>}
                  </div>
                )}
              />
            
            <FormField
              label="Address"
              name="address"
              registration={register('address')}
              placeholder="Enter Address"
              required
              inputClassName="gmap-autocomplete"
              error={errors.address?.message}
            />
      
              <FormField
                label="City"
                name="city"
                registration={register('city')}
                placeholder="Enter City"
                required
                inputClassName="gm-city"
                error={errors.city?.message}
              />
  
              <FormField
                label="State"
                name="state_id"
                type="select"
                registration={register('state_id')}
                options={states?.map(state => ({
                  value: state.id,
                  label: state.name,
                }))}
                required
                inputClassName="gm-state"
                error={errors.state_id?.message}
              />

              <FormField
                label="Zip"
                name="zip"
                registration={register('zip')}
                placeholder="Enter Zip"
                required
                error={errors.zip?.message}
              />
            </div>

            <FormField
              label="Description"
              name="description"
              type="textarea"
              registration={register('description')}
              placeholder="Enter Description"
              rows={3}
              error={errors.description?.message}
            />

          <div className="flex items-center space-x-2">
            <label htmlFor="status" className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="status"
                {...register('status')}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:bg-primary transition-all duration-200"></div>
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-all duration-200"></div>
            </label>
            <span className="text-sm font-medium text-gray-700">Active</span>
          </div>

            {/* <FormField
              label="Status"
              name="status"
              type="select"
              registration={register('status')}
              options={[{ value: 1, label: 'Active' }, { value: 0, label: 'Inactive' }]}
              required
              error={errors.status?.message}
            /> */}

            <div className="border-t border-gray-200 pt-4">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contract Documents</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const picked = Array.from(e.target.files || []);
                    setNewFiles(prev => [
                      ...prev,
                      ...picked.map(f => ({ file: f, name: f.name, preview: URL.createObjectURL(f) })),
                    ]);
                    e.target.value = '';
                  }}
                  className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>

              {files.map((file, index) =>
                file.status === 200 && (
                  <BlobFileItem
                    key={`db-${index}`}
                    file={file}
                    index={index}
                    onRemove={handleRemoveFile} // ✅ used
                  />
                )
              )}
              
             <ul className="space-y-2">
              {newFiles.map((file, index) => (
                    <li key={`new-${index}`} className="flex items-center justify-between bg-blue-50 rounded-md px-3 py-2">
                      <div className="flex items-center space-x-2 truncate max-w-[70%]">
                        {file.file.type?.startsWith('image/') ? (
                          <img src={file.preview} alt="" className="w-8 h-8 rounded object-cover border border-gray-200 bg-gray-200" />
                        ):<DocumentIcon className="w-8 h-8 rounded object-cover border border-gray-200 mr-2" />}
                        <span className="text-sm text-gray-800 truncate"><a href={file.preview} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm   max-w-[70%]">{file.name}</a></span>
                        <span className="text-xs text-green-600 font-medium whitespace-nowrap">(New)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewFile(index)}
                        className="px-2 py-1 text-xs text-red-600 border border-red-600 rounded hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <Controller
                name="image"
                control={control}
                render={({ field: { onChange, ref } }) => {
                  
                  return (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Clinic Logo</label>
                      <input
                        ref={ref}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          onChange(e.target.files);
                          if (file) {
                            setImagePreview(URL.createObjectURL(file));
                            setImageRemoved(false);
                          } else {
                            setImagePreview(null);
                          }
                        }}
                        className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                      {previewSrc && (
                        <div className="mt-3 flex items-center space-x-3">
                           
                           {!imgBlobUrl ? (
                              <UserIcon className="w-16 h-16 rounded-full object-cover border border-gray-80 bg-gray-50" />
                            ) : (
                            <img
                              src={imgBlobUrl}
                              alt=""
                              
                              className="w-16 h-16 rounded-full object-cover border border-gray-200 bg-gray-200" 
                            />
                            )}
                          
                          <button
                            type="button"
                            onClick={() => {
                              onChange(null);
                              setImagePreview(null);
                              setImageRemoved(true);
                            }}
                            className="px-2 py-1 text-xs text-red-600 border border-red-600 rounded hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }}
              />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <FormField
                label="DICOM Enabled"
                name="is_dicom_enabled"
                type="checkbox"
                registration={register('is_dicom_enabled')}
              />
              <em className='text-gray-500 text-xs'>(Enabling DICOM automatically hides the Medical Condition section on both the Patient Form and the Orvos Diagnosis Report.)</em>
            </div>

            {isDicomEnabled && (
              <>
                <div className="border-t border-gray-200 pt-4">
                  <FormField
                    label="Device Type"
                    name="device_type_id"
                    type="select"
                    registration={register('device_type_id')}
                    options={deviceTypes?.map(deviceType => ({
                      value: deviceType.id,
                      label: deviceType.name,
                    }))}
                    required
                    error={errors.device_type_id?.message}
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Device ID <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div key={field.id}>
                        <div className="flex items-center space-x-2">
                          <FormField name={`device_ids.${index}.value`} type="text" placeholder="Enter Device ID" registration={register(`device_ids.${index}.value`)} error={errors.device_ids?.[index]?.value?.message}/>
                          <button type="button" onClick={() => remove(index)} className="px-2 py-1 mb-5 text-xs text-red-600 border border-red-600 rounded hover:bg-red-50">Remove</button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => append({ value: '' })}
                      className="mt-2 inline-flex items-center px-3 py-1.5 border border-primary-600 text-xs font-medium rounded text-primary-600 hover:bg-primary-50"
                    >
                      + Add Device ID
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="border-t border-gray-200 pt-4">
              <FormField
                label="Enable Patient Reports via Email"
                name="is_patient_report_email_enabled"
                type="checkbox"
                registration={register('is_patient_report_email_enabled')}
              />
              <em className='text-xs text-gray-500'>(Enable this option to automatically receive patient reports through email.)</em>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <FormField
                label="Fax Enabled"
                name="is_fax_enabled"
                type="checkbox"
                registration={register('is_fax_enabled')}
              />
            </div>

            {isFaxEnabled && (
              <>
                <div className="border-t border-gray-200 pt-4">
                  <FormField
                    label="Fax Number"
                    name="fax_number"
                    type="text"
                    registration={register('fax_number')}
                    placeholder="Enter Fax Number eg:- 34XXXXXXXX"
                    required
                    error={errors.fax_number?.message}
                  />
                </div>

                <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 text-xs px-4 py-3 rounded relative">
                  <strong className="font-semibold">Note:</strong>{" "}
                  The fax number should not include a leading '+' or '1'. It should be in the format{" "}
                  <code className="bg-yellow-200 px-1 rounded">34XXXXXXXX</code>{" "}
                  and not{" "}
                  <code className="bg-yellow-200 px-1 rounded">+134XXXXXXXX</code>{" "}
                  or{" "}
                  <code className="bg-yellow-200 px-1 rounded">+34XXXXXXXX</code>.
                </div>
              </>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
               
              <button
                type="submit"
                className="btn-primary flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Processing...'
                ) : clinicData?.id ? (
                  <>
                    <PencilSquareIcon className="w-4 h-4 mr-2" />
                    Update Clinic
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Clinic
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

export default ClinicForm;
