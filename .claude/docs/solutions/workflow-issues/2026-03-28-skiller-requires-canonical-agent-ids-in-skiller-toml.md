---
module: Claude/Codex Skill Sync
date: 2026-03-28
problem_type: workflow_issue
component: tooling
symptoms:
  - "`bun x skiller@latest apply` fails with `Invalid agent config section: claude`"
  - "Any install path that runs the root `prepare` script stops before dependency sync finishes"
  - "The error message lists `claude-code` as valid while repo config still uses `claude`"
root_cause: config_error
resolution_type: config_change
severity: medium
tags:
  - skiller
  - claude-code
  - codex
  - prepare
  - config
  - agent-ids
---

# Skiller requires canonical agent ids in skiller.toml

## Problem

The repo's root `prepare` script runs `bun x skiller@latest apply`. That started failing because `.claude/skiller.toml` still used the old Claude agent id `claude`.

That broke any workflow that relied on a normal install, including the Next upgrade flow.

## Root cause

`skiller` hard-cut its public config surface to canonical agent ids. `claude` is no longer accepted; `claude-code` is the valid id.

The important wrinkle: the generated `.claude/.skiller.json` can still contain `sourceType: "claude"` for project-managed items. That internal metadata is not the config surface `skiller` validates on startup.

## Solution

Update `.claude/skiller.toml` to use canonical ids only:

```toml
default_agents = ["claude-code", "codex"]

[agents.claude-code]
enabled = true
```

Do not patch `.claude/.skiller.json` by hand. It is generated state, not source of truth.

After the config change, rerun:

```bash
bun x skiller@latest apply
```

## Why this works

`skiller` validates `default_agents` and `[agents.<id>]` against its canonical agent catalog before applying anything else.

Once `skiller.toml` uses `claude-code`, the config matches the catalog and `apply` succeeds. The generated `.skiller.json` does not block the run because it tracks synced items, not the validated agent config surface.

## Prevention

- Treat `.claude/skiller.toml` as the only source of truth for agent ids.
- When `skiller` rejects an agent name, check the current `skiller` docs or changelog before touching generated files.
- If `bun x skiller@latest apply` starts failing during install, rerun it directly first. The error message is specific enough to point at the broken id.
