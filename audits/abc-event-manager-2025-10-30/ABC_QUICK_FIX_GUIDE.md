# ABC EVENT MANAGER - QUICK FIX GUIDE
## Immediate Fixes Required Before Testing

---

## FIX #1: Fix Include Paths (CRITICAL)

### Files to Update:

**HealthCheck.html:**
```html
<!-- LINE 8 - Change FROM: -->
<?!= include('Styles'); ?>

<!-- TO: -->
<?!= include('Styles'); ?>
<!-- Note: This should work if file is named Styles.html -->

<!-- LINE 11 - Change FROM: -->
<?!= include('shared/EnvBadge'); ?>

<!-- TO: -->
<?!= include('envBadge'); ?>
```

**Public.html:**
```html
<!-- LINE 6 - Change FROM: -->
<?!= include('Styles_Enhanced_ABC'); ?>

<!-- TO: -->
<?!= include('Styles'); ?>
<!-- OR create a file named Styles_Enhanced_ABC.html with enhanced styles -->

<!-- LINE 11 - Change FROM: -->
<?!= include('shared/EnvBadge'); ?>

<!-- TO: -->
<?!= include('envBadge'); ?>
```

**Display.html:**
```html
<!-- LINE 8 - Change FROM: -->
<?!= include('Styles_Enhanced_ABC'); ?>

<!-- TO: -->
<?!= include('Styles'); ?>
<!-- OR create Styles_Enhanced_ABC.html -->
```

**Test.html:**
```html
<!-- LINE 1 - Fix DOCTYPE - Change FROM: -->
< !DOCTYPE html>

<!-- TO: -->
<!DOCTYPE html>

<!-- LINE 69 - Change FROM: -->
<?!= include('shared/EnvBadge'); ?>

<!-- TO: -->
<?!= include('envBadge'); ?>
```

---

## FIX #2: Create Config.gs File (CRITICAL)

**Steps:**
1. In Apps Script Editor: File > New > Script file
2. Name it: `Config`
3. Copy entire contents from `Config.gs` file provided
4. Update `BASE_URL` on line 37 with your actual deployment URL
5. Save

**Getting your BASE_URL:**
1. Click "Deploy" > "Test deployments"
2. Or "Deploy" > "Manage deployments"
3. Copy the Web app URL
4. Paste into Config.gs line 37

---

## FIX #3: Add Missing Backend Functions (CRITICAL)

**Steps:**
1. Open `Code.gs` in Apps Script Editor
2. Scroll to the very end of the file (around line 1141)
3. Before the final closing brace `}` (if there is one), add a blank line
4. Copy entire contents from `Code_MissingFunctions.gs` file provided
5. Paste at the end
6. Save

**Functions being added:**
- `initializeEventsSheet()`
- `getEvents()`
- `getEvent(eventId)`
- `createEvent(eventData)`
- `updateEvent(eventId, updates)`
- `createGoogleForm(eventId)`
- `getFormResponseCount(formId)`
- `healthCheck()`
- `runVerificationSuite(options)`

---

## FIX #4: Initialize the Spreadsheet (REQUIRED)

**After adding Config.gs and missing functions:**

1. In Apps Script Editor, select function dropdown (next to bug icon)
2. Choose: `initializeEventsSheet`
3. Click Run (▶ icon)
4. Authorize the script if prompted
5. Check Execution log - should see "Events sheet created"

**Verify it worked:**
- Open your Google Spreadsheet
- You should see a new sheet named "Events" with headers in red

---

## FIX #5: Verify Configuration (RECOMMENDED)

1. In Apps Script Editor, select function dropdown
2. Choose: `validateConfig`
3. Click Run (▶ icon)
4. Check Execution log (View > Logs)
5. Fix any issues reported

**Common issues:**
- ❌ BASE_URL not set → Update Config.gs line 37
- ⚠️ DEBUG_MODE true in PROD → Set to false for production
- ⚠️ INSTAGRAM enabled but no token → Disable or add token

---

## FIX #6: Run Verification Suite (TESTING)

**After all above fixes:**

1. In Apps Script Editor, select function dropdown
2. Choose: `runVerificationSuite`
3. Click Run (▶ icon)
4. Check Execution log
5. Look for "All checks passed" or identify failures

**What it tests:**
- ✓ Create Event
- ✓ Get Events
- ✓ Create Google Form
- ✓ Form Response Count
- ✓ Health Check

**By default, test data is cleaned up automatically.**

To keep test data for inspection:
```javascript
// In Apps Script Editor, run this in Console:
runVerificationSuite({ keep: true })
```

---

## FIX #7: Deploy and Test

### Test Deployment:
1. Click "Deploy" > "Test deployments"
2. Click "Install" (in the popup)
3. Copy the Web app URL
4. Open URL in browser
5. Add `?page=admin` to URL
6. Test functionality

### Production Deployment:
1. Update Config.gs:
   - Set ENV to 'PROD'
   - Set DEBUG_MODE to false
   - Set SHOW_DETAILED_ERRORS to false
2. Save all files
3. Click "Deploy" > "New deployment"
4. Choose type: "Web app"
5. Description: "ABC Event Manager v5.0.4"
6. Execute as: "Me"
7. Who has access: "Anyone"
8. Deploy
9. Copy deployment URL
10. Update BASE_URL in Config.gs
11. Save and redeploy

---

## VERIFICATION CHECKLIST

After making all fixes, verify:

**Backend:**
- [ ] Config.gs file exists and is saved
- [ ] BASE_URL is set correctly
- [ ] All missing functions added to Code.gs
- [ ] Events sheet created in spreadsheet
- [ ] validateConfig() runs without critical errors
- [ ] runVerificationSuite() passes all tests

**Frontend:**
- [ ] All include() paths are correct
- [ ] Test.html DOCTYPE is fixed
- [ ] No console errors on page load
- [ ] Pages render correctly

**Deployment:**
- [ ] Test deployment works
- [ ] Admin page loads
- [ ] Can create events
- [ ] Can create forms
- [ ] QR codes generate
- [ ] Links work

---

## TESTING URLS

After deploying, test these pages:

```
https://YOUR-DEPLOYMENT-URL/exec?page=admin
https://YOUR-DEPLOYMENT-URL/exec?page=public
https://YOUR-DEPLOYMENT-URL/exec?page=display
https://YOUR-DEPLOYMENT-URL/exec?page=test
https://YOUR-DEPLOYMENT-URL/exec?page=health
```

Replace `YOUR-DEPLOYMENT-URL` with your actual deployment URL.

---

## COMMON ERRORS AND SOLUTIONS

### Error: "CONFIG is not defined"
**Solution:** Create Config.gs file, save, and refresh editor

### Error: "Cannot find function createEvent"
**Solution:** Add missing functions from Code_MissingFunctions.gs

### Error: "include(...) failed"
**Solution:** Fix all include() paths as shown in Fix #1

### Error: "Cannot read property 'ENV' of undefined"
**Solution:** Config.gs not loaded. Close and reopen editor.

### Error: "Events sheet not found"
**Solution:** Run initializeEventsSheet() function

### Error: "Form creation failed"
**Solution:** Check Apps Script authorization, may need to reauthorize

### Error: "Rate limit exceeded"
**Solution:** Wait 60 seconds, or increase RATE_LIMIT_MAX_REQUESTS in Config

---

## FILE STRUCTURE CHECKLIST

Make sure these files exist in Apps Script:

**Required Files:**
- [ ] Config.gs (NEW - must create)
- [ ] Code.gs (EXISTING - must add functions)
- [ ] Admin.html
- [ ] Public.html
- [ ] Display.html
- [ ] Poster.html
- [ ] Test.html
- [ ] Health.html
- [ ] Header.html
- [ ] Styles.html
- [ ] envBadge.html
- [ ] NUSDK.html
- [ ] appsscript.json

**Optional Files:**
- [ ] Styles_Enhanced_ABC.html (if using enhanced styles)

---

## POST-FIX TESTING PROCEDURE

1. **Run Backend Tests:**
   ```javascript
   // In Apps Script Console
   validateConfig()
   runVerificationSuite()
   healthCheck()
   ```

2. **Test Admin Page:**
   - Load admin page
   - Create a test event
   - Verify event appears in dropdown
   - Create Google Form
   - Verify QR code generates
   - Check all links work

3. **Test Public Page:**
   - Load public page with event parameter
   - Verify styling matches ABC brand
   - Test on mobile device
   - Check responsiveness

4. **Test Display Page:**
   - Load display page
   - Verify carousel auto-advances
   - Check all content types appear
   - Let run for 5 minutes to verify stability

5. **Test Health Page:**
   - Load health page
   - Verify all checks are "healthy"
   - Check auto-refresh works

---

## GETTING HELP

If you encounter issues:

1. **Check Execution Logs:**
   - Apps Script Editor > View > Logs
   - Look for ERROR level messages

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for red error messages

3. **Verify File Names:**
   - All include() filenames must match EXACTLY
   - File names are case-sensitive

4. **Check Permissions:**
   - Apps Script may need reauthorization
   - Check spreadsheet permissions

5. **Review Audit Report:**
   - See ABC_CODEBASE_AUDIT_REPORT.md
   - Check specific error messages

---

## SUCCESS CRITERIA

You'll know fixes are complete when:

✅ Admin page loads without errors  
✅ Can create events  
✅ Can create Google Forms  
✅ QR codes generate  
✅ All links copy to clipboard  
✅ Health check shows "healthy"  
✅ Test suite passes all checks  
✅ Mobile responsive  
✅ No console errors  

---

## TIME ESTIMATE

**Total time for all fixes:** 30-60 minutes

Breakdown:
- Create Config.gs: 5 minutes
- Fix include paths: 10 minutes
- Add missing functions: 5 minutes
- Initialize spreadsheet: 2 minutes
- Test and verify: 10-20 minutes
- Deploy: 5-10 minutes

---

## NEXT STEPS AFTER FIXES

Once all critical fixes are complete:

1. **Sprint 1 (High Priority):**
   - Mobile-first CSS improvements
   - Error handling standardization
   - Performance optimizations

2. **Sprint 2 (Polish):**
   - Accessibility features
   - Better loading states
   - Rate limiting refinements

3. **Sprint 3 (Enhancement):**
   - Real Instagram integration
   - Analytics
   - Advanced features

See full roadmap in ABC_CODEBASE_AUDIT_REPORT.md