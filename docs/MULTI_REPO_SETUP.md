# Multi-Repo Robot System Setup

## Overview
Robot system supporting multiple repositories:
- Personal projects → GitHub
- Work projects → Bitbucket

## Installation
See: ROBOT_CHROMEOS_INSTALL.md

## Usage
```bash
robot context zeventbook  # NextUp/ZEventbook
robot context abc         # American Bocce Co
robot context work        # Wolters Kluwer (after approval)
```

## Architecture
- ~/.robot_functions - Main script
- ~/.robot_context - Current context
- ~/robot-knowledge - Personal repo (GitHub)
- ~/work-knowledge - Work repo (Bitbucket)
