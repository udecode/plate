# Plate runtime state selector migration

Objective:
Migrate Plate runtime state counters to Plite explicit selector; done when mirrors are cut and focused Core/Plite checks pass.

Goal plan:
docs/plans/2026-07-04-plate-runtime-state-selector-migration.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user said "go" after accepting the next Plite selector packet:
  migrate Plate `versionEditor` / `versionSelection` / `versionValue` store
  consumers to Plite explicit-editor runtime selectors.
- mode: one-shot execution, named Core runtime-state packet.
- target surface: `packages/core/src/react/stores/plate`,
  `packages/core/src/react/hooks/useSlateProps.ts`, related Core tests, and
  direct non-Core callers that would otherwise keep the cut API alive.
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; this is a named packet, not `all core`.
- correction-triggered related Core sweep: exact version-counter symbol audit
  across Core and touched callers.
- completion threshold summary: no Plate store runtime version mirrors remain;
  selector/value hooks subscribe to Plite runtime state; focused tests and
  Core/Plite proof pass.

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: N/A: user did not request a timed checkpoint in the
  latest instruction.
- semantics: N/A.
- initial confidence score: N/A: binary packet with source audits and tests.
- improvement loop: N/A.
- final score / loop closure: N/A.

Completion threshold:
- `versionEditor`, `versionSelection`, `versionValue`, `useEditorVersion`,
  `useSelectionVersion`, `useValueVersion`, and `useIncrementVersion` are cut
  from Core public/store runtime unless a source audit proves a current owner
  still needs a non-compat replacement.
- `useEditorSelection`, `useEditorValue`, and `useEditorSelector` use Plite
  runtime-state subscription rather than Plate store counter atoms.
- `useSlateProps` no longer manually bumps Plate runtime counters.
- Direct callers are migrated to current Plite/Plate selector APIs or
  explicitly deferred with owner.
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related Core sweep row.
- Broad Core sweep may close only when every Core source file has a valid row
  in this plan's Core drift ledger section or a linked plan artifact summarized
  in this plan.
- The plan records manifest command, expected row count, actual row count,
  missing row count, extra row count, and top drift rows before closeout.
- Any drift score `>=2` has an owner, evidence, and next action.
- Any drift score `>=4` is fixed, hard-cut, moved, quarantined, or deferred
  with owner/proof; it cannot close as `keep-in-plate`.
- Any file capped by the bridge scoring law must name the bridge dependency,
  the real owner, and the deletion path. It cannot be raised to 100 from
  `check:core` alone.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-runtime-state-selector-migration.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: Core store/hooks specs after patch.
- package proof: `pnpm check:core` unless a narrower Core gate exposes the same
  proof with less noise.
- source audits: exact `rg` for cut version-counter names.
- related Core sweep query / match count / patched count / deferred count:
  planned exact symbol audit for `versionEditor|versionSelection|versionValue|useEditorVersion|useSelectionVersion|useValueVersion|useIncrementVersion`.
- Plite/Plate gap ledger: none known before implementation; record if selector
  typing blocks the clean cut.
- broad Core drift ledger gate: N/A: not a broad Core sweep.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-runtime-state-selector-migration.md`

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
- After every correction, run a related Core sweep across `packages/core/src`
  and relevant `packages/core/type-tests` for the same symbol/pattern/smell.
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
- For Core-only targets, ignore non-Core package errors unless the package is
  named, touched by the packet, or the failure proves a Core public API
  regression.

Boundaries:
- allowed edit scope: Core Plate store/hooks/tests, Plite selector only if a
  real typing gap appears, and direct callers needed to eliminate cut names.
- package/API surfaces: Plate React store hook exports and Plite runtime-state
  selector usage.
- docs/browser surfaces: N/A unless public docs still mention the cut hooks.
- non-goals: no broad Core redesign, no Plate package sweep, no rename pass.
- out-of-scope package errors: non-Core failures are not blockers unless caused
  by the cut API in a touched/direct caller.

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if a current public caller requires a replacement API that cannot
  be expressed with Plite runtime-state selectors without an API design fork.

Current verdict:
- verdict: hard-cut Plate runtime mirror counters; migrate legitimate reads to
  Plite runtime-state selectors.
- confidence: high for Core/Plite owner; app-wide typecheck remains polluted by
  broader migration drift outside this packet.
- next owner: plate-next.
- keep / revert / quarantine call: keep.
- reason: Plate store should own shell/product state, not duplicate Plite
  runtime snapshots.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Latest instruction is "go" for the accepted next packet; explicit requirements recorded above. |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md`. |
| Active goal checked or created | yes | `get_goal` returned matching active goal. |
| Mode classified as named packet vs broad Core sweep | yes | Named Core runtime-state packet, not broad Core sweep. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Hard-cut mirror counters; use Plite selectors. |
| Broad Core drift ledger initialized when in scope | no | N/A: not a broad Core sweep. |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; edit scope recorded in Boundaries. |
| Output budget strategy recorded | yes | Narrow file reads and exact symbol audits only. |
| Public API fork routing checked | yes | No new API fork expected; route to `plate-plan` only if a replacement public hook is required. |
| Gap policy checked | yes | Record Plite/Plate gap if selector typing cannot express the cut. |
| Related Core sweep policy checked | yes | Exact symbol audit planned after correction. |
| Review-mode rename freeze checked | yes | No rename pass planned. |

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
- [x] After every correction, related Core sweep row is added with query,
      match count, patched count, deferred count, and remaining risk.
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
| Named verification threshold | yes | Run the proof commands named in this plan | Focused Core specs pass; `pnpm check:core` passes. |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: named runtime-state packet, not broad Core sweep. |
| Score gate | no | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | N/A: no broad drift score run requested. |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Cut Plate version mirrors; Plite runtime commit state owns rerender subscriptions. |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | N/A: existing `useEditorRuntimeState` and snapshot version covered the packet. |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | Exact symbol audits for old version hooks/atoms and tracked atoms returned no matches. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm check:core` passed. |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | `pnpm --filter www typecheck` still fails broadly; filtered discussion-file errors are gone; dev perf page has broader pre-existing migration errors. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | `rg` for version-counter names and tracked atoms returned no matches. |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no rename pass. |
| Extracted-file inventory | no | Record untracked/extracted file command, row count, and bucket for every file in scope | N/A: no new Core files added. |
| Autoreview / review | yes | Run review gate for non-trivial implementation diffs or record N/A | Scoped diff review plus focused tests; full `autoreview` deferred because this packet is mid-migration and not a commit gate. |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` includes Core/Plite lint and tests. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-runtime-state-selector-migration.md` | Ready to run after this ledger update. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| Plate store version counters | 0 | hard-cut | Core store | Removed `versionEditor`, `versionSelection`, `versionValue`, `use*Version`, `useIncrementVersion`. | Keep. |
| `useEditorState` | 0 | main-parity-cleanup | Core store + Plite runtime | Subscribes to `state.runtime.snapshot().version`, returns stable editor. | Keep. |
| `useEditorSelection` | 0 | main-parity-cleanup | Core store + Plite runtime | Uses `useEditorRuntimeState` with selection equality and selection commit filter. | Keep. |
| `useEditorValue` | 0 | main-parity-cleanup | Core store + Plite runtime | Uses `useEditorRuntimeState` with children commit filter. | Keep. |
| `useEditorSelector` | 0 | main-parity-cleanup | Core store + Plite runtime | Uses explicit editor runtime selector; equality accepts initial null previous value. | Keep. |
| `useSlateProps` | 0 | hard-cut | Core React bridge | Callback routing no longer manually bumps Plate counters. | Keep. |
| `block-discussion-index` cache | 0 | main-parity-cleanup | Registry app caller | Uses Plite snapshot version via `useEditorRuntimeState`. | Keep. |
| `editor-perf` fanout update | 1 | main-parity-cleanup | Dev perf page | Replaced direct child mutation plus fake store bumps with real `editor.update.nodes.insert`. | Keep; broader dev page type debt is separate. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Runtime rerender subscriptions | Plite commit/snapshot state via `useEditorRuntimeState` | Plate store version atoms, manual callback bumps, public `useEditorVersion` hook | One runtime truth; Plate store stays shell/product. | Low. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No gap found | Existing Plite runtime selector is enough | N/A | Focused specs and `check:core` | Closed. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Cut Plate version counters | `rg -n "useEditorVersion|useSelectionVersion|useValueVersion|useIncrementVersion|versionEditor|versionSelection|versionValue" packages/core/src packages/core/type-tests apps/www/src --glob '!**/dist/**'` | 0 after patch | Core hooks/tests, discussion caller, dev perf caller | 0 | None in swept scope. |
| Cut tracked store atoms | `rg -n "trackedEditor|trackedSelection|trackedValue|useTrackedEditorValue|useTrackedSelectionValue|useTrackedValueValue" packages/core/src packages/core/type-tests apps/www/src --glob '!**/dist/**'` | 0 after patch | Core store/hooks | 0 | None in swept scope. |

Core drift ledger:
- Applies: N/A: named packet, not broad Core sweep.
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
| N/A | N/A | N/A | N/A | Broad Core sweep not requested. | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Runtime state selector migration | Core store + Plite runtime | Plate store runtime version mirrors duplicate Plite commit state | Core hooks/store/tests, registry caller, dev perf caller; focused specs; `pnpm check:core`; exact `rg` audits | keep | Next packet: continue Plate store cleanup only if another shell/product mirror remains. |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | N/A | No extracted files in packet scope. | Source changes only. |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `pnpm --filter www typecheck` | Full app typecheck still reports broad Plate/Plite migration errors, especially dev perf and package integration. | Not a Core packet blocker; `pnpm check:core` is green and filtered discussion-file errors are gone. | Future `www`/examples migration lane. |
| `pnpm --filter www exec bun test src/registry/lib/block-discussion-index.spec.tsx` | Fails before tests with `Cannot find module '@platejs/core' from packages/plate/src/index.tsx`. | Harness/package-resolution issue, not this runtime selector change. | Future app test setup lane. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Cut Plate store version counters and version hooks; migrated Core selectors to Plite runtime state; migrated discussion cache and dev perf fanout updates away from fake store bumps. |
| tests/proof | Updated Core store/selector/useSlateProps specs; fixed discussion spec callback to direct update methods. |
| docs/templates/skills | Updated this autogoal plan only. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `apps/www/src/app/dev/editor-perf/page.tsx` still has broad type errors. | The page is already mid-migration and not typeclean; this packet only removed fake version bumps. | `pnpm --filter www typecheck` log at `.tmp/plate-next/www-typecheck-runtime-state-selector.log`. | Treat as a separate dev perf/app migration cleanup lane. |
| 2 | `www` focused Bun spec cannot resolve `@platejs/core`. | Blocks direct app-spec proof for discussion index. | `pnpm --filter www exec bun test src/registry/lib/block-discussion-index.spec.tsx`. | Fix app/package test resolution separately. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Runtime selector migration packet | complete | Focused Core specs, `pnpm check:core`, exact old-symbol source audits. | Close goal. |

Findings:
- Plate runtime version atoms were pure duplicate state after Plite runtime
  selectors existed.
- `useEditorState` still needs rerender-on-commit behavior for old subscribers,
  but that can be driven by Plite snapshot version without exposing a version
  hook.
- Selection equality must be range-aware, otherwise identical cloned selections
  cause noisy React updates.

Decisions and tradeoffs:
- Removed public `useEditorVersion`, `useSelectionVersion`,
  `useValueVersion`, and `useIncrementVersion` instead of reimplementing them
  as aliases.
- Kept `useEditorState` as a rerendering editor-object hook for current Plate
  consumers, but its trigger is Plite commit version rather than Plate store
  state.
- Updated direct app callers only enough to remove the cut API; broader `www`
  type failures are deferred.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `useEditorState` forced-false equality caused maximum update depth | 1 | Subscribe to Plite snapshot version and return editor | Fixed; focused specs pass. |
| Inline `shouldUpdate` filters caused effect churn | 1 | Hoist commit filters to module constants | Fixed; focused specs pass cleanly. |
| Core typecheck rejected equality callback shape | 2 | Widen `UseEditorSelectorOptions.equalityFn` to accept null previous value | Fixed; `pnpm check:core` passes. |
| Focused `www` Bun spec cannot resolve `@platejs/core` | 1 | Classify as app/package test setup issue | Deferred; not a Core blocker. |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/react/stores/plate/createPlateStore.spec.tsx src/react/stores/plate/useEditorSelector.spec.tsx src/react/hooks/useSlateProps.spec.tsx` -> 6 pass, 0 fail.
- `pnpm check:core` -> pass: Core/Plite typecheck, lint, Plite build, Core tests 700 pass, Plite tests 1899 pass / 85 skip.
- `rg -n "useEditorVersion|useSelectionVersion|useValueVersion|useIncrementVersion|versionEditor|versionSelection|versionValue" packages/core/src packages/core/type-tests apps/www/src --glob '!**/dist/**'` -> no matches.
- `rg -n "trackedEditor|trackedSelection|trackedValue|useTrackedEditorValue|useTrackedSelectionValue|useTrackedValueValue" packages/core/src packages/core/type-tests apps/www/src --glob '!**/dist/**'` -> no matches.
- `pnpm --filter www typecheck > .tmp/plate-next/www-typecheck-runtime-state-selector.log 2>&1; rg -n "src/registry/lib/block-discussion-index" .tmp/plate-next/www-typecheck-runtime-state-selector.log` -> no matches after spec fix; full command still has unrelated broad app migration errors.

Final handoff contract:
- target surface and mode: named Core runtime-state selector packet.
- files/APIs reviewed: Plate store state, editor state/value/selection hooks,
  editor selector hook, `useSlateProps`, discussion cache caller, dev perf
  fanout caller.
- broad Core drift score coverage: N/A.
- best Plate v2 recommendation: keep Plite runtime as source of truth; no
  Plate version-mirror public API.
- verdict matrix summary: hard-cut version mirrors; main-parity cleanup for
  current selector hooks.
- Plite/Plate gaps or blockers: none for Core; `www` has separate migration
  and test-resolution debt.
- related Core sweep query/matches/patched/deferred: exact old symbol audits,
  0 remaining matches, 0 deferred in Core/app swept scope.
- changes made: filled in Changed list.
- tests/proof commands: filled in Verification evidence.
- old compatibility names audited: version counters and tracked atoms removed.
- needs attention: dev perf page/app typecheck debt and app Bun spec resolution.
- next best Plate Next packet: continue cutting remaining Plate store mirrors
  only where Plite has a first-class runtime selector.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Packet implemented and verified. |
| Where am I going? | Run mechanical plan completion check, then close goal. |
| What is the goal? | Migrate Plate runtime state counters to Plite explicit selector. |
| What have I learned? | Plate store version mirrors were removable; app `www` has unrelated migration debt. |
| What have I done? | Cut counters/hooks, migrated selector subscribers, ran focused specs and `check:core`. |

Timeline:
- 2026-07-04T12:35:54.570Z Goal plan created.
- Read `plate-next`, `autogoal`, `VISION.md`, and relevant Plate/Plite vision docs.
- Patched Core store/hooks and tests.
- Patched direct app callers that referenced removed version hooks/counters.
- Ran focused Core specs; fixed render-loop and equality issues.
- Ran `pnpm check:core`; passed.
- Ran exact source audits for removed version names; no matches.

Open risks:
- `apps/www` remains not typeclean from broader Plate/Plite migration work;
  this packet did not try to fix that lane.
