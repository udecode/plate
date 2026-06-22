# Slate Vision

Slate is the raw editor substrate. It must stay unopinionated, precise, and
boring in the best way: document model, operations, runtime, input, DOM,
selection, history, browser proof, package API, and benchmarks.

Root `VISION.md` is the mandatory first read. This file carries the fuller
Slate doctrine after the lane is selected.

## Slate Source Order

1. Active goal plan.
2. Root `VISION.md`, then this file.
3. `docs/slate-v2/agent-start.md`.
4. Relevant `slate-*` source rule under `.agents/rules`.
5. Transplanted Slate package source/tests/benchmarks in this Plate checkout:
   `packages/slate*`, `packages/browser`, `packages/yjs`,
   `apps/slate/tests/slate-browser/**`, and `benchmarks/slate-v2/**`.
6. `docs/slate-v2/**` for accepted claim width.
7. `benchmarks/targets/slate-v2.json` for perf target authority.

Plate repo root commands are the current Slate runtime authority. Do not use a
donor checkout as proof after the transplant.

## Slate Rules

- Preserve Slate's simple document model and operations as truth; do not let
  React define the core ontology.
- Public API should teach `editor.read`, `editor.update`, `state`, `tx`,
  extension groups, commit listeners, and projection sources.
- Slate stays unopinionated. Plate owns product opinion.
- Do not keep legacy APIs alive just because they are familiar.
- Do not make child-count chunking foundational again.
- Behavior should be profile-driven. Capabilities expose what can happen;
  behavior profiles decide when it applies.
- Layering beats feature buckets: document truth, DOM transport, React runtime,
  browser proof, projections/services, layout, lightweight surfaces, and
  productization need clear owners.
- Page layout is not core editor truth. Pagination, deterministic measurement,
  occlusion, and scroll stability live above document semantics; active caret,
  selection, and composition stay on the native/browser editing path.

## Slate API Direction

- Slate v2 uses `editor.read(fn)` and `editor.update(fn, options?)` as the
  public lifecycle.
- `state` is the normal read view; `tx` is the normal write view and can read
  transaction-local state.
- Extension namespaces add named groups to `editor`, `state`, and `tx`.
- The primary document root is implicit in public API and docs. Do not expose a
  public `main` root key, config option, or example. Explicit roots are only for
  additional roots.
- Primitive editor methods are power/runtime tools, not the final normal
  authoring story.
- `tx.*` is the current public API authority for normal writes. Primitive
  `editor.*` writes may remain internal or advanced bridge tools, but do not
  use them to justify old docs/examples as final DX.
- `api` is too vague and `tf` is too Plate-shaped for raw Slate core naming.
- Whole-document replacement should be a transaction write, not public
  `Editor.replace`, `editor.replace`, or `editor.reset` as app-author API.
- `EditorCommit` is the local runtime fact for history, collaboration, React,
  DOM repair, proof, and subscribers.
- Overlay architecture is split into Decoration, Annotation, and Widget lanes.
- Durable anchors and live handles are separate nouns. Prefer bookmarks for
  durable public anchor language; keep low-level refs as runtime machinery.
- Lightweight text problems do not automatically deserve the full editor stack.

## Slate Browser And Behavior Proof

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

## Slate Runtime Loop

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
- Escalate to `slate-plan` when the next useful win is API/runtime boundary.

## Slate Perf And Degraded Modes

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

## Slate Skill Topology

- `maintainer`: public GitHub issue/PR/security queue control plane for the
  merged Plate + Slate repo; routes work to narrower owners and stops at
  authority boundaries.
- `auto`: internal Plate/Slate overnight supervisor and checkpoint cadence; use
  the Slate lane for Slate v2 package/runtime/browser/proof work.
- `autoclosure`: post-merge/current-tree until-clean closure after Slate work is
  already applied.
- `slate-research`: external discovery, OSS/GitHub source synthesis, durable
  research ledgers, and promotion into owners.
- `slate-patch`: direct bug fix, reproduction, class-level behavior coverage,
  proof, and autoreview.
- `slate-plan`: architecture/API plan pressure and accepted plan execution.
- `slate-migration`: migration closure and stale API audits.
- `tdd`: missing oracle/test design when the proof itself does not exist.

Do not merge distinct owners into one vague mega-skill. Repair confusing
routing in source rules. Create narrow owners only when evidence shows no clear
owner exists.
