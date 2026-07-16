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
        width: 180,
        height: 180,
        colorDark: '#232F3E',
        colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.M
      });

      // After QR generates, convert canvas to img and remove canvas
      // This ensures html2canvas can capture it on mobile
      setTimeout(function() {
        var canvas = container.querySelector('canvas');
        var existingImg = container.querySelector('img');
        if (canvas && !existingImg) {
          var img = document.createElement('img');
          img.src = canvas.toDataURL('image/png');
          img.style.width = '180px';
          img.style.height = '180px';
          img.style.display = 'block';
          canvas.parentNode.removeChild(canvas);
          container.appendChild(img);
        }
      }, 100);
    } else {
      container.textContent = payload;
    }

    return container;
  }

  /**
   * Download the ticket element as a PNG image using html2canvas.
   *
   * @param {HTMLElement} ticketElement - The .ticket element to capture
   * @param {string} filename - Desired filename for the download
   */
  /**
   * Download ticket as PNG by drawing it directly on a canvas.
   * This approach works reliably on all devices including mobile.
   */
  function downloadTicketAsImage(ticketElement, filename) {
    // Get the QR image data
    var qrImg = ticketElement.querySelector('.qr-code-container img');
    if (!qrImg) {
      qrImg = ticketElement.querySelector('.qr-code-container canvas');
    }

    // Get ticket data from the ticket element
    var loginEl = ticketElement.querySelector('.ticket__info');
    var login = '';
    var companions = '0';
    if (loginEl) {
      var texts = loginEl.querySelectorAll('p');
      texts.forEach(function(p) {
        if (p.textContent.indexOf('Login:') !== -1) login = p.textContent.split('Login:')[1].trim();
        if (p.textContent.indexOf('Acompa') !== -1) login = login; // keep login
      });
    }

    // Read from sessionStorage as fallback
    try {
      if (!login) login = sessionStorage.getItem('registration_login') || 'user';
      companions = sessionStorage.getItem('registration_companions') || '0';
    } catch(e) {}

    // Create canvas and draw ticket manually
    var canvas = document.createElement('canvas');
    var w = 500;
    var h = 700;
    canvas.width = w * 2;
    canvas.height = h * 2;
    var ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    // Left border (green/red based on auth)
    var imageAuth = '';
    try { imageAuth = sessionStorage.getItem('registration_imageAuth') || ''; } catch(e) {}
    var borderColor = (imageAuth === 'authorize') ? '#1B8B00' : '#D32F2F';
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, 10, h);
    ctx.fillRect(w - 10, 0, 10, h);

    // Header background
    ctx.fillStyle = '#232F3E';
    ctx.fillRect(10, 0, w - 20, 100);

    // Header text
    ctx.fillStyle = '#FF9900';
    ctx.font = 'bold 22px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 FAMILY DAY 2026 🎉', w/2, 45);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px -apple-system, sans-serif';
    ctx.fillText('Amazon BCN1 — 19 sept 2026', w/2, 75);

    // Banner
    ctx.fillStyle = '#E8F5E9';
    ctx.fillRect(10, 100, w - 20, 40);
    ctx.fillStyle = '#232F3E';
    ctx.font = 'bold 14px -apple-system, sans-serif';
    ctx.fillText('🎊 ¡Vamos a disfrutar en familia! 🎊', w/2, 125);

    // Info section
    ctx.textAlign = 'left';
    ctx.fillStyle = '#333333';
    ctx.font = '15px -apple-system, sans-serif';
    var y = 175;
    ctx.fillText('👤 Login: ' + login, 30, y); y += 28;
    ctx.fillText('👥 Acompañantes: ' + companions, 30, y); y += 28;
    ctx.fillText('📅 Fecha: 19 sept 2026', 30, y); y += 28;
    ctx.fillText('⏰ Horario: 09:30hs – 14:00hs', 30, y); y += 28;
    ctx.fillText('📍 Lugar: Amazon BCN1, Av de les Garrigues 2-12', 30, y);

    // QR section — draw the QR image onto canvas
    var qrY = 320;
    ctx.textAlign = 'center';

    if (qrImg && qrImg.src) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function() {
        ctx.drawImage(img, (w - 160) / 2, qrY, 160, 160);

        // Text under QR
        ctx.fillStyle = '#565959';
        ctx.font = '11px -apple-system, sans-serif';
        ctx.fillText('Muestra este QR en la entrada', w/2, qrY + 175);

        // Footer
        ctx.fillStyle = '#FFF8E1';
        ctx.fillRect(10, h - 80, w - 20, 50);
        ctx.fillStyle = '#232F3E';
        ctx.font = 'bold 13px -apple-system, sans-serif';
        ctx.fillText('¡Os esperamos con toda la familia! 🎊 — Amazon BCN1', w/2, h - 50);

        // Badge reminder
        ctx.fillStyle = '#232F3E';
        ctx.fillRect(10, h - 30, w - 20, 30);
        ctx.fillStyle = '#FF9900';
        ctx.font = '10px -apple-system, sans-serif';
        ctx.fillText('⚠️ Recuerda llevar tu badge de Amazon para acceder al evento', w/2, h - 12);

        // Download
        triggerDownload(canvas, filename);
      };
      img.onerror = function() {
        // If image fails, still download without QR
        ctx.fillStyle = '#232F3E';
        ctx.font = 'bold 14px -apple-system, sans-serif';
        ctx.fillText('FAMILYDAY2026|' + login + '|' + companions, w/2, qrY + 80);

        ctx.fillStyle = '#FFF8E1';
        ctx.fillRect(10, h - 80, w - 20, 50);
        ctx.fillStyle = '#232F3E';
        ctx.font = 'bold 13px -apple-system, sans-serif';
        ctx.fillText('¡Os esperamos con toda la familia! 🎊 — Amazon BCN1', w/2, h - 50);

        triggerDownload(canvas, filename);
      };
      img.src = qrImg.src || qrImg.toDataURL('image/png');
    } else {
      // No QR available — show text code
      ctx.fillStyle = '#232F3E';
      ctx.font = 'bold 14px -apple-system, sans-serif';
      ctx.fillText('Código: FAMILYDAY2026|' + login + '|' + companions, w/2, qrY + 80);

      ctx.fillStyle = '#FFF8E1';
      ctx.fillRect(10, h - 80, w - 20, 50);
      ctx.fillStyle = '#232F3E';
      ctx.font = 'bold 13px -apple-system, sans-serif';
      ctx.fillText('¡Os esperamos con toda la familia! 🎊 — Amazon BCN1', w/2, h - 50);

      triggerDownload(canvas, filename);
    }
  }

  /**
   * Trigger the download of a canvas as PNG.
   */
  function triggerDownload(canvas, filename) {
    var dataURL = canvas.toDataURL('image/png');
    var link = document.createElement('a');
    link.href = dataURL;
    link.download = filename || 'family-day-2026-ticket.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    } catch (e) {}

    // Color code: green = authorized, red = not authorized
    var borderColor = (imageAuth === 'authorize') ? '#1B8B00' : '#D32F2F';
    var accentBg = (imageAuth === 'authorize') ? '#E8F5E9' : '#FFEBEE';

    // Build the ticket
    var ticketWrapper = document.createElement('div');
    ticketWrapper.style.padding = '1rem 0';

    var ticket = document.createElement('div');
    ticket.className = 'ticket';
    ticket.style.borderLeft = '10px solid ' + borderColor;
    ticket.style.borderRight = '10px solid ' + borderColor;

    // --- Header with branding ---
    var header = document.createElement('div');
    header.className = 'ticket__header';
    header.style.cssText = 'background-color:#232F3E;padding:2rem 1.5rem;text-align:center;';
    header.innerHTML = '' +
      '<p style="font-size:0.8rem;color:#FF9900;letter-spacing:3px;text-transform:uppercase;margin-bottom:0.5rem;">AMAZON BCN1 PRESENTA</p>' +
      '<h2 style="font-size:1.8rem;font-weight:900;color:#FFFFFF;margin-bottom:0.25rem;">🎉 FAMILY DAY 2026 🎉</h2>' +
      '<p style="font-size:1rem;color:rgba(255,255,255,0.8);">19 de septiembre • El Prat de Llobregat</p>';
    ticket.appendChild(header);

    // --- Motivational banner ---
    var banner = document.createElement('div');
    banner.style.cssText = 'background-color:' + accentBg + ';padding:0.75rem;text-align:center;font-weight:700;font-size:1rem;color:#232F3E;';
    banner.textContent = '🎊 ¡Vamos a disfrutar en familia! 🎊';
    ticket.appendChild(banner);

    // --- Body with info + QR ---
    var body = document.createElement('div');
    body.className = 'ticket__body';
    body.style.cssText = 'padding:1.5rem;display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;justify-content:center;';

    // Info section
    var info = document.createElement('div');
    info.className = 'ticket__info';
    info.style.cssText = 'flex:1;min-width:200px;';

    // Peccy
    info.innerHTML = '' +
      '<img src="assets/peccy.png" style="width:70px;height:auto;margin-bottom:0.75rem;" alt="Peccy">' +
      '<p style="margin-bottom:0.5rem;font-size:0.95rem;"><strong>👤 Login:</strong> ' + login + '</p>' +
      '<p style="margin-bottom:0.5rem;font-size:0.95rem;"><strong>👥 Acompañantes:</strong> ' + companions + '</p>' +
      '<p style="margin-bottom:0.5rem;font-size:0.95rem;"><strong>📅 Fecha:</strong> 19 sept 2026</p>' +
      '<p style="margin-bottom:0.5rem;font-size:0.95rem;"><strong>⏰ Horario:</strong> 09:30 – 14:00</p>' +
      '<p style="margin-bottom:0.5rem;font-size:0.95rem;"><strong>📍 Lugar:</strong> Amazon BCN1</p>';

    body.appendChild(info);

    // QR section
    var qrSection = document.createElement('div');
    qrSection.className = 'ticket__qr';
    qrSection.style.textAlign = 'center';
    var qrElement = generate(login, companions);
    qrSection.appendChild(qrElement);
    var qrLabel = document.createElement('p');
    qrLabel.style.cssText = 'font-size:0.7rem;color:#565959;margin-top:0.5rem;';
    qrLabel.textContent = 'Muestra este QR en la entrada';
    qrSection.appendChild(qrLabel);
    body.appendChild(qrSection);

    ticket.appendChild(body);

    // --- Activities teaser ---
    var activities = document.createElement('div');
    activities.style.cssText = 'padding:0.75rem 1.5rem;text-align:center;background-color:#F8F9FA;border-top:1px solid #E0E0E0;';
    activities.innerHTML = '<p style="font-size:0.85rem;color:#565959;">👶 Zona bebés • 🎭 Espectáculos • 🏆 Concursos • 🍕 Gastronomía • 🔧 Talleres • 🤝 Voluntariado</p>';
    ticket.appendChild(activities);

    // --- Footer ---
    var footer = document.createElement('div');
    footer.className = 'ticket__footer';
    footer.style.cssText = 'background-color:#FFF8E1;padding:1rem;text-align:center;font-weight:700;color:#232F3E;font-size:0.95rem;';
    footer.textContent = '¡Os esperamos con toda la familia! 🎊 — Amazon BCN1';
    ticket.appendChild(footer);

    // --- Badge reminder ---
    var reminder = document.createElement('div');
    reminder.style.cssText = 'padding:0.5rem 1rem;text-align:center;background-color:#232F3E;color:#FF9900;font-size:0.75rem;border-radius:0 0 16px 16px;';
    reminder.textContent = '⚠️ Recuerda llevar tu badge de Amazon para acceder al evento';
    ticket.appendChild(reminder);

    ticketWrapper.appendChild(ticket);
    container.appendChild(ticketWrapper);

    // --- Download button ---
    var downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn btn--primary btn--block ticket-download-btn';
    var downloadText = (typeof I18n !== 'undefined') ? I18n.t('success.download') : '📥 Descargar entrada';
    downloadBtn.textContent = downloadText;
    downloadBtn.setAttribute('aria-label', downloadText);
    downloadBtn.addEventListener('click', function () {
      // Small delay to ensure QR canvas is fully rendered
      setTimeout(function() {
        downloadTicketAsImage(ticket, 'family-day-2026-' + login + '.png');
      }, 500);
    });
    container.appendChild(downloadBtn);

    // --- Screenshot tip ---
    var tip = document.createElement('p');
    tip.style.cssText = 'text-align:center;font-size:0.8rem;color:#565959;margin-top:0.75rem;margin-bottom:1rem;';
    tip.textContent = '📱 Tip: también puedes hacer captura de pantalla para guardar tu entrada';
    container.appendChild(tip);

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
