import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClinicGroup } from '../../context/ClinicGroupContext';
import Breadcrumb from '../Common/Breadcrumb';
import ErrorHandle from '../Common/ErrorHandle';
import { useRoutePath } from '../../hooks/useRoutePath';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useTitle } from '../../context/TitleContext';
import NoRecord from '../Common/NoRecord';

const ClinicGroupView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const getRoutePath = useRoutePath();
  const { getClinicGroupById,getExistingClinicGroup } = useClinicGroup();
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState(null);
  const [clinicGroup, setClinicGroup] = useState(null);
  const { setPageTitle } = useTitle();
  
  useEffect(() => {
    setPageTitle('Clinic Group View');
  }, [setPageTitle]);

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      setErrors(null);
  
      try {
        const existingClinicGroup = getExistingClinicGroup(id);
  
        // ✅ Use cached data if available
        if (existingClinicGroup) {
          setClinicGroup(existingClinicGroup);
          setLoading(false);
          
        }
  
        // ❌ Otherwise call API
        const data = await getClinicGroupById(id);
  
        if (data?.status && data?.status !== 200) {
          setErrors({
            general: data?.message || 'Unable to load clinic group'
          });
        } else {
          setClinicGroup(data?.clinicGroup);
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
  
  }, [id, getClinicGroupById, getExistingClinicGroup]);
 
  return (
    <div className="py-6">
      <Breadcrumb />

      <div className="mb-3">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Clinic Group Details</h1>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white btn-primary"
              onClick={() => navigate(getRoutePath('/clinic-groups'))}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" />  Back to List
            </button> 
          </div>
        </div>
      </div>
 
      <ErrorHandle errors={errors} />

      <div className={`${loading ? 'blur-sm animate-pulse' : ''} bg-white rounded-lg border border-gray-200 shadow-sm`}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Overview</h3>
          <p className="mt-1 text-sm text-gray-500">
            Basic information about the clinic group.
          </p>
        </div>
       
        {clinicGroup ? (
          <>
           <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6"> 
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="mt-1 text-gray-900 font-medium">{clinicGroup?.name || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Code</p>
              <p className="mt-1 text-gray-900 font-medium">{clinicGroup?.code || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span
                className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  clinicGroup?.active === 1
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {clinicGroup?.is_active_status?.name
                  ? clinicGroup.is_active_status.name.charAt(0).toUpperCase() +
                    clinicGroup.is_active_status.name.slice(1)
                  : '-'}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="mt-1 text-gray-900 font-medium">
                {clinicGroup?.formated_created_at || '-'}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Description</p>
              <p className="mt-1 text-gray-900">{clinicGroup?.description || '-'}</p>
            </div>
          </div>
        </>
         
        ) : (
          <>
          {!loading && <NoRecord message="Clinic Group not found" />}
         </>
        )}
        
      </div>
    </div>
  );
};

export default ClinicGroupView;


