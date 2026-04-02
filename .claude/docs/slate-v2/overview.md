---
date: 2026-04-02
topic: slate-v2-overview
---

# Slate v2 Overview

## Purpose

This is the entrypoint for the Slate v2 doc stack.

Use this first.

## Core Docs

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

## What Can Still Pivot

1. exact public transaction API naming
2. exact `SnapshotIndex` shape
3. middleware phase timing and ownership
4. some helper placement between `slate-v2`, `slate-dom-v2`, and `slate-react-v2`

## Current Execution Posture

The docs are now strong enough to start the first `packages/slate-v2` prototype.

But the right order stays:

1. respect the runtime specs
2. keep core answering to them
3. spike `packages/slate-v2`
4. stop at the next proof gate before widening the surface
