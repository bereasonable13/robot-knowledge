#!/bin/bash
# ABC Event Manager - Pre-Deployment Validation Script
# This script catches common configuration and file reference errors
# Location: Project root (~/americanbocceco/validate.sh)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/build" || { echo "❌ build/ directory not found"; exit 1; }

echo "🔍 ABC Event Manager - Pre-Deployment Validation"
echo "================================================"
echo ""

ERRORS=0
WARNINGS=0

# Color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ((ERRORS++))
}

warn() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS++))
}

ok() {
    echo -e "${GREEN}✅ $1${NC}"
}

info() {
    echo "ℹ️  $1"
}

# 1. Check that all HTML files exist
info "Checking HTML files exist..."
HTML_FILES=$(find . -maxdepth 1 -name "*.html" -type f | wc -l)
if [ "$HTML_FILES" -eq 0 ]; then
    error "No HTML files found"
else
    ok "Found $HTML_FILES HTML files"
fi

# 2. Check Code.gs exists and has required functions
info "Checking Code.gs..."
if [ ! -f "Code.gs" ]; then
    error "Code.gs not found"
else
    if ! grep -q "function doGet" Code.gs; then
        error "Code.gs missing doGet function"
    fi
    if ! grep -q "function include" Code.gs; then
        error "Code.gs missing include function"
    fi
    if grep -q "function doGet" Code.gs && grep -q "function include" Code.gs; then
        ok "Code.gs has required functions"
    fi
fi

# 3. Check Config.gs exists
info "Checking Config.gs..."
if [ ! -f "Config.gs" ]; then
    error "Config.gs not found"
else
    ok "Config.gs found"
fi

# 4. Extract and validate all include() calls
info "Validating include() references..."
INCLUDE_ERRORS=0

# Get all unique include calls
INCLUDES=$(grep -hEo "include\('[^']+'\)" *.html 2>/dev/null | sed "s/include('\([^']*\)')/\1/" | sort -u)

while IFS= read -r inc; do
    if [ -z "$inc" ]; then
        continue
    fi
    
    # Check if it has a path separator
    if [[ "$inc" == *"/"* ]]; then
        warn "Include uses path separator (Apps Script doesn't support directories): $inc"
        INCLUDE_ERRORS=1
    fi
    
    # Check if the file exists
    if [ ! -f "${inc}.html" ]; then
        error "Include references non-existent file: ${inc}.html"
        INCLUDE_ERRORS=1
    fi
done <<< "$INCLUDES"

if [ $INCLUDE_ERRORS -eq 0 ]; then
    ok "All include() references are valid"
fi

# 5. Check ALLOWED_PAGES matches actual files
info "Validating ALLOWED_PAGES configuration..."
if [ -f "Config.gs" ]; then
    # Extract ALLOWED_PAGES array (remove comments first)
    ALLOWED_PAGES=$(grep -A 20 "ALLOWED_PAGES:" Config.gs | sed 's/\/\/.*//' | grep -Eo "'[A-Za-z]+'" | tr -d "'" | grep -v "ALLOWED_PAGES")
    
    PAGES_ERRORS=0
    while IFS= read -r page; do
        if [ -z "$page" ]; then
            continue
        fi
        
        if [ ! -f "${page}.html" ]; then
            error "ALLOWED_PAGES references non-existent file: ${page}.html"
            PAGES_ERRORS=1
        fi
    done <<< "$ALLOWED_PAGES"
    
    if [ $PAGES_ERRORS -eq 0 ]; then
        ok "All ALLOWED_PAGES entries have corresponding HTML files"
    fi
fi

# 6. Check for common CSS errors
info "Checking for CSS syntax errors..."
CSS_ERRORS=0

# Check for properties with spaces
if grep -qn "max - width\|min - height\|font - size" *.html 2>/dev/null; then
    error "Found CSS properties with spaces (invalid syntax)"
    grep -n "max - width\|min - height\|font - size" *.html 2>/dev/null | head -3
    CSS_ERRORS=1
fi

if [ $CSS_ERRORS -eq 0 ]; then
    ok "No obvious CSS syntax errors found"
fi

# 7. Check for case-sensitive file reference issues
info "Checking for case sensitivity issues..."
CASE_ERRORS=0

# Common mistakes
if grep -q "envbadge\|Envbadge" *.html 2>/dev/null; then
    if [ -f "envBadge.html" ]; then
        warn "Found lowercase 'envbadge' reference but file is 'envBadge.html'"
        CASE_ERRORS=1
    fi
fi

if [ $CASE_ERRORS -eq 0 ]; then
    ok "No case sensitivity issues found"
fi

# 8. Check for consistent naming of NUSDK
info "Checking NUSDK references..."
if [ -f "NUSDK.html" ]; then
    NUSDK_REFS=$(grep -c "include('NUSDK')" *.html 2>/dev/null || echo "0")
    WRONG_REFS=$(grep -c "include('nusdk')\|include('NuSDK')" *.html 2>/dev/null || echo "0")
    
    if [ "$WRONG_REFS" -gt 0 ]; then
        warn "Found incorrect NUSDK references (should be 'NUSDK')"
    else
        ok "NUSDK references are consistent"
    fi
fi

# 9. Verify no TODO or FIXME comments with CRITICAL tag
info "Checking for critical TODOs..."
CRITICAL_TODOS=$(grep -n "CRITICAL\|FIXME.*URGENT" *.html *.gs 2>/dev/null | wc -l)
if [ "$CRITICAL_TODOS" -gt 0 ]; then
    warn "Found $CRITICAL_TODOS critical TODO/FIXME comments"
fi

# 10. Check appsscript.json is valid JSON
info "Validating appsscript.json..."
if [ -f "appsscript.json" ]; then
    if ! python3 -m json.tool appsscript.json > /dev/null 2>&1; then
        error "appsscript.json is not valid JSON"
    else
        ok "appsscript.json is valid JSON"
    fi
fi

# Summary
echo ""
echo "================================================"
echo "Validation Summary"
echo "================================================"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "Your codebase is ready for deployment."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  PASSED WITH WARNINGS${NC}"
    echo ""
    echo "Errors: 0"
    echo "Warnings: $WARNINGS"
    echo ""
    echo "You can deploy, but consider addressing the warnings."
    exit 0
else
    echo -e "${RED}❌ VALIDATION FAILED${NC}"
    echo ""
    echo "Errors: $ERRORS"
    echo "Warnings: $WARNINGS"
    echo ""
    echo "FIX ALL ERRORS BEFORE DEPLOYING!"
    exit 1
fi