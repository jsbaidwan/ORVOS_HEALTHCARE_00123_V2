import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import GoogleCaptchaLogin from './GoogleCaptchaLogin';
import { useRoutePath } from '../../hooks/useRoutePath'

const SuperAdminLogin = () => {
  const { login } = useAuth();
  const getRoutePath = useRoutePath();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    useGoogleCaptcha: true, // Enable by default for admin security
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

    // Check reCAPTCHA verification if enabled (with graceful degradation)
    if (formData.useGoogleCaptcha && !captchaVerified) {
      // Show warning but allow proceeding after confirmation
      const proceed = window.confirm(
        'reCAPTCHA verification is not complete. This may be due to network issues.\n\n' +
        'Do you want to proceed without reCAPTCHA verification?'
      );
      
      if (!proceed) {
        setError('Please complete the reCAPTCHA verification or disable it to continue');
        return;
      }
    }

    const result = await login(formData.email, formData.password, 'admin');
    if (!result.success) {
      setError(result.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Orvos</h1>
          <p className="text-gray-400">Super Admin Access</p>
        </div>

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

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter admin email"
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
                placeholder="Enter admin password"
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
                className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
              />
              <label htmlFor="useGoogleCaptcha" className="ml-2 text-sm text-gray-700 flex-1">
                Use Google reCAPTCHA v2 verification (Recommended)
              </label>
            </div> */}

            {formData.useGoogleCaptcha && <GoogleCaptchaLogin onVerify={handleCaptchaVerify} />}

            <button type="submit" className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 font-semibold text-base">
              Admin Sign In
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

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © {new Date().getFullYear()} Orvos. Secure Admin Access.
        </p>
      </div>
    </div>
  );
};

export default SuperAdminLogin;

