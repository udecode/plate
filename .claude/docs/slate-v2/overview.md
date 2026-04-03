---
date: 2026-04-02
topic: slate-v2-overview
---

# Slate v2 Overview

## Purpose

This is the entrypoint for the Slate v2 doc stack.

Use this first.

## Core Docs

- [final-synthesis.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/final-synthesis.md)
  The settled read after the full comparison pass.
- [engine.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/engine.md)
  The architecture north star.
- [cohesive-program-plan.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/cohesive-program-plan.md)
  The phase order, pivot gates, and stop/go rules.
- [core-foundation-spec.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/core-foundation-spec.md)
  The first implementation spec for `packages/slate-v2`.
- [dom-runtime-boundary-spec.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/dom-runtime-boundary-spec.md)
  The `slate-dom-v2` contract.
- [react-runtime-spec.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/react-runtime-spec.md)
  The `slate-react-v2` contract, explicitly React `19.2+`.

## Evidence Stack

The issue-derived evidence lives separately under:

- [slate-issues](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues)

Start there only if you need:

- the full ledger
- cluster scoring
- package ownership evidence
- test or benchmark handoff
- maintainer triage artifacts

## What Is Locked

1. data-model-first core
2. op-first external model
3. transaction-first internal model
4. immutable committed snapshots
5. stable runtime identity outside serialized JSON
6. explicit runtime ownership:
   - `slate-v2`
   - `slate-dom-v2`
   - `slate-react-v2`
7. React `19.2+` as the runtime target for `slate-react-v2`
8. the clipboard-boundary proof belongs in `slate-v2` + `slate-dom-v2` before any new package is invented

## What Can Still Pivot

1. exact public transaction API naming
2. exact `SnapshotIndex` shape
3. middleware phase timing and ownership
4. some helper placement between `slate-v2`, `slate-dom-v2`, and `slate-react-v2`

## Current Execution Posture

The proof stack now exists for:

- `packages/slate-v2`
- `packages/slate-dom-v2`
- `packages/slate-react-v2`
- `packages/slate-history-v2`

The comparison phase is complete.

The settled read is in:

- [final-synthesis.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/final-synthesis.md)

The next structural seam is still the missing clipboard-boundary proof from Phase 4.

The broad package direction is also clearer now:

- keep the split package architecture
- keep the core data-model-first
- keep the runtime packages headless and adapter-friendly
- prefer explicit boundary ownership over giant convenience layers

External comparison so far reinforces that direction.

- Edix is useful evidence for explicit DOM and clipboard adapter seams.
- Edix is not a reason to collapse everything back into one package.
- Edix is not a better React renderer model than the selector-first `slate-react-v2` direction.
- Tiptap, TanStack DB, urql, VS Code, LSP, EditContext, and Open UI all sharpen future `plate-v2` or later imports.
- `Pretext` still matters inside v2, but narrowly:
  as a planning primitive for inactive-region geometry, not as the active editing geometry source.
- None of them change the immediate `slate-v2` next step.

The right order still stays:

1. respect the runtime specs
2. keep each package answering to the packages below it
3. finish the clipboard-boundary proof
4. only then start cashing out on the chronic bug families
