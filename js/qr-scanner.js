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
   * Backend returns { status: 'ok' } on success, { status: 'error', message: 'Already checked in' } on duplicate.
   * API layer wraps this as { success: true, data: { status: '...' } } for 200 OK responses.
   * @param {string} login - Corporate login to check in
   * @private
   */
  function _performCheckIn(login) {
    if (typeof API === 'undefined' || !API.checkIn) {
      _showScanMessage('❌ NO REGISTRADO — Error de sistema', 'error');
      return;
    }

    API.checkIn(login).then(function (result) {
      if (result.success) {
        var data = result.data || {};

        // Backend returns status='error' + message='Already checked in' for duplicates
        if (data.status === 'error' && data.message && data.message.indexOf('Already') !== -1) {
          _showScanMessage('⚠️ YA ENTRÓ — esta persona ya hizo check-in', 'warning');
        } else if (data.status === 'ok') {
          // Successful check-in
          var personInfo = data.login ? ' (' + data.login + ')' : '';
          _showScanMessage('✓ PUEDE PASAR' + personInfo, 'success');

          // Check image authorization — warn if NOT authorized
          if (data.imageAuthorization !== 'authorize') {
            _showImageAuthWarning();
          }

          // Dispatch event so AdminDashboard can refresh its list
          var event;
          try {
            event = new CustomEvent('checkInCompleted', { detail: { login: login } });
          } catch (e) {
            event = document.createEvent('CustomEvent');
            event.initCustomEvent('checkInCompleted', true, true, { login: login });
          }
          document.dispatchEvent(event);
        } else if (data.status === 'error' && data.message && data.message.indexOf('not found') !== -1) {
          _showScanMessage('❌ NO REGISTRADO — login no encontrado', 'error');
        } else {
          // Unknown status from backend
          _showScanMessage('❌ NO REGISTRADO — respuesta inesperada', 'error');
        }
      } else {
        // HTTP-level failure (network error, 5xx, etc.)
        _showScanMessage('❌ NO REGISTRADO — error de conexión', 'error');
      }
    }).catch(function () {
      _showScanMessage('❌ NO REGISTRADO — error de conexión', 'error');
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
   * Show a prominent image authorization warning after check-in.
   * Displayed when the person did NOT authorize image rights.
   * @private
   */
  function _showImageAuthWarning() {
    // Remove any existing warning
    var existing = document.getElementById('image-auth-warning');
    if (existing) {
      existing.parentNode.removeChild(existing);
    }

    var warningEl = document.createElement('div');
    warningEl.id = 'image-auth-warning';
    warningEl.className = 'image-auth-warning';
    warningEl.setAttribute('role', 'alert');
    warningEl.setAttribute('aria-live', 'assertive');
    warningEl.textContent = '⚠️ ATENCIÓN: Esta persona NO autorizó derechos de imagen. Dar lanyard de color diferente.';

    var msgContainer = document.getElementById('scanner-message');
    if (msgContainer && msgContainer.parentNode) {
      msgContainer.parentNode.insertBefore(warningEl, msgContainer.nextSibling);
    } else {
      var container = document.getElementById(_containerId);
      if (container && container.parentNode) {
        container.parentNode.appendChild(warningEl);
      }
    }

    // Auto-hide after 8 seconds (longer than normal messages since it's critical)
    setTimeout(function () {
      if (warningEl && warningEl.parentNode) {
        warningEl.parentNode.removeChild(warningEl);
      }
    }, 8000);
  }

  /**
   * Show the manual input fallback when camera is unavailable.
   * Also works with barcode gun scanners (they type text + Enter).
   * Renders a text input + button for manual login entry.
   * @param {string} errorMessage - Camera error message to display
   * @private
   */
  function _showManualFallback(errorMessage) {
    var container = document.getElementById(_containerId);
    if (!container) return;

    var html = '';
    if (errorMessage && errorMessage !== I18n.t('admin.scanner.manual')) {
      html += '<div class="alert alert--warning mb-md" role="alert">';
      html += '<p>' + errorMessage + '</p>';
      html += '</div>';
    }
    html += '<div class="form-group">';
    html += '<label class="form-group__label" for="manual-login-input" style="font-size:1.1rem;font-weight:700;">🔫 Escanea con la pistola o escribe el login</label>';
    html += '<div style="display:flex;gap:var(--space-sm);align-items:center;">';
    html += '<input type="text" id="manual-login-input" class="input" style="font-size:1.2rem;padding:1rem;" placeholder="Apunta la pistola aquí..." aria-label="Escanear QR" autofocus>';
    html += '<button type="button" id="manual-checkin-btn" class="btn btn--primary" style="padding:1rem 1.5rem;">✓ Check-in</button>';
    html += '</div>';
    html += '<div id="gun-scanner-message" style="margin-top:1rem;"></div>';
    html += '</div>';

    container.innerHTML = html;

    // Wire up manual check-in button and barcode gun support
    var btn = document.getElementById('manual-checkin-btn');
    var input = document.getElementById('manual-login-input');
    if (btn && input) {
      // Focus the input immediately for gun scanning
      input.focus();

      btn.addEventListener('click', function () {
        _processInput(input);
      });

      // Enter key = gun finished scanning OR user pressed enter
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          _processInput(input);
        }
      });
    }
  }

  /**
   * Process the input value — handles both raw login and full QR payload.
   * Extracts login from QR format "FAMILYDAY2026|login|companions" or uses raw text as login.
   * After processing, clears the field and refocuses for next scan.
   * @param {HTMLInputElement} input
   * @private
   */
  function _processInput(input) {
    var value = input.value.trim();
    if (!value) return;

    var login = value;

    // Check if it's a full QR payload: FAMILYDAY2026|login|companions
    if (value.indexOf('FAMILYDAY2026|') === 0) {
      var parts = value.split('|');
      if (parts.length >= 2) {
        login = parts[1];
      }
    }

    if (login) {
      _performCheckIn(login);
    }

    // Clear and refocus for next scan
    input.value = '';
    input.focus();
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
