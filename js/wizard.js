/**
 * Family Day 2026 - Amazon BCN1
 * Wizard Orchestrator Module
 *
 * Manages the 5-step registration form wizard UI:
 * - Renders progress indicator ("Paso N de 5")
 * - Handles forward navigation with validation gating
 * - Handles backward navigation (always free)
 * - Dispatches 'wizardStepChanged' custom events
 * - Allows step renderers to plug in via registerStepRenderer()
 */
'use strict';

var Wizard = (function () {
  var TOTAL_STEPS = 5;
  var currentStep = 1;
  var container = null;
  var stepRenderers = {};

  /**
   * Register a renderer function for a specific step.
   * @param {number} step - Step number (1-5)
   * @param {function} renderFn - Function that receives a container element and renders step content
   */
  function registerStepRenderer(step, renderFn) {
    if (step >= 1 && step <= TOTAL_STEPS && typeof renderFn === 'function') {
      stepRenderers[step] = renderFn;
    }
  }

  /**
   * Initialize the wizard inside a given container element.
   * Renders the full wizard UI structure and navigates to step 1.
   * @param {HTMLElement} containerEl - The DOM element to render the wizard into
   */
  function init(containerEl) {
    container = containerEl;
    currentStep = 1;
    render();
  }

  /**
   * Get the current active step number.
   * @returns {number} Current step (1-5)
   */
  function getCurrentStep() {
    return currentStep;
  }

  /**
   * Navigate to a specific step.
   * Forward navigation requires validation of the current step.
   * Backward navigation is always allowed.
   * @param {number} step - Target step number (1-5)
   * @returns {boolean} True if navigation succeeded
   */
  function goToStep(step) {
    if (step < 1 || step > TOTAL_STEPS) {
      return false;
    }

    // Backward navigation — always free
    if (step < currentStep) {
      currentStep = step;
      render();
      dispatchStepChanged(currentStep);
      return true;
    }

    // Same step — no-op
    if (step === currentStep) {
      return true;
    }

    // Forward navigation — validate each intermediate step
    for (var s = currentStep; s < step; s++) {
      if (!validateAndShowErrors(s)) {
        return false;
      }
    }

    currentStep = step;
    render();
    dispatchStepChanged(currentStep);
    return true;
  }

  /**
   * Validate a step's data and display error messages if invalid.
   * @param {number} step - Step to validate (1-4)
   * @returns {boolean} True if the step is valid
   */
  function validateAndShowErrors(step) {
    // Step 5 is the summary — no validation needed
    if (step >= 5) {
      return true;
    }

    if (typeof Validation === 'undefined' || typeof FormStore === 'undefined') {
      return true;
    }

    // For step 4, save the signature data from the pad before validation
    if (step === 4 && typeof Step4 !== 'undefined' && typeof Step4.saveSignatureData === 'function') {
      Step4.saveSignatureData();
    }

    var stepData = FormStore.getStepData(step);
    var result = Validation.validateStep(step, stepData);

    if (!result.valid) {
      showValidationErrors(result.errors);
      return false;
    }

    return true;
  }

  /**
   * Display validation error messages below the corresponding fields.
   * @param {object} errors - Map of field name to error key
   */
  function showValidationErrors(errors) {
    // Clear existing error messages
    clearValidationErrors();

    var keys = Object.keys(errors);
    for (var i = 0; i < keys.length; i++) {
      var field = keys[i];
      var errorKey = errors[field];
      var errorText = (typeof I18n !== 'undefined') ? I18n.t(errorKey) : errorKey;

      // Find the field element by name or id
      var fieldEl = container.querySelector('[name="' + field + '"]') ||
                    container.querySelector('#field-' + field) ||
                    container.querySelector('[data-field="' + field + '"]');

      if (fieldEl) {
        // Add error styling to the field
        fieldEl.classList.add('input--error');

        // Create error message element
        var errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.setAttribute('role', 'alert');
        errorEl.setAttribute('data-error-for', field);
        errorEl.textContent = errorText;

        // Insert after the field's parent form-group or after the field itself
        var formGroup = fieldEl.closest('.form-group');
        if (formGroup) {
          formGroup.appendChild(errorEl);
        } else {
          fieldEl.parentNode.insertBefore(errorEl, fieldEl.nextSibling);
        }
      }
    }
  }

  /**
   * Clear all displayed validation error messages.
   */
  function clearValidationErrors() {
    if (!container) return;

    var errorEls = container.querySelectorAll('.error-message[data-error-for]');
    for (var i = 0; i < errorEls.length; i++) {
      errorEls[i].parentNode.removeChild(errorEls[i]);
    }

    var errorInputs = container.querySelectorAll('.input--error');
    for (var j = 0; j < errorInputs.length; j++) {
      errorInputs[j].classList.remove('input--error');
    }
  }

  /**
   * Render the complete wizard UI: progress indicator, step content, and navigation buttons.
   */
  function render() {
    if (!container) return;

    container.innerHTML = '';

    // Progress text ("Paso N de 5")
    var progressText = document.createElement('p');
    progressText.className = 'text-center mb-md';
    progressText.setAttribute('aria-live', 'polite');
    var stepLabel = (typeof I18n !== 'undefined') ? I18n.t('common.step') : 'Paso';
    var ofLabel = (typeof I18n !== 'undefined') ? I18n.t('common.of') : 'de';
    progressText.textContent = stepLabel + ' ' + currentStep + ' ' + ofLabel + ' ' + TOTAL_STEPS;
    container.appendChild(progressText);

    // Progress indicator (step circles + connectors)
    var progressBar = renderProgressIndicator();
    container.appendChild(progressBar);

    // Step content container
    var stepContent = document.createElement('div');
    stepContent.id = 'wizard-step-content';
    stepContent.setAttribute('role', 'region');
    stepContent.setAttribute('aria-label', stepLabel + ' ' + currentStep);
    container.appendChild(stepContent);

    // Render step content via registered renderer
    if (stepRenderers[currentStep]) {
      stepRenderers[currentStep](stepContent);
    }

    // Navigation buttons
    var navContainer = renderNavigation();
    container.appendChild(navContainer);
  }

  /**
   * Render the progress indicator with numbered step circles and connectors.
   * @returns {HTMLElement} The progress bar element
   */
  function renderProgressIndicator() {
    var progress = document.createElement('div');
    progress.className = 'progress';
    progress.setAttribute('role', 'navigation');
    progress.setAttribute('aria-label', 'Progress');

    for (var i = 1; i <= TOTAL_STEPS; i++) {
      // Step circle
      var stepEl = document.createElement('div');
      stepEl.className = 'progress__step';

      if (i === currentStep) {
        stepEl.className += ' progress__step--active';
        stepEl.setAttribute('aria-current', 'step');
      } else if (i < currentStep) {
        stepEl.className += ' progress__step--completed';
      }

      stepEl.textContent = String(i);
      stepEl.setAttribute('aria-label', (typeof I18n !== 'undefined' ? I18n.t('common.step') : 'Paso') + ' ' + i);
      progress.appendChild(stepEl);

      // Connector between steps (not after the last step)
      if (i < TOTAL_STEPS) {
        var connector = document.createElement('div');
        connector.className = 'progress__connector';
        if (i < currentStep) {
          connector.className += ' progress__connector--active';
        }
        progress.appendChild(connector);
      }
    }

    return progress;
  }

  /**
   * Render the navigation buttons (Anterior / Siguiente or Submit).
   * @returns {HTMLElement} The navigation container element
   */
  function renderNavigation() {
    var nav = document.createElement('div');
    nav.className = 'wizard-nav mt-lg';
    nav.style.display = 'flex';
    nav.style.justifyContent = 'space-between';
    nav.style.alignItems = 'center';
    nav.style.gap = 'var(--space-md, 1rem)';

    // Previous button (hidden on step 1)
    var prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'btn btn--secondary';
    prevBtn.textContent = (typeof I18n !== 'undefined') ? I18n.t('common.previous') : 'Anterior';
    prevBtn.setAttribute('aria-label', prevBtn.textContent);

    if (currentStep === 1) {
      prevBtn.style.visibility = 'hidden';
    }

    prevBtn.addEventListener('click', function () {
      if (currentStep > 1) {
        goToStep(currentStep - 1);
      }
    });

    nav.appendChild(prevBtn);

    // Next / Submit button
    var nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'btn btn--primary';

    if (currentStep === TOTAL_STEPS) {
      // On the last step, show submit text
      nextBtn.textContent = (typeof I18n !== 'undefined') ? I18n.t('form.step5.submit') : '✓ Guardar cambios';
      nextBtn.setAttribute('aria-label', nextBtn.textContent);
      nextBtn.addEventListener('click', function () {
        // Dispatch submit event — submission is handled externally
        var submitEvent;
        try {
          submitEvent = new CustomEvent('wizardSubmit');
        } catch (e) {
          submitEvent = document.createEvent('CustomEvent');
          submitEvent.initCustomEvent('wizardSubmit', true, true, {});
        }
        document.dispatchEvent(submitEvent);
      });
    } else {
      nextBtn.textContent = (typeof I18n !== 'undefined') ? I18n.t('common.next') : 'Siguiente';
      nextBtn.setAttribute('aria-label', nextBtn.textContent);
      nextBtn.addEventListener('click', function () {
        goToStep(currentStep + 1);
      });
    }

    nav.appendChild(nextBtn);

    return nav;
  }

  /**
   * Dispatch a 'wizardStepChanged' custom event with the new step number.
   * @param {number} step - The step that was navigated to
   */
  function dispatchStepChanged(step) {
    var event;
    try {
      event = new CustomEvent('wizardStepChanged', { detail: { step: step } });
    } catch (e) {
      // IE11 fallback
      event = document.createEvent('CustomEvent');
      event.initCustomEvent('wizardStepChanged', true, true, { step: step });
    }
    document.dispatchEvent(event);
  }

  // Public API
  return {
    init: init,
    goToStep: goToStep,
    getCurrentStep: getCurrentStep,
    registerStepRenderer: registerStepRenderer
  };
})();
