# Plite normalization lifecycle architecture

Objective:
Define Plite normalization lifecycle architecture; done when score >= 0.92,
every pass and proof gate closes; plan
docs/plans/2026-07-12-plite-normalization-lifecycle-architecture.md.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-07-12-plite-normalization-lifecycle-architecture.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Completion threshold:
- Decide whether transaction-end normalization, `withoutNormalizing`, and
  explicit intermediate flushes need an API/runtime redesign; every public and
  internal target must have live-source evidence, an adoption answer, and a
  focused regression-proof route.
- Plite Plan closure is legal only when score >= 0.92, no dimension is below
  0.85, every pass row is complete or intentionally skipped with evidence,
  issue/reference sync rows are closed, final handoff is emitted, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plite-normalization-lifecycle-architecture.md` passes.

Verification surface:
- Live source audit of Plite transaction, normalization, selection, operation,
  collaboration, and representative Plate call sites; focused existing tests;
  plan-template mechanical check; later execution commands named per owner.
- Planning-only checks run in `plate-2`; any Plite source/runtime/browser/API
  claim must cite and verify the live `Plate repo root` workspace command.

Constraints:
- Planning only during this goal; no implementation before explicit acceptance.
- Prefer a hard-cut coherent lifecycle over compatibility aliases or feature-
  package normalization folklore.
- Preserve ordinary transaction performance, nested transaction semantics,
  selection correctness, operation replay, and collaboration determinism.
- Plite Plan may edit planning, research, issue-ledger, and PR-reference
  artifacts only. Plite implementation belongs to accepted-plan execution
  after user review.

Boundaries:
- Editable: this plan and other planning/research/reference artifacts explicitly
  required by later passes. Read-only audit: Plite packages, Plate consumers,
  tests, examples, VISION, relevant doctrine, and `origin/main` history.
- Allowed edit scope: `docs/plans/**`, `docs/research/**`,
  `docs/plite-issues/**`, `docs/plite/ledgers/**`,
  `docs/plite/references/**`.

Blocked condition:
- Block only if the current checkout cannot establish transaction/normalization
  behavior and no focused test, history, or owner source can resolve it after
  three distinct attempts.
- Do not use blocked while any research, review, ledger, source-grounding,
  score-hardening, or plan-hardening move remains runnable.

Plite Plan lane state:
- plite_plan_lane_status: ready-for-review
- current_pass: closure-score-and-final-gates
- current_pass_status: complete
- next_pass: user-review
- next_action: stop for user review; implementation requires explicit acceptance and a later `plite-plan` execution invocation against this plan
- final_handoff_status: emitted-in-final-response

Current verdict:
- verdict: rearchitect
- confidence: 0.95 after issue-sync accounting; score threshold met but closure gates remain
- keep / cut / revise call: keep automatic outer-transaction normalization;
  make its canonical result independent of explicit/implicit entrypoint and make
  every fast path extension-aware; cut public scheduler flags, `tx.normalize`,
  public `tx.withoutNormalizing`, and public exactness bypasses; drop the proposed
  `afterNormalize` finalizer; expose only top-level
  `editor.update.value.repair()` for intentional all-root repair; keep dirty and
  trusted scheduling mechanisms internal
- reason: Plite correctly preserves atomic draft reads until commit, but current
  fast-path eligibility ignores registered extension normalizers and automatic
  normalization applies weaker rules than explicit normalization. Feature
  packages compensate with `force:false`; a new lifecycle callback would hide
  that engine bug rather than fix it.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every Plite Plan
  completion gate below is satisfied and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plite-normalization-lifecycle-architecture.md` passes.
- Do not create hook state for this goal. This
  file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | User invoked `plite-plan`; full `plite-plan` and required `autogoal` instructions read before architecture work |
| Active goal checked or created | yes | `get_goal` returned none; goal `019f4d13-4361-7bf0-b28b-33494d78a4bd` created for this plan |
| Source of truth read before edits | yes | Root `VISION.md`, `docs/vision/plite.md`, `docs/plite/agent-start.md`, Plate-boundary doctrine, live Plite runtime/tests/docs, and upstream Slate source read |
| `docs/solutions` checked for non-trivial existing-code work | yes | Focused normalization/transaction search found the pass-level `shouldNormalize` and transaction-migration records for targeted follow-up |
| Live `Plate repo root` grounding needed for current-state claims | yes | Current pass reads `packages/plite` runtime and representative Plate consumers from `/Users/zbeyens/git/plate-2` |

Work Checklist:
- [x] Short objective plus lane outcome, full pass schedule, one-pass-per-
      activation policy, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] One-pass-per-activation policy respected; current-state, related-issue,
      issue-ledger, and intent/boundary passes each completed in separate
      activations.
- [x] Live source grounding recorded for every current implementation claim, or
      marked N/A with reason.
- [x] Issue ledger / ClawSweeper pass applied: eight exact issues hydrated on
      2026-07-12; claim widths checked against current code, coverage matrix,
      fork dossier, PR reference, and focused normalization proof; authoritative
      lifecycle sync repairs stale `#3950`, `#4641`, and `#2039` metadata and
      preserves only the existing `#3950`/`#5811` claims.
- [x] Research and ecosystem synthesis complete for Lexical, ProseMirror,
      Tiptap, upstream Slate, React, current Plite/Plate paste owners, history,
      and Yjs; every mechanism ends in a steal/reject/target decision and the
      required dirty-runtime/bulk-replace/extension-hook hybrid is accepted with
      explicit owner boundaries.
- [x] Intent/boundary record and decision brief complete: Plite owns automatic
      canonical closeout, Plate cannot choose normalization policy, and
      full-document import/repair,
      normalizer authoring, schema policy, and plugin invariants remain separate
      owners.
- [x] Scorecard recorded with evidence; weighted score 0.95 and no dimension
      below 0.85; revalidation remains required at closure.
- [x] Applicable implementation-skill review matrix applied or skipped with
      concrete reason; performance applies, TDD is an execution gate, and
      React/shadcn lenses are N/A for the headless-core plan.
- [x] Plite maintainer objection ledger complete for every breaking/paradigm
      change; steelman pressure dropped `afterNormalize`, exposed extension-blind
      fast paths, unified canonical semantics, and internalized trusted authority.
- [x] Verification workspace gate recorded for every Plite source, runtime,
      browser, package, public API, or issue-fix claim; planning claims use live
      source, focused existing proof, and artifact checks, while target runtime
      claims remain explicit accepted-plan execution gates.
- [x] TDD N/A for this planning-only goal: no behavior or implementation source
      changed. Accepted-plan execution starts phase 1 with the named red runtime
      and public-type contracts.
- [x] Browser proof N/A for this planning-only goal: no browser implementation
      or visible behavior claim was changed. Chromium IME/selection/Yjs plus a
      dedicated normalization-lifecycle fixture are mandatory execution gates.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Score recalculated to 0.9465/0.95; focused normalization proof passes 14/14; three planning artifacts pass whitespace checks; contradiction/current-state audit passes; autogoal `check-complete` passes |
| Plite source, runtime, browser, package, public API, or issue-fix claim | yes | Record live `Plate repo root` command/proof or mark as planning-only with reason | Current-state and existing `#3950`/`#5811` claims verified from live source and focused Plite proof; all proposed runtime/API/browser results are explicitly unimplemented execution gates, not present-tense claims |
| Issue ledger or PR reference changed | yes | Sync the relevant ledger/reference row or record why no sync applies | All eight issues rehydrated live and remain open; authoritative lifecycle accounting added to `gitcrawl-v2-sync-ledger.md` and `issue-coverage-matrix.md`; `#3950`/`#5811` claims preserved, six adjacent issues narrowed to related/non-claim; fork dossier and PR reference require no change |
| Autoreview for uncommitted implementation changes | no | N/A for planning-only/no implementation patch | Only plan/provenance artifacts changed; architecture was pressure-tested through dedicated revision, maintainer-objection, high-risk, and ecosystem passes |
| Final user-review handoff | yes | Emit final handoff or keep the plan pending with the next pass | Complete grouped decision handoff is emitted in the final response; implementation remains stopped pending explicit acceptance |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plite-normalization-lifecycle-architecture.md` | Passed from `/Users/zbeyens/git/plate-2` after every checklist, gate, and phase row closed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | Live runtime, public types, docs, tests, seven call sites, and upstream Slate lifecycle audited; initial score 0.75 | related issue discovery |
| Related issue discovery | complete | Prior normalization/transaction plans reconciled; candidate issues `#2355`, `#3465`, `#3950`, `#5811`, `#4641`, `#4701`, `#3275`, and `#2039` identified with conservative claim width | issue-ledger pass |
| Issue-ledger pass | complete | ClawSweeper archive-first pass; eight live-open issues hydrated; `#5811` sync-ledger mismatch repaired; 14/14 focused normalization tests pass | intent/boundary pass |
| Intent/boundary and decision brief | complete | Provisionally chose staged `afterNormalize`; later maintainer pressure rejected it. The durable output is the Plite/Plate/runtime/selection/collaboration/docs ownership map and rejection of imperative public flushes | research refresh |
| Research, ecosystem strategy, live-source refresh | complete | Fetched current upstream refs; audited primary source/docs for Lexical dirty transforms, ProseMirror append transactions, Tiptap plugin usages, Slate exit normalization, React Effects, Plite bulk replace, Plate paste hooks, history, and Yjs; target retained | pressure passes |
| Performance/DX/migration/regression/simplicity pressure passes | complete | Complete public/internal inventories; a provisional narrow finalizer was later rejected; separated trusted replay/import from normal authoring; defined cohorts, budgets, migration phases, and regression commands | objection ledger |
| Plite maintainer objection ledger | complete | Steelman antithesis rejected the one-caller finalizer; live Layout probe proved registered normalizers are skipped by the default fast path; target revised to extension-aware, semantically equivalent automatic normalization with direct Footnote intent and internal trusted authority | high-risk pass |
| High-risk deliberate mode | complete | Refined canonical equivalence to canonical pre-state transactions; cut scheduler fields from public normalizer contexts; constrained operation hints to the first pass of one authored op/root; proved stale dirty paths after public normalization bypass; defined six failure scenarios, blast radius, proof matrix, hard-cut rollback, and adoption/docs answers | ecosystem maintainer pass |
| Ecosystem maintainer pass | complete | Rejected forcing 43 black-box package tests through Plite internals; added top-level-only all-root `editor.update.value.repair()` for raw initial values/dynamic normalizers/tests; fixed Plite/Core/Diff/Plate/docs ownership; retained zero transaction-local flushes and private trusted authority | revision pass |
| Revision pass | complete | Removed superseded lifecycle decisions; froze public and internal names, Diff single-transaction trusted adoption, open-question dispositions, executable verification commands, final handoff content, and score 0.95 | issue sync accounting |
| Issue sync accounting | complete | Eight issues rehydrated live; sync-ledger classification overlay repairs stale metadata; coverage matrix records the frozen plan; fork dossier and PR prose remain exact; no claim widened | closure score and final gates |
| Closure score and final gates | complete | Requirement-by-requirement audit closed planning, workspace, TDD, Browser, issue-sync, autoreview, score, mechanical, and handoff gates; focused proof 14/14; score 0.95; check-complete passes | final handoff |

Pass policy:
- Run exactly one scheduled pass per user activation. This activation owns only
  `Closure score and final gates`; all scheduled passes are complete.

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.91 | No new phase, callback, queue, or commit; default fast paths remain; 1/8/32-normalizer and large-dirty cohorts plus IME interaction budgets cover the conservative extension gate |
| Plite-close unopinionated DX | 0.20 | 0.96 | Ordinary writes close canonically; normalizer contexts lose scheduler fields; the sole exceptional API is top-level all-root `value.repair()`, unavailable on `tx` |
| Plate and collaboration migration backbone | 0.15 | 0.95 | Suggestion/Layout flushes delete; Footnote owns its target; 43 package fixtures and Core initialization use public repair; Diff alone uses private trusted replay; docs have direct owners |
| Regression-proof testing strategy | 0.20 | 0.95 | High-risk matrix plus public-repair outer-only/all-root/no-op/rollback/dynamic-extension rows cover the ecosystem-final target |
| Research evidence completeness | 0.15 | 0.96 | Primary sources, exact inventories, 14-file normalizer audit, Layout/Footnote/raw-initial/trusted-dirty probes, dynamic-extension/type/package ownership reads, and operation-hint tracing map to target laws |
| shadcn-style composability and minimalism | 0.10 | 0.96 | Objection pressure deleted the proposed lifecycle API; one automatic law replaces scheduler controls and feature punctuation |

Current weighted score:
- `(0.20 * 0.91) + (0.20 * 0.96) + (0.15 * 0.95) + (0.20 * 0.95) +
  (0.15 * 0.96) + (0.10 * 0.96) = 0.9465`, reported as 0.95 after revision.
  Threshold is met, but sync and final proof gates remain mandatory.

Source-backed architecture north star:
- target shape: one outer transaction owns one automatic dirty-path fixpoint
  before commit. Dirty and full-repair modes choose scope, never different
  canonical semantics; operation hints and fast paths are legal only when they
  prove installed extension normalizers cannot observe the skipped paths.
- source evidence: `packages/plite/src/core/public-state.ts:5020-5068` owns the
  automatic commit drain; `packages/plite/src/editor/without-normalizing.ts:12-38`
  proves nested public grouping does not drain inside a transaction;
  `packages/plite/src/interfaces/editor.ts:2370-2374` leaks engine options;
  `packages/plite/src/interfaces/editor.ts:930-933` and
  `packages/plite/src/core/public-state.ts:2733-2757` establish the existing
  update-context lifecycle-hook pattern through `afterCommit`.
- rejected drift: feature packages manually choosing dirty versus full passes;
  public docs teaching `tx.withoutNormalizing` inside an already atomic update;
  automatic normalization on arbitrary reads.
- migration posture: hard cut public flags and redundant calls; preserve a
  private dirty-path drain for Plite internals; make Footnote create/select its
  intended trailing text directly; delete end-of-transform flushes after the
  extension-aware closeout fix; expose all-root `value.repair()` only as a
  top-level maintenance update; keep trusted replay/value replacement internal.

Current-source inventory:
| Surface | Current shape | Evidence | Initial finding |
|---------|---------------|----------|-----------------|
| Outer update | Drains dirty paths after callback, before commit | `packages/plite/src/core/public-state.ts:5020-5068` | Keep |
| Draft visibility | Normalizers do not run during ordinary update callback | `packages/plite/test/transaction-contract.ts:338-397` | Keep atomicity |
| Public normalize | `tx.normalize(options?)` exposes `explicit`, `force`, `operation` | `packages/plite/src/interfaces/editor.ts:809`, `:2370-2374` | Cut scheduler options |
| Public grouping | `tx.withoutNormalizing` toggles normalizing but returns without drain when already transacting | `packages/plite/src/editor/without-normalizing.ts:12-38` | Public story likely redundant |
| Extension fast path | `canSkipDefaultTopLevelStructuralNormalize` trusts default runtime function identity, but default `normalizeNode` dynamically runs registered extension normalizers | `packages/plite/src/core/public-state.ts:406-426,4759-4803`; `packages/plite/src/core/normalize-node.ts:424-466`; extension registry | Incorrectly skips Layout/Suggestion normalizers |
| Canonical semantics | Automatic normalization uses `explicit:false`; explicit dirty normalization uses `explicit:true`, enabling broader inline cleanup | `packages/plite/src/editor/normalize.ts:67-76`; `packages/plite/src/core/normalize-node.ts:260-333` | Entry point changes result, so feature flushes compensate |
| Raw initial state | `createEditor({initialValue})` preserves invalid structure; current full-root normalize repairs it; `editor.extend` can add normalizers after state exists | live empty-block probe; public extension surface; 43 fixture calls | Legitimate outer repair owner exists |
| Plate consumers | Seven `force:false` calls: five end-of-transform, one footnote dependency, one Plite iterative unwrap | exact `rg` inventory recorded in Findings | Five cuts; two distinct proof owners |
| Public docs | Teach `tx.withoutNormalizing` inside `editor.update` and vaguely expose `tx.normalize(options?)` | `content/docs/plite/concepts/11-normalizing.mdx:94-125`; `content/docs/plite/api/transforms.mdx:400-407` | Docs mirror lifecycle ambiguity |
| Upstream Slate | `withoutNormalizing` restores the flag and immediately calls `Editor.normalize(editor)` | `../slate/packages/slate/src/editor/without-normalizing.ts:3-16` | Explains why old Plate did not need explicit post-group flushes |

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| Normal update | `editor.update((tx) => writes)`; automatic dirty-path fixpoint before commit | No normalization ceremony | keep current lifecycle | current outer transaction and atomicity test | provisional keep |
| Intermediate canonical state | No public lifecycle hook | Commands must create any target required by later work; canonical structure otherwise becomes observable only after the outer update returns | drop proposed `afterNormalize`; Footnote inserts/selects the next text target directly | exactly one inventoried caller; `tx.nodes.get/insert` and selection APIs can express its intent | chosen cut |
| Intentional full repair | `editor.update.value.repair()`; scans every document root; rejects invocation inside an active update; absent from `tx.value` | Raw `initialValue`, dynamically installed normalizers, diagnostics, and black-box normalizer tests have one explicit intent API | replaces public `normalize({force:true})`; 43 fixture calls and Core `shouldNormalizeEditor` migrate directly | current raw initial-value probe, dynamic `editor.extend`, test inventory, primary-root doctrine | chosen add/rename |
| Grouping | Remove public `tx.withoutNormalizing`; keep private normalization suppression only inside engine/low-level transforms | `editor.update` is the only public atomic grouping boundary | hard cut docs/callers; migrate redundant callback uses to ordinary tx blocks | current early return plus atomicity test | chosen cut |
| Normal update options | Remove public `skipNormalize`; retain private transaction suppression for engine-owned reentry | Normal authoring cannot bypass closeout | split public `EditorUpdateOptions` from internal transaction options | exported type and zero external direct `skipNormalize` callers | chosen cut |
| Replay/value replacement | Public calls always use normal canonical closeout; trusted replay/replace exists only in repo-owned internal infrastructure | No public bypass can leak dirty paths or non-canonical committed state | seven Diff calls and Core initialization move to explicit internal owners | every known production opt-out is internal; public docs already describe replay as sharing normalization | chosen cut/revise |
| Normalizer context | `{ entry, editor, tx, next({ fallbackElement? }) }`; no `explicit`, `force`, or `operation` | Extension authors declare invariants, not scheduler policy or trigger-dependent validity | hard cut unused fields from node/root normalizer args; retain `fallbackElement` middleware override | 14 normalizer files/22 slots; zero production reads of scheduler fields; one test uses `fallbackElement` | chosen cut |

Frozen public and internal API names:
| Visibility | Frozen shape | Contract |
|------------|--------------|----------|
| public update | `editor.update((tx) => { ... })` | The callback observes the draft; outer return performs one automatic canonical closeout and one publication |
| public value replace | `editor.update.value.replace(input, options?)` and `tx.value.replace(input)` | Remove `normalize`; public replacement always joins canonical closeout |
| public repair | `editor.update.value.repair()` | Argument-free, outer-only, all-root maintenance transaction; absent from `tx.value` |
| public replay | `tx.operations.replay(operations, { tag? })` | Remove `normalize`; public replay always joins canonical closeout |
| public normalizer | `normalizers.node({ entry, editor, next, tx })` and root equivalent | `next` may override only `fallbackElement`; no scheduler fields |
| internal dirty settlement | `settleDirtyRoot(editor, { root, operationHint? })` | Private fixpoint for one root; the hint is first-pass-only and single-authored-operation-only |
| internal whole-value repair | `repairEditorValue(editor)` | Private deterministic primary-then-sorted-additional-root engine behind public repair |
| internal trusted transaction | `runTrustedUpdate(editor, fn, options?)` | Export only from `@platejs/plite/internal`; owns the whole transaction and isolates/clears touched-root dirtiness before publication |
| internal transaction kernel | `runEditorTransaction(editor, fn, options?)` | Remains the shared primitive; public option types cannot express trusted or skip-normalization authority |

Frozen adoption shape:
```ts
editor.update((tx) => {
  tx.operations.replay(operations, { tag });
});

editor.update.value.replace(input, options);
editor.update.value.repair();

normalizers: {
  node({ entry, editor, next, tx }) {
    next({ fallbackElement });
  },
}
```

Diff collapses its three current `update.withoutNormalizing` transactions into
one internal transaction:
```ts
runTrustedUpdate(nodesEditor, (tx) => {
  mergeDiffTexts(tx);
  splitDiffTexts(tx);
  changeTracking.commitChangesToDiffs(tx);
});
```
Core uses the same trusted owner only for infrastructure replacement. Its
`shouldNormalizeEditor` path invokes public `editor.update.value.repair()`
after trusted initialization. No public `exact`, `trusted`, `skipNormalize`, or
`normalize` mode survives.

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| Commit scheduler | outer `runEditorTransaction` | drain pending dirty roots to one canonical fixpoint, classify, and publish once; no staged public work | public force/explicit policy, repeated rounds, and callback machinery | current transaction source plus single-publication contracts | revise |
| Fast-path eligibility | transaction/extension registry | disable default structural/text skips whenever registered normalizers may observe affected dirty paths; start conservatively with any registered normalizer disabling the skip | extension normalizers silently not running | live Layout probe plus registry/runtime source | revise |
| Canonical rules | normalization engine | from a canonical pre-state, dirty closeout after a transaction equals full repair after that transaction; unrelated invalid pre-state nodes remain outside dirty scope | explicit-vs-implicit semantic split without pretending dirty scope repairs unrelated legacy invalidity | Suggestion failures plus built-in inline normalization source | revise |
| Operation hint | private dirty-root scheduler | explicit `{ root, operationHint? }`; hint exists only for the first pass when exactly one authored content operation touched that root, then clears after any repair mutation | latest-operation leakage across compound/generated dirty paths | `latestContentOperationByRoot`, persistent loop option, zero production normalizer consumers | revise |
| Intermediate drain | normalization engine | private dirty-path fixpoint operation used by the scheduler and rare internal iterative algorithms | leaking `force:false` | current `normalize` implementation and unwrap call | make internal |
| Full repair | normalization engine plus public value lifecycle | private `repairEditorValue` backs top-level `editor.update.value.repair()`; no tx method and no scope/options booleans | boolean mode soup, package tests importing internals, and mid-update flushes | current `force` branch, 43 fixtures, raw initial-value probe | revise/add intent entrypoint |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| Update lifecycle | `editor.update((tx) => { ... })` | One callback, one unnormalized draft, one canonical return boundary; no post-normalize authoring phase | No React state/subscription, queue, second dirty pass, or extra commit | current atomicity contract and objection pressure | chosen keep/minimize |

Plate migration-backbone target:
| Pressure | Plite substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| End-of-transform calls | extension-aware canonical commit drain | delete Layout and four Suggestion calls only after fast-path eligibility and canonical-equivalence fixes | no per-plugin normalization wrapper | five exact calls; live Layout probe; Suggestion 101-test prior experiment | chosen cut after engine fix |
| Inline-void caret | ordinary transaction intent | Footnote uses existing next text when present, otherwise inserts an empty text target beside the reference, then selects it before closeout | no generic selection normalizer or lifecycle hook | `insertFootnote.ts`, built-in spacer law, `tx.nodes.get/insert`, focused caret rows | chosen direct migration |

Collaboration migration-backbone target:
| Pressure | Plite substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| Commit determinism | normalization completes before one commit is published | Yjs consumes final operation list/commit, not intermediate draft publication | no Yjs-specific normalization API | transaction commit owner plus `packages/yjs/src/core/controller.ts` commit consumption | chosen keep; accepted-plan execution proof gated |
| Explicit repair | all roots repair inside one maintenance transaction | history metadata skips undo capture; Yjs receives the one repair commit so peers converge | no local-only repair or per-root public commits | history metadata and heterogeneous-root commit owners | chosen; execution proof gated |

Intent / boundary record:
- intent: make canonicalization a transaction-runtime responsibility rather
  than feature-package punctuation, and require commands to express their own
  immediate selection targets instead of scheduling work around repair timing.
- outcome: ordinary updates always commit the same canonical state as full
  repair over the affected roots, with zero manual normalization calls or public
  pre-commit phase; engine scheduling and trusted authority are private.
- in-scope: dirty-path fixpoint scheduling, outer/nested update lifecycle,
  pre-commit dependent work, root binding, selection after repair, rollback,
  operation/commit ordering, internal iterative transforms, public hard cuts,
  Plate migration, docs, tests, performance, history, and Yjs consequences.
- non-goals: schema DSL or validation veto; generic selection normalization;
  custom empty-text factories; normalizer plugin authoring beyond cutting unused
  scheduler fields; automatic initial-value
  import/default-root policy; changing built-in document constraints; React
  subscriptions/rendering; implementing before plan acceptance; compatibility
  aliases; preserving migrated call shapes merely because they exist.
- decision boundaries: Plite transaction runtime owns when normalization
  executes; Plite normalization engine owns dirty/full
  algorithms and loop guards; Plite selection owns selection operations but not
  a generic selection-normalizer hook; Plite value lifecycle owns explicit
  all-root repair; Plate features cannot invoke or configure repair/normalization
  inside commands; history/Yjs/React/DOM see
  only the final single commit; docs teach only the target lifecycle.
- unresolved user-decision points: none. Maintainer pressure removed the staged
  API; remaining passes pressure correctness, blast radius, and proof, not a
  user taste choice.

Plite / Plate boundary map:
| Surface | Owner | Target law | Explicit non-owner |
|---------|-------|------------|--------------------|
| Dirty-path collection and fixpoint drain | Plite normalization engine | Private deterministic mechanism with operation/root context | Plate features |
| Update callback, nested update, rollback, pre-commit phases | Plite transaction runtime | One outer authority and one eventual commit | Plate plugin wrappers |
| Intermediate dependent work | Command owner | Create and target the required node during the ordinary transaction | Generic pre-commit lifecycle hook |
| Selection beside structural repair | Plite selection operation plus caller intent | Caller inserts/selects its concrete target; normalization preserves/maps it | Generic selection-normalizer hook |
| Internal iterative unwrap | Plite transform engine | Private drain or algorithm rewrite with focused proof | Public API justification |
| Feature invariants and commands | Plate packages | Use ordinary tx writes and create any concrete selection target they need | Normalization policy or lifecycle staging |
| Raw/dynamically extended value repair | Plite value lifecycle | Outer-only `editor.update.value.repair()` repairs all roots; automatic initial-value policy remains under `#3465` | Normal feature transaction and `tx.value` |
| History, Yjs, DOM, React listeners | Their Plite substrate packages | Consume one final commit after canonical closeout | Intermediate draft observation |
| Docs/examples | Plite docs for lifecycle; Plate docs for feature commands | Teach zero normalization ceremony; commands create concrete targets | Migration/changelog prose and staged examples |

Ecosystem maintainer ownership review:
| Consumer | Allowed surface | Forbidden dependency | Adoption answer | Verdict |
|----------|-----------------|----------------------|-----------------|---------|
| Ordinary Plite/Plate command | `editor.update` and `tx` writes; automatic canonical closeout | normalize/group/repair calls inside the transaction | delete five feature flushes and 20 grouping wrappers | keep simple |
| Raw initial value or dynamically installed normalizer | outer `editor.update.value.repair()` after installation/loading | `tx.normalize`, main-root key, internal repair import | Core `shouldNormalizeEditor` and qualified callers rename directly | add public intent API |
| Package normalizer behavior test | public `editor.update.value.repair()` against invalid fixture | `@platejs/plite/internal` just to exercise public plugin behavior | 43 fixture calls stay black-box | public-test owner |
| Plite engine unit test | private `repairEditorValue`/`settleDirtyRoot` | public API as a substitute for internal phase assertions | only engine mechanics use internal helpers | internal-test owner |
| Diff transform engine | `@platejs/plite/internal` trusted whole-transaction replay | public replay bypass or raw transaction snapshot access | seven calls move behind one Diff-owned adapter | private trusted owner |
| Core initial transform pipeline | private trusted value replacement followed by optional public repair | public `normalize:false` or tx flush | two trusted replacements plus `shouldNormalizeEditor` repair | split trusted/repair owners |
| History/Yjs/React/DOM | final commit only | draft/repair phase observation | one repair maintenance commit; history skip; collaboration publish | consumer-only |
| Public docs/examples | automatic updates plus one repair reference subsection | migration prose, scheduler booleans, feature repair examples | remove normalize/group/bypass examples | latest-state owner |

Decision brief:
- principles: atomic draft writes; canonical state before publication; runtime
  owns scheduling; APIs name user intent rather than engine strategy; one
  transaction produces one commit or rolls back completely; deletion beats
  compatibility.
- top drivers: remove seven visible migration scars and future cargo cults;
  preserve Footnote’s real pre-selection dependency; keep ordinary updates
  cheap; prevent normalizer recursion; retain deterministic history/Yjs/DOM
  observation; make misuse obvious to humans and agents.
- viable options:
  1. Keep `tx.normalize(options)` and public `withoutNormalizing`.
  2. Keep only bare imperative `tx.normalize()` as a dirty-path flush.
  3. Add synchronous `tx.withNormalizedState(fn)` around an imperative drain.
  4. Add staged `afterNormalize` to `EditorUpdateContext` and keep drains private.
  5. Normalize automatically before reads or selection writes.
  6. Repair the automatic boundary and add outer-only all-root
     `editor.update.value.repair()` for intentional maintenance.
- chosen option after ecosystem pressure: option 6. Extension normalizers
  participate automatically; dirty/full scopes share canonical rules; commands
  create concrete targets; raw/dynamically extended values retain a black-box
  repair owner without exposing transaction-local scheduling.
- rejected alternatives: option 1 leaks scheduler booleans and has already
  produced cargo-cult calls; option 2 still permits meaningless end flushes;
  option 3 exposes timing/cost and falsely suggests state stays normalized while
  the callback mutates; option 5 adds hidden work to reads/selection and breaks
  predictable draft semantics.
- consequences: public `tx.normalize`, `EditorNormalizeOptions`, public
  `tx.withoutNormalizing`, update `skipNormalize`, replay `normalize`, and value
  replace `normalize` disappear; outer `editor.update.value.repair()` is added;
  no new lifecycle hook or tx repair method exists; ordinary Plate callers
  delete code; Footnote creates its caret target; internal unwrap and trusted
  infrastructure use private named owners.
- follow-ups: ecosystem comparison, complete public/internal call inventory,
  root semantics, extension-aware fast paths, operation metadata, Yjs/history
  proof, docs examples, migration order, high-risk pressure, and final proof.

Automatic canonical-closeout contract:
| Rule | Target semantics | Proof required |
|------|------------------|----------------|
| Draft boundary | Update callbacks read the unnormalized draft; canonicalization starts only when the outer callback returns | existing atomicity plus nested-update tests |
| Extension participation | A registered normalizer disables any structural/text skip that cannot prove it irrelevant; conservative baseline is no skip when any normalizer is registered | Layout one/two-op regression, Suggestion typing/accept/reject/delete rows, fast-path unit tests |
| Semantic equivalence | Starting from a canonical pre-state, automatic closeout after a transaction equals full-root repair after the same transaction. On an invalid pre-state, dirty closeout may leave unrelated invalid nodes untouched | differential/property fixtures across inline, block, plugin, and multi-root cases |
| Operation hints | Private scheduler receives an explicit root. A hint is legal only on pass 0 when exactly one authored content operation touched that root; compound roots and every pass after a repair mutation use no hint | one/multi-operation regressions, generated-repair trace, root trace |
| Normalizer authoring | Node/root normalizers receive invariant context only; `explicit`, `force`, and `operation` are absent; `next` may override only `fallbackElement` | type inference contracts and 14-file adoption audit |
| Failure | Normalizer errors roll back document, selection, marks, state patches, refs, operations, and hooks | rollback contract test |
| Final classification | Selection-only detection, dirty metadata, commit classes, snapshots, history, Yjs input, and listener payloads are computed after the fixpoint | transaction/history/Yjs contract tests |
| Publication | No snapshot, ref publication, listener, commit hook, DOM/React observer, or `afterCommit` handler sees the draft | listener/view/afterCommit ordering tests |
| Trusted internals | Internal Diff/Core trusted updates own the entire transaction, skip canonicalization deliberately, and clear/isolate dirtiness for every touched root before commit; normal public updates cannot enter this authority | Diff/Core internal contract and no-stale-dirty regression |
| Public repair | `editor.update.value.repair()` is outer-only and argument-free; repairs primary then lexicographically sorted additional roots in one rollback-safe maintenance transaction; history is skipped, collaboration sees one commit, unchanged state publishes nothing | raw-initial, dynamic-extension, all-root ordering, nested rejection, history/Yjs, no-op, and rollback tests |
| Performance | Editors without extension normalizers retain current fast paths; installed-normalizer cohorts meet relative budgets without adding a phase or allocation to default editors | focused microbenchmark and profile counters |

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| `#2355` selection normalization | `cluster-synced` / related; no closure claim | The target preserves a command-owned direct selection target through canonical repair but does not add the requested generic selection-normalizer hook | live-open issue hydrated 2026-07-12; Footnote inline-void caret regression plus Plite transaction/selection contract | existing status valid | none |
| `#3465` initial-value normalization | `not-claimed` | This plan adds explicit `value.repair()` for raw initial state but does not make `initialValue` normalize automatically or decide default import policy | live-open issue hydrated 2026-07-12; current `shouldNormalizeEditor` lifecycle option and raw-initial probe | existing status valid | existing non-claim preserved |
| `#3950` transformed-node rerun | preserve `fixes-claimed` | Lifecycle/API changes must not regress fixpoint rechecks | live-open issue hydrated 2026-07-12; focused normalization contract passes transformed-node rerun row | sync ledger, matrix, dossier, and PR reference agree | preserve `Fixes #3950` |
| `#5811` normalization loop exhaustion | preserve `improves-claimed` | Deterministic fixpoint failure improves diagnostics but cannot resolve conflicting app normalizers | live-open issue hydrated 2026-07-12; focused normalization contract passes oscillation row | sync ledger repaired to match matrix, dossier, and PR reference | preserve `Improves #5811` |
| `#4641`, `#4701`, `#3275`, `#2039` normalizer authoring cluster | `cluster-synced` or `not-claimed`; no new claim | Property updates, empty-text factory, path-only API, and named diagnostics are separate from transaction-local normalization visibility | all four live-open issues hydrated 2026-07-12; prior normalizer-extension plan and current target boundaries | existing conservative statuses valid | none |

Prior-plan reconciliation:
| Artifact | Prior decision | Current treatment | Why |
|----------|----------------|-------------------|-----|
| `2026-07-07-plate-next-without-normalizing-tx-sweep.md` | Strengthened public `withoutNormalizing` so callbacks receive the active `tx` | Provisional supersede; adoption inventory required | It solved nested-update misuse but assumed the grouping API itself should survive; current transaction semantics make that assumption questionable |
| `2026-07-10-plate-next-normalization-law-sweep.md` and usage ledger | Kept four Suggestion and one unwrap dirty-path flush after package/fixture proof | Suggestion verdict superseded; unwrap proof retained | Extension-blind closeout and the automatic/repair semantic split explain the feature failures. Suggestion flushes delete after the runtime fix; unwrap may retain private settlement only if 29 focused fixtures reject deletion |
| `2026-05-17-plite-normalizer-extension-dx-ralplan.md` | Normalizer-scoped tx explicitly excludes `normalize` and `withoutNormalizing`; repairs join the outer normalization transaction | Compatible constraint | Supports keeping scheduler recursion out of normalizer authoring API |
| `2026-07-12-plate-next-footnote-indent-juice-package-reviews.md` | Footnote needs dirty-path normalization before selecting normalizer-created trailing text | Superseded by direct target creation | The caret requirement is real, but the command can create/reuse and select the concrete next text before closeout; no intermediate canonical-state API is needed |
| `2026-07-12-plate-next-layout-link-legacy-list-package-reviews.md` | Added an end-of-transform dirty-path flush after width-normalization failure | Superseded by engine fix | Live one/two-operation probes traced the failure to an extension-blind automatic fast path; Layout does not own lifecycle punctuation |

Issue-ledger sync status:
- ClawSweeper related-issue pass: complete; archive-first workflow and exact
  live hydration used with gitcrawl `0.5.0`.
- generated live gitcrawl rows read: complete; all eight candidate issues remain
  open after exact rehydration completed at 2026-07-12T12:07:47Z.
- manual v2 sync ledger update: complete; the dated normalization-lifecycle
  overlay is authoritative over stale frozen-corpus metadata. It classifies
  `#3950` as core normalization rather than DOM selection, `#4641` as core
  normalizer pressure rather than React input, and `#2039` as a normalization
  diagnostic non-claim rather than docs noise.
- fork issue dossier update: no change; existing `#3950`/`#5811` sections carry
  the exact conservative decisions.
- issue coverage matrix update: complete; a normalization-lifecycle planning
  sync preserves `Fixes #3950` and `Improves #5811`, keeps `#2355`/`#4641`
  related, and records `#3465`/`#4701`/`#3275`/`#2039` as non-claims.
- PR description sync: no change; exact `#3950`, `#5811`, and `#3465` text is
  already present and this planning pass creates no new claim.

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Plite target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| Lexical | `facebook/lexical@74f0b086`; `LexicalUpdates.ts`; [Node Transforms](https://lexical.dev/docs/concepts/transforms) | Tracks intentionally/unintentionally dirty leaves/elements, repeats transforms to fixpoint, runs Root last, then performs one reconciliation | Update-listener waterfall, extra EditorState/history cycle, full-tree work | Dirty-region fixpoint before publication; explicit loop guard; one expensive reconciliation/commit | Node-class ontology, Root transform as command-local dependent-work API, consumer `skipTransforms` | Keep Plite dirty paths private and extension-aware; publish only after one canonical fixpoint | steal mechanism, reject API shape |
| ProseMirror | `prosemirror-state@ffad5d94`; `src/state.ts`; [PluginSpec.appendTransaction](https://prosemirror.net/docs/ref/#state.PluginSpec.appendTransaction) | Applies a root transaction, repeatedly offers plugins appended transactions with new state, maps selection through steps | Plugins editing stale pre-transaction state | Explicit final selection against updated document | Multiple transaction objects, repeated plugin calls, public filter/veto model, history/meta coordination | Commands create selection targets inside one Plite transaction; no appended/finalizer phase | reject transaction model after steelman |
| Tiptap | `ueberdosis/tiptap@edaac47e`; UniqueID, TrailingNode, PasteRule sources; [Extension API](https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new/extension) | Exposes ProseMirror plugins; real extensions use `appendTransaction` for IDs, trailing nodes, paste rules, and post-settle selection | Framework-specific post-processing gaps | Extension/plugin ownership for app paste rules and product invariants | Meta flags such as `addToHistory:false` and extension-specific loop suppression as normalization architecture | Keep paste transforms/input rules in Plate; do not add a general post-normalize hook | preserve Plate owner, reject appended repair transactions |
| Upstream Slate | `ianstormtaylor/slate@945a484d`; `without-normalizing.ts`; `normalize.ts` | `withoutNormalizing` restores the flag then immediately drains dirty paths; force remains an imperative advanced option | Invalid intermediate shapes between compound operations | Automatic normalization at the public grouping boundary | Carrying imperative `normalize(force)` and compatibility-shaped grouping into Plite’s longer transaction lifetime | Outer Plite update owns closeout; public compatibility controls are cut | keep behavior law, hard-cut old API |
| React | `facebook/react@c0c39a6b`; [useEffect](https://react.dev/reference/react/useEffect); [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) | Effects run after commit and may run after paint; state repair in an Effect restarts render/commit | Mixing external synchronization with render calculation | Keep editor canonicalization outside React and publish one final snapshot | `useEffect`/`useLayoutEffect` as document repair or selection-canonicalization path | Headless Plite pre-commit phase; React observes only final commit | reject React owner |
| Plite history/Yjs | `packages/plite-history/src/history-extension.ts`; `packages/yjs/src/core/extension.ts`; `controller.ts` | Both consume final `EditorCommit` operations/snapshot through `onCommit` | Direct observation of mutable draft state | Preserve a single complete operation list and snapshot | Extra repair commit or hidden post-commit mutation | Compute commit only after the canonical fixpoint | keep one-commit contract |

Required hybrid thesis:
| Lane | Decision | Current owner/evidence | Normalization-plan consequence |
|------|----------|------------------------|--------------------------------|
| Normal editing | Accept Lexical-style dirty runtime buckets/fixpoint | Plite dirty paths and `normalize.ts`; Lexical dirty leaves/elements | Keep dirty scheduling private, extension-aware, and semantically canonical |
| Large paste/fragment insert | Accept ProseMirror-style bulk replace/fitting | Plite `insert-fragment.ts` emits scoped `replace_children` operations with final selection | Preserve bulk replacement as its own transform/operation strategy; do not add staged callbacks |
| App paste rules | Accept Tiptap-style extension hooks at the product layer | Plate parser `transformData`/`transformFragment` and input-rule `insertData` owners | Keep paste rules in Plate; no post-normalize plugin hook |
| Hybrid boundary | Accept | All three lanes already have distinct owners | No unified normalization/paste mega-API; this plan changes only transaction-local canonicalization timing |

Adoption and migration inventory:
| Surface | Exact inventory | Target migration | Proof owner |
|---------|-----------------|------------------|-------------|
| Public grouping | 20 `tx`/`editor.update.withoutNormalizing` calls: 11 package production, 4 registry/app, 3 docs, 1 Plite forwarder, 1 test | Inline callback bodies into their existing outer update; remove the public forwarder and docs | package-focused behavior tests plus public type contract |
| Normalization calls | 59 total: 55 package calls and 4 docs; package set contains 43 test/fixture calls and 12 production/infra calls | Five feature end flushes delete after engine repair; Footnote creates its target; unwrap and commit stay private; 43 black-box fixtures and Core `shouldNormalizeEditor` use public `value.repair()`; engine-only tests use internals | Plite/package tests and docs typecheck |
| Public normalizer controls | `tx.normalize`, `setNormalizing`, `EditorNormalizeOptions`, and exported `EditorUpdateOptions.skipNormalize`; no authored `setNormalizing` call and no external direct `skipNormalize` caller | Hard cut public surface; split internal transaction/normalizer option types | export/type contract and repository `rg` gate |
| Normalizer callback scheduler fields | 14 files contain 22 normalizer slots; zero production normalizer reads `explicit`, `force`, or `operation`; one focused test forwards `fallbackElement` | Replace shared `EditorNormalizeNodeOptions` inheritance with minimal node/root contexts and a private scheduler input | normalizer type inference plus package typechecks |
| Current operation-replay bypass | Seven production Diff calls use `{ normalize:false }`; history, Yjs, React editing, tests, and docs use default replay | Public replay always follows canonical closeout; Diff uses one private `runTrustedUpdate` that isolates/clears replay dirtiness | Diff, history, Yjs, operation replay contracts |
| Current value-replacement bypass | Core initialization and initial-value transforms use `{ normalize:false }`; two docs examples teach it | Public replace always closes canonically; Core initialization uses private `runTrustedUpdate` before its explicit initial-value pipeline; docs lose the bypass | Core initialization tests and latest-state docs |
| Private suppression | Seven Plite transform implementations plus engine/tests use private `withoutNormalizing`/`setNormalizing`/`skipNormalize` mechanics | Keep internal and unexported; do not force low-level algorithms through public lifecycle types | focused transform and normalization contracts |

Confirmed current trusted-replay hazard:
- Replaying one `insert_node` with public `{ normalize:false }` leaves dirty
  paths `[]`, `[0]`, and `[0,1]` after commit.
- A later selection-only transaction leaves the same dirty paths queued.
- Target law: trusted Diff/Core authority must clear or isolate all touched-root
  dirtiness before publication; a renamed public `exact` flag is rejected.

Performance pressure record:
| Field | Decision / budget | Proof route |
|-------|-------------------|-------------|
| Applicability | Applies: outer update and pre-commit are hot editor-kernel paths | source profile labels around `runEditorTransaction` |
| Vercel/React rules | N/A to the headless core; no React component, hook, Effect, state, or render primitive is introduced | package boundary/type audit |
| Extra rules | cohort segmentation, repeated-unit budget, interaction-INP matrix for browser caret proof, memory/DOM tagging, staged readiness | benchmark plus Chromium interaction trace |
| Repeated unit | one outer transaction; optional repeated unit is one dirty path through N installed normalizers | transaction microbenchmark |
| Cohorts | default: no extension normalizer, <=10 ops/dirty paths; plugin-normal: 1-8 normalizers and <=10 paths; plugin-large: 8-32 normalizers and 1k paths; stress: 32 normalizers and 10k paths; pathological: conflicting normalizer, rollback, and multi-root nesting | parameterized benchmark/contract rows |
| Default budget | <=2% p95 duration regression against the pre-change baseline in normal and large no-extension cohorts; no new queue/closure allocation | `profileCoreDuration`, allocation profile, repeated benchmark |
| Plugin budget | extension-aware closeout <=10% p95 versus an explicit dirty flush performing the same canonical work; exactly one normalization phase, commit, history entry, listener publication, and Yjs send | phase counters plus history/Yjs/listener assertions |
| Repair budget | explicit maintenance path is O(total nodes + repair operations) across all roots, performs one seeded traversal/fixpoint rather than dirty pass plus second full pass, and allocates no permanent index duplicate | 1k/10k/100k-node all-root benchmark and phase counters |
| Runtime primitive | extension-registry-aware fast-path predicate and existing dirty-path arrays; no queue or React runtime primitive | source/type audit |
| Interaction metric | Footnote insertion/caret and Suggestion typing browser rows record event-to-final-selection/content latency and must add no second commit/render; compare p95 before/after within 5% | focused Chromium demo/test trace |
| Trace/CWV proof | Core work is not a route-load/CWV surface; use transaction phase profile and the browser interaction trace instead | planning N/A for LCP/CLS with reason |
| Memory tags | tag registered-normalizer count, fast-path decision/reason, root count, dirty-path count, operation count, normalization duration, rollback, and commit count | profiler/test instrumentation |
| Degradation contract | none for correctness; default editors keep fast paths, while editors installing normalizers pay dirty-path work required by their declared behavior | type/runtime contract |
| Dashboard/RUM gap | no production editor phase RUM currently proves the budgets; execution records local benchmark artifacts and leaves stable profiler tags for later aggregation | benchmark artifact plus named tags |
| Plan delta | Objection pressure deleted the finalizer entirely and redirected performance work to extension-aware fast-path eligibility | objection pass |

Legacy regression proof matrix:
| Regression class | Legacy behavior | Plite target | Proof route | Owner | Status |
|------------------|-----------------|-----------------|-------------|-------|--------|
| Atomic compound update | normalizers wait until compound write finishes | preserve no normalization/publication during callback | existing transaction atomicity row plus target contract extension | Plite | existing partial proof |
| Inline-void caret | caret can target trailing text after footnote insert | command creates/selects the next text target and closeout preserves/maps it | focused footnote regressions at end, middle, existing text, explicit target | Plate footnote | accepted-plan execution gate |
| Iterative unwrap | multiple unwrap targets remain path-correct | private intermediate drain or invariant-preserving algorithm | focused Plite unwrap regression and Yjs operation parity | Plite | accepted-plan execution gate |
| Ordinary feature completion | layout/suggestion results canonical at commit | no explicit feature flush | focused existing package tests after call deletion | Plate packages | accepted-plan execution gate |
| Extension participation | Layout/Suggestion normalizers run for automatic closeout instead of requiring explicit flushes | fast-path predicate observes installed normalizers | one/two-op Layout probes plus full package rows | Plite + Plate packages | live failure reproduced; accepted-plan fix proof gate |
| Canonical equivalence | automatic closeout and all-root repair do not define different valid shapes for the affected roots from a canonical pre-state | same rules, different candidate scope | differential/property fixtures over built-in/plugin normalizers | Plite | accepted-plan execution gate |
| Hint lifecycle | one authored op may optimize pass 0; compound and generated repair passes cannot inherit a misleading op | private root plus first-pass-only hint | trace normalizer arguments and dirty candidates for single/multi/generated operations | Plite | accepted-plan execution gate |
| Normalizer context hard cut | plugin normalizers infer current editor/tx and forward only fallback behavior | minimal node/root contexts without scheduler fields | type inference across 14 files/22 slots and focused fallback test | Plite + package normalizers | accepted-plan execution gate |
| Public value repair | raw initial state and dynamically installed normalizers can intentionally repair without tx scheduling controls | outer-only argument-free all-root maintenance transaction | raw initial, late extension, primary/additional-root stable order, nested rejection | Plite value lifecycle | accepted-plan execution gate |
| Repair publication | unchanged repair is silent; changed repair is one history-skipped but collaboration-visible rollback-safe commit | maintenance metadata and one atomic transaction | no-op/throw/history/Yjs/listener/commit metadata assertions | Plite/history/Yjs | accepted-plan execution gate |
| Root ordering | nested/main/additional-root dirty paths close independently before one publication | root-aware dirty fixpoint | rooted transaction and operation trace | Plite | accepted-plan execution gate |
| Rollback | normalization failure publishes nothing and restores document/selection/marks/state/refs/operations/hooks | whole outer transaction rollback | transaction rollback contract | Plite | accepted-plan execution gate |
| Final classification | source/dirty metadata include automatic repair operations | classify only after the fixpoint | commit source and snapshot contract | Plite | accepted-plan execution gate |
| History and collaboration | authored plus normalization operations appear in one history record and one Yjs publication | one final commit, no appended repair transaction | Plite history and Yjs focused contracts | Plite-history/Yjs | accepted-plan execution gate |
| Public hard cut | scheduler, grouping, replay/replace bypass, and proposed finalizer surfaces are absent publicly | compile-time contracts plus export audit; no dead-code absence test | Plite types | accepted-plan execution gate |
| Trusted infrastructure | private replay/replace authority cannot leak stale dirty paths into a later transaction | `runTrustedUpdate` followed by ordinary selection and content transactions | Diff/Core/Plite contracts | accepted-plan execution gate |
| IME/native selection | canonical repair operations preserve native composition text and model/DOM selection | one commit with ordinary ref transforms | CJK rich text, mention-boundary IME, Android replace/backspace, selection reconciler | Plite-react/browser | accepted-plan execution gate |
| Engine law | transformed-node reruns and loop exhaustion remain deterministic | preserve `#3950`/`#5811` focused rows | normalization contract | Plite | existing proof rerun: 14/14; target execution gate |
| Performance | default, plugin-normal, plugin-large, stress, and pathological cohorts meet declared budgets | repeated microbenchmark with fast-path/phase counters | Plite runtime | accepted-plan execution gate |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| Footnote direct target | insert inline footnote, create/reuse trailing text, place caret | Chromium desktop on standalone package-facing demo/test | focused footnote Browser row plus interaction trace | canonical DOM and caret in one commit; p95 within budget | execution gate |
| Extension-normalized updates | type/edit/layout/suggestion actions | Chromium package tests | focused existing browser rows where present; otherwise package tests with explicit N/A | canonical result with no intermediate publication or second render | execution gate |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| Architecture/current source | `/Users/zbeyens/git/plate-2` | bounded `rg`, exact source reads, Layout/Footnote/raw-initial/trusted-dirty probes, and current Diff source read recorded in this plan | complete: inventories, defects, current semantics, and target owners grounded from live checkout | plite-plan |
| Existing issue-fix proof | `/Users/zbeyens/git/plate-2` | `pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts ./test/normalization-contract.ts` | complete: 14 pass, 0 fail; preserves `#3950`/`#5811` proof | plite-plan |
| Planning artifacts | `/Users/zbeyens/git/plate-2` | no-index whitespace checks for plan/sync-ledger/coverage-matrix; score calculation; contradiction/status audit; autogoal `check-complete` | complete: all checks pass; score 0.9465/0.95 | plite-plan |
| Accepted Plite runtime/API patch | `/Users/zbeyens/git/plate-2` | frozen focused contracts, source-first typecheck, `pnpm check:plite`, benchmark cohorts | gated: no implementation exists in planning mode; mandatory accepted-plan execution proof | execution |
| Plate consumers | `/Users/zbeyens/git/plate-2` | focused Footnote/Layout/Suggestion/Diff/Core/unwrap tests, docs check, `pnpm lint:fix`, `pnpm brl` | gated: migration is deliberately unimplemented before acceptance | execution |
| Browser-facing behavior | `/Users/zbeyens/git/plate-2` | focused Plite Chromium IME/selection/Yjs rows plus dedicated normalization-lifecycle fixture through Browser-owned lane | gated: no browser behavior changed in planning; mandatory before execution closure | execution |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | no | skipped | Headless Plite transaction/type change; no React component or hook work | N/A with boundary evidence |
| performance | yes | complete for planning | Hot-path cohorts, extension-normalizer repeated unit, conservative fast-path gate, relative budgets, interaction metric, trace substitute, memory tags, degradation and RUM gap recorded | objection pass removed finalizer overhead and redirected proof to default/plugin normalizer cohorts |
| tdd | yes during execution | planned | Behavior and public type change has named red-first rows | phase 1 begins with failing runtime/type contracts |
| shadcn | no | skipped | No UI component API or styling surface | N/A |
| react-useeffect | no | skipped | No Effect authored; React evidence is used only to reject post-commit repair | N/A |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| Extension-heavy typing cost | Any installed normalizer conservatively disables unsafe text/structural publication skips | Every keystroke walks dirty paths through many unrelated normalizers and regresses INP | Keep zero-normalizer fast paths unchanged; dirty paths remain local; benchmark 1/8/32 normalizers; permit future declared relevance only when default is always-relevant and soundness is testable | default/plugin-normal/plugin-large/stress microbenchmarks plus Chromium typing trace; <=2% default and <=10% versus equivalent explicit work | plan complete; accepted-plan proof gated |
| Wrong operation hint across compound/generated work | Multiple authored ops touch one root, or pass 0 repair emits more ops | Latest authored op narrows other dirty candidates; repeated passes keep stale trigger context and miss invariants | Private `{root, operationHint?}`; hint only for pass 0 of exactly one authored content op/root; clear after first mutation; plugin callbacks never see it | single/multi-op Layout/Suggestion fixtures, generated-repair trace, dirty/full differential property tests | plan complete; accepted-plan proof gated |
| IME/selection/ref disruption | Newly participating normalizers merge text, insert spacers, unwrap nodes, or rewrite props during native composition/model repair | DOM composition span or caret maps to removed nodes; duplicate text, lost CJK input, Android repair loop | Preserve one model commit; rely on operation/ref transforms for repairs; no post-commit DOM mutation; browser-prove rich-text CJK, mention boundaries, Android replacement/backspace, Footnote direct target | focused `richtext.test.ts`, `mentions.test.ts`, model-input/selection-reconciler/composition contracts, Footnote Chromium row | plan complete; accepted-plan proof gated |
| History/Yjs divergence | Automatic normalizers add operations previously omitted by fast paths, or public replay re-normalizes a canonical remote batch | Undo groups split, remote peers generate different repair operations, or duplicate repair commits appear | All repair ops stay in one originating commit; public replay canonicalizes complete batches; source/target must converge with zero second publication; trusted mode remains internal | Plite-history integrity/undo rows, collab-history runtime, Yjs structural/replace-fragment soak, commit/listener count assertions | plan complete; accepted-plan proof gated |
| Trusted replay dirtiness leak | Diff/Core trusted transaction skips normalization | Dirty paths survive commit and a later unrelated transaction performs delayed repair | Internal authority owns whole transaction and clears/isolates every touched-root dirty set before commit; public flag removed; assert no trusted authority from public tx | current probe proves `[]/[0]/[0,1]` persist; add trusted-then-selection/content/root regression and Diff/Core suites | plan complete; accepted-plan proof gated |
| Canonical-equivalence blast radius | Removing `explicit` changes inline merge/flatten/block cleanup semantics | Existing canonical documents change leaf grouping, selection offsets, annotations, runtime IDs, or commit dirtiness unexpectedly | Equivalence is conditional on canonical pre-state; operation/path transforms preserve selection/refs; differential corpus compares automatic result to private full repair and checks commit metadata | built-in/plugin/multi-root property fixtures, selection/ref/bookmark/history/Yjs assertions, package matrix | plan complete; accepted-plan proof gated |

High-risk blast radius:
- packages: `plite`, `plite-react`, `plite-history`, `yjs`, `core`, `diff`,
  Suggestion, Layout, Footnote, plus every package owning an invalid-fixture
  normalizer test or public grouping call.
- public types: update transaction groups, update options, operation replay,
  value replace, node/root normalizer contexts, static/editor exports, docs.
- runtime: dirty-path scheduling, fast publication, normalization passes,
  selection/path/range/bookmark transforms, snapshot/commit classification,
  history grouping, Yjs replay, IME/native DOM reconciliation.
- adoption: 20 grouping calls, 59 normalization calls, seven Diff bypasses, two
  Core replace bypass owners, 14 normalizer files/22 slots, four public docs
  normalization rows, and two bypass examples.

High-risk hard-cut and rollback answer:
- No compatibility alias, deprecated wrapper, or public `exact` rename ships.
- If plugin-heavy performance misses budget, keep correctness and add a sound
  opt-in normalizer relevance declaration later; never restore feature flushes.
- If IME/selection proof fails, repair operation/ref/DOM reconciliation inside
  the same commit; never defer canonicalization to an Effect or second commit.
- If canonical differential proof fails, narrow candidate scope or operation
  hint eligibility; never restore entrypoint-dependent canonical rules.
- Trusted Diff/Core authority is internal and whole-transaction. If its dirty
  isolation cannot be proved, rewrite those owners to produce canonical output;
  do not retain the public bypass.
- Source rollback during execution is allowed before acceptance; published API
  rollback is not a compatibility plan because this is the v2 hard cut.

High-risk adoption/docs/example answer:
- Public docs teach one law: `editor.update` returns after canonical closeout.
- Normalizer examples receive `{ entry, editor, tx, next }`; only
  `fallbackElement` can be forwarded through `next`.
- Replay/value-replace examples contain no normalization bypass.
- The normalization reference documents `editor.update.value.repair()` as an
  all-root maintenance scan for raw initial state or newly installed
  normalizers, explicitly forbidden inside feature updates.
- Feature docs show direct Footnote intent and ordinary Suggestion/Layout
  commands, never lifecycle punctuation.
- Internal dirty settlement, the repair engine, and trusted transactions receive
  JSDoc plus direct internal tests; only the outer `value.repair()` intent API is
  public, and docs remain latest-state rather than migration prose.

Plite maintainer objection ledger:
| Change | Who feels pain | Likely objection | Steelman antithesis | Tradeoff tension | Why worth it | Evidence | Rejected alternative | Adoption answer | Docs/example answer | Regression proof | Verdict |
|--------|----------------|------------------|---------------------|------------------|--------------|----------|----------------------|-----------------|---------------------|------------------|---------|
| Extension-aware automatic closeout | Core/perf maintainers and every editor installing normalizers | Disabling structural/text skips for any registered normalizer may slow typing | Current skip is valuable and most plugin normalizers are unrelated to most operations | conservative correctness versus finer invalidation metadata | Installed behavior cannot be silently skipped; dirty paths bound the initial safe cost | live Layout probe leaves `40/40` after one or two `set_node` ops but explicit dirty pass yields `50/50`; default runtime function identity hides registry normalizers | Keep the current skip and require feature flushes | Delete five feature flushes after engine proof; later scoped normalizer metadata is a separate optimization | Teach automatic canonical closeout, never feature punctuation | Layout/Suggestion plus default/plugin benchmark cohorts | revise/keep |
| One canonical result for dirty/full scopes | Normalization-engine maintainers relying on `explicit` shortcuts | Full repair may intentionally be more aggressive than ordinary editing | Different modes can preserve editing granularity while repair cleans imported data | predictable canonical law versus transient leaf segmentation | A committed document cannot have two canonical answers based on entrypoint; scope may differ, semantics may not | `explicit:true` activates broader inline cleanup; Suggestion needs explicit dirty passes to merge leaves/remove markers | Preserve `explicit` and expose a better flush name | `value.repair()` seeds all roots; automatic closeout evaluates dirty paths with identical rules from canonical pre-state | One canonicalization law plus public repair reference and internal engine JSDoc | differential dirty/full fixtures and Suggestion 101-row suite | revise/keep |
| Drop proposed `afterNormalize` | Footnote and future command authors wanting post-repair reads | Some commands genuinely need canonical structure before their final mutation | A narrow pre-commit phase is safer than imperative flushes and mirrors appended-transaction ideas | extensibility versus adding a lifecycle phase for one known caller | It would mask the engine bug, add timing/type/perf surface, and encourage commands to depend on repair-created nodes | only Footnote needs it; `tx.nodes.get/insert` and `tx.selection.set` can create/select the concrete next text; no other inventoried caller qualifies | Ship narrow canonical-read/selection-write finalizers | Footnote uses existing next text or inserts an empty next text before selecting; no other migration | No public example because no API survives | Footnote end/middle/existing-next/explicit-target tests and browser caret | drop |
| Cut `tx.normalize`, `setNormalizing`, public `skipNormalize`, and `EditorNormalizeOptions` | Advanced plugin authors and 43 invalid-fixture tests | Experts need an escape hatch and tests need full repair | A bare `normalize()` is familiar from Slate and can recover malformed documents | expert power versus one authoritative lifecycle | Current booleans leak engine strategy and feature calls concealed correctness defects | exact public/type inventory; seven feature/internal dirty calls; no authored `setNormalizing` or external direct `skipNormalize` consumer | Keep bare `normalize()` without options | Feature calls delete; fixtures and Core initialization use top-level `value.repair()`; engine tests use internals | Public docs remove manual scheduling and document the outer-only repair intent | public type/export audit, 43 fixture migrations, package tests | keep cut |
| Cut public `withoutNormalizing` | Slate-familiar transform authors and 20 callers | Compound transforms need a batching primitive | Slate's grouping boundary is useful and well understood | familiarity versus redundant nested semantics | `editor.update` already provides atomic deferred normalization; the public callback currently returns without draining | current implementation and 20-call inventory | Keep as compatibility alias | Inline 11 production, 4 app/registry, 3 docs, 1 forwarder, and 1 test call | Teach `editor.update` as the only public grouping boundary | transaction atomicity plus caller package tests | keep cut |
| Internalize replay/value normalization bypasses | Diff/Core maintainers and hypothetical third-party adapters | Exact operation/snapshot fidelity is a legitimate public need | Replay should sometimes trust an already-canonical remote commit without local repair | provenance fidelity versus public non-canonical commits and stale dirty state | Every known opt-out is repo-owned; public docs promise replay shares normalization; current skip can leave dirty paths queued | seven Diff `normalize:false` calls, Core initialization replacements, default history/Yjs replay consumers, dirty paths clear only through normalize | Rename public flags to `exact:true` | Diff collapses its work into one private `runTrustedUpdate`; Core uses the same owner for infrastructure replacement; public history/Yjs/default replay stays canonical | Remove public bypass examples; document canonical public replay/replace | Diff/Core/history/Yjs and stale-dirty-follow-up contracts | revise/keep cut |
| Keep private loop-local unwrap settlement | Plite transform maintainers | Any mid-transform normalization is brittle and should be algorithmically deleted | Path refs plus a final merge pass should make intermediate settlement unnecessary | deletion-first simplicity versus proven live-ref correctness | It is engine-owned, affects no public timing, and 29 fixtures require canonical paths before later iterations | `unwrap-nodes.ts:154-171`; prior no-pass experiment failed while dirty pass gives 29/29 | Reintroduce public flush or force an unproven rewrite in this plan | Try deletion first; retain private `settleDirtyRoot` only if focused red/green proof requires it | No public docs | 29 unwrap fixtures, refs, selection, and Yjs operation parity | revise/keep private |
| Add top-level `editor.update.value.repair()` | Raw-initial/dynamic-extension users, Core initialization, and 43 package fixtures | A public repair command could become another cargo-cult normalize call | Black-box package tests and dynamically installed normalizers should not depend on Plite internals | legitimate maintenance intent versus feature-level abuse | Outer-only, argument-free, all-root semantics cannot punctuate an active transform and preserve a necessary recovery owner | raw initial value remains invalid until current force repair; dynamic `editor.extend` is public; 43 fixture calls; primary-root doctrine | Force every consumer through `@platejs/plite/internal` or retain `tx.normalize(force)` | Direct rename for fixtures/Core; feature dirty calls do not qualify; engine-only tests stay internal | Dedicated normalization-reference subsection with cost/outer-only law; no feature example | raw/dynamic/all-root/nested/no-op/rollback/history/Yjs rows | revise/add |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| `tx.normalize(options)` | cut | Exposes scheduling policy and permits feature code to patch engine defects | Fix extension participation/canonical semantics; Footnote creates its target; tests/lifecycle owners move internal | current option type, seven-call inventory, Layout live probe | focused migration proof |
| Public `tx.withoutNormalizing` | cut | `editor.update` already defers normalization until outer closeout | Inline callback bodies into ordinary update transactions; retain private engine suppression | current early return, atomicity test, July 7 migration record | caller inventory and docs migration |
| Public `setNormalizing` | cut | Global scheduler state is engine authority and has no authored consumer | none beyond export/type removal | public static transform plus zero call inventory | public export audit |
| Public `EditorUpdateOptions.skipNormalize` | cut | Lets ordinary authoring silently publish non-canonical state | split private `runEditorTransaction` options from public update metadata/tag options | exported type and zero external direct callers | type inference and export audit |
| `EditorNormalizeOptions.explicit/force/operation` | cut from public | These are engine strategy/context, not author intent | Internal types split into dirty-pass and whole-repair inputs | `normalize.ts` and public interface | public export audit |
| Normalizer callback `explicit/force/operation` | cut | Invariant authors must not branch validity on invocation mode; no production normalizer consumes them | node/root context types shrink; keep `fallbackElement` as the sole `next` override | 14-file/22-slot audit and one fallback test | inference/typecheck matrix |
| Public replay/value normalization bypass | cut; keep private trusted owners | Public canonical transactions must not leak stale dirty paths or non-canonical state; every known opt-out is repo infrastructure | seven Diff calls move to private trusted replay; Core transforms use private trusted replace, then public `value.repair()` only when `shouldNormalizeEditor` requests it | exact inventory, public docs, dirty-path clearing source | Diff/Core/history/Yjs proof |
| `tx.withNormalizedState(fn)` | reject | Synchronous flush remains consumer-controlled and the name overpromises normalization after callback writes | none; never ship | option analysis | N/A |
| normalize-on-read or normalize-on-selection | reject | Hidden cost and unpredictable draft semantics | none; never ship | atomic transaction contract | N/A |
| Generic selection normalizer | reject in this plan | Footnote can create/select its concrete sibling target; no schema-level selection subsystem is justified | none | direct Footnote probe and `#2355` related-only boundary | preserve non-claim |
| `afterNormalize` update-context finalizer | drop | One-caller lifecycle surface hides extension-blind/incomplete automatic normalization and teaches repair timing dependencies | Footnote creates/selects its target directly; no other caller | exact caller inventory, Footnote/normalizer source, maintainer antithesis | no implementation |
| `explicit` as a semantic mode | cut | Dirty and full scopes must converge to one canonical result; only candidate scope may differ | merge built-in rules; preserve operation hints solely as proven optimizations | inline normalizer branches and Suggestion failures | differential proof |
| Extension-blind fast paths | cut/revise | Default runtime function identity does not prove the extension registry has no normalizers | conservative registry gate first; optimize later only with explicit relevance metadata | live Layout probe and source trace | benchmark cohorts |
| Private dirty-path drain | keep | Scheduler and internal iterative transforms need a deterministic mechanism | rename/split internals if useful | current normalization engine and unwrap | runtime pass |
| Top-level `editor.update.value.repair()` | keep/add | Raw initial state, dynamic normalizers, and black-box package fixtures need intentional full repair without a tx flush | direct rename of 43 fixture/Core calls; no feature transform migration | raw-initial probe, dynamic extension surface, test inventory, `#3465` non-claim | outer-only/all-root/history/Yjs proof |

Plan deltas from review:
- Related discovery raised confidence from 0.75 to 0.78 and added a conservative
  issue candidate matrix.
- Reopened the July 10 “existing options are sufficient” verdict: its behavior
  evidence is retained, but it does not establish that feature packages should
  own lifecycle flushing.
- Marked the July 7 public `withoutNormalizing` enhancement as adoption debt
  rather than architecture authority.
- Repaired `#5811` provenance drift: the manual sync ledger now agrees with the
  coverage matrix, fork dossier, current code/test proof, and PR reference on
  `improves-claimed`.
- Kept every other candidate conservative; this architecture plan makes no new
  fix/improve claim.
- The intent pass provisionally replaced synchronous `withNormalizedState` with
  staged `afterNormalize`; maintainer pressure later rejected both. This row is
  historical evidence, not the target API.
- Locked public `tx.normalize` and `tx.withoutNormalizing` as hard cuts; later
  inventories may change migration mechanics, not their public ownership.
- The ecosystem pass provisionally retained a one-shot `afterNormalize`, but
  ProseMirror/Tiptap metadata and loop complexity became rejection evidence.
  The final target keeps one transaction without a dependent-work phase.
- Accepted the required hybrid thesis without expanding scope: Plite owns dirty
  normal editing and bulk fragment replacement; Plate owns app paste rules.
- Complete inventory widened the hard cut to public `setNormalizing` and
  `EditorUpdateOptions.skipNormalize`; repo-owned replay/import authority is
  internal and trusted rather than a public provenance mode.
- Performance and simplicity pressure first narrowed the provisional finalizer;
  maintainer pressure then deleted it. The target has one fixpoint and one
  commit with no finalizer queue or lifecycle allocation.
- Migration pressure found 20 public grouping calls and 59 normalization calls;
  every cohort now has a delete, migrate, private-helper, or boundary-specific
  owner and a focused proof route.
- Maintainer steelman rejected the proposed finalizer as a one-caller symptom
  API. Footnote can create/select its concrete next text with existing tx APIs.
- Live Layout probes proved the deeper defect: automatic closeout skips a
  registered column normalizer after both one and two `set_node` operations,
  leaving `40%/50%` or `40%/40%`; explicit dirty normalization yields
  `50%/50%` and appends the expected repair operations.
- Source tracing identified the cause: fast-path eligibility compares default
  runtime function identities even though the default `normalizeNode` dispatches
  the mutable extension normalizer registry. Registered normalizers are invisible
  to the skip predicate.
- High-risk pressure qualified equivalence to canonical pre-states, separated
  explicit root ownership from first-pass-only single-operation hints, and
  forbade hints on compound or repair-generated passes.
- High-risk API audit cut `explicit`, `force`, and `operation` from public
  node/root normalizer contexts: 14 files/22 slots have zero production reads;
  the one `fallbackElement` test preserves the sole valid `next` override.
- High-risk trusted-replay probe proved current `{normalize:false}` leaves
  `[]`, `[0]`, and `[0,1]` dirty after commit and after selection-only work.
  Internal Diff/Core authority now owns mandatory touched-root isolation.
- High-risk deliberate mode recorded six realistic failures, full blast radius,
  hard-cut/rollback answers, latest-state docs/examples, IME/selection,
  history/Yjs, performance, and focused execution proof.
- Objection pressure also cut the `explicit` semantic split and public
  replay/value bypasses. Automatic/repair modes choose candidate scope only;
  public transactions always canonicalize; repo-owned Diff/Core trusted
  authority stays private.
- Ecosystem maintenance rejected routing 43 public package behavior tests through
  `@platejs/plite/internal`; those tests must exercise a public recovery intent.
- Added argument-free outer `editor.update.value.repair()`: all roots in stable
  order, no tx presence, nested-call rejection, history skip, collaboration
  publication, rollback, and no-op silence.
- Package ownership is now explicit: Plite exposes repair and owns its engine;
  Core uses trusted replace plus optional public repair; Diff alone consumes
  private trusted replay; Plate features never invoke repair.
- Public docs retain one repair reference subsection for raw initial values and
  late normalizers, while ordinary concepts/examples teach only automatic
  closeout and direct command intent.
- Revision froze the public names and the internal owners: `value.repair()`,
  `settleDirtyRoot`, `repairEditorValue`, and `runTrustedUpdate`. Diff collapses
  three suppression transactions into one trusted transaction; no public
  scheduler, lifecycle, exactness, or trusted mode survives.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| Does any public caller need full-root repair after a normal update/replace? | Determines whether any public repair API survives | complete call/docs/example/dynamic-extension inventory | ecosystem pass | resolved: yes, raw initial state/dynamic normalizers/Core/43 fixtures; expose outer-only all-root `value.repair()` |
| Does `tx.withoutNormalizing` suppress any real transaction-local explicit drain? | Determines migration mechanics, not public ownership | call graph and focused behavior audit | pressure pass | resolved: no public owner; all 20 calls inline or move private |
| Can internal unwrap avoid intermediate normalization entirely? | Deletion is better than blessing a private flush | focused algorithm/test audit | runtime/testability pass | resolved architecturally: execution tries deletion under 29 fixtures; private `settleDirtyRoot` is allowed only if deletion fails |
| Callback name: `withNormalizedState`, `afterNormalize`, or another lifecycle term? | Public DX and execution semantics must be obvious | Maintainer steelman and exact caller inventory | objection pass | resolved: no callback ships |
| Should replay/value replace spell exactness as `normalize:false`, `exact:true`, or a mode? | Boundary DX must not reintroduce scheduler vocabulary | maintainer objections plus Diff/history/Yjs call pressure | objection ledger | resolved: no public bypass; private owner names describe exactness |
| Can fast-path eligibility become finer than “no registered normalizers”? | Determines plugin-heavy typing cost | benchmark plus a sound declared relevance model | high-risk/performance execution | deferred optimization, not a decision blocker: conservative correctness ships first; relevance metadata is a separate plan only if budgets fail |

No decision-changing open question remains. Execution can discover an
implementation defect or failed proof gate, but it cannot silently reopen a
public scheduler API, lifecycle callback, semantic mode, or bypass.

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| 1. Canonical runtime contracts | Plite | Add red extension-participation and canonical-prestate differential tests; make fast paths registry-aware; unify canonical rules; implement `settleDirtyRoot` with explicit root and first-pass-only hint | explicit plan acceptance | Layout-shaped core fixture, hint traces, and built-in/plugin differential rows green; default/plugin budgets measured | focused Bun contracts and microbenchmark |
| 2. Public hard cuts/private owners | Plite | Remove public normalize/grouping/setNormalizing/skipNormalize/replay-normalize/value-normalize and normalizer scheduler fields; implement `repairEditorValue`, public outer-only `value.repair()`, and internal `runTrustedUpdate`; isolate trusted dirtiness; try deleting unwrap settlement under 29 fixtures | phase 1 green | export/inference tests green across 14 normalizer files; raw/dynamic/all-root/nested/no-op/rollback repair rows green; trusted and unwrap laws preserved | package typecheck and focused normalization/operations/transforms tests |
| 3. Plate adoption/docs | Plate packages + docs | Delete five end flushes; make Footnote create/select target; inline 20 grouping callers; migrate 43 fixtures/Core to `value.repair()`; collapse Diff into one `runTrustedUpdate`; rewrite latest-state docs | phases 1-2 green | no public scheduler/bypass calls; repair used only by qualified maintenance/test owners; package behavior/docs green | Footnote/Layout/Suggestion/Diff/Core/fixture tests, docs check, `rg` gate |
| 4. Closure proof | Plite/Plate/history/Yjs/browser | Run default/plugin/large/stress/pathological budgets, one-commit/history/Yjs/listener/rollback/root/trusted-dirty proofs, Chromium IME/selection/Yjs rows and a dedicated package-facing normalization lifecycle fixture, lint/barrels, then autoreview | phases 1-3 green | all budgets/regressions pass; Browser evidence captured or an exact no-route N/A is recorded for headless-only package behavior; no accepted autoreview finding | frozen command matrix below, Browser, `pnpm lint:fix`, `pnpm brl`, autoreview |

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| planning artifact check | plate-2 | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plite-normalization-lifecycle-architecture.md` | plan/template integrity after all passes | complete |
| Plite contracts | plate-2 | `pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts ./test/normalization-contract.ts ./test/transaction-contract.ts ./test/state-tx-public-api-contract.ts ./test/rooted-operation-contract.ts ./test/operations-contract.ts ./test/collab-history-runtime-contract.ts ./test/snapshot-contract.ts` | lifecycle, hard cuts, roots, replay, rollback, publication | accepted-plan execution |
| Plite history | plate-2 | `pnpm --filter @platejs/plite-history exec bun test --preload ../../config/plite-source-test-setup.ts` | one-record and repair history-skip behavior | accepted-plan execution |
| Yjs contracts | plate-2 | `pnpm --filter @platejs/yjs exec bun test --preload ../../config/plite-source-test-setup.ts ./test/remote-import-contract.spec.ts ./test/replace-fragment-contract.spec.ts ./test/split-merge-contract.spec.ts ./test/structural-soak-contract.spec.ts --path-ignore-patterns ''` | one publication, replay convergence, structural soak | accepted-plan execution |
| Plate packages | plate-2 | `pnpm --filter @platejs/core p:test && pnpm --filter @platejs/diff p:test && pnpm --filter @platejs/footnote p:test && pnpm --filter @platejs/layout p:test && pnpm --filter @platejs/suggestion p:test` | consumer migration and black-box repair fixtures | accepted-plan execution |
| Source-first types | plate-2 | `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/plite-history --filter=./packages/yjs --filter=./packages/core --filter=./packages/diff --filter=./packages/footnote --filter=./packages/layout --filter=./packages/suggestion` | public/internal API inference and package graph | accepted-plan execution |
| Chromium lifecycle | plate-2 | `pnpm --filter plite test:plite-browser:chromium apps/plite/tests/plite-browser/donor/examples/richtext.test.ts apps/plite/tests/plite-browser/donor/examples/mentions.test.ts apps/plite/tests/plite-browser/donor/examples/yjs-collaboration.test.ts` plus the dedicated normalization-lifecycle fixture added in phase 1 | IME, selection, collaboration, visible one-commit behavior | accepted-plan execution |
| Full Plite closure | plate-2 | `pnpm check:plite` | daily package plus Chromium Plite proof | accepted-plan execution |
| Docs | plate-2 | `pnpm --filter www check:docs` | latest-state public documentation | accepted-plan execution |
| Generated exports | plate-2 | `pnpm brl` | package barrels after export cuts/additions | accepted-plan execution |
| Lint | plate-2 | `pnpm lint:fix` | repository formatting/lint | accepted-plan execution |

Final user-review handoff outline:
- accepted plan items: one automatic extension-aware canonical closeout;
  canonical-equivalent rules by affected scope; explicit root and restricted
  operation hints; outer-only all-root `value.repair()`; private trusted
  infrastructure; direct Footnote selection target.
- before / after API shape: replace scheduler-shaped `normalize`, grouping, and
  bypass flags with ordinary `editor.update`, canonical replay/replace, and the
  single maintenance intent `editor.update.value.repair()`.
- hard cuts: `tx.normalize`, public `withoutNormalizing`, `setNormalizing`,
  `EditorNormalizeOptions`, `skipNormalize`, replay/replace `normalize`,
  normalizer scheduler fields, and every proposed lifecycle/exact/trusted mode.
- issue claims and non-claims: preserve `Fixes #3950` and `Improves #5811`;
  keep `#2355` related and `#3465` not claimed; make no new claim for `#4641`,
  `#4701`, `#3275`, or `#2039`.
- proof gates: frozen contract/package/type/browser/docs/barrel/lint commands,
  performance budgets, one-commit history/Yjs/listener assertions, and clean
  autoreview.
- accepted-plan execution handoff: only after explicit user acceptance, invoke
  `plite-plan` again to execute phases 1-4 in order; stop on a failed law or
  budget instead of restoring a cut public control.

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | scorecard rows cite evidence | complete: 0.9465/0.95; minimum dimension 0.91 |
| all pass rows complete or skipped with evidence | phase/pass table closed | complete: twelve scheduled rows closed with evidence |
| issue/reference sync closed | issue-ledger sync status closed | complete: live rehydration plus sync-ledger and coverage-matrix lifecycle accounting; dossier/PR no-change decisions recorded |
| live source grounding complete | source-backed rows cite current owners | complete: current API/runtime/docs/tests/consumers/packages and external mechanisms cite live owners |
| workspace verification recorded | verification workspace gate closed | complete: planning proof separated from mandatory accepted-plan execution proof |
| autoreview clean or N/A | `.agents/skills/autoreview/SKILL.md` loaded and clean for non-trivial uncommitted implementation changes, or N/A with reason | complete: N/A, planning/provenance artifacts only and no implementation patch |
| final handoff emitted or lane remains pending | final response / next pass recorded | complete: grouped decision handoff emitted; lane stops for user review |
| `check-complete` passes | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plite-normalization-lifecycle-architecture.md` | complete: command passes after final closure edits |

Findings:
- Confirmed current behavior: outer transactions automatically dirty-normalize
  before commit, while upstream Slate's `withoutNormalizing` immediately
  normalizes on exit. Plite intentionally preserves an unnormalized draft during
  the callback; the compatibility-shaped grouping API no longer means what old
  Plate callers expect.
- Exact inventory: seven `force:false` calls. Layout and four suggestion calls
  occur at transform end; footnote immediately reads a normalizer-created caret
  target; Plite unwrap drains between loop iterations.
- Current public type exposes `explicit`, `force`, and `operation`, although
  these are engine policy inputs rather than normal authoring concepts.
- Current docs say `withoutNormalizing` delays normalization inside an update,
  but the update itself already delays normalization; this teaching surface is
  at best redundant and at worst misleading.
- Prior proof has distinct owners: Footnote needs a concrete next text target;
  Suggestion needs automatic canonical leaf/marker cleanup; Layout needs its
  registered normalizer to run; unwrap is an internal iterative algorithm and
  must not dictate public API.
- Existing issue claims are mostly adjacent, not owned: `#2355` is direct
  selection/normalization pressure; `#3465` remains unclaimed initial-value
  policy; `#3950` and `#5811` are existing engine claims to preserve; the
  normalizer-authoring cluster receives no new claim from this plan.
- Current `EditorUpdateContext.afterCommit` remains post-publication and
  observational. Its existence is not evidence for another lifecycle phase;
  the only proposed pre-commit caller can express its target directly.
- Lexical’s current runtime applies dirty transforms to fixpoint before one DOM
  reconciliation and explicitly discourages listener-triggered follow-up updates
  because they create another state/render/history cycle.
- ProseMirror’s `appendTransaction` is the closest timing precedent, but it
  creates additional transaction objects and repeatedly recalls plugins. Tiptap
  production extensions then require metadata and history flags to coordinate
  those appended repairs.
- React Effects run after commit and can trigger another render/commit. They are
  categorically the wrong owner for editor canonicalization or caret repair.
- Current Plite already uses scoped `replace_children` for bulk fragment paths,
  while Plate already owns parser transforms and insert-data rules. The required
  dirty/bulk/paste hybrid exists; normalization lifecycle must not absorb it.
- Adoption inventory found 20 public grouping calls and 59 normalization calls.
  No caller justifies public post-normalization behavior: Footnote becomes a
  direct command and end flushes delete after engine repair. Full-repair fixture
  calls instead justify one outer value-maintenance API; unwrap remains private.
- Public normalization authority is broader than `tx.normalize`: exported
  `setNormalizing` and `EditorUpdateOptions.skipNormalize` bypass the same
  lifecycle and have no normal authoring owner. Exact replay/value replacement
  remains distinct but internal because every known opt-out belongs to Diff or
  Core infrastructure.
- Live Layout probes reproduced the engine defect without source edits: one
  automatic `set_node` leaves `40%/50%`, two leave `40%/40%`, and an explicit
  dirty pass produces `50%/50%` plus two repair operations.
- The skip predicate is extension-blind: it checks the default runtime function
  identity, while that same default function dynamically dispatches registered
  normalizers. Automatic closeout can therefore skip installed plugin behavior.
- Automatic and explicit normalization also select different built-in rules via
  `explicit`. The target removes that semantic split: scope and operation hints
  may reduce candidates but must not change the canonical answer.
- A direct Footnote probe inserted `[reference, emptyText]` with `select:true`
  and created the definition in the same update. End insertion produced the
  intended `[0,2]` caret without a staged hook; middle insertion plus current
  explicit dirty normalization merged the temporary empty/right text and kept
  the caret at `[0,2]`, proving the direct-command target composes with the
  canonical-rule repair.
- Canonical equivalence must assume a canonical pre-state. Dirty closeout is not
  a promise to discover unrelated malformed nodes that only full repair visits.
- Current closeout keeps only the latest content operation per root, and the
  normalization loop reuses that operation after repair mutations. Both are
  unsafe optimization contexts for compound or generated dirty paths.
- Across 14 files and 22 normalizer slots, no production callback reads
  `explicit`, `force`, or `operation`; only a focused test uses
  `fallbackElement`. Public invariant authoring can drop scheduler state cleanly.
- Current normalization-bypassed replay leaves dirty paths `[]`, `[0]`, and `[0,1]` queued after
  commit and after a later selection-only transaction. A private trusted owner
  must isolate or clear dirtiness, not merely rename `normalize:false`.
- Raw `createEditor({initialValue})` preserves an invalid empty block until a
  full repair runs; dynamic `editor.extend` can also install a normalizer after
  state exists. Requiring those public lifecycle cases and 43 black-box package
  fixtures to import Plite internals would invert package ownership.
- Ecosystem target adds argument-free `editor.update.value.repair()`: unavailable
  on `tx`, rejected during an active update, primary plus sorted additional roots,
  one history-skipped/collaboration-visible maintenance commit, and no commit
  when unchanged.

Decisions and tradeoffs:
- Keep unnormalized draft reads inside the main update callback. This preserves
  atomic composition and makes the canonical-state boundary explicit.
- Drop `afterNormalize`. Commands create concrete nodes required by their own
  selection intent; normalization is not an authoring phase boundary.
- Make extension registration part of fast-path eligibility. Begin with the
  conservative law that any registered normalizer disables unproven default
  structural/text skips.
- From a canonical pre-state, make dirty closeout and full repair semantically
  equivalent after the same transaction. Unrelated invalid nodes stay outside
  dirty scope.
- Give the private scheduler an explicit root. Use an operation hint only on
  pass 0 for exactly one authored content operation on that root, then clear it
  after any repair mutation; public normalizers never receive it.
- Cut `explicit`, `force`, and `operation` from node/root normalizer contexts;
  retain only invariant inputs and `fallbackElement` forwarding.
- Recompute final operation classes, dirty metadata, and snapshot inputs after
  the canonical fixpoint.
- Roll back the whole outer transaction when normalization throws. Never publish
  a partial draft or repair in a second commit.
- Keep trusted replay/replace private, named, isolated owners; trusted
  transactions clear/isolate touched-root dirtiness.
- Expose full repair only as outer `editor.update.value.repair()`. Its engine is
  private, its scope is all roots, it skips history, and it cannot punctuate a
  feature transaction.
- Keep `afterCommit` post-publication and observational; it is not a repair path.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Combined normalization search printed 728 lines and one missing `packages/plite-yjs/src` path | 1 | Read exact source slices and discover package paths before searching | Broad output abandoned; subsequent reads bounded to named files |
| Candidate issue search included the aggregate open-issues ledger line | 1 | Exclude `open-issues-ledger.md` from later focused issue queries | Candidate titles/status still obtained from bounded owner rows |
| Bun treated `test/normalization-contract.ts` as a name filter | 1 | Rerun with explicit `./test/normalization-contract.ts` path | Corrected command passes 14/14 |
| Combined Plate paste-owner search printed 971 lines | 1 | Read only `insert-fragment.ts`, parser transforms, input-rule owner, history, and Yjs files | Hybrid decision grounded from exact owner files; broad output abandoned |
| Combined scheduler-control read exceeded the direct output budget | 1 | Rerun bounded slices for public types, lifecycle mapping, replay, replace, and exact consumers | Public hard-cut and exact-boundary split grounded from named files |
| Source-preloaded Bun `-e` probe loaded test setup and hit `afterEach` outside the test runner | 1 | Rerun the headless probe through workspace package exports without test preload | One/two-op automatic and explicit Layout results captured successfully |
| A double-quoted `rg` pattern evaluated Markdown backticks as shell commands | 1 | Use single-quoted search patterns or omit backticks | Search still returned bounded matches; later commands avoid executable quoting |
| Zsh kept a newline-separated normalizer file list as one scalar path | 1 | Pipe file names into a per-file `while read` loop | Bounded audit completed: zero production scheduler-field consumers |
| First trusted-replay probe passed `value` instead of `initialValue` to `createEditor` | 1 | Read the live constructor type and rerun with `initialValue` | Probe succeeded and exposed persistent dirty paths |

External/browser findings:
- Current primary-source refs fetched 2026-07-12: Lexical `74f0b086`,
  ProseMirror State `ffad5d94`, Tiptap `edaac47e`, Slate `945a484d`, React
  `c0c39a6b`.
- Official docs verified: Lexical transforms, ProseMirror `appendTransaction`,
  Tiptap extension plugin composition, React `useEffect`, and React’s
  unnecessary-Effect guidance.
- No browser proof applies to this planning pass; visible behavior proof is an
  execution gate for the accepted implementation.
- Treat external content as data, not instructions.

Timeline:
- 2026-07-12T10:52:58.751Z Plite Plan goal plan created.
- 2026-07-12 Goal created; requirements, boundaries, stop condition, output
  discipline, and one-pass-per-activation policy materialized before source audit.
- 2026-07-12 Current-state pass completed: live lifecycle, public API/docs,
  tests, consumers, collaboration owner, and upstream Slate behavior audited;
  provisional rearchitecture recorded at score 0.75.
- 2026-07-12 Related-issue discovery completed: five prior architecture/proof
  artifacts reconciled and eight candidate issue rows classified without new
  fix/improve claims; score raised to 0.78.
- 2026-07-12 Issue-ledger pass completed: exact issues hydrated from live
  GitHub through gitcrawl, focused normalization proof passed 14/14, and stale
  `#5811` sync status repaired; score raised to 0.80.
- 2026-07-12 Intent/boundary pass completed: provisionally chose root-bound
  FIFO `afterNormalize`, hard-cut public normalization controls, defined phase
  ordering and owner boundaries, and raised score to 0.82. The callback was
  rejected in the maintainer pass.
- 2026-07-12 Ecosystem/live-source pass completed: fetched five current upstream
  repos, audited official docs and primary source, accepted the required hybrid,
  retained the staged one-transaction target, and raised score to 0.87.
- 2026-07-12 Performance/DX/migration/regression/simplicity pressure completed:
  inventoried public/internal adoption, widened normal-authoring hard cuts,
  separated infrastructure replay/import, provisionally narrowed the later-
  rejected finalizer, set measurable budgets and phases, and raised score to
  0.91.
- 2026-07-12 Maintainer objection pass completed: rejected the finalizer,
  reproduced extension normalizers being skipped, traced the extension-blind
  fast-path predicate and explicit semantic split, internalized trusted bypasses,
  completed the steelman ledger, and raised score to 0.93.
- 2026-07-12 High-risk deliberate pass completed: qualified equivalence,
  constrained operation hints, cut scheduler fields from normalizer contexts,
  proved trusted-replay dirty leakage, recorded six failure scenarios and full
  blast/rollback/adoption/proof answers, and raised score to 0.94.
- 2026-07-12 Ecosystem maintainer pass completed: rejected internal imports for
  black-box package tests, added outer-only all-root `value.repair()`, fixed
  Plite/Core/Diff/Plate/docs ownership and maintenance commit semantics, and
  raised score to 0.95.
- 2026-07-12 Revision pass completed: removed superseded lifecycle language;
  froze `settleDirtyRoot`, `repairEditorValue`, and `runTrustedUpdate`; collapsed
  Diff adoption to one trusted transaction; resolved open questions; locked the
  executable proof matrix and final handoff; score remains 0.95.
- 2026-07-12 Issue-sync accounting completed: all eight issues rehydrated live
  and remained open; authoritative ledger metadata repaired; coverage matrix
  synced; existing `#3950`/`#5811` claims preserved with no new claim; score
  remains 0.95.
- 2026-07-12 Closure score and final gates completed: focused normalization
  proof passed 14/14; planning/runtime/browser verification ownership separated;
  score recalculated to 0.9465/0.95; artifact, status, contradiction, and
  autogoal checks passed; complete review handoff emitted.

Verification evidence:
- Final focused proof:
  `pnpm --filter @platejs/plite exec bun test --preload
  ../../config/plite-source-test-setup.ts ./test/normalization-contract.ts` ->
  14 pass, 0 fail on 2026-07-12.
- Final score calculation -> `0.9465`, reported as `0.95`; every dimension is
  at least `0.91`, above the required `0.85` floor.
- Final no-index whitespace checks pass for the plan, manual V2 sync ledger,
  and issue-coverage matrix; frozen API/status/contradiction searches resolve
  the closure state without an open decision.
- Final autogoal verification:
  `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-07-12-plite-normalization-lifecycle-architecture.md` ->
  complete.
- `rg -n "normalize\\(\\{\\s*force:\\s*false\\s*\\}\\)" packages` -> seven current source calls.
- Exact source reads: Plite normalization engine, outer transaction lifecycle,
  public types, atomic transaction test, public normalization docs, six Plate
  consumer contexts, Plite unwrap, and upstream Slate implementation.
- `gitcrawl status --json`; `gitcrawl doctor --json`; `gitcrawl --version` ->
  healthy local archive, authenticated exact hydration available, version 0.5.0.
- `gitcrawl sync ianstormtaylor/slate --numbers
  2355,3465,3950,5811,4641,4701,3275,2039 --with pr-details --json` -> eight
  current open issues synced on 2026-07-12; repeated in the issue-sync pass and
  completed at 2026-07-12T12:07:47Z with eight open issues, zero closures.
- `pnpm --filter @platejs/plite exec bun test --preload
  ../../config/plite-source-test-setup.ts ./test/normalization-contract.ts` ->
  14 pass, 0 fail.
- Focused source audit confirms `#5811` is now `improves-claimed` in the sync
  ledger and that the PR reference already preserves `Fixes #3950`,
  `Improves #5811`, and the `#3465` non-claim.
- Exact source audit of `EditorUpdateContext`, outer transaction normalization,
  final publication, and `afterCommit` tests preserves one post-publication hook
  and supplies no owner for a second pre-commit hook.
- `git fetch origin` plus remote-HEAD reads for `../lexical`,
  `../prosemirror-state`, `../tiptap`, `../slate`, and `../react` established the
  current primary-source commits recorded above.
- Exact primary-source reads covered Lexical dirty-transform/finalization,
  ProseMirror transaction/appended-transaction/selection mapping, Tiptap
  UniqueID/TrailingNode/PasteRule, Slate normalization, and React official
  lifecycle guidance.
- Current Plite/Plate owner reads covered fragment `replace_children`, parser
  transform hooks, insert-data rules, history `onCommit`, and Yjs `onCommit`.
- Bounded inventories recorded 20 public grouping calls, 59 normalization
  calls, no authored `setNormalizing` use, no external direct `skipNormalize`
  consumer, seven Diff normalization-bypass replay calls, and Core trusted
  value-replace owners.
- Headless Layout probes through current workspace exports: automatic one-op
  update -> `40%/50%`; automatic two-op update -> `40%/40%`; identical two-op
  update plus `tx.normalize({force:false})` -> `50%/50%` with two repair ops.
- Source trace: `canUseTextFastPath` compares runtime function identities;
  `canSkipDefaultTopLevelStructuralNormalize` then skips `set_node` closeout;
  the default `normalizeNode` dynamically reads extension normalizers, so the
  identity check does not prove the registry is empty.
- Headless Footnote probes through current workspace exports: inserting
  `[reference, {text:''}]` with `select:true` creates the end caret at `[0,2]`;
  the middle-text variant plus current explicit dirty normalization canonicalizes
  `empty + rightText` to the right text while preserving `[0,2]` offset `0`.
- Normalizer callback audit: 14 files/22 normalizer slots; zero production reads
  of `explicit`, `force`, or `operation`; one focused test forwards
  `fallbackElement`.
- Trusted-replay probe using live source internals: after replaying one
  `insert_node` with `{normalize:false}`, dirty paths remain `[]`, `[0]`, and
  `[0,1]`; a later selection-only transaction leaves all three queued.
- Source trace confirms closeout stores only the latest content operation per
  root and `normalize` reuses its operation option through repair-generated
  iterations, grounding the first-pass-only single-operation hint law.
- Raw-initial probe through current Plite source: `createEditor({initialValue:
  [{type:'block',children:[]}]})` preserves the empty invalid block; current
  full-root normalization repairs it to one empty text child. This and public
  late `editor.extend` establish the outer repair owner.
- Public lifecycle/type audit confirms `editor.update.value` can host a method
  absent from `tx.value`, the primary root remains implicit, and
  `@platejs/plite/internal` already provides the repo-owned subpath required by
  Diff/Core trusted infrastructure.
- Revision source audit confirms Diff currently splits merge, split, and commit
  work across three `update.withoutNormalizing` transactions; the frozen
  adoption replaces them with one `runTrustedUpdate` transaction.
- Revision mechanically reconciled all earlier provisional finalizer and public
  exactness rows against the frozen target; remaining mentions are explicitly
  historical, rejected alternatives, current-source labels, or proof evidence.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Planning goal complete; ready for user review |
| Where am I going? | Stop. Implementation requires explicit acceptance and a later `plite-plan` execution invocation |
| What is the goal? | Define a coherent Plite normalization lifecycle and API plan |
| What have I learned? | See Findings |
| What have I done? | Completed all twelve planning passes and proof gates; froze architecture, migration, performance, issue accounting, commands, and handoff at score 0.95; no implementation |

Open risks:
- These are accepted execution risks with hard proof gates, not unresolved
  planning decisions.
- Conservatively disabling fast paths for every installed normalizer may make
  plugin-heavy typing regress; execution benchmarks own the gate and any later
  relevance metadata must default to always-relevant.
- Unifying explicit/implicit canonical rules can change leaf grouping and block
  cleanup beyond the five known feature calls; differential blast-radius proof
  must cover history, IME, selection refs, collaboration, and large documents.
- Trusted replay dirtiness leakage is confirmed; the internal replacement must
  isolate or clear every touched root before commit.
- Footnote direct target creation must preserve middle-of-text, existing-next-
  text, configured-type, explicit-target, and focus-definition behavior.
- `value.repair()` could be cargo-culted unless type placement, outer-update
  rejection, all-root cost JSDoc, and source audits keep it out of feature code.
- All-root repair produces a heterogeneous-root maintenance commit; execution
  must prove stable root order, history skip, Yjs publication, rollback, and
  no-op silence before the API is accepted.

Output budget strategy:
- Use exact-file reads and bounded `rg` inventories; exclude generated output,
  build artifacts, dependencies, templates, logs, and broad app trees unless a
  named claim requires them. Cap command output to relevant slices and record
  counts before printing broad matches.
