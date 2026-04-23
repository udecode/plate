---
date: 2026-04-11
topic: slate-browser-transport-architecture-plan
status: draft
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/slate
  - /Users/zbeyens/git/agent-browser
  - /Users/zbeyens/git/agent-device
source_spec:
  - /Users/zbeyens/git/plate-2/.omx/specs/deep-interview-slate-browser-agent-native-transport-expansion.md
---

# Slate Browser Transport Architecture Plan

## Purpose

Turn the browser/mobile proof work into a real architecture plan for the next
testing system move.

This plan is grounded in:

- the deep-interview spec for transport expansion
- the IME/mobile/browser RC consensus plan
- the actual proof outcomes from Playwright, `agent-browser`, and Appium

It is not a generic framework brainstorm.
It is the next durable architecture cut.

## Decision

Best long-term architecture:

1. a **shared proof core**
2. a **browser transport package**
3. a later **native/device package**

Strong take:

- do **not** keep shoving every transport into `slate-browser` forever
- do **not** build a fake universal driver
- do **not** treat browser and native as the same problem

## Proof-Grounded Read

### What is already strong

- Playwright is the deterministic browser backbone
- Chromium IME lanes are real
- Firefox/Desktop WebKit proxy composition is real
- Firefox/Desktop WebKit focus/selection recovery is real

### What is newly proved

- `agent-browser` can drive iOS Simulator Safari locally well enough for:
  - opening a local Slate example
  - initial snapshot
  - packaged red behavior proof with post-input readback
- Appium + UiAutomator2 can drive Android Chrome on a local emulator well
  enough for:
  - creating a real browser session
  - navigating to the local Slate example
  - packaged red behavior proof on the placeholder input row

### What is not solved

- iOS post-input behavior is still red
- Android input behavior is still red
- native/device proof is not started yet

That means the architecture should reflect:

- browser-mobile transports are real enough to matter now
- native/device remains a later consumer

## Architecture Shape

## 1. Shared Proof Core

Long-term home:

- `packages/slate-proof-core`

Immediate posture:

- start as an internal extraction target
- do **not** force a published package before the second consumer lands

It owns:

- scenario ids
- editor-shaped assertion vocabulary
- evidence classes:
  - `automated-direct`
  - `automated-proxy`
  - `manual-device-blocking`
- artifact contracts
- row metadata and proof-result shapes

It does **not** own:

- browser automation
- native automation
- transport-specific interaction semantics

## 2. Browser Package

Keep:

- `packages/slate-browser`

It becomes explicitly multi-transport for **browser** surfaces only.

Owned transports:

1. `playwright`
   - deterministic desktop/browser backbone
2. `agent-browser`
   - iOS Simulator Safari and future agent-native browser flows
3. `appium`
   - Android Chrome emulator/device browser transport

Future transport candidates:

- Playwright Android if it ever beats Appium here
- Appium/XCUITest Safari if it beats `agent-browser` for iOS browser proof

It owns:

- browser transport adapters
- browser-facing packaged proof commands
- browser scenario runners

It does **not** own:

- native app/device automation outside the browser

## 3. Native/Device Package

Create later:

- `packages/slate-device`

Why separate:

- `agent-device` is app/device-centric, not browser-centric
- its primitives, failure modes, and artifact semantics are different
- forcing it into `slate-browser` would rot the transport model

It should consume the shared proof core once the first native editor lane is
worth building.

## Anti-Architecture Rules

Do not do these:

- no `EditorDriver` abstraction that pretends browser and native expose the
  same action model
- no top-level package that hides transport identity
- no dependency on paid cloud labs in the supported core story
- no package split driven only by naming aesthetics

## Transport Strategy

## Browser web rich-text hierarchy

Current best order:

1. Playwright desktop/browser
2. Appium Android Chrome
3. `agent-browser` iOS Simulator Safari
4. later comparison against Playwright Android / Appium iOS Safari if needed

Why:

- this is the hierarchy the proof actually supports today
- not the hierarchy that feels symmetrical on a whiteboard

## Native/device hierarchy

Current best order:

1. `agent-device`
2. transport-specific fallbacks only if needed

But this starts later.

## Tranche Plan

## Milestone A: Browser-Mobile Consolidation

Goal:

- finish the browser-mobile transport story before starting native/device

Scope:

- extract shared browser scenario contract from current proof commands
- keep Playwright as the reference transport
- add first-class browser transport adapters for:
  - Appium Android
  - `agent-browser` iOS
- classify every browser-mobile row by evidence class

Success bar:

- packaged setup + behavior proof commands exist per browser-mobile transport
- rows stop being vague “manual later” buckets
- no architecture drift into native/device yet

## Milestone B: Native/Device First Consumer

Goal:

- start the first native/device editor lane

Scope:

- introduce `packages/slate-device`
- port one or two scenario rows from the shared proof core
- prove that the shared scenario contract survives a non-browser consumer

Success bar:

- second consumer is real
- shared proof core extraction is justified
- browser/native split is no longer theoretical

## Implementation Order

1. keep the current browser-mobile proof commands
2. extract shared scenario/evidence/artifact types out of ad hoc scripts
3. formalize browser transport adapters inside `slate-browser`
4. only then introduce `slate-device`

That sequencing matters.

If we create `slate-device` before the browser-mobile adapters settle, we are
just moving confusion into more folders.

## Verification Bar

Architecture work does not count unless it preserves or improves the current
proof story.

Minimum preserved proofs:

- Chromium IME lane
- Firefox/Desktop WebKit composition proxy lane
- Firefox/Desktop WebKit desktop parity lane
- `pnpm proof:agent-browser:ios:local`
- `pnpm proof:agent-browser:ios:placeholder-input:local`
- `pnpm proof:appium:android:local`
- `pnpm proof:appium:android:placeholder-input:local`

## Risks

1. premature shared-core extraction
   - if done before the second consumer exists, it becomes abstraction theater
2. overfitting to red lanes
   - if we encode the current broken input semantics too early, the core gets
     polluted by transport quirks
3. trying to make transports look symmetric
   - symmetry is the fastest path to a bad testing framework here

## Recommendation

Proceed with:

1. browser-mobile consolidation inside `slate-browser`
2. shared proof-core extraction only as far as the browser adapters justify
3. defer `slate-device` until the first native lane is actually ready

Bluntly:

- `slate-browser` grows broader first
- `slate-device` appears later
- the shared core is real, but it should not be over-extracted on day one
