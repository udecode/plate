---
date: 2026-04-03
topic: slate-browser-testing-framework-design
---

# Slate Browser Testing Framework Design

> Specialist testing/proof doc. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).
>
> Framework-direction doc only. Use current root commands and the proof-lane matrix for the shipped operator surface.

## Purpose

This doc turns the research in [overview.md](/Users/zbeyens/git/plate-2/docs/slate-browser/overview.md) into a concrete framework recommendation.

The target is not “a test stack.”

The target is:

- high-signal coverage
- fast local iteration
- real browser fidelity where it matters
- IME coverage that is not fake
- a deterministic core that can accept an agent-native lane later without being
  distorted by it now

## Strong Take

Do **not** choose Bun _or_ Vitest as if one runner solves the whole problem.

That is the wrong question.

The right question is:

- which runner belongs to which lane?

## Recommended Lane Architecture

## Layer 0: Core Fast Tests

Purpose:

- model semantics
- transforms
- selection math
- projection logic
- pure helpers

Recommended tool:

- **Bun** for the fastest pure TypeScript/unit lane

Why:

- Premirror and Pretext show the right instinct here:
  Bun is excellent for pure runtime-local tests and benchmark scripts
- cold-start speed matters most in this lane
- browser fidelity does not

Do not use this lane for:

- contenteditable
- DOM selection
- IME
- clipboard browser behavior

## Layer 1: Browser Contract Tests

Purpose:

- DOM translation
- selection bridge contracts
- placeholder DOM shape
- clipboard DOM adaptation
- small browser-sensitive invariants

Recommended tool:

- **Vitest browser mode + Playwright provider**

Why:

- edix and rich-textarea have the best current shape here
- this lane wants browser reality, but not full example-app orchestration
- Vitest projects give good DX:
  one config, fast focused files, browser-backed assertions

Why not Bun here:

- Bun is faster, yes
- but right now the browser-contract lane benefits more from ecosystem maturity
  than from raw startup wins
- Vitest already has a clean browser/provider story
- Bun does not currently win enough on browser-integrated ergonomics to justify
  becoming the base for this lane

## Layer 2: Example Integration Tests

Purpose:

- rich example surfaces
- toolbar flows
- selection gestures
- clipboard flows across mounted examples
- regressions that only make sense once the actual example is running

Recommended tool:

- **Playwright**

Why:

- Slate already has this harness
- VS Code validates the value of explicit browser test entrypoints
- this lane should stay unapologetically end-to-end

DX rule:

- keep helpers opinionated:
  - `openExample`
  - `focusEditor`
  - `assertEditorHtml`
  - `assertSlateSelection`
  - `assertDomSelection`

## Lane A: IME / Composition

Purpose:

- placeholder-sensitive composition
- empty-editor composition
- range/selection after composition commit
- browser-specific ordering bugs

Recommended tool:

- **Playwright on Chromium**
- **CDP composition helpers**, copied from Lexical’s approach

Why:

- Lexical is the best source of truth here
- jsdom contenteditable composition is not trustworthy enough
- this lane needs real browser composition APIs and real selection

Command shape:

- `test:ime:chromium`
- later:
  - `test:ime:webkit`
  - `test:ime:firefox` when the harness/support is real

Key principle:

- the IME lane is not “just another e2e test”
- it is a specialized browser lane with dedicated helpers

## Future Extension: Agent-Native

Purpose:

- actions a human can take that deterministic Playwright commands express badly
- complex drag selections
- weird context menus
- visual or multi-step browser actions that need an agent’s adaptive loop

Recommended tools:

- **dev-browser**
- **agent-browser**

Why:

- this is the honest long-term answer to the `agent-native-reviewer` standard:
  if users can do it, agents need a lane too

But:

- this is **not** part of the first framework tranche
- this is **not** the primary correctness lane
- it complements deterministic suites
- it must always emit artifacts:
  - selection dump
  - DOM dump
  - screenshot
  - action transcript

## Lane C: Performance

Purpose:

- typing latency
- rerender breadth
- compose/recompose cost
- huge-document operations

Recommended tools:

- **Bun** for local benchmark scripts
- explicit benchmark commands and manifests

Why:

- Premirror and Pretext are the best references here
- perf work needs scriptability and speed, not browser-runner ceremony by default

## Bun vs Vitest

## Bun Wins

Use Bun when you need:

- the fastest local pure-test loop
- benchmark scripts
- package-local unit tests without browser/provider complexity
- low-friction perf harnesses

Best lanes:

- Layer 0 core fast tests
- Lane C performance

## Vitest Wins

Use Vitest when you need:

- project-split configs
- browser mode
- Playwright-provider contract tests
- richer test-ecosystem integration than Bun currently offers

Best lanes:

- Layer 1 browser contract tests

## Playwright Wins

Use Playwright when you need:

- example/app integration
- real browser behavior
- selection gestures
- clipboard
- IME via CDP

Best lanes:

- Layer 2 example integration
- Lane A IME/composition

## Final Position

The best framework is:

- **Bun** for pure fast lanes
- **Vitest** for browser-backed contract lanes
- **Playwright** for example/e2e and IME lanes

Not:

- Bun everywhere
- Vitest everywhere
- Playwright everywhere

## Speed Strategy

Speed is won by keeping the expensive lanes small and rare.

Rules:

1. pure unit tests must be cheap enough to run constantly
2. browser contract tests must be smaller than integration tests
3. IME tests must be few, high-signal, and Chromium-only by default
4. full example integration should not be the first line of feedback
5. agent-native runs should be selective, not default on every PR

## Coverage Strategy

Coverage is not one number.

Need all of:

1. semantic coverage
2. DOM bridge coverage
3. browser interaction coverage
4. IME coverage
5. performance lane coverage
6. future agent-native action parity coverage

If any one of these is missing, the framework is lying about coverage.

## Agent-Ready Extension Requirements

Applying the `agent-native-reviewer` lens:

1. every critical editor action should already have a deterministic test lane
2. the API should expose enough editor-native primitives that a future
   agent-native lane can wrap them cleanly
3. future agent runs must operate on the same example surfaces
4. the framework should be able to emit capability coverage later, not just
   pass/fail

Minimum future agent-native artifacts:

- action
- example/page
- expected outcome
- actual outcome
- artifact links

## Proposed Command Topology

Recommended repo command families:

- `test:core`
- `test:dom`
- `test:examples`
- `test:ime:chromium`
- `test:perf`
- future: `test:agent`

Recommended implementation:

- `test:core` -> Bun
- `test:dom` -> Vitest browser
- `test:examples` -> Playwright
- `test:ime:chromium` -> Playwright + CDP helpers
- `test:perf` -> Bun benchmark scripts
- future `test:agent` -> dev-browser / agent-browser wrappers

## What To Build First

1. shared Playwright helpers in Slate:
   - open example
   - focus editor
   - assert selection
   - assert editor text/html
2. CDP IME helper module copied from Lexical’s proven pattern
3. one Chromium-only IME regression on the placeholder example
4. one browser-contract lane for DOM selection/placeholder shape tests
5. document the extension seam for a later agent-native lane

## Bottom Line

The best testing framework for editor work is not a runner choice.

It is a lane design:

- Bun where raw speed matters
- Vitest where browser contracts need fast developer UX
- Playwright where real browser behavior matters
- CDP where IME realism matters
- later, agent-browser/dev-browser where action parity matters
