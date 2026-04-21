import React, { useCallback, useEffect, useRef, useState } from 'react';
import Api from '../../utils/api';
import { useDecode } from '../../hooks/useDecode';
import ReCAPTCHA from 'react-google-recaptcha';
import ErrorHandle from '../Common/ErrorHandle';
// Defensive re-import: the real installation happens in src/index.js as the
// first thing on app boot; importing here is a no-op (idempotent) but makes
// this component work even if mounted in isolation (e.g. tests, storybook).
import '../../utils/suppressRecaptchaErrors';

/**
 * Google reCAPTCHA wrapper.
 *
 * - The harmless "reCAPTCHA Timeout (b)" error from Google's internal
 *   script is silenced globally by `src/utils/suppressRecaptchaErrors.js`
 *   (imported first in `src/index.js`).
 * - We intentionally do NOT call `recaptchaRef.current.reset()` ourselves
 *   on expire/error/unmount. Every manual `reset()` asks Google for a
 *   brand-new challenge, which Google's anti-bot heuristics interpret as
 *   abusive and escalates to harder image puzzles on every attempt.
 *   Instead we just notify the parent that the token is no longer valid
 *   (`onVerify(null)`) and let the widget manage its own lifecycle —
 *   Google will re-show the checkbox on its own and usually auto-pass
 *   for low-risk users.
 */

const DEFAULT_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
const DEFAULT_SECRET_KEY = '6LeIxAcTAAAAAMszoGRg-rOQDVj75ubvfngVuKIH';

const GoogleCaptchaLogin = ({ onVerify }) => {
  const [rawSiteKey, setRawSiteKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadDataRef = useRef(false);
  const recaptchaRef = useRef(null);

  const { decodedValue: siteKey } = useDecode(rawSiteKey || '', 'password');

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

  // NOTE: no unmount-reset effect. Manually calling reset() on every
  // unmount / expire / error causes Google to treat the widget as hostile
  // and escalate the difficulty (image puzzles instead of auto-checkmark).
  // The global suppressor in src/utils/suppressRecaptchaErrors.js already
  // silences the stray "Timeout (b)" that can fire after unmount.

  const handleChange = useCallback(
    (token) => {
      // Google passes `null` here when the token is cleared/expired.
      onVerify && onVerify(token || null);
    },
    [onVerify]
  );

  const handleExpired = useCallback(() => {
    // Just tell the parent the token is no longer valid. Google's widget
    // will re-prompt on its own when the user clicks the checkbox again.
    onVerify && onVerify(null);
  }, [onVerify]);

  const handleErrored = useCallback(() => {
    // Same reasoning — don't force a reset, just mark the parent unverified.
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
