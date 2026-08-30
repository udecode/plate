# plate-next list markdown math package reviews

Objective:
Close List, Markdown, and Math Plate Next reviews; done when every package row
scores 100 or is explicitly deferred and package proof/review pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-12-plate-next-list-markdown-math-package-reviews.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero | complete | 203 package rows materialized before implementation | close packages sequentially |
| List review | complete | 76/76 rows explicitly deferred to the linked public API Plate Plan | await plan acceptance |
| Markdown review | complete | 53 score-100 rows; 45 explicit typing deferrals; lint/typecheck/233 tests/build pass | await typing-plan acceptance |
| Math review | complete | 29/29 rows score 100; lint/typecheck/18 tests/build pass | closed |
| Shared Core blockers | complete | four focused OverridePlugin tests plus Core lint/typecheck pass | closed |
| Autoreview | complete | final local run exits clean with zero findings | close goal |

Applied packs:
- none

Plate Next source:
- prompt / link: user invoked `plate-next next 3 packages`
- mode: sequential three-package review
- target surface: `packages/list`, then `packages/markdown`, then
  `packages/math`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, inside each active package
  plus the smallest required Plite/Core owner
- package review mode: yes
- package review target: all tracked and untracked files in the three named
  packages; exact rows materialized before source work
- package file checklist gate: one checkbox per manifest row; `[x]` only at
  score `100`; explicit user-review deferrals stay unchecked with owner/proof
- completion threshold summary: close List before Markdown and Markdown before
  Math; every row scores 100 or is explicitly deferred; package proof, scoped
  audits, autoreview, and the final checker pass

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
- semantics: one-shot completion of exactly three packages
- initial confidence score: 0.40 before manifests/source audit
- improvement loop: review and close List, then Markdown, then Math
- final score / loop closure: complete; every manifest row and proof gate is closed

Completion threshold:
- All current List, Markdown, and Math package rows score `100` or carry an
  explicit user-review deferral with reason, owner, proof needed, and next
  action; package-local lint, source-first typecheck, tests, build, scoped
  source audits, autoreview, and final plan check pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plate-next-list-markdown-math-package-reviews.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: package-scoped Biome, source-first Turbo typecheck,
  package tests, package build, barrels when exports move, and autoreview
- package proof: `pnpm turbo typecheck --filter=./packages/<package>`,
  `pnpm --filter @platejs/<package> test`, and
  `pnpm --filter @platejs/<package> build`
- shared Core gate: N/A unless a smallest Core/Plite owner changes; these are
  Plate product packages outside `check:core` by default
- source audits: umbrella imports, old Slate/Plate APIs, flat editor aliases,
  casts, explicit types hiding inference, transaction nesting, normalization,
  root pollution, dependency truth, and origin/main ownership
- related scoped sweep query / active scope / match count / patched count / deferred count:
  record after every correction per active package; outside matches are deferred
- package file manifest / row count / checked count / deferred count: materialize
  before implementation, then keep current after file additions/deletions
- Plite/Plate gap ledger: record every blocker or explicit N/A
- broad Core drift ledger gate: N/A; broad Core sweep not requested
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plate-next-list-markdown-math-package-reviews.md`

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
- allowed edit scope: `packages/list`, `packages/markdown`, `packages/math`,
  this plan, package changesets, valid lockfile/barrel changes, and the smallest
  required Plite/Core owner that blocks a named package
- package/API surfaces: only the three named packages, sequentially
- docs/browser surfaces: no apps/www, content docs, registry, or Browser proof;
  package review proof is package-local unless a public behavior blocker proves
  a separately owned route requirement
- non-goals: no Legacy list model execution, no broad package sweep, no Core sweep,
  no rename pass, no unrelated docs/examples/callers, no compatibility layer
- out-of-scope package errors: record and defer unless caused by a named/touched
  package or smallest owner change

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- For these packages, count/list filenames before printing code; exclude dist,
  coverage, node_modules, generated output, templates, and unrelated apps.

Blocked condition:
- Block only when a required clean API is missing, the smallest owner cannot be
  patched safely in scope, and three distinct source/proof attempts establish
  that user acceptance or external state is required. Otherwise fix or defer
  with an exact owner and proof route.

Current verdict:
- verdict: review in sequence
- confidence: 0.40 before manifests/source audit
- next owner: plate-next
- keep / revert / quarantine call: undecided per package until origin/main,
  source, inference, behavior, and proof audits close
- reason: Legacy list model is already explicitly deferred to its Plate Plan; this
  invocation redirects to the next untouched batch rather than repeating it

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exactly next three packages, sequential closure, no duration/broad sweep, proof and handoff recorded |
| `plate-next` skill/rule read | yes | User supplied the complete current skill; autogoal lifecycle skill read before durable work |
| Active goal checked or created | yes | Prior goal complete; new matching goal created with this plan path |
| Mode classified as named packet vs broad Core sweep | yes | Sequential package review for List, Markdown, Math; broad Core excluded |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Source section and constraints freeze the target |
| Broad Core drift ledger initialized when in scope | no | N/A: no broad Core sweep |
| Source of truth and allowed workspace recorded | yes | Current checkout, origin/main ownership, named package tests/types/build, smallest blocker owner only |
| Output budget strategy recorded | yes | Counts/filenames first; exact reads; noisy/generated paths excluded |
| Public API fork routing checked | yes | Any public API fork routes to plate-plan before implementation |
| Gap policy checked | yes | Missing substrate is named as Plite/Plate gap; no local workaround |
| Related scoped sweep policy checked | yes | Same-class sweep required after every correction inside current package scope |
| Review-mode rename freeze checked | yes | No rename without explicit acceptance; pre-renaming owns postponed taste |
| Package review checklist initialized when in scope | yes | 203 tracked rows materialized before source edits: List 76, Markdown 98, Math 29; 0 untracked files |

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
- [x] N/A: no broad Core sweep; the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout.
- [x] N/A: no broad Core sweep; every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`.
- [x] N/A: no broad Core sweep; the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
- [x] N/A: no broad Core sweep; the drift score gate is closed in this plan:
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
- [x] N/A: exports and barrels did not change, so `pnpm brl` was not required.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Markdown and Math lint/typecheck/test/build; focused Core tests/typecheck; source audits; diff check pass; `check:core` classified below |
| Broad Core drift ledger coverage | no | Broad Core sweep excluded | N/A; only the smallest Math-exposed OverridePlugin blocker was patched |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | 82 score-100 rows; 121 explicit deferred-user-review rows; 0 missing/extra |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Matrix below covers List, Markdown, Math, and Core blocker |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | List and Markdown public-contract gaps routed to linked Plate Plans; Math closed |
| Related scoped sweep after correction | yes | For each correction, run and record same-class search/review results inside the active scope | Legacy API, aggregate import, cast, normalization, selection, and review sweeps recorded below |
| Package file checklist | yes | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | 203/203 rows accounted; 82 score 100; 121 explicitly deferred |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Markdown 233/233; Math 18/18; Core 4/4; package builds and typechecks pass |
| Shared Core gate coverage | yes | Run `pnpm check:core` after the smallest Core owner changes | 729 Core tests pass; 1,930 Plite tests pass; one unrelated release-ledger assertion fails on two pre-existing Plite patch changesets |
| Non-Core package error triage | yes | Classify proof failures | List failures routed to List Plate Plan; no final Markdown/Math/Core failures |
| Source audit | yes | Run exact audit for removed compatibility names | No legacy Plate/Slate APIs or aggregate `platejs` imports remain in Markdown/Math; Math has no type-loss casts |
| Rename ledger | no | Update pre-renaming only for kept/postponed rename | No rename kept; broken duplicate Markdown spec was deleted under rename freeze |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket | 0 extracted/untracked package files at checkpoint zero |
| Autoreview / review | yes | Run review gate for non-trivial implementation diffs | Final local autoreview clean: zero findings, patch correct |
| Final lint/check | yes | Run scoped lint/check | Markdown, Math, Core lint/typecheck and `git diff --check` pass |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plate-next-list-markdown-math-package-reviews.md` | complete |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/list` | 5 | defer-with-owner | plate-plan/list | 76 rows; package-wide removed runtime/API drift; no safe partial packet | continue linked Plate Plan after user review |
| `packages/markdown` runtime/API migration | 0 | keep | plate-next | direct owners; lint/typecheck/233 tests/build pass | closed |
| `packages/markdown` public rule typing | 4 | defer-with-owner | plate-plan/markdown-rule-typing | 45 files retain 226 type-loss cast matches under one public rule contract | accept linked Plate Plan before execution |
| `packages/math` | 0 | keep | plate-next | direct owners; inferred tx; React 18-safe effects; lint/typecheck/18 tests/build pass | closed |
| `OverridePlugin` Math blockers | 0 | keep | Core | block-void deletion and merge-root traversal covered by 4 focused tests; Core lint/typecheck pass | closed |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| List | Keep flat-list product behavior, but redesign plugin commands/middleware/helper transaction contracts as one package API | piecemeal import replacements, editor/tx hybrids, compatibility wrappers, bridge resurrection | 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts, red tests/types prove one coupled fork | yes: linked Plate Plan |
| Markdown | Keep the migrated runtime/API shape and define one public generic contract for Markdown rules/node maps before removing residual casts | local cast-by-cast assertions or narrowing public rules ad hoc | runtime is green; 45 cast-bearing files share one public typing decision | yes: linked Plate Plan |
| Math | Compose inserts through inferred update transactions; keep effects React 18-safe; preserve direction-aware inline navigation | editor/tx hybrids, aggregate imports, React 19-only hooks, internal-void selection | direct ownership and focused behavior proof are green | no |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plate gap | Clean List product command and middleware transaction API | Per-file wrappers would freeze removed `editor.api`/`editor.tf` concepts and hide active transaction ownership | `plate-plan/list` | close all 12 plan passes, then accepted package typecheck/tests/build/browser | defer List implementation |
| Plate gap | One sound public `MdRules`/node-map generic contract | File-local casts would encode incompatible assumptions at dozens of call sites | `plate-plan/markdown-rule-typing` | accept and execute linked plan, then package proof/review | defer 45 Markdown rows |
| N/A | Math needs no missing substrate | Current Plite/Core transaction, read, point, and effect surfaces are sufficient | Math | completed focused proof | close Math |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Markdown legacy API migration | `packages/markdown/src` | old constructors/types, `editor.tf`, `getApi`, aggregate imports | 0 remaining | package migration | 0 | public typing debt separately deferred |
| Math transaction migration | `packages/math/src` | old constructors/types, `editor.tf`, aggregate imports, type-loss casts | 0 remaining | package migration | 0 | none |
| Math input-rule selection scope | `packages/math/src/lib` | unrelated code/equation behavior plus `nodes.some` implementation audit | 1 reviewer claim | 0 production changes; 1 regression test | 0 | Plite default is selection-scoped |
| Core merge behavior | `packages/core/src/lib/plugins/override` | block void deletion, root traversal, default/explicit merge policy | 3 behavior cases | 2 production fixes; 4 focused tests | 0 | none |
| React effect/navigation review | `packages/math/src/react/hooks` | `useEffectEvent`, ArrowLeft/Right, effect dependency suppressions | 3 issues | all patched | 0 | none |

Core drift ledger:
- Applies: no; N/A because broad Core sweep is excluded
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
| N/A | N/A | no broad Core sweep | plate-next | named product packages only | N/A |

Package file checklist:
- Applies: yes
- Package: `packages/list`, then `packages/markdown`, then `packages/math`
- Manifest command: `git ls-files packages/list packages/markdown packages/math | sort`; extracted inventory uses `git ls-files --others --exclude-standard <package> | sort`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 203 tracked files: List 76, Markdown 98, Math 29
- Actual row count: 203 tracked files and 203 file rows
- Checked score-100 count: 82 total: 53 Markdown, 29 Math
- Unchecked/deferred count: 121 total: 76 List, 45 Markdown public-typing deferrals
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: none; all three requested packages are closed or explicitly deferred

Package file rows:
- [ ] `packages/list/.npmignore` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/CHANGELOG.md` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/README.md` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/package.json` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/__tests__/listPluginPage.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/index.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/BaseListPlugin.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/BaseListPlugin.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/BulletedListRules.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/ListRuntimePlugin.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/OrderedListRules.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/TaskListRules.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/index.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/inputRules.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/internal/isSameListSequence.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/internal/isSameListSequence.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/normalizers/index.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/normalizers/normalizeListNotIndented.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/normalizers/normalizeListNotIndented.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/normalizers/normalizeListStart.slow.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/normalizers/normalizeListStart.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/normalizers/withInsertBreakList.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/normalizers/withInsertBreakList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/areEqListStyleType.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/areEqListStyleType.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/expandListItemsWithChildren.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/expandListItemsWithChildren.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/getListAbove.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/getListChildren.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/getListChildren.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/getListSiblings.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/getListSiblings.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/getNextList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/getPreviousList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/getSiblingList.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/getSiblingList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/getSiblingListStyleType.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/getSiblingListStyleType.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/index.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/isOrderedList.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/isOrderedList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/someList.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/someList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/someTodoList.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/queries/someTodoList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/transforms/indentList.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/transforms/indentList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/transforms/index.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/transforms/outdentList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/transforms/setListNode.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/transforms/setListNode.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/transforms/setListNodes.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/transforms/setListNodes.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/transforms/setListSiblingNodes.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/transforms/setListSiblingNodes.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/transforms/toggleList.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/transforms/toggleList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/transforms/toggleListByPath.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/transforms/toggleListByPath.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/transforms/toggleListSet.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/transforms/toggleListSet.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/transforms/toggleListUnset.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/transforms/toggleListUnset.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/types.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/withList.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/withList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/lib/withNormalizeList.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/react/ListPlugin.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/react/hooks/index.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/react/hooks/listHooks.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/react/hooks/useListToolbarButton.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/react/hooks/useTodoListElement.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/react/hooks/useTodoListToolbarButton.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/src/react/index.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/tsconfig.build.json` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [ ] `packages/list/tsconfig.json` — score: 0 — verdict: deferred-user-review — owner: plate-plan/list — evidence: package-wide public API/transaction/middleware decision; 74 umbrella imports, 28 flat API calls, 47 transform calls, 250 casts — proof needed: finish and accept `docs/plans/2026-07-12-list-v2-api.md`, then scoped lint/typecheck/tests/build/browser — next: continue that Plate Plan
- [x] `packages/markdown/.npmignore` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/CHANGELOG.md` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/LICENSE` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/README.md` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/package.json` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/index.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [ ] `packages/markdown/src/lib/MarkdownPlugin.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/MarkdownPlugin.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [x] `packages/markdown/src/lib/__snapshots__/mdx.spec.tsx.snap` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/__tests__/createTestEditor.tsx` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/__tests__/testValue.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [ ] `packages/markdown/src/lib/columnSurface.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/commonmarkSurface.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/dateElement.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/defaultRules.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [x] `packages/markdown/src/lib/deserializer/__snapshots__/deserializeMdList.spec.tsx.snap` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/deserializer/convertChildrenDeserialize.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [ ] `packages/markdown/src/lib/deserializer/convertNodesDeserialize.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/deserializer/convertNodesDeserialize.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/deserializer/convertTextsDeserialize.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/deserializer/deserializeMd.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/deserializer/deserializeMd.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [x] `packages/markdown/src/lib/deserializer/deserializeMdList.spec.tsx` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/deserializer/deserializeMentionLink.spec.tsx` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/deserializer/index.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [ ] `packages/markdown/src/lib/deserializer/mdastToSlate.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [x] `packages/markdown/src/lib/deserializer/mdastToSlate.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [ ] `packages/markdown/src/lib/deserializer/paragraphBreaks.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [x] `packages/markdown/src/lib/deserializer/splitLineBreaks.spec.tsx` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [ ] `packages/markdown/src/lib/deserializer/utils/customMdxDeserialize.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/deserializer/utils/customMdxDeserialize.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [x] `packages/markdown/src/lib/deserializer/utils/deserializeInlineMd.spec.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/deserializer/utils/deserializeInlineMd.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/deserializer/utils/getDeserializerByKey.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/deserializer/utils/getMergedOptionsDeserialize.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/deserializer/utils/getStyleValue.spec.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [ ] `packages/markdown/src/lib/deserializer/utils/getStyleValue.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [x] `packages/markdown/src/lib/deserializer/utils/htmlToJsx.spec.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/deserializer/utils/htmlToJsx.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/deserializer/utils/index.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/deserializer/utils/markdownToPliteNodesSafely.spec.tsx` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.spec.tsx` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/deserializer/utils/parseMarkdownBlocks.spec.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/deserializer/utils/parseMarkdownBlocks.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/deserializer/utils/splitIncompleteMdx.spec.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/deserializer/utils/splitIncompleteMdx.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/deserializer/utils/stripMarkdown.spec.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/deserializer/utils/stripMarkdown.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [ ] `packages/markdown/src/lib/emojiSurface.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/gfmSurface.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [x] `packages/markdown/src/lib/index.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [ ] `packages/markdown/src/lib/mathSurface.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [x] `packages/markdown/src/lib/mdast.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/mdx.spec.tsx` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [ ] `packages/markdown/src/lib/mdxMarks.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/mediaSurface.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [x] `packages/markdown/src/lib/plugins/index.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/plugins/remarkMdx.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [ ] `packages/markdown/src/lib/plugins/remarkMention.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/rules/columnRules.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/rules/columnRules.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/rules/defaultRules.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/rules/fontRules.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [x] `packages/markdown/src/lib/rules/index.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [ ] `packages/markdown/src/lib/rules/mediaRules.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [x] `packages/markdown/src/lib/rules/utils/index.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [ ] `packages/markdown/src/lib/rules/utils/parseAttributes.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/rules/utils/parseAttributes.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [x] `packages/markdown/src/lib/serializer/__snapshots__/listToMdastTree.spec.ts.snap` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [ ] `packages/markdown/src/lib/serializer/convertNodesSerialize.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/serializer/convertNodesSerialize.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [x] `packages/markdown/src/lib/serializer/convertTextsSerialize.spec.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [ ] `packages/markdown/src/lib/serializer/convertTextsSerialize.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [x] `packages/markdown/src/lib/serializer/index.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [ ] `packages/markdown/src/lib/serializer/listToMdastTree.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/serializer/listToMdastTree.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/serializer/serializeInlineMd.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/serializer/serializeInlineMd.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/serializer/serializeMd.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [x] `packages/markdown/src/lib/serializer/serializeMd.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/serializer/serializeMention.spec.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [ ] `packages/markdown/src/lib/serializer/standardList.spec.tsx` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/serializer/utils/getCustomMark.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [x] `packages/markdown/src/lib/serializer/utils/getCustomMark.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/serializer/utils/getMergedOptionsSerialize.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/serializer/utils/getSerializerByKey.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/serializer/utils/index.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [ ] `packages/markdown/src/lib/serializer/utils/unreachable.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/serializer/wrapWithBlockId.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/table.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/taskList.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/types.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [ ] `packages/markdown/src/lib/utils/getRemarkPluginsWithoutMdx.spec.ts` — score: 0 — verdict: deferred-user-review — owner: plate-plan/markdown-rule-typing — evidence: runtime migration and 233-test proof pass, but this row still contains type-loss casts covered by the 45-file public rule-typing decision — proof needed: accept and complete `docs/plans/2026-07-12-markdown-rule-typing.md`, then rerun package lint/typecheck/tests/build/autoreview — next: continue that Plate Plan
- [x] `packages/markdown/src/lib/utils/getRemarkPluginsWithoutMdx.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/src/lib/utils/index.ts` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/tsconfig.build.json` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/markdown/tsconfig.json` — score: 100 — verdict: keep — owner: markdown package review — evidence: direct-owner and current API audit; lint/typecheck/233 tests/build pass; row has no type-loss cast — proof needed: none — next: closed
- [x] `packages/math/.npmignore` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/CHANGELOG.md` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/README.md` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/package.json` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/index.ts` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/lib/BaseEquationPlugin.spec.ts` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/lib/BaseEquationPlugin.ts` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/lib/BaseInlineEquationPlugin.spec.ts` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/lib/BaseInlineEquationPlugin.ts` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/lib/MathRules.ts` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/lib/index.ts` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/lib/inputRules.spec.tsx` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/lib/transforms/index.ts` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/lib/transforms/insertEquation.spec.ts` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/lib/transforms/insertEquation.ts` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/lib/transforms/insertInlineEquation.spec.ts` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/lib/transforms/insertInlineEquation.ts` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/lib/utils/getEquationHtml.spec.ts` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/lib/utils/getEquationHtml.ts` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/lib/utils/index.ts` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/react/EquationPlugin.tsx` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/react/InlineEquationPlugin.tsx` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/react/hooks/index.ts` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/react/hooks/useEquationElement.ts` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/react/hooks/useEquationInput.spec.tsx` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/react/hooks/useEquationInput.ts` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/src/react/index.ts` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/tsconfig.build.json` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed
- [x] `packages/math/tsconfig.json` — score: 100 — verdict: keep — owner: math package review — evidence: direct Core/Plite owners, inferred tx API, React/effect audit, lint/typecheck/18 tests/build, and focused Core block-void regression proof pass; no legacy API or type-loss cast remains — proof needed: none — next: closed

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| List | plate-plan/list | package-wide public API/transaction/middleware fork | 76 tracked rows; baseline 24 pass/37 fail/15 errors; typecheck red | all 76 explicitly deferred to linked Plate Plan | continue `docs/plans/2026-07-12-list-v2-api.md` |
| Markdown | plate-next + plate-plan/markdown-rule-typing | serializer/deserializer/plugin migration plus public rule typing | 98 tracked rows; lint/typecheck/233 tests/build pass | 53 score 100; 45 explicitly deferred to linked Plate Plan | execute typing plan only after acceptance |
| Math | plate-next | plugin/transform/hook migration drift | 29 tracked rows; lint/typecheck/18 tests/build pass | all 29 score 100 | closed |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/list` | none | 0 untracked files | N/A | checkpoint-zero extracted inventory |
| `packages/markdown` | none | 0 untracked files | N/A | checkpoint-zero extracted inventory |
| `packages/math` | none | 0 untracked files | N/A | checkpoint-zero extracted inventory |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| List | package baseline remains red | package-wide public API contract is explicitly outside this safe packet | `docs/plans/2026-07-12-list-v2-api.md` |
| `pnpm check:core` release ledger | duplicate pending `@platejs/plite` patch changesets: `plite-node-set-marks.md` and `plite-selection-string-default.md` | unrelated release-lane state; all 729 Core tests and 1,930 other Plite tests pass | release-lanes owner should consolidate Plite patch notes |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| Markdown rule typing | 45 Markdown files | one public generic decision, not safe per-file cleanup | `docs/plans/2026-07-12-markdown-rule-typing.md` |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Markdown direct Core/Plite owners and current read/update APIs; Math inferred transaction transforms and React 18-safe hooks; Core block-void deletion and merge-root traversal fixes |
| tests/proof | Markdown test harness isolation and 233 passing tests; Math 18 passing tests including selection scope/navigation; Core 4 focused override tests |
| docs/templates/skills | parent package ledger, List Plate Plan, Markdown typing Plate Plan, Math major changeset |
| reverted/quarantined packets | deleted broken duplicate Markdown spec; no compatibility bridge retained |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | List public API plan | 76 files form one coupled fork; partial migration would be garbage | `docs/plans/2026-07-12-list-v2-api.md` | review/accept the plan before implementation |
| 2 | Markdown public typing plan | 45 files remain capped by 226 type-loss cast matches | `docs/plans/2026-07-12-markdown-rule-typing.md` | review/accept the public generic contract before execution |

Findings:
- List is a package-wide API migration, not a safe cleanup: 74 umbrella imports,
  28 flat `editor.api` calls, 47 `editor.tf` calls, 250 `as any` casts, and a
  deleted Core runtime-bridge dependency span plugin, middleware, normalizers,
  queries, transforms, React hooks, and tests.
- List baseline: 24 tests pass, 37 fail, 15 files fail to load; source-first
  typecheck fails across the same coupled contract. All 76 rows route to
  `docs/plans/2026-07-12-list-v2-api.md` rather than receiving local hacks.
- Markdown runtime/API migration is clean and fully proven. Its remaining 45
  cast-bearing files share one public rule/node-map typing decision and route to
  `docs/plans/2026-07-12-markdown-rule-typing.md`.
- Math is fully migrated: transaction-composed inserts, direct package owners,
  React 18-safe effects, direction-aware inline navigation, and app-level input
  rule composition all pass focused proof.
- Math exposed two shared Core regressions in OverridePlugin: deleting backward
  before a block void and traversing root arrays during merge override lookup.
  Both are fixed and covered by four focused tests.

Decisions and tradeoffs:
- List: explicit `defer-with-owner` to `plate-plan/list`. This batch reviewed
  every row and named the clean owner; implementation waits for an accepted API
  target.
- Markdown: keep the green runtime migration; defer only the 45-file public
  typing contract to Plate Plan rather than scattering assertions.
- Math: close all 29 rows at score 100 after package proof and clean autoreview.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| List package test baseline is broadly red | 1 | classify architecture versus environment failures before patching | missing Indent/Plate dist exports are mixed with 37 real legacy runtime failures; route package-wide API fork |
| Math test initially used stale Core artifacts | 1 | build the owning Core package, then rerun the exact Math proof | Core build refreshed artifacts; Math passed |
| Autoreview claimed Math input rules scan the full document | 1 | inspect Plite `nodes()` default target and add regression proof | rejected: query defaults to selection; unrelated-code-block test passes |
| Autoreview found root-array merge lookup failure | 1 | teach runtime traversal to read root arrays and add merge proof | accepted and fixed; Core 4/4 |
| Autoreview found right-edge equation navigation regression | 1 | restore direction-specific before/after points | accepted and fixed; Math hook proof passes |
| Autoreview found React 19-only `useEffectEvent` | 1 | preserve React 18 peer support with synchronized effect context | accepted and fixed; Math proof passes |
| Autoreview challenged default empty-target preservation | 1 | verify origin/main contract and add explicit proof/comment | rejected: default false is intentional; focused test passes |
| `pnpm check:core` release-ledger assertion | 1 | inspect the exact changeset collision after all runtime/type/lint tests | unrelated: two pre-existing Plite patch changesets; defer to release-lanes owner |

Verification evidence:
- `pnpm --filter @platejs/markdown lint:fix` — pass.
- `pnpm --filter @platejs/markdown typecheck` — pass.
- `pnpm --filter @platejs/markdown test` — 233 pass, 0 fail.
- `pnpm --filter @platejs/markdown build` — pass.
- `pnpm --filter @platejs/math lint:fix` — pass.
- `pnpm --filter @platejs/math typecheck` — pass.
- `pnpm --filter @platejs/math test` — 18 pass, 0 fail.
- `pnpm --filter @platejs/math build` — pass.
- `bun test packages/core/src/lib/plugins/override/OverridePlugin.spec.tsx`
  — 4 pass, 0 fail.
- `pnpm --filter @platejs/core lint:fix` and `typecheck` — pass.
- `pnpm check:core` — 729 Core tests and 1,930 Plite tests pass; final release
  contract fails only because two existing `@platejs/plite` patch changesets
  violate the one-bump-per-package ledger rule.
- Legacy API, aggregate import, Math cast, React 19 API, and diff-check audits
  — clean. Markdown residual inventory is exactly 45 files / 226 matches.
- `.agents/skills/autoreview/scripts/autoreview --mode local ...` — final run
  exits 0 with zero findings; patch correct.

Final handoff contract:
- target surface and mode: sequential package review for List, Markdown, Math
- files/APIs reviewed: 203/203 package rows plus smallest Core blockers
- broad Core drift score coverage: N/A; no broad Core sweep
- package file checklist coverage: 82 score 100; 121 explicit deferrals; 0 missing/extra
- best Plate v2 recommendation: linked List/Markdown plans; close Math current shape
- verdict matrix summary: List 76 deferred; Markdown 53 closed/45 deferred; Math 29 closed
- Plite/Plate gaps or blockers: List API and Markdown public typing only
- related scoped sweep query/active scope/matches/patched/deferred: recorded above
- out-of-scope matches discovered: 45 Markdown typing files; List package-wide fork
- changes made: Markdown and Math migration, focused Core fixes, tests, plans, changeset
- tests/proof commands: all focused package/Core commands pass; broad
  `check:core` has the unrelated release-ledger failure recorded above
- old compatibility names audited: clean in Markdown and Math
- needs attention: accept linked List and Markdown plans before their deferred work
- next best Plate Next packet: next untouched package after this three-package batch

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closeout |
| Where am I going? | Goal completion checker |
| What is the goal? | Close List, Markdown, and Math rows at score 100 or explicit deferral with proof/review |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- 2026-07-12T18:57:54.474Z Goal plan created.
- 2026-07-12 List fully reviewed and deferred to its public API Plate Plan.
- 2026-07-12 Markdown runtime migration proven; 45 typing rows deferred.
- 2026-07-12 Math fully migrated and proven; shared Core blockers fixed.
- 2026-07-12 Final autoreview clean with zero findings.

Open risks:
- List remains intentionally unimplemented until its public API plan is accepted.
- Markdown retains 226 type-loss cast matches across 45 explicitly deferred
  files until its public generic contract is accepted.
- The release lane contains two pending `@platejs/plite` patch changesets;
  `check:core` remains red until its owner consolidates them.
