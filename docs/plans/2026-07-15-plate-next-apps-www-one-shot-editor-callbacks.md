# plate next apps www one shot editor callbacks

Objective:
Cut every true one-shot `editor.read(...)` / `editor.update(...)` callback in authored `apps/www` source in favor of the direct Plite API, while preserving callbacks that genuinely group snapshot or transaction work.

Goal plan:
docs/plans/2026-07-15-plate-next-apps-www-one-shot-editor-callbacks.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user: "many editor.read and editor.update for single call ... fix all"
- mode: broad app-source correction sweep
- target surface: authored `apps/www` TypeScript/JavaScript source
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, every callback-form `read` / `update` in the active app scope
- package review mode: no
- package review target: N/A
- package file checklist gate: N/A
- completion threshold summary: zero true one-shot callback wrappers remain; every retained callback is classified as grouped/derived/branching/missing-direct-API; scoped proof and plan gates pass

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
- semantics: one-shot execution to completion
- initial confidence score: 70
- improvement loop: AST inventory -> direct-call rewrites -> repeat inventory -> typecheck/lint/browser proof
- final score / loop closure: 100; zero directable callbacks and all named proof gates green

Completion threshold:
- Every authored `apps/www` callback-form `editor.read` / `editor.update` call is inventoried.
- Every callback containing exactly one direct read/write is rewritten to the direct Plite method.
- Every retained callback has a concrete grouping, derivation, branching/looping, shared-intermediate, or missing-direct-API reason.
- Generated registry output remains untouched.
- App typecheck, scoped lint, source audit, and representative Browser proof pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-15-plate-next-apps-www-one-shot-editor-callbacks.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: AST callback ledger; `pnpm --filter www exec tsc --noEmit -p tsconfig.json`; scoped Biome; representative Browser route
- package proof: focused Core/code-block typechecks and tests for the smallest owner fixes
- shared Core gate: `pnpm check:core`
- source audits: repeat exact AST callback classification and prove zero true one-shot wrappers
- related scoped sweep query / active scope / match count / patched count / deferred count: Babel AST classification / 740 authored app files / 267 / 206 / 61 justified
- package file manifest / row count / checked count / deferred count: N/A
- Plite/Plate gap ledger: two direct-update lifecycle-option gaps recorded
- broad Core drift ledger gate: N/A
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-15-plate-next-apps-www-one-shot-editor-callbacks.md`

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
- allowed edit scope: authored `apps/www` source plus this goal plan; smallest Plite/Core owner only if direct API typing is genuinely missing
- package/API surfaces: direct existing Plite `editor.read.*` / `editor.update.*` call sites; no new public API unless a named gap is proven
- docs/browser surfaces: affected app/demo routes only; generated registry output excluded
- non-goals: no generated `apps/www/public/r`, `apps/www/src/generated`, or `apps/www/src/__registry__` edits; no package-wide unrelated cleanup; no callback rewrite when it would split one snapshot/transaction
- out-of-scope package errors: report only unless caused by this app-source correction

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- A true one-shot callback has no equivalent direct Plite method or its owner typing rejects the equivalent call; name the exact Plite gap before widening scope.

Current verdict:
- verdict: cut the one-shot callback form; keep callbacks only for real snapshot/transaction ownership
- confidence: 100
- next owner: Plite update-options API for the two lifecycle-metadata gaps
- keep / revert / quarantine call: keep
- reason: the AST sweep reports zero directable callbacks and focused runtime/type/browser proof is green

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact anti-pattern, "fix all", active app migration context, exclusions, proof, and stop rule recorded above |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` |
| Active goal checked or created | yes | `get_goal` returned no active goal; this plan is ready for goal creation |
| Mode classified as named packet vs broad Core sweep | yes | Broad authored `apps/www` correction sweep; not Core/package mode |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Direct one-shot Plite calls; callback only for real grouping |
| Broad Core drift ledger initialized when in scope | no | N/A: Core is not the target |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`, authored `apps/www` source |
| Output budget strategy recorded | yes | AST counts/ledger first, targeted file reads second |
| Public API fork routing checked | yes | Existing direct API expected; any missing method becomes a named Plite gap |
| Gap policy checked | yes | No local wrapper/cast workaround |
| Related scoped sweep policy checked | yes | Sweep all authored app source and classify every match |
| Review-mode rename freeze checked | yes | No renames |
| Package review checklist initialized when in scope | no | N/A |

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
- [x] `pnpm brl` is run when exports/barrels change. N/A: no export path changed; existing wildcard barrels expose the added type.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | AST zero-candidate audit, app typechecks, focused tests, `check:core`, and Browser proof |
| Broad Core drift ledger coverage | no | N/A: the Core edit is the smallest owner fix, not a broad Core sweep | N/A |
| Score gate | yes | Prove all reviewed targets are owned | Matrix below; no unowned drift |
| Best Plate v2 recommendation | yes | Record current shape and rejected hacks | Direct methods plus grouped callbacks only |
| Plite/Plate gap ledger | yes | Record blockers | Two non-blocking direct-update lifecycle-option gaps recorded below |
| Related scoped sweep after correction | yes | Classify every callback in authored app source | 267 initial, 206 cut, 61 justified, 0 directable |
| Package file checklist | no | N/A: not package-review mode | N/A |
| Package/API proof | yes | Run focused typecheck/test/build | App/Core/code-block typechecks and 11 focused tests pass |
| Shared Core gate coverage | yes | Run the existing Core-adjacent gate | `pnpm check:core` passes |
| Non-Core package error triage | no | No blocking non-Core error | N/A |
| Source audit | yes | Repeat exact AST classification | Artifact has 61 rows and zero directable candidates |
| Rename ledger | no | No rename | N/A |
| Extracted-file inventory | yes | Inventory untracked authored app source | One unrelated no-match file recorded below |
| Autoreview / review | yes | Run scoped local review | Clean final rerun; no accepted/actionable findings |
| Final lint/check | yes | Run formatting/diff checks | Package lint via `check:core`; `git diff --check` passes |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-15-plate-next-apps-www-one-shot-editor-callbacks.md` | Run after final review result |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| authored `apps/www/src` callback forms | 5 -> 0 | cut one-shot wrappers; keep 61 grouped/derived callbacks | app callers | AST ledger: 267 initial, 206 patched, 0 candidates | keep |
| Core plugin update portal | 3 -> 0 | expose every plugin-owned tx group with inference | `@platejs/core` | typecheck plus `getEditorPlugin.spec.ts` | keep |
| code-block insert command | 2 -> 0 | expose owner transform through plugin update portal | `@platejs/code-block` | typecheck plus `BaseCodeBlockPlugin.spec.ts` | keep |
| Yjs examples | 3 -> 0 | use extension-aware `CustomEditor` typing; remove casts/helpers | app examples | app typecheck and Browser reconcile proof | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| one-shot editor access | `editor.read.foo(...)` / `editor.update.foo(...)` | callback boilerplate, local aliases, casts | direct calls express the actual operation and preserve callbacks for atomic work | none |
| plugin-owned command groups | `editor.plugin(Plugin).update.<group>.*` | root command calls or plugin-key-only portal typing | a plugin portal must expose all tx groups the plugin owns | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plite gap | direct update method cannot carry transaction lifecycle options (`tag` / metadata) | dropping the options changes commit semantics; a local wrapper hides the missing contract | Plite update facade | type-level and runtime lifecycle-option contract | defer two callbacks; design direct option support in Plite |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| one-shot callback correction | 740 authored `apps/www/src` files excluding `generated` and `__registry__` | Babel AST callback classification with parameter reference counts | 267 | 206 | 61 justified | zero directable; remaining ledger at `docs/plans/artifacts/plate-next-apps-www-one-shot-editor-callbacks/remaining-callbacks.tsv` |

Core drift ledger:
- Applies: no
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
| N/A | N/A | Smallest owner fix only | N/A | Broad Core review not requested | N/A |

Package file checklist:
- Applies: no
- Package: N/A
- Manifest command: N/A
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: N/A
- Actual row count: N/A
- Checked score-100 count: N/A
- Unchecked/deferred count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: N/A

Package file rows:
- [x] N/A — this is an authored-app sweep, not package-review mode.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| app callbacks | `plate-next` | redundant callback around one direct operation | AST ledger and app source | cut 206 | keep 61 classified callbacks |
| portal owner | `@platejs/core` | plugin portal hid non-plugin-key tx groups | Core types/runtime/spec | expose every owned group | keep |
| code-block owner | `@platejs/code-block` | app needed direct plugin insert command | plugin/spec/changeset | bind existing transform | keep |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `apps/www/src/registry/components/editor/plate-to-html.tsx` | existing user file / no-match | absent from `origin/main` | untouched; outside this correction because it contains no callback match | `git ls-files --others --exclude-standard apps/www/src`; AST audit |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | No out-of-scope proof failures | N/A | N/A |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| direct lifecycle-option update | two authored app callers | no equivalent direct Plite update signature | Plite API plan |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | 206 direct app calls; extension-aware Yjs editor; Core portal exposes plugin-local owned tx groups; code-block exposes direct insert; AI preview/stop/history semantics preserved |
| tests/proof | Core portal, code-block, and AI menu regression tests; AST remaining-callback ledger |
| docs/templates/skills | this goal plan; existing Core/code-block changesets updated |
| reverted/quarantined packets | six snapshot-dependent callbacks restored after typecheck exposed shared-state use; no quarantine |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | direct update lifecycle options | two callbacks cannot be cut without losing commit metadata | `document-state.tsx:143`; `ai-kit.tsx:60` | add transaction lifecycle options to the Plite direct update facade |

Findings:
- Callback count fell from 267 to 61; all 61 remaining callbacks are grouped transactions, grouped snapshot reads, lifecycle-option boundaries, or tx-helper owners.
- Plugin portals exposed only the plugin-key tx group even when a plugin owned named groups. The Core portal now reflects every owned group in types and runtime.
- The only actual missing direct-call capability is transaction lifecycle options on direct updates.
- Direct-call rewrites must preserve history lifecycle and render subscriptions; the AI comment and preview paths now do.

Decisions and tradeoffs:
- Keep grouped callbacks: splitting them would change snapshot/transaction semantics.
- Do not fake lifecycle-option support with a local helper or cast; keep the two explicit callbacks until Plite owns the contract.
- Keep code-block insertion in its existing transform file and bind it into the plugin tx surface; no method-file relocation.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| App typecheck caught six over-eager rewrites whose callback parameter fed predicates/options | 1 | restore grouped snapshot ownership | resolved; final AST classifier counts parameter references |
| Isolated code-block typecheck resolved stale/missing built Core declarations | 1 | run mandated reinstall, then build intentional Core artifact | resolved |
| Biome received deleted paths from the inherited diff | 1 | rely on package lint and existing-file formatting only | non-product tooling noise |
| Autoreview found `api.stop()` no longer aborted the fake app transport | 1 | make the app chat owner's normal `stop()` abort both transports | resolved; private menu cast stays deleted |
| AI menu test mocks still exposed legacy nested plugin API and omitted `ElementApi` | 1 | update mocks to the current flattened portal/runtime exports | resolved; focused test passes |
| Autoreview found shared root tx groups leaked other plugins through the scoped portal | 1 | build each portal command from only that plugin's tx factories | resolved; collision and extension-group coverage pass |
| Autoreview found AI preview content one render behind | 1 | subscribe `useAIChatEditor` to its explicit editor commits | resolved; no removed `PlateStatic.value` compatibility restored |
| Autoreview found AI comment marks lost history merging | 1 | use `editor.update.history.merge((tx) => ...)` | resolved; lifecycle callback deliberately retained |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| inventory | complete | 740 authored files and 267 callbacks classified |
| correction | complete | 206 wrappers cut; zero directable candidates |
| owner repair | complete | Core portal, code-block command, and AI hook tests pass |
| verification | complete | app typechecks, Core gate, focused tests, formatting, diff check, and Browser proof pass |
| review | complete | final scoped `autoreview --mode local` rerun reports no accepted/actionable findings |

Verification evidence:
- AST: 740 files; 267 initial callbacks; 206 patched; 61 justified; 0 directable.
- `pnpm --filter www exec tsc --noEmit -p tsconfig.json` passed.
- `pnpm --filter www exec tsc --noEmit -p tsconfig.package-integration.json` passed.
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter @platejs/code-block typecheck` passed.
- Focused Core/code-block/AI/app tests: 12 pass, 0 fail.
- `pnpm check:core` passed.
- `git diff --check` passed.
- Browser: `/examples/plite/code-highlighting` edited content without console errors; `/examples/plite/yjs-collaboration` reconciled peers without console errors.
- Final scoped autoreview: clean, no accepted/actionable findings.

Final handoff contract:
- target surface and mode: broad authored `apps/www` one-shot callback correction
- files/APIs reviewed: 740 authored app files plus smallest Core plugin-portal and code-block command owners
- broad Core drift score coverage: N/A
- package file checklist coverage: N/A
- best Plate v2 recommendation: direct methods for one operation; callbacks only for atomic/grouped work
- verdict matrix summary: all scoped drift cut or explicitly owned; zero directable callbacks
- Plite/Plate gaps or blockers: direct update lifecycle options; two non-blocking retained callbacks
- related scoped sweep query/active scope/matches/patched/deferred: AST over 740 files; 267/206/61; zero candidates
- out-of-scope matches discovered: two lifecycle-option callbacks routed to Plite; one unrelated untracked no-match app file untouched
- changes made: direct calls, portal inference/runtime, code-block insert, Yjs typing, tests, ledger, changesets
- tests/proof commands: app/Core/code-block typechecks, focused tests, `check:core`, diff check, Browser routes
- old compatibility names audited: `yjsTx` and local `slateEditor as any` helpers absent
- needs attention: Plite direct lifecycle-option API only
- next best Plate Next packet: design and implement direct update lifecycle options, then cut the last two callbacks

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final review and plan gate |
| Where am I going? | Goal completion |
| What is the goal? | Cut every true one-shot app callback while preserving atomic grouped work |
| What have I learned? | Only lifecycle-option direct updates remain a Plite gap |
| What have I done? | Cut 206 wrappers, fixed portal ownership, and completed proof |

Timeline:
- 2026-07-15T08:07:07.458Z Goal plan created.
- 2026-07-15T08:18:00Z AST inventory classified 267 callback wrappers across 740 authored files.
- 2026-07-15T08:30:00Z Direct-call sweep closed at 61 justified callbacks and zero candidates.
- 2026-07-15T08:38:00Z App/Core/code-block proof and Browser routes passed.

Open risks:
- Two direct update calls cannot carry transaction lifecycle options; their callbacks remain deliberate until the Plite API owns that metadata.

Objective verification:
| Objective | Result | Evidence |
|-----------|--------|----------|
| Cut every true one-shot callback | complete | 206 rewrites; zero AST candidates |
| Preserve grouped snapshot/transaction work | complete | 61 classified rows in the linked artifact |
| Avoid local migration hacks | complete | no Yjs helper/cast; smallest Core portal owner fixed |
| Prove behavior and typing | complete | focused tests, app/package typechecks, Core gate, Browser proof |
