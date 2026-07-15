/**
 * Family Day 2026 - Amazon BCN1
 * Internationalization (i18n) Module
 *
 * Manages bilingual text rendering (ES/EN) with Spanish as default.
 * Stores language preference in sessionStorage.
 * Provides I18n.t(key) for translation lookups using dot notation.
 */
'use strict';

var I18n = (function () {
  // Embedded translations (loaded inline for static hosting without build step)
  var translations = {
    es: {
      "app.title": "Family Day 2026",
      "app.subtitle": "Amazon BCN1",

      "landing.title": "Family Day 2026",
      "landing.subtitle": "Amazon BCN1 — El Prat de Llobregat, Barcelona",
      "landing.countdown.title": "Cuenta atrás",
      "landing.countdown.days": "días",
      "landing.countdown.hours": "horas",
      "landing.countdown.minutes": "minutos",
      "landing.countdown.seconds": "segundos",
      "landing.event.date": "19 de septiembre de 2026",
      "landing.event.time": "09:30hs \u2013 14:00hs",
      "landing.event.location": "Amazon BCN1, El Prat de Llobregat, Barcelona \u2014 Av de les Garrigues 2-12",
      "landing.event.mapLink": "Ver en Google Maps",
      "landing.activities.title": "Actividades",
      "landing.activities.babies": "Zona de beb\u00E9s",
      "landing.activities.shows": "Espectáculos",
      "landing.activities.contests": "Concursos",
      "landing.activities.volunteering": "Voluntariado",
      "landing.activities.food": "Gastronomía",
      "landing.activities.workshops": "Actividades",
      "landing.register": "Registrarse",
      "landing.copyUrl": "Copiar enlace de registro",
      "landing.urlCopied": "¡Enlace copiado!",
      "landing.shareQr": "Escanea el QR para registrarte",

      "form.step1.title": "Datos Personales",
      "form.step1.fullName": "Nombre y Apellidos",
      "form.step1.fullName.placeholder": "Ej: María García López",
      "form.step1.login": "Login / Usuario corporativo",
      "form.step1.login.placeholder": "Ej: margarl",
      "form.step1.email": "Email",
      "form.step1.email.placeholder": "Ej: margarl@amazon.com",
      "form.step1.dni": "DNI / NIE",
      "form.step1.dni.placeholder": "Ej: 12345678A",
      "form.step1.department": "Departamento",
      "form.step1.department.placeholder": "Selecciona un departamento",

      "form.step2.title": "Acompañantes",
      "form.step2.companionCount": "Número de acompañantes",
      "form.step2.companionCount.placeholder": "Selecciona",
      "form.step2.minorCount": "¿Cuántos son menores de edad?",
      "form.step2.minorCount.placeholder": "Selecciona",
      "form.step2.companion0": "0 \u2014 Asistiré sin acompa\u00F1antes",
      "form.step2.companion1": "1 acompañante",
      "form.step2.companion2": "2 acompañantes",
      "form.step2.companion3": "3 acompañantes",

      "form.step3.title": "Requisitos Alimentarios",
      "form.step3.question": "¿Tú o alguno de tus acompañantes tenéis intolerancias alimentarias o necesitáis un menú especial?",
      "form.step3.yes": "Sí",
      "form.step3.no": "No",
      "form.step3.celiac": "Celiaquía (sin gluten)",
      "form.step3.lactose": "Intolerancia a la lactosa",
      "form.step3.nuts": "Alergia a frutos secos",
      "form.step3.vegetarian": "Vegetariano/a",
      "form.step3.vegan": "Vegano/a",
      "form.step3.details": "Otros / Detalles (indica a quién aplica cada intolerancia)",
      "form.step3.details.placeholder": "Ej: Ni\u00F1o/a 2 - cel\u00EDaco/a. Yo - vegetariana.",

      "form.step4.title": "Autorización de Imagen",
      "form.step4.legalHeader": "Autorización de uso de imagen — Ley Orgánica 1/1982, de 5 de mayo, de protección civil del derecho al honor, a la intimidad personal y familiar y a la propia imagen, y Reglamento (UE) 2016/679 (GDPR)",
      "form.step4.legalText": "Autorizo a Amazon Spain Fulfillment, S.L.U. a captar, reproducir y difundir mi imagen y la de mis acompañantes menores durante el evento Family Day 2026 celebrado el 19 de septiembre de 2026 en las instalaciones de Amazon BCN1. Las imágenes podrán ser utilizadas en comunicaciones internas, redes sociales corporativas y materiales promocionales del evento. Esta autorización se otorga con carácter gratuito y por tiempo indefinido, pudiendo ser revocada en cualquier momento mediante comunicación escrita.",
      "form.step4.authorize": "Autorizo",
      "form.step4.deny": "No autorizo",
      "form.step4.signature": "Firma de la persona registrante",
      "form.step4.clearSignature": "Limpiar firma",

      "form.step5.title": "Resumen de Registro",
      "form.step5.edit": "Editar",
      "form.step5.submit": "✓ Guardar cambios",
      "form.step5.personalData": "Datos personales",
      "form.step5.companions": "Acompañantes",
      "form.step5.dietary": "Alimentación",
      "form.step5.imageRights": "Autorización de imagen",
      "form.step5.minors": "menores",
      "form.step5.noCompanions": "Sin acompañantes",
      "form.step5.noDietaryNeeds": "Sin necesidades especiales",
      "form.step5.authorized": "Autorizada",
      "form.step5.denied": "No autorizada",
      "form.step5.signed": "Firmado",

      "success.title": "¡Registro completado con éxito!",
      "success.subtitle": "Tu entrada para el Family Day 2026",
      "success.loginLabel": "Login",
      "success.companionsLabel": "Acompañantes",
      "success.download": "Descargar entrada",
      "success.warning": "IMPORTANTE - Acceso al evento: Es obligatorio llevar el badge identificativo de Amazon para acceder al evento. Tus familiares/acompa\u00F1antes deber\u00E1n venir con la persona que se registr\u00F3.",
      "success.backHome": "← Volver al inicio",
      "success.ticketFooter": "¡Os esperamos con toda la familia! 🎊 — Amazon BCN1",

      "admin.title": "Panel de Administración",
      "admin.subtitle": "Family Day 2026 — Registros",
      "admin.totalHeadcount": "Aforo total",
      "admin.registrations": "Registros",
      "admin.companions": "Acompañantes",
      "admin.checkedIn": "Check-in realizado",
      "admin.notCheckedIn": "Pendiente de check-in",
      "admin.filters.title": "Filtros",
      "admin.filters.department": "Departamento",
      "admin.filters.dateFrom": "Desde",
      "admin.filters.dateTo": "Hasta",
      "admin.filters.dietary": "Intolerancias alimentarias",
      "admin.filters.imageAuth": "Autorización de imagen",
      "admin.filters.checkedIn": "Estado check-in",
      "admin.filters.all": "Todos",
      "admin.filters.yes": "Sí",
      "admin.filters.no": "No",
      "admin.filters.authorized": "Autorizada",
      "admin.filters.denied": "No autorizada",
      "admin.filters.apply": "Aplicar filtros",
      "admin.filters.clear": "Limpiar filtros",
      "admin.export": "Exportar CSV",
      "admin.scanner.title": "Escáner QR",
      "admin.scanner.start": "Iniciar escáner",
      "admin.scanner.stop": "Detener escáner",
      "admin.scanner.manual": "Entrada manual",
      "admin.scanner.manualPlaceholder": "Introduce el login",
      "admin.scanner.checkIn": "Registrar entrada",
      "admin.scanner.success": "✓ Check-in realizado",
      "admin.scanner.alreadyCheckedIn": "Ya tiene check-in realizado",
      "admin.scanner.notFound": "Registro no encontrado",
      "admin.scanner.invalidQr": "QR no válido",
      "admin.scanner.cameraError": "No se puede acceder a la cámara. Permite el acceso o utiliza la entrada manual.",

      "common.next": "Siguiente",
      "common.previous": "Anterior",
      "common.loading": "Cargando...",
      "common.error": "Ha ocurrido un error",
      "common.retry": "Reintentar",
      "common.close": "Cerrar",
      "common.cancel": "Cancelar",
      "common.save": "Guardar",
      "common.step": "Paso",
      "common.of": "de",

      "validation.required": "Este campo es obligatorio",
      "validation.email": "Introduce un email válido",
      "validation.dni": "Introduce un DNI/NIE válido",
      "validation.signature": "Es necesario firmar antes de continuar",
      "validation.authorization": "Debes seleccionar una opción de autorización",
      "validation.dietary": "Indica si hay necesidades alimentarias especiales",
      "validation.companion": "Selecciona el número de acompañantes",

      "error.network": "Error de conexión. Inténtalo de nuevo.",
      "error.server": "Error del servidor. Inténtalo de nuevo.",
      "error.unexpected": "Respuesta inesperada. Inténtalo de nuevo.",

      "lang.toggle": "EN",
      "lang.current": "ES",

      "partners.title": "\uD83E\uDD1D Colaboran",
      "partners.subtitle": "Fundaciones con las que trabajaremos en actividades de voluntariado",
      "partners.bonaVoluntat.name": "Bona Voluntat en Acci\u00F3",
      "partners.bonaVoluntat.desc": "Promueve el voluntariado y la educaci\u00F3n no formal, ofreciendo oportunidades para desarrollar capacidades a trav\u00E9s de proyectos sociales y comunitarios.",
      "partners.roure.name": "Fundaci\u00F3 Roure",
      "partners.roure.desc": "M\u00E1s de 30 a\u00F1os trabajando en el barrio de Sant Pere, Santa Caterina i la Ribera (Barcelona). Apoyan a personas mayores, familias y personas en situaci\u00F3n de vulnerabilidad. Medalla de Honor de Barcelona 2024.",
      "partners.acathi.name": "ACATHI",
      "partners.acathi.desc": "Asociaci\u00F3n por la inclusi\u00F3n de personas LGTBI+ migrantes y refugiadas en Catalunya. Ofrecen acompa\u00F1amiento, formaci\u00F3n y un espacio seguro para la diversidad.",
      "partners.patasArriba.name": "Patas Para Arriba",
      "partners.patasArriba.desc": "Fundaci\u00F3n por un v\u00EDnculo sano entre personas y animales. Trabajan en educaci\u00F3n en escuelas, investigaci\u00F3n y apoyo a la adopci\u00F3n responsable en Catalunya.",
      "partners.glamazon.name": "Glamazon",
      "partners.glamazon.desc": "Grupo de personas empleadas de Amazon para la comunidad LGBTQIA+ y aliades. Creamos un espacio de apoyo centrado en la diversidad de identidades de g\u00E9nero, orientaciones sexuales y expresiones.",

      "registration.duplicate.title": "\u26A0\uFE0F Ya existe un registro",
      "registration.duplicate.message": "Ya existe un registro con este login. ¿Quieres actualizar tu información?",
      "registration.duplicate.update": "Sí, actualizar",
      "registration.duplicate.cancel": "Cancelar"
    },
    en: {
      "app.title": "Family Day 2026",
      "app.subtitle": "Amazon BCN1",

      "landing.title": "Family Day 2026",
      "landing.subtitle": "Amazon BCN1 — El Prat de Llobregat, Barcelona",
      "landing.countdown.title": "Countdown",
      "landing.countdown.days": "days",
      "landing.countdown.hours": "hours",
      "landing.countdown.minutes": "minutes",
      "landing.countdown.seconds": "seconds",
      "landing.event.date": "September 19, 2026",
      "landing.event.time": "09:30hs \u2013 14:00hs",
      "landing.event.location": "Amazon BCN1, El Prat de Llobregat, Barcelona \u2014 Av de les Garrigues 2-12",
      "landing.event.mapLink": "View on Google Maps",
      "landing.activities.title": "Activities",
      "landing.activities.babies": "Baby zone",
      "landing.activities.shows": "Shows",
      "landing.activities.contests": "Contests",
      "landing.activities.volunteering": "Volunteering",
      "landing.activities.food": "Food & Drinks",
      "landing.activities.workshops": "Activities",
      "landing.register": "Register",
      "landing.copyUrl": "Copy registration link",
      "landing.urlCopied": "Link copied!",
      "landing.shareQr": "Scan the QR to register",

      "form.step1.title": "Personal Data",
      "form.step1.fullName": "Full Name",
      "form.step1.fullName.placeholder": "E.g.: María García López",
      "form.step1.login": "Login / Corporate username",
      "form.step1.login.placeholder": "E.g.: margarl",
      "form.step1.email": "Email",
      "form.step1.email.placeholder": "E.g.: margarl@amazon.com",
      "form.step1.dni": "DNI / NIE",
      "form.step1.dni.placeholder": "E.g.: 12345678A",
      "form.step1.department": "Department",
      "form.step1.department.placeholder": "Select a department",

      "form.step2.title": "Companions",
      "form.step2.companionCount": "Number of companions",
      "form.step2.companionCount.placeholder": "Select",
      "form.step2.minorCount": "How many are minors?",
      "form.step2.minorCount.placeholder": "Select",
      "form.step2.companion0": "0 — I will attend alone",
      "form.step2.companion1": "1 companion",
      "form.step2.companion2": "2 companions",
      "form.step2.companion3": "3 companions",

      "form.step3.title": "Dietary Requirements",
      "form.step3.question": "Do you or any of your companions have food intolerances or need a special menu?",
      "form.step3.yes": "Yes",
      "form.step3.no": "No",
      "form.step3.celiac": "Celiac disease (gluten-free)",
      "form.step3.lactose": "Lactose intolerance",
      "form.step3.nuts": "Nut allergy",
      "form.step3.vegetarian": "Vegetarian",
      "form.step3.vegan": "Vegan",
      "form.step3.details": "Other / Details (indicate who each intolerance applies to)",
      "form.step3.details.placeholder": "E.g.: Child 2 - celiac. Me - vegetarian.",

      "form.step4.title": "Image Rights Authorization",
      "form.step4.legalHeader": "Image use authorization — Ley Orgánica 1/1982, of May 5, on civil protection of the right to honor, personal and family privacy and self-image, and Regulation (EU) 2016/679 (GDPR)",
      "form.step4.legalText": "I authorize Amazon Spain Fulfillment, S.L.U. to capture, reproduce and distribute my image and the image of my minor companions during the Family Day 2026 event held on September 19, 2026 at Amazon BCN1 facilities. Images may be used in internal communications, corporate social media and promotional materials for the event. This authorization is granted free of charge and for an indefinite period, and may be revoked at any time by written communication.",
      "form.step4.authorize": "I authorize",
      "form.step4.deny": "I do not authorize",
      "form.step4.signature": "Registrant's signature",
      "form.step4.clearSignature": "Clear signature",

      "form.step5.title": "Registration Summary",
      "form.step5.edit": "Edit",
      "form.step5.submit": "✓ Save changes",
      "form.step5.personalData": "Personal data",
      "form.step5.companions": "Companions",
      "form.step5.dietary": "Dietary",
      "form.step5.imageRights": "Image authorization",
      "form.step5.minors": "minors",
      "form.step5.noCompanions": "No companions",
      "form.step5.noDietaryNeeds": "No special dietary needs",
      "form.step5.authorized": "Authorized",
      "form.step5.denied": "Not authorized",
      "form.step5.signed": "Signed",

      "success.title": "Registration completed successfully!",
      "success.subtitle": "Your Family Day 2026 ticket",
      "success.loginLabel": "Login",
      "success.companionsLabel": "Companions",
      "success.download": "Download ticket",
      "success.warning": "IMPORTANT - Event access: You must carry your Amazon ID badge to access the event. Your family/companions must be accompanied by the registered person.",
      "success.backHome": "← Back to home",
      "success.ticketFooter": "We look forward to seeing you and your family! 🎊 — Amazon BCN1",

      "admin.title": "Admin Dashboard",
      "admin.subtitle": "Family Day 2026 — Registrations",
      "admin.totalHeadcount": "Total headcount",
      "admin.registrations": "Registrations",
      "admin.companions": "Companions",
      "admin.checkedIn": "Checked in",
      "admin.notCheckedIn": "Pending check-in",
      "admin.filters.title": "Filters",
      "admin.filters.department": "Department",
      "admin.filters.dateFrom": "From",
      "admin.filters.dateTo": "To",
      "admin.filters.dietary": "Dietary intolerances",
      "admin.filters.imageAuth": "Image authorization",
      "admin.filters.checkedIn": "Check-in status",
      "admin.filters.all": "All",
      "admin.filters.yes": "Yes",
      "admin.filters.no": "No",
      "admin.filters.authorized": "Authorized",
      "admin.filters.denied": "Not authorized",
      "admin.filters.apply": "Apply filters",
      "admin.filters.clear": "Clear filters",
      "admin.export": "Export CSV",
      "admin.scanner.title": "QR Scanner",
      "admin.scanner.start": "Start scanner",
      "admin.scanner.stop": "Stop scanner",
      "admin.scanner.manual": "Manual entry",
      "admin.scanner.manualPlaceholder": "Enter login",
      "admin.scanner.checkIn": "Check in",
      "admin.scanner.success": "✓ Check-in completed",
      "admin.scanner.alreadyCheckedIn": "Already checked in",
      "admin.scanner.notFound": "Registration not found",
      "admin.scanner.invalidQr": "Invalid QR code",
      "admin.scanner.cameraError": "Cannot access camera. Please allow access or use manual entry.",

      "common.next": "Next",
      "common.previous": "Previous",
      "common.loading": "Loading...",
      "common.error": "An error has occurred",
      "common.retry": "Retry",
      "common.close": "Close",
      "common.cancel": "Cancel",
      "common.save": "Save",
      "common.step": "Step",
      "common.of": "of",

      "validation.required": "This field is required",
      "validation.email": "Enter a valid email address",
      "validation.dni": "Enter a valid DNI/NIE",
      "validation.signature": "Signature is required to continue",
      "validation.authorization": "You must select an authorization option",
      "validation.dietary": "Indicate if there are special dietary needs",
      "validation.companion": "Select the number of companions",

      "error.network": "Connection error. Please try again.",
      "error.server": "Server error. Please try again.",
      "error.unexpected": "Unexpected response. Please try again.",

      "lang.toggle": "ES",
      "lang.current": "EN",

      "partners.title": "\uD83E\uDD1D Partners",
      "partners.subtitle": "Organizations we'll be working with on volunteering activities",
      "partners.bonaVoluntat.name": "Bona Voluntat en Acci\u00F3",
      "partners.bonaVoluntat.desc": "Promotes volunteering and non-formal education, offering opportunities to develop skills through social and community projects.",
      "partners.roure.name": "Fundaci\u00F3 Roure",
      "partners.roure.desc": "Over 30 years working in the Sant Pere, Santa Caterina i la Ribera neighborhood (Barcelona). Supporting elderly people, families and vulnerable communities. Barcelona Medal of Honor 2024.",
      "partners.acathi.name": "ACATHI",
      "partners.acathi.desc": "Association for the inclusion of LGBTQI+ migrants and refugees in Catalonia. They offer support, training and a safe space for cultural and affective diversity.",
      "partners.patasArriba.name": "Patas Para Arriba",
      "partners.patasArriba.desc": "Foundation for a healthy bond between people and animals. They work on education in schools, research, and support for responsible adoption in Catalonia.",
      "partners.glamazon.name": "Glamazon",
      "partners.glamazon.desc": "Amazon Employee-Led Group for LGBTQIA+ Amazonians and allies. We create a supportive community focused on diverse gender identities, sexual orientations, and expressions.",

      "registration.duplicate.title": "⚠️ Already registered",
      "registration.duplicate.message": "A registration with this login already exists. Would you like to update your information?",
      "registration.duplicate.update": "Yes, update",
      "registration.duplicate.cancel": "Cancel"
    }
  };

  var STORAGE_KEY = 'lang';
  var DEFAULT_LANG = 'es';
  var SUPPORTED_LANGS = ['es', 'en'];

  /**
   * Get the current language from sessionStorage or return default.
   * @returns {string} Current language code ('es' or 'en')
   */
  function getLang() {
    try {
      var stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED_LANGS.indexOf(stored) !== -1) {
        return stored;
      }
    } catch (e) {
      // sessionStorage may be unavailable (private browsing, etc.)
    }
    return DEFAULT_LANG;
  }

  /**
   * Set the active language and store preference in sessionStorage.
   * @param {string} lang - Language code ('es' or 'en')
   */
  function setLang(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) {
      console.warn('[I18n] Unsupported language: ' + lang + '. Falling back to ' + DEFAULT_LANG);
      lang = DEFAULT_LANG;
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      // sessionStorage may be unavailable
    }
    // Update the HTML lang attribute
    document.documentElement.lang = lang;
    // Update the toggle button text
    updateToggleButton();
  }

  /**
   * Translate a key using the current language.
   * Keys use dot notation (e.g., 'landing.title', 'form.step1.fullName').
   * Returns the key itself if translation is not found.
   * @param {string} key - Translation key in dot notation
   * @returns {string} Translated string or the key if not found
   */
  function t(key) {
    var lang = getLang();
    var dict = translations[lang];
    if (dict && dict.hasOwnProperty(key)) {
      return dict[key];
    }
    // Fallback to Spanish if key not found in current language
    if (lang !== DEFAULT_LANG && translations[DEFAULT_LANG] && translations[DEFAULT_LANG].hasOwnProperty(key)) {
      return translations[DEFAULT_LANG][key];
    }
    // Return key as-is if not found anywhere
    console.warn('[I18n] Missing translation for key: ' + key);
    return key;
  }

  /**
   * Get all translation keys for the current language.
   * @returns {string[]} Array of all available keys
   */
  function getKeys() {
    var lang = getLang();
    var dict = translations[lang] || translations[DEFAULT_LANG];
    return Object.keys(dict);
  }

  /**
   * Get the full translations object for a given language.
   * Useful for property tests.
   * @param {string} lang - Language code
   * @returns {object} Translations dictionary
   */
  function getTranslations(lang) {
    return translations[lang] || null;
  }

  /**
   * Toggle between Spanish and English.
   */
  function toggle() {
    var current = getLang();
    var next = current === 'es' ? 'en' : 'es';
    setLang(next);
  }

  /**
   * Update the language toggle button text to reflect the available switch option.
   */
  function updateToggleButton() {
    var btn = document.getElementById('lang-toggle');
    if (btn) {
      var current = getLang();
      btn.textContent = current === 'es' ? 'EN' : 'ES';
      btn.setAttribute('aria-label', current === 'es' ? 'Switch to English' : 'Cambiar a Español');
    }
  }

  /**
   * Re-render all translatable elements on the page.
   * Elements with [data-i18n] attribute will have their textContent updated.
   * Elements with [data-i18n-placeholder] will have their placeholder attribute updated.
   * Elements with [data-i18n-aria-label] will have their aria-label attribute updated.
   */
  function translatePage() {
    // Translate text content
    var elements = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < elements.length; i++) {
      var key = elements[i].getAttribute('data-i18n');
      elements[i].textContent = t(key);
    }
    // Translate placeholders
    var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < placeholders.length; j++) {
      var pKey = placeholders[j].getAttribute('data-i18n-placeholder');
      placeholders[j].setAttribute('placeholder', t(pKey));
    }
    // Translate aria-labels
    var ariaLabels = document.querySelectorAll('[data-i18n-aria-label]');
    for (var k = 0; k < ariaLabels.length; k++) {
      var aKey = ariaLabels[k].getAttribute('data-i18n-aria-label');
      ariaLabels[k].setAttribute('aria-label', t(aKey));
    }
  }

  /**
   * Initialize the i18n module.
   * Sets up the language toggle button event listener and applies initial language.
   */
  function init() {
    var lang = getLang();
    document.documentElement.lang = lang;
    updateToggleButton();

    // Wire the language toggle button
    var btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        toggle();
        // Re-render the current view
        translatePage();
        // Dispatch custom event so other modules can react to language changes
        var event;
        try {
          event = new CustomEvent('languageChanged', { detail: { lang: getLang() } });
        } catch (e) {
          // IE11 fallback
          event = document.createEvent('CustomEvent');
          event.initCustomEvent('languageChanged', true, true, { lang: getLang() });
        }
        document.dispatchEvent(event);
      });
    }
  }

  // Public API
  return {
    init: init,
    t: t,
    setLang: setLang,
    getLang: getLang,
    toggle: toggle,
    translatePage: translatePage,
    getKeys: getKeys,
    getTranslations: getTranslations
  };
})();
