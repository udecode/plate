---
date: 2026-04-11
topic: slate-v2-ime-mobile-browser-proof-tranche-1-plan
status: draft
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/slate
  - /Users/zbeyens/git/agent-browser
  - /Users/zbeyens/git/agent-device
---

# Slate v2 IME / Mobile / Browser Proof Tranche 1 Plan

## Purpose

Define the first **larger** proof-recovery tranche under
[2026-04-11-slate-v2-ime-mobile-browser-zero-regression-rc-consensus-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-ime-mobile-browser-zero-regression-rc-consensus-plan.md),
using the behavior/parity ledger as execution authority.

This tranche is intentionally bigger than the tiny one-row follow-ups.
It still stays proof-first and does **not** reopen architecture/package design.

## Why A Larger Batch Now

The current state is no longer “we do not know the transports.”

We now know:

- Chromium IME/browser rows are green
- Firefox/Desktop WebKit proxy composition rows are green
- Firefox/Desktop WebKit selection/focus rows are green
- `agent-browser` is a real local iOS Simulator Safari setup transport
- Appium is a real local Android Chrome setup transport
- Android input behavior is still red
- iOS post-input capture is still underpowered

That means the next meaningful work is a **three-lane proof tranche**, not more
single-row poking.

## Governing Rule

The consensus plan still wins:

1. recover missing behavior-bearing proof rows
2. prefer real user-visible behavior proof
3. do not overclaim from setup-only or proxy-only wins
4. keep the ledger as gate authority

References:

- [2026-04-11-slate-v2-ime-mobile-browser-zero-regression-rc-consensus-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-ime-mobile-browser-zero-regression-rc-consensus-plan.md)
- [2026-04-11-slate-v2-ime-mobile-browser-file-ledger.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-ime-mobile-browser-file-ledger.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)

## Tranche Goal

Push the remaining blocking rows as far as honest local/open-source proof
allows, in one coordinated tranche, before any broader plan work:

1. improve **iOS Safari / WebKit composition / focus**
2. improve **Android composition / diff / flush**
3. improve **Firefox composition**

The tranche succeeds if it does **any** of these:

- turns one blocking row into a clearly stronger evidence class
- turns one setup-only transport into a packaged behavior-proof primitive
- turns one vague blocker into a sharply documented dead-end with artifact-ready
  next steps

## Current Blocking Rows

From the live ledger:

1. Android composition / diff / flush
2. iOS Safari / WebKit composition / focus
3. Firefox composition / selection recovery

## Tranche Structure

### Lane A: iOS post-input hardening

Owner transport:

- `agent-browser` on iOS Simulator Safari

Current state:

- green for open + initial snapshot
- red/flaky for post-input capture

Goal:

- upgrade iOS from “setup proof only” to one packaged post-input readback path

Allowed attempts:

1. chained `agent-browser` flow with stable focus + insert path
2. batch mode with a known-safe command sequence
3. post-input readback via:
   - `get text body`
   - `eval(...)`
   - debug JSON
   - artifact markdown
   - screenshot

Acceptance:

- at least one post-input readback path is repeatable enough to become a
  packaged proof primitive

Failure outcome:

- document iOS as setup-only with explicit capture dead-ends
- keep the row blocking

### Lane B: Android behavior proof escalation

Owner transport:

- Appium + UiAutomator2 + local Android emulator Chrome

Current state:

- green for setup/page proof
- red for placeholder input behavior

Goal:

- find one Android input path that actually produces trustworthy editor state,
  or close the obvious input strategies as dead ends

Allowed attempts:

1. existing element sendKeys path
2. Appium `mobile: type`
3. `adb shell input text`
4. one additional Appium/WebDriver-compatible input strategy if it is clearly
   different in semantics, not just renamed

Acceptance:

- one Android behavior primitive becomes packaged and trustworthy

Failure outcome:

- document Android as setup-green / behavior-red
- explicitly freeze the dead strategies
- stop instead of trying a parade of random input APIs

### Lane C: Firefox direct composition follow-up

Owner transport:

- Playwright browser lane

Current state:

- Firefox proxy composition is green
- Firefox direct focus/selection recovery is green
- Firefox native composition is still not closed

Goal:

- see whether Firefox can gain one stronger-than-proxy composition path without
  fake abstraction

Allowed attempts:

1. browser-level direct composition event path if it demonstrably hits the same
   runtime seam
2. one focused follow-up on the current proxy lane if it improves evidence class
   honestly

Acceptance:

- either stronger evidence than proxy
- or a documented reason the proxy is the ceiling in this environment

Failure outcome:

- keep Firefox composition blocked but sharper

### Lane D: Ledger + artifact reconciliation

No proof lane survives unless it updates:

- [2026-04-11-slate-v2-ime-mobile-browser-file-ledger.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-ime-mobile-browser-file-ledger.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)

Manual-device scaffolds must remain aligned under:

- [ime-mobile-browser](/Users/zbeyens/git/plate-2/.omx/artifacts/ime-mobile-browser/README.md)

## Execution Order

1. Lane A first
   reason:
   iOS is currently the weakest browser-mobile post-input story
2. Lane B second
   reason:
   Android setup is already real, so the only honest next question is behavior
3. Lane C third
   reason:
   Firefox is already ahead of the other two
4. Lane D continuously

## Explicit Non-Goals

- no new package split
- no umbrella test-framework redesign
- no `agent-device` spike in this tranche
- no paid/cloud backends
- no blanket “port all remaining legacy tests” claim
- no closure on setup-only proof

## Verification Bar

Every sub-lane must end with fresh same-turn evidence.

Minimum:

- `pnpm lint:fix`

Plus the exact packaged proof commands or exact shell probes that justify the
updated evidence class.

Preferred command outcomes by lane:

- iOS:
  packaged `proof:agent-browser:ios:*`
- Android:
  packaged `proof:appium:android:*`
- Firefox:
  packaged Playwright/browser proof command if a new one lands

## Tranche Success Conditions

The tranche is worth keeping if **at least two** of these happen:

1. iOS gets a real post-input proof primitive
2. Android gets a real behavior proof primitive
3. Firefox composition gets stronger than proxy
4. one or more dead-end strategies are conclusively documented and frozen

## Tranche Failure Conditions

Stop and close the tranche if:

- all new strategies are still setup-only or flaky
- the work starts drifting into architecture instead of proof
- transport complexity rises without changing the evidence class

## Final Read To Preserve

Even a “red but sharper” tranche is useful.

What is not acceptable:

- another week of setup churn
- another round of chat-only theory
- another hidden blocker row with no named proof owner
