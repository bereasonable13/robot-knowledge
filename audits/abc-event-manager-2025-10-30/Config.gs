/**
 * AMERICAN BOCCE CO. EVENT MANAGER - CONFIGURATION
 * Version: 5.0.4
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Copy this entire file
 * 2. In Apps Script editor, create new file: File > New > Script file
 * 3. Name it: Config
 * 4. Paste this content
 * 5. Update BASE_URL with your deployment URL
 * 6. Set ENV to 'PROD' for production, 'QA' for testing
 * 7. Save
 */

const CONFIG = {
  // ============================================
  // ENVIRONMENT SETTINGS
  // ============================================
  ENV: 'QA',  // 'QA' or 'PROD' - Set to 'PROD' for production deployment
  DEBUG_MODE: true,  // Set to false in production for performance
  
  // ============================================
  // APPLICATION INFO
  // ============================================
  APP_NAME: 'American Bocce Co. Event Manager',
  APP_VERSION: '5.0.4',
  BUILD_ID: `build-${new Date().toISOString().split('T')[0]}`,
  
  // ============================================
  // DEPLOYMENT URLS
  // ============================================
  // IMPORTANT: Update this with your actual deployment URL!
  // Get from: Deploy > Test deployments or Deploy > Manage deployments
  BASE_URL: 'https://script.google.com/macros/s/AKfycbyVyi7HYVWwO8naX7ygHIISKqNebAjlcxwXcCCTn0gZ-xb82udG4LTO7giEApGF_vJT0Q/exec',
  
  // ============================================
  // PAGE CONFIGURATION
  // ============================================
  DEFAULT_PAGE: 'Admin',
  ALLOWED_PAGES: [
    'Admin',    // Main event management interface
    'Public',   // Public-facing event viewer
    'Display',  // TV display / carousel
    'Poster',   // Event poster generator
    'Test',     // Automated test suite
    'Health'    // System health check
  ],
  
  // ============================================
  // VALIDATION RULES
  // ============================================
  // Event Name Validation
  EVENT_NAME_MIN_LENGTH: 3,      // Minimum characters for event name
  EVENT_NAME_MAX_LENGTH: 100,    // Maximum characters for event name
  
  // Event Date Validation
  EVENT_DATE_MIN_YEAR: 2020,           // Earliest year allowed
  EVENT_DATE_MAX_YEARS_AHEAD: 5,       // Maximum years in future
  
  // Form Validation
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,  // Basic email validation
  PHONE_REGEX: /^[\d\s\-\(\)]+$/,             // Basic phone validation
  
  // ============================================
  // FEATURE FLAGS
  // ============================================
  ENABLE_INSTAGRAM: false,        // Set true when Instagram API configured
  ENABLE_ANALYTICS: false,        // Set true when analytics configured
  ENABLE_RATE_LIMITING: true,     // Recommend keeping true
  ENABLE_CACHING: true,           // Recommend keeping true
  ENABLE_NOTIFICATIONS: false,    // Set true when email notifications configured
  
  // ============================================
  // BRANDING
  // ============================================
  BRAND_NAME: 'American Bocce Co.',
  BRAND_SHORT_NAME: 'ABC',
  ORG_NAME: 'American Bocce Co.',
  BRAND_COLOR: '#c8102e',         // ABC Red
  BRAND_COLOR_DARK: '#a00d25',
  
  // ============================================
  // RATE LIMITING
  // ============================================
  RATE_LIMIT_WINDOW_MS: 60000,    // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100,   // Max requests per window
  
  // ============================================
  // CACHING
  // ============================================
  CACHE_DURATION_SHORT: 300,      // 5 minutes
  CACHE_DURATION_MEDIUM: 1800,    // 30 minutes
  CACHE_DURATION_LONG: 3600,      // 1 hour
  
  // ============================================
  // EXTERNAL SERVICES
  // ============================================
  // Instagram API (configure in Script Properties)
  // Set these in: Project Settings > Script Properties > Add property
  // Property Name: INSTAGRAM_ACCESS_TOKEN, Value: your_token
  // Property Name: INSTAGRAM_USER_ID, Value: your_user_id
  
  // QR Code Service
  QR_CODE_SERVICE: 'qrserver',    // 'qrserver' or 'local' (if using QRCode.js)
  QR_CODE_SIZE: 300,              // Default QR code size in pixels
  
  // ============================================
  // DISPLAY CONFIGURATION
  // ============================================
  DISPLAY_SLIDE_DURATION: 5000,   // Milliseconds per slide
  DISPLAY_TRANSITION_DURATION: 800, // Milliseconds for transitions
  
  // Content Weights (for Display carousel)
  DISPLAY_INSTAGRAM_WEIGHT: 10,   // Number of Instagram slides
  DISPLAY_LEAGUE_WEIGHT: 30,      // Number of League slides
  DISPLAY_TOURNAMENT_WEIGHT: 20,  // Number of Tournament slides
  
  // ============================================
  // SPREADSHEET CONFIGURATION
  // ============================================
  SHEET_NAME_EVENTS: 'Events',
  SHEET_NAME_FORMS: 'Form Responses',
  SHEET_NAME_LOGS: 'System Logs',
  
  // ============================================
  // LOGGING
  // ============================================
  LOG_LEVEL: 'INFO',  // 'DEBUG', 'INFO', 'WARN', 'ERROR'
  LOG_TO_SHEET: false,  // Set true to log to spreadsheet
  LOG_MAX_ENTRIES: 1000, // Max log entries before cleanup
  
  // ============================================
  // SECURITY
  // ============================================
  ENABLE_INPUT_SANITIZATION: true,  // Always keep true
  ENABLE_XSS_PROTECTION: true,      // Always keep true
  MAX_INPUT_LENGTH: 10000,          // Maximum input length (characters)
  
  // ============================================
  // ERROR HANDLING
  // ============================================
  SHOW_DETAILED_ERRORS: true,  // Set false in production
  ERROR_EMAIL_NOTIFY: false,   // Set true to email errors
  ERROR_EMAIL_ADDRESS: '',     // Email for error notifications
  
  // ============================================
  // TIMEZONE
  // ============================================
  TIMEZONE: 'America/Chicago',  // Used for date formatting
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: '12h',  // '12h' or '24h'
};

// ============================================
// CONFIGURATION VALIDATION
// ============================================
// Run this function to validate your configuration
function validateConfig() {
  const issues = [];
  
  // Check required fields
  if (!CONFIG.BASE_URL || CONFIG.BASE_URL.includes('YOUR_DEPLOYMENT_ID')) {
    issues.push('❌ BASE_URL not set! Update with your deployment URL.');
  }
  
  if (!['QA', 'PROD'].includes(CONFIG.ENV)) {
    issues.push('❌ ENV must be either "QA" or "PROD"');
  }
  
  if (CONFIG.ENV === 'PROD' && CONFIG.DEBUG_MODE) {
    issues.push('⚠️ DEBUG_MODE should be false in production');
  }
  
  if (CONFIG.ENV === 'PROD' && CONFIG.SHOW_DETAILED_ERRORS) {
    issues.push('⚠️ SHOW_DETAILED_ERRORS should be false in production');
  }
  
  // Check feature flags
  if (CONFIG.ENABLE_INSTAGRAM) {
    const props = PropertiesService.getScriptProperties();
    if (!props.getProperty('INSTAGRAM_ACCESS_TOKEN')) {
      issues.push('⚠️ INSTAGRAM enabled but INSTAGRAM_ACCESS_TOKEN not set in Script Properties');
    }
  }
  
  // Check rate limits
  if (CONFIG.RATE_LIMIT_MAX_REQUESTS < 10) {
    issues.push('⚠️ RATE_LIMIT_MAX_REQUESTS seems too low (< 10)');
  }
  
  // Report
  if (issues.length === 0) {
    Logger.log('✅ Configuration validation passed!');
    Logger.log(`Environment: ${CONFIG.ENV}`);
    Logger.log(`Debug Mode: ${CONFIG.DEBUG_MODE}`);
    Logger.log(`Base URL: ${CONFIG.BASE_URL}`);
    return { ok: true, message: 'Configuration valid' };
  } else {
    Logger.log('❌ Configuration validation failed:');
    issues.forEach(issue => Logger.log(issue));
    return { ok: false, issues: issues };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get configuration value safely
 * @param {string} key - Configuration key
 * @param {*} defaultValue - Default value if key not found
 * @returns {*} Configuration value
 */
function getConfig(key, defaultValue = null) {
  return CONFIG.hasOwnProperty(key) ? CONFIG[key] : defaultValue;
}

/**
 * Check if we're in production
 * @returns {boolean} True if production environment
 */
function isProduction() {
  return CONFIG.ENV === 'PROD';
}

/**
 * Check if we're in QA/test environment
 * @returns {boolean} True if QA environment
 */
function isQA() {
  return CONFIG.ENV === 'QA';
}

/**
 * Check if debug mode is enabled
 * @returns {boolean} True if debug mode enabled
 */
function isDebug() {
  return CONFIG.DEBUG_MODE === true;
}

// ============================================
// DEPLOYMENT CHECKLIST
// ============================================
/*
BEFORE DEPLOYING TO PRODUCTION:

□ Update BASE_URL with production deployment URL
□ Set ENV to 'PROD'
□ Set DEBUG_MODE to false
□ Set SHOW_DETAILED_ERRORS to false
□ Configure Instagram API keys (if using)
□ Test all functionality in QA environment
□ Run validateConfig() and ensure it passes
□ Review security settings
□ Set up error notifications (if desired)
□ Document deployment date and version
□ Create backup of current production deployment
□ Test rollback procedure

POST-DEPLOYMENT:
□ Verify health check endpoint works
□ Test admin functionality
□ Verify public pages render correctly
□ Check mobile responsiveness
□ Monitor logs for errors
□ Verify rate limiting works
□ Test form creation and submissions
□ Validate QR code generation
*/