# Plite update lifecycle API

Objective:
Lock one typed Plite update-policy API that replaces Slate/Plate lifecycle
`with*` / `without*` wrappers without exposing raw commit metadata; ready at
score >= 0.92 with no dimension below 0.85.

Goal plan:
docs/plans/2026-07-15-plite-update-lifecycle-api.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Completion threshold:
- One accepted public grammar covers direct one-operation updates, atomic
  multi-operation updates, history modes, normalization deferral, collaboration
  origin, selection effects, tags, and package-owned product presets.
- Every legacy lifecycle helper is mapped to keep, rename, internalize, or cut;
  the migration, typing, runtime, and proof routes are explicit.
- Plite Plan closure is legal only when score >= 0.92, no dimension is below
  0.85, every pass row is complete or intentionally skipped with evidence,
  issue/reference sync rows are closed, final handoff is emitted, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-15-plite-update-lifecycle-api.md` passes.

Verification surface:
- Live-source audit of Plite lifecycle types/runtime, Plite History controls,
  Plate migration call sites, prior normalization/history behavior law, and
  public examples.
- Accepted-plan execution must add public type contracts, focused lifecycle and
  history behavior tests, migrate all owned call sites, and pass the affected
  Plite/Plate package typechecks plus focused tests.
- Planning-only checks run in `plate-2`; any Plite source/runtime/browser/API
  claim must cite and verify the live `Plate repo root` workspace command.

Constraints:
- Hard cut: no compatibility aliases for `withMerging`, `withNewBatch`,
  `withoutSaving`, or `withoutNormalizing`.
- Raw `metadata` and `skipNormalize` are runtime/adapter mechanisms, not normal
  application DX.
- Keep callbacks only for atomic multi-operation transactions; one-operation
  writes use the configured direct update facade.
- Preserve extension typing and the Plite/Plate ownership boundary.
- Do not augment the core policy type with extension-owned keys; owner-defined
  presets compose fixed core fields and namespaced tags.
- Plite Plan may edit planning, research, issue-ledger, and PR-reference
  artifacts only. Plite implementation belongs to accepted-plan execution
  after user review.

Boundaries:
- Planning edits: this plan only. Reads: `packages/plite*`, affected Plate
  packages/apps, local legacy checkout `../plate`, VISION, relevant solutions,
  plans, ledgers, and behavior contracts.
- No implementation until the plan is ready and explicitly accepted.
- Allowed edit scope: `docs/plans/**`, `docs/research/**`,
  `docs/plite-issues/**`, `docs/plite/ledgers/**`,
  `docs/plite/references/**`.

Blocked condition:
- Block only if current source cannot prove lifecycle semantics or a user-owned
  choice changes the public grammar; neither condition applies in pass 1.
- Do not use blocked while any research, review, ledger, source-grounding,
  score-hardening, or plan-hardening move remains runnable.

Plite Plan lane state:
- plite_plan_lane_status: complete
- current_pass: closure-score-and-final-gates
- current_pass_status: complete
- next_pass: none
- next_action: user review, then accepted-plan execution in a new implementation
  goal if requested
- final_handoff_status: complete

Current verdict:
- verdict: ready-for-user-review
- confidence: 0.94 final; every dimension remains >= 0.85, and the
  integrated revision now has one exact public grammar, one extension-author
  marker, one React policy vocabulary, bounded facade allocation, and no known
  internal contradiction; issue-sync and planning closure gates are complete
- keep / cut / revise call: keep `editor.update`; cut lifecycle wrapper names;
  revise update options into typed semantic policy and a configured direct
  facade.
- reason: the current callback-first API is correct for atomic work, but direct
  writes cannot carry lifecycle policy, forcing one-operation callbacks and raw
  metadata leaks.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every Plite Plan
  completion gate below is satisfied and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-15-plite-update-lifecycle-api.md` passes.
- Do not create hook state for this goal. This
  file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `plite-plan` selected for public Plite API law; `autogoal` applied as required lifecycle kernel |
| Active goal checked or created | yes | `get_goal` returned no active goal; planning goal created after requirement extraction |
| Source of truth read before edits | yes | `VISION.md`, `docs/vision/plite.md`, live lifecycle/history source, local legacy Slate/Plate source |
| `docs/solutions` checked for non-trivial existing-code work | yes | normalization and history behavior solutions found; no existing final lifecycle-policy API decision |
| Live `Plate repo root` grounding needed for current-state claims | yes | current-source audit run from `/Users/zbeyens/git/plate-2` |

Work Checklist:
- [x] Short objective plus lane outcome, full pass schedule, one-pass-per-
      activation policy, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] One-pass-per-activation policy respected, or marked N/A with reason.
- [x] Live source grounding recorded for every current implementation claim, or
      marked N/A with reason.
- [x] Issue ledger / ClawSweeper pass applied or skipped with concrete evidence.
- [x] Research and ecosystem synthesis complete for every external system used
      as evidence, or marked N/A with reason.
- [x] Intent/boundary record and decision brief complete.
- [x] Scorecard recorded with evidence; total score >= 0.92 and no dimension
      below 0.85 before closure.
- [x] Applicable implementation-skill review matrix applied or skipped with
      concrete reason.
- [x] Plite maintainer objection ledger complete for every breaking/paradigm
      change, or marked N/A with reason.
- [x] Verification workspace gate recorded for every Plite source, runtime,
      browser, package, public API, or issue-fix claim.
- [x] TDD used for behavior/proof changes with a sane test surface, or marked
      N/A: planning-only pass changed no behavior; execution has an eight-step
      RED-GREEN order and exact owner tests.
- [x] Browser proof captured for browser-surface claims, or marked N/A:
      planning-only pass changed no browser surface and makes no runtime claim;
      execution must Browser-verify the four named docs routes and focused
      behavior rows.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Final weighted score is 0.94 with every dimension >= 0.93; issue sync and all scheduled passes are closed | complete |
| Plite source, runtime, browser, package, public API, or issue-fix claim | yes | Planning-only current-state claims are grounded in the verification workspace table; no implementation/runtime/browser completion is claimed | complete |
| Issue ledger or PR reference changed | no | Sync the relevant ledger/reference row or record why no sync applies | N/A: ClawSweeper audit preserved all existing classifications and added no public claim |
| Autoreview for uncommitted implementation changes | no | N/A: this goal changed only its planning artifact and made no implementation patch; execution retains the mandatory autoreview gate | complete |
| Final user-review handoff | yes | Final API, cuts, issue posture, proof gates, and ordered execution handoff are recorded below and emitted to the user | complete |
| Goal plan complete | yes | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-15-plite-update-lifecycle-api.md` | passed 2026-07-15 |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | live API/runtime, legacy callers, VISION, and prior solution audit; preliminary score 0.79 | related issue discovery |
| Related issue discovery | complete | live GitHub search plus current Plite ledger reads: Slate #2658, #3467, #3874, #6038, PR #6063; Plate #4315 and #4413 | issue-ledger pass |
| Issue-ledger pass | complete | gitcrawl 0.5.0 current archive, live-state evidence from prior pass, durable ledger/dossier/matrix audit, and focused History proof; zero classification changes | intent/boundary pass |
| Intent/boundary and decision brief | complete | fixed Plite policy plus owner-defined tag presets; extension-policy generic rejected; public normalization wrapper/policy cut | research refresh |
| Research, ecosystem strategy, live-source refresh | complete | current official Slate, Lexical, ProseMirror, Tiptap, and Yjs docs; each mechanism reduced to a Plite steal/reject decision | pressure passes |
| Performance/DX/migration/regression/simplicity pressure passes | complete | cached lazy facade design; fixed `{ history?, tags? }` policy; tag-only lifecycle truth; 52-file production migration inventory; exact public behavior/type proof matrix | objection ledger |
| Plite maintainer objection ledger | complete | overload, optional-History typing, tag collisions, metadata provenance, cache mutation, Proxy cost, nested updates, normalization, presets, and migration burden steelmanned against live source | high-risk pass |
| High-risk deliberate mode | complete | eight concrete failure scenarios grounded in policy/tag precedence, dynamic extension exposure, historic replay, async tx lifetime, normalization, optional History, facade caching, and Yjs/selection behavior; blast radius, rollback, adoption, and proof routes added | ecosystem maintainer pass |
| Ecosystem maintainer pass | complete | live Suggestion/AI composition audit, Plite React hook/input ownership, extension generic derivation, current docs routes, and implementation-skill lenses; no policy composer or React surface survives | revision pass |
| Revision pass | complete | end-to-end contradiction audit against live `EditorUpdate` derivation, lifecycle Proxy runtime, History extension factory, React state-field setter, and all locked decisions; `txOnly` helper shape and semantic hook policy forwarding finalized | issue sync accounting |
| Issue sync accounting | complete | live GitHub state refreshed for Slate #2658, #3467, #3874, #6038, PR #6063, and Plate #4315/#4413; current gitcrawl sync, coverage matrix, dossier, and PR-reference rows reconciled; no classification, claim, ledger, dossier, matrix, or PR-text edit warranted | closure score and final gates |
| Closure score and final gates | complete | requirement-by-requirement audit; final 0.94 score with floor 0.93; planning-only TDD/Browser/autoreview gates closed honestly; final handoff filled; diff and strict checker pass | final handoff |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.94 | default facade stays allocation-stable; three history-only literal policies reuse bounded per-editor semantic facades; tagged objects use a WeakMap plus lazy cached groups/methods; callback policy updates allocate no facade; React only forwards policy and adds tags inside its existing callback |
| Plite-close unopinionated DX | 0.20 | 0.95 | capability-gated `{ history?, tags? }` is the sole vocabulary across editor direct/atomic forms and React setters; tx-local controls and package presets cover late/product intent without wrappers |
| Plate and collaboration migration backbone | 0.15 | 0.94 | 52 production files remain classified; Suggestion, AI streaming, typed React state-field policy, private native-input provenance, active-tx History replay, and tag-only Yjs remote ownership have exact routes |
| Regression-proof testing strategy | 0.20 | 0.93 | public behavior/type/browser matrix includes semantic literal caching, policy conflicts, async rollback, escaped tx, `txOnly` type/runtime rejection, historic replay, hidden normalization, optional-History runtime, React policy forwarding, and exact docs routes |
| Research evidence completeness | 0.15 | 0.93 | official ecosystem APIs plus live Plite update derivation, Proxy dispatch, History factory, React consumers, docs, and package callers are reconciled into the locked design |
| shadcn-style composability and minimalism | 0.10 | 0.95 | fixed two-field data, frozen owner presets, tag arrays, typed hook forwarding, and active-tx controls cover real composition; composer, registry, fluent builder, new React hook, and extension policy keys are rejected |

Weighted score: 0.94 final (0.9415 unrounded). Every dimension is >= 0.93, so
the 0.92 total and 0.85 per-dimension thresholds pass.

### Performance

- applicability: applied
- Vercel rules used: none; no React component, effect, subscription, bundle, or
  render path changes
- extra rules used: cohort-segmentation, repeated-unit-budget,
  memory-dom-tagging
- repeated unit: one public update invocation and, for configured direct DX,
  one policy-object lookup
- cohorts: normal = default user commands; large = repeated frozen product
  preset; stress = AI/collab streaming; pathological = a fresh history-only
  literal policy for every primitive operation inside a stream
- budgets: default update creates zero facade/group/method objects per call;
  history-only literals resolve to one of three stable per-editor facades by
  semantic value; repeated frozen tag preset creates zero after first use;
  policy lookup is O(1); callback policy creates no configured facade; no DOM/
  component/listener/effect/subscription delta
- React/runtime primitives: none; immutable compiled policy plus three bounded
  history-only semantic facades and a weak tagged-policy cache, with existing
  transaction/commit runtime unchanged
- interaction metrics: core microbenchmark compares default direct, repeated
  inline history literal, cached tagged preset direct, and policy callback for
  one text insert at p50/p95/p99 across three runs; `pnpm check:plite` guards
  typing/paste/undo/collab behavior
- trace/CWV proof: N/A; no load, layout, hydration, or render claim
- memory tags: history-only configured facades are capped at three per editor;
  tagged facade count is bounded by live policy objects through `WeakMap`;
  dynamic group/method caches are bounded by installed API shape
- degradation contract: none; document, normalization, DOM, selection, IME,
  history, and collaboration behavior stay native/current
- dashboard/RUM gap: N/A for a local API allocation claim; no production speed
  claim is accepted from this plan
- plan delta: cache default/configured dynamic paths, add focused update-policy
  benchmark and behavioral proof, and reject fluent proxy chains

Source-backed architecture north star:
- target shape: `editor.update(policy).nodes.insert(...)` for one operation and
  `editor.update(policy, (tx) => ...)` for atomic multi-operation work; default
  `editor.update((tx) => ...)` remains the no-policy form.
- source evidence: `packages/plite/src/interfaces/editor.ts:319-329,759-879,1512-1516`;
  `packages/plite/src/core/editor-lifecycle-api.ts:257-336`;
  `packages/plite-history/src/history-extension.ts:57-103`.
- rejected drift: callback-wrapped one-operation writes, raw metadata at app
  call sites, lifecycle helpers named as temporary global mutation wrappers,
  per-transform lifecycle option parameters, and fluent arbitrary policy chains.
- migration posture: breaking hard cut with mechanical mappings and no aliases.
- ownership rule: Plite owns one fixed `EditorUpdatePolicy` with only `history`
  and `tags`, its lowering to canonical tags, and tx-local tag/history controls.
  `history` availability is inferred from the installed `tx.history` capability;
  arbitrary extensions cannot add policy keys. Plate/React/collab packages own
  frozen tag presets and consumers.

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| Update policy | `editor.update({ history: 'skip' }).nodes.insert(node, options)` with `EditorUpdatePolicy = { history?, tags? }` | one-operation write stays one operation; no lifecycle metadata vocabulary | hard-cut raw metadata call sites | current direct facade lacks options; history and tags cover every public wrapper class | revise |
| Atomic update | `editor.update({ history: 'new-batch' }, (tx) => { ... })` | callback signals actual transaction grouping | replace callback-first options ordering | current `editor.update(fn, options?)` | revise |
| Default atomic update | `editor.update((tx) => { ... })` | unchanged when no policy is needed | none | accepted lifecycle in `docs/vision/plite.md` | keep |
| Product policy preset | `editor.update(SuggestionUpdatePolicy.skip).nodes.insert(...)` | Plate owns a frozen plain preset such as `{ tags: 'suggestion:skip' }`; Plite sees only tags | replace temporary plugin-option mutation | current Suggestion `withoutSuggestions` mutates persistent `isSuggesting` state | move to Plate |
| Collaboration preset | `editor.update(YjsUpdatePolicy.remote).statePatches.replay(...)` | frozen tag-only preset carries collaboration, remote import, history skip, and selection-effect tags | replace raw metadata bags in adapters/examples | current Yjs options already duplicate canonical tags and metadata | move preset to collab owner |
| Transaction-local control | `tx.history.skip()` / `merge()` / `newBatch()` and `tx.tags.add()` / `has()` | late history decisions replace the prior history-mode tag; last call wins; additive tags remain a set | history controls lose callback overloads and are marked tx-only so `editor.update.history.skip()` is absent/rejected; cut `tx.metadata.merge` and `tx.withoutNormalizing` | current tx controls, generic direct update derivation, and tag Set would otherwise permit contradictory history tags or a silent empty direct control | revise with exclusive family |
| Capability typing | `history` is accepted only when installed tx groups include `history`; tag-only policies work on every editor; `EditorUpdatePolicyFor<E>` supports generic helpers | preserves current no-history editor type errors without extension-owned policy keys and rejects erased/JS misuse at runtime | fixed conditional availability plus installed-capability runtime guard | generic React/core contracts prove disabled History removes `tx.history`; runtime currently has the tx-group registry needed for validation | keep inference; add runtime guard |
| Normalization lifecycle | plain `editor.update((tx) => { ... })`; `tx.normalize()` only for a proven intermediate invariant barrier | the update transaction defers final normalization until commit and an explicit barrier says exactly when later work needs repaired structure | remove public `withoutNormalizing`; do not let callers suppress hidden normalizers in other transforms | `runEditorTransaction` normalizes once at outer completion; `footnote` and `layout` already model real barriers explicitly; `unwrapNodes` contains the hidden exceptional normalize | cut wrapper; repair hidden barrier |

Locked type grammar:
```ts
type EditorUpdatePolicy = Readonly<{
  history?: 'merge' | 'new-batch' | 'skip';
  tags?: EditorUpdateTagInput;
}>;

type AvailableEditorUpdatePolicy<TTx> = Readonly<{
  tags?: EditorUpdateTagInput;
}> &
  ('history' extends keyof TTx
    ? Pick<EditorUpdatePolicy, 'history'>
    : { history?: never });

type EditorUpdate<V, TExtensions> = {
  (fn: EditorUpdateCallback<V, TExtensions>): void;
  (
    policy: AvailableEditorUpdatePolicy<EditorUpdateTransaction<V, TExtensions>>,
    fn: EditorUpdateCallback<V, TExtensions>
  ): void;
  (
    policy: AvailableEditorUpdatePolicy<EditorUpdateTransaction<V, TExtensions>>
  ): EditorUpdateMethods<V, TExtensions>;
} & EditorUpdateMethods<V, TExtensions>;

type EditorUpdatePolicyFor<E extends BaseEditor> =
  E extends BaseEditor<infer V, infer TExtensions>
    ? AvailableEditorUpdatePolicy<
        EditorUpdateTransaction<V, TExtensions>
      >
    : never;

declare const TX_ONLY_METHOD: unique symbol;

export type TxOnlyMethod<
  TMethod extends (...args: any[]) => any,
> = TMethod & { readonly [TX_ONLY_METHOD]: true };

export declare const txOnly: <
  TMethod extends (...args: any[]) => any,
>(method: TMethod) => TxOnlyMethod<TMethod>;

type EditorDirectExtensionMethods<TGroup> = {
  [K in keyof TGroup as TGroup[K] extends TxOnlyMethod<any>
    ? never
    : K]: TGroup[K] extends (...args: any[]) => any
    ? BivariantFunction<TGroup[K]>
    : TGroup[K];
};
```

Extension-author typing law:
- keep `EditorUpdatePolicyFor<E>` as the only exported generic-helper utility;
  it is a shallow capability conditional, not a recursive editor-type mapper
- export one `txOnly(method)` extension-author helper returning the opaque
  `TxOnlyMethod<T>` type; its non-enumerable runtime brand uses a module-private
  `unique symbol`, so authors cannot forge or coordinate a second marker
- filter `TxOnlyMethod` keys out of direct `EditorUpdateMethods` before applying
  the existing bivariant callback mapping; dynamic direct dispatch checks the
  same brand before invocation and throws with no committed change
- mark History `skip`, `merge`, and `newBatch` tx-only; ordinary extension tx
  transforms remain callable through `editor.update.<group>.<method>()`
- preserve callback inference from the configured editor. Do not annotate local
  `(tx)` parameters merely to satisfy the migration
- declare exported presets with
  `Object.freeze({ ... } satisfies EditorUpdatePolicy)` so tag-only presets
  retain a narrow shape and remain valid on editors without History

Preset composition law:
- do not add `composeUpdatePolicies`, policy arrays, a preset registry, or a
  fluent builder. Real Suggestion and AI callers need at most semantic history
  plus one or more ordered tags, already represented by the two fields
- owner packages export a small complete frozen preset for repeated intent and
  a namespaced tag constant only when callers genuinely combine that tag with
  another owner tag
- inside an active update, add late product intent with `tx.tags.add(...)` and
  late history intent with `tx.history.*()`; do not nest another policy facade

Policy compiler law:
- apply `tags` in input order, then apply the semantic `history` field so it
  wins any initial conflict
- `history: 'merge'` -> replace the exclusive history family with
  `history-merge`
- `history: 'new-batch'` -> replace the exclusive history family with
  `history-push`
- `history: 'skip'` -> replace the exclusive history family with `history-skip`
- later `tx.history.*()` or canonical history tags replace that family again;
  the last explicit transaction-local decision wins
- all other `tags` are additive and deduplicated into one frozen commit snapshot
- configured policy objects are read once; later caller mutation never changes a
  configured facade
- supplying `history` without an installed History tx group throws before the
  transaction starts, even from JavaScript or widened TypeScript

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| Public lifecycle | Plite core only | fixed `{ history?, tags? }` policy compiles to one deduplicated immutable tag set before transaction start | application knowledge of metadata encoding and extension-policy generic growth | lifecycle API, existing canonical tags, History tag consumers | revise |
| Commit metadata | Plite core runtime | retain only internal provenance that cannot be represented as lifecycle tags; remove public update authoring and history/collab/selection duplicate fields | two competing lifecycle truth channels | current metadata consumers all map to existing/new canonical tags except native-input provenance | internalize and shrink |
| Normalization skip | Plite core runtime | internal adapter/replay authority only | publicly leaving invalid trees | `skipNormalize` bypasses final top-level normalization | internalize |
| Update tags | Plite core transport; owner-defined constants in consuming packages | public `tags` policy plus `tx.tags.add/has`; add canonical `history-skip`; one core reducer treats `history-push` / `history-merge` / `history-skip` as an exclusive last-writer-wins family; History/React/Yjs consume the final tags as sole lifecycle truth | contradictory history tags, top-level product keys, metadata duplication, and temporary global option mutation | current snapshot is a Set with no conflict law; History consumers branch by tag-check order; React/Yjs tags are otherwise additive | revise with reducer |
| Configured facade | Plite lifecycle factory | default facade built once; three per-editor history-only semantic facades cached by value; object policies with tags use `WeakMap<policy, facade>`; compiled immutable policy snapshot; lazy cached group/method proxies; callback policy path creates no facade | fresh inline `{ history: 'skip' }` objects allocating facades in streaming loops, per-keystroke proxy churn, and unbounded strong caches | docs and AI callers naturally use inline history literals; current lifecycle API recreates dynamic extension proxies on property reads | revise and improve |
| Tx-only extension methods | Plite extension substrate | public extension-author `txOnly(method)` returns opaque `TxOnlyMethod<T>` using one private runtime brand; direct method mapping filters it before bivariance and dynamic dispatch rejects it before invocation | silent no-op `editor.update.history.skip()` after callback removal, forgeable string flags, and a bespoke History-only type exception | extension type providers already describe tx groups separately from runtime factories; History can type controls as `TxOnlyMethod` and wrap its returned runtime functions with the same helper | add generic helper |
| Synchronous tx lifetime | Plite core | reject thenable callback results inside the transaction so synchronous mutations roll back; mutation/control methods verify the active transaction token so escaped tx cannot write | partial commits from `editor.update(async (tx) => ...)` and post-commit mutation through captured tx/plugin methods | TypeScript permits async functions for void callbacks; current tx views close over editor state and not every extension/state mutation starts an authorized transaction | add runtime law |
| Nested updates | Plite core and History | reject public `editor.update*` while an update is active; active code uses `tx`; History undo/redo applies replay and private skip-normalize authority in the existing transaction rather than calling `editor.update` again | hidden nested transaction/policy merging, broken undo after the hard cut, and migrated anti-patterns | current runtime permits nested depth; Plate audit found nested direct updates; `runHistoricUpdate` starts a public update from `tx.history.undo/redo` | hard cut plus History repair |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| React selection effects | `PliteReactUpdatePolicy.preserveSelection` or `YjsUpdatePolicy.remote`; middleware may call `tx.tags.add(...)` | Plite React consumes canonical commit tags; no React-specific core policy fields | zero new hook, component, subscription, render, or effect work | `selection-side-effect-policy.ts` already checks matching tags beside duplicate metadata | move to tags |
| `useSetStateField` | returned `StateFieldSetter<TValue, TEditor>` accepts `(value, policy?: EditorUpdatePolicyFor<TEditor>)`; it always appends selection-preservation tags | the hook forwards the same semantic policy vocabulary as `editor.update` while privately owning its external-control focus/selection invariant; no raw runtime options survive | one existing `useCallback`; no new state, effect, subscription, or render work | current hook already accepts options for history/tags/collab and merges selection metadata; dropping all policy would force advanced callers to abandon the hook | narrow to semantic policy |
| Native input/composition | React runtime calls one private core update entry with typed native-input provenance plus semantic history/tags | provenance stays internal; composition/history modes lower to the same public semantic machinery without exposing origin records | no new React public API and no extra commit | `input-history.ts` and composition state currently construct lifecycle metadata | internalize |
| React hooks/components | no new surface | update policy is editor runtime DX, not React state | default/cached policy paths must not trigger render work before commit | lifecycle factory and commit subscription boundaries | keep unchanged |

Plate migration-backbone target:
| Pressure | Plite substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| `withoutSuggestions` | fixed Plite tags policy and tx tag access | Plate exports `SuggestionUpdatePolicy.skip`; Suggestion middleware reads the active tx tag | Plite does not know a `suggestions` policy key | `BaseSuggestionPlugin.ts`, `withSuggestion.ts`, current wrapper callers | move |
| Plugin history modes | public history policy plus `tx.history.*` | NodeId/AI/math/suggestion use semantic history controls | Plate does not write commit metadata directly | current `tx.metadata.merge` and raw app metadata callers | revise |
| Multi-op transforms | one outer `editor.update`; only `tx.*` inside | migrate list/table/diff/selection wrappers and nested updates by classified lane; behavior-sensitive normalization callers are not mechanical | no compatibility wrapper or nested update allowance | current `update.withoutNormalizing` and `tx.withoutNormalizing` inventory plus hidden `unwrapNodes` normalize | hard cut |

Collaboration migration-backbone target:
| Pressure | Plite substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| Remote replay | tag-only core policy transport | Yjs exports frozen `YjsUpdatePolicy.remote` containing `collaboration`, `remote-yjs-import`, `history-skip`, and selection-preservation tags | core does not import Yjs or register a collab resolver | `packages/yjs/src/core/editor-adapter.ts`, React selection policy, History tag paths | move preset |
| Commit truth | one immutable tag set after policy lowering | History, React selection effects, and Yjs consume the same tags; internal provenance metadata remains separate | no second collaboration/lifecycle mutation API | current consumers already contain tag fallbacks | revise to one truth |

Documentation and example topology:
| Existing page | Owns | Must teach | Must not teach | Execution proof |
|---------------|------|------------|----------------|-----------------|
| `/docs/plite/concepts/07-editor` | update mental model and form selection | direct default, configured direct, atomic callback, configured atomic, package presets, and active-tx rule | raw metadata, normalization/history wrappers, or the false claim that extension methods are never direct | `pnpm --filter www check:docs`; dev server plus Browser route proof |
| `/docs/plite/api/nodes/editor` | exact overloads, policy fields, capability typing, sync lifetime, tx-only controls, and return behavior | `EditorUpdatePolicy`, `EditorUpdatePolicyFor<E>`, history capability error, tag order, and thenable/nested rejection | migration prose or internal provenance/normalization authority | docs check plus Browser route proof |
| `/docs/plite/walkthroughs/07-operation-replay-substrate` | adapter replay and commit observation | owner remote preset, internal adapter origin, commit tags, and active replay transaction | app-authored `metadata`, exported lifecycle metadata, or duplicate sample declarations | docs check plus Browser route proof |
| `/docs/plite/concepts/14-document-state` | state-field writes and external controls | `useSetStateField(field)(value, policy?)` with typed lifecycle policy and automatic selection preservation | raw hook update options or remote metadata bags | docs check plus Browser route proof |

- no new page or navigation entry is justified; the current four owners already
  divide concept, reference, replay, and state-hook concerns cleanly
- update the Plite library export reference only if new public types/constants
  are not already surfaced by generated API reference; never hand-edit generated
  registry/template output
- all prose describes the final API as current truth. No changelog voice,
  before/after migration section, or wrapper nostalgia
- because execution changes `content/**`, start the relevant www dev server and
  verify all four routes with Browser before handoff

Migration inventory:
| Class | Production files | Mechanical target | Owners / representative files | Gate |
|-------|-----------------:|-------------------|-------------------------------|------|
| `editor.update.withoutNormalizing` / `tx.withoutNormalizing` | 29 occurrences across 26 production files | delete wrapper; keep one outer `editor.update`; inline active `tx` body unless later work needs a proven `tx.normalize()` barrier | list, table, code-block, diff, selection, layout, link, media, toggle; `unwrapNodes` hidden-normalize callers get behavior review rather than blind replacement | no public occurrences; explicit barrier tests stay green |
| `editor.update.history.skip/merge/newBatch(fn)` | 10 | `editor.update({ history: mode }, fn)`; configured direct facade for true one-op calls | ai, media, apps/www, Plite examples | callback controls absent; undo behavior green |
| `tx.metadata.merge(...)` | 6 | `tx.history.*()` or `tx.tags.add(...)`; internal provenance setter only where native input requires structured data | NodeId, math, suggestion, Yjs, Plite History | no public tx metadata API |
| `withoutSuggestions` | 10 | outside update: `editor.update(SuggestionUpdatePolicy.skip, fn)`; inside update: `tx.tags.add(SUGGESTION_SKIP_TAG)` | Suggestion transforms, registry kit/UI | no persistent option mutation |
| raw update `metadata` / `skipNormalize` / `tag` options | 7 | public `{ history?, tags? }`; private internal authority for initial seed/Yjs replay only | document-state, ai-kit, Plite History/React/core | no public raw option bag |
| `value.replace(input, { history, normalize, tag, metadata })` | 4 production policy callers | `editor.update(policy).value.replace(input)`; public replace always normalizes; core seed/Yjs use internal authority | core initialization, AI editor, Yjs adapter | `EditorValueReplaceOptions` removed |
| duplicate lifecycle metadata consumers | History/React/Yjs core paths | canonical tags, adding `history-skip`; retain only internal native-input provenance | history-extension, selection-side-effect-policy, Yjs controller | history/collab/selection metadata fields removed |
| nested public updates | dynamic sweep plus runtime guard | use active `tx`; `updateEditor` throws when transaction depth > 0 while internal nested transform runtime remains legal | all migrated transforms/extensions | focused rollback test plus full typecheck |

Intent / boundary record:
- intent: replace the Slate/Plate scope-wrapper vocabulary with one explicit,
  typed update-policy model that makes the common one-operation case clean.
- outcome: execution-grade public API, runtime lowering, migration, and proof plan.
- in-scope: Plite update lifecycle, History controls, normalization deferral,
  collaboration/selection effects, update tags, and package-owned plain policy
  presets.
- non-goals: renaming unrelated `withComponent`, extension composition helpers,
  local utility names, or changing editor behavior in planning mode.
- decision boundaries: Plite owns a fixed lifecycle policy and tag transport;
  Plate plugins own persistent options and named tag presets; collab owns its
  policy presets; no owner augments Plite's policy type.
- unresolved user-decision points: none; remaining questions are evidence and
  exact naming questions owned by later plan passes.

Decision brief:
- principles: one obvious grammar; direct for one operation; callbacks mean
  atomic grouping; semantic policy over metadata encoding; capability ownership;
  no compatibility sludge.
- top drivers: eliminate callback boilerplate, prevent raw metadata leakage,
  compose history/collab/selection policy, preserve late tx-local decisions.
- viable options: fixed policy plus tags; extension-augmented policy keys;
  executable policy tokens; extension namespace wrappers; arbitrary fluent
  policy chain; per-method lifecycle options.
- chosen option: options-first configured facade backed by one fixed plain
  `{ history?, tags? }` policy; installed `tx.history` capability gates the
  history field; policy history lowers to canonical tags; owner packages export
  frozen tag presets; active transactions use no-arg history and tag controls.
- rejected alternatives: namespace wrappers do not compose; fluent chains create
  order/typing/runtime complexity; per-method options pollute every transform;
  extension-augmented policy keys infect Plite generics and collide globally;
  executable tokens create another runtime protocol; raw metadata exposes
  implementation encoding.
- consequences: breaking `EditorUpdate` overload/type/runtime work, deletion of
  public lifecycle metadata and value-replace options, a 52-file production
  migration, Plate/collab preset APIs, and stronger docs/type/proof burden.
- follow-ups: objection, high-risk, ecosystem-maintainer, revision, issue sync,
  and closure passes.

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| Slate #2658 | Related design evidence | A single transaction concept was proposed specifically to replace `without*`; the thread also calls `withoutNormalizing` misleading and shows nested wrapper composition pain. | Directly validates the problem statement, not the final Plite syntax. | live issue is closed, refreshed 2026-07-15; body/comments read earlier | outside current frozen v2 rows; no row required | no claim |
| Slate #3467 | Related behavior law | `withoutNormalizing` defers normalization; it intentionally does not disable it. | Locks target vocabulary to `defer`, and argues against public `skipNormalize`. | live issue is closed, refreshed 2026-07-15; current Plite normalization runtime remains authority | outside current frozen v2 rows; no row required | no claim |
| Slate #3874 | Related history semantics | One high-level action needs an isolated undo batch; normalization and optional history are distinct concerns. | Rejects a magic transaction mode that accidentally couples normalization and history. | live issue remains open, refreshed 2026-07-15; sync row remains `cluster-synced` and grouped dossier row remains Related | preserve `cluster-synced`; policy planning is not exact issue proof | no claim |
| Slate #6038 | Existing `Improves`, unchanged | Batch-aware apply performance is a runtime-engine concern, not proof that a policy facade is faster. | Prevents API cleanup from overclaiming batch performance. | live issue remains open, refreshed 2026-07-15; sync ledger, coverage matrix, and dossier agree on benchmark-owned `Improves` | preserve `improves-claimed`; policy benchmark cannot promote it | unchanged |
| Slate PR #6063 | Related failure evidence | Callback wrappers backed by mutable ambient flags require exception-safe and nesting-safe restoration. | Supports compiling immutable policy before transaction entry instead of adding more mutable wrapper state. | live PR remains open and unmerged, refreshed 2026-07-15 | external failure evidence only; no v2 issue or PR-reference row | no claim |
| Plate #4315 | Related product pressure | Plugin-owned initialization writes must skip history without exposing history internals. | Concrete Plate caller for `{ history: 'skip' }`. | live Plate issue is closed, refreshed 2026-07-15; explicitly distinct from unrelated Slate #4315 ledger row | Plate product evidence only; no Slate v2 row | no claim |
| Plate #4413 | Not claimed | The issue happens inside `withoutNormalizing`, but its failure is stale clipboard data, not lifecycle policy. | Avoids laundering incidental wrapper usage into architecture evidence. | live Plate issue is closed, refreshed 2026-07-15 | N/A: incidental call-site context is not claim evidence | no claim |

Issue-ledger sync status:
- live GitHub refresh: complete 2026-07-15; Slate #3874/#6038 and PR #6063
  remain open, Slate #2658/#3467 remain closed, and Plate #4315/#4413 remain
  closed
- gitcrawl health: current 0.5.0 archive, 664 open Slate threads, healthy source
  database, last sync 2026-07-12; live `gh` owns state newer than that snapshot
- ClawSweeper related-issue pass: complete; no duplicate, stale, invalid, or
  claim-level change found
- manual v2 sync ledger update: N/A; #3874 remains exact as `cluster-synced`
  and #6038 remains exact as `improves-claimed`
- fork issue dossier update: N/A; #6038 remains benchmark-owned `Improves`, and
  grouped #3874 accounting already says Related with no API closure claim
- issue coverage matrix update: N/A; #6038 remains `Improves` without an
  accepted full-issue threshold; #3874 has no exact matrix claim to promote
- PR description sync: N/A; the reference intentionally contains no #3874 or
  #6038 line, and this planning-only API decision adds no `Fixes`/`Improves`
  text
- closed external evidence update: N/A; Slate #2658/#3467 and Plate #4315 are
  design/product inputs, while Plate #4413 remains explicitly not claimed

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Plite target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| Slate | [Editor](https://docs.slatejs.org/api/nodes/editor), [HistoryEditor](https://docs.slatejs.org/libraries/slate-history/history-editor) | callback scopes mutate ambient normalization/history flags; `withoutNormalizing` defers and history exposes four wrapper variants | per-operation option repetition | synchronous grouping semantics and exact history behavior law | wrapper vocabulary, ambient flags, and separate `withoutMerging` ambiguity | one explicit update transaction with `history: 'merge' | 'new-batch' | 'skip'`; normalization is implicit | replace |
| Lexical | [Updates](https://lexical.dev/docs/concepts/updates) | one synchronous `editor.update`, option tags, in-update add/has, listener-visible tag sets, exported constants; nested updates are described as deprecated | wrapper proliferation and product-specific core fields | tags as transport, owner constants, tx-local add/has, built-in semantic policy lowering, nested-update hard cut | callback-first-only DX and raw string literals at call sites | fixed policy for core semantics plus namespaced tag presets for product modes | steal selectively |
| ProseMirror | [Transaction reference](https://prosemirror.net/docs/ref/#state.Transaction) | one transaction accumulates document/selection changes; semantic `scrollIntoView` and `closeHistory`; plugin-keyed raw metadata | nested dispatch and separate effect wrappers | active transaction object and semantic late controls | public `setMeta(key, any)` and plugin-key runtime protocol | active `tx` only, typed semantic controls, raw metadata internal | steal selectively |
| Tiptap | [Commands](https://tiptap.dev/docs/editor/api/commands), [setMeta](https://tiptap.dev/docs/editor/api/commands/set-meta) | extension-owned commands chain into one held transaction; custom commands must use the provided chain/transaction | independent dispatch for each command | package-owned named commands and the rule to reuse the active transaction | `.chain().…run()` as Plite core grammar and `setMeta(string, any)` | direct configured facade for one operation; callback plus `tx` for multiple operations | reject core chain, keep ownership law |
| Yjs | [Y.Doc](https://docs.yjs.dev/api/y.doc), [UndoManager](https://docs.yjs.dev/api/undo-manager) | explicit transaction boundary, identity-bearing `origin`, selective tracked origins, and `stopCapturing` history boundary | echo loops and global collaboration flags | adapter-owned origin identity and package-owned remote preset | pretending collaboration origin is a generic serializable application enum | core transports opaque/internal origin; Yjs preset lowers remote/history/effect policy | steal selectively |
| Plite | `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/core/public-state.ts`, `packages/plite-history/src/history-extension.ts` | immutable commit metadata/tags, one outer normalization boundary, dirty-region tracking, and active tx facade | second transaction model | preserve commit truth and dirty runtime | expose metadata/skipNormalize or retain public normalization scopes | semantic authoring policy lowers once into existing commit truth | revise |

Hybrid runtime thesis check:
- Lexical-style dirty runtime buckets: keep; Plite already records dirty paths,
  runtime ids, and regions. The policy API must not add a second dirtiness path.
- ProseMirror-style bulk replace/fitting: orthogonal; large paste/fragment
  insertion remains owned by transform/runtime algorithms, not lifecycle policy.
- Tiptap-style extension paste hooks: keep at the Plate product boundary;
  feature hooks may export policy presets but do not extend core policy fields.
- verdict: retain the hybrid architecture and keep this plan behavior-neutral;
  no external system justifies a normalization switch or fluent command runtime.

Legacy regression proof matrix:
| Regression class | Legacy behavior | Plite target | Proof route | Owner | Status |
|------------------|-----------------|-----------------|-------------|-------|--------|
| Public grammar and inference | callback options, extension wrapper methods, disabled-History group inference | direct configured and policy-first atomic overloads; `history` rejected without installed capability at type/runtime; generic `EditorUpdatePolicyFor<E>`; tx-only controls omitted from direct update | new `packages/plite/test/generic-update-policy-contract.ts` plus Plite/React generic contracts; JS/widened runtime rows; package typechecks | Plite types/runtime | planned |
| Direct and atomic commits | one direct method or one callback publishes one commit | policy direct and synchronous policy callback preserve one commit, return values, context, tags, selection, and rollback; thenables roll back | new `packages/plite/test/update-policy-contract.ts` public tests including async/captured tx | Plite core | planned |
| Policy precedence and leakage | wrapper flags restore after synchronous scope | immutable policy snapshot; input tags then semantic field; late tx mode is last-write-wins; final history family has <=1 tag; throw/thenable rolls back with no leak | same public contract, table-driven permutations, one behavior per TDD vertical slice | Plite core | planned |
| Nested writes | current public nested update merges into outer depth; History replay relies on it | nested public `editor.update*` throws; internal transform nesting remains legal; History replay uses active tx and private authority | focused public contract, full History replay matrix, existing transform/normalization suites | Plite core/History | planned |
| Normalization | `withoutNormalizing` defers until wrapper exit and can suppress hidden transform normalize | one outer update defers final repair; `unwrapNodes` no longer exposes a remotely suppressible barrier; exact `tx.normalize()` remains for dependent later work; public replace always normalizes | normalization/snapshot contracts plus adversarial link/list/code-block and footnote/layout rows | Plite core and package owners | baseline green; target rows planned |
| History | skip/merge/newBatch wrapper behavior, nested replay, and selection restoration | semantic policy plus exclusive final tags and tx-only no-arg controls preserve undo batches; undo/redo replay in active tx | `packages/plite-history/test/integrity-contract.ts`, history/document-state/multi-root/Yjs contracts | Plite History | baseline 10/10 green; active-tx migration planned |
| Selection effects | metadata and duplicate tags suppress DOM sync/focus/scroll | canonical tags alone preserve every side effect decision | repair `selection-side-effect-policy-contract.ts` into owned Vitest test, then Plite React suite | Plite React | current file misowned/source-dist split; execution repair required |
| Collaboration | metadata plus tags prevent echo/history/focus changes | frozen Yjs remote preset tags are sole lifecycle truth and work with History enabled or absent | `packages/yjs/test/remote-import-contract.spec.ts`, collab runtime contracts, History-on/off matrix | Yjs/collab | baseline 2/2 green; target rows planned |
| Migration closure | old wrappers and raw lifecycle metadata compile today | all owned packages/examples compile without aliases | targeted `rg`, modified-package turbo typechecks, `pnpm lint:fix`, `pnpm check:plite` | Plite/Plate owners | planned |
| Allocation | dynamic extension proxies are recreated on property access | default and repeated preset facades reuse cached group/method paths | new `benchmarks/slate-v2/donor/core/current/update-policy.mjs`, three-run p50/p95/p99 artifact | Plite core | planned |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| selection policy | remote/programmatic update preserves DOM selection, focus, and scroll according to canonical tags | Chromium | `pnpm --filter plite test:plite-browser:chromium examples/richtext.test.ts --grep 'selection|focus|scroll'` | no focus theft, scroll jump, or stale DOM selection | planned |
| history policy | one-op skip and multi-op new batch remain correct through real input/undo | Chromium | focused richtext undo/history rows through Plite browser harness | undo boundaries match policy | planned |
| normalization removal | migrated paste/list/table multi-op commands commit valid trees without intermediate repair | Chromium | focused affected Plite/browser rows plus package tests | final valid tree and stable selection | planned |
| collaboration preset | remote Yjs update does not echo, enter local history, or steal focus | Chromium | focused Plite Yjs example/browser row and Yjs package contract | one remote commit, no echo/history/focus regression | planned |
| release closure | full affected browser/package matrix | daily Chromium lane | `pnpm check:plite` | package tests, browser tests, and app proof all green | planned |
| cross-browser matrix | no new browser algorithm or UI surface | Firefox/WebKit/mobile | N/A for planning; run `pnpm check:plite:browser-matrix` only if execution changes browser behavior beyond tag consumption | no unjustified closure-only cost | gated |

TDD execution order:
1. RED→GREEN configured direct history skip through the public editor.
2. RED→GREEN policy-first synchronous atomic update, commit/tag observation,
   thenable rollback, and captured-tx rejection.
3. RED→GREEN capability inference/runtime validation,
   `EditorUpdatePolicyFor<E>`, extension-group inference, and tx-only direct
   omission/runtime rejection.
4. RED→GREEN tx tag add/has, exclusive history-family permutations, dedupe,
   exception cleanup, and immutable configured snapshot.
5. RED→GREEN History undo/redo in the active tx, then nested public update
   rejection with outer rollback.
6. RED→GREEN tag-only History, React selection effects, and Yjs remote replay
   with History enabled and absent,
   migrating one owner at a time.
7. RED→GREEN `unwrapNodes` barrier repair and adversarial package normalizers.
8. Migrate Plate packages in owner-sized slices; run their focused behavior and
   type proof before the next slice.

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| Archive readiness | plate-2 | `gitcrawl status --json`; `gitcrawl doctor --json` | pass 2026-07-15: current, healthy 0.5.0 archive; 664 open Slate threads; last sync 2026-07-12 | ClawSweeper |
| Exact issue provenance | plate-2 | live `gh issue/pr view --json` for Slate 2658, 3467, 3874, 6038, PR 6063, and Plate 4315/4413; gitcrawl neighbor reads for #3874/#6038 | refreshed 2026-07-15: Slate #3874/#6038 and PR #6063 open; Slate #2658/#3467 and Plate #4315/#4413 closed | ClawSweeper |
| History transaction semantics | plate-2 | `bun test ./packages/plite-history/test/integrity-contract.ts --test-name-pattern 'newBatch|skip'` | pass: 3 tests, 0 failures | plite-history |
| Ledger consistency | plate-2 | targeted `rg` across live/sync/open ledgers, dossier, coverage matrix, and PR description | #3874 remains cluster-synced/Related; #6038 remains improves-claimed in ledger/matrix/dossier; PR description has no broadened line; no conflicting claim or edit required | ClawSweeper |
| Policy ownership and normalization boundary | plate-2 | targeted source reads of `interfaces/editor.ts`, `extension-registry.ts`, `public-state.ts`, History, Suggestion, Yjs, and Plate call sites | extension types intersect API/state/tx and currently derive every tx method into direct update; outer update owns final normalization; `unwrapNodes` is the hidden barrier; product-specific one-update state belongs in tags/presets | Plite Plan |
| Ecosystem transaction grammar | official upstream docs | Slate Editor/HistoryEditor, Lexical Updates, ProseMirror Transaction/history, Tiptap commands/setMeta, Yjs Y.Doc/UndoManager | tags, active transaction reuse, history boundaries, and adapter origins support fixed policy plus presets; fluent chains and raw metadata rejected | Plite Plan |
| Migration blast radius | plate-2 | targeted production `rg` for normalization/history/Suggestion/metadata/raw options and value-replace policies | 29 normalization-wrapper occurrences across 26 files, 10 history-callback files, 6 tx-metadata files, 10 Suggestion-wrapper files, 7 raw-option files; 52 unique production files in combined wrapper/metadata sweep | Plite Plan |
| High-risk lifecycle source audit | plate-2 | direct reads of update Proxy derivation, transaction tag Set/context, sync callback execution, write authority, History tx controls/replay, React selection tags, and Yjs remote filtering | contradictory history tags have no reducer; every extension tx method is direct; callback result is discarded; History undo/redo starts a nested public update; remote/selection consumers already have tag paths | Plite Plan |
| Current behavior baseline | plate-2/package roots | focused Plite core, Plite History, and Yjs tests | pass: 29 core + 10 History + 2 Yjs = 41; normalization, commit metadata, update grouping, history batches, and remote import currently covered | Plite/History/Yjs |
| React selection baseline | plite-react | Bun source run then owned Vitest attempt | blocked as current test-infrastructure debt: file is excluded by Vitest naming and Bun mixes Plite source/internal with stale `dist`; behavior source read, no green claim | Plite React |
| React consumer ownership | plate-2 | direct reads of `use-state-field.ts`, selection-effect policy, root interaction, caret, composition, and input-history sources | hook option bag only forwards lifecycle metadata; selection intent already maps to tags; native input is the sole structured private provenance; no new React primitive is warranted | Plite React |
| Extension-author typing | plate-2 | direct read of generic extension namespace contract and update-method derivation | ordinary tx transforms must stay direct; only branded standalone-meaningless controls are filtered before bivariance; one shallow policy conditional suffices | Plite types |
| Docs topology | plate-2 | full reads of editor concept, Editor API, document-state concept, and replay walkthrough | four existing pages own all teaching; current prose exposes raw metadata, callback-last options, a false direct-extension restriction, and duplicate replay sample text | Plite docs |
| Integrated revision | plate-2 | direct reread of `EditorUpdateMethods`, dynamic lifecycle Proxy dispatch, History type provider/runtime tx factory, and `useSetStateField` | `txOnly(method)` must bind type and runtime marking; React setter should keep optional semantic policy rather than raw options or value-only austerity; no other locked decision conflicts with live ownership | Plite Plan |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | no | skipped | no React component, render, subscription, effect, or bundle change | keep React surface unchanged |
| performance | yes | applied | hot repeated unit is update invocation; current dynamic extension paths allocate proxies on property reads and inline history objects are natural in streaming code | cached lazy default/configured facades, three semantic history facades, weak tagged-policy cache, benchmark gate |
| tdd | yes | applied for execution plan | public behavior and generic inference need vertical slices; dead-API assertions are forbidden | exact tracer order and public/type contracts added |
| typescript-advanced-types | yes | applied | policy capability is one shallow conditional; direct extension mapping must remove branded tx-only methods before bivariance; presets use `satisfies` | exact marker order, preset typing, inference, and negative type tests added |
| react | yes | applied | update policy is runtime data, not React state; `useSetStateField` can own selection preservation while forwarding only `EditorUpdatePolicyFor<TEditor>`; native provenance stays private | no new hook/effect/subscription; narrow setter and migrate React metadata consumers |
| docs-creator | yes | applied | existing concept/reference/replay/state pages already own the full teaching surface and currently expose stale raw metadata/wrapper claims | exact page ownership, latest-state prose law, docs check, and Browser routes added |
| shadcn | no | skipped | no component registry, CLI, styling, or UI composition work; API minimalism was reviewed directly against live callers | reject policy registry/composer/builder; keep plain owner presets |
| components | no | skipped | no component API, render contract, or compound UI changes | N/A |
| plate-ui | no | skipped | no registry component or shadcn-style UI implementation changes | N/A |
| react-useeffect | no | skipped | no effect or subscription is added or changed | N/A |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| Contradictory history intent | `{ history: 'skip', tags: 'history-push' }`, multiple history tags, or a later `tx.history.*()` | commit contains multiple mode tags and save/merge behavior depends on consumer `if` order | one core exclusive-family reducer; input tags apply in order, semantic `history` applies after them, later tx decisions replace the family; final commit has at most one history-mode tag | table-driven permutations assert final tag and undo-stack outcome; last transaction-local writer wins | mitigated in plan |
| Tx-only control leaks into direct facade | callback overloads are removed but generic derivation still exposes `editor.update.history.skip()` | empty transaction silently returns without applying policy to any mutation | public `txOnly(method)` supplies one opaque type/runtime brand; mapping removes controls before bivariance and dynamic direct invocation throws; undo/redo/discardRedo remain direct | generic extension type contract, JavaScript runtime rejection, brand non-forgeability, and History direct-surface contract | mitigated in plan |
| Historic replay trips nested-update hard cut | `editor.update.history.undo()` creates an outer update, then current `runHistoricUpdate` calls `editor.update` again | undo/redo throws after migration or merges policy/normalization twice | replay in the active tx; set historic/history/selection tags there; preserve skip-normalize only through private History authority | undo/redo operation, state-patch, selection, multi-root, Yjs rebase, and follow-up typing tests | mitigated in plan |
| Async callback escapes atomic lifetime | an async function is passed to a callback typed `void`, mutates before and after its first `await`, or stores `tx` | pre-await work commits while later work runs outside policy/rollback; extension methods may mutate non-document state after commit | detect thenable callback result before commit and throw so synchronous work rolls back; bind tx mutation/control methods to the active transaction token | async-before/after-await test, captured-tx test, no commit/version/history change, next update remains clean | mitigated in plan |
| Normalization changes paths mid-transform | public wrapper removal exposes `unwrapNodes`' hidden explicit normalize during multi-node link/list/code-block work | plugin normalizers shift paths between operations, producing wrong unwrap or selection | remove/refactor hidden barrier using stable refs/planned paths; retain exact `tx.normalize()` only where later work demonstrably needs repaired structure | adversarial normalizer tests for link/list/code-block plus footnote/layout explicit-barrier contracts | mitigated in plan |
| Optional History is only type-safe on paper | JavaScript, `any`, or widened Plate generics pass `{ history: 'skip' }` to an editor without History | policy is silently ignored because no consumer owns the canonical tag | validate installed tx capability before starting the transaction; throw without mutation; export `EditorUpdatePolicyFor<E>` for generic helpers | no-History type errors, widened/JS runtime rejection, disabled-extension case, and normal tag-only success | mitigated in plan |
| Cached policy or dynamic extension goes stale | caller mutates a tagged policy/tags array after configuring, repeats fresh history-only literals, or an extension group is removed after a method path is cached | tagged facade changes behavior unexpectedly, history streaming allocates per write, or cached wrapper invokes a removed implementation | deep snapshot tagged input at first configuration; weakly cache tagged policies by object; cache the three history-only modes by semantic value; resolve installed group/method on invocation while caching wrapper identity | mutation-after-configure, history-literal identity reuse, removed-extension rejection, and garbage-collectable tagged-cache harness | mitigated in plan |
| Remote collaboration regresses history/selection | Yjs remote preset runs with or without History while React selection effects observe the same commit | remote changes enter undo, echo to provider, steal focus, scroll, or fail on a no-History editor | tag-only `YjsUpdatePolicy.remote`; `history-skip` is inert without History and consumed when present; React/Yjs/History read the same final tag set | remote import matrix with History on/off, undo/redo, provider echo, selection/focus/scroll, and follow-up local typing | mitigated in plan |

High-risk blast radius:
- Plite core lifecycle types/runtime, extension direct-method derivation,
  transaction tags, rollback, and normalization.
- Plite History replay, batching, selection restoration, and optional capability
  inference.
- Plite React selection effects and synchronous input/history provenance.
- Yjs remote import, provider filtering, and History-on/off composition.
- Plate core plugin inference, 52 production migration files, apps/www examples,
  and current-state docs.

Rollback / hard-cut answer:
- No public bridge, alias, or dual metadata/tag consumer ships.
- Execution lands and proves the policy tracer, exclusive tag reducer, tx-only
  marker, synchronous-lifetime guard, and active-tx History replay before
  deleting old call sites.
- If a substrate slice misses its focused behavior or benchmark gate, revert
  that slice and revise the plan; do not restore wrappers as a fallback.
- Private temporary helpers are legal only inside the execution branch with a
  named deletion gate before package migration completes.

Adoption / docs / example answer:
- Application docs teach four forms only: default direct, configured direct,
  default atomic, and policy atomic.
- Extension-author docs additionally teach `txOnly(method)` for controls that are
  meaningless as standalone updates, synchronous callbacks, and
  `EditorUpdatePolicyFor<E>` for generic helpers.
- History/Yjs/Suggestion examples use semantic fields or exported frozen
  presets; they do not author metadata bags or wrapper callbacks.
- Normalization docs say updates defer final repair and show `tx.normalize()`
  only where subsequent operations require repaired structure.

Plite maintainer objection ledger:
| Change | Pain owner | Steelmanned objection / antithesis | Tradeoff and why it is worth it | Current evidence | Rejected alternative | Adoption, docs, and regression proof | Verdict |
|--------|------------|------------------------------------|-------------------------------------|------------------|----------------------|--------------------------------------|---------|
| Callable configured update facade | TypeScript maintainers, debuggers, and package authors | A function that is both callable and a method tree, with policy-first overloads that sometimes return another method tree, is clever API magic; plain callback options are easier to implement and explain. | The callable intersection already exists. One added policy-return overload removes the dominant one-operation callback without adding a second mutation API. Callback form remains the obvious atomic form. Tx-only extension controls are branded out instead of silently inheriting every tx method. | `EditorUpdate` is already a callable `& EditorUpdateMethods`; current direct methods cannot receive policy and currently derive all extension tx methods. | Per-method policy arguments duplicate options across every transform; `withPolicy` restores wrapper nesting; a terminal fluent `.run()` adds ceremony. | Public type tracers cover default direct, configured direct, default callback, policy callback, wrong argument order, return type, and tx-only omission/runtime rejection. Docs show those four application forms only. | keep |
| Fixed core `history` field on an optional History capability | Plite core and History generic owners | History is an optional extension, so core should be tags-only; capability-gating one blessed extension increases conditional-type machinery and invites future special cases. | History batching is the only installed capability that changes save/group semantics on nearly every write. A discoverable semantic field beats asking users to know internal tags. The hard rule is exactly one exception: no extension can add more policy keys. | Core already owns canonical history tags; disabled-History contracts already remove `tx.history` and `editor.update.history`; all other lifecycle needs compose as tags/presets. | Tags-only `HistoryPolicy.skip` is architecturally purer but makes the common mode package-token ceremony and hides the three mutually exclusive modes from autocomplete. Arbitrary extension policy augmentation is worse. | Conditional type tests prove `history` accepted with History, rejected without it, and generic helpers via `EditorUpdatePolicyFor<E>`; runtime rejects erased/JS use without the installed group. Docs call out optional capability behavior once. | keep, gate type and runtime |
| Canonical tags as sole lifecycle truth | History, React selection, Yjs, and plugin preset owners | String tags can collide, drift into undocumented magic, and cannot carry structured values. Deleting structured lifecycle fields may trade typed duplication for stringly sludge; history tags are mutually exclusive, so a plain Set is insufficient. | Lifecycle decisions are finite predicates, not payloads. Canonical core tags and exported owner presets make them discoverable. One fixed history-family reducer makes composition deterministic while all other tags stay additive. Structured data is not smuggled into lifecycle tags. | History already consumes push/merge tags by branch order, React consumes selection tags, Yjs consumes collaboration tags, and the current snapshot Set admits contradictory history modes. | Keep tags plus lifecycle metadata duplicates; introduce symbol tags; introduce an arbitrary typed metadata registry or extensible reducer registry. Each creates two truths, serialization/debug friction, generic growth, or runtime ordering. | Add `history-skip`; consumers read final tags only; raw literals stay rare; tests cover exclusive last-writer order, tag dedupe, preset composition, commit visibility, and all three consumers. | keep with fixed reducer/constants/presets |
| Remove public commit-metadata authoring | Advanced app integrators and telemetry consumers | `metadata.origin` is a legitimate structured observation channel; tags cannot represent `{ kind: 'clipboard', source: 'html' }`, so deleting it may cripple extension authors for aesthetic purity. | A generic bag becomes an undeclared protocol and permanent compatibility surface. Current production behavior only needs private native-input provenance; collaboration/history/selection all map to tags. No production consumer reads arbitrary app-authored structured origin. Do not preserve a speculative protocol. | Live search finds native-text-input History consumption, Yjs lifecycle duplication, docs/tests for clipboard origin, and no application runtime consumer of arbitrary origin details. | Keep `{ metadata }`; rename it `context` or `data`; add typed annotation tokens. All retain or deepen a protocol without a concrete owner. | Internal native-input provenance gets a private typed path. Docs delete generic metadata guidance. Execution must repeat the consumer search; a real structured consumer reopens a separate observation API, not lifecycle policy. | cut public lifecycle metadata; internal provenance only |
| Bounded semantic and weak configured facades | Runtime and debugging owners | Caching tagged policies by mutable object identity can return snapshotted semantics after mutation; lazy Proxies obscure stack traces; caching every inline object by identity still allocates in the most natural history syntax. | Snapshot-at-first-configuration is deterministic. The three history-only values have a finite semantic key and therefore three stable facades per editor; arbitrary tagged policies remain weakly cached by identity, while frozen presets become zero-repeat-allocation paths. | Current extension group/method reads create Proxy paths repeatedly, docs naturally teach inline history literals, and AI streaming already repeats skip-history writes. | Strong cache by serialized arbitrary tags leaks unbounded entries; no cache repeats Proxy construction; cloning on every method call defeats configured DX. | Freeze exported presets, document snapshot semantics, test history literal identity reuse and caller mutation after tagged configuration, cache identity, lazy path reuse, and benchmark default/history-literal/preset lanes separately. | keep |
| Dynamic Proxy method tree | Stack-trace, autocomplete, and performance owners | A policy-configured Proxy tree is harder to inspect than explicit functions and could put allocation/dispatch overhead on keystrokes. | The public update tree already uses the same dynamic extension problem. Caching each group/method on first access improves the current runtime; core static groups can stay concrete. | `editor-lifecycle-api.ts` recreates dynamic extension proxies on property reads; performance pass identified update invocation as the hot unit. | Generate every extension method eagerly; pass policy to every method; expose only callbacks. These waste work, pollute signatures, or regress DX. | Allocation benchmark caps default at 1.05x baseline and cached policy at 1.15x default; tests assert stable group/method identity; debugging docs expose the compiled policy in development inspection only if needed. | keep with benchmark gate |
| Generic `txOnly(method)` helper | Extension authors and direct-update users | Wrapping methods adds extension-author ceremony and runtime inspection for a problem currently unique to History controls; a type-only brand would drift from runtime factories. | Direct update is derived from tx methods, but not every tx control is a standalone mutation. One helper returns the opaque type and marks the actual runtime function, keeping both derivation and JavaScript dispatch honest without a second extension slot. | Type providers and runtime tx factories are separate today; removing History callbacks otherwise turns `editor.update.history.skip()` into a silent empty transaction. | Add an `update` registry/type slot, remove all extension direct methods, use a forgeable property, or special-case History. Those duplicate declarations, destroy DX, permit drift, or hard-code one package. | Extension-author contract types controls as `TxOnlyMethod` and runtime factories wrap them with `txOnly`; direct inference omits them, JS access rolls back with a clear error, and History keeps direct undo/redo/discardRedo. | add one helper |
| Synchronous callback and active-tx lifetime | App authors and extension methods that retain tx | TypeScript already says the callback returns void; runtime thenable detection and token checks add branches for programmer misuse and may reject code that accidentally worked. | A transaction cannot honestly promise atomicity across an un-awaited callback. TypeScript accepts async functions in void positions, and captured extension tx methods can outlive the commit. Rejecting this is correctness, not validation theater. | Current callback result is discarded; tx views close over editor state; normal transform writes outside an update throw, but direct extension/state mutations do not uniformly prove active ownership. | Document “do not use async”; allow pre-await commit; clone a durable tx. Each leaves partial commits or invents an async transaction scheduler. | Runtime test rolls back pre-await work on thenable return, rejects post-await/captured mutation, publishes no commit/history/version, and proves the next normal update works. Benchmark isolates the active-token check. | add runtime guard |
| Reject nested public `editor.update*` | Migrated helper authors, plugin middleware, and History | Existing helpers receive `editor`, call direct updates, and work inside outer updates. History itself starts a nested update during `tx.history.undo/redo`; a runtime throw can break a core extension and force ugly `(editor, tx)` plumbing. | Hidden nested policy merging makes atomic ownership unknowable. Reusable mutations belong as typed tx extension methods; low-level helpers accept `tx`; one-use logic is inlined. History replay uses the active tx plus private replay authority. Editor remains acceptable beside tx only for read/plugin context, never as a second mutation channel. | Runtime tracks nested depth and merges options; Plate audit found nested direct updates; `runHistoricUpdate` is a live nested core path; extension tx factories already provide typed ownership. | Preserve nested updates; silently inherit outer policy; add an optional tx parameter everywhere. All keep ambiguous mutation ownership or dual paths. | Runtime throws on nested public update with rollback proof; History replay is refactored and its full behavior matrix stays green; migration classifies helpers as inline, tx-only, or tx extension; zero nested public updates. | hard cut after History repair |
| Remove public `withoutNormalizing` | List, table, link, code-block, and custom-transform authors | The wrapper is not mere syntax: it suppresses explicit normalizers hidden inside called transforms. Blind inlining can normalize halfway through a compound edit and change paths or plugin behavior. | That is precisely why the API is bad: callers should not remotely disable another transform's explicit invariant barrier. Outer updates already defer final normalization. A genuine mid-update dependency is expressed at the exact point with `tx.normalize()`. Hidden transform barriers must be removed, justified, or made local—not suppressed by an ambient wrapper. | `withoutNormalizing` returns without flushing when already in a transaction; outer `runEditorTransaction` owns final normalize. `footnote` and `layout` explicitly normalize before dependent work. `unwrapNodes` has a hidden `normalize({ force: false })`. There are 29 wrapper occurrences across 26 production files. | Keep wrapper; add `normalize: 'defer'`; make `tx.normalize.defer(fn)`. All duplicate the default transaction law and preserve ambient suppression. | Wrapper callers are split into simple inline and hidden-barrier review lanes. Add ordering/path tests for link/list/code-block unwrap, plus existing footnote/layout barrier tests. Public API search reaches zero only after behavior proof. | cut wrapper; repair exceptional internals |
| Public replace always normalizes | Initialization, AI, document-state, and Yjs owners | Bulk replacement/replay may deliberately carry invalid intermediate state or need to avoid an expensive normalize; removing `normalize: false` can regress startup and collaboration. | Public document replacement must finish valid. Trusted core seed and adapter replay are different authorities and may use a private substrate with explicit proof. AI/app callers do not earn an invalid-tree escape hatch. | Four production policy callers use replace options; core initialization and Yjs replay are identifiable owners; public `skipNormalize` bypasses top-level repair. | Keep `normalize?: boolean`; add policy `normalization: 'skip'`; expose a public unsafe replace. Each lets apps publish invalid state. | Private seed/replay tests prove eventual reconciliation; public replace contract proves normalization and history policy composition; benchmark large replace/replay separately. | hard cut public; internalize trusted authority |
| Package-owned plain policy presets | Plate plugin and collaboration maintainers | Plain exported objects can proliferate names, duplicate tags, and create an informal registry no one owns. | Presets are the package-level vocabulary for product semantics without infecting Plite generics. Each preset owner already owns the consumer and tests; frozen data composes and debugs better than executable tokens. | Suggestion and Yjs currently implement product semantics through global option mutation or raw metadata/tag duplication. | Core product fields, executable policy factories, or a central registry. These couple layers or add runtime order/failure modes. | Naming is colocated with the owning plugin/package, presets are frozen, docs use presets instead of raw literals, and owner tests assert exact tags/consumer behavior. | keep |
| One hard-cut 52-file migration | Plate package owners and release maintainers | Removing wrappers, metadata, callback history controls, value options, and nested updates together creates a broad regression surface and poor bisectability. | Compatibility aliases would preserve the exact API confusion this work removes. Vertical substrate slices followed by consumer and package waves keep each semantic change testable while the final branch remains a hard cut. | Inventory covers 52 unique production files; focused core/history/Yjs baseline has 41 passing tests; React proof ownership debt is known. | Long deprecation, aliases, or one giant mechanical rewrite. Deprecation prolongs dual truth; a giant rewrite hides causality. | Execute six ordered phases with RED-GREEN tracers, package-scoped typechecks/tests, targeted zero-result searches, then `check:core`, `check:plite`, browser proof, and autoreview. | keep hard cut, phase execution |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| `editor.update(fn, { metadata })` at app call sites | cut | raw runtime encoding and forces callback for one operation | medium | `ai-kit.tsx`, `document-state.tsx` | configured policy facade |
| `editor.update.history.skip(fn)` family | cut from final public grammar | recreates wrapper zoo and cannot compose with collab/selection policy | medium | current History extension | policy object + tx-local controls |
| `editor.update.withoutNormalizing(fn)` | cut | every outer `editor.update` defers final normalization; ambient suppression also hides explicit barriers in called transforms | medium-high | final-normalization path, 29 occurrences, and hidden `unwrapNodes` normalize | open one update and use `tx`; prove exceptional unwrap behavior |
| `tx.withoutNormalizing(fn)` | cut | an active transaction owns final normalization; real intermediate dependencies use an exact `tx.normalize()` barrier | medium-high | current transaction facade, footnote/layout barriers, wrapper inventory | inline simple bodies; refactor hidden transform barriers before deletion |
| `tx.metadata.merge(...)` | cut from public API | raw commit encoding leaks runtime protocol into transforms | medium | NodeId, math, suggestion, history, and Yjs callers | semantic `tx.history.*` and `tx.tags.*`; private provenance setter only |
| public `EditorUpdateMetadata.history/collab/selection` | cut | duplicates canonical lifecycle tags and forces three consumer families to support two truths | high but mechanical | History already has push/merge tag fallbacks; React/Yjs already consume matching tags | add `history-skip`; migrate consumers to tags; retain internal provenance only |
| `EditorValueReplaceOptions` lifecycle fields | cut | one transform should not own a competing policy/normalization channel | low | four production policy callers | configured update facade; internal seed/replay authority only |
| callback overloads on `tx.history.skip/merge/newBatch` and `editor.update.history.*` | cut | recreates wrapper grammar inside the new transaction model | medium | 10 production callback-control files | policy-first update; brand no-arg late controls tx-only; keep direct undo/redo/discardRedo actions |
| extension-augmented policy keys | reject | product keys would infect core generics and collide globally | none | extension API/state/tx intersection machinery | fixed core policy plus owner-defined tags |
| executable policy tokens or resolver registry | reject | adds indirection, registration order, and runtime failure modes for plain data | none | package preset pressure | frozen plain policy objects |
| temporary plugin-option mutation for one update | cut | persistent editor state is the wrong transport and current Suggestion code is not exception-safe | medium | `BaseSuggestionPlugin.withoutSuggestions` | package preset tag read from active `tx` |
| nested `editor.update*` inside an active update | hard cut | silently merging policy across nested updates hides ownership and ordering | medium-high | nested runtime, migrated Plate call sites, and History `runHistoricUpdate` | use active `tx`; repair History before enabling rejection |
| async/thenable update callbacks | hard cut | an un-awaited callback cannot be one atomic transaction | low adoption, high correctness | TypeScript void-callback assignability and current discarded result | reject and roll back synchronously; active-token guard blocks escaped mutations |
| arbitrary fluent policy chains | reject | proxy/type complexity and order ambiguity | none | design pressure | one policy object |

Plan deltas from review:
- Related issue discovery rejects treating `editor.update` itself as an implicit
  history batch. History remains an explicit independent policy because
  `plite-history` is optional and Slate #3874 documents the coupling footgun.
- Public normalization policy is removed entirely: `editor.update` already
  defers normalization to its outer commit; internal replay may still suppress
  it under private authority.
- Mutable ambient wrapper implementations gain a high-risk proof row after
  Slate PR #6063 exposed exception/nesting restoration hazards.
- ClawSweeper pass makes no ledger edits: the API plan is design evidence only.
  It must not promote #3874 or #6038 without exact behavior or accepted
  benchmark-threshold proof.
- Extension-augmented policy typing is rejected. Plite owns fixed semantic
  fields and tag transport; Plate/Yjs owners export frozen plain presets.
- Lexical validates the existing Plite canonical-tag direction and the
  in-transaction add/has shape, but its callback-first syntax and raw string
  escape hatch are not the target DX.
- ProseMirror validates semantic controls on the active transaction; its
  `setMeta(key, any)` stays a negative oracle for public Plite API.
- Tiptap validates extension-owned naming and reusing the held transaction;
  Plite rejects its fluent chain and terminal `.run()` ceremony.
- Yjs locks generic `origin` out of public policy. Identity-bearing origins stay
  adapter/internal state; package presets expose semantic collaboration intent.
- Public policy uses `tags` (plural) and `history: 'new-batch'`; runtime pressure
  locks canonical `history-push`, `history-merge`, and new `history-skip` as the
  sole history/collab/selection lifecycle truth. Delete duplicate metadata
  fields rather than hiding them.
- Preserve disabled-History inference without arbitrary extension policy keys:
  `EditorUpdate` conditionally admits the fixed `history` field only when its
  installed transaction groups contain `history`.
- Selection/focus/scroll need no new public policy object or tx namespace;
  existing canonical tags plus package presets already express every case.
- Configured facade cost is bounded through three per-editor semantic
  history-only facades, a weak tagged-policy cache, and lazy cached group/method
  paths; the default hot facade remains unchanged.
- Maintainer objection review keeps the special `history` field despite its
  optional-extension cost: it is the one ubiquitous mutually exclusive update
  mode, remains capability-gated, and creates no precedent for extension-owned
  policy keys.
- Public structured metadata remains cut after a consumer audit found no
  production reader for arbitrary app-authored payloads. Native text input gets
  private typed provenance; any future structured observation channel needs its
  own concrete owner and design.
- Normalization migration is no longer described as wholly mechanical. Outer
  updates already defer final repair, but `unwrapNodes` contains a hidden
  intermediate normalize that ambient wrappers can suppress. Execution must
  repair or justify that internal barrier and behavior-test link/list/code-block
  callers before the public wrapper reaches zero.
- Nested-update migration must not spread `(editor, tx)` mutation helpers:
  one-use logic is inline, reusable product transforms are tx extension methods,
  and low-level mutation helpers accept tx only. Editor may remain beside tx for
  read/plugin context only.
- High-risk simulation adds an exclusive canonical history-tag family. Input
  tags apply in order, the semantic policy field applies after them, and later
  tx controls/tags replace the family; the final commit can never expose two
  history modes.
- Direct update derivation needs one public `txOnly(method)` helper with an
  opaque shared type/runtime brand. Without
  it, deleting History callback overloads leaves a typed
  `editor.update.history.skip()` that opens an empty transaction and does
  nothing. The marker preserves normal extension direct DX and removes only
  standalone-meaningless controls.
- History is a live nested-update blocker: `tx.history.undo/redo` currently
  calls `runHistoricUpdate`, which starts `editor.update` again. Execution must
  replay in the active tx and carry historic/selection tags plus private
  skip-normalize authority there before nested public updates are rejected.
- Atomic callbacks become explicitly synchronous at runtime. Thenable results
  throw before commit and roll back pre-await work; mutation/control methods
  bind to the active transaction token so captured tx objects cannot write
  after callback completion.
- The optional-History gate is both type and runtime law. JavaScript, `any`, or
  disabled-History editors must fail before mutation when a semantic history
  field is supplied; tag-only collaboration presets remain valid without
  History.
- Fresh inline history policy objects are first-class DX, not an allocation
  mistake. The three history-only modes resolve to bounded semantic facades by
  value; tagged object policies remain weakly cached by identity.
- Preset composition needs no helper protocol. Live Suggestion and AI callers
  compose one semantic history field with ordered tags, or add late intent on
  the active tx. Owner packages may export frozen complete presets and proven
  reusable tag constants only.
- The tx-only brand is filtered before the existing bivariant method mapping;
  `EditorUpdatePolicyFor<E>` remains the single shallow generic-helper utility,
  and frozen presets use `satisfies EditorUpdatePolicy`.
- Plite React gains no new hook or effect. `useSetStateField` owns default
  selection-preservation tags and narrows its optional second argument to
  `EditorUpdatePolicyFor<TEditor>`; the same semantic vocabulary works without
  leaking runtime options. Native input provenance remains a private path.
- Documentation stays in four existing owners: editor concept, Editor API,
  operation replay walkthrough, and document-state concept. Execution removes
  raw metadata and false direct-extension guidance, then Browser-verifies every
  affected route.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| Exact selection-effect policy names | This was the remaining public grammar risk | current React consumer already supports canonical skip/focus tags beside duplicate metadata | Plite React | closed: package presets plus canonical tags; no new field |
| `tags` singular input vs plural field | Presets must read cleanly without lying about cardinality | Lexical accepts one/many under singular `tag`, while listeners expose plural sets | Plite core | closed: use `tags` |
| History batch spelling | `new-batch` is explicit but slightly verbose | Slate says new batch; Lexical says push; ProseMirror says close history | Plite History | closed: public `new-batch`, internal `push` |
| Public `origin` shape | Adapters need provenance without arbitrary metadata leakage | Yjs uses identity-bearing arbitrary origins; Plite uses internal input-origin records | Plite core/collab | closed: no generic public field; adapter/internal only |
| Conflicting history tags/policy | Set membership cannot represent precedence | current compiler/context Set and History consumer branch order | Plite core/History | closed: fixed exclusive family; tags in order, semantic field after tags, later tx writer wins |
| Tx-only extension methods | Callback removal otherwise leaves standalone no-op controls | generic direct derivation, separate type/runtime extension declarations, and History no-arg controls | Plite extension substrate | closed: `txOnly(method)` returns one opaque type/runtime brand; direct mapping filters before bivariance and JS dispatch rejects it |
| Async update callbacks | TypeScript void callbacks accept async functions | discarded callback result and escaped tx closures | Plite core | closed: thenable rejection with rollback plus active transaction token |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| 1. Public tracer | Plite core/types | first RED→GREEN slice: configured direct `{ history: 'skip' }`; then policy-first atomic overload, `{ tags }`, optional-History type/runtime gate, and `EditorUpdatePolicyFor<E>` | accepted plan and execution goal | public behavior and inference compile through source; absent capability fails before mutation | focused update-policy runtime/type tests |
| 2. Runtime deepening | Plite core | policy compiler, exclusive history-tag reducer, three bounded history-only semantic facades, weak cached tagged-policy lazy facades, `tx.tags`, branded tx-only methods filtered before bivariance, thenable rollback/active-token guard, nested-update rejection, public wrapper/options removal, and `unwrapNodes` hidden-normalize repair/justification | phase 1 green | default/direct/atomic/conflict/lifetime/tag/rollback/normalization contracts green; inline history literals do not allocate unbounded facades; no transform relies on remotely suppressing another transform's barrier | Plite focused tests, allocation benchmark, and typecheck after each vertical slice |
| 3. Sole lifecycle truth | Plite History/React/Yjs | add `history-skip`; wrap/type History controls with `txOnly`; replay undo/redo in active tx; move History, selection effects, collaboration, and remote replay from duplicate metadata to tags; narrow `useSetStateField` to semantic policy; preserve native-input provenance privately; repair React test ownership | core policy/reducer/lifetime stable | all three consumers read final tags only; History has no nested public update; state-field hook exposes only `EditorUpdatePolicyFor<TEditor>` and appends preservation tags; internal provenance/skip-normalize authority remains private | History full focused matrix, package tests/typechecks, Yjs History-on/off remote contract, React source-owned test |
| 4. Plate migration | package owners | migrate 52-file inventory: simple normalization wrappers first, behavior-sensitive unwrap callers second, then history callbacks, tx metadata, Suggestion, value replace, and nested updates | substrate packages green and hidden normalization behavior locked | no old public API usage; every affected package typechecks; link/list/code-block path behavior stays green | targeted `rg`, focused behavior tests, package tests, turbo typechecks |
| 5. Docs/examples | Plite docs/apps owners | rewrite the four existing editor concept, Editor API, replay, and state pages plus Yjs/product examples; no migration prose; generated registry untouched | public API and migration stable | docs teach default direct, policy direct, policy atomic, presets, active tx, sync lifetime, capability typing, and state-hook default | www docs check and Browser proof on all four routes |
| 6. Closure | Plite maintainer | benchmark, lint, barrels, core/Plite checks, focused browser, autoreview | all slices green | all plan gates pass with no accepted finding | commands below plus final score/audit |

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| planning artifact check | plate-2 | `git diff --check -- docs/plans/2026-07-15-plite-update-lifecycle-api.md`; final `check-complete.mjs` | plan integrity and closure rows | both passed 2026-07-15 |
| public API/type tracer | plate-2 | focused Plite update-policy runtime/type tests, then `pnpm turbo typecheck --filter=./packages/plite` | overloads, capability type/runtime gate, direct facade, exclusive history precedence, tx-only omission, thenable/escaped-tx rollback | planned |
| lifecycle consumers | plate-2 | focused Plite History including active-tx undo/redo, Plite React selection-policy, and Yjs History-on/off remote-import tests plus three package typechecks | final-tag-only history/selection/collab truth without nested public update | planned |
| migration sweep | plate-2 | zero-result `rg` for public `withoutNormalizing`, history callback controls, `tx.metadata`, `withoutSuggestions`, raw update options, and lifecycle value-replace options | hard cut complete without dead-code tests | planned |
| affected Plate packages | plate-2 | targeted turbo typechecks/tests for every modified package, then `pnpm check:core` | mechanical migration is type/behavior complete | planned |
| allocation benchmark | plate-2 | three runs of `bun benchmarks/slate-v2/donor/core/current/update-policy.mjs` | default median p95 <= 1.05x captured pre-change baseline; repeated inline history-only literal and cached tagged preset median p95 <= 1.15x default direct; tag-family and active-token guards included; exactly three semantic history facades plus bounded weak object cache | planned |
| docs/examples | plate-2 | `pnpm --filter www check:docs`; start relevant www dev server; Browser `/docs/plite/concepts/07-editor`, `/docs/plite/api/nodes/editor`, `/docs/plite/walkthroughs/07-operation-replay-substrate`, and `/docs/plite/concepts/14-document-state` | latest-state teaching and real package-facing DX | planned |
| Plite closure | plate-2 | `pnpm lint:fix`; `pnpm brl` if exports changed; `pnpm check:plite` | package, browser, source, and barrel closure | planned |

Final user-review handoff outline:
- accepted plan items:
  - one fixed capability-gated `EditorUpdatePolicy` with only `history?` and
    `tags?`
  - direct configured facade for one operation; synchronous callback only for
    atomic multi-operation updates
  - exclusive last-writer-wins history tag family, canonical tag transport,
    package-owned frozen `*UpdatePolicy` presets, and tx-local late controls
  - `txOnly(method)` as the sole extension-author escape for controls that are
    meaningless as standalone updates
  - private provenance/replay authority, active-tx History replay, synchronous
    tx lifetime, and nested public update rejection
  - no public normalization switch; outer updates defer final repair and exact
    `tx.normalize()` barriers remain only where later work needs repaired state
- before / after API shape:

  ```ts
  // before: one write requires a callback and raw runtime encoding
  editor.update(
    (tx) => tx.nodes.insert(node, options),
    { metadata: { history: { mode: 'skip' } } }
  );

  // after: one write stays one write
  editor.update({ history: 'skip' }).nodes.insert(node, options);

  // after: callbacks communicate real atomic grouping
  editor.update({ history: 'new-batch' }, (tx) => {
    tx.nodes.remove({ at });
    tx.nodes.insert(nodes, { at });
  });
  ```

  Product behavior uses `editor.update(SuggestionUpdatePolicy.skip, fn)` outside
  an update and `tx.tags.add(SUGGESTION_SKIP_TAG)` inside one. React setters use
  `(value, policy?: EditorUpdatePolicyFor<TEditor>)` and append their owner tags.
- hard cuts: public `EditorUpdateOptions`, lifecycle metadata authoring,
  `skipNormalize`, `EditorValueReplaceOptions`, history callback controls,
  `editor.update.withoutNormalizing`, `tx.withoutNormalizing`,
  `withoutSuggestions`, nested public updates, and thenable callbacks; no alias
  or dual consumer survives
- issue claims and non-claims: #3874 stays `cluster-synced`; #6038 stays
  benchmark-owned `improves-claimed`; #2658/#3467/PR #6063 and Plate #4315 are
  evidence only; Plate #4413 remains not claimed; no PR-reference text changes
- proof gates: public behavior and generic type tracers, no-History type/runtime
  rejection, tx-only type/runtime proof, exclusive history permutations,
  thenable/escaped-tx rollback, active-tx undo/redo, React/Yjs final-tag tests,
  hidden-normalization adversaries, 52-file zero-result migration sweep,
  allocation benchmark thresholds, package typechecks/tests, `check:core`,
  `check:plite`, four Browser docs routes, lint/barrels, and autoreview
- accepted-plan execution handoff: execute the six owner phases in order with
  RED-GREEN proof before each migration wave; hard cut only after substrate,
  History, React, and Yjs owners are green; do not restore wrappers if a slice
  fails—revert or revise that slice

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | final 0.9415 weighted score; minimum dimension 0.93 | complete |
| all pass rows complete or skipped with evidence | every scheduled phase/pass row complete | complete |
| issue/reference sync closed | live states and local ledger/dossier/matrix/PR-reference rows reconciled; no edit required | complete |
| live source grounding complete | source/runtime/types/consumer/docs rows cite current owners and commands | complete |
| workspace verification recorded | planning claims closed in the verification workspace table; execution claims remain explicit future gates | complete |
| autoreview clean or N/A | N/A: planning-only artifact, no implementation patch; execution autoreview remains mandatory | complete |
| final handoff emitted or lane remains pending | API, cuts, issue posture, proof, and execution order recorded and emitted | complete |
| `check-complete` passes | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-15-plite-update-lifecycle-api.md` | complete: checker passed 2026-07-15 |

Findings:
- Current direct update groups always start a default update and cannot receive
  lifecycle options.
- Current public `EditorUpdateOptions` exposes raw `metadata`, `skipNormalize`,
  and `tag`; history/collaboration/selection encoding is visible to applications.
- Current `EditorCanonicalUpdateTag` already contains history, collaboration,
  DOM-selection, scroll, focus, paste, and composition tags matching the useful
  part of Lexical's update-tag model; reuse it instead of adding a registry.
- Current internal history metadata uses `push`; public `new-batch` deliberately
  names user intent and lowers to that runtime encoding.
- Runtime pressure shows canonical tags can be the only lifecycle truth:
  History already consumes `history-push` and `history-merge`, React already
  consumes selection-effect tags, and Yjs already consumes collaboration tags.
  Add `history-skip` and delete lifecycle metadata duplication.
- Current default and extension update facades use dynamic proxies; unknown
  extension group/method property reads recreate proxy paths. The configured
  API must cache these paths and cannot add allocations to default hot updates.
- Current disabled-History generic contracts reject `tx.history` and
  `editor.update.history`. A fixed policy can preserve that guarantee by
  conditionally exposing its known `history` field from installed tx groups,
  without permitting arbitrary extension-owned policy keys.
- Current extension type providers and runtime tx factories are separate, so a
  type-only tx marker can drift. The helper must return the branded type and
  mark the actual function used by dynamic dispatch.
- Current `useSetStateField` already accepts per-call lifecycle control while
  adding selection preservation. Replacing its raw options with the same typed
  update policy retains useful DX; removing the second argument would not.
- Plite History already replaces legacy names with `skip`, `merge`, and
  `newBatch`, but its callback controls preserve the old wrapper shape.
- `withoutNormalizing` defers normalization inside a scope; `skipNormalize`
  suppresses the outer final normalization and is unsafe as normal public DX.
- The outer `editor.update` already supplies the public normalization-deferral
  boundary, so `withoutNormalizing` needs deletion rather than a renamed mode.
- Plate product policy such as `withoutSuggestions` is not Plite core policy;
  its clean replacement is an owner-defined tag preset, not extension-augmented
  core policy typing.
- Suggestion's current one-update wrapper mutates a persistent plugin option and
  does not restore it through `finally`.
- Transform middleware already receives `tx`, so product middleware can inspect
  transaction tags without ambient editor mutation.
- Slate #2658 independently proposed replacing the `without*` family with a
  transaction abstraction and documented wrapper-composition pain.
- Slate #3874 proves normalization batching must not accidentally define history
  batching; optional history needs its own explicit policy.
- Slate PR #6063 shows scope wrappers implemented as mutable ambient flags are
  fragile under exceptions and nesting.
- Plate #4315 is direct product evidence for a clean skip-history update policy;
  Plate #4413 is incidental wrapper usage and is not architecture evidence.

Decisions and tradeoffs:
- Decision: use one fixed semantic policy object that configures either a direct
  update facade or an atomic callback. Keep only private typed provenance as
  runtime truth, tags as the product-extension escape hatch, and plain package
  presets as naming.
- Decision: keep collaboration/input origins internal. Public callers select a
  semantic package preset; they do not construct identity-bearing origin data.
- Decision: `EditorUpdatePolicy` has exactly `history?` and `tags?`; history is
  capability-gated, and all public lifecycle intent lowers to canonical tags.
- Decision: remove history/collab/selection fields from update metadata and
  remove public metadata authoring; retain only private structured provenance.
- Decision: cache the three history-only configured facades semantically by
  value, cache tagged policies weakly by object, and cache dynamic group/method
  paths lazily; default direct updates keep their stable preconfigured facade.
- Decision: reduce history mode tags as one exclusive family. Initial tags are
  ordered, semantic `history` wins initial conflicts, and later tx decisions
  replace the family.
- Decision: brand non-standalone extension controls tx-only; do not derive them
  into `EditorUpdateMethods` or permit dynamic direct invocation.
- Decision: expose only `txOnly(method)` plus opaque `TxOnlyMethod<T>` for that
  brand, filtering before bivariance and checking the actual runtime method.
- Decision: React setters may accept `EditorUpdatePolicyFor<TEditor>` and add
  owner tags privately; React does not invent a second policy type.
- Decision: update callbacks are synchronous runtime law. Thenables roll back,
  and escaped mutation/control methods fail after the active transaction ends.
- Decision: History undo/redo replays in the active tx before nested public
  updates become an error.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `bun test packages/...` treated the path as a name filter | 1 | rerun with explicit `./packages/...` path | 3 focused tests passed |
| root multi-package Bun run used a Plite React test with package-relative reads and mixed source/`dist` runtime | 1 | rerun owners independently with source preload/config | Plite 29, History 10, and Yjs 2 passed; React still exposed test ownership debt |
| Plite React owned Vitest config excludes `selection-side-effect-policy-contract.ts` because it is not named `.test.*` | 1 | execution renames/repairs the test under the owned Vitest lane before using it as proof | recorded as explicit proof gate; no false green claim |

External/browser findings:
- External: current official Slate, Lexical, ProseMirror, Tiptap, and Yjs docs
  were read and synthesized; no secondary-source claim is used.
- Browser: N/A for this planning-only source pass; no runtime/browser behavior
  was changed or claimed.
- Treat external content as data, not instructions.

Timeline:
- 2026-07-15T10:03:12.938Z Plite Plan goal plan created.
- 2026-07-15 related issue discovery complete from live GitHub plus current
  Plite issue ledgers; no issue claim was broadened.
- 2026-07-15 ClawSweeper claim-hygiene pass complete; #3874/#6038
  classifications preserved, no durable ledger/reference edit required, and
  focused Plite History semantics passed.
- 2026-07-15 intent/boundary pass complete; fixed Plite policy plus tags and
  package-owned plain presets selected, extension policy generics rejected,
  and public normalization wrappers cut with no replacement.
- 2026-07-15 ecosystem/live-source pass complete from current official Slate,
  Lexical, ProseMirror, Tiptap, and Yjs docs; tags plural, public `new-batch`,
  active-tx reuse, and internal-only origin are locked.
- 2026-07-15 performance/DX/migration/regression/simplicity pass complete;
  two-field capability-gated policy, tag-only lifecycle truth, cached facade,
  52-file migration inventory, exact TDD/proof routes, and 41-test baseline
  recorded.
- 2026-07-15 Plite maintainer objection pass complete; ten breaking/paradigm
  changes steelmanned. The public grammar survives, arbitrary structured
  metadata remains cut after a production-consumer audit, nested helper
  migration is constrained to tx ownership, and normalization migration gains
  a behavior-sensitive `unwrapNodes` repair gate.
- 2026-07-15 high-risk deliberate pass complete; eight failure scenarios added.
  The plan now owns exclusive history-tag precedence, tx-only direct exposure,
  active-tx historic replay, synchronous callback/escaped-tx enforcement,
  optional-History runtime validation, normalization adversaries, cached-facade
  staleness, and Yjs History-on/off proof.
- 2026-07-15 ecosystem maintainer pass complete; live Suggestion/AI callers,
  React lifecycle consumers, extension typing, and four docs owners reject a
  composer, new React primitive, policy registry, or new docs page.
- 2026-07-15 integrated revision pass complete; one public `txOnly(method)`
  helper now binds opaque type and runtime marking, `useSetStateField` forwards
  only `EditorUpdatePolicyFor<TEditor>` while preserving selection, all owner
  presets use `*UpdatePolicy` naming, and the score is 0.94 preliminary.
- 2026-07-15 issue-sync accounting complete; all seven live GitHub items were
  refreshed, gitcrawl health and current ledger/matrix/dossier/reference rows
  were reread, #3874/#6038 classifications remain exact, and zero durable claim
  artifacts need edits.
- 2026-07-15 closure complete; final weighted score 0.9415 with 0.93 minimum,
  planning-only verification gates and execution proof gates are explicit,
  `git diff --check` and the strict autogoal checker pass, and the user-review
  execution handoff is ready.

Verification evidence:
- Source audit: Plite editor types/runtime, History extension, local legacy
  Slate history API, current Plate/apps lifecycle callers, VISION, related
  history/normalization solution notes.
- Ecosystem audit: official Slate Editor/HistoryEditor, Lexical Updates,
  ProseMirror Transaction/history, Tiptap commands/setMeta, and Yjs
  Y.Doc/UndoManager documentation.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Plite Plan complete and ready for user review |
| Where am I going? | Accepted-plan implementation only if the user requests it |
| What is the goal? | Lock one typed lifecycle policy API and hard-cut wrapper/raw-metadata DX |
| What have I learned? | The two-field grammar survives integration; `txOnly` must mark both the declared and actual function, React setters should forward semantic policy, and history-only literals need bounded semantic caching |
| What have I done? | Locked the API and execution law, closed issue accounting, passed every planning gate and checker, and produced the exact implementation handoff |

Open risks:
- Tagged-policy weak caching relies on snapshot-at-configuration semantics when
  callers mutate an object; docs/types make policies readonly and presets
  frozen, while history-only literals bypass object-identity allocation.
- Tags can become stringly sludge unless package owners export constants/presets
  and raw literals remain rare; the fixed exclusive history reducer must not
  grow into a generic plugin-controlled precedence registry.
- Capability-gated history typing must not widen extension inference or make
  generic helpers unusable; `EditorUpdatePolicyFor<E>` and the erased/runtime
  rejection path still need implementation proof.
- Removing public structured metadata changes current provenance docs. The
  present audit found no production arbitrary-payload consumer, but execution
  must repeat the search before hard cut; a real consumer triggers a separate
  observation-API decision rather than restoring lifecycle metadata.
- Policy construction must be exception-safe and nesting-safe without ambient
  mutable flags; PR #6063 is the negative oracle.
- `txOnly(method)` must remain the only extension-author primitive and bind its
  opaque type to the actual runtime function. If implementation needs a second
  registry, parallel factory, or manual direct declaration, reject that design.
- Active transaction token checks must cover extension/state mutations without
  putting a Proxy or heavy branch on every read; benchmark and extension tests
  decide the exact implementation.
- History replay currently depends on nested public update plus skip-normalize
  authority. Refactoring it must preserve state patches, selection, roots, Yjs
  rebasing, and follow-up undo/redo stack mutation ordering.
- `unwrapNodes` explicitly normalizes during one generic path. Removing ambient
  suppression without repairing or proving that path can shift link/list/code-
  block behavior mid-transaction.
- Hard nested-update rejection can tempt dual `(editor, tx)` mutation helpers;
  review must enforce inline, tx-only, or tx-extension ownership instead.
