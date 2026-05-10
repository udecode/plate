---
date: 2026-05-04
topic: slate-v2-clawsweeper-v2-input-runtime-ralplan
status: slate-ralplan-done
skill: slate-ralplan
bucket: v2-input-runtime
source_plan: docs/plans/2026-05-04-slate-v2-full-issue-ledger-architecture-ralplan.md
---

# Slate v2 ClawSweeper `v2-input-runtime` Ralplan

## Verdict

The next bucket is `v2-input-runtime`, not `v2-react-runtime`.

The old execution checkpoint says `react-runtime-projection-proof` next, but the
same checkpoint also says the pending target is converting `v2-input-runtime`
into proof slices. The issue matrix makes the call: `v2-input-runtime` is the
largest action bucket with `149` rows, and the issue requirements rank mobile,
IME, and input semantics as the highest-priority theme.

Hard take: **do not claim Android/IME fixes from desktop Playwright.** The first
tracer proved the kernel can keep composition-owned keydown browser-owned. The
bucket is not resolved until beforeinput, composition, placeholder, Android/iOS,
keyboard-layout, and selection-repair policy have executable proof, with raw
device proof for mobile claims.

Slate Ralplan state: **done**. The previous `ready-for-ralph-execution` label
was too fast, so this plan was reopened and pass-gated. Every scheduled review
pass is now complete, the score is at threshold, issue accounting is synced, and
the closure handoff is recorded.

Current owner: none.

Next runnable step: hand this plan to `ralph` for execution when the user wants
implementation work. This plan itself does not patch `../slate-v2`.

## Intent And Boundary

Intent:

- turn the `v2-input-runtime` ClawSweeper bucket into executable issue-driven
  slices, not a vague "input cleanup" bucket;
- make browser input a runtime protocol with traceable ownership decisions;
- preserve raw Slate's unopinionated surface while giving apps stable input
  extension points.

Desired outcome:

- Slate v2 has a first-class input runtime that owns beforeinput, composition,
  mobile input, placeholder/empty-state input, keyboard-layout hotkeys, and
  input-driven selection repair;
- every issue-facing slice can say which subsystem owns the behavior, what proof
  can promote the claim, and which claims stay out of scope;
- no Android/iOS/IME issue is accidentally auto-closed by desktop-only proof.

In scope:

- `slate-react` runtime input pipeline;
- `slate-dom` point/range bridge only where input depends on DOM import/export;
- core transaction behavior only where suppressed input, selection, or history
  requires model consistency;
- browser examples, generated browser contracts, mobile proof contracts, issue
  ledger accounting, and PR-reference claim discipline.

Non-goals:

- no product autocomplete, slash-command, mention, toolbar, text-limit, or
  spellcheck policy in raw Slate;
- no Plate-level command/plugin UX in raw Slate;
- no promise that desktop, semantic mobile, or proxy mobile tests close raw
  Android/iOS issues;
- no resurrection of legacy `onDOMBeforeInput` as the main architecture;
- no exact closure for ecosystem/browser bugs where Slate can only expose a
  safer hook or fail-closed behavior.

Decision boundaries:

- Desktop browser proof can close desktop input rows only when it replays the
  reported browser/input family.
- Raw Android/iOS closure requires direct mobile proof artifacts; semantic or
  proxy mobile proof can support architecture confidence only.
- Raw Slate owns the input authority model, selection import policy, model/DOM
  synchronization, and fail-closed behavior.
- Apps own product policy: autocomplete choices, plugin input rules, text-limit
  decisions, slash-command UX, and editor-specific keyboard workflows.
- Core `slate` owns transaction consistency after a runtime decision; it does
  not own native browser event timing.
- `slate-dom` owns point/range import/export and fail-closed DOM resolution; it
  does not own React event scheduling.
- `slate-react` owns event wiring, input runtime state, composition lifecycle,
  and Android/iOS integration.
- Issue ledger rows stay `Related` unless an exact issue reproduction has a
  matching proof route.

Unresolved user-decision points:

- none for this planning pass. The remaining uncertainty is evidence/proof, not
  a product choice the user needs to answer.

## Source-Backed Current State

- Bucket size: `149` rows in
  `docs/plans/2026-05-04-slate-v2-full-issue-ledger-architecture-ralplan-issue-matrix.md`.
- Corpus priority: `docs/slate-issues/requirements-from-issues.md` says mobile,
  IME, and input semantics are the highest-priority theme and require explicit
  composition lifecycle, placeholder/empty-state behavior, Android/iOS
  reconciliation, and beforeinput policy.
- Current command kernel:
  `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts:39` defines
  browser event families; `:60` defines kernel states; `:125` defines typed
  command metadata; `:1051` prepares keydown ownership and import policy.
- Current beforeinput owner:
  `../slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts:83`
  wires the runtime beforeinput handler; `:120` prepares kernel decisions;
  `:181` delegates Android to the Android manager; `:230` syncs selection before
  model/native decisions; `:274` applies model-owned input.
- Current Android owner:
  `../slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts:8`
  adapts the Android input manager into the runtime; the manager contract starts
  in
  `../slate-v2/packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts:75`.
- Existing tracer:
  `../slate-v2/packages/slate-react/test/editing-kernel-contract.ts:265`
  proves keydown during active composition is browser-owned and does not import
  DOM/model-owned arrow movement.
- Release proof boundary:
  `../slate-v2/packages/slate-browser/test/core/release-proof.test.ts:55`
  rejects semantic/proxy mobile proof for raw device IME claims.

Current-state read result:

- agree: live source already has a typed editing kernel and beforeinput runtime
  owner.
- agree: Android has a dedicated manager, but raw mobile proof remains separate.
- partial: the issue coverage matrix already has many `v2-input-runtime`
  related rows, but the live gitcrawl open ledger itself is not yet updated with
  slice-specific sync status for this plan.
- gap: the plan does not yet have a completed objection ledger, high-risk
  deliberate pass, implementation-lens findings with concrete deltas, or a
  closure-score pass.
- stale claim corrected: previous `ready-for-ralph-execution` / `0.92` closure
  was not backed by the pass-state ledger required by `slate-ralplan`.

## Decision Brief

Principles:

- Browser input is a runtime protocol, not scattered handler code.
- Composition is a first-class state, not a boolean afterthought.
- Model-owned commands and native-owned input must not fight over selection.
- Mobile claims require real mobile proof.
- App input customization stays capability-based and narrow.

Drivers:

- `149` issue rows route to input runtime.
- IME/mobile bugs are user-visible data-loss and caret-loss failures.
- Legacy Slate had too many browser special cases without a unified authority
  model.
- Live Slate v2 already has typed browser event families and kernel states in
  `editing-kernel.ts`, so the plan should harden that architecture instead of
  inventing a second one.
- Live beforeinput handling already prepares a kernel decision, traces
  ownership, delegates Android, syncs selection, and applies model-owned input.
- Release proof already rejects semantic/proxy mobile artifacts for raw device
  IME claims.

Options:

| Option                                         | Verdict | Why                                                                                                |
| ---------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| Keep adding special cases in handlers          | reject  | Recreates legacy timing debt and makes issue closure impossible to prove.                          |
| Browser-native by default, Slate repairs later | reject  | Fails model/DOM desync, voids, marks, history, and custom renderers.                               |
| Model-owned everything                         | reject  | Breaks IME/composition and mobile keyboards.                                                       |
| Explicit input runtime with policy lanes       | choose  | Lets beforeinput, composition, Android, selection, and repair share one traceable authority model. |
| Product plugin policy in raw Slate             | reject  | Solves app behavior by hardcoding editor UX into the library.                                      |
| Exact mobile closure from semantic proof       | reject  | Would let the PR lie about Android/iOS keyboard behavior.                                          |

Chosen shape:

```txt
input event -> kernel intent -> ownership decision
  -> selection import policy
  -> native/model/app handling
  -> repair policy
  -> trace/proof artifact
```

Consequences:

- `v2-input-runtime` is a substrate lane, not a product-lane bucket.
- Android and IME rows stay expensive to close because real proof is expensive.
- Public extension points must be narrow and capability-based.
- The implementation order should start with ownership/proof contracts before
  broad behavioral fixes.
- Future app-level policy belongs in Plate or examples, not raw Slate core.

Follow-ups:

- research/source refresh must compare this boundary with Lexical,
  ProseMirror, Tiptap, React event guidance, and current Slate v2 source;
- performance pass must make sure the runtime does not add per-block listeners,
  effects, or per-leaf state;
- high-risk pass must challenge the Android/IME proof gate and app-policy
  boundary.

## Intent Boundary Pass

Status: complete.

Evidence used:

- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts:39` defines
  the event families owned by the runtime.
- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts:60` defines
  runtime states, including `composition`, `model-owned`, `app-owned`,
  `dom-selection`, and `shell-backed`.
- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts:125`
  defines command metadata with model-owned commands.
- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts:1051`
  prepares keydown ownership.
- `../slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts:120`
  prepares beforeinput kernel decisions.
- `../slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts:181`
  delegates Android beforeinput to the Android manager.
- `../slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts:230`
  syncs selection before model/native input handling.
- `../slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts:274`
  applies model-owned beforeinput.
- `../slate-v2/packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts:75`
  exposes the Android manager contract.
- `../slate-v2/packages/slate-react/test/editing-kernel-contract.ts:265`
  proves keydown during active composition stays browser-owned.
- `../slate-v2/packages/slate-browser/test/core/release-proof.test.ts:55`
  rejects semantic/proxy mobile proof for direct mobile claims.
- `docs/slate-issues/requirements-from-issues.md` R7 names input,
  composition, and IME semantics as first-class.

Weakest hidden assumption:

- The bucket contains React-runtime-looking rows because focus, external DOM,
  render timing, and editor identity often cause input loss. That does not mean
  the fix belongs to React subscription APIs first. It means input proof must
  include runtime/focus boundaries when they are the cause of input corruption.

Remaining ambiguity:

- no user question is needed. The remaining ambiguity is execution quality:
  hot-path cost, extension DX, migration pressure, regression coverage, and
  simplicity still need one pressure pass before this can close.

## Research And Live Source Refresh Pass

Status: complete.

Verdict:

- keep the explicit Slate v2 input runtime direction;
- do not revert to legacy handler accretion;
- do not copy Lexical's public command/class-node model;
- do not copy ProseMirror's schema/NodeView-first public mental model;
- do not copy Tiptap's product-command API into raw Slate;
- keep React as subscription/scheduling infrastructure, not the input engine.

Evidence:

| Source      | Evidence                                                                                                                                                                            | Plan consequence                                                                                                |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Slate v2    | `editing-kernel.ts:39` defines input event families; `:60` defines runtime states; `:125` defines command metadata; `:1051` prepares keydown policy.                                | Current direction is already live source shape; harden it instead of inventing a second runtime.                |
| Slate v2    | `runtime-before-input-events.ts:120`, `:181`, `:230`, and `:274` prepare beforeinput decisions, delegate Android, sync selection, and apply model input.                            | Beforeinput belongs in the runtime protocol, not app renderers or scattered handlers.                           |
| Slate v2    | `release-proof.test.ts:55` rejects semantic/proxy mobile proof for direct mobile claims.                                                                                            | Android/iOS issue closure remains gated on raw device proof.                                                    |
| Lexical     | `LexicalEvents.ts:161` centralizes root event families; `:633` lets composition beforeinput stay browser-owned; `:1182` skips keydown while composing.                              | Steal central input ownership and composition guards.                                                           |
| Lexical     | `LexicalEditor.ts:950` registers prioritized commands; `:1164` dispatches commands inside update; `:1375`/`:1386` define read/update boundaries.                                    | Keep `editor.update` as the write lifecycle, but do not make command dispatch the main Slate app API.           |
| Lexical     | `LexicalUpdates.ts:101` enforces read/update context and `:253` processes dirty leaves/elements before DOM reconciliation.                                                          | Keep commit/dirty metadata below React and avoid broad recompute.                                               |
| ProseMirror | `view/src/input.ts:46` installs root input handlers; `:106` handles keydown with composition/mobile guards; `:457` and `:502` own composition state.                                | Steal one view/input owner and explicit composition timing state.                                               |
| ProseMirror | `view/src/domchange.ts:81` reads DOM changes with composition metadata; `:223` builds transactions from DOM diffs; `view/src/selection.ts:9`/`:55` own DOM selection import/export. | Keep DOM selection import/export centralized and transaction-backed.                                            |
| Tiptap      | `Extension.ts:12` defines extension packaging; `CommandManager.ts:28`/`:59` build command and chain APIs; `InputRule.ts:24` and `:95` skip rules while composing.                   | Steal extension/input-rule DX for Plate-facing APIs, not raw Slate product policy.                              |
| Tiptap      | `extension-code/src/code.ts:90` packages commands, shortcuts, input rules, and paste rules together.                                                                                | Feature policy should compose as extensions outside the core input authority model.                             |
| React 19.2  | Compiled research says `useSyncExternalStore`, transitions, deferred values, Activity, and performance tracks are the relevant React primitives.                                    | React is good for selector subscriptions and non-urgent UI; it does not replace dirty-node/input runtime proof. |
| Slate React | `use-slate-projections.tsx:53`, `use-slate-annotations.tsx:65`, and `use-slate-widgets.tsx:77` use `useSyncExternalStore`.                                                          | Existing React posture is directionally right; the next pass must measure hot-path cost, not redesign React.    |

React source caveat:

- no local `../react` clone exists in this checkout. This pass uses the
  accepted compiled React 19.2 research page at
  `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md:29`.
  That is enough for the plan direction, but the performance pass must still
  produce local Slate v2 evidence instead of leaning on React doctrine.

Research result:

- external editors strengthen the current plan rather than overturn it;
- the best shared rule is one input/DOM bridge owner with explicit
  transaction/update context;
- the next pass should not ask "is the architecture right?" again. It should ask
  whether the runtime is cheap, minimal, migratable, and regression-proof enough
  to execute.

## Performance DX Migration Regression Pressure Pass

Status: complete.

Verdict:

- keep the input runtime, but require hard hot-path budgets before execution can
  claim readiness;
- keep `editor.update`, `editor.read`, `defineEditorExtension`, and
  `editor.extend` as the DX backbone;
- keep Plate/slate-yjs migration as an operation/commit/extension substrate
  story, not compatibility with their current adapter APIs;
- keep proof vertical: kernel ownership first, then browser behavior, then
  generated stress and raw-device gates.

### Performance

Applicable rules:

- Vercel React:
  `client-event-listeners`, `rerender-defer-reads`, `rerender-derived-state`,
  `rerender-transitions`, `rerender-use-ref-transient-values`,
  `advanced-event-handler-refs`, `js-index-maps`, `js-set-map-lookups`,
  `js-early-exit`, and `js-request-idle-callback`.
- Performance:
  `cohort-segmentation`, `repeated-unit-budget`, `rare-state-isolation`,
  `event-delegation-budget`, `effect-subscription-budget`,
  `interaction-inp-matrix`, `memory-dom-tagging`, `degradation-contract`,
  `staged-readiness`, `react-19-runtime-proof`,
  `production-rum-dashboard`, and `editor-native-behavior-proof`.
- React useEffect:
  effects are allowed for browser APIs, native listeners, ResizeObserver,
  focus, cleanup, and external-store synchronization. They are not allowed as
  default block/leaf derived state.
- Performance Oracle:
  hot lookups must be O(1) or bucketed by runtime id/range; registry and
  rendering-strategy lookups cannot scan the document in normal typing.

Live source evidence:

- `../slate-v2/packages/slate-react/src/editable/input-router.ts:100` attaches
  native `beforeinput` and `input` listeners at the editable root, and `:109`
  removes them from the same root.
- `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts:184`
  owns the document-level `selectionchange` listener and filters
  `INPUT`/`TEXTAREA` before scheduling editor selection work.
- `../slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts:48`
  records beforeinput segment durations only when
  `__SLATE_REACT_RENDER_PROFILER__` is enabled.
- `../slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts:120`
  through `:292` slices beforeinput into prepare, trace, root lookup, selection
  flush/read/sync, native decision, input rules, model apply, and repair.
- `../slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:294`
  applies input rules through one runtime loop and exits immediately when no
  rules exist.
- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:956`
  and `:984` own staged group mounting effects; `:1544` through `:1574` own
  placeholder measurement and cleanup.
- `../slate-v2/docs/libraries/slate-react/editable.md:233` documents
  `onRenderingStrategyMetrics` with cohort, strategy, mounted/pending counts,
  DOM coverage boundary counts, visible DOM node count, editable descendant
  count, browser/mobile/IME tags, and degraded-mode separation.
- `../slate-v2/docs/walkthroughs/09-performance.md:3` defines normal and large
  cohorts; `:7` makes typing INP the main guide metric; `:91` separates
  experimental virtualized rendering from normal staged/shell paths.

Budgets:

| Surface                                       | Budget                                                                                  |
| --------------------------------------------- | --------------------------------------------------------------------------------------- |
| Slate-owned event handlers per rendered block | `0`; input, selection, pointer, and composition events belong to root/runtime owners.   |
| Default per-leaf/per-text effects             | `0`; effects stay in root runtime, staged grouping, placeholder measurement, or stores. |
| Default input-rule overhead                   | one empty-array check and return when no rules exist.                                   |
| Hot lookup shape                              | O(1), runtime-id bucketed, or range-indexed; no document scan during typing.            |
| Rare UI state                                 | sidecar/portal/conditional mount only; not carried by every block.                      |
| Staged mounting                               | transitions allowed, but with `nativeSurfaceComplete` / max-latency proof.              |

Cohorts:

| Cohort                    | Default policy                                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| small/moderate `<1000`    | full DOM, native behavior, no degraded-mode claim.                                                               |
| large `10k+`              | staged DOM-present strategy with readiness metrics.                                                              |
| very large `25k+`/`50k+`  | shell strategy may be explicit and metric-tagged as degraded.                                                    |
| pathological `100k+`      | experimental virtualization stays a research/stress lane until native behavior proof is better.                  |
| mobile/IME-sensitive rows | direct browser/device proof decides claim level; desktop stress cannot promote raw Android/iOS issue resolution. |

Required performance proof rows:

- p50/p95/p99 INP for typing, delete, paste, select-all, and composition by
  cohort and rendering strategy;
- beforeinput segment durations for prepare, selection read/sync, native
  decision, input rules, model apply, and repair;
- DOM node count, editable descendant count, mounted/pending group counts,
  boundary counts, listener count, heap at ready, heap after typing, and
  background mount debt;
- trace rows for forced layout and style recalculation when selection,
  placeholder, scrolling, or shell/virtualized rendering changes.

Performance decision:

- the architecture is still acceptable, but the execution plan must not close
  until these budgets become explicit acceptance rows. This pass sets the gates;
  it does not claim benchmark success.

### DX And Migration

Live source evidence:

- `../slate-v2/docs/concepts/08-plugins.md:3` defines plugins as named editor
  extensions, `:5` names `defineEditorExtension(...)` and `editor.extend(...)`,
  and `:38` splits `state` for `editor.read(...)` from `tx` for
  `editor.update(...)`.
- `../slate-v2/docs/concepts/08-plugins.md:137` records dependency,
  peer-dependency, conflict, and cleanup behavior for extensions.
- `../slate-v2/docs/concepts/08-plugins.md:183` says read helpers cannot write
  and write helpers can read transaction-local state after prior writes.
- `../slate-v2/docs/concepts/08-plugins.md:217` keeps behavior vocabulary in
  element specs: `inline`, `void`, `atom`, `isolating`, `keyboardSelectable`,
  `readOnly`, `selectable`, `markableVoid`, and `editable-island`.
- `../slate-v2/docs/walkthroughs/07-enabling-collaborative-editing.md:36`
  exports operations, metadata, tags, and selection before/after from commits.
- `../slate-v2/docs/walkthroughs/07-enabling-collaborative-editing.md:60`
  imports remote operations through `tx.operations.replay(...)`.
- `../slate-v2/docs/walkthroughs/07-enabling-collaborative-editing.md:76`
  states that subscribers, history, extension listeners, and React projection
  observe the same commit shape.
- `../slate-v2/docs/walkthroughs/07-enabling-collaborative-editing.md:167`
  keeps collaboration/storage/local editors on the same extension backbone
  without adapter-shaped namespaces on the editor object.

DX decision:

- keep the raw Slate API unopinionated and capability-based;
- keep product input policy out of raw Slate input runtime;
- do not add `editor.api`, `editor.tf`, `commands` object maps, or
  adapter-shaped namespaces as a migration shortcut;
- migration proof is operation replay, commit metadata, extension state/tx, and
  schema/spec policy. Current Plate/slate-yjs public compatibility is not a
  closure prerequisite.

### Regression And TDD

Live proof evidence:

- `../slate-v2/packages/slate-react/test/editing-epoch-kernel-contract.ts:60`
  proves destructive beforeinput joins the active keydown epoch.
- `../slate-v2/packages/slate-react/test/editing-epoch-kernel-contract.ts:83`
  proves handled destructive keydown suppresses duplicate beforeinput command.
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts:260`
  through `:278` keeps selection/composition/Android construction out of the
  wrong owner.
- `../slate-v2/packages/slate-browser/test/core/scenario.test.ts:172` keeps
  generated stress parity out of the default check script and `:184` points the
  stress lane at `playwright/stress/generated-editing.test.ts`.
- `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts:401`
  commits IME composition through the browser editing path.
- `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts:431`
  runs a generated composition gauntlet and `:476` rejects illegal kernel
  transitions.
- `../slate-v2/playwright/stress/generated-editing.test.ts:980` defines a
  generated `selection-repair-ime` stress case.

TDD decision:

- each execution slice must start with one public behavior proof, not a broad
  implementation audit;
- unit/kernel proofs own authority invariants;
- package/browser proofs own model/DOM visible behavior;
- generated stress proofs stay outside default fast `check`;
- raw mobile proofs remain a separate release gate and cannot be replaced by
  semantic mobile handles.

### Simplicity

Keep:

- one input runtime owner;
- root/native event ownership;
- one input-rule loop with empty fast return;
- extension `state`/`tx` groups;
- sidecar/projection lanes for rare UI state.

Reject:

- scattered `onDOMBeforeInput`-style behavior as the main architecture;
- app/product input policy in raw Slate;
- per-block listeners/effects;
- adapter-shaped editor namespaces;
- virtualization as a default performance claim.

## Issue Accounting

ClawSweeper pass: related-issue discovery complete for the
`v2-input-runtime` surface.

Fixed issue claims: none added by this plan.

Issue-ledger pass: complete. The generated issue matrix summary had stale
action-bucket counts: `v2-input-runtime` is `149` rows, not `151`, and
`v2-react-runtime` is `26` rows, not `24`. The matrix summary was corrected to
match the actual row matrix.

Representative `v2-input-runtime` rows:

| Issue | Cluster                                  | Claim   | Why                                                                                   | Proof route                             |
| ----- | ---------------------------------------- | ------- | ------------------------------------------------------------------------------------- | --------------------------------------- |
| #6022 | mobile-ime-and-selection-sync            | Related | Android mark-toggle keyboard dismissal needs raw Android proof.                       | Android manager + future Appium row     |
| #5989 | mobile-ime-and-placeholder-composition   | Related | Hangul placeholder composition needs browser/mobile proof.                            | placeholder composition contract        |
| #5984 | mobile-ime-and-backspace-semantics       | Related | Android Chinese backspace needs device proof.                                         | Android delete/backspace row            |
| #5983 | mobile-ime-empty-state-input             | Related | Empty-state voice input needs Android proof.                                          | empty-state composition/device row      |
| #5931 | windows-and-cross-platform-ime-semantics | Related | Windows suggestion replacement needs desktop browser proof.                           | desktop IME/input replacement row       |
| #5883 | mobile-ime-empty-state-input             | Related | Android empty-node composition needs device proof.                                    | Android empty-node row                  |
| #5830 | composition-and-focus-lifecycle          | Related | Blur during Japanese/Korean composition needs composition/focus proof.                | composition focus lifecycle row         |
| #4001 | placeholder-and-ime-empty-editor         | Related | German keyboard/backtick placeholder crash needs keyboard-layout + placeholder proof. | hotkey/layout + placeholder browser row |

Live ledger sync: unchanged. The existing full-corpus classification already
routes these rows to `v2-input-runtime`.

Fork issue dossier sync: unchanged. Existing self-contained sections already
cover the reviewed input-runtime cluster and singleton rows. The issue-ledger
pass may tighten wording, but no new claim level was promoted here.

Coverage matrix sync: accounting row repair only. The malformed #6051 row was
split from #3551; no `Fixes #...` line was added.

PR description sync: unchanged. This plan changes execution order, not public
API or exact claims.

## Related Issue Discovery Pass

Status: complete.

Fresh corpus state:

- `gitcrawl doctor --json` reports `659` open Slate threads, `617` clusters,
  and `last_sync_at: 2026-05-04T14:58:11.123944Z`.
- `docs/slate-issues/gitcrawl-clusters.md` routes clusters 9, 11, 13, 16, and
  18 to Android/IME/input-boundary families.
- `docs/slate-issues/gitcrawl-recluster-map.md` already marks
  `android-ime-and-beforeinput` and `input-event-boundary-semantics` as reviewed
  under `v2-input-runtime`, with no exact closure claims.
- `docs/slate-v2/ledgers/fork-issue-dossier.md` already has sections for
  #6022, #5983, #4400, #5883, #6051, #3777, #5603, #5669, #4994, #5026,
  #4001, #5989, #5984, and #5130.

Reviewed cluster map:

| Cluster | Rows          | Discovery result                                                                 |
| ------- | ------------- | -------------------------------------------------------------------------------- |
| 9       | #6022 / #6027 | Android mark-toggle selection/keyboard family; raw Android proof required.       |
| 11      | #5983 / #6020 | Android empty-node voice/composition family; raw Android voice proof required.   |
| 13      | #4400 / #5883 | Android IME empty-node composition family; raw Android IME proof required.       |
| 16      | #5603 / #5669 | Native input/beforeinput boundary semantics; desktop browser proof required.     |
| 18      | #4994 / #5026 | Android readOnly/native-listener lifecycle family; raw Android proof required.   |
| 3 split | #4001 / #3777 | First-character placeholder/composition rows belong to input runtime, not focus. |

Reviewed singleton rows:

- #6051 Firefox Android + Samsung keyboard insertion.
- #5989 Android Hangul placeholder composition.
- #5984 Android Chinese IME backspace.
- #5931 Windows text suggestion replacement.
- #5830 blur while composing Japanese/Korean.
- #5130 Firefox Android predictive typing.

Claim result:

- no `Fixes #...` rows added;
- no `Improves` rows added;
- all reviewed rows remain `Related` or existing non-claim categories;
- raw mobile issue rows remain blocked on direct mobile proof, not desktop
  Playwright or semantic mobile handles.

## Issue Ledger Pass

Status: complete.

Ledger result:

- `149` `v2-input-runtime` rows are present in the row matrix.
- all `149` are `cluster-synced`;
- `126` are `valid`;
- `23` are `likely-valid`;
- zero rows are promoted to `Fixes`;
- zero rows are promoted to `Improves`.

Subsystem split:

| Subsystem      | Rows | Routing decision                                                                                         |
| -------------- | ---: | -------------------------------------------------------------------------------------------------------- |
| react-runtime  |   51 | Keep in this bucket when focus/external DOM/render timing is the cause of input loss; prove via runtime. |
| mobile-ime     |   43 | Raw Android/iOS proof required before any exact issue closure.                                           |
| input-methods  |   31 | Desktop/browser IME, composition, spellcheck, TextExpander, and shortcut proof rows.                     |
| api-ergonomics |   11 | Input interception, controlled-value pressure, toolbar/ref access, and plugin hook policy rows.          |
| rendering      |    4 | Placeholder, mark/inline, and static-rendering pressure rows that affect input behavior.                 |
| selection      |    4 | Input-driven selection lag, RTL, scroll, and inline-exit rows.                                           |
| dom-bridge     |    2 | DOM event/placeholder bridge rows that input depends on.                                                 |
| typing         |    2 | Type-surface rows that affect plugin/input composition.                                                  |
| operations     |    1 | Suppressed-input operation desync row.                                                                   |

Package split:

| Package owner | Rows | Meaning                                                                                         |
| ------------- | ---: | ----------------------------------------------------------------------------------------------- |
| cross-package |   89 | Requires `slate-react` runtime plus `slate-dom` bridge or core transaction proof.               |
| slate-react   |   59 | React runtime/input/component boundary proof is enough unless a browser bridge failure appears. |
| slate         |    1 | Core operation contract pressure caused by input suppression.                                   |

Execution consequence:

- do not execute this as one 149-issue mega-fix;
- start with cluster representatives and proof routes;
- promote issue claims only after exact repro proof;
- keep broad `cluster-synced` rows out of PR auto-close language;
- use the coverage matrix for fixed/improved/high-signal related claims, while
  the generated issue matrix remains the exhaustive row classifier.

No claim-sync changes:

- `docs/slate-v2/ledgers/issue-coverage-matrix.md` needed no new claim row;
- `docs/slate-v2/references/pr-description.md` stays unchanged;
- `docs/slate-v2/ledgers/fork-issue-dossier.md` stays unchanged until a focused
  proof changes issue status.

## Implementation Phases

### Phase 1: Kernel Ownership Matrix

Target:

- every beforeinput/keydown/composition/input event maps to one typed command
  or explicit native/app/no-op decision;
- every decision records ownership, selection policy, and repair policy;
- illegal native-owned repair transitions stay impossible.

Proof:

```bash
cd ../slate-v2/packages/slate-react
bun test:vitest -- editing-kernel-contract editing-epoch-kernel-contract
```

Acceptance:

- no composition event can become model-owned by accident;
- destructive keydown and duplicate beforeinput share one epoch;
- command definitions cover every model-owned input command.

### Phase 2: Beforeinput Selection Sync

Target:

- beforeinput flushes pending selection at the right time;
- model-owned text/delete/history commands use current model/DOM policy;
- stale DOM target ranges cannot steal selection after model-owned input.

Proof:

```bash
cd ../slate-v2
bun --filter slate-react test:vitest -- selection-runtime-contract model-input-strategy-contract
PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "browser insertion|beforeinput|delete|undo|native word"
```

Acceptance:

- visible DOM and Slate model text both assert after typing;
- keyboard `type`, `insertText`, Backspace/Delete, undo, and select-all paths
  do not diverge.

### Phase 3: Placeholder And Empty-State Composition

Target:

- placeholder visibility never becomes selectable editor content;
- first composition/voice/Hangul/CJK input into an empty node cannot duplicate
  or lose text;
- zero-width and mark placeholders do not line-break or steal IME text.

Proof:

```bash
cd ../slate-v2
bun --filter slate-react test:vitest -- rendering-strategy-and-scroll rendered-dom-shape-contract
PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/placeholder.test.ts --project=chromium --project=firefox --grep "composition|placeholder|first"
```

Acceptance:

- no exact mobile closure from this phase unless raw device proof is added;
- desktop placeholder/composition regressions may move to `improves-claimed`
  only with matching issue evidence.

### Phase 4: Inline, Void, Mark, And Soft-Break Input

Target:

- inline/void boundaries and mark placeholders keep input command ownership
  deterministic;
- soft-break/list input does not reverse text or jump selection;
- focus/blur during composition does not commit duplicate text.

Proof:

```bash
cd ../slate-v2
PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/inlines.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/highlighted-text.test.ts playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium --grep "Arrow|Backspace|Delete|cut|list|decorated"
```

Acceptance:

- inline void selection remains atomic;
- after destructive input, caret is still editable and model text matches DOM
  text.

### Phase 5: Android Runtime Proof Gate

Target:

- Android manager owns noncancelable beforeinput, pending diffs, pending
  selection, pending marks, and action flushing;
- `parentNode` null / stale DOM point shapes fail closed;
- mobile proof claims are separated by transport.

Proof:

```bash
cd ../slate-v2
bun --filter slate-browser test:proof
bun test:mobile-device-proof:raw
```

Acceptance:

- semantic/mobile viewport proof cannot satisfy raw Android/iOS claims;
- only raw device artifacts can promote #6022, #5984, #5983, #5883, #5493,
  #5130, or #6051 beyond `Related`.

### Phase 6: Ledger And PR Sync

Target:

- every proofed issue gets one of `fixes-claimed`, `improves-claimed`,
  `cluster-synced`, or `needs-repro`;
- exact claims stay rare.

Proof:

```bash
cd /Users/zbeyens/git/plate-2
bun run completion-check
```

Acceptance:

- `docs/slate-issues/gitcrawl-live-open-ledger.md` updated only for touched
  issue rows;
- `docs/slate-v2/ledgers/fork-issue-dossier.md` has self-contained sections
  for every promoted claim;
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` gets fixed rows only after
  exact repro proof;
- `docs/slate-v2/references/pr-description.md` changes only when exact claims,
  API shape, proof gates, or release narrative change.

## Applicable Review Matrix

| Lens               | Status  | Finding                                                                             |
| ------------------ | ------- | ----------------------------------------------------------------------------------- |
| ClawSweeper        | applied | `v2-input-runtime` owns `149` rows; no new exact fix claim.                         |
| TDD                | applied | Kernel, browser, generated stress, and raw-device proof rows are separated.         |
| Performance        | applied | Root event ownership exists; budgets now forbid per-block effects/listeners.        |
| Vercel React       | applied | React is projection/wiring; event delegation and narrow subscriptions are required. |
| React useEffect    | applied | Effects are root/runtime/staging/measurement only, not default block/leaf state.    |
| Performance Oracle | applied | Hot lookups must be O(1), bucketed, or indexed before execution can close.          |
| Steelman           | applied | Strongest maintainer objections were accepted as explicit proof and scope gates.    |
| High-risk          | applied | Runtime/browser/mobile blast radius is recorded with rollback and proof gates.      |
| shadcn/UI          | skipped | No UI component surface in this bucket.                                             |

Current-pass correction:

- ClawSweeper related discovery and the issue-ledger pass are complete for this
  rescope.
- Intent and decision boundaries are complete for this pass. The active issue
  surface is input runtime, and the next pass is evidence/source refresh, not
  another issue crawl.
- TDD is applied as a vertical proof lens: one behavior proof per slice, with
  kernel tests before browser/stress proof.
- Performance, Vercel React, react-useeffect, and Performance Oracle are now
  applied with concrete deltas against listener count, per-block/per-leaf
  effects, transient state, interaction metrics, memory tags, and indexed
  lookup shape.
- Steelman and high-risk passes are now applied. They keep the architecture,
  but narrow what it may claim: raw Slate input runtime, no product input
  framework, no desktop-to-mobile claim promotion, and no release claim without
  the named proof tier.

## Maintainer Objection And High-Risk Pass

Status: complete.

High-risk trigger:

- The plan changes the execution order and proof contract for browser input,
  IME, mobile, placeholder input, collaboration-visible commits, DOM selection
  import/export, and issue-closure claims.

Blast radius:

| Surface                | Risk                                                                                  | Guard                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `slate-react` runtime  | wrong owner can duplicate input, lose IME text, or fight native selection             | kernel ownership tests before handler behavior tests                                          |
| `slate-dom` bridge     | stale or missing DOM point can corrupt selection repair                               | fail-closed point/range proof before issue claim promotion                                    |
| core transactions      | suppressed input can desync operations, history, or collaboration snapshots           | commit/operation replay proof and selection before/after assertions                           |
| browser examples       | desktop proof can overstate mobile/IME coverage                                       | desktop, semantic mobile, proxy mobile, and raw device proof tiers stay separate              |
| issue ledgers / PR     | broad input-runtime work can accidentally advertise exact fixes                       | no `Fixes #...` or `Improves` rows without exact reproduction and matching proof artifact     |
| Plate/slate-yjs future | raw Slate could absorb product policy or adapter-specific APIs to ease migration pain | extension state/tx and commit metadata are the migration backbone, not adapter-shaped objects |

Steelman objection ledger:

| Decision                                  | Strongest fair objection                                                                 | Revision / answer                                                                                                                               | Verdict |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Keep one explicit input runtime           | This can become a giant god object that hides browser quirks behind new abstractions.    | Keep one owner for authority only; split implementation workers for beforeinput, Android, selection, repair, trace, and input rules.            | keep    |
| Route product policy out of raw Slate     | Apps still need autocomplete, mentions, text limits, slash commands, and hotkeys.        | Raw Slate exposes capability hooks and input-rule slots; Plate/examples own product behavior.                                                   | keep    |
| Require raw device proof for mobile rows  | This slows closure and makes the PR look less impressive.                                | Correct. It also prevents bullshit claims. `release-proof.test.ts:55` already rejects semantic/proxy mobile proof for raw device claims.        | keep    |
| Keep exact issue claims rare              | A huge v2 rewrite should close more issues, or users will think it did not solve enough. | Cluster-sync broad rows, but exact issue auto-close only when the reported repro path is proven.                                                | keep    |
| Keep `editor.update/read` extension DX    | Lexical-style commands or Tiptap command chains might feel more familiar to some users.  | Slate's better fit is transaction-scoped writes and read helpers; product command chains can be built above that without changing raw Slate.    | keep    |
| Keep virtualization/shell out of default  | GitHub uses TanStack Virtual successfully; huge documents need it.                       | Use it as explicit degraded/experimental policy. Default input runtime cannot depend on missing DOM until find/a11y/mobile/copy behavior prove. | keep    |
| Do not add Plate/slate-yjs adapters first | Migration confidence may feel theoretical without current adapter fixtures.              | Substrate proof is enough for this plan; adapter fixtures belong to execution slices after raw operations/commit/extension contracts stabilize. | keep    |

Three-scenario pre-mortem:

| Scenario                                             | Failure mode                                                                 | Required prevention                                                                                                         |
| ---------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Android manager passes semantic tests but loses text | proxy/mobile-viewport proof is mistaken for Samsung/Chrome or iOS proof      | direct Appium/raw-device lane must be the only promotion path for Android/iOS issue rows                                    |
| beforeinput fix regresses IME                        | model-owned selection import runs while composition is active                | `editing-kernel-contract.ts:265` style ownership tests and browser composition gauntlets must run before promotion          |
| placeholder cleanup becomes browser-visible text     | placeholder residue becomes selectable, copyable, or part of IME composition | placeholder proof must assert DOM shape, model text, visible text, copy behavior, and composition commit state              |
| raw Slate grows product policy                       | input runtime becomes a command framework for mentions, slash commands, etc. | keep product policies in extensions/examples/Plate; raw runtime only decides ownership, selection import, repair, and trace |
| broad PR narrative overclaims issue closure          | related rows become fake `Fixes #...` claims                                 | issue-sync pass must diff live ledger, coverage matrix, dossier, and PR reference before closure                            |

Expanded proof plan:

| Proof tier          | Required rows                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| unit/kernel         | ownership decisions, duplicate epoch suppression, composition-owned keyboard paths, illegal transition rejection  |
| package integration | beforeinput selection sync, model/native decision, DOM bridge fail-closed behavior, history/operation consistency |
| browser desktop     | Chromium/Firefox/Safari replay for typing, delete, paste, select-all, placeholder, IME, inline/void boundaries    |
| generated stress    | replayable composition/selection-repair cases outside default fast `check`                                        |
| raw mobile          | Appium Android/iOS artifacts for Android/iOS issue promotion                                                      |
| migration/adoption  | extension state/tx examples, commit replay, metadata/tags, selection before/after, no adapter namespace           |
| performance         | p50/p95/p99 INP, beforeinput segments, heap, DOM nodes, listener count, mounted/pending group counts              |
| docs/examples       | docs name behavior tiers honestly; examples do not imply native mobile/browser-find coverage without proof        |

Rollback and remediation:

- If the runtime owner abstraction becomes too large, split workers but keep
  the single authority table.
- If Android proof fails, keep Android rows `Related` and isolate the manager
  work behind a focused execution slice.
- If shell/virtualization proof regresses native behavior, keep it explicit
  degraded mode and leave default staged/full DOM behavior unchanged.
- If extension DX feels too low-level, add examples or Plate-level sugar before
  changing raw Slate APIs.
- If an issue claim cannot be proven, downgrade it to `Related` or
  `needs-repro`; do not hide it.

High-risk verdict:

- **Keep the plan.**
- **Revise the execution contract:** issue promotion must require exact proof
  tier, and every execution slice must state rollback/remediation before code.
- **Do not execute code from this planning pass.**
- **Next pass:** issue-sync accounting. The high-risk pass changes plan gates
  only; it still does not change fixed issue claims.

## Issue Sync Accounting Pass

Status: complete.

Source checks:

| Artifact                                             | Result                                                                                                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gitcrawl doctor --json`                             | local corpus is available: `659` open threads, `617` clusters, last sync `2026-05-04T14:58:11.123944Z`; GitHub API token is absent, so no live mutation path. |
| `docs/slate-issues/gitcrawl-live-open-ledger.md`     | all representative input-runtime rows checked in this pass are present in the live open ledger.                                                               |
| `docs/slate-v2/ledgers/issue-coverage-matrix.md`     | exact fixed claims remain `3`; related/improved/not-claimed rows now count `92`.                                                                              |
| `docs/slate-v2/ledgers/fork-issue-dossier.md`        | added missing fork dossier sections for #5931 and #5830; previously reviewed input-runtime singleton rows now have self-contained fork-local sections.        |
| `docs/slate-v2/references/pr-description.md`         | updated summary count from `89` to `92`; fixed issue claims remain #6013, #5605, and #5709 only.                                                              |
| `docs/slate-v2/ledgers/issue-coverage-matrix.md:115` | added #5931 as `Related`, not `Fixes`, because Windows suggestion acceptance still needs exact Windows suggestion-bar proof.                                  |
| `docs/slate-v2/ledgers/issue-coverage-matrix.md:116` | added #5830 as `Related`, not `Fixes`, because Japanese/Korean composition blur still needs exact composition-blur proof.                                     |

Claim accounting result:

| Claim type                  | Count | Decision                                                                                     |
| --------------------------- | ----: | -------------------------------------------------------------------------------------------- |
| `Fixes`                     |   `3` | unchanged; no input-runtime row promoted.                                                    |
| `Improves`                  |  `19` | unchanged by this pass.                                                                      |
| `Related`                   |  `61` | +2 for #5931 and #5830 because the plan reviewed them and they belong to `v2-input-runtime`. |
| `Not claimed`               |  `12` | unchanged by this pass.                                                                      |
| Total non-fixed matrix rows |  `92` | PR reference synced.                                                                         |

Issue-sync decision:

- no `Fixes #...` lines added;
- no `Improves #...` rows added;
- #5931 and #5830 are now accounted as related input-runtime rows in both the
  coverage matrix and fork dossier;
- PR reference count is synced to the coverage matrix;
- live gitcrawl ledger content did not need row edits because it already lists
  the current upstream issue rows and cluster identifiers;
- this closes issue-sync accounting for the plan. The only remaining pass is
  final closure score and handoff.

## Scorecard

| Dimension                          | Score | Evidence                                                                               |
| ---------------------------------- | ----: | -------------------------------------------------------------------------------------- |
| React 19.2 runtime performance     |  0.90 | hot-path budgets now include high-risk rollback and degraded-mode boundaries           |
| Slate-close unopinionated DX       |  0.92 | maintainer objections keep product policy and adapter-shaped APIs out of raw Slate     |
| Plate/slate-yjs migration backbone |  0.91 | commit/operation/extension migration answer survived the steelman pass                 |
| Regression-proof testing           |  0.93 | exact proof tiers now gate desktop, stress, proxy mobile, raw device, and issue claims |
| Research evidence completeness     |  0.91 | issue coverage, dossier, PR reference, gitcrawl ledger, and live source evidence align |
| Composability/minimalism           |  0.92 | one authority owner is kept while implementation workers stay split                    |

Total: `0.92`.

Completion verdict: **done**. The bucket decision and source direction are
accepted. No new fixed issue claims were added by this plan.

## Pass Schedule

| Pass                                         | Status   | Evidence added                                                                                                       | Plan delta                                                                                                                | Open issues                                                | Next owner                                   |
| -------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------- |
| current-state-read-and-initial-score         | complete | live source owners, issue ledgers, research timing audit, existing coverage rows                                     | corrected status from ready to pending; lowered score to 0.85                                                             | no closure score; no completed issue-sync pass             | related-issue-discovery-pass                 |
| related-issue-discovery-pass                 | complete | gitcrawl doctor, clusters 3/9/11/13/16/18, singleton input rows, dossier sections                                    | added discovery pass; split malformed #6051 coverage row; score to 0.86                                                   | no claim levels changed; issue-ledger pass still required  | issue-ledger-pass                            |
| issue-ledger-pass                            | complete | 149-row matrix count, status/validity/package/subsystem split, no-claim result                                       | corrected stale 151/24 summary counts; added issue-ledger routing; score 0.87                                             | no claim levels changed; intent boundary still thin        | intent-boundary-and-decision-brief-pass      |
| intent-boundary-and-decision-brief-pass      | complete | live source owners, runtime/core/DOM/app boundaries, no-user-question result                                         | expanded intent, non-goals, decision boundaries, decision consequences; score stayed 0.87 until research pass             | research/source refresh closed in next pass                | research-and-live-source-refresh             |
| research-and-live-source-refresh             | complete | Lexical, ProseMirror, Tiptap, React research, live Slate v2 runtime/source citations                                 | added research pass; research score 0.85 -> 0.89; total remains 0.87 because performance/DX/migration pressure is pending | no claim levels changed; React live clone absent           | performance-dx-migration-regression-pressure |
| performance-dx-migration-regression-pressure | complete | root listener evidence, profiler slices, rendering metrics, extension/collab docs, kernel/browser/stress proof tiers | added performance/DX/migration/regression pass; total score 0.87 -> 0.89                                                  | no benchmark success claimed; high-risk objections pending | maintainer-objection-and-high-risk-pass      |
| maintainer-objection-and-high-risk-pass      | complete | steelman objection ledger, blast radius, proof tiers, rollback/remediation                                           | accepted plan with narrower issue-promotion and release-proof gates; total score 0.89 -> 0.91                             | issue-sync accounting still pending                        | issue-sync-accounting-pass                   |
| issue-sync-accounting-pass                   | complete | gitcrawl doctor, live ledger presence, coverage count, fork dossier #5931/#5830 additions, PR count sync             | added #5931/#5830 related accounting; PR count 89 -> 92; total score 0.91 -> 0.92                                         | no issue claim promotion                                   | closure-score-and-handoff                    |
| closure-score-and-handoff                    | complete | final accepted decisions, non-claims, execution target, and proof gates                                              | marked plan ready for execution; completion state can be `done`                                                           | none                                                       | none                                         |

## Plan Deltas From Review

- revised: status `ready-for-ralph-execution` -> `slate-ralplan-pending`.
- revised: total score `0.92` -> `0.85`.
- added: current-state read result and stale-claim correction.
- added: pass schedule and pass-state ledger.
- added: related issue discovery pass for clusters 3, 9, 11, 13, 16, 18 and
  singleton input-runtime rows.
- revised: total score `0.85` -> `0.86` after discovery, still below closure.
- fixed: malformed #6051 coverage row split from #3551.
- added: issue-ledger pass for the actual `149` input-runtime rows.
- fixed: stale action-bucket summary counts in the issue matrix:
  `v2-input-runtime` `151` -> `149`, `v2-react-runtime` `24` -> `26`.
- revised: total score `0.86` -> `0.87` after ledger classification, still
  below closure.
- added: intent-boundary pass with explicit raw-Slate/app policy, desktop/mobile
  proof, `slate-react`/`slate-dom`/core ownership, and no-user-question result.
- kept: total score at `0.87` after boundary hardening because external/source
  research was still capped at that point.
- added: research/live-source refresh against local Lexical, ProseMirror,
  Tiptap, live Slate v2 source, and compiled React 19.2 research.
- revised: research evidence score `0.85` -> `0.89`; total score remains
  `0.87` because the performance/DX/migration pressure pass is still pending.
- added: performance/DX/migration/regression pressure pass using live root event
  ownership, beforeinput profiler slices, rendering metrics, extension/collab
  docs, and proof-tier tests.
- revised: total score `0.87` -> `0.89`; closure remains invalid because
  high-risk/objection and issue-sync accounting passes are still pending.
- added: maintainer objection and high-risk pass with blast radius, steelman
  rows, expanded proof tiers, rollback/remediation, and exact claim promotion
  gates.
- revised: total score `0.89` -> `0.91`; closure remains invalid because
  issue-sync accounting and final closure handoff are still pending.
- added: issue-sync accounting pass with live gitcrawl availability, live ledger
  presence checks, coverage matrix count, fork dossier sync, and PR reference
  count sync.
- fixed: added missing related coverage/dossier rows for #5931 and #5830.
- revised: PR reference related/improved/not-claimed count `89` -> `92`.
- revised: total score `0.91` -> `0.92`; closure still needs the final
  closure-score-and-handoff pass.
- added: closure score and handoff pass with final accepted decisions,
  non-claims, proof gates, and execution target.
- revised: plan status `slate-ralplan-pending` -> `slate-ralplan-done`.
- strengthened: no Android/IME claim without raw device proof.
- kept: next bucket remains `v2-input-runtime`.
- kept: exact fixed issue claims unchanged.
- next: execute the plan with `ralph` when implementation is requested.

## Final Completion Gates

- total score `>= 0.92`.
- no dimension below `0.85`.
- pass-state ledger proves every scheduled pass completed before closure.
- ClawSweeper related-issue pass complete for the input-runtime surface.
- issue-ledger pass complete for the input-runtime surface.
- intent-boundary and decision-brief pass complete.
- research and live-source refresh pass complete.
- performance/DX/migration/regression pressure pass complete.
- maintainer objection and high-risk deliberate pass complete.
- live issue corpus sync result recorded for touched rows / clusters.
- fork issue dossier sync result recorded for every reviewed issue.
- issue coverage matrix and PR reference marked updated or unchanged with
  concrete reasons.
- issue-sync accounting pass complete.
- objection ledger and high-risk deliberate pass accepted for runtime/browser
  behavior changes.
- final handoff lists every accepted decision, not only highlights.

## Closure Score And Handoff

Status: complete.

Final score: `0.92`.

Closure verdict:

- **Ready for execution.**
- This is an implementation plan, not an implementation patch.
- The correct next bucket remains `v2-input-runtime`.
- Exact fixed issue claims remain unchanged: only #6013, #5605, and #5709 are
  fixed claims in the PR reference.
- The input-runtime bucket remains issue-facing, but rows stay
  `Related` / `cluster-synced` until exact repro proof exists.

Accepted decisions:

| Area                 | Decision                                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Bucket order         | Execute `v2-input-runtime` next; it owns `149` rows and the highest-priority mobile/IME/input theme.              |
| Runtime architecture | Keep one explicit input runtime authority model for beforeinput, composition, Android, selection, repair, trace.  |
| Raw Slate boundary   | Raw Slate owns ownership, selection import, model/DOM synchronization, and fail-closed behavior only.             |
| Product policy       | Plate/examples own mentions, autocomplete, slash commands, text limits, and product hotkey UX.                    |
| Public API posture   | Keep `editor.read`, `editor.update`, `defineEditorExtension`, `editor.extend`, and extension `state`/`tx`.        |
| Migration backbone   | Plate/slate-yjs migration proof is operation replay, commit metadata, subscriptions, and extension backbone.      |
| Mobile/IME claims    | Raw Android/iOS claims need direct raw-device proof; desktop and semantic/proxy mobile proof cannot promote them. |
| Performance          | Root event ownership and profiler slices stay; execution must enforce zero per-block listeners/effects.           |
| Issue claims         | No new `Fixes #...` or `Improves` rows from this planning lane.                                                   |
| Ledger sync          | #5931 and #5830 are related input-runtime rows; PR non-fixed count is synced to `92`.                             |

Execution target:

1. Start with Phase 1 kernel ownership matrix.
2. Keep every slice vertical: one public behavior proof, then implementation,
   then the matching proof rerun.
3. Promote issue claims only after exact repro proof.
4. Keep Android/iOS rows `Related` until `bun test:mobile-device-proof:raw`
   has direct artifacts.
5. Sync issue coverage, fork dossier, and PR reference only when claim status
   changes.

Non-claims:

- no public product input framework;
- no resurrection of legacy `onDOMBeforeInput` as the main architecture;
- no current-version Plate adapter requirement before raw Slate execution;
- no desktop proof promoted to Android/iOS closure;
- no virtualization/shell default claim in the input-runtime bucket.

Stop condition:

- This review lane is complete. Future work should be execution via `ralph`, not
  another planning pass, unless new evidence changes the issue surface.

## Ralph Execution Prompt

Slate Ralplan review is complete for
`docs/plans/2026-05-04-slate-v2-clawsweeper-v2-input-runtime-ralplan.md`.

When the user asks to execute, use `ralph` to start Phase 1. Do not add
`Fixes #...` rows until the exact issue repro is proven. Keep mobile issue
claims at `Related` until `bun test:mobile-device-proof:raw` produces direct
Android/iOS proof artifacts.

## Ralph Execution State

Status: `done`.

Active checkpoint:

- `.tmp/completion-checks/slate-v2-clawsweeper-v2-input-runtime-execution.md`

Completed:

- Phase 1: Kernel Ownership Matrix.
  - Added a failing proof that composition lifecycle events stay browser-owned.
  - Fixed `prepareEditableCompositionKernel` so composition lifecycle decisions
    use `native-allowed` ownership and expose explicit no-selection/no-repair
    policies.
  - Fresh proof:
    `cd ../slate-v2/packages/slate-react && bun test:vitest -- editing-kernel-contract editing-epoch-kernel-contract`
    passed with `24` tests.
- Phase 2: Beforeinput Selection Sync.
  - Fixed the Phase 2 proof path by renaming
    `model-input-strategy-contract.ts` to
    `model-input-strategy-contract.test.ts` and converting it to Vitest
    assertions, because the planned command skipped the old file.
  - Fresh unit proof:
    `cd ../slate-v2 && bun --filter slate-react test:vitest -- selection-runtime-contract model-input-strategy-contract`
    passed with `2` files and `14` tests.
  - Fresh browser proof:
    `cd ../slate-v2 && PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "browser insertion|beforeinput|delete|undo|native word"`
    passed with `14` tests.
- Phase 3: Placeholder And Empty-State Composition.
  - Added `rendering-strategy-and-scroll.test.tsx` so the planned Vitest
    command actually runs `rendering-strategy-and-scroll.tsx`.
  - Fixed hidden rendering-strategy tests to fire editable `select-all` and
    paste events through Testing Library with an editable target.
  - Fresh unit proof:
    `cd ../slate-v2 && bun --filter slate-react test:vitest -- rendering-strategy-and-scroll rendered-dom-shape-contract`
    passed with `2` files and `35` tests.
  - Fresh browser proof:
    `cd ../slate-v2 && PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/placeholder.test.ts --project=chromium --project=firefox --grep "composition|placeholder|first"`
    passed with `6` tests.
- Phase 4: Inline, Void, Mark, And Soft-Break Input.
  - Fresh browser proof:
    `cd ../slate-v2 && PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/inlines.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/highlighted-text.test.ts playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium --grep "Arrow|Backspace|Delete|cut|list|decorated"`
    passed with `17` tests.
- Phase 5: Android Runtime Proof Gate.
  - Fresh Slate Browser proof:
    `cd ../slate-v2 && bun --filter slate-browser test:proof` passed with
    `23` tests.
  - Raw mobile proof was attempted:
    `cd ../slate-v2 && bun test:mobile-device-proof:raw` failed because
    `test-results/release-proof/mobile-device-proof.json` is absent.
  - Android/iOS issue rows stay `Related`; no raw-device claim was promoted.
- Phase 6: Ledger And PR Sync.
  - No exact issue claim changed, so the issue coverage matrix and fork dossier
    did not get new `Fixes #...` or `Improves #...` rows.
  - Synced `docs/slate-v2/references/pr-description.md` proof references for
    the React input/runtime proof files.

Current next owner:

- none.
