import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PatientForm from './PatientForm';
import { usePatient } from '../../context/PatientContext';
import { useRoutePath } from '../../hooks/useRoutePath';
import PageLoader from '../Common/PageLoader';
import { useTitle } from '../../context/TitleContext';

const PatientGuestForm = () => {
  const [searchParams] = useSearchParams();
  const { verifyGuestToken } = usePatient();
  const getRoutePath = useRoutePath();
  const { setPageTitle } = useTitle();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  const registered = useRef(false);

  const encodedClinicId = searchParams.get('id') || '';
  const signature = searchParams.get('signature') || '';

  const clinicId = encodedClinicId
    ? atob(encodedClinicId.replace(/-/g, '+').replace(/_/g, '/'))
    : '';
 
    useEffect(() => {
      setPageTitle('Patient Form');
    }, [setPageTitle]);

  useEffect(() => {
    const verify = async () => {
      try {
        if (!clinicId) {
          setIsVerified(false);
          return;
        }

        const response = await verifyGuestToken(searchParams.get('id'), signature);
        setIsVerified(response?.status === 200);
      } catch (error) {
        setIsVerified(false);
      } finally {
        setLoading(false);
      }
    };

    if (!registered.current) {
      registered.current = true; // assignment, not comparison
      verify();
    }
  }, [clinicId, signature, verifyGuestToken,searchParams]);

  if (loading) {
      
    return (
    <>
       <div className="mb-2 p-10">

        <div className="bg-white px-6 py-4 border-b rounded-t-lg shadow-sm border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
           Patient Form
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Please wait while we load the patient form.
          </p>
        </div>
          <PageLoader loading={loading} title="Loading Patient Form..." />
        </div>
         
        
    </>
    );
  }

  return isVerified ? (
    <>
     
      <PatientForm
        isGuest={true}
        guestClinicId={clinicId}
        guestSignature={signature}
      />

    </>
  ) : (
    <div className="py-10 flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg text-center p-5">
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
            />
          </svg>
        </div>
    
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Access Denied
        </h1>
    
        <p className="text-gray-600 mb-6">
          You do not have permission to add a patient. Please contact the clinic administrator.
        </p>
    
        <Link
          to={getRoutePath('/dashboard')}
          className="inline-flex items-center px-5 py-2.5 rounded-lg btn-primary font-medium  transition"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default PatientGuestForm;