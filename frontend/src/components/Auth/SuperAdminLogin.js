import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import GoogleCaptchaLogin from './GoogleCaptchaLogin';
import ErrorHandle from '../Common/ErrorHandle';
import { useRoutePath } from '../../hooks/useRoutePath';
import { useNavigate } from 'react-router-dom';
import { useLoader } from '../../context/LoaderContext';
 
// Validation schema
const adminLoginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  useGoogleCaptcha: yup.boolean()
});

const SuperAdminLogin = () => {
  const { login } = useAuth();
  const getRoutePath = useRoutePath();
  const adminPrefix = process.env.REACT_APP_ADMIN_ROUTE_PREFIX || 'admin';
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  
  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setError
  } = useForm({
    resolver: yupResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
      useGoogleCaptcha: true
    }
  });

  const useGoogleCaptcha = watch('useGoogleCaptcha');

  const handleCaptchaVerify = (verified) => {
    setCaptchaVerified(verified);
  };

  const onSubmit = async (data) => {
    
    // Check reCAPTCHA verification if enabled
    if (data.useGoogleCaptcha && !captchaVerified) {
      setError('general', { type: 'manual', message: 'Please complete the reCAPTCHA verification' });
      return;
    }

    showLoader();
    try {
      data.is_admin = true;
      const response = await login(data);
      if (response.status === 200) {
        navigate(`/${adminPrefix}/dashboard`);
      } else {
        if (response.errors) {
          Object.entries(response?.errors).forEach(([field, message]) => {
            setError(field, {
              type: 'manual',
              message,
            });
          });
        } else if (response.error?.message) {
          setError('general', {
            type: 'manual',
            message: response.error.message,
          });
        } else if (response === false) {
          setError('general', {
            type: 'manual',
            message: 'Login failed. Please try again.',
          });
        }
      }
    } catch (error) {
      setError('general', { type: 'manual', message: 'An unexpected error occurred. Please try again.' });
    } finally {
      hideLoader();
    }
  };

  return (
     
    <div className="min-h-[70vh] sm:min-h-[70vh] bg-white flex items-center justify-center px-4 py-5 sm:py-10">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        {/* <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Orvos</h1>
          <p className="text-gray-400">Super Admin Access</p>
        </div> */}

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-2">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
          </div>

          {/* Display form errors */}
          <ErrorHandle errors={errors} title="ERROR:- Admin Login Failed" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                id="email"
                {...register('email')}
                placeholder="Enter admin email"
                className={`text-black input-field ${errors?.email ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors?.email && (
                <p className="mt-1 text-sm text-red-600">{errors?.email?.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                {...register('password')}
                placeholder="Enter admin password"
                className={`text-black input-field ${errors?.password ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors?.password && (
                <p className="mt-1 text-sm text-red-600">{errors?.password?.message}</p>
              )}
            </div>

            {/* Google Captcha Option */}
            {/* <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="useGoogleCaptcha"
                {...register('useGoogleCaptcha')}
                className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
              />
              <label htmlFor="useGoogleCaptcha" className="ml-2 text-sm text-gray-700 flex-1">
                Use Google reCAPTCHA v2 verification (Recommended)
              </label>
            </div> */}

            {useGoogleCaptcha && <GoogleCaptchaLogin onVerify={handleCaptchaVerify} />}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing In...' : 'Admin Sign In'}
            </button>

            <div className="flex items-center justify-between text-sm">
              <Link to={getRoutePath('/forgot-password')} className="text-gray-600 hover:text-gray-900">
                Forgot password?
              </Link>
              <Link to={getRoutePath('/login')} className="text-gray-600 hover:text-gray-900">
                ← User Login
              </Link>
            </div>
          </form>
        </div>
 
      </div>
    </div>
     
    )
    
};

export default SuperAdminLogin;

