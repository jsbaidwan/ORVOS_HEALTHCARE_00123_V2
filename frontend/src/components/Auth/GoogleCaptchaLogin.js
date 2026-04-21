import React, { useCallback, useEffect, useRef, useState } from 'react';
import Api from '../../utils/api';
import { useDecode } from '../../hooks/useDecode';
import ReCAPTCHA from 'react-google-recaptcha';
import ErrorHandle from '../Common/ErrorHandle';

/**
 * Google reCAPTCHA wrapper.
 *
 * NOTE on "reCAPTCHA Timeout (b)":
 * Google's reCAPTCHA script has an internal timer that fires ~2 minutes
 * after the challenge is solved. If the widget is unmounted (e.g. after a
 * successful login + navigate) or the token is not consumed in time,
 * the script throws an uncaught error like:
 *     Uncaught (in promise) Timeout (b)
 * which React's dev overlay surfaces as a runtime error.
 *
 * We handle this by:
 *   1. Calling `onVerify(null)` on expire/error so the parent state resets.
 *   2. Resetting the widget on unmount so Google's internal timer is cleared.
 *   3. Installing a one-time global handler that swallows this specific
 *      harmless error instead of letting it bubble up to the overlay.
 */

// Install the global suppressor only once, at module load time.
let __recaptchaErrorHandlerInstalled = false;
const installRecaptchaErrorHandler = () => {
  if (__recaptchaErrorHandlerInstalled || typeof window === 'undefined') return;
  __recaptchaErrorHandlerInstalled = true;

  const isRecaptchaTimeout = (msg, source) => {
    const m = String(msg || '');
    const s = String(source || '');
    return (
      /Timeout\s*\(\w+\)/i.test(m) &&
      (/recaptcha/i.test(s) || /gstatic\.com/i.test(s) || /google\.com\/recaptcha/i.test(s))
    );
  };

  window.addEventListener(
    'error',
    (event) => {
      if (isRecaptchaTimeout(event?.message, event?.filename)) {
        event.preventDefault();
        event.stopImmediatePropagation?.();
        return false;
      }
    },
    true
  );

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const msg = reason?.message || reason;
    if (isRecaptchaTimeout(msg, reason?.stack)) {
      event.preventDefault();
    }
  });
};

const DEFAULT_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
const DEFAULT_SECRET_KEY = '6LeIxAcTAAAAAMszoGRg-rOQDVj75ubvfngVuKIH';

const GoogleCaptchaLogin = ({ onVerify }) => {
  const [rawSiteKey, setRawSiteKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadDataRef = useRef(false);
  const recaptchaRef = useRef(null);

  const { decodedValue: siteKey } = useDecode(rawSiteKey || '', 'password');

  useEffect(() => {
    installRecaptchaErrorHandler();
  }, []);

  const getRecaptchaKeys = useCallback(async () => {
    try {
      const api = Api(() => null);
      const response = await api.call('get-recaptcha-keys', 'GET', false);

      if (response.status !== 200) {
        setError(response?.error?.message);
        return { siteKey: DEFAULT_SITE_KEY, secretKey: DEFAULT_SECRET_KEY };
      }
      return {
        siteKey: response?.data?.recaptchaCredentails?.site_key || DEFAULT_SITE_KEY,
        secretKey: response?.data?.recaptchaCredentails?.secret_key || DEFAULT_SECRET_KEY,
      };
    } catch (err) {
      setError('Failed to fetch reCAPTCHA keys');
      return { siteKey: DEFAULT_SITE_KEY, secretKey: DEFAULT_SECRET_KEY };
    }
  }, []);

  useEffect(() => {
    if (loadDataRef.current) return;
    loadDataRef.current = true;

    let cancelled = false;
    (async () => {
      const { siteKey: fetched } = await getRecaptchaKeys();
      if (cancelled) return;
      setRawSiteKey(fetched);
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [getRecaptchaKeys]);

  // Clear the widget on unmount so Google's internal timers are released
  // and we never get the stray "Timeout (b)" after navigation.
  useEffect(() => {
    // Capture the ref in a local so the cleanup uses the instance that
    // existed when this effect ran (avoids react-hooks/exhaustive-deps warning).
    const captchaNode = recaptchaRef;
    return () => {
      try {
        captchaNode.current?.reset();
      } catch (e) {
        /* noop */
      }
    };
  }, []);

  const handleChange = useCallback(
    (token) => {
      if (!token) {
        onVerify && onVerify(null);
        return;
      }
      onVerify && onVerify(token);
    },
    [onVerify]
  );

  const handleExpired = useCallback(() => {
    try {
      recaptchaRef.current?.reset();
    } catch (e) {
      /* noop */
    }
    onVerify && onVerify(null);
  }, [onVerify]);

  const handleErrored = useCallback(() => {
    try {
      recaptchaRef.current?.reset();
    } catch (e) {
      /* noop */
    }
    onVerify && onVerify(null);
  }, [onVerify]);

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md flex justify-center items-center">
        <div className="inset-0 flex flex-col items-center justify-center bg-white z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500"></div>
          <p className="text-xs text-gray-500 mt-2">Loading reCAPTCHA...</p>
        </div>
      </div>
    );
  }

  if (error) return <ErrorHandle errors={error} title="ERROR:- reCAPTCHA Loading Failed" />;

  if (!siteKey) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex justify-center items-center">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg flex justify-center">
        <div className="g-recaptcha transform scale-[0.85] sm:scale-100 origin-center">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={siteKey}
            onChange={handleChange}
            onExpired={handleExpired}
            onErrored={handleErrored}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(GoogleCaptchaLogin);
