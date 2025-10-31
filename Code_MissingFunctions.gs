/**
 * AMERICAN BOCCE CO. - MISSING BACKEND FUNCTIONS
 * Add these functions to Code.gs
 * 
 * These functions were missing from the original Code.gs but are called
 * from the frontend. Add them after line 906 in Code.gs (at the end of
 * the file, before the closing brace if there is one).
 */

// ============================================
// SPREADSHEET INITIALIZATION
// ============================================

/**
 * Initialize Events sheet with proper structure
 * @returns {Sheet} Events sheet
 */
function initializeEventsSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME_EVENTS || 'Events');
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME_EVENTS || 'Events');
    sheet.appendRow([
      'Event ID',
      'Event Name',
      'Event Slug',
      'Event Date',
      'Form ID',
      'Form URL',
      'Public URL',
      'Display URL',
      'Poster URL',
      'Created',
      'Modified'
    ]);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, 11);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#c8102e');
    headerRange.setFontColor('#ffffff');
    headerRange.setHorizontalAlignment('center');
    
    // Set column widths for better readability
    sheet.setColumnWidth(1, 180);  // Event ID
    sheet.setColumnWidth(2, 250);  // Event Name
    sheet.setColumnWidth(3, 180);  // Slug
    sheet.setColumnWidth(4, 120);  // Date
    sheet.setColumnWidth(5, 180);  // Form ID
    sheet.setColumnWidths(6, 4, 350);  // URLs (columns 6-9)
    sheet.setColumnWidth(10, 170); // Created
    sheet.setColumnWidth(11, 170); // Modified
    
    // Freeze header row
    sheet.setFrozenRows(1);
    
    logger.info('initializeEventsSheet', 'Events sheet created and formatted');
  }
  
  return sheet;
}

// ============================================
// EVENT MANAGEMENT
// ============================================

/**
 * Get all events from spreadsheet
 * @returns {Object} Response with events array
 */
function getEvents() {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME_EVENTS || 'Events') || initializeEventsSheet();
    const data = sheet.getDataRange().getValues();
    
    const events = [];
    
    // Start from row 2 (skip header)
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {  // Has event ID
        events.push({
          eventId: data[i][0],
          eventName: data[i][1],
          eventSlug: data[i][2],
          eventDate: data[i][3],
          formId: data[i][4] || null,
          formUrl: data[i][5] || null,
          publicUrl: data[i][6],
          displayUrl: data[i][7],
          posterUrl: data[i][8],
          created: data[i][9],
          modified: data[i][10]
        });
      }
    }
    
    // Sort by date descending (most recent first)
    events.sort((a, b) => {
      const dateA = new Date(a.eventDate);
      const dateB = new Date(b.eventDate);
      return dateB - dateA;
    });
    
    logger.info('getEvents', `Loaded ${events.length} events`);
    return { ok: true, events };
    
  } catch (error) {
    logger.error('getEvents', error.message);
    return { 
      ok: false, 
      error: String(error),
      events: [] 
    };
  }
}

/**
 * Get a single event by ID
 * @param {string} eventId - Event ID
 * @returns {Object} Response with event data
 */
function getEvent(eventId) {
  try {
    if (!eventId) {
      return { ok: false, error: 'Event ID is required' };
    }
    
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME_EVENTS || 'Events') || initializeEventsSheet();
    const data = sheet.getDataRange().getValues();
    
    // Search for event
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === eventId) {
        return {
          ok: true,
          event: {
            eventId: data[i][0],
            eventName: data[i][1],
            eventSlug: data[i][2],
            eventDate: data[i][3],
            formId: data[i][4] || null,
            formUrl: data[i][5] || null,
            publicUrl: data[i][6],
            displayUrl: data[i][7],
            posterUrl: data[i][8],
            created: data[i][9],
            modified: data[i][10]
          }
        };
      }
    }
    
    return { ok: false, error: 'Event not found' };
    
  } catch (error) {
    logger.error('getEvent', error.message, { eventId });
    return { ok: false, error: String(error) };
  }
}

/**
 * Create a new event
 * @param {Object} eventData - Event details
 * @param {string} eventData.eventName - Name of the event
 * @param {string} eventData.eventDate - Date in YYYY-MM-DD format
 * @returns {Object} Response with created event data
 */
function createEvent(eventData) {
  try {
    logger.info('createEvent', 'Starting event creation', eventData);
    
    // Validate event name
    const nameValidation = validateEventName(eventData.eventName);
    if (!nameValidation.valid) {
      return { ok: false, error: nameValidation.error };
    }
    
    // Validate event date
    const dateValidation = validateEventDate(eventData.eventDate);
    if (!dateValidation.valid) {
      return { ok: false, error: dateValidation.error };
    }
    
    // Generate unique identifiers
    const eventId = generateEventId();
    const slug = generateSlug(nameValidation.value);
    
    // Generate URLs
    const baseUrl = CONFIG.BASE_URL;
    const publicUrl = `${baseUrl}?p=public&event=${slug}`;
    const displayUrl = `${baseUrl}?p=display&event=${slug}`;
    const posterUrl = `${baseUrl}?p=poster&event=${slug}`;
    
    // Save to spreadsheet
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME_EVENTS || 'Events') || initializeEventsSheet();
    
    const now = new Date().toISOString();
    const formattedDate = formatDateYMD(dateValidation.value);
    
    sheet.appendRow([
      eventId,
      nameValidation.value,
      slug,
      formattedDate,
      '',  // formId - empty until form created
      '',  // formUrl - empty until form created
      publicUrl,
      displayUrl,
      posterUrl,
      now,  // created
      now   // modified
    ]);
    
    logger.info('createEvent', 'Event created successfully', { 
      eventId, 
      eventName: nameValidation.value,
      slug 
    });
    
    return {
      ok: true,
      eventId,
      eventName: nameValidation.value,
      eventSlug: slug,
      eventDate: formattedDate,
      publicUrl,
      displayUrl,
      posterUrl,
      created: now
    };
    
  } catch (error) {
    logger.error('createEvent', error.message, { eventData });
    return { 
      ok: false, 
      error: `Failed to create event: ${error.message}` 
    };
  }
}

/**
 * Update an existing event
 * @param {string} eventId - Event ID
 * @param {Object} updates - Fields to update
 * @returns {Object} Response with ok status
 */
function updateEvent(eventId, updates) {
  try {
    if (!eventId) {
      return { ok: false, error: 'Event ID is required' };
    }
    
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME_EVENTS || 'Events');
    
    if (!sheet) {
      return { ok: false, error: 'Events sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Find event row
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === eventId) {
        const row = i + 1;
        
        // Update specific fields based on what's provided
        if (updates.eventName !== undefined) {
          sheet.getRange(row, 2).setValue(updates.eventName);
        }
        if (updates.eventSlug !== undefined) {
          sheet.getRange(row, 3).setValue(updates.eventSlug);
        }
        if (updates.eventDate !== undefined) {
          sheet.getRange(row, 4).setValue(updates.eventDate);
        }
        if (updates.formId !== undefined) {
          sheet.getRange(row, 5).setValue(updates.formId);
        }
        if (updates.formUrl !== undefined) {
          sheet.getRange(row, 6).setValue(updates.formUrl);
        }
        
        // Always update modified timestamp
        sheet.getRange(row, 11).setValue(new Date().toISOString());
        
        logger.info('updateEvent', 'Event updated', { eventId, updates });
        return { ok: true };
      }
    }
    
    return { ok: false, error: 'Event not found' };
    
  } catch (error) {
    logger.error('updateEvent', error.message, { eventId, updates });
    return { ok: false, error: String(error) };
  }
}

// ============================================
// GOOGLE FORMS INTEGRATION
// ============================================

/**
 * Create a Google Form for an event
 * @param {string} eventId - Event ID
 * @returns {Object} Response with form ID and URL
 */
function createGoogleForm(eventId) {
  try {
    logger.info('createGoogleForm', 'Starting form creation', { eventId });
    
    // Get event details
    const eventResult = getEvent(eventId);
    if (!eventResult.ok) {
      return { ok: false, error: 'Event not found' };
    }
    
    const event = eventResult.event;
    
    // Check if form already exists
    if (event.formId && event.formUrl) {
      logger.warn('createGoogleForm', 'Form already exists', { eventId, formId: event.formId });
      return {
        ok: true,
        formId: event.formId,
        formUrl: event.formUrl,
        message: 'Form already exists for this event'
      };
    }
    
    // Create the form
    const formTitle = `${event.eventName} - Registration`;
    const form = FormApp.create(formTitle);
    
    // Set form description
    form.setDescription(
      `Register for ${event.eventName} on ${event.eventDate}\\n\\n` +
      `Please fill out this form to register for the event. ` +
      `You will receive a confirmation email after submitting.`
    );
    
    // Configure form settings
    form.setAllowResponseEdits(true);
    form.setCollectEmail(true);
    form.setRequireLogin(false);
    form.setShowLinkToRespondAgain(true);
    
    // Add confirmation message
    form.setConfirmationMessage(
      `Thank you for registering for ${event.eventName}!\\n\\n` +
      `We'll send you a confirmation email shortly with event details.`
    );
    
    // Add form questions
    
    // 1. Full Name
    form.addTextItem()
      .setTitle('Full Name')
      .setHelpText('Please enter your first and last name')
      .setRequired(true);
    
    // 2. Email
    form.addTextItem()
      .setTitle('Email Address')
      .setHelpText('We\\'ll send confirmation and event updates to this email')
      .setRequired(true);
    
    // 3. Phone
    form.addTextItem()
      .setTitle('Phone Number')
      .setHelpText('Optional - for event day contact')
      .setRequired(false);
    
    // 4. Team Size
    form.addMultipleChoiceItem()
      .setTitle('How many people are registering?')
      .setChoices([
        form.createChoice('Solo (1 person)'),
        form.createChoice('Pair (2 people)'),
        form.createChoice('Team (3-4 people)'),
        form.createChoice('Group (5+ people)')
      ])
      .setRequired(true);
    
    // 5. Skill Level
    form.addMultipleChoiceItem()
      .setTitle('Bocce Experience Level')
      .setChoices([
        form.createChoice('Beginner - Never played'),
        form.createChoice('Novice - Played a few times'),
        form.createChoice('Intermediate - Regular player'),
        form.createChoice('Advanced - Competitive player')
      ])
      .setRequired(true);
    
    // 6. Dietary Restrictions (if event has food)
    form.addParagraphTextItem()
      .setTitle('Dietary Restrictions or Allergies')
      .setHelpText('Optional - Let us know if you have any dietary needs')
      .setRequired(false);
    
    // 7. Special Requests
    form.addParagraphTextItem()
      .setTitle('Special Requests or Questions')
      .setHelpText('Optional - Any other information we should know')
      .setRequired(false);
    
    // Get form ID and URL
    const formId = form.getId();
    const formUrl = form.getPublishedUrl();
    
    // Set up form destination (responses go to a sheet)
    try {
      const ss = getSpreadsheet();
      form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
      logger.info('createGoogleForm', 'Form destination set to spreadsheet');
    } catch (destError) {
      logger.warn('createGoogleForm', 'Could not set form destination', { error: destError.message });
      // Continue anyway - form will create its own response sheet
    }
    
    // Update event with form details
    const updateResult = updateEvent(eventId, {
      formId: formId,
      formUrl: formUrl
    });
    
    if (!updateResult.ok) {
      logger.error('createGoogleForm', 'Failed to update event with form details', { eventId });
    }
    
    logger.info('createGoogleForm', 'Form created successfully', { 
      eventId, 
      formId, 
      formUrl 
    });
    
    return {
      ok: true,
      formId,
      formUrl,
      message: 'Form created successfully'
    };
    
  } catch (error) {
    logger.error('createGoogleForm', error.message, { eventId });
    return { 
      ok: false, 
      error: `Failed to create form: ${error.message}` 
    };
  }
}

/**
 * Get response count for a form
 * @param {string} formId - Form ID
 * @returns {Object} Response with count
 */
function getFormResponseCount(formId) {
  try {
    if (!formId) {
      return { ok: false, error: 'Form ID is required', count: 0 };
    }
    
    const form = FormApp.openById(formId);
    const responses = form.getResponses();
    const count = responses.length;
    
    logger.debug('getFormResponseCount', `Form has ${count} responses`, { formId });
    
    return { 
      ok: true, 
      count,
      formId
    };
    
  } catch (error) {
    logger.error('getFormResponseCount', error.message, { formId });
    
    // If form not found, return 0 instead of error
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      return { 
        ok: false, 
        error: 'Form not found',
        count: 0 
      };
    }
    
    return { 
      ok: false, 
      error: String(error),
      count: 0 
    };
  }
}

// ============================================
// HEALTH CHECK
// ============================================

/**
 * System health check endpoint
 * Tests all critical system components
 * @returns {Object} Health status of all components
 */
function healthCheck() {
  try {
    const checks = {};
    const startTime = Date.now();
    
    // Check 1: Configuration
    try {
      checks.config = {
        status: typeof CONFIG !== 'undefined' ? 'healthy' : 'unhealthy',
        env: CONFIG?.ENV || 'unknown',
        version: CONFIG?.APP_VERSION || 'unknown'
      };
    } catch (e) {
      checks.config = {
        status: 'unhealthy',
        error: String(e)
      };
    }
    
    // Check 2: Spreadsheet Access
    try {
      const ss = getSpreadsheet();
      const latency = Date.now() - startTime;
      checks.spreadsheet = {
        status: 'healthy',
        latency: `${latency}ms`,
        name: ss.getName(),
        id: ss.getId()
      };
    } catch (e) {
      checks.spreadsheet = {
        status: 'unhealthy',
        error: String(e)
      };
    }
    
    // Check 3: Events Sheet
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(CONFIG.SHEET_NAME_EVENTS || 'Events');
      if (sheet) {
        const rowCount = sheet.getLastRow();
        checks.eventsSheet = {
          status: 'healthy',
          rows: rowCount - 1,  // Subtract header
          name: sheet.getName()
        };
      } else {
        checks.eventsSheet = {
          status: 'warning',
          message: 'Sheet does not exist yet (will be created on first use)'
        };
      }
    } catch (e) {
      checks.eventsSheet = {
        status: 'unhealthy',
        error: String(e)
      };
    }
    
    // Check 4: Script Properties
    try {
      const props = PropertiesService.getScriptProperties();
      const keys = props.getKeys();
      checks.scriptProperties = {
        status: 'healthy',
        count: keys.length,
        hasInstagram: keys.includes('INSTAGRAM_ACCESS_TOKEN')
      };
    } catch (e) {
      checks.scriptProperties = {
        status: 'degraded',
        error: String(e)
      };
    }
    
    // Check 5: Cache Service
    try {
      const cache = CacheService.getScriptCache();
      cache.put('health_check_test', 'ok', 10);
      const testValue = cache.get('health_check_test');
      checks.cache = {
        status: testValue === 'ok' ? 'healthy' : 'degraded',
        working: testValue === 'ok'
      };
    } catch (e) {
      checks.cache = {
        status: 'degraded',
        error: String(e)
      };
    }
    
    // Check 6: Lock Service
    try {
      const lock = LockService.getScriptLock();
      const locked = lock.tryLock(100);
      if (locked) {
        lock.releaseLock();
      }
      checks.locks = {
        status: 'healthy',
        available: locked
      };
    } catch (e) {
      checks.locks = {
        status: 'degraded',
        error: String(e)
      };
    }
    
    // Check 7: Form API
    try {
      // Just check if FormApp is available
      const canCreateForm = typeof FormApp !== 'undefined';
      checks.formApi = {
        status: canCreateForm ? 'healthy' : 'unhealthy',
        available: canCreateForm
      };
    } catch (e) {
      checks.formApi = {
        status: 'unhealthy',
        error: String(e)
      };
    }
    
    // Determine overall status
    const statusValues = Object.values(checks).map(check => check.status);
    const hasUnhealthy = statusValues.includes('unhealthy');
    const hasDegraded = statusValues.includes('degraded');
    const hasWarning = statusValues.includes('warning');
    
    let overall;
    if (hasUnhealthy) {
      overall = 'unhealthy';
    } else if (hasDegraded) {
      overall = 'degraded';
    } else if (hasWarning) {
      overall = 'warning';
    } else {
      overall = 'healthy';
    }
    
    const totalLatency = Date.now() - startTime;
    
    logger.info('healthCheck', `System health check completed: ${overall}`, {
      overall,
      latency: totalLatency
    });
    
    return {
      ok: true,
      overall,
      checks,
      timestamp: new Date().toISOString(),
      totalLatency: `${totalLatency}ms`,
      env: CONFIG?.ENV || 'unknown'
    };
    
  } catch (error) {
    logger.error('healthCheck', error.message);
    return {
      ok: false,
      overall: 'unhealthy',
      error: String(error),
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================
// VERIFICATION SUITE
// ============================================

/**
 * Run full verification suite for testing
 * Creates test event, form, verifies all components
 * @param {Object} options - Test options
 * @param {boolean} options.keep - Whether to keep test data (default: false)
 * @returns {Object} Test results
 */
function runVerificationSuite(options = {}) {
  const keep = options.keep || false;
  const results = {
    ok: true,
    checks: [],
    created: null,
    cleanup: null
  };
  
  let testEventId = null;
  let testFormId = null;
  
  try {
    // Test 1: Create Test Event
    try {
      const eventResult = createEvent({
        eventName: `Test Event ${Date.now()}`,
        eventDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]  // Tomorrow
      });
      
      if (eventResult.ok) {
        testEventId = eventResult.eventId;
        results.created = eventResult;
        results.checks.push({ ok: true, name: 'Create Event' });
      } else {
        results.checks.push({ ok: false, name: 'Create Event', error: eventResult.error });
        results.ok = false;
      }
    } catch (e) {
      results.checks.push({ ok: false, name: 'Create Event', error: String(e) });
      results.ok = false;
    }
    
    // Test 2: Get Events
    if (testEventId) {
      try {
        const eventsResult = getEvents();
        const foundEvent = eventsResult.events?.find(e => e.eventId === testEventId);
        results.checks.push({ 
          ok: foundEvent !== undefined, 
          name: 'Get Events',
          count: eventsResult.events?.length 
        });
      } catch (e) {
        results.checks.push({ ok: false, name: 'Get Events', error: String(e) });
        results.ok = false;
      }
    }
    
    // Test 3: Create Google Form
    if (testEventId) {
      try {
        const formResult = createGoogleForm(testEventId);
        if (formResult.ok) {
          testFormId = formResult.formId;
          results.checks.push({ ok: true, name: 'Create Google Form' });
        } else {
          results.checks.push({ ok: false, name: 'Create Google Form', error: formResult.error });
          results.ok = false;
        }
      } catch (e) {
        results.checks.push({ ok: false, name: 'Create Google Form', error: String(e) });
        results.ok = false;
      }
    }
    
    // Test 4: Form Response Count
    if (testFormId) {
      try {
        const countResult = getFormResponseCount(testFormId);
        results.checks.push({ 
          ok: countResult.ok, 
          name: 'Form Response Count',
          count: countResult.count 
        });
      } catch (e) {
        results.checks.push({ ok: false, name: 'Form Response Count', error: String(e) });
        results.ok = false;
      }
    }
    
    // Test 5: Health Check
    try {
      const healthResult = healthCheck();
      results.checks.push({ 
        ok: healthResult.overall !== 'unhealthy', 
        name: 'Health Check',
        status: healthResult.overall 
      });
    } catch (e) {
      results.checks.push({ ok: false, name: 'Health Check', error: String(e) });
      results.ok = false;
    }
    
    // Cleanup if requested
    if (!keep && testEventId) {
      try {
        // Delete test event
        const ss = getSpreadsheet();
        const sheet = ss.getSheetByName(CONFIG.SHEET_NAME_EVENTS || 'Events');
        if (sheet) {
          const data = sheet.getDataRange().getValues();
          for (let i = 1; i < data.length; i++) {
            if (data[i][0] === testEventId) {
              sheet.deleteRow(i + 1);
              break;
            }
          }
        }
        
        // Try to delete test form (optional - may fail if already deleted)
        if (testFormId) {
          try {
            const form = FormApp.openById(testFormId);
            DriveApp.getFileById(testFormId).setTrashed(true);
          } catch (formDeleteError) {
            // Ignore - form may not exist
          }
        }
        
        results.cleanup = { ok: true, message: 'Test data cleaned up' };
      } catch (cleanupError) {
        results.cleanup = { ok: false, error: String(cleanupError) };
      }
    }
    
    return results;
    
  } catch (error) {
    logger.error('runVerificationSuite', error.message);
    return {
      ok: false,
      error: String(error),
      checks: results.checks
    };
  }
}

// ============================================
// INSTALLATION NOTES
// ============================================

/*
TO ADD THESE FUNCTIONS TO YOUR PROJECT:

1. Open your Apps Script project
2. Open Code.gs
3. Scroll to the end of the file (before the final closing brace if there is one)
4. Copy all functions from this file
5. Paste at the end of Code.gs
6. Save

THEN:

7. Open the Apps Script editor
8. Go to Project Settings
9. Check that timezone is set to America/Chicago (or your timezone)
10. Run the function: initializeEventsSheet() from the editor to create the sheet
11. Run the function: validateConfig() to check configuration
12. Run the function: runVerificationSuite() to test everything

TROUBLESHOOTING:

If you get "CONFIG is not defined":
- Make sure Config.gs exists and is saved
- Try closing and reopening the Apps Script editor
- Run validateConfig() from Config.gs first

If you get "Cannot read property of undefined":
- Check that all include files exist and are named correctly
- Verify envBadge.html, Header.html, Styles.html all exist
- Check that file names are case-sensitive matches

If functions return empty data:
- Check that Events sheet was created (run initializeEventsSheet())
- Verify spreadsheet permissions
- Check logs: View > Logs in Apps Script editor
*/
