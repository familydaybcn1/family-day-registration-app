/**
 * Family Day 2026 - Amazon BCN1
 * Landing Page Module
 *
 * Renders the landing page with:
 * - Countdown timer to event date (Sep 19, 2026 09:30 CET)
 * - Event details (date, time, location, Google Maps link)
 * - Activities grid (6 categories)
 * - QR code encoding registration URL
 * - Copy registration URL button with clipboard fallback
 * - Register button navigating to #/register
 */
'use strict';

var LandingPage = (function () {
  var countdownInterval = null;

  /**
   * Build the registration URL from the current origin and pathname.
   * Handles local file:// protocol gracefully.
   * @returns {string} Full registration URL with #/register hash
   */
  function getRegistrationURL() {
    var origin = window.location.origin;
    var pathname = window.location.pathname;
    // If file:// protocol, use the current file URL with hash
    if (!origin || origin === 'null' || origin === 'file://' || origin.indexOf('file:') === 0) {
      return window.location.href.split('#')[0] + '#/register';
    }
    return origin + pathname + '#/register';
  }

  /**
   * Render the landing page HTML into the given container.
   * Uses I18n.t(key) for all user-facing text.
   * @param {HTMLElement} container - The DOM element to render into
   */
  function init(container) {
    // Stop any existing countdown from a previous render
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }

    var html = '' +
      '<section class="landing" aria-label="' + I18n.t('landing.title') + '">' +
        '<!-- Hero Section -->' +
        '<div class="landing__hero">' +
          '<h1 class="landing__title">\uD83C\uDF89 ' + I18n.t('landing.title') + ' \uD83C\uDF89</h1>' +
          '<p class="landing__subtitle" data-i18n="landing.subtitle">' + I18n.t('landing.subtitle') + '</p>' +
        '</div>' +

        '<!-- Countdown -->' +
        '<div class="card mb-lg">' +
          '<h2 class="card__title text-center" data-i18n="landing.countdown.title">' + I18n.t('landing.countdown.title') + '</h2>' +
          '<div class="countdown" id="countdown" role="timer" aria-live="polite" aria-atomic="true">' +
            '<div class="countdown__unit">' +
              '<span class="countdown__value" id="countdown-days">--</span>' +
              '<span class="countdown__label" data-i18n="landing.countdown.days">' + I18n.t('landing.countdown.days') + '</span>' +
            '</div>' +
            '<div class="countdown__unit">' +
              '<span class="countdown__value" id="countdown-hours">--</span>' +
              '<span class="countdown__label" data-i18n="landing.countdown.hours">' + I18n.t('landing.countdown.hours') + '</span>' +
            '</div>' +
            '<div class="countdown__unit">' +
              '<span class="countdown__value" id="countdown-minutes">--</span>' +
              '<span class="countdown__label" data-i18n="landing.countdown.minutes">' + I18n.t('landing.countdown.minutes') + '</span>' +
            '</div>' +
            '<div class="countdown__unit">' +
              '<span class="countdown__value" id="countdown-seconds">--</span>' +
              '<span class="countdown__label" data-i18n="landing.countdown.seconds">' + I18n.t('landing.countdown.seconds') + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<!-- Event Details -->' +
        '<div class="card card--event mb-lg">' +
          '<div class="event-details">' +
            '<div class="event-details__icon">📅</div>' +
            '<div class="event-details__info">' +
              '<h3 class="event-details__date" data-i18n="landing.event.date">' + I18n.t('landing.event.date') + '</h3>' +
              '<p class="event-details__time">⏰ ' + I18n.t('landing.event.time') + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="event-details">' +
            '<div class="event-details__icon">📍</div>' +
            '<div class="event-details__info">' +
              '<p class="event-details__location" data-i18n="landing.event.location">' + I18n.t('landing.event.location') + '</p>' +
              '<a href="https://maps.google.com/?q=Amazon+BCN1+El+Prat+de+Llobregat" target="_blank" rel="noopener noreferrer" class="btn btn--outline mt-sm" style="display:inline-flex;gap:0.5rem;">' +
                '🗺️ <span data-i18n="landing.event.mapLink">' + I18n.t('landing.event.mapLink') + '</span>' +
              '</a>' +
            '</div>' +
          '</div>' +
          '<div class="event-details__peccy">' +
            '<img src="assets/Announce Peccy 2.png" alt="Peccy" class="peccy-img" onerror="this.style.display=\'none\'">' +
          '</div>' +
        '</div>' +

        '<!-- Activities Grid with Emojis -->' +
        '<div class="card mb-lg">' +
          '<h2 class="card__title text-center" data-i18n="landing.activities.title">' + I18n.t('landing.activities.title') + '</h2>' +
          '<div class="activities-grid">' +
            '<div class="activities-grid__item"><span class="activities-grid__emoji">\uD83D\uDC76</span><span data-i18n="landing.activities.babies">' + I18n.t('landing.activities.babies') + '</span></div>' +
            '<div class="activities-grid__item"><span class="activities-grid__emoji">\uD83C\uDFAD</span><span data-i18n="landing.activities.shows">' + I18n.t('landing.activities.shows') + '</span></div>' +
            '<div class="activities-grid__item"><span class="activities-grid__emoji">\uD83C\uDFC6</span><span data-i18n="landing.activities.contests">' + I18n.t('landing.activities.contests') + '</span></div>' +
            '<div class="activities-grid__item"><span class="activities-grid__emoji">\uD83E\uDD1D</span><span data-i18n="landing.activities.volunteering">' + I18n.t('landing.activities.volunteering') + '</span></div>' +
            '<div class="activities-grid__item"><span class="activities-grid__emoji">\uD83C\uDF55</span><span data-i18n="landing.activities.food">' + I18n.t('landing.activities.food') + '</span></div>' +
            '<div class="activities-grid__item"><span class="activities-grid__emoji">\uD83D\uDD27</span><span data-i18n="landing.activities.workshops">' + I18n.t('landing.activities.workshops') + '</span></div>' +
          '</div>' +
        '</div>' +

        '<!-- QR Code & Share -->' +
        '<div class="card mb-lg text-center">' +
          '<p class="mb-md" data-i18n="landing.shareQr">' + I18n.t('landing.shareQr') + '</p>' +
          '<div id="landing-qr" class="landing__qr"></div>' +
          '<div class="mt-md">' +
            '<button type="button" class="btn btn--outline" id="copy-url-btn">' +
              '<span data-i18n="landing.copyUrl">' + I18n.t('landing.copyUrl') + '</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        '<!-- Register Button -->' +
        '<div class="text-center mb-lg">' +
          '<button type="button" class="btn btn--primary btn--block" id="register-btn" data-i18n="landing.register">' +
            I18n.t('landing.register') +
          '</button>' +
        '</div>' +
      '</section>';

    container.innerHTML = html;

    // Generate QR code encoding registration URL
    generateQRCode();

    // Bind event listeners
    bindEvents();

    // Start countdown to Sep 19, 2026 09:30 CET (Europe/Madrid)
    var targetDate = new Date('2026-09-19T09:30:00+02:00');
    startCountdown(targetDate);
  }

  /**
   * Generate QR code in the #landing-qr container using qrcode.js.
   * For file:// protocol, shows a placeholder message instead of a broken URL.
   */
  function generateQRCode() {
    var qrContainer = document.getElementById('landing-qr');
    if (!qrContainer) return;

    var registrationURL = getRegistrationURL();

    // Clear any existing QR
    qrContainer.innerHTML = '';

    // Use QRCode library (loaded via CDN as global)
    if (typeof QRCode !== 'undefined') {
      // For file:// URLs, encode a placeholder identifier
      var origin = window.location.origin;
      var qrText = registrationURL;
      if (!origin || origin === 'null' || origin === 'file://' || origin.indexOf('file:') === 0) {
        qrText = 'FAMILYDAY2026-REGISTER';
      }

      new QRCode(qrContainer, {
        text: qrText,
        width: 180,
        height: 180,
        colorDark: '#232F3E',
        colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.M
      });

      // Add note for file:// protocol
      if (qrText === 'FAMILYDAY2026-REGISTER') {
        var note = document.createElement('p');
        note.style.fontSize = '0.75rem';
        note.style.color = '#565959';
        note.style.marginTop = '0.5rem';
        note.textContent = 'Deploy to see full QR URL';
        qrContainer.appendChild(note);
      }
    }
  }

  /**
   * Bind click event listeners for buttons.
   */
  function bindEvents() {
    var copyBtn = document.getElementById('copy-url-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', copyRegistrationURL);
    }

    var registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
      registerBtn.addEventListener('click', function () {
        if (typeof Router !== 'undefined') {
          Router.navigate('#/register');
        }
      });
    }
  }

  /**
   * Start a live countdown timer that updates every second.
   * Displays days, hours, minutes, seconds until the target date.
   * @param {Date} targetDate - The event target date/time
   */
  function startCountdown(targetDate) {
    // Clear any previous interval
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }

    function updateCountdown() {
      var now = new Date();
      var diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        // Event has started or passed
        setCountdownValues(0, 0, 0, 0);
        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
        return;
      }

      var totalSeconds = Math.floor(diff / 1000);
      var days = Math.floor(totalSeconds / 86400);
      var hours = Math.floor((totalSeconds % 86400) / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);
      var seconds = totalSeconds % 60;

      setCountdownValues(days, hours, minutes, seconds);
    }

    // Run immediately, then every second
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
  }

  /**
   * Update the countdown DOM elements with computed values.
   * @param {number} days
   * @param {number} hours
   * @param {number} minutes
   * @param {number} seconds
   */
  function setCountdownValues(days, hours, minutes, seconds) {
    var daysEl = document.getElementById('countdown-days');
    var hoursEl = document.getElementById('countdown-hours');
    var minutesEl = document.getElementById('countdown-minutes');
    var secondsEl = document.getElementById('countdown-seconds');

    if (daysEl) daysEl.textContent = String(days);
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  /**
   * Copy the registration URL to the clipboard.
   * Uses navigator.clipboard API with a fallback to execCommand for older browsers.
   */
  function copyRegistrationURL() {
    var url = getRegistrationURL();
    var copyBtn = document.getElementById('copy-url-btn');

    function showCopiedFeedback() {
      if (copyBtn) {
        var originalText = copyBtn.querySelector('[data-i18n]');
        if (originalText) {
          originalText.textContent = I18n.t('landing.urlCopied');
          setTimeout(function () {
            originalText.textContent = I18n.t('landing.copyUrl');
          }, 2000);
        }
      }
    }

    // Modern Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        showCopiedFeedback();
      }).catch(function () {
        // Fallback if clipboard API fails (e.g., non-secure context)
        fallbackCopy(url);
        showCopiedFeedback();
      });
    } else {
      // Fallback for older browsers
      fallbackCopy(url);
      showCopiedFeedback();
    }
  }

  /**
   * Fallback copy method using a temporary textarea and execCommand.
   * @param {string} text - The text to copy to clipboard
   */
  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      // Silent fail — user can manually copy
    }
    document.body.removeChild(textarea);
  }

  /**
   * Clean up the countdown interval when navigating away.
   */
  function destroy() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }

  // Public API
  return {
    init: init,
    startCountdown: startCountdown,
    copyRegistrationURL: copyRegistrationURL,
    destroy: destroy
  };
})();
