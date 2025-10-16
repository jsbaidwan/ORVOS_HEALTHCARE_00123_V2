import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import GoogleCaptchaLogin from './GoogleCaptchaLogin';
import { useRoutePath } from '../../hooks/useRoutePath'

const UserLogin = () => {
  const { login } = useAuth();
  const getRoutePath = useRoutePath();
  const adminPrefix = process.env.REACT_APP_ADMIN_ROUTE_PREFIX || 'admin';
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    useGoogleCaptcha: true, // Enable by default for security
  });
  const [error, setError] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleCaptchaVerify = (verified) => {
    setCaptchaVerified(verified);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check reCAPTCHA verification if enabled
    if (formData.useGoogleCaptcha && !captchaVerified) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }

    const result = await login(formData.email, formData.password, 'user');
    if (!result.success) {
      setError(result.error || 'Login failed. Please try again.');
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

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="input-field"
                required
              />
            </div>

            {/* Google Captcha Option */}
            {/* <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="useGoogleCaptcha"
                name="useGoogleCaptcha"
                checked={formData.useGoogleCaptcha}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="useGoogleCaptcha" className="ml-2 text-sm text-gray-700 flex-1">
                Use Google reCAPTCHA v2 verification (Recommended)
              </label>
            </div> */}

            {formData.useGoogleCaptcha && <GoogleCaptchaLogin onVerify={handleCaptchaVerify} />}

            <button type="submit" className="w-full btn-primary py-3 text-base">
              Sign In
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

