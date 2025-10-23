import React, { useCallback, useEffect, useRef, useState } from 'react';
import Api from '../../utils/api';
import { useDecode } from '../../hooks/useDecode';
import ReCAPTCHA from 'react-google-recaptcha';

const GoogleCaptchaLogin = ({ onVerify }) => {
  const [rawSiteKey, setRawSiteKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const loadDataRef = useRef(false);
  
  // Decode once at top level
  const { decodedValue: siteKey } = useDecode(rawSiteKey || '', 'password');

  /** Fetch recaptcha keys */
  const getRecaptchaKeys = useCallback(async () => {
    const defaultSiteKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
    const defaultSecretKey = '6LeIxAcTAAAAAMszoGRg-rOQDVj75ubvfngVuKIH';
    try {
      const api = Api(() => null);
      const response = await api.call('get-recaptcha-keys', 'GET', false);
 
      const fetchedSiteKey =
        response?.data?.recaptchaCredentails?.site_key || defaultSiteKey;
      const fetchedSecretKey =
        response?.data?.recaptchaCredentails?.secret_key || defaultSecretKey;

      return { siteKey: fetchedSiteKey, secretKey: fetchedSecretKey };
    } catch {
      return {
        siteKey: defaultSiteKey,
        secretKey: defaultSecretKey,
      };
    }
  }, []);

  useEffect(() => {
    const fetchRecaptchaKeys = async () => {
      const { siteKey } = await getRecaptchaKeys();
      setRawSiteKey(siteKey);
      // Wait 1 second before showing the CAPTCHA
      setTimeout(() => setIsLoading(false), 1000);
    };

    if (!loadDataRef.current) {
      loadDataRef.current = true;
      fetchRecaptchaKeys();
    }
  }, [getRecaptchaKeys]);

  const handleChange = (token) => {
    onVerify && onVerify(token);
  };

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md flex justify-center items-center"> 
         <div className="inset-0 flex flex-col items-center justify-center bg-white z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500"></div>
            {/* <svg
              className="animate-spin h-8 w-8 text-primary-600"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                 5.291A7.962 7.962 0 014 12H0c0 3.042 
                 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg> */}
            <p className="text-xs text-gray-500 mt-2">Loading reCAPTCHA...</p>
          </div>
       </div>
    );
  }

  if (!siteKey) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex justify-center items-center">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg flex justify-center">
        <div className="g-recaptcha transform scale-[0.85] sm:scale-100 origin-center">
          <ReCAPTCHA
            sitekey={siteKey}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default GoogleCaptchaLogin;
