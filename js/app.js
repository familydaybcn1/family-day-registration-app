/**
 * Family Day 2026 - Amazon BCN1 Registration App
 * Main application entry point
 *
 * Initializes i18n, sets up the hash-based router with all views,
 * and handles language change events to re-render the current view.
 */
'use strict';

(function () {
  var mainContent;

  /**
   * Render the Landing Page view.
   */
  function renderLanding() {
    if (typeof LandingPage !== 'undefined') {
      LandingPage.init(mainContent);
    }
  }

  /**
   * Render the Registration Form view.
   */
  function renderRegister() {
    if (typeof Wizard !== 'undefined') {
      Wizard.init(mainContent);
    } else {
      mainContent.innerHTML = '<p>Registration form loading...</p>';
    }
  }

  /**
   * Render the Success Screen view.
   * Retrieves registration data from sessionStorage and renders QR ticket.
   */
  function renderSuccess() {
    if (typeof QRGenerator !== 'undefined') {
      var login = '';
      var companions = 0;

      // Retrieve registration result from sessionStorage
      try {
        login = sessionStorage.getItem('registration_login') || '';
        companions = parseInt(sessionStorage.getItem('registration_companions'), 10) || 0;
      } catch (e) {
        // sessionStorage may be unavailable
      }

      // Fallback: try to get from FormStore if sessionStorage is empty
      if (!login && typeof FormStore !== 'undefined') {
        var data = FormStore.data || {};
        login = data.login || '';
        companions = data.companionCount || 0;
      }

      QRGenerator.renderSuccessScreen(mainContent, login, companions);
    } else {
      mainContent.innerHTML = '<p>Success screen loading...</p>';
    }
  }

  /**
   * Render the Admin Dashboard view.
   */
  function renderAdmin() {
    if (typeof AdminDashboard !== 'undefined') {
      AdminDashboard.init(mainContent);
    } else {
      mainContent.innerHTML = '<p>Admin dashboard loading...</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    mainContent = document.getElementById('main-content');

    // Initialize i18n module (language toggle, initial language from sessionStorage)
    if (typeof I18n !== 'undefined') {
      I18n.init();
    }

    // Configure API endpoint (Google Apps Script Web App)
    if (typeof API !== 'undefined' && API.setEndpoint) {
      API.setEndpoint('https://script.google.com/macros/s/AKfycbze1ZJHn0TAJVRNWYtB1tbSL30sfN3lApn4sxd0tt8pf6_5S051HAGLRhQpNaljYho/exec');
    }

    // Initialize router with route map
    if (typeof Router !== 'undefined') {
      Router.init({
        '#/': renderLanding,
        '#/register': renderRegister,
        '#/success': renderSuccess,
        '#/admin': renderAdmin
      });
    }

    // Handle wizard form submission
    document.addEventListener('wizardSubmit', function () {
      if (typeof FormStore === 'undefined' || typeof API === 'undefined') {
        console.error('[App] FormStore or API module not available');
        return;
      }

      var payload = FormStore.toPayload();

      // Demo mode: if no API endpoint configured, skip API and go directly to success
      if (!API.getEndpoint || !API.getEndpoint()) {
        console.log('[App] Demo mode: no API endpoint configured, skipping submission');
        try {
          sessionStorage.setItem('registration_login', payload.login);
          sessionStorage.setItem('registration_companions', String(payload.companionCount));
          sessionStorage.setItem('registration_imageAuth', payload.imageAuthorization || '');
        } catch (e) {
          // sessionStorage may be unavailable
        }
        Router.navigate('#/success');
        FormStore.reset();
        return;
      }

      // Show a loading state on the submit button
      var submitBtn = mainContent.querySelector('.btn--primary:last-child');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = (typeof I18n !== 'undefined') ? I18n.t('common.loading') : 'Cargando...';
      }

      API.submitRegistration(payload)
        .then(function (result) {
          if (result.success && result.data && result.data.status === 'duplicate') {
            // Login already exists — show duplicate confirmation modal
            showDuplicateModal(payload, submitBtn);
            return;
          }

          if (result.success) {
            // Store login and companions in sessionStorage for the success screen
            try {
              sessionStorage.setItem('registration_login', payload.login);
              sessionStorage.setItem('registration_companions', String(payload.companionCount));
              sessionStorage.setItem('registration_imageAuth', payload.imageAuthorization || '');
            } catch (e) {
              // sessionStorage may be unavailable
            }

            // Navigate to success screen
            Router.navigate('#/success');

            // Reset the form store for future registrations
            FormStore.reset();
          } else {
            // Show error message with retry capability
            showSubmitError(result.error || 'error.unexpected', submitBtn);
          }
        })
        .catch(function () {
          showSubmitError('error.network', submitBtn);
        });
    });

    /**
     * Display a submission error message with retry option.
     * @param {string} errorKey - i18n error key
     * @param {HTMLElement|null} submitBtn - The submit button to re-enable
     */
    function showSubmitError(errorKey, submitBtn) {
      // Re-enable submit button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = (typeof I18n !== 'undefined') ? I18n.t('form.step5.submit') : '✓ Guardar cambios';
      }

      // Remove existing error alert if present
      var existing = mainContent.querySelector('.alert--error[data-submit-error]');
      if (existing) {
        existing.parentNode.removeChild(existing);
      }

      // Create error alert
      var errorMsg = (typeof I18n !== 'undefined') ? I18n.t(errorKey) : 'Error. Please try again.';
      var alertEl = document.createElement('div');
      alertEl.className = 'alert alert--error mt-md';
      alertEl.setAttribute('role', 'alert');
      alertEl.setAttribute('data-submit-error', 'true');
      alertEl.textContent = errorMsg;

      // Insert before the navigation buttons
      var nav = mainContent.querySelector('.wizard-nav');
      if (nav) {
        nav.parentNode.insertBefore(alertEl, nav);
      } else {
        mainContent.appendChild(alertEl);
      }
    }

    /**
     * Show a modal dialog when a duplicate login is detected.
     * Allows the user to update their existing registration or cancel.
     * @param {object} payload - The registration payload
     * @param {HTMLElement|null} submitBtn - The submit button to re-enable on cancel
     */
    function showDuplicateModal(payload, submitBtn) {
      // Re-enable submit button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = (typeof I18n !== 'undefined') ? I18n.t('form.step5.submit') : '✓ Guardar cambios';
      }

      // Remove existing modal if present
      var existingModal = document.querySelector('.modal-overlay[data-duplicate-modal]');
      if (existingModal) {
        existingModal.parentNode.removeChild(existingModal);
      }

      var title = (typeof I18n !== 'undefined') ? I18n.t('registration.duplicate.title') : '⚠️ Ya estás registrado/a';
      var message = (typeof I18n !== 'undefined') ? I18n.t('registration.duplicate.message') : 'Ya existe un registro con este login. ¿Quieres actualizar tu información?';
      var updateText = (typeof I18n !== 'undefined') ? I18n.t('registration.duplicate.update') : 'Sí, actualizar';
      var cancelText = (typeof I18n !== 'undefined') ? I18n.t('registration.duplicate.cancel') : 'Cancelar';

      // Create modal overlay
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.setAttribute('data-duplicate-modal', 'true');
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'duplicate-modal-title');

      var modal = document.createElement('div');
      modal.className = 'modal';

      var modalTitle = document.createElement('h2');
      modalTitle.className = 'modal__title';
      modalTitle.id = 'duplicate-modal-title';
      modalTitle.textContent = title;

      var modalMessage = document.createElement('p');
      modalMessage.className = 'modal__message';
      modalMessage.textContent = message;

      var modalActions = document.createElement('div');
      modalActions.className = 'modal__actions';

      var updateBtn = document.createElement('button');
      updateBtn.className = 'btn btn--primary';
      updateBtn.textContent = updateText;
      updateBtn.type = 'button';

      var cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn btn--outline';
      cancelBtn.textContent = cancelText;
      cancelBtn.type = 'button';

      modalActions.appendChild(updateBtn);
      modalActions.appendChild(cancelBtn);

      modal.appendChild(modalTitle);
      modal.appendChild(modalMessage);
      modal.appendChild(modalActions);
      overlay.appendChild(modal);

      document.body.appendChild(overlay);

      // Focus the update button for accessibility
      updateBtn.focus();

      // Handle "Sí, actualizar"
      updateBtn.addEventListener('click', function () {
        // Remove modal
        overlay.parentNode.removeChild(overlay);

        // Show loading state
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = (typeof I18n !== 'undefined') ? I18n.t('common.loading') : 'Cargando...';
        }

        API.updateRegistration(payload)
          .then(function (result) {
            if (result.success) {
              // Store login and companions in sessionStorage for the success screen
              try {
                sessionStorage.setItem('registration_login', payload.login);
                sessionStorage.setItem('registration_companions', String(payload.companionCount));
                sessionStorage.setItem('registration_imageAuth', payload.imageAuthorization || '');
              } catch (e) {
                // sessionStorage may be unavailable
              }

              // Navigate to success screen
              Router.navigate('#/success');

              // Reset the form store
              FormStore.reset();
            } else {
              showSubmitError(result.error || 'error.unexpected', submitBtn);
            }
          })
          .catch(function () {
            showSubmitError('error.network', submitBtn);
          });
      });

      // Handle "Cancelar"
      cancelBtn.addEventListener('click', function () {
        overlay.parentNode.removeChild(overlay);
      });

      // Close modal on overlay click (outside the modal box)
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          overlay.parentNode.removeChild(overlay);
        }
      });

      // Close modal on Escape key
      function handleEscape(e) {
        if (e.key === 'Escape') {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
          document.removeEventListener('keydown', handleEscape);
        }
      }
      document.addEventListener('keydown', handleEscape);
    }

    // Re-render current view on language change
    document.addEventListener('languageChanged', function () {
      if (typeof Router !== 'undefined') {
        var route = Router.getCurrentRoute();
        if (route === '#/' || route === '') {
          renderLanding();
        }
        // Other views will handle their own re-render via I18n.translatePage()
      }
    });

    console.log('Family Day 2026 - App initialized');
  });
})();
