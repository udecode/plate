---
date: 2026-05-23
topic: slate-v2-selection-clipboard-followup-clusters-ralplan
status: done
skill: slate-ralplan
scope:
  - cluster 20 blur and unfocused selection updates
  - cluster 22 Safari Cyrillic spellcheck, testable subset only
  - cluster 25 inline DOM end selection
  - cluster 21 inline void copy/paste
  - cluster 19 recorded as already reworked
---

# Slate v2 Selection / Clipboard Follow-up Clusters Ralplan

## Current Verdict

Do not rearchitect the editor runtime for this lane.

Cluster 19 has already had the important scroll-selection work. This plan must
not spend another pass on the same architecture unless a fresh regression test
fails. Keep `#5088` and `#5473` as related unless Ralph adds exact
after-update/delete-empty-paragraph browser proof.

The next useful execution work is:

- cluster 20: add exact browser proof for blur and unfocused selection updates;
- cluster 22: add only honest, testable WebKit/native-input guards; do not
  claim real Safari spellcheck correctness from Playwright;
- cluster 25: preserve existing inline-boundary proof and decide whether
  `#3150` deserves a narrower exact browser row or stays related to `#3148`;
- cluster 21: preserve existing inline-void clipboard proof and keep `#4802`
  as `Improves`, not `Fixes`, unless a named external-editor repro is proven.

Initial score: `0.88`.
Current score after related-issue-discovery pass: `0.89`.
Current score after issue-ledger pass: `0.90`.
Current score after intent-boundary-decision-brief pass: `0.91`.

## Intent And Boundary

Intent: process the next non-Android selection/input/clipboard issue clusters
without reopening solved architecture or overclaiming browser-specific behavior.

Desired outcome: a Ralph-ready execution plan with focused tests, conservative
issue claims, and no public API churn unless exact proof exposes a real gap.

In scope:

- Slate React selection import/export when blur or unfocused updates happen.
- WebKit/macOS-testable Cyrillic/native-input guard rows.
- Inline DOM-end selection and inline boundary typing/paste rows.
- Inline void browser clipboard payload, paste, cut, and external target proof.
- Issue ledger sync when execution changes a claim.

Non-goals:

- Android or iOS device claims.
- Real Safari spellcheck underline/dictionary assertions from Playwright.
- Rewriting the scroll-selection architecture from cluster 19.
- New Plate product APIs.
- Closing `#4802` against unnamed third-party editors.

Decision boundaries:

- Ralph may add focused unit/browser tests and small runtime fixes in
  `.tmp/slate-v2`.
- Ralph may promote `#4376`, `#5171`, or `#3150` only with exact browser proof.
- Ralph must keep `#5095` and `#5096` related unless real Safari/device proof
  exists. WebKit smoke tests can only be guardrails.
- Ralph must preserve existing fixed claims for `#3148` and `#4806`.

Unresolved user-decision points: none. "22: go only what is testable" means
desktop/WebKit guardrails are allowed, device/spellcheck claims are not.

Intent-boundary pass result:

- intent, desired outcome, in-scope behavior, non-goals, and decision
  boundaries are explicit;
- no user question is needed;
- the weakest boundary is cluster 22, and it is resolved by the explicit rule:
  WebKit/native-input guardrails are allowed, but real Safari spellcheck claims
  require real Safari/device evidence;
- cluster 19 is explicitly outside this lane unless a fresh test fails.

## Decision Brief

Principles:

- Browser-specific claims need matching browser proof.
- Native spellcheck is not equivalent to typed-text stability.
- Current public APIs stay unless a repro proves they are insufficient.
- Existing exact fixes are regression gates before new work.

Top drivers:

- Cluster 20 still has related rows only for Safari blur and Firefox unfocused
  update behavior.
- Cluster 22 is mostly not automatable without real Safari spellcheck evidence.
- Cluster 25 and 21 already have strong adjacent exact fixes.

Options:

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| Combined follow-up lane | Reuses selection and clipboard setup; keeps issue accounting together | Mixed proof types require strict claim discipline | Chosen |
| Separate plan per cluster | Cleaner paper trail per issue | Too much overhead for mostly proof-preservation work | Rejected |
| Full runtime rewrite | Could unify selection/input/clipboard under one abstraction | Wasteful; current owners are already correct | Rejected |

Chosen option: one execution lane with independent proof rows and conservative
claim rules.

Consequences:

- This plan may finish with no new `Fixes` claim.
- Cluster 22 probably stays related after execution.
- Cluster 19 remains out of scope unless proof regresses.

Follow-ups:

- If cluster 20 exposes a missing runtime abstraction, split a dedicated
  selection-frame plan.
- If `#4802` needs closure, define a named external-editor fixture instead of
  pretending a generic contenteditable target is enough.

Decision-brief pass result:

- principles, top drivers, viable options, rejected alternatives,
  consequences, and follow-ups are recorded;
- the chosen option remains one combined execution lane because the clusters
  share runtime proof setup but not claim semantics;
- the rejected full-runtime rewrite is intentionally kept rejected because live
  source already has clear owners for selection, native input, and clipboard;
- the plan is ready for the research/source refresh pass.

## Source-Backed Architecture North Star

Keep one runtime owner per behavior:

- selection runtime owns focus, blur, DOM import/export, and stale-selection
  prevention;
- native input runtime owns beforeinput/input policy and Safari/WebKit guard
  behavior;
- DOM clipboard runtime owns DataTransfer formats and Slate fragment transport;
- browser examples prove user-visible editing, copy, paste, cut, and follow-up
  typing.

No public API change is accepted in the current-state pass.

## Current Source Read

Cluster and issue ledgers:

- `docs/slate-issues/gitcrawl-recluster-map.md` maps cluster 20 to `#4376` and
  `#5171`, cluster 22 to `#5095` and `#5096`, cluster 25 to `#3148/#3150`, and
  cluster 21 to `#4802/#4806`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` keeps `#4376`, `#5171`,
  `#5095`, and `#5096` related.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` already claims
  `Fixes #3148` and `Fixes #4806`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` keeps `#3150` related and
  `#4802` improved.

Live Slate v2 source:

- `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts:226`
  owns blur/focus selection policy; WebKit blur currently removes DOM ranges.
- `.tmp/slate-v2/packages/slate-react/src/editable/runtime-selection-engine.ts:30`
  owns throttled selectionchange import and model/native ownership traces.
- `.tmp/slate-v2/packages/slate-react/src/editable/selection-runtime.ts:33`
  owns selection export policy after commits, including deferred DOM export for
  content-changing commits.
- `.tmp/slate-v2/packages/slate-react/test/selection-runtime-contract.test.ts:42`
  through `340` covers model-vs-DOM export policy, content-changing commit
  deferral, and text-input repair skip behavior.
- `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx:86` exposes
  `scrollSelectionIntoView`, `onDOMBeforeInput`, and native div props; `:322`
  passes `spellCheck` through when beforeinput support exists.
- `.tmp/slate-v2/packages/slate-react/src/editable/model-input-strategy.ts:69`
  owns React `onInput` handling and native input repair.
- `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts:92`
  owns DOM beforeinput routing and model/native input decision setup.
- `.tmp/slate-v2/playwright/integration/examples/inlines.test.ts:130` proves
  following text start stays distinct from inline end; `:305` proves padded
  inline caret placement.
- `.tmp/slate-v2/playwright/integration/examples/mentions.test.ts:249` proves
  deterministic selected mention clipboard payload; `:328` proves selected
  mention cut and model-owned caret repair.
- `.tmp/slate-v2/playwright/integration/examples/document-state.test.ts:256`
  proves a document-level spellcheck state field drives the `spellCheck` prop,
  but it does not prove native Safari spellcheck.

Already reworked cluster 19:

- `docs/plans/2026-05-11-slate-v2-scroll-selection-visibility-ralplan.md`
  accepts selection import first, scroll request second, post-update visibility
  third.
- `.tmp/slate-v2/packages/slate-react/test/app-owned-customization.tsx:501`
  proves scroll forwarding.
- `.tmp/slate-v2/packages/slate-react/test/app-owned-customization.tsx:532`
  proves remote selection updates skip scroll forwarding.

## Ecosystem Strategy Synthesis

| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ProseMirror | `docs/research/sources/editor-architecture/scroll-selection-visibility-runtime.md` | Transactions separate selection, update, and scroll intent | stale scroll/caret reveal | post-update selection and scroll proof discipline | integer positions as public model | cluster 20 browser rows should prove post-update selection ownership | partial |
| Lexical | `docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md` | Native events feed an update lifecycle with explicit selection reconciliation | browser timing patches scattered in React handlers | model/native ownership traces and DOM import before native input | class-node/$ helper API | keep Slate data-model first, runtime-owned selection/input lanes | agree |
| Tiptap | `docs/research/sources/editor-architecture/scroll-selection-visibility-runtime.md` | Product command delegates focus/scroll to ProseMirror engine | app commands owning engine truth | simple app-facing boundary only | product wrapper APIs in raw Slate | keep raw Slate unopinionated; Plate can wrap later | partial |
| React 19.2 | `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md` | External-store subscriptions and background UI primitives | broad render churn during editor interactions | selector-first runtime proof and urgent visible editing | React as editor engine | keep React as projection consumer, not selection truth | agree |
| Slate v2 clipboard | `docs/plans/2026-05-23-slate-v2-clipboard-fragment-serialization-ralplan.md` | Core model fragment, DOM DataTransfer, React event routing split | product parser leaking into raw Slate | preserve exact inline-void clipboard proof | public raw `editor.clipboard` namespace | cluster 21 is proof preservation plus possible named external fixture | agree |

## Public API Target

Keep:

- `Editable scrollSelectionIntoView?: (editor, domRange) => void`
- `Editable onDOMBeforeInput`
- normal React div props such as `spellCheck`
- DOM-hosted `editor.api.clipboard` capability

Do not add:

- public blur-selection policy props;
- public Safari spellcheck workaround props;
- a new raw Slate clipboard namespace;
- a broad inline-boundary normalization hook for `#3150`.

## Internal Runtime Target

Cluster 20:

- prove blur clears focus without losing model selection identity;
- prove unfocused editor changes do not import invalid browser selections;
- keep selectionchange ownership explicit in kernel traces when possible.

Cluster 22:

- preserve native `spellCheck` pass-through;
- prove Cyrillic text insertion survives WebKit/native input routing when
  `spellCheck` is enabled;
- do not assert browser spellcheck dictionary/UI from Playwright.

Cluster 25:

- preserve inline end vs following text start distinction;
- only add a `#3150` exact row if the original inline DOM end repro can be
  expressed as a modern browser contract.

Cluster 21:

- preserve selected inline void clipboard payload, paste, cut, and caret repair;
- keep `#4802` improved unless execution uses a named external editor target.

## Hook / Component / Render DX Target

No app example should need dirty focus restoration helpers or custom DOM
selection imports for these clusters.

Expected app DX:

```tsx
<Editable spellCheck scrollSelectionIntoView={onScrollSelectionIntoView} />
```

Clipboard and inline/void behavior should be runtime behavior, not example app
logic.

## Plate Migration Backbone

Plate can consume these outcomes without special adapters:

- blur/focus selection stability becomes a raw Slate guarantee;
- spellcheck remains a normal DOM prop plus document-state/user preference;
- inline-boundary behavior stays in Slate runtime, not Plate plugins;
- product-specific paste/export policy remains a Plate extension lane.

No current-version Plate adapter is required for this plan.

## slate-yjs Migration Backbone

Collaboration pressure is limited to selection identity and deterministic
clipboard operations:

- remote/unfocused changes must not import the wrong local DOM selection;
- clipboard cut/paste must produce deterministic operations;
- no yjs-specific API is needed.

## Research / Source Refresh Pass

Status: complete.

Compiled research checked:

- `docs/research/sources/editor-architecture/scroll-selection-visibility-runtime.md`
  confirms the cluster 19 direction: selection import first, update second,
  post-update scroll/visibility third. No cluster 19 rewrite belongs in this
  lane.
- `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md`
  confirms React should stay the projection/subscription layer. It should not
  become selection truth.
- `docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md`
  confirms the current target: Slate data model first, transaction/runtime-owned
  selection and native-input lanes, React as consumer.
- `docs/research/decisions/clipboard-and-delete-commands-need-explicit-lanes.md`
  confirms clipboard and delete behavior should stay explicit lanes, not
  incidental editing side effects.

Live source checked:

- `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts:227`
  through `305` keeps blur/focus selection policy local to the reconciler.
- `.tmp/slate-v2/packages/slate-react/src/editable/runtime-selection-engine.ts:47`
  through `116` keeps selectionchange import and ownership traces centralized.
- `.tmp/slate-v2/packages/slate-react/src/editable/selection-runtime.ts:33`
  through `240` keeps model-to-DOM export policy explicit, including deferred
  DOM export after content-changing commits.
- `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx:86` through
  `104` keeps `scrollSelectionIntoView` public and narrow; `:322` through
  `326` keeps `spellCheck` as a normal DOM prop pass-through when supported.
- `.tmp/slate-v2/packages/slate-react/src/editable/model-input-strategy.ts:72`
  through `188` keeps native text-input repair in the input lane.
- `.tmp/slate-v2/packages/slate-react/test/selection-runtime-contract.test.ts:42`
  through `163` and `:220` through `340` already cover the selection export
  contract, deferred export, and repaired text-input skip behavior.
- `.tmp/slate-v2/playwright/integration/examples/inlines.test.ts:130` through
  `162` and `:305` through `338` already cover inline-boundary proof needed for
  cluster 25 preservation.
- `.tmp/slate-v2/playwright/integration/examples/mentions.test.ts:249` through
  `400` already covers selected inline void copy/cut payload and caret repair
  needed for cluster 21 preservation.
- `.tmp/slate-v2/playwright/integration/examples/document-state.test.ts:256`
  through `286` proves a document state field can drive spellcheck state, but
  does not prove native Safari dictionary/UI behavior.

Decision:

- No target change.
- Cluster 20 still needs exact browser proof before fixed claims.
- Cluster 22 remains guardrail-only unless real Safari/device proof exists.
- Clusters 25 and 21 should preserve existing fixed/improved rows rather than
  widen claims from generic coverage.

## Issue Ledger Accounting

ClawSweeper pass status: applied through existing completed ledgers. No broad
live GitHub discovery is needed.

Related-issue discovery pass result:

- direct live rows exist for every target issue in
  `docs/slate-issues/gitcrawl-live-open-ledger.md`;
- manual sync rows already exist for `#4376`, `#5171`, `#5095`, `#5096`,
  `#3148`, `#3150`, `#4802`, and `#4806`;
- fork dossier sections already exist for every target issue;
- adjacent focus/scroll pressure to carry as related-only context:
  `#5538`, `#4995`, `#3893`, `#5867`, and `#5559`;
- adjacent inline-boundary proof rows to preserve: `#4074`, `#3429`, and
  `#4618`;
- adjacent void/delete proof rows to preserve while touching inline void
  clipboard behavior: `#3991` and `#4301`;
- no issue classification changed in this pass, so dossier, matrix, manual sync,
  and PR reference files remain unchanged.

Issue-ledger pass result:

- `docs/slate-issues/package-impact-matrix.md` keeps this whole lane in the
  runtime boundary: selection/focus/DOM bridge, mobile/input semantics, and
  clipboard serialization belong to `slate-react` plus `slate-dom`, not raw
  `slate` core.
- `docs/slate-issues/requirements-from-issues.md` reinforces the same boundary:
  DOM selection and input ownership must be explicit, and the runtime should
  stop leaking browser/input-method debt into normal editing.
- `docs/slate-issues/benchmark-candidate-map.md` does not add a required
  benchmark owner for this lane. No performance benchmark is required unless
  execution changes hot clipboard or selection loops.
- `docs/slate-issues/test-candidate-map/4541-4392.md` marks `#4376` as
  `ready-with-minor-setup` with public seam "selection persistence across blur
  in Safari".
- `docs/slate-issues/test-candidate-map/5246-5130.md` marks `#5171` as
  `ready-now` with public seam "Firefox invalid selection update while
  blurred".
- `docs/slate-issues/test-candidate-map/5129-5066.md` marks `#5095` and
  `#5096` as `blocked-on-repro`, so they stay related unless new real Safari
  evidence appears.
- `docs/slate-issues/test-candidate-map/3313-2733.md` marks `#3148` and
  `#3150` as upstream-boundary constraints, not direct local red-test
  candidates. Existing exact `#3148` browser proof remains enough; `#3150`
  should not become a fixed row from generic coverage.
- `docs/slate-issues/test-candidate-map/4839-4742.md` marks `#4806` and
  `#4802` as `ready-now`; execution should preserve `#4806` and can only
  promote `#4802` with a stronger external-editor fixture.
- no contradiction was found between package ownership, requirements, candidate
  maps, current matrix rows, and the plan issue matrix.

| Issue | Cluster | Claim | Why | Proof route | V2 sync ledger | PR line |
| --- | --- | --- | --- | --- | --- | --- |
| `#5088` | 19 | Related | Scroll after-update family already reworked but exact after-update row is not claimed here. | preserve existing scroll tests; add only if regression appears | unchanged | related matrix only |
| `#5473` | 19 | Related | Delete-empty-paragraph scroll callback needs exact browser proof; not this lane unless regression emerges. | optional focused browser row | unchanged | related matrix only |
| `#4376` | 20 | Candidate Fixes | Safari blur null-selection may be provable through WebKit blur/focus browser row. | WebKit/Chromium selection blur browser proof plus package selection contract | update if exact proof passes | fixed line only if exact proof passes |
| `#5171` | 20 | Candidate Fixes | Firefox invalid unfocused update may be provable through a focused Firefox browser row. | Firefox browser row for unfocused content update plus selection contract | update if exact proof passes | fixed line only if exact proof passes |
| `#5095` | 22 | Related | iOS Safari spellcheck is `blocked-on-repro` and requires real iOS Safari proof. | no fixed claim without device proof | unchanged | related matrix only |
| `#5096` | 22 | Related | macOS Safari spellcheck is `blocked-on-repro`; WebKit typed-text stability is only a guardrail. | WebKit Cyrillic/native-input guard only | unchanged unless real Safari proof exists | related matrix only |
| `#3148` | 25 | Fixes | Existing browser proof distinguishes inline end and following text start. | preserve inlines Playwright row | unchanged | keep existing Fixes line |
| `#3150` | 25 | Related | Candidate map says this is upstream-boundary tracking, not a direct red-test candidate. | preserve `#3148` proof; no fixed claim | unchanged | related matrix only |
| `#4802` | 21 | Improves | External contenteditable target is proven; named other-editor behavior is not. | preserve mentions clipboard payload row; optional named fixture | unchanged | keep Improves |
| `#4806` | 21 | Fixes | Existing browser proof covers selected inline void copy, paste, cut, payload, and caret repair. | preserve mentions Playwright rows | unchanged | keep existing Fixes line |
| `#5538` | singleton adjacent | Related | Programmatic focus/select-to-end scroll behavior is adjacent scroll-selection pressure, not part of this execution lane. | no new proof unless cluster 19 regresses | unchanged | related matrix only |
| `#4995` | singleton adjacent | Related | Scroll customization pressure is cluster 19-adjacent and already covered by app-owned scroll callback proof. | preserve app-owned customization tests | unchanged | related matrix only |
| `#3893` | singleton adjacent | Related | External button focus is related focus-state pressure; cluster 20 may strengthen it but does not target exact closure. | no exact proof in this lane | unchanged | related matrix only |
| `#5867` | singleton adjacent | Related | Selected mention focus restoration overlaps inline void/focus behavior, but exact `DOMEditor.focus` closure is not claimed. | no exact proof in this lane | unchanged | related matrix only |
| `#5559` | singleton adjacent | Related | Shift-click through voids is related selection import pressure, but this lane targets blur/unfocused and inline clipboard. | no exact proof in this lane | unchanged | related matrix only |
| `#4074`, `#3429` | cluster 5 adjacent | Fixes | Existing inline-boundary rows must remain green when touching cluster 25. | preserve inlines Playwright rows | unchanged | keep existing Fixes lines |
| `#4618` | cluster 5 adjacent | Not claimed | The plan does not add a public `normalizePoint` hook. | no proof route | unchanged | related matrix only |
| `#3991`, `#4301` | cluster 17 adjacent | Fixes | Existing void delete/selection rows must remain green when touching inline void clipboard behavior. | preserve images Playwright rows if clipboard code changes | unchanged | keep existing Fixes lines |

PR-description status: unchanged in this pass. Execution must update it only if
new exact fixed/improved claims are added.

Fork issue dossier status: existing sections cover all touched issues. Execution
must refresh only sections whose claim changes.

## Revision / Issue Sync Pass

Status: complete.

Checked:

- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-v2/references/pr-description.md`

Decision:

- No ledger or PR-reference write is needed in this planning pass.
- The plan hardened no-overclaim rules but did not promote, demote, or rewrite
  any current fixed/improved claim.
- `#3148` and `#4806` remain fixed; `#4802` remains improved.
- `#4376`, `#5171`, `#5095`, `#5096`, and `#3150` remain related/candidate
  rows until Ralph produces exact browser proof.
- The PR description already contains fixed/improved rows for exact claims and
  does not list the candidate related issues as fixed.

Sync rule for Ralph:

- If execution proves `#4376`, `#5171`, or `#3150` exactly, update the coverage
  matrix, fork dossier, manual sync ledger, and PR reference in the same slice.
- If execution only preserves existing behavior or adds guardrails, leave those
  rows related and update only the plan/execution evidence.

## Legacy Regression Proof Matrix

| Surface | Required proof | Current owner |
| --- | --- | --- |
| Blur selection | browser row plus package selection runtime contract | `.tmp/slate-v2/packages/slate-react/test/selection-runtime-contract.test.ts` |
| Unfocused update | Firefox browser row or no fixed claim | new Ralph test |
| WebKit Cyrillic guard | WebKit typed text plus `spellCheck` pass-through | new Ralph test or document-state extension |
| Inline DOM end | existing inlines rows plus optional `#3150` exact row | `.tmp/slate-v2/playwright/integration/examples/inlines.test.ts` |
| Inline void clipboard | existing mentions rows | `.tmp/slate-v2/playwright/integration/examples/mentions.test.ts` |

## Browser Stress / Parity Strategy

- Chromium: preserve existing inline and clipboard rows.
- Firefox: target cluster 20 unfocused update behavior.
- WebKit: target cluster 20 blur behavior and cluster 22 typed Cyrillic guard.
- Mobile/iOS: no claim.

## Applicable Implementation-Skill Review Matrix

| Lens | Applicability | Finding | Plan delta |
| --- | --- | --- | --- |
| Vercel React | applied | Selection/input should stay external-store/runtime-owned; no broad render subscriptions. | Require package selection contract and focused browser rows. |
| performance-oracle | skipped | No new hot algorithm or large-doc path proposed. | No perf benchmark required. |
| performance | applied lightly | Clipboard/selection rows must not widen to degraded virtualization behavior. | Keep DOM/native behavior proof explicit. |
| tdd | applied | Execution should add one focused failing browser row before runtime changes. | Red-green browser proof required for any new claim. |
| shadcn | skipped | No UI chrome or component composition change. | None. |
| react-useeffect | skipped | No new effect design proposed. | None. |

## High-Risk Deliberate Mode

Triggered because the lane touches browser selection, focus, native input, and
clipboard behavior.

Pre-mortem:

- A Firefox/WebKit test passes synthetically but does not match the real issue.
- A fix preserves model selection but breaks native text input/spellcheck.
- A clipboard change fixes inline voids but leaks neighboring text or FEFF.

Proof plan:

- unit/package selection runtime contract;
- browser rows per issue family;
- no fixed claims for non-assertable native spellcheck UI;
- rerun existing inlines and mentions regression rows before claim sync.

Blast radius:

- `slate-react` selection/input runtime;
- `slate-dom` clipboard runtime if cluster 21 changes;
- inlines, mentions, document-state examples;
- issue coverage matrix, fork dossier, PR reference.

Rollback answer:

- If exact browser proof is not possible, keep the issue related/improved.
  Do not bend public API around unproven behavior.

Pressure / objection pass result:

- Keep the architecture. The correct owner is still the runtime lane, not app
  examples, Plate wrappers, or a new public API.
- Strengthen claim discipline. `#4376`, `#5171`, `#5095`, `#5096`, `#3150`,
  and `#4802` must not be promoted from adjacent coverage.
- Require negative assertions where the failure mode is leak/collapse: blur
  must not destroy model selection identity, unfocused updates must not import
  stale DOM selection, inline text must not enter the link, and inline void
  clipboard payload must not include neighboring text or FEFF.
- Keep cluster 22 as testable guardrail only. WebKit typed-text stability with
  `spellCheck` enabled is useful; it is not a Safari spellcheck UI fix.
- Keep cluster 21 split: `#4806` can remain fixed through selected inline void
  clipboard proof; `#4802` remains improved unless a named external editor is
  proven.

High-risk execution rules for Ralph:

| Risk | Required guard | Claim rule |
| --- | --- | --- |
| WebKit/Firefox row passes but does not match the issue | Test the exact browser state transition, not just final text | keep candidate/related unless the original issue contract is represented |
| Blur fix clears DOM selection and loses Slate selection | Assert model selection identity after blur and after refocus/follow-up edit | `#4376` only with exact proof |
| Unfocused update imports stale browser selection | Assert commit/update does not mutate selection from inactive DOM | `#5171` only with Firefox-focused proof |
| Spellcheck guard becomes a fake Safari fix | Assert typed Cyrillic/native-input stability only | keep `#5095/#5096` related without real Safari proof |
| Inline-boundary row hides the `#3150` repro | Preserve existing inline tests and add an exact row only if expressible | keep `#3150` related otherwise |
| Clipboard test proves generic contenteditable only | Keep deterministic Slate fragment and external paste assertions | keep `#4802` improved unless named target proof exists |

Pressure score: `0.93`. Remaining risk is execution proof, not plan shape.

## Hard Cuts And Rejected Alternatives

- Cut reworking cluster 19 in this lane.
- Cut fixed claims for real Safari spellcheck without real Safari/device proof.
- Cut a public blur-selection API.
- Cut raw Slate product clipboard serializers.
- Cut claiming `#4802` fixed from a generic contenteditable target.

## Slate Maintainer Objection Ledger

| Change | Likely objection | Answer | Evidence | Verdict |
| --- | --- | --- | --- | --- |
| Add cluster 20 browser rows | "Are we testing browser quirks instead of Slate behavior?" | Yes, because these issues are browser-selection interop bugs; the runtime owns import/export timing. | `selection-reconciler.ts`, `runtime-selection-engine.ts` | keep |
| Add cluster 22 guard only | "Why not fix the spellcheck issue?" | Because real spellcheck UI/dictionary behavior is not assertable in Playwright WebKit. Guard native input without overclaiming. | `Editable` spellCheck pass-through and release-proof mobile gate | keep |
| Preserve `#4802` as Improves | "Why not close it if external paste works?" | The issue is about other editors; generic contenteditable is materially helpful but not exact. | `mentions.test.ts` clipboard rows | keep |
| Avoid public escape hatches | "Should users get props for blur policy, point normalization, or clipboard serialization?" | No. These are runtime correctness concerns or product extension concerns; raw Slate should stay small. | Public API target and rejected alternatives | keep |
| Keep cluster 19 out | "Why not revisit scroll selection since it is nearby?" | Because that lane is already reworked. Touch it only if the new focused tests regress. | scroll-selection visibility plan and app-owned customization proof | keep |

## Pass Schedule And Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| current-state-read | complete | live ledgers, current `.tmp/slate-v2` selection/input/clipboard owners, research pages | created this plan and scoped cluster 19 out | none | Slate Ralplan |
| related-issue-discovery | complete | live ledger rows, manual sync rows, fork dossier, coverage matrix, and PR reference searched for target plus adjacent issue refs | added adjacent related-only and preserve-only rows; no ledger files changed | none | Slate Ralplan |
| issue-ledger-pass | complete | package-impact matrix, requirements, benchmark map, and test-candidate maps checked | tightened blocked-on-repro and not-direct-test-candidate rows for clusters 22 and 25 | none | Slate Ralplan |
| intent-boundary-decision-brief | complete | intent/boundary record and decision brief validated | added pass result notes and kept cluster 22 proof boundary explicit | none | Slate Ralplan |
| research-source-refresh | complete | compiled research and current `.tmp/slate-v2` source/test owners checked | no target change; recorded exact proof boundaries for clusters 20, 22, 25, and 21 | none | Slate Ralplan |
| pressure-objection-high-risk | complete | high-risk matrix, negative assertion rules, and maintainer objections hardened | strengthened no-overclaim rules; no architecture change | none | Slate Ralplan |
| revision-and-issue-sync | complete | coverage matrix, fork dossier, manual sync ledger, and PR reference audited | no external ledger/reference write needed because no claim changed | none | Slate Ralplan |
| closure-final-gates | complete | all earlier passes complete; final handoff and gates written | closed Slate Ralplan planning lane; execution belongs to later Ralph | none | Ralph |

## Plan Deltas From Review

- Added a new plan lane instead of extending the completed non-Android cluster
  plan.
- Recorded cluster 19 as already reworked and out of scope.
- Split cluster 22 into testable guardrails versus non-claim Safari spellcheck
  UI.
- Preserved existing cluster 25 and 21 fixed/improved rows.
- Named exact issue claim rules for Ralph execution.

## Open Questions

None for planning. What would change the decision:

- real Safari/macOS spellcheck automation exists;
- user wants a named external-editor fixture for `#4802`;
- current inlines/mentions/browser rows fail under Ralph.

## Implementation Phases With Owners

Ralph execution status:

- Status: done.
- Current pass: `verification-sweep-pass`.
- Current owner: `.tmp/slate-v2` `slate-react` browser selection proof.
- Result: cluster 20 exact blur/unfocused selection rows promote `#4376` and
  `#5171`; cluster 22 stays guardrail-only; clusters 25 and 21 preserve
  existing `#3148/#4806` proof while keeping `#3150` related and `#4802`
  improved.
- Continuation prompt:
  `active goal state`.
- Completion state:
  `active goal state`.

Phase 1, cluster 20:

- complete;
- added WebKit blur/refocus/follow-up typing proof for `#4376`;
- added Firefox unfocused editor update proof for `#5171`;
- no runtime fix was needed because the proof rows passed;
- synced `#4376/#5171` across coverage matrix, fork dossier, manual sync
  ledger, open issues ledger, and PR reference.

Phase 2, cluster 22:

- complete;
- added WebKit Cyrillic/native-input guard with `spellCheck` enabled;
- kept `#5095/#5096` related because this is not real Safari spellcheck UI or
  dictionary proof.

Phase 3, clusters 25 and 21:

- complete;
- reran existing inlines rows for `#3148` preservation;
- reran selected mention clipboard rows for `#4806` preservation;
- kept `#3150` related and `#4802` improved.

## Ralph Execution Results

Changed proof:

- `.tmp/slate-v2/playwright/integration/examples/document-state.test.ts` adds
  WebKit blur/refocus/follow-up typing proof, Firefox unfocused update proof,
  and WebKit Cyrillic typed-input guard with `spellCheck` enabled.
- `.tmp/slate-v2/playwright/integration/examples/decorations-async.test.ts`
  guards `selection.anchorNode` before passing it to `Range.setEnd`, closing the
  root typecheck blocker exposed during verification.

Claim changes:

- `#4376`: `Related` -> `Fixes`.
- `#5171`: `Related` -> `Fixes`.
- `#5095/#5096`: unchanged `Related`.
- `#3150`: unchanged `Related`.
- `#4802`: unchanged `Improves`.
- `#3148/#4806`: existing `Fixes` claims preserved.

Synced files:

- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-issues/open-issues-ledger.md`
- `docs/slate-v2/references/pr-description.md`

Verification:

- `bun typecheck:root`
- `bun lint:fix`
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/document-state.test.ts --project=webkit -g "focus leaves|unfocused editor|Cyrillic"`
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/document-state.test.ts --project=firefox -g "unfocused editor"`
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/inlines.test.ts --project=chromium -g "start of following text|padded inline"`
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/inlines.test.ts --project=webkit -g "start of following text"`
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/mentions.test.ts --project=chromium -g "selected mention"`

## Fast Driver Gates

Planning gate, cwd `/Users/zbeyens/git/plate-2`:

```bash
node tooling/scripts/completion-check.mjs
```

Execution gates, cwd `/Users/zbeyens/git/slate-v2`:

```bash
bun test ./packages/slate-react/test/selection-runtime-contract.test.ts
PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/inlines.test.ts --project=chromium -g "inline|padded"
PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/mentions.test.ts --project=chromium -g "mention"
PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/document-state.test.ts --project=webkit -g "spellcheck|Cyrillic"
bun --filter slate-react typecheck
bun lint:fix
```

Ralph may tighten greps after adding exact test names.

## Final User-Review Handoff Outline

Verdict:

- This plan is ready for Ralph execution.
- No Slate v2 source/test/example code was changed by Slate Ralplan.
- Architecture stays unchanged: selection, native input, and clipboard remain
  separate runtime-owned lanes.
- Public API stays unchanged: no blur-selection prop, no Safari spellcheck prop,
  no raw Slate clipboard serializer API, and no public inline point
  normalization hook.
- Cluster 19 stays out because scroll-selection visibility was already
  reworked.

Execution handoff:

1. Cluster 20: add exact blur/unfocused selection browser rows for `#4376` and
   `#5171`; fix only after a red row; promote claims only with exact proof.
2. Cluster 22: add only the testable WebKit/native-input Cyrillic guard with
   `spellCheck`; keep `#5095/#5096` related without real Safari/device proof.
3. Cluster 25: preserve existing `#3148` inline-boundary proof; keep `#3150`
   related unless the original repro becomes an exact browser row.
4. Cluster 21: preserve `#4806` selected inline void clipboard proof; keep
   `#4802` improved unless a named external editor is proven.
5. After execution, sync issue coverage, fork dossier, manual sync ledger, and
   PR reference only for claims that actually change.

## Final Completion Gates

Status: done.

Closed:

- related-issue discovery pass closed;
- issue-ledger pass closed;
- intent/decision/research/pressure passes closed;
- revision/issue sync pass closed;
- issue coverage/fork dossier/PR reference audited with no planning-time claim
  change;
- final handoff emitted.

Deferred to Ralph execution:

- `.tmp/slate-v2` focused gates for any new behavior claim;
- issue coverage/fork dossier/PR reference updates if execution promotes a
  candidate issue.
