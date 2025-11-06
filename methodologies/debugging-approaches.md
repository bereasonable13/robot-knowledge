# Debugging Approaches: When to Use Holistic vs. File-by-File Thinking

**Last Updated:** 2025-11-05
**Context:** Learned from NextUp deployment debugging session

## Core Principle

> "Do not look at these as individual files but as the deployment process as a whole, taking all the files into account and how they all should be configured." - Matt

**BUT:** Sometimes file-by-file IS the right approach.

The key is knowing WHEN to use which approach.

---

## Decision Framework

### Use HOLISTIC/SYSTEMATIC Thinking When:

1. **System Integration Issues**
   - Deployment pipelines failing
   - Multiple components not talking to each other
   - Configuration mismatches across files
   - "It works locally but fails in CI/CD"

2. **Architecture/Design Questions**
   - How should components be connected?
   - What's the data flow through the system?
   - Where should business logic live?
   - Multi-brand/multi-tenant architecture

3. **Performance Issues**
   - System is slow (need to see full request path)
   - Looking for bottlenecks (trace through entire flow)
   - Caching strategy (affects multiple layers)

4. **Security/Permissions**
   - Access control across system
   - Authentication flow
   - API key management

5. **Unknown Root Cause**
   - Error message is vague
   - Symptoms appear in multiple places
   - Not clear which component is actually failing

---

### Use FILE-BY-FILE/DETAILED Thinking When:

1. **Specific Bug in Known Location**
   - Function returns wrong value
   - UI element not rendering correctly
   - Known typo or logic error

2. **Code Review**
   - Reviewing specific changes
   - Checking implementation details
   - Validating business logic

3. **Feature Implementation**
   - Adding new function to existing file
   - Modifying specific component
   - Clear scope, single responsibility

4. **Syntax/Linting Errors**
   - Missing semicolon
   - Undefined variable
   - Type errors

5. **Documentation**
   - Writing function documentation
   - Explaining specific code section
   - Creating inline comments

---

## Real Examples from NextUp Debugging

### Example 1: Holistic Approach (Deployment Failure)

**Symptom:** GitHub Actions failing with "Code.js missing"

**Wrong Approach (File-by-File):**
```
1. Look at GitHub Actions workflow
2. See it calls npm run verify
3. Ask to see package.json
4. See it calls node scripts/verify-deployment.js
5. Ask to see verify-deployment.js
6. Find the problem
Result: 4-5 back-and-forth exchanges, 8-10 minutes
```

**Right Approach (Holistic):**
```bash
# Get EVERYTHING about deployment system at once
cat package.json                                    # Build scripts
cat .clasp.json                                     # Deployment config
cat verify-deployment.js                            # Verification logic
grep -r "Code\.js\|Config\.js" .github/ scripts/   # Find ALL references

Result: 1 exchange, problem found in grep output line 4, 2 minutes
```

**Why Holistic Won:**
- Problem was in system INTEGRATION (renamed files, but verification script not updated)
- Needed to see CONNECTIONS between components
- grep pattern search revealed the mismatch instantly

---

### Example 2: File-by-File Approach (Function Logic Bug)

**Symptom:** Event creation succeeds but wrong date format saved

**Right Approach (File-by-File):**
```javascript
// Problem is isolated to one function
function clientCreateEvent(eventData) {
  // Look at this specific function
  // Check date handling
  // Fix the format conversion
  // Test
}

Result: Quick, focused fix
```

**Wrong Approach (Holistic):**
- Looking at entire deployment pipeline
- Checking database schema
- Reviewing all date-handling code across system
- WASTE OF TIME - problem is isolated

**Why File-by-File Won:**
- Problem location known (clientCreateEvent)
- Scope limited (date formatting)
- Single responsibility (one function)

---

## Decision Tree

```
START: You encounter an issue
│
├─ Do you know EXACTLY which file/function has the problem?
│  ├─ YES → Use File-by-File
│  │       (Quick fix, focused scope)
│  │
│  └─ NO → Continue to next question
│
├─ Does the problem involve multiple components?
│  ├─ YES → Use Holistic
│  │       (System integration issue)
│  │
│  └─ NO → Continue to next question
│
├─ Is it a deployment/build/CI/CD issue?
│  ├─ YES → Use Holistic
│  │       (Pipeline issues need full system view)
│  │
│  └─ NO → Continue to next question
│
├─ Does error message point to specific line of code?
│  ├─ YES → Use File-by-File
│  │       (Isolated error)
│  │
│  └─ NO → Use Holistic
│          (Root cause unknown, need system view)
```

---

## Commands for Each Approach

### Holistic Investigation Commands

```bash
# 1. System Configuration Scan
cat package.json .clasp.json tsconfig.json
find . -name "*.config.js" -o -name "*.config.json"

# 2. Pattern Search Across Codebase
grep -r "pattern" src/ tests/ scripts/ .github/
find . -name "*.js" -exec grep -l "pattern" {} \;

# 3. Dependency Chain
npm ls | grep "package-name"
git log --all -- path/to/file  # See history

# 4. File Structure Overview
tree -L 3 -I 'node_modules'
ls -laR src/ | grep -E "\.js$|\.gs$"

# 5. Git History (what changed together?)
git log --oneline --name-only | head -50
git diff HEAD~5..HEAD --stat
```

### File-by-File Investigation Commands

```bash
# 1. Specific File Inspection
cat src/specific-file.js
grep -n "function_name" src/specific-file.js

# 2. Function Location
grep -n "function createEvent" src/*.js

# 3. Specific Line Context
sed -n '150,200p' src/file.js  # Lines 150-200

# 4. Single File History
git log -p src/specific-file.js

# 5. Blame (who wrote this line?)
git blame src/file.js -L 150,200
```

---

## Red Flags That Signal "Switch Approaches"

### Switch FROM File-by-File TO Holistic When:

1. **You're on your 3rd file and still don't understand the problem**
   - Stop drilling down
   - Zoom out to system level

2. **The "fix" in one file breaks something else**
   - Integration issue
   - Need to see dependencies

3. **Multiple files have similar code**
   - DRY principle violated
   - Architecture problem

4. **You keep asking "what calls this?"**
   - Following execution path
   - Need system trace

### Switch FROM Holistic TO File-by-File When:

1. **You've identified the specific component**
   - Root cause isolated
   - Focus on implementation

2. **System scan shows everything configured correctly except one thing**
   - Single anomaly found
   - Dig into that specific file

3. **All roads lead to one function**
   - Common failure point
   - Detailed logic review needed

---

## Efficiency Metrics

**From NextUp Debugging Session:**

| Approach | Exchanges | Time | When to Use |
|----------|-----------|------|-------------|
| Holistic | 1 | 2 min | System integration, unknown root cause |
| File-by-File | 4-5 | 8-10 min | When used incorrectly for system issues |
| File-by-File | 1 | 2 min | When used correctly for isolated bugs |

**Key Insight:** Using the WRONG approach is 4-5x slower than using the RIGHT approach.

---

## Best Practices

### For Holistic Debugging:

1. **Ask for everything at once**
   - All config files
   - All relevant scripts
   - Pattern searches across codebase

2. **Use grep/find extensively**
   - Find ALL references to pattern
   - Don't assume you know where things are

3. **Look for CONNECTIONS**
   - How do components talk?
   - Where are configurations referenced?
   - What depends on what?

4. **Draw the flow**
   - Build → Test → Deploy pipeline
   - User request → Backend → Database
   - Component A → Component B → Component C

### For File-by-File Debugging:

1. **Narrow scope aggressively**
   - Read ONLY relevant function
   - Ignore surrounding code
   - Focus on single responsibility

2. **Test incrementally**
   - Change one thing
   - Test
   - Confirm fix

3. **Don't get distracted**
   - Stay in scope
   - Resist urge to "cleanup while here"
   - Fix the bug, then refactor

---

## Matt's Philosophy Applied

> "I am expecting you to be combing through the details, not me."

**Translates to:**

**For Holistic Issues:**
- Claude gathers ALL relevant files in ONE request
- Claude runs grep/find to see ENTIRE pattern
- Claude presents COMPLETE diagnosis
- Matt makes decision, Claude executes

**For File-by-File Issues:**
- Claude identifies EXACT file/function
- Claude shows SPECIFIC problem
- Claude provides FOCUSED fix
- No wandering through codebase

---

## Anti-Patterns to Avoid

### ❌ Holistic Overkill
```
User: "Function returns undefined"
Claude: "Let me see your entire codebase architecture..."
```
**Why bad:** Isolated bug, file-by-file would be faster

### ❌ File-by-File Tunnel Vision
```
User: "Deployment failing"
Claude: "Show me deploy.yml"
[3 exchanges later]
Claude: "Now show me package.json"
[2 exchanges later]
Claude: "Now show me verify script"
```
**Why bad:** System issue, holistic would find it instantly

### ❌ Switching Mid-Investigation Without Reason
```
Claude: [Starts holistic scan]
Claude: [Gets distracted by typo]
Claude: [Goes file-by-file on typo]
Claude: [Forgets original problem]
```
**Why bad:** Lost context, wasted time

---

## Quick Reference

**Use HOLISTIC when you see these words in problem description:**
- "deployment failing"
- "not working together"
- "configuration issue"
- "don't know where"
- "system-wide"
- "integration"
- "pipeline"

**Use FILE-BY-FILE when you see these words:**
- "this function"
- "line 42"
- "returns wrong value"
- "syntax error"
- "typo in"
- "missing semicolon"
- "logic error"

---

## Success Metrics

**Holistic Approach Succeeded When:**
- Root cause found in 1-2 exchanges
- System connections revealed
- Multiple files fixed together
- User says "oh, that makes sense"

**File-by-File Succeeded When:**
- Bug fixed in <5 minutes
- Change isolated to 1-2 lines
- Tests pass immediately
- No side effects

---

## Conclusion

**The difference between 2 minutes and 10 minutes is choosing the right approach.**

Both systematic thinking and detailed file-by-file thinking have their place.

**Master the decision tree. Use the right tool for the job.**

When in doubt: Start holistic (grep the codebase), then zoom in as needed.
