/**
 * Family Day 2026 - Amazon BCN1
 * Admin Dashboard Module
 *
 * Manages the organizer interface with:
 * - Real-time registration list from Google Sheets
 * - Filtering by department, date, dietary, image auth, check-in status
 * - CSV export with BOM for Excel compatibility
 * - QR scanner integration for event-day check-in
 *
 * Validates: Requirements 9.2, 9.3, 9.4, 10.1, 10.2, 10.3, 10.4
 */
'use strict';

var AdminDashboard = (function () {
  var _container = null;
  var _registrations = [];
  var _filteredRegistrations = [];
  var _filters = {};

  /**
   * Initialize the Admin Dashboard.
   * @param {HTMLElement} container - The main content container element
   */
  function init(container) {
    _container = container;
    _render();
    loadRegistrations();

    // Listen for check-in completions to refresh the list
    document.addEventListener('checkInCompleted', function () {
      loadRegistrations();
    });
  }

  /**
   * Load all registrations from the backend.
   * @returns {Promise<void>}
   */
  function loadRegistrations() {
    if (typeof API === 'undefined' || !API.getRegistrations) {
      return Promise.resolve();
    }

    return API.getRegistrations().then(function (result) {
      if (result.success && Array.isArray(result.data)) {
        _registrations = result.data;
        _applyCurrentFilters();
        _renderTable();
        _renderStats();
      }
    }).catch(function () {
      // Silently handle — user can retry
    });
  }

  /**
   * Apply filter parameters and update the filtered list.
   * @param {object} filters - Filter parameters
   */
  function applyFilters(filters) {
    _filters = filters || {};
    _applyCurrentFilters();
    _renderTable();
    _renderStats();
  }

  /**
   * Apply current stored filters to the registrations list.
   * @private
   */
  function _applyCurrentFilters() {
    _filteredRegistrations = _registrations.filter(function (reg) {
      // Department filter
      if (_filters.department && reg.department !== _filters.department) {
        return false;
      }
      // Date from filter
      if (_filters.dateFrom) {
        var regDate = new Date(reg.registrationDate || reg.timestamp);
        var fromDate = new Date(_filters.dateFrom);
        if (regDate < fromDate) return false;
      }
      // Date to filter
      if (_filters.dateTo) {
        var regDate2 = new Date(reg.registrationDate || reg.timestamp);
        var toDate = new Date(_filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (regDate2 > toDate) return false;
      }
      // Dietary needs filter
      if (_filters.hasDietaryNeeds === true && !reg.hasDietaryNeeds) {
        return false;
      }
      if (_filters.hasDietaryNeeds === false && reg.hasDietaryNeeds) {
        return false;
      }
      // Image authorization filter
      if (_filters.imageAuthorization && reg.imageAuthorization !== _filters.imageAuthorization) {
        return false;
      }
      // Check-in status filter
      if (_filters.checkedIn === true && !reg.checkedIn) {
        return false;
      }
      if (_filters.checkedIn === false && reg.checkedIn) {
        return false;
      }
      return true;
    });
  }

  /**
   * Export current (filtered) registration data as a downloadable CSV.
   * Uses BOM for Excel compatibility with UTF-8.
   * CSV columns: Nombre, Login, Email, Departamento, Acompañantes, Menores,
   *              Intolerancias, Autorización Imagen, Check-in
   */
  function exportCSV() {
    var data = _filteredRegistrations.length > 0 ? _filteredRegistrations : _registrations;
    var BOM = '\uFEFF';
    var headers = [
      'Nombre',
      'Login',
      'Email',
      'Departamento',
      'Acompañantes',
      'Menores',
      'Intolerancias',
      'Autorización Imagen',
      'Check-in',
      'Fecha Check-in'
    ];

    var rows = [headers.join(',')];

    for (var i = 0; i < data.length; i++) {
      var reg = data[i];
      var dietaryInfo = '';
      if (reg.hasDietaryNeeds) {
        var options = Array.isArray(reg.dietaryOptions) ? reg.dietaryOptions.join('; ') : (reg.dietaryOptions || '');
        var details = reg.dietaryDetails || '';
        dietaryInfo = options + (details ? ' - ' + details : '');
      }

      // Normalize checkedIn to boolean (backend may send string "true"/"TRUE")
      var isCheckedIn = reg.checkedIn === true || reg.checkedIn === 'true' || reg.checkedIn === 'TRUE';

      var row = [
        _csvEscape(reg.fullName || ''),
        _csvEscape(reg.login || ''),
        _csvEscape(reg.email || ''),
        _csvEscape(reg.department || ''),
        reg.companionCount != null ? reg.companionCount : 0,
        reg.minorCount != null ? reg.minorCount : 0,
        _csvEscape(dietaryInfo),
        _csvEscape(reg.imageAuthorization === 'authorize' ? 'Sí' : 'No'),
        _csvEscape(isCheckedIn ? 'Sí' : 'No'),
        _csvEscape(reg.checkedInTimestamp || '')
      ];
      rows.push(row.join(','));
    }

    var csvContent = BOM + rows.join('\r\n');
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);

    var link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'family-day-2026-registros.csv');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up object URL
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Escape a value for CSV (wrap in quotes if contains comma, quote, or newline).
   * @param {string} value
   * @returns {string}
   * @private
   */
  function _csvEscape(value) {
    var str = String(value);
    if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1 || str.indexOf('\r') !== -1) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  /**
   * Start the QR scanner for check-in.
   */
  function startScanner() {
    QRScanner.init('qr-scanner-container');
    QRScanner.start();
  }

  /**
   * Stop the QR scanner.
   */
  function stopScanner() {
    QRScanner.stop();
  }

  /**
   * Render the full admin dashboard UI.
   * @private
   */
  function _render() {
    if (!_container) return;

    var html = '';
    html += '<div class="card mb-lg">';
    html += '<h1 class="card__title" data-i18n="admin.title">' + I18n.t('admin.title') + '</h1>';
    html += '<p data-i18n="admin.subtitle">' + I18n.t('admin.subtitle') + '</p>';
    html += '</div>';

    // Stats section
    html += '<div id="admin-stats" class="card mb-lg"></div>';

    // Filters section
    html += '<div class="card mb-lg">';
    html += '<h2 class="card__title" data-i18n="admin.filters.title">' + I18n.t('admin.filters.title') + '</h2>';
    html += _renderFiltersHTML();
    html += '</div>';

    // Actions: Export + Scanner
    html += '<div class="card mb-lg" style="display:flex;flex-wrap:wrap;gap:var(--space-md);align-items:center;">';
    html += '<button type="button" id="export-csv-btn" class="btn btn--primary">' + I18n.t('admin.export') + '</button>';
    html += '<button type="button" id="start-scanner-btn" class="btn btn--secondary">' + I18n.t('admin.scanner.start') + '</button>';
    html += '<button type="button" id="stop-scanner-btn" class="btn btn--outline hidden">' + I18n.t('admin.scanner.stop') + '</button>';
    html += '</div>';

    // QR Scanner / Gun check-in section (visible by default for event day)
    html += '<div class="card mb-lg" id="scanner-section" style="border:3px solid var(--success);background:linear-gradient(135deg,#E8F5E9,#FFFFFF);">';
    html += '<h2 class="card__title" style="color:var(--success);">🔫 Check-in Rápido</h2>';
    html += '<p style="margin-bottom:1rem;color:var(--text-secondary);">Apunta la pistola al QR del asistente. El check-in se hace automáticamente.</p>';
    html += '<div id="qr-scanner-container" style="width:100%;max-width:500px;margin:0 auto;"></div>';
    html += '</div>';

    // Registrations table
    html += '<div class="card">';
    html += '<div id="admin-table" class="table-container"></div>';
    html += '</div>';

    _container.innerHTML = html;

    // Wire up event listeners
    _wireEvents();

    // Initialize gun scanner input immediately
    if (typeof QRScanner !== 'undefined') {
      QRScanner.init('qr-scanner-container');
      QRScanner.showManualInput();
    }
  }

  /**
   * Render filter form HTML.
   * @returns {string}
   * @private
   */
  function _renderFiltersHTML() {
    var departments = ['OB', 'IB', 'ICQA', 'SUPPORT', 'NFT', 'IXD', 'TS/TNS',
      'EU Central Flow Team', 'AMXL', 'XLOC', 'ACES ATS', 'ACES PSE',
      'L&P', '3PL', 'VFlex', 'AMOC/GESA'];

    var html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--space-md);">';

    // Department
    html += '<div class="form-group">';
    html += '<label class="form-group__label" for="filter-department">' + I18n.t('admin.filters.department') + '</label>';
    html += '<select id="filter-department" class="select">';
    html += '<option value="">' + I18n.t('admin.filters.all') + '</option>';
    for (var i = 0; i < departments.length; i++) {
      html += '<option value="' + departments[i] + '">' + departments[i] + '</option>';
    }
    html += '</select>';
    html += '</div>';

    // Date from
    html += '<div class="form-group">';
    html += '<label class="form-group__label" for="filter-date-from">' + I18n.t('admin.filters.dateFrom') + '</label>';
    html += '<input type="date" id="filter-date-from" class="input">';
    html += '</div>';

    // Date to
    html += '<div class="form-group">';
    html += '<label class="form-group__label" for="filter-date-to">' + I18n.t('admin.filters.dateTo') + '</label>';
    html += '<input type="date" id="filter-date-to" class="input">';
    html += '</div>';

    // Dietary
    html += '<div class="form-group">';
    html += '<label class="form-group__label" for="filter-dietary">' + I18n.t('admin.filters.dietary') + '</label>';
    html += '<select id="filter-dietary" class="select">';
    html += '<option value="">' + I18n.t('admin.filters.all') + '</option>';
    html += '<option value="yes">' + I18n.t('admin.filters.yes') + '</option>';
    html += '<option value="no">' + I18n.t('admin.filters.no') + '</option>';
    html += '</select>';
    html += '</div>';

    // Image authorization
    html += '<div class="form-group">';
    html += '<label class="form-group__label" for="filter-image-auth">' + I18n.t('admin.filters.imageAuth') + '</label>';
    html += '<select id="filter-image-auth" class="select">';
    html += '<option value="">' + I18n.t('admin.filters.all') + '</option>';
    html += '<option value="authorize">' + I18n.t('admin.filters.authorized') + '</option>';
    html += '<option value="deny">' + I18n.t('admin.filters.denied') + '</option>';
    html += '</select>';
    html += '</div>';

    // Check-in status
    html += '<div class="form-group">';
    html += '<label class="form-group__label" for="filter-checkedin">' + I18n.t('admin.filters.checkedIn') + '</label>';
    html += '<select id="filter-checkedin" class="select">';
    html += '<option value="">' + I18n.t('admin.filters.all') + '</option>';
    html += '<option value="yes">' + I18n.t('admin.filters.yes') + '</option>';
    html += '<option value="no">' + I18n.t('admin.filters.no') + '</option>';
    html += '</select>';
    html += '</div>';

    html += '</div>';

    // Filter buttons
    html += '<div style="margin-top:var(--space-md);display:flex;gap:var(--space-md);">';
    html += '<button type="button" id="apply-filters-btn" class="btn btn--primary">' + I18n.t('admin.filters.apply') + '</button>';
    html += '<button type="button" id="clear-filters-btn" class="btn btn--outline">' + I18n.t('admin.filters.clear') + '</button>';
    html += '</div>';

    return html;
  }

  /**
   * Wire up all event listeners for the admin dashboard.
   * @private
   */
  function _wireEvents() {
    // Export CSV
    var exportBtn = document.getElementById('export-csv-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        exportCSV();
      });
    }

    // Start Scanner
    var startBtn = document.getElementById('start-scanner-btn');
    if (startBtn) {
      startBtn.addEventListener('click', function () {
        var scannerSection = document.getElementById('scanner-section');
        var stopBtn = document.getElementById('stop-scanner-btn');
        if (scannerSection) scannerSection.classList.remove('hidden');
        if (stopBtn) stopBtn.classList.remove('hidden');
        startBtn.classList.add('hidden');
        startScanner();
      });
    }

    // Stop Scanner
    var stopBtn = document.getElementById('stop-scanner-btn');
    if (stopBtn) {
      stopBtn.addEventListener('click', function () {
        var scannerSection = document.getElementById('scanner-section');
        if (scannerSection) scannerSection.classList.add('hidden');
        stopBtn.classList.add('hidden');
        if (startBtn) startBtn.classList.remove('hidden');
        stopScanner();
      });
    }

    // Apply Filters
    var applyBtn = document.getElementById('apply-filters-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', function () {
        _readFiltersFromUI();
        _applyCurrentFilters();
        _renderTable();
        _renderStats();
      });
    }

    // Clear Filters
    var clearBtn = document.getElementById('clear-filters-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        _clearFiltersUI();
        _filters = {};
        _applyCurrentFilters();
        _renderTable();
        _renderStats();
      });
    }
  }

  /**
   * Read filter values from UI controls into _filters object.
   * @private
   */
  function _readFiltersFromUI() {
    var dept = document.getElementById('filter-department');
    var dateFrom = document.getElementById('filter-date-from');
    var dateTo = document.getElementById('filter-date-to');
    var dietary = document.getElementById('filter-dietary');
    var imageAuth = document.getElementById('filter-image-auth');
    var checkedIn = document.getElementById('filter-checkedin');

    _filters = {};

    if (dept && dept.value) _filters.department = dept.value;
    if (dateFrom && dateFrom.value) _filters.dateFrom = dateFrom.value;
    if (dateTo && dateTo.value) _filters.dateTo = dateTo.value;
    if (dietary && dietary.value === 'yes') _filters.hasDietaryNeeds = true;
    if (dietary && dietary.value === 'no') _filters.hasDietaryNeeds = false;
    if (imageAuth && imageAuth.value) _filters.imageAuthorization = imageAuth.value;
    if (checkedIn && checkedIn.value === 'yes') _filters.checkedIn = true;
    if (checkedIn && checkedIn.value === 'no') _filters.checkedIn = false;
  }

  /**
   * Clear all filter UI controls.
   * @private
   */
  function _clearFiltersUI() {
    var ids = ['filter-department', 'filter-date-from', 'filter-date-to',
      'filter-dietary', 'filter-image-auth', 'filter-checkedin'];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el) el.value = '';
    }
  }

  /**
   * Render the stats summary section.
   * @private
   */
  function _renderStats() {
    var container = document.getElementById('admin-stats');
    if (!container) return;

    var data = _filteredRegistrations.length > 0 || Object.keys(_filters).length > 0
      ? _filteredRegistrations : _registrations;

    var totalRegistrations = data.length;
    var totalCompanions = 0;
    var checkedInCount = 0;

    for (var i = 0; i < data.length; i++) {
      totalCompanions += (data[i].companionCount || 0);
      if (data[i].checkedIn) checkedInCount++;
    }

    var totalHeadcount = totalRegistrations + totalCompanions;

    var html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:var(--space-md);text-align:center;">';
    html += '<div><div style="font-size:var(--font-size-2xl);font-weight:700;color:var(--primary);">' + totalHeadcount + '</div>';
    html += '<div style="font-size:var(--font-size-sm);color:var(--text-secondary);">' + I18n.t('admin.totalHeadcount') + '</div></div>';
    html += '<div><div style="font-size:var(--font-size-2xl);font-weight:700;color:var(--secondary);">' + totalRegistrations + '</div>';
    html += '<div style="font-size:var(--font-size-sm);color:var(--text-secondary);">' + I18n.t('admin.registrations') + '</div></div>';
    html += '<div><div style="font-size:var(--font-size-2xl);font-weight:700;color:var(--secondary-light);">' + totalCompanions + '</div>';
    html += '<div style="font-size:var(--font-size-sm);color:var(--text-secondary);">' + I18n.t('admin.companions') + '</div></div>';
    html += '<div><div style="font-size:var(--font-size-2xl);font-weight:700;color:var(--success);">' + checkedInCount + '</div>';
    html += '<div style="font-size:var(--font-size-sm);color:var(--text-secondary);">' + I18n.t('admin.checkedIn') + '</div></div>';
    html += '<div><div style="font-size:var(--font-size-2xl);font-weight:700;color:var(--warning);">' + (totalRegistrations - checkedInCount) + '</div>';
    html += '<div style="font-size:var(--font-size-sm);color:var(--text-secondary);">' + I18n.t('admin.notCheckedIn') + '</div></div>';
    html += '</div>';

    container.innerHTML = html;
  }

  /**
   * Render the registrations table.
   * @private
   */
  function _renderTable() {
    var container = document.getElementById('admin-table');
    if (!container) return;

    var data = _filteredRegistrations.length > 0 || Object.keys(_filters).length > 0
      ? _filteredRegistrations : _registrations;

    if (data.length === 0) {
      container.innerHTML = '<p class="text-center mt-md">' + I18n.t('common.loading') + '</p>';
      return;
    }

    var html = '<table class="table">';
    html += '<thead class="table__header"><tr>';
    html += '<th>Nombre</th>';
    html += '<th>Login</th>';
    html += '<th>Email</th>';
    html += '<th>Departamento</th>';
    html += '<th>Acompañantes</th>';
    html += '<th>Menores</th>';
    html += '<th>Check-in</th>';
    html += '</tr></thead>';
    html += '<tbody>';

    for (var i = 0; i < data.length; i++) {
      var reg = data[i];
      var rowClass = reg.checkedIn ? 'table__row table__row--checked-in' : 'table__row';
      html += '<tr class="' + rowClass + '">';
      html += '<td class="table__cell">' + _escapeHTML(reg.fullName || '') + '</td>';
      html += '<td class="table__cell">' + _escapeHTML(reg.login || '') + '</td>';
      html += '<td class="table__cell">' + _escapeHTML(reg.email || '') + '</td>';
      html += '<td class="table__cell">' + _escapeHTML(reg.department || '') + '</td>';
      html += '<td class="table__cell">' + (reg.companionCount || 0) + '</td>';
      html += '<td class="table__cell">' + (reg.minorCount || 0) + '</td>';
      html += '<td class="table__cell">' + (reg.checkedIn ? '✓' : '—') + '</td>';
      html += '</tr>';
    }

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  /**
   * Escape HTML entities to prevent XSS.
   * @param {string} str
   * @returns {string}
   * @private
   */
  function _escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // Public API
  return {
    init: init,
    loadRegistrations: loadRegistrations,
    applyFilters: applyFilters,
    exportCSV: exportCSV,
    startScanner: startScanner,
    stopScanner: stopScanner
  };
})();
