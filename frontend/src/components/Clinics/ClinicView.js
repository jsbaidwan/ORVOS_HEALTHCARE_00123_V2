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

const ClinicView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const getRoutePath = useRoutePath();
  const { getClinicById,getExistingClinic } = useClinic();

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
        const data = await getClinicById(id);
        
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
    <div className="py-6">
      <Breadcrumb />

      <div className="mb-3">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Clinic Details
          </h1>

          <button
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white btn-primary rounded-md shadow-sm"
            onClick={() => navigate(getRoutePath('/clinics'))}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to List
          </button>
        </div>
      </div>

      <ErrorHandle errors={errors} />

      <div className={`${loading ? 'blur-sm animate-pulse' : ''} bg-white rounded-lg border border-gray-200 shadow-sm`}>
        <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Overview</h3>
            <p className="mt-1 text-sm text-gray-500">
                Basic information about the clinic.
            </p>
            </div>
             
            {clinic ? (
            <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6"> 
                
                <div className="flex flex-col items-start gap-2">
                  <p className="text-sm text-gray-500">Logo</p>

                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                    {!imgBlobUrl ? (
                      <UserIcon className="w-10 h-10 rounded-full object-cover border border-gray-80 bg-gray-50" />
                    ) : (
                    <img
                      src={imgBlobUrl}
                      alt=""
                      onLoad={() => setLoading(false)}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        loading ? "opacity-0" : "opacity-100"
                      }`}
                    />
                    )}

                    {loading && (
                      <div className="absolute inset-0 rounded-full bg-gray-200 animate-pulse"></div>
                    )}
                  </div>
                </div>
                
                <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="mt-1 text-gray-900 font-medium">{clinic?.name || '-'}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Code</p>
                    <p className="mt-1 text-gray-900 font-medium">{clinic?.code || '-'}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="mt-1 text-gray-900 font-medium">{clinic?.poc_email || '-'}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="mt-1 text-gray-900 font-medium">{clinic?.phone || '-'}</p>
                </div>
              
                <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="mt-1 text-gray-900 font-medium">{clinic?.address || '-'}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">City</p>
                    <p className="mt-1 text-gray-900 font-medium">{clinic?.city || '-'}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">State</p>
                    <p className="mt-1 text-gray-900 font-medium">{clinic?.state?.name || '-'}</p>
                </div>
               
                <div>
                    <p className="text-sm text-gray-500">Zip</p>
                    <p className="mt-1 text-gray-900 font-medium">{clinic?.zip || '-'}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        clinic?.status === 1
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                       {clinic.is_active_status?.name
                        ? clinic.is_active_status.name.charAt(0).toUpperCase() + clinic.is_active_status.name.slice(1)
                        : ''}
                    </span>
                </div>

                <div>
                    <p className="text-sm text-gray-500">DICOM Enabled</p>
                    <p className="mt-1 text-gray-900 font-medium">{clinic?.is_dicom_enabled ? 'Yes' : 'No'}</p>
                </div>
 
                <div>
                    <p className="text-sm text-gray-500">Patient Report Email</p>
                    <p className="mt-1 text-gray-900 font-medium">{clinic?.is_patient_report_email_enabled ? 'Enabled' : 'Disabled'}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Fax Enabled</p>
                    <p className="mt-1 text-gray-900 font-medium">{clinic?.is_fax_enabled ? 'Yes' : 'No'}</p>
                </div>
 
                <div>
                    <p className="text-sm text-gray-500">Fax Number</p>
                    <p className="mt-1 text-gray-900 font-medium">{clinic?.fax_number || '-'}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Archived</p>
                    <p className="mt-1 text-gray-900 font-medium">{clinic?.is_archived ? 'Yes' : 'No'}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Date of Incorporation</p>
                    <p className="mt-1 text-gray-900 font-medium">{clinic?.doi || '-'}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="mt-1 text-gray-900 font-medium">{clinic?.description || '-'}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Contract Documents</p>
                    <ul className="mt-1 space-y-2">
                    {clinic?.display_files?.map((file, index) =>
                      file.status === 200 && (
                        <BlobFileItem
                          key={`db-${index}`}
                          file={file}
                          index={index}
                          onRemove={null}
                          onRemoveEnable={false}
                        />
                      )
                    )}
                    </ul>
                </div>

            </div>
            ) : (
            <>
                {!loading && <NoRecord message="Clinic not found" />}
            </>
            )}
        </div>
         
    </div>
  );
};

export default ClinicView;