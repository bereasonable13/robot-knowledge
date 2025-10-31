# Robot Knowledge - Deployment Process Summary

## Google Apps Script Deployment - Lessons from 2025-10-31

### The Problem
Deployment kept failing with:
- Blank pages (no error in browser console)
- "Invalid page" errors
- Broken styling
- Wrong include paths

### Root Cause
**GAS template evaluation is SERVER-SIDE.** Wrong includes → blank page in browser. No console error because template fails on Google's servers, not in browser.

### The Fix Pattern
1. **Validate first** - Use gas-validate.sh
2. **Fix Config.gs** - ALLOWED_PAGES must match HTML filenames exactly
3. **Fix includes** - No directory prefixes (no `shared/` or `components/`)
4. **Fix CSS** - No spaces in properties (`max-width` not `max - width`)
5. **Re-validate** - Must pass before deploying
6. **Deploy** - `clasp push && clasp deploy`

### Files
- [Full Process](workflows/GAS-DEPLOYMENT-PROCESS.md)
- [Validation Script](scripts/gas-validate.sh)

### Quick Reference
```bash
# Common fixes
sed -i "s|include('shared/EnvBadge')|include('envBadge')|g" *.html
sed -i 's/max - width/max-width/g' *.html

# Validate before deploy (MANDATORY)
./gas-validate.sh && clasp push && clasp deploy
```

### Key Insight
**Never deploy without validation.** The validation script catches 95% of deployment failures before they reach production.

---
For complete documentation, see [workflows/GAS-DEPLOYMENT-PROCESS.md](workflows/GAS-DEPLOYMENT-PROCESS.md)