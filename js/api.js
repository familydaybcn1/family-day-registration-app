/**
 * Family Day 2026 - Amazon BCN1
 * API Client Module
 *
 * Handles communication with Google Apps Script web app.
 * Provides methods for registration submission, data retrieval, check-in, and stats.
 * Includes error handling with network timeout (10s), exponential backoff (max 3 retries),
 * CORS error detection, and localized error messages.
 */
'use strict';

var API = (function () {
  var _endpoint = '';
  var TIMEOUT_MS = 10000;
  var MAX_RETRIES = 3;
  var BASE_DELAY_MS = 1000;

  /**
   * Set the Google Apps Script web app endpoint URL.
   * @param {string} url - The web app URL
   */
  function setEndpoint(url) {
    _endpoint = url;
  }

  /**
   * Get the current endpoint URL.
   * @returns {string}
   */
  function getEndpoint() {
    return _endpoint;
  }

  /**
   * Determine if an error is retryable (5xx or network failure).
   * @param {object} context - { response, error }
   * @returns {boolean}
   */
  function _isRetryable(context) {
    if (context.error) {
      // Network failures (including CORS) throw TypeError
      return true;
    }
    if (context.response && context.response.status >= 500) {
      return true;
    }
    return false;
  }

  /**
   * Detect if an error is a CORS error.
   * CORS errors manifest as TypeError from fetch with no response.
   * @param {Error} error
   * @returns {boolean}
   */
  function _isCORSError(error) {
    return error instanceof TypeError;
  }

  /**
   * Sleep for a given number of milliseconds.
   * @param {number} ms
   * @returns {Promise}
   */
  function _sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  /**
   * Execute a fetch request with timeout using AbortController.
   * @param {string} url
   * @param {object} options - fetch options
   * @returns {Promise<Response>}
   */
  function _fetchWithTimeout(url, options) {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () {
      controller.abort();
    }, TIMEOUT_MS);

    var fetchOptions = Object.assign({}, options, { signal: controller.signal });

    return fetch(url, fetchOptions).finally(function () {
      clearTimeout(timeoutId);
    });
  }

  /**
   * Build an error response object with localized error message.
   * @param {string} errorKey - i18n key for the error message
   * @returns {object} { success: false, error: errorKey }
   */
  function _buildError(errorKey) {
    return { success: false, error: errorKey };
  }

  /**
   * Classify an error into the appropriate i18n error key.
   * @param {Error|null} error - The caught error
   * @param {Response|null} response - The fetch response (if any)
   * @returns {string} i18n error key
   */
  function _classifyError(error, response) {
    if (error) {
      if (error.name === 'AbortError') {
        return 'error.network';
      }
      if (_isCORSError(error)) {
        return 'error.network';
      }
      return 'error.network';
    }
    if (response && response.status >= 500) {
      return 'error.server';
    }
    return 'error.unexpected';
  }

  /**
   * Execute a request with exponential backoff retry logic.
   * Retries on 5xx errors and network failures. Max 3 retries with delays 1s, 2s, 4s.
   * @param {Function} requestFn - Function that returns a Promise<Response>
   * @returns {Promise<object>} Normalized response { success: true, data: ... } or { success: false, error: errorKey }
   */
  function _executeWithRetry(requestFn) {
    var attempt = 0;

    function tryRequest() {
      attempt++;
      return requestFn()
        .then(function (response) {
          if (response.ok) {
            return response.json().then(function (data) {
              return { success: true, data: data };
            }).catch(function () {
              return _buildError('error.unexpected');
            });
          }
          // Check if retryable (5xx)
          if (response.status >= 500 && attempt <= MAX_RETRIES) {
            var delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
            return _sleep(delay).then(function () {
              return tryRequest();
            });
          }
          // Non-retryable error
          return _buildError(_classifyError(null, response));
        })
        .catch(function (error) {
          // Network error or timeout — retry if within limit
          if (attempt <= MAX_RETRIES) {
            var delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
            return _sleep(delay).then(function () {
              return tryRequest();
            });
          }
          // All retries exhausted
          return _buildError(_classifyError(error, null));
        });
    }

    return tryRequest();
  }

  /**
   * Submit a registration to the backend.
   * Sends POST to Google Apps Script with action=submit.
   * @param {object} data - Registration payload
   * @returns {Promise<object>} { success: true, data: ... } or { success: false, error: errorKey }
   */
  function submitRegistration(data) {
    return _executeWithRetry(function () {
      return _fetchWithTimeout(_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'submit', data: data }),
        mode: 'cors'
      });
    });
  }

  /**
   * Get registrations from the backend with optional filters.
   * Sends GET to Google Apps Script with action=list.
   * @param {object} [filters] - Optional filter parameters
   * @returns {Promise<object>} { success: true, data: ... } or { success: false, error: errorKey }
   */
  function getRegistrations(filters) {
    return _executeWithRetry(function () {
      var url = _endpoint + '?action=list';
      if (filters) {
        var keys = Object.keys(filters);
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var value = filters[key];
          if (value !== undefined && value !== null && value !== '') {
            url += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(value);
          }
        }
      }
      return _fetchWithTimeout(url, { method: 'GET' });
    });
  }

  /**
   * Check in a registrant by login.
   * Sends POST to Google Apps Script with action=checkin.
   * @param {string} login - The registrant's corporate login
   * @returns {Promise<object>} { success: true, data: ... } or { success: false, error: errorKey }
   */
  function checkIn(login) {
    return _executeWithRetry(function () {
      return _fetchWithTimeout(_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'checkin', login: login }),
        mode: 'cors'
      });
    });
  }

  /**
   * Update an existing registration in the backend.
   * Sends POST to Google Apps Script with action=update.
   * Used when a duplicate login is detected and the user chooses to update.
   * @param {object} data - Registration payload
   * @returns {Promise<object>} { success: true, data: ... } or { success: false, error: errorKey }
   */
  function updateRegistration(data) {
    return _executeWithRetry(function () {
      return _fetchWithTimeout(_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'update', data: data }),
        mode: 'cors'
      });
    });
  }

  /**
   * Get aggregate statistics from the backend.
   * Sends GET to Google Apps Script with action=stats.
   * @returns {Promise<object>} { success: true, data: ... } or { success: false, error: errorKey }
   */
  function getStats() {
    return _executeWithRetry(function () {
      var url = _endpoint + '?action=stats';
      return _fetchWithTimeout(url, { method: 'GET' });
    });
  }

  // Public API
  return {
    setEndpoint: setEndpoint,
    getEndpoint: getEndpoint,
    submitRegistration: submitRegistration,
    updateRegistration: updateRegistration,
    getRegistrations: getRegistrations,
    checkIn: checkIn,
    getStats: getStats
  };
})();
