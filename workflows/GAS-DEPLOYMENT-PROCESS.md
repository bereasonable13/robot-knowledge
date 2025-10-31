# Google Apps Script Deployment Process
**Version:** 1.0  
**Last Updated:** 2025-10-31  
**Status:** ✅ VALIDATED IN PRODUCTION

---

## Purpose
This document defines the systematic process for deploying Google Apps Script (GAS) projects, particularly for ABC Event Manager. This eliminates repeated debugging cycles and ensures consistent, successful deployments.

---

## Critical Understanding: GAS Template System

### How GAS HTML Templates Work
1. **Server-side evaluation**: `<?!= include('File') ?>` runs on Google's servers BEFORE sending to browser
2. **Strict file matching**: `include('shared/EnvBadge')` fails if file isn't literally `shared/EnvBadge.html`
3. **No subdirectories**: GAS doesn't support directory structures in HTML includes - all files must be in root
4. **Silent failures**: Wrong includes → blank page in browser, NO console errors
5. **Case-sensitive**: 'Health' ≠ 'HealthCheck', 'envBadge' ≠ 'EnvBadge'

**Key principle:** Template evaluation happens SERVER-SIDE. Browser never sees the error.

---

## The 5 Common Failure Patterns

### 1. Wrong Include Paths (Most Common)
**Symptom:** Blank page, no browser console error  
**Cause:** `include('shared/File')` when file is actually `File.html` in root  
**Fix Pattern:**
```bash
# Find all broken includes
grep -r "include('.*\/.*')" *.html

# Fix with sed (use | delimiter to avoid escaping issues)
sed -i "s|include('shared/EnvBadge')|include('envBadge')|g" *.html
```

### 2. ALLOWED_PAGES Mismatch
**Symptom:** "Invalid page" error  
**Cause:** Config.gs ALLOWED_PAGES array doesn't match actual HTML filenames  
**Fix Pattern:**
```javascript
// Config.gs
ALLOWED_PAGES: [
  'Admin',        // Admin.html exists ✓
  'HealthCheck',  // HealthCheck.html exists ✓
  'Health'        // Health.html does NOT exist ✗
]
```

### 3. Non-existent Style/Component References
**Symptom:** Page loads but no styling, or blank page  
**Cause:** `include('Styles_Enhanced')` when only `Styles.html` exists  
**Fix:** Match include names to actual filenames exactly

### 4. CSS Syntax Errors
**Symptom:** Broken layout/styling  
**Cause:** Properties with spaces: `max - width`, `font - size`  
**Fix:**
```bash
grep -n "- [a-z]" *.html  # Find properties with spaces
sed -i 's/max - width/max-width/g' *.html
```

### 5. Missing doGet/include Functions
**Symptom:** Complete deployment failure  
**Cause:** Code.gs missing required functions  
**Always verify:** `doGet()` and `include()` exist in Code.gs

---

## Standard Deployment Process

### Pre-Flight Checklist
```bash
cd ~/americanbocceco/build

# 1. Verify all HTML files exist
ls -1 *.html | wc -l

# 2. Check Code.gs has required functions
grep -q "function doGet" Code.gs && echo "✅ doGet exists"
grep -q "function include" Code.gs && echo "✅ include exists"

# 3. Verify Config.gs structure
grep -A 10 "ALLOWED_PAGES:" Config.gs | grep -E "^  '" 

# 4. Run validation script
./validate.sh  # Must pass before deployment
```

### Validation Script (MANDATORY)
**File:** `validate.sh` (must be in project root)

```bash
#!/bin/bash
# Pre-deployment validation for GAS projects

ERRORS=0
WARNINGS=0

# 1. Check HTML files exist
[ $(ls -1 *.html 2>/dev/null | wc -l) -eq 0 ] && ((ERRORS++))

# 2. Check Code.gs functions
grep -q "function doGet" Code.gs || ((ERRORS++))
grep -q "function include" Code.gs || ((ERRORS++))

# 3. Validate include() references
INCLUDES=$(grep -hEo "include\('[^']+'\)" *.html | sed "s/include('\([^']*\)')/\1/" | sort -u)
while read inc; do
    [[ "$inc" == *"/"* ]] && ((WARNINGS++))  # Has path separator
    [ ! -f "${inc}.html" ] && ((ERRORS++))   # File doesn't exist
done <<< "$INCLUDES"

# 4. Check ALLOWED_PAGES matches files
PAGES=$(grep -A 20 "ALLOWED_PAGES:" Config.gs | sed 's/\/\/.*//' | grep -Eo "'[A-Za-z]+'" | tr -d "'")
while read page; do
    [ ! -f "${page}.html" ] && ((ERRORS++))
done <<< "$PAGES"

# 5. Check CSS syntax
grep -q "- [a-z]" *.html && ((ERRORS++))

[ $ERRORS -eq 0 ] && echo "✅ PASSED" && exit 0
echo "❌ FAILED - $ERRORS errors, $WARNINGS warnings"
exit 1
```

### Deployment Steps

```bash
# STEP 1: Validate
./validate.sh

# STEP 2: Only if validation passes
if [ $? -eq 0 ]; then
    clasp push
    clasp deploy
else
    echo "FIX ERRORS BEFORE DEPLOYING"
    exit 1
fi

# STEP 3: Test deployment
DEPLOYMENT_ID=$(clasp deployments | grep "AKfyc" | awk '{print $2}' | head -1)
echo "Test URLs:"
echo "https://script.google.com/macros/s/$DEPLOYMENT_ID/exec?p=Admin"
echo "https://script.google.com/macros/s/$DEPLOYMENT_ID/exec?p=HealthCheck"
```

---

## Fix Application Process

When validation fails, apply fixes in this order:

### 1. Fix Config.gs ALLOWED_PAGES (30 seconds)
```javascript
ALLOWED_PAGES: [
  'Admin',
  'Public', 
  'Display',
  'Poster',
  'Test',
  'HealthCheck',           // NOT 'Health'
  'AdminUnitTests',        // If file exists
  'AdminIntegrationTests', // If file exists
  'AdminContractTests',    // If file exists
  'MasterTestSuite'        // If file exists
]
```

### 2. Fix Include Paths (2 minutes)
```bash
# Find all includes with paths
grep -rn "include('.*\/.*')" *.html

# Fix pattern: remove directory prefixes
sed -i "s|include('shared/EnvBadge')|include('envBadge')|g" *.html
sed -i "s|include('components/Header')|include('Header')|g" *.html
sed -i "s|include('Styles_Enhanced_ABC')|include('Styles')|g" *.html

# Verify fixed
grep -c "include('.*\/.*')" *.html  # Should return 0
```

### 3. Fix CSS Syntax (1 minute)
```bash
# Find properties with spaces
grep -n "- [a-z]" *.html

# Fix common patterns
sed -i 's/max - width/max-width/g' *.html
sed -i 's/min - height/min-height/g' *.html
sed -i 's/font - size/font-size/g' *.html
```

### 4. Re-validate
```bash
./validate.sh  # Must pass before proceeding
```

---

## Troubleshooting Decision Tree

```
Deployment fails?
├─ Pages won't load at all
│  ├─ Check Code.gs has doGet()
│  └─ Check appsscript.json is valid JSON
│
├─ "Invalid page" error
│  └─ Check Config.gs ALLOWED_PAGES matches HTML filenames exactly
│
├─ Blank page (no error in console)
│  ├─ Check include() paths have no directory separators
│  ├─ Check included files actually exist
│  └─ Check file name case matches exactly
│
├─ Page loads but no styling
│  ├─ Check Styles.html included
│  └─ Check CSS properties don't have spaces (max - width)
│
└─ Page loads but components missing
   ├─ Check Header/envBadge included
   └─ Check include names match actual files
```

---

## Lessons Learned (2025-10-31 Deployment)

### What Went Wrong
1. Attempted to apply fixes without understanding GAS template system
2. Repeated same diagnostic steps multiple times
3. No validation script to catch errors pre-deployment
4. Applied fixes that didn't persist (sed commands failed silently)
5. Deployed broken code multiple times before validation

### What Worked
1. Creating inline Config.gs with cat/heredoc (reliable)
2. Using `sed -i "s|old|new|g"` with pipe delimiter (works for paths)
3. Verifying each fix before moving to next
4. Testing with grep after each sed operation
5. Systematic process: validate → fix → re-validate → deploy

### Key Insight
**GAS template evaluation is SERVER-SIDE.** Browser never sees the error. Wrong includes → blank page. This is the #1 source of confusion.

---

**Remember:** Validation before deployment is MANDATORY. No exceptions.