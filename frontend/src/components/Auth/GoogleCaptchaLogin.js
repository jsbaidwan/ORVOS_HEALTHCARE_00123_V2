import React, { useEffect, useRef, useState } from 'react';

const GoogleCaptchaLogin = ({ onVerify }) => {
  const recaptchaRef = useRef(null);
  const widgetIdRef = useRef(null);
  const isLoadingRef = useRef(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const siteKey =
      process.env.REACT_APP_RECAPTCHA_SITE_KEY ||
      '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Google test key

    let timeoutId;
    let isComponentMounted = true;
    isLoadingRef.current = true;

    // Define global callbacks
    window.onRecaptchaSuccess = (token) => {
      onVerify?.(true);
    };

    window.onRecaptchaExpired = () => {
      onVerify?.(false);
    };

    window.onRecaptchaError = () => {
      onVerify?.(false);
      if (isComponentMounted) {
        setHasError(true);
        setIsLoading(false);
      }
    };

    const renderRecaptcha = () => {
      if (!isComponentMounted) return;

      if (window.grecaptcha && window.grecaptcha.render && recaptchaRef.current) {
        // Check if already rendered by widget ID
        if (widgetIdRef.current !== null) {
          if (isComponentMounted) {
            isLoadingRef.current = false;
            setIsLoading(false);
          }
          return;
        }

        // Check if the element already has reCAPTCHA children
        if (recaptchaRef.current.children.length > 0) {
          if (isComponentMounted) {
            isLoadingRef.current = false;
            setIsLoading(false);
          }
          return;
        }

        try {
          widgetIdRef.current = window.grecaptcha.render(recaptchaRef.current, {
            sitekey: siteKey,
            callback: window.onRecaptchaSuccess,
            'expired-callback': window.onRecaptchaExpired,
            'error-callback': window.onRecaptchaError,
            theme: 'light',
            size: 'normal',
          });
          
          if (isComponentMounted) {
            isLoadingRef.current = false;
            setIsLoading(false);
            setHasError(false);
          }
        } catch (error) {
         
          // If it's already rendered error, just mark as loaded
          if (error.message && error.message.includes('already been rendered')) {
            if (isComponentMounted) {
              isLoadingRef.current = false;
              setIsLoading(false);
              setHasError(false);
            }
          } else if (isComponentMounted) {
            isLoadingRef.current = false;
            setHasError(true);
            setIsLoading(false);
          }
        }
      }
    };

    // Called after script load
    window.onRecaptchaLoad = () => {
      clearTimeout(timeoutId);
      renderRecaptcha();
    };

    // Check if the reCAPTCHA script is already loaded
    const existingScript = document.querySelector(
      'script[src*="recaptcha/api.js"]'
    );

    if (!existingScript) {
      // Load the script
      const script = document.createElement('script');
      script.src =
        'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        if (isComponentMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      };
      document.body.appendChild(script);

      // Set timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        if (isComponentMounted && isLoadingRef.current) {
          isLoadingRef.current = false;
          setHasError(true);
          setIsLoading(false);
        }
      }, 10000); // 10 seconds timeout
    } else if (window.grecaptcha && window.grecaptcha.render) {
      // Script already loaded
      renderRecaptcha();
    } else {
      // Script exists but not ready yet, wait for it
      timeoutId = setTimeout(() => {
        if (window.grecaptcha && window.grecaptcha.render) {
          renderRecaptcha();
        } else if (isComponentMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }, 2000);
    }

    // Cleanup function
    return () => {
      isComponentMounted = false;
      clearTimeout(timeoutId);
      
      if (window.grecaptcha && widgetIdRef.current !== null) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
      widgetIdRef.current = null;
    };
  }, [onVerify]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-center min-h-[78px] relative">
        {/* Loading Overlay */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
            <svg
              className="animate-spin h-8 w-8 text-primary-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-xs text-gray-500 mt-2">Loading reCAPTCHA...</p>
          </div>
        )}

        {/* Error Overlay */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <div className="text-red-500 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-red-600">Failed to load reCAPTCHA</p>
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-primary-600 hover:text-primary-700 mt-2 underline"
              >
                Reload page
              </button>
            </div>
          </div>
        )}

        {/* reCAPTCHA Container - Always rendered so script can mount */}
        <div ref={recaptchaRef} className="g-recaptcha"></div>
      </div>
      {!hasError && (
        <p className="text-xs text-gray-500 text-center mt-2">
          Protected by Google reCAPTCHA v2
        </p>
      )}
      {hasError && (
        <p className="text-xs text-red-500 text-center mt-2">
          ⚠️ reCAPTCHA unavailable - You can disable it above to proceed
        </p>
      )}
    </div>
  );
};

export default GoogleCaptchaLogin;
