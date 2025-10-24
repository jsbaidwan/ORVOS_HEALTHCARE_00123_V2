import React, {   useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon,ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useTitle } from '../../context/TitleContext';
import { useForgotPassword } from '../../context/ForgotPasswordContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ErrorHandle from '../Common/ErrorHandle';
import { toast } from 'sonner';
import { errorsFormatted } from '../../utils/errorHandler';
import { useLoader } from '../../context/LoaderContext';
  
// Validation schema
const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

const ForgotPassword = () => {
  const { setPageTitle } = useTitle();
  const { 
    isSubmitting, 
    error, 
    email, 
    sendResetEmail, 
    
  } = useForgotPassword();
  const { showLoader, hideLoader } = useLoader();
  const [isSuccess, setIsSuccess] = useState('');
  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    }
  });

  const onSubmit = async (data) => {
    showLoader();
    try {
      const response = await sendResetEmail(data);
      
      if (response?.status === 200) {
        toast.success(response?.message);
        setIsSuccess(response?.message);
        reset();
      } else {
        errorsFormatted(response,setError)
      }
    } catch (error) {
      errorsFormatted(error,setError)
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    
    setPageTitle('Forgot Password');
  }, [setPageTitle]);

  return (
    <div className="min-h-[70vh] sm:min-h-[70vh] bg-white flex items-center justify-center px-4 py-5 sm:py-10">
      
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        {/* <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
            <svg className="w-12 h-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Orvos</h1>
          <p className="text-primary-200">Password Recovery</p>
        </div> */}

        {/* Forgot Password Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {!isSuccess ? (
            <>
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-6">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-2">
                      <ShieldCheckIcon className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
                </div>
                <p className="text-gray-600 text-sm">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              
              {/* Display form errors from context */}
              <ErrorHandle errors={errors} title="ERROR:- Password Reset Failed" />

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      {...register('email')}
                      placeholder="Enter your email"
                      className={`pl-10 input-field ${errors?.email ? 'border-red-500 focus:border-red-500' : ''}`}
                      disabled={isSubmitting}
                    />
                  
                  </div>
                  {errors?.email && (
                      <p className="mt-1 text-sm text-red-600">{errors?.email?.message}</p>
                    )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>

                <div className="text-center mt-4">
                  <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700 flex items-center justify-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Login
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h3>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Didn't receive the email?</strong><br />
                  Check your spam folder or{' '}
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    try again
                  </button>
                </p>
              </div>
              <Link to="/login" className="btn-primary inline-block">
                Return to Login
              </Link>
            </div>
          )}
        </div>
 
      </div>
    </div>
  );
};

export default ForgotPassword;


