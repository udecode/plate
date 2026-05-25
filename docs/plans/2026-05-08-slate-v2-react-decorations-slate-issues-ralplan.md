---
date: 2026-05-08
topic: slate-v2-react-decorations-slate-issues-ralplan
status: slate-ralplan-done
skill: slate-ralplan
bucket: react-runtime-decorations-annotations
completion: .tmp/completion-checks/slate-v2-react-decorations-slate-issues-ralplan.md
---

# Slate v2 React / Decorations Slate Issues Ralplan

## 1. Current Verdict

Status: done after pass 12.

This should be one combined architecture lane, not two loose plans:

- React runtime: provider identity, editor replacement, committed snapshot
  publishing, selector subscriptions, focus lifecycle, and rerender breadth.
- Decorations / marks / annotations: transient projections, render-time marks,
  durable anchors, annotation stores, widget stores, source-scoped invalidation,
  and selection/IME fallout from overlay DOM changes.

Hard take: do not rebuild legacy `decorate` as the center of the universe. The
current v2 source already has the right backbone: selector-first React runtime,
runtime-id projection stores, product-noun decoration sources, and annotation
stores. The remaining planning work is issue-corpus accounting, external
evidence synthesis, proof thresholds, and deciding exactly where the public API
should stay Slate-close versus where source/store APIs become the scalable path.

Pass 1 completed the current-state read and initial score. Pass 2 completed
bounded ClawSweeper related-issue discovery for the combined React runtime plus
decorations / marks / annotations surface. Pass 3 completed the full
issue-ledger pass for plan-relevant rows and kept the claim boundary
conservative. Pass 4 hardened the intent, non-goals, package boundaries, and
decision brief against the pass-3 issue matrix. Pass 5 completed the ecosystem
steal/reject/diverge synthesis. Pass 6 completed performance, DX, migration,
regression, and simplicity proof pressure. Pass 7 completed the maintainer
objection ledger and accepted revisions. Pass 8 completed the high-risk
pre-mortem and proof expansion. Pass 9 completed ecosystem maintainer pressure
across React, Slate, Plate, slate-yjs, Lexical, ProseMirror, and Tiptap.
Pass 10 merged the accepted review deltas into the executable targets, phases,
proof gates, and score caps. Pass 11 completed issue-sync accounting without
promoting any issue claims and synced the PR reference to the accepted public
API and proof wording. Pass 12 closed the planning lane at `0.92` and assigned
implementation-only risk to later `ralph` slices.
Completion is `done` for Slate Ralplan planning. This is not a release or
implementation-complete claim.

## 2. Intent And Boundary

Intent:

- create one execution-grade plan for the React runtime plus decorations /
  marks / annotations issue surface, not one plan per issue cluster;
- decide the owner boundary for each issue family before implementation starts;
- keep raw Slate unopinionated while still giving serious applications a
  scalable overlay substrate;
- avoid planning per issue cluster;
- use existing completed React-runtime and decoration plans as evidence, not as
  current mutable owners;
- keep exact issue closure language tied to proof, not architectural optimism.

Desired outcome:

- one `ralph`-ready implementation plan with issue classifications, proof
  routes, and no stale public API claims;
- an API decision map that says which user-facing shapes are simple, advanced,
  or internal;
- a proof map that separates package tests, browser rows, benchmarks, and
  raw-device/mobile rows;
- exact fixed issue claims only where current proof can auto-close the original
  repro;
- performance claims tied to benchmarks and browser/user-path rows, not hook
  vibes.

In scope:

- `.tmp/slate-v2/packages/slate-react` provider, selectors, projection stores,
  decoration sources, annotation stores, widget stores, render leaf/text
  behavior, and examples/tests that prove them;
- `.tmp/slate-v2/packages/slate` mark, range, anchor, runtime-id, and commit
  metadata only where React projection depends on them;
- `.tmp/slate-v2/packages/slate-dom` only where decorated or annotated DOM shape
  affects selection, focus, browser range translation, or input timing;
- React runtime issue rows under `docs/slate-issues`;
- decoration, mark, annotation, and overlay issue rows under
  `docs/slate-issues`;
- Plate/slate-yjs migration-backbone pressure only at substrate level.

Non-goals:

- no broad Slate core rewrite inside this lane;
- no product comment system in raw Slate;
- no revival of current-version Plate APIs as raw Slate requirements;
- no raw mobile/IME closure from desktop React tests;
- no exact closure for external Redux/MobX/debugger/HMR reports without current
  repro proof;
- no legacy `decorate` compatibility quest that drags the scalable path back
  into global invalidation;
- no table, clipboard, history, docs, or examples work unless it directly
  changes the React projection/overlay proof contract.

Decision boundaries:

- `slate-react` owns React projection, selector fanout, focus lifecycle,
  external-store integration, decoration sources, annotation/widget stores, and
  render delivery.
- `slate` owns committed snapshots, runtime ids, mark/range semantics, anchor
  identity, dirty metadata, and transaction state.
- `slate-dom` owns DOM range/selection truth, browser point mapping, focus
  repair, and input/composition proof when overlay DOM shape affects editing.
- Product layers own comment workflows, suggestions, permissions, collaboration
  services, and opinionated toolbar/editor UX.
- Broad hooks can stay broad by contract. Hot paths must use selectors,
  runtime-id subscriptions, or source/annotation stores.
- Exact issue claims require the original issue class to be replayed by the
  right proof owner: package test, browser row, benchmark, or device lane.

Weakest-boundary pressure test:

- #2465/#2564 could tempt us to redesign marks/inlines as a rich product
  component system. Do not do that here. This lane may require better mark
  payload and render projection semantics, but it must not turn raw Slate into
  a link/comment/mention framework.
- #4993/#4997 could tempt us to expose the entire projection engine as the new
  public API. Also no. The user-facing path should stay simple first:
  `decorate` for basic transient ranges, source stores for high-churn overlays,
  annotation stores for durable anchors, projection transport for advanced or
  internal use.

Unresolved user-decision points:

- none for pass 11. The next work is closure scoring and final handoff.

## 3. Current-State Read

Prior plans to reuse as evidence:

- `docs/plans/2026-05-04-slate-v2-clawsweeper-v2-react-runtime-ralplan.md`
  is already `done` for `v2-react-runtime`.
- `docs/plans/2026-04-28-slate-v2-decoration-annotation-rewrite-review-plan.md`
  is already `done` for decoration/annotation architecture review.
- `docs/plans/2026-04-30-slate-v2-decoration-annotation-api-ralplan.md`
  is already `done` for annotation/comment API shape.
- This plan is a new combined slate-issues consolidation lane. Do not reopen
  those done plans as mutable state.

Live Slate v2 source shape:

- `<Slate>` currently accepts `editor`, `decorationSources`, `annotationStore`,
  and change callbacks in
  `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx:63-74`.
- `<Slate>` subscribes to editor commits, batches focused state, DOM text sync,
  change callbacks, and selector dispatch in
  `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx:108-172`.
- `<Slate>` composes decoration sources and the annotation projection store in
  `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx:175-184`.
- Provider stack publishes selector, projection, annotation, editor, and focus
  contexts in `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx:216-228`.
- `useEditorSelector` supports equality, runtime id, deferred fanout, and
  `shouldUpdate` in
  `.tmp/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:68-151`.
- Selector fanout dedupes runtime-id listeners and skips stale mounted-node
  fanout for certain root changes in
  `.tmp/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:212-330`.
- Projection store has `dirtiness`, `runtimeScope`, `sourceId`, source/runtime
  subscribers, metrics, and refresh options in
  `.tmp/slate-v2/packages/slate-react/src/projection-store.ts:31-100`.
- Projection dirty matching understands selection, text, mark, node,
  annotation, and external classes in
  `.tmp/slate-v2/packages/slate-react/src/projection-store.ts:206-243`.
- Decoration sources are product-noun wrappers over projection stores in
  `.tmp/slate-v2/packages/slate-react/src/decoration-source.ts:111-129`.
- Multiple overlay sources are composed through runtime snapshot and
  runtime-id subscriptions in
  `.tmp/slate-v2/packages/slate-react/src/decoration-source.ts:131-204`.
- Annotation stores carry id, anchor, data, projection payload, annotation
  subscriptions, and projection store output in
  `.tmp/slate-v2/packages/slate-react/src/annotation-store.ts:13-87`.
- Annotation refresh can target ids and avoid full fallback when candidates are
  known in `.tmp/slate-v2/packages/slate-react/src/annotation-store.ts:215-267`
  and `.tmp/slate-v2/packages/slate-react/src/annotation-store.ts:332-420`.
- Annotation projection tracks changed runtime buckets, annotation subscribers,
  and metrics in `.tmp/slate-v2/packages/slate-react/src/annotation-store.ts:664-742`.
- Annotation external refresh accepts `ids` and treats `[]` as no-op in
  `.tmp/slate-v2/packages/slate-react/src/annotation-store.ts:761-767`.
- Editable text consumes projection slices and passes them into segmented
  `renderLeaf` / `renderText` output in
  `.tmp/slate-v2/packages/slate-react/src/components/editable-text.tsx:324-441`.

Focused current verification:

- cwd: `.tmp/slate-v2`
- command:
  `bun test ./packages/slate-react/test/provider-hooks-contract.tsx ./packages/slate-react/test/projections-and-selection-contract.tsx ./packages/slate-react/test/annotation-store-contract.tsx ./packages/slate-react/test/widget-layer-contract.tsx ./packages/slate-react/test/render-profiler-contract.test.tsx`
- result: `40 pass`, `0 fail`, `200 expect() calls`.
- cwd: `plate-2`
- command: `pnpm lint:fix`
- result: passed; no fixes applied.
- cwd: `plate-2`
- command:
  `bun run completion-check -- --file .tmp/completion-checks/slate-v2-react-decorations-slate-issues-ralplan.md`
- result: expected failure because the active completion file is `pending`
  after pass 5.

Initial read result:

- already done in live source: editor replacement/context update proof exists.
- already done in live source: selector hooks receive commit facts and can
  avoid broad updates.
- already done in live source: decoration sources and projection stores are
  runtime-id/subscriber based.
- already done in live source: annotation stores have id-targeted refresh and
  projection metrics.
- already done in plan: combined issue accounting was rerun in pass 3 for
  current React + decoration slate-issues.
- already done in plan: external editor synthesis was refreshed in pass 5
  against current React/Lexical/ProseMirror/Tiptap evidence.
- gap: no final implementation phase list exists for this exact combined lane.

## 4. Initial Issue Surface

Pass 1 candidate set from the local slate-issues corpus:

| Family                                      | Candidate issues                         | Initial classification                                                          |
| ------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| React identity / provider replacement       | #5709, #4680, #4165, #5404               | likely improves or related; exact claims require pass 2 thread read             |
| React subscription / rerender breadth       | #5131, #3656, #4141, #4210, #2051, #3430 | benchmark lane; do not claim fixes without benchmark thresholds                 |
| Decoration performance / invalidation       | #4483, #5987, #4993, #4997               | source-scoped invalidation lane; likely improves                                |
| Decoration topology / cross-node projection | #4392, #3382, #3352                      | projection proof exists, but legacy decorate API parity is not the target       |
| Overlapping semantic metadata               | #3383                                    | likely architecture target; needs exact API/proof row                           |
| Selection / IME fallout from decorations    | #3309, #3162, #4712, #4581, #5398, #5433 | related to this lane but exact browser/device proof may route to Mobile/IME     |
| Mark active/render-time semantics           | #4750, #4298, #4225, #2465, #2564        | split between core mark model and React render DX; needs pass 2 classification  |
| Annotation / comments / anchors             | #4477                                    | improves through annotation store; product collaboration not fixed by raw Slate |
| External app updates / focus churn          | #3478, #3497, #5509                      | related until current Redux/MobX/parent-rerender proof lands                    |

Important issue evidence already found:

- `docs/slate-issues/benchmark-candidate-map.md:139-165` says #4483 is a
  dynamic-decoration rerender benchmark, specifically global invalidation pain.
- `docs/slate-issues/benchmark-candidate-map.md:361-387` says #5131 is a clean
  selection-driven subscription-granularity benchmark.
- `docs/slate-issues/benchmark-candidate-map.md:390-416` says #4210 is the
  reusable selection/edit rerender breadth benchmark lane.
- `docs/slate-issues/benchmark-candidate-map.md:486-510` says #2051 is the
  simple typing rerender breadth benchmark lane.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:82-85` already records
  #3656/#4141 as `Improves` and #5131/#3430 as `Not claimed`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:132-146` already records
  #4483/#4477/#5987/#4392/#3382/#3352 as `Improves`.

Live ledger sync status:

- pass 2 discovery complete. No issue claim status changed in this pass.
  Full live ledger and coverage matrix updates are still owned by pass 3 and
  pass 11.

## 4.1 Pass 2 Related Issue Discovery / ClawSweeper

Status: complete.

Archive readiness:

- `gitcrawl --version` returned `0.2.1`.
- `gitcrawl doctor --json` reported one local `ianstormtaylor/slate` corpus,
  `659` open threads, `617` clusters, `last_sync_at:
2026-05-04T14:58:11.123944Z`, and no GitHub token.
- Decision: use gitcrawl as local archive evidence; do not make fresh GitHub
  state, duplicate, stale, or closure claims from it.

Commands run:

```bash
gitcrawl threads --numbers 5709,4680,4165,5404,5131,3656,4141,4210,2051,3430 --include-closed --json ianstormtaylor/slate
gitcrawl threads --numbers 4483,5987,4993,4997,4392,3382,3352,3383,3309,3162 --include-closed --json ianstormtaylor/slate
gitcrawl threads --numbers 4712,4581,5398,5433,4750,4298,4225,2465,2564,4477,3478,3497,5509 --include-closed --json ianstormtaylor/slate
gitcrawl neighbors ianstormtaylor/slate --number 5709 --limit 5 --json
gitcrawl neighbors ianstormtaylor/slate --number 4483 --limit 12 --json
gitcrawl neighbors ianstormtaylor/slate --number 5987 --limit 12 --json
gitcrawl neighbors ianstormtaylor/slate --number 3383 --limit 12 --json
gitcrawl neighbors ianstormtaylor/slate --number 4210 --limit 12 --json
gitcrawl neighbors ianstormtaylor/slate --number 3309 --limit 12 --json
gitcrawl neighbors ianstormtaylor/slate --number 5398 --limit 12 --json
gitcrawl neighbors ianstormtaylor/slate --number 4750 --limit 12 --json
gitcrawl neighbors ianstormtaylor/slate --number 4477 --limit 12 --json
gitcrawl search ianstormtaylor/slate --query "render marks overlapping decorations" --mode hybrid --limit 20 --json
gitcrawl search ianstormtaylor/slate --query "useSlate selection rerender" --mode hybrid --limit 20 --json
gitcrawl search issues "dynamic decorations renderChildren renderText" -R ianstormtaylor/slate --state open --json number,title,state,url,updatedAt,labels --limit 20
```

Reviewed issue refs:

| Family                                             | Issues                                   | Pass 2 posture                                                                                                                                                                                   |
| -------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Editor identity and hook API                       | #5709, #4680, #4165, #5404               | #5709 stays exact `Fixes`; #4680 is adjacent but not exact editor-replacement closure; #4165/#5404 stay hook naming/typing pressure.                                                             |
| Subscription and rerender breadth                  | #5131, #3656, #4141, #4210, #2051, #3430 | Benchmark-owned. #3656/#4141/#2051 stay `Improves`; #5131/#3430 stay not claimed; #4210 needs benchmark promotion before claim.                                                                  |
| Decoration invalidation and API topology           | #4483, #5987, #4392, #3382, #3352, #3383 | Source-scoped projection / decoration-source direction is right. Keep `Improves` or `Related`; do not claim legacy `renderChildren` or `Text.decorations` API parity.                            |
| Decoration selection, IME, and composition fallout | #3309, #3162, #4712, #4581, #5398, #5433 | Related only until browser/device proof exists. #5398/#5433/#3162 belong primarily to Mobile/IME input runtime, not this React/decorations plan.                                                 |
| Marks and render semantics                         | #4750, #4298, #4225, #2465, #2564        | Related / cluster-synced. These require core mark query semantics plus browser/render proof, not only projection-store proof.                                                                    |
| Annotation and external app updates                | #4477, #3478, #3497, #5509               | #4477 stays substrate `Improves`; #3478/#3497/#5509 stay external React/focus/runtime related without exact Redux/MobX/focus closure.                                                            |
| Absent local refs                                  | #4993, #4997                             | Not found in local `docs/slate-issues` refs or gitcrawl issue thread lookup during pass 2; keep out of claims until pass 3 corpus scan explains whether these are PRs, stale refs, or bad seeds. |

Important neighbor evidence:

- #5709 neighbors #4680, #5181, #5211, #3497, and #4323; only #5709 has current
  exact provider replacement proof in the existing matrix.
- #4483 neighbors #2051, #3382, #6033, #2465, #3656, and #2564; this confirms
  decoration perf, mark/render semantics, and legacy API topology are one
  pressure family, not one issue closure.
- #5987 neighbors PR #6033, #4560, #5274, #5433, #5826, and #3354; this makes
  async decoration/caret stability partly DOM selection and IME-adjacent.
- #3383 neighbors #2465, #2564, #4225, #3354, #4426, #3382, and #3151; the
  payload-collision issue is data-model/render policy pressure.
- #4210 neighbors #5274, #3656, #4141, #5433, #2051, #4225, and #5131; rerender
  breadth cannot be separated from selection/render timing.
- #5398 neighbors #5433, #5524, #4466, #3943, #3497, #5181, and #5023; this is
  composition/input runtime evidence, not a desktop React package-only claim.
- #4750 neighbors #3433, #4225, #4298, #3671, #3383, #4317, and #3568; mark
  query semantics need dedicated proof.

Fork issue dossier output:

- existing sections refreshed by reference/no-op: #5987, #3478, #3497, #5509,
  #4581, #3309, #2051, #5404, #3383, #4298, #4225, #4483, #4477, #4392, #3382,
  #3352.
- new concise sections appended for: #5709, #4680, #4165, #5131, #3656, #4141,
  #4210, #3430, #3162, #4712, #5398, #5433, #4750, #2465, #2564.

Plan delta:

- The combined lane remains valid.
- No fixed claim is promoted by pass 2.
- The plan must add an explicit pass-3 matrix for #4680/#4165/#4210/#3162/
  #4712/#5398/#5433/#4750/#2465/#2564, because several are only matrix-only or
  dossier-missing today.
- Keep #5131 broad-hook behavior as an intentional non-claim unless pass 6
  decides to change the public hook contract. That would be a real API decision,
  not a benchmark cleanup.
- Keep #5398/#5433/#3162 out of this plan's fixed-claim target; they inform
  browser proof and runtime boundaries, but exact closure belongs to the
  Mobile/IME lane.

## 4.2 Pass 3 Full Issue-Ledger Pass

Status: complete.

Sources scanned:

- `docs/slate-issues/open-issues-ledger.md`
- `docs/slate-issues/gitcrawl-live-open-ledger.md`
- `docs/slate-issues/gitcrawl-clusters.md`
- `docs/slate-issues/issue-clusters.md`
- `docs/slate-issues/test-candidate-map/`
- `docs/slate-issues/benchmark-candidate-map.md`
- `docs/slate-issues/package-impact-matrix.md`
- `docs/slate-issues/requirements-from-issues.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/references/pr-description.md`
- `docs/slate-v2/decorations-annotations-cluster.md`

Read-only extraction commands:

```bash
rg -n "#(5709|4680|4165|5404|5131|3656|4141|4210|2051|3430|4483|5987|4993|4997|4392|3382|3352|3383|3309|3162|4712|4581|5398|5433|4750|4298|4225|2465|2564|4477|3478|3497|5509|3354|4076|4317|3671|3568|3715|5274|4560|4001|3777|3634|5537|4961)\\b" docs/slate-issues docs/slate-v2 docs/plans tmp -g "*.md"
gitcrawl threads --numbers 4993,4997 --include-closed --json ianstormtaylor/slate
gitcrawl threads --numbers 4483,5987,3383,3354,2465,2564 --include-closed --json ianstormtaylor/slate
gitcrawl search ianstormtaylor/slate --query "4993 top level decorations Range intersection" --mode hybrid --limit 10 --json
gitcrawl search ianstormtaylor/slate --query "4997 decorations selector subscription cursor jumps" --mode hybrid --limit 10 --json
```

Corpus boundaries:

- The frozen ledger has `682` issue rows. The live gitcrawl mirror has `630`
  live-open issues, `29` PRs, `659` open threads, and `617` gitcrawl clusters
  from the `2026-05-04` refresh.
- `open-issues-ledger.md` owns full-corpus sync state.
  `issue-coverage-matrix.md` owns PR-slice claim accounting.
- The React runtime macro theme has `111` issues. The decorations / marks /
  annotations surface is `19` explicitly tagged rows plus adjacent selection,
  IME, and performance fallout.
- Pass 3 classified `44` plan-relevant rows. It did not promote any new exact
  `Fixes #...` claim.

Plan-relevant issue matrix:

| Row family                                 | Issues                                                        | Pass 3 classification                                                                  | Claim boundary                                                                                                                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Exact provider identity floor              | #5709                                                         | `Fixes` already in matrix                                                              | Keep exact because current provider hook contract proves replacement editor propagation.                                                                                                             |
| Editor identity and hook surface pressure  | #4680, #4165, #5404                                           | related / triage-closed / cluster-synced                                               | #4680 remains adjacent but not a second exact fix. #4165 and #5404 inform hook naming and type law, not issue closure.                                                                               |
| Broad hook and rerender breadth            | #5131, #3656, #4141, #4210, #2051, #3430                      | #3656/#4141/#2051 `Improves`; #5131/#3430 `Not claimed`; #4210 benchmark-owned related | `useEditor` / `useSlate` stays broad by contract unless pass 6 explicitly changes API law. Performance promotion needs benchmark thresholds.                                                         |
| Decoration invalidation and async timing   | #4483, #5987, #3354                                           | #4483/#5987 `Improves`; #3354 related                                                  | Source-scoped projection reduces global invalidation and async caret pressure. Stable-array infinite-loop closure needs exact legacy repro proof before a claim.                                     |
| Decoration topology and projection         | #4392, #3382, #3352, #3309                                    | #4392/#3382/#3352 `Improves`; #3309 related                                            | Runtime range projection is the target. Legacy `Text.decorations` and callback parity are not the public v2 contract.                                                                                |
| Overlapping metadata and mark/render model | #3383, #2465, #2564, #4750, #4298, #4225, #3671, #3568, #4317 | related / cluster-synced / triage-closed                                               | This stays split between core mark semantics, render projection, and selection/input proof. Do not claim fix from projection tests alone.                                                            |
| Selection and DOM fallout from overlays    | #4712, #4581, #5274, #4560                                    | related                                                                                | Projection is relevant, but exact closure belongs to DOM selection/focus proof with browser rows.                                                                                                    |
| IME and composition fallout from overlays  | #3162, #5398, #5433, #4001, #3777                             | related / outside exact lane                                                           | Mobile/IME owns exact closure. This plan must only require negative-control proof that React overlay work does not regress composition.                                                              |
| External app updates and focus churn       | #3478, #3497, #5509, #3634, #4961, #5537                      | related / triage-closed                                                                | React runtime/focus pressure is real, but Redux/MobX/programmatic-focus exact closure needs targeted repro proof.                                                                                    |
| Annotation and collaboration pressure      | #4477, #3715                                                  | #4477 `Improves`; #3715 `Not claimed`                                                  | Annotation/widget stores answer substrate pressure. Product comments and collaboration examples remain outside raw Slate closure.                                                                    |
| Search highlighting and examples           | #4076                                                         | issue-reviewed / docs-example                                                          | Useful example pressure only. It should not distort the raw runtime API.                                                                                                                             |
| PR research refs, not issue rows           | #4993, #4997                                                  | architecture evidence only                                                             | These are stale/closed PR research handles in local docs, absent from gitcrawl issue lookup and live issue rows. They explain invalidation-contract failures, but they are not claimable issue refs. |

Matrix-only / future-proof reconciliation:

| Issue | Pass 3 decision                                                                                          |
| ----- | -------------------------------------------------------------------------------------------------------- |
| #4680 | Keep as related/triage-closed adjacent identity pressure; #5709 is the exact provider replacement claim. |
| #4165 | Keep as API law pressure; no closure unless pass 6 changes the public hook naming/typing contract.       |
| #4210 | Keep benchmark-owned. Promote only after the shared rerender-breadth lane has accepted thresholds.       |
| #3162 | Keep Mobile/IME-owned related row. Desktop projection tests do not prove IME closure.                    |
| #4712 | Keep related to projection plus DOM selection. Exact closure needs browser selection proof.              |
| #5398 | Keep Mobile/IME-owned related row. Exact Chinese composition proof belongs to the Mobile/IME lane.       |
| #5433 | Keep Mobile/IME-owned related row. Do not claim from React rerender tests.                               |
| #4750 | Keep core mark-query pressure. Needs mark aggregation and browser-selection proof.                       |
| #2465 | Keep render-DX pressure, not a closure claim.                                                            |
| #2564 | Keep API/model boundary pressure, not a closure claim.                                                   |

Issue-ledger effect:

- No live ledger, coverage matrix, or PR reference claim changed in pass 3.
- Pass 11 still owns corpus-sync edits if later passes change claim state.
- The current plan now has enough issue accounting to move to intent/boundary
  hardening in pass 4.

## 5. Pass 4 Decision Brief

Principles:

- React is projection over committed Slate snapshots, not editor truth.
- Hot editor paths use selector/runtime-id/subscriber fanout, not broad context
  invalidation.
- Decorations, annotations, and widgets are separate public concepts even when
  they share projection plumbing.
- Marks are document/content semantics; projections are render-time overlay
  semantics.
- Exact issue closure requires replayable tests or benchmarks matching the
  issue.
- Public Slate APIs should stay boring for simple cases and explicit for
  high-churn cases.
- Product collaboration workflows are not raw Slate defaults.

Drivers:

- Pass 3 classified `44` plan-relevant rows and found no new exact fix claim.
- The issue corpus says runtime-boundary ownership dominates core-engine
  ownership: React, DOM, and input timing are the real pain center.
- Current source already has the right substrate: selector fanout, projection
  stores, decoration sources, annotation stores, and focused proof.
- The remaining risk is public API drift: either overexpose internals or keep
  legacy `decorate` too powerful.
- #4993/#4997 prove the failure is not just slow rendering. It is an invalid
  contract between external state, decoration invalidation, and selection
  timing.
- React 19.2 helps external-store consumption, but it cannot rescue a broad
  editor-wide invalidation contract.

Viable options:

| Option                                                                | Verdict           | Why                                                                                                                                |
| --------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Restore legacy `decorate` as the primary scalable API                 | reject            | It repeats the overloaded abstraction behind #4483/#5987/#3354 and makes external-state invalidation ambiguous again.              |
| Make `ProjectionStore` the main public API                            | reject            | Correct transport, ugly default DX. Normal Slate users should not learn the runtime engine before highlighting text.               |
| Keep broad hooks and rely on memoization                              | reject            | It leaves #5131/#4210/#2051-style rerender pressure structurally unresolved.                                                       |
| Put comments, cursors, and suggestions into Slate document values     | reject by default | Product policy, permissions, audit trail, undo semantics, and collaboration storage do not belong in raw Slate content by default. |
| Selector-first React runtime plus decoration/annotation/widget stores | choose            | It matches current source, issue pressure, and the package ownership split without making raw Slate product-shaped.                |

Chosen target:

```txt
editor commit metadata
  -> React selector/runtime-id fanout
  -> decoration sources by source dirtiness and runtime scope
  -> annotation stores by changed annotation ids and runtime buckets
  -> render leaf/text receives projection slices
  -> benchmarks/browser rows decide exact issue claims
```

Consequences:

- `decorate` remains a simple Slate-close entry point, not the recommended
  high-churn overlay primitive.
- `createDecorationSource` becomes the scalable path for external or frequently
  changing transient overlays.
- Annotation stores own durable id-bearing anchors. Raw Slate does not ship a
  product comment workflow.
- Core mark/range work is allowed only when React projection cannot preserve
  payload, anchor, or selection semantics without it.
- DOM work is required only when overlay rendering changes browser selection,
  focus, point mapping, or input/composition behavior.
- Mobile/IME rows stay out of exact closure until the matching proof lane
  exists.

Follow-up owners:

| Owner                        | Next responsibility                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| Pass 6 proof pressure        | Turn the decision into benchmark, browser, DX, migration, and regression gates.        |
| Pass 7 maintainer objections | Stress-test whether the chosen API is too engine-shaped or too far from classic Slate. |
| Pass 8 high-risk review      | Pre-mortem public API, browser, IME, collaboration, and performance risks.             |
| Pass 11 issue sync           | Update corpus/coverage/PR ledgers only if later passes change claim state.             |

## 6. Initial Confidence Score

Weighted total after pass 10: `0.92`.

| Dimension                                                | Weight | Score | Evidence / cap                                                                                                                                                                                         |
| -------------------------------------------------------- | -----: | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| React 19.2 runtime performance                           |   0.20 |  0.92 | React selector/projection evidence is strong, `bench:react:rerender-breadth:local` passed, and pass 10 keeps React as external-store/scheduler consumer with source-scoped invalidation below React.   |
| Slate-close unopinionated DX                             |   0.20 |  0.93 | The revised target is explicit: `decorate` remains the first path, decoration sources are the scalable path, annotations/widgets are durable/product substrates, and projection transport is advanced. |
| Plate and slate-yjs migration-backbone shape             |   0.15 |  0.91 | The executable phases now require Plate public-substrate adapter proof and slate-yjs remote anchor mapping proof without raw Slate owning product workflow or CRDT services.                           |
| Regression-proof testing strategy                        |   0.20 |  0.92 | Package, benchmark, browser/native, migration/adoption, docs/example, rollback, and issue-claim gates are merged into the execution phases. Browser rows are still not run.                            |
| Research evidence completeness                           |   0.15 |  0.93 | React, Lexical, ProseMirror, Tiptap, local Slate v2 proof, source-scoped invalidation, relevant learnings, maintainer objections, and ecosystem-owner pressure are merged into keep/drop/proof rules.  |
| shadcn-style composability and hook/component minimalism |   0.10 |  0.91 | Docs/example discoverability now has a phase: simple `decorate`, scalable sources, durable annotation/widget APIs, product examples above raw Slate, projection internals last.                        |

Why not higher:

- `bench:react:huge-document-overlays:local` was red during planning because
  the benchmark imported `useSlateSelector`, passed `projectionStore` to
  `<Slate>`, and created a bare editor. Ralph slice 1 repaired it to current
  APIs: `useEditorSelector`, `decorationSources`, and
  `withReact(createEditor())`.
- Browser/native behavior rows are specified but not run in this pass.
- Plate/slate-yjs migration substrate rows are defined but not proven against
  adapter code.
- Later implementation slices remain open.
  pass 10, not implementation closure.

Pass-10 score cap verdict:

- The plan can reach `>= 0.92` before issue sync because the accepted
  objections, high-risk gates, and ecosystem demands are now merged into the
  executable plan rather than parked as commentary.
- This is plan confidence only. It does not mean implementation closure:
  issue-ledger sync, final handoff, and the later `.tmp/slate-v2` implementation
  gates remain required.

## 7. Ecosystem Strategy Synthesis

Status: complete after pass 5.

Evidence read:

- React 19.2:
  `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md`
- Lexical:
  `docs/research/sources/editor-architecture/lexical-mark-store-and-decorator-split.md`
- ProseMirror:
  `docs/research/sources/editor-architecture/prosemirror-mapped-overlays-and-bookmarks.md`
- Tiptap:
  `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`
- Local Slate v2:
  `docs/research/sources/editor-architecture/slate-v2-local-proof-substrate.md`
- Overlay invalidation decision:
  `docs/research/decisions/slate-v2-source-scoped-overlay-invalidation.md`
- Learnings:
  `docs/solutions/logic-errors/2026-04-03-slate-react-v2-projection-proof-must-split-range-semantics-from-react-overlay-store.md`
  and
  `docs/solutions/performance-issues/2026-04-11-slate-v2-huge-document-typing-needs-selector-fanout-cuts-before-islands.md`
- Live source refresh:
  `.tmp/slate-v2/packages/slate-react/src/projection-store.ts`,
  `.tmp/slate-v2/packages/slate-react/src/decoration-source.ts`,
  `.tmp/slate-v2/packages/slate-react/src/annotation-store.ts`,
  `.tmp/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx`,
  `.tmp/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`,
  and
  `.tmp/slate-v2/packages/slate-react/test/annotation-store-contract.tsx`.

Strategy:

| Reference                           | Steal                                                                                                                                                        | Reject                                                                                                 | Diverge                                                                                                | Slate v2 consequence                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| React 19.2                          | `useSyncExternalStore`, nonurgent UI scheduling, `useDeferredValue`, `Activity`, and Performance Tracks as the React-facing proof vocabulary.                | The idea that React scheduling replaces editor dirty metadata or child-scoped invalidation.            | Keep invalidation in Slate; let React consume committed snapshots and external-store slices.           | Keep selector hooks and background UI lanes, but require render-priority evidence for performance claims. |
| Lexical                             | Inline mark ids plus external comment metadata, separate decorator-node UI, explicit render subscriptions, dirty leaf/element reconciliation as a benchmark. | Putting all overlay metadata in the document or claiming React 19.2 alone beats Lexical dirty runtime. | Keep Slate JSON/ops flexibility and product-noun stores instead of Lexical node classes as the API.    | Add deeper dirty/source metadata below React; keep annotation metadata outside raw document value.        |
| ProseMirror                         | Persistent mapped decorations, child-scoped overlay propagation, durable bookmarks, and explicit incremental view-update discipline.                         | One global callback array as the only scalable decoration model.                                       | Keep Slate `Bookmark` and projection/source stores without adopting ProseMirror schema/viewdesc shape. | Source/runtime buckets need mapping proof before field-best decoration perf claims.                       |
| Tiptap                              | Extension ergonomics, command discoverability, optional chaining as transaction sugar, React selector guidance, composable UI helpers.                       | Commands or chain API as a second write engine; ProseMirror leakage as the advanced Slate default.     | Keep `editor.update` as the write lifecycle and let Plate own opinionated product APIs.                | Raw Slate stays unopinionated; Plate gets the richer DX layer on top.                                     |
| Current Slate v2                    | Runtime-id projections, source dirtiness options, runtime/source subscriptions, metrics, decoration sources, annotation stores, and `Bookmark` tests.        | Publishing raw projection plumbing as the default app authoring surface.                               | Use projection as transport; expose decoration/annotation/widget nouns first.                          | The current backbone is right, but pass 6 must define exact perf, browser, and API gates.                 |
| Source-scoped invalidation decision | Dirty paths, touched runtime ids, replace epoch, operation class, source dirtiness, per-source/per-runtime updates, full refresh fallback.                   | Treating local subscribers as enough while recompute still starts broad.                               | Build source-scoped invalidation under the current projection API instead of replacing the API again.  | `ralph` implementation slices should target recompute metadata before public superiority claims.          |

Non-negotiable conclusion:

- The architecture is directionally right, not complete.
- `ProjectionStore` should stay advanced/internal transport by default.
- `decorate` stays the small classic path.
- Decoration sources are the scalable transient overlay path.
- Annotation stores are the durable id-bearing path.
- Widget stores stay separate from text ranges.
- The next serious tranche is source-scoped invalidation and proof, not another
  React hook wrapper.

### 7.1 Ecosystem Maintainer Pressure

Status: complete after pass 9.

Pass-9 evidence re-read:

- React 19.2 external-store and background UI research:
  `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md`
- Lexical mark/store/decorator split:
  `docs/research/sources/editor-architecture/lexical-mark-store-and-decorator-split.md`
- ProseMirror mapped overlays and bookmarks:
  `docs/research/sources/editor-architecture/prosemirror-mapped-overlays-and-bookmarks.md`
- Tiptap extension command React DX:
  `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`
- local Slate v2 overlay proof substrate:
  `docs/research/sources/editor-architecture/slate-v2-local-proof-substrate.md`
- local Plate migration pressure from `packages/suggestion`, plugin resolver
  tests, `docs/slate-v2/decorations-annotations-cluster.md`, and prior
  Slate-v2 migration plans.

Maintainer pressure table:

| Owner lens              | Would accept                                                                                                                                                     | Would reject                                                                                                                                          | Demand before execution                                                                                                                                              | Plan response                                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React maintainers       | `useSyncExternalStore` snapshots, selector subscriptions, urgent editable work, nonurgent side UI, Performance Tracks as evidence.                               | Treating React scheduling as editor correctness, putting editable DOM sync behind background lanes, effect-plus-state loops for derived overlay data. | Show stable snapshots, narrow subscriptions, urgent typing/selection paths, and render-priority evidence for any React performance claim.                            | Keep React as the consumer of Slate commit/projection facts. Do not make React the dirty-node engine. Benchmark plus browser rows must prove the split. |
| Slate maintainers       | Classic `decorate` for simple transient ranges, Slate-close render names, unopinionated raw APIs, small escape hatches.                                          | Product comments/review workflow in raw Slate, projection-store-first docs, breaking compatibility for no measured win.                               | Beginner docs must start with `decorate`; advanced docs must justify sources/projection with scale/proof; compatibility aliases need an audit.                       | Keep the simple/scalable/durable/advanced API ladder and move alias/prop decisions into the benchmark repair phase.                                     |
| Plate maintainers       | Decoration/annotation/widget substrate that supports comments, suggestions, toolbars, sidebars, and product chrome without every feature reimplementing anchors. | Raw Slate owning Plate product policy, or forcing Plate to import projection internals for normal comments/suggestions.                               | A Plate-style adapter proof must compile through public substrate nouns first: decoration sources, annotation stores, widget stores, bookmarks, and commit metadata. | Add adapter proof to revision/pass 10 before `ralph`; projection internals remain an escape hatch, not Plate's primary integration path.                |
| slate-yjs maintainers   | Deterministic operations, durable anchors/bookmarks, commit metadata, local-only rendering state, and remote edit mapping.                                       | Shared CRDT state depending on mounted React state, shell/staged mount state, or product comment schemas in raw Slate.                                | Remote text/structure edit proof must map bookmarks and annotation projection buckets without forcing comment metadata into document value.                          | Keep collaboration service/schema above raw Slate; require remote-edit anchor proof before issue-sync upgrades.                                         |
| Lexical maintainers     | Split inline ids from comment metadata, separate decorator/widget UI, explicit subscriptions, dirty leaf/element reconciliation as a benchmark target.           | Claims that React 19.2 alone beats Lexical's dirty runtime, or that every overlay belongs in document JSON.                                           | Show dirty/source/runtime impact facts below React, not just external-store subscriptions.                                                                           | Keep source-scoped invalidation as the next implementation tranche and block field-best claims until benchmarks prove it.                               |
| ProseMirror maintainers | Mapped overlay data, child-scoped propagation, durable bookmarks, and explicit view/update discipline.                                                           | One global `decorate` callback as the scalable story, or broad projection recompute hidden behind local subscriptions.                                | Prove child/runtime-scoped overlay slices, durable anchor rebasing, and browser selection behavior.                                                                  | Keep `Bookmark`, projection/source stores, and source-scoped invalidation; require browser/native proof for DOM claims.                                 |
| Tiptap maintainers      | Extension ergonomics, command discoverability, selector guidance, composable UI helpers, product-layer docs.                                                     | A second write engine, ProseMirror leakage as advanced Slate API, or docs that make users assemble too many primitives before seeing value.           | Examples must be discoverable and composable: provider/content/sidebar/floating primitives at the product layer, with `editor.update` as the write lifecycle.        | Keep raw Slate unopinionated; let Plate own richer product ergonomics; pass 10 must add an example/docs order that makes the API feel learnable.        |

Accepted pass-9 revisions:

- Pass 10 must add an ecosystem-proof checklist to the executable phases, not
  leave the owner table as commentary.
- Plate adapter proof must explicitly use public substrate nouns first. If it
  needs projection internals as the main API, the plan is not ready.
- slate-yjs proof must include remote edit mapping for bookmarks and annotation
  projection buckets, with mount state and product comment schema kept local or
  above raw Slate.
- Lexical and ProseMirror pressure keeps field-best performance claims capped
  until dirty/source/runtime impact facts and browser rows are green.
- Tiptap pressure requires docs/examples to be discoverable before execution:
  `decorate` first, scalable sources second, product examples above raw Slate,
  projection internals last.

Dropped ecosystem demands:

- Do not adopt Lexical node classes as Slate's public API.
- Do not adopt ProseMirror schemas/viewdesc as Slate's public API.
- Do not adopt Tiptap chain/commands as a second write engine.
- Do not make Plate or slate-yjs current adapter compatibility a raw Slate
  closure requirement.

Pass-9 verdict:

- Keep the plan and send it to revision.
- The architecture is strong enough to revise, but not ready for `done`:
  pass 10 must merge these ecosystem demands into the implementation phases and
  final handoff before issue sync.

## 8. Public API Target

Accepted after pass 10:

- keep classic `decorate` only for simple transient Slate-style ranges;
- keep `createDecorationSource` for scalable external/high-churn transient
  overlays;
- keep `annotationStore` / annotation hooks for durable id-bearing anchors;
- keep widget stores separate from decoration ranges;
- keep `ProjectionStore`, projection selectors, and projection-store metrics as
  advanced transport, not the beginner authoring surface;
- default huge-overlay benchmark repair path is `useEditorSelector` plus
  `decorationSources`;
- restore `useSlateSelector` or direct `<Slate projectionStore={...}>` only if
  the implementation phase produces an explicit public API audit, typed alias
  contract, and docs answer.

Docs/example order:

1. `decorate` for simple transient ranges.
2. `createDecorationSource` / `decorationSources` for high-churn or external
   transient overlays.
3. `annotationStore`, annotation hooks, and widget hooks for durable anchors and
   product-layer UI substrate.
4. Projection internals only on an advanced escape-hatch page.

## 9. Internal Runtime Target

Accepted after pass 10:

- selectors update from commit facts and runtime-id impact metadata;
- projection sources dirty by source class and runtime scope;
- annotation stores refresh by impacted annotation ids when possible;
- render text consumes projection slices without turning every text node into a
  broad React subscriber;
- source full refresh remains a safe fallback, not the steady-state perf story;
- source-scoped invalidation is the next implementation tranche: dirty source
  class, impacted runtime ids, source ids, annotation ids, and benchmark metrics
  must flow below React before any field-best performance claim.

## 10. Hooks / Components / Render DX Target

Accepted after pass 10:

- broad: `useEditor` for editor identity and static-ish access;
- narrow: `useEditorSelector`, `useEditorState`, `useNodeSelector`,
  `useTextSelector`, `useSlateProjections`, annotation/widget hooks;
- render: `renderLeaf` remains close to Slate terminology, but projection slices
  must preserve overlapping payloads without flattening metadata into one
  winner.

Docs should keep `useDecorationSelector` advanced. Normal app examples should
start from `decorate`, `decorationSources`, annotation stores, and widget hooks.

## 11. Plate Migration-Backbone Target

Status: revised after pass 10.

Accepted substrate target:

- Plate can build product annotations, comments, suggestions, toolbars, and
  decorations on top of decoration/annotation/widget stores without wrapping
  every core call.
- Plate-specific overlay products do not become raw Slate API.
- Plate should consume raw Slate through:
  `decorationSources`, `createDecorationSource`, `useSlateDecorationSource`,
  `annotationStore`, `useSlateAnnotationStore`, `useSlateAnnotations`,
  `useSlateWidgetStore`, `useSlateWidgets`, `Bookmark`, and commit dirtiness.
- Plate should own comment workflow, permissions, suggestions, sidebars,
  toolbars, markdown/product extensions, and collaborative service wiring.
- Plate proof later must compile at least one product-style comments/suggestion
  adapter without importing projection internals as the primary API.
- The adapter proof must use public substrate nouns first:
  `decorationSources`, `createDecorationSource`, `useSlateDecorationSource`,
  `annotationStore`, `useSlateAnnotationStore`, `useSlateAnnotations`,
  `useSlateWidgetStore`, `useSlateWidgets`, `Bookmark`, and commit dirtiness.
- If the adapter needs projection internals as the primary API, the plan is not
  ready for `ralph`.

## 12. slate-yjs Migration-Backbone Target

Status: revised after pass 10.

Accepted substrate target:

- raw Slate exports durable anchors and deterministic commit/runtime metadata;
- collaboration adapters map comment/annotation anchors through their own CRDT or
  service layer;
- raw Slate does not force comment-only users to mutate the document value.
- `EditorCommit` already exposes runtime dirtiness and metadata fields in live
  source: `dirtyPaths`, `dirtyScope`, `decorationImpactRuntimeIds`,
  `nodeImpactRuntimeIds`, `replaceEpoch`, `metadata`, and operation classes.
- slate-yjs proof later must show remote text/structure edits update bookmarks
  and annotation projection buckets without forcing raw Slate to own the CRDT
  comment schema.
- The proof must keep mount state local. Shared CRDT state cannot depend on
  shell/staged mount state, React component state, or product comment schema in
  raw Slate.

## 13. Issue-Ledger Accounting

Status: complete after pass 11.

The issue-ledger classification pass and pass-11 sync are complete for this
planning lane. Closure still belongs to pass 12.

Pass 2 owner:

- complete. ClawSweeper ran once for React runtime plus decorations / marks /
  annotations.
- gitcrawl archive evidence was used first.
- `docs/slate-v2/ledgers/fork-issue-dossier.md` now has missing concise
  sections for the pass-2 reviewed issues.

Pass 3 owner:

- complete. The full `docs/slate-issues` stack was scanned for the combined
  React runtime plus decorations / marks / annotations surface.
- `44` plan-relevant issue rows were classified in this plan.
- No fixed-issue claim status changed. Public API target language changed in
  pass 10, so pass 11 must check whether the PR reference needs a public API /
  proof-reference sync without upgrading any issue to exact `Fixes`.

Current PR reference status:

- synced after pass 11.
- `docs/slate-v2/references/pr-description.md` now reflects the accepted API
  ladder: `decorate`, decoration sources, annotation/widget stores, and
  projection internals as advanced runtime surface.
- The PR reference now records the huge-overlay benchmark API drift owner:
  migrate to `useEditorSelector` plus `decorationSources` by default; restore
  `useSlateSelector` or direct `<Slate projectionStore={...}>` only after a
  public API audit, typed alias contract, and docs answer.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` unchanged: no fixed,
  improved, related, or not-claimed classification changed.
- `docs/slate-v2/ledgers/fork-issue-dossier.md` unchanged: no new issue was
  reviewed in pass 11.
- `docs/slate-issues/gitcrawl-live-open-ledger.md` unchanged: no live cluster
  rollup changed.
- No issue was upgraded to exact `Fixes #...`.

## 14. Legacy Regression Proof Matrix

Status: defined after pass 6.

Package proof rows:

| Surface                    | Required proof                 | Current owner                                                                    | Acceptance                                                                                                    |
| -------------------------- | ------------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Provider/editor identity   | provider hook contract         | `.tmp/slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`            | editor replacement and provider identity do not wake unrelated hot-path subscribers                           |
| Projection slices          | projection contract            | `.tmp/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx` | overlapping payloads stay multiplicity-safe; sibling projection changes do not rerender unrelated runtime ids |
| Decoration selectors       | decoration selector contract   | `.tmp/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx` | `useDecorationSelector` stays runtime-id scoped and advanced; no sibling projection rerender                  |
| Annotation ids             | annotation store contract      | `.tmp/slate-v2/packages/slate-react/test/annotation-store-contract.tsx`          | annotation metadata-only changes wake annotation subscribers, not projection/runtime subscribers              |
| Annotation runtime buckets | annotation projection contract | `.tmp/slate-v2/packages/slate-react/test/annotation-store-contract.tsx`          | only affected annotation ids and runtime buckets wake; unrelated annotations stay quiet                       |
| Widgets                    | widget layer contract          | `.tmp/slate-v2/packages/slate-react/test/widget-layer-contract.tsx`              | widget recompute stays separate from inline projection ranges                                                 |
| Render profiling           | render profiler contract       | `.tmp/slate-v2/packages/slate-react/test/render-profiler-contract.test.tsx`      | selector/render profiling keeps stable ids for benchmark rows                                                 |

Benchmark proof rows:

| Lane                          | Command, cwd `.tmp/slate-v2`                       | Hard acceptance                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rerender breadth              | `bun run bench:react:rerender-breadth:local`       | selection changes: broad/left/right block renders `0`, selection renders equal operation count; many-leaf edit: edited leaf `1`, sibling leaves `0`, block `0`; deep edit: deep leaf `1`, ancestors/siblings `0`; decoration toggle: one matching overlay render, no text/sibling overlay render, projection recompute `1`; source-scoped invalidation: only the dirty source recomputes, unrelated source recompute counts `0`.                                           |
| Current rerender evidence     | same command, run 2026-05-08                       | passed. Current maxes: selection 20 ops `5.71ms`, many-leaf edit `4.12ms`, deep edit `3.5ms`, decoration toggle `0.34ms`, source selection/text/external recompute split exactly matched source class. These numbers are evidence, not permanent cross-machine SLA.                                                                                                                                                                                                        |
| Huge-document overlays        | `bun run bench:react:huge-document-overlays:local` | must pass before closure. It must report overlay toggle, active edit after overlay, and shell promotion with projection recompute `<= 1`, stable shell/mounted-text counts, no far text/projection rerender on active edit, and selection moved to the promoted shell target.                                                                                                                                                                                              |
| Current huge-overlay evidence | same command, run 2026-05-08 after Ralph slice 1   | passed. The benchmark now uses `useEditorSelector`, `createDecorationSource`, `<Slate decorationSources={...}>`, and `withReact(createEditor())`. Current evidence: active edit after overlay rerenders active text once, far text/projection `0`, projection recompute `0`; overlay toggle recomputes `1` and wakes the far projection once; shell promotion moves selection to top-level `100`, shell count `8 -> 7`, mounted text `40 -> 60`, projection recompute `0`. |

Native/browser proof rows:

| Row                           | Required proof                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Browser find                  | decorated/annotated/shelled content has explicit native, model-backed, materialize-first, or unsupported status per mode |
| Native selection              | selection drag, select-all, copy, paste, and follow-up typing work after overlay updates                                 |
| IME/composition               | this lane only owns negative controls; raw mobile/device proof belongs to the Mobile/IME lane                            |
| External refresh              | external decoration refresh updates only intended overlay lanes and leaves caret/selection intact                        |
| Review comments / annotations | persistent annotation anchors rebase through text edits and keep sidebar/inline projection coherent                      |

## 15. Browser Stress / Parity Strategy

Status: defined after pass 6.

Browser strategy:

| Example / route owner                                                             | Behavior to prove                                                  | Closure condition                                                                                      |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `.tmp/slate-v2/site/examples/ts/search-highlighting.tsx`                          | search decoration updates while selection and typing stay coherent | search update, select result, type after selection, copy selected text                                 |
| `.tmp/slate-v2/site/examples/ts/external-decoration-sources.tsx`                  | explicit external source refresh                                   | refresh only matching source, caret remains stable, unrelated text does not rerender                   |
| `.tmp/slate-v2/site/examples/ts/review-comments.tsx`                              | annotation sidebar plus inline projection                          | edit inside and before comment, sidebar range follows, inline projection follows                       |
| `.tmp/slate-v2/site/examples/ts/persistent-annotation-anchors.tsx`                | durable bookmark anchor behavior                                   | insert/delete around anchor, then select/copy/follow-up type                                           |
| `.tmp/slate-v2/site/examples/ts/code-highlighting.tsx` and `highlighted-text.tsx` | overlapping marks/decorations                                      | overlapping payloads render without `Object.assign`-style lossiness                                    |
| `.tmp/slate-v2/site/examples/ts/rendering-strategy-runtime.tsx`                   | shell/staged rendering native-behavior contract                    | browser find, select-all, copy, paste, shell promotion, and follow-up typing have explicit mode status |

Command policy:

- iteration: focused package tests plus benchmark scripts above;
- browser closure: `bun test:integration-local` from `.tmp/slate-v2`;
- release-quality local closure: `bun check:full` from `.tmp/slate-v2`;
- raw mobile/device claims: only `bun test:mobile-device-proof:raw` on a real
  device lane, and not in this React/decorations plan.

## 16. Applicable Implementation-Skill Review Matrix

Pass 6 applicability:

| Lens                        | Status  | Applied decision                                                                                                                                                                                                          |
| --------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| vercel-react-best-practices | applied | Use external-store/selectors for render state; apply rerender rules to hot editor units; use `Activity` only for hidden side UI, not editable body semantics; use JS map/set/index rules for repeated projection lookups. |
| performance-oracle          | applied | Treat projection and annotation source reads as repeated-unit hot paths; reject unbounded O(document) recompute as steady state; require 10x/100x cohort thinking before claiming scale.                                  |
| performance                 | applied | Added cohorts, repeated-unit budgets, source/recompute budgets, memory/DOM tags, degradation contracts, native-behavior rows, and browser/benchmark separation.                                                           |
| tdd                         | applied | Implementation phases must add/extend behavior tests before code: projection/source invalidation tests, annotation bucket tests, benchmark guard rows, then browser rows.                                                 |
| shadcn                      | applied | Product UI examples should use composable provider/content/sidebar/floating primitives; raw Slate must not absorb Plate-style comment UI or toolbar API.                                                                  |
| react-useeffect             | applied | Effects are allowed for external subscriptions, source lifecycle, and DOM/browser synchronization only. Derived overlay state belongs in render/selectors/stores, not effect-plus-state loops.                            |

## 16.1 Pass 6 Proof Pressure Matrix

Performance cohorts:

| Cohort       | Size / complexity                                                                          | Default stance                                                     |
| ------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| normal       | `0-500` blocks, low decoration density                                                     | DOM-present, strict repeated-unit budgets                          |
| medium       | `500-2000` blocks                                                                          | DOM-present with measured selector/projection budgets              |
| large        | `2000-10000` blocks                                                                        | DOM-present grouping or staged work only with native-behavior rows |
| stress       | `10000-50000` blocks                                                                       | explicit shell/staged degradation candidates                       |
| pathological | custom renderers, high annotations/comments, hidden boundaries, tables, collab, mobile/IME | complexity-tagged; never hidden inside block count                 |

Repeated-unit budgets:

| Unit                 | Budget                                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| Text leaf            | one edited leaf rerender; zero sibling leaf rerenders; no child effect just to mirror text/marks               |
| Element/block        | no ancestor/sibling rerender for text-only edits unless its own runtime id is impacted                         |
| Decoration source    | recompute only for matching dirtiness class/source; unrelated source recompute count `0`                       |
| Annotation store     | metadata-only refresh wakes annotation subscribers only; projection changes wake only affected runtime buckets |
| Widget store         | widget recompute separate from inline text projection; no widget mount in every repeated text unit             |
| Shell/staged segment | mode must report shell count, mounted text count, selection behavior, and follow-up typing behavior            |

Memory/DOM tags required for large and stress rows:

- JS heap, DOM node count, mounted text count, shell/group count, listener count,
  cached projection/index size, dirty runtime-id set size, annotation/comment
  count, decoration density, custom renderer flags, browser/mobile/IME tag, and
  rendering mode.

Degradation contract:

- default mode stays DOM-present;
- shell/staged mode is allowed only for large/stress cohorts or explicit opt-in;
- every shell/staged claim must classify browser find, screen-reader traversal,
  native selection, copy, paste, select-all, IME, mobile touch selection,
  undo/history, collaboration, and follow-up typing as native, model-backed,
  materialize-first, unsupported, or opt-in only.

## 17. High-Risk Deliberate Mode

Triggered: yes.

Reason:

- React runtime subscriptions, render contracts, decorations, annotations,
  selection/IME fallout, public API shape, and performance claims are all
  high-risk surfaces.

Status: complete after pass 8.

High-risk trigger:

- This plan changes or validates public React API shape, runtime subscription
  behavior, overlay rendering contracts, durable annotation anchors,
  benchmark/release gates, and issue-closure language. A bad call here would be
  user-visible and expensive to reverse.

Blast radius:

| Surface             | Affected owners                                                                                        | Risk                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Public API          | `Slate` props, selector hooks, decoration source APIs, annotation/widget hooks, projection hooks/types | stale aliases or projection-first docs could lock in the wrong authoring model                    |
| React runtime       | provider identity, selector fanout, commit dispatch, focus state, DOM text sync                        | unrelated rerenders, stale selection, or missed subscriber wakeups                                |
| Browser behavior    | rendered decorations, annotations, widgets, shell/staged mode, editable DOM                            | broken find, drag selection, select-all, copy, paste, follow-up typing, accessibility, or IME     |
| Data and anchors    | mark/range projection, bookmarks, annotation anchors, commit metadata                                  | annotations or overlays drift through local/remote edits                                          |
| Migration consumers | raw Slate authors, Plate, slate-yjs, custom renderers, existing `decorate` users                       | app authors import internals, adapters depend on unstable details, docs imply false compatibility |
| Proof/release       | package tests, benchmarks, browser examples, issue ledgers, PR reference                               | benchmark-only claims or premature `Fixes #...` language ship without the original repro proof    |

Three-scenario pre-mortem:

| Scenario                               | Failure mode                                                                                                                                                                                   | Early warning                                                                                                                                                      | Required prevention                                                                                                                                                                                |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API split becomes confusing            | Authors use raw projection internals for normal highlights, or expect `useSlateSelector` / `projectionStore` to be stable because stale examples still compile somewhere.                      | examples import projection stores for basic decoration work; docs lead with internals; benchmark repair silently restores aliases without a public API decision.   | Docs/tutorial order must be `decorate`, decoration sources, annotation/widget stores, projection internals. Benchmark repair must include an export/docs audit before restoring any alias or prop. |
| Runtime proof misses browser reality   | Package tests and benchmarks pass, but decorated/annotated editing breaks native selection, browser find, copy/paste, select-all, composition, or follow-up typing.                            | browser rows stay specified but unrun; shell/staged mode lacks mode status; IME language starts sounding like exact closure.                                       | Focused browser rows and `bun test:integration-local` are closure gates. This lane may only claim IME negative controls; raw-device proof stays in the Mobile/IME lane.                            |
| Migration/collab substrate is too weak | Plate comments/suggestions or slate-yjs remote edits need durable anchors and targeted projection updates, but adapters either import internals or force comment metadata into document value. | Plate proof imports projection internals as primary API; slate-yjs proof skips remote edit mapping; annotation metadata changes wake broad projection subscribers. | Adapter proof must use decoration/annotation/widget nouns first, prove durable anchor rebasing, and keep raw Slate out of product comment/suggestion/CRDT service ownership.                       |

Expanded proof plan:

| Proof layer         | Required proof before `ralph` closure                                                                                                                                                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit/package        | Provider hook contract, projection contract, annotation store contract, widget layer contract, render profiler contract, plus explicit tests for source-scoped invalidation and metadata-only annotation wakes.                                            |
| Integration         | Huge-overlay benchmark repaired against current API or deliberate compatibility shims, with `bench:react:huge-document-overlays:local` green in `.tmp/slate-v2`.                                                                                           |
| Browser/native      | Search highlighting, external decoration refresh, review comments, persistent annotation anchors, overlapping marks/decorations, and rendering-strategy runtime examples must prove find, selection, copy, paste, select-all, and follow-up typing status. |
| Migration/adoption  | Plate-style comments/suggestions adapter compiles without projection internals as the primary API; slate-yjs-style remote text/structure edit proof maps bookmarks and annotation projection buckets.                                                      |
| Docs/examples       | Beginner docs lead with `decorate`; scalable docs lead with decoration sources; durable docs name annotation anchors without product comment workflow; advanced docs isolate projection transport.                                                         |
| Performance/release | Rerender breadth and huge-overlay benchmarks green; browser rows not replaced by benchmark rows; `bun check` remains the final fast sibling-repo gate, with `bun check:full` only for local full browser closure.                                          |
| Issue accounting    | No exact `Fixes #...` claim unless the original issue class has a replayable proof owner. Related/improves/not-claimed rows stay conservative until pass 11 sync.                                                                                          |

Rollback and remediation answers:

- If source-scoped invalidation regresses, keep full-refresh fallback, expose
  metrics, and block field-best performance claims until the benchmark turns
  green again.
- If the benchmark repair demands too much compatibility debt, migrate the
  benchmark to current `useEditorSelector` / `decorationSources` and document
  the old names as intentionally unsupported unless the audit says otherwise.
- If shell/staged mode breaks native behavior, keep it opt-in only, label the
  failed affordance as unsupported/materialize-first, and keep DOM-present
  rendering as default.
- If Plate/slate-yjs proof needs product semantics, leave those semantics above
  raw Slate and strengthen the substrate rather than importing product workflow
  into `slate-react`.
- If browser rows fail, do not soften the gate. Reclassify issue claims to
  related/improves and keep completion pending.

High-risk verdict:

- Keep the plan, but with hard gates:
  - no implementation closure before the huge-overlay benchmark is repaired;
  - no browser/native claim before focused browser proof;
  - no Mobile/IME exact closure from this lane;
  - no raw Slate product comment workflow;
  - no restored compatibility alias/prop without an explicit API audit;
  - no issue-sync upgrade before pass 11.

## 18. Hard Cuts And Rejected Alternatives

Initial hard cuts:

- no legacy `decorate` as the only scalable overlay API;
- no product comment system in raw Slate;
- no broad `useEditor` as the recommended hot-path subscription;
- no field-best decoration performance claim without source-scoped invalidation
  and benchmark proof;
- no exact Mobile/IME closure from desktop React package tests.

## 19. Slate Maintainer Objection Ledger

Status: complete after pass 7.

Evidence refreshed for this pass:

- current `<Slate>` public props are `editor`, `decorationSources`,
  `annotationStore`, and change callbacks in
  `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx:63-74`;
- current `<Slate>` composes decoration sources and annotation projection stores
  in `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx:175-184`;
- current `slate-react` exports `useEditorSelector`, decoration source hooks,
  annotation hooks, widget hooks, projection hooks, and projection store types
  in `.tmp/slate-v2/packages/slate-react/src/index.ts:82-138`;
- current `createDecorationSource` wraps projection transport behind a
  product-noun source API in
  `.tmp/slate-v2/packages/slate-react/src/decoration-source.ts:111-129`;
- current annotation stores own id, anchor, optional data/projection,
  projection store, and targeted subscription contracts in
  `.tmp/slate-v2/packages/slate-react/src/annotation-store.ts:13-87`;
- the huge-document overlay benchmark is stale: it imports
  `useSlateSelector` and passes `projectionStore` to `<Slate>` in
  `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-overlays.tsx:12-19`
  and
  `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-overlays.tsx:237-239`.

Challenge rows:

| Decision                                                                                                         | Strongest fair objection                                                                                                                          | Steelman antithesis                                                                                         | Tradeoff tension                                                                                                                | Alternatives                                                                                                                                          | Why chosen wins                                                                                                                                                                                                                                                                                       | Adoption / docs answer                                                                                                                                                                                              | Proof required                                                                                                                                         | Verdict                          |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| Keep classic `decorate` for simple transient ranges and use decoration sources for high-churn/scalable overlays. | "Classic `decorate` was one function. Source stores are extra API, extra docs, and too engine-shaped for most users."                             | Keep only `decorate`, improve memo guidance, and avoid another public overlay primitive.                    | Two public overlay paths can confuse users and make examples feel split.                                                        | decorate-only; source-only; tiered basic/scalable model.                                                                                              | decorate-only keeps the old global invalidation pressure behind #4483/#5987/#4993-style failures. The current source API already hides projection behind `createDecorationSource`, while `decorate` can stay the first tutorial path.                                                                 | Docs must start with `decorate` for small transient highlights, then show "graduate to a decoration source when refresh frequency, source ownership, or document size matters." Do not lead with `ProjectionStore`. | package tests for both paths, browser examples for both paths, rerender benchmark for source-scoped invalidation, no exact issue fixes until replayed. | keep, with docs-order revision   |
| Keep projection transport available but advanced/internal by default.                                            | "If projection is powerful, hiding it blocks advanced users; if you expose it first, Slate React becomes an engine API."                          | Either expose raw projection as the main API, or make it fully private and force all authors through nouns. | Advanced authors need escape hatches; public projection contracts can fossilize internals.                                      | projection-first API; fully private projection; noun-first API with advanced export.                                                                  | Current exports already expose projection hooks/types, but current `<Slate>` props lead through decoration and annotation stores. That is the right split: power is present, but normal authors should not start there.                                                                               | Public examples lead with decoration source, annotation store, and widget store. Projection gets an advanced page with explicit escape-hatch language and stability caveats.                                        | API docs compile against current exports; examples do not import raw projection for normal overlay use; advanced tests cover raw projection behavior.  | keep, with advanced-tier wording |
| Keep annotation stores in raw Slate as durable substrate, not product comments.                                  | "Annotations are app/product features. Raw Slate should not own comments, permissions, sidebars, review states, or collaboration service models." | Cut annotation store from raw Slate and leave everything to Plate or app code.                              | Raw Slate could leak product nouns into the core if this grows past anchors and projections.                                    | no raw annotation API; full raw comment framework; substrate-only annotation store.                                                                   | The live store shape is substrate-level: id, anchor, optional data/projection, snapshot, projection store, targeted subscriptions. It does not own comments, permissions, UI, or services. That solves durable anchor/projection mechanics without product lock-in.                                   | Docs call it durable anchors/annotations, not comments. Product examples live in Plate/app layers. Raw Slate examples stay metadata-light.                                                                          | annotation anchor rebase tests, metadata-only subscription tests, browser review-comment example as product-layer proof, no raw workflow APIs.         | keep, with boundary guard        |
| Treat benchmarks as necessary but insufficient.                                                                  | "Benchmarks can lie. Real editor bugs are selection, IME, browser range, native copy/paste, and focus fallout."                                   | Ignore local benchmarks and rely on browser E2E/manual traces only.                                         | Benchmarks catch repeated-unit regressions cheaply, but they can bless unusable browser behavior.                               | benchmark-only; browser-only; layered proof gates.                                                                                                    | Source-scoped overlay work needs repeated-unit budgets and browser proof. The plan already separates package tests, benchmarks, browser rows, native behavior rows, and mobile/device rows.                                                                                                           | Every benchmark claim must name what it proves and what it does not prove. Browser/native rows stay first-class closure gates.                                                                                      | `bench:react:rerender-breadth:local`, fixed huge-overlay benchmark, focused browser examples, `bun test:integration-local` before closure.             | keep                             |
| Repair the huge-overlay benchmark API drift before using it as evidence.                                         | "The red benchmark exposes public API drift. Adding `useSlateSelector` back might be cheap, but it could also create stale names forever."        | Restore `useSlateSelector` and a `projectionStore` prop as compatibility shims immediately.                 | Alias compatibility helps migration, but stale names and props make the new API less clear.                                     | restore both alias/prop; migrate benchmark to `useEditorSelector` plus `decorationSources`; create temporary benchmark-local adapter; drop benchmark. | Current live source names the selector `useEditorSelector` and current `<Slate>` accepts `decorationSources` / `annotationStore`. Default should be migrating the stale benchmark to the current API. Restore an alias only after a public API/docs audit proves legacy compatibility is intentional. | Implementation phase 2 must include an export/docs audit, then either migrate the benchmark or restore a typed alias with JSDoc and tests. No implementation or release closure while the benchmark is red.         | `bun run bench:react:huge-document-overlays:local` green in `.tmp/slate-v2`; type/API contract for whichever path is chosen.                           | revise                           |
| Keep browser/native proof rows before `ralph` closure, but do not make this lane claim Mobile/IME closure.       | "Selection and IME breakage is exactly where overlay engines fail; desktop React rows are not enough."                                            | Block all implementation until full mobile-device proof is available.                                       | Mobile proof belongs to the Mobile/IME lane, but this lane can still break desktop native selection and browser range behavior. | require raw mobile proof here; skip browser proof here; negative-control browser proof here and raw-device claims elsewhere.                          | This plan owns decorated/annotated DOM behavior, native selection, browser find/copy/paste/select-all, and IME negative controls. It must not claim raw-device Mobile/IME fixes.                                                                                                                      | The handoff must say "negative controls only" for IME/mobile. Browser examples must prove desktop native behavior before closure.                                                                                   | focused browser rows plus `bun test:integration-local`; raw mobile/device proof only in the Mobile/IME lane.                                           | keep                             |
| Allow shell/staged rendering only as opt-in degradation, not the default Slate rendering model.                  | "This turns Slate React into a custom rendering engine and risks breaking native browser affordances."                                            | Keep only DOM-present rendering and reject shell/staged modes entirely.                                     | Staged rendering can improve stress cohorts but makes find, selection, copy, paste, accessibility, and IME behavior harder.     | DOM-present only; shell-first virtualization; DOM-present default with opt-in degradation contract.                                                   | Normal documents should stay DOM-present. Large/stress cohorts need an explicit degradation mode, and every mode must declare native/model-backed/materialize-first/unsupported behavior.                                                                                                             | Docs put DOM-present first. Shell/staged examples must show mode status and native-behavior tradeoffs rather than selling it as invisible performance magic.                                                        | rendering-strategy browser rows with find/select/copy/paste/follow-up typing; accessibility and IME status rows.                                       | keep, with degradation guard     |

Accepted revisions:

- Documentation/tutorial order must be `decorate` first, decoration sources
  second, annotation/widget stores third, projection internals advanced last.
- Implementation phase 2 must repair the huge-overlay benchmark against the
  current API before any more benchmark-based claims.
- The huge-overlay benchmark drift is not only `useSlateSelector`; it also
  passes stale `projectionStore` directly to `<Slate>`.
- Default decision for the red benchmark is to migrate it to
  `useEditorSelector` plus `decorationSources`; restore aliases/props only if a
  public API audit deliberately chooses compatibility.
- No Mobile/IME closure language is allowed from this lane. Keep negative
  controls and cross-link to the Mobile/IME plan for raw-device claims.

Dropped choices:

- decorate-only as the scalable overlay strategy;
- projection-store-first public API;
- raw Slate comment/review workflow ownership;
- benchmark-only closure;
- shell/staged rendering as default behavior.

Unresolved decisions:

- none. The `useSlateSelector` / `projectionStore` drift has a `revise`
  verdict with an implementation audit owner, not an open user decision.

## 20. Pass Schedule And Pass-State Ledger

| Pass | Name                                                    | Status   | Evidence added                                                                                                                                                                                                | Plan delta                                                                                                                                         | Open issues                                                                                | Next owner                                   |
| ---- | ------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------- |
| 1    | Current-state read and initial score                    | complete | Live source/test reads; focused `.tmp/slate-v2` package tests; prior plan inventory                                                                                                                           | Created this combined plan, score `0.76`, no issue claims changed                                                                                  | ClawSweeper and issue-ledger passes pending                                                | ClawSweeper related issue discovery          |
| 2    | Related issue discovery / ClawSweeper                   | complete | gitcrawl doctor/version; focused thread reads; neighbors for #5709/#4483/#5987/#3383/#4210/#3309/#5398/#4750/#4477; dossier append                                                                            | Raised score to `0.80`; kept claims conservative; separated Mobile/IME rows from React/decorations closure                                         | full corpus issue matrix still missing                                                     | Issue-ledger pass                            |
| 3    | Issue-ledger pass                                       | complete | Full `docs/slate-issues` stack scan; live ledger overlay; test/benchmark/package/requirements maps; #4993/#4997 PR-ref explanation                                                                            | Added pass-3 matrix, reconciled future-proof rows, kept claims conservative, score `0.83`                                                          | no live ledger/PR sync until pass 11                                                       | Intent/boundary and decision brief           |
| 4    | Intent/boundary and decision brief                      | complete | Intent-boundary pass; package ownership docs; pass-3 matrix; #4993/#4997 research refs                                                                                                                        | Hardened scope, non-goals, decision boundaries, consequences, and follow-up owners; score `0.84`                                                   | ecosystem strategy synthesis still missing                                                 | Research and ecosystem synthesis             |
| 5    | Research and ecosystem synthesis                        | complete | React 19.2, Lexical, ProseMirror, Tiptap, local Slate v2 proof, source-scoped invalidation, learnings, and live source refresh                                                                                | Added concrete steal/reject/diverge strategy; raised score to `0.87`; kept projection transport advanced/internal                                  | proof thresholds and objection answers still missing                                       | Performance/DX/migration/regression pressure |
| 6    | Performance/DX/migration/regression/simplicity pressure | complete | performance rule files; Vercel/shadcn/react-useeffect/tdd lenses; live source/export reads; benchmark script reads; `bench:react:rerender-breadth:local` pass; `bench:react:huge-document-overlays:local` red | Added exact cohorts, repeated-unit budgets, benchmark/native rows, DX/API rows, migration substrate rows, and red huge-overlay owner; score `0.88` | maintainer objections and high-risk pre-mortem still missing                               | Maintainer objection ledger                  |
| 7    | Maintainer objection ledger                             | complete | steelman-pass; live `<Slate>` prop/export reads; live decoration/annotation source reads; stale huge-overlay benchmark read                                                                                   | Added challenge rows, accepted revisions, dropped choices, and score `0.89`; corrected red benchmark owner to include stale `projectionStore` prop | high-risk pre-mortem still missing; huge-overlay benchmark still red                       | High-risk deliberate pass                    |
| 8    | High-risk deliberate pass                               | complete | high-risk-deliberate-pass; pass 6/7 proof rows; live API drift owner; browser/native and migration risk map                                                                                                   | Added blast radius, three-scenario pre-mortem, expanded proof plan, rollback/remediation answers, and hard gates; score `0.90`                     | ecosystem maintainer pressure still missing; huge-overlay benchmark still red              | Ecosystem maintainer pass                    |
| 9    | Ecosystem maintainer pass                               | complete | React/Lexical/ProseMirror/Tiptap/local Slate v2 research re-read; local Plate/slate-yjs migration pressure scan                                                                                               | Added ecosystem maintainer table, accepted revisions, dropped demands, and score `0.91`; sent plan to revision                                     | pass 10 must merge ecosystem demands into phases/handoff; huge-overlay benchmark still red | Revision pass                                |
| 10   | Revision pass                                           | complete | pass 7/8/9 accepted revisions; live source/API drift owner; proof and phase reconciliation                                                                                                                    | Merged revisions into public API, runtime, migration, proof, implementation phases, score caps, and handoff outline; score `0.92`                  | issue sync accounting still pending; huge-overlay benchmark still red                      | Issue sync accounting pass                   |
| 11   | Issue sync accounting pass                              | complete | issue coverage matrix read; fork dossier read; live ledger read; PR reference patched                                                                                                                         | Kept issue classifications unchanged; synced PR reference to accepted API/proof wording; score stays `0.92`                                        | closure pass still pending; huge-overlay benchmark still red                               | Closure score and final gates                |
| 12   | Closure score and final gates                           | complete | final gate review; pass-12 closure decision; final user-review handoff                                                                                                                                        | Closed the Ralplan planning lane at `0.92`; assigned the red huge-overlay benchmark to implementation/release proof, not further planning          | implementation slices still need `ralph`; huge-overlay benchmark still red                 | `ralph` implementation slices                |

## 21. Plan Deltas From Review

Pass 1 deltas:

- Created a new combined React/decorations slate-issues ralplan.
- Reused prior done plans as evidence, not mutable state.
- Recorded current live source owners and a focused `.tmp/slate-v2` test gate.
- Seeded issue families and initial score.
- Kept completion `pending`.

Pass 2 deltas:

- Ran bounded ClawSweeper related-issue discovery for the combined React runtime
  plus decorations / marks / annotations surface.
- Recorded gitcrawl archive freshness and no-token limitation.
- Added a pass-2 discovery matrix and neighbor evidence.
- Appended missing fork dossier sections for reviewed issues that had no
  self-contained section.
- Kept all issue claim statuses conservative; no new `Fixes #...` claim.
- Raised score from `0.76` to `0.80`, still far below closure.

Pass 3 deltas:

- Scanned the full local issue corpus stack and the live gitcrawl overlay for
  the combined React runtime plus decorations / marks / annotations surface.
- Classified `44` plan-relevant rows as fixed, improves, related, not claimed,
  or outside exact lane.
- Reconciled the previously matrix-only rows for #4680, #4165, #4210, #3162,
  #4712, #5398, #5433, #4750, #2465, and #2564.
- Explained #4993/#4997 as PR research refs, not issue rows or claimable live
  issue refs.
- Preserved the split between corpus sync and PR-slice claim accounting.
- Raised score from `0.80` to `0.83`; still below closure because ecosystem,
  performance thresholds, maintainer objections, high-risk review, and final
  issue sync remain pending.

Pass 4 deltas:

- Rewrote the intent/boundary record so this lane is explicitly about React
  runtime projection plus decorations / marks / annotations, not a general
  Slate core, DOM, Mobile/IME, table, clipboard, history, or docs plan.
- Added a pressure test for #2465/#2564 and #4993/#4997 so the plan does not
  overcorrect into either product-shaped raw Slate or public projection-engine
  soup.
- Replaced the initial decision brief with a pass-4 brief covering principles,
  drivers, rejected options, chosen target, consequences, and next owners.
- Locked the simple/scalable/durable/advanced API split as the current planning
  posture: `decorate`, decoration sources, annotation stores, projection
  transport.
- Raised score from `0.83` to `0.84`; still below closure because ecosystem
  synthesis, benchmark/browser proof thresholds, maintainer objections,
  high-risk review, and issue sync remain pending.

Pass 5 deltas:

- Read the compiled React 19.2, Lexical, ProseMirror, Tiptap, local Slate v2,
  and source-scoped invalidation pages.
- Checked relevant learnings for projection/store ownership and selector fanout
  failure modes.
- Re-read live Slate v2 projection, decoration source, annotation store,
  selector, projection test, and annotation test owners.
- Converted ecosystem evidence into steal/reject/diverge strategy rows instead
  of a citation list.
- Confirmed the public posture: simple `decorate`, scalable decoration sources,
  durable annotation stores, separate widgets, projection transport
  advanced/internal.
- Raised score from `0.84` to `0.87`; still below closure because pass 6 must
  define exact performance, DX, migration, regression, and simplicity gates.

Pass 6 deltas:

- Applied Vercel React, performance-oracle, performance, tdd, shadcn, and
  react-useeffect lenses to the plan instead of leaving them as generic
  applicability notes.
- Added cohort segmentation, repeated-unit budgets, memory/DOM tags,
  degradation contracts, and native-behavior proof rows.
- Re-read live exports and confirmed `useDecorationSelector`,
  `useSlateDecorationSource`, annotation hooks, widget hooks, `EditorCommit`
  dirtiness, and `Slate` provider props as the current substrate.
- Ran `bun run bench:react:rerender-breadth:local` in `.tmp/slate-v2`; it passed
  and produced exact current recompute/rerender evidence.
- Ran `bun run bench:react:huge-document-overlays:local` in `.tmp/slate-v2`; it
  failed because the benchmark imports stale `useSlateSelector` while live
  `slate-react` exports `useEditorSelector`.
- Raised score from `0.87` to `0.88`; still below closure because pass 7/8
  objections/high-risk remain and the huge-overlay benchmark is red.

Pass 7 deltas:

- Applied `steelman-pass` to the major public API and proof decisions.
- Re-read live `<Slate>` props, export surface, decoration source shape,
  annotation store shape, and the huge-document overlay benchmark.
- Corrected the red benchmark diagnosis: it is stale on both
  `useSlateSelector` and direct `<Slate projectionStore={...}>`.
- Accepted the API tiering with stricter docs order: `decorate`, decoration
  sources, annotation/widget stores, projection internals.
- Kept raw Slate annotation ownership to durable anchor/projection substrate,
  not product comment/review workflow.
- Kept shell/staged rendering only as opt-in degradation with explicit native
  behavior status.
- Raised score from `0.88` to `0.89`; still below closure because high-risk,
  ecosystem-maintainer, revision, issue-sync, closure, and red benchmark owners
  remain.

Pass 8 deltas:

- Applied `high-risk-deliberate-pass` to the public API, browser/runtime,
  performance, migration/collab, release, and issue-claim surfaces.
- Added blast-radius rows for public API, React runtime, browser behavior,
  data/anchors, migration consumers, and release proof.
- Added a three-scenario pre-mortem for API confusion, browser reality gaps, and
  migration/collab substrate weakness.
- Expanded proof gates across unit/package, integration, browser/native,
  migration/adoption, docs/examples, performance/release, and issue accounting.
- Added rollback/remediation rules for broad recompute fallback, alias/prop
  drift, shell/staged native failures, product-comment pressure, and failed
  browser rows.
- Raised score from `0.89` to `0.90`; still below closure because
  ecosystem-maintainer, revision, issue-sync, closure, and red benchmark owners
  remain.

Pass 9 deltas:

- Re-read the React 19.2, Lexical, ProseMirror, Tiptap, and local Slate v2
  ecosystem evidence.
- Scanned local Plate/slate-yjs migration pressure from suggestion/comment
  docs, plugin resolver tests, decoration/annotation cluster docs, and prior
  migration plans.
- Added maintainer-pressure rows for React, Slate, Plate, slate-yjs, Lexical,
  ProseMirror, and Tiptap.
- Accepted revisions that pass 10 must merge into executable phases: Plate
  public-substrate adapter proof, slate-yjs remote anchor mapping proof,
  Lexical/ProseMirror performance caps, and Tiptap-style docs discoverability.
- Dropped demands to adopt Lexical node classes, ProseMirror schema/viewdesc,
  Tiptap chain as a second write engine, or current Plate/slate-yjs adapter
  compatibility as raw Slate closure.
- Raised score from `0.90` to `0.91`; still below closure because revision,
  issue-sync, closure, and red benchmark owners remain.

Pass 10 deltas:

- Merged accepted pass 7-9 revisions into the plan body instead of leaving them
  as layered review notes.
- Revised the public API target to lock the authoring ladder:
  `decorate`, decoration sources, annotation/widget stores, projection
  internals.
- Revised the internal runtime target to make source-scoped invalidation the
  next implementation tranche below React.
- Revised Plate and slate-yjs migration targets with explicit adapter proof:
  public substrate nouns first, remote anchor mapping, local mount state, and no
  raw Slate product workflow or CRDT service ownership.
- Revised implementation phases to include benchmark API drift repair,
  source-scoped invalidation, Plate adapter proof, slate-yjs remote anchor
  mapping, browser/native proof, docs/example discoverability, and sync.
- Decided the score can reach `0.92` before issue sync because the architecture
  plan is now executable. Completion remains pending because issue sync and
  closure are still required.

Pass 11 deltas:

- Checked `docs/slate-v2/ledgers/issue-coverage-matrix.md`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md`,
  `docs/slate-issues/gitcrawl-live-open-ledger.md`, and
  `docs/slate-v2/references/pr-description.md`.
- Kept all fixed/improved/related/not-claimed issue classifications unchanged.
- Updated only the PR reference because pass 10 changed accepted public API and
  proof wording.
- Recorded that the red huge-overlay benchmark owner is API drift in the
  benchmark: `useSlateSelector` and direct `<Slate projectionStore={...}>` are
  not current proof surfaces unless explicitly restored through a public API
  audit.
- Kept score at `0.92`; pass 12 still owns closure and final handoff.

Pass 12 deltas:

- Closed the Slate Ralplan planning lane at score `0.92`.
- Reclassified the red huge-overlay benchmark as an implementation/release gate,
  not a blocker to user review of the plan.
- Kept the hard rule: no implementation or release closure while the
  huge-overlay benchmark is red.
- Wrote the final handoff below so `ralph` can execute slices without rerunning
  architecture discovery.

## 22. Open Questions And What Would Change The Decision

Open questions:

- Which issues can move from `Improves` or `Related` to exact `Fixes` after
  current thread/repro reads?
- Which classic `decorate` examples remain simple enough to keep in docs, and
  which should move to decoration-source examples?
- Which mark rows require core mark/range work before React projection can
  honestly preserve payload and selection behavior?
- Implementation audit question: migrate stale benchmarks/examples to
  `useEditorSelector` plus `decorationSources` by default; restore
  `useSlateSelector` or direct `projectionStore` only if public API audit proves
  those aliases are intentional.
- Which browser rows can be narrowed to focused Playwright greps before the
  final `bun test:integration-local` gate?

Decision changers:

- current issue repro proves an exact browser closure already exists;
- external research proves a cleaner model than source-scoped projection stores;
- benchmark proof shows current source-scoped stores are still too broad at
  realistic scale;
- fixing or intentionally rejecting the `useSlateSelector` / `projectionStore`
  compatibility path changes the huge-overlay benchmark owner;
- live source has drifted from the prior plans.

## 23. Implementation Phases With Owners

Executable draft after pass 10:

1. Claim boundary phase:
   - keep current issue classifications conservative;
   - no exact `Fixes #...` without replayable original-repro proof;
   - preserve Mobile/IME exact closure for the Mobile/IME lane.
2. Benchmark API drift repair phase:
   - migrate the stale huge-overlay benchmark to `useEditorSelector` plus
     `decorationSources`;
   - restore `useSlateSelector` or direct `<Slate projectionStore={...}>` only
     after an explicit public API audit, typed alias contract, and docs answer;
   - rerun `bun run bench:react:huge-document-overlays:local` in
     `.tmp/slate-v2`.
3. Source-scoped invalidation phase:
   - push dirty source class, source id, impacted runtime ids, annotation ids,
     and recompute metrics below React;
   - keep full refresh as fallback, not steady state.
4. React selector/provider identity proof phase:
   - prove provider replacement, focused state, selector fanout, and runtime-id
     wakeups remain narrow.
5. Decoration source invalidation proof phase:
   - prove `decorate` remains simple;
   - prove high-churn sources wake only matching runtime/source buckets.
6. Annotation/widget substrate proof phase:
   - prove metadata-only annotation updates wake annotation subscribers only;
   - prove annotation projection changes wake only affected runtime buckets;
   - keep widgets separate from text projection ranges.
7. Render-leaf/mark metadata proof phase:
   - preserve overlapping payloads and mark metadata without flattening into one
     winner.
8. Browser overlay/selection/IME negative-control proof phase:
   - prove find, selection, copy, paste, select-all, follow-up typing, and mode
     status for decorated/annotated/shelled content;
   - keep raw mobile/device closure out of this lane.
9. Ecosystem adapter proof phase:
   - Plate-style comments/suggestions must compile through public substrate
     nouns first;
   - slate-yjs-style remote edits must map bookmarks and annotation projection
     buckets while mount state stays local.
10. Docs/example discoverability phase:
    - `decorate` first;
    - scalable sources second;
    - durable annotations/widgets third;
    - product examples above raw Slate;
    - projection internals advanced last.
11. Benchmark threshold and ledger/reference sync phase:
    - rerender breadth and huge-overlay benchmarks green;
    - issue coverage and PR reference synced only after proof ownership is
      settled.

## 24. Fast Driver Gates

Planning gates, cwd `plate-2`:

```bash
pnpm lint:fix
bun run completion-check -- --file .tmp/completion-checks/slate-v2-react-decorations-slate-issues-ralplan.md
```

Focused Slate v2 behavior gates, cwd `.tmp/slate-v2`:

```bash
bun test ./packages/slate-react/test/provider-hooks-contract.tsx ./packages/slate-react/test/projections-and-selection-contract.tsx ./packages/slate-react/test/annotation-store-contract.tsx ./packages/slate-react/test/widget-layer-contract.tsx ./packages/slate-react/test/render-profiler-contract.test.tsx
bun run bench:react:rerender-breadth:local
bun run bench:react:huge-document-overlays:local
```

Final Slate v2 closure gate, cwd `.tmp/slate-v2`:

```bash
bun check
```

Browser rows are specified, not run. The huge-document overlay benchmark is
green after Ralph slice 1, but browser/native rows still gate behavior and
release claims.

## 25. Final User-Review Handoff

Planning verdict:

- done for Slate Ralplan review at score `0.92`;
- not implementation complete;
- not release ready;
- ready for `ralph` execution slices.

Accepted public API decisions:

- keep `decorate` for simple transient Slate ranges;
- use `createDecorationSource`, `decorationSources`, and
  `useSlateDecorationSource` for high-churn or external overlays;
- use annotation stores and widget stores for durable anchors and UI overlays;
- keep projection stores/selectors/metrics as advanced runtime surfaces;
- migrate stale benchmark/example code to `useEditorSelector` plus
  `decorationSources` by default;
- restore `useSlateSelector` or direct `<Slate projectionStore={...}>` only
  after a public API audit, typed alias contract, and docs answer.

React runtime decisions:

- React is an adapter over committed editor snapshots, not the owner of editor
  value truth.
- Broad hooks can stay broad by contract.
- Hot paths must use selector subscriptions, runtime-id buckets, decoration
  sources, annotation stores, or widget stores.
- Source-scoped invalidation is the next runtime tranche below React; full
  source refresh remains fallback, not steady state.

Decoration / annotation / widget decisions:

- Decoration sources own scalable transient overlays.
- Annotation stores own durable id-bearing anchors and projection buckets.
- Widgets stay separate from text projection ranges.
- Raw Slate owns substrate only. Product comments, suggestions, permissions,
  review workflows, and collaboration services stay outside raw Slate.

Mark / render-leaf decisions:

- Preserve overlapping payloads and metadata without flattening them into one
  winner.
- Core mark/range semantics remain the owner when React projection cannot
  honestly preserve mark behavior alone.

Plate and slate-yjs migration-backbone decisions:

- Plate proof must compile through public substrate nouns first:
  `decorationSources`, `createDecorationSource`, `useSlateDecorationSource`,
  `annotationStore`, annotation hooks, widget hooks, bookmarks, and commit
  metadata.
- slate-yjs proof must map remote text/structure edits through bookmarks and
  annotation projection buckets.
- Mount state stays local. Shared CRDT state cannot depend on React component
  state, staged DOM state, or product comment schema in raw Slate.

Issue accounting:

- no new exact `Fixes #...` claim from this planning lane;
- no issue classification changed in pass 11;
- PR reference synced to the accepted API/proof wording;
- Mobile/IME exact closure stays in the Mobile/IME lane;
- DOM selection/focus exact closure stays in the DOM bridge lane.

Proof gates for `ralph`:

- first repair `bench:react:huge-document-overlays:local`;
- keep `bench:react:rerender-breadth:local` green;
- run focused `slate-react` package tests for provider hooks, projections,
  annotations, widgets, and render profiling;
- add browser/native rows for decorated/annotated/shelled selection, find,
  copy, paste, select-all, and follow-up typing before claiming browser
  behavior;
- use `bun check` in `.tmp/slate-v2` as the fast sibling-repo closure gate.

Recommended `ralph` slice order:

1. Benchmark API drift repair.
2. Source-scoped invalidation below React.
3. Provider/selector/runtime-id proof hardening.
4. Decoration source invalidation proof.
5. Annotation/widget substrate proof.
6. Mark/render-leaf metadata proof.
7. Browser overlay/selection negative-control proof.
8. Plate/slate-yjs adapter proof.
9. Docs/example discoverability.

## 26. Final Completion Gates

Current gate status:

- total score `0.92`, meets the planning score threshold but is not
  implementation or release closure;
- closure pass complete for planning;
- ClawSweeper related-issue pass complete for the current issue surface;
- issue-ledger pass complete for the active plan;
- intent/boundary and decision brief pass complete;
- ecosystem synthesis complete;
- performance/DX/migration/regression pressure pass complete;
- Ralph slice 1 complete: `bench:react:huge-document-overlays:local` green in
  `.tmp/slate-v2`;
- `bun check` passed in `.tmp/slate-v2` after the benchmark repair;
- maintainer objection pass complete;
- high-risk deliberate pass complete;
- ecosystem-maintainer pass complete;
- revision pass complete;
- issue-sync pass complete;
- final handoff complete.
- Ralph slice 8 complete: Plate/slate-yjs adapter substrate proof is green in
  `.tmp/slate-v2` through public comment examples, commit metadata, deterministic
  replay, local runtime targets, and bookmark rebasing.
- Ralph slice 9 complete: docs/examples now expose the simple
  `Editable.decorate` path, scalable `decorationSources`, annotation stores,
  widget stores, and public hook names with static surface-contract proof.

Completion status is `done` for this Slate Ralplan planning lane.

## 27. Ralph Execution Ledger

### Slice 1: Huge-Overlay Benchmark API Drift

Status: complete.

Files changed:

- `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-overlays.tsx`
- `docs/slate-v2/references/pr-description.md`
- `docs/plans/2026-05-08-slate-v2-react-decorations-slate-issues-ralplan.md`
- `.tmp/completion-checks/slate-v2-react-decorations-slate-issues-ralplan.md`
- `active goal state`

Decision:

- migrated the benchmark to current APIs instead of restoring compatibility
  aliases;
- used `useEditorSelector`, `createDecorationSource`,
  `<Slate decorationSources={...}>`, and `withReact(createEditor())`;
- kept issue claims unchanged.

Evidence:

- `bun run bench:react:huge-document-overlays:local` passed in `.tmp/slate-v2`;
- focused `slate-react` package tests passed: provider hooks, projections,
  annotations, widgets, and render profiling;
- `bun run bench:react:rerender-breadth:local` passed in `.tmp/slate-v2`;
- `bun check` passed in `.tmp/slate-v2`.

Next owner:

- source-scoped invalidation below React.

### Slice 2: Source-Scoped Invalidation Below React

Status: complete; already done in live source, verified by focused tests and
benchmarks.

Files changed:

- `docs/plans/2026-05-08-slate-v2-react-decorations-slate-issues-ralplan.md`
- `.tmp/completion-checks/slate-v2-react-decorations-slate-issues-ralplan.md`
- `active goal state`

Live source owner:

- `.tmp/slate-v2/packages/slate-react/src/projection-store.ts`
  - maps dirtiness classes to editor commit sources;
  - subscribes projection stores through `Editor.subscribeSource(...)`;
  - gates recompute by `dirtiness`, `runtimeScope`, and targeted `sourceId`;
  - exposes metrics for source reads, runtime bucket changes, and source
    subscriber wakes.
- `.tmp/slate-v2/packages/slate-react/src/decoration-source.ts`
  - passes decoration source `id`, `dirtiness`, and `runtimeScope` into the
    projection store.

Decision:

- no implementation patch needed; the plan's target is already present in
  current `.tmp/slate-v2`;
- kept PR reference unchanged because this slice changes no public API, issue
  claim, or proof status beyond already-recorded benchmark/source-scoped rows;
- kept issue claims unchanged.

Evidence:

- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx -t source`
  passed in `.tmp/slate-v2`;
- `bun run bench:react:rerender-breadth:local` had already passed with
  `sourceScopedInvalidation` showing unrelated source recompute counts at `0`;
- `bun check` passed in `.tmp/slate-v2`.

Next owner:

- provider/selector runtime-id proof hardening.

### Slice 3: Provider/Selector Runtime-Id Proof Hardening

Status: complete; already done in live source, verified by focused contracts.

Files changed:

- `docs/plans/2026-05-08-slate-v2-react-decorations-slate-issues-ralplan.md`
- `.tmp/completion-checks/slate-v2-react-decorations-slate-issues-ralplan.md`
- `active goal state`

Live source owner:

- `.tmp/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx`
  - routes selector listeners through global, deferred, or runtime-id buckets;
  - limits runtime fanout to `affectedNodeRuntimeIds` /
    `nodeImpactRuntimeIds`;
  - skips stale mounted runtime-id fanout for root-order-only commits.
- `.tmp/slate-v2/packages/slate-react/src/hooks/use-decoration-selector.tsx`
  - reads one runtime id and subscribes through `store.subscribeRuntimeId(...)`
    when available.

Decision:

- no implementation patch needed; provider replacement, focused state,
  selector fanout, and runtime-id wakeups are already covered by current tests;
- no public API or PR reference change;
- kept issue claims unchanged.

Evidence:

- `bun test ./packages/slate-react/test/provider-hooks-contract.tsx ./packages/slate-react/test/projections-and-selection-contract.tsx`
  passed in `.tmp/slate-v2`;
- prior full `bun check` passed in `.tmp/slate-v2` after slice 2.

Next owner:

- decoration source invalidation proof.

### Slice 4: Decoration Source Invalidation Proof

Status: complete.

Files changed:

- `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `.tmp/slate-v2/packages/slate-react/src/index.ts`
- `.tmp/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`
- `docs/slate-v2/references/pr-description.md`
- `docs/plans/2026-05-08-slate-v2-react-decorations-slate-issues-ralplan.md`
- `.tmp/completion-checks/slate-v2-react-decorations-slate-issues-ralplan.md`
- `active goal state`

Live source owner:

- `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
  - adds `Editable.decorate` as the simple transient range API;
  - implements it as a thin `createDecorationSource(...)` adapter below
    `Editable`, composed with any provider-level projection store;
  - keeps generated projection keys internal when simple ranges omit a key.
- `.tmp/slate-v2/packages/slate-react/src/decoration-source.ts`
  - remains the scalable source-id/runtime-bucket substrate for external or
    high-churn overlays.

Decision:

- fixed the public-DX mismatch instead of editing the plan to pretend
  `decorate` existed;
- did not restore direct `<Slate projectionStore={...}>` or
  `useSlateSelector`;
- kept issue claims unchanged because this is API/proof hardening, not original
  issue replay.

Evidence:

- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx -t "simple Editable decorate"`
  passed in `.tmp/slate-v2`;
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx ./packages/slate-react/test/app-owned-customization.tsx`
  passed in `.tmp/slate-v2`;
- `bun lint:fix` passed in `.tmp/slate-v2` and fixed formatting;
- `bun check` passed in `.tmp/slate-v2`.

Next owner:

- annotation/widget substrate proof.

### Slice 5: Annotation/Widget Substrate Proof

Status: complete; already done in live source, verified by focused contracts.

Files changed:

- `docs/plans/2026-05-08-slate-v2-react-decorations-slate-issues-ralplan.md`
- `.tmp/completion-checks/slate-v2-react-decorations-slate-issues-ralplan.md`
- `active goal state`

Live source owner:

- `.tmp/slate-v2/packages/slate-react/src/annotation-store.ts`
  - keeps annotation subscribers separate from projection/runtime subscribers;
  - reprojects only candidate annotation ids when editor commit metadata allows;
  - wakes only changed annotation ids and changed runtime buckets.
- `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-annotations.tsx`
  - exposes whole-store and single-annotation subscriptions through
    `useSyncExternalStore`.
- `.tmp/slate-v2/packages/slate-react/src/widget-store.ts`
  - owns widget visibility/state independently from text projection ranges.

Decision:

- no implementation patch needed; the annotation/widget substrate is already
  split correctly in live source;
- no public API, PR reference, or issue-claim change.

Evidence:

- `bun test ./packages/slate-react/test/annotation-store-contract.tsx ./packages/slate-react/test/widget-layer-contract.tsx`
  passed in `.tmp/slate-v2`;
- `pnpm lint:fix` passed in `plate-2` after state sync.

Next owner:

- mark/render-leaf metadata proof.

### Slice 6: Mark/Render-Leaf Metadata Proof

Status: complete.

Files changed:

- `.tmp/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`
- `docs/plans/2026-05-08-slate-v2-react-decorations-slate-issues-ralplan.md`
- `.tmp/completion-checks/slate-v2-react-decorations-slate-issues-ralplan.md`
- `active goal state`

Live source owner:

- `.tmp/slate-v2/packages/slate-react/src/components/editable-text.tsx`
  - splits text by all projection boundaries;
  - keeps `segment.slices` as multiplicity-safe projection metadata;
  - passes text marks through `leaf` / `segment.marks` without collapsing
    projection payloads into marks.

Decision:

- added the missing public-path contract for `renderLeaf`;
- preserved the existing `renderSegment` contract;
- no public API or issue-claim change.

Evidence:

- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx -t "renderLeaf receives"`
  passed in `.tmp/slate-v2`;
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx`
  passed in `.tmp/slate-v2`;
- `bun lint:fix` passed in `.tmp/slate-v2`;
- `bun check` passed in `.tmp/slate-v2`.

Next owner:

- browser overlay/selection negative-control proof.

### Slice 7: Browser Overlay/Selection Negative-Control Proof

Status: complete.

Files changed:

- `docs/plans/2026-05-08-slate-v2-react-decorations-slate-issues-ralplan.md`
- `.tmp/completion-checks/slate-v2-react-decorations-slate-issues-ralplan.md`
- `active goal state`

Browser proof covered:

- decorated highlighted text selection, typing, IME, generated mark-click
  gauntlet, Backspace/Delete caret recovery, copy, collapsed copy/cut, and cut;
- annotation-backed review comments, sidebar state, inline slices, and widget
  panel sync;
- DOM coverage shell boundaries, native find, model-backed copy/select-all,
  drag selection across boundary placeholders, hidden model updates, and IME
  with hidden boundaries.

Decision:

- accepted Chromium-focused browser proof for this slice;
- did not claim raw mobile/device closure; the mobile-only DOM coverage row was
  intentionally skipped by the test file;
- kept issue claims unchanged.

Rejected tactic:

- running two Playwright webServer jobs in parallel caused one Next build to
  fail with "Another next build process is already running"; reran the failed
  shell/coverage row sequentially.

Evidence:

- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/highlighted-text.test.ts --project=chromium`
  passed in `.tmp/slate-v2`: 12 passed;
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/review-comments.test.ts --project=chromium`
  passed in `.tmp/slate-v2`: 1 passed;
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/dom-coverage-boundaries.test.ts --project=chromium`
  passed in `.tmp/slate-v2`: 7 passed, 1 mobile-only skipped.

Next owner:

- Plate/slate-yjs adapter proof.

### Slice 8: Plate/slate-yjs Adapter Substrate Proof

Status: complete.

Files changed:

- `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`
- `docs/plans/2026-05-08-slate-v2-react-decorations-slate-issues-ralplan.md`
- `docs/slate-v2/references/pr-description.md`
- `.tmp/completion-checks/slate-v2-react-decorations-slate-issues-ralplan.md`
- `active goal state`

Live source owner:

- `.tmp/slate-v2/site/examples/ts/review-comments.tsx`
  - builds review comments from `Bookmark`, `useSlateAnnotationStore`,
    `useSlateAnnotations`, `useSlateWidgetStore`, and `useSlateWidgets`;
  - keeps comment workflow in the product example, not raw Slate core.
- `.tmp/slate-v2/site/examples/ts/collaborative-comments.tsx`
  - models writer document writes and reviewer comment writes as separate
    channels over public annotation substrate;
  - keeps reviewer document writes at `0`.
- `.tmp/slate-v2/packages/slate/test/collab-history-runtime-contract.ts`
  - proves deterministic remote operation replay, remote metadata, history skip,
    bookmark rebasing, and local runtime target rebasing/nulling.
- `.tmp/slate-v2/packages/slate/test/commit-metadata-contract.ts`
  - proves typed collaboration metadata, including Yjs-style origin metadata.
- `.tmp/slate-v2/packages/slate/test/migration-backbone-contract.ts`
  - proves extension/state/tx backbone without adapter-shaped public namespaces
    such as `api`, `tf`, `plate`, or `yjs`.

Decision:

- added a static public-surface contract for product comment examples instead of
  importing current Plate or slate-yjs adapters into raw Slate;
- kept raw Slate at substrate level: bookmarks, commits, metadata, deterministic
  operations, public annotation stores, and public widget stores;
- rejected projection internals as the primary product-comments path;
- kept issue claims unchanged.

Evidence:

- `bun test ./packages/slate/test/collab-history-runtime-contract.ts ./packages/slate/test/commit-metadata-contract.ts ./packages/slate/test/migration-backbone-contract.ts ./packages/slate-react/test/surface-contract.tsx`
  passed in `.tmp/slate-v2`: 27 passed;
- `bun lint:fix` passed in `.tmp/slate-v2`;
- `bun check` passed in `.tmp/slate-v2`: lint, package/site/root typecheck, Bun
  tests, and Vitest with 202 `slate-react` tests.

Next owner:

- docs/example discoverability.

### Slice 9: Docs/Example Discoverability

Status: complete.

Files changed:

- `.tmp/slate-v2/docs/libraries/slate-react/editable.md`
- `.tmp/slate-v2/docs/libraries/slate-react/hooks.md`
- `.tmp/slate-v2/docs/libraries/slate-react/slate.md`
- `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`
- `docs/plans/2026-05-08-slate-v2-react-decorations-slate-issues-ralplan.md`
- `docs/slate-v2/references/pr-description.md`
- `.tmp/completion-checks/slate-v2-react-decorations-slate-issues-ralplan.md`
- `active goal state`

Live source owner:

- `.tmp/slate-v2/docs/libraries/slate-react/editable.md`
  - documents `Editable.decorate` as the simple editor-local decoration path;
  - points shared/high-churn overlays to provider-owned `decorationSources`.
- `.tmp/slate-v2/docs/libraries/slate-react/slate.md`
  - uses `useSlateDecorationSource(...)` for provider-owned decoration sources;
  - names `Editable.decorate` as the simple callback path.
- `.tmp/slate-v2/docs/libraries/slate-react/hooks.md`
  - documents `useSlateDecorationSource`, annotation hooks, and widget hooks.
- `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`
  - locks docs and product comments to public substrate nouns and rejects
    projection internals as the default path.

Decision:

- documented the simple and scalable overlay paths instead of making examples
  teach projection internals;
- kept `useDecorationSelector` advanced;
- did not change issue claims.

Evidence:

- `bun test ./packages/slate-react/test/surface-contract.tsx` passed in
  `.tmp/slate-v2`: 14 passed;
- `bun lint:fix` passed in `.tmp/slate-v2`;
- `bun check` passed in `.tmp/slate-v2`: lint, package/site/root typecheck, Bun
  tests, and Vitest with 203 `slate-react` tests.

Next owner:

- none. React runtime/decorations/marks/annotations execution lane is complete.
