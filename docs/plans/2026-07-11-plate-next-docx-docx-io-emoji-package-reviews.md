# plate-next docx docx-io emoji package reviews

Objective:
Close docx, docx-io, and emoji package drift; done when all 194 tracked rows
score 100 or are explicitly deferred and package proof plus autoreview pass.

Goal plan:
docs/plans/2026-07-11-plate-next-docx-docx-io-emoji-package-reviews.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user requested `plate-next next 3 packages`
- mode: sequential three-package review
- target surface: `packages/docx`, then `packages/docx-io`, then
  `packages/emoji`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, inside the active package
- package review mode: yes
- package review target: 76 docx + 64 docx-io + 54 emoji tracked files
- package file checklist gate: exactly 194 rows materialized before code edits
- completion threshold summary: close each package before starting the next;
  194/194 rows score 100 or are explicitly deferred, package proof and
  autoreview pass, then the final plan checker passes

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
- semantics: one-shot completion
- initial confidence score: 0.45
- improvement loop: review and close `docx`, then `docx-io`, then `emoji`
- final score / loop closure: 1.0; all 194 rows closed and final proof clean

Completion threshold:
- All 194 package rows score 100 or carry an explicit user-review deferral.
- `docx` closes before `docx-io`; `docx-io` closes before `emoji`.
- DOCX import/export behavior, docx-io remote-image security defaults, and
  emoji search/picker behavior remain covered by focused proof.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-11-plate-next-docx-docx-io-emoji-package-reviews.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: package-local tests, package typecheck/build,
  `pnpm lint:fix`, related source audits, and `autoreview`
- package proof: focused package tests plus source-first package typecheck and
  release-artifact build for each package
- shared Core gate: N/A unless a smallest Core owner must change; these are
  import/export and product UI packages, not Core gate owners
- source audits: umbrella imports, stale APIs, casts, root options, asserted
  reads, transaction misuse, dependency truth, dead exports, and security
  defaults
- related scoped sweep query / active scope / match count / patched count / deferred count:
  package-local stale API, alias, trust-boundary, singleton, observer, and
  reviewer-triggered sweeps recorded below; all active-scope matches patched,
  0 deferred
- package file manifest / row count / checked count / deferred count: 194 / 0
  / 0 at checkpoint zero
- Plite/Plate gap ledger: record blockers per package; currently none known
- broad Core drift ledger gate: N/A; broad Core sweep not requested
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-11-plate-next-docx-docx-io-emoji-package-reviews.md`

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
- allowed edit scope: the 194 tracked rows, this goal plan, package
  changesets, lockfile changes caused by valid dependency corrections, and the
  smallest Plite/Core owner required to remove a blocker
- package/API surfaces: `packages/docx`, `packages/docx-io`, `packages/emoji`
- docs/browser surfaces: excluded unless the package has no non-browser proof
  path and browser proof is required to substantiate behavior
- non-goals: docs, examples, apps, registry generation, renames, commits, PRs,
  and unrelated packages
- out-of-scope package errors: record without patching unless they prove a
  regression caused by this batch

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- A public API fork, missing Plite substrate, security-default conflict, or
  repeated package-proof failure that cannot be resolved inside the allowed
  package plus smallest-owner scope.

Current verdict:
- verdict: closed; `docx` 76/76, `docx-io` 64/64, and `emoji` 54/54
- confidence: 1.0
- next owner: plate-next
- keep / revert / quarantine call: keep all three closed packets; hard-cut
  seven dead DOCX list files and one order-dependent emoji mock spec
- reason: all packages pass focused/slow tests, combined typecheck, build,
  lint, manifest, barrel, source/security audits, and final autoreview

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| checkpoint-zero manifest | complete | 194 tracked, 0 untracked, 194 materialized before edits | docx |
| docx review | complete | 76/76 score 100; fast/slow/typecheck/build/lint green | docx-io |
| docx-io review | complete | 64/64 score 100; fast/slow/security/typecheck/build/lint green | emoji |
| emoji review | complete | 54/54 score 100; tests/typecheck/build/lint green | combined closeout |
| combined closeout | complete | manifests, barrels, diff audit, and post-fix autoreview clean | goal completion |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Objective, boundaries, threshold, proof, and handoff copied above |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | active durable goal created for this plan |
| Mode classified as named packet vs broad Core sweep | yes | sequential three-package review; no broad Core sweep |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Plate Next source and constraints |
| Broad Core drift ledger initialized when in scope | no | broad Core sweep excluded |
| Source of truth and allowed workspace recorded | yes | current checkout plus named packages and smallest blocker owner |
| Output budget strategy recorded | yes | counts/manifests first; targeted reads per package |
| Public API fork routing checked | yes | any discovered fork routes to `plate-plan` before implementation |
| Gap policy checked | yes | missing substrate becomes a Plite/Plate gap, not a compatibility helper |
| Related scoped sweep policy checked | yes | each correction gets an active-package sweep |
| Review-mode rename freeze checked | yes | current `HEAD` names/paths stay fixed |
| Package review checklist initialized when in scope | yes | 194 rows materialized below before implementation |

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
- [x] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout.
- [x] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`.
- [x] For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
- [x] For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
- [x] For package review mode, the package file checklist is generated before
      implementation, with one checkbox per reviewed file.
- [x] For package review mode, every package file row is either checked at
      score `100` with evidence or left unchecked with deferral reason, owner,
      proof needed, and next action for user review.
- [x] For package review mode, no next package is started before the current
      package checklist closes or the user explicitly redirects.
- [x] For Core-adjacent package review, `tooling/scripts/check-core.mjs` is
      updated to include the package, or the plan records why the package is
      product-only and outside `check:core`.
- [x] Direct one-shot API audit closed: single-operation
      `editor.update((tx) => tx.*)` and single-read
      `editor.read((state) => state.*)` wrappers are replaced with direct
      methods when available, or each remaining callback is justified as grouped
      transaction/snapshot logic.
- [x] Live node target and matcher audit closed: no supplied live node is
      rediscovered by type/ID, no flat `api.findPath` / `api.some` alias remains
      in scope, equality-only callbacks use property matchers, and every
      remaining predicate has computed/path/truthiness/narrowing semantics.
- [x] Optional public-read audit closed: feature-package production code does
      not use `{ required: true }` or non-null assertions to hide unresolved
      Plite reads; each match handles `undefined` or records a Plite-internal
      invariant reason.
- [x] Explicit normalization audit closed: every `tx.normalize(...)` and
      `editor.update.normalize(...)` match in scope has a ledger verdict;
      feature production calls have a named full-root semantic invariant or are
      cut/moved to the Plite owner; explicit normalizer tests remain test-only
      evidence rather than production precedent.
- [x] Plugin export inference audit closed: plugin export annotations/casts
      such as `: BasePlugin<Config>`, `: PlatePlugin<Config>`, and
      `as BasePlugin<Config>` are removed when inference should own the result,
      or each remaining annotation is justified as a real external boundary.
- [x] Empty config inference audit closed: `PluginConfig<'key'>` aliases and
      `createBasePlugin<Config>` generics are removed when the config has no
      typed options, API, tx, selectors, state, or external public contract.
- [x] Plugin extension options audit closed: plugin-owned extension options are
      returned directly from `extendExtension`; `defineEditorExtension` remains
      only for standalone Plite extensions, existing built extensions, or
      explicit non-plugin extension identities.
- [x] Bridge scoring law applied: forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is run when exports/barrels change.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | all named proof green |
| Broad Core drift ledger coverage | N/A | Broad Core sweep excluded | product package review only |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | 194/194 score 100, 0 deferred |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | three rows below |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | no substrate gap for any package |
| Related scoped sweep after correction | yes | For each correction, run and record same-class search/review results inside the active scope | ledger below, 0 active matches left |
| Package file checklist | yes | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | 194 expected/actual/checked, 0 missing/extra/deferred |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | fast/slow tests, 18-task typecheck, three builds green |
| Shared Core gate coverage | N/A | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | import/export/emoji product packages do not belong in `check:core` |
| Non-Core package error triage | yes | Classify reported outside failures | yjs/link/list/table dependency-build drift recorded out of scope |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | stale API/alias/trust queries clean |
| Rename ledger | N/A | Record postponed renames when any exist | rename freeze held; no rename proposed |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | 0 package-local untracked files |
| Autoreview / review | yes | Run review gate for non-trivial implementation diffs | two P2 findings fixed; rerun clean |
| Final lint/check | yes | Run scoped lint/check | three package lints and scoped diff check green |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | filled below; no attention item |
| Goal plan complete | yes | Run final checker after recording evidence | ready for checker |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/docx` | 0 | keep-in-plate after repair | docx | 76/76 rows at 100; 44 fast + 5 fixture tests; typecheck/build/lint green | start docx-io |
| `packages/docx-io` | 0 | keep-in-plate after repair | docx-io | 64/64 rows at 100; 97 fast + 36 slow tests; typecheck/build/lint green | start emoji |
| `packages/emoji` | 0 | keep-in-plate after repair | emoji | 54/54 rows at 100; 24 tests; typecheck/build/lint green; reviewer rerun clean | close batch |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `DocxPlugin` and DOCX cleaner | Base plugin using the current parser contract; one active list-import path; browser-owned DOM nodes; single RTF image-map parse | removed `createSlatePlugin`/`SlatePlugin`, `any` callback scaffolding, dead alternate list conversion, unused React compiler dependency | clean Plate import package over the current core parser contract | no |
| `DocxExportPlugin` and HTML-to-DOCX renderer | current base plugin/API/transaction model; `editor.update.docxExport`; remote images opt-in; trusted data URIs allowed; self-contained importer fixtures | removed Slate factory/editor types, `editor.tf`, compatibility type aliases, unconditional remote fetches, fake component/config casts, unused peers/deps | current Plate export package with explicit trust boundary | no |
| Emoji plugin, search, and picker | direct Core/Plite/Utils ownership; Base plugins; `editor.update` insertion; per-dataset search state; cleaned observer lifecycle | rejected Slate factories/editor types, global first-editor singletons, broad production `any`, property-losing text insertion, and incompatible global module mocks | current Plate React package with isolated editor/data state and full node preservation | no |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A for docx | none | no workaround needed | docx | package proof | closed |
| N/A for docx-io | none | no workaround needed | docx-io | package and security proof | closed |
| N/A for emoji | none | no workaround needed | emoji | package and React lifecycle proof | closed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| replace removed plugin factory/types | `packages/docx` | `rg 'createSlatePlugin|SlatePlugin|\\bany\\b|as any' packages/docx/src` | 0 after patch | 3 source/test owners repaired | 0 | none |
| hard-cut alternate list converter | `packages/docx` | `rg 'cleanDocxListElementsToList|docxListToList|getDocxListNode|isDocxOl' packages/docx` excluding changelog/plan | 0 after patch | 7 files + barrel exports removed | 0 | none |
| remove unused runtime dependency | `packages/docx` + lock importer | build-output/source audit for `react-compiler-runtime` | 0 runtime imports | package manifest + lock importer patched | 0 | none |
| migrate v54 export plugin | `packages/docx-io` | `rg 'createSlateEditor|createTSlatePlugin|SlateEditor|editor\\.tf|as unknown as' packages/docx-io/src/lib/{docx-export-plugin.tsx,importDocx.ts,types.ts}` | 0 after patch | plugin/import/type owners repaired | 0 | none |
| restore shipped remote-image default | `packages/docx-io` renderer | every `isValidUrl(imageSource)` and data-URI branch audited | 3 remote paths gated; 3 data-URI paths retained | options/default/document/render owners patched | 0 | none |
| remove compatibility/dependency drift | `packages/docx-io` | aliases, package imports, dependency-to-source audit | 2 aliases + 3 unused deps/peers removed | manifest, lock, source patched | 0 | none |
| migrate emoji Base/editor APIs | `packages/emoji` | stale factory/editor/root-option query | legacy matches in 5 owners; 0 after patch | plugin, transform, and specs repaired | 0 | none |
| isolate emoji data state | `packages/emoji` | `static instance|getInstance` review across search/library owners | 3 global singleton owners | all 3 factories return dataset/settings-bound instances | 0 | none |
| clean emoji production types/lifecycle | `packages/emoji` | production `any`, observer timeout, storage/search/grid typing audit | 9 owners repaired; 0 production `any` left | types, grid, search, storage, observer owners patched | 0 | none |
| autoreview P2 remote-image truncation | `packages/docx-io` child-image loop | audit all image-loop exits after trust gate | 3 sibling-truncating `break` paths | all 3 changed to `continue`; XML regression added | 0 | none |
| autoreview P2 emoji text properties | `packages/emoji` insertion | compare node insertion with text-only insertion | 1 property-losing branch | full node insertion restored; custom property test added | 0 | none |

Core drift ledger:
- Applies: no; broad Core sweep was not requested
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | broad Core sweep excluded | N/A | package manifests own coverage | none |

Package file checklist:
- Applies: yes
- Package: `docx` -> `docx-io` -> `emoji`
- Manifest command: `git ls-files packages/docx packages/docx-io packages/emoji | sort`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 194 (docx 76, docx-io 64, emoji 54)
- Actual row count: 194
- Checked score-100 count: 194
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: every row in the current package scores 100 or
  carries an explicit user-review deferral

Package file rows:
- [x] `packages/docx-io/CHANGELOG.md` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: metadata/dependency audit + manifest/typecheck/build — next: none
- [x] `packages/docx-io/package.json` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: metadata/dependency audit + manifest/typecheck/build — next: none
- [x] `packages/docx-io/src/index.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/__tests__/block_quotes.slow.tsx` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 36 slow DOCX fixture tests + source audit — next: none
- [x] `packages/docx-io/src/lib/__tests__/headers.slow.tsx` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 36 slow DOCX fixture tests + source audit — next: none
- [x] `packages/docx-io/src/lib/__tests__/inline_formatting.slow.tsx` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 36 slow DOCX fixture tests + source audit — next: none
- [x] `packages/docx-io/src/lib/__tests__/links.slow.tsx` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 36 slow DOCX fixture tests + source audit — next: none
- [x] `packages/docx-io/src/lib/__tests__/tables.slow.tsx` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 36 slow DOCX fixture tests + source audit — next: none
- [x] `packages/docx-io/src/lib/__tests__/testDocxImporter.tsx` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 36 slow DOCX fixture tests + source audit — next: none
- [x] `packages/docx-io/src/lib/docx-export-plugin.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast tests + source audit — next: none
- [x] `packages/docx-io/src/lib/docx-export-plugin.tsx` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/html-to-docx.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast tests + source audit — next: none
- [x] `packages/docx-io/src/lib/html-to-docx.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/importDocx.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast tests + source audit — next: none
- [x] `packages/docx-io/src/lib/importDocx.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/index.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/constants.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/docx-document.slow.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 36 slow DOCX fixture tests + source audit — next: none
- [x] `packages/docx-io/src/lib/internal/docx-document.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/helpers/render-document-file.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast tests + source audit — next: none
- [x] `packages/docx-io/src/lib/internal/helpers/render-document-file.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/helpers/xml-builder.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/html-to-docx.slow.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 36 slow DOCX fixture tests + source audit — next: none
- [x] `packages/docx-io/src/lib/internal/html-to-docx.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/index.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/namespaces.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/schemas/content-types.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/schemas/core.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast tests + source audit — next: none
- [x] `packages/docx-io/src/lib/internal/schemas/core.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/schemas/document-rels.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/schemas/document.template.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast tests + source audit — next: none
- [x] `packages/docx-io/src/lib/internal/schemas/document.template.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/schemas/font-table.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/schemas/generic-rels.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/schemas/numbering.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/schemas/rels.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/schemas/settings.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/schemas/styles.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast tests + source audit — next: none
- [x] `packages/docx-io/src/lib/internal/schemas/styles.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/schemas/theme.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast tests + source audit — next: none
- [x] `packages/docx-io/src/lib/internal/schemas/theme.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/schemas/web-settings.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/types.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/utils/color-conversion.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast tests + source audit — next: none
- [x] `packages/docx-io/src/lib/internal/utils/color-conversion.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/utils/font-family-conversion.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast tests + source audit — next: none
- [x] `packages/docx-io/src/lib/internal/utils/font-family-conversion.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/utils/image-dimensions.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast tests + source audit — next: none
- [x] `packages/docx-io/src/lib/internal/utils/image-dimensions.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/utils/image-to-base64.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast tests + source audit — next: none
- [x] `packages/docx-io/src/lib/internal/utils/image-to-base64.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/utils/list.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast tests + source audit — next: none
- [x] `packages/docx-io/src/lib/internal/utils/list.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/utils/unit-conversion.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast tests + source audit — next: none
- [x] `packages/docx-io/src/lib/internal/utils/unit-conversion.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/utils/url.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast tests + source audit — next: none
- [x] `packages/docx-io/src/lib/internal/utils/url.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/internal/utils/vnode.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast tests + source audit — next: none
- [x] `packages/docx-io/src/lib/internal/utils/vnode.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/preprocessMammothHtml.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast tests + source audit — next: none
- [x] `packages/docx-io/src/lib/preprocessMammothHtml.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/src/lib/types.ts` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: 97 fast + 36 slow tests, typecheck/build, source/security audit — next: none
- [x] `packages/docx-io/tsconfig.build.json` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: metadata/dependency audit + manifest/typecheck/build — next: none
- [x] `packages/docx-io/tsconfig.json` — score: 100 — verdict: keep-in-plate — owner: docx-io review — evidence: metadata/dependency audit + manifest/typecheck/build — next: none
- [x] `packages/docx/.npmignore` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: metadata/config audit + manifest/typecheck/build — next: none
- [x] `packages/docx/CHANGELOG.md` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: metadata/config audit + manifest/typecheck/build — next: none
- [x] `packages/docx/README.md` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: metadata/config audit + manifest/typecheck/build — next: none
- [x] `packages/docx/package.json` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: metadata/config audit + manifest/typecheck/build — next: none
- [x] `packages/docx/src/index.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/DocxPlugin.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit — next: none
- [x] `packages/docx/src/lib/DocxPlugin.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/input/brs.html` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 5 fixture tests + fixture/source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/input/custom-styles.html` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 5 fixture tests + fixture/source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/input/empty-paragraphs.html` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 5 fixture tests + fixture/source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/input/nested-lists.html` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 5 fixture tests + fixture/source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/input/v-shapes.html` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 5 fixture tests + fixture/source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/input/whitespaces-1.html` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 5 fixture tests + fixture/source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/input/whitespaces-2.html` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 5 fixture tests + fixture/source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/input/whitespaces-3.html` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 5 fixture tests + fixture/source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/output/brs.html` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 5 fixture tests + fixture/source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/output/custom-style-reference.html` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 5 fixture tests + fixture/source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/output/empty-paragraphs.html` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 5 fixture tests + fixture/source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/output/nested-lists.html` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 5 fixture tests + fixture/source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/output/whitespaces-1.html` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 5 fixture tests + fixture/source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/output/whitespaces-2.html` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 5 fixture tests + fixture/source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/__tests__/output/whitespaces-3.html` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 5 fixture tests + fixture/source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/cleanDocx.slow.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 5 fixture tests + source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/cleanDocx.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/cleanDocx.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/index.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/types.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/cleanDocxBrComments.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/cleanDocxEmptyParagraphs.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/cleanDocxFootnotes.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/cleanDocxImageElements.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/cleanDocxImageElements.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/cleanDocxListElements.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/cleanDocxListElementsToList.spec.ts` — score: 100 — verdict: hard-cut — owner: docx review — evidence: no runtime/repo/docs consumer; active DocxPlugin parser owns list import — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/cleanDocxListElementsToList.ts` — score: 100 — verdict: hard-cut — owner: docx review — evidence: no runtime/repo/docs consumer; active DocxPlugin parser owns list import — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/cleanDocxQuotes.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/cleanDocxSpacerun.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/cleanDocxSpacerun.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/cleanDocxSpans.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/cleanDocxTabCount.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/cleanDocxTabCount.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/docxListToList.spec.ts` — score: 100 — verdict: hard-cut — owner: docx review — evidence: no runtime/repo/docs consumer; active DocxPlugin parser owns list import — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/docxListToList.ts` — score: 100 — verdict: hard-cut — owner: docx review — evidence: no runtime/repo/docs consumer; active DocxPlugin parser owns list import — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/docxUtilities.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/generateSpaces.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/getDocxIndent.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/getDocxIndent.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/getDocxListContentHtml.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/getDocxListIndent.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/getDocxListNode.ts` — score: 100 — verdict: hard-cut — owner: docx review — evidence: no runtime/repo/docs consumer; active DocxPlugin parser owns list import — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/getRtfImageHex.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/getRtfImageHex.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/getRtfImageMimeType.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/getRtfImageMimeType.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/getRtfImageSpid.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/getRtfImagesByType.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/getRtfImagesByType.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/getRtfImagesMap.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/getRtfImagesMap.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/getTextListStyleType.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/getTextListStyleType.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/getVShapeSpid.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/getVShapeSpid.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/getVShapes.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/getVShapes.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/index.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/isDocxBookmark.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/isDocxContent.spec.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/isDocxContent.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/isDocxFootnote.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/isDocxList.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/isDocxOl.spec.ts` — score: 100 — verdict: hard-cut — owner: docx review — evidence: no runtime/repo/docs consumer; active DocxPlugin parser owns list import — next: none
- [x] `packages/docx/src/lib/docx-cleaner/utils/isDocxOl.ts` — score: 100 — verdict: hard-cut — owner: docx review — evidence: no runtime/repo/docs consumer; active DocxPlugin parser owns list import — next: none
- [x] `packages/docx/src/lib/index.ts` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: 44 fast tests + source audit + typecheck/build — next: none
- [x] `packages/docx/tsconfig.build.json` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: metadata/config audit + manifest/typecheck/build — next: none
- [x] `packages/docx/tsconfig.json` — score: 100 — verdict: keep-in-plate — owner: docx review — evidence: metadata/config audit + manifest/typecheck/build — next: none
- [x] `packages/emoji/.npmignore` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/CHANGELOG.md` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/README.md` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/package.json` — score: 100 — verdict: fix — owner: emoji review — evidence: direct Base/Plite/Utils dependency ownership plus compiler-runtime artifact proof — next: closed
- [x] `packages/emoji/src/index.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/BaseEmojiPlugin.spec.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/BaseEmojiPlugin.ts` — score: 100 — verdict: migrate — owner: emoji review — evidence: createBasePlugin plus extendExtension with inferred required options — next: closed
- [x] `packages/emoji/src/lib/constants.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/index.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/transforms/index.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/transforms/insertEmoji.spec.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/transforms/insertEmoji.ts` — score: 100 — verdict: migrate — owner: emoji review — evidence: BaseEditor update transaction preserves text and element insertion — next: closed
- [x] `packages/emoji/src/lib/types.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/utils/EmojiLibrary/EmojiInlineLibrary.spec.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/utils/EmojiLibrary/EmojiInlineLibrary.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/utils/EmojiLibrary/EmojiLibrary.types.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/utils/EmojiLibrary/index.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/utils/Grid/Grid.spec.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/utils/Grid/Grid.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/utils/Grid/Grid.types.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/utils/Grid/GridSection.spec.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/utils/Grid/GridSection.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/utils/Grid/index.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/utils/IndexSearch/EmojiFloatingIndexSearch.spec.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/utils/IndexSearch/EmojiFloatingIndexSearch.ts` — score: 100 — verdict: fix — owner: emoji review — evidence: per-library instances prevent first-editor state leakage — next: closed
- [x] `packages/emoji/src/lib/utils/IndexSearch/EmojiInlineIndexSearch.spec.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/utils/IndexSearch/EmojiInlineIndexSearch.ts` — score: 100 — verdict: fix — owner: emoji review — evidence: per-dataset instances prevent first-editor search leakage — next: closed
- [x] `packages/emoji/src/lib/utils/IndexSearch/IndexSearch.spec.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/utils/IndexSearch/IndexSearch.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/utils/IndexSearch/index.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/lib/utils/index.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/react/EmojiPlugin.tsx` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/react/hooks/index.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/react/hooks/useEmojiDropdownMenuState.spec.tsx` — score: 100 — verdict: hard-cut — owner: emoji review — evidence: incompatible global partial-module mocks caused order-dependent fake coverage; real library integration owns behavior — next: closed
- [x] `packages/emoji/src/react/hooks/useEmojiDropdownMenuState.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/react/hooks/useEmojiPicker.spec.tsx` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/react/hooks/useEmojiPicker.ts` — score: 100 — verdict: fix — owner: emoji review — evidence: observer timeout and IntersectionObserver both clean up on effect teardown — next: closed
- [x] `packages/emoji/src/react/hooks/useEmojiPickerState.spec.tsx` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/react/hooks/useEmojiPickerState.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/react/index.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/react/storage/FrequentEmojiStorage.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/react/storage/LocalStorage.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/react/storage/index.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/react/utils/EmojiLibrary/EmojiFloatingGrid.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/react/utils/EmojiLibrary/EmojiFloatingGridBuilder.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/react/utils/EmojiLibrary/EmojiFloatingLibrary.spec.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/react/utils/EmojiLibrary/EmojiFloatingLibrary.ts` — score: 100 — verdict: fix — owner: emoji review — evidence: per-settings/data instances and typed category boundary — next: closed
- [x] `packages/emoji/src/react/utils/EmojiLibrary/EmojiFloatingLibrary.types.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/react/utils/EmojiLibrary/index.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/react/utils/EmojiObserver.spec.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/react/utils/EmojiObserver.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/src/react/utils/index.ts` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/tsconfig.build.json` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed
- [x] `packages/emoji/tsconfig.json` — score: 100 — verdict: keep — owner: emoji review — evidence: source audit plus emoji test typecheck build and lint — next: closed

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| docx | docx | stale plugin API, `any` scaffolding, dead duplicate list graph, repeated RTF parsing, dependency drift | `packages/docx`; package tests/typecheck/build/lint/brl/manifests | keep repaired packet; 7-file hard cut | docx-io |
| docx-io | docx-io | stale v53 plugin/editor APIs, unconditional remote fetches, compatibility aliases, fake config casts, brittle fixture dependencies | `packages/docx-io`; fast/slow tests, typecheck/build/lint/manifests/security audits | keep repaired packet | emoji |
| emoji | emoji | stale plugin/editor APIs, global first-editor state, broad types, observer leak, order-dependent mock coverage | `packages/emoji`; tests/typecheck/build/lint plus lifecycle/state audits | keep repaired packet; hard-cut one fake spec | close batch |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/docx` | none | 0 untracked files | N/A | `git ls-files --others --exclude-standard packages/docx` |
| `packages/docx-io` | none | 0 untracked files | N/A | `git ls-files --others --exclude-standard packages/docx-io` |
| `packages/emoji` | none | 0 untracked files | N/A | `git ls-files --others --exclude-standard packages/emoji` |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `yjs`, `link`, `list`, `table` via broad dependency build | stale v54 APIs in packages outside this batch blocked a broad dev-dependency build | docx-io fixtures were made self-contained and all pass; docx-io package proof is green | future Plate Next package owners |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| legacy factory/editor APIs in `slash-command` and cast debt in `mention` | outside the three named packages | package review scope forbids caller/sibling edits | future Plate Next package selection |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Base plugin/editor migrations; dead DOCX list graph removal; typed DOCX import/export; remote-image opt-in and sibling preservation; isolated emoji search/library state; typed storage/grid/search; observer cleanup |
| tests/proof | Base editor tests, remote-image default/data URI/XML sibling tests, self-contained DOCX fixtures, emoji dataset isolation and custom text-node property tests |
| docs/templates/skills | package changesets plus this goal plan only; docs/apps/templates excluded |
| reverted/quarantined packets | restored required emoji compiler-runtime dependency after artifact build proof; deleted order-dependent partial-module mock spec |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| none | no user decision or blocker remains | N/A | all three package ledgers | proceed to next Plate Next selection when requested |

Findings:
- DOCX alternate list conversion was dead beside the active parser path.
- DOCX-IO had both stale v53 APIs and a shipped security default missing from
  the beta tree; remote image fetching is explicit opt-in again.
- Emoji global singletons bound all later editors to the first dataset/settings.
- Initial autoreview found two P2 regressions: disabled remote images truncated
  later paragraph siblings, and text-only emoji insertion discarded custom
  node properties. Both were fixed and the rerun was clean.

Decisions and tradeoffs:
- Keep product behavior in these packages; no Core/Plite owner change was
  required.
- Use full `tx.nodes.insert` for custom emoji nodes. Adjacent plain text leaves
  need not be artificially normalized merely to preserve an old fixture shape.
- Preserve `react-compiler-runtime` in emoji because the release compiler
  injects it even without a source import.
- Skip disabled/invalid child images with `continue`; never abort later sibling
  content.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial combined manifest used source-oriented counts instead of full tracked-package counts | 1 | regenerate with `git ls-files` and materialize every row | corrected from 187 to 194 before source work |
| Direct Bun invocation did not select/configure the `.slow.ts` suite | 2 | use the owning root slow-test harness | `pnpm test:slow -- packages/docx/src/lib/docx-cleaner/cleanDocx.slow.ts` passed 5/5 |
| docx-io slow fixtures initially depended on missing/stale feature package artifacts | 3 | replace feature-runtime coupling with minimal typed HTML test plugins | all 36 docx-io slow tests pass |
| broad docx-io dependency build pulled unrelated yjs/link/list/table migration failures | 1 | use source-first package typecheck/build and self-contained fixture proof | docx-io typecheck/build/test green; outside packages recorded above |
| Emoji artifact build failed after removing compiler runtime | 1 | distinguish compiler-injected artifact dependency from source imports | dependency restored; clean build |
| Initial autoreview reported two P2 regressions | 1 | verify and patch the full package-local bug classes | sibling-preserving image skips and full emoji node insertion proven; rerun clean |

Verification evidence:
- `docx`: `pnpm --filter @platejs/docx test` — 44 pass.
- `docx`: `pnpm test:slow -- packages/docx/src/lib/docx-cleaner/cleanDocx.slow.ts` — 5 pass.
- `docx`: `pnpm turbo typecheck --filter=./packages/docx` — 12/12 tasks pass.
- `docx`: package build, lint, workspace manifest check, `pnpm brl`, and scoped
  `git diff --check` pass.
- `docx-io`: `pnpm --filter @platejs/docx-io test` — 97 pass.
- `docx-io`: `pnpm test:slow -- packages/docx-io/src/lib` — 36 pass.
- `docx-io`: `pnpm turbo typecheck --filter=./packages/docx-io` — 15/15
  tasks pass; package build, lint, manifest check, security/source audits, and
  scoped `git diff --check` pass.
- `emoji`: `pnpm --filter @platejs/emoji test` — 24 pass.
- `emoji`: package typecheck/build/lint, dataset-isolation audit, observer
  lifecycle audit, and scoped `git diff --check` pass.
- combined: `pnpm turbo typecheck --filter=./packages/docx
  --filter=./packages/docx-io --filter=./packages/emoji` — 18/18 tasks pass.
- combined: `pnpm test:manifests` and `pnpm brl` — pass (56 barrel tasks).
- autoreview: local scoped batch run found two P2 regressions; both accepted and
  fixed. Post-fix rerun: `autoreview clean: no accepted/actionable findings
  reported`.

Final handoff contract:
- target surface and mode: sequential package review of `docx`, `docx-io`,
  then `emoji`
- files/APIs reviewed: all 194 tracked package files, package manifests,
  exports, runtime APIs, tests, fixtures, and configs
- broad Core drift score coverage: N/A; broad Core sweep excluded
- package file checklist coverage: 194/194 score 100, 0 unchecked/deferred,
  0 missing/extra/untracked
- best Plate v2 recommendation: keep all three product packages after Base/
  Plite migration and hard cuts; no compatibility layer
- verdict matrix summary: three repaired packages closed; eight DOCX/emoji
  files hard-cut total
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: all
  package-local stale API, alias, security, singleton, type, lifecycle, and
  reviewer matches patched; 0 deferred
- out-of-scope matches discovered: sibling package migration debt in
  slash-command/mention and broad dependency-build drift in yjs/link/list/table
- changes made: package code/tests/manifests, generated barrels, lock importer,
  three changesets, and this plan
- tests/proof commands: fast and slow suites, combined typecheck, builds, lint,
  manifests, barrels, source audits, diff check, clean autoreview rerun
- old compatibility names audited: yes; removed public DOCX-IO aliases and
  stale editor/plugin names have 0 active-scope matches
- needs attention: none
- next best Plate Next packet: choose from the remaining freshness ledger on
  the next user request; do not silently repeat completed packages

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Three-package closure complete |
| Where am I going? | Final plan checker and goal completion |
| What is the goal? | Close all docx/docx-io/emoji drift with 194 score-100 rows and green proof/review |
| What have I learned? | Base API drift, security default drift, and first-editor singleton state were the main defects |
| What have I done? | Closed all three packages and reran proof plus autoreview |

Timeline:
- 2026-07-11T11:33:57.053Z Goal plan created.
- 2026-07-11 Checkpoint-zero manifest corrected and closed at 194 tracked / 0
  untracked / 194 materialized rows before package source work.
- 2026-07-11 `docx` closed at 76/76 score-100 rows: 69 retained and 7
  dead alternate-list files hard-cut; package proof green.
- 2026-07-11 `docx-io` closed at 64/64 score-100 rows: v54 plugin/API
  migration complete, stable remote-image trust default restored, and all
  fast/slow/package proof green.
- 2026-07-11 `emoji` closed at 54/54 score-100 rows: Base API migration,
  dataset isolation, production typing, observer cleanup, and package proof
  complete.
- 2026-07-11 initial autoreview accepted two P2 findings; regression tests and
  fixes landed, affected proof reran green, and final autoreview reported no
  accepted/actionable findings.

Open risks:
- None inside the named three-package scope.
