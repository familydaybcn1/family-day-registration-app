/**
 * Family Day 2026 - Amazon BCN1 Registration App
 * QR Code Generator & Success Screen Module
 *
 * Generates QR codes encoding registration identifiers and renders
 * the success/confirmation screen with download capability.
 *
 * QR Payload format: "FAMILYDAY2026|{login}|{companions}"
 * Uses qrcode.js CDN global (QRCode) for QR generation.
 */
'use strict';

var QRGenerator = (function () {
  /**
   * Generate a QR code into a container element.
   * Encodes payload in format: "FAMILYDAY2026|{login}|{companions}"
   *
   * @param {string} login - The employee login/username
   * @param {number} companions - Number of companions (0-3)
   * @returns {HTMLElement} Container div with the generated QR code
   */
  function generate(login, companions) {
    var payload = 'FAMILYDAY2026|' + login + '|' + companions;
    var container = document.createElement('div');
    container.className = 'qr-code-container';
    container.style.display = 'inline-block';

    if (typeof QRCode !== 'undefined') {
      new QRCode(container, {
        text: payload,
        width: 200,
        height: 200,
        colorDark: '#232F3E',
        colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.M
      });
    } else {
      // Fallback if QRCode library not loaded
      container.textContent = payload;
      console.warn('[QRGenerator] QRCode library not available');
    }

    return container;
  }

  /**
   * Download the QR code as a PNG image.
   * Finds the canvas inside the element and triggers a download.
   *
   * @param {HTMLElement} element - Container element holding the QR canvas
   * @param {string} filename - Desired filename for the download (e.g., "ticket-margarl.png")
   */
  function downloadAsImage(element, filename) {
    var canvas = element.querySelector('canvas');
    if (!canvas) {
      console.warn('[QRGenerator] No canvas found for download');
      return;
    }

    var dataURL = canvas.toDataURL('image/png');
    var link = document.createElement('a');
    link.href = dataURL;
    link.download = filename || 'family-day-2026-ticket.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Render the full success screen into a container.
   * Displays QR code, registration details, download button, and warning.
   *
   * @param {HTMLElement} container - The main content container
   * @param {string} login - The employee login
   * @param {number} companions - Number of companions
   */
  function renderSuccessScreen(container, login, companions) {
    container.innerHTML = '';

    // Success card wrapper
    var card = document.createElement('div');
    card.className = 'card text-center';

    // Title
    var title = document.createElement('h1');
    title.className = 'card__title';
    title.style.fontSize = 'var(--font-size-xl)';
    title.style.color = 'var(--success)';
    title.textContent = I18n.t('success.title');
    title.setAttribute('data-i18n', 'success.title');
    card.appendChild(title);

    // Subtitle
    var subtitle = document.createElement('p');
    subtitle.className = 'mt-sm mb-lg';
    subtitle.style.color = 'var(--text-secondary)';
    subtitle.textContent = I18n.t('success.subtitle');
    subtitle.setAttribute('data-i18n', 'success.subtitle');
    card.appendChild(subtitle);

    // QR Code container (centered)
    var qrWrapper = document.createElement('div');
    qrWrapper.className = 'mb-lg';
    qrWrapper.style.display = 'flex';
    qrWrapper.style.justifyContent = 'center';
    var qrElement = generate(login, companions);
    qrWrapper.appendChild(qrElement);
    card.appendChild(qrWrapper);

    // Login label + value
    var loginInfo = document.createElement('p');
    loginInfo.className = 'mt-md';
    var loginLabel = document.createElement('strong');
    loginLabel.textContent = I18n.t('success.loginLabel') + ': ';
    loginLabel.setAttribute('data-i18n', 'success.loginLabel');
    loginInfo.appendChild(loginLabel);
    var loginValue = document.createElement('span');
    loginValue.textContent = login;
    loginInfo.appendChild(loginValue);
    card.appendChild(loginInfo);

    // Companions label + value
    var companionsInfo = document.createElement('p');
    companionsInfo.className = 'mt-sm mb-lg';
    var companionsLabel = document.createElement('strong');
    companionsLabel.textContent = I18n.t('success.companionsLabel') + ': ';
    companionsLabel.setAttribute('data-i18n', 'success.companionsLabel');
    companionsInfo.appendChild(companionsLabel);
    var companionsValue = document.createElement('span');
    companionsValue.textContent = String(companions);
    companionsInfo.appendChild(companionsValue);
    card.appendChild(companionsInfo);

    // Download button
    var downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn btn--primary';
    downloadBtn.textContent = I18n.t('success.download');
    downloadBtn.setAttribute('data-i18n', 'success.download');
    downloadBtn.setAttribute('aria-label', I18n.t('success.download'));
    downloadBtn.addEventListener('click', function () {
      downloadAsImage(qrElement, 'family-day-2026-' + login + '.png');
    });
    card.appendChild(downloadBtn);

    // Warning box
    var warning = document.createElement('div');
    warning.className = 'alert alert--warning mt-lg';
    warning.textContent = I18n.t('success.warning');
    warning.setAttribute('data-i18n', 'success.warning');
    card.appendChild(warning);

    // Back to landing button
    var backBtn = document.createElement('a');
    backBtn.href = '#/';
    backBtn.className = 'btn btn--outline btn--block mt-lg';
    backBtn.textContent = I18n.t('success.backHome');
    backBtn.setAttribute('data-i18n', 'success.backHome');
    backBtn.setAttribute('aria-label', I18n.t('success.backHome'));
    backBtn.style.textDecoration = 'none';
    card.appendChild(backBtn);

    container.appendChild(card);
  }

  // Public API
  return {
    generate: generate,
    downloadAsImage: downloadAsImage,
    renderSuccessScreen: renderSuccessScreen
  };
})();
