/**
 * Family Day 2026 - Amazon BCN1
 * Step 5 — Confirmation Summary View
 *
 * Renders a read-only summary of all data entered in Steps 1–4.
 * Displays sections: Personal Data, Companions, Dietary, Image Rights.
 * The Wizard handles the submit button ("✓ Guardar cambios") on step 5.
 * Registers itself with the Wizard via Wizard.registerStepRenderer(5, Step5.render).
 */
'use strict';

var Step5 = (function () {

  /**
   * Render Step 5 summary inside the given container element.
   * @param {HTMLElement} container - The DOM element to render the step content into
   */
  function render(container) {
    var data = FormStore.data;

    // Card wrapper
    var card = document.createElement('div');
    card.className = 'card';

    // Step title
    var title = document.createElement('h2');
    title.className = 'card__title';
    title.textContent = I18n.t('form.step5.title');
    card.appendChild(title);

    // Summary content
    var content = document.createElement('div');
    content.className = 'card__content';

    // Section 1: Personal Data
    content.appendChild(renderSection(
      I18n.t('form.step5.personalData'),
      renderPersonalData(data)
    ));

    // Section 2: Companions
    content.appendChild(renderSection(
      I18n.t('form.step5.companions'),
      renderCompanions(data)
    ));

    // Section 3: Dietary
    content.appendChild(renderSection(
      I18n.t('form.step5.dietary'),
      renderDietary(data)
    ));

    // Section 4: Image Rights
    content.appendChild(renderSection(
      I18n.t('form.step5.imageRights'),
      renderImageRights(data)
    ));

    card.appendChild(content);
    container.appendChild(card);
  }

  /**
   * Render a summary section with a heading and content.
   * @param {string} heading - Section heading text
   * @param {HTMLElement} contentEl - The content element for the section
   * @returns {HTMLElement} The section element
   */
  function renderSection(heading, contentEl) {
    var section = document.createElement('div');
    section.className = 'summary-section';

    var h3 = document.createElement('h3');
    h3.className = 'summary-section__title';
    h3.textContent = heading;
    section.appendChild(h3);

    section.appendChild(contentEl);

    return section;
  }

  /**
   * Render personal data summary (Step 1 fields).
   * @param {object} data - FormStore data
   * @returns {HTMLElement} The summary list element
   */
  function renderPersonalData(data) {
    var dl = document.createElement('dl');
    dl.className = 'summary-list';

    addSummaryItem(dl, I18n.t('form.step1.fullName'), data.fullName || '—');
    addSummaryItem(dl, I18n.t('form.step1.login'), data.login || '—');
    addSummaryItem(dl, I18n.t('form.step1.email'), data.email || '—');
    addSummaryItem(dl, I18n.t('form.step1.dni'), data.dni || '—');
    addSummaryItem(dl, I18n.t('form.step1.department'), data.department || '—');

    return dl;
  }

  /**
   * Render companions summary (Step 2 fields).
   * @param {object} data - FormStore data
   * @returns {HTMLElement} The summary content element
   */
  function renderCompanions(data) {
    var p = document.createElement('p');
    p.className = 'summary-text';

    var count = Number(data.companionCount) || 0;
    var minors = Number(data.minorCount) || 0;

    if (count === 0) {
      p.textContent = I18n.t('form.step5.noCompanions');
    } else {
      p.textContent = count + ' acompañantes (' + minors + ' ' + I18n.t('form.step5.minors') + ')';
    }

    return p;
  }

  /**
   * Render dietary summary (Step 3 fields).
   * @param {object} data - FormStore data
   * @returns {HTMLElement} The summary content element
   */
  function renderDietary(data) {
    var wrapper = document.createElement('div');
    wrapper.className = 'summary-text';

    if (data.hasDietaryNeeds === 'no' || !data.hasDietaryNeeds) {
      var p = document.createElement('p');
      p.textContent = I18n.t('form.step5.noDietaryNeeds');
      wrapper.appendChild(p);
    } else {
      // List the selected dietary options
      var options = data.dietaryOptions;
      if (Array.isArray(options) && options.length > 0) {
        var ul = document.createElement('ul');
        ul.className = 'summary-list--inline';
        for (var i = 0; i < options.length; i++) {
          var li = document.createElement('li');
          li.textContent = I18n.t('form.step3.' + options[i]);
          ul.appendChild(li);
        }
        wrapper.appendChild(ul);
      }

      // Show details if present
      if (data.dietaryDetails && data.dietaryDetails.trim() !== '') {
        var details = document.createElement('p');
        details.className = 'summary-text--details';
        details.textContent = data.dietaryDetails;
        wrapper.appendChild(details);
      }
    }

    return wrapper;
  }

  /**
   * Render image rights summary (Step 4 fields).
   * @param {object} data - FormStore data
   * @returns {HTMLElement} The summary content element
   */
  function renderImageRights(data) {
    var wrapper = document.createElement('div');
    wrapper.className = 'summary-text';

    var authText = '';
    if (data.imageAuthorization === 'authorize') {
      authText = I18n.t('form.step5.authorized');
    } else if (data.imageAuthorization === 'deny') {
      authText = I18n.t('form.step5.denied');
    } else {
      authText = '—';
    }

    var p = document.createElement('p');
    p.textContent = authText;

    // Append signed status if signature data exists
    if (data.signatureData && data.signatureData !== '') {
      p.textContent += ' — ' + I18n.t('form.step5.signed');
    }

    wrapper.appendChild(p);

    return wrapper;
  }

  /**
   * Add a term/description pair to a definition list.
   * @param {HTMLElement} dl - The definition list element
   * @param {string} term - The label/term text
   * @param {string} description - The value/description text
   */
  function addSummaryItem(dl, term, description) {
    var dt = document.createElement('dt');
    dt.className = 'summary-list__term';
    dt.textContent = term;
    dl.appendChild(dt);

    var dd = document.createElement('dd');
    dd.className = 'summary-list__description';
    dd.textContent = description;
    dl.appendChild(dd);
  }

  // Public API
  return {
    render: render
  };
})();

// Register with the Wizard
Wizard.registerStepRenderer(5, Step5.render);
