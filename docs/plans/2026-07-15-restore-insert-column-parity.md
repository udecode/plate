# restore insert column parity

Objective:
Restore `insertColumn` to the simple Plite transaction transform and restore
its main-parity tests without changing the existing column normalizer.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-15-restore-insert-column-parity.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user approved the prior recommendation with "ok go"
- mode: named file/API correction
- target surface: `packages/layout/src/lib/transforms/insertColumn.ts` and its spec
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, proportional-width logic in `packages/layout/src`
- package review mode: no
- package review target: N/A: named-file correction only
- package file checklist gate: N/A: package review not requested
- completion threshold summary: transform/spec match the pre-drift Plite shape;
  the transient one-column fixture and insertion share one transaction; focused
  layout proof and `check:core` pass

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
- requested duration: N/A: none requested
- semantics: N/A: one-shot correction
- initial confidence score: N/A: binary restoration target
- improvement loop: restore, sweep, test, typecheck
- final score / loop closure: pass/fail evidence

Completion threshold:
- `insertColumn.ts` contains only the typed `tx.nodes.insert` transform from
  current `HEAD`; the spec proves main-parity behavior without changing global
  initialization semantics; focused layout proof and `check:core` pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-15-restore-insert-column-parity.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: layout `insertColumn` spec
- package proof: layout spec plus the shared `check:core` gate
- shared Core gate: `pnpm check:core`
- source audits: scoped search for duplicated proportional-width insertion logic
- related scoped sweep query / active scope / match count / patched count / deferred count:
  proportional-width identifiers / `packages/layout/src` / 0 / 0 / 0
- package file manifest / row count / checked count / deferred count: N/A: named-file mode
- Plite/Plate gap ledger: N/A: no missing API; grouped transaction setup is the
  correct test shape because the fixture is intentionally invalid until insert
- broad Core drift ledger gate: N/A: not a Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-15-restore-insert-column-parity.md`

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
- allowed edit scope: the two named layout files plus this required goal plan
- package/API surfaces: preserve the existing `editor.update.column.insert` API
- docs/browser surfaces: N/A: no UI or docs behavior changed
- non-goals: no normalizer redesign, width-policy expansion, package sweep, or public API change
- out-of-scope package errors: report only; do not patch

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- This packet reads only the two named files, uses one scoped layout search,
  and caps focused test/typecheck output; generated and build trees are excluded.

Blocked condition:
- N/A: no blocker remains.

Current verdict:
- verdict: main-parity-cleanup; no Plite gap
- confidence: high after focused and shared Core proof
- next owner: plate-next
- keep / revert / quarantine call: revert the staged width-policy expansion
- reason: width normalization already belongs to `withColumn`

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Restore simple transform and parity tests; focused proof |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | Goal created for this plan |
| Mode classified as named packet vs broad Core sweep | yes | Named file/API packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Main owner plus Plite-native `tx.nodes.insert` |
| Broad Core drift ledger initialized when in scope | no | N/A: no Core sweep |
| Source of truth and allowed workspace recorded | yes | `origin/main`, current `HEAD`, named layout files |
| Output budget strategy recorded | yes | Exact files and scoped `rg`; capped test output |
| Public API fork routing checked | no | N/A: API shape is preserved |
| Gap policy checked | yes | No gap: grouped transaction is the native API |
| Related scoped sweep policy checked | yes | Search proportional-width insertion logic under layout source |
| Review-mode rename freeze checked | yes | No rename |
| Package review checklist initialized when in scope | no | N/A: named-file correction |

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
| Named verification threshold | yes | Run the proof commands named in this plan | Focused layout spec: 2 pass; `pnpm check:core`: pass |
| Broad Core drift ledger coverage | no | N/A: named-file packet | N/A |
| Score gate | yes | Fix every high-drift row | Both reviewed files score 100 after correction |
| Best Plate v2 recommendation | yes | Record current shape and rejected alternatives | Simple insert; width policy stays in normalizer |
| Plite/Plate gap ledger | yes | Record blockers or N/A | N/A: no gap |
| Related scoped sweep after correction | yes | Search same-class logic in active scope | 0 matches remain |
| Package file checklist | no | N/A: package review not requested | N/A |
| Package/API proof | yes | Run focused and shared proof | Focused spec and `check:core` pass |
| Shared Core gate coverage | yes | Run existing shared gate | `pnpm check:core`: pass |
| Non-Core package error triage | yes | Classify proof failures | Trial-only Utils/Footnote failures rejected the global bypass; trial reverted; final gate passes |
| Source audit | yes | Search removed proportional-width logic | 0 matches under `packages/layout/src` |
| Rename ledger | no | N/A: no rename | N/A |
| Extracted-file inventory | yes | Audit untracked named files | 0 files |
| Autoreview / review | yes | Review final scoped diff | Plate Next review: clean deletion-first correction |
| Final lint/check | yes | Run lint and shared gate | `pnpm lint:fix` and `pnpm check:core`: pass |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below; no attention items |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-15-restore-insert-column-parity.md` | pass |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/layout/src/lib/transforms/insertColumn.ts` | 0 / 100 | main-parity-cleanup complete | layout transform | proportional redistribution deleted; transform is one typed insert | keep |
| `packages/layout/src/lib/transforms/insertColumn.spec.ts` | 0 / 100 | main-parity-cleanup complete | layout transform proof | transient invalid fixture and insert share one transaction; 2 tests pass | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `insertColumn` | Insert one typed column through the active transaction; let `withColumn` own width normalization | transform-local proportional redistribution and rewritten behavior-expansion tests | preserves owner and Plite transaction boundary without duplicate policy | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No missing capability | A global skip-normalize option would weaken structural initialization guarantees | N/A | Trial exposed Utils and Footnote regressions; final shared gate passes without it | Use one grouped transaction in the test |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| delete transform-local width redistribution | `packages/layout/src` | `rg -n "availableWidth\|currentWidths\|fallbackWidth\|currentTotal" packages/layout/src --glob '*.{ts,tsx}'` | 0 | 0 | 0 | none |

Core drift ledger:
- Applies: no; named-file packet
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | not in scope | N/A | Named-file packet | N/A |

Package file checklist:
- Applies: no; named-file packet
- Package: N/A
- Manifest command: N/A
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: N/A
- Actual row count: N/A
- Checked score-100 count: N/A
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: N/A

Package file rows:
- [x] N/A: package review was not requested.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| restore insertion parity | layout transform | width policy was copied into insertion | named transform/spec | restored simple insert and transaction-scoped fixture | complete |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A: 0 files | N/A | `git ls-files --others --exclude-standard 'packages/layout/src/lib/transforms/insertColumn*'` | no extracted files | empty output |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | No final-run errors | N/A | N/A |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| N/A | none | N/A | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `insertColumn.ts`: deleted duplicated width redistribution |
| tests/proof | `insertColumn.spec.ts`: main-parity cases use one grouped transaction |
| docs/templates/skills | this required goal plan only |
| reverted/quarantined packets | rejected and fully reverted the Plite/Core global skip-normalize trial |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| N/A | none | No unresolved findings | N/A | proceed |

Findings:
- Current `HEAD` already has the clean Plite migration: typed active `tx` and one `tx.nodes.insert`.
- The staged block and rewritten fixtures are an uncommitted behavior expansion, not Plite fallout.
- The parity fixture is transiently invalid: a one-column group is supposed to
  unwrap when initialization finishes. The insertion must occur in the same
  grouped transaction so normalization sees the valid two-column result.

Decisions and tradeoffs:
- Keep width normalization in `withColumn`; insertion stays policy-light -> avoids duplicate owners -> preserves existing behavior contract.
- Keep structural initialization normalization intact. A global/internal
  skip-normalize path broke real Utils and Footnote invariants and was reverted.
- Use callback-form `editor.update` only here because replacement plus insertion
  are one atomic setup/action transaction; a one-shot direct API cannot express it.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Exact one-column initial value normalized away before insertion | 1 | Construct transient state and insert in the same transaction | Focused spec passes |
| Global/internal skip-normalize trial broke Utils and Footnote initialization behavior | 1 | Reject global API change and revert all Plite/Core trial edits | Final `check:core` passes |
| Raw editor initialization trial produced package-runtime registry mismatch | 1 | Use the supported Plate editor plus grouped transaction | Removed; focused spec passes |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Review and classify drift | complete | Duplicate width policy identified |
| Restore production parity | complete | Transform reduced to one typed insert |
| Restore behavior proof | complete | Focused spec: 2 pass |
| Shared closure | complete | Lint and `check:core` pass |

Verification evidence:
- `pnpm --filter @platejs/layout test src/lib/transforms/insertColumn.spec.ts` — 2 pass, 0 fail.
- `pnpm lint:fix` — pass, no fixes required after final shape.
- `pnpm check:core` — pass, including package typechecks, builds, and shared tests.
- `rg -n "availableWidth|currentWidths|fallbackWidth|currentTotal" packages/layout/src --glob '*.{ts,tsx}'` — 0 matches.
- `git diff --no-ext-diff --check -- packages/layout/src/lib/transforms/insertColumn.ts packages/layout/src/lib/transforms/insertColumn.spec.ts` — pass.
- Named-file extracted inventory — 0 files.
- Goal checker — complete.
- Browser proof: N/A; this is a package transform with no changed route or UI.
- Barrel proof: N/A; no export or public file change.
- Compatibility-name audit: N/A; no API was renamed or cut.

Final handoff contract:
- target surface and mode: named `insertColumn` file/API correction
- files/APIs reviewed: transform and focused spec
- broad Core drift score coverage: N/A: no broad Core sweep
- package file checklist coverage: N/A: no package review
- best Plate v2 recommendation: one typed insert; normalizer owns width policy
- verdict matrix summary: both reviewed files are clean at 100
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: proportional-width identifiers / layout source / 0 / 0 / 0
- out-of-scope matches discovered: none
- changes made: deleted 40 lines of duplicate production logic; restored two parity cases
- tests/proof commands: focused layout spec, lint, and `check:core` pass
- old compatibility names audited: N/A: no API cut
- needs attention: none
- next best Plate Next packet: continue the existing migration queue

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Named correction complete |
| Where am I going? | Goal checker and handoff |
| What is the goal? | Restore simple `insertColumn` and main-parity tests |
| What have I learned? | The fixture must cross its invalid intermediate state within one transaction |
| What have I done? | Restored the simple transform, rejected the global bypass, and passed shared proof |

Timeline:
- 2026-07-15T21:14:08.954Z Goal plan created.

Open risks:
- None.
