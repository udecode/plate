# plate-next tag toc toggle package reviews

Objective:
Close Tag, TOC, and Toggle Plate Next reviews; done when all 92 package rows
score 100 or are explicitly deferred and focused proof/review/checker pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-13-plate-next-tag-toc-toggle-package-reviews.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user invoked `plate-next` and requested the next three packages
- mode: sequential package review
- target surface: `packages/tag`, then `packages/toc`, then `packages/toggle`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, inside the active package
  plus only the smallest required Plite/Core owner
- package review mode: yes
- package review target: every tracked and untracked file in the three packages
- package file checklist gate: one row per file; `[x]` only at score `100`;
  explicit deferrals remain unchecked with owner and proof needed
- completion threshold summary: preserve every real `origin/main` helper/query/
  transform owner; close Tag before TOC and TOC before Toggle; all 92 rows
  score 100 or are explicitly deferred; stop before any fourth package

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
- semantics: one-shot completion of exactly the next three untouched feature packages
- initial confidence score: 0.35 before source/baseline audits
- improvement loop: review and close Tag, then TOC, then Toggle
- final score / loop closure: 1.0; exactly Tag, TOC, and Toggle closed

Completion threshold:
- All 92 Tag, TOC, and Toggle rows score `100` or carry an explicit deferral
  with reason, owner, proof needed, and next action; package lint,
  source-first typecheck, tests, build, source audits, autoreview, and final
  checker pass. Existing helper/query/transform owners remain owners; plugin
  API/tx groups delegate to those helpers with the active transaction.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-13-plate-next-tag-toc-toggle-package-reviews.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: package lint, source-first typecheck, package tests,
  package build, and barrels only if exports move
- package proof: `pnpm --filter @platejs/<package> lint:fix`,
  `pnpm turbo typecheck --filter=./packages/<package>`, package test and build
- shared Core gate: N/A unless the smallest Core/Plite owner changes; these are
  product feature packages and do not belong in `check:core` by default
- source audits: origin/main owner parity; direct dependency ownership;
  umbrella imports; old Slate/Plate APIs; casts; root editor pollution;
  inference; active tx; normalization; optional reads; React subscriptions
- related scoped sweep query / active scope / match count / patched count / deferred count:
  record after every correction inside the active package
- package file manifest / row count / checked count / deferred count: 92 rows
  materialized before implementation
- Plite/Plate gap ledger: record every blocker or explicit N/A
- broad Core drift ledger gate: N/A; broad Core sweep not requested
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-13-plate-next-tag-toc-toggle-package-reviews.md`

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
- allowed edit scope: active package only, plus the smallest Core/Plite owner
  proven necessary; package metadata, one package-specific changeset when a
  published user-facing delta lands, and this goal plan
- package/API surfaces: Tag, then TOC, then Toggle; preserve existing helper,
  query, transform, hook, and component owners
- docs/browser surfaces: excluded; no `apps/www`, docs, registry, templates, or
  browser proof in strict package-review mode
- non-goals: any fourth package, broad Core cleanup, rename pass, moving real
  helper algorithms into plugins, compatibility wrappers, unrelated callers
- out-of-scope package errors: record and defer unless caused by the active
  package or smallest required owner

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- For these packages, inspect manifests and pattern counts first, then exact
  suspicious files; exclude `dist`, generated output, and `node_modules`.

Blocked condition:
- Stop a package only for an unresolved public API choice or missing
  Core/Plite capability that cannot be solved without broadening scope; record
  the exact gap and do not start a fourth package.

Current verdict:
- verdict: Tag, TOC, and Toggle closed in order; stop before a fourth package
- confidence: 1.0 after package proof and clean autoreview
- next owner: user-selected next Plate Next packet
- keep / revert / quarantine call: keep migrated owners; delete the branch-only
  `ToggleRuntimePlugin.spec.ts` bridge test
- reason: every package row scores 100 and focused package/Core/Plite proof is green

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | exactly three next feature packages; strict sequential package scope; no fourth package |
| `plate-next` skill/rule read | yes | full skill supplied and read this turn |
| Active goal checked or created | yes | previous goal is complete; create the new goal after this checkpoint shell is filled |
| Mode classified as named packet vs broad Core sweep | yes | sequential three-package review; no broad Core sweep |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | completion threshold and constraints above |
| Broad Core drift ledger initialized when in scope | no | broad Core sweep excluded |
| Source of truth and allowed workspace recorded | yes | current checkout, `origin/main` owner evidence, package-local proof |
| Output budget strategy recorded | yes | manifest/count-first and capped exact reads above |
| Public API fork routing checked | yes | any public fork routes to `plate-plan`; none chosen at checkpoint zero |
| Gap policy checked | yes | no compatibility workaround; exact smallest owner required |
| Related scoped sweep policy checked | yes | active package only; broader matches deferred |
| Review-mode rename freeze checked | yes | current HEAD paths/names frozen |
| Package review checklist initialized when in scope | yes | 92 tracked rows and 0 untracked rows counted; materialize below before code edits |

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
| Named verification threshold | yes | Run the proof commands named in this plan | Tag 5, TOC 22, Toggle 13, Plite 37, Core 730 tests pass; lint/typecheck/build pass |
| Broad Core drift ledger coverage | N/A | Broad Core sweep excluded | only two proven owner lines changed |
| Score gate | yes | Prove all scores | 92 checked score-100 rows; 0 unchecked/deferred |
| Best Plate v2 recommendation | yes | Record current shape | direct Core/Plite ownership; no umbrella or legacy editor APIs |
| Plite/Plate gap ledger | yes | Record blockers or N/A | block-void delete gap fixed at Plite and Core owners |
| Related scoped sweep after correction | yes | Record same-class searches | zero forbidden source matches remain in the three packages |
| Package file checklist | yes | Record manifest and counts | 92/92 rows score 100 |
| Package/API proof | yes | Run focused proof | all named commands green |
| Shared Core gate coverage | N/A | Product packages stay outside `check:core` | focused Core and Plite owner proof passed |
| Non-Core package error triage | N/A | Classify unrelated failures | no unrelated failure blocked the run |
| Source audit | yes | Audit compatibility names | zero umbrella imports, old factories, `editor.tf`, `as any`, or bare normalize calls |
| Rename ledger | N/A | Record postponed renames | no rename proposed |
| Extracted-file inventory | yes | Classify extracted files | branch-only Toggle runtime bridge test deleted |
| Autoreview / review | yes | Run review gate | clean; no accepted/actionable findings, confidence 0.74 |
| Final lint/check | yes | Run scoped lint/check | all five touched package owners lint/typecheck green |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | filled below; no attention item |
| Goal plan complete | yes | Run final checker | ready for checker |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| Tag plugin/API/hooks | 0 | keep migrated owners | Tag package | direct deps, active tx, 5 tests and proof green | closed |
| TOC plugin/helpers/hooks | 0 | keep migrated owners | TOC package | direct reads/DOM APIs, effect cleanup, 22 tests and proof green | closed |
| Toggle plugin/queries/transforms/hooks | 0 | keep migrated owners | Toggle package | schema matcher, active tx, hidden-node delete proof, 13 tests and proof green | closed |
| selected block-void forward delete | 0 | fix smallest owners | Plite + Core OverridePlugin | atomic delete contract plus Core operation guard | closed |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Tag | `createBasePlugin`/`toPlatePlugin`, `editor.update.tag.insert`, existing helper owners | umbrella `platejs`, old factory/transform surface, plugin-local algorithm dump | active tx and direct deps preserve inference and ownership | no |
| TOC | `editor.update.toc.insert`, existing `insertToc`/heading/hook owners, direct DOM API | inline helper deletion, mirrored refs, legacy `tf/api` wrappers | keeps product logic local and uses Plite/Core public APIs | no |
| Toggle | existing query/transform/hook owners with Plite schema and active transactions | Core-internal bridge test, `any` guards, nested update calls, legacy override surface | hidden blocks remain atomic/nonselectable without deleting content | no |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plite gap, fixed | enclosing void was skipped by the non-editable query | TOC-specific delete middleware would duplicate editor law | `delete-text-plan.ts` | Plite delete contract | fixed with `voids: true` |
| Plate gap, fixed | Core merge rewrite intercepted explicit void removal | TOC-specific operation handling would leak substrate behavior into product code | `OverridePlugin.ts` | Core regression test and TOC behavior test | void removal bypasses merge rewriting |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Tag legacy migration | `packages/tag` | umbrella imports, factories, `editor.tf/api`, casts, normalize calls | package matches audited | all scoped drift patched | 0 | none |
| TOC API/effect cleanup | `packages/toc` | same source audit plus `useEffect` ownership review | DOM calls retained; subscription effects justified | all stale API/state mirrors patched | 0 | none |
| TOC block-void failure | smallest Plite/Core owners | delete/void query and remove-node merge interception | 2 owner defects | 2 | 0 | focused contracts green |
| Toggle migration | `packages/toggle` | umbrella imports, factories, old editor APIs, `any`, nested updates, normalize calls | all matches audited | all scoped drift patched | 0 | one effect retained for editor-index to plugin-store synchronization |

Core drift ledger:
- Applies: no; broad Core sweep was not requested
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A
- Top drift rows: none

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | broad Core sweep excluded | N/A | no Core review requested | closed |

Package file checklist:
- Applies: yes
- Package: `tag` -> `toc` -> `toggle`
- Manifest command: `(git ls-files packages/tag packages/toc packages/toggle; git ls-files --others --exclude-standard packages/tag packages/toc packages/toggle) | sort -u`
- Manifest owner:
  every tracked and untracked file under the three named package directories.
- Expected row count: 92 (`18 + 39 + 35`)
- Actual row count: 92
- Checked score-100 count: 92
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: every row in the active package is score 100 or
  explicitly deferred with reason, owner, proof needed, and next action.

Package file rows:
- [x] `packages/tag/.npmignore` — score: 100 — verdict: keep-main-owner — owner: package metadata — evidence: unchanged and correctly package-local; manifest audit passed
- [x] `packages/tag/CHANGELOG.md` — score: 100 — verdict: keep-main-owner — owner: package history — evidence: unchanged; release delta is owned by the v54 changeset
- [x] `packages/tag/README.md` — score: 100 — verdict: keep-main-owner — owner: package reference — evidence: unchanged; no stale runtime API examples
- [x] `packages/tag/package.json` — score: 100 — verdict: direct-owner-dependencies — owner: package metadata — evidence: replaced umbrella `platejs` with Core, Plite, and Utils owners; install and package proof passed
- [x] `packages/tag/src/index.ts` — score: 100 — verdict: keep-main-owner — owner: generated barrel — evidence: exports unchanged; no barrel regeneration required
- [x] `packages/tag/src/lib/BaseTagPlugin.spec.tsx` — score: 100 — verdict: typed-runtime-proof — owner: base plugin proof — evidence: cast-free `editor.update.tag.insert` behavior passes
- [x] `packages/tag/src/lib/BaseTagPlugin.ts` — score: 100 — verdict: plite-tx-migration — owner: base plugin — evidence: `createBasePlugin` plus inferred `extendTx`; no legacy transforms or casts
- [x] `packages/tag/src/lib/index.ts` — score: 100 — verdict: keep-main-owner — owner: generated barrel — evidence: existing helper/plugin ownership preserved
- [x] `packages/tag/src/lib/isEqualTags.spec.tsx` — score: 100 — verdict: typed-query-proof — owner: helper proof — evidence: cast-free Base editor fixtures pass
- [x] `packages/tag/src/lib/isEqualTags.ts` — score: 100 — verdict: plite-read-migration — owner: existing query helper — evidence: direct `read.nodes.entries` owner; order-independent semantics preserved
- [x] `packages/tag/src/react/TagPlugin.spec.tsx` — score: 100 — verdict: runtime-regression-proof — owner: React plugin proof — evidence: duplicate cleanup, change handler filtering, and whitespace normalization pass
- [x] `packages/tag/src/react/TagPlugin.tsx` — score: 100 — verdict: plite-extension-migration — owner: React plugin — evidence: legacy override removed; handler, normalizer, and delete middleware use active transactions with inferred types
- [x] `packages/tag/src/react/index.ts` — score: 100 — verdict: keep-main-owner — owner: generated barrel — evidence: exports unchanged
- [x] `packages/tag/src/react/useSelectEditorCombobox.ts` — score: 100 — verdict: active-tx-effect-sync — owner: existing hook — evidence: close cleanup is one active transaction; effect dependencies are complete
- [x] `packages/tag/src/react/useSelectableItems.ts` — score: 100 — verdict: direct-owner-import — owner: existing hook — evidence: memo behavior unchanged; editor string hook imported from Utils owner
- [x] `packages/tag/src/react/useSelectedItems.ts` — score: 100 — verdict: plite-read-migration — owner: existing hook/query — evidence: direct node entries and null-safe selector equality; no casts
- [x] `packages/tag/tsconfig.build.json` — score: 100 — verdict: keep-current-config — owner: package build config — evidence: source root remains explicit and build passes
- [x] `packages/tag/tsconfig.json` — score: 100 — verdict: keep-main-owner — owner: package type config — evidence: unchanged and source-first typecheck passes
- [x] `packages/toc/.npmignore` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/CHANGELOG.md` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/README.md` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/package.json` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/index.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/internal/getHeadingList.spec.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/internal/getHeadingList.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/lib/BaseTocPlugin.spec.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/lib/BaseTocPlugin.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/lib/index.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/lib/transforms/index.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/lib/transforms/insertToc.spec.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/lib/transforms/insertToc.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/lib/types.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/lib/utils/index.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/lib/utils/isHeading.spec.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/lib/utils/isHeading.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/react/TocPlugin.tsx` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/react/hooks/__tests__/tocHookMocks.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/react/hooks/index.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/react/hooks/useContentController.spec.tsx` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/react/hooks/useContentController.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/react/hooks/useContentObserver.spec.tsx` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/react/hooks/useContentObserver.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/react/hooks/useTocController.spec.tsx` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/react/hooks/useTocController.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/react/hooks/useTocElement.spec.tsx` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/react/hooks/useTocElement.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/react/hooks/useTocObserver.spec.tsx` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/react/hooks/useTocObserver.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/react/hooks/useTocSideBar.spec.tsx` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/react/hooks/useTocSideBar.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/react/index.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/react/types.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/react/utils/checkIn.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/react/utils/heightToTop.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/src/react/utils/index.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/tsconfig.build.json` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toc/tsconfig.json` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite APIs, React effects, lint, typecheck, 22 tests, and build audited
- [x] `packages/toggle/.npmignore` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/CHANGELOG.md` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/README.md` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/package.json` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/index.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/lib/BaseTogglePlugin.spec.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/lib/BaseTogglePlugin.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/lib/index.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/lib/queries/index.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/lib/queries/someToggle.spec.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/lib/queries/someToggle.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/TogglePlugin.tsx` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/ToggleRuntimePlugin.spec.ts` — score: 100 — verdict: delete-duplicate — owner: existing Toggle specs — evidence: branch-only Core-internal bridge test deleted; useful behavior coverage merged into `withToggle.spec.tsx`
- [x] `packages/toggle/src/react/hooks/index.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/hooks/toggleHooks.spec.tsx` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/hooks/useToggleButton.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/hooks/useToggleToolbarButton.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/index.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/queries/findElementIdsHiddenInToggle.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/queries/getEnclosingToggleIds.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/queries/getLastEntryEnclosedInToggle.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/queries/index.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/queries/isInClosedToggle.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/queries/toggleQueries.spec.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/renderToggleAboveNodes.tsx` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/toggleIndexAtom.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/transforms/index.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/transforms/moveCurrentBlockAfterPreviousSelectable.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/transforms/moveNextSelectableAfterCurrentBlock.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/transforms/openNextToggles.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/useHooksToggle.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/withToggle.spec.tsx` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/src/react/withToggle.ts` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/tsconfig.build.json` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited
- [x] `packages/toggle/tsconfig.json` — score: 100 — verdict: Plate-v2-owner — owner: existing package file — evidence: origin/main owner preserved; direct dependencies, Plite reads, active transactions, lint, typecheck, 13 tests, and build audited

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero | complete | Scope frozen to exactly Tag, TOC, Toggle | Tag |
| Tag review | complete | 18/18 rows; package proof green | TOC |
| TOC review | complete | 39/39 rows; package and owner proof green | Toggle |
| Toggle review | complete | 35/35 manifest rows; package proof green | review |
| Review and closeout | complete | Autoreview clean; final checker | close goal |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Tag | `packages/tag` | old factories/editor APIs and umbrella dependency | 18 rows plus package proof | migrate in place | closed |
| TOC | `packages/toc` | old APIs, mirrored state, block-void regression | 39 rows plus Plite/Core owner proof | migrate and fix substrate owners | closed |
| Toggle | `packages/toggle` | legacy override, casts, hidden-content deletion | 35 manifest rows plus package proof | migrate owners; delete bridge test | closed |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/toggle/src/react/ToggleRuntimePlugin.spec.ts` | delete-duplicate | absent from `origin/main`; branch-only file | deleted; behavior merged into existing `withToggle.spec.tsx` | Toggle tests 13/13 |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | no out-of-scope proof failure | all named package/owner commands passed | closed |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| outside-package legacy Plate APIs | other unreviewed packages | exactly three packages requested | next user-selected Plate Next packet |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Tag, TOC, Toggle direct dependency/API/transaction migrations; Plite/Core atomic block-void delete fix |
| tests/proof | package specs migrated; Toggle hidden deletion covered both directions; Plite/Core regression contracts added |
| docs/templates/skills | package changesets and this goal plan only |
| reverted/quarantined packets | deleted branch-only Toggle Core-internal bridge spec; no helper owner moved |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| none | no unresolved blocker or deferral | N/A | N/A | choose the next packet explicitly |

Findings:
- TOC exposed a generic Plite/Core block-void forward-delete defect; fixed at
  both owners instead of adding product middleware.
- Toggle's Plite migration initially deleted hidden descendants because point
  traversal skips nonselectable nodes; raw adjacent block paths preserve them.
- The branch-only Toggle runtime spec duplicated real owners and depended on
  Core internals; its useful assertions now live in `withToggle.spec.tsx`.

Decisions and tradeoffs:
- Retain Toggle's `useHooksToggle` effect because it synchronizes the derived
  editor index into the plugin store consumed by schema/render subscriptions;
  remove only mirrored render state and redundant atom plumbing.
- Keep every `origin/main` helper/query/transform owner in place. Plugins only
  compose those owners and pass the active transaction.
- Do not run browser proof: strict package-review mode excludes docs/apps/UI routes.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| TOC package test read stale built Plite/Core output | 1 | build the proven owner packages, then rerun | 22/22 passed |
| Parallel Toggle build raced dependency rebuild output | 1 | wait for Turbo dependency build, rerun build alone | build passed |
| Toggle delete migration removed hidden descendants | 1 | inspect transaction paths and use raw adjacent block paths | backward/forward regression tests pass |

Verification evidence:
- Tag: lint, source-first typecheck, build, 5/5 tests.
- TOC: lint, source-first typecheck, build, 22/22 tests.
- Toggle: lint, source-first Turbo typecheck, build, 13/13 tests.
- Plite/Core owners: lint and Turbo typecheck; Plite delete contract 37/37;
  Core tests 730/730.
- Source audits: zero scoped umbrella imports, legacy factories,
  `editor.tf`, `as any`, or bare normalization calls.
- Autoreview: `.agents/skills/autoreview/scripts/autoreview --mode local ...`;
  clean, no accepted/actionable findings, confidence 0.74.

Final handoff contract:
- target surface and mode: sequential package review of Tag, TOC, Toggle only
- files/APIs reviewed: all 92 manifested rows, including one deleted branch-only file
- broad Core drift score coverage: N/A; only two smallest proven owners changed
- package file checklist coverage: 92 score-100, 0 unchecked/deferred
- best Plate v2 recommendation: direct Core/Plite APIs, active tx, existing owners
- verdict matrix summary: all three packages closed; block-void gap fixed
- Plite/Plate gaps or blockers: none remaining
- related scoped sweep query/active scope/matches/patched/deferred: package-local legacy/API/cast/normalization audits; 0 remaining
- out-of-scope matches discovered: unreviewed packages retain legacy APIs; intentionally untouched
- changes made: runtime migrations, focused owner fix, regression tests, changesets
- tests/proof commands: package lint/typecheck/test/build plus Plite/Core owner proof
- old compatibility names audited: yes; zero scoped matches
- needs attention: none
- next best Plate Next packet: stop; user selects the next packet

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | final checker |
| Where am I going? | close exactly these three packages |
| What is the goal? | 92 score-100 rows plus focused proof and review |
| What have I learned? | block-void delete and hidden-toggle navigation needed owner fixes |
| What have I done? | migrated all three packages and passed proof/review |

Timeline:
- 2026-07-13T16:06:55.569Z Goal plan created.
- 2026-07-13 Tag closed: 18/18 rows.
- 2026-07-13 TOC closed: 39/39 rows; Plite/Core void deletion fixed.
- 2026-07-13 Toggle closed: 35/35 manifest rows; hidden deletion regression fixed.
- 2026-07-13 Autoreview clean; all focused proof green.

Open risks:
- None in the reviewed scope.
