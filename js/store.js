/**
 * Family Day 2026 - Amazon BCN1
 * Form State Store Module
 *
 * Manages multi-step form state with validation state tracking.
 * Stores all registration data in memory (no localStorage dependency).
 * Provides methods to set/get field values per step, validate, reset, and serialize for API.
 */
'use strict';

var FormStore = (function () {

  /**
   * Returns a fresh RegistrationData object with all fields at default values.
   * @returns {object} Default RegistrationData
   */
  function createDefaultData() {
    return {
      // Step 1 - Personal Data
      fullName: '',
      login: '',
      email: '',
      dni: '',
      department: '',

      // Step 2 - Companions
      companionCount: '',
      minorCount: '',

      // Step 3 - Dietary Requirements
      hasDietaryNeeds: '',
      dietaryOptions: [],
      dietaryDetails: '',

      // Step 4 - Image Rights
      imageAuthorization: '',
      signatureData: '',

      // Metadata
      registrationDate: '',
      checkedIn: false,
      checkedInDate: ''
    };
  }

  /**
   * Mapping of step numbers to the field names that belong to each step.
   */
  var stepFields = {
    1: ['fullName', 'login', 'email', 'dni', 'department'],
    2: ['companionCount', 'minorCount'],
    3: ['hasDietaryNeeds', 'dietaryOptions', 'dietaryDetails'],
    4: ['imageAuthorization', 'signatureData']
  };

  // Internal form data state
  var data = createDefaultData();

  /**
   * Set a single field value for a given step.
   * Only allows setting fields that belong to the specified step.
   * @param {number} step - Step number (1-4)
   * @param {string} field - Field name to update
   * @param {*} value - New value for the field
   */
  function setField(step, field, value) {
    var fields = stepFields[step];
    if (fields && fields.indexOf(field) !== -1) {
      data[field] = value;
    }
  }

  /**
   * Get all field data for a specific step.
   * @param {number} step - Step number (1-4)
   * @returns {object} Object with all field values for the step
   */
  function getStepData(step) {
    var fields = stepFields[step];
    if (!fields) {
      return {};
    }
    var stepData = {};
    for (var i = 0; i < fields.length; i++) {
      stepData[fields[i]] = data[fields[i]];
    }
    return stepData;
  }

  /**
   * Check if a step's data passes validation.
   * Delegates to the global Validation module if available.
   * @param {number} step - Step number (1-4)
   * @returns {boolean} True if the step data is valid
   */
  function isStepValid(step) {
    if (typeof Validation !== 'undefined' && typeof Validation.validateStep === 'function') {
      var result = Validation.validateStep(step, getStepData(step));
      return result.valid;
    }
    // If Validation module is not loaded, assume valid (graceful degradation)
    return true;
  }

  /**
   * Reset all form data to default values.
   */
  function reset() {
    data = createDefaultData();
  }

  /**
   * Serialize all form fields into a payload object suitable for API submission.
   * Maps internal field names to the API payload format defined in the design doc.
   * @returns {object} Payload object for POST to Google Apps Script
   */
  function toPayload() {
    return {
      fullName: data.fullName,
      login: data.login,
      email: data.email,
      dni: data.dni,
      department: data.department,
      companionCount: data.companionCount === '' ? 0 : Number(data.companionCount),
      minorCount: data.minorCount === '' ? 0 : Number(data.minorCount),
      hasDietaryNeeds: data.hasDietaryNeeds === 'yes' || data.hasDietaryNeeds === true,
      dietaryOptions: Array.isArray(data.dietaryOptions) ? data.dietaryOptions.slice() : [],
      dietaryDetails: data.dietaryDetails,
      imageAuthorization: data.imageAuthorization,
      signature: data.signatureData,
      language: (typeof I18n !== 'undefined' && typeof I18n.getLang === 'function') ? I18n.getLang() : 'es'
    };
  }

  // Public API
  return {
    get data() { return data; },
    set data(val) { data = val; },
    setField: setField,
    getStepData: getStepData,
    isStepValid: isStepValid,
    reset: reset,
    toPayload: toPayload
  };
})();
