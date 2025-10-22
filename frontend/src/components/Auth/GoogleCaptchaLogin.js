import React, { useCallback, useEffect, useRef, useState } from 'react';
import Api from '../../utils/api';
import { useDecode } from '../../hooks/useDecode';
import ReCAPTCHA from 'react-google-recaptcha';

const GoogleCaptchaLogin = ({ onVerify }) => {
  const [rawSiteKey, setRawSiteKey] = useState(null);
  const loadDataRef = useRef(false);

  // Decode once at top level
  const { decodedValue: siteKey } = useDecode(rawSiteKey || '', 'password');

  /** Fetch recaptcha keys */
  const getRecaptchaKeys = useCallback(async () => {
    try {
      const api = Api(() => null);
      const response = await api.call('get-recaptcha-keys', 'GET', false);

      const defaultSiteKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
      const defaultSecretKey = '6LeIxAcTAAAAAMszoGRg-rOQDVj75ubvfngVuKIH';

      const fetchedSiteKey =
        response?.data?.recaptchaCredentails?.site_key || defaultSiteKey;
      const fetchedSecretKey =
        response?.data?.recaptchaCredentails?.secret_key || defaultSecretKey;

      return { siteKey: fetchedSiteKey, secretKey: fetchedSecretKey };
    } catch {
      return {
        siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
        secretKey: '6LeIxAcTAAAAAMszoGRg-rOQDVj75ubvfngVuKIH',
      };
    }
  }, []);

  useEffect(() => {
    const fetchRecaptchaKeys = async () => {
      const { siteKey } = await getRecaptchaKeys();
      setRawSiteKey(siteKey);
    };

    if (!loadDataRef.current) {
      loadDataRef.current = true;
      fetchRecaptchaKeys();
    }
  }, [getRecaptchaKeys]);

  const handleChange = (token) => {
    onVerify && onVerify(token);
  };

  // Don't render ReCAPTCHA until siteKey is loaded
  if (!siteKey) return null;

  return (
    <div>
      <ReCAPTCHA
        sitekey={siteKey} // corrected
        onChange={handleChange} // triggered when user completes CAPTCHA
      />
    </div>
  );
};

export default GoogleCaptchaLogin;
