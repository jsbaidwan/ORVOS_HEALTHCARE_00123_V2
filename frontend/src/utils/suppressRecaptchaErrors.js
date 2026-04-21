/**
 * Suppresses the harmless "reCAPTCHA Timeout (b)" (and variants) that
 * Google's reCAPTCHA script throws from an internal ~2-minute timer.
 *
 * The error comes out of a gstatic.com script as a Promise rejection whose
 * `reason` is often just the bare string "Timeout (b)" — no message, no
 * stack, no source info — because browsers sanitise cross-origin Promise
 * rejections. That's why simple source-sniffing suppressors miss it.
 *
 * Strategy (belt + suspenders, in order):
 *   1. Match the very specific "Timeout (x)" / "reCAPTCHA Timeout (x)"
 *      message shape — nothing in this codebase legitimately throws that
 *      literal string, so matching on the message alone is safe.
 *   2. Intercept at three levels: `window.addEventListener('error'|'unhandledrejection', …, capture)`,
 *      `window.onerror` / `window.onunhandledrejection`, and
 *      `console.error`.
 *   3. As a last resort, if CRA's `react-error-overlay` still manages to
 *      render the red banner (it registers its listener at webpack-client
 *      bootstrap which may slip in before us), a MutationObserver hides
 *      the overlay element whenever its text matches the same pattern.
 *      Real errors continue to show normally.
 *
 * This module self-installs on import. Import it as the FIRST line of
 * `src/index.js`.
 */

let installed = false;

// Matches the exact shapes Google's script produces:
//   "Timeout (b)", "timeout (x)", "reCAPTCHA Timeout (b)", etc.
// Narrow enough that nothing else in the app will match it.
const RECAPTCHA_TIMEOUT_PATTERN = /(?:^|\b)(?:recaptcha\s+)?timeout\s*\(\s*\w+\s*\)/i;

const stringifyReason = (reason) => {
  if (reason == null) return '';
  if (typeof reason === 'string') return reason;
  if (typeof reason === 'object') {
    return `${reason.message || ''} ${reason.stack || ''} ${String(reason)}`;
  }
  return String(reason);
};

const isRecaptchaNoise = (...parts) => {
  const text = parts.map((p) => (typeof p === 'string' ? p : stringifyReason(p))).join(' ');
  if (!text) return false;
  if (RECAPTCHA_TIMEOUT_PATTERN.test(text)) return true;
  // Fallback: mentions both "recaptcha" (or gstatic recaptcha URL) and any timeout word.
  const mentionsRecaptcha = /recaptcha|gstatic\.com\/recaptcha|google\.com\/recaptcha/i.test(text);
  const mentionsTimeout = /\btimeout\b/i.test(text);
  return mentionsRecaptcha && mentionsTimeout;
};

export function installRecaptchaErrorSuppressor() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  // -------- 1. window 'error' (capture phase, before CRA overlay) --------
  window.addEventListener(
    'error',
    (event) => {
      const parts = [
        event?.message,
        event?.filename,
        event?.error?.message,
        event?.error?.stack,
      ];
      if (isRecaptchaNoise(...parts)) {
        event.preventDefault();
        event.stopImmediatePropagation?.();
        event.stopPropagation?.();
        return false;
      }
    },
    true
  );

  // -------- 2. unhandledrejection (capture) --------
  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const reason = event?.reason;
      if (isRecaptchaNoise(reason, reason?.message, reason?.stack, String(reason || ''))) {
        event.preventDefault();
        event.stopImmediatePropagation?.();
        event.stopPropagation?.();
      }
    },
    true
  );

  // -------- 3. legacy window.onerror --------
  const prevOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    if (isRecaptchaNoise(message, source, error?.message, error?.stack)) return true;
    if (typeof prevOnError === 'function') return prevOnError.apply(this, arguments);
    return false;
  };

  // -------- 4. legacy window.onunhandledrejection --------
  const prevOnUnhandled = window.onunhandledrejection;
  window.onunhandledrejection = function (event) {
    const reason = event?.reason;
    if (isRecaptchaNoise(reason, reason?.message, reason?.stack)) {
      event?.preventDefault?.();
      return true;
    }
    if (typeof prevOnUnhandled === 'function') return prevOnUnhandled.apply(this, arguments);
    return false;
  };

  // -------- 5. console.error (some overlays mirror this) --------
  const origConsoleError = window.console?.error?.bind(window.console);
  if (origConsoleError) {
    window.console.error = function (...args) {
      try {
        if (isRecaptchaNoise(...args)) return;
      } catch (e) {
        /* ignore and fall through */
      }
      return origConsoleError(...args);
    };
  }

  // -------- 6. Last-resort DOM scrubber for the red overlay --------
  // If anything still slipped through, hide overlay elements whose deep
  // text (including shadow DOM + same-origin iframes) matches the
  // recaptcha-timeout pattern. Real errors continue to show normally
  // because they don't match the pattern.

  // Read text from an element, descending into shadow roots.
  const deepText = (root) => {
    if (!root) return '';
    let out = '';
    try {
      out += root.textContent || '';
    } catch (e) {
      /* ignore */
    }
    // Walk open shadow roots
    try {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
      let node = walker.currentNode;
      while (node) {
        if (node.shadowRoot) {
          out += ' ' + (node.shadowRoot.textContent || '');
          // recurse one level into shadow root descendants
          try {
            out += ' ' + deepText(node.shadowRoot);
          } catch (e) {
            /* ignore */
          }
        }
        node = walker.nextNode();
      }
    } catch (e) {
      /* ignore */
    }
    return out;
  };

  const hide = (el) => {
    if (!el || el.getAttribute?.('data-recaptcha-suppressed') === 'true') return;
    try {
      el.style.setProperty('display', 'none', 'important');
      el.setAttribute('data-recaptcha-suppressed', 'true');
    } catch (e) {
      try {
        el.remove?.();
      } catch (e2) {
        /* ignore */
      }
    }
  };

  const scrubOverlayIfRecaptcha = () => {
    try {
      // --- Known overlay roots by ID / tag ---
      const knownIds = [
        'react-error-overlay-iframe', // react-error-overlay
        'webpack-dev-server-client-overlay', // webpack-dev-server 4+
        'webpack-dev-server-client-overlay-div',
      ];
      knownIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const text = deepText(el) + ' ' + (el.getAttribute?.('src') || '');
        if (isRecaptchaNoise(text)) hide(el);
      });

      const knownTags = ['react-refresh-overlay', 'vite-error-overlay'];
      knownTags.forEach((tag) => {
        document.querySelectorAll(tag).forEach((el) => {
          if (isRecaptchaNoise(deepText(el))) hide(el);
        });
      });

      // --- Same-origin iframes (webpack-dev-server 4+ puts overlay there) ---
      document.querySelectorAll('iframe').forEach((frame) => {
        try {
          const doc = frame.contentDocument;
          if (!doc) return;
          const text = doc.body ? doc.body.innerText || doc.body.textContent || '' : '';
          if (isRecaptchaNoise(text)) hide(frame);
        } catch (e) {
          /* cross-origin, ignore */
        }
      });

      // --- Generic fallback: top-level fixed/absolute elements whose deep
      // text matches. Limited to direct body children so we never hide
      // application content. ---
      const bodyChildren = document.body ? Array.from(document.body.children) : [];
      bodyChildren.forEach((el) => {
        // Skip <script>, <link>, etc. — only worry about visual containers.
        const tag = (el.tagName || '').toLowerCase();
        if (['script', 'link', 'style', 'meta', 'noscript'].includes(tag)) return;
        // Quick heuristic: overlays are usually fixed/absolute positioned,
        // but some set position via attached stylesheet, so don't require it.
        const text = deepText(el);
        if (isRecaptchaNoise(text) && /uncaught\s+runtime\s+errors?/i.test(text)) {
          hide(el);
        }
      });
    } catch (e) {
      /* noop */
    }
  };

  const startObserver = () => {
    try {
      const obs = new MutationObserver(() => scrubOverlayIfRecaptcha());
      obs.observe(document.documentElement, { childList: true, subtree: true });
      scrubOverlayIfRecaptcha();
    } catch (e) {
      /* noop */
    }
    // Shadow-DOM content changes do not bubble to outer MutationObservers,
    // so poll as a safety net. Cheap — only 2 QS per tick.
    setInterval(scrubOverlayIfRecaptcha, 400);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver, { once: true });
  } else {
    startObserver();
  }
}

// Run on import.
installRecaptchaErrorSuppressor();

export default installRecaptchaErrorSuppressor;
