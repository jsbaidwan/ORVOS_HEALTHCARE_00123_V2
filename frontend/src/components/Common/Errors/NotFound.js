import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRoutePath } from '../../../hooks/useRoutePath';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useTitle } from '../../../context/TitleContext';
  
const NotFound = () => {
  const getRoutePath = useRoutePath();
  const { setPageTitle } = useTitle();

  useEffect(() => {
    setPageTitle('404 Page Not Found');
  }, [setPageTitle]);
 
  return (
    <>
        
        <div className="flex items-center justify-center min-h-[70vh] px-4 bg-gray-50 ">
        
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                
                {/* Icon */}
                <div className="flex justify-center mb-5">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                </div>
                </div>

                {/* 404 */}
                <h1 className="text-5xl font-bold text-gray-800">404</h1>

                {/* Title */}
                <h2 className="mt-2 text-xl font-semibold text-gray-700">
                Page Not Found
                </h2>

                {/* Message */}
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                The page you’re looking for doesn’t exist or you may not have permission to view it.
                </p>

                {/* Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                
                <Link
                    to={getRoutePath('/')}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-5 py-2.5 text-sm font-medium text-white btn-primary rounded-md shadow-sm"
                >
                    Go to Dashboard
                </Link>

                <button
                    onClick={() => window.history.back()}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                    Go Back
                </button>

                </div>

                {/* Footer note */}
                <p className="mt-6 text-xs text-gray-400">
                If you believe this is an error, please contact support.
                </p>

            </div>
        </div>
         
        
    </>
  );
};

export default NotFound;