import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClinic } from '../../context/ClinicContext';
import Breadcrumb from '../Common/Breadcrumb';
import ErrorHandle from '../Common/ErrorHandle';
import { useRoutePath } from '../../hooks/useRoutePath';
import { ArrowLeftIcon, UserIcon } from '@heroicons/react/24/outline';
import { useTitle } from '../../context/TitleContext';
import NoRecord from '../Common/NoRecord';
import useBlobUrl from '../../hooks/useBlobUrl';
import BlobFileItem from '../UI/BlobFileItem';
import PageLoader from '../Common/PageLoader';

const ClinicView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const getRoutePath = useRoutePath();
  const { getClinicById, getExistingClinic } = useClinic();

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState(null);
  const [clinic, setClinic] = useState(null);

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

      {/* Main Card */}
      <div className={`bg-white rounded-lg shadow border ${loading ? 'animate-pulse opacity-70' : ''}`}>

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
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Basic Info */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
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
  );
};

export default ClinicView;