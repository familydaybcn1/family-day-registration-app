/**
 * Family Day 2026 - Amazon BCN1
 * Validation Module
 *
 * Pure functions for field-level and step-level validation.
 * Returns error keys matching the i18n translation system.
 */
'use strict';

var Validation = (function () {

  /**
   * Validate that a value is non-empty (after trimming).
   * @param {string} value - The value to validate
   * @returns {{valid: boolean, errorKey?: string}}
   */
  function validateRequired(value) {
    if (value === null || value === undefined || String(value).trim() === '') {
      return { valid: false, errorKey: 'validation.required' };
    }
    return { valid: true };
  }

  /**
   * Validate email format.
   * Checks for a basic valid email pattern: something@something.something
   * @param {string} value - The email to validate
   * @returns {{valid: boolean, errorKey?: string}}
   */
  function validateEmail(value) {
    if (value === null || value === undefined || String(value).trim() === '') {
      return { valid: false, errorKey: 'validation.email' };
    }
    // Standard email regex: local@domain.tld
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(String(value).trim())) {
      return { valid: false, errorKey: 'validation.email' };
    }
    return { valid: true };
  }

  /**
   * Validate DNI/NIE format.
   * DNI: 8 digits + 1 letter (e.g., 12345678A)
   * NIE: starts with X/Y/Z + 7 digits + 1 letter (e.g., X1234567A)
   * @param {string} value - The DNI/NIE to validate
   * @returns {{valid: boolean, errorKey?: string}}
   */
  function validateDNI(value) {
    if (value === null || value === undefined || String(value).trim() === '') {
      return { valid: false, errorKey: 'validation.dni' };
    }
    var trimmed = String(value).trim().toUpperCase();
    // DNI pattern: 8 digits + 1 letter
    var dniPattern = /^\d{8}[A-Z]$/;
    // NIE pattern: X/Y/Z + 7 digits + 1 letter
    var niePattern = /^[XYZ]\d{7}[A-Z]$/;

    if (!dniPattern.test(trimmed) && !niePattern.test(trimmed)) {
      return { valid: false, errorKey: 'validation.dni' };
    }
    return { valid: true };
  }

  /**
   * Check if a canvas element has drawn content (non-blank).
   * Compares the canvas pixel data against a blank canvas of the same dimensions.
   * @param {HTMLCanvasElement} canvas - The signature canvas element
   * @returns {boolean} true if the canvas has drawn content
   */
  function isSignaturePresent(canvas) {
    if (!canvas || !canvas.getContext) {
      return false;
    }

    var ctx = canvas.getContext('2d');
    var pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // Check if any pixel has a non-zero alpha value (indicating drawn content)
    for (var i = 3; i < pixelData.length; i += 4) {
      if (pixelData[i] > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Validate all mandatory fields for a given step.
   * @param {number} step - The step number (1-4)
   * @param {object} data - The form data object for validation
   * @returns {{valid: boolean, errors: object}} errors is a map of field -> errorKey
   */
  function validateStep(step, data) {
    var errors = {};

    switch (step) {
      case 1:
        // Step 1: fullName, login, email, dni, department (all required) + email format + DNI format
        if (!_isPresent(data.fullName)) {
          errors.fullName = 'validation.required';
        }
        if (!_isPresent(data.login)) {
          errors.login = 'validation.required';
        }
        if (!_isPresent(data.email)) {
          errors.email = 'validation.required';
        } else {
          var emailResult = validateEmail(data.email);
          if (!emailResult.valid) {
            errors.email = emailResult.errorKey;
          }
        }
        if (!_isPresent(data.dni)) {
          errors.dni = 'validation.required';
        } else {
          var dniResult = validateDNI(data.dni);
          if (!dniResult.valid) {
            errors.dni = dniResult.errorKey;
          }
        }
        if (!_isPresent(data.department)) {
          errors.department = 'validation.required';
        }
        break;

      case 2:
        // Step 2: companionCount (required)
        if (data.companionCount === null || data.companionCount === undefined || data.companionCount === '') {
          errors.companionCount = 'validation.companion';
        }
        break;

      case 3:
        // Step 3: hasDietaryNeeds (required — must have selected yes or no)
        if (data.hasDietaryNeeds === null || data.hasDietaryNeeds === undefined || data.hasDietaryNeeds === '') {
          errors.hasDietaryNeeds = 'validation.dietary';
        }
        break;

      case 4:
        // Step 4: imageAuthorization (required) + signature present
        if (!_isPresent(data.imageAuthorization)) {
          errors.imageAuthorization = 'validation.authorization';
        }
        // Signature validation: check canvas if provided, or signatureData/signatureDataURL
        if (data.signatureCanvas) {
          if (!isSignaturePresent(data.signatureCanvas)) {
            errors.signatureData = 'validation.signature';
          }
        } else if (!_isPresent(data.signatureData) && !_isPresent(data.signatureDataURL)) {
          errors.signatureData = 'validation.signature';
        }
        break;

      default:
        break;
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors: errors
    };
  }

  /**
   * Internal helper — checks if a value is present (non-null, non-undefined, non-empty string).
   * @param {*} value
   * @returns {boolean}
   */
  function _isPresent(value) {
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return false;
    }
    return true;
  }

  // Public API
  return {
    validateEmail: validateEmail,
    validateRequired: validateRequired,
    validateDNI: validateDNI,
    validateStep: validateStep,
    isSignaturePresent: isSignaturePresent
  };
})();
