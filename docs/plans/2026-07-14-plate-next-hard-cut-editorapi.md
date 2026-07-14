# plate-next hard cut editorApi

Objective:
Hard-cut Core plugin-context `editorApi`; type `editor.api` from the composed
plugin config, repair every caller, and close with zero source matches plus
focused Core proof and `pnpm check:core`.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-14-plate-next-hard-cut-editorapi.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none: the Plate Next template already owns the Core public API and changeset gates

Plate Next source:
- prompt / link: user: "ok go hard cut then sweep repair"
- mode: named Core public API hard-cut plus repository caller sweep
- target surface: Core plugin context `editorApi` and all source/type-test callers
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; this is an exact named-symbol sweep, not a full Core review
- correction-triggered related scoped sweep: `rg -n '\beditorApi\b' packages --glob '*.{ts,tsx}' --glob '!**/dist/**'`
- package review mode: no
- package review target: N/A
- package file checklist gate: N/A
- completion threshold summary: `editorApi` source matches = 0; Core typecheck/tests/build and `check:core` pass

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
- semantics: N/A
- initial confidence score: N/A: exact binary source and command gates
- improvement loop: repair each type/runtime/test fallout until all gates pass
- final score / loop closure: 100; exact source, type, runtime, build, shared-gate, and review evidence closed

Completion threshold:
- Delete `editorApi` from the public plugin context and every runtime context.
- Preserve typed root API access through `editor.api` without casts or aliases.
- Repair all 23 initial matches across 11 Core source/type-test files.
- End with zero `editorApi` source matches, focused Core proof, artifact build,
  and `pnpm check:core` passing.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-14-plate-next-hard-cut-editorapi.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: Core plugin context, extend API, and omit context specs
- package proof: `pnpm --filter @platejs/core typecheck`; `pnpm --filter @platejs/core build`
- shared Core gate: `pnpm check:core`
- source audits: zero `editorApi` matches under non-dist `packages/**`
- related scoped sweep query / active scope / match count / patched count / deferred count:
  `rg -n '\beditorApi\b' packages --glob '*.{ts,tsx}' --glob '!**/dist/**'`; all packages; 23 initial matches in 11 Core files; 23 patched; 0 deferred; 0 remain
- package file manifest / row count / checked count / deferred count: N/A: named Core API hard-cut
- Plite/Plate gap ledger: none expected; Core context typing owns the fix
- broad Core drift ledger gate: N/A: not a broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-14-plate-next-hard-cut-editorapi.md`

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
  `defineEditorExtension({ name: pluginKey, ... })` just to satisfy types.
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
- allowed edit scope: Core context types/runtime/specs/type-tests, existing Core changeset, and direct fallout found by exact sweep
- package/API surfaces: `@platejs/core` plugin callback and portal context
- docs/browser surfaces: no docs or browser surface
- non-goals: no Plite changes, no unrelated plugin migration, no compatibility alias
- out-of-scope package errors: report only unless caused by this Core hard cut

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- The typed `editor.api` replacement cannot preserve current root API inference without a broader public API fork, or the same external failure repeats three times with no in-scope repair.

Current verdict:
- verdict: hard-cut
- confidence: high; alias is branch-only and `origin/main` has zero matches
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: `editorApi` duplicates `editor.api` solely because the context editor type did not specialize `api`

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Hard-cut, sweep, repair, zero matches, Core proof recorded above |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` |
| Active goal checked or created | yes | Active goal points to this plan |
| Mode classified as named packet vs broad Core sweep | yes | Named Core API packet with exact caller sweep |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Hard-cut alias; use typed `editor.api` |
| Broad Core drift ledger initialized when in scope | no | N/A: exact named-symbol sweep |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; Core source/type-tests and fallout |
| Output budget strategy recorded | yes | Targeted `rg`, exact files, capped command tails |
| Public API fork routing checked | yes | User accepted hard cut; no additional fork remains |
| Gap policy checked | yes | Core owner fix; no Plite gap |
| Related scoped sweep policy checked | yes | Non-dist `packages/**` exact symbol sweep |
| Review-mode rename freeze checked | yes | No rename |
| Package review checklist initialized when in scope | no | N/A: not package review mode |
| Package/API pack selected | yes | Plate Next template owns equivalent Core package API gates |
| Public surface or package boundary identified | yes | `@platejs/core` `PluginBaseContext` |
| Release artifact path selected | yes | Existing `.changeset/auto-main-to-next-sync-platejs-core.md` relative to main |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` |
| Barrel/export impact decision recorded | yes | No export/file changes; `pnpm brl` not required |

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
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Zero source matches; focused proof and `pnpm check:core` pass |
| Broad Core drift ledger coverage | no | N/A: exact named-symbol packet | No full Core sweep requested |
| Score gate | yes | Prove scoped rows close | All three review rows fixed at the Core owner |
| Best Plate v2 recommendation | yes | Record current shape | `api` scoped; `editor.api` root; no alias |
| Plite/Plate gap ledger | no | N/A: no gap | Core context editor typing owns the fix |
| Related scoped sweep after correction | yes | Run exact symbol sweep | 23 initial, 23 patched, 0 deferred, 0 remain |
| Package file checklist | no | N/A: not package review mode | Named Core API packet |
| Package/API proof | yes | Run focused typecheck/test/build | 27 tests pass; Core typecheck and build pass |
| Shared Core gate coverage | yes | Run shared gate | `pnpm check:core` exits 0 |
| Non-Core package error triage | no | N/A | Shared gate reported no failures |
| Source audit | yes | Audit removed alias | Non-dist `packages/**` count is 0 |
| Rename ledger | no | N/A: no rename | Existing names preserved |
| Extracted-file inventory | yes | Inventory Core untracked files | `git ls-files --others --exclude-standard packages/core` returns 0 rows |
| Autoreview / review | yes | Run structured review | Codex autoreview clean; no actionable findings; confidence 0.83 |
| Final lint/check | yes | Run formatting and shared gate | Biome clean; `pnpm check:core` passes |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below; no needs-attention rows |
| Goal plan complete | yes | Run final checker | Run after this evidence update |
| Public API / package boundary proof | yes | Audit Core context API | `PluginBaseContext.editorApi` removed; `BasePluginContextEditor.api` is Core API intersected with `C['api']` |
| Release artifact classification | yes | Compare with `origin/main` | `origin/main` has zero `editorApi` matches; alias removal is branch-only cleanup |
| Published package changeset | yes | Follow changeset rules | Existing Core patch changeset remains; no branch-only `editorApi` removal prose added |
| Registry changelog | no | N/A: not registry work | No registry files touched |
| No release artifact | yes | Record exact reason for this cut | No delta from `main` for `editorApi`; it never existed there |
| Package typecheck/build/test | yes | Run owning package checks | Core typecheck/build and 27 focused tests pass |
| Barrel/export generation | no | N/A: no export/file layout changes | `pnpm brl` not required |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `PluginBaseContext.editorApi` | 4 | hard-cut | Core plugin context | Branch-only duplicate of `editor.api`; `origin/main` count 0 | Deleted |
| `BasePluginContextEditor.api` | 3 | main-parity-cleanup | Core editor typing | Whole replacement with `C['api']` erased Core APIs; intersection preserves both | Fixed and type-proven |
| Runtime/caller plumbing | 3 | hard-cut | Core plugin resolver/tests | 23 exact matches across 11 files | All repaired; zero remain |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Plugin callback root API | `api` for scoped ownership; typed `editor.api` for root/namespaced APIs | `editorApi`, `plugin.editor.api`, casts, or duplicate wrappers | One canonical root API; current plugin config augments Core API typing | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No missing capability | No workaround required | Core | Core typecheck/build/tests | Closed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Remove duplicate root API alias | Non-dist `packages/**` TypeScript source | `rg -n '\beditorApi\b' packages --glob '*.{ts,tsx}' --glob '!**/dist/**'` | 23 | 23 | 0 | none; final count 0 |

Core drift ledger:
- Applies: no; exact named-symbol sweep
- Manifest command: N/A: no broad Core manifest
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: 0
- Actual row count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | N/A: no broad Core sweep | Core | Exact named-symbol packet | N/A |

Package file checklist:
- Applies: no
- Package: N/A
- Manifest command: N/A
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 0
- Actual row count: 0
- Checked score-100 count: 0
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: N/A

Package file rows:
- [x] N/A: named Core API hard-cut, not package review mode.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Hard-cut `editorApi` | Core plugin context | Duplicate root API alias and weak context-editor API typing | 12 Core source/spec/type-test files; exact sweep and Core proof | keep | next Plate Next package |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | Core untracked inventory returned 0 rows | No extracted files | exact inventory command |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | No out-of-scope failures | N/A | N/A |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| `editorApi` | none | All matches were in the Core owner | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Remove `editorApi`; type context `editor.api` as Core API intersected with `C['api']`; remove resolver plumbing |
| tests/proof | Repair Core specs/type contracts; add root API inference and invalid-argument proof |
| docs/templates/skills | Fill this required goal plan only |
| reverted/quarantined packets | None |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| N/A | None | All scoped gates are green | N/A | Continue to next Plate Next package |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Hard-cut, repair, sweep, and proof | complete | 23/23 matches patched; all verification gates pass | handoff |

Findings:
- Initial exact sweep found 23 `editorApi` matches in 11 Core source/type-test files and none on `origin/main`.
- Replacing `api` with only `C['api']` erased guaranteed Core API groups; `BaseEditor<Value, never>['api'] & C['api']` preserves assignability and plugin-added root API inference.

Decisions and tradeoffs:
- Keep `api` scoped and `editor.api` canonical for root access; reject `editorApi` and `plugin.editor.api` portal chaining.
- Do not add release prose for a branch-only alias absent from `main`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `C['api']` alone erased Core APIs and broke `BaseEditor` assignability | 1 | Intersect guaranteed Core API with composed plugin API | Core typecheck passes with `BaseEditor<Value, never>['api'] & C['api']` |

Verification evidence:
- `rg -n '\beditorApi\b' packages --glob '*.{ts,tsx}' --glob '!**/dist/**'` -> 0 matches.
- Focused Bun specs -> 27 pass, 0 fail.
- `pnpm --filter @platejs/core typecheck` -> pass, including type contracts.
- `pnpm --filter @platejs/core build` -> pass.
- `pnpm check:core` -> pass.
- Scoped Codex autoreview -> clean, no accepted/actionable findings, confidence 0.83.
- `git diff --check -- packages/core/src packages/core/type-tests .changeset/auto-main-to-next-sync-platejs-core.md` -> pass.

Final handoff contract:
- target surface and mode: named Core plugin-context hard-cut with full exact-symbol sweep
- files/APIs reviewed: 12 Core runtime/type/spec/type-test files around `PluginBaseContext`, `BasePluginContextEditor`, resolver contexts, and callers
- broad Core drift score coverage: N/A: no broad Core sweep
- package file checklist coverage: N/A: no package review mode
- best Plate v2 recommendation: one scoped `api`, one canonical root `editor.api`, no alias
- verdict matrix summary: one hard-cut alias, one Core typing repair, all callers repaired
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: non-dist `packages/**`; 23/23/0; zero remain
- out-of-scope matches discovered: none
- changes made: remove alias/runtime plumbing; strengthen root API typing; repair specs/type contracts
- tests/proof commands: focused 27 tests, Core typecheck/build, `check:core`, Biome, autoreview
- old compatibility names audited: `editorApi` zero; absent from `origin/main`
- needs attention: none
- next best Plate Next packet: next uncovered package selected by the existing package order

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure complete; final plan checker remains |
| Where am I going? | Close goal and hand off the hard cut |
| What is the goal? | Remove `editorApi`, preserve typed `editor.api`, zero stale matches, all Core gates green |
| What have I learned? | Core and plugin-composed API types must be intersected |
| What have I done? | Hard cut, caller repair, exact sweep, focused proof, shared gate, structured review |

Timeline:
- 2026-07-14T09:09:23.206Z Goal plan created.
- 2026-07-14 Hard-cut `editorApi` and repaired all exact callers.
- 2026-07-14 Corrected context API typing after focused typecheck exposed erased Core groups.
- 2026-07-14 Closed focused tests, Core typecheck/build, `check:core`, exact audit, and autoreview.

Open risks:
- None in the scoped hard cut.
