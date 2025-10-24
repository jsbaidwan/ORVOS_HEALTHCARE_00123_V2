import React, { useState, useEffect } from 'react';
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
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
//import { useToast } from "../../context/ToastContext";
import { useTitle } from '../../context/TitleContext';
import { toast } from 'sonner';
import { errorsFormatted } from '../../utils/errorHandler';

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
  const [showPassword, setShowPassword] = useState(false);
  const { setPageTitle } = useTitle();
  //const { showToast } = useToast();
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
        toast.success(response?.message);
        //showToast(response?.message, "success");
        navigate(`/${adminPrefix}/dashboard`);
      } else {
        errorsFormatted(response,setError)
         
      }
    } catch (error) {
      setError('general', { type: 'manual', message: 'An unexpected error occurred. Please try again.' });
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    setPageTitle('Admin Login');
  }, [setPageTitle]);

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
              <ShieldCheckIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
          </div>

          {/* Display form errors */}
          <ErrorHandle errors={errors} title="ERROR:- Admin Login Failed" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete='off'>
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
                  className={`pl-10 text-black input-field ${errors?.email ? 'border-red-500 focus:border-red-500' : ''}`}
                />
              </div>
              {errors?.email && (
                <p className="mt-1 text-sm text-red-600">{errors?.email?.message}</p>
              )}

            </div>
 
            <div className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>

              {/* Input group */}
              <div className="flex relative w-full">
                {/* Left icon */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="w-5 h-5 text-gray-400" />
                </div>

                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  {...register('password')}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-5 text-sm sm:text-base text-black py-2 sm:py-2.5 border rounded-tl-md rounded-bl-md focus:outline-none focus:ring-1 ${
                    errors?.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />

                {/* Right icon (Eye/EyeSlash) */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="relative inset-y-0 right-0 flex items-center justify-center bg-white border px-3 p-3  focus:outline-none rounded-tr-lg rounded-br-lg"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              </div>

              {errors?.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

 
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

