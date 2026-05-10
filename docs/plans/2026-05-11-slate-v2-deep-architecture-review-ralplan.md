---
date: 2026-05-11
topic: slate-v2-deep-architecture-review
status: active
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
- next: research/source refresh for stale docs, selector substrate, root
  runtime split, and virtualized policy.
- later: objection/high-risk revision and closure score.

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
| React 19.2 runtime performance | 0.20 | 0.82 | selector/runtime infrastructure exists; perf gate is still typing red | selector substrate and hot read proof |
| Slate-close unopinionated DX | 0.20 | 0.88 | core read/update and state/tx groups are live | docs still teach removed methods |
| Plate and slate-yjs migration backbone | 0.15 | 0.84 | state/tx and operations/commits are the right shape | dedicated migration rows not closed |
| Regression-proof testing strategy | 0.20 | 0.86 | coverage matrix and surface contracts are strong | mobile/IME/raw device and virtualized native proof gaps |
| Research evidence completeness | 0.15 | 0.88 | React, ProseMirror, Tiptap, and issue corpus research exists | ClawSweeper issue pass not run for this new review surface |
| shadcn-style composability and minimal hooks/components | 0.10 | 0.89 | content-only void renderers and spec-first renderers are live | root runtime hook is still dense |

Weighted score: `0.86`.

Status: `pending`. This is below the `0.92` completion threshold, and React
runtime performance is below the minimum dimension threshold.

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

Pre-mortem:

1. Selector rewrite regresses runtime-id fanout and makes hot editing worse.
2. Root runtime split moves code without reducing ownership or testability.
3. Virtualized mode stays public and users treat incomplete native behavior as
   stable Slate behavior.

Expanded proof plan:

- unit: extension surface, selector contracts, root controller contracts;
- browser: selection, copy/paste, IME, find, select-all where behavior changes;
- benchmark: rerender breadth and huge-document compare;
- migration: Plate product command sugar and slate-yjs operation replay answers;
- docs: stale `methods` claim grep must stay clean.

Verdict: keep architecture, revise hot spots, cut stale docs, gate public
experimental behavior.

## Slate Maintainer Objection Ledger

| Change | Likely objection | Best antithesis | Why chosen option wins | Proof required | Verdict |
| --- | --- | --- | --- | --- | --- |
| Cut extension `methods` from docs | "You removed the obvious extension API." | method injection is easy to teach | live code already rejects it; state/tx/editor groups are clearer and typed | docs grep plus extension contract tests | keep |
| Audit selector substrate | "Custom selectors already work; don't churn." | current helper may encode runtime-specific behavior | React-backed stores already exist nearby; either migrate or document why not | selector contracts plus rerender benchmark | revise |
| Split root runtime coordinator | "This is just moving code." | one hook makes ordering visible | current coordinator is too dense to review safely; split only around tested owners | controller tests and listener proof | revise |
| Contain `virtualized` | "Pathological docs need it." | performance escape hatches matter | stable API must not imply native behavior parity before proof | behavior matrix and benchmark rows | keep as gated |
| Keep core architecture | "A real rewrite should be Lexical/PM-like." | those systems have stronger dirty/view machinery | Slate's JSON/op model and migration backbone are valuable; steal mechanisms, not identity | core contracts plus perf proof | keep |

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
| research-ecosystem-refresh | pending | initial synthesis exists | verify no stale docs remain | external system rows may need refresh | slate-ralplan |
| objection-high-risk-revision | pending | initial ledger exists | answer new issue and proof objections | virtualized policy still gated | slate-ralplan |
| closure-score | pending | none yet | can set done only after all prior passes complete | score below threshold | slate-ralplan |

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
- scoped completion-state owner;
- next-pass owner.

Revised:

- prior instinct that core needs rewrite is rejected.
- extension docs moved from "maybe stale" to P0 rewrite.

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

1. Docs truth sync: remove stale extension `methods` claims from active
   architecture/release docs.
2. Selector proof spike: compare custom selector helper against an
   external-store-backed adapter without losing runtime-id/deferred fanout.
3. Root runtime split: extract controller owners only where tests can prove
   behavior did not move incorrectly.
4. Rendering mode policy: cut or clearly mark public `virtualized` as gated
   experimental API.
5. Perf proof: rerun rerender breadth and huge-doc compare for touched runtime
   paths.
6. Issue sync: run ClawSweeper and update ledgers only for claims actually
   touched.

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

This plan cannot be marked `done` until:

- ClawSweeper pass is complete or explicitly skipped with a valid reason;
- issue-ledger accounting is complete;
- stale extension docs are listed with exact patch scope;
- selector substrate decision is either rewrite or keep-with-proof;
- root runtime split target has test owners;
- virtualized mode policy is accepted;
- score is `>= 0.92` with no dimension below `0.85`;
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
