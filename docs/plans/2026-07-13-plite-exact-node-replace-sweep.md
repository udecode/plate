# plite exact node replace sweep

Objective:
Add Plite exact-node replacement and close the package sweep; done when the API is atomic, typed, tested, all matching package bridges/stale calls are fixed or justified, and plan gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-13-plite-exact-node-replace-sweep.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- package-api

Plate Next source:
- prompt / link: user accepted the proposed Plite-owned `nodes.replace` API, then requested `ok fix sweep [$plate-next]`
- mode: accepted public API implementation plus broad package correction sweep
- target surface: `packages/plite` exact-node mutation API and exact replacement callers under `packages/**`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; no broad Core review was requested
- correction-triggered related scoped sweep: yes; all package-source remove+insert replacement bridges and stale `replaceNodes` sites
- package review mode: no; user explicitly requested a sweep rather than one named-package review
- package review target: N/A: broad exact-pattern sweep, not package scoring
- package file checklist gate: N/A: package review mode does not apply
- completion threshold summary: public `tx.nodes.replace` and `editor.update.nodes.replace` lower exact-node replacement to one `replace_children`; tests cover path/live target/selection/error behavior; scoped stale patterns reach zero or have explicit semantic deferrals

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.
- If package review mode is in scope, generate the package file manifest and
  materialize one checkbox per reviewed file in this plan before
  implementation. A file checkbox may be checked only when its score is `100`.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: binary API/test/source-audit threshold
- improvement loop: implement owner first, migrate every exact scoped caller, run focused proof and review, repair accepted findings
- final score / loop closure: N/A: close only on the binary completion threshold

Completion threshold:
- `tx.nodes.replace` and `editor.update.nodes.replace` are public, inferred, and exact-target-only with no legacy compatibility alias.
- One node to zero/one/many replacement lowers to one `replace_children` operation; `select: true` selects the end of the final replacement when one exists.
- Focused tests cover exact path, live target, detached target, root rejection, empty replacement, and selection behavior.
- The AI-local `replaceNodesAt` bridge is deleted and every scoped same-path remove+insert or stale `replaceNodes` package match is migrated or explicitly rejected as different semantics.
- Focused typecheck/tests/build/lint, changeset, barrel decision, source audits, autoreview, and the final plan checker pass.
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related scoped sweep row.
- Broad Core sweep may close only when every Core source file has a valid row
  in this plan's Core drift ledger section or a linked plan artifact summarized
  in this plan.
- Package review mode may close only when every package file row is either
  checked at score `100` or explicitly deferred for user review with reason,
  owner, proof needed, and next action. Do not move to the next package while
  unchecked package rows remain.
- Core-adjacent package review may close only after
  `tooling/scripts/check-core.mjs` is updated to include that package, or the
  plan records why the package is product-only and does not belong in
  `check:core`.
- The plan records manifest command, expected row count, actual row count,
  missing row count, extra row count, and top drift rows before closeout.
- Any drift score `>=2` has an owner, evidence, and next action.
- Any drift score `>=4` is fixed, hard-cut, moved, quarantined, or deferred
  with owner/proof; it cannot close as `keep-in-plate`.
- Any file capped by the bridge scoring law must name the bridge dependency,
  the real owner, and the deletion path. It cannot be raised to 100 from
  `check:core` alone.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-13-plite-exact-node-replace-sweep.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: Plite contract tests for the mutation API plus affected package tests
- package proof: source-first typecheck for Plite and each changed consumer package; focused package tests/build where exposed surface requires it
- shared Core gate: N/A unless Plite public typing forces Core-adjacent proof
- source audits: exact searches for `replaceNodesAt`, `.tf.replaceNodes`, and same-path `nodes.remove` + `nodes.insert` replacement shapes under `packages/**`
- related scoped sweep query / active scope / match count / patched count / deferred count:
  exact legacy-symbol sweep found 7 textual matches and patched all 7; final count is 0. A bounded adjacent remove+insert source sweep found 2 semantic non-matches and deferred both with reasons below.
- package file manifest / row count / checked count / deferred count: N/A: not package review mode
- Plite/Plate gap ledger: initial Plite gap accepted for implementation: missing exact-node atomic replacement mutation
- broad Core drift ledger gate: N/A: broad Core sweep is out of scope
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-13-plite-exact-node-replace-sweep.md`

Constraints:
- Review mode targets the best Plate v2 shape: clean Plate product layer on top
  of Plite, no legacy compatibility goal.
- Plate owns product composition; Plite owns editor substrate.
- Core must not wrap Plite editor APIs under Plate names.
- No public compat aliases, old Slate shims, or docs for old API names.
- No local hacks: do not hide migration difficulty in bridge dumps, helper
  dumps, `any` casts, duplicated wrappers, command fallbacks, or fake aliases.
- If clean migration is blocked, record a `Plite gap` or `Plate gap` instead of
  inventing a compatibility workaround.
- After every correction, run a related sweep only inside the active mode
  scope. Package review mode is scoped to the named package plus the smallest
  Plite/Core owner needed to unblock that package. Broader matches become
  deferred rows or next-package candidates, not edits.
- In package review mode, do not update docs, examples, package callers outside
  the named package, unrelated packages, generated registries, or broad repo
  surfaces unless the user explicitly broadens scope with `all packages`,
  `current tree`, `full-loop`, `sweep`, or the broader owner name.
- Review-mode rename freeze: keep current `HEAD` names/paths while behavior and
  API drift are under review. Put desirable later renames in
  `docs/plans/pre-renaming.md`; do not turn the active diff into Added/Deleted
  rename soup unless the user explicitly asks for a rename pass.
- Extracted-file recovery gate: every untracked/extracted Core/Plate source,
  spec, type-test, and config file in scope must be inventoried and classified
  as `recover-main-owner`, `merge-existing-owner`, `move-to-plite`,
  `justify-new-proof-tooling`, or `delete-duplicate`.
- No file or packet can score `100` while an extracted/untracked file in scope
  lacks a ledger row and one of those buckets.
- Private bridges require owner, deletion gate, and proof.
- Private bridges cannot collect displaced product/plugin behavior. A bridge
  file that centralizes input-rules, node-id, affinity, DOM, command, or change
  listener behavior scores `0` until deleted.
- Any file importing or installing a forbidden bridge is capped at `25`.
- Owner files whose runtime behavior lives in a forbidden bridge are capped:
  `InputRulesPlugin` `<=5`, `NodeIdPlugin` `<=45`, `AffinityPlugin` `<=55`,
  `PliteExtensionPlugin` `<=45`.
- Public type/plugin/editor files touched while a forbidden bridge remains are
  capped at `75`.
- If a helper exists only because migration was hard, cut it.
- Do not use a narrow representative file to close a broad Core sweep.
- Package review mode is review-first, not migration-first. Freeze scope to the
  named package plus the smallest Plite/Core owner needed to remove a blocker.
- Package hard cuts land package by package. A broad audit can discover
  outside-scope callers, but the plan must record them as deferred rows instead
  of patching them in the current package packet.
- Package file rows can be checked `[x]` only at score `100`: no behavior
  regression versus `origin/main`, no type regression, inline inference
  preserved, no inferred local type annotations, no fake casts/local helper
  types, no compat sludge, correct Plite/Plate ownership, accepted
  owner/name/path drift, and focused proof or justified source audit.
- Green package tests alone do not score a file `100`.
- Do not move to the next package until every package file row is checked at
  `100` or explicitly deferred for user review.
- Core-adjacent package review must update `check:core` coverage before
  closeout, or explicitly classify the package as not belonging in that gate.
- For Core-only targets, ignore non-Core package errors unless the package is
  named, touched by the packet, or the failure proves a Core public API
  regression.
- Direct one-shot Plite API law: prefer `editor.update.foo.bar(...)` and
  `editor.read.foo(...)` over callback wrappers for one-line reads/writes.
  Callback form is only for grouped transaction/snapshot logic, shared
  intermediate state, branching/looping, or missing direct API that is recorded
  as a Plite gap.
- Live node target law: if a caller already has a live descendant, pass it as
  the `NodeTarget` / `at` value or use `editor.read.nodes.path(node)` only when
  a `Path` is required. Do not rediscover it with a type/ID query. Handle an
  unresolved public path instead of asserting it.
- Property matcher law: exact shallow equality uses property objects such as
  `match: { type }`, `match: { id }`, and array-valued one-of matchers.
  Property matchers intentionally ignore `text` and `children`; content and
  structure checks remain predicates. Predicates also remain for computed
  schema policy, path-dependent logic, truthiness semantics, or consumed type
  narrowing.
- Flat node-query aliases are forbidden: no `editor.api.findPath`,
  `editor.api.some`, `read.nodes.pathOf`, Plate wrappers, or implicit type/ID
  scans. Use `editor.read.nodes.path`, `editor.read.nodes.some`, and direct
  node targets.
- Boolean node-query law: when an entry-producing collection query is used only
  for truthiness and `nodes.some` has the same target/match/traversal semantics,
  use `editor.read.nodes.some`. Keep `above`, `block`, `parent`, `previous`, and
  `next` when their ancestor/current-block/relative traversal is the actual
  question, and keep any entry-producing query when the node/path is consumed.
- Optional public-read law: Plate feature-package source handles unresolved
  Plite reads with an early return/no-op. `{ required: true }` is reserved for
  Plite internals with a proven runtime invariant; fixture assertions are the
  test-only exception.
- Explicit normalization law: bare `tx.normalize()` /
  `editor.update.normalize()` is an explicit full-root pass in Plite. Feature
  code may keep it only for a named full-root semantic invariant. Do not use it
  to coalesce equivalent text leaves or preserve old fixture shape. Prefer
  transaction dirty-path normalization, repair a universal invariant in Plite,
  and classify every match in the active scope as `cut`,
  `semantic-dirty-path`, `semantic-full-root`, `explicit-normalizer-test`,
  `lifecycle-option`, or `Plite-owner-gap`.
- Active transaction law: no `editor.update.*` call may appear inside an
  `editor.update(...)`, `editor.update.withoutNormalizing(...)`, transform
  middleware, or other active transaction callback. The callback must receive
  and use the active `tx`; `withoutNormalizing` callbacks should be
  `({ tx }) => { ... }`.
- Plugin export inference law: plugin constants should infer from
  `createBasePlugin`, `createPlatePlugin`, `toPlatePlugin`, and chained
  `.extend*` methods. Do not annotate exports as `BasePlugin<Config>` /
  `PlatePlugin<Config>` or cast chained plugin results unless the annotation is
  a true external boundary. If inference fails, fix the builder/generic owner.
- Empty config inference law: do not create `type FooConfig =
  PluginConfig<'foo'>` only to call `createBasePlugin<FooConfig>({ key:
  'foo' })`. Manual plugin config types are only for real options, API, tx,
  selectors, state, or external public contracts.
- Plugin editor extension law: plugin-owned editor extension options should be
  returned directly from `extendExtension`. Do not wrap them in
  `defineEditorExtension({ name: pluginName, ... })` just to satisfy types.
  `extendExtension` must accept both built extensions and raw options; raw
  options without `name` default to the owning plugin key. Keep explicit names
  only for genuinely separate extension identities.
- Inferred local type law: do not annotate local variables whose initializer
  should infer the type. Smells like `const entries: NodeEntry<T>[] =
  editor.read...` or `const value: Value = [...]` hide type regressions at the
  owner API. Remove the annotation and fix the source API if inference is weak.
  Keep annotations only for uninferrable locals such as empty arrays,
  deliberate narrowing/widening, exported/public signatures, or external
  boundary callbacks.
- Plugin option law: root plugin option helpers are forbidden public API. Do
  not use or re-add `editor.getOption(...)`, `editor.getOptions(...)`,
  `editor.setOption(...)`, or `editor.setOptions(...)`. Package code should use
  scoped plugin portals by default (`editor.plugin(FooPlugin).getOption(...)`,
  `editor.plugin(FooPlugin).getOptions()`,
  `editor.plugin(FooPlugin).setOption(...)`,
  `editor.plugin(FooPlugin).setOptions(...)`). `usePluginOption(FooPlugin, ...)`
  remains the render-subscription path. Key+generic fallbacks need an owner
  reason: plugin self-definition cycle, React hook/component imported by the
  plugin itself, non-React layer that must not import a React plugin, or
  intentionally decoupled cross-package code. Plugin-owned helper graphs should
  receive plugin context (`api`, `getOption`, `getOptions`, `setOption`, `tx`)
  or be thin wrappers over the typed plugin API/tx group.

Boundaries:
- allowed edit scope: `packages/plite`, exact matching consumers under `packages/**`, focused tests/type-tests, one `.changeset`, generated barrels only if required, and this plan
- package/API surfaces: Plite public transaction/one-shot node mutations plus consumer call sites with exact replacement semantics
- docs/browser surfaces: no content/apps/templates/browser work; package/API proof only
- non-goals: no broad Core review, no legacy Slate-compatible `replaceNodes` option bag, no unrelated package cleanup, no file/folder renames
- out-of-scope package errors: record but do not repair unless caused by this API change

Output budget strategy:
- Count and list matching files before printing source lines; use targeted
  `sed`/`rg` reads with capped output.
- Exclude `dist`, generated output, build artifacts, apps, content, templates,
  and `node_modules` from exploratory sweeps.

Blocked condition:
- Stop only if the accepted atomic semantics cannot be implemented without a broader public API decision, or repeated focused proof shows an external/tooling blocker with no autonomous alternative.

Current verdict:
- verdict: move-to-plite, then hard-cut local package bridges
- confidence: high; public API, full Plite suite, focused consumer proof, source audits, and autoreview are complete
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: exact node replacement is generic mutation substrate; package-local remove+insert copies operation/history/selection semantics in the wrong owner

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact accepted API, sweep scope, non-goals, stop condition, proof, and handoff are copied above. |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read fully before implementation. |
| Active goal checked or created | yes | `get_goal` returned no active goal; goal creation follows this static shell. |
| Mode classified as named packet vs broad Core sweep | yes | Accepted public API implementation plus broad exact-pattern package sweep; not broad Core. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Plite owns exact-node mutation; no legacy `replaceNodes` alias/options. |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep is out of scope. |
| Source of truth and allowed workspace recorded | yes | Current checkout source under `/Users/zbeyens/git/plate-2`; allowed edit scope recorded above. |
| Output budget strategy recorded | yes | Count/file-list searches first; targeted capped reads; exclude generated/build paths. |
| Public API fork routing checked | yes | API recommendation was presented in the preceding exchange and accepted by the user's `ok fix sweep`. |
| Gap policy checked | yes | Smallest owner is Plite node mutation substrate; local bridges will be cut. |
| Related scoped sweep policy checked | yes | Explicit user `sweep` authorizes all exact package-source matches, not unrelated cleanup. |
| Review-mode rename freeze checked | yes | No rename pass; preserve existing owners/names except hard-cutting the local bridge symbol. |
| Package review checklist initialized when in scope | no | N/A: this is not package review mode. |
| Package/API pack selected | yes | `package-api` materialized in this plan. |
| Public surface or package boundary identified | yes | Plite transaction and one-shot node mutation API. |
| Release artifact path selected | yes | `.changeset` required for published Plite API/runtime behavior. |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read fully; user-visible delta will be described relative to `origin/main`. |
| Barrel/export impact decision recorded | yes | Run `pnpm brl` if a public transform/exported file is added or an exported barrel changes; otherwise record N/A. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Owner/API decision | complete | User accepted Plite-owned exact replacement with no legacy alias. | Implement. |
| Plite implementation | complete | Public transaction and one-shot APIs lower to one `replace_children`. | Migrate callers. |
| Package sweep | complete | Seven legacy-symbol matches patched; two semantic non-matches justified. | Verify. |
| Verification/review | complete | Owning proof green, exact Biome check green, third autoreview pass clean. | Close plan. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [x] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut.
- [x] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof.
- [x] After every correction, related scoped sweep row is added with query,
      active scope, match count, patched count, deferred count, and remaining
      risk. In package review mode, broader matches are deferred, not patched.
- [x] Broad Core file-ledger gate is N/A because this is an exact API/pattern sweep, not a broad Core sweep.
- [x] Broad Core row-shape gate is N/A for the same reason.
- [x] Broad Core manifest-count gate is N/A for the same reason.
- [x] Broad Core drift-score gate is N/A; the scoped review matrix below owns all inspected targets:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
- [x] Package-review file checklist is N/A because the user requested a cross-package exact-pattern sweep.
- [x] Package-review score-100 row gate is N/A for the same reason.
- [x] Package-review next-package gate is N/A for the same reason.
- [x] Core-adjacent package-review coverage is N/A; no package is being admitted to `check:core` by this packet.
- [x] Direct one-shot API audit closed: single-operation
      `editor.update((tx) => tx.*)` and single-read
      `editor.read((state) => state.*)` wrappers are replaced with direct
      methods when available, or each remaining callback is justified as grouped
      transaction/snapshot logic.
- [x] Live node target and matcher audit closed: the new API accepts live descendants directly; detached live targets no-op and are tested.
      rediscovered by type/ID, no flat `api.findPath` / `api.some` alias remains
      in scope, equality-only callbacks use property matchers, and every
      remaining predicate has computed/path/truthiness/narrowing semantics.
- [x] Optional public-read audit closed: touched feature code does not add required reads or non-null assertions.
      not use `{ required: true }` or non-null assertions to hide unresolved
      Plite reads; each match handles `undefined` or records a Plite-internal
      invariant reason.
- [x] Explicit normalization audit closed: this packet adds no explicit normalization calls.
      `editor.update.normalize(...)` match in scope has a ledger verdict;
      feature production calls have a named full-root semantic invariant or are
      cut/moved to the Plite owner; explicit normalizer tests remain test-only
      evidence rather than production precedent.
- [x] Plugin export inference audit closed: no plugin export annotations or casts were added or touched.
      such as `: BasePlugin<Config>`, `: PlatePlugin<Config>`, and
      `as BasePlugin<Config>` are removed when inference should own the result,
      or each remaining annotation is justified as a real external boundary.
- [x] Empty config inference audit closed: no empty plugin config surface was added or touched.
      `createBasePlugin<Config>` generics are removed when the config has no
      typed options, API, tx, selectors, state, or external public contract.
- [x] Plugin extension options audit closed: no editor-extension composition was added or touched.
      returned directly from `extendExtension`; `defineEditorExtension` remains
      only for standalone Plite extensions, existing built extensions, or
      explicit non-plugin extension identities.
- [x] Bridge scoring law applied: the AI-local `replaceNodesAt` bridge was deleted, not preserved or renamed.
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API fork was proposed in the preceding exchange and accepted by the user's `ok fix sweep` before implementation.
- [x] Review-mode rename freeze applied: no files or public names were renamed; only the private helper was deleted.
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [x] Extracted-file recovery gate closed: the only untracked in-scope files are the required changeset and this proof ledger; neither is extracted product source.
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [x] Safe cleanup packet is kept after focused proof and three autoreview passes.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` passed after the public export change.
- [x] Old compatibility names are source-audited and final count is zero.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed through count-first queries and capped reads.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix selects one Plite patch changeset.
- [x] Package/API pack: `changeset` was loaded and the Plite patch prose names the public API delta.
- [x] Package/API pack: registry-only branch is N/A; no registry files changed.
- [x] Package/API pack: no-artifact branch is N/A because Plite users receive a public API/runtime delta.
- [x] Package/API pack: no compatibility alias; package-local legacy helpers are hard-cut.
- [x] Package/API pack: owning package typecheck, build, full tests, and focused consumer proof are recorded.
- [x] Package/API pack: `pnpm brl` passed; no generated barrel changes were required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Pass: Plite typecheck/build/full suite and focused consumers are green. |
| Broad Core drift ledger coverage | no | N/A: not a broad Core sweep | N/A recorded below. |
| Score gate | yes | Own every scoped high-drift row | Pass: all score 2+ rows have evidence/owner/decision; score 4+ rows were fixed. |
| Best Plate v2 recommendation | yes | Record current shape and rejected alternatives | Pass: Plite exact-node API plus direct package callers. |
| Plite/Plate gap ledger | yes | Record blocker or closure | Pass: missing Plite capability was added; no Plate gap remains. |
| Related scoped sweep after correction | yes | Record same-class searches | Pass: legacy symbols 7/7 patched; bounded pair scan 2/2 justified. |
| Package file checklist | no | N/A: not package review mode | N/A recorded below. |
| Package/API proof | yes | Run focused typecheck/test/build | Pass; exact commands below. |
| Shared Core gate coverage | no | N/A: no package added to Core coverage | `pnpm check:core` was diagnostic only and exposed existing unrelated migration failures. |
| Non-Core package error triage | yes | Classify broad-check failures | Pass: all failures are listed below and do not reference the new Plite implementation. |
| Source audit | yes | Audit removed compatibility names | Pass: `replaceNodesAt` and `.tf.replaceNodes` count 0. |
| Rename ledger | no | N/A: no rename postponed | No `pre-renaming` update required. |
| Extracted-file inventory | yes | Inventory untracked in-scope files | Pass: 2 rows, both required non-source artifacts. |
| Autoreview / review | yes | Run until no accepted findings remain | Pass after fixing two accepted findings; third pass clean. |
| Final lint/check | yes | Run exact-file formatter/lint check | Pass: Biome checked 16 files, no fixes. Global `check:core` blocker recorded. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Pass below. |
| Goal plan complete | yes | Run final plan checker | Pass: `[autogoal] complete`. |
| Public API / package boundary proof | yes | Audit API, export, and lowering | Pass: both entrypoints expose `nodes.replace`; runtime emits one existing `replace_children`. |
| Release artifact classification | yes | Classify published delta | Published Plite API/runtime/type delta. |
| Published package changeset | yes | Add legal Plite patch changeset | `.changeset/plite-exact-node-replace.md`; `@platejs/plite: patch`. |
| Registry changelog | no | N/A: no registry changes | No registry artifact. |
| No release artifact | no | N/A: changeset required | Public Plite delta is not artifact-free. |
| Package typecheck/build/test | yes | Run owner proof | Plite all green; consumer focused proof green; unrelated broad blockers listed. |
| Barrel/export generation | yes | Run `pnpm brl` | Pass; no generated changes required. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `tx.nodes.replace` / `editor.update.nodes.replace` | 5 | move-to-plite, fixed | Plite | Public types, one-shot wrapper, atomic lowering, 1023-test suite | Keep. |
| `streamInsertChunk.ts` local helper and split replacement | 4 | cut, fixed | AI consumer | Helper deleted; all exact replacements use one `tx.nodes.replace` | Keep direct calls. |
| `applyAISuggestions.ts` exact replacement | 3 | main-parity-cleanup, fixed | AI consumer | Same-path remove+insert collapsed | Keep direct call. |
| `aiStreamSnapshot.ts` range replacement | 3 | main-parity-cleanup, fixed | AI consumer | Multi-node range uses one `replaceChildren` with exact count | Keep range primitive. |
| `CodeBlockRules.ts` exact replacement | 3 | main-parity-cleanup, fixed | code-block consumer | Uses `tx.nodes.replace`; post-write point read uses transaction draft | Keep direct call. |
| table `replaceNodes(..., { children: true })` calls | 3 | main-parity-cleanup, fixed | table consumer | Child semantics migrated to `replaceChildren`, not falsely mapped to exact-node replacement | Keep semantic owner. |
| Plite and Plite React contracts | 2 | proof migration, fixed | Plite test owners | Exact remove+insert test helpers use public API; inference/runtime rows added | Keep. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Exact one-node replacement | Public Plite `nodes.replace(nodes, { at, select? })` on transaction and one-shot update surfaces | Package-local helper; legacy Slate `replaceNodes` option bag; public raw-transform alias | It centralizes atomic operation, selection, live-target, and rollback semantics in the editor substrate | none |
| Child-range replacement | Existing `nodes.replaceChildren` | Pretending `{ children: true }` means exact-node replacement | A parent child-range is a different operation and already has the right Plite owner | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plite gap, closed | Exact one-node replacement with zero/one/many nodes | Local remove+insert creates multiple operations and repeats selection/target logic | `packages/plite` node mutation API | Type inference, one-operation runtime proof, target and selection tests | Added and verified. |
| Plate gap | none | N/A | N/A | Focused consumer proof | No Plate wrapper required. |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Delete old replacement API/helper names | `packages/**` source | `rg -n 'replaceNodesAt|\.tf\.replaceNodes' packages` | 7 initial | 7 | 0 | Final count 0. |
| Collapse adjacent exact remove+insert pairs | `packages/*/src/**/*.{ts,tsx}` | bounded multiline `nodes.remove` then `nodes.insert` scan | 2 final candidates | 0 | 2 | Both differ semantically: DnD cross-editor copy/delete and full-block multi-range synthesis. |
| Review-found multiblock replacement | `packages/ai/.../streamInsertChunk.ts` | scoped manual/runtime review | 1 | 1 | 0 | One atomic replacement now covers all streamed blocks. |
| Review-found post-write read | `packages/code-block/.../CodeBlockRules.ts` | scoped transaction-state review | 1 | 1 | 0 | Read now comes from `tx.points.start`. |

Core drift ledger:
- Applies: no
- Manifest command: N/A: broad Core sweep was not requested
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: 0 by non-applicability
- Extra row count: 0 by non-applicability
- Score gate: N/A; scoped scores are in the review matrix
- Top drift rows: N/A for Core; scoped top drift was missing Plite exact replacement

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A: broad Core review excluded | 0 | out-of-scope | Core | Explicit mode boundary | None. |

Package file checklist:
- Applies: no
- Package: N/A: cross-package exact-pattern sweep
- Manifest command: N/A
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: N/A
- Actual row count: N/A
- Checked score-100 count: N/A
- Unchecked/deferred count: 0 by non-applicability
- Missing row count: 0 by non-applicability
- Extra row count: 0 by non-applicability
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: N/A

Package file rows:
- [x] N/A — this run is not package review mode.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Plite exact-node API | Plite | Exact replacement belongs in substrate, not package helper | Plite interfaces/runtime/tests | Implement public atomic primitive | Keep after proof. |
| Package caller migration | AI, code-block, table, Plite React | Old helper/Slate calls and exact remove+insert pairs drift from public API | Exact source sweep plus focused tests | Hard-cut helper; choose `replace` versus `replaceChildren` by semantics | Final source audit. |
| Closure | plate-next | Catch transactional drift and stale names | Biome, full/focused tests, source audits, autoreview | Two findings fixed; final review clean | Close packet. |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `.changeset/plite-exact-node-replace.md` | required release artifact | `origin/main` has no Plite package owner; current release lane already publishes Plite changesets | Keep Plite patch changeset | Changeset rules loaded; version is patch. |
| `docs/plans/2026-07-13-plite-exact-node-replace-sweep.md` | required proof ledger | Generated from repo goal template | Keep plan | Final plan checker. |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `pnpm --filter @platejs/code-block typecheck` | Existing `BaseCodeBlockPlugin.spec.ts` generic assignability failures | Errors do not reference `CodeBlockRules.ts` or `nodes.replace`; focused input-rule test passes | Separate plugin-generic migration owner. |
| `pnpm --filter @platejs/table typecheck` and focused table load | Package still imports unmigrated legacy Core/Slate exports; focused load misses old `combineTransformMatchOptions` dist export | Existing package migration state, not caused by replacing three legacy calls | Next table migration packet. |
| multi-package Turbo typecheck | Existing `@platejs/resizable` missing `tf`/`useReadOnly` plus the package failures above | No error points at the new Plite API | Resizable/package migration owners. |
| `pnpm check:core` | Existing plugin-generic spec failures in `indent`, `basic-styles`, `basic-nodes`, and `code-block` | Plite owner typecheck and full suite pass; failures are outside this exact API packet | Core/plugin generic cleanup packet. |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| Bounded `nodes.remove` then `nodes.insert` | `packages/dnd/src/transforms/onDropNode.ts` | Cross-editor copy followed by source deletion uses different editors/paths | DnD owner; keep. |
| Bounded `nodes.remove` then `nodes.insert` | `packages/plite-react/src/editable/mutation-full-block-editing.ts` | Removes one-or-many selected blocks and inserts one synthesized replacement at a computed path | Plite React block-editing owner; keep until a dedicated multi-range primitive exists. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Added Plite exact-node `replace`; migrated AI/code-block/table callers by real semantics; removed AI helper and unnecessary table casts. |
| tests/proof | Added Plite runtime/inference/public-package rows; migrated Plite React and rollback contracts. |
| docs/templates/skills | Added one Plite patch changeset and this goal ledger; no template/skill edits. |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Global Core/package checks are already red | They prevent a repo-wide green claim but do not invalidate focused proof | Out-of-scope drift table | Fix in dedicated plugin-generic and package migration packets; do not contaminate this API patch. |

Findings:
- Exact-node replacement was missing from Plite, so packages recreated it with multi-operation helpers.
- Legacy `children: true` table calls were not exact-node replacement; mapping them to `replace` would have been wrong.
- Autoreview caught two real transactional bugs: split multiblock replacement and a post-write read from committed editor state.

Decisions and tradeoffs:
- `nodes.replace` accepts only a `Path` or live descendant and emits one existing `replace_children` operation.
- Empty replacement deletes the target; `select: true` collapses to the final replacement end when a replacement exists.
- Detached live targets no-op; root replacement rejects.
- No legacy `replaceNodes` alias, middleware key, or package-local bridge survives.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial Plite typecheck exposed generic transaction invariance from `EditorReplaceNodeOptions<V>` | 1 | Match existing structural options ownership | Made options non-generic (`Descendant | Path`); typecheck passed without casts. |
| AI proof initially missed built markdown/selection declarations | 1 | Build only the required artifact-facing dependencies | Built both packages, then AI typecheck and focused tests passed. |
| Direct Bun invocation of Plite React tests lacked Vitest/jsdom setup | 1 | Use package Vitest config | Correct command passed 60 tests. |
| Broad package/Core checks exposed unrelated migration failures | 3 command groups | Keep focused owner proof and classify failures | Recorded above; no failing error points to new Plite implementation. |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/plite` — pass.
- `pnpm --filter @platejs/plite test` — 1023 pass, 85 skipped, 0 fail.
- `pnpm --filter @platejs/plite build` — pass.
- `pnpm --filter @platejs/ai typecheck` — pass.
- AI focused snapshot/suggestion tests — 11 pass.
- code-block input-rule test — 3 pass.
- `pnpm --filter @platejs/plite-react typecheck` — pass.
- Plite React focused Vitest command — 60 pass.
- `pnpm brl` — pass; no generated Plite barrel output required.
- Biome exact-file check — 16 files checked, no fixes.
- final exact legacy-symbol source audit — 0 matches.
- autoreview — two accepted findings fixed; third pass clean.
- Browser proof — N/A: no runnable UI behavior or app/content surface changed.
- `pnpm check:core` — fails on recorded existing plugin-generic specs; no repo-wide green claim.

Final handoff contract:
- target surface and mode: Plite exact-node API plus all package-source exact replacement matches; accepted API implementation and sweep
- files/APIs reviewed: 16 changed TS/TSX files, `nodes.replace`, affected exact/child-range callers, changeset, and plan
- broad Core drift score coverage: N/A; broad Core review excluded
- package file checklist coverage: N/A; not package review mode
- best Plate v2 recommendation: Plite owns atomic exact replacement; packages call it directly; child ranges use `replaceChildren`
- verdict matrix summary: all score 4+ drift fixed; all score 2+ rows owned and resolved
- Plite/Plate gaps or blockers: Plite gap closed; no Plate gap; unrelated global generic/package blockers recorded
- related scoped sweep query/active scope/matches/patched/deferred: legacy symbols 7/7/0; bounded pair scan 2/0/2 with semantic reasons
- out-of-scope matches discovered: DnD cross-editor move and Plite React multi-block synthesis
- changes made: public API/runtime/tests, consumer migrations, one patch changeset
- tests/proof commands: owning Plite proof and focused consumers green; global blocker disclosed
- old compatibility names audited: yes, final count 0
- needs attention: existing global plugin-generic and table/resizable migration failures only
- next best Plate Next packet: resume package queue; table is the clearest remaining legacy migration blocker

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closure |
| Where am I going? | Plan checker, then handoff |
| What is the goal? | Add atomic Plite exact-node replacement and remove matching package drift. |
| What have I learned? | Exact replacement belongs in Plite; table child replacement is distinct. |
| What have I done? | Implemented, swept, tested, linted, reviewed, and classified global blockers. |

Timeline:
- 2026-07-13T22:54:39.898Z Goal plan created.
- 2026-07-14 Plite API and package caller sweep implemented.
- 2026-07-14 Focused/full proof completed; two autoreview findings repaired; final review clean.
- 2026-07-14 Final source audits reached zero stale legacy symbols; global check blockers classified.
- 2026-07-14 Final autogoal plan checker passed.

Open risks:
- Global `check:core` remains red on existing plugin-generic test typing outside this packet.
- Table and resizable still need their broader Plate v2 migrations.
- The two deferred remove+insert algorithms are intentionally not exact-node replacement.
