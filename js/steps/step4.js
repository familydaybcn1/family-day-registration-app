/**
 * Family Day 2026 - Amazon BCN1
 * Step 4 — Image Rights Authorization Form Renderer
 *
 * Renders the image rights authorization form:
 * - Full legal text (Ley Orgánica 1/1982 + GDPR)
 * - Mandatory radio selection (Autorizo / No autorizo)
 * - Signature canvas using SignaturePad CDN global
 * - "Limpiar firma" button to clear the signature
 *
 * Validates signature presence and authorization selection before proceeding.
 * Registers itself with the Wizard via Wizard.registerStepRenderer(4, Step4.render).
 */
'use strict';

var Step4 = (function () {

  /**
   * Reference to the SignaturePad instance for external validation access.
   * @type {SignaturePad|null}
   */
  var signaturePadInstance = null;

  /**
   * Render Step 4 form inside the given container element.
   * @param {HTMLElement} container - The DOM element to render the step content into
   */
  function render(container) {
    // Get existing data from FormStore (for pre-fill on back-navigation)
    var stepData = FormStore.getStepData(4);

    // Card wrapper
    var card = document.createElement('div');
    card.className = 'card';

    // Step title
    var title = document.createElement('h2');
    title.className = 'card__title';
    title.textContent = I18n.t('form.step4.title');
    card.appendChild(title);

    // Form content
    var content = document.createElement('div');
    content.className = 'card__content';

    // --- Legal header (bold/emphasized) ---
    var legalHeader = document.createElement('div');
    legalHeader.className = 'alert--warning';
    legalHeader.style.padding = 'var(--space-md)';
    legalHeader.style.marginBottom = 'var(--space-md)';
    legalHeader.style.fontWeight = '700';
    legalHeader.textContent = I18n.t('form.step4.legalHeader');
    content.appendChild(legalHeader);

    // --- Legal text body (full paragraph) ---
    var legalText = document.createElement('p');
    legalText.style.marginBottom = 'var(--space-lg)';
    legalText.style.lineHeight = '1.6';
    legalText.style.fontSize = 'var(--font-size-sm)';
    legalText.textContent = I18n.t('form.step4.legalText');
    content.appendChild(legalText);

    // --- Authorization radio buttons ---
    var radioGroup = createAuthorizationRadio(stepData.imageAuthorization || '');
    content.appendChild(radioGroup);

    // --- Signature section ---
    var signatureSection = createSignatureSection(stepData.signatureData || '');
    content.appendChild(signatureSection);

    card.appendChild(content);
    container.appendChild(card);
  }

  /**
   * Create the authorization radio group (Autorizo / No autorizo).
   * @param {string} currentValue - Currently selected value ('authorize' or 'deny')
   * @returns {HTMLElement} The form-group element containing the radio buttons
   */
  function createAuthorizationRadio(currentValue) {
    var group = document.createElement('div');
    group.className = 'form-group';
    group.setAttribute('data-field', 'imageAuthorization');

    // Label for the radio group
    var label = document.createElement('label');
    label.className = 'form-group__label form-group__label--required';
    label.textContent = I18n.t('form.step4.signature');
    label.id = 'authorization-label';
    group.appendChild(label);

    // Radio: Autorizo
    var authorizeOption = document.createElement('div');
    authorizeOption.className = 'radio';

    var authorizeInput = document.createElement('input');
    authorizeInput.type = 'radio';
    authorizeInput.id = 'field-authorize';
    authorizeInput.name = 'imageAuthorization';
    authorizeInput.className = 'radio__input';
    authorizeInput.value = 'authorize';
    if (currentValue === 'authorize') {
      authorizeInput.checked = true;
    }

    var authorizeLabel = document.createElement('label');
    authorizeLabel.className = 'radio__label';
    authorizeLabel.setAttribute('for', 'field-authorize');
    authorizeLabel.textContent = I18n.t('form.step4.authorize');

    authorizeOption.appendChild(authorizeInput);
    authorizeOption.appendChild(authorizeLabel);
    group.appendChild(authorizeOption);

    // Radio: No autorizo
    var denyOption = document.createElement('div');
    denyOption.className = 'radio';

    var denyInput = document.createElement('input');
    denyInput.type = 'radio';
    denyInput.id = 'field-deny';
    denyInput.name = 'imageAuthorization';
    denyInput.className = 'radio__input';
    denyInput.value = 'deny';
    if (currentValue === 'deny') {
      denyInput.checked = true;
    }

    var denyLabel = document.createElement('label');
    denyLabel.className = 'radio__label';
    denyLabel.setAttribute('for', 'field-deny');
    denyLabel.textContent = I18n.t('form.step4.deny');

    denyOption.appendChild(denyInput);
    denyOption.appendChild(denyLabel);
    group.appendChild(denyOption);

    // Event listeners for radio changes
    authorizeInput.addEventListener('change', function () {
      FormStore.setField(4, 'imageAuthorization', 'authorize');
    });

    denyInput.addEventListener('change', function () {
      FormStore.setField(4, 'imageAuthorization', 'deny');
    });

    return group;
  }

  /**
   * Create the signature canvas section with clear button.
   * @param {string} existingSignatureData - Existing signature data URL (for pre-fill)
   * @returns {HTMLElement} The signature section element
   */
  function createSignatureSection(existingSignatureData) {
    var section = document.createElement('div');
    section.className = 'signature';

    // Signature label
    var sigLabel = document.createElement('label');
    sigLabel.className = 'form-group__label form-group__label--required';
    sigLabel.textContent = I18n.t('form.step4.signature');
    section.appendChild(sigLabel);

    // Canvas element
    var canvas = document.createElement('canvas');
    canvas.className = 'signature__canvas';
    canvas.setAttribute('data-field', 'signatureData');
    canvas.width = 600;
    canvas.height = 200;
    section.appendChild(canvas);

    // Signed indicator (shown if pre-existing signature)
    if (existingSignatureData) {
      var signedIndicator = document.createElement('p');
      signedIndicator.className = 'mt-sm';
      signedIndicator.style.color = 'var(--success)';
      signedIndicator.style.fontWeight = '600';
      signedIndicator.textContent = '✓ ' + I18n.t('form.step5.signed');
      section.appendChild(signedIndicator);
    }

    // Actions container
    var actions = document.createElement('div');
    actions.className = 'signature__actions';

    // Clear button
    var clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'btn btn--outline';
    clearBtn.textContent = I18n.t('form.step4.clearSignature');
    clearBtn.addEventListener('click', function () {
      if (signaturePadInstance) {
        signaturePadInstance.clear();
        FormStore.setField(4, 'signatureData', '');
      }
    });

    actions.appendChild(clearBtn);
    section.appendChild(actions);

    // Initialize SignaturePad after the canvas is in the DOM
    setTimeout(function () {
      initSignaturePad(canvas, existingSignatureData);
    }, 0);

    return section;
  }

  /**
   * Initialize the SignaturePad library on the canvas element.
   * @param {HTMLCanvasElement} canvas - The canvas to attach SignaturePad to
   * @param {string} existingData - Existing signature data URL to restore
   */
  function initSignaturePad(canvas, existingData) {
    if (typeof SignaturePad === 'undefined') {
      console.warn('[Step4] SignaturePad library not loaded');
      return;
    }

    // Resize canvas to match its displayed size (CSS vs pixel dimensions)
    resizeCanvas(canvas);

    signaturePadInstance = new SignaturePad(canvas);

    // Restore existing signature if available
    if (existingData) {
      signaturePadInstance.fromDataURL(existingData);
    }

    // Save signature data to FormStore when the user finishes a stroke
    signaturePadInstance.addEventListener('endStroke', function () {
      var dataUrl = signaturePadInstance.toDataURL();
      FormStore.setField(4, 'signatureData', dataUrl);
    });

    // Handle canvas resize on window resize
    window.addEventListener('resize', function () {
      // Only resize if the signature pad is still active and in DOM
      if (!canvas.parentNode) return;
      var data = signaturePadInstance.toDataURL();
      resizeCanvas(canvas);
      signaturePadInstance.clear();
      if (data && data !== 'data:,') {
        signaturePadInstance.fromDataURL(data);
      }
    });
  }

  /**
   * Resize the canvas pixel dimensions to match its CSS display size.
   * This ensures the drawing coordinates align correctly with cursor/touch position.
   * @param {HTMLCanvasElement} canvas - The canvas element to resize
   */
  function resizeCanvas(canvas) {
    var ratio = Math.max(window.devicePixelRatio || 1, 1);
    var rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      canvas.getContext('2d').scale(ratio, ratio);
    }
  }

  /**
   * Get the current SignaturePad instance.
   * Used externally for validation purposes.
   * @returns {SignaturePad|null} The active SignaturePad instance
   */
  function getSignaturePad() {
    return signaturePadInstance;
  }

  /**
   * Save current signature data to FormStore.
   * Called before validation runs to ensure signatureData is up to date.
   */
  function saveSignatureData() {
    if (signaturePadInstance && !signaturePadInstance.isEmpty()) {
      var dataUrl = signaturePadInstance.toDataURL();
      FormStore.setField(4, 'signatureData', dataUrl);
    } else if (signaturePadInstance && signaturePadInstance.isEmpty()) {
      FormStore.setField(4, 'signatureData', '');
    }
  }

  // Public API
  return {
    render: render,
    getSignaturePad: getSignaturePad,
    saveSignatureData: saveSignatureData
  };
})();


// Register with the Wizard
Wizard.registerStepRenderer(4, Step4.render);
