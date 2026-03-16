---
name: plan
description: Starts a file-based planning workflow for complex tasks by creating structured planning documents (task_plan.md, findings.md, progress.md) and guiding the user through phased planning. Delegates to the planning-with-files skill. Trigger terms: "plan", "create plan", "task planning", "project plan", "break down task". Use when the user has a complex, multi-step task that benefits from structured planning before implementation.
---

# File-Based Planning

## Overview

Bootstraps a Manus-style planning workflow using structured Markdown files to track phases,
findings, and progress across sessions.

## Workflow

1. **Invoke sub-skill** -- delegate to `planning-with-files:planning-with-files` and follow its instructions exactly.
2. **Create planning files** (if they do not already exist) in the current project directory:
   - `task_plan.md` -- phases, progress checkpoints, and decisions
   - `findings.md` -- research results and discoveries
   - `progress.md` -- session-by-session logging
3. **Guide the user** through the planning workflow defined by the sub-skill.

## Example

```
/plan "Migrate authentication from JWT to session-based cookies"
```
