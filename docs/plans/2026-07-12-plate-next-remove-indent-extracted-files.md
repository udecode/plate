# plate-next remove indent extracted files

Objective:
Remove every newly created indent file and restore the existing
`BaseIndentPlugin` owner; done when indent has zero untracked files and focused
package proof/review passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-12-plate-next-remove-indent-extracted-files.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user correction: new indent transform files were forbidden
- mode: named extracted-file recovery packet
- target surface: `packages/indent/src/lib/BaseIndentPlugin.ts`,
  `packages/indent/src/lib/index.ts`, and all untracked files under
  `packages/indent`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes; inventory all untracked
  indent files and all imports of removed extracted owners
- package review mode: no; this is the user's exact correction packet
- package review target: N/A
- package file checklist gate: N/A
- completion threshold summary: zero untracked indent files, existing owners
  restored without touching unrelated indent changes, package proof green

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
- initial confidence score: N/A: binary extracted-file threshold
- improvement loop: fix only failures caused by this correction
- final score / loop closure: zero new files and zero actionable review findings

Completion threshold:
- `git ls-files --others --exclude-standard packages/indent` returns zero;
  `BaseIndentPlugin.ts` and `lib/index.ts` no longer import/export extracted
  owners; no other current indent changes are overwritten; lint, typecheck,
  tests, build, source sweep, autoreview, and final plan check pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plate-next-remove-indent-extracted-files.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: indent lint and tests
- package proof: indent typecheck, tests, build
- shared Core gate: N/A: product package correction
- source audits: untracked inventory and removed-owner import/export sweep
- related scoped sweep query / active scope / match count / patched count / deferred count:
  `git ls-files --others --exclude-standard packages/indent`; expected 0 after
  patch; import/export sweep expected 0
- package file manifest / row count / checked count / deferred count: N/A
- Plite/Plate gap ledger: none; current `BaseIndentPlugin` already owns logic
- broad Core drift ledger gate: N/A
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plate-next-remove-indent-extracted-files.md`

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
- allowed edit scope: delete all six untracked indent files; restore only
  `BaseIndentPlugin.ts` and `lib/index.ts` from their pre-extraction contents;
  active goal plan
- package/API surfaces: no intended public delta; remove uncommitted owner churn
- docs/browser surfaces: N/A: no docs/UI behavior change
- non-goals: do not alter the existing uncommitted indent hook changes or any
  branch-level tracked migration files; do not add replacement files
- out-of-scope package errors: report only

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if removing the extracted files makes the pre-existing
  `BaseIndentPlugin` owner impossible to typecheck without a broader API change.

Current verdict:
- verdict: merge-existing-owner / delete-duplicate
- confidence: 99 before proof
- next owner: plate-next
- keep / revert / quarantine call: keep only if zero-new-file and proof gates pass
- reason: explicit user correction forbids extracted files

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Remove forbidden new indent files; repair `BaseIndentPlugin`; no broader request |
| `plate-next` skill/rule read | yes | User supplied the complete skill body |
| Active goal checked or created | yes | Created this plan-backed correction goal |
| Mode classified as named packet vs broad Core sweep | yes | Named extracted-file correction |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Restore existing owner with no replacement files |
| Broad Core drift ledger initialized when in scope | no | N/A: no Core sweep |
| Source of truth and allowed workspace recorded | yes | User correction, current diff, HEAD, and origin/main in `/Users/zbeyens/git/plate-2` |
| Output budget strategy recorded | yes | Exact files and capped package commands only |
| Public API fork routing checked | yes | No API fork; this removes uncommitted source-shape churn |
| Gap policy checked | yes | No Plite/Plate gap found |
| Related scoped sweep policy checked | yes | Sweep all indent untracked files and removed-owner imports |
| Review-mode rename freeze checked | yes | No renames; extracted files deleted |
| Package review checklist initialized when in scope | no | N/A: correction packet, not package review |

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
| Named verification threshold | yes | Run named proof | 0 untracked/staged indent additions; lint, typecheck, 5 tests, build, sweep, review pass |
| Broad Core drift ledger coverage | no | N/A | No Core sweep |
| Score gate | yes | Close all inspected owners | Existing owner scores 100; seven extracted files deleted |
| Best Plate v2 recommendation | yes | Record current shape | Keep behavior in `BaseIndentPlugin`; no extracted replacement files |
| Plite/Plate gap ledger | no | N/A | No missing capability |
| Related scoped sweep after correction | yes | Audit all indent files/imports | 0 untracked, 0 staged additions, 0 removed-owner imports |
| Package file checklist | no | N/A | Correction packet, not package review |
| Package/API proof | yes | Run focused typecheck/test/build | All pass |
| Shared Core gate coverage | no | N/A | Product package correction |
| Non-Core package error triage | no | N/A | No out-of-scope failures |
| Source audit | yes | Audit forbidden files and imports | `src/lib` contains only the two plugin specs, plugin, and barrel |
| Rename ledger | no | N/A | No rename |
| Extracted-file inventory | yes | Classify all additions | Six untracked plus one staged spec deleted; zero remain |
| Autoreview / review | yes | Frozen-scope review | Clean, 0 actionable findings, confidence 0.86 |
| Final lint/check | yes | Scoped lint | 14 files checked, pass |
| Changed list / top drift / needs attention | yes | Fill ledgers | Filled below; no attention needed |
| Goal plan complete | yes | Run checker | Pass: `[autogoal] complete` |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `BaseIndentPlugin.ts` | 0 | merge-existing-owner | Indent plugin | All command, tab, and normalization behavior remains inline; active tx fixed; proof green | closed at 100 |
| `lib/index.ts` | 0 | recover-existing-owner | Indent barrel | Exports only `BaseIndentPlugin`; no removed files exported | closed at 100 |
| seven extracted files | 0 | delete-duplicate | existing plugin/spec owners | Deleted; inventories return zero | closed at 100 |
| `.changeset/indent-v54-runtime.md` | 0 | main-parity-cleanup | release note | Migration matches final `editor.update.indent.*` API | closed at 100 |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Indent commands/normalizer | Keep the already-existing implementation in `BaseIndentPlugin` | New `transforms/*`, `withIndent*`, standalone transaction helpers | Explicit user constraint and lower owner/navigation churn | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | Existing plugin tx/extension APIs cover behavior | Indent plugin | package proof | closed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Remove forbidden extracted files | `packages/indent` | untracked inventory, cached additions, `rg` removed-owner imports, `rg --files src/lib` | 7 additions initially, 0 remaining | 7 deleted + 2 owners restored | 0 | none |

Core drift ledger:
- Applies: no
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: 0
- Actual row count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A
- Top drift rows: none

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | out of scope | Core | User targeted indent | none |

Package file checklist:
- Applies: no
- Package: `@platejs/indent`
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
- Next package blocked until: N/A: no package review started

Package file rows:
- [x] N/A: correction packet; inspected owners are in the review matrix.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Remove indent extraction churn | `BaseIndentPlugin` | New files violated explicit ownership constraint | plugin, barrel, seven additions, proof commands | keep repaired owner; delete additions | closed |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `src/lib/transforms/indent.ts` | delete-duplicate | historical helper, but forbidden in current checkout | deleted | absent from file and git inventories |
| `src/lib/transforms/index.ts` | delete-duplicate | historical barrel, but forbidden in current checkout | deleted | absent |
| `src/lib/transforms/outdent.ts` | delete-duplicate | historical helper, but forbidden in current checkout | deleted | absent |
| `src/lib/transforms/setIndent.ts` | merge-existing-owner | logic fits existing plugin owner | folded into plugin and deleted | plugin tests pass |
| `src/lib/transforms/setIndent.spec.ts` | merge-existing-owner | behavior already covered beside plugin | unstaged and deleted | only plugin specs run |
| `src/lib/withIndent.ts` | merge-existing-owner | extension already fits plugin builder | folded into plugin and deleted | runtime specs pass |
| `src/lib/withIndent.spec.tsx` | merge-existing-owner | behavior covered by plugin specs | deleted | package tests pass |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | none | all proof passed | none |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| Existing hook inline-generic diffs | indent React hooks | Pre-existing unrelated uncommitted changes | leave untouched |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | extracted files removed; existing plugin owner restored; active tx retained; changeset corrected |
| tests/proof | stray staged spec removed; existing plugin specs prove behavior |
| docs/templates/skills | active goal plan only |
| reverted/quarantined packets | all seven extracted additions removed |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| N/A | none | correction is closed | N/A | no action |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Inventory and owner recovery | complete | Six untracked files plus one staged spec identified; existing plugin owner read | delete/fold |
| Implementation | complete | Seven additions removed; plugin/barrel restored; active tx preserved | prove |
| Package proof and review | complete | lint, 11-task typecheck, 5 tests, build, sweeps, autoreview pass | close plan |
| Goal closure | complete | all ledgers and handoff rows resolved | final checker |

Findings:
- Six indent files were untracked and `transforms/setIndent.spec.ts` was a
  staged addition, so the initial untracked-only inventory understated the
  extracted-file count by one.
- `BaseIndentPlugin` already contained the complete command, tab/untab, and
  normalizer implementation before the extraction packet.
- Useful standalone-transform behavior was already covered by
  `BaseIndentPlugin.spec.ts`; a second transform spec duplicated the plugin
  owner.
- The existing changeset described transaction-based standalone helpers that
  no longer exist in the final package API.

Decisions and tradeoffs:
- Explicit user constraint wins over historical `origin/main` helper paths:
  no newly recreated indent files remain.
- Keep one inline migration fix in the existing owner:
  `withoutNormalizing(({ tx }) => ...)` uses the active transaction.
- Preserve unrelated current hook edits exactly; do not turn this correction
  into an indent package sweep.
- Correct the existing changeset instead of adding another release note.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First typecheck/test failed because staged `transforms/setIndent.spec.ts` still imported deleted files | 1 | inspect cached additions, merge coverage into plugin owner, unstage/delete spec | typecheck and tests pass |

Verification evidence:
- `git ls-files --others --exclude-standard packages/indent` -> 0 rows.
- `git diff --cached --name-status -- packages/indent` -> 0 rows.
- removed-owner import/export `rg` -> 0 matches.
- `rg --files packages/indent/src/lib` -> exactly four existing
  owner/spec/barrel files; no `transforms` or `withIndent` paths.
- `pnpm --filter @platejs/indent lint:fix` -> pass, 14 files.
- `pnpm turbo typecheck --filter=./packages/indent` -> pass, 11/11 tasks.
- `pnpm --filter @platejs/indent test` -> pass, 5 tests, 13 assertions.
- `pnpm --filter @platejs/indent build` -> pass.
- Frozen-scope Codex autoreview -> clean, 0 accepted/actionable findings,
  confidence 0.86.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-plate-next-remove-indent-extracted-files.md`
  -> pass: `[autogoal] complete`.
- Changeset audit relative to `origin/main` -> existing major changeset now
  accurately migrates standalone transforms to `editor.update.indent.*`.
- `pnpm brl` N/A: final barrel matches its pre-extraction contents and has no
  remaining diff.
- Browser N/A: package model/API ownership correction has no app route or
  visual behavior delta.

Final handoff contract:
- target surface and mode: named indent extracted-file correction
- files/APIs reviewed: plugin, barrel, changeset, seven extracted additions
- broad Core drift score coverage: N/A
- package file checklist coverage: N/A
- best Plate v2 recommendation: existing plugin owner, zero replacement files
- verdict matrix summary: merge-existing-owner and delete-duplicate; all closed
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: indent git
  inventories and removed-owner `rg`; 7 initial additions, 7 removed, 0
  deferred, 0 remaining
- out-of-scope matches discovered: two pre-existing hook diffs, untouched
- changes made: removed extraction churn, kept active tx fix, corrected changeset
- tests/proof commands: lint, typecheck, 5 tests, build, source audits, review
- old compatibility names audited: standalone `setIndent`, `indent`, `outdent`
  imports/exports; 0 remaining in indent source
- needs attention: none
- next best Plate Next packet: resume the prior package sequence only when the
  user asks; do not widen this correction

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final mechanical closure |
| Where am I going? | Complete the correction goal after checker pass |
| What is the goal? | Zero newly created indent files with behavior preserved in existing owners |
| What have I learned? | Cached additions must be inventoried alongside untracked files |
| What have I done? | Removed seven additions, restored owners, corrected release text, passed proof/review |

Timeline:
- 2026-07-12T10:00:33.953Z Goal plan created.
- 2026-07-12 inventoried six untracked files and one staged transform spec.
- 2026-07-12 deleted all seven additions and restored plugin/barrel ownership.
- 2026-07-12 first proof exposed the staged spec dependency; removed it and
  reran proof successfully.
- 2026-07-12 corrected the existing changeset and passed frozen-scope review.

Open risks:
- None in the named correction packet.
