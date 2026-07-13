/**
 * Family Day 2026 - Amazon BCN1
 * QR Scanner Module
 *
 * Wraps html5-qrcode for admin check-in flow.
 * Provides camera-based QR scanning with manual input fallback.
 * QR payload format: "FAMILYDAY2026|{login}|{companions}"
 *
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4
 */
'use strict';

var QRScanner = (function () {
  var _scanner = null;
  var _containerId = null;
  var _scanCallback = null;
  var _isScanning = false;

  /**
   * Initialize the QR scanner targeting a container element.
   * Creates the Html5Qrcode instance.
   * @param {string} containerId - ID of the container element for the scanner
   */
  function init(containerId) {
    _containerId = containerId;
    if (typeof Html5Qrcode !== 'undefined') {
      _scanner = new Html5Qrcode(containerId);
    }
  }

  /**
   * Start camera-based QR scanning.
   * Prefers back camera on mobile devices.
   * Shows manual input fallback if camera is unavailable or denied.
   * @returns {Promise<void>}
   */
  function start() {
    if (!_scanner) {
      _showManualFallback(I18n.t('admin.scanner.cameraError'));
      return Promise.resolve();
    }

    var config = {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    };

    return _scanner.start(
      { facingMode: 'environment' },
      config,
      function onScanSuccess(decodedText) {
        _handleScan(decodedText);
      },
      function onScanFailure() {
        // Ignore scan failures (frame-by-frame misses are normal)
      }
    ).then(function () {
      _isScanning = true;
    }).catch(function (err) {
      _isScanning = false;
      // Camera denied or unavailable
      _showManualFallback(I18n.t('admin.scanner.cameraError'));
    });
  }

  /**
   * Stop scanning and release the camera.
   */
  function stop() {
    if (_scanner && _isScanning) {
      _scanner.stop().then(function () {
        _isScanning = false;
      }).catch(function () {
        _isScanning = false;
      });
    }
  }

  /**
   * Register a callback for successful QR scan decodes.
   * @param {Function} callback - Receives decoded text string
   */
  function onScan(callback) {
    _scanCallback = callback;
  }

  /**
   * Check if the scanner is currently active.
   * @returns {boolean}
   */
  function isScanning() {
    return _isScanning;
  }

  /**
   * Handle a decoded QR scan result.
   * Validates payload format, calls API.checkIn, and updates UI.
   * @param {string} decodedText - Raw decoded text from scanner
   * @private
   */
  function _handleScan(decodedText) {
    // Notify registered callback
    if (_scanCallback) {
      _scanCallback(decodedText);
    }

    // Decode QR payload: "FAMILYDAY2026|{login}|{companions}"
    var parts = decodedText.split('|');
    if (parts.length !== 3 || parts[0] !== 'FAMILYDAY2026') {
      _showScanMessage(I18n.t('admin.scanner.invalidQr'), 'error');
      return;
    }

    var login = parts[1];
    var companions = parseInt(parts[2], 10);

    if (!login || isNaN(companions)) {
      _showScanMessage(I18n.t('admin.scanner.invalidQr'), 'error');
      return;
    }

    // Call check-in API
    _performCheckIn(login);
  }

  /**
   * Perform the check-in API call for a given login.
   * Handles success, not-found, and already-checked-in responses.
   * @param {string} login - Corporate login to check in
   * @private
   */
  function _performCheckIn(login) {
    if (typeof API === 'undefined' || !API.checkIn) {
      _showScanMessage(I18n.t('common.error'), 'error');
      return;
    }

    API.checkIn(login).then(function (result) {
      if (result.success) {
        var data = result.data || {};
        if (data.status === 'already_checked_in') {
          _showScanMessage(I18n.t('admin.scanner.alreadyCheckedIn'), 'warning');
        } else {
          _showScanMessage(I18n.t('admin.scanner.success'), 'success');
          // Dispatch event so AdminDashboard can refresh its list
          var event;
          try {
            event = new CustomEvent('checkInCompleted', { detail: { login: login } });
          } catch (e) {
            event = document.createEvent('CustomEvent');
            event.initCustomEvent('checkInCompleted', true, true, { login: login });
          }
          document.dispatchEvent(event);
        }
      } else {
        // Determine error type from response
        var errorData = result.data || {};
        if (errorData.status === 'not_found' || result.error === 'not_found') {
          _showScanMessage(I18n.t('admin.scanner.notFound'), 'error');
        } else if (errorData.status === 'already_checked_in') {
          _showScanMessage(I18n.t('admin.scanner.alreadyCheckedIn'), 'warning');
        } else {
          _showScanMessage(I18n.t('admin.scanner.notFound'), 'error');
        }
      }
    }).catch(function () {
      _showScanMessage(I18n.t('common.error'), 'error');
    });
  }

  /**
   * Show a scan result message in the scanner container area.
   * @param {string} message - Message text to display
   * @param {string} type - 'success', 'error', or 'warning'
   * @private
   */
  function _showScanMessage(message, type) {
    var msgContainer = document.getElementById('scanner-message');
    if (!msgContainer) {
      msgContainer = document.createElement('div');
      msgContainer.id = 'scanner-message';
      var container = document.getElementById(_containerId);
      if (container && container.parentNode) {
        container.parentNode.insertBefore(msgContainer, container.nextSibling);
      } else {
        return;
      }
    }

    var alertClass = 'alert';
    if (type === 'success') alertClass += ' alert--success';
    else if (type === 'error') alertClass += ' alert--error';
    else if (type === 'warning') alertClass += ' alert--warning';

    msgContainer.className = alertClass;
    msgContainer.textContent = message;
    msgContainer.setAttribute('role', 'alert');
    msgContainer.setAttribute('aria-live', 'polite');

    // Auto-hide after 4 seconds
    setTimeout(function () {
      if (msgContainer && msgContainer.parentNode) {
        msgContainer.textContent = '';
        msgContainer.className = '';
        msgContainer.removeAttribute('role');
      }
    }, 4000);
  }

  /**
   * Show the manual input fallback when camera is unavailable.
   * Renders a text input + button for manual login entry.
   * @param {string} errorMessage - Camera error message to display
   * @private
   */
  function _showManualFallback(errorMessage) {
    var container = document.getElementById(_containerId);
    if (!container) return;

    var html = '';
    html += '<div class="alert alert--warning mb-md" role="alert">';
    html += '<p>' + errorMessage + '</p>';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label class="form-group__label" for="manual-login-input">' + I18n.t('admin.scanner.manual') + '</label>';
    html += '<div style="display:flex;gap:var(--space-sm);align-items:center;">';
    html += '<input type="text" id="manual-login-input" class="input" placeholder="' + I18n.t('admin.scanner.manualPlaceholder') + '" aria-label="' + I18n.t('admin.scanner.manualPlaceholder') + '">';
    html += '<button type="button" id="manual-checkin-btn" class="btn btn--primary">' + I18n.t('admin.scanner.checkIn') + '</button>';
    html += '</div>';
    html += '</div>';

    container.innerHTML = html;

    // Wire up manual check-in button
    var btn = document.getElementById('manual-checkin-btn');
    var input = document.getElementById('manual-login-input');
    if (btn && input) {
      btn.addEventListener('click', function () {
        var login = input.value.trim();
        if (login) {
          _performCheckIn(login);
          input.value = '';
        }
      });
      // Also support Enter key
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          var login = input.value.trim();
          if (login) {
            _performCheckIn(login);
            input.value = '';
          }
        }
      });
    }
  }

  /**
   * Show manual input UI (callable externally for explicit manual mode).
   */
  function showManualInput() {
    _showManualFallback(I18n.t('admin.scanner.manual'));
  }

  // Public API
  return {
    init: init,
    start: start,
    stop: stop,
    onScan: onScan,
    isScanning: isScanning,
    showManualInput: showManualInput
  };
})();
