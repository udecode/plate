---
date: 2026-04-03
topic: slate-browser-testing-framework-overview
---

# Slate Browser Testing Framework Overview

> Specialist testing/proof doc. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Purpose

This doc defines the specialist testing/proof lane for editor work and the
future testing-framework direction it draws from
[editor-architecture-candidates.md](/Users/zbeyens/git/plate-2/docs/analysis/editor-architecture-candidates.md).

This is not a “pick one runner and call it done” doc.

Strong take:

- the best editor testing framework is **layered**
- one runner to rule them all is a trap
- speed, fidelity, and coverage want different tools

`slate-browser` is a good name for this doc area because the main unsolved gap
is browser-facing editor behavior, not pure core semantics. This repo keeps
internal docs under `docs/`, so the doc lives in `docs/slate-browser/`.

Follow-up docs:

- [framework-design.md](/Users/zbeyens/git/plate-2/docs/slate-browser/framework-design.md)
- [api-design.md](/Users/zbeyens/git/plate-2/docs/slate-browser/api-design.md)
- [proof-lane-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-browser/proof-lane-matrix.md)
- [next-api-candidates.md](/Users/zbeyens/git/plate-2/docs/slate-browser/next-api-candidates.md)
- [next-api-candidates-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-browser/next-api-candidates-matrix.md)
- [four-way-api-deep-dive.md](/Users/zbeyens/git/plate-2/docs/slate-browser/four-way-api-deep-dive.md)
- [next-system-move.md](/Users/zbeyens/git/plate-2/docs/slate-browser/next-system-move.md)
- [prioritized-backlog.md](/Users/zbeyens/git/plate-2/docs/slate-browser/prioritized-backlog.md)

Current package:

- package:
  [/Users/zbeyens/git/slate-v2/packages/slate-browser](/Users/zbeyens/git/slate-v2/packages/slate-browser)
- Playwright harness entrypoint:
  [/Users/zbeyens/git/slate-v2/packages/slate-browser/src/playwright/index.ts](/Users/zbeyens/git/slate-v2/packages/slate-browser/src/playwright/index.ts)

Canonical root commands:

- `yarn build:slate-browser:playwright`
- `yarn setup:slate-browser`
- `yarn test:slate-browser`
- `yarn test:slate-browser:core`
- `yarn test:slate-browser:dom`
- `yarn test:slate-browser:selection`
- `yarn test:slate-browser:e2e`
- `yarn test:slate-browser:e2e:local`
- `yarn test:slate-browser:ime`
- `yarn test:slate-browser:ime:local`
- `yarn test:slate-browser:anchors`
- `yarn test:replacement:compat:local`
- `yarn test:replacement:gate:local`

Current role:

- `slate-browser` is the specialist testing/proof lane for the master roadmap
- it does not own roadmap truth or queue order
- it feeds the emitted-artifact obligations in
  [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- the current live browser/runtime proof rows are carried by:
  - [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)
  - [replacement-compatibility.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts)
- if `slate-browser` work reopens, the current follow-on seam is captured in
  [next-system-move.md](/Users/zbeyens/git/plate-2/docs/slate-browser/next-system-move.md)

## Migration Review Rule

When a browser lane disappears or changes shape, the acceptance bar is not
"there used to be a file with that name."

The acceptance bar is:

- the contributor-facing concept still exists
- the proof owner is explicit in
  [proof-lane-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-browser/proof-lane-matrix.md)
  or the live `docs/slate-v2` verdict docs
- the moved or removed lane is documented in the maintainer diff story

## What We Are Optimizing For

1. fast local feedback
2. real browser behavior when browser behavior is the thing under test
3. first-class IME/composition coverage
4. deterministic selection assertions
5. performance lanes that measure instead of hand-wave
6. future agent-native extensibility, so an agent layer can be added later
   without distorting the deterministic core design

## Best Ideas By Repo

## Lexical

Best steal:

- real browser IME tests with Chromium CDP
- selection assertions as first-class artifacts
- explicit browser matrix for e2e

Key files:

- [/Users/zbeyens/git/lexical/packages/lexical-playground/**tests**/e2e/Composition.spec.mjs](/Users/zbeyens/git/lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs)
- [/Users/zbeyens/git/lexical/packages/lexical-playground/**tests**/utils/index.mjs](/Users/zbeyens/git/lexical/packages/lexical-playground/__tests__/utils/index.mjs)

Take:

- this is the best model for the IME lane
- do not try to reinvent IME testing in jsdom when Lexical already proved the
  right browser seam

## Slate

Best steal:

- example-driven Playwright integration already exists
- mixed unit/dom/browser stack already covers real product surfaces

Key files:

- [/Users/zbeyens/git/slate-v2/playwright/integration/examples/placeholder.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/placeholder.test.ts)
- [/Users/zbeyens/git/slate-v2/package.json](/Users/zbeyens/git/slate-v2/package.json)

Take:

- keep Slate’s Playwright harness
- grow it instead of replacing it

## edix

Best steal:

- Vitest project split between fast unit and browser tests
- Playwright e2e plus direct IME cases in the same repo

Key files:

- [/Users/zbeyens/git/edix/vitest.config.ts](/Users/zbeyens/git/edix/vitest.config.ts)
- [/Users/zbeyens/git/edix/e2e/common.spec.ts](/Users/zbeyens/git/edix/e2e/common.spec.ts)

Take:

- this is the best small-repo shape for “fast browser contract tests”
- especially useful for focused DOM/selection assertions that are too browser-ish
  for jsdom but too small for heavyweight e2e suites

## rich-textarea

Best steal:

- composition-aware selection compensation
- split between unit, browser-story, and Playwright e2e

Key files:

- [/Users/zbeyens/git/rich-textarea/src/selection.ts](/Users/zbeyens/git/rich-textarea/src/selection.ts)
- [/Users/zbeyens/git/rich-textarea/vitest.config.ts](/Users/zbeyens/git/rich-textarea/vitest.config.ts)
- [/Users/zbeyens/git/rich-textarea/e2e/textarea.spec.ts](/Users/zbeyens/git/rich-textarea/e2e/textarea.spec.ts)

Take:

- good model for lightweight surfaces and composition-aware selection helpers
- not enough on its own for rich-contenteditable editor coverage

## Tiptap

Best steal:

- good placeholder extension tests
- decent product-DX test posture with unit + Cypress

Key files:

- [/Users/zbeyens/git/tiptap/packages/extensions/**tests**/placeholder.spec.ts](/Users/zbeyens/git/tiptap/packages/extensions/__tests__/placeholder.spec.ts)
- [/Users/zbeyens/git/tiptap/package.json](/Users/zbeyens/git/tiptap/package.json)

Take:

- useful for extension behavior and product-layer regression shape
- not the best IME or low-level browser harness model

## Premirror

Best steal:

- the cleanest written testing strategy for layout, determinism, and perf

Key file:

- [/Users/zbeyens/git/premirror/docs/testing-strategy.md](/Users/zbeyens/git/premirror/docs/testing-strategy.md)

Take:

- best source for test-lane taxonomy and perf-governance language
- especially useful once editor testing expands into composition/layout/perf

## Pretext

Best steal:

- accuracy and benchmark checks as first-class scripts

Key file:

- [/Users/zbeyens/git/pretext/package.json](/Users/zbeyens/git/pretext/package.json)

Take:

- useful for measurement/perf verification design
- not a general editor-testing framework model

## VS Code

Best steal:

- layered test entrypoints:
  node, browser, extension, smoke, perf

Key file:

- [/Users/zbeyens/git/vscode/package.json](/Users/zbeyens/git/vscode/package.json)

Take:

- strongest structure for “many lanes, explicit commands, no one-suite delusion”

## ProseMirror

Best steal:

- almost nothing framework-specific here for our testing problem beyond
  disciplined core tests

Key file:

- [/Users/zbeyens/git/prosemirror/package.json](/Users/zbeyens/git/prosemirror/package.json)

Take:

- good engine influence
- weak direct testing-framework influence for this problem

## use-editable and markdown-editor

Best steal:

- no strong testing-framework leverage for this problem

Key files:

- [/Users/zbeyens/git/use-editable/package.json](/Users/zbeyens/git/use-editable/package.json)
- [/Users/zbeyens/git/markdown-editor/package.json](/Users/zbeyens/git/markdown-editor/package.json)

Take:

- useful product/code references
- not testing-framework references

## urql and TanStack DB

Best steal:

- project-split Vitest discipline
- explicit e2e subpackages

Key files:

- [/Users/zbeyens/git/urql/package.json](/Users/zbeyens/git/urql/package.json)
- [/Users/zbeyens/git/db/package.json](/Users/zbeyens/git/db/package.json)

Take:

- useful for repo-wide test-lane organization
- not editor-specific behavior coverage

## Agent-Browser / Dev-Browser / OMX

Best steal:

- agent-native lane for actions Playwright does poorly or too rigidly
- explicit capability-coverage thinking

Key files:

- [/Users/zbeyens/git/agent-browser/AGENTS.md](/Users/zbeyens/git/agent-browser/AGENTS.md)
- [/Users/zbeyens/git/dev-browser/package.json](/Users/zbeyens/git/dev-browser/package.json)
- [/Users/zbeyens/git/oh-my-codex/COVERAGE.md](/Users/zbeyens/git/oh-my-codex/COVERAGE.md)

Take:

- agent-native testing should be designed in as a future extension seam
- but it should not shape the first deterministic framework layers

## Recommended Framework Shape

This is a layered base with a few specialized lanes on top of it.

- Layers are about dependency order.
- Lanes are about specialized risk classes.

## Layer 0: Core Fast Tests

Purpose:

- pure model, transform, selection, and projection semantics

Tools:

- fast package-local runner
- current Slate mix is acceptable short-term
- longer-term, Vitest-style project splits are cleaner than Mocha/Jest drift

Steal from:

- Slate v2 proof packages
- edix Vitest split
- TanStack DB / urql test organization

## Layer 1: DOM Contract Tests

Purpose:

- DOM translation, selection math, placeholder shape, clipboard DOM adaptation
- focused browser-backed contracts for one seam at a time
- no example-app orchestration

Tools:

- fast browser-backed contract tests, not only jsdom
- best future direction: Vitest browser + Playwright provider for small contract
  lanes

Steal from:

- edix `vitest.config.ts`
- rich-textarea `vitest.config.ts`

## Layer 2: Example Integration Tests

Purpose:

- assert real editor behavior on real app/example surfaces
- cross-feature flows and product-shaped regressions
- use when the behavior only makes sense once the full example is mounted

Tools:

- Playwright

Steal from:

- Slate existing Playwright example tests
- VS Code multi-entry lane organization

## Lane A: IME / Composition

Purpose:

- empty-state composition
- placeholder-sensitive composition
- range/selection after commit
- browser-ordering quirks

Tools:

- Chromium Playwright + CDP for first lane
- later WebKit/Safari regression lanes where needed

Steal from:

- Lexical IME e2e tests
- edix IME e2e tests

Strong take:

- this lane must exist
- jsdom composition is not enough

## Lane B: Agent-Native

Purpose:

- cover actions that humans can do but deterministic browser scripts either
  express badly or not at all

Examples:

- weird selection drags
- multi-step context-menu workflows
- visual proofreading of cursor/toolbar state
- copy/paste flows where OS/browser glue matters

Tools:

- `dev-browser`
- `agent-browser`

Rules:

- every agent-native test still needs explicit assertions or artifacts
- screenshots, DOM dumps, selection dumps, and event logs must be captured
- this lane complements deterministic suites; it does not replace them

## Lane C: Performance

Purpose:

- benchmark real editor behaviors without mixing them into correctness suites

Steal from:

- Premirror testing strategy
- Pretext benchmark/accuracy scripts
- VS Code explicit perf command separation

## Agent-Native Review

Using the `agent-native-reviewer` lens, the future framework should require:

1. Every critical user action has at least one deterministic test lane.
2. Every action Playwright cannot faithfully express has an agent-native lane.
3. Agent-native runs operate in the same workspace and examples as human tests.
4. Capabilities are explicit, not tribal knowledge.

Current gap:

- Slate has Playwright example tests, but no first-class documented
  agent-native lane for editor actions

That is a real framework gap.

## Recommended Stack

Do **not** chase a single universal runner.

Best stack is:

- fast local/unit layer:
  current package runners, converging toward Vitest-style project splits
- browser contract layer:
  Vitest browser + Playwright provider
- integration/e2e layer:
  Playwright
- IME layer:
  Playwright + Chromium CDP composition helpers
- perf layer:
  explicit benchmark scripts
- agent-native layer:
  `dev-browser` / `agent-browser`

## Adoption Order

1. Keep the current public package/API tranche stable.
2. Strengthen `openExample(...)` into a real readiness contract.
3. Build the renderer/input-policy gauntlet for zero-width and IME-sensitive
   empty-state behavior.
4. Add `test:slate-browser:cross` only after that contract is stable.
5. Add `test:slate-browser:perf` and maybe `test:slate-browser:accuracy`
   after correctness lanes stop moving.
6. Keep the agent-native lane as a later extension seam, not the next core
   tranche.

## Bottom Line

The best future testing framework is:

- **Lexical’s IME realism**
- **Slate’s example-driven Playwright harness**
- **edix and rich-textarea’s browser-contract speed**
- **Premirror’s determinism/perf discipline**
- **VS Code’s layered lane organization**
- **agent-browser/dev-browser for agent-native parity**

Not:

- one runner
- one suite
- one fake jsdom composition test pretending it solved IME
