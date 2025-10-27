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
# Test - Mon Oct 27 09:14:30 AM CDT 2025

## Documentation
- [Installation Guide](docs/ROBOT_CHROMEOS_INSTALL.md)
- [Multi-Repo Setup](docs/MULTI_REPO_SETUP.md)
- [Learned Methodologies](docs/LEARNED_METHODOLOGIES.md)

## Quick Start
```bash
robot context zeventbook
robot bug "description"
robot show
```
