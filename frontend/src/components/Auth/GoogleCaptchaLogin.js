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

const LOAD_TIMEOUT_MS = 5000;
// How long to wait for the reCAPTCHA iframe to actually appear before
// considering the widget render failed (blank captcha scenario).
const RENDER_WATCHDOG_MS = 6000;
// Max auto-retries before showing a manual reload button with error
const MAX_AUTO_RETRIES = 2;

const GoogleCaptchaLogin = ({ onVerify }) => {
  const [rawSiteKey, setRawSiteKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Incrementing key forces React to fully destroy and recreate the
  // <ReCAPTCHA> component, which forces Google's script to re-render
  // the widget from scratch — fixing the blank-captcha-after-logout bug.
  const [captchaKey, setCaptchaKey] = useState(0);
  const [widgetRendered, setWidgetRendered] = useState(false);
  const [siteKeyTimedOut, setSiteKeyTimedOut] = useState(false);

  const recaptchaRef = useRef(null);
  const cancelLoadRef = useRef(null);
  const timeoutRef = useRef(null);
  const watchdogRef = useRef(null);
  const observerRef = useRef(null);
  const containerRef = useRef(null);
  const autoRetryCountRef = useRef(0);
  const siteKeyTimeoutRef = useRef(null);
  const [reloadAttempts, setReloadAttempts] = useState(0);

  const { decodedValue: siteKey } = useDecode(rawSiteKey || '', 'password');

  // ─── Timeout for siteKey decode (10s) ───────────────────────────
  // If rawSiteKey is set but useDecode never produces a siteKey,
  // show a reload button instead of spinning forever.
  useEffect(() => {
    if (siteKeyTimeoutRef.current) {
      clearTimeout(siteKeyTimeoutRef.current);
      siteKeyTimeoutRef.current = null;
    }

    if (rawSiteKey && !siteKey && !isLoading && !error) {
      setSiteKeyTimedOut(false);
      siteKeyTimeoutRef.current = setTimeout(() => {
        setSiteKeyTimedOut(true);
      }, LOAD_TIMEOUT_MS);
    } else {
      setSiteKeyTimedOut(false);
    }

    return () => {
      if (siteKeyTimeoutRef.current) {
        clearTimeout(siteKeyTimeoutRef.current);
        siteKeyTimeoutRef.current = null;
      }
    };
  }, [rawSiteKey, siteKey, isLoading, error]);

  // ─── Cleanup any stale Google reCAPTCHA DOM artifacts ────────────
  const cleanupGoogleRecaptchaDOM = useCallback(() => {
    try {
      // Remove leftover reCAPTCHA badge containers that Google injects
      // into document.body (they survive React unmount and can cause
      // the next mount to silently fail).
      document.querySelectorAll('.grecaptcha-badge').forEach((el) => {
        if (el.parentElement && el.parentElement !== document.body) {
          el.parentElement.remove();
        }
      });
    } catch (_) {
      /* ignore */
    }
  }, []);

  // ─── Watchdog: detect blank captcha (widget rendered but iframe missing) ──
  const startRenderWatchdog = useCallback(() => {
    // Clear any previous watchdog
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    setWidgetRendered(false);

    // Use MutationObserver to detect when the reCAPTCHA iframe appears
    const checkForIframe = () => {
      const container = containerRef.current;
      if (!container) return false;
      const iframe = container.querySelector('iframe[src*="recaptcha"]');
      return !!iframe;
    };

    // If already rendered (unlikely but possible), mark immediately
    if (checkForIframe()) {
      setWidgetRendered(true);
      return;
    }

    // Observe DOM changes inside our container
    if (containerRef.current) {
      try {
        const obs = new MutationObserver(() => {
          if (checkForIframe()) {
            setWidgetRendered(true);
            obs.disconnect();
            observerRef.current = null;
            if (watchdogRef.current) {
              clearTimeout(watchdogRef.current);
              watchdogRef.current = null;
            }
          }
        });
        obs.observe(containerRef.current, { childList: true, subtree: true });
        observerRef.current = obs;
      } catch (_) {
        /* ignore */
      }
    }

    // Fallback: if iframe doesn't appear within RENDER_WATCHDOG_MS, retry
    watchdogRef.current = setTimeout(() => {
      if (checkForIframe()) {
        setWidgetRendered(true);
        return;
      }

      // Widget failed to render — blank state detected
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (autoRetryCountRef.current < MAX_AUTO_RETRIES) {
        // Auto-retry: bump the key to force full remount
        autoRetryCountRef.current += 1;
        cleanupGoogleRecaptchaDOM();
        setCaptchaKey((k) => k + 1);
        // Watchdog will restart when the new ReCAPTCHA mounts via the
        // useEffect that depends on captchaKey + siteKey.
      } else {
        // Exhausted auto-retries — show error with reload button
        setError('reCAPTCHA failed to load. Please click Reload to try again.');
      }
    }, RENDER_WATCHDOG_MS);
  }, [cleanupGoogleRecaptchaDOM]);

  // ─── Fetch reCAPTCHA keys from the backend ──────────────────────
  const getRecaptchaKeys = useCallback(async () => {
    try {
      const api = Api(() => null);
      const response = await api.call('get-recaptcha-keys', 'GET', false);

      if (response.status !== 200) {
        setError(response?.error?.message || 'Failed to fetch reCAPTCHA keys');
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

  // ─── Main load routine ──────────────────────────────────────────
  const loadKeys = useCallback(async () => {
    if (cancelLoadRef.current) cancelLoadRef.current.cancelled = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const ticket = { cancelled: false };
    cancelLoadRef.current = ticket;

    setIsLoading(true);
    setError(null);
    setRawSiteKey(null);
    setWidgetRendered(false);
    autoRetryCountRef.current = 0;

    // Clean up stale DOM from previous sessions
    cleanupGoogleRecaptchaDOM();

    timeoutRef.current = setTimeout(() => {
      if (ticket.cancelled) return;
      ticket.cancelled = true;
      setError('reCAPTCHA request timed out. Please try again.');
      setIsLoading(false);
    }, LOAD_TIMEOUT_MS);

    const { siteKey: fetched } = await getRecaptchaKeys();
    if (ticket.cancelled) return;

    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;

    setRawSiteKey(fetched);
    // Bump key to guarantee a fresh <ReCAPTCHA> mount
    setCaptchaKey((k) => k + 1);
    setIsLoading(false);
  }, [getRecaptchaKeys, cleanupGoogleRecaptchaDOM]);

  // ─── Manual reload handler ──────────────────────────────────────
  const handleReload = useCallback(() => {
    onVerify && onVerify(null);
    loadKeys();
  }, [loadKeys, onVerify]);

  // ─── Mount effect ───────────────────────────────────────────────
  useEffect(() => {
    loadKeys();

    return () => {
      if (cancelLoadRef.current) cancelLoadRef.current.cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [loadKeys]);

  // ─── Start watchdog when siteKey is decoded and widget should render ──
  useEffect(() => {
    if (siteKey && !isLoading && !error) {
      // Small delay to let React render the <ReCAPTCHA> component first
      const t = setTimeout(() => startRenderWatchdog(), 500);
      return () => clearTimeout(t);
    }
  }, [siteKey, captchaKey, isLoading, error, startRenderWatchdog]);


  useEffect(() => {
    if (siteKeyTimedOut) {
      if (reloadAttempts < 3) {
        setReloadAttempts(prev => prev + 1);
        handleReload();
      } else {
        setError('reCAPTCHA failed to load. Please click Reload to try again.');
      }
    }
  }, [siteKeyTimedOut, reloadAttempts, handleReload]);

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

  // ─── Reload button (always visible when captcha is shown) ───────
  const ReloadButton = ({ label = 'Reload reCAPTCHA', className = '' }) => (
    <button
      type="button"
      onClick={handleReload}
      className={`inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors ${className}`}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      {label}
    </button>
  );

  // ─── Render: Loading state ──────────────────────────────────────
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

  // ─── Render: Error state ────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-2">
        <ErrorHandle errors={error} title="ERROR:- reCAPTCHA Loading Failed" />
        <div className="flex justify-center">
          <ReloadButton />
        </div>
      </div>
    );
  }

  // ─── Render: Waiting for siteKey decode ─────────────────────────
  if (!siteKey) {
    return (
      <div className="space-y-2">
        <div className="bg-white p-4 rounded-lg shadow-md flex justify-center items-center">
          <div className="inset-0 flex flex-col items-center justify-center bg-white z-10">
            {!siteKeyTimedOut ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500"></div>
                <p className="text-xs text-gray-500 mt-2">Preparing reCAPTCHA...</p>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500 mt-2">Preparing reCAPTCHA...</p>
              </>
            )}
          </div>
        </div>
        {siteKeyTimedOut && (
          <div className="flex justify-center">
            <ReloadButton />
          </div>
        )}
      </div>
    );
  }

  // ─── Render: reCAPTCHA widget ───────────────────────────────────
  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="bg-white p-4 rounded-lg shadow-md flex justify-center items-center"
      >
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg flex justify-center">
          <div className="g-recaptcha transform scale-[0.85] sm:scale-100 origin-center">
            <ReCAPTCHA
              key={captchaKey}
              ref={recaptchaRef}
              sitekey={siteKey}
              onChange={handleChange}
              onExpired={handleExpired}
              onErrored={handleErrored}
            />
          </div>
        </div>
      </div>

      {/* Always show reload button so user can recover from blank/stuck state */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleReload}
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          title="Reload reCAPTCHA if it appears blank or stuck"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {!widgetRendered ? 'Loading... Click to reload' : 'Reload reCAPTCHA'}
        </button>
      </div>
    </div>
  );
};

export default React.memo(GoogleCaptchaLogin);
