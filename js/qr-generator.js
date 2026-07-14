/**
 * Family Day 2026 - Amazon BCN1 Registration App
 * QR Code Generator & Success Screen Module
 *
 * Generates QR codes encoding registration identifiers and renders
 * the success/confirmation screen as a premium event ticket with download capability.
 *
 * QR Payload format: "FAMILYDAY2026|{login}|{companions}"
 * Uses qrcode.js CDN global (QRCode) for QR generation.
 * Uses html2canvas CDN for ticket PNG download.
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
   * Download the ticket element as a PNG image using html2canvas.
   *
   * @param {HTMLElement} ticketElement - The .ticket element to capture
   * @param {string} filename - Desired filename for the download
   */
  function downloadTicketAsImage(ticketElement, filename) {
    if (typeof html2canvas === 'undefined') {
      console.warn('[QRGenerator] html2canvas library not available');
      // Fallback: try canvas-based QR download
      var canvas = ticketElement.querySelector('canvas');
      if (canvas) {
        var dataURL = canvas.toDataURL('image/png');
        var link = document.createElement('a');
        link.href = dataURL;
        link.download = filename || 'family-day-2026-ticket.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      return;
    }

    html2canvas(ticketElement, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false,
      allowTaint: true,
      width: ticketElement.offsetWidth,
      height: ticketElement.offsetHeight
    }).then(function (canvas) {
      var dataURL = canvas.toDataURL('image/png');
      var link = document.createElement('a');
      link.href = dataURL;
      link.download = filename || 'family-day-2026-ticket.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }).catch(function (err) {
      console.error('[QRGenerator] html2canvas error:', err);
    });
  }

  /**
   * Render the full success screen as a premium event ticket.
   * Displays a styled ticket card with QR code, registration details,
   * and a colored left border indicating image authorization status.
   *
   * @param {HTMLElement} container - The main content container
   * @param {string} login - The employee login
   * @param {number} companions - Number of companions
   */
  function renderSuccessScreen(container, login, companions) {
    container.innerHTML = '';

    // Read image authorization from sessionStorage
    var imageAuth = '';
    try {
      imageAuth = sessionStorage.getItem('registration_imageAuth') || '';
    } catch (e) {
      // sessionStorage may be unavailable
    }

    // Determine left border color based on authorization
    var borderColor = (imageAuth === 'authorize') ? '#1B8B00' : '#D32F2F';

    // Build the ticket HTML
    var ticketWrapper = document.createElement('div');
    ticketWrapper.style.padding = '1rem 0';

    var ticket = document.createElement('div');
    ticket.className = 'ticket';
    ticket.style.borderLeft = '8px solid ' + borderColor;

    // --- Header ---
    var header = document.createElement('div');
    header.className = 'ticket__header';
    header.style.backgroundColor = '#232F3E';
    var headerTitle = document.createElement('h2');
    headerTitle.textContent = '🎉 FAMILY DAY 2026';
    headerTitle.style.color = '#FF9900';
    headerTitle.style.fontSize = '1.6rem';
    headerTitle.style.fontWeight = '800';
    var headerSubtitle = document.createElement('p');
    headerSubtitle.textContent = 'Amazon BCN1';
    header.appendChild(headerTitle);
    header.appendChild(headerSubtitle);
    ticket.appendChild(header);

    // --- Body ---
    var body = document.createElement('div');
    body.className = 'ticket__body';

    // Info section
    var info = document.createElement('div');
    info.className = 'ticket__info';

    // Peccy image
    var peccy = document.createElement('img');
    peccy.src = 'assets/peccy.png';
    peccy.className = 'ticket__peccy';
    peccy.alt = 'Peccy mascot';
    info.appendChild(peccy);

    // Login
    var loginP = document.createElement('p');
    loginP.innerHTML = '<strong>Login:</strong> ' + login;
    info.appendChild(loginP);

    // Companions
    var companionsLabel = (typeof I18n !== 'undefined') ? I18n.t('success.companionsLabel') : 'Acompañantes';
    var companionsP = document.createElement('p');
    companionsP.innerHTML = '<strong>' + companionsLabel + ':</strong> ' + String(companions);
    info.appendChild(companionsP);

    // Date & time
    var dateP = document.createElement('p');
    dateP.textContent = '📅 19 sept 2026 • ⏰ 09:30 – 14:00';
    info.appendChild(dateP);

    // Location
    var locationP = document.createElement('p');
    locationP.textContent = '📍 Amazon BCN1, El Prat de Llobregat';
    info.appendChild(locationP);

    body.appendChild(info);

    // QR section
    var qrSection = document.createElement('div');
    qrSection.className = 'ticket__qr';
    var qrElement = generate(login, companions);
    qrSection.appendChild(qrElement);
    body.appendChild(qrSection);

    ticket.appendChild(body);

    // --- Footer ---
    var footer = document.createElement('div');
    footer.className = 'ticket__footer';
    var footerMsg = (typeof I18n !== 'undefined') ? I18n.t('success.ticketFooter') : '¡Os esperamos con toda la familia! 🎊';
    footer.textContent = footerMsg;
    ticket.appendChild(footer);

    ticketWrapper.appendChild(ticket);
    container.appendChild(ticketWrapper);

    // --- Download button ---
    var downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn btn--primary btn--block ticket-download-btn';
    var downloadText = (typeof I18n !== 'undefined') ? I18n.t('success.download') : '📥 Descargar entrada';
    downloadBtn.textContent = downloadText;
    downloadBtn.setAttribute('aria-label', downloadText);
    downloadBtn.addEventListener('click', function () {
      downloadTicketAsImage(ticket, 'family-day-2026-' + login + '.png');
    });
    container.appendChild(downloadBtn);

    // --- Back to home button ---
    var backBtn = document.createElement('a');
    backBtn.href = '#/';
    backBtn.className = 'btn btn--outline btn--block ticket-back-btn';
    var backText = (typeof I18n !== 'undefined') ? I18n.t('success.backHome') : 'Volver al inicio';
    backBtn.textContent = backText;
    backBtn.setAttribute('aria-label', backText);
    container.appendChild(backBtn);
  }

  // Public API
  return {
    generate: generate,
    downloadTicketAsImage: downloadTicketAsImage,
    renderSuccessScreen: renderSuccessScreen
  };
})();
