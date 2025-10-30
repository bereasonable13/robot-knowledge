# Core Learning: The Solo Developer Working Memory System

## The Problem

From a dev point of view, I am building and creating features, so I need to mind map, execute, document, and adjust simultaneously. If I do not have you as assistant who can remember and system to keep it all straight, we will both get misaligned.

## THIS IS THE CORE INSIGHT

The real problem described perfectly:

## The Solo Developer Dilemma

YOU (solo founder) are simultaneously:
- Mind mapping (planning features)
- Executing (writing code)
- Documenting (for future you/Claude)
- Adjusting (iterating based on reality)

ALL AT THE SAME TIME

WITHOUT a persistent second brain = chaos

## What Happens Now (Broken)

SESSION 1 (Today):
You + Claude → Plan ABC MVP → Write code → Document in head
Session ends, Claude forgets

SESSION 2 (Tomorrow):
You + New Claude → What were we building? → Misaligned
You remember, Claude does not
Time wasted re-explaining

## What You Actually Need

A Working Memory System that acts as the shared brain between:
- You (across work sessions)
- Claude (across conversations)
- Your codebase (what is real)
- Your documentation (what is recorded)

## The System Must Capture

### 1. Active Context (what you are working on RIGHT NOW)

CURRENT FOCUS: ABC MVP acceptance criteria
- Started: Oct 29, 10pm
- Goal: Define all acceptance criteria before building
- Status: 60% complete
- Blockers: Waiting on Bulls data structure
- Next: Finalize Bocce mock data
- Related: entries/abc/MVP.md

### 2. Decision Log (WHY you chose this approach)

DECISION: Use Google Apps Script instead of standalone app
Date: Oct 15
Reason: Client already uses Google ecosystem
Tradeoffs: Limited by Apps Script constraints
Impact: Affects architecture for all features
Status: Committed

### 3. Feature State (what exists vs planned)

FEATURE: QR Code Generation
- Design: Complete
- Code: 50% (Admin.html done, Display.html pending)
- Tests: Not started
- Docs: Partial
- Deployed: No

### 4. Known Issues (things you discovered)

BUG: Dropdown empty on mobile
- Reported: Oct 26
- Reproduced: Yes
- Root cause: Unknown (investigating)
- Workaround: Use desktop
- Priority: High (blocks mobile users)
- Next step: Check deployment timestamps

### 5. Mind Map State (evolving architecture)

ARCHITECTURE: NextUp Event System
- Core: Event registration + QR codes (Complete)
- Admin: Multi-org management (In Progress)
- Display: Real-time event boards (In Progress)
- Public: Self-service registration (Not Started)
- Analytics: Event insights (Not Started)

## How It Prevents Misalignment

When you start a session:

YOU: robot load

CLAUDE SEES:
- Last worked on: ABC MVP (yesterday, 60% done)
- Active decisions: Using Google Apps Script
- Current blockers: Waiting on Bulls data
- Code state: Admin.html complete, Display pending
- Known bugs: Mobile dropdown issue

CLAUDE SAYS:
Picking up where we left off on ABC MVP.
You are 60% through acceptance criteria, waiting on Bulls data.
Should we finalize Bocce mock data or tackle the mobile dropdown bug?

Instead of:

YOU: Let us work on ABC
CLAUDE: What is ABC? Tell me about it.
YOU: (spends 10 min re-explaining everything)

## Implementation

This is what robot-knowledge provides:
- CURRENT_FOCUS.md = Active context
- QUEUE.md = What is next
- KNOWLEDGE.md = Principles and methodologies
- entries/ = Detailed context per project

## Critical Requirement

Pay attention to how many tokens are left in the chat and make an automatic robot status before the chat runs out to ensure no data is lost. This is a key requirement.
