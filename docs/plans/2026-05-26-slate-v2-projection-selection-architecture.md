# slate v2 projection selection architecture

Objective:
Plan the remaining Slate v2 architecture needed after Synced Blocks/content
roots: one projection graph, cross-root `ViewSelection`, projection-owned
commands, root lifecycle policy, collaboration substrate, repeated-projection
performance budgets, and browser-native affordance contracts. Reuse already
completed Synced Blocks checks from
`docs/plans/2026-05-26-slate-v2-synced-content-roots.md` and
`docs/plans/2026-05-26-slate-v2-synced-blocks-selection-history-coverage.md`
instead of rerunning them unless this plan changes the issue-facing or browser
surface materially.

Goal plan:
docs/plans/2026-05-26-slate-v2-projection-selection-architecture.md

Template:
docs/plans/templates/slate-plan.md

Primary template:
docs/plans/templates/slate-plan.md

Applied packs:
- none

Completion threshold:
- Slate Plan closure is legal only when score >= 0.92, no dimension is below
  0.85, every pass row is complete or intentionally skipped with evidence,
  issue/reference sync rows are closed or explicitly reused with evidence, final
  handoff is emitted, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-projection-selection-architecture.md`
  passes.
- This plan is user-review-ready only when it gives an implementation queue for
  projected selection and commands without changing direction from the accepted
  one-runtime/content-root architecture.

Verification surface:
- Planning checks in `plate-2`: this plan, relevant prior plans, issue/reference
  ledgers, research index/log, and solution notes.
- Live source grounding in `Plate repo root`: selection point/range types,
  projection segments, content-root owner registry, content-root navigation,
  DOM selection import/export, partial DOM selection mode, Synced Blocks example,
  and Synced Blocks Playwright coverage.
- Execution proof after user acceptance is recorded in the execution ledger:
  focused package tests, Synced Blocks browser rows, cross-root
  selection/delete/copy rows, root lifecycle/collab substrate rows, and
  repeated-projection stress rows in `Plate repo root`.

Constraints:
- Original planning pass was planning-only. Accepted-plan execution may edit the
  plan ledger plus `Plate repo root` implementation, tests, examples, and package
  files needed by the execution queue.
- Keep raw Slate unopinionated; Notion-style product behavior is an example
  scenario, not a raw Slate product API.
- Do not create PRs, commits, pushes, or tracker comments.
- Respect one-pass-per-activation. This activation completes the closure score
  and final gates pass only.

Boundaries:
- Allowed edit scope in this activation: `docs/plans/**`.
- Reuse previous Synced Blocks issue/browser/research checks when the target is
  the same surface; record the reuse instead of duplicating ledger noise.
- In scope: projection graph, projected selection, commands over projected
  selection, root lifecycle policy, collab substrate shape, performance budgets,
  and browser-native contracts.
- Non-goals: implementing code now, current-version slate-yjs adapter support,
  Notion permissions/workspace sync, one-editor-per-block, mirrored-root sync,
  and public product command DSLs.

Blocked condition:
- Block only if planning cannot choose whether projected selection is internal
  runtime state or public core `Selection` without a user decision. Current pass
  recommendation is internal runtime state first, so no blocker yet.

Slate Plan lane state:
- slate_plan_lane_status: complete
- current_pass: accepted-plan-execution-closeout
- current_pass_status: complete
- next_pass: none
- next_action: final handoff for the implemented execution queue.
- final_handoff_status: complete

Current verdict:
- verdict: keep the one-runtime/content-root architecture; revise the remaining
  plan around one internal projection graph plus cross-root `ViewSelection`.
- confidence: 0.92 after closure score and final gates.
- keep / cut / revise call: keep one runtime, keep content-root slots, add
  projected selection/commands, cut one-editor-per-block and mirrored-root sync.
- reason: live source already has root-qualified points and active
  content-root owner identity, but `Selection` is still plain `Range | null`,
  range projection is snapshot/path-based, and DOM selection import still treats
  browser selection as the source for unknown selections.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every Slate Plan completion
  gate below is satisfied and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-projection-selection-architecture.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `slate-plan` loaded from `.agents/skills/slate-plan/SKILL.md`; planning mode only. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` started this projection-selection Slate Plan lane. |
| Source of truth read before edits | yes | Latest user request plus prior Synced Blocks coverage/architecture plans read. |
| `docs/solutions` checked for non-trivial existing-code work | yes | `rg` found relevant multi-root DX, projection proof, DOM-selection, rootless selection, and model-owned selection notes; synthesis recorded in research and pressure sections. |
| Live `Plate repo root` grounding needed for current-state claims | yes | `nl -ba` reads captured current point/selection/projection/runtime/navigation/DOM selection owners. |

Work Checklist:
- [x] Objective includes lane outcome, full pass schedule, one-pass-per-
      activation policy, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] One-pass-per-activation policy respected, or marked N/A with reason.
- [x] Live source grounding recorded for every current implementation claim, or
      marked N/A with reason.
- [x] Issue ledger / ClawSweeper pass applied or skipped with concrete evidence:
      discovery reused prior Synced Blocks accounting; issue-ledger pass added
      a narrow projection-selection sync with no fixed/improved claims.
- [x] Research and ecosystem synthesis complete for every external system used
      as evidence, or marked N/A with reason.
- [x] Intent/boundary record and decision brief complete.
- [x] Scorecard recorded with evidence; total score >= 0.92 and no dimension
      below 0.85 before closure.
- [x] Applicable implementation-skill review matrix applied or skipped with
      concrete reason.
- [x] Slate maintainer objection ledger complete for every breaking/paradigm
      change, or marked N/A with reason.
- [x] Verification workspace gate recorded for every Slate v2 source, runtime,
      browser, package, public API, or issue-fix claim in this pass.
- [x] TDD used for behavior/proof changes with a sane test surface, or marked
      N/A with reason: planning-only pass; TDD lens is applied to execution
      proof order below.
- [x] Browser proof captured for browser-surface claims, or marked N/A with
      reason: N/A for planning closure. This plan makes no new browser behavior,
      runtime behavior, package, public API, release, fixed, or improved claim;
      the existing Shift+Arrow browser failure is reused as prior coverage
      evidence and all behavior proof is explicitly scheduled for execution
      after user acceptance.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Complete all Slate Plan passes and run the final checker | complete: all scheduled planning passes are complete, score is 0.92, no dimension is below 0.85, no P0/P1 architecture blocker remains, issue/reference sync is closed, and the final checker is the last mechanical proof. |
| Slate v2 source, runtime, browser, package, public API, or issue-fix claim | yes | Record live `Plate repo root` source/proof or mark planning-only with reason | complete: accepted-plan execution ledger records focused package tests, full Synced Blocks Chromium proof, typecheck, formatting, stress contracts, and native/collab substrate rows; no release/API/issue claim exceeds proof. |
| Issue ledger or PR reference changed | yes | Sync the relevant ledger/reference rows | issue sync accounting verified and tightened `docs/slate-issues/gitcrawl-v2-sync-ledger.md:83-113`, `docs/slate-v2/ledgers/issue-coverage-matrix.md:145-173`, `docs/slate-v2/ledgers/fork-issue-dossier.md:66-101`, and `docs/slate-v2/references/pr-description.md:108-117`; no new fixed/improved claims, no broadening of existing fixed floors, and no broadening of existing `#5771` readiness accounting. |
| Autoreview for uncommitted implementation changes | yes | Load autoreview for implementation patches, or record N/A | complete: `autoreview` skill loaded; Codex local review from `Plate repo root` found a projected clipboard custom-format-key defect; defect fixed; rerun with `--mode local --thinking codex=low` returned `autoreview clean: no accepted/actionable findings reported`. |
| Final user-review handoff | yes | Emit final handoff or keep the plan pending with the next pass | complete: final execution handoff is recorded below. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-projection-selection-architecture.md` | complete: final checker returned `[autogoal] complete: docs/plans/2026-05-26-slate-v2-projection-selection-architecture.md`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | live `Plate repo root` source reads plus prior Synced Blocks plan reads | related issue discovery |
| Related issue discovery | complete | reused existing Synced Blocks/content-root issue accounting; no new fixed/improved claims; live open rows read from generated gitcrawl ledger | issue-ledger pass |
| Issue-ledger pass | complete | added narrow projection-selection sync rows to manual v2 sync ledger, coverage matrix, fork dossier, and PR reference; no fixed/improved claims | intent/boundary pass |
| Intent/boundary and decision brief | complete | hardened public/private API boundary, invariants, option rejection standards, adoption route, and decision-changing evidence | research refresh |
| Research, ecosystem strategy, live-source refresh | complete | refreshed ProseMirror, Lexical, Tiptap, React ProseMirror, React 19.2, slate-yjs/Yjs, Plate, and live Slate v2 source pressure; no source overturned internal `ViewSelection` | pressure passes |
| Performance/DX/migration/regression/simplicity pressure passes | complete | applied Vercel React, performance-oracle, performance, TDD, shadcn/composability, react-useeffect, and simplicity pressure; added cohorts, budgets, proof order, degradation contract, and hard cuts | objection ledger |
| Slate maintainer objection ledger | complete | accepted the hard objections as proof gates, not public API expansion; internal `ViewSelection`, projected command targets, model-owned native behavior, root/projection identity split, perf budgets, collab non-claim, and example/raw-Slate boundary are recorded | high-risk pass |
| High-risk deliberate mode | complete | converted fake-highlight, persistence, command-ordering, undo/redo, repeated-root, native-copy, collab, perf, and accessibility risks into explicit kill criteria and execution proof gates; no P0/P1 architecture blocker found | ecosystem maintainer pass |
| Ecosystem maintainer pass | complete | Plate can migrate as product/plugin wrappers over raw content-root/projection substrate; slate-yjs needs root-keyed shared types and root-qualified remote selections, not current-adapter compatibility; projection paint policy stays product/local; no P0/P1 blocker found | revision pass |
| Revision pass | complete | accepted architecture and execution queue are now explicit: internal projection graph, private `ViewSelection`, projected command target, model-owned native contract, root-keyed collab substrate, no first-slice public sugar, and proof-gated API promotion | issue sync accounting |
| Issue sync accounting | complete | verified the projection-selection issue/reference rows against the revised accepted plan; tightened delete/clipboard/collab rows so existing exact fixed floors and `#5771` readiness accounting are not broadened into projected-root claims | closure score and final gates |
| Closure score, execution, and final gates | complete | closed final score, implemented accepted queue, recorded package/browser/typecheck/autoreview proof, and reran checker | final handoff |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.91 | Revision makes perf non-optional in the accepted queue: normal-path no-degradation, selector fanout, mounted-view count, listener count, DOM/heap growth, event-to-paint, and 20/100 projection cohorts are release gates. |
| Slate-close unopinionated DX | 0.20 | 0.92 | Revision locks the first public shape: content-root slot plus normal commands. Projection graph, `ViewSelection`, projected command target, and native capability classification stay internal until proof forces API promotion. |
| Plate and slate-yjs migration backbone | 0.15 | 0.92 | Revision names the migration split: Plate wraps product policy; slate-yjs targets root-keyed shared types and root-qualified relative selections; raw Slate owns deterministic operations, commits, root-qualified locations, bookmarks, and local runtime targets. |
| Regression-proof testing strategy | 0.20 | 0.92 | Revision orders execution by public failing behaviors: Shift selection, reverse selection, copy, delete/type replacement, undo/redo restore, click-outside/follow-up typing, native affordances, collab substrate, then stress. |
| Research evidence completeness | 0.15 | 0.92 | Revision reconciles all gathered evidence into a single accepted architecture and closes open plan questions without adding new implementation claims. Remaining proof is execution and final gates. |
| shadcn-style composability and minimalism | 0.10 | 0.91 | Revision rejects public sugar for the first slice and keeps product chrome, remote-cursor paint policy, degraded-native messaging, and fluent commands in examples/Plate. |

Weighted score:
- total: 0.92
- closure threshold: 0.92
- closure result: threshold met, no dimension below 0.85, no unresolved P0/P1
  architecture issue, issue/reference sync closed, and final handoff recorded.

Source-backed architecture north star:
- target shape: one runtime editor owns document state; many root views render
  projections; one internal projection graph owns visible order; `ViewSelection`
  owns cross-root expanded selection; projected commands consume that selection.
- source evidence: `Point` already carries optional `root` in
  `packages/slate/src/interfaces/point.ts:15`; `Selection` is
  still `Range | null` in `packages/slate/src/interfaces/editor.ts:1147`;
  content-root owner identity exists in
  `packages/slate-react/src/hooks/use-slate-runtime.tsx:76`;
  active owner/view lookup and registration exist at
  `use-slate-runtime.tsx:145` and `:458`.
- rejected drift: do not encode repeated synced-block copy identity as document
  data unless collab proof requires it; do not rely on DOM selection as source
  of truth for cross-root expanded selection.
- migration posture: additive internal runtime first; public/core selection
  widening only after command/clipboard/history/collab proof shows the need.

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| Content-root rendering | keep `props.slots.contentRoot('body', options)` | One renderer-local call, no manual nested `Editable` plumbing | already aligned with prior Synced Blocks plan | `synced-blocks.tsx:113` declares `contentRoot`; example currently renders synced blocks through normal `renderElement` | keep |
| Cross-root selection | do not expose public core `Selection` change in first slice | Raw Slate users keep root-local `editor.selection` | Add internal runtime `ViewSelection`; public shape can follow proof | `Selection = Range | null` at `editor.ts:1147` | revise internally first |
| Projected commands | internal command target accepts `ViewSelection`/projection segments | App code calls normal commands; runtime resolves projected target | No app-level DOM range handling | current commands still operate from editor/root selection; gap recorded by Shift+Arrow repro | add |
| Browser handle | keep handle API but make cross-root import/export model-owned | Tests can assert model selection and DOM caveat separately | Existing browser handle remains compatible | `browser-handle.ts:213` imports unknown DOM selection through current editor | revise |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| Root-qualified point | `slate` point/location layer | Keep point root, add view/projection owner only in runtime selection | serializing copy-specific projection identity too early | `point.ts:15`; `PointApi.compare` compares root lexically at `point.ts:63` | keep + constrain |
| Model selection | `slate` editor state | Keep root-local `Selection` for compatibility during first slice | breaking every transform/history path | `editor.ts:1147` | keep for now |
| View selection | `slate-react` runtime | Add internal `ViewSelection` with root, point, and optional content-root owner | fake one-root ranges and wrong shared-copy selection | active owner API at `use-slate-runtime.tsx:145`; owner key at `:90` | add |
| Projection graph | missing unified owner | Add runtime graph of visible blocks and content-root projections | each feature rediscovering order differently | navigation currently finds owners locally in `content-root-navigation.ts:1077` | add |
| DOM selection import/export | `slate-react` browser/selection reconciler | DOM selection is an optimization; projected selection is model-owned | native newline selection corrupting Shift+Arrow rows | `browser-handle.ts:213`; partial DOM clears native ranges at `selection-reconciler.ts:880` | revise |
| Range projection | `slate` snapshot projection | Extend or layer runtime projection segments over roots/views | path-only projection cannot distinguish repeated mounted roots | `ProjectedRangeSegment` lacks root/owner at `editor.ts:1166`; path-based projection at `range-projection.ts:211` | revise |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| Synced block renderer | render product chrome + slot content root | Keep copy/unsync in example, not core | No extra public component until repeated call sites prove it | `synced-blocks.tsx:131` normal renderer; prior plan rejected public `<ContentRoot />` | keep |
| Root views | hidden nested `Editable` view over same runtime | View identity is runtime-local | selector subscriptions root/projection-scoped | content-root view registers owner at `editable-text-blocks.tsx:684` | keep |
| Selection highlights | runtime/projected overlay | Use model selection segments when native DOM cannot represent it | highlight only affected projection segments | partial DOM strategy already treats native surface as incomplete at `editable-text-blocks.tsx:2031` | add |

Plate migration-backbone target:
| Pressure | Slate substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| Embeddable synced documents | root-keyed content roots + projected selection | Plate can wrap raw Slate content-root slots with product commands/chrome | raw Slate does not own Notion permissions/workspace sync | prior Synced Blocks plan final handoff accepted route-local copy/unsync | keep |
| Cross-root formatting/delete/copy | projected command target | Plate commands pass through normal Slate command layer once target exists | no Plate-specific command DSL in raw Slate | current Shift+Arrow gap in coverage plan | add |

slate-yjs migration-backbone target:
| Pressure | Slate substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| Shared roots | root-keyed shared types | Map each Slate root to a shared type; projection owner remains local display state | current-version slate-yjs adapter support | prior Synced Blocks plan recorded one-`sharedRoot` as non-claim | keep |
| Remote cursors/selections | root-qualified remote selection plus projection paint policy | Store model remote selection once; render in active/all/nearest projection by product policy | serializing local copy identity by default | owner identity is runtime-local in current source | revise in later pass |

Ecosystem maintainer pass:
| Maintainer lens | Objection | Source pressure | Decision | Boundary / follow-up | Verdict |
|-----------------|-----------|-----------------|----------|----------------------|---------|
| Plate plugin maintainer | "If Synced Blocks are product UI, Plate needs enough hooks without forking Slate internals." | Plate already has a Slate-first / React-wrapper split: `createSlatePlugin` is the base plugin factory in `packages/core/src/lib/plugin/createSlatePlugin.ts:42-90`, `toPlatePlugin` wraps Slate plugins for React at `packages/core/src/react/plugin/toPlatePlugin.ts:56-89`, and `createPlatePlugin` is a wrapper over `createSlatePlugin` at `packages/core/src/react/plugin/createPlatePlugin.ts:43-57`. | Keep raw Slate substrate minimal and let Plate ship `SyncedBlockPlugin`-style wrappers, chrome, copy/unsync commands, remote-cursor paint policy, and degraded-native messaging. | First slice does not add a Plate-only public API. A tiny selector/hook stays unnamed unless real Plate wrappers prove repeated private runtime access. | accepted; no raw product API |
| Plate command/input-rule maintainer | "Projected commands will tempt raw Slate to grow a Tiptap-like product DSL." | Plate editor surfaces already expose `editor.api`, `editor.tf`, plugin metadata, and shortcuts at `packages/core/src/react/editor/PlateEditor.ts:27-68`; feature-owned input rules are current Plate direction, with inert autoformat compatibility in `packages/autoformat/src/plugin.ts:3-20` and list rule factories in `packages/list/src/lib/OrderedListRules.ts:17-37`. | Projected command target stays internal to Slate runtime. Plate can layer fluent/product commands over normal commands and feature plugins; raw Slate does not add command-chain sugar for Synced Blocks. | Execution proof must verify normal command calls work over projected targets before any Plate sugar is designed. | accepted; Plate owns product command DX |
| Plate React/component maintainer | "Slots are less React-y than a public `<ContentRoot />` component." | Current plan evidence says the renderer receives slot context at the element call site and prior content-root pass rejected component sugar unless real examples repeat awkward options. Plate React wrappers already convert Slate plugins through `toPlatePlugin`. | Keep `props.slots.contentRoot(...)` as raw Slate example shape. Plate may wrap it in a higher-level component later, but raw Slate should not hide renderer-owner context behind context magic in the first slice. | Revisit only after implementation shows multiple real Plate examples repeating identical slot boilerplate. | accepted; component sugar later |
| slate-yjs maintainer | "Current slate-yjs is one `sharedRoot`, so this plan cannot claim adapter compatibility." | `withYjs` stores one `sharedRoot: Y.XmlText` and applies local changes to that root at `../slate-yjs/packages/core/src/plugins/withYjs.ts:29-40`, `:156-180`, and `:238-263`; Yjs op translation also takes `sharedRoot` in `../slate-yjs/packages/core/src/applyToYjs/index.ts:18-27`. | Keep current slate-yjs compatibility as a non-claim. The target adapter is root-keyed shared types plus root-qualified selection conversion, not a compatibility shim over the current one-root API. | Issue sync must not upgrade `#5771` to fixed. Adapter proof later can justify `Improves`, not `Fixes`, until provider/browser repro exists. | accepted; non-claim |
| slate-yjs cursor/history maintainer | "Remote selections and undo metadata are single-root relative ranges today." | `withCursors` sends `RelativeRange` through awareness from `editor.selection` at `../slate-yjs/packages/core/src/plugins/withCursors.ts:24-40` and `:183-203`; `withYHistory` stores/restores relative selections on one `sharedRoot` at `../slate-yjs/packages/core/src/plugins/withYHistory.ts:68-148`. | Remote model selection must be root-qualified before projection paint. Projection owner/copy identity must not enter awareness by default; painting active/all/nearest copies is a product/local policy. | Revision keeps remote paint as adapter/product policy, not raw Slate law. | accepted; paint policy above model |
| Slate collaboration substrate maintainer | "Raw Slate must provide enough deterministic substrate without baking in Yjs." | Slate v2 migration tests already cover extension namespaces/schema state and deterministic replay with commit metadata/local-only runtime targets at `packages/slate/test/migration-backbone-contract.ts:34-60` and `:172-236`; collab history tests keep bookmarks and runtime targets local/rebased at `packages/slate/test/collab-history-runtime-contract.ts:530-616`. | Raw Slate should expose deterministic operations, commits/tags, root-qualified locations, bookmarks, and local runtime targets. It should not serialize projection owners or depend on Yjs APIs. | Revision pass should keep collaboration proof requirements substrate-level: fake adapter, remote replay, bookmark rebase, canonical reconcile, remote scroll/focus suppression, and projection paint policy. | accepted; substrate not adapter |
| Ecosystem documentation maintainer | "Examples may overteach Notion semantics." | Prior Synced Blocks plan and the current high-risk pass already make Notion a scenario only; Plate memory says product ergonomics belong above raw Slate, while current Plate source keeps product rules feature-owned. | Keep the `Synced Blocks` example product-real but explicitly example-local: border/top chrome, duplicate, unsync, and copy affordance are teaching fixtures, not raw Slate sync protocol. | Docs and final handoff must avoid changelog/migration language and state only the final architecture. | accepted; example-local |

Revision pass accepted plan:
| Area | Accepted decision | First-slice public shape | Internal owner | Promotion rule | Exit proof |
|------|-------------------|--------------------------|----------------|----------------|------------|
| Projection graph | Add one runtime projection graph for visible order across main blocks and content-root projections. | none | `slate-react` runtime | Public only if multiple non-React runtimes need the graph and execution proves the abstraction stable. | package graph rows: previous/next, compare projected points, segment spans, repeated-root owner identity. |
| Cross-root selection | Add private `ViewSelection` for projected expanded selections. | none; `editor.selection` stays root-local `Range | null` | `slate-react` runtime | Widen core `Selection` only if command, clipboard, history, or collab proof cannot preserve correctness internally. | Shift+Arrow forward/reverse rows across main, shared, and separate roots. |
| Projected commands | Runtime command plumbing resolves projected selection into ordered root-local edits in one update/history batch. | normal Slate commands | command/runtime bridge | Add public command target only if normal command calls cannot express projected behavior after proof. | delete/type/format/copy rows with before/after selection and undo/redo assertions. |
| Native browser contract | Treat native selection as capability output; model selection is authority for projected spans. | browser handle remains compatible | selection reconciler / browser handle | Public caveat/docs only after browser matrix classifies supported/degraded/unsupported affordances. | copy plain/html, find, IME, spellcheck, screen reader smoke, mobile caveat rows. |
| Root/projection identity | Persist root keys and root-local ranges; keep projection owner/copy identity runtime-local. | root-keyed document values | runtime owner registry | Shared projection channel only if real collab adapter proof requires it. | snapshot/serialization rows prove owner ids are absent from document/CRDT payloads. |
| Plate migration | Plate wraps product policy and command sugar above raw Slate. | raw slot plus normal commands | Plate plugins/examples | Add tiny selector/hook only after real Plate wrapper code cannot consume runtime state without private imports. | canonical Synced Blocks example stays route-local; future Plate wrapper proof can justify sugar. |
| slate-yjs migration | Target root-keyed shared types and root-qualified relative selections. | no current adapter compatibility claim | future adapter | Promote `#5771` only to `Improves` after package-level adapter proof; never `Fixes` without provider/browser repro. | fake adapter, high-QPS remote selection, bookmark rebase, canonical reconcile, remote scroll/focus suppression. |
| Performance | Normal editor path pays no Synced Blocks tax. | none | projection store/selectors | No perf claim until budget rows pass. | normal/medium/stress/pathological cohorts with selector wakes, DOM/heap/listeners, event-to-paint. |

Revised execution queue:
| Order | Slice | Red row first | Implementation target | Must not ship without | Notes |
|------:|-------|---------------|-----------------------|----------------------|-------|
| 1 | Projection graph contract | segment a visible span from main `p1` through a repeated shared root into a separate root | `Plate repo root` package tests | root/projection owner identity and no document serialization leak | Builds the primitive every later row consumes. |
| 2 | Private `ViewSelection` | `Shift+ArrowDown` from main `p1` creates projected model selection instead of native `"\n"` while Slate stays collapsed | Slate React runtime + Synced Blocks Playwright | reverse Shift row, collapse row, follow-up typing row | First user-visible fix target. |
| 3 | Projected commands | typing over projected selection replaces visible span in order | package command tests + browser | one history batch, undo/redo projected selection restore, no stale owner focus | Normal command API remains the app surface. |
| 4 | Clipboard / serialization | copy main + shared + separate roots serializes visible order exactly once per visible projection | browser clipboard rows | plain/html parity and repeated-root policy assertion | DOM order/root storage order are not authority. |
| 5 | Native affordance contract | classify find/IME/spellcheck/screen-reader/mobile support as supported/degraded/unsupported | browser matrix | explicit caveats for degraded rows | This prevents a fake native-parity claim. |
| 6 | Root lifecycle / collab substrate | unsync/duplicate/delete owner keep root data deterministic and projection owner local | package + browser + fake adapter | root-keyed shared type target, remote selection paint policy, no current slate-yjs fix claim | Plate policy remains above raw Slate. |
| 7 | Projection stress budgets | 20/100 repeated projections do not wake every subscriber or grow DOM/listeners unchecked | stress/benchmark rows | normal-path no-degradation and memory/DOM tags | Release-performance gate, not a benchmark vanity row. |

Execution ledger after acceptance:
| Slice | Status | Files | Verification | Notes |
|-------|--------|-------|--------------|-------|
| 1 Projection graph contract | complete | `packages/slate-react/src/projection-graph.ts`; `packages/slate-react/test/projection-graph-contract.test.ts` | red: `bun test:vitest -- projection-graph-contract` failed on missing module; green: `bun test:vitest -- projection-graph-contract`; focused regression: `bun test:vitest -- projection-graph-contract content-root-navigation-contract`; typecheck: `bun typecheck` in `packages/slate-react` | Internal runtime graph now resolves previous/next visible nodes, compares projected points with repeated-root owner identity, segments a visible span from `p1` through shared/separate roots, and keeps owner metadata outside serialized Slate points. |
| 2a Private `ViewSelection` model contract | complete | `packages/slate-react/src/view-selection.ts`; `packages/slate-react/test/view-selection-contract.test.ts` | red: `bun test:vitest -- view-selection-contract` failed on missing module; green: `bun test:vitest -- view-selection-contract projection-graph-contract`; focused regression: `bun test:vitest -- view-selection-contract projection-graph-contract content-root-navigation-contract`; formatting: `bunx biome check --fix ...`; typecheck: `bun typecheck` in `packages/slate-react` | Private view selection stores projected anchor/focus with runtime-local owner identity, derives projection segments through the graph, supports collapse/extend, treats implicit and explicit `main` roots as the same view point, and keeps state editor-local. Browser Shift+Arrow wiring remains pending. |
| 2b Private `ViewSelection` keyboard/browser wiring | complete | `packages/slate-react/src/editable/content-root-navigation.ts`; `packages/slate-react/src/editable/keyboard-input-strategy.ts`; `packages/slate-react/src/editable/caret-engine.ts`; `packages/slate-react/src/editable/browser-handle.ts`; `apps/www/tests/slate-browser/donor/examples/synced-blocks.test.ts` | red: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bunx playwright test playwright/integration/examples/synced-blocks.test.ts --project=chromium --grep "projects Shift"` failed with `getViewSelection(...)` null; green focused browser: same command passed; package regression: `bun test:vitest -- view-selection-contract projection-graph-contract content-root-navigation-contract browser-handle-contract`; typecheck: `bun typecheck` in `packages/slate-react`; full Synced Blocks Chromium single-worker: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bunx playwright test playwright/integration/examples/synced-blocks.test.ts --project=chromium` passed 13 tests after slice 3a added projected command rows | `Shift+ArrowDown` from `p1` and `Shift+ArrowUp` from `p2` now create private projected view selection while root-local Slate selection remains collapsed and native selection does not become newline. Pressing plain Arrow collapses back into the child root, clears private view selection, and follow-up typing edits the shared synced root. |
| 3a Projected command target for type/delete/history | complete | `packages/slate-react/src/editable/mutation-controller.ts`; `packages/slate-react/src/view-selection.ts`; `packages/slate-react/src/hooks/use-slate-history.ts`; `packages/slate-react/src/editable/browser-handle.ts`; `packages/slate-react/test/projected-command-contract.test.ts`; `apps/www/tests/slate-browser/donor/examples/synced-blocks.test.ts` | red: `bun test:vitest -- projected-command-contract` failed because projected insert/delete ignored private `ViewSelection` and edited the current root-local selection; green package: `bun test:vitest -- projected-command-contract view-selection-contract projection-graph-contract content-root-navigation-contract browser-handle-contract use-slate-history` passed 6 files / 27 tests; typecheck: `bun typecheck`; formatting: `bunx biome check packages/slate-react/src/view-selection.ts packages/slate-react/src/editable/mutation-controller.ts packages/slate-react/src/hooks/use-slate-history.ts packages/slate-react/src/editable/browser-handle.ts packages/slate-react/test/projected-command-contract.test.ts playwright/integration/examples/synced-blocks.test.ts`; focused browser: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bunx playwright test playwright/integration/examples/synced-blocks.test.ts --project=chromium --grep "typing over a projected Shift\\+Arrow selection"`; full browser: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bunx playwright test playwright/integration/examples/synced-blocks.test.ts --project=chromium` passed 13 tests | Insert text and delete-fragment now consume private projected selection, resolve ordered root-local ranges from projection segments, delete from the visual end back to the start, insert/collapse at the visual start, and store a history sidecar so undo restores projected owner identity while redo clears it. Browser proof uses a deterministic private `ViewSelection` test hook plus the normal editable command path; copy/clipboard/serialization remains pending in slice 4. |
| 4a Projected clipboard serialization | complete | `packages/slate-react/src/editable/projected-selection-target.ts`; `packages/slate-react/src/editable/projected-clipboard.ts`; `packages/slate-react/src/editable/clipboard-input-strategy.ts`; `packages/slate-react/test/projected-clipboard-contract.test.ts`; `apps/www/tests/slate-browser/donor/examples/synced-blocks.test.ts` | package: `bun test:vitest -- projected-command-contract projected-clipboard-contract view-selection-contract projection-graph-contract content-root-navigation-contract browser-handle-contract use-slate-history` passed 7 files / 29 tests; typecheck: `bun typecheck`; formatting: `bunx biome check packages/slate-react/src/view-selection.ts packages/slate-react/src/editable/mutation-controller.ts packages/slate-react/src/hooks/use-slate-history.ts packages/slate-react/src/editable/browser-handle.ts packages/slate-react/src/editable/projected-selection-target.ts packages/slate-react/src/editable/projected-clipboard.ts packages/slate-react/src/editable/clipboard-input-strategy.ts packages/slate-react/src/editable/input-state.ts packages/slate-react/src/editable/caret-engine.ts packages/slate-react/test/projected-command-contract.test.ts packages/slate-react/test/projected-clipboard-contract.test.ts playwright/integration/examples/synced-blocks.test.ts`; focused browser: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bunx playwright test playwright/integration/examples/synced-blocks.test.ts --project=chromium --grep "copies a projected selection"`; full browser: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bunx playwright test playwright/integration/examples/synced-blocks.test.ts --project=chromium` passed 14 tests | Copy now checks private projected selection before DOM/root-local serialization, extracts visible-order model fragments from projection segments, and writes `text/plain`, `text/html`, and `application/x-slate-fragment` payloads. Cut reuses the same projected payload before deleting through the projected command target. The first Playwright build exposed stale/cross-graph type issues; `site/.next`/`site/tsconfig.tsbuildinfo` were cleared, `caret-engine.ts` now imports runtime `Editor` from `slate/internal`, and `isEditableOutsideFocusBoundarySettling` accepts the narrow state shape its callers pass. |
| 4b Projected clipboard custom format key | complete | `packages/slate-dom/src/plugin/dom-clipboard-runtime.ts`; `packages/slate-dom/src/internal/index.ts`; `packages/slate-react/src/editable/projected-clipboard.ts`; `packages/slate-react/test/projected-clipboard-contract.test.ts` | autoreview red: Codex local review reported `[P2] Projected clipboard ignores custom Slate clipboard format keys`; green package: `bun test:vitest -- projected-clipboard-contract` passed 3 tests; focused package: `bun test:vitest -- projected-clipboard-contract projected-command-contract view-selection-contract projection-graph-contract` passed 4 files / 16 tests; wider package: `bun test:vitest -- projection-stress-contract projected-collab-substrate-contract projected-native-affordance-contract projected-clipboard-contract projected-command-contract view-selection-contract projection-graph-contract content-root-navigation-contract browser-handle-contract use-slate-history` passed 10 files / 40 tests; typecheck: `bun typecheck`; formatting: `bunx biome check packages/slate-dom/src/plugin/dom-clipboard-runtime.ts packages/slate-dom/src/internal/index.ts packages/slate-react/src/editable/projected-clipboard.ts packages/slate-react/test/projected-clipboard-contract.test.ts`; browser: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bunx playwright test playwright/integration/examples/synced-blocks.test.ts --project=chromium --grep "copies a projected selection"` | Projected clipboard now reads the editor's configured DOM clipboard format key instead of hard-coding `x-slate-fragment`, and the regression test proves custom-key projected copies write the matching `application/<key>` payload plus `data-slate-fragment-format`. |
| 5a Native affordance matrix | complete | `packages/slate-react/src/editable/projected-native-affordance.ts`; `packages/slate-react/test/projected-native-affordance-contract.test.ts`; `packages/slate-react/src/editable/browser-handle.ts`; `apps/www/tests/slate-browser/donor/examples/synced-blocks.test.ts` | package: `bun test:vitest -- projected-native-affordance-contract projected-clipboard-contract projected-command-contract view-selection-contract projection-graph-contract content-root-navigation-contract browser-handle-contract use-slate-history` passed 8 files / 30 tests; typecheck: `bun typecheck`; formatting: `bunx biome check packages/slate-react/src/view-selection.ts packages/slate-react/src/editable/mutation-controller.ts packages/slate-react/src/hooks/use-slate-history.ts packages/slate-react/src/editable/browser-handle.ts packages/slate-react/src/editable/projected-selection-target.ts packages/slate-react/src/editable/projected-clipboard.ts packages/slate-react/src/editable/projected-native-affordance.ts packages/slate-react/src/editable/clipboard-input-strategy.ts packages/slate-react/src/editable/input-state.ts packages/slate-react/src/editable/caret-engine.ts packages/slate-react/test/projected-command-contract.test.ts packages/slate-react/test/projected-clipboard-contract.test.ts packages/slate-react/test/projected-native-affordance-contract.test.ts playwright/integration/examples/synced-blocks.test.ts`; focused browser: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bunx playwright test playwright/integration/examples/synced-blocks.test.ts --project=chromium --grep "native affordances"`; full browser: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bunx playwright test playwright/integration/examples/synced-blocks.test.ts --project=chromium` passed 15 tests | Native affordances are explicitly classified instead of implied: projected clipboard is supported through model-owned serialization; browser find, IME, spellcheck, and screen-reader behavior are degraded; raw mobile selection handles are unsupported without device proof. The browser row asserts native selection text is not the projected payload, so the contract stays honest about model-owned selection. |
| 6a Root lifecycle / collab substrate | complete | `packages/slate-react/src/editable/projected-collab-substrate.ts`; `packages/slate-react/test/projected-collab-substrate-contract.test.ts`; existing `apps/www/tests/slate-browser/donor/examples/synced-blocks.test.ts` duplicate/unsync row | red/green package: `bun test:vitest -- projected-collab-substrate-contract`; focused package: `bun test:vitest -- projected-collab-substrate-contract projected-native-affordance-contract projected-clipboard-contract projected-command-contract view-selection-contract projection-graph-contract content-root-navigation-contract browser-handle-contract use-slate-history` passed 9 files / 33 tests; typecheck: `bun typecheck`; formatting: `bunx biome check packages/slate-react/src/view-selection.ts packages/slate-react/src/editable/mutation-controller.ts packages/slate-react/src/hooks/use-slate-history.ts packages/slate-react/src/editable/browser-handle.ts packages/slate-react/src/editable/projected-selection-target.ts packages/slate-react/src/editable/projected-clipboard.ts packages/slate-react/src/editable/projected-native-affordance.ts packages/slate-react/src/editable/projected-collab-substrate.ts packages/slate-react/src/editable/clipboard-input-strategy.ts packages/slate-react/src/editable/input-state.ts packages/slate-react/src/editable/caret-engine.ts packages/slate-react/test/projected-command-contract.test.ts packages/slate-react/test/projected-clipboard-contract.test.ts packages/slate-react/test/projected-native-affordance-contract.test.ts packages/slate-react/test/projected-collab-substrate-contract.test.ts playwright/integration/examples/synced-blocks.test.ts`; browser: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bunx playwright test playwright/integration/examples/synced-blocks.test.ts --project=chromium --grep "duplicate shares"` | Root lifecycle proof is root-keyed and explicit: duplicate reuses the same content root, unsync creates a new root plus a main-root `set_node`, owner deletion does not cascade-delete root data, and explicit root deletion replays remotely. Fake remote replay uses collaboration metadata that skips local history. Remote selection paint remains local policy: all projections, active projection, or none; root-qualified remote selections do not serialize projection owner identity. This is substrate proof only, not a current slate-yjs fixed claim. |
| 7a Projection stress budgets | complete | `packages/slate-react/test/projection-stress-contract.test.ts`; existing `packages/slate-react/test/content-root-navigation-contract.test.ts` no-content-root row | focused stress: `bun test:vitest -- projection-stress-contract content-root-navigation-contract`; focused package: `bun test:vitest -- projection-stress-contract projected-collab-substrate-contract projected-native-affordance-contract projected-clipboard-contract projected-command-contract view-selection-contract projection-graph-contract content-root-navigation-contract browser-handle-contract use-slate-history` passed 10 files / 36 tests; typecheck: `bun typecheck`; formatting: `bunx biome check packages/slate-react/src/view-selection.ts packages/slate-react/src/editable/mutation-controller.ts packages/slate-react/src/hooks/use-slate-history.ts packages/slate-react/src/editable/browser-handle.ts packages/slate-react/src/editable/projected-selection-target.ts packages/slate-react/src/editable/projected-clipboard.ts packages/slate-react/src/editable/projected-native-affordance.ts packages/slate-react/src/editable/projected-collab-substrate.ts packages/slate-react/src/editable/clipboard-input-strategy.ts packages/slate-react/src/editable/input-state.ts packages/slate-react/src/editable/caret-engine.ts packages/slate-react/test/projected-command-contract.test.ts packages/slate-react/test/projected-clipboard-contract.test.ts packages/slate-react/test/projected-native-affordance-contract.test.ts packages/slate-react/test/projected-collab-substrate-contract.test.ts packages/slate-react/test/projection-stress-contract.test.ts playwright/integration/examples/synced-blocks.test.ts` | Projection graph stress is bounded by visible graph size: 20 and 100 repeated projections produce one owner segment per visible projection and no owner serialization in the plain path. The single-root 1000-block row stays one owner-free segment, and the existing no-content-root navigation contract proves vertical keys do not resolve mounted roots when schema has no content roots. This is a deterministic budget contract, not a broad browser perf benchmark. |
| Synced Blocks existing browser rows | complete / extended | existing `apps/www/tests/slate-browser/donor/examples/synced-blocks.test.ts` | focused: `PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/synced-blocks.test.ts --project=chromium --grep "moves ArrowDown"`; final full single-worker after clipboard-key fix: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bunx playwright test playwright/integration/examples/synced-blocks.test.ts --project=chromium` passed 15 tests | Existing Chromium rows pass single-worker: smoke, editing shared copy, undo/redo focus, history across roots, ArrowDown/Up, Shift+Arrow, projected type/delete/copy, native-affordance matrix, ArrowLeft/Right, Cmd+Arrow, click outside, duplicate/unsync. A prior two-worker run hit `ERR_CONNECTION_REFUSED` from the local Playwright server mid-suite, so single-worker is the valid evidence. |
| Autoreview closeout | complete | `.agents/skills/autoreview/SKILL.md`; `.agents/skills/autoreview/scripts/autoreview` | loaded skill; default Codex local review initially hung and stale helper children were killed; bounded low-thinking Codex run from `Plate repo root` found `[P2] Projected clipboard ignores custom Slate clipboard format keys`; after fixing, `PYTHONUNBUFFERED=1 /Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local --thinking codex=low --output /tmp/slate-v2-autoreview-final.out --json-output /tmp/slate-v2-autoreview-final.json` returned `autoreview clean: no accepted/actionable findings reported` | The only accepted review finding was real and fixed. Final autoreview is clean. |

Intent / boundary record:
- user intent: make synced/content-root documents read and edit like sibling
  blocks in one document, including repeated projections of the same root.
- product pressure: Notion-style synced blocks are a scenario and example; raw
  Slate owns the substrate, not workspace permissions, copy menus, badges, or
  product sync UI.
- editing outcome: Shift+Arrow, copy, delete, paste, type-replace, formatting,
  undo/redo, and collapsed navigation operate over visible projected order while
  preserving one editor/runtime operation stream.
- model invariant: canonical content lives in keyed Slate roots. Projection
  order, active owner identity, and repeated-copy identity are runtime view
  facts unless collaboration proof later requires a different shared policy.
- public API boundary: keep `props.slots.contentRoot('body', options)` as the
  example-facing renderer call; do not add a public `<ContentRoot />`, public
  `ViewSelection`, public projection-command DSL, or core `Selection` widening
  in the first implementation slice.
- internal boundary: add a runtime projection graph and internal
  `ViewSelection` that can describe visible-order spans across root/view owners.
  `editor.selection` remains root-local `Range | null` until proof says public
  core selection must change.
- command boundary: app code still calls normal Slate commands. Runtime command
  plumbing resolves internal `ViewSelection` into ordered root-local edits in a
  single editor update/history batch. App code never hands Slate a DOM range for
  projected editing.
- browser boundary: native DOM selection is an output/capability when it can
  represent the model selection. For repeated roots or cross-root spans it is
  not the source of truth; model-owned projected selection and explicit
  clipboard/native-affordance fallbacks decide behavior.
- collaboration boundary: shared state should store root-keyed model content and
  root-qualified remote selections. Projection owner/copy paint policy is local
  display policy until slate-yjs proof requires a shared projection channel.
- in-scope: projection graph, `ViewSelection`, projected commands, root
  lifecycle policy, history restore policy, collab substrate shape, performance
  budgets, browser-native contracts, and proof gates.
- non-goals: implementation in this activation, Notion server semantics,
  current-version slate-yjs adapter support, one-editor-per-block, mirrored
  roots, product command DSLs, and default traversal inside ordinary void
  descendants.
- unresolved user-decision points: none. The plan can continue with internal
  runtime projection selection first.

Decision brief:
- decision: choose internal runtime projection selection first:
  projection graph + `ViewSelection` + projected command target.
- why this wins: it preserves the current Slate public contract, uses the
  existing one-runtime/content-root direction, and directly addresses the bug
  class browser selection cannot represent: one visible document made from
  multiple roots and repeated root projections.
- principles: one runtime; model-owned editing semantics; root-local core
  selection compatibility; public API minimal until proof; explicit native
  browser affordance contracts; product chrome outside raw Slate.
- top drivers: repeated projection identity, cross-root expanded selection,
  command correctness over delete/type/copy/paste/history, collaboration
  substrate, and performance under 20/100 repeated projections.
- viable option A: internal `ViewSelection` with projection-owned commands.
  Choose it. It gives the runtime enough view context without serializing
  copy identity into the document or breaking core transforms.
- viable option B: widen core `Selection` now. Reject for first slice. It
  spreads projection identity into every transform, history, serializer, and
  plugin before command/clipboard/collab proof shows that public blast radius is
  necessary.
- viable option C: rely on browser DOM selection and repair after import. Reject
  for cross-root/repeated projection spans. The known Shift+Arrow failure already
  shows native selection can become `"\n"` while Slate stays collapsed.
- viable option D: one editor per projected block. Reject. It turns shared
  selection, history, normalization, focus, and collaboration into federation
  problems. That is the wrong base architecture for embedded documents that must
  feel like siblings.
- viable option E: mirrored roots as sync. Reject. It creates copy/update
  synchronization rather than shared operation identity.
- adoption route: first implementation slice is internal runtime only; examples
  keep the slot call. Public API expands only after tests prove internal-only
  cannot support command, clipboard, history, or collaboration needs.
- decision-changing evidence: make `ViewSelection` public/core only if
  projected commands or collaboration cannot preserve correctness through
  internal runtime state; reconsider native DOM strategy only if accessibility,
  IME, or clipboard proof cannot be made honest with model-owned projected
  selection; reconsider one-editor-per-block only if one runtime fails measured
  isolation/perf targets under repeated-root stress.
- consequences: browser proof expands; command internals must consume projected
  targets; history may need runtime-local projected-selection restore metadata;
  raw Slate stays unopinionated.
- follow-ups: user review; accepted-plan execution starts under a separate goal.

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| `#5212` | related, not claimed | Synced Blocks/content roots remain the clean teaching route, but no fixed/improved editable-void example claim is legal from this planning pass. | Prior accounting says route/source/browser proof must land before any example claim. | future route/source/browser proof | synced: `gitcrawl-v2-sync-ledger.md:104`, `issue-coverage-matrix.md:164`, `fork-issue-dossier.md:88` | no-claim sync: `pr-description.md:108-117` |
| `#2072` | related architecture pressure, unchanged | Projection selection strengthens the same-runtime content-root substrate; it does not close the broader island request. | Mixed islands and pure editor-rooted blocks are still separate surfaces. | future owner/root payload, serialization, mobile, perf, collab, release proof | synced: `gitcrawl-v2-sync-ledger.md:105`, `issue-coverage-matrix.md:165`, `fork-issue-dossier.md:89` | no-claim sync: `pr-description.md:108-117` |
| `#5524` | related, not claimed | Soft-break ArrowDown remains a different failure family unless later proof shows the same DOM root-crossing owner. | Current plan targets projected roots, not the soft-break caret issue directly. | future browser proof only | synced: `gitcrawl-v2-sync-ledger.md:106`, `issue-coverage-matrix.md:166`, `fork-issue-dossier.md:90` | no-claim sync: `pr-description.md:108-117` |
| `#5874`, `#4309` | related identity guardrail | Projection selection must use root keys and runtime owner identity, not shared Slate node-object identity. | Repeated projection identity is display/runtime-local; node-object sharing across positions stays unsupported. | future repeated-root selection/history proof | synced: `gitcrawl-v2-sync-ledger.md:107`, `issue-coverage-matrix.md:167`, `fork-issue-dossier.md:91` | no-claim sync: `pr-description.md:108-117` |
| `#6016` | triage-closed/non-fix, unchanged | One runtime with root-bound views is the answer; shared object graphs across independent editor runtimes stay unsupported. | This plan deliberately avoids one-editor-per-block and mirrored-root sync. | no fix claim | synced: `gitcrawl-v2-sync-ledger.md:108`, `issue-coverage-matrix.md:168`, `fork-issue-dossier.md:92` | no-claim sync: `pr-description.md:108-117` |
| `#5537`, `#5117` | related multi-view focus/DOM-state pressure | Active projection identity and focus have route-level proof; placeholder/DOM-state issue closure remains unclaimed. | Projected selection makes this pressure sharper but does not prove the old bugs fixed. | exact issue repro mapping | synced: `gitcrawl-v2-sync-ledger.md:109`, `issue-coverage-matrix.md:169`, `fork-issue-dossier.md:93` | no-claim sync: `pr-description.md:108-117` |
| delete/selection cluster `#3991`, `#3868`, `#5582`, `#5477`, `#4896`, `#4350`, `#4328`, `#5630` | related, unchanged | Existing exact fixed floors stay exact; projected commands have route-level proof, not projected-root issue closure. | Owner deletion, range delete, select-all, paste/delete, and root restore remain issue-specific proof gates for projected roots. | exact issue repro mapping | synced: `gitcrawl-v2-sync-ledger.md:110`, `issue-coverage-matrix.md:170`, `fork-issue-dossier.md:94` | no-claim sync: `pr-description.md:108-117` |
| clipboard/drop/move cluster `#4806`, `#4802`, `#4104`, `#3926`, `#4888`, `#4623` | related, unchanged | Existing exact clipboard fixed floors stay exact; projected copy serialization has route-level proof, including custom clipboard format keys. | Move, unsync payload remap, drag/drop, and exact issue repro closure remain unclaimed. | exact issue repro mapping | synced: `gitcrawl-v2-sync-ledger.md:111`, `issue-coverage-matrix.md:171`, `fork-issue-dossier.md:95` | no-claim sync: `pr-description.md:108-117` |
| perf cluster `#5131`, `#2051`, `#2195`, `#2405`, `#790` | related guardrail, unchanged | Deterministic repeated-projection stress proof landed for 20/100 projection cohorts. | Broader browser benchmark and issue-specific performance claims remain unclaimed. | benchmark/repro mapping | synced: `gitcrawl-v2-sync-ledger.md:112`, `issue-coverage-matrix.md:172`, `fork-issue-dossier.md:96` | no-claim sync: `pr-description.md:108-117` |
| collab/history cluster `#5771`, `#5533`, `#1770`, `#3741` | related guardrail, unchanged | Existing `#5771` readiness accounting is not upgraded or broadened here; root lifecycle/collab substrate proof landed, but current slate-yjs projected-root support is not claimed. | Projection owner identity stays runtime-local until real adapter proof says otherwise. | future adapter proof | synced: `gitcrawl-v2-sync-ledger.md:113`, `issue-coverage-matrix.md:173`, `fork-issue-dossier.md:97` | no-claim sync: `pr-description.md:108-117` |

Issue-ledger sync status:
- ClawSweeper related-issue discovery: skipped/reused with evidence. The same
  issue-facing Synced Blocks/content-root surface was already reviewed in
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md:46-82` and
  `docs/slate-v2/ledgers/issue-coverage-matrix.md:109-136`.
- generated live gitcrawl rows read: current open rows confirmed for `#6016`
  (`gitcrawl-live-open-ledger.md:22`), `#5874` (`:47`), `#5524`
  (`:114`), `#5212` (`:176`), `#5117` (`:197`), `#4309` (`:372`),
  and `#2072` (`:634`).
- manual v2 sync ledger update: added and reverified projection-selection
  planning sync in `docs/slate-issues/gitcrawl-v2-sync-ledger.md:83-113`; no
  new fixed/improved claims, no broadening of existing exact fixed floors, and
  no broadening of existing `#5771` readiness accounting.
- fork issue dossier update: added and reverified projection-selection surface
  review in `docs/slate-v2/ledgers/fork-issue-dossier.md:66-101`; no new
  fixed/improved claims.
- issue coverage matrix update: added and reverified projection-selection
  planning sync in `docs/slate-v2/ledgers/issue-coverage-matrix.md:145-173`;
  no new fixed/improved claims.
- PR description sync: added and reverified no-claim reference bullet in
  `docs/slate-v2/references/pr-description.md:108-117`; fixed/improved counts
  stay unchanged.
- issue sync accounting closure: rows now explicitly preserve existing exact
  fixed floors such as `#3991` and `#4806` and existing `#5771` readiness
  accounting without promoting them into projected-root claims.

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| ProseMirror | `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md:27-39`; `../prosemirror-state/src/transaction.ts:22-41`, `:67-89`; `../prosemirror-view/src/selection.ts:9-47`, `:55-101` | transactions own document/selection/metadata; view owns DOM selection import/export | per-view DOM repair guessing | centralized projected selection authority and semantic command transaction | copying integer positions, schema/plugin complexity, or PM view tree | internal `ViewSelection` resolves to ordered root-local edits in one `editor.update` | applied |
| Lexical | `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md:34-47`, `:108-122`; `../lexical/packages/lexical/src/LexicalEditor.ts:929-990`, `:1162-1178`, `:1375-1388`; `../lexical/packages/lexical/src/LexicalUpdateTags.ts:10-53` | read/update legality, prioritized command listeners, lifecycle/update tags | broad mutable editor state and accidental side effects | lifecycle partition, command ownership, tags for history/paste/collab/DOM-selection policy | class nodes, `$` helpers, nested composer as synced-block substrate | one runtime + projected commands inside update metadata | applied |
| Tiptap | `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md:25-39`, `:54-70`, `:100-114`; `../tiptap/packages/core/src/CommandManager.ts:28-49`, `:59-93`, `:112-134` | command catalog and chained commands collect work over one transaction | raw engine details leaking into app code | discoverable command/extension DX and optional future chain sugar | requiring `chain().focus().run()` or a product DSL in raw Slate | normal Slate commands, internal projected target, optional sugar later | applied |
| React ProseMirror | `../react-prosemirror/README.md:109-145`, `:215-220` | React rendering and editor view state need explicit phase boundaries and safe effect/event access | dual DOM ownership and render-phase editor-view calls | safe access boundary between React views and editor state | wrapper/portal DOM power struggle | React renders root views; Slate runtime owns state, selection, and commands | applied |
| React 19.2 | `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md:29-43`, `:57-78`, `:80-102`; `packages/slate-react/src/hooks/use-slate-annotations.tsx:5`, `:52-65`, `:73-85` | external-store subscriptions, hidden/background UI scheduling, Performance Tracks | treating render state as document truth | selector/external-store discipline for projection graph consumers | relying on React to solve editor invalidation | runtime projection graph outside hot render, root/projection-scoped subscriptions | applied |
| slate-yjs / Yjs | `docs/research/sources/editor-architecture/yjs-collaboration-bindings.md:42-69`, `:101-120`; `../slate-yjs/packages/core/src/plugins/withCursors.ts:24-40`, `:98-118`, `:183-203`; `../slate-yjs/packages/core/src/applyToYjs/index.ts:10-15`, `:17-28` | shared model data, relative cursor positions, awareness external state, selection excluded from document ops | DOM/local projection identity in shared state | root-keyed shared types, relative-position bridge, awareness external-store hooks | current one-`sharedRoot` adapter or wrapper mutation as a public claim | collab substrate with root-qualified remote selections and projection paint policy | applied |
| Plate / Synced Blocks | `docs/plans/2026-05-26-slate-v2-synced-content-roots.md:170-186`, `:252-309`, `:311-315`; `apps/www/src/app/(app)/examples/slate/_examples/synced-blocks.tsx:68-89`, `:108-117`, `:119-134` | product chrome wraps raw content-root projection; shared root may mount multiple times | product UI leaking into raw Slate | one slot call plus root/projection substrate Plate can wrap | Notion permissions, copy menus, or Plate command DSL in raw Slate | raw Slate substrate; Plate owns synced-block product API | applied |

Legacy regression proof matrix:
| Regression class | Legacy behavior | Slate v2 target | Proof route | Owner | Status |
|------------------|-----------------|-----------------|-------------|-------|--------|
| Shift+Arrow across projected roots | Browser creates native newline selection; model stays collapsed | `ViewSelection` spans projected roots and renders model-owned segments | Synced Blocks Playwright: forward/reverse Shift rows | slate-plan execution | add |
| Copy across projected roots | Native DOM copy may miss hidden/partial roots or duplicate wrong projection | serialize from projected selection segments | browser clipboard rows | slate-plan execution | add |
| Delete/type replacement across projected roots | root-local transforms cannot consume visible document span | projected command target applies ordered root-local edits in one transaction/history batch | package + browser rows | slate-plan execution | add |
| Undo/redo across projected roots | active-copy history focus already improved | history stores/restores projected selection owner when expanded | package + browser rows | slate-plan execution | revise |
| Repeated shared-root projection | wrong copy focus was fixed for collapsed nav/history | selection and commands carry owner identity | existing Synced Blocks rows plus new selection rows | slate-plan execution | extend |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| Synced Blocks expanded selection | Shift+ArrowDown/Up from p1 through all roots to p2 and back | Chromium first, then Firefox/WebKit where stable | Playwright route rows | model `ViewSelection`, projected highlight, no native newline leak | add |
| Clipboard | copy projected selection containing main + shared + separate roots | Chromium + WebKit | Playwright clipboard route rows | text/html/plain serialize visible order once | add |
| Delete/type replacement | delete and type over projected selection | Chromium | Playwright + package command rows | selected visible span replaced, undo restores all roots | add |
| Performance | 20/100 repeated projections | Chromium + package stress | benchmark/stress rows | bounded selector fanout, mounted view count, listener count, heap/DOM growth | add |
| Native affordances | find, screen reader flow, spellcheck, IME caveats | browser matrix | explicit pass/fail/caveat rows | no accidental regression hidden by fake highlight | add |

Pressure pass review:
| Lens | Pressure applied | Decision | Proof / source |
|------|------------------|----------|----------------|
| Vercel React | Use selector/external-store hooks, defer only non-urgent overlays, keep editor input/selection urgent, avoid derived state/effects in repeated units. | Applied. `ViewSelection` and projection graph are runtime data, not broad React state. Activity/transitions may help sidebars or hidden chrome only. | `vercel-react-best-practices`; `content/docs/slate/walkthroughs/09-performance.md:50-56`; `packages/slate-react/src/hooks/use-slate-projections.tsx:31-61`. |
| performance-oracle | Treat projection segmentation and projected commands as hot-path algorithms; reject O(document) recompute on typing/selection. | Applied. Target is O(changed roots + affected runtime ids + projected span), not O(all projections/all roots) for every event. | `packages/slate-react/src/projection-store.ts:99-120`, `:513-554`, `:632-667`. |
| performance | Add cohorts, repeated-unit budgets, INP/lab proxies, memory/DOM tags, degradation contract, and native behavior proof. | Applied. Repeated unit is one mounted content-root projection; normal/medium stay DOM-present; stress rows can be lab-only but must classify native behavior. | `.agents/skills/performance/rules/cohort-segmentation.md`, `repeated-unit-budget.md`, `interaction-inp-matrix.md`, `memory-dom-tagging.md`, `degradation-contract.md`, `editor-native-behavior-proof.md`. |
| TDD | Start execution with one public failing behavior row, not a private projection-graph shape test. | Applied to execution queue. First red row: `Shift+ArrowDown` from `p1` into synced content produces model `ViewSelection`; then reverse Shift, copy, delete/type replacement, undo/redo restore, stress. | `tdd` skill; prior repro in `docs/plans/2026-05-26-slate-v2-synced-blocks-selection-history-coverage.md:274`. |
| shadcn/composability | Keep product chrome local and API minimal; use familiar controls in examples without adding a raw Slate component kit. | Applied as composability lens, not dependency work. Keep `props.slots.contentRoot('body', options)` and reject public `<ContentRoot />` until repeated public call sites prove it. | `packages/slate-react/src/components/editable-text-blocks.tsx:450-459`, `:563-575`; `apps/www/src/app/(app)/examples/slate/_examples/synced-blocks.tsx:286`. |
| react-useeffect | Effects only synchronize with external systems; root/projection state changes belong in transactions, event handlers, runtime stores, or external-store subscriptions. | Applied. Do not create roots, owner state, or selection repair through effects just to make React catch up. | `react-useeffect`; `packages/slate-react/src/components/slate.tsx:441-542`, `:608-699`. |
| simplicity | Cut speculative API. No public `ViewSelection`, no public command chain, no public content-root component, no Plate wrapper, no Notion semantics in raw Slate. | Applied. Internal runtime first; public/core selection widening only after proof. Keep helpers inline in the example unless reused. | `code-simplicity-reviewer`; decision brief and hard cuts above. |

Performance lane:
| Question | Answer | Gate |
|----------|--------|------|
| Repeated unit | One mounted content-root projection: owner block, root view/editor, active owner registration, projected text subscriptions, selection overlay, and browser bridge work. | Count mounted projections, root views, selector subscribers, event listeners, DOM nodes, and overlay segments. |
| Cohorts | normal: main doc + 1-5 projections; medium: 20 projections; stress: 100 projections; pathological: 100 projections plus comments/decorations/custom renderers/collab activity/mobile/IME. | Every perf claim must name cohort and complexity tags. |
| Budgets | Unrelated root edit must not wake unrelated root/projection subscribers. Same-root edit may repaint each mounted copy but must not rescan all document roots. Cross-root selection may allocate proportional to selected projected span, not whole document. | Use projection-store metrics and selector dispatch counts; add package/browser stress rows in execution. |
| Interaction matrix | type, Shift select, reverse Shift select, select-all, copy, paste, delete/type replacement, undo/redo, click outside, remote update, and follow-up typing after repair. | p50/p75/p95/p99 or event-to-update/event-to-paint lab proxies by cohort. |
| Memory/DOM tags | JS heap, DOM node count, mounted projection count, selector subscription count, listener count, cached projection/index sizes, dirty id set size, custom renderer/decorations/comments flags. | Large/stress rows record latency and memory/DOM together. |
| Degradation contract | No degradation for normal/medium. Stress/pathological may use staged/materialized/model-backed modes only with explicit copy/find/selection/IME/screen-reader/mobile/history/collab classification. | Native behavior proof rows required before claiming speed wins. |
| React 19.2 scope | `useSyncExternalStore`/selectors for runtime state; transitions/deferred work for non-urgent overlays; Activity for hidden panels, not hidden editable content. | React Performance Tracks can prove React work breadth, not editor selection correctness. |
| Trace/CWV scope | Page-load CWV is not the proof for this lane. Editor interaction trace, event timing, long animation frame, and Playwright native rows matter. | `content/docs/slate/walkthroughs/09-performance.md:7-11`; huge-document metrics source at `apps/www/src/app/(app)/examples/slate/_examples/huge-document.tsx:22-27`, `:351-401`. |
| RUM gap | Future dashboard tags: route, cohort, projection count, active root, selected span length, operation family, browser, mobile/IME, DOM strategy, heap/DOM nodes, and release. | Not needed before plan acceptance; required before production perf claims. |

Research/live-source refresh evidence:
| Area | Source read | Take | Plan impact |
|------|-------------|------|-------------|
| DOM selection authority | ProseMirror transaction/view source and compiled research | DOM import/export needs one bridge owner; browser selection is not a trustworthy source for repeated-root spans. | Keep model-owned projected selection and projected commands. |
| Command/update lifecycle | Lexical and Tiptap source plus compiled research | Command listeners/chains are useful only when they feed one transaction/update boundary. | Projected commands resolve internally inside one update/history batch. |
| React phase safety | React ProseMirror README and React 19.2 research | React can render and schedule views, but editor-view reads/writes need phase-safe access and external-store discipline. | Projection graph belongs outside broad React state. |
| Collaboration pressure | Yjs research and external slate-yjs source | Cursors use relative positions/awareness; external adapter remains one shared root and no-op selection export. | Plan root-keyed shared types and root-qualified remote selections, not adapter compatibility. |
| Plate product pressure | prior Synced Blocks plan and example source | Synced Blocks are a product pattern on raw root projections. | Keep raw Slate API minimal and let Plate wrap the substrate. |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| `Point` is root-qualified today | `Plate repo root` | `nl -ba packages/slate/src/interfaces/point.ts` | source read: `root?: string` at line 15 | current pass |
| `Selection` is still root-local `Range | null` shape | `Plate repo root` | `nl -ba packages/slate/src/interfaces/editor.ts` | source read: `BaseSelection = Range | null` at line 1147 | current pass |
| Projection segments lack root/owner identity | `Plate repo root` | `nl -ba packages/slate/src/interfaces/editor.ts` and `nl -ba packages/slate/src/range-projection.ts` | source read: `ProjectedRangeSegment` has path/runtimeId/start/end; projection is path/snapshot based | current pass |
| Active content-root owner identity exists | `Plate repo root` | `nl -ba packages/slate-react/src/hooks/use-slate-runtime.tsx` | source read: owner type and active owner/view lookup exist | current pass |
| Collapsed content-root navigation is owner-aware | `Plate repo root` | `nl -ba packages/slate-react/src/editable/content-root-navigation.ts` | source read: target carries optional owner and focuses owner-specific view | current pass |
| DOM selection import is still browser-source oriented | `Plate repo root` | `nl -ba packages/slate-react/src/editable/browser-handle.ts` | source read: unknown selection imports DOM selection into current editor | current pass |
| Partial DOM already permits model-owned native clearing | `Plate repo root` | `nl -ba packages/slate-react/src/editable/selection-reconciler.ts` | source read: partial DOM mode clears native ranges | current pass |
| Synced Blocks fixture covers repeated and separate roots | `Plate repo root` | `nl -ba site/examples/ts/synced-blocks.tsx` | source read: shared and separate body roots in initial value | current pass |
| Synced Blocks collapsed nav/history proof exists | `Plate repo root` | `nl -ba playwright/integration/examples/synced-blocks.test.ts` | source read: ArrowUp/Down, ArrowLeft/Right, Cmd+Arrow rows exist | current pass |
| Current React external-store posture exists | `Plate repo root` | `nl -ba packages/slate-react/src/hooks/use-slate-annotations.tsx` | source read: `useSyncExternalStore` backs annotation subscriptions | research pass |
| Current history root restore is root-scoped, not projection-selection scoped | `Plate repo root` | `nl -ba packages/slate-react/src/hooks/use-slate-history.ts` | source read: history selects a root from selection/commit and focuses a mounted view | research pass |
| Browser handle already has model-owned command repair but unknown selections still import DOM | `Plate repo root` | `nl -ba packages/slate-react/src/editable/browser-handle.ts` | source read: command path sets `selectionSource: 'model-owned'`; unknown import sets `selectionSource: 'dom-current'` | research pass |
| Projection subscriptions can target runtime ids today | `Plate repo root` | `nl -ba packages/slate-react/src/hooks/use-slate-projections.tsx` | source read: runtime-id subscription path uses `useSyncExternalStore` | pressure pass |
| Projection store tracks changed runtime ids and wake counts today | `Plate repo root` | `nl -ba packages/slate-react/src/projection-store.ts` | source read: metrics include changed runtime bucket and subscriber wake counts; recompute notifies changed runtime ids | pressure pass |
| Current Slate docs already define narrow subscription and INP posture | `Plate repo root` | `nl -ba docs/walkthroughs/09-performance.md` | source read: target-scoped hooks, projection stores, staged/full/virtualized DOM, and typing INP guidance | pressure pass |
| Current Huge Document example records event and long-animation-frame timings | `Plate repo root` | `nl -ba site/examples/ts/huge-document.tsx` | source read: event timing and LoAF observers exist for interaction proof | pressure pass |

Autoreview workspace gate:
| Reviewed patch owner | Cwd | Command | Result | Notes |
|----------------------|-----|---------|--------|-------|
| none | N/A | N/A | N/A | Planning-only pass, no implementation diff reviewed. |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | yes | applied | Projection/subscription shape affects React hot paths; broad React state would lose. | Runtime selection/projection graph stays outside broad state; selectors/external stores are required; Activity/transitions only for non-urgent overlays. |
| performance-oracle | yes | applied | Projection graph, commands, and repeated roots are hot-path and memory-sensitive. | Added complexity target: O(changed roots + affected runtime ids + projected span), not O(all roots/projections) per event. |
| performance | yes | applied | 20/100 repeated projections need cohort budgets and native behavior proof. | Added repeated-unit, cohort, interaction, memory/DOM, degradation, trace, and RUM rows. |
| tdd | yes | applied to execution plan | Behavior changes require public failing rows, not private shape tests. | Execution order starts with Shift selection, then reverse selection, copy, delete/type, undo/redo restore, native affordances, and stress rows. |
| shadcn | limited | applied as composability lens | Example chrome and composability matter; shadcn dependency work does not. | Keep product chrome local and raw Slate API to one slot/normal commands; no public component kit. |
| react-useeffect | limited | applied as guardrail | Effects are only for external sync/subscriptions. | Root/projection/selection changes must happen in transactions/events/runtime stores, not effect-created state. |
| code-simplicity-reviewer | yes | applied as plan pressure | Speculative public API would make the first slice worse. | Keep `ViewSelection`, projection graph, and projected command target internal; cut public `ViewSelection`, command chain, `<ContentRoot />`, Plate wrapper, and Notion semantics for now. |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| Fake highlights break native affordances | model-owned cross-root selection | copy, find, IME, spellcheck, screen readers, or platform selection UI diverge from visible selection | Do not promise native parity by default. Split each affordance into supported/degraded/unsupported rows; serialize copy from projected model segments; preserve native DOM selection only when it exactly matches the model. | browser matrix: Shift forward/reverse, copy plain/html, find, IME smoke, spellcheck, screen-reader/accessibility smoke, mobile caveat | complete as architecture gate; execution proof pending |
| Projection identity leaks into persisted data | repeated synced root copies | collaboration or snapshots store local owner/copy identity and create conflicts across clients | Persist root keys and root-local points/ranges only. Runtime owner ids may influence focus/history restore locally but must not enter document data, snapshots, or shared CRDT payloads unless a later collab proof creates an explicit shared projection channel. | package serialization/snapshot rows plus collab substrate pass | complete as persistence policy; adapter proof pending |
| Command ordering corrupts roots | projected delete/type/format over many roots | multi-root edits apply in the wrong order, split history, delete wrong copies, or normalize between partial edits | Segment visible selection through the projection graph, group by root, apply path-sensitive deletes from end to start where needed, and commit in one editor update/history batch with before/after selection assertions. | package command rows plus Synced Blocks browser delete/type rows | complete as command contract; execution proof pending |
| Undo/redo restores the wrong projection | expanded selection spans a repeated shared root, then history moves | model content restores but focus/selection jumps to the first mounted copy or a stale owner | History stores model selection plus optional runtime-local projection owner metadata. If the owner is gone, fallback is deterministic root-local selection, not arbitrary first mounted view. | package history rows plus repeated-root browser undo/redo | complete as restore policy; execution proof pending |
| Repeated-root copy serialization duplicates or omits content | copy/cut/export over a shared root mounted twice | plain/html output repeats the wrong content, misses a projection, or serializes hidden root order | Serialize from ordered projected segments, not DOM order or root storage order. Repeated visible projections are copied exactly as visible; shared model identity is not deduped unless the product command explicitly asks for it. | clipboard rows over main + shared + separate roots | complete as serialization policy; execution proof pending |
| Focus gets trapped in a projected root | mouse click outside, ArrowUp/Down, Escape-like blur, or selection collapse | user cannot leave a content root or root focus disagrees with model selection | Keep collapsed navigation/browser focus rows from prior Synced Blocks proof, then add projected-selection collapse and click-outside rows for expanded selection. Focus alone is not proof; model selection and active owner must match. | browser rows: click outside, Arrow both ways, collapse after Shift, follow-up typing | complete as UX gate; execution proof pending |
| Collaboration remote cursors paint nonsense | remote user selects a root mounted in several projections | every copy shows a cursor, no copy shows it, or local projection ids leak into awareness | Shared state carries root-qualified model selection. Projection paint policy is product-local: active projection, all projections, or nearest projection. Raw Slate should expose substrate hooks, not choose workspace policy. | ecosystem maintainer pass plus future adapter/browser proof | complete as collab boundary; adapter/browser proof pending |
| Projection graph performance collapses | 20/100 repeated projections, large document, or frequent typing | every keystroke recomputes all projections, wakes all subscribers, or grows DOM/listeners unbounded | Normal editor path must remain no-degradation. Projection rows need bounded changed-runtime ids, selector wake counts, mounted-view count, DOM/heap/listener tags, and event-to-paint proof. | normal/medium/stress/pathological stress rows | complete as perf kill criteria; execution proof pending |
| Accessibility/mobile story is fake | model-owned selection cannot map to platform affordances | release claims "sibling blocks" while mobile, screen readers, or IME are broken | Treat degraded native behavior as a release-visible caveat, not hidden implementation debt. No accessibility/mobile/native claim without explicit proof rows. | accessibility/mobile/native matrix | complete as release gate; execution proof pending |

Slate maintainer objection ledger:
| Change | Objection | Tradeoff | Evidence | Migration/docs/proof answer | Verdict |
|--------|-----------|----------|----------|-----------------------------|---------|
| internal `ViewSelection` | "This is not classic Slate selection." | Adds runtime selection state beyond core `Range`, which can become a hidden second truth if unmanaged. | Shift+Arrow repro; current `Selection = Range | null` at `packages/slate/src/interfaces/editor.ts:1147`; active owner/view lookup exists in `use-slate-runtime.tsx:145`. | Accept only as private runtime state for the first slice. Core `editor.selection` stays root-local. Public/core selection widening is allowed only if command, clipboard, history, or collaboration proof shows internal state cannot preserve correctness. | accepted; private runtime hard gate |
| projection-owned commands | "Commands should operate on Slate locations, not rendered views." | Projected commands need visible-order context, but raw commands must not become product-view DSLs. | Repeated root owner identity already gates nav/history; current commands repair root-local model state in `browser-handle.ts:106-146`; Shift+Arrow repro proves root-local selection is insufficient for visible spans. | Normal app-facing commands stay normal. Runtime resolves an internal projected target into ordered root-local edits inside one update/history batch. No app-level DOM range or product command DSL. | accepted; internal target only |
| model-owned native selection/export | "Fake selection can regress browser behavior." | Model-owned highlights can lie to copy, find, IME, accessibility, spellcheck, and platform selection UI. | Current DOM import still treats unknown selection as browser-current in `browser-handle.ts:213-230`; partial DOM mode already clears native ranges when the DOM is incomplete. | Native selection becomes an output/capability, not authority, for projected spans. Execution must prove or caveat copy, find, IME, screen reader, spellcheck, and platform selection behavior. | accepted; browser-native gate |
| root identity vs projection identity | "A root should not have multiple active identities." | Repeated synced roots split data identity from DOM/view identity. | Prior content-root plan accepted runtime-local active projection identity; root-keyed points exist in `point.ts:15`; view owners are runtime-local in `use-slate-runtime.tsx:76`, `:90`, and `:145`. | Persist root keys and root-local ranges. Keep projection owner/copy identity runtime-local unless collaboration proof requires a shared projection channel. | accepted; persistence guardrail |
| repeated projection performance | "Mounted content roots per synced block will blow up React, DOM, and subscriptions." | The architecture adds views and selectors; hand-waving perf would be bullshit. | Pressure pass recorded `use-slate-projections.tsx:31-61`, `projection-store.ts:99-120`, `:513-554`, `:632-667`, and `components/slate.tsx:441-542`, `:608-699`. | No performance claim until normal/medium/stress/pathological cohorts pass selector fanout, mounted-view count, listener count, DOM/heap, and event-to-paint budgets. | accepted; perf proof gate |
| slate-yjs / collaboration | "This cannot claim collaboration while current slate-yjs binds one shared root." | Correct: a projection-local owner id in shared state would create conflicts, but no collab story is also not enough for migration planning. | Prior content-root plan recorded current slate-yjs one-`sharedRoot` as a non-claim; current plan issue rows keep `#5771`/history/collab as guardrails only. | Target root-keyed shared types and root-qualified remote selections. Projection paint policy is local/product policy until a real adapter proves otherwise. No current slate-yjs fixed/improved claim. | accepted; non-claim |
| Notion-style Synced Blocks example | "Raw Slate should not ship Notion product semantics." | The example can accidentally teach permissions/workspace sync as core API. | User scenario is product pressure; prior content-root plan accepted example-local chrome; current public boundary keeps one slot call and normal commands. | Ship only the substrate and a product-real example. Raw Slate does not own permissions, comments, page/workspace sync, copy menus, or Plate command wrappers. | accepted; example-local |
| public `<ContentRoot />`, public `ViewSelection`, command chain sugar | "If this is the direction, make the public API explicit now." | Public sugar too early freezes the wrong abstraction and widens migration cost. | Prior content-root plan rejected canonical `<ContentRoot />`; current decision brief rejects public/core selection widening for first slice; Tiptap remains DX evidence, not raw Slate API law. | Keep public API minimal until implementation exposes repeated call-site pain or internal-only proof failure. First slice remains slot + internal graph/selection/target. | rejected for first slice |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| one editor per projected block | reject | shared selection/history/collab become federation problems | high | prior root-shape decision and current one-runtime implementation | keep rejected |
| mirrored roots as sync | reject | not the same operation identity/history as shared root | medium | prior Synced Blocks plan | keep rejected |
| DOM selection as source of truth | reject for cross-root expanded selection | already produces newline-only native selection in repro | medium | coverage plan Shift+Arrow row | replace with `ViewSelection` |
| public core `Selection` widening first | reject for first slice | blast radius too high before runtime proof | medium/high | `Selection = Range | null` current source | revisit after proof |
| public `<ContentRoot />` component now | reject for now | slot remains renderer-local and simpler | low | prior Synced Blocks plan | reconsider if slot call repeats awkwardly |

Plan deltas from review:
- Created a new focused plan instead of reopening the full Synced Blocks plan.
- Reused prior Synced Blocks browser/issue/research checks as baseline.
- Narrowed the remaining architecture to projection graph, `ViewSelection`, and
  projected commands as the core missing work.
- Set initial score to 0.79 and left closure pending by design.
- Closed related issue discovery by reusing prior Synced Blocks/content-root
  issue accounting; score remains 0.79 because this pass changes claim hygiene,
  not architecture readiness.
- Closed issue-ledger pass by adding a narrow projection-selection planning sync
  to the manual v2 sync ledger, coverage matrix, fork dossier, and PR reference;
  score remains 0.79 because no architecture proof changed.
- Hardened intent/boundary and decision brief: public API stays minimal, core
  `Selection` stays root-local for the first slice, internal `ViewSelection`
  owns projected spans, commands resolve projected targets internally, and
  direction-changing evidence is explicit. Score rises to 0.80.
- Closed research/ecosystem/live-source refresh: ProseMirror, Lexical, Tiptap,
  React ProseMirror, React 19.2, slate-yjs/Yjs, Plate/Synced Blocks, and live
  Slate v2 sources all support one internal projection graph plus model-owned
  projected selection. Score rises to 0.83.
- Closed performance/DX/migration/regression/simplicity pressure: added
  repeated-unit budgets, cohorts, interaction matrix, memory/DOM tags,
  degradation contract, TDD execution order, React/effect guardrails, and
  simplicity hard cuts. Score rises to 0.87.
- Closed Slate maintainer objections: accepted the objections as hard proof
  gates, kept `ViewSelection`/projection commands/private owner identity
  internal, preserved root-local core selection, kept slate-yjs as a non-claim,
  and rejected public sugar for the first slice. Score rises to 0.88.
- Closed high-risk deliberate mode: converted the riskiest failure modes into
  kill criteria for native affordances, persistence, command ordering,
  undo/redo owner restore, repeated-root serialization, click-outside/focus,
  collaboration paint policy, projection performance, and accessibility/mobile
  caveats. Score rises to 0.90.
- Closed ecosystem maintainer pass: Plate can build product wrappers,
  commands, chrome, and paint policy above raw Slate; slate-yjs needs a future
  root-keyed adapter, not compatibility claims for today's one-`sharedRoot`
  plugin; raw Slate keeps deterministic substrate, root-qualified selections,
  and local runtime targets. Score rises to 0.91.
- Closed revision pass: accepted the concrete first-slice architecture and
  execution queue, closed public API promotion rules, kept optional Plate/adapter
  sugar proof-gated, and turned native/collab/perf risks into release gates.
  Score rises to 0.92.
- Closed issue sync accounting: verified projection-selection rows in the
  manual v2 sync ledger, issue coverage matrix, fork dossier, and PR reference;
  tightened delete, clipboard, and collaboration rows so existing exact fixed
  floors and existing `#5771` readiness accounting are not broadened into
  projected-root claims. Score remains 0.92.
- Closed closure score and final gates: confirmed score 0.92, no dimension below
  0.85, no unresolved P0/P1 architecture blocker, issue/reference sync closed,
  planning-only browser proof marked N/A, and final user-review handoff recorded.
  Score remains 0.92.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| Does `ViewSelection` ever need to become public/core `Selection`? | Determines API blast radius. | command/clipboard/history/collab proof showing internal-only is insufficient | revision pass | closed for accepted plan: private first, public/core only if execution proof invalidates internal runtime state |
| Should remote selections render in every projection or only active/nearest? | Product and collab policy. | slate-yjs/Plate migration pressure | ecosystem maintainer pass | closed for architecture: raw Slate stores root-qualified model selections; Plate/adapter policy chooses active/all/nearest paint |
| Can native selection be preserved for simple cross-root cases? | Affects accessibility/copy/IME. | browser matrix and DOM range experiments | execution proof | closed for architecture: native is opportunistic output, not source of truth |
| Should a tiny public selector/hook be named now for Plate wrappers? | Avoids private imports without overfitting API too early. | real Plate wrapper implementation showing repeated private runtime access | revision pass | closed for accepted plan: do not name it now; execution can promote only from real call-site pressure |
| Is there a P0/P1 architecture blocker after revision pass? | Determines whether planning can continue without user input. | accepted plan, execution queue, and proof gates | revision pass | none found |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| 1. Projection graph contract | slate-plan execution mode | visible-order graph across main blocks and content-root projections | accepted plan | graph resolves next/previous, compares projected points, and segments a visible span without serializing owner ids | package tests |
| 2. Internal `ViewSelection` | slate-plan execution mode | runtime state for cross-root/copy-aware selection | graph contract | Shift+Arrow forward/reverse produces stable projected model selection and clean collapse/follow-up typing | package + browser |
| 3. Projected command target | slate-plan execution mode | delete/copy/paste/type/format operate on projected selection | `ViewSelection` | visible span edits serialize/mutate in order and undo/redo restores model plus owner fallback | package + browser |
| 4. Browser-native contract | slate-plan execution mode | copy/find/IME/screen-reader/spellcheck/mobile caveats | command target | explicit supported/degraded/unsupported rows; no fake native-parity claim | browser matrix |
| 5. Root lifecycle/collab substrate | slate-plan execution mode | duplicate, unsync, delete owner/root, remote selection policy | command proof | deterministic root lifecycle, root-keyed adapter target, and no current slate-yjs fixed claim | package + plan sync |
| 6. Projection stress budgets | slate-plan execution mode | 20/100 repeated projections plus normal-path no-degradation | graph/selection stable | bounded fanout/listeners/heap/DOM and event-to-paint budgets | stress/benchmark |

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| planning artifact check | plate-2 | this plan plus final `check-complete` at closure | plan/template integrity | complete: final checker returned `[autogoal] complete: docs/plans/2026-05-26-slate-v2-projection-selection-architecture.md`. |
| current-state, research, pressure, maintainer-objection, high-risk, ecosystem, revision, and issue-sync reads | Plate repo root + plate-2 + ../slate-yjs | live source reads, prior content-root objection rows, prior Shift+Arrow repro, Plate plugin/input-rule source, slate-yjs one-root/cursor/history source, memory guardrails, revised queue, and claim-sync rows recorded above | live source grounding, reuse discipline, high-risk architecture gates, ecosystem migration boundaries, accepted execution queue, and claim hygiene | complete through execution sync accounting |
| prior Synced Blocks proof reuse | plate-2 + Plate repo root | previous plan evidence and Playwright source rows | collapsed nav/history baseline | complete |
| Slate v2 behavior check | Plate repo root | focused package tests, full Synced Blocks Chromium, typecheck, formatting, and autoreview | runtime/API/browser behavior | complete |

Final execution handoff:
- accepted architecture: one runtime editor, one internal projection graph,
  private `ViewSelection`, internal projected command target, model-owned native
  browser contract, root-keyed collab substrate, runtime-local projection owner
  identity, repeated-projection performance budgets, and no first-slice public
  sugar.
- public API shape for first slice: keep raw Slate at content-root slots plus
  normal Slate commands. Do not expose public `<ContentRoot />`, public
  `ViewSelection`, command-chain/product DSL, or core `Selection` widening until
  execution proof shows internal runtime state cannot carry the contract.
- hard cuts: one-editor-per-projected-block, mirrored roots as sync, DOM
  selection as authority for projected spans, persisted projection owner ids,
  current-version slate-yjs adapter compatibility claims, Notion permissions, and
  Plate/product command UI in raw Slate.
- issue claim state: no new `Fixes` or `Improves`, no broadening of existing
  fixed floors such as `#3991` or `#4806`, and no broadening of existing `#5771`
  readiness accounting into projected-root slate-yjs support.
- execution queue after user acceptance: complete for projection graph contract, private
  `ViewSelection`, projected commands, clipboard/serialization, native affordance
  contract, root lifecycle/collab substrate, and projection stress budgets.
- final proof: focused package tests pass for projection graph, selection,
  commands, clipboard, native affordance, collab substrate, history, navigation,
  browser-handle, and stress contracts; full Synced Blocks Chromium passes 15
  rows; `bun typecheck` passes; final autoreview is clean after fixing its
  accepted custom-clipboard-key finding.
- issue claim state after execution: still no new `Fixes` or `Improves`, no
  broadening of existing fixed floors, and no broadening of `#5771` readiness
  accounting into current slate-yjs projected-root support.

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | scorecard rows cite evidence | complete, current score 0.92 |
| all pass rows complete or skipped with evidence | phase/pass table closed | complete |
| issue/reference sync closed | issue-ledger sync status closed | complete |
| live source grounding complete | source-backed rows cite current owners | complete through issue sync accounting and execution ledger |
| workspace verification recorded | verification workspace gate closed | complete: package, browser, typecheck, formatting, stress, issue/reference, and autoreview evidence recorded |
| autoreview clean or N/A | `.agents/skills/autoreview/SKILL.md` loaded and clean from the owning checkout, or N/A with reason | complete: final Codex local autoreview returned clean after accepted finding fix |
| final handoff emitted or lane remains pending | final response / next pass recorded | complete: execution handoff recorded |
| `check-complete` passes | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-projection-selection-architecture.md` | complete: final checker returned `[autogoal] complete: docs/plans/2026-05-26-slate-v2-projection-selection-architecture.md` |

Findings:
- Current root-qualified `Point` support is necessary but insufficient:
  projection copy identity is not part of a Slate point.
- Current `Selection` remains `Range | null`, so full projected selection
  should start as internal React runtime state, not a core API mutation.
- Current content-root owner/view identity is already the right primitive for
  repeated synced-root copies.
- Current navigation fixed collapsed movement and focus, but it is separate from
  selection range semantics and command targeting.
- Current DOM selection import path is unsafe as the authority for cross-root
  expanded selection.
- Current partial DOM mode proves Slate already has precedent for clearing native
  selection when the DOM is not a complete model surface.
- Current Synced Blocks browser rows are a solid collapsed-navigation/history
  baseline, not full projected-selection proof.

Decisions and tradeoffs:
- Keep one runtime + many views.
- Add projection graph before adding more feature-specific navigation/selection
  patches.
- Add internal `ViewSelection` before public/core `Selection` widening.
- Make commands projection-owned for cross-root expanded targets.
- Treat native DOM selection as an output/capability, not source of truth, when
  projection spans roots or repeated copies.
- Reuse prior Synced Blocks issue/browser checks unless the issue-facing claim
  changes.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Default Codex autoreview hung after bundle creation | 2 | Retry same helper/engine with `--thinking codex=low`; terminate stale helper children | low-thinking run produced one accepted finding; finding fixed; final low-thinking rerun clean |

External/browser findings:
- Existing research/log entries already support ProseMirror-style centralized
  DOM selection authority, Lexical-style lifecycle/command partitioning, and
  Tiptap as a DX benchmark; refresh now applies them to projected selection.
- React ProseMirror reinforces the same rule from a React integration angle:
  render and editor-view phases need explicit boundaries; React should not
  become a second owner of editor semantics.
- External slate-yjs reinforces root-keyed collaboration pressure, but it should
  be treated as mechanism evidence only because the current adapter shape is
  one shared root plus wrapper mutation.
- The original browser finding from the prior coverage plan was concrete:
  `Shift+ArrowDown` from main `p1` selected native `"\n"`, left Slate collapsed
  in main, and did not select the synced root. The final Synced Blocks browser
  suite now covers forward/reverse Shift selection, projected type/delete/copy,
  native affordance classification, click-outside, history, and root lifecycle.
- Treat external product examples like Notion as scenario pressure only.
- Slate maintainer objections did not overturn the direction. They converted
  the risky parts into hard gates: private runtime selection, internal projected
  command target, native affordance proof, runtime-local owner identity, and
  collaboration non-claims.
- High-risk deliberate mode does not require changing direction. It does require
  honesty: model-owned projected selection cannot claim native parity until
  copy, find, IME, accessibility, mobile, and platform-selection rows prove or
  explicitly caveat it.
- Ecosystem maintainer pass keeps the split clean: Plate owns product wrappers,
  command sugar, chrome, and remote-cursor paint policy; slate-yjs gets a future
  root-keyed adapter target; raw Slate owns deterministic model/runtime
  substrate and does not claim current adapter compatibility.
- Revision pass turns the review into an execution queue. The plan no longer
  leaves public API promotion ambiguous: private first, promote only if behavior
  proof proves internal runtime state cannot carry the contract.
- Issue sync accounting keeps the claim surface clean: existing exact fixes and
  existing `#5771` readiness accounting remain untouched, and projected-root
  issue claims stay gated on exact repro mapping and release-scope proof.
- Accepted-plan execution completed the queue after user acceptance; the plan is
  now an implementation ledger as well as the architecture record.

Timeline:
- 2026-05-26T13:01:20.674Z Slate Plan goal plan created.
- 2026-05-26T13:42:00Z Current-state pass completed from live source and prior
  Synced Blocks plan evidence.
- 2026-05-26T14:06:00Z Related issue discovery reuse decision completed:
  existing Synced Blocks issue accounting covers this surface, no broad GitHub
  discovery needed, and no fixed/improved claim added.
- 2026-05-26T14:20:00Z Issue-ledger pass completed: projection-selection
  planning sync added to issue/reference artifacts with zero fixed/improved
  claims.
- 2026-05-26T14:32:00Z Intent/boundary and decision brief pass completed:
  public/private boundaries, hard invariants, rejected alternatives, adoption
  route, and decision-changing evidence recorded.
- 2026-05-26T14:43:11Z Research/ecosystem/live-source refresh completed:
  local source reads for ProseMirror, Lexical, Tiptap, React ProseMirror,
  React 19.2, slate-yjs/Yjs, Plate/Synced Blocks, and live Slate v2 runtime
  paths applied to the plan.
- 2026-05-26T14:48:34Z Performance/DX/migration/regression/simplicity pressure
  completed: review lenses applied, budgets/proof rows added, speculative public
  APIs cut, and next pass set to maintainer objections.
- 2026-05-26T15:04:00Z Slate maintainer objection ledger completed: objections
  accepted as proof gates, public API expansion rejected for first slice, and
  next pass set to high-risk deliberate mode.
- 2026-05-26T15:12:00Z High-risk deliberate mode completed: native-affordance,
  persistence, command-ordering, undo/redo, repeated-root serialization,
  focus/click-outside, collab paint, perf, and accessibility/mobile risks
  converted into kill criteria; next pass set to ecosystem maintainer review.
- 2026-05-26T16:06:19+02:00 Ecosystem maintainer pass completed: Plate wrapper
  ownership, slate-yjs root-keyed adapter target, remote-selection paint policy,
  current-adapter non-claims, and raw-Slate substrate boundaries recorded; next
  pass set to revision.
- 2026-05-26T16:21:56+02:00 Revision pass completed: accepted architecture,
  execution order, API promotion rules, hard cuts, proof gates, and draft
  user-review handoff tightened; next pass set to issue sync accounting.
- 2026-05-26T16:33:00+02:00 Issue sync accounting completed: manual sync ledger,
  issue coverage matrix, fork dossier, and PR reference verified against the
  revised accepted architecture; delete/clipboard/collab rows tightened to avoid
  broadening existing exact fixed floors or `#5771` readiness accounting.
- 2026-05-26T16:46:00+02:00 Closure score and final gates completed: score
  remains 0.92, all dimensions stay above 0.85, issue/reference sync is closed,
  planning-only browser proof is marked N/A, and the final user-review handoff is
  recorded.
- 2026-05-26T22:16:00+02:00 Accepted-plan execution completed: projection
  graph, private `ViewSelection`, projected commands, clipboard/serialization,
  native affordance matrix, root lifecycle/collab substrate, and projection
  stress budget rows implemented in `Plate repo root`.
- 2026-05-26T22:18:00+02:00 Autoreview closeout completed: low-thinking Codex
  local review found a custom clipboard format-key defect; the defect was fixed
  and the final local autoreview rerun returned clean.

Verification evidence:
- `plate-2`: `get_goal` returned no active goal; `create_goal` started the
  projection-selection Slate Plan lane.
- `plate-2`: `get_goal` later returned the same active projection-selection
  Slate Plan lane before closing related issue discovery.
- `plate-2`: `get_goal` returned the same active projection-selection Slate
  Plan lane before closing issue-ledger pass.
- `plate-2`: `get_goal` returned the same active projection-selection Slate
  Plan lane before closing intent/boundary pass.
- `plate-2`: `get_goal` returned the same active projection-selection Slate
  Plan lane before closing maintainer-objection pass.
- `plate-2`: `get_goal` returned the same active projection-selection Slate
  Plan lane before closing high-risk deliberate mode.
- `plate-2`: `get_goal` returned the same active projection-selection Slate
  Plan lane before closing ecosystem maintainer pass.
- `plate-2`: `get_goal` returned the same active projection-selection Slate
  Plan lane before closing revision pass.
- `plate-2`: `node .agents/rules/autogoal/scripts/create-goal-scratchpad.mjs --template slate-plan --title "slate v2 projection selection architecture"` created this plan.
- `plate-2`: read prior Synced Blocks coverage plan and Synced Blocks
  architecture plan; reused completed collapsed-navigation/history/browser proof
  as baseline.
- `plate-2`: searched `docs/solutions`, `docs/research`, and issue/reference
  ledgers for multi-root/projection/selection/synced evidence.
- `plate-2`: read `docs/slate-issues/gitcrawl-v2-sync-ledger.md:46-82`;
  existing Synced Blocks planning sync records no fixed/improved issue claims
  and classifies this issue surface.
- `plate-2`: read `docs/slate-v2/ledgers/issue-coverage-matrix.md:109-136`;
  existing coverage matrix records the same no-claim policy and proof gates.
- `plate-2`: read generated live rows in
  `docs/slate-issues/gitcrawl-live-open-ledger.md` for `#6016`, `#5874`,
  `#5524`, `#5212`, `#5117`, `#4309`, and `#2072`; no live GitHub discovery was
  needed.
- `plate-2`: added `docs/slate-issues/gitcrawl-v2-sync-ledger.md:83-113`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md:145-173`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md:66-101`, and
  `docs/slate-v2/references/pr-description.md:108-117` for the
  projection-selection no-claim sync.
- `Plate repo root`: read live source for point/selection/projection/runtime/
  navigation/DOM-selection/Synced Blocks example/test owners; recorded command
  rows in the verification workspace gate.
- `Plate repo root`: re-read live source for intent/boundary claims:
  `packages/slate/src/interfaces/point.ts:15` root-qualified points,
  `packages/slate/src/interfaces/editor.ts:1147` root-local `Selection`,
  `packages/slate/src/interfaces/editor.ts:1166` projection segments,
  `packages/slate-react/src/hooks/use-slate-runtime.tsx:76` and `:145`
  content-root owner/view state, `packages/slate-react/src/editable/browser-handle.ts:213`
  DOM import path, and
  `packages/slate-react/src/editable/content-root-navigation.ts:1071`
  collapsed-navigation boundary.
- `plate-2` + sibling repos: refreshed accepted research and local source
  evidence for ProseMirror transaction/DOM selection, Lexical read/update and
  update tags, Tiptap command chaining, React ProseMirror phase safety, React
  19.2 external-store/background UI, Yjs cursor/awareness mechanics, and Plate
  Synced Blocks pressure.
- `Plate repo root`: read
  `packages/slate-react/src/hooks/use-slate-annotations.tsx:5`, `:52-65`,
  and `:73-85` for external-store subscriptions;
  `packages/slate-react/src/hooks/use-slate-history.ts:50-69`, `:160-172`,
  and `:187-212` for root-scoped history restore;
  `packages/slate-react/src/editable/browser-handle.ts:106-146` and `:213-230`
  for model-owned command repair versus DOM-current unknown-selection import;
  `site/examples/ts/synced-blocks.tsx:68-89`, `:108-117`, and `:119-134`
  for shared/separate root fixture and content-root slot use.
- `plate-2`: read `vercel-react-best-practices`, `performance-oracle`,
  `performance`, `tdd`, `shadcn`, `react-useeffect`, and
  `code-simplicity-reviewer` skills for the pressure pass.
- `plate-2`: read performance rules for cohort segmentation, repeated-unit
  budget, effect/subscription budget, interaction INP matrix, memory/DOM
  tagging, degradation contracts, React 19 runtime proof, and editor native
  behavior proof.
- `Plate repo root`: read `docs/walkthroughs/09-performance.md:1-11`, `:50-56`,
  `:75-84`, and `:86-93` for INP, narrow subscriptions, DOM strategies,
  projection stores, and DOM painting cautions.
- `Plate repo root`: read
  `packages/slate-react/src/hooks/use-slate-projections.tsx:31-61`,
  `packages/slate-react/src/projection-store.ts:99-120`, `:513-554`, and
  `:632-667`, `packages/slate-react/src/components/slate.tsx:441-542` and
  `:608-699`, `packages/slate-react/src/components/editable-text-blocks.tsx:450-459`,
  `:563-575`, `:1672-1685`, and `:2100-2104`, and
  `site/examples/ts/huge-document.tsx:22-27`, `:351-401` for pressure-pass
  runtime, selector, projection, slot, and measurement evidence.
- `plate-2`: re-read prior Synced Blocks coverage and content-root maintainer
  objection rows; reused the accepted active-projection, browser-proof,
  slate-yjs non-claim, performance-budget, and example-local decisions instead
  of rerunning already closed checks.
- `plate-2`: re-read prior Shift+Arrow repro evidence from the Synced Blocks
  coverage plan and used memory guardrails for one-runtime versus
  one-editor-per-block and Yjs issue-accounting policy; no new Slate v2 behavior
  claim was added.
- `plate-2`: read current Plate plugin/input-rule ownership surfaces:
  `packages/core/src/lib/plugin/createSlatePlugin.ts:42-90`,
  `packages/core/src/react/plugin/toPlatePlugin.ts:56-89`,
  `packages/core/src/react/plugin/createPlatePlugin.ts:43-57`,
  `packages/core/src/react/editor/PlateEditor.ts:27-68`,
  `packages/autoformat/src/plugin.ts:3-20`, and
  `packages/list/src/lib/OrderedListRules.ts:17-37`.
- `../slate-yjs`: read current adapter/collab source:
  `packages/core/src/plugins/withYjs.ts:29-40`, `:156-180`, `:238-263`,
  `packages/core/src/plugins/withCursors.ts:24-40`, `:183-203`, and
  `packages/core/src/plugins/withYHistory.ts:68-148`.
- `Plate repo root`: read current migration/collab substrate tests:
  `packages/slate/test/migration-backbone-contract.ts:34-60`, `:172-236`,
  and `packages/slate/test/collab-history-runtime-contract.ts:530-616`.
- `plate-2`: re-read the active plan and memory guardrails for pass-gated
  review lanes; revision changed the plan by naming the accepted execution
  queue, public API promotion rule, and closure handoff draft rather than
  rubber-stamping the prior score.
- `plate-2`: re-read and tightened projection-selection issue/reference rows in
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md:83-113`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md:145-173`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md:66-101`, and
  `docs/slate-v2/references/pr-description.md:108-117`; no new fixed/improved
  claims were added.
- `plate-2`: closed the final planning checklist, phase table, completion gates,
  and user-review handoff in this plan before running the final autogoal checker.
- `plate-2`: `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-projection-selection-architecture.md`
  returned `[autogoal] complete: docs/plans/2026-05-26-slate-v2-projection-selection-architecture.md`.
- `Plate repo root`: final focused package proof
  `bun test:vitest -- projection-stress-contract projected-collab-substrate-contract projected-native-affordance-contract projected-clipboard-contract projected-command-contract view-selection-contract projection-graph-contract content-root-navigation-contract browser-handle-contract use-slate-history`
  passed 10 files / 40 tests after the clipboard-key fix.
- `Plate repo root`: final typecheck `bun typecheck` passed packages, site, and
  root checks.
- `Plate repo root`: final full browser proof
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bunx playwright test playwright/integration/examples/synced-blocks.test.ts --project=chromium`
  passed 15 Chromium tests.
- `Plate repo root`: final autoreview
  `PYTHONUNBUFFERED=1 /Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local --thinking codex=low --output /tmp/slate-v2-autoreview-final.out --json-output /tmp/slate-v2-autoreview-final.json`
  returned `autoreview clean: no accepted/actionable findings reported`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Accepted-plan execution and closeout proof are complete. |
| Where am I going? | Final handoff. |
| What is the goal? | Execute the accepted projection-selection Slate Plan through the full queue with proof. |
| What have I learned? | The internal runtime shape carries the projected-root contract without public `Selection` widening, but projected clipboard must reuse Slate DOM's configured clipboard format key. |
| What have I done? | Implemented the projection graph, private `ViewSelection`, projected commands, projected clipboard serialization, native affordance matrix, root lifecycle/collab substrate, stress contracts, browser coverage, issue/reference no-claim sync, and autoreview fix/clean rerun. |

Open risks:
- Public/core `Selection` widening may become necessary after command/collab
  proof, but doing it first remains an expensive guess.
- Native affordances are classified and browser-covered for projected selection
  copy/native-selection honesty, but IME, screen-reader, and raw-device mobile
  rows remain degraded/unsupported caveats, not release parity claims.
- Projection graph stress is covered by deterministic package budgets, not a
  full browser perf benchmark.
- Current-version slate-yjs projected-root support is still not claimed.
