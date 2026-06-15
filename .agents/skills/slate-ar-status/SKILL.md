---
description: Read-only status shortcut for Slate v2 Autoresearch. Shows current session state, dashboard URL, next recommended action, blockers, and latest metric evidence without running packets or editing files.
argument-hint: '[optional target/session hint]'
disable-model-invocation: true
name: slate-ar-status
metadata:
  skiller:
    source: .agents/rules/slate-ar-status.mdc
---

# Slate AR Status

Handle $ARGUMENTS by loading `slate-ar` and running its read-only status mode.

Use this when the user asks where the Slate v2 Autoresearch loop stands.

Contract:

- Read `.tmp/slate-autoresearch/autoresearch.*` state when present.
- Run read-only Codex Autoresearch commands with `--cwd .`:
  `onboarding-packet --compact`, `state --compact`, `state --report`,
  `recommend-next --compact --operator-checklist`, and `doctor --explain`.
- Read the operator checklist as the shortest safe continuation path. If it
  blocks `next`, report the blocker instead of running a packet.
- Start or restart Codex Autoresearch `serve` only to provide a live dashboard
  URL.
- Use `export` only for a static snapshot. Do not treat an old exported HTML
  file as live runtime truth.
- Report latest, best, baseline, kept/discarded/checks-failed/crashed packet
  counts when available.
- Do not run `next`, `log`, setup, benchmark packets, finalization, branch,
  commit, push, or cleanup.

This skill is a read-only operator view, not a loop runner.
