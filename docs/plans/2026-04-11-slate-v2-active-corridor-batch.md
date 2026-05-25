---
date: 2026-04-11
topic: slate-v2-active-corridor-batch
status: in_progress
source_repos:
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/plate-2
---

# Slate v2 Active Corridor Batch

## Goal

Make far-island interaction real instead of fake:

- shell click promotes the target island
- selection lands in the promoted island
- typing after promotion edits the promoted island, not block zero

## Phases

1. Read the current shell-proof runtime and broad-op path
2. Implement activation request plumbing from shell to editable root
3. Resolve promoted selection from DOM point when possible, fallback to island start
4. Add runtime proofs and browser proof for promote-and-type
5. Verify build, typecheck, lint, tests, and perf lanes

## Current Read

- shell-only far islands are already real
- broad ops are model-driven
- remaining honest gap is interaction away from the default live island
