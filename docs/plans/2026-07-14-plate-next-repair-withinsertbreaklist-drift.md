# plate-next repair withInsertBreakList drift

Objective:
Repair migration drift in `withInsertBreakList.ts` while preserving its
`origin/main` behavior and owner, using Plite-native reads/transactions and
closing focused List plus shared Core proof.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-14-plate-next-repair-withinsertbreaklist-drift.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user: "repair packages/list/src/lib/normalizers/withInsertBreakList.ts drift"
- mode: named-file review and repair
- target surface: `packages/list/src/lib/normalizers/withInsertBreakList.ts` plus direct List tests and smallest blocking Core/Plite owner if required
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: same migrated insert-break/transaction shape inside `packages/list/src`
- package review mode: no; the user named one file, not the whole List package
- package review target: N/A
- package file checklist gate: N/A
- completion threshold summary: main behavior preserved, drift removed, focused List proof and `pnpm check:core` pass

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
- initial confidence score: N/A: exact behavior and command gates
- improvement loop: compare main/current, repair owner, run focused tests and same-class sweep
- final score / loop closure: 100; focused, package, shared, and review gates pass

Completion threshold:
- The named file retains the `origin/main` behavior and owner without migrated
  transaction/read boilerplate, nested updates, compatibility wrappers, or
  unjustified normalization.
- Direct behavior tests, List typecheck/test, exact same-class sweep, and
  `pnpm check:core` pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-14-plate-next-repair-withinsertbreaklist-drift.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: named normalizer spec(s) and directly affected List tests
- package proof: `pnpm --filter @platejs/list typecheck` and package tests
- shared Core gate: `pnpm check:core`
- source audits: compare current file to `origin/main`; sweep matching drift in `packages/list/src`
- related scoped sweep query / active scope / match count / patched count / deferred count:
  `rg -n "insertBreak\\(\\{ next, tx \\}\\)" packages/list/src/lib`;
  `packages/list/src/lib`; 2 expected owners; 2 patched; 0 deferred
- package file manifest / row count / checked count / deferred count: N/A: named-file mode
- Plite/Plate gap ledger: N/A; active transaction and keyed extension APIs cover the repair
- broad Core drift ledger gate: N/A
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-14-plate-next-repair-withinsertbreaklist-drift.md`

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
- allowed edit scope: named file, direct List tests, existing List changeset, and smallest required Core/Plite owner
- package/API surfaces: `@platejs/list` insert-break behavior
- docs/browser surfaces: N/A: no browser path needed for a non-React normalizer packet
- non-goals: no file moves, new transforms, broad List rewrite, or unrelated package repair
- out-of-scope package errors: report unless caused by this packet

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Clean repair requires a public Plite/Plate API fork not inferable from current source, or the same external blocker repeats three times with no in-scope alternative.

Current verdict:
- verdict: `main-parity-cleanup`
- confidence: 100
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: TODO continuation is back in its named owner; list reset/outdent behavior is back in `withList` using active transaction state

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact named file, repair, same-class sweep, focused and shared proof |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` |
| Active goal checked or created | yes | Active goal points to this plan |
| Mode classified as named packet vs broad Core sweep | yes | Named-file packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Preserve main behavior; repair implementation only |
| Broad Core drift ledger initialized when in scope | no | N/A |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; named List owner and direct proof |
| Output budget strategy recorded | yes | Exact file reads, focused searches, capped test tails |
| Public API fork routing checked | yes | Compare source before deciding; route only if a real gap appears |
| Gap policy checked | yes | No local wrappers/casts; name owner if blocked |
| Related scoped sweep policy checked | yes | `packages/list/src` same-class sweep |
| Review-mode rename freeze checked | yes | Keep `withInsertBreakList.ts` owner/path |
| Package review checklist initialized when in scope | no | N/A: named-file mode |

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
- [x] Public API forks are routed to `plate-plan` before implementation; none found.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is N/A because no exports or barrels changed.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof | 18 focused tests, 115 package tests, List typecheck, final `check:core` |
| Broad Core drift ledger coverage | no | N/A: named-file packet | N/A |
| Score gate | yes | Close inspected rows | All reviewed rows score 100 |
| Best Plate v2 recommendation | yes | Record final shape | Task-list continuation stays in the named normalizer; list reset behavior stays in `withList`; both use active `tx` |
| Plite/Plate gap ledger | yes | Record blockers or N/A | N/A: current APIs cover repair |
| Related scoped sweep after correction | yes | Sweep same-class handlers | 2 expected handlers, 2 patched, 0 deferred |
| Package file checklist | no | N/A: named-file mode | N/A |
| Package/API proof | yes | Run package proof | List typecheck and 115 tests pass |
| Shared Core gate coverage | yes | Verify reviewed package gate | List already covered; final `pnpm check:core` passes |
| Non-Core package error triage | yes | Classify failures | No final failures |
| Source audit | yes | Audit legacy API names | Zero matches in active owners |
| Rename ledger | no | N/A: no rename | N/A |
| Extracted-file inventory | yes | Check in-scope untracked files | `git ls-files --others --exclude-standard packages/list`: 0 |
| Autoreview / review | yes | Run until clean | Final autoreview clean |
| Final lint/check | yes | Run scoped lint/check | Biome clean; final `check:core` exit 0 |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below |
| Goal plan complete | yes | Run completion checker | Run after this evidence update |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/list/src/lib/normalizers/withInsertBreakList.ts` | 0 | main-parity-cleanup | TODO continuation | TODO-only middleware, active `tx`, focused tests | keep |
| `packages/list/src/lib/withList.ts` | 0 | recover-main-owner | list reset/outdent behavior | Enter/Backspace root, nested, composed-tx, and inline tests | keep |
| `packages/list/src/lib/BaseListPlugin.tsx` extension registration | 0 | keep-in-plate | List runtime composition | keyed behavior extension preserves both middleware handlers | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| List break/reset behavior | Keep TODO split behavior in `withInsertBreakList`; keep reset/outdent behavior in `withList`; read and mutate through active `tx` | extra empty-list branch in TODO normalizer; nested `editor.update`; generic reset for nested lists | Preserves main ownership and behavior on Plite middleware | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none blocking | N/A | current List extension and Plite transaction APIs | focused and shared gates | no gap |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Remove empty-list branch from TODO normalizer | `packages/list/src/lib` | `rg -n "insertBreak\\(\\{ next, tx \\}\\)" packages/list/src/lib` | 2 expected owners | 2 | 0 | none |
| Use active transaction reads | named owners/specs | audit `editor.read` versus `tx` in middleware | 2 handlers | 2 | 0 | none |
| Restore reset/outdent parity | `withList` and direct spec | Enter/Backspace root, nested, composed transaction, inline-start rows | 7 behavior rows | 7 covered | 0 | none |

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
| N/A | 0 | N/A | N/A | broad Core sweep not requested | N/A |

Package file checklist:
- Applies: no; named-file mode
- Package: `@platejs/list`
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
- Next package blocked until: named-file packet closes

Package file rows:
- [x] N/A — package-wide checklist not requested; reviewed rows are in the matrix above.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| List insert/reset | `withInsertBreakList` + `withList` | reset behavior displaced into TODO normalizer | named files/specs, List proof, `check:core`, autoreview | keep repaired owner split | next user-selected packet |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | no untracked files | `git ls-files --others --exclude-standard packages/list` returned none | no action | source audit |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | none | all final gates pass | N/A |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| N/A | none found by scoped sweep | N/A | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | TODO normalizer made TODO-only; reset/outdent restored to `withList`; behavior extension keyed separately; active `tx`/block reads |
| tests/proof | composed transaction selection, nested Backspace, and inline-start Backspace regressions; focused/package/shared gates |
| docs/templates/skills | this goal plan only; no public docs delta |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| N/A | none | closure review clean | named List owners | continue next packet |

Findings:
- The extra empty-list branch was displaced `withList.resetBlock` behavior, not TODO continuation behavior.
- Plite middleware should use `tx.nodes.block()` here: active transaction reads preserve composed updates and block targeting skips inline ancestors.
- Main reset behavior also covered nested Backspace; restoring only Enter would leave real drift.

Decisions and tradeoffs:
- Keep the current Plite middleware model; no public API fork is needed.
- Use a keyed List behavior extension so its Enter middleware composes with the TODO middleware instead of being merged over it.
- No changeset: the final behavior restores `origin/main` parity, so upgrading from main has no user-visible delta.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial owner move left middleware reads on `editor.read` | 1 | use active `tx` reads and add composed-update tests | fixed |
| First Backspace repair missed inline ancestors | 1 | target `tx.nodes.block()` and add inline regression | fixed |
| New typed test compared optional fixture selection | 1 | assert the concrete selection | fixed |

Verification evidence:
- `bun test packages/list/src/lib/normalizers/withInsertBreakList.spec.tsx packages/list/src/lib/withList.spec.tsx`: 18 pass.
- `pnpm exec biome check <five touched List files>`: clean.
- `pnpm turbo typecheck --filter=./packages/list`: 13 tasks pass.
- `pnpm --filter @platejs/list test`: 115 pass.
- `pnpm check:core`: exit 0 after final code changes.
- Final scoped autoreview: clean, no accepted/actionable findings.

Final handoff contract:
- target surface and mode: named-file List migration repair
- files/APIs reviewed: named normalizer, `withList`, BaseList registration, direct specs
- broad Core drift score coverage: N/A; broad sweep not requested
- package file checklist coverage: N/A; named-file mode
- best Plate v2 recommendation: TODO-only normalizer plus List-owned active-tx reset/outdent middleware
- verdict matrix summary: three reviewed targets at score 100
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: insertBreak middleware query; List lib; 2/2/0
- out-of-scope matches discovered: none
- changes made: owner recovery, active-tx block reads, nested/root metadata cleanup, regression tests
- tests/proof commands: focused tests, Biome, List typecheck/tests, `check:core`, autoreview
- old compatibility names audited: zero active-owner matches for `editor.api`, `editor.tf`, `OverrideEditor`, `TElement`, `withoutNormalizing`
- needs attention: none
- next best Plate Next packet: next user-selected package/file

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure |
| Where am I going? | Goal completion |
| What is the goal? | Restore List insert/reset behavior to main-parity Plite-native owners |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Source comparison and owner decision | complete | `origin/main` named owners and behavior reviewed |
| Implementation and focused proof | complete | active-transaction block handlers and 18 focused tests |
| Package and shared closure | complete | 115 List tests, List typecheck, final `check:core`, clean autoreview |

Timeline:
- 2026-07-14T09:23:17.912Z Goal plan created.
- 2026-07-14 compared current owners with `origin/main` and isolated displaced reset behavior.
- 2026-07-14 restored owner split, active transaction block reads, Enter/Backspace parity, and regression proof.
- 2026-07-14 focused, package, shared Core, and closure review gates passed.

Open risks:
- None in the named scope.
