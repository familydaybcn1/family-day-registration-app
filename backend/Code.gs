/**
 * Google Apps Script Web App — Family Day 2026 Registration Backend
 *
 * Endpoints (single Web App URL, action-based routing):
 *   POST ?action=submit   — Submit new registration (append row)
 *   POST ?action=checkin  — Mark registration as checked-in (update row)
 *   GET  ?action=list     — Fetch all registrations as JSON
 *   GET  ?action=stats    — Aggregate statistics
 *
 * Google Sheet Column Schema (A–P):
 *   A: Timestamp (ISO 8601)
 *   B: FullName
 *   C: Login
 *   D: Email
 *   E: DNI
 *   F: Department
 *   G: CompanionCount (number)
 *   H: MinorCount (number)
 *   I: HasDietaryNeeds (boolean)
 *   J: DietaryOptions (comma-separated string)
 *   K: DietaryDetails (text)
 *   L: ImageAuthorization ('authorize' or 'deny')
 *   M: SignatureData (data URL or 'signed')
 *   N: Language ('es' or 'en')
 *   O: CheckedIn (boolean, default false)
 *   P: CheckedInTimestamp (ISO 8601, empty until checked in)
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Returns the active spreadsheet's first sheet.
 * The script must be bound to the target spreadsheet.
 */
function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Registrations') ||
         SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

// ---------------------------------------------------------------------------
// HTTP Handlers
// ---------------------------------------------------------------------------

/**
 * Handles GET requests.
 * Query parameter "action" determines behavior:
 *   - list:  returns all registration rows as JSON
 *   - stats: returns aggregate counts
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'list';

  try {
    if (action === 'stats') {
      return jsonResponse(getStats());
    }
    // Default: list
    return jsonResponse(getRegistrations(e ? e.parameter : {}));
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message });
  }
}

/**
 * Handles POST requests.
 * JSON body must include an "action" field:
 *   - submit:  append a new registration row
 *   - checkin: mark existing registration as checked-in
 *   - update:  update an existing registration row (by login)
 */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;

    if (action === 'submit') {
      return jsonResponse(submitRegistration(body.data));
    }

    if (action === 'checkin') {
      return jsonResponse(checkInRegistration(body.login));
    }

    if (action === 'update') {
      return jsonResponse(updateRegistration(body.data));
    }

    return jsonResponse({ status: 'error', message: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message });
  }
}

// ---------------------------------------------------------------------------
// Core Operations
// ---------------------------------------------------------------------------

/**
 * Appends a new registration row to the sheet.
 * Checks for duplicate login before appending.
 * Uses LockService for concurrent safety.
 *
 * @param {Object} data - Registration form data
 * @returns {Object} Response with status and row number, or duplicate indicator
 */
function submitRegistration(data) {
  if (!data) {
    return { status: 'error', message: 'No data provided' };
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000); // Wait up to 10 seconds for lock

  try {
    var sheet = getSheet();

    // Check for duplicate login in column C
    var existingRow = findRowByLogin(sheet, data.login);
    if (existingRow !== -1) {
      return {
        status: 'duplicate',
        message: 'Login already registered',
        existingRow: existingRow
      };
    }

    var timestamp = new Date().toISOString();

    // Handle signature: if data URL is too large, store 'signed' flag
    var signatureValue = data.signature || '';
    if (signatureValue.length > 50000) {
      signatureValue = 'signed';
    }

    // Build row matching columns A–P
    var row = [
      timestamp,                                              // A: Timestamp
      data.fullName || '',                                    // B: FullName
      data.login || '',                                       // C: Login
      data.email || '',                                       // D: Email
      data.dni || '',                                         // E: DNI
      data.department || '',                                  // F: Department
      Number(data.companionCount) || 0,                       // G: CompanionCount
      Number(data.minorCount) || 0,                           // H: MinorCount
      data.hasDietaryNeeds ? true : false,                    // I: HasDietaryNeeds
      Array.isArray(data.dietaryOptions)                      // J: DietaryOptions
        ? data.dietaryOptions.join(',')
        : (data.dietaryOptions || ''),
      data.dietaryDetails || '',                              // K: DietaryDetails
      data.imageAuthorization || '',                          // L: ImageAuthorization
      signatureValue,                                         // M: SignatureData
      data.language || 'es',                                  // N: Language
      false,                                                  // O: CheckedIn
      ''                                                      // P: CheckedInTimestamp
    ];

    sheet.appendRow(row);
    var lastRow = sheet.getLastRow();

    return {
      status: 'ok',
      message: 'Registration saved',
      row: lastRow,
      data: {
        timestamp: timestamp,
        login: data.login,
        companionCount: Number(data.companionCount) || 0
      }
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Updates an existing registration row found by login (column C).
 * Preserves the original timestamp (column A) and check-in status (O, P).
 * Updates columns B through N with new data.
 * Uses LockService for concurrent safety.
 *
 * @param {Object} data - Registration form data
 * @returns {Object} Response with status
 */
function updateRegistration(data) {
  if (!data) {
    return { status: 'error', message: 'No data provided' };
  }

  if (!data.login) {
    return { status: 'error', message: 'No login provided for update' };
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var sheet = getSheet();
    var targetRow = findRowByLogin(sheet, data.login);

    if (targetRow === -1) {
      return { status: 'error', message: 'Registration not found for login: ' + data.login };
    }

    // Handle signature: if data URL is too large, store 'signed' flag
    var signatureValue = data.signature || '';
    if (signatureValue.length > 50000) {
      signatureValue = 'signed';
    }

    // Update columns B through N (columns 2–14), preserving A (timestamp) and O–P (check-in)
    var updatedValues = [
      data.fullName || '',                                    // B: FullName
      data.login || '',                                       // C: Login
      data.email || '',                                       // D: Email
      data.dni || '',                                         // E: DNI
      data.department || '',                                  // F: Department
      Number(data.companionCount) || 0,                       // G: CompanionCount
      Number(data.minorCount) || 0,                           // H: MinorCount
      data.hasDietaryNeeds ? true : false,                    // I: HasDietaryNeeds
      Array.isArray(data.dietaryOptions)                      // J: DietaryOptions
        ? data.dietaryOptions.join(',')
        : (data.dietaryOptions || ''),
      data.dietaryDetails || '',                              // K: DietaryDetails
      data.imageAuthorization || '',                          // L: ImageAuthorization
      signatureValue,                                         // M: SignatureData
      data.language || 'es'                                   // N: Language
    ];

    // Write updated values to columns B–N (columns 2 through 14)
    sheet.getRange(targetRow, 2, 1, updatedValues.length).setValues([updatedValues]);

    return {
      status: 'ok',
      message: 'Registration updated',
      row: targetRow,
      data: {
        login: data.login,
        companionCount: Number(data.companionCount) || 0
      }
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Finds a row by login in column C (case-insensitive).
 *
 * @param {Sheet} sheet - The spreadsheet sheet to search
 * @param {string} login - The login to search for
 * @returns {number} 1-indexed row number, or -1 if not found
 */
function findRowByLogin(sheet, login) {
  if (!login) return -1;
  var data = sheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][2]).toLowerCase() === String(login).toLowerCase()) {
      return i + 1; // Sheet rows are 1-indexed
    }
  }
  return -1;
}

/**
 * Marks a registration as checked-in by Login (column C).
 * Uses LockService for concurrent safety.
 *
 * @param {string} login - Corporate login to check in
 * @returns {Object} Response with status
 */
function checkInRegistration(login) {
  if (!login) {
    return { status: 'error', message: 'No login provided' };
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var sheet = getSheet();
    var data = sheet.getDataRange().getValues();

    // Find row by Login (column C, index 2) — skip header row if present
    var targetRow = -1;
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][2]).toLowerCase() === String(login).toLowerCase()) {
        targetRow = i + 1; // Sheet rows are 1-indexed
        break;
      }
    }

    if (targetRow === -1) {
      return { status: 'error', message: 'Registration not found for login: ' + login };
    }

    // Check if already checked in (column O, index 14)
    var alreadyCheckedIn = data[targetRow - 1][14];
    if (alreadyCheckedIn === true || alreadyCheckedIn === 'TRUE' || alreadyCheckedIn === 'true') {
      return {
        status: 'error',
        message: 'Already checked in',
        checkedInTimestamp: data[targetRow - 1][15]
      };
    }

    // Update columns O (CheckedIn) and P (CheckedInTimestamp)
    var checkInTime = new Date().toISOString();
    sheet.getRange(targetRow, 15).setValue(true);          // Column O (15th column)
    sheet.getRange(targetRow, 16).setValue(checkInTime);   // Column P (16th column)

    return {
      status: 'ok',
      message: 'Check-in successful',
      login: login,
      checkedInTimestamp: checkInTime
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Returns all registration rows as a JSON array.
 * Supports optional filters via query parameters.
 *
 * @param {Object} params - Optional filter parameters
 * @returns {Object} Response with registrations array
 */
function getRegistrations(params) {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();

  if (data.length === 0) {
    return { status: 'ok', registrations: [] };
  }

  // Skip header row (always skip first row)
  var startIndex = 1;

  var registrations = [];

  for (var i = startIndex; i < data.length; i++) {
    var row = data[i];
    var reg = {
      timestamp: row[0],
      fullName: row[1],
      login: row[2],
      email: row[3],
      dni: row[4],
      department: row[5],
      companionCount: Number(row[6]) || 0,
      minorCount: Number(row[7]) || 0,
      hasDietaryNeeds: row[8] === true || row[8] === 'TRUE' || row[8] === 'true',
      dietaryOptions: row[9] ? String(row[9]) : '',
      dietaryDetails: row[10] ? String(row[10]) : '',
      imageAuthorization: row[11],
      signatureData: row[12],
      language: row[13],
      checkedIn: row[14] === true || row[14] === 'TRUE' || row[14] === 'true',
      checkedInTimestamp: row[15] || ''
    };

    // Apply filters if provided
    if (params) {
      if (params.department && reg.department !== params.department) continue;
      if (params.checkedIn !== undefined) {
        var filterCheckedIn = params.checkedIn === 'true' || params.checkedIn === true;
        if (reg.checkedIn !== filterCheckedIn) continue;
      }
      if (params.hasDietaryNeeds !== undefined) {
        var filterDietary = params.hasDietaryNeeds === 'true' || params.hasDietaryNeeds === true;
        if (reg.hasDietaryNeeds !== filterDietary) continue;
      }
      if (params.imageAuthorization && reg.imageAuthorization !== params.imageAuthorization) continue;
      if (params.dateFrom) {
        var dateFrom = new Date(params.dateFrom);
        var regDate = new Date(reg.timestamp);
        if (regDate < dateFrom) continue;
      }
      if (params.dateTo) {
        var dateTo = new Date(params.dateTo);
        var regDate2 = new Date(reg.timestamp);
        if (regDate2 > dateTo) continue;
      }
    }

    registrations.push(reg);
  }

  return { status: 'ok', registrations: registrations };
}

/**
 * Returns aggregate statistics for the dashboard.
 *
 * @returns {Object} Stats object with counts
 */
function getStats() {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();

  if (data.length === 0) {
    return {
      status: 'ok',
      total: 0,
      companions: 0,
      totalHeadcount: 0,
      checkedIn: 0,
      pendingCheckIn: 0,
      dietary: 0
    };
  }

  // Skip header row if present
  var startIndex = 1;

  var total = 0;
  var companions = 0;
  var checkedIn = 0;
  var dietary = 0;

  for (var i = startIndex; i < data.length; i++) {
    var row = data[i];
    total++;
    companions += Number(row[6]) || 0;  // Column G: CompanionCount

    if (row[14] === true || row[14] === 'TRUE' || row[14] === 'true') {
      checkedIn++;
    }

    if (row[8] === true || row[8] === 'TRUE' || row[8] === 'true') {
      dietary++;
    }
  }

  return {
    status: 'ok',
    total: total,
    companions: companions,
    totalHeadcount: total + companions,
    checkedIn: checkedIn,
    pendingCheckIn: total - checkedIn,
    dietary: dietary
  };
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Creates a JSON response with proper MIME type.
 * Google Apps Script deployed web apps handle CORS automatically for
 * cross-origin requests when deployed with "Anyone" access.
 *
 * @param {Object} data - Object to serialize as JSON
 * @returns {TextOutput} ContentService text output with JSON MIME type
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
