/**
 * Family Day 2026 - Amazon BCN1
 * Step 3 — Dietary Requirements Form
 *
 * Renders the dietary needs question with conditional checkboxes and details field.
 * Registers with the Wizard via Wizard.registerStepRenderer(3, Step3.render).
 */
'use strict';

var Step3 = (function () {

  /** Available dietary options with their i18n keys */
  var DIETARY_OPTIONS = [
    { value: 'celiac', key: 'form.step3.celiac' },
    { value: 'lactose', key: 'form.step3.lactose' },
    { value: 'nuts', key: 'form.step3.nuts' },
    { value: 'vegetarian', key: 'form.step3.vegetarian' },
    { value: 'vegan', key: 'form.step3.vegan' }
  ];

  /**
   * Render Step 3 content into the provided container.
   * @param {HTMLElement} container - DOM element to render into
   */
  function render(container) {
    var stepData = FormStore.getStepData(3);

    // Step title
    var title = document.createElement('h2');
    title.className = 'card__title';
    title.textContent = I18n.t('form.step3.title');
    container.appendChild(title);

    // Main question label
    var questionGroup = document.createElement('div');
    questionGroup.className = 'form-group';
    questionGroup.setAttribute('data-field', 'hasDietaryNeeds');

    var questionLabel = document.createElement('label');
    questionLabel.className = 'form-group__label form-group__label--required';
    questionLabel.textContent = I18n.t('form.step3.question');
    questionGroup.appendChild(questionLabel);

    // Radio: Sí
    var radioYes = createRadio('hasDietaryNeeds', 'yes', I18n.t('form.step3.yes'), stepData.hasDietaryNeeds === 'yes');
    questionGroup.appendChild(radioYes);

    // Radio: No
    var radioNo = createRadio('hasDietaryNeeds', 'no', I18n.t('form.step3.no'), stepData.hasDietaryNeeds === 'no');
    questionGroup.appendChild(radioNo);

    container.appendChild(questionGroup);

    // Conditional section (checkboxes + textarea)
    var conditionalSection = document.createElement('div');
    conditionalSection.id = 'dietary-details-section';
    conditionalSection.setAttribute('aria-live', 'polite');

    // Show/hide based on current selection
    if (stepData.hasDietaryNeeds === 'yes') {
      renderConditionalContent(conditionalSection, stepData);
    }

    container.appendChild(conditionalSection);

    // Wire up radio change events
    var radios = questionGroup.querySelectorAll('input[name="hasDietaryNeeds"]');
    for (var i = 0; i < radios.length; i++) {
      radios[i].addEventListener('change', function (e) {
        var value = e.target.value;
        FormStore.setField(3, 'hasDietaryNeeds', value);

        var section = document.getElementById('dietary-details-section');
        section.innerHTML = '';

        if (value === 'yes') {
          var currentData = FormStore.getStepData(3);
          renderConditionalContent(section, currentData);
        } else {
          // Clear dietary data when "No" selected
          FormStore.setField(3, 'dietaryOptions', []);
          FormStore.setField(3, 'dietaryDetails', '');
        }
      });
    }
  }

  /**
   * Render the conditional checkboxes and textarea into the section.
   * @param {HTMLElement} section - Container for conditional content
   * @param {object} stepData - Current step 3 data from FormStore
   */
  function renderConditionalContent(section, stepData) {
    var selectedOptions = Array.isArray(stepData.dietaryOptions) ? stepData.dietaryOptions : [];

    // Checkboxes group
    var checkboxGroup = document.createElement('div');
    checkboxGroup.className = 'form-group';

    for (var i = 0; i < DIETARY_OPTIONS.length; i++) {
      var option = DIETARY_OPTIONS[i];
      var isChecked = selectedOptions.indexOf(option.value) !== -1;
      var checkbox = createCheckbox(option.value, I18n.t(option.key), isChecked);
      checkboxGroup.appendChild(checkbox);
    }

    section.appendChild(checkboxGroup);

    // Wire checkbox change events
    var checkboxInputs = checkboxGroup.querySelectorAll('input[type="checkbox"]');
    for (var j = 0; j < checkboxInputs.length; j++) {
      checkboxInputs[j].addEventListener('change', function () {
        var checked = [];
        var allCheckboxes = section.querySelectorAll('input[type="checkbox"]');
        for (var k = 0; k < allCheckboxes.length; k++) {
          if (allCheckboxes[k].checked) {
            checked.push(allCheckboxes[k].value);
          }
        }
        FormStore.setField(3, 'dietaryOptions', checked);
      });
    }

    // Free text area for details
    var textGroup = document.createElement('div');
    textGroup.className = 'form-group';

    var textLabel = document.createElement('label');
    textLabel.className = 'form-group__label';
    textLabel.setAttribute('for', 'dietary-details');
    textLabel.textContent = I18n.t('form.step3.details');
    textGroup.appendChild(textLabel);

    var textarea = document.createElement('textarea');
    textarea.id = 'dietary-details';
    textarea.name = 'dietaryDetails';
    textarea.className = 'textarea';
    textarea.placeholder = I18n.t('form.step3.details.placeholder');
    textarea.value = stepData.dietaryDetails || '';
    textarea.rows = 3;
    textGroup.appendChild(textarea);

    section.appendChild(textGroup);

    // Wire textarea input event
    textarea.addEventListener('input', function (e) {
      FormStore.setField(3, 'dietaryDetails', e.target.value);
    });
  }

  /**
   * Create a radio button element with BEM classes.
   * @param {string} name - Radio group name
   * @param {string} value - Radio value
   * @param {string} labelText - Display label
   * @param {boolean} checked - Whether this radio is selected
   * @returns {HTMLElement} Radio container element
   */
  function createRadio(name, value, labelText, checked) {
    var wrapper = document.createElement('div');
    wrapper.className = 'radio';

    var input = document.createElement('input');
    input.type = 'radio';
    input.className = 'radio__input';
    input.name = name;
    input.value = value;
    input.id = 'radio-' + name + '-' + value;
    if (checked) {
      input.checked = true;
    }

    var label = document.createElement('label');
    label.className = 'radio__label';
    label.setAttribute('for', input.id);
    label.textContent = labelText;

    wrapper.appendChild(input);
    wrapper.appendChild(label);
    return wrapper;
  }

  /**
   * Create a checkbox element with BEM classes.
   * @param {string} value - Checkbox value
   * @param {string} labelText - Display label
   * @param {boolean} checked - Whether this checkbox is checked
   * @returns {HTMLElement} Checkbox container element
   */
  function createCheckbox(value, labelText, checked) {
    var wrapper = document.createElement('div');
    wrapper.className = 'checkbox';

    var input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'checkbox__input';
    input.name = 'dietaryOptions';
    input.value = value;
    input.id = 'checkbox-' + value;
    if (checked) {
      input.checked = true;
    }

    var label = document.createElement('label');
    label.className = 'checkbox__label';
    label.setAttribute('for', input.id);
    label.textContent = labelText;

    wrapper.appendChild(input);
    wrapper.appendChild(label);
    return wrapper;
  }

  // Register with the Wizard
  if (typeof Wizard !== 'undefined' && typeof Wizard.registerStepRenderer === 'function') {
    Wizard.registerStepRenderer(3, render);
  }

  // Public API
  return {
    render: render
  };
})();
