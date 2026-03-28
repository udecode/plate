---
module: Claude/Codex Skill Sync
date: 2026-03-28
problem_type: workflow_issue
component: tooling
symptoms:
  - "Running `skiller apply` regenerates namespaced plugin skills like `compound-engineering-ce-plan` in `.agents/skills`"
  - "Tracked plugin-managed skill copies become dirty even though the local skill with the base name already exists"
  - "Plugin reference files such as `compound-engineering-ce-review/references/resolve-base.sh` keep reappearing after sync"
root_cause: missing_tooling
resolution_type: code_change
severity: medium
tags:
  - skiller
  - plugins
  - skills
  - conflicts
  - duplicate-files
  - compound-engineering
---

# Skiller plugin conflicts should skip local skills

## Problem

`plate` has local skills in `.agents/skills` with names like `ce-plan` and `document-review`, while the globally enabled `compound-engineering` plugin ships the same skills from the marketplace.

`skiller apply` treated every conflict as "namespace the plugin copy," so `.agents/skills` kept getting duplicate plugin-managed folders like `compound-engineering-ce-plan` even though the local skill already owned the canonical name.

## Root cause

`skiller` only had one conflict strategy for plugin-managed skills: keep the local folder and install the plugin item under a namespaced destination.

That is reasonable for plugin-vs-plugin collisions, but it is the wrong behavior for local/manual skills that already intentionally shadow plugin content. There was no config surface to say "if a local skill already exists, skip the plugin copy entirely."

## Solution

Add a `skills.plugin_conflict_strategy` setting to `skiller.toml` with:

- `namespace` as the default behavior
- `skip` to drop plugin items when their base name is already reserved by a local or other non-managed folder

The implementation changes were:

- Parse `plugin_conflict_strategy` from `[skills]`
- Thread that setting through `propagateSkills` into `ClaudePluginSync`
- In plugin sync, do not preserve or create namespaced plugin destinations for reserved local conflicts when the strategy is `skip`
- Keep namespacing behavior for plugin-vs-plugin collisions so one plugin does not silently erase another

`plate` then opted into the new behavior:

```toml
[skills]
enabled = true
plugin_conflict_strategy = "skip"
```

## Why this works

The duplicate folders only existed because plugin sync had no "local wins, plugin skips" mode.

Once `skip` is enabled, `skiller` stops assigning namespaced destinations for plugin items whose base names are already taken by local/manual skills. Existing namespaced plugin folders also get cleaned up on the next sync because they are no longer expected manifest entries.

## Prevention

- Use `skills.plugin_conflict_strategy = "skip"` in repos that intentionally keep local/manual skills checked in alongside globally enabled marketplace plugins.
- Keep `namespace` as the default in `skiller` so plugin-vs-plugin collisions still remain visible instead of disappearing silently.
- When `skiller apply` produces dirty `compound-engineering-*` skill folders, check whether the repo already has the same base skill names locally before blaming the rename logic.
