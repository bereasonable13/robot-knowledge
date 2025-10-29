# Robot Knowledge System

Personal knowledge base with Claude AI integration.

## Quick Overview
```
WORK.md              → Active work items
KNOWLEDGE.md         → How I work & think
projects/            → Project-specific notes
  american-bocce/    → ABC event demos
  nextup-events/     → Event management platform
meta/                → About this system itself
```

## AI Integration

- **Claude:** Google Drive sync (automatic)
- **ChatGPT:** Future integration

## Usage
```bash
# Capture work
robot bug bocce "dropdown empty"
robot idea nextup "tournament brackets"
robot note meta "system improvement"

# View work
robot show              # All items
robot show bocce        # Bocce items only

# Load knowledge in Claude
Say: "robot load" or "mr robot"
```

## Files

- `WORK.md` - Active work items
- `KNOWLEDGE.md` - Methodologies, patterns, context
- `config.json` - Repository configuration
- `.claude/` - Claude integration settings
