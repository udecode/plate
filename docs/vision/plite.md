# Plite Vision

Plite is the raw editor substrate. It must stay unopinionated, precise, and
boring in the best way: document model, canonical changes, runtime, input, DOM,
selection, history, browser proof, package API, and benchmarks.

Root `VISION.md` is the mandatory first read. This file carries the fuller
Plite doctrine after the lane is selected.

## Plite Source Order

1. Active goal plan.
2. Root `VISION.md`, then this file.
3. `docs/plite/agent-start.md`.
4. Relevant `plite-*` source rule under `.agents/rules`.
5. Transplanted Plite package source/tests/benchmarks in this Plate checkout:
   `packages/plite*`, `packages/browser`, `packages/yjs`,
   `apps/plite/tests/plite-browser/**`, and `benchmarks/plite/**`.
6. `docs/plite/**` for accepted claim width.
7. `benchmarks/targets/slate-v2.json` for perf target authority.

Plate repo root commands are the current Plite runtime authority. Do not use a
donor checkout as proof after the transplant.

## Plite Rules

- Preserve Plite's simple document model and canonical `DocumentChange` as the
  sole mutation and commit truth. Transactions construct canonical changes
  directly; React does not define the core ontology.
- Public API should teach `editor.read`, `editor.update`, `state`, `tx`,
  extension groups, commit listeners, and projection sources.
- Plite stays unopinionated. Plate owns product opinion.
- Do not keep legacy APIs alive just because they are familiar.
- Do not make child-count chunking foundational again.
- Plite supplies typed extension identity, composition, publication, and
  inspection. It does not supply a behavior-profile DSL. Plate specs define
  product law; named kits require real reuse, while runtime control is a
  separate proven job.
- Layering beats feature buckets: document truth, DOM transport, React runtime,
  browser proof, projections/services, layout, lightweight surfaces, and
  productization need clear owners.
- Page layout is not core editor truth. Pagination, deterministic measurement,
  occlusion, and scroll stability live above document semantics; active caret,
  selection, and composition stay on the native/browser editing path.

## Plite API Direction

- Plite uses `editor.read(fn)`, direct `editor.update.group.method(...)`,
  configured `editor.update(policy).group.method(...)`, and atomic
  `editor.update(policy?, fn)` as the public lifecycle.
- `state` is the normal read view; `tx` is the normal write view and can read
  transaction-local state.
- Extension namespaces add named groups to `state`, `tx`, and the direct update
  surface. Use `txOnly(...)` for controls that require an active transaction.
- Public update policy is semantic and narrow: history behavior plus ordered
  tags. Raw provenance and normalization authority stay internal to runtime and
  adapter owners.
- Public updates are synchronous and cannot nest. Helpers inside an update use
  the active `tx`.
- The primary document root is implicit in public API and docs. Do not expose a
  public `main` root key, config option, or example. Explicit roots are only for
  additional roots.
- Structurally owned editable content stays in normal node `children`.
  Conditional mounting and selection use DOM coverage without changing the
  persisted model. Selection kinds distinguish owner selection from child-text
  focus; that distinction alone does not justify a persisted child wrapper.
  Structural child elements require their own grammar, properties, commands,
  or multiple real semantic regions. Explicit roots require independent
  addressing, lifecycle, sharing, or transaction semantics.
- Primitive editor methods are power/runtime tools, not the final normal
  authoring story.
- `tx.*` is the current public API authority for normal writes. Primitive
  `editor.*` writes may remain internal or advanced bridge tools, but do not
  use them to justify old docs/examples as final DX.
- `api` is too vague and `tf` is too Plate-shaped for raw Plite core naming.
- Whole-document replacement should be a transaction write, not public
  `Editor.replace`, `editor.replace`, or `editor.reset` as app-author API.
- `EditorCommit` is the local runtime fact for history, collaboration, React,
  DOM repair, proof, and subscribers.
- Overlay architecture is split into Decoration, Annotation, and Widget lanes.
- Anchors are live editor-scoped handles created through `editor.anchor` or
  `tx.anchor`. Serialized durable positions are a separate concern; low-level
  refs are runtime machinery.
- Lightweight text problems do not automatically deserve the full editor stack.

## Plite Browser And Behavior Proof

- Browser editing claims require model, DOM, selection/caret where observable,
  focus owner, commit metadata when mutating, legal trace, replayability, and
  follow-up typing.
- Use `@platejs/browser` to the maximum reasonable extent for browser-facing
  proof.
- Route-local Playwright is acceptable for first reproduction only. If the same
  action/assertion appears twice, move it into `@platejs/browser` or record why
  the abstraction would be fake.
- Require screenshots/geometry checks for text movement, blank windows,
  overlap, wrong caret line, wrong margin click, or wrong scroll anchoring.
- Do not claim full selection/navigation coverage from one route row.
- Native mobile, semantic mobile, Playwright mobile viewport, and Appium raw
  device proof are distinct claim classes.

## Plite Runtime Loop

```txt
status -> gap scan -> behavior proof -> missing oracle repair -> visual proof
-> benchmark -> patch one hot lane -> verify -> keep/revert -> log -> reassess
```

- Behavior before perf.
- Visual proof before green visible-UI claims.
- Keep perf packets only when correctness stays green.
- After two or three local fixes around one owner, escalate to deeper owner.
- Fix suspect metrics before code.
- Fix unfair benchmarks before gates.
- Reject packets that improve metrics but weaken selection, typing, copy,
  paste, IME, focus, undo, follow-up input, native find, or scroll/caret
  behavior.
- Escalate to `plite-plan` when the next useful win is API/runtime boundary.
- Each mounted `Editable` owns one bounded DOM phase scheduler. Queued root
  work runs in `model -> DOM read -> DOM/React write -> selection/repair`
  order, coalesces by semantic key, and reports recursive loop-limit hits.
- Browser/OS policy clocks such as composition guard lifetimes and native event
  settling may use timers, but DOM mutation, scroll restoration, focus writes,
  and selection repair re-enter the root scheduler. Standalone internal test
  adapters may create a disposable fallback scheduler.

## Plite Perf And Degraded Modes

- Benchmark target control state: `benchmarks/targets/slate-v2.json`.
- Perf packets need one target id, one primary metric, one correctness command
  or browser proof, `METRIC` output when optimizing, and a keep/discard
  decision.
- If `worst_p95_ms` or a summary hides a hot lane, fix the metric before code.
- Huge-document truth is corridor-first, semantic islands, occlusion,
  projection stores, and fair direct comparison against legacy where claimed.
- DOM-present auto is the safe default direction for huge documents until
  shell/occlusion modes prove browser find, screen reader, native selection,
  copy/paste, IME, mobile, undo/history, and collaboration behavior.
- Degraded modes until native behavior is proved: virtualization, shell
  islands, model-backed selection, staged mounting, hidden DOM.

## Plite Skill Topology

- `maintainer`: public GitHub issue/PR/security queue control plane for the
  merged Plate + Plite repo; routes work to narrower owners and stops at
  authority boundaries.
- `auto`: internal Plate/Plite overnight supervisor and checkpoint cadence; use
  the Plite lane for Plite package/runtime/browser/proof work.
- `autoclosure`: post-merge/current-tree until-clean closure after Plite work is
  already applied.
- `plite-research`: external discovery, OSS/GitHub source synthesis, durable
  research ledgers, and promotion into owners.
- `plite-patch`: direct bug fix, reproduction, class-level behavior coverage,
  proof, and autoreview.
- `best-api`: concrete public API design, review, and P0/P1/P2/P3 debt
  ranking.
- `plite-plan`: substrate architecture, adoption/proof planning, and accepted
  plan execution after the target API is clear.
- `plite-migration`: migration closure and stale API audits.
- `tdd`: missing oracle/test design when the proof itself does not exist.

Do not merge distinct owners into one vague mega-skill. Repair confusing
routing in source rules. Create narrow owners only when evidence shows no clear
owner exists.
