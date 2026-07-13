/**
 * Family Day 2026 - Amazon BCN1
 * Step 2 — Companions Form
 *
 * Renders companion count dropdown (0–3) and conditionally
 * displays a minors dropdown (0–N) when companions > 0.
 * Integrates with FormStore and I18n for state/persistence and translation.
 */
'use strict';

var Step2 = (function () {

  /**
   * Render Step 2 content into the given container element.
   * @param {HTMLElement} container - The wizard step content container
   */
  function render(container) {
    container.innerHTML = '';

    // Step title
    var title = document.createElement('h2');
    title.textContent = I18n.t('form.step2.title');
    container.appendChild(title);

    // Pre-fill from store when navigating back
    var stepData = FormStore.getStepData(2);
    var savedCompanionCount = stepData.companionCount;
    var savedMinorCount = stepData.minorCount;

    // --- Companion count dropdown ---
    var companionGroup = document.createElement('div');
    companionGroup.className = 'form-group';

    var companionLabel = document.createElement('label');
    companionLabel.className = 'form-group__label form-group__label--required';
    companionLabel.setAttribute('for', 'field-companionCount');
    companionLabel.textContent = I18n.t('form.step2.companionCount');
    companionGroup.appendChild(companionLabel);

    var companionSelect = document.createElement('select');
    companionSelect.className = 'select';
    companionSelect.id = 'field-companionCount';
    companionSelect.name = 'companionCount';
    companionSelect.setAttribute('data-field', 'companionCount');

    // Placeholder option
    var placeholderOpt = document.createElement('option');
    placeholderOpt.value = '';
    placeholderOpt.textContent = I18n.t('form.step2.companionCount.placeholder');
    placeholderOpt.disabled = true;
    if (savedCompanionCount === '' || savedCompanionCount === undefined || savedCompanionCount === null) {
      placeholderOpt.selected = true;
    }
    companionSelect.appendChild(placeholderOpt);

    // Options 0–3
    var companionKeys = [
      'form.step2.companion0',
      'form.step2.companion1',
      'form.step2.companion2',
      'form.step2.companion3'
    ];
    for (var i = 0; i <= 3; i++) {
      var opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = I18n.t(companionKeys[i]);
      if (String(savedCompanionCount) === String(i)) {
        opt.selected = true;
      }
      companionSelect.appendChild(opt);
    }

    companionGroup.appendChild(companionSelect);
    container.appendChild(companionGroup);

    // --- Minors dropdown (conditionally shown) ---
    var minorGroup = document.createElement('div');
    minorGroup.className = 'form-group';
    minorGroup.id = 'minor-group';

    var minorLabel = document.createElement('label');
    minorLabel.className = 'form-group__label form-group__label--required';
    minorLabel.setAttribute('for', 'field-minorCount');
    minorLabel.textContent = I18n.t('form.step2.minorCount');
    minorGroup.appendChild(minorLabel);

    var minorSelect = document.createElement('select');
    minorSelect.className = 'select';
    minorSelect.id = 'field-minorCount';
    minorSelect.name = 'minorCount';
    minorSelect.setAttribute('data-field', 'minorCount');
    minorGroup.appendChild(minorSelect);

    container.appendChild(minorGroup);

    // Initialize minors dropdown visibility and options
    updateMinorsDropdown(minorGroup, minorSelect, savedCompanionCount, savedMinorCount);

    // --- Event: companion count change ---
    companionSelect.addEventListener('change', function () {
      var newCount = companionSelect.value;
      FormStore.setField(2, 'companionCount', newCount);

      var numericCount = Number(newCount);

      if (numericCount === 0 || newCount === '') {
        // Hide minors, reset minorCount
        FormStore.setField(2, 'minorCount', '');
        updateMinorsDropdown(minorGroup, minorSelect, newCount, '');
      } else {
        // Check if current minorCount exceeds new companion count
        var currentMinor = FormStore.getStepData(2).minorCount;
        if (currentMinor !== '' && Number(currentMinor) > numericCount) {
          FormStore.setField(2, 'minorCount', '');
          currentMinor = '';
        }
        updateMinorsDropdown(minorGroup, minorSelect, newCount, currentMinor);
      }
    });

    // --- Event: minor count change ---
    minorSelect.addEventListener('change', function () {
      FormStore.setField(2, 'minorCount', minorSelect.value);
    });
  }

  /**
   * Update the minors dropdown visibility and options based on companion count.
   * @param {HTMLElement} minorGroup - The .form-group container for minors
   * @param {HTMLSelectElement} minorSelect - The minors select element
   * @param {string|number} companionCount - Current companion count value
   * @param {string|number} selectedMinor - Currently saved minor count value
   */
  function updateMinorsDropdown(minorGroup, minorSelect, companionCount, selectedMinor) {
    var count = Number(companionCount);

    if (!companionCount || companionCount === '' || count === 0) {
      // Hide the minors group
      minorGroup.style.display = 'none';
      minorSelect.innerHTML = '';
      return;
    }

    // Show the minors group
    minorGroup.style.display = '';

    // Rebuild options: placeholder + 0 to N
    minorSelect.innerHTML = '';

    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = I18n.t('form.step2.minorCount.placeholder');
    placeholder.disabled = true;
    if (selectedMinor === '' || selectedMinor === undefined || selectedMinor === null) {
      placeholder.selected = true;
    }
    minorSelect.appendChild(placeholder);

    for (var j = 0; j <= count; j++) {
      var opt = document.createElement('option');
      opt.value = String(j);
      opt.textContent = String(j);
      if (String(selectedMinor) === String(j)) {
        opt.selected = true;
      }
      minorSelect.appendChild(opt);
    }
  }

  // Register with Wizard
  if (typeof Wizard !== 'undefined' && Wizard.registerStepRenderer) {
    Wizard.registerStepRenderer(2, render);
  }

  // Public API
  return {
    render: render
  };
})();
