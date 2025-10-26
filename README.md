# Robot Knowledge System

Personal AI-assisted task management and institutional knowledge system.

## Repository Structure
- `ROBOT_QUEUE.md` - Active work queue (synced across devices)
- `LEARNED_METHODOLOGIES.md` - Systematic debugging approaches
- `ROBOT_COMMANDS.md` - Command reference
- `archive/` - Completed items by month

## Platforms
- **Claude** - Guided git workflow
- **ChatGPT** - Automated commits via webhook
- **GitHub Copilot** - Direct git access

## Usage
```bash
# Capture items via AI commands
robot bug [description]
robot idea [description]
robot note [description]

# View and manage
robot show all
robot done [item]
robot commit
```

## Sync Strategy
Git is the single source of truth. All platforms commit to this repo.
