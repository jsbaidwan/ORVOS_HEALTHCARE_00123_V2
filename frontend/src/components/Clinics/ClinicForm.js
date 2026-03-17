import React, { useEffect } from 'react';
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
import { PlusIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const DEVICE_TYPES = [
  { value: 1, label: 'Mobile' },
  { value: 2, label: 'Desktop' },
];

const clinicSchema = yup.object({
  clinic_group_id: yup.string().required('Clinic Group is required'),
  companyName: yup.string().required('Company Name is required').trim(),
  pocEmail: yup.string().email('Invalid email address').required('POC Email is required').trim(),
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
  status: yup.string().required('Status is required'),
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

const ClinicForm = ({ clinic, onClose }) => {
  const { addClinic, updateClinic } = useClinic();
  const { clinicGroups, getClinicGroups } = useClinicGroup();
  const { showLoader, hideLoader } = useLoader();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(clinicSchema),
    defaultValues: {
      clinic_group_id: clinic?.clinic_group_id || '',
      companyName: clinic?.companyName || '',
      pocEmail: clinic?.pocEmail || '',
      phone: clinic?.phone || '',
      doi: clinic?.doi ? new Date(clinic.doi) : null,
      address: clinic?.address || '',
      city: clinic?.city || '',
      state_id: clinic?.state_id || '',
      zip: clinic?.zip || '',
      description: clinic?.description || '',
      status: clinic?.status || 'Active',
      is_dicom_enabled: clinic?.is_dicom_enabled || false,
      device_type_id: clinic?.device_type_id || '',
      device_ids: Array.isArray(clinic?.device_ids) && clinic.device_ids.length
        ? clinic.device_ids.map(id => ({ value: id }))
        : [{ value: '' }],
      is_patient_report_email_enabled: clinic?.is_patient_report_email_enabled || false,
      is_fax_enabled: clinic?.is_fax_enabled || false,
      fax_number: clinic?.fax_number || '',
    },
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

  useEffect(() => {
    getClinicGroups(1, {}, false);
  }, [getClinicGroups]);

  const onSubmit = async (data) => {
    const clinicData = {
      ...data,
      device_ids: data.device_ids?.map(d => d.value).filter(Boolean) || [],
    };

    showLoader();
    try {
      const result = clinic?.id
        ? await updateClinic(clinic.id, clinicData)
        : await addClinic(clinicData);

      if (result && (result.status === 200 || result.success)) {
        onClose();
        toast.success(result?.message);
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
          label="Company Name"
          name="companyName"
          registration={register('companyName')}
          placeholder="Enter Company Name"
          required
          error={errors.companyName?.message}
        />

        <FormField
          label="POC Email"
          name="pocEmail"
          type="email"
          registration={register('pocEmail')}
          placeholder="Enter POC Email"
          required
          error={errors.pocEmail?.message}
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
      </div>

      <FormField
        label="Address"
        name="address"
        registration={register('address')}
        placeholder="Enter Address"
        required
        inputClassName="gmap-autocomplete"
        error={errors.address?.message}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          registration={register('state')}
          options={US_STATES}
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

      <FormField
        label="Status"
        name="status"
        type="select"
        registration={register('status')}
        options={['Active', 'Inactive']}
        required
        error={errors.status?.message}
      />

      <div className="border-t border-gray-200 pt-4">
        <FormField
          label="Contract Documents"
          name="contractDocuments"
          type="file"
          registration={register('contractDocuments')}
          placeholder="Upload contract documents (multiple files allowed)"
        />
      </div>

      <div className="border-t border-gray-200 pt-4">
        <FormField
          label="Clinic Logo"
          name="logo"
          type="file"
          registration={register('logo')}
        />
      </div>

      <div className="border-t border-gray-200 pt-4">
        <FormField
          label="DICOM Enabled"
          name="is_dicom_enabled"
          type="checkbox"
          registration={register('is_dicom_enabled')}
        />
        <em className='text-sm text-gray-500'>(Enabling DICOM automatically hides the Medical Condition section on both the Patient Form and the Orvos Diagnosis Report.)</em>
      </div>

      {isDicomEnabled && (
        <>
          <div className="border-t border-gray-200 pt-4">
            <FormField
              label="Device Type"
              name="device_type_id"
              type="select"
              registration={register('device_type_id')}
              options={DEVICE_TYPES}
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
                    <input
                      type="text"
                      className={`flex-1 border ${errors.device_ids?.[index]?.value ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                      {...register(`device_ids.${index}.value`)}
                      placeholder="Enter Device ID"
                    />
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="px-2 py-1 text-xs text-red-600 border border-red-600 rounded hover:bg-red-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {errors.device_ids?.[index]?.value && (
                    <p className="mt-1 text-sm text-red-600">{errors.device_ids[index].value.message}</p>
                  )}
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
          ) : clinic ? (
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
  );
};

export default ClinicForm;
