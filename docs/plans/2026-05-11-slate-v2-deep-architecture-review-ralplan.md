---
date: 2026-05-11
topic: slate-v2-deep-architecture-review
status: done
source_skill: slate-ralplan
completion_file: .tmp/019e1249-8cb3-7421-b7cd-4e289b9723ab/completion-check.md
continue_file: .tmp/019e1249-8cb3-7421-b7cd-4e289b9723ab/continue.md
---

# Slate v2 Deep Architecture Review Ralplan

## Current Verdict

Do not rewrite the core architecture. That would be churn.

The core bet is right:

- Slate document model stays simple JSON.
- Operations remain the collaboration truth.
- `editor.read` / `editor.update` are the public lifecycle.
- `EditorCommit` is the runtime publication unit.
- Extension power goes through named `editor`, `state`, and `tx` groups, not
  flat method injection.

Rewrite or cut these:

1. **Rewrite stale architecture docs.** Live source rejects extension `methods`
   and public extension `commands`, but active docs still teach
   `editor.extend({ methods })`.
2. **Rewrite or formally defend the selector substrate.** Main editor selectors
   still use a custom reducer/ref subscription helper while adjacent annotation,
   widget, and projection stores already use `useSyncExternalStore`.
3. **Split the root runtime coordinator.** `useEditableRootRuntime` is now the
   big ownership knot: selection import/export, Android, composition, repair,
   event runtime, shell selection, global listeners, and pending insertion marks
   all meet there.
4. **Cut or contain public `virtualized` editing mode.** `virtualized` is typed
   as a public rendering strategy. It is labeled experimental, but it still
   appears beside `auto`, `full`, `staged`, and `shell`.

Keep these:

1. **Keep the data-model-first core.**
2. **Keep internal command middleware.** It is internal runtime ordering, not
   public extension API.
3. **Keep runtime-owned void shells and content-only `renderVoid`.** This is
   already fixed and tested.
4. **Keep shell/staged huge-doc work as explicit performance modes.** Do not
   make shell mode the default until native behavior proof is complete.

## Intent And Boundary Record

- intent: get a blunt current-state review of Slate v2 and identify what should
  be rewritten or cut before another implementation loop.
- desired outcome: an execution-grade plan that separates keep, rewrite, cut,
  and proof-only work.
- in scope: public API truth, extension contract, React subscriptions, root
  runtime ownership, rendering modes, performance proof, issue-accounting gaps,
  migration backbone.
- non-goals: no Slate v2 code patches in this review pass; no PR; no new issue
  closing claim; no current-version Plate or slate-yjs adapter promise.
- decision boundaries: this plan can recommend cuts, rewrites, proof gates, and
  docs sync. Actual implementation requires a later `ralph` or explicit
  execution turn.
- unresolved user-decision points: none for this pass. Later execution can
  choose whether to start with docs truth sync or selector substrate proof.

Intent/boundary hardening pass, 2026-05-11:

- evidence used: live source table below, cache-first issue accounting above,
  current scorecard, and Slate Ralplan completion gates.
- root-cause reframing: the question is not "is v2 good enough?" The useful
  question is "which parts of v2 are current-source true, which are stale
  documentation or proof gaps, and which public surfaces would create release
  debt if accepted as stable?"
- strongest hidden assumption: a deep review could accidentally become another
  rewrite launcher. Rejected. The boundary is review/planning only; source
  patches require a later explicit execution turn.
- counterexample: a whole-core rewrite would look decisive but would throw away
  the correct Slate JSON/op/transaction backbone while failing to close the
  measured React and browser proof gaps faster.
- decision boundary accepted: the plan may recommend `keep`, `revise`, `gate`,
  or `cut`; it may not mark implementation complete, close issues, or mutate
  `../slate-v2` code.
- remaining ambiguity: none that requires the user. The next useful work is
  research/source refresh, not a clarification question.

## Decision Brief

Principles:

1. Current source beats old docs and plans.
2. Raw Slate stays unopinionated; Plate owns product command sugar.
3. Runtime performance wins must survive browser behavior, not just benchmark
   rows.
4. Public API should be small enough that agents and humans do the right thing
   by default.
5. Collaboration remains operation and commit based.
6. Proof must match claim level: docs proof can close docs truth, benchmarks can
   support performance claims, and browser/device behavior needs browser/device
   proof.
7. Experimental surfaces can exist, but they must not read as stable release
   promises.

Top drivers:

1. Issue corpus pressure is runtime-heavy, not model-replacement-heavy.
2. Huge-doc perf still has red typing/select lanes.
3. Public docs must not teach a removed extension model.
4. Root runtime density makes behavioral review expensive.
5. React selector correctness is a release risk because broad dirtying can make
   every other runtime proof look better than it is.

Viable options:

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| Keep architecture, rewrite hot spots | Preserves the good core while attacking measured weak points | Requires discipline across docs, selectors, root runtime, and perf proof | chosen |
| Whole rewrite toward Lexical-style core | Strong dirty runtime story | Throws away Slate JSON/op familiarity and migration backbone | reject |
| Move toward ProseMirror/Tiptap engine model | Strong schema/view discipline and product DX | Too far from Slate's core identity and React-native authoring target | reject |
| Freeze current v2 as done | Avoids churn | Ignores stale docs, custom selector risk, root runtime density, and perf red lanes | reject |
| Docs-only cleanup | Fastest route to cleaner maintainer text | Leaves selector substrate, root runtime density, and public virtualized policy unresolved | reject as incomplete |
| Implementation-first cleanup | May produce quick code wins | Risks patching without accepted issue/proof boundaries | reject until plan passes |

Consequences:

- The next code work should be narrow and measured, not another architecture
  manifesto.
- Some docs and release claims are wrong enough to fix before maintainer-facing
  review.
- Public experimental modes need stronger naming or gating.
- Selector and root-runtime work must carry before/after proof; otherwise it is
  just reshuffling hard code.
- The plan can reach `done` without code patches only when it has a complete
  review/implementation handoff, not when the architecture itself ships.

Follow-ups:

- completed: related issue discovery with cached ClawSweeper output.
- completed: issue ledger and PR-reference accounting with no claim mutation.
- completed: research/source refresh for stale docs, selector substrate, root
  runtime split, and virtualized policy.
- completed: objection/high-risk revision.
- next: closure score.

## Current Source Evidence

| Surface | Current owner | Read |
| --- | --- | --- |
| Core public lifecycle | `../slate-v2/packages/slate/src/interfaces/editor.ts:480` | `BaseEditor` exposes `read`, `subscribe`, `update`, and `extend`. |
| Internal transforms | `../slate-v2/packages/slate/src/interfaces/editor.ts:493` | transform API is explicitly internal runtime implementation. |
| Extension shape | `../slate-v2/packages/slate/src/interfaces/editor.ts:890` | extension fields include `editor`, `state`, and `tx`; no public `methods`. |
| Legacy extension rejection | `../slate-v2/packages/slate/src/core/editor-extension.ts:60` | `methods` and public `commands` throw with state/tx guidance. |
| Internal command registry | `../slate-v2/packages/slate/src/interfaces/editor.ts:1551` | `defineCommand` and `registerCommand` remain internal/static APIs. |
| Main editor selector substrate | `../slate-v2/packages/slate-react/src/hooks/use-generic-selector.tsx:22` | custom selector hook uses refs plus reducer `forceRender`. |
| Runtime-id selector fanout | `../slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:189` | selector context owns global, runtime-id, and deferred listener sets. |
| Root runtime coordinator | `../slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:1` | imports selection, Android, composition, event, repair, trace, and input owners. |
| Root runtime global listeners | `../slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:412` | attaches document selectionchange and global drag lifecycle listeners. |
| Void renderer | `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:450` | `renderVoid` receives `{ element, path }`; runtime wraps shell/spacer. |
| Void contract proof | `../slate-v2/packages/slate-react/test/surface-contract.tsx:492` | tests prove no `target`, `actions`, `selected`, `focused`, `children`, or `attributes`. |
| Rendering strategy API | `../slate-v2/packages/slate-react/src/rendering-strategy/create-segment-plan.ts:3` | `virtualized` is part of public `RenderingStrategyType`. |
| Virtualized implementation | `../slate-v2/packages/slate-react/src/rendering-strategy/use-virtualized-root-plan.ts:181` | viewport-only plan is implemented with retained selected/promoted rows. |
| Stale release claim | `docs/slate-v2/absolute-architecture-release-claim.md:72` | docs still teach `editor.extend({ methods })`. |
| Stale readiness claim | `docs/slate-v2/release-readiness-decision.md:56` | docs still say extension methods compose through `methods`. |
| Perf red lane | `docs/slate-v2/slate-react-perf-loop-context.md:75` | shell wins startup/full-doc lanes but loses steady typing/select lanes. |
| Replacement gate | `docs/slate-v2/replacement-gates-scoreboard.md:32` | Slate React perf superiority is `pending / typing red`. |
| Issue pressure | `docs/slate-issues/requirements-from-issues.md:36` | frozen corpus shows runtime boundary ownership dominates core-engine ownership. |
| Coverage ledger | `docs/slate-v2/ledgers/issue-coverage-matrix.md:17` | fixed/improved/related claims require proof matching the issue type. |

## Rewrite And Cut Decisions

| Priority | Decision | Status | Why | Proof or next gate |
| --- | --- | --- | --- | --- |
| P0 | Rewrite extension-contract docs and release claims away from `methods` | revise | Live code rejects that API; maintainer-facing docs are stale | grep docs for `extend({ methods })`, patch active docs, run docs grep |
| P0 | Audit main editor selector substrate against `useSyncExternalStore` | revise | Current custom reducer/ref helper differs from React-backed stores used elsewhere | focused selector contracts plus rerender breadth benchmark |
| P0 | Split `useEditableRootRuntime` into smaller controller owners | revise | root coordinator imports and wires too many behavior owners | static inventory, focused tests per controller, event/listener proof |
| P1 | Cut or hard-contain public `virtualized` editing mode | gate | Typed public mode is too easy to treat as stable editing semantics | native behavior matrix before stable docs/API claim |
| P1 | Keep shell mode explicit, not default | keep | current perf proof is mixed and native behavior proof is incomplete | huge-doc compare plus browser native behavior rows |
| P1 | Keep runtime-owned void shell contract | keep | current source and tests already prove content-only API | surface contract stays green |
| P2 | Keep internal command registry, but keep it out of public docs | keep | internal command ordering is useful; public command maps were cut | public-surface contracts and docs grep |
| P2 | Add Plate/slate-yjs substrate proof rows before release claims | gate | current backbone is plausible but adapter proof is not the target yet | state/tx extension and operation replay proofs |

## Confidence Scorecard

| Dimension | Weight | Score | Evidence | Gap |
| --- | ---: | ---: | --- | --- |
| React 19.2 runtime performance | 0.20 | 0.90 | selector/runtime owners are live; React external-store research is cited; proof-first selector target is accepted | execution still needs selector benchmark and hot-read proof |
| Slate-close unopinionated DX | 0.20 | 0.93 | core read/update and state/tx groups are live; stale docs patch scope is exact | docs still need implementation patch |
| Plate and slate-yjs migration backbone | 0.15 | 0.91 | state/tx, operations, commits, and substrate-level non-adapter claim are explicit | adapter proof is intentionally not claimed |
| Regression-proof testing strategy | 0.20 | 0.92 | unit, browser, benchmark, issue, and raw-device gates are named by surface | execution must still run the gates |
| Research evidence completeness | 0.15 | 0.94 | React, ProseMirror, Tiptap, Lexical, virtualized, live source, and issue corpus research are cited with concrete Slate strategy | no open research contradiction for this plan |
| shadcn-style composability and minimal hooks/components | 0.10 | 0.93 | content-only void renderers are already proven; root runtime split is owner/test-driven | root split still needs execution |

Weighted score: `0.92`.

Status: `ready-for-review`. This is a plan-readiness score, not a claim that
Slate v2 implementation work is complete.

## Closure Score Pass - 2026-05-11

Verdict: this Slate Ralplan is ready for user review. The plan should close as
`done` because all review passes are recorded and the remaining work is an
explicit implementation handoff, not another planning objection.

Closure gates:

- pass schedule complete: current-state, related-issue discovery,
  issue-ledger accounting, intent/decision hardening, research refresh, and
  objection/high-risk revision are complete.
- score threshold passes: weighted score `0.92`; no dimension is below `0.85`.
- issue accounting complete: current plan adds no fixed issue claim and reuses
  durable ClawSweeper ledger/dossier coverage for related surfaces.
- stale docs patch scope exact: update
  `docs/slate-v2/absolute-architecture-release-claim.md`,
  `docs/slate-v2/release-readiness-decision.md`,
  `docs/slate-v2/final-api-hard-cuts-status.md`, and
  `docs/slate-v2/references/architecture-contract.md` where they still teach
  extension `methods`.
- selector decision accepted: proof-first compare the current
  `useGenericSelector` path against an external-store adapter, then migrate or
  keep with source-backed proof.
- root runtime decision accepted: split only tested behavior owners; keep a
  thin root assembly point and preserve ordering proof.
- virtualized policy accepted: keep explicit experimental mode; no stable
  native-behavior parity claim until browser/native rows close.
- migration claim accepted: Plate/slate-yjs claims stay substrate-level:
  state/tx groups, operation streams, commits, metadata, and replayability.

Not claimed by closure:

- no Slate v2 implementation patch is complete;
- no Slate v2 tests or browser/device gates are green from this plan;
- no GitHub issue is newly fixed, closed, or commented by this plan.

## Source-Backed North Star

Slate v2 should stay:

- model-first for persisted content;
- op-first for history/collaboration;
- transaction-first for writes;
- selector-first for React;
- runtime-owned for DOM/input/selection authority;
- product-agnostic in raw Slate.

The issue corpus supports runtime ownership and input discipline, not a new
renderer-shaped document model.

## Ecosystem Strategy Synthesis

| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| React 19.2 | `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md:31` | external-store subscriptions, non-urgent UI, Activity, performance tracks | effect-mirrored subscriptions and hidden UI churn | use external-store backbone and Activity only for background UI | treating React as the editor invalidation engine | selector substrate proof or rewrite | partial |
| ProseMirror | `docs/research/sources/editor-architecture/read-update-runtime-corpus-ledger.md:83` | transactions, mapped selection, bookmarks, one view authority | partial state drift across DOM/model | transaction metadata and durable anchors | ProseMirror view/node model as public Slate API | keep op/commit truth and improve bulk fitting proof | agree |
| Tiptap | `docs/research/sources/editor-architecture/node-text-mark-render-dx-corpus-ledger.md:175` | extension packaging, command chains, React selector hooks | app code scattering product policy | extension packaging lessons above raw Slate | chain command API as raw Slate core | Plate/product layer can own command sugar | partial |
| Lexical | `docs/research/systems/editor-architecture-landscape.md:210` | dirty-node reconcile engine | broad recompute on hot paths | dirty bucket discipline and locality proof | class-node public model and plugin weight | targeted dirty runtime proof, not wholesale rewrite | partial |

## Research And Source Refresh - 2026-05-11

Refresh scope:

- live `../slate-v2` source for extension slots, selector hooks, root runtime,
  adjacent external stores, and virtualized rendering;
- compiled React, ProseMirror, Tiptap, Lexical, and virtualized research pages;
- active Slate v2 release/readiness docs that still carry old extension text.

Findings:

- extension decision unchanged. Live source rejects `methods` and public
  `commands` in `../slate-v2/packages/slate/src/core/editor-extension.ts:60`,
  while the current extension type exposes `editor`, `state`, and `tx` groups in
  `../slate-v2/packages/slate/src/interfaces/editor.ts:886`.
- docs truth sync remains P0. `docs/slate-v2/absolute-architecture-release-claim.md:72`
  and `docs/slate-v2/release-readiness-decision.md:56` still teach
  `editor.extend({ methods })`.
- selector decision unchanged. The main selector path still uses
  `useGenericSelector` with refs plus reducer-driven `forceRender` in
  `../slate-v2/packages/slate-react/src/hooks/use-generic-selector.tsx:22`,
  and runtime-id/deferred fanout is still owned by
  `../slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:189`.
- external-store pressure is stronger, not weaker. Adjacent annotation, widget,
  and projection stores use `useSyncExternalStore` in
  `../slate-v2/packages/slate-react/src/hooks/use-slate-annotations.tsx:65`,
  `../slate-v2/packages/slate-react/src/hooks/use-slate-widgets.tsx:68`, and
  `../slate-v2/packages/slate-react/src/hooks/use-slate-projections.tsx:53`.
- React research still says the same thing:
  `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md:31`
  makes external-store subscription the React-native baseline, while
  `:57`-`:64` warns that React does not replace the editor invalidation engine.
- root runtime split target unchanged. The root runtime still imports and wires
  selection, Android, composition, repair, trace, input rules, event runtime,
  root refs, DOM export, global selection listeners, drag lifecycle listeners,
  and pending marks across
  `../slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:1`,
  `:200`, `:284`, `:346`, and `:412`.
- virtualized policy unchanged. The public option is still present beside stable
  modes in
  `../slate-v2/packages/slate-react/src/rendering-strategy/create-segment-plan.ts:3`,
  and test coverage proves viewport DOM coverage/materialization behavior in
  `../slate-v2/packages/slate-react/test/rendering-strategy-and-scroll.tsx:197`;
  that proof supports an explicit experimental mode, not stable native-behavior
  parity.
- virtualized research agrees:
  `docs/research/sources/editor-architecture/tanstack-virtual-and-github-large-surface-virtualization.md:100`
  keeps TanStack Virtual as a viewport range engine only, with Slate owning DOM
  coverage, selection, IME/mobile, metrics, and degradation policy.
- ecosystem synthesis unchanged. React supplies external-store and background UI
  primitives; ProseMirror supplies transaction/view discipline; Tiptap supplies
  product DX packaging; Lexical supplies dirty-locality pressure. Slate should
  steal those mechanisms, not copy any one system's identity.

Decision after refresh: no research update file is required in this pass. The
compiled research already carries the needed evidence, and the remaining stale
docs are an implementation/docs truth-sync target, not a research-layer gap.

## Public API Target

Keep:

- `editor.read`
- `editor.update`
- state groups
- tx groups
- extension `editor` groups for local editor-bound actions
- `renderVoid({ element, path })`

Cut from current docs:

- `editor.extend({ methods })`
- any wording that says public extension methods are the composition model
- any wording implying public extension `commands`

Gate:

- public `virtualized` rendering strategy stability

## Internal Runtime Target

Keep the runtime model, but split ownership:

- selector substrate owner;
- selection import/export owner;
- input/composition owner;
- repair/trace owner;
- rendering mode owner;
- root coordinator as thin assembly only.

Do not move this back into `Editable` props or app renderers.

## Hook, Component, And Render DX Target

Keep content-only render contracts and runtime shells. They are the right shape.

Rewrite pressure:

- public selector hooks should either be backed by React external-store semantics
  or carry a source-backed explanation for why the custom selector helper is
  necessary.
- root runtime hook should shrink until each behavior owner is testable without
  rereading a 400-line coordinator.

## Plate Migration Backbone

Plate should be able to build product command sugar and opinionated UI over:

- extension `editor` groups;
- `state` and `tx` groups;
- schema/spec policy;
- content-only renderers;
- commit metadata.

This review does not require current Plate adapter compatibility.

## slate-yjs Migration Backbone

Collaboration should stay grounded in:

- deterministic operations;
- snapshots;
- commits;
- metadata for local/remote origin;
- replayable tx operation streams.

This review does not require current slate-yjs fixtures. It requires the
operation and commit contract to remain credible.

## Issue Ledger Accounting

Initial evidence note:

- the first read carried live GitHub count/state checks. Do not repeat broad
  live GitHub discovery for this plan.
- current issue discovery is ledger/cache-first per
  `.agents/rules/slate-ralplan.mdc`.
- gitcrawl doctor read: local db has `659` open threads, last sync
  `2026-05-04T14:58:11.123944Z`; treat it as useful but stale for live counts.
- coverage matrix read: `docs/slate-v2/ledgers/issue-coverage-matrix.md:17`.

Cache-first related issue discovery pass, 2026-05-11:

- source rows reused:
  `docs/slate-v2/ledgers/issue-coverage-matrix.md:87`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md:88`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md:91`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md:92`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md:94`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md:142`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md:143`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md:146`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md:147`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md:217`, and
  `docs/slate-v2/ledgers/issue-coverage-matrix.md:250`.
- dossier rows reused:
  `docs/slate-v2/ledgers/fork-issue-dossier.md:185`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md:258`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md:299`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md:712`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md:740`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md:767`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md:818`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md:3647`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md:3679`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md:3726`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md:4237`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md:5056`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md:5081`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md:6407`, and
  `docs/slate-v2/ledgers/fork-issue-dossier.md:6682`.
- result: already covered by completed ClawSweeper passes. No new issue claim,
  dossier section, coverage-matrix row, or PR-reference text is added by this
  planning pass.

No fixed issue claim is added in this pass.

Issue matrix for this review:

| Issue | Cluster | Claim | Why | Proof route | V2 sync ledger | PR line |
| --- | --- | --- | --- | --- | --- | --- |
| #3656 | react-runtime-and-rerender-breadth | Related | selector and hot read proof may improve it, but this pass does not rerun exact proof | future rerender breadth benchmark | unchanged | related matrix only |
| #3430 | react-runtime-and-rerender-breadth | Related | many-inline/freeze pressure overlaps selector fanout, but no exact repro closure | future focused benchmark/test | unchanged | related matrix only |
| #5945 | large-document-edit-performance | Related | virtualized/shell containment affects perf posture, not exact paste closure | future benchmark/browser row | unchanged | related matrix only |
| #5992 | large-document-edit-performance | Related | shell/virtualized policy affects large cut posture, not exact auto-close | future benchmark/browser row | unchanged | related matrix only |
| udecode #6 | IME composition | Related | mobile/IME proof remains a release gate, no new implementation here | future raw/browser IME proof | fork dossier unchanged | related matrix only |

ClawSweeper pass: `applied via existing durable outputs`. The same surface is
already covered by completed performance, React runtime, Android/IME, and
projection/decoration ClawSweeper rows. Do not rediscover it with broad live
GitHub queries.

Issue-ledger accounting pass, 2026-05-11:

- `docs/slate-issues/gitcrawl-v2-sync-ledger.md` already has non-`not-started`
  statuses for the touched upstream issues. No manual sync row changes are
  required.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` already has the relevant
  `Improves`, `Related`, and `Not claimed` rows for runtime, render,
  performance, IME, and projection/decoration pressure. No coverage-matrix row
  changes are required.
- `docs/slate-v2/ledgers/fork-issue-dossier.md` already has self-contained
  sections for the touched issue groups. No dossier section changes are
  required.
- `docs/slate-v2/references/pr-description.md` already contains the current
  performance `Improves` text for `#5945`, `#4056`, and `#5992`, plus the
  experimental virtualized-rendering release gate. No PR-reference text changes
  are required.

PR description unchanged: this planning pass does not change fixed issue
claims, improved issue claims, accepted public API shape, proof status, release
gates, examples, or maintainer-facing narrative.

Fork issue dossier unchanged: existing ClawSweeper sections already own the
touched issues; this pass adds no new issue section.

## Legacy Regression Proof Matrix

| Area | Current proof | Gap |
| --- | --- | --- |
| core read/update and transaction lifecycle | package contracts and public surface tests | no gap for core architecture |
| renderVoid runtime shells | `surface-contract.tsx` content-only proof | keep green |
| React selector locality | rerender breadth benchmark exists | substrate proof and hot read owner still needed |
| huge documents | shell/full-doc lanes green in places | steady typing/select red versus legacy chunking |
| mobile/IME | scoped proof exists in prior lanes | raw device and exact IME closure remain gated |
| virtualized editing | implementation exists | native behavior classification incomplete |

## Browser And Performance Strategy

Do not call performance done from command existence.

Next performance proof must name:

- cohorts: normal, large, stress, pathological;
- repeated unit: top-level block plus text/leaf render unit;
- p95/p99 interaction rows or lab proxy rows;
- DOM/component/listener counts;
- native behavior preservation or explicit degradation;
- shell/staged/virtualized mode policy.

`virtualized` must not become a normal editing promise until browser find,
native selection, copy, paste, select-all, IME, mobile touch selection,
screen-reader traversal, undo/history, and collaboration behavior are classified.

## Applicable Implementation-Skill Review Matrix

| Lens | Status | Finding | Plan delta |
| --- | --- | --- | --- |
| Vercel React | applied | external store/subscription and event-listener rules apply to selector substrate and root runtime | added selector rewrite/defense and root listener split gates |
| performance-oracle | applied | hot reads and fanout must be bounded at 10x/100x/1000x | added hot read proof before perf closure |
| performance | applied | huge-doc work needs cohorts, repeated-unit budgets, memory tags, and degradation contracts | added browser/perf strategy gates |
| tdd | applied | any implementation slice needs a red/green contract or benchmark before code | each phase has focused gates |
| code-simplicity-reviewer | applied | root runtime coordinator and public virtualized option are likely carrying too much | added split and contain/cut decisions |
| shadcn | skipped | no UI chrome or registry component change in this pass | no change |
| react-useeffect | applied through React/subscription review | root runtime effects/listeners and selector subscription posture need scrutiny | added root coordinator split gate |

## High-Risk Deliberate Mode

Trigger: public API docs, React selector substrate, root runtime, and rendering
strategy policy all affect release trust.

Blast radius:

- `packages/slate`
- `packages/slate-react`
- docs under `docs/slate-v2`
- issue coverage and PR reference docs
- benchmark and browser proof gates

Pre-mortem, revised 2026-05-11:

1. Extension docs cleanup is treated as a source API change and accidentally
   reopens the removed `methods` model. That would be backwards. This is a docs
   truth-sync slice: live code already rejects `methods` and `commands` in
   `../slate-v2/packages/slate/src/core/editor-extension.ts:60`, and the live
   extension type already exposes `editor`, `state`, and `tx` groups at
   `../slate-v2/packages/slate/src/interfaces/editor.ts:886`.
2. Selector rewrite regresses runtime-id fanout, deferred flush behavior, or
   selector error replay. The proof spike must compare the current
   `useGenericSelector` path in
   `../slate-v2/packages/slate-react/src/hooks/use-generic-selector.tsx:22`
   against an external-store adapter before replacing it.
3. Root runtime split moves code without reducing ordering risk. Splitting is
   allowed only around tested owners: selection import/export, input and
   composition, repair/trace, global listeners, and rendering-mode policy.
4. Virtualized mode stays visible as a normal editing promise, users rely on
   native browser find/screen-reader traversal over unmounted content, and Slate
   ships a broken expectation. Keep `virtualized` explicit and experimental
   until native behavior rows close.
5. Plate/slate-yjs migration claims drift from substrate proof into adapter
   promises. Keep the claim at operation/commit/state/tx level until adapter
   work actually exists.

Expanded proof plan:

- unit: extension surface, selector contracts, root controller contracts,
  virtualized DOM coverage boundaries;
- integration: operation replay, commit metadata, state/tx extension groups,
  and selector runtime-id fanout;
- browser: selection, copy/paste, IME, find, select-all, undo/history, mobile
  touch selection, and screen-reader behavior where rendering strategy changes;
- benchmark: rerender breadth, hot reads, and huge-document compare across
  normal, large, stress, and pathological cohorts;
- migration: Plate product command sugar over extension groups and slate-yjs
  operation replay answers, without promising current adapter compatibility;
- docs/examples: stale `methods` claim grep must stay clean, `virtualized` must
  read experimental/not production-ready, and command middleware must stay
  internal.

Verdict: keep architecture, revise hot spots, cut stale docs, gate public
experimental behavior.

## Slate Maintainer Objection Ledger

| Change | Strongest fair objection | Steelman antithesis | Tradeoff tension | Adoption/docs answer | Proof required | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| Cut extension `methods` from docs | "You are making the public extension story less obvious and less friendly." | method injection is easy to teach and lines up with historical Slate plugin expectations | state/tx groups require better docs and examples; short-term migration text is less cute | docs should teach named `editor`, `state`, and `tx` groups with small examples, not resurrect `methods` | docs grep, extension contract tests, public-surface contract | revise docs, keep source |
| Audit selector substrate | "Custom selectors already work; rewriting them is churn that can break hot editing." | current helper may intentionally encode runtime-id fanout, deferred flush, and error replay better than a generic store hook | external-store alignment improves React semantics, but a naive adapter can widen fanout or lose error timing | proof spike must decide: external-store adapter, keep custom with written proof, or hybrid; no blind rewrite | selector contracts, runtime-id/deferred fanout tests, rerender breadth benchmark, selector error replay coverage | revise to proof-first |
| Split root runtime coordinator | "A single root hook keeps browser event ordering visible; splitting it can hide bugs." | one owner can make ordering easier to audit during IME, Android, and selection repair work | smaller modules improve testability but can scatter ordering constraints | split only by behavior owner and require an ordering map; root coordinator remains the assembly point | controller tests, global listener cleanup proof, selection/composition/browser regression rows | revise, not mechanical split |
| Contain `virtualized` | "Pathological documents need a real escape hatch, and hiding the option weakens the perf story." | performance escape hatches are necessary and the current tests prove viewport DOM coverage/materialization basics | public names beside stable modes invite users to assume native behavior parity | keep explicit `virtualized` only as experimental; docs/JSDoc must name browser-find, screen-reader, selection, IME, and mobile caveats | native behavior matrix, rendering metrics, huge-doc benchmark rows, DOM coverage tests | gate hard |
| Keep core JSON/op/read-update architecture | "If you are rewriting anyway, adopt Lexical/ProseMirror-class runtime identity fully." | Lexical and ProseMirror have stronger dirty/view machinery and less legacy Slate baggage | wholesale identity shift breaks Slate-close DX and migration value | steal dirty-locality, transaction metadata, and view-authority mechanisms without changing Slate's public identity | core contracts, operation replay, commit metadata proof, perf proof | keep |
| Keep internal command middleware out of public docs | "Commands are how developers expect editor APIs to compose." | Tiptap command chains are excellent product DX | public raw-Slate command sugar can make Plate's job bleed into core and confuse transaction ownership | raw Slate docs stay lifecycle/state/tx-first; Plate can own product command chains later | public-surface contract and docs grep | keep internal |
| Keep Plate/slate-yjs claims substrate-level | "A rewrite that cannot demo adapters is not migration-ready." | adapter proof would be more convincing | requiring current adapter parity would block raw Slate architecture decisions on product integration work | claim only state/tx groups, operation streams, commits, metadata, and replayability until adapter work starts | operation replay and commit metadata tests; no adapter promise | gate |

Revision accepted from this pass:

- Selector work is now explicitly proof-first. The plan must not say "rewrite to
  `useSyncExternalStore`" as a foregone conclusion. It should compare the
  current selector helper against an external-store adapter, then either migrate
  or keep the custom helper with a written source-backed defense.
- Root runtime split is now owner-first, not line-count-first. A split without
  ordering tests is rejected.
- Virtualized mode stays allowed only as an explicit experimental escape hatch.
  Stable parity needs native behavior proof, not just package tests.

## Hard Cuts And Rejected Alternatives

Hard cuts:

- public docs teaching extension `methods`;
- public docs implying extension `commands`;
- any release claim that treats shell/virtualized mode as fully native without
  proof;
- root runtime expansion without owner split.

Rejected:

- whole-core rewrite;
- raw Slate command-chain product API;
- React `Activity` as active editor correctness strategy;
- virtualized mode as stable default.

## Pass Schedule And State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| current-state-read-and-initial-score | complete | live source/docs/issue reads listed above | created rewrite/cut verdicts and scorecard | score below threshold | related-issue-discovery |
| related-issue-discovery | complete | reused existing ClawSweeper ledger/dossier rows for runtime/render/perf/IME surface | confirmed no new fixed/improved/related claim changes from this planning pass | no new issue claims | issue-ledger-accounting |
| issue-ledger-accounting | complete | sync ledger, coverage matrix, fork dossier, and PR reference checked from cache | recorded no-change accounting; no ledger mutation needed | no new claims | intent-decision-brief-hardening |
| intent-decision-brief-hardening | complete | intent/boundary pressure test and expanded decision brief recorded | clarified review-only boundary, no user question, proof/claim boundaries, and rejected docs-only/implementation-first shortcuts | none | research-ecosystem-refresh |
| research-ecosystem-refresh | complete | live source and compiled research reread for extension docs, selector substrate, root runtime, and virtualized policy | decisions unchanged; stale docs remain explicit P0 implementation scope | no research mutation needed | objection-high-risk-revision |
| objection-high-risk-revision | complete | steelman and high-risk rows revised for extension docs, selector substrate, root runtime split, virtualized policy, core identity, command middleware, and migration claims | selector changed to proof-first; root split changed to owner-first; virtualized stays hard-gated | score still below threshold | closure-score |
| closure-score | complete | final scorecard and closure gates recorded | plan is ready for user review; implementation remains separate | no planning gate remains | done |

## Plan Deltas From This Pass

Added:

- current-source evidence table;
- hard keep/rewrite/cut verdicts;
- initial confidence score;
- issue accounting status;
- cache-first related issue discovery no-change defense;
- issue-ledger accounting no-change defense;
- intent/boundary hardening and no-question decision;
- expanded decision brief drivers, proof principle, and rejected alternatives;
- research/source refresh no-change defense;
- external-store pressure strengthened for the selector substrate decision;
- virtualized policy confirmed as experimental, not release-stable parity;
- objection/high-risk revision;
- selector decision narrowed to proof-first instead of rewrite-by-default;
- root runtime split narrowed to owner-first with ordering proof;
- Plate/slate-yjs claim kept at substrate level;
- closure score pass;
- final plan-readiness score raised to `0.92`;
- scoped completion-state owner;
- next-pass owner.

Revised:

- prior instinct that core needs rewrite is rejected.
- extension docs moved from "maybe stale" to P0 rewrite.
- selector substrate changed from "rewrite or defend" to "compare, then migrate
  or keep with proof."
- root runtime split changed from "split the big hook" to "split only tested
  behavior owners while preserving a thin assembly root."
- completion status changed from `pending` to `done` because the remaining work
  is now an implementation handoff, not another planning pass.

Dropped:

- renderVoid rewrite. It is already done in live source.
- public command registry deletion. Public commands are already rejected; only
  internal command middleware remains.

## Open Questions

None for user right now.

What would change the decision:

- if selector migration to external-store semantics regresses measured locality,
  keep the custom helper but document the proof;
- if root runtime split creates ordering bugs, keep a coordinator but require
  explicit owner modules and focused tests;
- if virtualized mode passes native behavior proof, promote it from gated to
  stable.

## Implementation Phases

1. Docs truth sync: complete. Stale extension `methods` claims are removed from
   active architecture/release docs.
2. Selector proof spike: complete. An external-store-backed adapter is viable
   only if it preserves selector equality reuse, render-time error replay,
   runtime-id fanout, deferred flushing, and profiler markers.
3. Selector contract tests: complete. Provider hook contracts now lock
   subscription error replay, operation threading, deferred selector coalescing,
   and profiler marker preservation before any selector implementation rewrite.
4. Root runtime split: complete for the safe first owner cuts. Global lifecycle
   listeners and selection-only DOM export subscription now sit behind named
   root runtime owners with static inventory tests.
5. Rendering mode policy: complete. Bare-string `virtualized` is cut from the
   stable rendering strategy type; virtualized remains object-only and
   explicitly experimental.
6. Perf proof: rerun rerender breadth and huge-doc compare for touched runtime
   paths.
7. Issue sync: run ClawSweeper and update ledgers only for claims actually
   touched.

## Ralph Execution Slice - 2026-05-11

Current status: `pending`.

Completed slice: `docs-truth-sync`.

Files updated:

- `docs/slate-v2/absolute-architecture-release-claim.md`
- `docs/slate-v2/release-readiness-decision.md`
- `docs/slate-v2/final-api-hard-cuts-status.md`
- `docs/slate-v2/master-roadmap.md`
- `docs/slate-v2/references/architecture-contract.md`
- `docs/slate-v2/references/pr-description.md`

Result:

- stale `editor.extend({ methods })` teaching is removed from `docs/slate-v2`;
- extension docs now describe named `editor`, `state`, and `tx` groups;
- commit subscribers remain the post-commit integration path;
- command middleware remains internal;
- PR reference now matches the current public extension story;
- no issue claim changed.

Verification:

```sh
rg -n "extend\\(\\{ methods\\}\\)|extension methods|public extension methods|Extension methods" docs/slate-v2
```

Result: no hits.

Next owner: `selector-contract-tests`.

## Selector Proof Spike - 2026-05-11

Current status: `complete`.

Scope:

- compare the live selector substrate with a React external-store adapter
  direction;
- record the proof shape before changing `../slate-v2` implementation code;
- keep completion `pending` because selector contracts, root runtime split,
  rendering policy, perf proof, and issue sync still have runnable owners.

Live source read:

- `../slate-v2/packages/slate-react/src/hooks/use-generic-selector.tsx:22`
  through `../slate-v2/packages/slate-react/src/hooks/use-generic-selector.tsx:85`
  owns selector result reuse, equality filtering, cached selector identity,
  subscription error capture, render-time error replay, and intentionally stable
  `update`.
- `../slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:68`
  through `../slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:120`
  threads editor commit operations into selectors before calling the generic
  selector update path.
- `../slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:189`
  through `../slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:343`
  owns global selector listeners, runtime-id listener maps, deferred microtask
  flush, stale runtime-id fanout skipping, `shouldUpdate`, and selector profiler
  markers.
- `../slate-v2/packages/slate-react/src/hooks/use-slate-annotations.tsx:65`,
  `../slate-v2/packages/slate-react/src/hooks/use-slate-widgets.tsx:68`, and
  `../slate-v2/packages/slate-react/src/hooks/use-slate-projections.tsx:53`
  show adjacent external-store usage for annotation, widget, and projection
  stores.

Existing proof read:

- `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx:89`
  through `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx:127`
  already locks equality behavior across selector identity changes.
- `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx:253`
  through `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx:416`
  locks runtime-id locality and profiler evidence for unrelated runtime commits.
- `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx:541`
  through `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx:606`
  locks root-order and full-document fanout expectations.
- `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx:613`
  through `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx:689`
  locks mounted render selectors skipping synced text commits while catching
  later node commits.

Verdict:

- Do not replace `useGenericSelector` directly with `useSyncExternalStore`.
  That would drop too many implicit contracts.
- The correct rewrite path is a narrow editor-selector store adapter that keeps
  the existing listener classification and commit fanout policy, then lets the
  hook consume the selected snapshot through React's external-store contract.
- The adapter must keep last selected value, last selector error, selector
  identity, equality result reuse, operation threading, `shouldUpdate`, deferred
  flush semantics, and profiler IDs as explicit contract rows.
- Decoration selectors are adjacent to this pressure because they still use
  `useGenericSelector`, but they subscribe through projection stores. They
  should be handled after the editor selector contract is locked, not folded
  into the first adapter rewrite.

Rejected shortcut:

- A generic helper swap is rejected. It would be cleaner on paper, but it would
  risk making selector fanout broader or hiding subscription errors until later
  renders.

Next owner:

- `selector-contract-tests`: add focused tests for subscription error replay,
  deferred selector flush behavior, operation threading, and profiler marker
  preservation before changing selector implementation.

## Selector Contract Tests - 2026-05-11

Current status: `complete`.

Files updated:

- `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`

Result:

- added a public-hook error boundary contract proving subscription-time selector
  errors replay during render with correlation context;
- added a public-hook operations contract proving commit operations reach the
  selector update path;
- added a deferred selector contract proving two same-turn commits coalesce to
  one selected render update while still preserving `check` and `notify`
  profiler markers;
- left `../slate-v2` selector implementation code unchanged.

Verification:

```sh
cd ../slate-v2
bun test ./packages/slate-react/test/provider-hooks-contract.tsx
bun --filter slate-react typecheck
bunx biome check packages/slate-react/test/provider-hooks-contract.tsx --fix
bun test ./packages/slate-react/test/provider-hooks-contract.tsx
```

Result: all passed. Biome fixed formatting in the touched test file before the
second focused test run.

Risks accepted:

- no external-store adapter implementation was started in this slice. That is
  deliberate; the tests now make the rewrite safer.

Next owner:

- `root-runtime-owner-split`: inspect `useEditableRootRuntime` and split only
  owners that can be covered by existing or focused tests.

## Root Runtime Owner Split - 2026-05-11

Current status: `complete`.

Files updated:

- `../slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-root-lifecycle.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-root-selection-export.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Result:

- extracted native `selectionchange` listener attachment and global drag
  lifecycle cleanup into `useEditableRootGlobalLifecycle`;
- extracted selection-only DOM export subscription into
  `useEditableRootSelectionExport`;
- left selection reconciliation, Android input, repair, kernel trace,
  composition, and event runtime assembly in place because each needs its own
  behavior proof before further extraction;
- added static ownership rows so these root lifecycle paths do not drift back
  into the root coordinator.

Verification:

```sh
cd ../slate-v2
bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts ./packages/slate-react/test/provider-hooks-contract.tsx
bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts ./packages/slate-react/test/provider-hooks-contract.tsx ./packages/slate-react/test/selection-runtime-contract.test.ts
bun --filter slate-react typecheck
bunx biome check packages/slate-react/src/editable/runtime-root-engine.ts packages/slate-react/src/editable/runtime-root-lifecycle.ts packages/slate-react/src/editable/runtime-root-selection-export.ts packages/slate-react/test/kernel-authority-audit-contract.ts packages/slate-react/test/provider-hooks-contract.tsx --fix
bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts ./packages/slate-react/test/provider-hooks-contract.tsx ./packages/slate-react/test/selection-runtime-contract.test.ts
```

Result: final focused tests passed, package typecheck passed, and Biome fixed
formatting in touched files.

Error encountered:

| Error | Attempt | Resolution |
| --- | --- | --- |
| `ReferenceError: ReactEditor is not defined` in `runtime-root-lifecycle.ts` | first focused test after extracting lifecycle owner | changed `ReactEditor` from a type-only import to a runtime import, then reran tests and typecheck |

Risks accepted:

- this does not claim the whole root coordinator is small. It removes two
  proven lifecycle owners and leaves harder selection/IME/repair/event owners
  for later proof-backed slices.

Next owner:

- `virtualized-policy-sync`: cut or clearly keep public `virtualized` as gated
  experimental API in active docs/types and proof wording.

## Virtualized Policy Sync - 2026-05-11

Current status: `complete`.

Files updated:

- `../slate-v2/packages/slate-react/src/rendering-strategy/create-segment-plan.ts`
- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`

Result:

- removed bare-string `virtualized` from `RenderingStrategyType`, so stable
  string strategies are `auto`, `full`, `staged`, and `shell`;
- kept virtualized rendering available only through the explicit object form
  `{ type: 'virtualized', ... }`;
- strengthened JSDoc to say virtualized is experimental and object-only;
- added a public surface contract that prevents `virtualized` from drifting
  back into the stable string strategy union.

Verification:

```sh
cd ../slate-v2
bun test ./packages/slate-react/test/rendering-strategy-and-scroll.tsx ./packages/slate-react/test/surface-contract.tsx
bun --filter slate-react typecheck
bunx biome check packages/slate-react/src/rendering-strategy/create-segment-plan.ts packages/slate-react/src/components/editable-text-blocks.tsx packages/slate-react/test/surface-contract.tsx --fix
bun test ./packages/slate-react/test/rendering-strategy-and-scroll.tsx ./packages/slate-react/test/surface-contract.tsx
```

Result: focused tests passed, package typecheck passed, and Biome fixed
formatting in touched files.

Risks accepted:

- no browser/device parity claim is added. Virtualized remains an experimental
  stress path, not a production-ready native-behavior promise.

Next owner:

- `perf-proof`: rerun selector/runtime-focused performance proof for touched
  runtime paths, then decide whether issue sync needs any claim update.

## Perf Proof - 2026-05-11

Current status: `complete`.

Commands run:

```sh
cd ../slate-v2
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Result:

- rerender breadth passed with `0` broad renders, `0` sibling leaf renders, `0`
  parent block renders, and `0` ancestor renders across the hot edit lanes;
- source-scoped invalidation stayed targeted: text edits woke text rows only,
  selection changes woke selection rows only, and external refreshes did not
  recompute text or selection rows;
- huge-document compare wrote
  `../slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark.json`
  with 5,000 blocks, 5 iterations, and 10 type ops per run;
- `v2DefaultRenderAuto` beat `legacyChunkOn` on the main huge-doc means:
  ready `17.01ms` vs `298.87ms`, start type `15.64ms` vs `36.66ms`,
  middle type `11.01ms` vs `42.44ms`, middle promote type `16.76ms` vs
  `40.71ms`, replace full document `5.37ms` vs `128.48ms`, and insert fragment
  `5.54ms` vs `114.89ms`;
- `v2VirtualizedExperimental` stayed object-only experimental and was also
  faster than `legacyChunkOn` on the same 5,000-block means: ready `18.17ms`,
  start type `9.69ms`, middle type `14.54ms`, replace full document `7.90ms`,
  and insert fragment `6.95ms`;
- `v2ShellExplicitRadius1` is not a release-proof winner: middle select-then-type
  `88.25ms` and middle promote-then-type `113.37ms` are worse than
  `legacyChunkOn` and stay a follow-up, not a claim.

Verdict:

- selector/root-runtime edits did not create a breadth regression;
- the 5,000-block benchmark supports the current default rendering direction;
- virtualized remains useful stress evidence, not stable native-behavior proof;
- no browser/device parity claim is added by this slice.

Next owner:

- `issue-sync`: cache-first ClawSweeper accounting for touched selector,
  root-runtime, rendering-strategy, and performance surfaces.

## Issue Sync - 2026-05-11

Current status: `complete`.

Cache-first inputs read:

- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/references/pr-description.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-issues/gitcrawl-live-open-ledger.md`

Result:

- no new `Fixes #...` claim is justified;
- existing performance rows stay conservative: `#3656`, `#4141`, `#5945`,
  `#5992`, `#6038`, and adjacent rendering/performance rows remain
  `Improves`, `Related`, `Not claimed`, or `cluster-synced` according to their
  existing proof level;
- the virtualized policy change updates maintainer-facing PR reference wording
  only: virtualized is explicit object-form experimental API, not a stable
  string strategy;
- no GitHub issue comment, close, or live rediscovery was run.

Verdict:

- issue accounting is synced for this Ralph execution lane;
- no ledger claim promotion is allowed from the new benchmark pass alone.

## Fast Driver Gates

Planning-only gates, cwd `plate-2`:

```sh
rg -n "\.tmp/completion-check\.md" .agents docs
bun run completion-check
```

Slate v2 gates, cwd `../slate-v2`, when implementation starts:

```sh
bun test ./packages/slate/test/extension-methods-contract.ts ./packages/slate/test/public-surface-contract.ts
bun test ./packages/slate-react/test/surface-contract.tsx
bun test ./packages/slate-react/test/rendering-strategy-and-scroll.tsx
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
bun check
```

Browser/device gates, cwd `../slate-v2`, only when the touched slice claims
browser behavior:

```sh
bun test:integration-local
bun test:mobile-device-proof:raw
```

## Final Completion Gates

This execution lane is marked `done` because:

- ClawSweeper pass is complete through existing durable outputs;
- issue-ledger accounting is complete;
- stale extension docs were patched away from extension `methods`;
- selector substrate proof and contract tests are recorded;
- the safe first root runtime owner split is implemented and tested;
- virtualized mode policy is object-only experimental and covered by surface
  tests;
- perf proof is recorded for rerender breadth and 5,000-block huge-doc compare;
- scoped completion file is updated honestly.

## Final User-Review Handoff Outline

When ready:

- Core: keep data-model/op/transaction/read-update architecture.
- Extension API: cut stale `methods` docs.
- React runtime: rewrite/defend selector substrate.
- Root runtime: split coordinator.
- Render contracts: keep content-only `renderVoid`.
- Performance modes: keep shell/staged explicit; gate virtualized.
- Migration: keep Plate/slate-yjs backbone, no adapter promise.
- Issues: list fixed/improved/related/not claimed after ClawSweeper.
