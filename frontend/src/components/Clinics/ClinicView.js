import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClinic } from '../../context/ClinicContext';
import Breadcrumb from '../Common/Breadcrumb';
import ErrorHandle from '../Common/ErrorHandle';
import { useRoutePath } from '../../hooks/useRoutePath';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useTitle } from '../../context/TitleContext';
import NoRecord from '../Common/NoRecord';

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
          <h3 className="text-lg font-medium text-gray-900">Overview</h3>
          <p className="mt-1 text-sm text-gray-500">
            Basic information about the clinic.
          </p>

          { clinic ? (
            <div className="mt-4">
              <p><strong>Name:</strong> {clinic.name}</p>
              <p><strong>Code:</strong> {clinic.code}</p>
            </div>
          ) : (
            <>
            
             {!loading && <NoRecord message="Clinic not found" />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicView;