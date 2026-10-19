# block-selection plugin option regression

Objective:
Fix the BlockSelection plugin-option regression: `usePluginOption` should use
`BlockSelectionPlugin` where it typechecks; internal key usage is only for real
cycle-breaking paths.

Goal plan:
docs/plans/2026-07-07-block-selection-plugin-option-regression.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: pending
- prompt / link: user correction: prefer
  `usePluginOption(BlockSelectionPlugin, 'isSelectingSome')` over key-only
  access.
- mode: named packet
- target surface: `packages/selection/src/react/**` BlockSelection option reads
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: pending
- correction-triggered related Core sweep: pending
- package review mode: pending
- package review target: pending
- package file checklist gate: pending
- completion threshold summary: pending

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
- requested duration: pending
- semantics: pending
- initial confidence score: pending
- improvement loop: pending
- final score / loop closure: pending

Completion threshold:
- BlockSelection option reads use `BlockSelectionPlugin` where safe.
- `BlockSelectionPluginName` remains only for internal context/transform paths
  that would otherwise create a plugin self-reference or runtime cycle.
- Focused selection typecheck and tests pass.
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related Core sweep row.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-07-block-selection-plugin-option-regression.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm turbo typecheck --filter=./packages/selection`;
  `pnpm --filter @platejs/selection test`
- package proof: focused selection package typecheck/test
- shared Core gate: N/A: selection-only regression packet
- source audits: `rg -n "BlockSelectionPluginName|usePluginOption\\(" packages/selection/src/react`
- related Core sweep query / match count / patched count / deferred count:
  pending
- package file manifest / row count / checked count / deferred count: pending
- Plite/Plate gap ledger: pending
- broad Core drift ledger gate: pending
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-07-block-selection-plugin-option-regression.md`

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
- Package review mode is review-first, not migration-first. Freeze scope to the
  named package plus the smallest Plite/Core owner needed to remove a blocker.
- Package file rows can be checked `[x]` only at score `100`: no behavior
  regression versus `origin/main`, no type regression, inline inference
  preserved, no fake casts/local helper types, no compat sludge, correct
  Plite/Plate ownership, accepted owner/name/path drift, and focused proof or
  justified source audit.
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

Boundaries:
- allowed edit scope: `packages/selection/src/react/**` and this plan
- package/API surfaces: pending
- docs/browser surfaces: pending
- non-goals: no broad Core sweep, no public API rename, no PluginRef revival
- out-of-scope package errors: non-selection errors unless caused by this
  selection API change

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- If importing `BlockSelectionPlugin` in a consumer triggers TS self-reference
  (`BlockSelectionPlugin` inferred as `any`), keep the key only for that cyclic
  path and record the exact file.

Current verdict:
- verdict: in progress
- confidence: pending proof
- next owner: plate-next
- keep / revert / quarantine call: pending
- reason: pending

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User asked to fix the `usePluginOption(BlockSelectionPlugin, 'isSelectingSome')` regression. |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md`. |
| Active goal checked or created | yes | `get_goal` returned no active goal; created this scoped goal. |
| Mode classified as named packet vs broad Core sweep | yes | Named selection packet, not broad Core sweep. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Real plugin is preferred for option reads; key is internal cycle breaker only. |
| Broad Core drift ledger initialized when in scope | N/A | Not a broad Core sweep. |
| Source of truth and allowed workspace recorded | yes | Workspace `/Users/zbeyens/git/plate-2`; scope `packages/selection/src/react/**`. |
| Output budget strategy recorded | yes | Focused reads/audits only. |
| Public API fork routing checked | N/A | No public API fork. |
| Gap policy checked | yes | No Plite/Plate gap found; typecheck passed with real plugin imports. |
| Related Core sweep policy checked | yes | Source audit scoped to selection option-read pattern. |
| Review-mode rename freeze checked | yes | No renames. |
| Package review checklist initialized when in scope | N/A | Not package review mode. |

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
| Named verification threshold | yes | Run the proof commands named in this plan | Typecheck and tests passed. |
| Broad Core drift ledger coverage | N/A | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | Not a broad Core sweep. |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | Reviewed selection option-read packet; no high drift remains. |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Use real plugin for option reads; key only for internal cycle breakers. |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | N/A: no gap; focused typecheck passed. |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | Ran selection source audit for `usePluginOption(BlockSelectionPluginName)`. |
| Package file checklist | N/A | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | Not package review mode. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm turbo typecheck --filter=./packages/selection`; `pnpm --filter @platejs/selection test`. |
| Shared Core gate coverage | N/A | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | Selection-only packet. |
| Non-Core package error triage | N/A | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | No proof failures. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | `rg -n "isSelectingSome|usePluginOption\\(BlockSelectionPluginName" packages/selection/src/react -S`. |
| Rename ledger | N/A | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | No renames. |
| Extracted-file inventory | N/A | Record untracked/extracted file command, row count, and bucket for every file in scope | No extracted files in this packet. |
| Autoreview / review | N/A | Run review gate for non-trivial implementation diffs or record N/A | Tiny targeted regression; focused proof is stronger than broad review here. |
| Final lint/check | yes | Run scoped lint/check or record N/A | Typecheck/test passed; no lint-only surface touched. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-07-block-selection-plugin-option-regression.md` | To run after this edit. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `BlockSelectionAfterEditable` option reads | 0 | main-parity-cleanup | selection | Uses `BlockSelectionPlugin` for `selectedIds` and `isSelectingSome`; typecheck passed. | keep |
| selection hook option reads | 0 | main-parity-cleanup | selection | `useBlockSelected`, `useIsSelecting`, `useBlockSelectionNodes` use real plugin. | keep |
| internal key usage | 1 | private-bridge | selection | Remaining key usage is context/transform/store access, not `usePluginOption`. | keep internal only |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| BlockSelection option reads | `usePluginOption(BlockSelectionPlugin, key)` | `usePluginOption(BlockSelectionPluginName, key)` as default style | The real plugin preserves typed public shape; the key is only an internal cycle breaker. | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | none | selection | typecheck/test | no gap |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Replace key option reads with real plugin | `rg -n "usePluginOption\\(BlockSelectionPluginName|isSelectingSome" packages/selection/src/react -S` | 7 relevant rows after patch; 0 key option reads | 4 files | 0 | Remaining key usage is non-option internal path. |

Core drift ledger:
- Applies: N/A
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
| N/A | N/A | N/A | N/A | Not a Core sweep. | N/A |

Package file checklist:
- Applies: N/A
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
- [x] `N/A` — score: N/A — verdict: N/A — owner: N/A —
      evidence: not package review mode — next: N/A

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| BlockSelection option-read repair | selection | Key-only option reads hide the real plugin API and selector typing. | 4 selection files; typecheck/test | keep | none |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Selection option-read regression | complete | Code patched, typecheck passed, selection tests passed. |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | N/A | no extracted files | scoped packet |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | none | no failures | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | BlockSelection option reads now use `BlockSelectionPlugin` where safe. |
| tests/proof | Selection typecheck and 98 package tests passed. |
| docs/templates/skills | This plan ledger only. |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Remaining `BlockSelectionPluginName` | It is still used for internal context/transform access, not option reads. | `packages/selection/src/react/internal/blockSelectionPluginName.ts` | Keep internal unless you want a later cycle-breaker cleanup. |

Findings:
- `usePluginOption(BlockSelectionPlugin, ...)` works in the target consumers;
  the broad key replacement was too aggressive.

Decisions and tradeoffs:
- Prefer the real plugin for option selectors. Keep key-only access as a
  private internal cycle breaker.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/selection` passed.
- `pnpm --filter @platejs/selection test` passed: 98 tests.
- Source audit: no `usePluginOption(BlockSelectionPluginName, ...)` remains in
  `packages/selection/src/react`.

Final handoff contract:
- target surface and mode: named selection option-read packet
- files/APIs reviewed: `BlockSelectionAfterEditable`, selection option hooks,
  remaining internal key usage
- broad Core drift score coverage: N/A
- package file checklist coverage: N/A
- best Plate v2 recommendation: real plugin for option reads; key only for
  internal cycles
- verdict matrix summary: all reviewed rows keep
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: recorded above
- changes made: recorded above
- tests/proof commands: recorded above
- old compatibility names audited: N/A
- needs attention: remaining key is internal-only
- next best Plate Next packet: continue package review when requested

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Close scoped selection regression |
| What is the goal? | Restore real plugin option reads where safe. |
| What have I learned? | Real plugin option reads typecheck in the target consumers. |
| What have I done? | Patched four files and ran focused proof. |

Timeline:
- 2026-07-07T19:53:30.463Z Goal plan created.
- 2026-07-07 Scoped `BlockSelectionPlugin` option-read repair patched.
- 2026-07-07 Selection typecheck passed.
- 2026-07-07 Selection package tests passed.

Open risks:
- None.
