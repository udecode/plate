---
date: 2026-04-11
topic: slate-v2-benchmark-layout-reorg
status: in_progress
source_repos:
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/plate-2
---

# Slate v2 Benchmark Layout Reorg

## Goal

Replace the current flat benchmark-script sprawl with one cleaner benchmark
home that is easier to extend without copying another script and hoping the
flags line up.

## Harsh Read

Current benchmark layout is functional but sloppy:

- benchmark files are flat in `scripts/`
- browser, compare, core, and react lanes are mixed together
- compare scripts duplicate repo/build/run plumbing
- browser scripts duplicate Playwright timing helpers
- there is no local README where someone can discover how to add a lane without
  archaeology

## Desired End State

- one benchmark root under `scripts/benchmarks/`
- grouped by lane family, not by whatever was added first
- shared helpers for compare and browser harness code
- root `package.json` commands stay stable
- a local README explains:
  - folder structure
  - command naming
  - when to create a new lane
  - how to extend the shared helpers

## Phases

1. Create benchmark root and family folders
2. Extract shared compare/browser helpers
3. Move existing benchmark files onto the new structure
4. Update package commands to the new paths
5. Add `scripts/benchmarks/README.md`
6. Run fresh verification on representative lanes
