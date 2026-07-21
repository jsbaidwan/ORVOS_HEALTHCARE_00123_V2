import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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
import { useTitle } from '../../context/TitleContext';

const buildPatientSchema = (fieldVisibility, casQuestions = [], { lEyeChecked = false, rEyeChecked = false, existingLeftEyes = [], existingRightEyes = [], existingBothEyes = [] } = {}) => yup.object({
  clinic_id: yup.string().required('Clinic is required'),
  first_name: yup.string().required('First Name is required').trim(),
  last_name: yup.string().required('Last Name is required').trim(),
  dob: yup
    .date()
    .nullable()
    .required('Date of Birth is required')
    .typeError('Date of Birth is required'),
  gender: yup.string().required('Gender is required'),
  phone: fieldVisibility.showInsBilling
    ? yup.string().required('Phone is required')
    : yup.string().notRequired(),
  ehr: yup.string().required('EHR # is required').trim(),
  email: fieldVisibility.showEmail
    ? yup.string().email('Invalid email address').required('Email is required').trim()
    : yup.string().email('Invalid email address').notRequired().trim(),
  address: fieldVisibility.showAddress
    ? yup.string().required('Address is required').trim()
    : yup.string().notRequired().trim(),
  p_insurance_name: fieldVisibility.showInsBilling
    ? yup.string().required('Primary Insurance Name is required').trim()
    : yup.string().notRequired().trim(),
  p_insurance_group_no: fieldVisibility.showInsBilling
    ? yup.string().required('Primary Insurance Group No is required').trim()
    : yup.string().notRequired().trim(),
  p_insurance_member_no: fieldVisibility.showInsBilling
    ? yup.string().required('Primary Insurance Member No is required').trim()
    : yup.string().notRequired().trim(),
  s_insurance_name: yup.string().trim(),
  s_insurance_group_no: yup.string().trim(),
  s_insurance_member_no: yup.string().trim(),
  screening_type_id: fieldVisibility.showMedicalCondition
    ? yup.string().required('Screening Type is required')
    : yup.string().notRequired(),
  medical_condition_id: yup.string().when('screening_type_id', {
    is: (val) => fieldVisibility.showMedicalCondition && String(val) !== '2',
    then: (s) => s.required('Medical Condition is required'),
    otherwise: (s) => s.notRequired(),
  }),
  cas_questions: yup.mixed().test(
    'cas-required',
    'Please answer all CAS questions',
    function (value) {
      const screeningId = String(this.parent.screening_type_id);
      if (screeningId !== '2' || !casQuestions.length) return true;

      const answers = value || {};
      const missing = casQuestions.filter((q) => {
        const v = answers[q.id];
        return v === undefined || v === null || v === '';
      });

      if (missing.length === 0) return true;

      // Emit one error per unanswered question so each message renders
      // directly below that question's radios.
      return new yup.ValidationError(
        missing.map((q) =>
          this.createError({
            path: `cas_questions.${q.id}`,
            message: 'This question is required',
          })
        )
      );
    }
  ),
  l_eye_images: yup.array().test(
    'min-if-left-checked',
    'At least one Left Eye image is required',
    (value) => !lEyeChecked || (Array.isArray(value) && value.length > 0) || existingLeftEyes.length > 0
  ),
  r_eye_images: yup.array().test(
    'min-if-right-checked',
    'At least one Right Eye image is required',
    (value) => !rEyeChecked || (Array.isArray(value) && value.length > 0) || existingRightEyes.length > 0
  ),
  b_eye_images: yup.array().test(
    'min-if-thyroid',
    'At least one Both Eye image is required',
    function (value) {
      const screeningId = String(this.parent.screening_type_id);
      if (screeningId !== '2') return true;
      return (Array.isArray(value) && value.length > 0) || existingBothEyes.length > 0;
    }
  ),
  medical_history: yup.array().of(yup.string()),
});


const parseMedicalHistory = (mh) => {
  if (Array.isArray(mh)) return mh;
  if (typeof mh === 'string') {
    try {
      return JSON.parse(mh);
    } catch (e) {
      return [];
    }
  }
  return [];
};

const parseCasQuestions = (cq) => {
  if (cq && typeof cq === 'object' && !Array.isArray(cq)) return cq;
  if (Array.isArray(cq)) return { ...cq };
  if (typeof cq === 'string') {
    try {
      const parsed = JSON.parse(cq);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  }
  return {};
};

const buildDefaults = (data) => ({
  clinic_id: data?.clinic_id || '',
  first_name: data?.first_name || '',
  last_name: data?.last_name || '',
  dob: data?.dob,
  dos: data?.dos,
  remark_at: data?.remark_at,
  gender: data?.gender || '',
  phone: data?.phone || '',
  ehr: data?.ehr || '',
  email: data?.email || '',
  address: data?.address || '',
  p_insurance_name: data?.p_insurance_name || '',
  p_insurance_group_no: data?.p_insurance_group_no || '',
  p_insurance_member_no: data?.p_insurance_member_no || '',
  s_insurance_name: data?.s_insurance_name || '',
  s_insurance_group_no: data?.s_insurance_group_no || '',
  s_insurance_member_no: data?.s_insurance_member_no || '',
  screening_type_id: data?.screening_type_id || '',
  medical_condition_id: data?.medical_condition_id || '',
  cas_questions: parseCasQuestions(data?.cas_questions),
  medical_history: parseMedicalHistory(data?.medical_history),
  note: data?.note || '',
});


const PatientForm = ({ patient, isGuest = false, guestClinicId = '', guestSignature = '' }) => {
  const { addPatient, updatePatient, getPatientById, getExistingPatient, guestPatientsStore } = usePatient();
  const { clinics, setClinics, getClinics } = useClinic();
  const { showLoader, hideLoader } = useLoader();
  const getRoutePath = useRoutePath();
  const navigate = useNavigate();
  const { id } = useParams();
  const fetched = useRef(false);
  const [patientData, setPatientData] = useState(patient);
  const { additionalData } = useAdditionalData();
  const [lEyeChecked, setLEyeChecked] = useState(true);
  const [rEyeChecked, setREyeChecked] = useState(true);
  const { setPageTitle } = useTitle();
  const [existingLeftEyes, setExistingLeftEyes] = useState([]);
  const [existingRightEyes, setExistingRightEyes] = useState([]);
  const [existingBothEyes, setExistingBothEyes] = useState([]);
  const [removedLeftEyeFiles, setRemovedLeftEyeFiles] = useState([]);
  const [removedRightEyeFiles, setRemovedRightEyeFiles] = useState([]);
  const [removedBothEyeFiles, setRemovedBothEyeFiles] = useState([]);

  const isCompleted = patientData?.diagnosis_status === 1;

  const [fieldVisibility, setFieldVisibility] = useState({
    showInsBilling: true,
    showAddress: true,
    showEmail: true,
    showMedicalCondition: true,
  });

  const casQuestions = useMemo(() => additionalData?.casQuestions || [], [additionalData]);

  const schema = useMemo(() => buildPatientSchema(fieldVisibility, casQuestions, { lEyeChecked, rEyeChecked, existingLeftEyes, existingRightEyes, existingBothEyes }), [fieldVisibility, casQuestions, lEyeChecked, rEyeChecked, existingLeftEyes, existingRightEyes, existingBothEyes]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    setError,
    clearErrors,
    watch,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: buildDefaults(patient),
  });

  useGoogleAutocomplete({
    setValue,
    standaloneFields: { address: 'address' },
    apiKey: isGuest ? (additionalData?.google_map_api_key || '') : undefined,
  });

  const pId = patient?.id || id || null;

  useEffect(() => {
    setPageTitle(isGuest ? 'Patient Form' : patientData?.id ? 'Patient Edit' : 'Patient Create');
  }, [setPageTitle, isGuest, patientData]);

  useEffect(() => {
    if (isGuest && guestClinicId && clinics?.length) {
      setValue('clinic_id', guestClinicId, { shouldDirty: true, shouldTouch: true });
    }
  }, [isGuest, guestClinicId, setValue, clinics]);

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

        setExistingLeftEyes(fresh?.patient?.display_left_eye_images || []);
        setExistingRightEyes(fresh?.patient?.display_right_eye_images || []);
        setExistingBothEyes(fresh?.patient?.display_both_eye_images || []);

        // Auto-check eye checkboxes if patient already has eye images
        if (fresh?.patient?.l_eye_images?.length > 0) setLEyeChecked(true);
        if (fresh?.patient?.r_eye_images?.length > 0) setREyeChecked(true);
      }
    } finally {
      hideLoader();
    }
  }, [pId, getClinics, getPatientById, hideLoader, reset, setError]);

  useEffect(() => {
    if (isGuest) {
      if (additionalData?.clinics?.length) {
        setClinics(additionalData.clinics.map(c => ({ id: c.id, name: c.name })));
      }
      return;
    }

    if (!id && patientData) {
      // Transition from Edit -> Create
      setPatientData(null);
      setExistingLeftEyes([]);
      setExistingRightEyes([]);
      setExistingBothEyes([]);
      setRemovedLeftEyeFiles([]);
      setRemovedRightEyeFiles([]);
      setRemovedBothEyeFiles([]);
      reset(buildDefaults(null));
    } else if (id && (!patientData || String(patientData.id) !== String(id))) {
      // Transition from Create -> Edit, or Edit A -> Edit B
      const existingPatient = getExistingPatient(id);
      if (existingPatient) {
        setPatientData(existingPatient);
        setExistingLeftEyes(existingPatient?.display_left_eye_images || []);
        setExistingRightEyes(existingPatient?.display_right_eye_images || []);
        setExistingBothEyes(existingPatient?.display_both_eye_images || []);
        setTimeout(() => {
          reset(buildDefaults(existingPatient));
        }, 10);
      } else {
        // We have an ID but no cached data, fetch it
        loadData();
      }
    }

    if (fetched.current === false) {
      loadData();
      fetched.current = true;
    }
  }, [id, isGuest, patientData, getExistingPatient, reset, loadData, hideLoader, setClinics, additionalData]);

  const handleRemoveExistingLeftEye = (imgObj) => {
    if (imgObj?.name) setRemovedLeftEyeFiles(prev => [...prev, imgObj.name]);
    setExistingLeftEyes(prev => prev.filter(item => item.name !== imgObj.name));
  };

  const handleRemoveExistingRightEye = (imgObj) => {
    if (imgObj?.name) setRemovedRightEyeFiles(prev => [...prev, imgObj.name]);
    setExistingRightEyes(prev => prev.filter(item => item.name !== imgObj.name));
  };

  const handleRemoveExistingBothEye = (imgObj) => {
    if (imgObj?.name) setRemovedBothEyeFiles(prev => [...prev, imgObj.name]);
    setExistingBothEyes(prev => prev.filter(item => item.name !== imgObj.name));
  };

  const watchedClinicId = watch('clinic_id');

  useEffect(() => {
    if (!watchedClinicId) {
      setFieldVisibility({ showInsBilling: true, showAddress: true, showEmail: true, showMedicalCondition: true });
      return;
    }

    const selectedClinic = additionalData?.clinics?.find(
      c => String(c.id) === String(watchedClinicId)
    );

    const isDicomEnabled = !!selectedClinic?.is_dicom_enabled;

    if (!selectedClinic?.additional_setting?.data) {
      setFieldVisibility({ showInsBilling: false, showAddress: false, showEmail: false, showMedicalCondition: !isDicomEnabled });
      return;
    }

    let settings = selectedClinic.additional_setting.data;
    if (typeof settings === 'string') {
      try { settings = JSON.parse(settings); } catch { settings = {}; }
    }

    setFieldVisibility({
      showInsBilling: !!settings.patient_ins_billing_fields,
      showAddress: !!settings.patient_address,
      showEmail: !!settings.emailToggle,
      showMedicalCondition: !isDicomEnabled,
    });
  }, [watchedClinicId, additionalData, clinics]);

  const onSubmit = async (data) => {
    const formData = new FormData();

    formData.append('clinic_id', data.clinic_id || '');
    formData.append('first_name', data.first_name?.trim() || '');
    formData.append('last_name', data.last_name?.trim() || '');
    formData.append('dob', data.dob ? (() => { let d = new Date(data.dob); return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${d.getFullYear()}` })() : '');
    formData.append('dos', data.dos ? (() => { let d = new Date(data.dos); return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${d.getFullYear()}` })() : '');
    formData.append('remark_at', data.remark_at ? (() => { let d = new Date(data.remark_at); return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${d.getFullYear()}` })() : '');
    formData.append('gender', data.gender || '');
    formData.append('phone', data.phone || '');
    formData.append('ehr', data.ehr?.trim() || '');
    formData.append('email', data.email?.trim() || '');
    formData.append('address', data.address?.trim() || '');
    formData.append('p_insurance_name', data.p_insurance_name?.trim() || '');
    formData.append('p_insurance_group_no', data.p_insurance_group_no?.trim() || '');
    formData.append('p_insurance_member_no', data.p_insurance_member_no?.trim() || '');
    formData.append('s_insurance_name', data.s_insurance_name?.trim() || '');
    formData.append('s_insurance_group_no', data.s_insurance_group_no?.trim() || '');
    formData.append('s_insurance_member_no', data.s_insurance_member_no?.trim() || '');
    formData.append('screening_type_id', data.screening_type_id || '');
    formData.append('medical_condition_id', data.medical_condition_id || '');
    formData.append('note', data?.note || '');
    formData.append('l_eye', lEyeChecked ? '1' : '0');
    formData.append('r_eye', rEyeChecked ? '1' : '0');

    // Append eye images
    let hasLeftNew = false;
    if (data.l_eye_images && data.l_eye_images.length > 0) {
      data.l_eye_images.forEach((file) => {
        formData.append('l_eye_images[]', file);
      });
      hasLeftNew = true;
    }

    // Add dummy array item to satisfy backend validation if no new images but existing images are present
    if (!hasLeftNew && lEyeChecked && existingLeftEyes?.length > 0) {
      formData.append('l_eye_images[]', 'existing');
    }

    let hasRightNew = false;
    if (data.r_eye_images && data.r_eye_images.length > 0) {
      data.r_eye_images.forEach((file) => {
        formData.append('r_eye_images[]', file);
      });
      hasRightNew = true;
    }

    // Add dummy array item to satisfy backend validation
    if (!hasRightNew && rEyeChecked && existingRightEyes?.length > 0) {
      formData.append('r_eye_images[]', 'existing');
    }

    // Both Eye images - only relevant for Thyroid Eye Disease (screening_type_id === 2)
    if (String(data.screening_type_id) === '2') {
      let hasBothNew = false;
      if (data.b_eye_images && data.b_eye_images.length > 0) {
        data.b_eye_images.forEach((file) => {
          formData.append('b_eye_images[]', file);
        });
        hasBothNew = true;
      }

      // Add dummy array item to satisfy backend validation
      if (!hasBothNew && existingBothEyes?.length > 0) {
        formData.append('b_eye_images[]', 'existing');
      }
    }

    removedLeftEyeFiles.forEach(name => formData.append('removed_leftEyePreview_files[]', name));
    removedRightEyeFiles.forEach(name => formData.append('removed_rightEyePreview_files[]', name));
    removedBothEyeFiles.forEach(name => formData.append('removed_bothEyePreview_files[]', name));

    const medicalHistory = data.medical_history || [];
    medicalHistory.forEach(item => formData.append('medical_history[]', item));

    if (String(data.screening_type_id) === '2') {
      const casAnswers = data.cas_questions || {};
      Object.entries(casAnswers).forEach(([qid, val]) => {
        if (val !== undefined && val !== '' && val !== null) {
          formData.append(`cas_questions[${qid}]`, val);
        }
      });
    }

    try {
      showLoader();
      let result;

      if (isGuest) {
        formData.append('signature', guestSignature);
        result = await guestPatientsStore(formData);
      } else {
        result = patientData?.id
          ? await updatePatient(patientData.id, formData)
          : await addPatient(formData);
      }

      if (result && (result.status === 200 || result.success)) {
        toast.success(result?.message);
       
        if (isGuest) {
          toast.success('Patient submitted successfully!');
          setPatientData(null);
          setExistingLeftEyes([]);
          setExistingRightEyes([]);
          setRemovedLeftEyeFiles([]);
          setRemovedRightEyeFiles([]);
          setLEyeChecked(false);
          setREyeChecked(false);
          reset(buildDefaults(null));
          setValue('l_eye_images', []);
          setValue('r_eye_images', []);
          setTimeout(() => {
            setLEyeChecked(true);
            setREyeChecked(true);
          }, 100);
        } else {
          const status = patientData?.diagnosis_status === 1 ? 'completed' : 'pending';
          navigate(getRoutePath('/patients/' + status));
        }
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
    <div className={isGuest ? "py-6 px-4 md:px-8 lg:px-16 max-w-10xl mx-auto" : "py-6"}>
      {!isGuest && <Breadcrumb />}
      <div className="mb-3">

        <div className="bg-white px-6 py-4 border-b rounded-t-lg shadow-sm border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {isGuest ? 'Patient Form' : patientData?.id ? 'Edit Patient' : 'Add Patient'}
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
                      disabled={isGuest || isCompleted}
                      error={errors.clinic_id?.message}
                    />

                  <FormField
                    label="EHR #"
                    name="ehr"
                    registration={register('ehr')}
                    placeholder="Enter EHR Number"
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
                  {patientData?.id && (<>
                    <Controller
                      name="dos"
                      control={control}
                      render={({ field }) => (
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            DOS <span className="text-red-500 ml-1">*</span>
                          </label>
                          <DatePicker
                            selected={field.value}
                            onChange={field.onChange}
                            dateFormat="MM-dd-yyyy"
                            placeholderText="MM-DD-YYYY"
                            className={`w-full border ${errors.dos ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                            showYearDropdown
                            showMonthDropdown
                            dropdownMode="select"
                            maxDate={new Date()}
                          />
                          {errors.dos && <p className="mt-1 text-sm text-red-600">{errors.dos.message}</p>}
                        </div>
                      )}
                    />

                    {patientData?.diagnosis_status === 1 && (
                      < Controller
                        name="remark_at"
                        control={control}
                        render={({ field }) => (
                          <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Remark At <span className="text-red-500 ml-1">*</span>
                            </label>
                            <DatePicker
                              selected={field.value}
                              onChange={field.onChange}
                              dateFormat="MM-dd-yyyy"
                              placeholderText="MM-DD-YYYY"
                              className={`w-full border ${errors.remark_at ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                              showYearDropdown
                              showMonthDropdown
                              dropdownMode="select"
                              maxDate={new Date()}
                            />
                            {errors.remark_at && <p className="mt-1 text-sm text-red-600">{errors.remark_at.message}</p>}
                          </div>
                        )}
                      />
                    )}

                  </>
                  )}

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
                    disabled={isCompleted}
                    error={errors.gender?.message}
                  />

                  {fieldVisibility.showInsBilling && (
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
                          disabled={isCompleted}
                          error={errors.phone?.message}
                        />
                      )}
                    />
                  )}

                  {fieldVisibility.showEmail && (
                    <div>
                      <FormField
                        label="Email"
                        name="email"
                        type="email"
                        registration={register('email')}
                        placeholder="Enter Email"
                        required
                        disabled={isCompleted}
                        error={errors.email?.message}
                      />
                      <p className="text-xs text-gray-500 -mt-2">* To use patient appointment reminders this must be on</p>
                    </div>
                  )}
                </div>

                {fieldVisibility.showAddress && (
                  <div className="mt-4">
                    <FormField
                      label="Address"
                      name="address"
                      registration={register('address')}
                      placeholder="Enter Address"
                      required
                      disabled={isCompleted}
                      inputClassName="gmap-autocomplete"
                      error={errors.address?.message}
                    />
                  </div>
                )}
              </div>

              {/* Insurance Information */}
              {fieldVisibility.showInsBilling && (
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h2>

                  {/* Primary Insurance */}
                  <h3 className="text-md font-semibold text-gray-700 mb-3">Primary Insurance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormField
                      label="Insurance Name"
                      name="p_insurance_name"
                      registration={register('p_insurance_name')}
                      placeholder="Enter Primary Insurance Name"
                      required
                      disabled={isCompleted}
                      error={errors.p_insurance_name?.message}
                    />

                    <FormField
                      label="Group No"
                      name="p_insurance_group_no"
                      registration={register('p_insurance_group_no')}
                      placeholder="Enter Group No"
                      required
                      disabled={isCompleted}
                      error={errors.p_insurance_group_no?.message}
                    />

                    <FormField
                      label="Member No"
                      name="p_insurance_member_no"
                      registration={register('p_insurance_member_no')}
                      placeholder="Enter Member No"
                      required
                      disabled={isCompleted}
                      error={errors.p_insurance_member_no?.message}
                    />
                  </div>

                  {/* Secondary Insurance */}
                  <h3 className="text-md font-semibold text-gray-700 mb-3">Secondary Insurance (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      label="Insurance Name"
                      name="s_insurance_name"
                      registration={register('s_insurance_name')}
                      placeholder="Enter Secondary Insurance Name"
                      disabled={isCompleted}
                      error={errors.s_insurance_name?.message}
                    />

                    <FormField
                      label="Group No"
                      name="s_insurance_group_no"
                      registration={register('s_insurance_group_no')}
                      placeholder="Enter Group No"
                      disabled={isCompleted}
                      error={errors.s_insurance_group_no?.message}
                    />

                    <FormField
                      label="Member No"
                      name="s_insurance_member_no"
                      registration={register('s_insurance_member_no')}
                      placeholder="Enter Member No"
                      disabled={isCompleted}
                      error={errors.s_insurance_member_no?.message}
                    />
                  </div>
                </div>
              )}

               <FormField
                  label="Screening Type"
                  name="screening_type_id"
                  type="select"
                  registration={register('screening_type_id')}
                  options={additionalData?.screeningTypes?.map((item) => {
                    return {
                      value: item.id,
                      label: item.name,
                    }
                  })}
                  required
                  disabled={isCompleted}
                  error={errors.screening_type_id?.message}
                />

              <hr className="my-6" />

              {/* CAS Questions - shown for Thyroid Eye Disease */}
              {String(watch('screening_type_id')) === '2' && casQuestions.length > 0 && (
                <div className={`border-b border-gray-200 pb-6 ${isCompleted ? 'opacity-60 pointer-events-none' : ''}`}>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    CAS Questions <span className="text-red-500">*</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {casQuestions.map((q, index) => (
                      <div key={q.id} className={`border rounded-lg p-4 bg-gray-50 ${errors.cas_questions?.[q.id] ? 'border-red-500' : 'border-gray-200'}`}>
                        <p className="text-sm font-medium text-gray-800 mb-3">
                          {index + 1}. {q.question}
                        </p>
                        <Controller
                          name={`cas_questions.${q.id}`}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center gap-6">
                              {Object.entries(q.options || {}).map(([optKey, optLabel]) => (
                                <label key={optKey} className="inline-flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    value={optKey}
                                    checked={String(field.value) === String(optKey)}
                                    onChange={() => {
                                      field.onChange(optKey);
                                      clearErrors(`cas_questions.${q.id}`);
                                    }}
                                    disabled={isCompleted}
                                    className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">{optLabel}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        />
                        {errors.cas_questions?.[q.id] && (
                          <p className="mt-2 text-sm text-red-500">{errors.cas_questions[q.id].message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {errors.cas_questions?.message && (
                    <p className="mt-2 text-sm text-red-500">{errors.cas_questions.message}</p>
                  )}
                </div>
              )}

              {/* Eye Images */}
              <div className={`border-b border-gray-200 pb-6 ${isCompleted ? 'opacity-60 pointer-events-none' : ''}`}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Eye Images</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="inline-flex items-center cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        name="l_eye"
                        checked={lEyeChecked}
                        disabled={isCompleted}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setLEyeChecked(checked);
                          if (!checked) setValue('l_eye_images', []);
                          setTimeout(() => trigger('l_eye_images'), 0);
                        }}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Left Eye</span>
                    </label>
                    {lEyeChecked && (
                      <EyeImageUploader
                        label="Left Eye Images"
                        name="l_eye_images"
                        setValue={setValue}
                        getValues={getValues}
                        onChange={(e) => { }}
                        required
                        eyeType="left"
                        existingImages={existingLeftEyes}
                        onRemoveExisting={handleRemoveExistingLeftEye}
                        trigger={trigger}
                        error={errors.l_eye_images?.message}
                      />
                    )}
                  </div>

                  <div>
                    <label className="inline-flex items-center cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        name="r_eye"
                        checked={rEyeChecked}
                        disabled={isCompleted}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setREyeChecked(checked);
                          if (!checked) setValue('r_eye_images', []);
                          setTimeout(() => trigger('r_eye_images'), 0);
                        }}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Right Eye</span>
                    </label>
                    {rEyeChecked && (
                      <EyeImageUploader
                        label="Right Eye Images"
                        name="r_eye_images"
                        setValue={setValue}
                        getValues={getValues}
                        onChange={(e) => { }}
                        required
                        eyeType="right"
                        existingImages={existingRightEyes}
                        onRemoveExisting={handleRemoveExistingRightEye}
                        trigger={trigger}
                        error={errors.r_eye_images?.message}
                      />
                    )}
                  </div>
                </div>

                {/* Both Eye - shown for Thyroid Eye Disease */}
                {String(watch('screening_type_id')) === '2' && (
                  <div className="mt-6">
                    <span className="block text-sm font-medium text-gray-700 mb-3">Both Eye</span>
                    <EyeImageUploader
                      label="Both Eye Images"
                      name="b_eye_images"
                      setValue={setValue}
                      getValues={getValues}
                      onChange={(e) => { }}
                      required
                      eyeType="both"
                      existingImages={existingBothEyes}
                      onRemoveExisting={handleRemoveExistingBothEye}
                      trigger={trigger}
                      error={errors.b_eye_images?.message}
                    />
                  </div>
                )}
              </div>

              {/* Medical Information - Hidden when DICOM is enabled or Thyroid Eye Disease */}
              {fieldVisibility.showMedicalCondition && String(watch('screening_type_id')) !== '2' && (
                <div className={`border-b border-gray-200 pb-6 ${isCompleted ? 'opacity-60 pointer-events-none' : ''}`}>
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
                    disabled={isCompleted}
                    error={errors.medical_condition_id?.message}
                  />

                  <div className="mt-4">
                    <Controller
                      name="medical_history"
                      control={control}
                      render={({ field }) => (

                        <MedicalHistorySection
                          selectedHistory={field.value || patient?.medical_history || []}
                          medicalHistoryOptions={additionalData?.medicalHistories}
                          onChange={(updatedHistory) => field.onChange(updatedHistory)}
                          disabled={isCompleted}
                        />
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Note */}
              <FormField
                label="Note"
                name="note"
                type="textarea"
                registration={register('note')}
                placeholder="Enter Note"
                disabled={isCompleted}
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
      </div >
    </div >
  );
};

export default PatientForm;
