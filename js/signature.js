/**
 * Signature Module
 * Wraps the signature_pad CDN library providing init, clear, isEmpty, and toDataURL
 * with compression logic and mobile touch support.
 */
var SignatureModule = (function () {
  'use strict';

  var signaturePad = null;
  var canvas = null;

  // Maximum size threshold in characters (50KB in base64)
  var MAX_DATA_URL_LENGTH = 50 * 1024;

  /**
   * Adjusts canvas internal resolution for retina/HiDPI displays.
   * This ensures the signature renders crisply on high-density screens.
   */
  function _scaleCanvasForDPI(canvasEl) {
    var ratio = window.devicePixelRatio || 1;
    var rect = canvasEl.getBoundingClientRect();

    canvasEl.width = rect.width * ratio;
    canvasEl.height = rect.height * ratio;

    var ctx = canvasEl.getContext('2d');
    ctx.scale(ratio, ratio);

    // Set CSS dimensions to match layout size
    canvasEl.style.width = rect.width + 'px';
    canvasEl.style.height = rect.height + 'px';
  }

  /**
   * Initializes the SignaturePad instance on the given canvas element.
   * Sets touch-action: none CSS to prevent scroll interference on mobile.
   * Handles DPI scaling for retina displays.
   *
   * @param {HTMLCanvasElement} canvasElement - The canvas element to attach to
   */
  function init(canvasElement) {
    if (!canvasElement) {
      console.error('SignatureModule.init: canvasElement is required');
      return;
    }

    canvas = canvasElement;

    // Prevent touch scrolling while drawing (mobile support)
    canvas.style.touchAction = 'none';

    // Scale for retina/HiDPI displays
    _scaleCanvasForDPI(canvas);

    // Create SignaturePad instance (from CDN global)
    signaturePad = new SignaturePad(canvas);

    // Handle window resize — rescale canvas and clear (data is lost on resize)
    window.addEventListener('resize', function () {
      if (canvas && signaturePad) {
        var data = signaturePad.toData();
        _scaleCanvasForDPI(canvas);
        signaturePad.clear();
        if (data && data.length > 0) {
          signaturePad.fromData(data);
        }
      }
    });
  }

  /**
   * Clears the signature canvas.
   */
  function clear() {
    if (signaturePad) {
      signaturePad.clear();
    }
  }

  /**
   * Checks whether the signature canvas is empty (no strokes drawn).
   *
   * @returns {boolean} True if the canvas has no signature drawn
   */
  function isEmpty() {
    if (signaturePad) {
      return signaturePad.isEmpty();
    }
    return true;
  }

  /**
   * Returns the signature as a data URL with compression logic:
   * 1. First try PNG at full quality
   * 2. If > 50KB (base64 chars), try JPEG at quality 0.5
   * 3. If still > 50KB, return the string "signed" as a flag
   *
   * @returns {string} Data URL of the signature or "signed" if too large
   */
  function toDataURL() {
    if (!signaturePad || signaturePad.isEmpty()) {
      return '';
    }

    // Try PNG first (default, full quality)
    var pngDataURL = signaturePad.toDataURL('image/png');
    if (pngDataURL.length <= MAX_DATA_URL_LENGTH) {
      return pngDataURL;
    }

    // Try JPEG at quality 0.5
    var jpegDataURL = signaturePad.toDataURL('image/jpeg', 0.5);
    if (jpegDataURL.length <= MAX_DATA_URL_LENGTH) {
      return jpegDataURL;
    }

    // Fallback: return "signed" flag
    return 'signed';
  }

  // Public API
  return {
    init: init,
    clear: clear,
    isEmpty: isEmpty,
    toDataURL: toDataURL
  };
})();
