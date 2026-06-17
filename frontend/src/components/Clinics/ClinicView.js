import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../Common/Breadcrumb';
import ErrorHandle from '../Common/ErrorHandle';
import { useRoutePath } from '../../hooks/useRoutePath';
import { ArrowLeftIcon, UserIcon } from '@heroicons/react/24/outline';
import { useTitle } from '../../context/TitleContext';
import NoRecord from '../Common/NoRecord';
import useBlobUrl from '../../hooks/useBlobUrl';
import BlobFileItem from '../UI/BlobFileItem';
import PageLoader from '../Common/PageLoader';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const ClinicView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const getRoutePath = useRoutePath();
  const { getClinicById, getExistingClinic, runDicomFetchCron, postAdditionalSettings,getAdditionalSettings } = useClinic();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState(null);
  const [clinic, setClinic] = useState(null);

  const [settingsData, setSettingsData] = useState({
    patient_ins_billing_fields: false,
    patient_address: false,
    emailToggle: false,
    patient_appointment_reminders: false,
    allow_add_patient_without_login: false,
    clinic_url: '',
  });

  useEffect(() => {
    const loadSettings = async () => {
      const response = await getAdditionalSettings(id);
      if (response?.status === 200 && response?.data) {
        const d = response.data;
        setSettingsData({
          patient_ins_billing_fields: !!d.patient_ins_billing_fields,
          patient_address: !!d.patient_address,
          emailToggle: !!d.emailToggle,
          patient_appointment_reminders: !!d.patient_appointment_reminders,
          allow_add_patient_without_login: !!d.allow_add_patient_without_login,
          clinic_url: d.clinic_url || '',
        });
      }
    };
    if (id) loadSettings();
  }, [id, getAdditionalSettings]);
 
  const handleToggleField = (fieldName) => {
    setSettingsData((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const response = await postAdditionalSettings({
      clinic_id: id,
      patient_ins_billing_fields: settingsData.patient_ins_billing_fields,
      patient_address: settingsData.patient_address,
      emailToggle: settingsData.emailToggle,
      patient_appointment_reminders: settingsData.patient_appointment_reminders,
      allow_add_patient_without_login: settingsData.allow_add_patient_without_login,
      clinic_url: settingsData.clinic_url,
    });
    if (response?.status && response?.status !== 200) {
      setErrors({
        general: response?.message || 'Unable to save settings'
      });
      return;
    }
    Swal.fire({
      icon: 'success',
      title: 'Saved',
      text: 'Clinic settings saved successfully!',
      confirmButtonColor: '#3b82f6',
    });
  };

  const { setPageTitle } = useTitle();

  useEffect(() => {
    setPageTitle('Clinic View');
  }, [setPageTitle]);


  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      setErrors(null);

      try {
        const existingClinic = getExistingClinic(id);

        // ✅ Use cached data if available
        if (existingClinic) {
          setClinic(existingClinic);
          setLoading(false);

        }

        // ❌ Otherwise call API
        const data = await getClinicById(id, { action: 'view' });
        if (data?.status && data?.status !== 200) {
          setErrors({
            general: data?.message || 'Unable to load clinic'
          });
        } else {
          setClinic(data?.clinic);
        }

      } catch (err) {
        setErrors({
          general: err?.message || 'Something went wrong'
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) loadDetails();

  }, [id, getClinicById, getExistingClinic]);


  const { blobUrl } = useBlobUrl(clinic?.display_image?.src || '');
  const imgBlobUrl = blobUrl

  const handleRunDicomFetchCron = async () => {
    let progressInterval;
    let startTime;

    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to run DICOM Fetch Cron',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#ef4444',
      showLoaderOnConfirm: true,
      allowOutsideClick: false,

      preConfirm: async () => {
        startTime = Date.now();

        Swal.update({
          title: 'Running DICOM Fetch Cron...',
          html: `
          <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              id="cron-progress"
              class="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style="width:0%"
            ></div>
          </div>

          <div class="mt-3 text-sm">
            Elapsed Time:
            <span id="elapsed-time">0s</span>
          </div>
        `,
          showCancelButton: false,
        });

        setTimeout(() => {
          const progressBar = document.getElementById('cron-progress');
          const elapsedTime = document.getElementById('elapsed-time');

          let progress = 0;

          progressInterval = setInterval(() => {
            progress = Math.min(progress + 1, 95);

            if (progressBar) {
              progressBar.style.width = `${progress}%`;
            }

            if (elapsedTime) {
              elapsedTime.textContent =
                `${Math.floor((Date.now() - startTime) / 1000)}s`;
            }
          }, 1000);
        }, 100);

        try {
          const response = await runDicomFetchCron({
            clinic_id: id,
            cron_type: 'dicom:fetch',
            background: false,
          });

          if (response?.status !== 200) {
            clearInterval(progressInterval);

            Swal.showValidationMessage(
              response?.message || 'Failed to run DICOM Fetch Cron.'
            );

            return false;
          }

          return response;

        } catch (error) {

          clearInterval(progressInterval);

          try {
            await runDicomFetchCron({
              clinic_id: id,
              cron_type: 'dicom:fetch',
              background: true,
            });

            return {
              status: 200,
              background: true,
            };

          } catch (bgError) {

            Swal.showValidationMessage(
              bgError?.response?.data?.message ||
              'Failed to start DICOM Fetch Cron.'
            );

            return false;
          }
        }
      },
    }).then((result) => {

      clearInterval(progressInterval);

      if (!result.isConfirmed) {
        return;
      }

      const totalSeconds = Math.floor(
        (Date.now() - startTime) / 1000
      );

      if (result.value?.background) {
        Swal.fire({
          icon: 'info',
          title: 'Running in Background',
          text: 'The cron has been started in the background and will complete automatically.',
        });
        return;
      }

      if (result.value?.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `DICOM Fetch Cron completed successfully in ${totalSeconds} seconds.`,
        });
      }

    });
  };

  return (
    <div className="py-6  mx-auto">
      <Breadcrumb />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Clinic Details
        </h1>

        <button
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white btn-primary rounded-lg shadow"
          onClick={() => navigate(getRoutePath('/clinics'))}
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </button>
      </div>

      <ErrorHandle errors={errors} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Side */}
        <div className="lg:col-span-2">

          {/* Main Card */}
          <div className={`bg-white text-sm rounded-lg shadow border ${loading ? 'animate-pulse opacity-70' : ''}`}>

            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Overview</h3>
              <p className="mt-1 text-sm text-gray-500">
                Basic information about the clinic.
              </p>
            </div>

            <PageLoader loading={loading} title="Loading Clinic Details..." />

            {/* Details Grid */}
            {clinic ? (
              <>

                {/* Top Section */}
                <div className="flex items-center gap-6 p-6 border-b">

                  {/* Logo */}
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {!imgBlobUrl ? (
                      <UserIcon className="w-10 h-10 text-gray-400" />
                    ) : (
                      <img
                        src={imgBlobUrl}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  {/* Basic Info */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {clinic?.name || '-'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Code: {clinic?.code || '-'}
                    </p>

                    <div className="mt-2 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${clinic?.status === 1
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                        }`}>
                        {clinic?.is_active_status?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                  {[
                    { label: 'Email', value: clinic?.poc_email },
                    { label: 'Phone', value: clinic?.phone },
                    { label: 'Address', value: clinic?.address },
                    { label: 'City', value: clinic?.city },
                    { label: 'State', value: clinic?.state?.name },
                    { label: 'Zip', value: clinic?.zip },
                    { label: 'DICOM Enabled', value: clinic?.is_dicom_enabled ? 'Yes' : 'No' },
                    { label: 'Fax Enabled', value: clinic?.is_fax_enabled ? 'Yes' : 'No' },
                    { label: 'Fax Number', value: clinic?.fax_number },
                    { label: 'Archived', value: clinic?.is_archived ? 'Yes' : 'No' },
                    { label: 'DOI', value: clinic?.doi },
                    { label: 'Patient Report Email', value: clinic?.is_patient_report_email_enabled ? 'Enabled' : 'Disabled' },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 border">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="mt-1 font-medium text-gray-900 break-words">
                        {item.value || '-'}
                      </p>
                    </div>
                  ))}

                  {/* Description */}
                  <div className="md:col-span-2 lg:col-span-3 bg-gray-50 rounded-xl p-4 border">
                    <p className="text-xs text-gray-500">Description</p>
                    <p className="mt-1 text-gray-900">
                      {clinic?.description || '-'}
                    </p>
                  </div>

                  {/* Files */}
                  <div className="md:col-span-2 lg:col-span-3 bg-gray-50 rounded-xl p-4 border">
                    <p className="text-xs text-gray-500 mb-2">Contract Documents</p>

                    {clinic?.display_files?.length ? (
                      <div className="space-y-2">
                        {clinic.display_files.map((file, index) =>
                          file.status === 200 && (
                            <BlobFileItem
                              key={index}
                              file={file}
                              index={index}
                              onRemove={null}
                              onRemoveEnable={false}
                            />
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No files available</p>
                    )}
                  </div>

                </div>
              </>
            ) : (
              !loading && <NoRecord message="Clinic not found" />
            )}
          </div>
        </div>
        {/* Right Side */}
        <div className="lg:col-span-1 space-y-6">

          {/* Run DICOM Fetch Cron - Only for role_id === 1 */}
          {user?.role_id === 1 && (
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Run DICOM Fetch Cron</h3>
              <p className="mt-1 text-sm text-gray-500">
                Run DICOM Fetch Cron
              </p>
              <button className="mt-4 px-4 py-2 text-sm font-medium btn-primary-light rounded-lg shadow" onClick={() => handleRunDicomFetchCron()}>
                Run DICOM Fetch Cron
              </button>
            </div>
          )}

          {/* Clinic Settings Card */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Clinic Settings</h3>
            <p className="mt-1 text-sm text-gray-500 mb-4">
              Configure clinic-specific settings
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4">

              {/* Patient Settings */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Patient Settings</h4>

                {[
                  { name: 'patient_ins_billing_fields', label: 'Patient Insurance & Billing Fields' },
                  { name: 'patient_address', label: 'Patient Address Field' },
                  { name: 'emailToggle', label: 'Require Email Address' },
                  { name: 'patient_appointment_reminders', label: 'Patient Appointment Reminders' },
                ].map((field) => (
                  <div key={field.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{field.label}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleField(field.name)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settingsData[field.name] ? '' : 'bg-gray-300'
                      }`}
                      style={settingsData[field.name] ? { backgroundColor: '#009efb' } : {}}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settingsData[field.name] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Clinic Access - Only for role_id === 1 */}
              {user?.role_id === 1 && (
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Clinic Access</h4>

                  {/* Toggle - Allow adding patients without logging in */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Allow adding patients without logging in</span>
                    <button
                      type="button"
                      onClick={() => handleToggleField('allow_add_patient_without_login')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settingsData.allow_add_patient_without_login ? '' : 'bg-gray-300'
                      }`}
                      style={settingsData.allow_add_patient_without_login ? { backgroundColor: '#009efb' } : {}}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settingsData.allow_add_patient_without_login ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Clinic URL - Visible when toggle is ON, readonly */}
                  {settingsData.allow_add_patient_without_login && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Clinic URL</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          name="clinic_url"
                          value={settingsData.clinic_url}
                          readOnly
                          placeholder="https://yourclinic.com/add-patient"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 cursor-default"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(settingsData.clinic_url);
                            toast.success('Clinic URL copied to clipboard.');
                          }}
                          className="px-3 py-2 text-sm font-medium text-white rounded-lg shadow"
                          style={{ backgroundColor: '#009efb' }}
                          title="Copy URL"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Public URL where patients can submit their information
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Save Button */}
              <div className="pt-3">
                <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white btn-primary rounded-lg shadow">
                  Save Settings
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ClinicView;