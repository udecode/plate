---
date: 2026-04-11
topic: slate-v2-ime-mobile-browser-next-batch-plan
status: draft
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/slate
  - /Users/zbeyens/git/agent-browser
---

# Slate v2 IME / Mobile / Browser Next Batch Plan

## Purpose

Concrete next batch under the authority of
[2026-04-11-slate-v2-ime-mobile-browser-zero-regression-rc-consensus-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-ime-mobile-browser-zero-regression-rc-consensus-plan.md),
using the current behavior/parity ledger as the gate truth.

This is not a new architecture plan.
It is the next proof-recovery batch.

## Constraint

Follow the consensus plan’s actual order:

1. recover currently missing proof rows
2. prefer real user-visible behavior proof
3. do not overclaim from proxy/setup wins
4. keep the behavior ledger as execution authority

## Current Read

From
[2026-04-11-slate-v2-ime-mobile-browser-file-ledger.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-ime-mobile-browser-file-ledger.md):

- Chromium IME rows are green
- Firefox/Desktop WebKit proxy composition rows are green
- Firefox/Desktop WebKit selection/focus rows are green
- Android browser-mobile setup proof is green through Appium
- Android placeholder input proof is explicitly red
- iOS Simulator setup/open/initial snapshot proof is green
- iOS post-input capture is still flaky

Still-blocking rows:

1. Android composition / diff / flush
2. iOS Safari / WebKit composition / focus
3. Firefox composition / selection recovery

## Decision

Do **not** widen into more architecture or package design work yet.

The highest-leverage next batch is:

1. **iOS post-input hardening**
2. **Firefox direct composition follow-up only if iOS stalls**
3. **do not spend more time on Android input API roulette until iOS is either
   green enough or proven equally dead**

Why this order:

- Android already has a real browser session and a clean red proof. We know the
  problem.
- iOS still lacks the equivalent post-input readback seam, so the lane is less
  mature.
- Firefox is already further along than both because proxy composition plus
  direct browser selection/focus are green.

## Batch Goal

Move **one** currently blocking row from:

- `manual-device-blocking` or vague setup-only status

to at least:

- `automated-proxy` with useful post-input evidence

without changing the RC claim yet.

## Batch Scope

### In scope

- `agent-browser` iOS Simulator post-input capture
- the current IME debug overlay and artifact readback on iOS
- one packaged proof command that goes beyond open + initial snapshot
- ledger/doc updates for the exact new evidence class

### Out of scope

- new package architecture
- `agent-device` spike
- paid/cloud device labs
- broad Android refactors
- calling the iOS row closed unless the proof actually becomes trustworthy

## Concrete Steps

### Phase 1: iOS post-input readback matrix

Probe, in this order:

1. open + focus + `keyboard inserttext`
2. post-input debug JSON readback
3. post-input artifact markdown readback
4. post-input screenshot

Acceptance:

- at least one post-input readback path is repeatable enough to become the next
  iOS proof primitive

Failure rule:

- if all four still fail or hang, record iOS as setup-only and stop the batch
  there instead of inventing a fake proof story

### Phase 2: package the winning iOS proof path

If a post-input path works:

- add a dedicated command under `package.json`
- keep it narrow
- prefer placeholder first
- update the current proof note and behavior ledger

### Phase 3: only if Phase 1 fails hard

Use the remaining time for Firefox direct composition follow-up:

- try to upgrade the Firefox row from proxy-only composition to a stronger
  direct browser interaction path

Do not do this first.

## Verification

Required fresh evidence in the same turn:

- `pnpm lint:fix`
- the packaged iOS proof command if one lands
- otherwise the exact shell probe output that proves the dead end

## Closeout Rule

A good batch outcome is one of:

1. **green primitive**
   - iOS post-input readback is real enough to package
2. **useful red**
   - iOS post-input is still dead, but now with a tighter documented boundary

Bad batch outcome:

- more setup churn
- more transport swapping
- broader architecture debate without new proof
