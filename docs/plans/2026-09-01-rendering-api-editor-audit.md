# Rendering API editor audit

Objective:
Select the canonical Plite and Plate inline-rendering model before Comments by
auditing every named architecture, proving the exact target scales, closing ten
binary public API gates, and aligning executable Plite and Plate plans.

Flow mode:
agent-led plan hardening

Goal id:
`01a05353-779c-75e1-abeb-a8fd1a670b7f`

Goal plan:
`docs/plans/2026-09-01-rendering-api-editor-audit.md`

Applied owners:

- `autogoal`
- `major-task`
- `editor-audit`
- `best-api`
- `benchmark`
- `plite-plan --deep`
- `plate-plan --deep`

## Final decision

Improve the model before Comments. The old keyed renderer registry solved the
wrong problem, and the old no-plugin Comments plan deleted the correct editor
composition owner.

The accepted hard cut is:

- keep `decorate`, but make it a source descriptor with `read` and optional
  `observe`;
- make Decoration output keyed, non-empty ranges with only `className`,
  `style`, `data-*`, and `aria-*` attributes;
- compile sources once per Plite provider and give each mounted Editable one
  merged subscription per mounted text node;
- cut `renderSegment`, any `render.segment`, arbitrary transient payloads,
  public generic Projection, per-Editable `decorate`, public invalidation
  strategy knobs, and provider props for store families;
- keep raw Plite structural render callbacks for model-backed React;
- keep Plate plugin structural and sibling render slots for product
  composition, but forbid Decoration from activating them;
- cut every raw decorate, source, store, and render bypass from `Plate`,
  `PlateContent`, and `PlateStatic`;
- keep one factory-created `platejs/comments/react` plugin as editor-integration
  owner over an application-owned durable anchor source;
- keep thread bodies, users, permissions, status, persistence, optimistic
  actions, and backend choice outside Plate.

There is no alternative public path. Decoration paints ranges. Widget owns
React or DOM at a point. Annotation or an external adapter owns durable logical
ranges. Model-backed renderers own document structure. Plugins compose Plate
features.

Completion threshold:

- All 15 repositories plus the two platform references in
  `docs/analysis/editor-architecture-candidates.md` have immutable provenance,
  source dossiers, and strict symmetric matrices.
- Every matrix validates with no missing, duplicate, grouped, canned,
  unresolved, or unknown concept rows.
- The exact final source-manager model passes matched normal, large, stress,
  and pathological cohorts under frozen timing, fan-out, cleanup, ordering,
  identity, and zero-segment-callback budgets.
- The final Plite and Plate calls infer without caller annotations, casts,
  `any`, or explicit generics.
- All ten binary public API gates pass for the target design.
- The Plite and Plate plans agree on owner graph, cuts, adoption order, release
  work, proof, and the Comments start gate.
- Before/after calls and explicit keep/cut verdicts exist for `decorate`, raw
  Plite renderers, Plate plugin render slots, external stores, and Comments.
- Mechanical completion checks pass for this plan and both layer plans.

Verification surface:

- Candidate manifest, source dossiers, 17 concept matrices, validation
  receipt, audit report, API scorecard, inference probe, and scale receipt under
  `docs/plans/artifacts/rendering-api-editor-audit/`.
- `docs/editor-audits/index.json` contains the registered audit.
- Strict TypeScript compile of the final call-shape probe.
- Matched executable benchmark with identical fixtures, source order, active
  ranges, affected keys, sampling, and correctness guards.
- Mechanical goal checks on this root plan and both linked plans.
- Product package and browser proof is deliberately deferred to implementation
  and remains a mandatory start/exit gate in the layer plans.

Constraints:

- Planning and disposable proof only; no production package or Comments source
  implementation in this run.
- Compare every named candidate; no sampling, reputation ranking, or web
  summary substitute.
- Start from live repo source and use verified local source clones for external
  repositories.
- Compatibility and migration cost may order work but cannot weaken the final
  API.
- Preserve native editing, selection, IME, clipboard, DOM coverage, static
  rendering, collaboration, serialization, multiple views, and inference.
- No aliases, fallbacks, hidden advanced path, combined store, Plite plugin
  layer, generic renderer registry, or second Comments data owner.
- No commit, push, PR, branch switch, or tracker mutation in this run.

Boundaries:

- Current Plate/Plite source and tests are local truth.
- Immutable external source commits and official platform pages are comparison
  evidence, not implementation authority.
- This root plan owns the audit and target decision. The Plite plan owns raw
  substrate execution. The Plate plan owns plugin lowering, consumer adoption,
  and Comments.
- Hosted Comments backend selection and Suggestion redesign are outside scope.
- Browser product proof is outside this planning run because no product code
  changed; exact routes and commands are named in the execution plans.

Blocked condition:

- Reject the target if any named source cannot be pinned, any matrix is
  incomplete, contextual inference fails, or any frozen scale/correctness
  budget fails.
- After planning acceptance, keep Plate blocked until the Plite production
  receipt passes and keep Comments blocked until Plate has one public path and
  all four current consumers pass.

Linked plans:

- `docs/plans/2026-09-01-plite-canonical-rendering-and-projection-composition.md`
- `docs/plans/2026-08-31-hard-cut-comments-ownership.md`

## Current-state facts

- Plite currently exposes provider `decorationSources`, per-Editable
  `decorate`, dirtiness/scope controls, arbitrary projection data, public
  Projection stores/hooks, `renderSegment`, and store-specific provider props.
- Plate converts arbitrary decoration fields into transient leaf fields, which
  can activate plugin React leaf rendering.
- Plate exposes raw rendering/decoration/store props in parallel with plugins.
- Plate custom decoration sources use a hidden symbol-attached React component.
- Find, Markdown preview, code highlighting, and Yjs need range paint. Find and
  Yjs also need observation and positioned UI. None needs arbitrary per-segment
  React.
- Current Comments stores durable ids in text properties and keeps thread/user
  truth in an editor plugin, mixing document, service, and view lifetimes.

Primary source locations are recorded in
`docs/plans/artifacts/rendering-api-editor-audit/audit-report.md`.

## Exhaustive reference result

The audit covers 17/17 candidates:

1. ProseMirror
2. Lexical
3. Tiptap
4. Pretext
5. Premirror
6. Portable Text
7. Slate
8. edix
9. use-editable
10. rich-textarea
11. `@react-libraries/markdown-editor`
12. urql
13. TanStack DB
14. VS Code
15. Language Server Protocol
16. MDN EditContext
17. Open UI Richer Text Fields

Material synthesis:

- ProseMirror contributes data-only inline attributes, mapped sets, and a hard
  Widget/component split.
- Tiptap is the strongest manager donor: extension identity, changed-range and
  named refresh, stable widgets, cleanup, and fault isolation.
- VS Code is the strongest non-editor API confirmation: disposable owner
  types, data-only styling, replacement, and deltas.
- Lexical confirms stable snapshots plus separate portal/caret/component
  lifecycle.
- Slate confirms raw structural callbacks are valid at the low-level React
  substrate but its callback invalidation is too weak for the target.
- TanStack DB, urql, and LSP contribute stable snapshot, producer identity,
  cleanup, version, and affected-only update laws; they do not justify a public
  generic Projection noun.
- Open UI confirms paint and positioned UI are different facilities. MDN
  EditContext reinforces native model/view ownership. Both platform mechanisms
  remain too unstable to become dependencies.
- The smaller editors and Markdown component map add cleanup, host, and whole
  surface lessons, but none overturns the boundary above.

The comparison is qualitative per atomic concept. It does not invent a bogus
overall popularity score.

## Public API receipt

The target design scores 10/10 because all ten gates are binary PASS:

| Gate                           | Result | Why                                                                                    |
| ------------------------------ | ------ | -------------------------------------------------------------------------------------- |
| Canonicality                   | PASS   | one Plite source list and one Plate plugin path                                        |
| Ownership/lifetime             | PASS   | provider upstream, mounted-node downstream, plugin source identity                     |
| Noun/deletion economy          | PASS   | Projection, segment renderer, raw Plate bypasses, and store props disappear            |
| Type inference                 | PASS   | raw and plugin calls compile without callback annotations                              |
| Multi-source/store composition | PASS   | each descriptor observes and cleans up its own source                                  |
| Scale/fan-out                  | PASS   | compiled buckets replace node-by-source subscriptions and reads                        |
| Native correctness             | PASS   | generic attribute wrappers retain text ownership; execution browser proof is mandatory |
| Static/collaboration integrity | PASS   | static calls `read`; Yjs observes awareness and uses Widget for carets                 |
| Adoption completeness          | PASS   | every consumer, export, doc, release, and proof owner is named                         |
| Teachability/AX                | PASS   | one normal path and four non-overlapping jobs                                          |

This is a target-design score, not a claim about shipped code. Production earns
the same score only when the layer plans pass without a fallback. A failed gate
makes the result incomplete; there is no weighted partial credit.

## Canonical before and after

Current Plate permits competing owners:

```tsx
<Plate
  annotationStore={annotations}
  decorate={decorate}
  decorationSources={[comments]}
  editor={editor}
  renderLeaf={renderLeaf}
>
  <Editor renderSegment={renderSegment} />
</Plate>
```

Raw Plite target:

```tsx
<Plite editor={editor} decorations={[commentsDecorations]}>
  <Editable />
</Plite>
```

Plate target:

```tsx
const comments = useCommentsChannel(documentId);
const commentsPlugin = createCommentsPlugin({
  anchors: comments.anchors,
}).configure({
  slots: { afterEditable: CommentsSidebar },
});

const editor = useCreateEditor({
  plugins: [...EditorKit, commentsPlugin],
});

<CommentsProvider channel={comments} plugin={commentsPlugin}>
  <Plate editor={editor}>
    <Editor />
  </Plate>
</CommentsProvider>;
```

`commentsPlugin` is the one factory-created package descriptor; it attaches
thread UI through a plugin sibling slot. The provider carries a stable
application channel for narrow UI subscriptions. It does not subscribe the
editor root to thread bodies.

## Performance receipt

Command:

```bash
bun docs/plans/artifacts/rendering-api-editor-audit/benchmark-decoration-manager.mjs
```

The matched harness uses five warmups, five packets, and ten samples per packet
with Bun 1.3.12 and Node 24.3.0 on Apple M5 Max, arm64. It records cold/noise values,
absolute and relative budgets, source hashes, deterministic counters, and
correctness guards. There is no network payload or protected data.

All cohorts pass. At 10,000 nodes and 32 sources:

- retained subscriptions fall from 320,000 to 10,032;
- full render work falls from 320,000 source reads to 10,000 bucket reads;
- a 128-node update performs 128 reads and 128 wakes;
- p95 mount changes from 58.256 ms to 68.065 ms while staying inside both
  frozen budgets;
- p95 full read falls from 12.604 ms to 2.865 ms;
- p95 narrow update changes from 0.524 ms to 0.660 ms while staying inside both
  frozen budgets;
- cleanup leaves zero observers;
- attribute order, wrapper count, unchanged bucket identity, and zero
  `renderSegment` calls pass.

The final receipt imports the production manager and passes the exact frozen
contract without relaxing budgets.
Aggregate production counters may record source counts, subscriptions, reads,
buckets, wakes, failures, invalid ranges, and durations. They must never record
text, attributes, ids, keys, application values, or user data.

## Rejected alternatives

- Keep `renderSegment`: no independent valid job remains.
- Add Plate `render.segment`: it legitimizes the same ownership error.
- Cut `decorate`: wrong; transient range calculation and external observation
  need a source owner.
- Keep bare callback `decorate`: wrong; it cannot own observation, cleanup, and
  exact external invalidation.
- Expose a keyed renderer registry: overbuilt support for invalid transient
  React.
- Keep public generic Projection: private incremental machinery is useful; the
  public noun is not.
- Add a Plite plugin model: Plate already owns product plugins and raw Plite
  needs only source descriptors.
- Combine arbitrary stores: source-local observation has the correct lifetime
  and scales.
- Remove the Comments plugin: copied UI would reassemble editor projection and
  lose the canonical feature owner.
- Keep Comments document marks or an editor-owned thread store: both duplicate
  application truth and mix lifetimes.

## Execution order

1. Execute the Plite plan: manager, restricted attributes, public cuts, raw
   adoption, permanent benchmark, package/browser closure.
2. Execute the Plate plan through compiler/public cuts and migrate Find,
   Markdown preview, code highlighting, and Yjs.
3. Build plural Comments package projection and one-shot data migration.
4. Migrate copied UI and application integrations.
5. Repair docs, exports, changesets, registry changelog, barrels, generated
   registry, Vision, and worker skills.
6. Run full package, static, collaboration, browser, scale, and repository
   closure. Do not ship any fallback.

Start Gates:

| Gate                               | Applies | Evidence                                                                                                                        |
| ---------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Prompt requirements captured first | yes     | all named skills, all candidates, pre-Comments timing, perfect-score rule, before/after, and planning boundary are in this plan |
| Source owners read                 | yes     | current Plite, Plate, four consumers, Comments, Vision, and prior plans mapped                                                  |
| Candidate scope fixed              | yes     | 15 repositories and two official platform references                                                                            |
| Helper stack fixed                 | yes     | autogoal, major-task, editor-audit, best-api, benchmark, plite-plan, plate-plan                                                 |
| Scale applicability                | yes     | source, node, subscription, read, update, and wake fan-out are hot repeated work                                                |
| Implementation authority           | no      | N/A: user requested the architecture decision before Comments, not production changes                                           |

Work Checklist:

- [x] Every explicit user requirement and stop condition was materialized
      before broad work.
- [x] Current Plite, Plate, consumer, and Comments owners were mapped first.
- [x] All 17 candidates have immutable provenance and source dossiers.
- [x] All 17 strict matrices validate; 85 atomic rows have zero integrity
      failures.
- [x] Prior renderer-registry, generic Projection, raw Plate rendering,
      `renderSegment`, and per-Editable decorate proposals were rejudged.
- [x] `best-api` selected one hard-cut call shape and closed ten binary gates.
- [x] The exact target call shape passes strict contextual inference.
- [x] Frozen normal, large, stress, and pathological current/target cohorts
      pass timing, fan-out, cleanup, ordering, identity, and zero-callback guards.
- [x] Multiple sources and stores compose by source-local observation with no
      combined provider.
- [x] Keep/cut verdicts are explicit for decorate, raw Plite renderers, Plate
      plugin render slots, Projection, store binding, and Comments.
- [x] Plite and Plate plans agree on one owner graph and mandatory execution
      order.
- [x] Find, Markdown preview, code highlighting, Yjs, Comments, static,
      collaboration, docs, exports, release, and generated owners are named.
- [x] Release classification is planning-only here; execution requires package
      changesets, a registry changelog, barrels, and generated registry output.
- [x] No package typecheck/build/browser claim is made for unimplemented code;
      exact future owners and commands are in both layer plans.
- [x] External evidence, facts, inference, recommendation, rejected options,
      blast radius, and remaining risk are separated.
- [x] Broad output was bounded or artifacted; accidental high-volume searches
      were narrowed before conclusions were recorded.
- [x] No unresolved design alternative remains for users to choose badly.

Completion Gates:

| Gate                   | Applies | Evidence                                                                                                 |
| ---------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| Candidate coverage     | yes     | manifest has 17 references; validator receipt has 17 matrices and 85 rows                                |
| Immutable provenance   | yes     | 15 clean pinned repository commits and two official-page hashes                                          |
| Public API score       | yes     | all ten target-design gates pass in `api-scorecard.md`                                                   |
| Contextual inference   | yes     | strict TypeScript probe exits zero with source hash receipt                                              |
| Runtime scale contract | yes     | production manager reports `production-scales` for all four cohorts                                      |
| Correctness guard      | yes     | attrs, order, wrappers, unchanged identity, cleanup, affected-only wakes, and zero segment calls pass    |
| Layer plans            | yes     | Plite and Plate plans contain one target, cuts, slices, proof, risks, and Comments gate                  |
| Release classification | yes     | planning-only artifact now; published implementation requires breaking changesets and registry changelog |
| Browser/package proof  | no      | N/A for planning-only changes; mandatory production commands and routes are recorded in linked plans     |
| Commit/PR/tracker      | no      | N/A: no authorization and no external tracker owns the request                                           |
| Final mechanical check | yes     | run after formatting and receipt refresh                                                                 |

Phase / pass table:

| Phase                         | Status         | Evidence                                                  |
| ----------------------------- | -------------- | --------------------------------------------------------- |
| Intake and current-state map  | complete       | requirements and current owners recorded                  |
| External architecture audit   | complete       | 17 dossiers and strict matrices                           |
| Options and hard-cut decision | complete       | audit report, rejections, and owner graph                 |
| API pressure                  | complete       | 10/10 target-design score and inference proof             |
| Scale pressure                | complete       | matched four-cohort benchmark and correctness guard       |
| Layer planning                | complete       | decision-ready Plite and Plate/Comments plans             |
| Planning verification         | complete       | artifact checks and mechanical goal checks recorded below |
| Production implementation     | not_applicable | outside this planning goal; exact next owners are named   |

## Recorded recoveries

| Failure                                                         | Recovery                                                                                                  |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| A zsh loop variable named `path` replaced zsh command lookup    | renamed it and reran the bounded provenance loop                                                          |
| Existing Lexical/Tiptap clones had diverged histories           | preserved them and created clean dedicated audit clones                                                   |
| Existing Portable Text/Slate clones contained user files        | preserved them and created clean dedicated audit clones                                                   |
| One broad source search emitted generated/minified output       | narrowed to one repository and exact source owner at a time                                               |
| Direct temporary-file cleanup was blocked                       | streamed official responses directly into SHA-256 instead                                                 |
| TypeScript inherited a repository config despite explicit flags | added `--ignoreConfig`; the strict probe then passed                                                      |
| Initial timing included unequal harness setup work              | made retained subscriptions real and timed matched operations; budgets and target design stayed unchanged |

Verification evidence:

- `node docs/plans/artifacts/rendering-api-editor-audit/generate-matrices.mjs`
  returns `{ references: 17, matrices: 17, rows: 85 }`.
- `bun docs/plans/artifacts/rendering-api-editor-audit/benchmark-decoration-manager.mjs`
  returns `production-scales`; every cohort and correctness row passes.
- `pnpm exec tsc --ignoreConfig --strict --noEmit --skipLibCheck --target ES2022 --module NodeNext --moduleResolution NodeNext docs/plans/artifacts/rendering-api-editor-audit/decoration-api-inference.ts`
  exits zero.
- JSON receipts parse, benchmark/generator scripts pass syntax checks, the
  audit registry resolves all artifact paths, and the final mechanical plan
  checks are the last closure command.
- No browser or production-package proof is claimed because no product source
  changed.

Reboot status:

- Audit and design are complete. The first implementation owner is the linked
  Plite plan. Plate follows only after the production Plite receipt passes.
  Comments follows only after the Plate hard cut and four consumer migrations
  pass.

Open risks:

- Disposable performance proves the ownership/scaling law, not native DOM
  integration. Production native editing, source replacement, static/Yjs, and
  multi-Editable proof remains fail-closed.
- Legacy comment anchor extraction may uncover orphan or discontinuous data.
  The Plate plan requires explicit diagnostics and an atomic migration rather
  than a runtime fallback.
- EditContext and Open UI are experimental/proposal-level inputs. They confirm
  boundaries but are not dependencies.

Final handoff contract:

- Recommendation: accept the target and execute Plite first.
- Confidence: high for the public boundary and scale law; production adoption
  remains unearned until linked proof passes.
- Evidence: audit report, 17 matrices, 10/10 target score, strict inference,
  and four-cohort benchmark.
- Browser proof: deferred by design to production routes in the Plate plan.
- PR/tracker: none; planning artifacts remain local.
- Next owner: `plite-plan --deep`, then `plate-plan --deep`, then Comments.
