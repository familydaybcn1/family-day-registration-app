/**
 * Family Day 2026 - Amazon BCN1
 * Step 1 — Personal Data Form Renderer
 *
 * Renders the personal data form (fullName, login, email, dni, department).
 * Connects to FormStore for state persistence and displays inline validation errors.
 * Registers itself with the Wizard via Wizard.registerStepRenderer(1, Step1.render).
 */
'use strict';

var Step1 = (function () {

  /**
   * List of 16 department options.
   */
  var DEPARTMENTS = [
    'AMXL',
    'ATS',
    'CO',
    'Customer Service',
    'Finance',
    'HR/PXT',
    'IB',
    'ICQA',
    'IT',
    'Legal',
    'Loss Prevention',
    'OB',
    'Ops Engineering',
    'Operations',
    'Procurement',
    'Programs',
    'RME',
    'Safety',
    'SUPPORT',
    'Transportation',
    'UES4'
  ];

  /**
   * Render Step 1 form inside the given container element.
   * @param {HTMLElement} container - The DOM element to render the step content into
   */
  function render(container) {
    // Get existing data from FormStore (for pre-fill on back-navigation)
    var stepData = FormStore.getStepData(1);

    // Card wrapper
    var card = document.createElement('div');
    card.className = 'card';

    // Step title
    var title = document.createElement('h2');
    title.className = 'card__title';
    title.textContent = I18n.t('form.step1.title');
    card.appendChild(title);

    // Form content
    var form = document.createElement('div');
    form.className = 'card__content';

    // --- Full Name field ---
    form.appendChild(createTextField({
      name: 'fullName',
      labelKey: 'form.step1.fullName',
      placeholderKey: 'form.step1.fullName.placeholder',
      type: 'text',
      value: stepData.fullName || '',
      required: true
    }));

    // --- Login field ---
    form.appendChild(createTextField({
      name: 'login',
      labelKey: 'form.step1.login',
      placeholderKey: 'form.step1.login.placeholder',
      type: 'text',
      value: stepData.login || '',
      required: true
    }));

    // --- Email field ---
    form.appendChild(createTextField({
      name: 'email',
      labelKey: 'form.step1.email',
      placeholderKey: 'form.step1.email.placeholder',
      type: 'email',
      value: stepData.email || '',
      required: true
    }));

    // --- DNI/NIE field ---
    form.appendChild(createTextField({
      name: 'dni',
      labelKey: 'form.step1.dni',
      placeholderKey: 'form.step1.dni.placeholder',
      type: 'text',
      value: stepData.dni || '',
      required: true
    }));

    // --- Department dropdown ---
    form.appendChild(createDepartmentField(stepData.department || ''));

    card.appendChild(form);
    container.appendChild(card);
  }

  /**
   * Create a text/email input field with label and error placeholder.
   * @param {object} opts - Field options
   * @param {string} opts.name - Field name (matches FormStore field)
   * @param {string} opts.labelKey - i18n key for the label
   * @param {string} opts.placeholderKey - i18n key for placeholder text
   * @param {string} opts.type - Input type ('text' or 'email')
   * @param {string} opts.value - Pre-filled value
   * @param {boolean} opts.required - Whether field is required
   * @returns {HTMLElement} The form-group element
   */
  function createTextField(opts) {
    var group = document.createElement('div');
    group.className = 'form-group';

    // Label
    var label = document.createElement('label');
    label.className = 'form-group__label' + (opts.required ? ' form-group__label--required' : '');
    label.setAttribute('for', 'field-' + opts.name);
    label.textContent = I18n.t(opts.labelKey);
    group.appendChild(label);

    // Input
    var input = document.createElement('input');
    input.type = opts.type;
    input.id = 'field-' + opts.name;
    input.name = opts.name;
    input.className = 'input';
    input.placeholder = I18n.t(opts.placeholderKey);
    input.value = opts.value;
    input.setAttribute('data-field', opts.name);
    if (opts.required) {
      input.setAttribute('required', '');
    }

    // Event listeners: update FormStore on change and blur
    input.addEventListener('input', function () {
      clearFieldError(group, input);
      FormStore.setField(1, opts.name, input.value);
    });

    input.addEventListener('blur', function () {
      FormStore.setField(1, opts.name, input.value);
      validateField(opts.name, input.value, group, input);
    });

    group.appendChild(input);

    return group;
  }

  /**
   * Create the Department dropdown field.
   * @param {string} currentValue - Currently selected department value
   * @returns {HTMLElement} The form-group element
   */
  function createDepartmentField(currentValue) {
    var group = document.createElement('div');
    group.className = 'form-group';

    // Label
    var label = document.createElement('label');
    label.className = 'form-group__label form-group__label--required';
    label.setAttribute('for', 'field-department');
    label.textContent = I18n.t('form.step1.department');
    group.appendChild(label);

    // Select
    var select = document.createElement('select');
    select.id = 'field-department';
    select.name = 'department';
    select.className = 'select';
    select.setAttribute('data-field', 'department');
    select.setAttribute('required', '');

    // Placeholder option
    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = I18n.t('form.step1.department.placeholder');
    placeholder.disabled = true;
    if (!currentValue) {
      placeholder.selected = true;
    }
    select.appendChild(placeholder);

    // Department options
    for (var i = 0; i < DEPARTMENTS.length; i++) {
      var option = document.createElement('option');
      option.value = DEPARTMENTS[i];
      option.textContent = DEPARTMENTS[i];
      if (currentValue === DEPARTMENTS[i]) {
        option.selected = true;
      }
      select.appendChild(option);
    }

    // Event listeners
    select.addEventListener('change', function () {
      clearFieldError(group, select);
      FormStore.setField(1, 'department', select.value);
    });

    select.addEventListener('blur', function () {
      FormStore.setField(1, 'department', select.value);
      validateField('department', select.value, group, select);
    });

    group.appendChild(select);

    return group;
  }

  /**
   * Validate a single field and display inline error if invalid.
   * @param {string} fieldName - The field name
   * @param {string} value - Current field value
   * @param {HTMLElement} group - The form-group container
   * @param {HTMLElement} fieldEl - The input/select element
   */
  function validateField(fieldName, value, group, fieldEl) {
    var result;

    switch (fieldName) {
      case 'email':
        if (!value || value.trim() === '') {
          result = { valid: false, errorKey: 'validation.required' };
        } else {
          result = Validation.validateEmail(value);
        }
        break;
      case 'dni':
        if (!value || value.trim() === '') {
          result = { valid: false, errorKey: 'validation.required' };
        } else {
          result = Validation.validateDNI(value);
        }
        break;
      default:
        result = Validation.validateRequired(value);
        break;
    }

    if (!result.valid) {
      showFieldError(group, fieldEl, result.errorKey);
    }
  }

  /**
   * Display an inline error message below a field.
   * @param {HTMLElement} group - The form-group container
   * @param {HTMLElement} fieldEl - The input/select element
   * @param {string} errorKey - The i18n key for the error message
   */
  function showFieldError(group, fieldEl, errorKey) {
    // Clear any existing error first
    clearFieldError(group, fieldEl);

    // Add error class to input
    fieldEl.classList.add('input--error');

    // Create error message element
    var errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.setAttribute('role', 'alert');
    errorEl.setAttribute('data-error-for', fieldEl.name);
    errorEl.textContent = I18n.t(errorKey);

    group.appendChild(errorEl);
  }

  /**
   * Clear inline error message from a field.
   * @param {HTMLElement} group - The form-group container
   * @param {HTMLElement} fieldEl - The input/select element
   */
  function clearFieldError(group, fieldEl) {
    fieldEl.classList.remove('input--error');
    var existing = group.querySelector('.error-message');
    if (existing) {
      existing.parentNode.removeChild(existing);
    }
  }

  // Public API
  return {
    render: render
  };
})();

// Register with the Wizard
Wizard.registerStepRenderer(1, Step1.render);
