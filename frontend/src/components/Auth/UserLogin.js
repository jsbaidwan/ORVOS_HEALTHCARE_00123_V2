import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import GoogleCaptchaLogin from './GoogleCaptchaLogin';
import ErrorHandle from '../Common/ErrorHandle';
import { useRoutePath } from '../../hooks/useRoutePath'
import { useNavigate } from 'react-router-dom';

// Validation schema
const loginSchema = yup.object({
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

const UserLogin = () => {
  const { login } = useAuth();
  const getRoutePath = useRoutePath();
  const adminPrefix = process.env.REACT_APP_ADMIN_ROUTE_PREFIX || 'admin';
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const navigate = useNavigate();
  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setError
     
  } = useForm({
    resolver: yupResolver(loginSchema),
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
      setError('general',{type: 'manual', message: 'Please complete the reCAPTCHA verification'});
      return;
    }

    try {
      const response = await login(data);
      if (response.status === 200) {
        navigate('/dashboard');
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
        }else if(response === false){
          setError('general', {
            type: 'manual',
            message: 'Login failed. Please try again.',
          });
        }
      }
    } catch (error) {
      setError('general', {type: 'manual', message: 'An unexpected error occurred. Please try again.'});
    }
  };

  return (
    
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
            <svg className="w-12 h-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Orvos</h1>
          <p className="text-primary-200">User Login</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Welcome Back
          </h2>
  
          {/* Display form errors from context */}
          <ErrorHandle errors={errors} title="ERROR:- Login Failed" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                {...register('email')}
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                className={`text-black  input-field ${errors?.password ? 'border-red-500 focus:border-red-500' : ''}`}
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
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="useGoogleCaptcha" className="ml-2 text-sm text-gray-700 flex-1">
                Use Google reCAPTCHA v2 verification (Recommended)
              </label>
            </div> */}

            {useGoogleCaptcha && <GoogleCaptchaLogin onVerify={handleCaptchaVerify}  />}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="flex items-center justify-between text-sm">
            <Link to={getRoutePath('/forgot-password')} className="text-gray-600 hover:text-gray-900">
                Forgot password?
              </Link>
              <Link to={`/${adminPrefix}/login`} className="text-primary-600 hover:text-primary-700">
                Admin Login
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-primary-200 text-sm mt-6">
          © {new Date().getFullYear()} Orvos. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default UserLogin;

